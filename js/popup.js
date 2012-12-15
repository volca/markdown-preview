"use strict";

var pageKey, 
    storage = chrome.storage.local,
    themePrefix = 'theme_',
    specialThemePrefix = 'special_',
    defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks'];

storage.get('theme', function(items) {
    var theme = items.theme ? items.theme : 'Clearness';
    $('#current-theme').html(theme);
});

// theme
function getThemes() {
    storage.get(['custom_themes', pageKey], function(items) {
        if(items.custom_themes) {
            var k, v, themes = items.custom_themes;
            var group = $('<optgroup label="Custom themes"></optgroup>');

            $('#theme optgroup[label="Custom themes"]').empty().remove();
            for(k in themes) {
                v = themes[k];
                group.append($("<option></option>").text(v)); 
            }
            $('#theme').append(group);
        }

        if(items[pageKey]) {
            $('#theme').val(items[pageKey]);
        } 
    });
}

chrome.tabs.getSelected(null, function(tab) {
    pageKey = specialThemePrefix + tab.url;
    getThemes();
    $('#theme').change(function() {
        var obj = {};
        obj[pageKey] = $(this).val();
        storage.set(obj);
    });
});

$('#btn-export').click(function() {
    var urlObject = window.URL || window.webkitURL || window,
        BlobBuilder = BlobBuilder || WebKitBlobBuilder || MozBlobBuilder,
        builder = new BlobBuilder();

    var data = '<html><body>hello world</body></html>';
    builder.append(data);
    var blob = builder.getBlob('text/plain; charset=utf-8');
    var saveLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    saveLink.href = urlObject.createObjectURL(blob);
    saveLink.download = 'export.html';
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent(
        "click", true, false, window, 0, 0, 0, 0, 0
        , false, false, false, false, 0, null
    );
    saveLink.dispatchEvent(event);
});
