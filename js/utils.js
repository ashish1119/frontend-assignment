// Utility Functions for Frontend Assignment

/**
 * LocalStorage Helper Functions
 */
const StorageHelper = {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored data or default value
     */
    load(key, defaultValue = null) {
        try {
            const serializedData = localStorage.getItem(key);
            return serializedData ? JSON.parse(serializedData) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    /**
     * Clear all data from localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

/**
 * Date Utility Functions
 */
const DateUtils = {
    /**
     * Format date to readable string
     * @param {Date|string} date - Date object or ISO string
     * @param {Object} options - Formatting options
     * @returns {string} Formatted date string
     */
    format(date, options = {}) {
        const dateObj = new Date(date);
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        
        return dateObj.toLocaleDateString('en-US', defaultOptions);
    },

    /**
     * Get relative time string (e.g., "2 days ago")
     * @param {Date|string} date - Date object or ISO string
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const dateObj = new Date(date);
        const diffInMs = now - dateObj;
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else {
            return this.format(dateObj);
        }
    },

    /**
     * Check if date is overdue
     * @param {Date|string} date - Date to check
     * @returns {boolean} True if date is in the past
     */
    isOverdue(date) {
        const now = new Date();
        const dateObj = new Date(date);
        now.setHours(23, 59, 59, 999); // End of today
        return dateObj < now;
    },

    /**
     * Check if date is due soon (within 3 days)
     * @param {Date|string} date - Date to check
     * @returns {boolean} True if date is within 3 days
     */
    isDueSoon(date) {
        const now = new Date();
        const dateObj = new Date(date);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        
        return dateObj >= now && dateObj <= threeDaysFromNow;
    },

    /**
     * Get today's date in YYYY-MM-DD format
     * @returns {string} Today's date
     */
    getTodayString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }
};

/**
 * DOM Utility Functions
 */
const DOMUtils = {
    /**
     * Create element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Node} content - Element content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        // Set content
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }

        return element;
    },

    /**
     * Add event listener with automatic cleanup
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    },

    /**
     * Show element with animation
     * @param {HTMLElement} element - Element to show
     */
    show(element) {
        element.classList.remove('hidden');
        element.classList.add('fade-in');
    },

    /**
     * Hide element
     * @param {HTMLElement} element - Element to hide
     */
    hide(element) {
        element.classList.add('hidden');
        element.classList.remove('fade-in');
    },

    /**
     * Toggle element visibility
     * @param {HTMLElement} element - Element to toggle
     */
    toggle(element) {
        if (element.classList.contains('hidden')) {
            this.show(element);
        } else {
            this.hide(element);
        }
    }
};

/**
 * Validation Utility Functions
 */
const ValidationUtils = {
    /**
     * Check if string is empty or only whitespace
     * @param {string} str - String to validate
     * @returns {boolean} True if empty
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate minimum length
     * @param {string} str - String to validate
     * @param {number} minLength - Minimum length
     * @returns {boolean} True if meets minimum length
     */
    minLength(str, minLength) {
        return str && str.trim().length >= minLength;
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
};

/**
 * String Utility Functions
 */
const StringUtils = {
    /**
     * Truncate string to specified length
     * @param {string} str - String to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add when truncated
     * @returns {string} Truncated string
     */
    truncate(str, length, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },

    /**
     * Convert string to slug format
     * @param {string} str - String to convert
     * @returns {string} Slug string
     */
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Capitalize first letter of each word
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    titleCase(str) {
        return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    },

    /**
     * Count words in a string
     * @param {string} str - String to count
     * @returns {number} Word count
     */
    wordCount(str) {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
};

/**
 * Array Utility Functions
 */
const ArrayUtils = {
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Shuffle array elements
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffle(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    /**
     * Remove duplicates from array
     * @param {Array} array - Array to deduplicate
     * @param {string} key - Key to compare for objects
     * @returns {Array} Deduplicated array
     */
    unique(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },

    /**
     * Sort array by property
     * @param {Array} array - Array to sort
     * @param {string} key - Property to sort by
     * @param {boolean} ascending - Sort direction
     * @returns {Array} Sorted array
     */
    sortBy(array, key, ascending = true) {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }
};

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export utilities for use in other files
window.Utils = {
    Storage: StorageHelper,
    Date: DateUtils,
    DOM: DOMUtils,
    Validation: ValidationUtils,
    String: StringUtils,
    Array: ArrayUtils,
    debounce,
    throttle
};