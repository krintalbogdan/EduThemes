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
import time
import pandas as pd
from run_pipeline import main as run_pipeline_main
import json
import base64

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

    # TODO: Delete files associated with expired sessions


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
        filename = secure_filename(f"{session_id}_{os.path.splitext(file.filename)[0]}")
        filepath = os.path.join(UPLOAD_FOLDER, f"{filename}{os.path.splitext(file.filename)[1]}")
        file.save(filepath)

        processed_folder = os.path.join(UPLOAD_FOLDER, "svm_processed")
        os.makedirs(processed_folder, exist_ok=True)
        # preprocessed_file_path = os.path.join(preprocessed_folder, f"{session_id}_preprocessed.csv")
        preprocessed_file_path = os.path.join(processed_folder, f"{filename}_preprocessed.csv")
        visualization_path = os.path.join(processed_folder, f"{filename}_decision_boundary.png")

        # run the pipeline
        run_pipeline_main(
            input_file=filepath,
            svm_output_csv=os.path.join(processed_folder, f"{filename}_svm_output.csv"),
            model_output_path=os.path.join(processed_folder, f"{filename}_svm_model.pkl"),
            projection_csv=os.path.join(processed_folder, f"{filename}_projection.csv"),
            visualization=visualization_path,
        )

        # read the preprocessed dataset
        if os.path.exists(preprocessed_file_path):
            preprocessed_data = pd.read_csv(preprocessed_file_path)
            preprocessed_array = preprocessed_data.to_dict(orient='records')
        else:
            raise FileNotFoundError(f"Preprocessed file not found at {preprocessed_file_path}")
            
        # encode the visualization image as base64
        with open(visualization_path, "rb") as image_file:
            visualization_base64 = base64.b64encode(image_file.read()).decode('utf-8')

        # update session entry with dataset info
        update_session(session_id, 
            dataset_path=filepath, 
            dataset_filename=filename,
            status='DATASET_UPLOADED'
        )

        return jsonify({
            "message": "Dataset uploaded successfully and pipeline executed",
            "session_id": session_id,
            "preprocessed_dataset": preprocessed_array,
            "visualization_image": visualization_base64
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@routes_bp.route('/session/<session_id>/submit-manual-coding', methods=['POST'])
def submit_manual_coding(session_id):
    """
    ROUTE: Submit manual coding and labels
    """
    try:
        # validate session
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400

        data = request.get_json()
        if not data or "labels" not in data or "manual_codings" not in data:
            return jsonify({"error": "Invalid request body"}), 400

        labels = data["labels"]
        manual_codings = data["manual_codings"]

        # save manual codings to a file
        manual_coding_folder = os.path.join(UPLOAD_FOLDER, "manual_codings")
        os.makedirs(manual_coding_folder, exist_ok=True)
        manual_coding_file = os.path.join(manual_coding_folder, f"{session_id}_manual_coding.json")
        with open(manual_coding_file, 'w') as f:
            json.dump(manual_codings, f)

        # update session with manual coding file path and labels
        update_session(session_id, 
            labels=json.dumps(labels), 
            manual_coding=manual_coding_file,
            status='MANUAL_CODING_SUBMITTED'
        )

        # call Claude API for classifying
        session = get_session(session_id)
        filename = session['dataset_filename']

        # access the SVM output CSV file and group by class letter
        svm_output_csv = os.path.join(UPLOAD_FOLDER, "svm_processed", f"{filename}_svm_output.csv")
        if not os.path.exists(svm_output_csv):
            raise FileNotFoundError(f"SVM output file not found at {svm_output_csv}")

        df_svm_output = pd.read_csv(svm_output_csv)
        svm_data = df_svm_output[['original_entry_index', 'class_letter']].to_dict(orient='records')

        # Group SVM data by class letter
        grouped_svm_data = {}
        for entry in svm_data:
            class_letter = entry['class_letter']
            if class_letter not in grouped_svm_data:
                grouped_svm_data[class_letter] = []
            grouped_svm_data[class_letter].append(entry['original_entry_index'])

        # Claude test data
        claude_data = {
            "A": ["access to info", "tutoring", "explaining"],
            "B": ["access to info", "explaining", "tutoring"],
            "C": ["access to info", "explaining", "speed up work"],
            "D": ["access to info", "explaining", "writing support", "tutoring"],
            "E": ["access to info", "explaining", "speed up work"],
            "F": ["access to info", "explaining"],
            "G": ["tutoring", "explaining", "access to info"],
            "H": ["personalization", "tutoring", "speed up work", "explaining"],
            "I": ["access to info", "tutoring", "explaining"],
            "J": ["access to info", "accessibility", "personalization"],
            "K": ["access to info", "explaining", "speed up work"],
            "L": ["access to info", "speed up work", "explaining", "writing support"]
        }

        time.sleep(2) # simulate processing time

        # print(svm_data)
        # print(claude_test_data)

        return jsonify({
            "message": "Manual coding submitted successfully.",
            "svm_data": grouped_svm_data,
            "claude_data": claude_data
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
