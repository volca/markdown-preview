var flowSeq = (function() {

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

var seqDivId = 0;
var flowDivId = 0;

function makeSeqId(id) {
    return 'diagSeqId' + id.toString();
}

function makeFlowId(id) {
    return 'diagFlowId' + id.toString();
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

})();
