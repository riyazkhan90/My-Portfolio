// Blog Page — Dynamic Rendering from Firestore
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
});

async function loadBlogPosts() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    // Show loading state
    blogGrid.innerHTML = `
        <div class="blog-loading">
            <div class="blog-loading-spinner"></div>
            <p>Loading articles...</p>
        </div>`;

    try {
        const snapshot = await db.collection('blogs')
            .orderBy('date', 'desc')
            .get();

        blogGrid.innerHTML = '';

        if (snapshot.empty) {
            blogGrid.innerHTML = `
                <div class="blog-empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <h3>No Articles Yet</h3>
                    <p>Blog posts will appear here once published. Stay tuned!</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const blog = doc.data();
            const card = createBlogCard(blog);
            blogGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogGrid.innerHTML = `
            <div class="blog-empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Unable to Load Articles</h3>
                <p>Please check back later or visit my LinkedIn for the latest articles.</p>
            </div>`;
    }
}

function createBlogCard(blog) {
    const card = document.createElement('a');
    card.href = blog.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'blog-card';

    const formattedDate = formatBlogDate(blog.date);

    card.innerHTML = `
        <div class="blog-card-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            LinkedIn Article
        </div>
        <div class="blog-card-content">
            <span class="blog-card-date">${escapeHtmlBlog(formattedDate)}</span>
            <h3 class="blog-card-title">${escapeHtmlBlog(blog.title)}</h3>
            <p class="blog-card-excerpt">${escapeHtmlBlog(blog.description)}</p>
        </div>
        <div class="blog-card-footer">
            <span class="blog-card-read">Read on LinkedIn →</span>
        </div>
    `;

    return card;
}

function formatBlogDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtmlBlog(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
