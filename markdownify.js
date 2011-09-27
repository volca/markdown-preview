// Onload, take the DOM of the page, get the markdown formatted text out and
// apply the converter.
var converter = new Showdown.converter();
var html = converter.makeHtml(document.body.innerText);
document.body.innerHTML = html;

// Also inject a reference to the default stylesheet to make things look nicer.
var ss = document.createElement('link');
ss.type = 'text/css';
ss.rel = 'stylesheet';
ss.href = chrome.extension.getURL('markdown.css');
document.getElementsByTagName('head')[0].appendChild(ss);
