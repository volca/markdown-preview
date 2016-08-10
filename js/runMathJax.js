(function(document) {
    if ((typeof window.MathJax != 'undefined') && (typeof window.MathJax.Hub != 'undefined')) {

        // Apply MathJax typesetting
        var mathjaxDiv = document.getElementById("mathjaxProcessing");

        // Apply Markdown parser after MathJax typesetting is complete
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub,
                                  mathjaxDiv]);

        window.MathJax.Hub.Register.StartupHook("End Typeset",
            function () {
                marked.setOptions({
                    highlight : function(code) {
                        return hljs.highlightAuto(code).value;
                    }
                });

                // Convert Markdown to HTML and replace document body
                var html = marked(mathjaxDiv.innerHTML);
                document.body.innerHTML = html;

                // Remove div used for MathJax processing
                mathjaxDiv.remove();
            }
        );
    }
}(document));
