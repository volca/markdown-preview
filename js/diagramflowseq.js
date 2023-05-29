var diagramFlowSeq = {mermaidDivId: 0};

(function (){

var codeStatus = "InCodeStatus";
var multiMathStatus = "InMultiMath";
var emptyStatus = "" ;

function makeMermaidId(id) {
    return 'mermaidId' + id.toString();
}

function genNextMermaidDivId() {
    diagramFlowSeq.mermaidDivId += 1;
    return makeMermaidId(diagramFlowSeq.mermaidDivId);
}

function drawMermaid(id) {
    var divMermaid = document.getElementById(id);
    var txt = divMermaid.textContent;
    var tmpRendId = 'tmpMerId' + id;
    var tmpDiv = document.createElement('div');
    tmpDiv.id = tmpRendId;
    document.body.appendChild(tmpDiv);
    if (txt) {
        (async () => {
            const { svg } = await mermaid.render(tmpDiv.id, txt)
            divMermaid.innerHTML = svg
        })()
    }
}

function resetDivId() {
    diagramFlowSeq.mermaidDivId = 0;
}

function drawAllMermaid() {
    for (var i = 1; i <= diagramFlowSeq.mermaidDivId; ++i) {
        var mermaidId = makeMermaidId(i);
        drawMermaid(mermaidId);
    }
}

function renderKatex(srcMath, isDisplay) {
    const unEscape = function (html) {
        return html
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, '\'')
            .replace(/\\$/g, '');
    };
    let repMath = "";
    srcMath = unEscape(srcMath);
    try {
        repMath = katex.renderToString(srcMath, {displayMode: isDisplay});
    }
    catch(err) {
        console.error("katex parse math string[" + srcMath + "] failed! throw error: " + err);
        repMath = "";
    }
    return repMath;
}

function replaceMathString(src) {
    // patch: Troy Daniel
    // A regex expression to exclude the code tag with the help of look-around operation is not preferred, due to:
    // This is a <code>$x$</code> to produce $x$, and a <code>$y$</code> to produce $y$,
    // If we apply the look-around, the first capture will be '$</code> to produce $', which is not correct
    // Therefore, a simple way, split the src at 'code block',
    // Known bugs:
    // \`$abcd$\` and \<code>$abcd$\</code>  won't render, actually, I don't hnow what's the espected result.
    var reCode = /(`|<code[^>]*>)\s*(\\.|.)*?(`|<\/code>)/g;
    var codes = [...src.matchAll(reCode)];
    var parts = [];
    var startIndex = 0;
    for(const g of codes){
        parts.push(renderInlineMath(src.substring(startIndex, g.index)));
        parts.push(src.substr(g.index, g[0].length));
        startIndex = g.index + g[0].length;
    }
    parts.push(renderInlineMath(src.substring(startIndex)));
    return parts.join("");

    function renderInlineMath(plainStr){
        var out = plainStr;
        var pattern = /(\$`)((?:\\.|[\s\S])+?)(`\$)|(\${1,2})((?:\\.|[\s\S])+?)\4|(\\\[)((?:\\.|[\s\S])+?)(\\])|(\\\()((?:\\.|[\s\S])+?)(\\\))/g;
        var mc = null;
        while (null != (mc = pattern.exec(plainStr))) {
            var srcMath = "";
            var isDisplay = false;
            if (mc[1]) { //match $` `$
                isDisplay = false;
                srcMath = mc[2];
            } else if (mc[4]) { //match $ or $$
                srcMath = mc[5];
                isDisplay = (mc[4] === '$$');
            } else if (mc[6]) { //match \\[ \\]
                isDisplay = true;
                srcMath = mc[7];
            } else if (mc[9]) { //match \\( \\)
                isDisplay = false;
                srcMath = mc[10];
            }

            var repMath = renderKatex(srcMath, isDisplay);
            if (repMath && repMath.length !== 0) {
                out = out.replace(mc[0], repMath);
            }
        }
        return out.replace(/\\<span/g, '<span');
    }
}

function prepareSpecialCode(lang, code) {
    var retStr = "";
    if (lang === "math") {
        retStr = renderKatex(code, true);
    } else if (lang === "mermaid") {
        var mermiadId = genNextMermaidDivId();
        retStr = '<div id=\"' + mermiadId + '\">' + code + '</div>\n';
    } else if (lang === "puml") {
        if (window.navigator.onLine) {
            const umlCode = platumlEncoder.platumlCompress(code);
            retStr = '<img src=\"' + umlCode + '\">\n';
        } else {
            retStr = '<code>' + code + '</code>\n';
        }
    }
    return retStr;
}

function isStartMultiMath(src) {
    var pattern = /^(\s*)(\${2})|^(\s*)(\\\[)/g;
    var npt = /(\${2})((?:\\.|[\s\S])+?)\1|(\\\[)((?:\\.|[\s\S])+?)(\\])/g;
    var mc = null;
    var ret = false;
    if (null != (mc = pattern.exec(src)) && null == npt.exec(src)) {
        ret = true;
    }
    return ret;
}

function isEndMultiMath(src) {
    var pattern = /(\${2})(\s*)$|(\\])(\s*)$/g;
    var mc = null;
    var ret = false;
    if (null != (mc = pattern.exec(src))) {
        ret = true;
    }
    return ret;
}

function prepareDiagram(data) {
    var lines = data.split('\n');
    var retStr = "";
    var curStatus = "";
    var preLangs = ["math", "mermaid", "puml"];
    var lang = "";
    var tmpCode = "";
    var isInCode = function () { 
        return curStatus === codeStatus; 
    }
    var isInMultiMath = function () {
        return curStatus === multiMathStatus; 
    }
    var setCurStatus = function(status) {
        curStatus = status;
    }
    var isPrepareLang = function() {
        return preLangs.indexOf(lang) !== -1;
    }
    var isStartCode = function(src) {
        var pattern = /^(`{3,})(\w*)/g;
        var mc = null;
        var ret = false;
        if (null != (mc = pattern.exec(src))) {
            lang = mc[2];
            ret = true;
        }
        return ret;
    }
    var isEndCode = function(src) {
        var pattern = /^(`{3,})(\w*)/g;
        var mc = null;
        var ret = false;
        if (null != (mc = pattern.exec(src))) {
            ret = true;
        }
        return ret;
    }

    resetDivId();
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        if (isInCode() && isEndCode(line)) {
            var specialCode = prepareSpecialCode(lang, tmpCode);
            if (specialCode.length > 0) {
                retStr += specialCode;
            } else {
                retStr += line + "\n";
            }
            line = "\n";
            setCurStatus(emptyStatus);
        }
        if (isInMultiMath() && isEndMultiMath(line)) {
            tmpCode += line;
            retStr += replaceMathString(tmpCode.replace("\n", "\t")) + "\n";
            line = "\n";
            setCurStatus(emptyStatus);
        }

        if (!isInCode() && isStartCode(line)) {
            setCurStatus(codeStatus);
            if (isPrepareLang()) {
                tmpCode = "";
                line = "\n";
            }
        }
        if (!isInMultiMath() && isStartMultiMath(line)) {
            setCurStatus(multiMathStatus);
            tmpCode = line;
            lang = "";
            line = "\n";
        }

        if (!isInCode() && !isInMultiMath()) {
            var mathSrc = replaceMathString(line);
            retStr += (mathSrc + '\n');
        } else {
            if (isPrepareLang() || isInMultiMath()) {
                line = line.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '');
                if (line.length > 0) {
                    tmpCode += (line + '\n');
                }
            } else {
                retStr += (line + '\n');
            }
        }
    }
    return retStr;
}

//Expose
diagramFlowSeq.drawAllMermaid = drawAllMermaid;
diagramFlowSeq.prepareDiagram = prepareDiagram;

})();
