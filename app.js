let currentQuestion = 0;
let score = 0;
let attempt = 1;

// ELEMENTS
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const leadForm = document.getElementById("lead-form");

const leadName = document.getElementById("leadName");
const leadEmail = document.getElementById("leadEmail");
const leadWA = document.getElementById("leadWA");

const seeResultBtn = document.getElementById("seeResultBtn");

// ================= START =================
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  loadQuestion();
});

// ================= LOAD QUESTION =================
function loadQuestion() {
  const q = questions[currentQuestion];

  document.getElementById("questionNumber").innerText =
    `Soal ${currentQuestion + 1} dari ${questions.length}`;

  document.getElementById("question").innerText = q.question;

  const options = document.getElementById("options");
  options.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(i);
    options.appendChild(btn);
  });

  updateProgress();
}

// ================= ANSWER =================
function checkAnswer(selected) {
  const q = questions[currentQuestion];

  if (selected === q.answer) {
    score += getScoreByAttempt(attempt);

    showPopup("Benar!", q.correctExplanation, "Lanjut", () => {
      goToNextQuestion();
    });

    return;
  }

  if (attempt === 1) {
    attempt = 2;

    showPopup("Belum Tepat", q.wrongExplanation, "Coba Sekali Lagi", () => {
      loadQuestion();
    });

    return;
  }

  score += 0;

  showPopup("Salah", "Jawaban belum tepat. Kita lanjut ke soal berikutnya agar hasil tes tetap objektif.", "Lanjut", () => {
    goToNextQuestion();
  });
}

function getScoreByAttempt(attempt) {
  if (attempt === 1) return 2.5;
  if (attempt === 2) return 1.5;
  return 0;
}

function goToNextQuestion() {
  currentQuestion++;
  attempt = 1;

  if (currentQuestion >= questions.length) {
    updateProgress(true);
    showLeadForm();
    return;
  }

  loadQuestion();
}

// ================= PROGRESS =================
function updateProgress(forceComplete = false) {
  const bar = document.getElementById("progressBar");

  if (forceComplete) {
    bar.style.width = "100%";
    return;
  }

  bar.style.width = ((currentQuestion + 1) / questions.length) * 100 + "%";
}

// ================= POPUP =================
function showPopup(title, message, btnText, callback) {
  const popup = document.getElementById("popup");

  document.getElementById("popupTitle").innerText = title;
  document.getElementById("popupMessage").innerText = message;
  document.getElementById("popupButton").innerText = btnText;

  popup.classList.remove("hidden");

  document.getElementById("popupButton").onclick = () => {
    popup.classList.add("hidden");
    callback();
  };
}

// ================= LEAD FORM =================
function showLeadForm() {
  quizScreen.classList.add("hidden");
  leadForm.classList.remove("hidden");
}

// ================= RESULT =================
let finalScoreValue = 0;
let finalLevel = "";

function calculateResult() {
  const maxScore = questions.length * 2.5;
  const percentage = (score / maxScore) * 100;

  finalScoreValue = percentage.toFixed(1);

  if (percentage >= 80) finalLevel = "Creator Expert";
  else if (percentage >= 60) finalLevel = "Creator Intermediate";
  else if (percentage >= 40) finalLevel = "Creator Beginner+";
  else finalLevel = "New Creator";

  document.getElementById("final-score").innerText = finalScoreValue;
  document.getElementById("creator-level").innerText = finalLevel;
  document.getElementById("accuracyStat").innerText =
  Math.round(percentage) + "%";
}

// ================= SEND SHEET =================
async function sendToSheet() {
  await fetch("https://script.google.com/macros/s/AKfycbyGu-dsTMLGpb1lZY3TJDCAE8qwAKOlUMbMMJU9Gja0iNhiuPoYkONfVxOuHBxZa7Zb/exec", {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      name: leadName.value,
      email: leadEmail.value,
      phone: leadWA.value,
      score: finalScoreValue,
      level: finalLevel
    })
  });
}

