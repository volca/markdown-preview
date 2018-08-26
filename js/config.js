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

    return module;
}(hljs));
