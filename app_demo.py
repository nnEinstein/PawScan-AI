import os
import random
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXT = {'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- VERSI DEMO ---
# File ini TIDAK memuat model .h5 dan TIDAK butuh TensorFlow sama sekali.
# Tujuannya cuma untuk melihat/menguji tampilan UI di laptop yang tidak bisa
# menjalankan TensorFlow. Hasil prediksi di sini ACAK (dummy), bukan hasil
# asli dari model. Untuk prediksi sungguhan, jalankan app.py.


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT


def fake_predict():
    label = random.choice(['Cat', 'Dog'])
    confidence = round(random.uniform(70, 99.5), 1)
    return label, confidence


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

    # Dummy delay dikit biar kerasa seperti sedang "memproses" (opsional, boleh dihapus)
    label, confidence = fake_predict()

    return jsonify({
        'label': label,
        'confidence': confidence,
        'image_url': '/' + filepath.replace('\\', '/')
    })


if __name__ == '__main__':
    print("=" * 50)
    print("MODE DEMO — prediksi ACAK, bukan model asli.")
    print("Untuk prediksi asli, jalankan app.py (butuh TensorFlow).")
    print("=" * 50)
    app.run(debug=True, port='5000', host='0.0.0.0')
