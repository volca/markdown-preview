var cdnPrefix = 'https://cdn.jsdelivr.net/gh/volca/markdown-preview/';
var cssFile = $('link#theme').attr('href').split('/').pop()
$('link#theme').attr('href',  cdnPrefix + 'theme/' + cssFile);

chrome.storage.local.get('toc', value => {
    if ((typeof value['toc'] != 'undefined') || (value['toc'] != 0)) {
        $('head').append(
            $('<link/>')
                .attr('rel', 'stylesheet')
                .attr('href', cdnPrefix + 'theme/MarkdownTOC.css')
        )
    }
    var html = $('html').html()
    var s = $("<textarea/>").text(html);
    $(document.body).append(s);
    s.select();
    document.execCommand("copy"); 
    s.remove(); 
    alert("Copied to clipboard");
})
