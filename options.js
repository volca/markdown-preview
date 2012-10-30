"use strict";

var storage = chrome.storage.local,
    themePrefix = 'theme_',
    defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks'];

function message(text, type) {
    var msgType = type || 'success',
        msgClass = 'alert-' + msgType;
    $('#msg').html('<div class="alert ' + msgClass + '">' + text + '</div>');
    setTimeout(function() {
        $('div.alert').hide(500);
    }, 3000);
}

// auto-reload
storage.get('auto_reload', function(items) {
    if(items.auto_reload) {
        $('#auto-reload').attr('checked', 'checked');
    } else {
        $('#auto-reload').removeAttr('checked');
    }
});

$('#auto-reload').change(function() {
    if(!!$(this).attr('checked')) {
        storage.set({'auto_reload' : 1});
    } else {
        storage.remove('auto_reload');
    }
});

// theme
function getThemes() {
    storage.get(['custom_themes', 'theme'], function(items) {
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

        if(items.theme) {
            $('#theme').val(items.theme);
        } 
    });
}

getThemes();
$('#theme').change(function() {
    storage.set({'theme' : $(this).val()}, function() {
        message('You successfully set the default css.');
    });
});


$('#btn-add-css').click(function() {
    var file = $('#css-file')[0].files[0],
        reader = new FileReader();

    if(!file || (file.type != 'text/css')) {
        message('Oops, support css file only.', 'error');
        return;
    }

    if(file.size > 4096) {
        message('Oops, only support the css the size less than 4k.', 'error');
        return;
    }

    var tmp = file.name.split('.');
    tmp.pop();
    var filename = tmp.join('.');
    reader.onload = function(evt) {
        var fileString = evt.target.result;
        storage.get('custom_themes', function(items) {
            var themes = items.custom_themes;
            if(themes) {
                themes.push(filename);
            } else {
                themes = [filename + ""];
            }
            themes = $.unique(themes);
            var obj = {'custom_themes' : themes};
            obj[themePrefix + filename] = fileString;
            storage.set(obj, function() {
                getThemes();
                message('Well done! You successfully add a custom css.');
                $('#css-file').val('');
            });
        });
    };
    reader.readAsText(file);
});
