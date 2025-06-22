// Todo Manager JavaScript
// This file handles all todo functionality including CRUD operations and LocalStorage

class TodoManager {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.init();
    }

    // Initialize the app
    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    // Bind all event listeners
    bindEvents() {
        // Add new todo
        const todoForm = document.getElementById('todo-form');
        const todoInput = document.getElementById('todo-input');
        const prioritySelect = document.getElementById('priority');
        const dueDateInput = document.getElementById('due-date');

        todoForm?.addEventListener('submit', (e) => {
            e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            this.addTodo(
                text, 
                prioritySelect.value, 
                dueDateInput.value
            );
            todoForm.reset();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed todos
        const clearBtn = document.getElementById('clearCompleted');
        clearBtn?.addEventListener('click', () => {
            this.clearCompleted();
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('input', (e) => {
            this.searchTodos(e.target.value);
        });
    }

    // Add a new todo
    addTodo(text, priority = 'medium', dueDate = '') {
        const todo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo); // Add to beginning of array
        this.saveTodos();
        this.render();
        this.updateStats();

        // Show success feedback
        this.showNotification('Todo added successfully!', 'success');
    }

    // Toggle todo completion status
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateStats();

            const message = todo.completed ? 'Todo completed!' : 'Todo marked as pending';
            this.showNotification(message, 'info');
        }
    }

    // Delete a todo
    deleteTodo(id) {
        const todoIndex = this.todos.findIndex(t => t.id === id);
        if (todoIndex > -1) {
            this.todos.splice(todoIndex, 1);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification('Todo deleted!', 'warning');
        }
    }

    // Edit a todo
    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveTodos();
            this.render();
            this.showNotification('Todo updated!', 'success');
        }
    }

    // Set current filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    // Get filtered todos
    getFilteredTodos() {
        let filtered = [...this.todos];

        // Apply completion filter
        switch (this.currentFilter) {
            case 'pending':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
            case 'all':
            default:
                // No filter needed
                break;
        }

        return filtered;
    }

    // Search todos
    searchTodos(query) {
        const todoItems = document.querySelectorAll('.todo-item');
        const searchQuery = query.toLowerCase();

        todoItems.forEach(item => {
            const todoText = item.querySelector('.todo-text').textContent.toLowerCase();
            const shouldShow = todoText.includes(searchQuery);
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    // Clear all completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed todos to clear!', 'info');
            return;
        }

        if (confirm(`Delete ${completedCount} completed todo(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification(`${completedCount} completed todos cleared!`, 'success');
        }
    }

    // Render todos to the DOM
    render() {
        const todoList = document.getElementById('todo-list');
        const emptyState = document.getElementById('empty-state');
        if (!todoList) return;

        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        if (emptyState) emptyState.style.display = 'none';

        // Bind individual todo events
        this.bindTodoEvents();
    }

    // Create HTML for a single todo
    createTodoHTML(todo) {
        const priorityColors = {
            high: 'danger',
            medium: 'warning',
            low: 'success'
        };

        const priorityColor = priorityColors[todo.priority] || 'secondary';
        const completedClass = todo.completed ? 'completed' : '';
        const dueDateDisplay = todo.dueDate ? this.formatDate(todo.dueDate) : '';

        return `
            <div class="todo-item ${completedClass}" data-id="${todo.id}">
                <div class="d-flex align-items-center">
                    <input type="checkbox" class="form-check-input me-3 todo-checkbox" 
                           ${todo.completed ? 'checked' : ''}>
                    
                    <div class="flex-grow-1">
                        <div class="todo-text ${todo.completed ? 'text-decoration-line-through text-muted' : ''}"
                             contenteditable="false">${this.escapeHtml(todo.text)}</div>
                        
                        <div class="todo-meta">
                            <span class="badge bg-${priorityColor} me-2">${todo.priority}</span>
                            ${dueDateDisplay ? `<small class="text-muted"><i class="fas fa-calendar"></i> ${dueDateDisplay}</small>` : ''}
                        </div>
                    </div>
                    
                    <div class="todo-actions">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-btn" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Bind events for individual todo items
    bindTodoEvents() {
        // Toggle completion
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoId = e.target.closest('.todo-item').dataset.id;
                this.toggleTodo(todoId);
            });
        });

        // Delete todo
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoId = e.target.closest('.todo-item').dataset.id;
                if (confirm('Delete this todo?')) {
                    this.deleteTodo(todoId);
                }
            });
        });

        // Edit todo
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                const todoText = todoItem.querySelector('.todo-text');
                const isEditing = todoText.contentEditable === 'true';

                if (isEditing) {
                    // Save edit
                    const newText = todoText.textContent.trim();
                    if (newText) {
                        this.editTodo(todoItem.dataset.id, newText);
                    }
                    todoText.contentEditable = 'false';
                    e.target.innerHTML = '<i class="fas fa-edit"></i>';
                } else {
                    // Start editing
                    todoText.contentEditable = 'true';
                    todoText.focus();
                    e.target.innerHTML = '<i class="fas fa-save"></i>';
                    
                    // Save on Enter, cancel on Escape
                    const handleKeyPress = (event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            btn.click();
                            todoText.removeEventListener('keypress', handleKeyPress);
                        } else if (event.key === 'Escape') {
                            todoText.contentEditable = 'false';
                            e.target.innerHTML = '<i class="fas fa-edit"></i>';
                            this.render(); // Reset to original text
                            todoText.removeEventListener('keypress', handleKeyPress);
                        }
                    };
                    todoText.addEventListener('keypress', handleKeyPress);
                }
            });
        });
    }

    // Update statistics
    updateStats() {
        const totalTodos = this.todos.length;
        const completedTodos = this.todos.filter(t => t.completed).length;

        // Update stats display
        const totalElement = document.getElementById('total-tasks');
        const completedElement = document.getElementById('completed-tasks');

        if (totalElement) totalElement.textContent = `${totalTodos} tasks`;
        if (completedElement) completedElement.textContent = `${completedTodos} completed`;
    }

    // Save todos to localStorage
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Error saving todos:', error);
            this.showNotification('Error saving todos!', 'danger');
        }
    }

    // Load todos from localStorage
    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'position-fixed top-0 end-0 p-3';
            notification.style.zIndex = '9999';
            document.body.appendChild(notification);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        notification.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }
}

// Initialize the Todo Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoManager = new TodoManager();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoManager;
}