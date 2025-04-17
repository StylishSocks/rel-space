import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.IGESControl import IGESControl_Reader
from OCC.Core.TopoDS import TopoDS_Shape
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Extend.DataExchange import read_stl_file
from OCC.Core.Bnd import Bnd_Box
from OCC.Core.BRepBndLib import brepbndlib_Add
from OCC.Core.IFSelect import IFSelect_RetDone
import trimesh
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'stp', 'step', 'iges', 'igs', 'stl'}  

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

@app.route('/upload', methods=['POST'])
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
            return jsonify(result)
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
        finally:
            os.remove(filepath)
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/')
def index():
    return '''
    <!doctype html>
    <title>Upload CAD File (STEP/IGES/STL)</title>
    <h1>Upload CAD File</h1>
    <form method=post enctype=multipart/form-data action="/upload">
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)


