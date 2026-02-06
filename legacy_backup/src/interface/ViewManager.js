/**
 * UI: ViewManager
 * Handles navigation between different application screens.
 */
export class ViewManager {
    constructor() {
        this.views = {
            hub: document.getElementById('view-hub'),
            categoryGeo: document.getElementById('view-category-geo'),
            difficulty: document.getElementById('view-difficulty'),
            game: document.getElementById('view-game-container'),
            end: document.getElementById('game-over-screen'),
            nav: document.getElementById('global-nav'),
            backBtn: document.getElementById('btn-back')
        };

        this.history = [];
        this.currentViewId = 'hub';
    }

    /**
     * Switch to a specific view.
     * @param {string} viewId 
     * @param {boolean} addToHistory 
     */
    show(viewId, addToHistory = true) {
        // Hide all
        Object.values(this.views).forEach(el => {
            if (el && el.id !== 'global-nav' && el.id !== 'btn-back') {
                el.classList.add('hidden');
            }
        });

        // Show target
        const target = this.views[viewId];
        if (target) {
            target.classList.remove('hidden');
            // Add animation class if needed
            target.classList.remove('animate__fadeIn');
            void target.offsetWidth; // Reflow
            target.classList.add('animate__fadeIn');
        }

        // Manage History
        if (addToHistory && this.currentViewId !== viewId) {
            this.history.push(this.currentViewId);
        }
        this.currentViewId = viewId;

        // Manage Back Button
        this.updateBackButton();
    }

    goBack() {
        if (this.history.length === 0) return;
        const prev = this.history.pop();
        this.show(prev, false);
    }

    updateBackButton() {
        if (!this.views.backBtn) return;

        if (this.currentViewId === 'hub') {
            this.views.backBtn.classList.add('hidden');
            this.history = []; // Clear history on hub
        } else {
            this.views.backBtn.classList.remove('hidden');
        }
    }
}
