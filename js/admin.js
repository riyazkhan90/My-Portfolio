// Admin Page Logic — Firebase Auth + Firestore CRUD
// =====================================================

const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const adminUserEmail = document.getElementById('admin-user-email');

const blogForm = document.getElementById('blog-form');
const blogList = document.getElementById('blog-list');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const submitBtnText = document.getElementById('submit-btn-text');

const projectForm = document.getElementById('project-form');
const projectList = document.getElementById('project-list');
const projectFormTitle = document.getElementById('project-form-title');
const projectCancelEditBtn = document.getElementById('project-cancel-edit');
const projectSubmitBtnText = document.getElementById('project-submit-btn-text');

let editingBlogId = null;
let editingProjectId = null;

// =====================================================
// Auth State Listener
// =====================================================
auth.onAuthStateChanged((user) => {
    if (user) {
        loginSection.style.display = 'none';
        adminDashboard.style.display = 'block';
        adminUserEmail.textContent = user.email;
        loadBlogs();
        loadProjects();
    } else {
        loginSection.style.display = 'block';
        adminDashboard.style.display = 'none';
    }
});

// =====================================================
// Login
// =====================================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    loginError.style.display = 'none';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        loginError.textContent = getAuthErrorMessage(error.code);
        loginError.style.display = 'block';
    }
});

// =====================================================
// Logout
// =====================================================
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// =====================================================
// Add / Edit Blog Post
// =====================================================
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const blog = {
        title: document.getElementById('blog-title').value.trim(),
        url: document.getElementById('blog-url').value.trim(),
        date: document.getElementById('blog-date').value,
        description: document.getElementById('blog-description').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (editingBlogId) {
            // Update existing blog
            await db.collection('blogs').doc(editingBlogId).update(blog);
            showToast('Blog post updated successfully!');
        } else {
            // Add new blog
            blog.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('blogs').add(blog);
            showToast('Blog post added successfully!');
        }
        resetForm();
        loadBlogs();
    } catch (error) {
        console.error('Error saving blog:', error);
        showToast('Error saving blog post. Please try again.', 'error');
    }
});

