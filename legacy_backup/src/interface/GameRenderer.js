import { animateValue } from '../utils/helpers.js';

/**
 * UI: GameRenderer
 * Handles DOM manipulation during gameplay.
 */
export class GameRenderer {
    constructor() {
        this.els = {
            score: document.getElementById('score-display'),
            streak: document.getElementById('streak-display'),
            progress: document.getElementById('progress-bar'),
            currentCount: document.getElementById('current-count'),
            totalCount: document.getElementById('total-count'),
            title: document.getElementById('game-title-indicator'),

            // Containers
            flagContainer: document.getElementById('question-flag-container'),
            textContainer: document.getElementById('question-text-container'),
            optionsGrid: document.getElementById('options-grid'),

            // Specifics
            flagImg: document.getElementById('flag-img'),
            flagLoader: document.getElementById('flag-loader'),
            countryName: document.getElementById('country-name-display'),

            // End Screen
            finalScore: document.getElementById('final-score'),
            finalStreak: document.getElementById('final-streak'),
            endScreen: document.getElementById('game-over-screen')
        };
    }

    reset() {
        this.els.score.textContent = '0';
        this.els.streak.textContent = '0';
        this.els.progress.style.width = '0%';
        this.els.optionsGrid.innerHTML = '';
        this.els.endScreen.classList.add('hidden');
    }

    updateStats(stats) {
        animateValue(this.els.score, parseInt(this.els.score.textContent) || 0, stats.score, 500);
        this.els.streak.textContent = stats.streak;

        if (stats.currentIdx !== undefined && stats.total) {
            this.els.currentCount.textContent = stats.currentIdx;
            this.els.totalCount.textContent = stats.total;
            const pct = ((stats.currentIdx - 1) / stats.total) * 100;
            this.els.progress.style.width = `${pct}%`;
        }
    }

    renderRound(roundData, mode, difficulty, onGuessCallback) {
        // 1. Setup Question Area
        if (mode === 'flags') {
            this.els.title.textContent = "Drapeaux";
            this.els.flagContainer.classList.remove('hidden');
            this.els.textContainer.classList.add('hidden'); // Simplified for Flags mode (only visual)
            this._loadFlag(roundData.country.flag);
        } else if (mode === 'capitals') {
            this.els.title.textContent = "Capitales";
            this.els.flagContainer.classList.remove('hidden'); // Show flag as hint
            this.els.textContainer.classList.remove('hidden');
            this.els.countryName.textContent = roundData.country.name;
            this._loadFlag(roundData.country.flag);
        }

        // 2. Setup Input Area
        this.els.optionsGrid.innerHTML = '';
        this.els.optionsGrid.className = 'p-6 bg-black/40 backdrop-blur-md border-t border-white/5';

        // Use clean selector for clearing old feedbacks
        const oldFeedbacksP8 = document.querySelectorAll('#game-ui > div.p-8 > .bg-red-500\\/20');
        const oldFeedbacksText = document.querySelectorAll('#question-text-container > .bg-red-500\\/20');
        oldFeedbacksP8.forEach(el => el.remove());
        oldFeedbacksText.forEach(el => el.remove());

        if (difficulty === 'easy') {
            this._renderButtons(roundData.options, onGuessCallback);
        } else {
            this._renderInput(onGuessCallback);
        }
    }

    _loadFlag(url) {
        const img = this.els.flagImg;
        const loader = this.els.flagLoader;

        img.classList.add('opacity-0', 'scale-95');
        loader.classList.remove('hidden');

        // Preload
        const temp = new Image();
        temp.src = url;
        temp.onload = () => {
            img.src = url;
            loader.classList.add('hidden');
            img.classList.remove('opacity-0', 'scale-95');
            img.classList.add('scale-100');
        };
    }

