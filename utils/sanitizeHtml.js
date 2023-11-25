const sanitizeHtml = require("sanitize-html");

// Define a function to check if HTML content is clean
function isHtmlClean(htmlContent) {
    // Sanitize the HTML content using the allowed tags and attributes
    const sanitizedHtml = sanitizeHtml(htmlContent);
    // Compare the sanitized HTML with the original content
    if (sanitizedHtml === htmlContent) {
        return { sanitizedHtml, isClean: true }; // The content is clean
    }
    return { sanitizedHtml, isClean: false };
}
module.exports = { isHtmlClean };
