class TaskManager {
    constructor() {
        // 确保所有 DOM 元素都存在
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.currentTaskDisplay = document.getElementById('currentTask');

        if (!this.taskInput || !this.addTaskBtn || !this.tasksList || !this.currentTaskDisplay) {
            console.error('Required DOM elements not found');
            return;
        }

        // 初始化数据和实例
        this.tasks = [];
        this.confetti = new Confetti();
        this.pomodoroTimer = null;
        this.statistics = new Statistics();

        // 加载任务并设置事件监听
        this.loadTasks();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // 使用箭头函数确保 this 绑定正确
        this.addTaskBtn.addEventListener('click', () => {
            console.log('Add task button clicked');
            this.addTask();
        });

        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter key pressed');
                this.addTask();
            }
        });
    }

    setupDragAndDrop() {
        this.tasksList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            }
        });

        this.tasksList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
            }
        });

        this.tasksList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = this.tasksList.querySelector('.dragging');
            if (!draggingItem) return;

            const siblings = [...this.tasksList.querySelectorAll('.task-item:not(.dragging)')];
            const nextSibling = siblings.find(sibling => {
                const box = sibling.getBoundingClientRect();
                return e.clientY <= box.top + box.height / 2;
            });

            this.tasksList.insertBefore(draggingItem, nextSibling);
        });

        this.tasksList.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateTasksOrder();
        });
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('tasks');
            console.log('Loading saved tasks:', savedTasks);
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
            this.renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            console.log('Tasks saved successfully:', this.tasks);
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        console.log('Adding task:', taskText);
        
        if (taskText) {
            const task = {
                id: Date.now().toString(),
                text: taskText,
                completed: false,
                order: this.tasks.length
            };
            
            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
            this.taskInput.value = '';
            
            console.log('Task added successfully:', task);
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('编辑任务', task.text);
            if (newText && newText.trim()) {
                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
            }
        }
    }

    deleteTask(id) {
        if (confirm('确定要删除这个任务吗？')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            
            // 如果任务被标记为完成
            if (task.completed) {
                // 如果这是当前任务，清除当前任务显示
                if (this.currentTaskDisplay.textContent === task.text) {
                    this.currentTaskDisplay.textContent = '未选择任务';
                    // 如果计时器正在运行，停止它
                    if (this.pomodoroTimer && this.pomodoroTimer.isRunning) {
                        this.pomodoroTimer.reset();
                    }
                    // 移除当前任务的高亮
                    const taskElement = document.querySelector(`[data-id="${id}"]`);
                    if (taskElement) {
                        taskElement.classList.remove('current');
                    }
                }

                // 获取任务元素的位置并播放动画
                const taskElement = document.querySelector(`[data-id="${id}"]`);
                if (taskElement) {
                    const rect = taskElement.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    
                    // 播放完成动画
                    this.confetti.start(x, y);
                    setTimeout(() => this.confetti.stop(), 3000);
                }

                // 在 toggleTask 方法中添加统计记录
                this.statistics.recordTaskCompletion(task.id, task.text);
            }
            
            this.saveTasks();
            this.renderTasks();
        }
    }

    updateTasksOrder() {
        const taskElements = this.tasksList.querySelectorAll('.task-item');
        const newOrder = Array.from(taskElements).map((element, index) => {
            const taskId = element.dataset.id;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.order = index;
            }
            return task;
        });

        this.tasks = newOrder.filter(Boolean);
        this.saveTasks();
    }

    renderTasks() {
        try {
            this.tasksList.innerHTML = '';
            const currentTaskText = this.currentTaskDisplay.textContent;
            
            this.tasks
                .sort((a, b) => a.order - b.order)
                .forEach(task => {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item';
                    // 如果是当前任务，添加高亮类
                    if (task.text === currentTaskText) {
                        taskElement.classList.add('current');
                    }
                    taskElement.draggable = true;
                    taskElement.dataset.id = task.id;
                    
                    taskElement.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content ${task.completed ? 'completed' : ''}">${task.text}</div>
                        <div class="task-actions">
                            <button class="task-btn start" title="开始这个任务">▶</button>
                            <button class="task-btn edit" title="编辑任务">✎</button>
                            <button class="task-btn delete" title="删除任务">×</button>
                        </div>
                    `;

                    // 绑定事件
                    const checkbox = taskElement.querySelector('.task-checkbox');
                    const startBtn = taskElement.querySelector('.task-btn.start');
                    const editBtn = taskElement.querySelector('.task-btn.edit');
                    const deleteBtn = taskElement.querySelector('.task-btn.delete');

                    checkbox.addEventListener('change', () => this.toggleTask(task.id));
                    startBtn.addEventListener('click', () => this.startTask(task.id));
                    editBtn.addEventListener('click', () => this.editTask(task.id));
                    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

                    this.tasksList.appendChild(taskElement);
                });
            
            console.log('Tasks rendered successfully');
        } catch (error) {
            console.error('Error rendering tasks:', error);
        }
    }

    startTask(id) {
        console.log('Starting task:', id);
        const task = this.tasks.find(t => t.id === id);
        if (!task) {
            console.error('Task not found:', id);
            return;
        }
        
        if (task.completed) {
            console.log('Cannot start completed task:', task.text);
            return;
        }

        console.log('Updating current task display:', task.text);
        this.currentTaskDisplay.textContent = task.text;
        
        // 移除其他任务项的高亮
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('current');
        });
        
        // 给当前任务添加高亮
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('current');
            console.log('Task highlighted:', id);
        }
        
        // 启动计时器
        if (this.pomodoroTimer) {
            console.log('Starting pomodoro timer');
            this.pomodoroTimer.reset();
            this.pomodoroTimer.start();
        } else {
            console.error('Pomodoro timer not initialized');
        }
    }

    // 添加设置计时器的方法
    setPomodoroTimer(timer) {
        this.pomodoroTimer = timer;
    }
}