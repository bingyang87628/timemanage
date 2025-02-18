class StatisticsUI {
    constructor() {
        this.statistics = new Statistics();
        this.initializeCharts();
        this.updateTodayOverview();
    }

    updateTodayOverview() {
        const stats = this.statistics.getTodayStats();
        document.getElementById('todayPomodoros').textContent = stats.pomodoroCount;
        document.getElementById('todayFocusTime').textContent = `${stats.totalFocusTime}分钟`;
        document.getElementById('todayTasks').textContent = stats.completedTasks;
    }

    initializeCharts() {
        this.createWeeklyChart();
        this.createTaskEfficiencyChart();
        this.createTimeDistributionChart();
    }

    createWeeklyChart() {
        const data = this.statistics.getWeeklyStats();
        new Chart(document.getElementById('weeklyChart'), {
            type: 'bar',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: '完成的番茄钟数',
                    data: data.map(d => d.count),
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    createTaskEfficiencyChart() {
        const data = this.statistics.getTaskEfficiency();
        new Chart(document.getElementById('taskEfficiencyChart'), {
            type: 'horizontalBar',
            data: {
                labels: data.map(t => t.name),
                datasets: [{
                    label: '专注时间（分钟）',
                    data: data.map(t => t.totalTime),
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createTimeDistributionChart() {
        const data = this.statistics.getTimeDistribution();
        new Chart(document.getElementById('timeDistributionChart'), {
            type: 'line',
            data: {
                labels: Array(24).fill().map((_, i) => `${i}:00`),
                datasets: [{
                    label: '番茄钟数量',
                    data: data,
                    borderColor: '#e74c3c',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// 初始化统计界面
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsUI();
}); 