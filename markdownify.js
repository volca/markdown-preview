(function(document) {

  // Onload, take the DOM of the page, get the markdown formatted text out and
	// apply the converter.
 	function makeHtml(data) {
		var html = (new Showdown.converter()).makeHtml(data);
		$(document.body).html(html);
	}

	makeHtml(document.body.innerText);

	// Also inject a reference to the default stylesheet to make things look nicer.
	var ss = document.createElement('link');
	ss.rel = 'stylesheet';
	ss.href = chrome.extension.getURL('markdown.css');
	document.head.appendChild(ss);

	var href = location.href;

	setInterval(function() {
		$.ajax({
			url : href, 
			cache : false,
			success : function(data) { makeHtml(data); }
		});
	}, 3000);

}(document));
