// app.js (type="module")
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, push, set, onValue, runTransaction
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8jpdthe192exMiL9etdmx388G0c0K-bo",
  authDomain: "codementor-web.firebaseapp.com",
  databaseURL: "https://codementor-web-default-rtdb.firebaseio.com",
  projectId: "codementor-web",
  storageBucket: "codementor-web.firebasestorage.app",
  messagingSenderId: "677126166968",
  appId: "1:677126166968:web:6a4d527b71f3a2b722d74d",
  measurementId: "G-JSB8XZ3N40"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const questionsCol = ref(db, "questions");

/* ---------- POST QUESTION ---------- */
askSubmit.addEventListener('click', async () => {
  const name = (askName.value || 'Anonymous').trim();
  const text = (askText.value || '').trim();
  if (!text) return alert('Please write a question.');

  askSubmit.disabled = true;
  askSubmit.textContent = "Posting...";

  try {
    await set(push(questionsCol), {
      name,
      text,
      createdAt: Date.now(),
      answers: []
    });

    askText.value = '';
    askName.value = '';
    alert('✅ Question posted!');
  } catch (error) {
    alert('❌ Error posting: ' + error.message);
  } finally {
    askSubmit.disabled = false;
    askSubmit.textContent = "Submit";
  }
});

/* ---------- LISTEN & RENDER QUESTIONS ---------- */
onValue(questionsCol, (snapshot) => {
  const data = snapshot.val();
  const items = data
    ? Object.entries(data)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];
  renderQuestions(items);
});

/* ---------- ADD ANSWER SAFELY ---------- */
function addAnswer(questionId, aName, aText) {
  const questionRef = ref(db, `questions/${questionId}/answers`);
  runTransaction(questionRef, (currentAnswers) => {
    if (!currentAnswers) currentAnswers = [];
    return [
      ...currentAnswers,
      {
        name: aName,
        text: aText,
        createdAt: Date.now()
      }
    ];
  });
}

/* ---------- RENDER QUESTIONS ---------- */
function renderQuestions(items) {
  questionsDiv.innerHTML = '';
  if (items.length === 0) {
    questionsDiv.innerHTML = '<p style="color:var(--muted)">No questions yet — be the first to ask.</p>';
    return;
  }
  items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'question card';
    const created = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
    const answersHtml = (item.answers || []).map(a => `
      <div class="answer">
        <div class="meta"><strong>${escapeHtml(a.name || 'Anonymous')}</strong> · ${a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</div>
        <div>${escapeHtml(a.text)}</div>
      </div>
    `).join('');
    wrap.innerHTML = `
      <div class="meta"><strong>${escapeHtml(item.name || 'Anonymous')}</strong> asked ${created}</div>
      <div class="q-text">${escapeHtml(item.text)}</div>
      <div class="answers-list">${answersHtml}</div>
      <div class="answer-form">
        <input placeholder="Your name (or alias)" class="ans-name" />
        <input placeholder="Write an answer" class="ans-text" />
        <button class="btn ans-submit">Answer</button>
      </div>
    `;
    wrap.querySelector('.ans-submit').addEventListener('click', () => {
      const nameField = wrap.querySelector('.ans-name');
      const textField = wrap.querySelector('.ans-text');
      const aName = (nameField.value || 'Anonymous').trim();
      const aText = (textField.value || '').trim();
      if (!aText) return alert('Please write an answer before submitting.');
      addAnswer(item.id, aName, aText);
      nameField.value = '';
      textField.value = '';
    });
    questionsDiv.appendChild(wrap);
  });
}

/* ---------- ESCAPE HTML ---------- */
function escapeHtml(unsafe) {
  return ('' + unsafe).replace(/[&<"'>]/g, function (m) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
  });
}
