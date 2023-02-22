"use strict";

var pageKey, 
    storage = chrome.storage.local,
    themePrefix = 'theme_',
    specialThemePrefix = 'special_';

storage.get('theme', function(items) {
    var theme = items.theme ? items.theme : 'Clearness';
    $('#current-theme').html(theme);
});

// theme
function getThemes() {
    $('#default-themes').empty()
    for (var t in window.config.themes) {
        $('#default-themes').append($(`<option>${t}</option>`))
    }

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

chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
    pageKey = specialThemePrefix + tab[0].url;
    getThemes();
    $('#theme').change(function() {
        var obj = {};
        obj[pageKey] = $(this).val();
        storage.set(obj);
    });
});

$('#btn-copy').click(function() {
    chrome.tabs.executeScript({
        file: '/js/copyhtml.js'
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
