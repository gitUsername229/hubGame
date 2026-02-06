/**
 * UI: ThemeManager
 * Handles Light/Dark mode toggling.
 */
export class ThemeManager {
    constructor() {
        this.themeKey = 'hubgame-theme';
        this.btn = document.getElementById('theme-toggle');
        this.iconSun = document.getElementById('icon-sun');
        this.iconMoon = document.getElementById('icon-moon');

        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
        this.applyTheme(savedTheme);

        if (this.btn) {
            this.btn.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        const isDark = !document.documentElement.classList.contains('theme-light');
        const newTheme = isDark ? 'light' : 'dark';
        this.applyTheme(newTheme);
        localStorage.setItem(this.themeKey, newTheme);
    }

    applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.classList.add('theme-light');
            if (this.iconSun) this.iconSun.classList.remove('hidden');
            if (this.iconMoon) this.iconMoon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('theme-light');
            if (this.iconSun) this.iconSun.classList.add('hidden');
            if (this.iconMoon) this.iconMoon.classList.remove('hidden');
        }
    }
}
