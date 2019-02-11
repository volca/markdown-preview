var diagramFlowSeq = {seqDivId : 0,  flowDivId : 0};

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
};

function makeSeqId(id) {
    return 'diagSeqId' + id.toString();
}

function makeFlowId(id) {
    return 'diagFlowId' + id.toString();
}

function genNextSeqDivId() {
    diagramFlowSeq.seqDivId += 1;
    return makeSeqId(diagramFlowSeq.seqDivId);
}

function genNextFlowDivId() {
    diagramFlowSeq.flowDivId += 1;
    return makeFlowId(diagramFlowSeq.flowDivId);
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

function resetDivId() {
    diagramFlowSeq.seqDivId = 0;
    diagramFlowSeq.flowDivId = 0;
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

function replaceMathString(src) {
    var out = src;
    var pattern = /(\${1,2})((?:\\.|[\s\S])+?)\1|(\\\[)((?:\\.|[\s\S])+?)(\\])|(\\\()((?:\\.|[\s\S])+?)(\\\))/g;
    var mc = null;
    var codeBegin = src.search('<code>');
    var codeEnd = src.search('</code>');
    var unEscape = function(html) {
        return html
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, '\'');
    }
    while (null != (mc = pattern.exec(src))) {
        //I don't know how to build the regular expression to exclude the Code tag.
        if(codeBegin > -1 && codeEnd > -1 && mc.index > codeBegin && mc.index < codeEnd) {
            console.debug("math string[" + mc[0] + "] in code tag!");
        }
        else {
            var srcMath = "";
            var isDisplay = false;
            if (mc[1]) { //match $ or $$
                srcMath = mc[2];
                if(mc[1] === '$$') {
                    isDisplay = true;
                }
                else {
                    isDisplay = false;
                }
            }
            else if (mc[3]) { //match \\[ \\]
                isDisplay = true;
                srcMath = mc[4];
            }
            else if (mc[6]) { //match \\( \\)
                isDisplay = false;
                srcMath = mc[7];
            }

            var repMath = "";
            srcMath = unEscape(srcMath);
            try {
                repMath = katex.renderToString(srcMath, {displayMode: isDisplay});
            }
            catch(err) {
                console.error("kate parse math string[" + srcMath + "] failed! throw error: " + err);
                repMath = "";
            }
            if (repMath && repMath.length != 0) {
                out = out.replace(mc[0], repMath);
            }
        }
    }
    return out;
}

//Expose
diagramFlowSeq.genNextSeqDivId = genNextSeqDivId;
diagramFlowSeq.genNextFlowDivId = genNextFlowDivId;
diagramFlowSeq.makeSeqId = makeSeqId;
diagramFlowSeq.makeFlowId = makeFlowId;
diagramFlowSeq.drawAllSeq = drawAllSeq;
diagramFlowSeq.drawAllFlow = drawAllFlow;
diagramFlowSeq.resetDivId = resetDivId;
diagramFlowSeq.replaceMathString = replaceMathString; 

})();
