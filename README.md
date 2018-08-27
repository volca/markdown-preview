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
6. Support KaTex.

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

### Display Math ###

* __Single Backslash with Brackets__ (requires LaTeX delimiters):
  <code class="tex2jax_ignore">`\[math\]`</code>.  Conflicts with Markdown's
  escaped syntax for brackets `\[`.

* __Double Backslash with Brackets__:
  <code class="tex2jax_ignore">`\\[math\\]`</code>

* __Double Dollar Signs__:
  <code class="tex2jax_ignore">`$$math$$`</code>

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

