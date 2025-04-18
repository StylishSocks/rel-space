import os
import trimesh
import threading
import time
import random
import json
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# create variables

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'stp', 'step', 'iges', 'igs', 'stl'}  
global_parsed = None
sensor_data = {
    "temperature":0.0,
    "pressure":0.0,
    "stress":0.0
}

# create an "uploads" directory and set max content length to 16 MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# auxilliary functions

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_stl_geometry_info(file_path):
    mesh = trimesh.load_mesh(file_path)
    vertices = mesh.vertices.tolist()
    faces = mesh.faces.tolist()
    edges = mesh.edges_unique.tolist()
    try:
        return {"vertices": vertices, "faces": faces, "edges": edges
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}

def process_step_file(filepath):
    try:
        return {"file_type": "STEP", "status": "failed", "message": "Error reading STEP file"}
    except Exception as e:
        return {"file_type": "STEP", "status": "error", "message": str(e)}

def process_iges_file(filepath):
    try:
        return {"file_type": "IGES", "status": "failed", "message": "Error reading IGES file"}
    except Exception as e:
        return {"file_type": "IGES", "status": "error", "message": str(e)}
    
def update_sensor_data():
    while True:
        sensor_data["temperature"] = round(random.uniform(100, 150), 2)
        sensor_data["pressure"] = round(random.uniform(150, 300), 2)
        sensor_data["stress"] = round(random.uniform(300, 400), 2)
        time.sleep(1)

# api endpoints

@app.route('/api/')
def index():
    return '''
    <!doctype html>
    <title>Upload CAD File (STEP/IGES/STL)</title>
    <h1>Upload CAD File</h1>
    <form method="post" enctype="multipart/form-data" action="/api/cad">
      <input type="file" name="file">
      <input type="submit" value="Upload">
    </form>

    '''

@app.route('/api/cad', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        file_ext = filename.rsplit('.', 1)[1].lower()
        try:
            if file_ext in ['stp', 'step']:
                result = process_step_file(filepath)
            elif file_ext in ['iges', 'igs']:
                result = process_iges_file(filepath)
            elif file_ext == 'stl':
                result = get_stl_geometry_info(filepath)

            global global_parsed 
            global_parsed = jsonify(result)
            return jsonify(result)
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
        finally:
            os.remove(filepath)
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/cad/result', methods = ['GET'])
def file_parsed():
    return global_parsed

@app.route('/api/sensors', methods=['GET'])
def get_sensor_data():
    response = {
        "timestamp": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z'),
        "temperature": sensor_data["temperature"],
        "pressure": sensor_data["pressure"],
        "stress": sensor_data["stress"]
    }
    # ensure the keys are displayed exactly like in the reponse variable
    return Response(json.dumps(response), mimetype = 'application/json')

if __name__ == '__main__':
    # Start the background thread
    threading.Thread(target = update_sensor_data, daemon = True).start()
    # Start the Flask app
    app.run(host="0.0.0.0", port=5000)


