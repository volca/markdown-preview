const { execSync } = require('child_process')

execSync("npx copyfiles -f node_modules/jquery/dist/jquery.js js/")
execSync("npx copyfiles -f node_modules/marked/marked.min.js js/")
execSync("npx copyfiles -f node_modules/mermaid/mermaid.min.js js/")
