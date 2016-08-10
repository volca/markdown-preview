(function(document) {

    var interval,
        defaultReloadFreq = 3,
        previousText,
        storage = chrome.storage.local;

    function parseMatchPattern(input) {
        if (typeof input !== 'string') {
            return null;
        }
        var match_pattern = '(?:^',
            regEscape = function(s) {return s.replace(/[[^$.|?*+(){}\\]/g, '\\$&');},
            result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(input);

        // Parse scheme
        if (!result) {
            return null;
        }

        input = input.substr(result[0].length);
        match_pattern += result[1] === '*' ? 'https?://' : result[1] + '://';

        // Parse host if scheme is not `file`
        if (result[1] !== 'file') {
            if (!(result = /^(?:\*|(\*\.)?([^\/*]+))/.exec(input))) return null;
            input = input.substr(result[0].length);
            if (result[0] === '*') {    // host is '*'
                match_pattern += '[^/]+';
            } else {
                if (match[1]) {         // Subdomain wildcard exists
                    match_pattern += '(?:[^/]+\.)?';
                }
                // Append host (escape special regex characters)
                match_pattern += regEscape(match[2]) + '/';
            }
        }

        // Add remainder (path)
        match_pattern += input.split('*').map(regEscape).join('.*');
        match_pattern += '$)';
        return match_pattern;
    }

    // Onload, take the DOM of the page, get the markdown formatted text out and
    // apply the converter.
    function makeHtml(data) {
        storage.get('mathjax', function(items) {
            // Convert MarkDown to HTML without MathJax typesetting.
            // This is done to make page responsiveness.  The HTML body
            // is replaced after MathJax typesetting.
            marked.setOptions({
                highlight : function(code) {
                    return hljs.highlightAuto(code).value;
                }
            });
            var html = marked(data);
            $(document.body).html(html);

            // Apply MathJax typesetting
            if (items.mathjax) {
                // Inject js required to process MathJax before Markdown
                var markedJs = $('<script/>').attr('type', 'text/javascript')
                    .attr('src',
                          chrome.extension.getURL('js/marked.js'));
                $(document.head).append(markedJs);

                var js = $('<script/>').attr('type', 'text/javascript')
                    .attr('src',
                          chrome.extension.getURL('js/runMathJax.js'));
                $(document.head).append(js);

                // Create hidden div to use for MathJax processing
                var mathjaxDiv = document.createElement("div");
                mathjaxDiv.setAttribute("id", "mathjaxProcessing");
                mathjaxDiv.innerHTML = data;
                mathjaxDiv.style.display = 'none';
                document.body.appendChild(mathjaxDiv);
            }
        });
    }

    function getThemeCss(theme) {
        return chrome.extension.getURL('theme/' + theme + '.css');
    }

    function setTheme(theme) {
        var defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks'];

        if($.inArray(theme, defaultThemes) != -1) {
            var link = $('#theme');
            $('#custom-theme').remove();
            if(!link.length) {
                var ss = document.createElement('link');
                ss.rel = 'stylesheet';
                ss.id = 'theme';
                //ss.media = "print";
                ss.href = getThemeCss(theme);
                document.head.appendChild(ss);
            } else {
                link.attr('href', getThemeCss(theme));
            }
        } else {
            var themePrefix = 'theme_',
                key = themePrefix + theme;
            storage.get(key, function(items) {
                if(items[key]) {
                    $('#theme').remove();
                    var theme = $('#custom-theme');
                    if(!theme.length) {
                        var style = $('<style/>').attr('id', 'custom-theme')
                                        .html(items[key]);
                        $(document.head).append(style);
                    } else {
                        theme.html(items[key]);
                    }
                }
            });
        }
    }

    function setMathJax() {
        storage.get('enable_latex_syntax', function(items) {

            // Note: when math delimiters are set in JS as strings,
            // backslashes need to be escaped
            var mathjaxConfig = {
                tex2jax: {
                    inlineMath: [ ['\\\\(', '\\\\)'] ],
                    displayMath: [ ['$$', '$$'], ['\\\\[', '\\\\]'] ],
                    processEscapes: false
                }
            };

            // Enable MathJAX LaTeX syntax
            if (items.enable_latex_syntax) {
                mathjaxConfig.tex2jax.inlineMath.push(['$', '$']);
                mathjaxConfig.tex2jax.inlineMath.push(['\\(', '\\)']);
                mathjaxConfig.tex2jax.displayMath.push(['\\[', '\\]']);
                mathjaxConfig.tex2jax.processEscapes = true;
            }

            // Add MathJax configuration and js to document head
            var js = $('<script/>').attr('type','text/javascript')
                .attr('src', 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML');
            $(document.head).append(js);

            var mjc = $('<script/>').attr('type', 'text/x-mathjax-config').
                html("MathJax.Hub.Config(" + JSON.stringify(mathjaxConfig) +
                     ");");
            $(document.head).append(mjc);
        });
    }

    function stopAutoReload() {
        clearInterval(interval);
    }

    function startAutoReload() {
        stopAutoReload();

        var freq = defaultReloadFreq;
        storage.get('reload_freq', function(items) {
            if(items.reload_freq) {
                freq = items.reload_freq;
            }
        });

        interval = setInterval(function() {
            $.ajax({
                url : location.href,
                cache : false,
                success : function(data) {
                    if (previousText == data) {
                        return;
                    }
                    makeHtml(data);
                    previousText = data;
                }
            });
        }, freq * 1000);
    }

    function render() {
        $.ajax({
            url : location.href,
            cache : false,
            complete : function(xhr, textStatus) {
                var contentType = xhr.getResponseHeader('Content-Type');
                if(contentType && (contentType.indexOf('html') > -1)) {
                    return;
                }

                makeHtml(document.body.innerText);
                var specialThemePrefix = 'special_',
                    pageKey = specialThemePrefix + location.href;
                storage.get(['theme', pageKey], function(items) {
                    theme = items.theme ? items.theme : 'Clearness';
                    if(items[pageKey]) {
                        theme = items[pageKey];
                    }
                    setTheme(theme);
                });

                storage.get('auto_reload', function(items) {
                    if(items.auto_reload) {
                        startAutoReload();
                    }
                });
            }
        });
    }

    storage.get(['exclude_exts', 'disable_markdown', 'mathjax'], function(items) {
        if(items.disable_markdown) {
            return;
        }

        if(items.mathjax) {
            setMathJax();
        }

        var exts = items.exclude_exts;
        if(!exts) {
            render();
            return;
        }

        var parsed = $.map(exts, function(k, v) {
            return parseMatchPattern(v);
        });
        var pattern = new RegExp(parsed.join('|'));
        if(!parsed.length || !pattern.test(location.href)) {
            render();
        }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        var specialThemePrefix = 'special_',
            pageKey = specialThemePrefix + location.href;
        for (key in changes) {
            var value = changes[key];
            if(key == pageKey) {
                setTheme(value.newValue);
            } else if(key == 'theme') {
                storage.get(pageKey, function(items) {
                    if(!items[pageKey]) {
                        setTheme(value.newValue);
                    }
                });
            } else if(key == 'reload_freq') {
                storage.get('auto_reload', function(items) {
                    startAutoReload();
                });
            } else if(key == 'auto_reload') {
                if(value.newValue) {
                    startAutoReload();
                } else {
                    stopAutoReload();
                }
            } else if(key == 'disable_markdown') {
                location.reload();
            }
        }
    });

}(document));
