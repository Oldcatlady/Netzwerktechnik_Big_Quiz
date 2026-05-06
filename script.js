let questions = [];
let current = 0;
let correct = 0;
let wrong = 0;
let answered = false;

fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    loadQuestion();
  });

document.getElementById("textAnswer").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkAnswer(e.target.value);
  }
});

function cleanQuestionText(text) {
  if (!text) return "";

  return text
    .split("\nA)")[0]
    .split("\nAntwort:")[0]
    .split("\nErklärung:")[0]
    .trim();
}

function clearAnswerButtons() {
  document.querySelectorAll(".answer-btn").forEach(btn => btn.remove());
}

function loadQuestion() {
  let q = questions[current];

  answered = false;

  clearAnswerButtons();

  // Frage bereinigen
  document.getElementById("question").innerText = cleanQuestionText(q.question);

  document.getElementById("feedback").innerHTML = "";
  document.getElementById("textAnswer").value = "";

  document.getElementById("nextBtn").style.display = "block";

  let answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  // MULTIPLE CHOICE
  if (q.type === "mc") {
    q.options.forEach(opt => {
      let btn = document.createElement("button");
      btn.innerText = opt;
      btn.className = "answer-btn";

      btn.onclick = () => checkAnswer(opt);

      answersDiv.appendChild(btn);
    });

    document.getElementById("textAnswer").style.display = "none";
  }

  // TEXT
  else if (q.type === "text") {
    document.getElementById("textAnswer").style.display = "block";
  }

  // COPY
  else if (q.type === "copy") {
    q.options.forEach(opt => {
      let btn = document.createElement("button");
      btn.innerText = opt;
      btn.className = "answer-btn";

      btn.onclick = () => {
        document.getElementById("textAnswer").value = opt;
        checkAnswer(opt);
      };

      answersDiv.appendChild(btn);
    });

    document.getElementById("textAnswer").style.display = "block";
  }

  updateProgress();
}

function checkAnswer(value) {
  if (answered) return;

  answered = true;

  let q = questions[current];
  let feedback = document.getElementById("feedback");

  // Buttons deaktivieren
  document.querySelectorAll(".answer-btn").forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = "0.6";
  });

  let userAnswer = value?.trim().toLowerCase();
  let correctAnswer = q.answer?.trim().toLowerCase();

  if (userAnswer && userAnswer === correctAnswer) {
    correct++;
    feedback.className = "correct";
    feedback.innerHTML = `
      <b>Richtig!</b><br>
      ${q.explanation}
      <br><br>
      <b>Antwort:</b> ${q.answer}
    `;
  } else {
    wrong++;
    feedback.className = "wrong";
    feedback.innerHTML = `
      <b>Falsch!</b><br>
      Richtige Antwort:<br>
      <b>${q.answer}</b>
      <br><br>
      ${q.explanation}
    `;
  }

  document.getElementById("nextBtn").style.display = "block";

  updateProgress();
}

function nextQuestion() {
  let q = questions[current];

  if (!answered) {

    if (q.type === "text" || q.type === "copy") {
      let value = document.getElementById("textAnswer").value;

      if (!value.trim()) {
        let feedback = document.getElementById("feedback");
        feedback.className = "wrong";
        feedback.innerHTML = "Bitte gib zuerst eine Antwort ein.";
        return;
      }

      checkAnswer(value);
      return;
    }

    let feedback = document.getElementById("feedback");
    feedback.className = "wrong";
    feedback.innerHTML = "Bitte wähle zuerst eine Antwort aus.";
    return;
  }

  current++;

  if (current < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function updateProgress() {
  document.getElementById("progressText").innerText =
    `Frage ${current + 1} / ${questions.length}`;

  document.getElementById("scoreText").innerText =
    `✔ ${correct} | ✖ ${wrong}`;

  document.getElementById("percentText").innerText =
    `(${Math.round((correct / questions.length) * 100)}%)`;

  document.getElementById("progressFill").style.width =
    ((current + 1) / questions.length) * 100 + "%";
}

function showResult() {
  let percent = (correct / questions.length) * 100;
  let grade = getGrade(percent);

  document.querySelector(".card").innerHTML = `
    <h2>Ergebnis</h2>
    <p>Punkte: ${percent.toFixed(1)}%</p>
    <p>Note (IHK): ${grade}</p>
    <p>✔ ${correct} richtige | ✖ ${wrong} falsche</p>
  `;
}

function getGrade(p) {
  if (p >= 90) return 1;
  if (p >= 80) return 2;
  if (p >= 70) return 3;
  if (p >= 60) return 4;
  if (p >= 50) return 5;
  return 6;
}