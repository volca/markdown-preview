# Contributing to Markdown Preview Plus

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to Markdown Preview Plus on GitHub. These are just guidelines, not rules, use your best judgment and feel free to propose changes to this document in a pull request.

## Working with Git and GitHub

*Pull requests for new features and major fixes should be opened against the `master` branch.*

Avoid intermediate merge commits. [Rebase](https://www.atlassian.com/git/tutorials/merging-vs-rebasing) your feature branch onto `master` to pull updates and verify your local changes against them before placing the pull request.

### General flow
1. [Fork](https://help.github.com/articles/fork-a-repo) the Markdown Preview Plus repo on GitHub.
1. [Create a branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/#creating-a-branch) in your fork on GitHub **based on the `master` branch**.
1. Clone the fork on your machine with `git clone https://github.com/<your-account>/<markdown-preview-plus-fork>.git`
1. `cd <markdown-preview-plus-fork>` then run `git remote add upstream https://github.com/volca/markdown-preview.git`
1. `git checkout <branch-name>`
1. Make changes to the code base and commit them using e.g. `git commit -a -m 'Look ma, I did it'`
1. When you're done:
 1. [Squash your commits](http://www.andrewconnell.com/blog/squash-multiple-git-commits-into-one) into one. There are [several ways](http://stackoverflow.com/a/5201642/131929) of doing this.
 1. Bring your fork up-to-date with the Markdown Preview Plus upstream repo ([see below](#keeping-your-fork-in-sync)). Then rebase your branch on `master` running `git rebase master`.
1. `git push`
1. [Create a pull request](https://help.github.com/articles/creating-a-pull-request/) (PR) on GitHub. 

This is just one way of doing things. If you're proficient in Git matters you're free to choose your own. If you want to read more then the [GitHub chapter in the Git book](http://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project#The-GitHub-Flow) is a way to start. [GitHub's own documenation](https://help.github.com/categories/collaborating/) contains a wealth of information as well.

### Keeping your fork in sync
You need to sync your fork with the Markdown Preview Plus upstream repository from time to time, latest before you rebase (see flow above).

1. `git fetch upstream`
1. `git checkout master`
1. `git merge upstream/master`

## Commit messages

From: [http://git-scm.com/book/ch5-2.html](http://git-scm.com/book/ch5-2.html)
<pre>
Short (50 chars or less) summary of changes

More detailed explanatory text, if necessary.  Wrap it to about 72
characters or so.  In some contexts, the first line is treated as the
subject of an email and the rest of the text as the body.  The blank
line separating the summary from the body is critical (unless you omit
the body entirely); tools like rebase can get confused if you run the
two together.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded by a
   single space, with blank lines in between, but conventions vary here
</pre>

Don't forget to [reference affected issues](https://help.github.com/articles/closing-issues-via-commit-messages/) in the commit message to have them closed automatically on GitHub.

[Amend](https://help.github.com/articles/changing-a-commit-message/) your commit messages if necessary to make sure what the world sees on GitHub is as expressive and meaningful as possible.
