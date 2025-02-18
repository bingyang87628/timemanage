class StatisticsUI {
    constructor() {
        this.statistics = new Statistics();
        this.initializeCharts();
        this.updateTodayOverview();
        this.initializeDataActions();
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

    initializeDataActions() {
        // 导出按钮
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => {
            this.statistics.exportData();
        });

        // 导入文件处理
        const importFile = document.getElementById('importFile');
        importFile.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const success = await this.statistics.importData(file);
                
                if (success) {
                    alert('数据导入成功！');
                    // 刷新图表和统计
                    this.initializeCharts();
                    this.updateTodayOverview();
                } else {
                    alert('数据导入失败，请检查文件格式是否正确。');
                }
                
                // 清除文件选择
                e.target.value = '';
            }
        });
    }
}

// 初始化统计界面
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsUI();
}); 