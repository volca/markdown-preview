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
    chrome.tabs.getSelected(null, function(tab) {
        chrome.pageCapture.saveAsMHTML({tabId: tab.id}, function(mhtml){
            var url = URL.createObjectURL(mhtml);
            chrome.downloads.download({
                url: url,
                filename: 'export.mhtml'
            });
        });
    });
});

storage.get('disable_markdown', function(items) {
    if(items.disable_markdown) {
        $('#disable-markdown').attr('checked', 'checked');
    } else {
        $('#disable-markdown').removeAttr('checked');
    }
});

$('#disable-markdown').change(function() {
    if($(this).prop('checked')) {
        storage.set({'disable_markdown' : 1});
    } else {
        storage.remove('disable_markdown');
    }
});
