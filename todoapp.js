/* script.js */
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.editingTaskId = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    bindEvents() {
        // Task form submission
        document.getElementById('task-form').addEventListener('submit', this.handleAddTask.bind(this));
        
        // Edit form submission
        document.getElementById('edit-form').addEventListener('submit', this.handleEditTask.bind(this));
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', this.handleFilterChange.bind(this));
        });
        
        // Sort selection
        document.getElementById('sort-select').addEventListener('change', this.handleSortChange.bind(this));
        
        // Modal controls
        document.getElementById('close-modal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('cancel-edit').addEventListener('click', this.closeModal.bind(this));
        
        // Close modal on outside click
        document.getElementById('edit-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-modal') {
                this.closeModal();
            }
        });
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const date = document.getElementById('task-date').value;
        const time = document.getElementById('task-time').value;
        const priority = document.getElementById('task-priority').value;
        
        if (!title) return;
        
        const task = {
            id: Date.now(),
            title,
            description,
            date,
            time,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.resetForm();
    }

    handleEditTask(e) {
        e.preventDefault();
        
        const title = document.getElementById('edit-title').value.trim();
        const description = document.getElementById('edit-description').value.trim();
        const date = document.getElementById('edit-date').value;
        const time = document.getElementById('edit-time').value;
        const priority = document.getElementById('edit-priority').value;
        
        if (!title) return;
        
        const taskIndex = this.tasks.findIndex(task => task.id === this.editingTaskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title,
                description,
                date,
                time,
                priority
            };
            
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.closeModal();
        }
    }

    handleFilterChange(e) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentFilter = e.target.getAttribute('data-filter');
        this.renderTasks();
    }

    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.renderTasks();
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            
            document.getElementById('edit-title').value = task.title;
            document.getElementById('edit-description').value = task.description;
            document.getElementById('edit-date').value = task.date;
            document.getElementById('edit-time').value = task.time;
            document.getElementById('edit-priority').value = task.priority;
            
            this.openModal();
        }
    }

    openModal() {
        document.getElementById('edit-modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('edit-modal').style.display = 'none';
        this.editingTaskId = null;
    }

    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        switch (this.currentFilter) {
            case 'pending':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            case 'overdue':
                filteredTasks = filteredTasks.filter(task => 
                    !task.completed && this.isOverdue(task)
                );
                break;
        }
        
        return this.sortTasks(filteredTasks);
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'date':
                    const dateA = new Date(a.date || '9999-12-31');
                    const dateB = new Date(b.date || '9999-12-31');
                    return dateA - dateB;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    isOverdue(task) {
        if (!task.date) return false;
        
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return taskDate < today;
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatTime(timeStr) {
        if (!timeStr) return '';
        
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    renderTasks() {
        const container = document.getElementById('tasks-container');
        const tasks = this.getFilteredTasks();
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Add a new task to get started!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${this.isOverdue(task) && !task.completed ? 'overdue' : ''}">
                <div class="task-header">
                    <div>
                        <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="action-btn btn-complete" onclick="todoApp.toggleTask(${task.id})">
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button class="action-btn btn-edit" onclick="todoApp.editTask(${task.id})">
                            Edit
                        </button>
                        <button class="action-btn btn-delete" onclick="todoApp.deleteTask(${task.id})">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="task-meta">
                    <div class="task-datetime">
                        ${task.date ? `<span>📅 ${this.formatDate(task.date)}</span>` : ''}
                        ${task.time ? `<span>🕐 ${this.formatTime(task.time)}</span>` : ''}
                    </div>
                    <div class="priority-badge priority-${task.priority}">
                        ${task.priority}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        document.getElementById('total-tasks').textContent = total;
        document.getElementById('pending-tasks').textContent = pending;
        document.getElementById('completed-tasks').textContent = completed;
    }

    resetForm() {
        document.getElementById('task-form').reset();
    }

    saveTasks() {
        // In a real app, this would save to a database
        // For now, we'll use localStorage
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }
}

// Initialize the app
const todoApp = new TodoApp();