from flask import Blueprint, request, jsonify

routes_bp = Blueprint('routes', __name__)

sessions = {}

# TODO: separate into grouped files (anand will do this)

@routes_bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Default test"})

@routes_bp.route('/session/<session_id>/upload-dataset', methods=['POST'])
def upload_dataset(session_id):
    data = request.get_json()

    if 'dataset' not in data:
        return jsonify({"error": "Invalid dataset format"}), 400

    dataset = data['dataset']

    preprocessed_dataset = dataset  # add logic here

    return jsonify({
        "preprocessed_dataset": preprocessed_dataset
    })

# sana: create routes for each of the remaining endpoints as defined in the spec
# you don't need to implement any real functionality yet, just have it return a brief message for now (like in the 2 examples given)

@routes_bp.route('/session/start', methods=['POST'])
def start_session():
    session_id = "session_123"  # placeholder for session ID
    sessions[session_id] = {"dataset": None, "labels": None, "analysis_results": None}
    return jsonify({"session_id": session_id})

@routes_bp.route('/session/<session_id>/get-suggested-labels', methods=['POST'])
def get_suggested_labels(session_id):
    if session_id not in sessions:
        return jsonify({"error": "Session not found"})

    ai_suggestions = ["Label A", "Label B", "Label C"]
    return jsonify({"ai_suggestions": ai_suggestions})

@routes_bp.route('/session/<session_id>/upload-manual-coding', methods=['POST'])
def upload_manual_coding(session_id):
    if session_id not in sessions:
        return jsonify({"error": "Session not found"})

    data = request.get_json()
    if not data or "manual_coding" not in data:
        return jsonify({"error": "Invalid manual coding format"})

    sessions[session_id]["manual_coding"] = data["manual_coding"]
    return jsonify({"message": "Manual coding uploaded successfully"})

@routes_bp.route('/session/<session_id>/perform-analysis', methods=['POST'])
def perform_analysis(session_id):
    if session_id not in sessions:
        return jsonify({"error": "Session not found"})

    data = request.get_json()
    if not data or "model_choice" not in data:
        return jsonify({"error": "Invalid model choice"})

    analysis_results = {"summary": "Placeholder results"}  # just a placeholder
    sessions[session_id]["analysis_results"] = analysis_results
    return jsonify({"analysis_results": analysis_results})

@routes_bp.route('/session/<session_id>/get-results', methods=['GET'])
def get_results(session_id):
    if session_id not in sessions:
        return jsonify({"error": "Session not found"})

    return jsonify({
        "preprocessed_dataset": sessions[session_id].get("dataset", []),
        "labels": sessions[session_id].get("labels", []),
        "analysis_results": sessions[session_id].get("analysis_results", {}),
    })

# template (replace the {} with appropriate values):
# @routes_bp.route('/session/<session_id>/{put endpoint name here}', methods=['{put post/get/put here}'])
# def {operation id in snake_case}(session_id):
#     data = request.get_json()

#     # do some basic request body validation here
#     if '{some required field}' not in data:
#         return jsonify({"message": "Invalid request body"}), 400

#     # define placeholder values for response body
#     response_placeholder_1 = "{some value}"
#     response_placeholder_2 = "{some value}"

#     return jsonify({
#         "{response property 1}": {response_placeholder_1},
#         "{response property 2}": {response_placeholder_2},
#     })