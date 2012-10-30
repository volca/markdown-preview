"use strict";

var storage = chrome.storage.local,
    themePrefix = 'theme_',
    specialThemePrefix = 'special_',
    defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks'];

storage.get('theme', function(items) {
    var theme = items.theme ? items.theme : 'Clearness';
    $('#current-theme').html(theme);
});

// theme
function getThemes() {
    var key = specialThemePrefix + location.href;
    storage.get(['custom_themes', key], function(items) {
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

        if(items[key]) {
            $('#theme').val(items[key]);
        } 
    });
}

getThemes();
$('#theme').change(function() {
    var key = specialThemePrefix + location.href;
    var obj = {};
    obj[key] = $(this).val();
    storage.set(obj);
});
