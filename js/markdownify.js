(function(document) {

    var interval, 
        storage = chrome.storage.local;

    // Onload, take the DOM of the page, get the markdown formatted text out and
    // apply the converter.
    function makeHtml(data) {
        var html = (new Showdown.converter()).makeHtml(data);
        $(document.body).html(html);
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

    function stopAutoReload() {
        clearInterval(interval);
    }

    function startAutoReload() {
        stopAutoReload();
        interval = setInterval(function() {
            $.ajax({
                url : location.href, 
                cache : false,
                success : function(data) { 
                    makeHtml(data); 
                }
            });
        }, 3000);
    }

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

            chrome.storage.onChanged.addListener(function(changes, namespace) {
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
                    } else if(key == 'auto_reload') {
                        if(value.newValue) {
                            startAutoReload();
                        } else {
                            stopAutoReload();
                        }
                    }
                }
            });
        }
    });


}(document));
