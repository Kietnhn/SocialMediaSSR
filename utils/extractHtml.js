const { JSDOM } = require("jsdom");
function extractBodyContent(htmlString) {
    const dom = new JSDOM(htmlString);
    const bodyTag = dom.window.document.querySelector("body");

    if (!bodyTag) {
        return "";
    }
    return bodyTag.innerHTML;
}
function extractTextFromHTML(html) {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent;
}
module.exports = { extractBodyContent, extractTextFromHTML };
