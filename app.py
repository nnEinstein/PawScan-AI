import os
import numpy as np
from flask import Flask, request, jsonify, render_template
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join('static', 'uploads')
MODEL_PATH = os.path.join('model', 'model_cats_dogs.h5')
ALLOWED_EXT = {'png', 'jpg', 'jpeg'}
IMG_SIZE = (150, 150)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model sekali saat server start (jangan load ulang tiap request, lambat)
print("Loading model...")
model = load_model(MODEL_PATH)
print("Model siap!")


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


def predict_image(img_path):
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = np.expand_dims(image.img_to_array(img), axis=0)
    pred = model.predict(img_array, verbose=0)[0][0]

    if pred > 0.5:
        label = 'Dog'
        confidence = float(pred)
    else:
        label = 'Cat'
        confidence = float(1 - pred)

    return label, round(confidence * 100, 1)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file yang dikirim'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'Belum ada file dipilih'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Format file harus PNG, JPG, atau JPEG'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    label, confidence = predict_image(filepath)

    return jsonify({
        'label': label,
        'confidence': confidence,
        'image_url': '/' + filepath.replace('\\', '/')
    })


if __name__ == '__main__':
    app.run(debug=True, port='5000', host='0.0.0.0')
