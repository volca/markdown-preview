const { execSync } = require('child_process')

execSync("npx copyfiles -f node_modules/jquery/dist/jquery.js js/")
execSync("npx copyfiles -f node_modules/marked/marked.min.js js/")
execSync("npx copyfiles -f node_modules/marked-highlight/lib/index.cjs js/marked-highlight")
execSync("npx copyfiles -f node_modules/mermaid/dist/mermaid.min.js js/")
