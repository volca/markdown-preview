window.config = (function(hljs) {
    // Define module
    var module = {};

    // Private module properties
    var latexDelimitersEnabled = false;

    // Public module properties
    module.markedOptions = {
        gfm: true,
        tables: true,
        breaks: false,
        sanitize: true,
        highlight: function(code) {
            return hljs.highlightAuto(code).value;
        }
    };

    module.mathjaxProcessingElementId = "mathjaxProcessing";

    // Note: when math delimiters are set in JS as strings, backslashes need
    // to be escaped
    module.mathjaxConfig = {
        tex2jax: {
            inlineMath: [ ['\\\\(', '\\\\)'] ],
            displayMath: [ ['$$', '$$'], ['\\\\[', '\\\\]'] ],
            processEscapes: false
        }
    };

    // Public module functions
    module.enableLatexDelimiters = function() {
        if (!latexDelimitersEnabled) {
            // Note: when math delimiters are set in JS as strings,
            // backslashes need to be escaped
            module.mathjaxConfig.tex2jax.inlineMath.push(['$', '$']);
            module.mathjaxConfig.tex2jax.inlineMath.push(['$', '$']);
            module.mathjaxConfig.tex2jax.inlineMath.push(['\\(', '\\)']);
            module.mathjaxConfig.tex2jax.displayMath.push(['\\[', '\\]']);
            module.mathjaxConfig.tex2jax.processEscapes = true;

            latexDelimitersEnabled = true;
        }
    }

    return module;
}(hljs));
