// Minimal script so the <script> tag doesn't 404 and to verify JS loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded');
    // Theme toggle setup
    const toggleBtn = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (toggleBtn) toggleBtn.textContent = '☀️';
    } else {
        if (toggleBtn) toggleBtn.textContent = '🌙';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            toggleBtn.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Reveal-on-scroll setup
    const sections = document.querySelectorAll('section');

    // Ensure sections have initial hidden state (in case CSS didn't apply yet)
    sections.forEach(section => {
        section.style.opacity = section.style.opacity || '0';
        section.style.transform = section.style.transform || 'translateY(20px)';
        section.style.transition = section.style.transition || 'opacity 1.0s ease, transform 1.0s ease';
    });

    const revealSections = () => {
        const triggerBottom = window.innerHeight * 0.8;

        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;

            if (sectionTop < triggerBottom) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    window.addEventListener('scroll', revealSections);
    // run once on load to reveal sections already in view
    revealSections();
    // Typing effect (fade in/out between words)
    const typingElement = document.getElementById('typing');
    if (typingElement) {
        typingElement.style.opacity = 0;
        typingElement.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { typingElement.style.opacity = 1; }, 200);

        const words = [
            'Software Developer',
            'Full Stack Developer',
            'Frontend Engineer',
            'Future AWS Architect'
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentWord = words[wordIndex];

            if (!isDeleting) {
                typingElement.textContent = currentWord.slice(0, charIndex + 1);
                charIndex++;

                if (charIndex === currentWord.length) {
                    // wait, then start deleting
                    setTimeout(() => isDeleting = true, 1000);
                }
            } else {
                typingElement.textContent = currentWord.slice(0, charIndex - 1);
                charIndex--;

                if (charIndex === 0) {
                    // before changing to next word, fade out then fade in
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    typingElement.style.opacity = '0';
                    setTimeout(() => {
                        typingElement.style.opacity = '1';
                    }, 200);
                }
            }

            const typingSpeed = isDeleting ? 40 : 80;
            setTimeout(typeEffect, typingSpeed);
        }

        typeEffect();
    }
});

async function sendMessage() {
    const inputEl = document.getElementById("input");
    const messagesEl = document.getElementById("messages");
    const sendBtn = document.getElementById('send-btn');

    if (!inputEl || !messagesEl) return;

    const input = inputEl.value.trim();
    if (!input) return; // don't send empty messages

    // render user message
    const userMsg = document.createElement('p');
    userMsg.innerHTML = '<b>You:</b> ' + escapeHtml(input);
    messagesEl.appendChild(userMsg);
    inputEl.value = '';
    inputEl.focus();

    // disable send while waiting
    if (sendBtn) sendBtn.disabled = true;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error('Server error: ' + response.status);

        const data = await response.json();
        appendBotReply(data.reply);
    } catch (err) {
        // fallback local reply when backend is not reachable
        console.warn('Chat backend unreachable, using local fallback:', err && err.message);
        const fallback = localBotReply(input);
        appendBotReply(fallback);
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }

    // keep scroll at bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// helper to append bot reply safely
function appendBotReply(text) {
    const messagesEl = document.getElementById('messages');
    const botMsg = document.createElement('p');
    botMsg.innerHTML = '<b>Bot:</b> ' + escapeHtml(text);
    messagesEl.appendChild(botMsg);
}

// richer local fallback with simple intent matching
function localBotReply(msg) {
    const low = (msg || '').toLowerCase().trim();

    const intents = [
        { test: /^(hi|hello|hey)\b/, reply: "Hello! I'm the portfolio assistant — ask about projects, skills, contact, or request a short code example." },
        { test: /your name|who are you/, reply: "I'm the portfolio assistant for Bharadwaj Naik Halavath. I can answer questions about the site and provide small code examples." },
        { test: /contact|email|phone/, reply: "You can contact Bharadwaj via email: bharadwajnaikh@gmail.com or view the Contact section on this page." },
        { test: /github/, reply: "GitHub: https://github.com/Bharadwajnaik9848 — projects and code samples are available there." },
        { test: /linkedin/, reply: "LinkedIn: https://www.linkedin.com/in/bharadwaj-naik-halavath-84922414b/" },
        { test: /project|projects|online sticker|portfolio/, reply: "Projects listed: Online Sticker Shopping App (React + Spring Boot), this portfolio (HTML/CSS/JS). Ask for details about any project." },
        { test: /skills|resume|education/, reply: "Skills: Java, JavaScript, React, HTML/CSS, basic AWS knowledge. Education: Master's student in Computer Science at Rivier University." },
        { test: /debounce/, reply: "JS debounce example:\n\nfunction debounce(fn, wait) {\n  let t;\n  return function(...args) {\n    clearTimeout(t);\n    t = setTimeout(() => fn.apply(this, args), wait);\n  };\n}\n\n// usage: const debounced = debounce(() => console.log('called'), 300);" },
        { test: /css center|center div/, reply: "To center a div horizontally and vertically: display:flex; align-items:center; justify-content:center; on the parent. For fixed width child also margin: 0 auto;" },
        { test: /node.*server|run.*node/, reply: "Quick Node server:\n\nconst http = require('http');\nhttp.createServer((req,res)=>{ res.end('ok'); }).listen(3000);" },
        { test: /help|what can you do/, reply: "I can answer FAQs about this portfolio, provide short code examples, and point to contact or GitHub links. Try: 'Tell me about your projects', 'Show a debounce example', or 'How can I contact you?'." },
        { test: /(joke|funny)/, reply: "Why do programmers prefer dark mode? Because light attracts bugs." },
        { test: /(haiku)/, reply: "Code hums in the night\nLogic dances, keys tapping\nBugs sleep, dawn arrives" },
    ];

    for (const intent of intents) {
        if (intent.test.test(low)) return intent.reply;
    }

    // fallback: try to be helpful with guidance instead of a single 'I don't know' line
    return "I don't have a specific answer for that, but try asking about 'projects', 'contact', 'skills', or request a short code example (for example: 'show debounce example').";
}

// escape HTML to avoid injection when inserting messages
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// support pressing Enter to send
document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('input');
    if (inputEl) {
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    // AI toggle and close handlers
    const aiToggle = document.getElementById('ai-toggle');
    const chatbox = document.getElementById('chatbox');
    const closeBtn = document.getElementById('close-chat');

    function openChat() {
        if (chatbox) chatbox.classList.remove('hidden');
        if (aiToggle) aiToggle.style.display = 'none';
        const input = document.getElementById('input');
        if (input) input.focus();
        // show a short welcome/help message the first time the chat opens
        const messagesEl = document.getElementById('messages');
        if (messagesEl && messagesEl.children.length === 0) {
            appendBotReply("Hi — I'm the portfolio assistant. Try: 'Tell me about your projects', 'How can I contact you?', 'Show a short JS debounce example', or just say 'hello'.");
        }
    }

    function closeChat() {
        if (chatbox) chatbox.classList.add('hidden');
        if (aiToggle) aiToggle.style.display = '';
    }

    if (aiToggle) aiToggle.addEventListener('click', openChat);
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChat();
    });
});


