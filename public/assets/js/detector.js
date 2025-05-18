// Modern browser detection
const detectorInit = function() {
    try {
        const browser = {
            name: 'unknown',
            version: 'unknown'
        };

        // Get user agent string
        const userAgent = navigator.userAgent;

        // Detect browser
        if (userAgent.indexOf('Firefox') > -1) {
            browser.name = 'Firefox';
            browser.version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('Chrome') > -1) {
            browser.name = 'Chrome';
            browser.version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('Safari') > -1) {
            browser.name = 'Safari';
            browser.version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('Edge') > -1) {
            browser.name = 'Edge';
            browser.version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'unknown';
        } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
            browser.name = 'Internet Explorer';
            browser.version = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1] || 'unknown';
        }

        // Add browser info to body
        document.body.setAttribute('data-browser', browser.name.toLowerCase());
        document.body.setAttribute('data-browser-version', browser.version);

        return browser;
    } catch (error) {
        console.warn('Browser detection failed:', error);
        return { name: 'unknown', version: 'unknown' };
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', detectorInit); 