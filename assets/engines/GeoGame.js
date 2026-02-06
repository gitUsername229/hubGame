import { GameManager } from './GameManager.js';
import { shuffleArray, normalizeString } from '../utils/helpers.js';

/**
 * Core: GeoGame
 * Manages logic for Geography games (Flags, Capitals).
 * Extends GameManager.
 */
export class GeoGame extends GameManager {
    /**
     * @param {Array} allCountries 
     * @param {string} mode 'flags' or 'capitals'
     * @param {string} difficulty 'easy' or 'hard'
     */
    constructor(allCountries, mode = 'flags', difficulty = 'easy') {
        super();
        this.allCountries = allCountries;
        this.mode = mode;
        this.difficulty = difficulty;

        this.roundCount = 0;
        this.maxRounds = 20;
        this.deck = [];
        this.currentRound = null;
    }

    start() {
        super.start();
        this.roundCount = 0;
        // Shuffle and pick subset for the game
        this.deck = shuffleArray([...this.allCountries]).slice(0, this.maxRounds);
    }

    hasNextRound() {
        return this.roundCount < this.maxRounds;
    }

    nextRound() {
        if (!this.hasNextRound()) return null;

        const correctCountry = this.deck[this.roundCount];
        this.roundCount++;

        // Generate Options (distractors) if Easy mode
        let options = [];
        if (this.difficulty === 'easy') {
            const distractors = shuffleArray(
                this.allCountries.filter(c => c.name !== correctCountry.name)
            ).slice(0, 3);

            options = shuffleArray([correctCountry, ...distractors]);
        }

        this.currentRound = {
            country: correctCountry,
            options: options,
            stats: {
                currentIdx: this.roundCount,
                total: this.maxRounds,
                score: this.score,
                streak: this.streak
            }
        };

        return this.currentRound;
    }

    /**
     * Checks the player's guess.
     * @param {string|Object} guess User input or selected option object
     * @returns {boolean} True if correct
     */
    checkGuess(guess) {
        if (!this.currentRound) return false;

        const target = this.currentRound.country;
        let isCorrect = false;

        if (this.difficulty === 'easy') {
            // guess is an option object
            isCorrect = (guess.name === target.name);
        } else {
            // guess is a string (Hard mode)
            const input = normalizeString(guess);
            let answer = "";

            if (this.mode === 'flags') {
                answer = normalizeString(target.name);
            } else {
                answer = normalizeString(target.capital);
            }

            isCorrect = (input === answer);
        }

        return isCorrect;
    }

    /**
     * Processes the turn, updates score.
     * @param {string|Object} guess 
     * @returns {Object} Result data
     */
    submitGuess(guess) {
        const isCorrect = this.checkGuess(guess);
        this.updateScore(isCorrect);

        let correctName = "";
        if (this.mode === 'flags') correctName = this.currentRound.country.name;
        else correctName = this.currentRound.country.capital;

        return {
            isCorrect,
            correctName,
            score: this.score,
            streak: this.streak
        };
    }
}
