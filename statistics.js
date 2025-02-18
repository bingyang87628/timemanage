class Statistics {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const savedData = localStorage.getItem('pomodoro_statistics');
        return savedData ? JSON.parse(savedData) : {
            daily: {},  // 按天存储数据
            tasks: {},  // 任务统计
            timeDistribution: {} // 时间分布
        };
    }

    saveData() {
        localStorage.setItem('pomodoro_statistics', JSON.stringify(this.data));
    }

    // 记录一个完成的番茄钟
    recordPomodoro(taskId, taskName, duration) {
        const today = new Date().toISOString().split('T')[0];
        const hour = new Date().getHours();
        
        // 更新每日统计
        if (!this.data.daily[today]) {
            this.data.daily[today] = {
                pomodoroCount: 0,
                totalFocusTime: 0,
                completedTasks: new Set(),
                timeDistribution: Array(24).fill(0)
            };
        }
        
        this.data.daily[today].pomodoroCount++;
        this.data.daily[today].totalFocusTime += duration;
        this.data.daily[today].timeDistribution[hour]++;
        
        // 更新任务统计
        if (!this.data.tasks[taskId]) {
            this.data.tasks[taskId] = {
                name: taskName,
                totalPomodoros: 0,
                totalTime: 0,
                completionDates: []
            };
        }
        
        this.data.tasks[taskId].totalPomodoros++;
        this.data.tasks[taskId].totalTime += duration;
        
        this.saveData();
    }

    // 记录任务完成
    recordTaskCompletion(taskId, taskName) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.data.daily[today]) {
            this.data.daily[today].completedTasks = new Set();
        }
        
        this.data.daily[today].completedTasks.add(taskId);
        
        if (this.data.tasks[taskId]) {
            this.data.tasks[taskId].completionDates.push(today);
        }
        
        this.saveData();
    }

    // 获取今日统计
    getTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const stats = this.data.daily[today] || {
            pomodoroCount: 0,
            totalFocusTime: 0,
            completedTasks: new Set(),
            timeDistribution: Array(24).fill(0)
        };
        
        return {
            pomodoroCount: stats.pomodoroCount,
            totalFocusTime: Math.round(stats.totalFocusTime / 60), // 转换为分钟
            completedTasks: stats.completedTasks.size
        };
    }

    // 获取最近7天的数据
    getWeeklyStats() {
        const dates = Array(7).fill().map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        
        return dates.map(date => ({
            date,
            count: (this.data.daily[date]?.pomodoroCount || 0)
        }));
    }

    // 获取任务效率分析
    getTaskEfficiency() {
        return Object.values(this.data.tasks).map(task => ({
            name: task.name,
            totalTime: Math.round(task.totalTime / 60), // 转换为分钟
            pomodoros: task.totalPomodoros
        }));
    }

    // 获取时间分布数据
    getTimeDistribution() {
        const distribution = Array(24).fill(0);
        const today = new Date().toISOString().split('T')[0];
        
        if (this.data.daily[today]) {
            return this.data.daily[today].timeDistribution;
        }
        
        return distribution;
    }

    // 添加新的数据获取方法
    getWeeklyStatsDetailed() {
        const dates = Array(7).fill().map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        
        return dates.map(date => {
            const dayData = this.data.daily[date] || {
                pomodoroCount: 0,
                totalFocusTime: 0,
                completedTasks: new Set(),
                timeDistribution: Array(24).fill(0)
            };
            
            return {
                date,
                pomodoroCount: dayData.pomodoroCount,
                focusTime: Math.round((dayData.totalFocusTime || 0) / 60),
                completedTasks: dayData.completedTasks.size,
                timeDistribution: dayData.timeDistribution
            };
        });
    }

    // 获取最专注的时间段
    getMostProductiveHours() {
        const timeDistribution = Array(24).fill(0);
        const today = new Date().toISOString().split('T')[0];
        const weekData = this.getWeeklyStatsDetailed();
        
        weekData.forEach(day => {
            day.timeDistribution.forEach((count, hour) => {
                timeDistribution[hour] += count;
            });
        });
        
        const maxCount = Math.max(...timeDistribution);
        const productiveHours = timeDistribution
            .map((count, hour) => ({ hour, count }))
            .filter(({ count }) => count > maxCount * 0.7)
            .sort((a, b) => b.count - a.count);
            
        return productiveHours;
    }
}