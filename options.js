"use strict";

var storage = chrome.storage.local;

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
storage.get('theme', function(items) {
    if(items.theme) {
        $('#theme').val(items.theme);
    } 
});

$('#theme').change(function() {
    storage.set({'theme' : $(this).val()});
});


$('#css-file').change(function(e) {
    var file = e.target.files[0],
        reader = new FileReader();

    reader.onload = function(evt) {
        var fileString = evt.target.result;
        alert(fileString);
    };
    reader.readAsText(file);
});

$('#btn-add-css').click(function() {
});
