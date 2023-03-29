;(() => {

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        if (req.message === 'autoreload') {
            fetch(req.url.href, {cache: "no-cache"})
                .then(response => sendResponse)
            /*
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
            */
            console.log("reload message")
        }

        return true;
    });


})()
