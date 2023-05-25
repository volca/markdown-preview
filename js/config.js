window.exports = {}

window.config = (function() {
    // Define module
    var module = {};

    // Public module properties
    module.markedOptions = {
        gfm: true,
        tables: true,
        breaks: false,
        headerPrefix: '',
        katex: false
    };

    module.themes = {
        'Clearness': 'Clearness.js', 
        'ClearnessDark': 'ClearnessDark.css',
        'Github': 'Github.css', 
        'GithubLeft': 'GithubLeft.css',
        'YetAnotherGithub': 'YetAnotherGithub.css',
        'TopMarks': 'TopMarks.css',
        'ClearnessDarkLg': 'ClearnessDarkLg.css'
    };

    return module;
}());
