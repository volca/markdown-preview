"use strict";

var pageKey, 
    storage = chrome.storage.local,
    themePrefix = 'theme_',
    specialThemePrefix = 'special_',
    defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'GithubLeft', 'TopMarks', 'YetAnotherGithub'];

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

chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
    pageKey = specialThemePrefix + tab.url;
    getThemes();
    $('#theme').change(function() {
        var obj = {};
        obj[pageKey] = $(this).val();
        storage.set(obj);
    });
});

$('#btn-copy').click(function() {
    chrome.tabs.executeScript({
        code: 'var s = $("<textarea/>").text($("body").html());$(document.body).append(s);s.select();document.execCommand("copy"); s.remove(); alert("Copied to clipboard");'
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
