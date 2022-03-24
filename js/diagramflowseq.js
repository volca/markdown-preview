var diagramFlowSeq = {seqDivId: 0, flowDivId: 0, mermaidDivId: 0};

(function (){

var flowStyle = {
    'x': 0,
    'y': 0,
    'line-width': 3,
    'line-length': 50,
    'text-margin': 10,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': 'yes',
    'no-text': 'no',
    'arrow-end': 'block',
    'scale': 1,
    // style symbol types
    'symbols': {
        'start': {
            'font-color': 'red',
            'element-color': 'green',
            'fill': 'yellow'
        },
        'end':{
            'class': 'end-element'
        }
    },
    // even flowstate support ;-)
    'flowstate' : {
        'past' : { 'fill' : '#CCCCCC', 'font-size' : 12},
        'current' : {'fill' : 'yellow', 'font-color' : 'red', 'font-weight' : 'bold'},
        'future' : { 'fill' : '#FFFF99'},
        'request' : { 'fill' : 'blue'},
        'invalid': {'fill' : '#444444'},
        'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
        'rejected' : { 'fill' : '#C45879', 'font-size' : 12, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
    }
}
var codeStatus = "InCodeStatus";
var multiMathStatus = "InMultiMath";
var emptyStatus = "" ;

function makeSeqId(id) {
    return 'diagSeqId' + id.toString();
}

function makeFlowId(id) {
    return 'diagFlowId' + id.toString();
}

function makeMermaidId(id) {
    return 'mermaidId' + id.toString();
}

function genNextSeqDivId() {
    diagramFlowSeq.seqDivId += 1;
    return makeSeqId(diagramFlowSeq.seqDivId);
}

function genNextFlowDivId() {
    diagramFlowSeq.flowDivId += 1;
    return makeFlowId(diagramFlowSeq.flowDivId);
}

function genNextMermaidDivId() {
    diagramFlowSeq.mermaidDivId += 1;
    return makeMermaidId(diagramFlowSeq.mermaidDivId);
}

function drawSeq(id) {
    var divSeq = document.getElementById(id);
    var txt = divSeq.getAttribute('seq');
    if(txt) {
        var diagram = Diagram.parse(txt);
        diagram.drawSVG(id, {theme: 'hand'});
    }
}

function drawFlow(id) {
    var divFlow = document.getElementById(id);
    var txt = divFlow.getAttribute('flow');
    if(txt) {
        var diagram = flowchart.parse(txt);
        diagram.drawSVG(id, flowStyle);
    }
}

function drawMermaid(id) {
    var divMermaid = document.getElementById(id);
    var txt = divMermaid.textContent;
    var tmpRendId = 'tmpMerId' + id;
    var tmpDiv = document.createElement('div');
    tmpDiv.id = tmpRendId;
    document.body.appendChild(tmpDiv);
    if (txt) {
        divMermaid.innerHTML = mermaid.mermaidAPI.render(tmpDiv.id, txt, function(svgCode, bindFunctions) {});
    }
}

function resetDivId() {
    diagramFlowSeq.seqDivId = 0;
    diagramFlowSeq.flowDivId = 0;
    diagramFlowSeq.mermaidDivId = 0;
}

function drawAllSeq() {
    for (var i = 1; i <= diagramFlowSeq.seqDivId; ++i) {
        var seqid = makeSeqId(i);
        drawSeq(seqid);
    }
}

function drawAllFlow() {
    for (var i = 1; i <= diagramFlowSeq.flowDivId; ++i) {
        var flowid = makeFlowId(i);
        drawFlow(flowid);
    }
}

function drawAllMermaid() {
    for (var i = 1; i <= diagramFlowSeq.mermaidDivId; ++i) {
        var mermaidId = makeMermaidId(i);
        drawMermaid(mermaidId);
    }
}

function renderKatex(srcMath, isDisplay, useAM) {
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
        if (useAM && renderKatex.AMenabled) {
            srcMath = asciimath.am2tex(srcMath, isDisplay);
        }
        repMath = katex.renderToString(srcMath, {displayMode: isDisplay});
    }
    catch(err) {
        console.error("katex parse math string[" + srcMath + "] failed! throw error: " + err);
        repMath = "";
    }
    return repMath;
}

function replaceMathString(src) {
    var out = src;
    var pattern = /(\$`)((?:\\.|[\s\S])+?)(`\$)|(\${1,2})((?:\\.|[\s\S])+?)\4|(\\\[)((?:\\.|[\s\S])+?)(\\])|(\\\()((?:\\.|[\s\S])+?)(\\\))|(``)([^]+?)(``)/g;
    var mc = null;
    var codeBegin = src.search('<code>');
    var codeEnd = src.search('</code>');
    while (null != (mc = pattern.exec(src))) {
        //I don't know how to build the regular expression to exclude the Code tag.
        if(codeBegin > -1 && codeEnd > -1 && mc.index > codeBegin && mc.index < codeEnd) {
            console.debug("math string[" + mc[0] + "] in code tag!");
        } else {
            var srcMath = "";
            var isDisplay = false;
            var useAM = false;
            if (mc[1]) { //match $` `$
                isDisplay = false;
                srcMath = mc[2];
            } else if (mc[4]) { //match $ or $$
                srcMath = mc[5];
                isDisplay = mc[4] === '$$';
            } else if (mc[6]) { //match \\[ \\]
                isDisplay = true;
                srcMath = mc[7];
            } else if (mc[9]) { //match \\( \\)
                isDisplay = false;
                srcMath = mc[10];
            } else if (mc[12]) { //match ``
                isDisplay = false;
                srcMath = mc[13];
                useAM = true;
            }

            var repMath = renderKatex(srcMath, isDisplay, useAM);
            if (repMath && repMath.length !== 0) {
                out = out.replace(mc[0], repMath);
            }
        }
    }
    return out.replace(/\\<span/g, '<span')
              .replace(/<annotation[^<]*<\/annotation>/g, '')
}

function prepareSpecialCode(lang, code) {
    var retStr = "";
    if (lang === "sequence") {
        var seqid = genNextSeqDivId();
        retStr = '<div id=\"' + seqid + '\" seq=\"' + code + '\"></div>\n';
    } else if (lang === "flow") {
        var flowid = genNextFlowDivId();
        retStr = '<div id=\"' + flowid + '\" flow=\"' + code + '\"></div>\n';
    } else if (lang === "puml") {
        if (window.navigator.onLine) {
            var umlCode = platumlEncoder.platumlCompress(code);
            retStr = '<img src=\"' + umlCode + '\">\n';
        } else {
            retStr = '<code>' + code + '</code>\n';
        }
    } else if (lang === "math") {
        retStr = renderKatex(code, true);
    } else if (lang === "asciimath" || lang === "AM") {
        retStr = renderKatex(code, true, true);
    } else if (lang === "mermaid") {
        var mermiadId = genNextMermaidDivId();
        retStr = '<div id=\"' + mermiadId + '\">' + code + '</div>\n';
    }
    return retStr;
}

function isStartMultiMath(src) {
    var pattern = /^(\s*)(\${2})|^(\s*)(\\\[)/g;
    var npt = /(\${2})((?:\\.|[\s\S])+?)\1|(\\\[)((?:\\.|[\s\S])+?)(\\])/g;
    return pattern.test(src) && !npt.test(src);
}

function isEndMultiMath(src) {
    var pattern = /(\${2})(\s*)$|(\\])(\s*)$|(``)(\s*)$/g;
    return pattern.test(src);
}

function prepareDiagram(data, AMenabled) {
    renderKatex.AMenabled = AMenabled
    var lines = data.split('\n');
    var retStr = "";
    var curStatus = "";
    var preLangs = ["flow", "sequence", "puml", "math", "mermaid", "asciimath", "AM"];
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
        return preLangs.indexOf(lang) != -1;
    }
    var isStartCode = function(src) {
        var pattern = /^\s*(`{3,})(\w*)/g;
        var mc = null;
        var ret = false;
        if (null != (mc = pattern.exec(src))) {
            lang = mc[2];
            ret = true;
        }
        return ret;
    }
    var isEndCode = function(src) {
        var pattern = /^\s*(`{3,})(\w*)/g;
        return pattern.test(src)
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
diagramFlowSeq.drawAllSeq = drawAllSeq;
diagramFlowSeq.drawAllFlow = drawAllFlow;
diagramFlowSeq.drawAllMermaid = drawAllMermaid;
diagramFlowSeq.prepareDiagram = prepareDiagram;

})();
