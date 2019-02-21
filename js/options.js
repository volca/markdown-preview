"use strict";

var storage = chrome.storage.local,
    themePrefix = 'theme_',
    maxCustomCssSize = 8192,
    defaultReloadFreq = 3,
    defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'GithubLeft', 'TopMarks', 'YetAnotherGithub'];

function message(text, type) {
    var msgType = type || 'success',
        msgClass = 'alert-' + msgType;
    $('#msg').html('<div class="alert ' + msgClass + '">' + text + '</div>');
    setTimeout(function() {
        $('div.alert').hide(500);
    }, 3000);
}

storage.get(['katex', 'html', 'toc'], function(items) {
    if(items.katex) {
        $('#katex').prop('checked', 'checked');
    } else {
        $('#katex').removeProp('checked');
    }
    if(items.toc) {
        $('#toc').prop('checked', 'checked');
    } else {
        $('#toc').removeProp('checked');
    }

    if(items.html) {
        $('#html').prop('checked', 'checked');
    } else {
        $('#html').removeProp('checked');
    }
});

// auto-reload
storage.get('auto_reload', function(items) {
    if(items.auto_reload) {
        $('#auto-reload').prop('checked', 'checked');
    } else {
        $('#auto-reload').removeProp('checked');
    }
});

$('#html').change(function() {
    if($(this).prop('checked')) {
        storage.set({'html' : 1});
    } else {
        storage.remove('html');
        $('#katex').removeProp('checked');
        storage.remove('katex');
    }
});

$('#katex').change(function() {
    if($(this).prop('checked')) {
        storage.set({'katex' : 1});
        $('#html').prop('checked', 'checked');
        storage.set({'html' : 1});
    } else {
        storage.remove('katex');
    }
});

$('#auto-reload').change(function() {
    if($(this).prop('checked')) {
        storage.set({'auto_reload' : 1});
    } else {
        storage.remove('auto_reload');
    }
});

$('#toc').change(function() {
    if($(this).prop('checked')) {
        storage.set({'toc' : 1});
    } else {
        storage.remove('toc');
    }
});

// theme
function loadThemeButton() {
    var selected = $('#theme option:selected');
    if (selected.parent().attr('label') == 'Custom themes') {
        $('#btn-remove-css').show();
    } else {
        $('#btn-remove-css').hide();
    }
}

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
            loadThemeButton();
        } else {
            $('#theme').prop("selectedIndex", 0);
            $('#theme').trigger('change');
        }
    });
}

$('#theme').change(function() {
    storage.set({'theme' : $(this).val()}, function() {
        message('Theme is changed');
    });

    loadThemeButton();
});
getThemes();

$('#btn-remove-css').click(function() {
    var selected = $('#theme option:selected').val();
    storage.get(['custom_themes', 'theme'], function(items) {
        if(items.theme == selected) {
            storage.remove(['theme']);
        }

        if(items.custom_themes) {
            var themes = items.custom_themes,
                idx = themes.indexOf(selected);

            if (idx > -1) {
                themes.splice(idx, 1);
            }

            var obj = {'custom_themes' : themes},
                cssFile = themePrefix + selected;

            storage.set(obj, function() {
                getThemes();
            });
            storage.remove([cssFile]);
        }
    });
});

$('#btn-add-css').click(function() {
    var file = $('#css-file')[0].files[0],
        reader = new FileReader();

    if(!file || (file.type != 'text/css')) {
        message('Oops, support css file only.', 'error');
        return;
    }

    if(file.size > maxCustomCssSize) {
        message('Oops, only support the css file that size less than ' + (maxCustomCssSize / 1024) + 'kB.', 'error');
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
            themes = $.grep(themes, function(v, k) {
                return $.inArray(v, themes) === k;
            });
            var obj = {'custom_themes' : themes};
            obj[themePrefix + filename] = fileString;
            storage.set(obj, function() {
                getThemes();
                message('Custom theme is added.');
                $('#css-file').val('');
            });
        });
    };
    reader.readAsText(file);
});

// file extensions

$('.cont-exts input').change(function() {
    var fileExt = this.value,
        isChecked = this.checked;

    storage.get('exclude_exts', function(items) {
        var exts = items.exclude_exts,
            key = fileExt;

        if(!exts) {
            exts = {};
        }

        if(isChecked) {
            delete exts[key];
        } else {
            exts[key] = 1;
        }

        storage.set({'exclude_exts' : exts});
    });
});

storage.get('reload_freq', function(items) {
    var freq = items.reload_freq;
    freq = freq ? freq : defaultReloadFreq;

    $.each($('#reload-freq option'), function(k, v) {
        if($(v).val() == freq) {
            $(v).prop('selected', 'selected');
        }
    });
});

$('#reload-freq').change(function() {
    storage.set({'reload_freq' : $(this).val()});
});

storage.get('exclude_exts', function(items) {
    var exts = items.exclude_exts;
    if(!exts) {
        return;
    }

    $.each(exts, function(k, v) {
        $('input[value="' + k + '"]').prop('checked', false);
    });
});
