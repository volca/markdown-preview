var keyAutoReload = 'mp_auto_reload';
var storage = chrome.storage.local;
storage.get(keyAutoReload, function(response) {
    if(response[keyAutoReload]) {
        $('#auto-reload').attr('checked', 'checked');
    } else {
        $('#auto-reload').removeAttr('checked');
    }

});

$('#settings-form').submit(function() {
    if(!!$('#auto-reload').attr('checked')) {
        storage.set({keyAutoReload : 1});
    } else {
        storage.remove(keyAutoReload);
    }
    return false;
});
