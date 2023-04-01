;(() => {

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        if (req.message === 'autoreload') {
            (async () => {
                try {
                    const res = await fetch(req.url.href, {cache: "no-cache"})
                    const text = await res.text()
                    sendResponse({
                        data: text
                    })
                } catch(e) {
                    //
                }
            })()
        }

        return true;
    });


})()
