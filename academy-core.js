/**
 * GENIO ACADEMY — MOBILE ENGINE v1.0
 * Gamification, Firebase Sync & UI Logic
 */

const ACADEMY_CONFIG = {
    XP_PER_LEVEL: 500,
    LEVEL_TITLES: ["Novice", "Padawan", "Pro", "Expert Genio", "Légende Tech"],
    COURSES_DB: [
        { id: "premiere-pro", title: "Adobe Premiere Pro", xp: 1500, status: "active", progress: 45, icon: "🎬" },
        { id: "dev-web", title: "Fondamentaux Dev Web", xp: 1200, status: "locked", progress: 0, icon: "👨‍💻" },
        { id: "design", title: "UI/UX Masterclass", xp: 1000, status: "locked", progress: 0, icon: "🎨" }
    ]
};

let currentUserData = {
    xp: 225, // Mock initial state
    level: 1,
    streak: 3,
    completedModules: [],
    enrolledCourses: ["premiere-pro"]
};

/**
 * INITIALIZATION
 */
function initAcademy() {
    console.log("🚀 Genio Academy Mobile Initialized");
    setupNav();
    updateUserStats();
    loadCourseLibrary();
}

/**
 * UI: NAVIGATION (TABS)
 */
function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Toggle buttons
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle views
            document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
            const view = document.getElementById(`tab-${tabId}`);
            if (view) view.classList.add('active');
        });
    });
}

/**
 * GAMIFICATION: XP & PROGRESS
 */
function updateUserStats() {
    const xpDisplay = document.getElementById('user-xp-display');
    const levelTag = document.getElementById('user-level-tag');
    
    // Calculate level
    const level = Math.floor(currentUserData.xp / ACADEMY_CONFIG.XP_PER_LEVEL) + 1;
    const currentProgressXp = currentUserData.xp % ACADEMY_CONFIG.XP_PER_LEVEL;
    const title = ACADEMY_CONFIG.LEVEL_TITLES[Math.min(level - 1, 4)];
    
    if (xpDisplay) xpDisplay.textContent = `${currentProgressXp} / ${ACADEMY_CONFIG.XP_PER_LEVEL} XP`;
    if (levelTag) levelTag.textContent = `NIVEAU ${level} · ${title.toUpperCase()}`;
    
    currentUserData.level = level;
}

function addXP(amount) {
    currentUserData.xp += amount;
    updateUserStats();
    notifyXP(amount);
}

function notifyXP(amount) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
        background: var(--accent-orange); color: white; padding: 10px 20px;
        border-radius: 30px; font-weight: 700; font-size: 0.9rem;
        box-shadow: 0 5px 15px rgba(255,107,0,0.4); z-index: 10000;
        animation: fadeUpOut 2s forwards;
    `;
    toast.textContent = `+${amount} XP GAGNÉ ! ⚡`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

/**
 * COURSE PLAYER LOGIC
 */
function openCourse(courseId) {
    const player = document.getElementById('course-player');
    const iframeContainer = document.getElementById('player-iframe-container');
    const title = document.getElementById('player-title');
    
    player.style.display = 'block';
    
    // Load the guide (Premiere Pro for now)
    if (courseId === 'premiere-pro') {
        title.textContent = "Adobe Premiere Pro";
        iframeContainer.innerHTML = `<iframe src="Guide_PremierePro_Genio.html" style="width:100%; height:calc(100vh - 80px); border:none;"></iframe>`;
    } else {
        alert("Ce cours n'est pas encore disponible dans votre abonnement.");
        closePlayer();
    }
}

function closePlayer() {
    document.getElementById('course-player').style.display = 'none';
    document.getElementById('player-iframe-container').innerHTML = '';
}

/**
 * LIBRARY
 */
function loadCourseLibrary() {
    const container = document.getElementById('all-courses-list');
    if (!container) return;
    
    container.innerHTML = ACADEMY_CONFIG.COURSES_DB.map(c => `
        <div class="course-item" onclick="openCourse('${c.id}')" style="cursor:pointer; ${c.status === 'locked' ? 'opacity:0.5' : ''}">
            <div class="course-thumb">${c.icon}</div>
            <div class="course-info">
                <h4>${c.title}</h4>
                <p>${c.xp} XP total · ${c.status === 'locked' ? '🔒 Bloqué' : '✅ Débloqué'}</p>
            </div>
        </div>
    `).join('');
}

// Global scope expose
window.openCourse = openCourse;
window.closePlayer = closePlayer;

// Auto init
document.addEventListener('DOMContentLoaded', initAcademy);
