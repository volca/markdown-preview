;(() => {

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        if (req.message === 'autoreload') {
            $.ajax({
                url: req.url.href,
                cache: false,
            }).done((data, textStatus, xhr) => {
                sendResponse({
                    data: data,
                    textStatus: textStatus,
                    contentType: xhr.getResponseHeader('Content-Type')
                });
            });
        }

        return true;
    });


})()
