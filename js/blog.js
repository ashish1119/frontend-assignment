// Blog Manager JavaScript
// This file handles all blog functionality including CRUD operations and LocalStorage

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentView = 'list'; // 'list', 'create', 'edit', 'view'
        this.currentPostId = null;
        this.init();
    }

    // Initialize the app
    init() {
        this.loadPosts();
        this.renderPostsList();
        this.updateStats();
        this.bindEvents();
        this.showPostsList();
    }

    // Bind all event listeners
    bindEvents() {
        // Navigation buttons
        const newPostBtn = document.getElementById('newPostBtn');
        const backToListBtn = document.getElementById('backToListBtn');

        newPostBtn?.addEventListener('click', () => {
            this.showCreateForm();
        });

        backToListBtn?.addEventListener('click', () => {
            this.showPostsList();
        });

        // Blog post form submission
        const blogForm = document.getElementById('blogForm');
        blogForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('input', (e) => {
            this.renderPostsList(e.target.value.trim());
        });

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.showPostsList();
        }
    }

    // Handle form submission for both create and edit
    handleFormSubmission() {
        const title = document.getElementById('postTitle').value.trim();
        const content = document.getElementById('postContent').value.trim();
        const tags = document.getElementById('postTags').value.trim();
        const tagsArr = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const excerpt = this.generateExcerpt(content);

        if (!title || !content) {
            this.showNotification('Title and content are required!', 'warning');
            return;
        }

        if (this.currentView === 'edit' && this.currentPostId) {
            this.updatePost(this.currentPostId, title, content, tagsArr, excerpt);
        } else {
            this.createPost(title, content, tagsArr, excerpt);
        }
    }

    // Create a new blog post
    createPost(title, content, tags, excerpt) {
        const newPost = {
            id: Date.now().toString(),
            title,
            content,
            tags,
            excerpt,
            createdAt: new Date().toISOString()
        };
        this.posts.unshift(newPost);      // Add to posts array
        this.savePosts();                 // Save to localStorage
        this.renderPostsList();           // Render the updated list
        this.updateStats();               // Update stats
        this.showPostsList();             // Switch to list view
        this.showNotification('Post created!', 'success');
    }

    // Update an existing blog post
    updatePost(id, title, content, tags, excerpt) {
        const idx = this.posts.findIndex(p => p.id === id);
        if (idx > -1) {
            this.posts[idx] = {
                ...this.posts[idx],
                title,
                content,
                tags,
                excerpt
            };
            this.savePosts();
            this.renderPostsList();
            this.updateStats();
            this.showPostsList();
            this.showNotification('Post updated!', 'success');
        }
    }

    // Delete a blog post
    deletePost(id) {
        const idx = this.posts.findIndex(p => p.id === id);
        if (idx > -1) {
            if (confirm(`Delete "${this.posts[idx].title}"?`)) {
                this.posts.splice(idx, 1);
                this.savePosts();
                this.renderPostsList();
                this.updateStats();
                this.showPostsList();
                this.showNotification('Post deleted!', 'warning');
            }
        }
    }

    // Show the posts list view
    showPostsList() {
        this.currentView = 'list';
        document.getElementById('formView').style.display = 'none';
        document.getElementById('listView').style.display = 'block';
        document.getElementById('postView').style.display = 'none';
    }

    // Show the create post form
    showCreateForm() {
        this.currentView = 'create';
        document.getElementById('formView').style.display = 'block';
        document.getElementById('listView').style.display = 'none';
        document.getElementById('postView').style.display = 'none';
        document.getElementById('blogForm').reset();
        document.getElementById('form-title').textContent = 'Create New Post';
        document.getElementById('edit-post-id').value = '';
    }

    // Show the edit post form
    showEditForm(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;
        this.currentView = 'edit';
        this.currentPostId = id;
        document.getElementById('formView').style.display = 'block';
        document.getElementById('listView').style.display = 'none';
        document.getElementById('postView').style.display = 'none';
        document.getElementById('form-title').textContent = 'Edit Post';
        document.getElementById('edit-post-id').value = id;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postTags').value = post.tags.join(', ');
    }

    // Show individual post view
    showPostView(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;
        this.currentView = 'view';
        document.getElementById('formView').style.display = 'none';
        document.getElementById('listView').style.display = 'none';
        document.getElementById('postView').style.display = 'block';

        const container = document.getElementById('postViewContainer');
        container.innerHTML = `
            <div class="post-view-card">
                <h2>${this.escapeHtml(post.title)}</h2>
                <div class="post-meta">
                    <span>${this.formatDate(post.createdAt)}</span>
                    ${post.tags.length ? `<span class="post-tags">${post.tags.map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join(' ')}</span>` : ''}
                </div>
                <div class="post-content">${this.formatContent(post.content)}</div>
                <div class="post-actions">
                    <button class="btn btn-primary" onclick="blogManager.showEditForm('${post.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger" onclick="blogManager.deletePost('${post.id}')"><i class="fas fa-trash"></i> Delete</button>
                    <button class="btn btn-secondary" onclick="blogManager.showPostsList()"><i class="fas fa-arrow-left"></i> Back</button>
                </div>
            </div>
        `;
    }

    // Render the posts list
    renderPostsList(searchQuery = '') {
        const postsList = document.getElementById('posts-list');
        const emptyState = document.getElementById('empty-state');
        let filtered = this.posts;
        if (searchQuery) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        if (filtered.length === 0) {
            postsList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        postsList.innerHTML = filtered.map(post => this.createPostCardHTML(post)).join('');
    }

    // Create HTML for a single post card
    createPostCardHTML(post) {
        return `
            <div class="col post-card">
                <div class="card">
                    <div class="card-body">
                        <h4 class="card-title">${this.escapeHtml(post.title)}</h4>
                        <div class="card-meta">
                            <span>${this.formatDate(post.createdAt)}</span>
                            ${post.tags.length ? `<span class="post-tags">${post.tags.map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join(' ')}</span>` : ''}
                        </div>
                        <p class="card-text">${this.escapeHtml(post.excerpt)}</p>
                        <div class="card-actions">
                            <button class="btn btn-info" onclick="blogManager.showPostView('${post.id}')"><i class="fas fa-book-open"></i> Read</button>
                            <button class="btn btn-primary" onclick="blogManager.showEditForm('${post.id}')"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-danger" onclick="blogManager.deletePost('${post.id}')"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Update statistics
    updateStats() {
        document.getElementById('totalPosts').textContent = this.posts.length;
        const totalWords = this.posts.reduce((sum, post) => sum + this.countWords(post.content), 0);
        document.getElementById('totalWords').textContent = totalWords;
    }

    // Utility functions
    savePosts() {
        localStorage.setItem('blog-posts', JSON.stringify(this.posts));
    }
    loadPosts() {
        const data = localStorage.getItem('blog-posts');
        this.posts = data ? JSON.parse(data) : [];
    }
    generateExcerpt(content, maxLength = 150) {
        if (!content) return '';
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    formatContent(content) {
        return this.escapeHtml(content).replace(/\n/g, '<br>');
    }
    countWords(text) {
        return text ? text.trim().split(/\s+/).length : 0;
    }
    showNotification(message, type = 'info') {
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = 9999;
            document.body.appendChild(notification);
        }
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        notification.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }
}

// Initialize the Blog Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogManager;
}