// =====================================================
// Load Blogs from Firestore
// =====================================================
async function loadBlogs() {
    try {
        const snapshot = await db.collection('blogs')
            .orderBy('date', 'desc')
            .get();

        blogList.innerHTML = '';

        if (snapshot.empty) {
            blogList.innerHTML = `
                <div class="admin-empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p>No blog posts yet. Add your first one above!</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const blog = doc.data();
            const blogItem = createBlogListItem(doc.id, blog);
            blogList.appendChild(blogItem);
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
        blogList.innerHTML = '<p class="admin-error">Error loading blogs. Please refresh.</p>';
    }
}

// =====================================================
// Create Blog List Item Element
// =====================================================
function createBlogListItem(id, blog) {
    const item = document.createElement('div');
    item.className = 'admin-blog-item';
    item.innerHTML = `
        <div class="admin-blog-info">
            <h4 class="admin-blog-title">${escapeHtml(blog.title)}</h4>
            <p class="admin-blog-meta">
                <span class="admin-blog-date">${formatDate(blog.date)}</span>
                <a href="${escapeHtml(blog.url)}" target="_blank" rel="noopener noreferrer" class="admin-blog-link">View Article ↗</a>
            </p>
            <p class="admin-blog-desc">${escapeHtml(blog.description)}</p>
        </div>
        <div class="admin-blog-actions">
            <button class="admin-btn admin-btn-edit" onclick="editBlog('${id}')" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
            </button>
            <button class="admin-btn admin-btn-delete" onclick="deleteBlog('${id}')" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
            </button>
        </div>
    `;
    return item;
}

// =====================================================
// Edit Blog
// =====================================================
async function editBlog(id) {
    try {
        const doc = await db.collection('blogs').doc(id).get();
        if (!doc.exists) {
            showToast('Blog post not found.', 'error');
            return;
        }

        const blog = doc.data();
        document.getElementById('blog-title').value = blog.title;
        document.getElementById('blog-url').value = blog.url;
        document.getElementById('blog-date').value = blog.date;
        document.getElementById('blog-description').value = blog.description;

        editingBlogId = id;
        formTitle.textContent = 'Edit Blog Post';
        submitBtnText.textContent = 'Update Blog Post';
        cancelEditBtn.style.display = 'inline-flex';

        // Scroll to form
        blogForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error loading blog for edit:', error);
        showToast('Error loading blog post.', 'error');
    }
}

// =====================================================
// Delete Blog
// =====================================================
async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
        await db.collection('blogs').doc(id).delete();
        showToast('Blog post deleted.');
        loadBlogs();
    } catch (error) {
        console.error('Error deleting blog:', error);
        showToast('Error deleting blog post.', 'error');
    }
}

// =====================================================
// Reset Form
// =====================================================
function resetForm() {
    blogForm.reset();
    editingBlogId = null;
    formTitle.textContent = 'Add New Blog Post';
    submitBtnText.textContent = 'Add Blog Post';
    cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', resetForm);

// =====================================================
// Tab Switching
// =====================================================
const tabBlogsBtn = document.getElementById('tab-blogs-btn');
const tabProjectsBtn = document.getElementById('tab-projects-btn');
const blogsTabContent = document.getElementById('blogs-tab-content');
const projectsTabContent = document.getElementById('projects-tab-content');

if (tabBlogsBtn && tabProjectsBtn) {
    tabBlogsBtn.addEventListener('click', () => {
        tabBlogsBtn.classList.add('active');
        tabProjectsBtn.classList.remove('active');
        blogsTabContent.style.display = 'block';
        projectsTabContent.style.display = 'none';
    });

    tabProjectsBtn.addEventListener('click', () => {
        tabProjectsBtn.classList.add('active');
        tabBlogsBtn.classList.remove('active');
        projectsTabContent.style.display = 'block';
        blogsTabContent.style.display = 'none';
    });
}

// =====================================================
// Add / Edit Project
// =====================================================
if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const project = {
            title: document.getElementById('project-title').value.trim(),
            date: document.getElementById('project-date').value.trim(),
            role: document.getElementById('project-role').value.trim(),
            category: document.getElementById('project-category').value,
            metric: document.getElementById('project-metric').value.trim(),
            icon: document.getElementById('project-icon').value,
            techStack: document.getElementById('project-tech').value.trim(),
            url: document.getElementById('project-url').value.trim(),
            demoUrl: document.getElementById('project-demoUrl').value.trim(),
            description: document.getElementById('project-description').value.trim(),
            detailedDescription: document.getElementById('project-detailedDescription').value.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (editingProjectId) {
                // Update existing project
                await db.collection('projects').doc(editingProjectId).update(project);
                showToast('Project updated successfully!');
            } else {
                // Add new project
                project.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('projects').add(project);
                showToast('Project added successfully!');
            }
            resetProjectForm();
            loadProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            showToast('Error saving project. Please try again.', 'error');
        }
    });
}

// =====================================================
// Load Projects from Firestore
// =====================================================
async function loadProjects() {
    if (!projectList) return;
    try {
        const snapshot = await db.collection('projects')
            .orderBy('createdAt', 'desc')
            .get();

        projectList.innerHTML = '';

        if (snapshot.empty) {
            projectList.innerHTML = `
                <div class="admin-empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                    <p>No projects yet. Add your first one above!</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const project = doc.data();
            const projectItem = createProjectListItem(doc.id, project);
            projectList.appendChild(projectItem);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        projectList.innerHTML = '<p class="admin-error">Error loading projects. Please refresh.</p>';
    }
}

// =====================================================
// Create Project List Item Element
// =====================================================
function createProjectListItem(id, project) {
    const item = document.createElement('div');
    item.className = 'admin-project-item';
    item.innerHTML = `
        <div class="admin-project-info">
            <h4 class="admin-project-title">${escapeHtml(project.title)}</h4>
            <p class="admin-project-meta">
                <span class="admin-project-category">${escapeHtml(project.category.toUpperCase())}</span>
                <span>${escapeHtml(project.role)}</span>
                <span>${escapeHtml(project.date)}</span>
            </p>
        </div>
        <div class="admin-project-actions">
            <button class="admin-btn admin-btn-edit" onclick="editProject('${id}')" title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
            </button>
            <button class="admin-btn admin-btn-delete" onclick="deleteProject('${id}')" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
            </button>
        </div>
    `;
    return item;
}

// =====================================================
// Edit Project
// =====================================================
window.editProject = async function(id) {
    try {
        const doc = await db.collection('projects').doc(id).get();
        if (!doc.exists) {
            showToast('Project not found.', 'error');
            return;
        }

        const project = doc.data();
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-date').value = project.date;
        document.getElementById('project-role').value = project.role;
        document.getElementById('project-category').value = project.category;
        document.getElementById('project-metric').value = project.metric || '';
        document.getElementById('project-icon').value = project.icon || 'chatbot';
        document.getElementById('project-tech').value = project.techStack || '';
        document.getElementById('project-url').value = project.url || '';
        document.getElementById('project-demoUrl').value = project.demoUrl || '';
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-detailedDescription').value = project.detailedDescription || project.description;

        editingProjectId = id;
        projectFormTitle.textContent = 'Edit Project';
        projectSubmitBtnText.textContent = 'Update Project';
        projectCancelEditBtn.style.display = 'inline-flex';

        // Scroll to form
        projectForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error loading project for edit:', error);
        showToast('Error loading project details.', 'error');
    }
}

// =====================================================
// Delete Project
// =====================================================
window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        await db.collection('projects').doc(id).delete();
        showToast('Project deleted.');
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
        showToast('Error deleting project.', 'error');
    }
}

// =====================================================
// Reset Project Form
// =====================================================
function resetProjectForm() {
    if (projectForm) projectForm.reset();
    editingProjectId = null;
    projectFormTitle.textContent = 'Add New Project';
    projectSubmitBtnText.textContent = 'Add Project';
    projectCancelEditBtn.style.display = 'none';
}

if (projectCancelEditBtn) {
    projectCancelEditBtn.addEventListener('click', resetProjectForm);
}

// =====================================================
// Utility Functions
// =====================================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getAuthErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        default:
            return 'Login failed. Please try again.';
    }
}

function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
