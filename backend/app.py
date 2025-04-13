import os
from flask import Flask
from flask_cors import CORS
from routes import routes_bp, init_db


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    init_db()
    app.register_blueprint(routes_bp)
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
    