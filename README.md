# Markdown Preview Plus

Automatically parses markdown files (.md) into HTML. This is useful
if you're writing markdown (ultimately targeting HTML) and want a quick
preview.

[Get it for Chrome][webstore]

Features
--------

1. Support auto reload.
2. Support external css file.
3. Customize theme for every md file.
4. Support github flavored markdown.
5. Export nicely formatted HTML.
6. Support MathJax.

Usage
-----

1. Install extension from [webstore][] (creates no new UI)
2. Check "Allow access to file URLs" in `chrome://extensions` listing: ![fileurls](http://i.imgur.com/qth3K.png)
3. Open local or remote .md file in Chrome.
4. See nicely formatted HTML!

Supported Math Syntax
---------------------

To minimize conflict between Markdown and MathJax, MathJax has been configured
to recognize the following math syntax.  Unfortunately, several standard LaTeX
delimiters were explicitly disabled to avoid conflict with Markdown syntax
(i.e., we prioritized Markdown over LaTeX).

### Inline Math ###

* __Double Backslash with Parentheses__:
  <span class="tex2jax_ignore">`\\(math\\)`<span/>

### Display Math ###

* __Double Dollar Signs__:
  <span class="tex2jax_ignore">`$$math$$`<span/>

* __Double Backslash with Brackets__:
  <span class="tex2jax_ignore">`\\[math\\]`<span/>

* __LaTeX Environments__:
  <span class="tex2jax_ignore">`\begin{equation}math\end{equation}`<span/>

### Unsupported Math Syntax ###

* __Single Dollar Signs__:
  <span class="tex2jax_ignore">`$math$`<span/>.
  This syntax (from LaTeX) is not supported because it conflicts with the use
  of the dollar sign in financial contexts.

* __Single Backslash with Parentheses__:
  <span class="tex2jax_ignore">`\(math\)`<span/>.
  This syntax (from LaTeX) is not supported because it conflicts with
  Markdown's escaped syntax for parentheses `\(`.

* __Single Backslash with Brackets__:
  <span class="tex2jax_ignore">`\[math\]`<span/>.
  This syntax (from LaTeX) is not supported because it conflicts with
  Markdown's escaped syntax for brackets `\[`.

Thanks
------

Thanks to Kevin Burke for his [markdown-friendly stylesheet][style],
to chjj for his [JavaScript markdown processor][marked],
to Boris Smus for his [Markdown Preview][mp] and to
Swartz and Gruber for [Markdown][md].

[webstore]: https://chrome.google.com/webstore/detail/markdown-preview-plus/febilkbfcbhebfnokafefeacimjdckgl
[style]: http://kevinburke.bitbucket.org/markdowncss
[marked]: https://github.com/chjj/marked
[md]: http://en.wikipedia.org/wiki/Markdown
[mp]: https://github.com/borismus/markdown-preview


Links
-----------------

* [Change Log](https://github.com/volca/markdown-preview/wiki/Changelog)

