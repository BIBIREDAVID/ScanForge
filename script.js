function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active-tab"));
  document.getElementById(tabId).classList.add("active-tab");
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return true;
  } catch {
    return false;
  }
}

function toggleInputType() {
  const type = document.getElementById("qrType").value;
  const textInput = document.getElementById("urlInput");
  const pdfInput = document.getElementById("pdfInput");

  if (type === "pdf") {
    textInput.style.display = "none";
    pdfInput.style.display = "block";
  } else {
    textInput.style.display = "block";
    pdfInput.style.display = "none";
    textInput.placeholder = type === "text" ? "Enter any text" : "Enter a valid URL";
  }
}

function generateQRCode() {
  const type = document.getElementById("qrType").value;
  const textInput = document.getElementById("urlInput").value.trim();
  const fileInput = document.getElementById("pdfInput");
  const error = document.getElementById("error");
  const qrCodeContainer = document.getElementById("qrcode");
  const downloadBtn = document.getElementById("downloadBtn");

  qrCodeContainer.innerHTML = "";
  error.textContent = "";
  downloadBtn.style.display = "none";

  if (type === "url" && !isValidUrl(textInput)) {
    error.textContent = "Please enter a valid URL.";
    return;
  }

  if (type === "pdf") {
    const file = fileInput.files[0];
    if (!file || file.type !== "application/pdf") {
      error.textContent = "Please upload a valid PDF file.";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const blob = new Blob([e.target.result], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);
      makeQR(pdfUrl);
    };
    reader.readAsArrayBuffer(file);
  } else {
    const value = type === "text" ? textInput : textInput;
    makeQR(value);
  }

  function makeQR(content) {
    const qr = new QRCode(qrCodeContainer, {
      text: content,
      width: 200,
      height: 200
    });

    setTimeout(() => {
      const img = qrCodeContainer.querySelector('img');
      if (img) {
        downloadBtn.href = img.src;
        downloadBtn.style.display = "inline-block";
      }
    }, 300);
  }
}

function startCamera() {
  const reader = new Html5Qrcode("reader");
  const scanResult = document.getElementById("scanResult");
  const cameraError = document.getElementById("cameraError");
  const copyBtn = document.getElementById("copyBtn");
  cameraError.textContent = "";
  scanResult.innerHTML = "";
  copyBtn.style.display = "none";

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      reader.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250
        },
        qrCodeMessage => {
          reader.stop();
          displayScanResult(qrCodeMessage);
        },
        error => {
          console.log("Scanning error:", error);
        }
      );
    } else {
      cameraError.textContent = "No camera found on this device.";
    }
  }).catch(err => {
    cameraError.textContent = "Camera access denied or unavailable.";
    console.error("Camera error:", err);
  });
}

function displayScanResult(content) {
  const scanResult = document.getElementById("scanResult");
  const copyBtn = document.getElementById("copyBtn");

  scanResult.innerHTML = `<strong>Scanned Result:</strong> ${content}`;
  copyBtn.style.display = "inline-block";
  copyBtn.setAttribute("data-copy", content);

  if (isValidUrl(content)) {
    const link = document.createElement("a");
    link.href = content;
    link.target = "_blank";
    link.textContent = "🔗 Preview QR content";
    link.style.display = "block";
    link.style.marginTop = "10px";
    link.style.color = "#4CAF50";
    scanResult.appendChild(link);
  }
}

function copyToClipboard() {
  const content = document.getElementById("copyBtn").getAttribute("data-copy");
  navigator.clipboard.writeText(content).then(() => {
    alert("Copied to clipboard!");
  });
}

function decodeImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const scanResult = document.getElementById("scanResult");
  const copyBtn = document.getElementById("copyBtn");
  scanResult.innerHTML = "";
  copyBtn.style.display = "none";

  const reader = new Html5Qrcode("reader");

  reader.scanFile(file, true)
    .then(decodedText => {
      displayScanResult(decodedText);
    })
    .catch(err => {
      scanResult.innerHTML = "Could not read QR code from image.";
      console.error(err);
    });
}
