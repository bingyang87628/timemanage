class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // 设置初始主题
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // 绑定主题切换按钮事件
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.setTheme(theme);
            });
        });

        // 高亮当前主题按钮
        this.updateActiveButton();
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateActiveButton();
    }

    updateActiveButton() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
}); 