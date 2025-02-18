class PomodoroTimer {
    constructor() {
        // DOM 元素
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.statusDisplay = document.getElementById('status');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.timerCircle = document.querySelector('.timer-circle');
        this.alertSound = document.getElementById('alertSound');
        this.progressRing = document.querySelector('.progress-ring__circle');
        this.customTimeInput = document.getElementById('customTime');
        this.applyCustomTimeBtn = document.getElementById('applyCustomTime');

        // 进度条设置
        const circle = this.progressRing;
        this.circumference = circle.r.baseVal.value * 2 * Math.PI;
        circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        circle.style.strokeDashoffset = this.circumference;

        // 时间配置（秒）
        this.workTime = 25 * 60;
        this.breakTime = 5 * 60;
        
        // 状态变量
        this.currentTime = this.workTime;
        this.initialTime = this.workTime;
        this.isRunning = false;
        this.isWorkTime = true;
        this.timerId = null;

        // 绑定事件
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.applyCustomTimeBtn.addEventListener('click', () => this.setCustomTime());

        // 绑定预设时间按钮
        document.querySelectorAll('.time-preset').forEach(btn => {
            btn.addEventListener('click', () => this.setPresetTime(btn));
        });

        // 初始化显示
        this.updateDisplay();
        this.setInitialState();

        // 添加任务管理器引用
        this.taskManager = null;

        // 添加任务完成时的音效
        this.taskCompleteSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');

        // 在 constructor 中添加
        this.statistics = new Statistics();
    }

    setInitialState() {
        this.timerCircle.classList.add('work');
        document.body.classList.add('work-mode');
    }

    setProgress(percent) {
        const offset = this.circumference - (percent * this.circumference);
        this.progressRing.style.strokeDashoffset = offset;
    }

    setPresetTime(btn) {
        if (!this.isRunning) {
            document.querySelectorAll('.time-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const minutes = parseInt(btn.dataset.time);
            this.workTime = minutes * 60;
            this.currentTime = this.workTime;
            this.initialTime = this.workTime;
            this.updateDisplay();
            this.setProgress(1);
        }
    }

    setCustomTime() {
        if (!this.isRunning) {
            const minutes = parseInt(this.customTimeInput.value);
            if (minutes && minutes > 0 && minutes <= 120) {
                document.querySelectorAll('.time-preset').forEach(b => b.classList.remove('active'));
                this.workTime = minutes * 60;
                this.currentTime = this.workTime;
                this.initialTime = this.workTime;
                this.updateDisplay();
                this.setProgress(1);
            }
        }
    }

    start() {
        // 获取当前任务显示元素
        const currentTaskDisplay = document.getElementById('currentTask');
        const currentTask = currentTaskDisplay ? currentTaskDisplay.textContent : '未选择任务';
        
        // 检查是否有选择任务
        if (currentTask === '未选择任务') {
            alert('请先选择一个任务再开始计时！');
            return;
        }

        // 如果没有在运行，则开始计时
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timerCircle.classList.remove('paused');
            
            this.timerId = setInterval(() => {
                this.currentTime--;
                
                if (this.currentTime < 0) {
                    this.alertSound.play();
                    this.switchMode();
                }
                
                this.updateDisplay();
                this.setProgress(this.currentTime / this.initialTime);
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.timerCircle.classList.add('paused');
            clearInterval(this.timerId);
        }
    }

    reset() {
        this.pause();
        this.isWorkTime = true;
        this.currentTime = this.workTime;
        this.initialTime = this.workTime;
        this.updateDisplay();
        this.setProgress(1);
        this.timerCircle.classList.remove('break');
        this.timerCircle.classList.add('work');
        document.body.className = 'work-mode';
    }

    switchMode() {
        this.isWorkTime = !this.isWorkTime;
        this.currentTime = this.isWorkTime ? this.workTime : this.breakTime;
        this.initialTime = this.currentTime;
        
        this.timerCircle.classList.toggle('work');
        this.timerCircle.classList.toggle('break');
        document.body.className = this.isWorkTime ? 'work-mode' : 'break-mode';
        
        this.updateDisplay();
        this.setProgress(1);

        // 如果从工作模式切换到休息模式，且有当前任务，则标记任务为完成
        if (!this.isWorkTime && this.taskManager) {
            const currentTaskText = document.getElementById('currentTask').textContent;
            if (currentTaskText && currentTaskText !== '未选择任务') {
                const task = this.taskManager.tasks.find(t => t.text === currentTaskText);
                if (task && !task.completed) {
                    // 记录完成的番茄钟
                    this.statistics.recordPomodoro(task.id, task.text, this.workTime);
                    // 播放完成音效
                    this.taskCompleteSound.play();
                    this.taskManager.toggleTask(task.id);
                }
            }
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        this.statusDisplay.textContent = this.isWorkTime ? '工作时间' : '休息时间';
    }

    // 添加设置任务管理器的方法
    setTaskManager(taskManager) {
        this.taskManager = taskManager;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        // 检查必要的 DOM 元素
        const requiredElements = [
            'currentTask',
            'taskInput',
            'addTaskBtn',
            'tasksList'
        ];

        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                throw new Error(`Required element #${elementId} not found`);
            }
        }

        // 按正确顺序创建实例
        const statistics = new Statistics();
        const pomodoroTimer = new PomodoroTimer();
        const taskManager = new TaskManager();
        
        // 建立双向引用
        pomodoroTimer.setTaskManager(taskManager);
        taskManager.setPomodoroTimer(pomodoroTimer);
        
        // 初始化任务显示
        const currentTaskDisplay = document.getElementById('currentTask');
        if (currentTaskDisplay) {
            currentTaskDisplay.textContent = '未选择任务';
        }

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
}); 