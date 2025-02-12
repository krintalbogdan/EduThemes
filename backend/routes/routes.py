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

    preprocessed_dataset = dataset  # add logic here

    return jsonify({
        "preprocessed_dataset": preprocessed_dataset
    })

# sana: create routes for each of the remaining endpoints as defined in the spec
# you don't need to implement any real functionality yet, just have it return a brief message for now (like in the 2 examples given)

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