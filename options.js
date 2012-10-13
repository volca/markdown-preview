"use strict";

var storage = chrome.storage.local;
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

storage.get('theme', function(items) {
    if(items.theme) {
        $('#theme').val(items.theme);
    } 
});
