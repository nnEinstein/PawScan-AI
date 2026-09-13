const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const dzIdle = document.getElementById('dzIdle');
const dzPreview = document.getElementById('dzPreview');
const previewImg = document.getElementById('previewImg');
const scanBtn = document.getElementById('scanBtn');
const resultBox = document.getElementById('resultBox');
const resultIcon = document.getElementById('resultIcon');
const resultLabel = document.getElementById('resultLabel');
const resultConfidence = document.getElementById('resultConfidence');
const errorBox = document.getElementById('errorBox');

let selectedFile = null;

dropzone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

['dragenter', 'dragover'].forEach(evt => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
});

['dragleave', 'drop'].forEach(evt => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
  });
});

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
    showError('File harus berupa gambar PNG atau JPG.');
    return;
  }

  selectedFile = file;
  hideError();
  hideResult();

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    dzIdle.hidden = true;
    dzPreview.hidden = false;
  };
  reader.readAsDataURL(file);

  scanBtn.disabled = false;
  scanBtn.textContent = 'Tebak sekarang';
}

scanBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  scanBtn.disabled = true;
  scanBtn.textContent = 'Menebak...';
  hideError();
  hideResult();

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const res = await fetch('/predict', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Terjadi kesalahan, coba lagi.');
      scanBtn.disabled = false;
      scanBtn.textContent = 'Tebak sekarang';
      return;
    }

    showResult(data.label, data.confidence);
  } catch (err) {
    showError('Tidak bisa terhubung ke server. Pastikan server Flask sedang berjalan.');
  }

  scanBtn.disabled = false;
  scanBtn.textContent = 'Coba foto lain';
});

function showResult(label, confidence) {
  resultIcon.textContent = label === 'Cat' ? '🐱' : '🐶';
  resultLabel.textContent = label === 'Cat' ? 'Ini kucing!' : 'Ini anjing!';
  resultConfidence.textContent = `Model yakin ${confidence}%`;
  resultBox.hidden = false;
}

function hideResult() {
  resultBox.hidden = true;
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}
