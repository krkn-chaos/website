const fs = require('fs').promises;
const path = require('path');

class DailyUsageTracker {
    constructor() {
        this.usageFile = path.join(__dirname, '../logs/daily-usage.json');
        this.currentDate = this.getCurrentDate();
        this.dailyCount = 0;
        this.initialized = false;
    }

    getCurrentDate() {
        // Use local timezone instead of UTC for daily reset
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // YYYY-MM-DD format in local time
    }

    async initialize() {
        try {
            // Ensure logs directory exists
            const logsDir = path.join(__dirname, '../logs');
            try {
                await fs.access(logsDir);
            } catch (error) {
                await fs.mkdir(logsDir, { recursive: true });
            }

            // Load existing usage data
            await this.loadUsageData();
            this.initialized = true;
        } catch (error) {
            console.warn('Failed to initialize daily usage tracker:', error.message);
            // Continue with default values
            this.initialized = true;
        }
    }

    async loadUsageData() {
        try {
            const data = await fs.readFile(this.usageFile, 'utf8');
            const usageData = JSON.parse(data);
            
            // Check if it's a new day
            if (usageData.date === this.currentDate) {
                this.dailyCount = usageData.count || 0;
            } else {
                // New day, reset count
                this.dailyCount = 0;
                await this.saveUsageData();
            }
        } catch (error) {
            // File doesn't exist or is corrupted, start fresh
            this.dailyCount = 0;
            await this.saveUsageData();
        }
    }

    async saveUsageData() {
        try {
            const usageData = {
                date: this.currentDate,
                count: this.dailyCount,
                lastUpdated: new Date().toISOString()
            };
            
            await fs.writeFile(this.usageFile, JSON.stringify(usageData, null, 2));
        } catch (error) {
            console.warn('Failed to save daily usage data:', error.message);
        }
    }

    async incrementUsage() {
        if (!this.initialized) {
            await this.initialize();
        }

        const today = this.getCurrentDate();
        
        // Check if it's a new day
        if (today !== this.currentDate) {
            this.currentDate = today;
            this.dailyCount = 0;
        }

        this.dailyCount++;
        await this.saveUsageData();
        
        return this.dailyCount;
    }

    async getCurrentUsage() {
        if (!this.initialized) {
            await this.initialize();
        }

        const today = this.getCurrentDate();
        
        // Check if it's a new day
        if (today !== this.currentDate) {
            this.currentDate = today;
            this.dailyCount = 0;
            await this.saveUsageData();
        }

        return this.dailyCount;
    }

    async hasExceededLimit(limit) {
        const currentUsage = await this.getCurrentUsage();
        return currentUsage >= limit;
    }

    async getRemainingUsage(limit) {
        const currentUsage = await this.getCurrentUsage();
        return Math.max(0, limit - currentUsage);
    }
}

module.exports = DailyUsageTracker;
