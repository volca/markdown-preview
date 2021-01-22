window.config = (function(hljs) {
    // Define module
    var module = {};

    // Public module properties
    module.markedOptions = {
        gfm: true,
        tables: true,
        breaks: false,
        katex: false,
        highlight: function(code, language) {
            const languageSubset = language ? [language]: null;
            return hljs.highlightAuto(code, languageSubset).value;
        }
    };

    return module;
}(hljs));
