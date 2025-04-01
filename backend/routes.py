# @routes_bp.route('/', methods=['GET'])
# def home():
#     return jsonify({"message": "Default test"})

# @routes_bp.route('/session/<session_id>/upload-dataset', methods=['POST'])
# def upload_dataset(session_id):
#     data = request.get_json()

#     if 'dataset' not in data:
#         return jsonify({"error": "Invalid dataset format"}), 400

#     dataset = data['dataset']

#     preprocessed_dataset = dataset  # add logic here

#     return jsonify({
#         "preprocessed_dataset": preprocessed_dataset
#     })

# # sana: create routes for each of the remaining endpoints as defined in the spec
# # you don't need to implement any real functionality yet, just have it return a brief message for now (like in the 2 examples given)

# @routes_bp.route('/session/<session_id>/upload-manual-coding', methods=['POST'])
# def upload_manual_coding(session_id):
#     if session_id not in sessions:
#         return jsonify({"error": "Session not found"})

#     data = request.get_json()
#     if not data or "manual_coding" not in data:
#         return jsonify({"error": "Invalid manual coding format"})

#     sessions[session_id]["manual_coding"] = data["manual_coding"]
#     return jsonify({"message": "Manual coding uploaded successfully"})

# @routes_bp.route('/session/<session_id>/perform-analysis', methods=['POST'])
# def perform_analysis(session_id):
#     if session_id not in sessions:
#         return jsonify({"error": "Session not found"})

#     data = request.get_json()
#     if not data or "model_choice" not in data:
#         return jsonify({"error": "Invalid model choice"})

#     analysis_results = {"summary": "Placeholder results"}  # just a placeholder
#     sessions[session_id]["analysis_results"] = analysis_results
#     return jsonify({"analysis_results": analysis_results})

# @routes_bp.route('/session/<session_id>/get-results', methods=['GET'])
# def get_results(session_id):
#     if session_id not in sessions:
#         return jsonify({"error": "Session not found"})

#     return jsonify({
#         "preprocessed_dataset": sessions[session_id].get("dataset", []),
#         "labels": sessions[session_id].get("labels", []),
#         "analysis_results": sessions[session_id].get("analysis_results", {}),
#     })

# # template (replace the {} with appropriate values):
# # @routes_bp.route('/session/<session_id>/{put endpoint name here}', methods=['{put post/get/put here}'])
# # def {operation id in snake_case}(session_id):
# #     data = request.get_json()

# #     # do some basic request body validation here
# #     if '{some required field}' not in data:
# #         return jsonify({"message": "Invalid request body"}), 400

# #     # define placeholder values for response body
# #     response_placeholder_1 = "{some value}"
# #     response_placeholder_2 = "{some value}"

# #     return jsonify({
# #         "{response property 1}": {response_placeholder_1},
# #         "{response property 2}": {response_placeholder_2},
# #     })

import os
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import uuid
import sqlite3
from datetime import datetime, timedelta
import pandas as pd
from run_pipeline import main as run_pipeline_main

routes_bp = Blueprint('routes', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE = 'sessions.db'

def cleanup_expired_sessions():
    """
    HELPER: Delete expired sessions
    """
    now = datetime.now()

    print(now)

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
        deleted = cursor.rowcount
        conn.commit()

    print(f"[Session Cleanup] Deleted {deleted} expired session(s)")

def init_db():
    """
    HELPER: Initialize the DB and sessions table
    """
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                dataset_path TEXT,
                dataset_filename TEXT,
                status TEXT DEFAULT 'CREATED',
                labels TEXT,
                manual_coding TEXT,
                analysis_results TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME
            )
        ''')
        conn.commit()
    
    # TODO: Delete files associated with expired sessions

def create_session():
    """
    HELPER: Create a new session in the table
    """
    import uuid
    from datetime import datetime, timedelta

    session_id = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(minutes=30)

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO sessions 
            (id, status, expires_at) 
            VALUES (?, ?, ?)
        ''', (session_id, 'CREATED', expires_at))
        conn.commit()
    
    return session_id

def update_session(session_id, **kwargs):
    """
    HELPER: Update session details
    """
    update_fields = []
    values = []

    for key, value in kwargs.items():
        update_fields.append(f"{key} = ?")
        values.append(value)
    
    expires_at = datetime.now() + timedelta(minutes=30)
    update_fields.append("expires_at = ?")
    values.append(expires_at)

    values.append(session_id)
    
    if update_fields:
        query = f"""
        UPDATE sessions 
        SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
        """
        
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute(query, values)
            conn.commit()

def get_session(session_id):
    """
    HELPER: Get session details
    """
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
        return cursor.fetchone()

@routes_bp.route('/session/start', methods=['POST'])
def start_session():
    """
    ROUTE: Start a new session
    """
    try:
        cleanup_expired_sessions()
        session_id = create_session()
        return jsonify({"session_id": session_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@routes_bp.route('/session/<session_id>/upload-dataset', methods=['POST'])
def upload_dataset(session_id):
    """
    ROUTE: Upload a dataset
    """
    try:
        # validate session
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400

        if 'dataset' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['dataset']
        
        # save file
        filename = secure_filename(f"{session_id}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        preprocessed_folder = os.path.join(UPLOAD_FOLDER, "processed")
        os.makedirs(preprocessed_folder, exist_ok=True)
        # preprocessed_file_path = os.path.join(preprocessed_folder, f"{session_id}_preprocessed.csv")
        preprocessed_file_path = os.path.join(preprocessed_folder, f"{filename}_preprocessed.csv")
        # preprocessed_file_path = f"./data/processed/Test_question_preprocessed.csv"
        svm_output_csv = os.path.join(preprocessed_folder, f"{filename}_svm_output.csv")
        model_output_path = os.path.join(preprocessed_folder, f"{filename}_svm_model.pkl")
        projection_csv = os.path.join(preprocessed_folder, f"{filename}_projection.csv")

        # run the pipeline
        run_pipeline_main(
            input_file=filepath,
            svm_output_csv=svm_output_csv,
            model_output_path=model_output_path,
            projection_csv=projection_csv
        )

        # Read the preprocessed dataset
        if os.path.exists(preprocessed_file_path):
            preprocessed_data = pd.read_csv(preprocessed_file_path)
            preprocessed_array = preprocessed_data.to_dict(orient='records')
        else:
            preprocessed_array = []

        # update session entry with dataset info
        update_session(session_id, 
            dataset_path=filepath, 
            dataset_filename=filename,
            status='DATASET_UPLOADED'
        )

        return jsonify({
            "message": "Dataset uploaded successfully and pipeline executed",
            "session_id": session_id,
            "preprocessed_dataset": preprocessed_array
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
