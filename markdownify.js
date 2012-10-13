(function(document) {

    var interval;

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
        var link = $('#theme');
        if(!link.length) {
            var ss = document.createElement('link');
            ss.rel = 'stylesheet';
            ss.id = 'theme';
            ss.href = getThemeCss(theme);
            document.head.appendChild(ss);
        } else {
            link.attr('href', getThemeCss(theme));
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

	makeHtml(document.body.innerText);

	var storage = chrome.storage.local;

	// Also inject a reference to the default stylesheet to make things look nicer.
    storage.get('theme', function(items) {
        theme = items.theme ? items.theme : 'Clearness';
        setTheme(theme);
    });

    storage.get('auto_reload', function(items) {
        if(items.auto_reload) {
            startAutoReload();
        }
	});

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
            if(key == 'theme') {
                setTheme(changes[key].newValue);
            } else if(key == 'auto_reload') {
                if(items.auto_reload) {
                    startAutoReload();
                } else {
                    stopAutoReload();
                }
            }
        }
    });

}(document));
