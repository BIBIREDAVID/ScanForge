const inputType = document.getElementById("inputType");
const textInput = document.getElementById("textInput");
const pdfInput = document.getElementById("pdfInput");
const errorDiv = document.getElementById("error");
const qrcodeDiv = document.getElementById("qrcode");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
let currentURL = "";

// Toggle input field visibility
inputType.addEventListener("change", () => {
  if (inputType.value === "pdf") {
    textInput.style.display = "none";
    pdfInput.style.display = "block";
  } else {
    textInput.style.display = "block";
    pdfInput.style.display = "none";
  }
  errorDiv.innerText = "";
  qrcodeDiv.innerHTML = "";
  downloadBtn.style.display = "none";
  copyBtn.style.display = "none";
});

function generateQRCode() {
  errorDiv.innerText = "";
  qrcodeDiv.innerHTML = "";
  downloadBtn.style.display = "none";
  copyBtn.style.display = "none";

  if (inputType.value === "text") {
    const text = textInput.value.trim();
    if (!text) {
      errorDiv.innerText = "Please enter a valid text or URL.";
      return;
    }
    currentURL = text;
    createQRCode(text);
  } else {
    const file = pdfInput.files[0];
    if (!file || file.type !== "application/pdf") {
      errorDiv.innerText = "Please upload a valid PDF file.";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // replace with your Cloudinary upload preset
    formData.append("cloud_name", "YOUR_CLOUD_NAME"); // replace with your Cloudinary cloud name

    fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.secure_url) {
          currentURL = data.secure_url;
          createQRCode(data.secure_url);
        } else {
          errorDiv.innerText = "Upload failed. Try again.";
        }
      })
      .catch(() => {
        errorDiv.innerText = "An error occurred during upload.";
      });
  }
}

function createQRCode(data) {
  const qr = new QRCode(qrcodeDiv, {
    text: data,
    width: 256,
    height: 256,
  });

  setTimeout(() => {
    const img = qrcodeDiv.querySelector("img");
    if (img) {
      downloadBtn.href = img.src;
      downloadBtn.style.display = "inline-block";
    }
    copyBtn.style.display = "inline-block";
  }, 500);
}

function copyToClipboard() {
  navigator.clipboard.writeText(currentURL).then(() => {
    showToast("Link copied to clipboard!");
  });
}

// Toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

// Dark mode toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeToggle.checked);
});

// Tab switching
document.getElementById("scanTabBtn").addEventListener("click", () => {
  document.getElementById("generateTab").classList.remove("active-tab");
  document.getElementById("scanTab").classList.add("active-tab");
  startQRScanner();
});

document.getElementById("generateTabBtn").addEventListener("click", () => {
  document.getElementById("scanTab").classList.remove("active-tab");
  document.getElementById("generateTab").classList.add("active-tab");
});

// QR Scanner
function startQRScanner() {
  const scanRegion = document.getElementById('preview');
  const resultContainer = document.getElementById('scanResult');
  const cameraError = document.getElementById('cameraError');
  resultContainer.innerHTML = '';
  cameraError.innerHTML = '';

  const html5QrCode = new Html5Qrcode("preview");

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      const cameraId = cameras[0].id;
      html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        qrCodeMessage => {
          resultContainer.innerHTML = `Scanned: <a href="${qrCodeMessage}" target="_blank">${qrCodeMessage}</a>`;
          html5QrCode.stop();
        },
        errorMessage => {
          // Ignore scan errors
        }
      ).catch(err => {
        cameraError.innerText = "Failed to start camera: " + err;
      });
    } else {
      cameraError.innerText = "No camera found.";
    }
  }).catch(err => {
    cameraError.innerText = "Camera access error: " + err;
  });
}
