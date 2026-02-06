/**
 * Core: GameManager
 * Base class managing generic game state (Score, Timer, Events).
 */
export class GameManager {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.gameStatus = 'IDLE'; // IDLE, PLAYING, ENDED
    }

    /**
     * Starts the game session.
     */
    start() {
        this.score = 0;
        this.streak = 0;
        this.gameStatus = 'PLAYING';
    }

    /**
     * Ends the game session.
     * @returns {Object} Final stats
     */
    end() {
        this.gameStatus = 'ENDED';
        return {
            score: this.score,
            streak: this.streak
        };
    }

    /**
     * Updates score logic.
     * @param {boolean} isCorrect 
     */
    updateScore(isCorrect) {
        if (isCorrect) {
            this.score += 10 + (this.streak * 2); // Bonus for streak
            this.streak++;
        } else {
            this.streak = 0;
        }
        return { score: this.score, streak: this.streak };
    }
}
