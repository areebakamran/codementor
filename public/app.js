// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---------- SPA NAVIGATION ----------
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('[data-link]');
const pageTitle = document.getElementById('page-title');

function showPage(id) {
  pages.forEach(p => p.classList.remove('active'));
  const page = document.getElementById(id);
  if (page) {
    page.classList.add('active');
    pageTitle.textContent = page.querySelector('h3')?.textContent || id.charAt(0).toUpperCase() + id.slice(1);
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  }
}
function handleHashChange() {
  const id = location.hash.replace('#', '') || 'home';
  showPage(id);
}
navLinks.forEach(link => link.addEventListener('click', e => {
  e.preventDefault();
  location.hash = link.getAttribute('href');
}));
window.addEventListener('hashchange', handleHashChange);
handleHashChange();

// ---------- ANIMATIONS ----------
gsap.utils.toArray('[data-animate]').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 80%' },
    y: 30,
    opacity: 0,
    duration: 0.6
  });
});

// ---------- HARDCODED OPPORTUNITIES ----------
const scholarships = [
  {
    title: "Women at Microsoft (WAM) Scholarship",
    desc: "One-time $5,000 award for high school seniors who are women or non-binary pursuing tech.",
    deadline: "March 17th",
    link: "https://www.microsoft.com/en-us/diversity/programs/women-at-microsoft-scholarship"
  },
  {
    title: "UNCF Scholarships",
    desc: "Millions awarded annually to minority students via HBCUs.",
    deadline: "August 15th",
    link: "https://uncf.org/scholarships"
  },
  {
    title: "WITS (Women in Tech Scholarship)",
    desc: "$2,500 award for women in IT/CS enrolled at U.S. colleges.",
    deadline: "August 25th",
    link: "https://www.womentech.net/blog/elevate-women-in-technology-scholarship"
  },
  {
    title: "Organization for Women in Science for the Developing World (OWSD)",
    desc: "PhD fellowships for women in STEM from developing countries.",
    deadline: "August 31st",
    link: "https://en.wikipedia.org/wiki/Organization_for_Women_in_Science_for_the_Developing_World"
  },
  {
    title: "Amelia Earhart Fellowship (Zonta International)",
    desc: "US$10,000 fellowship for women pursuing PhDs in aerospace-related fields.",
    deadline: "November 15th",
    link: "https://en.wikipedia.org/wiki/Zonta_International"
  }
];
const internships = [
  {
    title: "Outreachy Open Source Internship",
    desc: "Paid, remote internships with open-source projects for marginalized groups.",
    deadline: "early to mid August",
    link: "https://www.outreachy.org/"
  },
  {
    title: "NNSA MSIIP (DOE Minority Serving Institutions Internship)",
    desc: "Paid summer/year-long internships for students at Minority Serving Institutions.",
    deadline: "Varies",
    link: "https://www.zintellect.com/Opportunity/Details/2025-NNSA-MSIIP"
  },
  {
    title: "INROADS Internship Program",
    desc: "Paid internships + career training and mentoring for underrepresented students.",
    deadline: "Varies",
    link: "https://inroads.org/internships-program/"
  },
  {
    title: "Puch AI Remote Internship (India)",
    desc: "Remote AI Engineering and Growth Marketing internships; open to all, no degree required.",
    deadline: "Ongoing",
    link: "https://economictimes.indiatimes.com/news/new-updates/puch-ai-offers-2-lakh-remote-internship-no-degree-required-open-to-even-10th-graders-check-how-to-apply/articleshow/123183066.cms"
  }
];
const jobs = [
  {
    title: "Entry-Level Diversity & Inclusion Remote Jobs (ZipRecruiter)",
    desc: "Remote roles focused on diversity & inclusion across sectors.",
    deadline: " rolling",
    link: "https://www.ziprecruiter.com/Jobs/Entry-Level-Diversity-Inclusion-Remote"
  },
  {
    title: "PowerToFly Remote Tech Jobs for Women",
    desc: "Platform connecting women (and mothers) with remote roles in tech and more.",
    deadline: "Ongoing",
    link: "https://www.investopedia.com/articles/investing/022916/power-fly-how-it-works-and-makes-money.asp"
  },
  {
    title: "Black Tech Jobs Marketplace",
    desc: "Tech job board connecting Black professionals with inclusive employers.",
    deadline: "Ongoing",
    link: "https://www.blacktechjobs.com/"
  }
];
function renderCards(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(item => `
    <div class="card">
      <h4>
        <a href="${item.link}" target="_blank" rel="noopener noreferrer">
          ${item.title}
        </a>
      </h4>
      <p>${item.desc}</p>
      <small>Deadline: ${item.deadline}</small>
    </div>
  `).join('');
}
renderCards('scholarship-list', scholarships);
renderCards('internship-list', internships);
renderCards('job-list', jobs);

// ---------- Q&A FUNCTIONALITY ----------
const questionsCol = ref(db, 'questions');
const askName = document.getElementById('ask-name');
const askText = document.getElementById('ask-text');
const askSubmit = document.getElementById('ask-submit');
const seedDemoBtn = document.getElementById('seed-demo');
const questionsDiv = document.getElementById('questions');

askSubmit.addEventListener('click', async () => {
  const name = (askName.value || 'Anonymous').trim();
  const text = askText.value.trim();
  if (!text) return alert('Please enter a question.');
  await push(questionsCol, { name, text, createdAt: Date.now(), answers: {} });
  askName.value = '';
  askText.value = '';
});

seedDemoBtn.addEventListener('click', async () => {
  const demoQs = [
    { name: "Maya", text: "How do I prepare for a technical interview?", createdAt: Date.now() - 5000 },
    { name: "Ravi", text: "Best resources for learning data structures?", createdAt: Date.now() - 10000 }
  ];
  for (const q of demoQs) {
    await push(questionsCol, q);
  }
});

function renderQuestions(data) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1].createdAt - a[1].createdAt);
  questionsDiv.innerHTML = entries.map(([id, q]) => `
    <div class="question">
      <div class="meta">${q.name} — ${new Date(q.createdAt).toLocaleString()}</div>
      <div class="text">${q.text}</div>
      ${q.answers ? renderAnswers(q.answers) : ''}
      <div class="answer-form">
        <input placeholder="Your answer" data-answer-input="${id}" />
        <button class="btn" data-answer-btn="${id}">Post</button>
      </div>
    </div>
  `).join('');

  // bind answer buttons
  document.querySelectorAll('[data-answer-btn]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const qid = btn.getAttribute('data-answer-btn');
      const input = document.querySelector(`[data-answer-input="${qid}"]`);
      const text = input.value.trim();
      if (!text) return;
      await push(ref(db, `questions/${qid}/answers`), { text, createdAt: Date.now() });
      input.value = '';
    });
  });
}
function renderAnswers(answers) {
  return `<div class="answers-list">${
    Object.values(answers)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(a => `<div class="answer">${a.text}</div>`)
      .join('')
  }</div>`;
}

onValue(questionsCol, snapshot => {
  renderQuestions(snapshot.val());
});
