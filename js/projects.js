// Projects Page — Dynamic Rendering & Filtering
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    initProjects();
});

// Fallback projects in case Firestore is empty or not configured
const fallbackProjects = [
    {
        id: "auto-concierge",
        title: "Autocare Concierge (Auto Concierge)",
        category: "generative ai",
        role: "Lead AI Engineer & Architect",
        metric: "Multi-Agent System",
        date: "2024",
        description: "A unified voice and text conversational AI built for Al Futtaim Automotive service and sales in the UAE and GCC, using dynamic tool calling.",
        detailedDescription: "Designed and built Al Futtaim Automotive's conversational AI assistant, consolidating service and sales inquiries into a unified voice and text intelligence agent operating across UAE and GCC regions. Architected a hierarchical multi-agent structure using LangGraph and FastAPI, utilizing specialized Router, Service, Sales, Recall, and General agents. The brain operates entirely via LLM reasoning and dynamic tool calling (SQLite metrics logs, recall lookups) without static vector database constraints, integrated with Whisper Speech-to-Text and TTS.",
        icon: "chatbot",
        techStack: "Python, LangGraph, Groq SDK, FastAPI, SQLite, Whisper STT",
        url: "https://github.com/riyazkhan90/Autocare_Concierge",
        demoUrl: "https://autocareconcierge-production.up.railway.app/static/index.html"
    },
    {
        id: "ford-ai-agent",
        title: "Ford Vehicle Safety Intelligence Agent",
        category: "generative ai",
        role: "GenAI Solutions Architect",
        metric: "RAG & Tool Calling",
        date: "2024",
        description: "A portfolio-grade Q&A and diagnostics agent querying NHTSA public vehicle safety data using LangGraph, Groq, and ChromaDB.",
        detailedDescription: "Architected a portfolio-grade RAG and tool-calling agent designed to query live vehicle safety datasets from the NHTSA. The system is built with LangGraph ReAct framework, utilizing Gemini Embeddings and ChromaDB for semantic knowledge base search. It integrates three dynamic tools: semantic KB search, live recalls API retrieval, and live complaint statistics, and implements automatic Groq API key rotation on rate limits with a deterministic fallback agent and multi-turn history memory.",
        icon: "platform",
        techStack: "FastAPI, LangGraph, ChromaDB, Groq Llama-3.3, Gemini Embeddings, NHTSA API",
        url: "https://github.com/riyazkhan90/ford-vehicle-safety-agent",
        demoUrl: "https://web-production-4dc4b.up.railway.app/static/index.html"
    }
];

let allProjects = [];
let activeFilter = 'all';

// Initialize Page
async function initProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    // Show loading spinner
    projectsGrid.innerHTML = `
        <div class="blog-loading">
            <div class="blog-loading-spinner"></div>
            <p>Loading projects...</p>
        </div>`;

    // Check if Firebase is configured with real credentials
    const isFirebaseConfigured = typeof firebaseConfig !== 'undefined' && 
                                 firebaseConfig.apiKey && 
                                 firebaseConfig.apiKey !== "YOUR_API_KEY";

    if (isFirebaseConfigured) {
        try {
            const snapshot = await db.collection('projects')
                .orderBy('date', 'desc')
                .get();

            if (!snapshot.empty) {
                allProjects = [];
                snapshot.forEach(doc => {
                    allProjects.push({ id: doc.id, ...doc.data() });
                });
            } else {
                console.log("Firestore projects collection is empty, loading fallback projects.");
                allProjects = [...fallbackProjects];
            }
        } catch (error) {
            console.error("Error loading projects from Firestore:", error);
            allProjects = [...fallbackProjects];
        }
    } else {
        console.log("Firebase is not configured, loading local fallback projects.");
        allProjects = [...fallbackProjects];
    }

    renderProjects();
    setupFilters();
    setupModal();
}

// Render Projects to Grid
function renderProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    const filtered = allProjects.filter(project => {
        if (activeFilter === 'all') return true;
        return project.category.toLowerCase() === activeFilter.toLowerCase();
    });

    if (filtered.length === 0) {
        projectsGrid.innerHTML = `
            <div class="blog-empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>No Projects Found</h3>
                <p>No projects match the selected category filter.</p>
            </div>`;
        return;
    }

    filtered.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

