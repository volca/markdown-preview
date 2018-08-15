window.config = (function(hljs) {
    // Define module
    var module = {};

    // Public module properties
    module.markedOptions = {
        gfm: true,
        tables: true,
        breaks: false,
        sanitize: true,
        katex: false,
        highlight: function(code) {
            return hljs.highlightAuto(code).value;
        }
    };

    module.mathjaxProcessingElementId = "mathjaxProcessing";

    // Note: when math delimiters are set in JS as strings, backslashes need
    // to be escaped
    module.mathjaxConfig = {
        showMathMenu: false,
        showProcessingMessages: false,
        messageStyle: "none",
        tex2jax: {
            inlineMath: [ ['\\(', '\\)'], ['\\\\(', '\\\\)'], ['$', '$'] ],
            displayMath: [ ['\\[', '\\]'], ['$$', '$$'], ['\\\\[', '\\\\]'] ],
            // skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
            processEscapes: true
        }
    };

    return module;
}(hljs));
