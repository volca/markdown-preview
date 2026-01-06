(function(document) {

    const specialThemePrefix = 'special_'
    let mpp = {
        markedLoaded: 0
    }

    var interval,
        defaultReloadFreq = 3,
        previousText,
        storage = chrome.storage.local;

    mpp.isText = () => {
        var value = document.contentType;
        return value && /text\/(?:x-)?(markdown|plain)/i.test(value);
    };

    mpp.ajax = options => {
        chrome.runtime.sendMessage({message: "autoreload", url: options.url}, response => {
            options.complete(response);
        });
    };

    function getExtension(url) {
        url = url.substr(1 + url.lastIndexOf("/"))
            .split('?')[0]
            .split('#')[0];
        var ext = url.substr(1 + url.lastIndexOf("."));
        return ext.toLowerCase();
    }

    function hasValue(obj, key) {
        return obj && 
           obj.hasOwnProperty(key) && 
           $.trim(obj[key]).length > 0;
    }

    function resolveImg(img) {
        var src = $(img).attr("src");
        if (src[0] == "/") {
            $(img).attr("src", src.substring(1));
        }
    }

    function postRender() {
        if (location.hash) {
            window.setTimeout(function() {
                var target = $(location.hash);
                if (target.length == 0) {
                    target = $('a[name="' + location.hash.substring(1) + '"]');
                }
                if (target.length == 0) {
                    target = $('html');
                }
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 200);
            }, 300);

        }
    }

    function initMarked() {
        if (mpp.markedLoaded) {
            return
        }

        marked.setOptions(config.markedOptions);
        marked.use(markedHighlight({
          langPrefix: 'hljs language-',
          highlight(code, lang) {
            return hljs.highlightAuto(code).value;
          }
        }));

        mpp.markedLoaded = true
    }

    // Onload, take the DOM of the page, get the markdown formatted text out and
    // apply the converter.
    function makeHtml(data) {
        storage.get(['supportMath', 'katex', 'toc'], function(items) {
            // Convert MarkDown to HTML
            var preHtml = data;
            if (items.katex) {
                config.markedOptions.katex = true;
                preHtml = diagramFlowSeq.prepareDiagram(preHtml);
            }

            if (items.toc) {
                marked.use(markedGfmHeadingId.gfmHeadingId({prefix: config.markedOptions.headerPrefix}), {
                    hooks: {
                        postprocess(html) {
                            const headings = markedGfmHeadingId.getHeadingList()
                            return `
<div class="toc-list">
<h1 id="table-of-contents">Table of Contents</h1>
<ul>
    ${headings.map(({id, raw, level}) => `<li><a href="#${id}" class="h${level}">${raw}</a></li>`).join('')}
</ul>
</div>
${html}`;
                        }
                    }
                })
            }

            initMarked()
            var html = marked.parse(preHtml);
            html = DOMPurify.sanitize(html, {
                ADD_ATTR: ['flow'],
                SANITIZE_DOM: false
            });

            $(document.body).html(html);
            $('img').on("error", () => resolveImg(this));

            diagramFlowSeq.drawAllMermaid();
            postRender();
        });
    }

    function getThemeCss(theme) {
        return chrome.runtime.getURL('theme/' + theme + '.css');
    }

    function insertCssPaths(paths) {
        let cssClass = 'CUSTOM_CSS_PATH'
        $('.' + cssClass).remove()
        paths.forEach(css => {
            let cssLink = $('<link/>').addClass(cssClass)
            cssLink
                .attr('rel', 'stylesheet')
                .attr('href', css)
            $(document.head).append(cssLink)
        })
    }

    function insertThemeCss(theme) {
        if (hasValue(config.themes, theme)) {
            var link = $('#theme')
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

    function setTheme() {
        let pageKey = specialThemePrefix + location.href
        storage.get([pageKey, 'theme', 'custom_themes', 'custom_css_paths'], function(items) {
            if (items.length == 0) {
                // load default theme
                insertThemeCss('Clearness')
            } else if (hasValue(items, pageKey)) {
                insertThemeCss(items[pageKey])
            } else if (hasValue(items, 'custom_css_paths')) {
                let cssPaths = JSON.parse(items.custom_css_paths)
                insertCssPaths(cssPaths)
            } else if (hasValue(items, 'theme')) {
                insertThemeCss(items.theme)
            }
        })
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
            mpp.ajax({
                url: location,
                complete: (response) => {
                    var data = response.data
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
        if (!mpp.isText()) {
            return;
        }

        mpp.ajax({
            url: location,
            cache: false,
            complete: function(response) {
                previousText = document.body.innerText;
                makeHtml(document.body.innerText);
                setTheme()

                storage.get('auto_reload', function(items) {
                    if(items.auto_reload) {
                        startAutoReload();
                    }
                });
            }
        });
    }

    storage.get(['exclude_exts', 'disable_markdown', 'katex', 'html'], function(items) {
        if (items.disable_markdown) {
            return;
        }

        if (items.katex) {
            var mjc = document.createElement('link');
            mjc.rel = 'stylesheet';
            mjc.href = chrome.runtime.getURL('css/katex.min.css');
            $(document.head).append(mjc);
        }

        var allExtentions = ["md", "text", "markdown", "mdown", "txt", "mkd", "rst", "rmd"];
        var exts = items.exclude_exts;
        if(!exts) {
            render();
            return;
        }

        var fileExt = getExtension(location.href);
        if (($.inArray(fileExt, allExtentions) != -1) &&
            (typeof exts[fileExt] == "undefined")) {
            render();
        }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        var pageKey = specialThemePrefix + location.href;

        console.log("changes:", changes)
        for (key in changes) {
            var value = changes[key];
            if(key == pageKey || key == 'theme' || key == 'custom_css_paths') {
                setTheme();
            } else if(key == 'toc') {
                location.reload();
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
            } else if(key == 'supportMath') {
                location.reload();
            } else if(key == 'katex') {
                location.reload();
            }
        }
    });

}(document));
