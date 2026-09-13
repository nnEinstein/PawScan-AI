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
  scanBtn.classList.add('loading');
  hideError();
  hideResult();

  const btnText = document.getElementById('scanBtnText');
  if (btnText) btnText.textContent = 'Menebak';

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await fetch('/predict', { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Terjadi kesalahan, coba lagi.');
    } else {
      showResult(data.label, data.confidence);
    }
  } catch (err) {
    showError('Tidak bisa terhubung ke server. Pastikan server Flask sedang berjalan.');
  } finally {
    resetButton();
  }
});

function showResult(label, confidence) {
  const iconSrc = label === 'Cat' ? '/static/icon/cat.gif' : '/static/icon/dog.gif';
  const iconAlt = label === 'Cat' ? 'Ikon kucing' : 'Ikon anjing';

  resultIcon.innerHTML = `<img src="${iconSrc}" alt="${iconAlt}">`;
  resultLabel.textContent = label === 'Cat' ? 'Ini kucing!' : 'Ini anjing!';
  resultConfidence.textContent = `Model yakin ${confidence}%`;
  resultBox.hidden = false;

  // Progress bar diisi setelah box muncul, biar animasi width kelihatan jalan
  const fill = document.getElementById('confidenceBarFill');
  fill.style.width = '0%';
  requestAnimationFrame(() => {
    fill.style.width = `${confidence}%`;
  });
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
