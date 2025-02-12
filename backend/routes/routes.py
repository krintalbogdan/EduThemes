from flask import Blueprint, request, jsonify

routes_bp = Blueprint('routes', __name__)

# TODO: separate into grouped files (anand will do this)

@routes_bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Default test"})

@routes_bp.route('/session/<session_id>/upload-dataset', methods=['POST'])
def upload_dataset(session_id):
    data = request.get_json()

    if 'dataset' not in data:
        return jsonify({"message": "Invalid dataset format"}), 400

    dataset = data['dataset']

    preprocessed_dataset = dataset  # add transformation logic here

    return jsonify({
        "preprocessed_dataset": preprocessed_dataset
    })

# sana: create routes for each of the remaining endpoints as defined in the spec
# you don't need to implement any real functionality yet, just have it return a brief message for now (like in the 2 examples given)