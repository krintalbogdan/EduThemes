import os
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import uuid
import sqlite3
from datetime import datetime, timedelta
import time
import pandas as pd
import json
import base64
import random
from src.llm.theme_analysis import suggest_themes, classify_responses_by_themes, generate_summary, process_chat_query

routes_bp = Blueprint('routes', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE = 'sessions.db'

def cleanup_expired_sessions():
    now = datetime.now()

    print(now)

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM sessions WHERE expires_at <= ?", (now,))
        expired_sessions = [row[0] for row in cursor.fetchall()]

        cursor.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
        deleted = cursor.rowcount
        conn.commit()

    print(f"[Session Cleanup] Deleted {deleted} expired session(s)")

    for session_id in expired_sessions:
        for root, _, files in os.walk(UPLOAD_FOLDER):
            for file in files:
                if file.startswith(session_id):
                    file_path = os.path.join(root, file)
                    try:
                        os.remove(file_path)
                        print(f"Deleted file: {file_path}")
                    except Exception as e:
                        print(f"Error deleting file {file_path}: {e}")

def init_db():
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
                research_question TEXT,
                project_description TEXT,
                additional_context TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME
            )
        ''')
        conn.commit()
    

def create_session():
    import uuid
    from datetime import datetime, timedelta

    session_id = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(hours=24) 

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
    update_fields = []
    values = []

    for key, value in kwargs.items():
        update_fields.append(f"{key} = ?")
        values.append(value)
    
    expires_at = datetime.now() + timedelta(hours=24)
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
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM sessions WHERE id = ?', (session_id,))
        return cursor.fetchone() 


@routes_bp.route('/session/start', methods=['POST'])
def start_session():
    try:
        cleanup_expired_sessions()
        session_id = create_session()
        return jsonify({"session_id": session_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@routes_bp.route('/session/<session_id>/upload-dataset', methods=['POST'])
def upload_dataset(session_id):
    try:
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400

        if 'dataset' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['dataset']
        
        research_question = request.form.get('researchQuestion', '')
        project_description = request.form.get('projectDescription', '')
        additional_context = request.form.get('additionalContext', '')
        
        research_question = request.form.get('researchQuestion', '')
        project_description = request.form.get('projectDescription', '')
        additional_context = request.form.get('additionalContext', '')
        api_key = request.form.get('apiKey', '')
        filename = secure_filename(f"{session_id}_{os.path.splitext(file.filename)[0]}")
        file_ext = os.path.splitext(file.filename)[1]
        filepath = os.path.join(UPLOAD_FOLDER, f"{filename}{file_ext}")
        file.save(filepath)
        try:
            if file_ext.lower() in ['.xlsx', '.xls']:
                df = pd.read_excel(filepath)
            elif file_ext.lower() == '.csv':
                df = pd.read_csv(filepath)
            else:
                raise ValueError("Unsupported file format. Please use Excel or CSV files.")
            
            responses_col = None
            if 'Response' in df.columns:
                responses_col = df['Response']
            elif 'Responses' in df.columns:
                responses_col = df['Responses']
            else:
                for col in df.columns:
                    if 'response' in col.lower() or 'answer' in col.lower() or 'text' in col.lower():
                        responses_col = df[col]
                        break
                
                if responses_col is None and len(df.columns) > 0:
                    responses_col = df.iloc[:, 0]
            
            themes_col = None
            if 'Themes' in df.columns:
                themes_col = df['Themes']
            elif 'Theme' in df.columns:
                themes_col = df['Theme']
            else:
                for col in df.columns:
                    if 'theme' in col.lower() or 'category' in col.lower() or 'tag' in col.lower():
                        themes_col = df[col]
                        break
            
            if responses_col is None or len(responses_col) == 0:
                raise ValueError("No responses found in the uploaded file.")
            
            responses = responses_col.dropna().astype(str).tolist()
            
            predefined_themes = []
            if themes_col is not None:
                unique_themes = themes_col.dropna().astype(str).unique()
                
                for theme in unique_themes:
                    if theme and theme.lower() != 'none' and theme.strip():
                        theme_color = '#' + ''.join([random.choice('0123456789ABCDEF') for _ in range(6)])
                        predefined_themes.append({
                            'name': theme.strip(),
                            'description': f"Theme: {theme.strip()}",
                            'color': theme_color
                        })
            
            preprocessed_data = []
            for i, response in enumerate(responses):
                row_themes = []
                if themes_col is not None and i < len(themes_col):
                    theme_value = themes_col.iloc[i] if i < len(themes_col) else None
                    if pd.notna(theme_value) and str(theme_value).strip().lower() != 'none' and str(theme_value).strip():
                        theme_obj = next((t for t in predefined_themes if t['name'] == theme_value.strip()), None)
                        if theme_obj:
                            row_themes.append(theme_obj)
                
                preprocessed_data.append({
                    "original": response,
                    "cleaned": response.strip(),
                    "themes": row_themes
                })
            
            if predefined_themes:
                update_session(session_id, labels=json.dumps(predefined_themes))
                print(f"Found {len(predefined_themes)} predefined themes: {[t['name'] for t in predefined_themes]}")
                
        except Exception as e:
            return jsonify({"error": f"Error processing file: {str(e)}"}), 400

        vis_placeholder = None
        update_session(session_id, 
            dataset_path=filepath, 
            dataset_filename=filename,
            research_question=research_question,
            project_description=project_description,
            additional_context=additional_context,
            status='DATASET_UPLOADED'
        )

        return jsonify({
            "message": "Dataset uploaded successfully",
            "session_id": session_id,
            "preprocessed_dataset": preprocessed_data,
            "visualization_image": vis_placeholder
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@routes_bp.route('/session/<session_id>/suggest-themes', methods=['POST'])
def get_theme_suggestions(session_id):
    try:
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400
            
        data = request.get_json()
        predefined_themes = data.get('labels', [])
        api_key = data.get('apiKey', '') 
        
        dataset_path = session['dataset_path']
        if not dataset_path or not os.path.exists(dataset_path):
            return jsonify({"error": "Dataset not found"}), 404
            
        file_ext = os.path.splitext(dataset_path)[1].lower()
        if file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(dataset_path)
        elif file_ext == '.csv':
            df = pd.read_csv(dataset_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
            
        responses_col = None
        if 'Response' in df.columns:
            responses_col = df['Response']
        elif 'Responses' in df.columns:
            responses_col = df['Responses']
        else:
            for col in df.columns:
                if 'response' in col.lower() or 'answer' in col.lower() or 'text' in col.lower():
                    responses_col = df[col]
                    break
            
            if responses_col is None and len(df.columns) > 0:
                responses_col = df.iloc[:, 0]
        
        if responses_col is not None:
            responses = responses_col.dropna().astype(str).tolist()
        else:
            return jsonify({"error": "No responses found in dataset"}), 400
        
        print(f"First 3 responses from dataset:")
        for r in responses[:3]:
            print(f"  - {r}")
        print(f"Total responses: {len(responses)}")
            
        research_question = session['research_question']
        project_description = session['project_description']
        
        suggested_themes = suggest_themes(
            responses=responses,
            research_question=research_question,
            project_description=project_description,
            predefined_themes=predefined_themes,
            api_key=api_key
        )
        
        return jsonify({
            "message": "Theme suggestions generated successfully",
            "suggested_themes": suggested_themes
        })
    except Exception as e:
        print(f"Error suggesting themes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@routes_bp.route('/session/<session_id>/submit-final-dataset', methods=['POST'])
def submit_final_dataset(session_id):
    try:
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400

        data = request.get_json()
        if not data or "dataset" not in data:
            return jsonify({"error": "Invalid request body"}), 400

        dataset = data["dataset"]
        api_key = data.get('apiKey', '')

        print(f"Received final dataset with {len(dataset)} entries")
        for entry in dataset:
            if 'themes' not in entry:
                entry['themes'] = []

        theme_counts = {}
        for entry in dataset:
            for theme in entry.get("themes", []):
                theme_name = theme["name"]
                theme_color = theme.get("color", "#cccccc")
                if theme_name not in theme_counts:
                    theme_counts[theme_name] = {"name": theme_name, "color": theme_color, "frequency": 0}
                theme_counts[theme_name]["frequency"] += 1
                
        try:
            dataset_path = session['dataset_path']
            if dataset_path and os.path.exists(dataset_path):
                file_ext = os.path.splitext(dataset_path)[1].lower()
                if file_ext in ['.xlsx', '.xls']:
                    df = pd.read_excel(dataset_path)
                elif file_ext == '.csv':
                    df = pd.read_csv(dataset_path)
                else:
                    raise ValueError("Unsupported file format")
                
                responses_col = None
                if 'Response' in df.columns:
                    responses_col = df['Response']
                elif 'Responses' in df.columns:
                    responses_col = df['Responses']
                else:
                    for col in df.columns:
                        if 'response' in col.lower() or 'answer' in col.lower() or 'text' in col.lower():
                            responses_col = df[col]
                            break
                    
                    if responses_col is None and len(df.columns) > 0:
                        responses_col = df.iloc[:, 0]
                
                if responses_col is not None:
                    responses = responses_col.dropna().astype(str).tolist()
                else:
                    responses = [entry["original"] for entry in dataset]
            
                labels_str = session['labels']
                labels = json.loads(labels_str) if labels_str else []
                
                classifications = {}
                for theme in labels:
                    theme_name = theme['name']
                    classifications[theme_name] = []
                    
                for i, entry in enumerate(dataset):
                    for theme in entry.get("themes", []):
                        theme_name = theme["name"]
                        if theme_name in classifications:
                            classifications[theme_name].append(i)
                
                research_question = session['research_question']
                project_description = session['project_description']


                summary = ""

                # summary = generate_summary(
                #     responses=responses,
                #     themes=labels,
                #     classifications=classifications,
                #     research_question=research_question,
                #     project_description=project_description,
                #     api_key=api_key
                # )
            else:
                summary = "No dataset found to generate summary."
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            summary = f"Error generating summary: {str(e)}"

        final_dataset_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_final_dataset.json")
        with open(final_dataset_path, 'w') as f:
            json.dump(dataset, f)
            
        summary_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_summary.txt")
        with open(summary_path, 'w') as f:
            f.write(summary)

        update_session(session_id, 
            analysis_results=json.dumps({
                "themes": list(theme_counts.values()),
                "summary": summary
            }),
            status='FINAL_DATASET_SUBMITTED'
        )

        return jsonify({
            "message": "Final dataset submitted successfully.",
            "themes": list(theme_counts.values()),
            "summary": summary
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@routes_bp.route('/session/<session_id>/submit-manual-coding', methods=['POST'])
def submit_manual_coding(session_id):
    try:
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400

        data = request.get_json()
        if not data or "labels" not in data or "manual_codings" not in data:
            return jsonify({"error": "Invalid request body"}), 400

        labels = data["labels"]
        manual_codings = data["manual_codings"]
        api_key = data.get('apiKey', '') 

        manual_coding_folder = os.path.join(UPLOAD_FOLDER, "manual_codings")
        os.makedirs(manual_coding_folder, exist_ok=True)
        manual_coding_file = os.path.join(manual_coding_folder, f"{session_id}_manual_coding.json")
        with open(manual_coding_file, 'w') as f:
            json.dump(manual_codings, f)

        update_session(session_id, 
            labels=json.dumps(labels), 
            manual_coding=manual_coding_file,
            status='MANUAL_CODING_SUBMITTED'
        )

        dataset_path = session['dataset_path']
        if not dataset_path or not os.path.exists(dataset_path):
            return jsonify({"error": "Dataset not found"}), 404
            
        file_ext = os.path.splitext(dataset_path)[1].lower()
        if file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(dataset_path)
        elif file_ext == '.csv':
            df = pd.read_csv(dataset_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        
        responses_col = None
        if 'Response' in df.columns:
            responses_col = df['Response']
        elif 'Responses' in df.columns:
            responses_col = df['Responses']
        else:
            for col in df.columns:
                if 'response' in col.lower() or 'answer' in col.lower() or 'text' in col.lower():
                    responses_col = df[col]
                    break
        
            if responses_col is None and len(df.columns) > 0:
                responses_col = df.iloc[:, 0]
        
        if responses_col is not None:
            responses = responses_col.dropna().astype(str).tolist()
        else:
            return jsonify({"error": "No responses found in dataset"}), 400
            
        research_question = session['research_question']
        project_description = session['project_description']
        
        try:
            
            classifications = classify_responses_by_themes(
                responses=responses,
                themes=labels,
                research_question=research_question,
                project_description=project_description,
                api_key=api_key
            )
            
            return jsonify({
                "message": "Manual coding submitted successfully.",
                "claude_data": classifications,
                "svm_data": {}
            })
                
        except Exception as e:
            print(f"Error classifying responses: {str(e)}")
            classifications = {}
            for label in labels:
                theme_name = label['name']
                sample_count = max(1, int(len(responses) * 0.2))
                sample_indices = random.sample(range(len(responses)), sample_count)
                classifications[theme_name] = sample_indices
            
            return jsonify({
                "message": "Manual coding submitted successfully (fallback data).",
                "claude_data": classifications,
                "svm_data": {}
            })

        final_dataset_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_final_dataset.json")
        with open(final_dataset_path, 'w') as f:
            json.dump(dataset, f)
            
        summary_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_summary.txt")
        with open(summary_path, 'w') as f:
            f.write(summary)

        update_session(session_id, 
            analysis_results=json.dumps({
                "themes": list(theme_counts.values()),
                "summary": summary
            }),
            status='FINAL_DATASET_SUBMITTED'
        )

        return jsonify({
            "message": "Final dataset submitted successfully.",
            "themes": list(theme_counts.values()),
            "summary": summary
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@routes_bp.route('/session/<session_id>/download-final-dataset', methods=['GET'])
def download_final_dataset(session_id):
    try:
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400

        final_dataset_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_final_dataset.json")
        if not os.path.exists(final_dataset_path):
            return jsonify({"error": "Final dataset not found"}), 404

        with open(final_dataset_path, 'r') as f:
            final_dataset = json.load(f)
            
        summary = ""
        summary_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_summary.txt")
        if os.path.exists(summary_path):
            with open(summary_path, 'r') as f:
                summary = f.read()

        return jsonify({
            "message": "Final dataset retrieved successfully.",
            "final_dataset": final_dataset,
            "summary": summary
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@routes_bp.route('/session/<session_id>/analyze-text', methods=['POST'])
def analyze_text(session_id):
    try:
        cleanup_expired_sessions()
        session = get_session(session_id)
        if not session:
            return jsonify({"error": "Invalid session"}), 400
            
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "Invalid request body"}), 400
            
        user_message = data["message"]
        api_key = data.get('apiKey', '') 
        
        dataset_path = session['dataset_path']
        if not dataset_path or not os.path.exists(dataset_path):
            return jsonify({"response": "Sorry, I don't have a dataset to analyze. Please upload a dataset first."}), 200
            
        file_ext = os.path.splitext(dataset_path)[1].lower()
        if file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(dataset_path)
        elif file_ext == '.csv':
            df = pd.read_csv(dataset_path)
        else:
            return jsonify({"response": "Sorry, I can't process this file format."}), 200
            
        responses_col = None
        if 'Response' in df.columns:
            responses_col = df['Response']
        elif 'Responses' in df.columns:
            responses_col = df['Responses']
        else:
            for col in df.columns:
                if 'response' in col.lower() or 'answer' in col.lower() or 'text' in col.lower():
                    responses_col = df[col]
                    break
            
            if responses_col is None and len(df.columns) > 0:
                responses_col = df.iloc[:, 0]
        
        if responses_col is not None:
            responses = responses_col.dropna().astype(str).tolist()
        else:
            return jsonify({"response": "Sorry, I couldn't identify the responses in your dataset."}), 200
        
        labels_str = session['labels']
        labels = json.loads(labels_str) if labels_str else []
    
        analysis_results_str = session['analysis_results']
        if analysis_results_str:
            analysis_results = json.loads(analysis_results_str)
        else:
            analysis_results = None
            
        research_question = session['research_question']
        project_description = session['project_description']
        
        final_dataset_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_final_dataset.json")
        if os.path.exists(final_dataset_path):
            with open(final_dataset_path, 'r') as f:
                final_dataset = json.load(f)
                
            classifications = {}
            for theme in labels:
                theme_name = theme['name']
                classifications[theme_name] = []
                
            for i, entry in enumerate(final_dataset):
                for theme in entry.get("themes", []):
                    theme_name = theme["name"]
                    if theme_name in classifications:
                        classifications[theme_name].append(i)
        else:
            classifications = {}
            
        response_text = process_chat_query(
            query=user_message,
            responses=responses,
            themes=labels,
            classifications=classifications,
            research_question=research_question,
            project_description=project_description,
            api_key=api_key
        )
        
        return jsonify({
            "response": response_text
        })
    except Exception as e:
        print(f"Error processing chat query: {str(e)}")
        return jsonify({
            "response": f"I encountered an error while analyzing the data. Please try again or check if your dataset is properly uploaded."
        }), 200