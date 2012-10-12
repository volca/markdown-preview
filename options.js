var storage = chrome.storage.local;
storage.get('auto_reload', function(items) {
    console.log(items.auto_reload);

    if(items.auto_reload) {
        $('#auto-reload').attr('checked', 'checked');
    } else {
        $('#auto-reload').removeAttr('checked');
    }

});

$('#settings-form').submit(function() {
    if(!!$('#auto-reload').attr('checked')) {
        storage.set({'auto_reload' : 1}, function() {
            alert('Setting saved');
        });
    } else {
        storage.remove('auto_reload');
    }
    return false;
});
