# Markdown Preview Plus

[![PayPal_Me][paypal-me-shield]][paypal-me]

Automatically parses markdown files (.md) into HTML. This is useful
if you're writing markdown (ultimately targeting HTML) and want a quick
preview.

[Get it for Chrome][webstore]

Features
--------

1. Support auto reload.
1. Support external css file.
1. Customize theme for every md file.
1. Support github flavored markdown.
1. Export nicely formatted HTML.
1. KaTex support
1. MathJax support
1. Mermaid support

Usage
-----

1. Install extension from [webstore][] (creates no new UI)
2. Check "Allow access to file URLs" in `chrome://extensions` listing: ![fileurls](http://i.imgur.com/qth3K.png)
3. Open local or remote .md file in Chrome.
4. See nicely formatted HTML!

Math Syntax
-----------

Markdown Preview Plus uses the KaTex engine to support rendering of
mathematical expressions.  Markdown Preview Plus supports the following math
syntax.  To minimize interference between Markdown and KaTex, some standard
LaTeX delimiters (indicated below) are disabled by default to avoid conflict
with Markdown syntax.  LaTeX syntax can be enabled in the options.

### Inline Math ###

* __Single Dollar Signs__ (requires LaTeX delimiters):
  <code class="tex2jax_ignore">`$math$`</code>.  When LaTeX syntax is enabled,
  dollar signs used in non-math contexts should be escaped with a backslash:
  <code class="tex2jax_ignore">`\$`</code>

* __Single Backslash with Parentheses__ (requires LaTex delimiters):
  <code class="tex2jax_ignore">`\(math\)`</code>.  Conflicts with Markdown's
  escaped syntax for parentheses `\(`.

* __Double Backslash with Parentheses__:
  <code class="tex2jax_ignore">`\\(math\\)`</code>

* __Single Dollar with Backquote__:
  <code class="tex2jax_ignore">``$`math`$``</code>

### Display Math ###

* __Single Backslash with Brackets__ (requires LaTeX delimiters):
  <code class="tex2jax_ignore">`\[math\]`</code>.  Conflicts with Markdown's
  escaped syntax for brackets `\[`.

* __Double Backslash with Brackets__:
  <code class="tex2jax_ignore">`\\[math\\]`</code>

* __Double Dollar Signs__:
  <code class="tex2jax_ignore">`$$math$$`</code>

* __Math Code Block__:
  ````
  ```math
  math
  ```
  ````

Credits
-----

This extension uses the following open source components:

* [Marked][marked] - A markdown parser written in JavaScript
* [markdown-friendly stylesheet][style] - The themes are based on the "Swiss" theme
* [markdown preview][mp] - The original markdown preview
* [mermaid][mermaid] - A Javascript based diagramming and charting tool
* [MathJax][mathjax] - A JavaScript display engine for LaTeX, MathML, and AsciiMath notation

Links
-----------------

* [Change Log](https://github.com/volca/markdown-preview/wiki/Changelog)

[paypal-me-shield]: https://img.shields.io/static/v1.svg?label=%20&message=PayPal.Me&logo=paypal
[paypal-me]: https://www.paypal.me/yanc888
[webstore]: https://chrome.google.com/webstore/detail/markdown-preview-plus/febilkbfcbhebfnokafefeacimjdckgl
[style]: http://kevinburke.bitbucket.org/markdowncss
[marked]: https://github.com/chjj/marked
[md]: http://en.wikipedia.org/wiki/Markdown
[mp]: https://github.com/borismus/markdown-preview
[mermaid]: https://github.com/mermaid-js/mermaid
[mathjax]: https://github.com/mathjax/MathJax

