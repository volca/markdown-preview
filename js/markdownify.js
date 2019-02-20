(function(document) {

    var interval,
        defaultReloadFreq = 3,
        previousText,
        storage = chrome.storage.local;

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

    // Onload, take the DOM of the page, get the markdown formatted text out and
    // apply the converter.
    function makeHtml(data) {
        storage.get(['supportMath', 'katex', 'html', 'toc'], function(items) {
            // Convert MarkDown to HTML
            var preHtml = data;
            if (items.html) {
                config.markedOptions.sanitize = false;
            }
            if (items.katex) {
                config.markedOptions.katex = true;
                preHtml = diagramFlowSeq.prepareDiagram(data);
            }
            marked.setOptions(config.markedOptions);
            var html = marked(preHtml);
            $(document.body).html(html);

            $('img').on("error", function() {
                resolveImg(this);
            });

            if (items.toc) {
                addTOC();
            }

            diagramFlowSeq.drawAllFlow();
            diagramFlowSeq.drawAllSeq();

            postRender();
        });
    }

    function getThemeCss(theme) {
        return chrome.extension.getURL('theme/' + theme + '.css');
    }

    function setTheme(theme) {
        var defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks', 'YetAnotherGithub'];

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
                url: location.href,
                cache: false,
                success: function(data) {
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
            url: location.href,
            cache: false,
            complete: function(xhr, textStatus) {
                var contentType = xhr.getResponseHeader('Content-Type');
                if(contentType && (contentType.indexOf('html') > -1)) {
                    return;
                }

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
            mjc.href = chrome.extension.getURL('theme/katex.min.css');
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

    // {{{ Start of TOC code
    var showNavBar = true;
    var expandNavBar = true;
    var hasNavItem = true;
    var vH1Tag = null, vH2Tag = null, vH3Tag = null,
        vH4Tag = null, vH5Tag = null, vH6Tag = null;
    var headerNavs;
    var headerTops = [];
    var tocTops = [];

    var scrollDirection = "none";
    var lastY = 'undefined';
    function scrollFunc() {
        if (typeof lastY == 'undefined') {
          lastY = window.pageYOffset;
        }
        var diffY = lastY - window.pageYOffset;
        lastY = window.pageYOffset;
        if (diffY < 0) { // down
          scrollDirection = 'down';
        } else if (diffY > 0) { // up
          scrollDirection = 'up';
        } else { // first enter
          scrollDirection = 'first';//just set as "first"
        }
    };

    function addTOC() {
        makeTOC();
        if(showNavBar && hasNavItem){
            if(hasScroll("AnchorContent")){
                $("#AnchorContent").hover(function (){
                    $("#AnchorContent").preventScroll();
                },function (){
                });
            }
            setTimeout(calcBounds, 100);
        }
    };

    $(window).resize(function(){
        if(showNavBar){
            var clientheight = document.compatMode=="CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
            $("#AnchorContent").css('max-height', (clientheight - 160) + 'px');
        }
    });

    function makeTOC(){
        var h1s = $("body").find("h1");
        var h2s = $("body").find("h2");
        var h3s = $("body").find("h3");
        var h4s = $("body").find("h4");
        var h5s = $("body").find("h5");
        var h6s = $("body").find("h6");

        var headCounts = [h1s.length, h2s.length, h3s.length, h4s.length, h5s.length, h6s.length];
        for(var i = 0; i < headCounts.length; i++){
            if(headCounts[i] > 0){
                if (vH1Tag == null){
                    vH1Tag = 'h' + (i + 1);
                } else if(vH2Tag == null){
                    vH2Tag = 'h' + (i + 1);
                } else if(vH3Tag == null){
                    vH3Tag = 'h' + (i + 1);
                } else if(vH4Tag == null){
                    vH4Tag = 'h' + (i + 1);
                } else if(vH5Tag == null){
                    vH5Tag = 'h' + (i + 1);
                } else if(vH6Tag == null){
                    vH6Tag = 'h' + (i + 1);
                }
            }
        }

        if(vH1Tag == null){
            hasNavItem = false;//hide TOC, nothing to show
            return;
        }else{
            hasNavItem = true;//reset to display TOC
        }

        if($(".BlogAnchor").length == 0){
            $("body").append('<div class="BlogAnchor">' +
                '<span style="color:red;position:absolute;top:-3px;left:3px;cursor:pointer;" ' +
                'onclick="document.getElementsByClassName(\'BlogAnchor\')[0].style.display = \'none\';">X</span>' + '<p>' +
                '<b id="AnchorContentToggle" title="Expand" style="cursor:pointer;">Content▲</b>' +
                '</p>' + '<div class="AnchorContent" id="AnchorContent"> </div>' + '</div>' );
            var clientheight = document.compatMode=="CSS1Compat" ?
                    document.documentElement.clientHeight : document.body.clientHeight;
            $("#AnchorContent").css('max-height', (clientheight - 160) + 'px');
        }

        var vH1Index = 0, vH2Index = 0, vH3Index = 0,
            vH4Index = 0, vH5Index = 0, vH6Index = 0;
        $("body").find("h1,h2,h3,h4,h5,h6").each(function(i,item){
            var id = '';
            var name = '';
            var tag = $(item).get(0).tagName.toLowerCase();
            var className = '';

            if (tag == vH1Tag){
                id = name = ++vH1Index;
                name = id;
                vH2Index = 0;
                className = 'item_h1';
            } else if(tag == vH2Tag){
                id = vH1Index + '_' + ++vH2Index;
                name = vH1Index + '.' + vH2Index;
                vH3Index = 0;
                className = 'item_h2';
            } else if(tag == vH3Tag){
                id = vH1Index + '_' + vH2Index + '_' + ++vH3Index;
                name = vH1Index + '.' + vH2Index + '.' + vH3Index;
                vH4Index = 0;
                className = 'item_h3';
            } else if(tag == vH4Tag){
                id = vH1Index + '_' + vH2Index + '_' + vH3Index + '_' + ++vH4Index;
                name = vH1Index + '.' + vH2Index + '.' + vH3Index + '.' + vH4Index;
                className = 'item_h4';
            } else if(tag == vH5Tag){
                id = [vH1Index, vH2Index, vH3Index, vH4Index, ++vH5Index].join('_');
                name = [vH1Index, vH2Index, vH3Index, vH4Index, vH5Index].join('.');
                vH5Index = 0;
                className = 'item_h5';
            } else if(tag == vH6Tag){
                id = [vH1Index, vH2Index, vH3Index, vH4Index, vH5Index, ++vH6Index].join('_');
                name = [vH1Index, vH2Index, vH3Index, vH4Index, vH5Index, vH6Index].join('.');
                vH6Index = 0;
                className = 'item_h6';
            }

            $(item).attr("id","wow"+id);
            $(item).addClass("wow_head");
            $("#AnchorContent").append('<li><a class="nav_item '+className+' anchor-link" onclick="return false;" href="#" link="#wow'+id+'">'+name+"&ensp;"+$(this).text()+'</a></li>');
        });

        $("#AnchorContentToggle").click(function(){
            var text = $(this).html();
            if(text=="Content▲"){
                $(this).html("Content▼");
                $(this).attr({"title":"Collapse"});
                $(".BlogAnchor").css("min-width","6%");
            }else{
                $(this).html("Content▲");
                $(this).attr({"title":"Expand"});
                $(".BlogAnchor").css("min-width","25%");
            }
            $("#AnchorContent").toggle();
        });

        $(".anchor-link").click(function(){
            $(".BlogAnchor li .nav_item.current").removeClass('current');
            $(this).addClass('current');
            $(window).off('scroll', doScroll);
            $("html,body").animate({scrollTop: $($(this).attr("link")).offset().top}, 100,
                function(){ $(window).on('scroll', doScroll); });
        });

        if(!showNavBar){ $('.BlogAnchor').hide(); }
        if(!expandNavBar){
            $(this).html("Content▼");
            $(this).attr({"title":"Collapse"});
            $("#AnchorContent").hide();
        }
    }

    function doScroll(){ //$(window).scroll
        scrollFunc();
        var scrollTop = $(window).scrollTop();
        var clientheight = document.compatMode=="CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
        $.each(headerTops, function(i, n){
            var distance = n - scrollTop;
            if(distance > 0){
                var item = $(headerNavs[i])[0];
                var curItemTop = $(headerNavs[i]).position().top;
                var dist2Top = distance + item.offsetHeight;

                if(scrollDirection == 'first'){
                    //handle first in
                    if(dist2Top < clientheight){
                        $(".BlogAnchor li .nav_item.current").removeClass('current');
                        $(headerNavs[i]).addClass('current');
                    }else{
                        $(".BlogAnchor li .nav_item.current").removeClass('current');
                        if(i > 0){
                            $(headerNavs[i - 1]).addClass('current');
                        }
                    }
                    return false;
                }
                if(dist2Top < clientheight){
                    $(".BlogAnchor li .nav_item.current").removeClass('current');
                    $(headerNavs[i]).addClass('current');
                    return false;
                }else if(scrollDirection == 'up'){
                    if(item.classList.contains('current')==true){
                        $(".BlogAnchor li .nav_item.current").removeClass('current');
                        if(i > 0){
                            $(headerNavs[i - 1]).addClass('current');
                            return false;
                        }
                    }
                }
            }
        });
        adjustCurItem();
    }

    function adjustCurItem(){
        var curItem = $(".BlogAnchor li .nav_item.current");
        if(typeof curItem.get(0) == "undefined") {
            return;
        }

        var curItemTop = curItem.position().top;
        var curItemHeight = document.getElementById("AnchorContent").getElementsByClassName("current")[0].offsetHeight;
        var tocTop = $("#AnchorContent").position().top;
        var tocHeight = document.getElementById("AnchorContent").clientHeight;
        var scrolltop = $("#AnchorContent").scrollTop();
        if(curItemTop <= tocTop){ //currentItem showed in AnchorContent
            var dist = tocTop - curItemTop;
            if(dist > 0){ $("#AnchorContent").scrollTop(scrolltop - dist); }
        }else if(curItemTop + curItemHeight > tocTop){
            var dist = curItemTop + curItemHeight - tocTop - tocHeight;
            if(dist > 0){ //currentItem beyond AnchorContent
                $("#AnchorContent").scrollTop(dist + scrolltop);
            }
        }
    }

    function calcBounds(){
        headerNavs = $(".BlogAnchor li .nav_item");
        $(".wow_head").each(function(i, n){
            headerTops.push($(n).offset().top);
        });
        headerNavs.each(function(i, n){
            tocTops.push($(n).offset().top);
        });

        $(window).on('scroll', doScroll);
        doScroll();
    }

    function hasScroll(Id){
        var obj=document.getElementById(Id);
        if(obj && obj.scrollHeight > obj.clientHeight){
            return true;
        } else {
            return false;
        }
    }

    //for preventDefault()
    $.fn.extend({
        "preventScroll":function(){
            $(this).each(function(){
                var _this = this;
                if(navigator.userAgent.indexOf('Firefox') >= 0){   //firefox
                    _this.addEventListener('DOMMouseScroll',function(e){
                        _this.scrollTop += e.detail > 0 ? 50 : -50;
                        e.preventDefault();
                    },false);
                }else{
                    _this.onmousewheel = function(e){
                        e = e || window.event;
                        _this.scrollTop += e.wheelDelta > 0 ? -50 : 50;
                        return false;
                    };
                }
            })
        }
    });
    // }}} End of TOC code

}(document));