    _renderButtons(options, onGuess) {
        this.els.optionsGrid.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-3');
        this.els.optionsGrid.classList.remove('flex', 'flex-col');

        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `btn-glass w-full py-4 px-6 rounded-xl text-left text-lg font-semibold flex items-center justify-between group hover:bg-white/10 animate__animated animate__fadeInUp animate__faster`;
            btn.style.animationDelay = `${idx * 50}ms`;

            btn.innerHTML = `
                <span class="truncate mr-2">${opt.name}</span> <!-- Always show Name in buttons -->
                <div class="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">➜</div>
            `;

            btn.addEventListener('click', () => onGuess(opt, btn));
            this.els.optionsGrid.appendChild(btn);
        });
    }

    _renderInput(onGuess) {
        this.els.optionsGrid.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
        this.els.optionsGrid.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2');

        // Hearts Container
        const hearts = document.createElement('div');
        hearts.id = 'hearts-container';
        hearts.className = "flex space-x-2 mb-4";
        hearts.innerHTML = `
            <span class="text-2xl text-red-500 animate__animated animate__heartBeat">❤️</span>
            <span class="text-2xl text-red-500 animate__animated animate__heartBeat" style="animation-delay: 100ms">❤️</span>
            <span class="text-2xl text-red-500 animate__animated animate__heartBeat" style="animation-delay: 200ms">❤️</span>
        `;
        this.els.optionsGrid.appendChild(hearts);

        // Input
        const container = document.createElement('div');
        container.className = "w-full max-w-md relative";

        const input = document.createElement('input');
        input.type = "text";
        input.className = "w-full bg-white/10 border-2 border-white/20 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all text-lg font-medium shadow-inner";
        input.placeholder = "Tapez votre réponse...";

        const btn = document.createElement('button');
        btn.className = "absolute right-2 top-2 bottom-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 font-bold transition-colors shadow-lg";
        btn.innerHTML = "➜";

        const submit = () => {
            if (input.value.trim() === '') return;
            onGuess(input.value.trim(), input);
        };

        btn.addEventListener('click', submit);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') submit(); });

        container.appendChild(input);
        container.appendChild(btn);
        this.els.optionsGrid.appendChild(container);

        if (window.innerWidth > 768) setTimeout(() => input.focus(), 100);
    }

    showFeedback(targetEl, isCorrect, correctName, difficulty, isFinal, attemptsUsed = 0) {
        if (difficulty === 'easy') {
            this._showButtonFeedback(targetEl, isCorrect, correctName);
        } else {
            this._showInputFeedback(targetEl, isCorrect, correctName, isFinal, attemptsUsed);
        }
    }

    _showButtonFeedback(btn, isCorrect, correctName) {
        const iconDiv = btn.querySelector('div');
        if (isCorrect) {
            btn.className = 'btn-glass w-full py-4 px-6 rounded-xl text-left text-lg font-bold flex items-center justify-between !bg-emerald-500/80 !border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] text-white transform scale-[1.02] transition-all z-10';
            iconDiv.innerHTML = '✓';
        } else {
            btn.className = 'btn-glass w-full py-4 px-6 rounded-xl text-left text-lg font-medium flex items-center justify-between !bg-red-500/80 !border-red-400 text-white animate__animated animate__shakeX z-10';
            iconDiv.innerHTML = '✗';

            // Highlight correct one logic would go here if we had access to other buttons easily
            // For now, KISS
        }
    }

    _showInputFeedback(input, isCorrect, correctName, isFinal, attemptsUsed) {
        if (isCorrect) {
            input.disabled = true;
            input.className = "w-full bg-green-500/20 border-2 border-green-500 rounded-xl px-5 py-4 text-white font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]";
        } else {
            if (!isFinal) {
                // Retry
                input.className = "w-full bg-red-500/10 border-2 border-red-500 rounded-xl px-5 py-4 text-white font-medium animate__animated animate__shakeX";
                input.value = "";
                input.placeholder = "Essayez encore !";
                input.focus();

                // Remove Heart
                const hearts = document.getElementById('hearts-container');
                if (hearts) {
                    const idx = 3 - attemptsUsed;
                    if (hearts.children[idx]) {
                        hearts.children[idx].classList.remove('animate__heartBeat');
                        hearts.children[idx].classList.add('animate__fadeOutUp');
                        hearts.children[idx].style.opacity = '0';
                    }
                }
            } else {
                // Final
                input.disabled = true;
                input.className = "w-full bg-red-500/20 border-2 border-red-500 rounded-xl px-5 py-4 text-white font-medium animate__animated animate__shakeX";

                // Show Answer BELOW name
                const textContainer = this.els.textContainer;
                if (textContainer) {
                    const feedback = document.createElement('div');
                    feedback.className = "mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-center animate__animated animate__jackInTheBox shadow-2xl backdrop-blur-md";
                    feedback.innerHTML = `
                        <div class="text-xs text-red-200 uppercase font-bold tracking-widest mb-1">Dommage !</div>
                        <div class="text-xl text-white">La réponse était :</div>
                        <div class="text-3xl font-black text-yellow-400 drop-shadow-md mt-1">${correctName}</div>
                    `;
                    textContainer.appendChild(feedback);
                }
                const hearts = document.getElementById('hearts-container');
                if (hearts) hearts.innerHTML = '';
            }
        }
    }

    showEndScreen(stats) {
        this.els.finalScore.textContent = stats.score;
        this.els.finalStreak.textContent = stats.streak;
        this.els.endScreen.classList.remove('hidden');
        this.els.endScreen.classList.add('animate__zoomIn');
    }
}
