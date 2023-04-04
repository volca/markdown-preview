(function(document) {

    var mpp = {},
        interval,
        defaultReloadFreq = 3,
        previousText,
        toc = [],
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

    var buildCtx = (coll, k, level, ctx) => {
        if (k >= coll.length || coll[k].level <= level) { return k; }
        var node = coll[k];
        ctx.push("<li><a href='#" + node.anchor + "'>" + node.text + "</a>");
        k++;
        var childCtx = [];
        k = buildCtx(coll, k, node.level, childCtx);
        if (childCtx.length > 0) {
            ctx.push("<ul>");
            childCtx.forEach(function (idm) {
                ctx.push(idm);
            });
            ctx.push("</ul>");
        }
        ctx.push("</li>");
        k = buildCtx(coll, k, level, ctx);
        return k;
    };

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
                toc = [];
                const renderer = new marked.Renderer()
                const slugger = new marked.Slugger()
                const r = {
                  heading: renderer.heading.bind(renderer),
                };

                renderer.heading = (text, level, raw, slugger) => {
                    var anchor = config.markedOptions.headerPrefix + slugger.serialize(raw)

                    toc.push({
                        anchor: anchor,
                        level: level,
                        text: text
                    });

                    return r.heading(text, level, raw, slugger);
                };
                config.markedOptions.renderer = renderer;
            }

            marked.setOptions(config.markedOptions);
            var html = marked.parse(preHtml);
            html = DOMPurify.sanitize(html, {
                ADD_ATTR: ['flow'],
                SANITIZE_DOM: false
            });

            if (items.toc) {
                var ctx = [];
                ctx.push('<div class="toc-list"><h1 id="table-of-contents">Table of Contents</h1>\n<ul>');
                buildCtx(toc, 0, 0, ctx);
                ctx.push("</ul></div>");
                html = ctx.join('') + html
            }
            $(document.body).html(html);

            $('img').on("error", () => resolveImg(this));

            diagramFlowSeq.drawAllFlow();
            diagramFlowSeq.drawAllSeq();
            diagramFlowSeq.drawAllMermaid();

            postRender();
        });
    }

    function getThemeCss(theme) {
        return chrome.runtime.getURL('theme/' + theme + '.css');
    }

    function setTheme(theme) {
        if (typeof config.themes[theme] != 'undefined') {
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
