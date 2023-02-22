window.config = (function(hljs) {
    // Define module
    var module = {};

    // Public module properties
    module.markedOptions = {
        gfm: true,
        tables: true,
        breaks: false,
        katex: false,
        headerIds: true,
        headerPrefix: '',
        highlight: function(code, language) {
            const languageSubset = language ? [language]: null;
            return hljs.highlightAuto(code, languageSubset).value;
        }
    };

    module.themes = {
        'Clearness': 'Clearness.js', 
        'ClearnessDark': 'ClearnessDark.css',
        'Github': 'Github.css', 
        'GithubLeft': 'GithubLeft.css',
        'YetAnotherGithub': 'YetAnotherGithub.css',
        'TopMarks': 'TopMarks' 
    };

    return module;
}(hljs));