// ================= SEE RESULT =================
seeResultBtn.addEventListener("click", async () => {
  if (!leadName.value || !leadEmail.value || !leadWA.value) {
    alert("Lengkapi data dulu!");
    return;
  }

  calculateResult();
  await sendToSheet();

  leadForm.classList.add("hidden");
  resultScreen.classList.remove("hidden");
});

// ================= CERTIFICATE =================
// Ganti listener showCertBtn jadi ini:
document.getElementById("showCertBtn")?.addEventListener("click", () => {
  generateCertificate();

  resultScreen.classList.add("hidden");
  document.getElementById("certificate").style.display = "block";

  // hitung scale setelah elemen benar-benar tampil di layar
  requestAnimationFrame(scaleCertificate);
});

// ================= SCALE CERTIFICATE (PREVIEW ONLY) =================
function scaleCertificate() {
  const wrapper = document.getElementById("certScaleWrapper");
  const cert = document.querySelector(".cert-border");
  if (!wrapper || !cert) return;

  const designWidth = 1123;
  const designHeight = 794;
  const scale = Math.min(wrapper.clientWidth / designWidth, 1);

  cert.style.transform = `scale(${scale})`;
  wrapper.style.height = (designHeight * scale) + "px";
}

window.addEventListener("resize", scaleCertificate);

// ================= GENERATE CERT (FIXED SINGLE VERSION) =================
function formatTanggalIndonesia() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function generateCertificate() {

  const name = leadName.value || "USER";

  const certNo = "CC2026-" + Math.floor(100000 + Math.random() * 900000);

  document.getElementById("certName").innerText = name;
  document.getElementById("certScore").innerText = finalScoreValue;
  document.getElementById("certLevel").innerText = finalLevel;
  document.getElementById("certNumber").innerText = certNo;
  document.getElementById("certDate").innerText =
  formatTanggalIndonesia();
  document.getElementById("certDate").innerText =
  new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  // QR ALWAYS RESET SAFE
  const qrBox = document.getElementById("qrcode");
  qrBox.innerHTML = "";

const verifyURL = `https://kontenova.id/verify.html?cert=${certNo}`;
  new QRCode(qrBox, {
    text: verifyURL,
    width: 130,
    height: 130
  });

  saveCertificateToSheet(name, finalScoreValue, certNo);
}

// ================= DOWNLOAD PDF =================
// ================= DOWNLOAD PDF SESUAI PREVIEW =================
document.getElementById("downloadCertBtn")?.addEventListener("click", async () => {
  const cert = document.querySelector("#certificate .cert-border");

  if (!cert) {
    alert("Sertifikat belum ditemukan.");
    return;
  }

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));

    const oldTransform = cert.style.transform;
    const oldTransformOrigin = cert.style.transformOrigin;

    cert.style.transform = "none";
    cert.style.transformOrigin = "top left";

    const canvas = await html2canvas(cert, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0
    });

    cert.style.transform = oldTransform;
    cert.style.transformOrigin = oldTransformOrigin;

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const margin = 10;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    let imgWidth = availableWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

    const name = (leadName.value || "creator")
      .replace(/\s+/g, "-")
      .toLowerCase();

    pdf.save(`certificate-${name}.pdf`);
  } catch (error) {
    console.error("Download certificate error:", error);
    alert("Download sertifikat gagal. Cek Console untuk detail error.");
  }
});

// ================= SAVE SHEET =================
function saveCertificateToSheet(name, score, certNo) {
  fetch("https://script.google.com/macros/s/AKfycbyGu-dsTMLGpb1lZY3TJDCAE8qwAKOlUMbMMJU9Gja0iNhiuPoYkONfVxOuHBxZa7Zb/exec", {
    method: "POST",
    body: JSON.stringify({
      name,
      score,
      certNo
    })
  });
}

// ================= RESTART =================
document.getElementById("restartBtn").addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  attempt = 1;

  resultScreen.classList.add("hidden");
  leadForm.classList.add("hidden");
  startScreen.classList.remove("hidden");
});