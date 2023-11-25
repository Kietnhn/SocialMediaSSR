const TurnDownService = require("turndown");
const turndownService = new TurnDownService({
    blankRule: (node, output) => {
        // This custom rule ensures only one newline is generated for empty lines.
        output.blank();
    },
});
turndownService.addRule("heading1", {
    filter: "h1",
    replacement: function (content) {
        return "# " + content + "\n\n";
    },
});
turndownService.addRule("heading2", {
    filter: "h2",
    replacement: function (content) {
        return "## " + content + "\n\n";
    },
});
const md = require("markdown-it")();

function convertToMarkdown(htmlContent) {
    const markdown = turndownService.turndown(htmlContent);
    const removeDuplicate = markdown.replace(/\n\n+/g, "\n");
    return removeDuplicate;
}
function convertHtmlToMarkdown(html) {
    // Replace HTML entities with placeholders
    const entityPlaceholder = "ENTITY";
    const entityRegex = /&([a-zA-Z0-9]+);/g;
    const htmlWithPlaceholders = html.replace(entityRegex, (_, entity) => {
        switch (entity) {
            case "lt":
                return `&${entityPlaceholder}lt;`;
            case "gt":
                return `&${entityPlaceholder}gt;`;
            // Add more cases for other entities if needed
            default:
                return `&${entity};`;
        }
    });
    // Convert the HTML with placeholders to Markdown
    const markdown = turndownService.turndown(htmlWithPlaceholders);
    // Restore the HTML entities
    const markdownWithEntities = markdown.replace(
        new RegExp(`&${entityPlaceholder}`, "g"),
        "&"
    );
    console.log(html.replace(/<[^>]*>/g, ""));
    const removeDuplicate = markdownWithEntities.replace(/\n\n+/g, "\n");
    return removeDuplicate;
}
function convertToHTML(markdownContent) {
    const lines = markdownContent.split("\n");
    const wrappedLinesByDivTag = lines.map((line) => {
        const parse = md.render(line);
        if (parse !== line) {
            return parse.replace(/"/g, "'");
        }
        return `<div>${line}</div>`;
    });
    return wrappedLinesByDivTag.join("");
}
module.exports = { convertToHTML, convertToMarkdown, convertHtmlToMarkdown };
