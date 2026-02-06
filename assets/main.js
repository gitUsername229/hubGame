import { countriesService } from './services/CountriesService.js';
import { GeoGame } from './engines/GeoGame.js';
import { ThemeManager } from './interface/ThemeManager.js';
import { ViewManager } from './interface/ViewManager.js';
import { GameRenderer } from './interface/GameRenderer.js';
import { vibrate } from './utils/helpers.js';

/**
 * Main Application Controller
 * Orchestrates interaction between Core, API, and UI.
 */
class MainApp {
    constructor() {
        this.themeManager = new ThemeManager();
        this.viewManager = new ViewManager();
        this.renderer = new GameRenderer();

        this.gameService = null; // Active Game Instance
        this.selectedMode = null; // 'flags' or 'capitals'

        this.currentAttempts = 0;
        this.isProcessing = false;
    }

    async init() {
        console.log("[MainApp] Initializing...");

        // Setup Global Listeners
        this.setupNavigation();

        // Pre-fetch data
        try {
            await countriesService.getAllCountries();
        } catch (e) {
            alert("Erreur critique: Impossible de charger les données.");
        }
    }

    setupNavigation() {
        // Expose functions to window for HTML onclicks (KISS for now, event listeners later)
        window.app = {
            showCategory: (id) => this.viewManager.show('categoryGeo'), // Simple mapping
            launchGame: (mode) => this.selectGameMode(mode),
            setDifficulty: (diff) => this.startGame(diff),
            goBack: () => this.viewManager.goBack(),
            restart: () => this.startGame(this.lastDifficulty) // Quick restart
        };
    }

    selectGameMode(mode) {
        this.selectedMode = mode;
        this.viewManager.show('difficulty');
    }

    async startGame(difficulty) {
        this.lastDifficulty = difficulty;
        this.viewManager.show('game');

        // Show Skeleton / Loading
        // (Assuming skeleton is inside game view, renderer could handle this toggle)

        const countries = await countriesService.getAllCountries();
        this.gameService = new GeoGame(countries, this.selectedMode, difficulty);
        this.gameService.start();

        this.startRound();
    }

    startRound() {
        if (!this.gameService.hasNextRound()) {
            this.endGame();
            return;
        }

        this.currentAttempts = 0;
        this.isProcessing = false;

        const roundData = this.gameService.nextRound();

        // Render
        this.renderer.updateStats(roundData.stats);
        this.renderer.renderRound(
            roundData,
            this.selectedMode,
            this.gameService.difficulty,
            (guess, el) => this.handleGuess(guess, el)
        );
    }

    handleGuess(guess, element) {
        if (this.isProcessing) return;

        // Hard Mode Retry Logic
        if (this.gameService.difficulty === 'hard') {
            const isCheckCorrect = this.gameService.checkGuess(guess);
            if (!isCheckCorrect && this.currentAttempts < 2) {
                this.currentAttempts++;
                this.renderer.showFeedback(element, false, null, 'hard', false, this.currentAttempts);
                vibrate([50, 50]);
                return;
            }
        }

        this.isProcessing = true;
        const result = this.gameService.submitGuess(guess);

        // Render Feedback
        this.renderer.showFeedback(
            element,
            result.isCorrect,
            result.correctName,
            this.gameService.difficulty,
            true, // isFinal
            3 // attempts used up
        );

        this.renderer.updateStats({ score: result.score, streak: result.streak });

        if (result.isCorrect) vibrate(50);
        else vibrate([50, 50, 50]);

        setTimeout(() => {
            this.startRound();
        }, 1500);
    }

    endGame() {
        const stats = this.gameService.end();
        this.renderer.showEndScreen(stats);
    }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
    const app = new MainApp();
    app.init();
});