// Create Project Card Element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id;

    // Resolve icon path
    let iconSrc = '../assets/images/chatbot-icon.png'; // default
    if (project.icon === 'bill') {
        iconSrc = '../assets/images/bill-icon.png';
    } else if (project.icon === 'customer-experience') {
        iconSrc = '../assets/images/customer-experience-icon.png';
    } else if (project.icon === 'platform') {
        iconSrc = '../assets/images/ai-logo-new.png';
    }

    // Format tech stack HTML
    const techArray = typeof project.techStack === 'string' ? 
                      project.techStack.split(',').map(t => t.trim()) : 
                      (Array.isArray(project.techStack) ? project.techStack : []);
    
    const techBadges = techArray.slice(0, 3).map(tech => `<span class="project-tech-badge">${escapeHtml(tech)}</span>`).join('');

    // Generate footer buttons HTML
    let footerHtml = `<div class="project-card-footer">`;
    
    if (project.demoUrl) {
        footerHtml += `
            <a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer" class="project-card-btn demo-btn" title="View Live Demo">
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Demo
            </a>
        `;
    }
    
    if (project.url) {
        const isGitHub = project.url.includes('github.com');
        const label = isGitHub ? 'GitHub' : 'Code';
        const icon = isGitHub ? `
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
        ` : `
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
        `;
        
        footerHtml += `
            <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer" class="project-card-btn code-btn" title="View Source Code">
                ${icon}
                ${label}
            </a>
        `;
    }
    
    footerHtml += `
        <span class="project-card-btn details-btn" title="View Case Study">
            <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Details
        </span>
    `;
    
    footerHtml += `</div>`;

    card.innerHTML = `
        <div class="project-card-header">
            <span class="project-category-tag">${escapeHtml(capitalizeWords(project.category))}</span>
            ${project.metric ? `<span class="project-metric-badge">${escapeHtml(project.metric)}</span>` : ''}
        </div>
        <div class="project-card-content">
            <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
            <span class="project-card-role">${escapeHtml(project.role)}</span>
            <p class="project-card-desc">${escapeHtml(project.description)}</p>
            <div class="project-card-tech">
                ${techBadges}
                ${techArray.length > 3 ? `<span class="project-tech-badge">+${techArray.length - 3}</span>` : ''}
            </div>
        </div>
        ${footerHtml}
        <div class="project-card-icon">
            <img src="${iconSrc}" alt="Icon decoration">
        </div>
    `;

    // Click event to open modal
    card.addEventListener('click', () => {
        openModal(project);
    });

    // Prevent modal opening when clicking action links
    const cardButtons = card.querySelectorAll('.project-card-btn');
    cardButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('details-btn')) {
                // Details button should trigger card click event to open modal
                return;
            }
            // Stop propagation for Demo and Github links
            e.stopPropagation();
        });
    });

    return card;
}

// Setup Filters functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.category;
            renderProjects();
        });
    });
}

// Setup Modal event listeners
function setupModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close');

    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    // Close when clicking overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Open Modal and populate data
function openModal(project) {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-category').textContent = capitalizeWords(project.category);
    document.getElementById('modal-metric').textContent = project.metric || 'Case Study';
    document.getElementById('modal-role').textContent = project.role;
    document.getElementById('modal-overview').textContent = project.description;
    
    // Detailed description fallback to short if not present
    document.getElementById('modal-detail').textContent = project.detailedDescription || project.description;
    document.getElementById('modal-date').textContent = project.date || 'Ongoing';

    // Populate Tech stack
    const techWrap = document.getElementById('modal-tech');
    techWrap.innerHTML = '';
    const techArray = typeof project.techStack === 'string' ? 
                      project.techStack.split(',').map(t => t.trim()) : 
                      (Array.isArray(project.techStack) ? project.techStack : []);
    
    techArray.forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        techWrap.appendChild(tag);
    });

    // Link CTA
    const linkBtn = document.getElementById('modal-link');
    if (project.url) {
        linkBtn.href = project.url;
        linkBtn.style.display = 'inline-flex';
        // Personalize button text depending on URL type
        if (project.url.includes('github.com')) {
            linkBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
            `;
        } else if (project.url.includes('linkedin.com')) {
            linkBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                View on LinkedIn
            `;
        } else {
            linkBtn.innerHTML = 'View Live Project ↗';
            linkBtn.style.display = 'inline-flex';
        }
    } else {
        linkBtn.style.display = 'none';
    }

    // Demo Link CTA
    const demoLinkBtn = document.getElementById('modal-demo-link');
    if (demoLinkBtn) {
        if (project.demoUrl) {
            demoLinkBtn.href = project.demoUrl;
            demoLinkBtn.style.display = 'inline-flex';
        } else {
            demoLinkBtn.style.display = 'none';
        }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

// Helper Functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeWords(str) {
    if (!str) return '';
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
