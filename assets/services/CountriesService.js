/**
 * Service: CountriesService
 * Handles fetching, caching, and processing of REST Countries API data.
 * Implements Singleton pattern.
 */
class CountriesService {
    constructor() {
        if (CountriesService.instance) {
            return CountriesService.instance;
        }

        this.apiUrl = 'https://restcountries.com/v3.1/all?fields=name,capital,flags,population,region';
        this.cacheKey = 'hubgame_data_v1';
        this.data = null;

        CountriesService.instance = this;
    }

    /**
     * Fetches countries data from API or Cache.
     * @returns {Promise<Array>} List of processed countries
     */
    async getAllCountries() {
        if (this.data) return this.data;

        // Try load from local storage
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
            try {
                this.data = JSON.parse(cached);
                console.log(`[CountriesService] Loaded ${this.data.length} countries from cache.`);
                return this.data;
            } catch (e) {
                console.warn("[CountriesService] Cache corrupted, clearing.");
                localStorage.removeItem(this.cacheKey);
            }
        }

        // Fetch from API
        try {
            console.log("[CountriesService] Fetching from API...");
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const rawData = await response.json();

            // Process and Filter Data
            this.data = rawData
                .filter(c => c.name.common !== "Israel") // As per original code constraint
                .filter(c => c.capital && c.capital.length > 0) // Must have capital
                .map(c => ({
                    name: c.name.common,
                    capital: c.capital[0],
                    flag: c.flags.svg || c.flags.png,
                    region: c.region,
                    population: c.population
                }));

            // Save to cache
            localStorage.setItem(this.cacheKey, JSON.stringify(this.data));
            console.log(`[CountriesService] Fetched and cached ${this.data.length} countries.`);

            return this.data;
        } catch (error) {
            console.error("[CountriesService] Failed to load countries:", error);
            throw error;
        }
    }

    /**
     * Clears the internal cache and local storage.
     */
    clearCache() {
        this.data = null;
        localStorage.removeItem(this.cacheKey);
    }
}

// Export Singleton Instance
export const countriesService = new CountriesService();
