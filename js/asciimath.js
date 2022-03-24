/*
asciimath.js
============

This file is modified from ASCIIMathML.js by zmx0142857 <892298182@qq.com>

put this file in the same folder with your html file and append
following line to the <body> of the html file:

  <script src="asciimath.js"></script>

to overwrite default configurations, add following lines *BEFORE*
including this file:

  <script>
  var asciimath = {
    // key1: value1,
    // key2: value2,
    // ...
  };
  </script>

Default Configurations & API

  env: undefined        // default to browser
  katexpath: 'katex.min.js',// use katex as fallback if no MathML.
  katex: undefined,     // true=always, false=never, undefined=auto
  onload: autorender,   // this function is called when asciimath is ready

  fixepsi: true,        // false to return to legacy epsi/varepsi mapping
  fixphi: true,         // false to return to legacy phi/varphi mapping

  delim1: '`',          // asciimath delimiter character 1
  displaystyle:true,    // put limits above and below large operators
  viewsource: false,    // show asciimath source code on mouse hover
  fontsize: undefined,  // change to e.g. '1.2em' for larger fontsize
  fontfamily: undefined,// inherit
  color: undefined,     // inherit
  define: Object,       // describe substitutions like c macro

  symbols: Array,       // symbols recognized by asciimath parser
  texstr: String,       // last return value of am2tex
  am2tex: function,     // am2tex(str) -> texstr
  render: function,     // render(node)

*/

/*
ASCIIMathML.js
==============
This file contains JavaScript functions to convert ASCII math notation
and (some) LaTeX to Presentation MathML. The conversion is done while the
HTML page loads, and should work with Firefox and other browsers that can
render MathML.

Just add the next line to your HTML page with this file in the same folder:

<script type="text/javascript" src="ASCIIMathML.js"></script>

Version 2.2 Mar 3, 2014.
Latest version at https://github.com/mathjax/asciimathml
If you use it on a webpage, please send the URL to jipsen@chapman.edu

Copyright (c) 2014 Peter Jipsen and other ASCIIMathML.js contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

// API
var asciimath;
if (typeof asciimath == 'undefined')
  asciimath = {};

// independent namespace
(function(){

var AM = asciimath; // shorthand for 'asciimath'
var AMnames = {};   // input entry for symbols

// token types
var CONST = 0,
  UNARY = 1,
  BINARY = 2,
  INFIX = 3,
  LEFTBRACKET = 4,
  RIGHTBRACKET = 5,
  SPACE = 6,
  UNDEROVER = 7,
  //DEFINITION = 8,
  LEFTRIGHT = 9,
  TEXT = 10,
  BIG = 11,
  LONG = 12,
  STRETCHY = 13,
  MATRIX = 14,
  UNARYUNDEROVER = 15;

function initSymbols() {

// character lists for Mozilla/Netscape fonts
//AM.cal = ['\uD835\uDC9C','\u212C','\uD835\uDC9E','\uD835\uDC9F','\u2130','\u2131','\uD835\uDCA2','\u210B','\u2110','\uD835\uDCA5','\uD835\uDCA6','\u2112','\u2133','\uD835\uDCA9','\uD835\uDCAA','\uD835\uDCAB','\uD835\uDCAC','\u211B','\uD835\uDCAE','\uD835\uDCAF','\uD835\uDCB0','\uD835\uDCB1','\uD835\uDCB2','\uD835\uDCB3','\uD835\uDCB4','\uD835\uDCB5',
//'\uD835\uDCB6','\uD835\uDCB7','\uD835\uDCB8','\uD835\uDCB9','\u212F','\uD835\uDCBB','\u210A','\uD835\uDCBD','\uD835\uDCBE','\uD835\uDCBF','\uD835\uDCC0','\uD835\uDCC1','\uD835\uDCC2','\uD835\uDCC3','\u2134','\uD835\uDCC5','\uD835\uDCC6','\uD835\uDCC7','\uD835\uDCC8','\uD835\uDCC9','\uD835\uDCCA','\uD835\uDCCB','\uD835\uDCCC','\uD835\uDCCD','\uD835\uDCCE','\uD835\uDCCF'];

//AM.frk = ['\uD835\uDD04','\uD835\uDD05','\u212D','\uD835\uDD07','\uD835\uDD08','\uD835\uDD09','\uD835\uDD0A','\u210C','\u2111','\uD835\uDD0D','\uD835\uDD0E','\uD835\uDD0F','\uD835\uDD10','\uD835\uDD11','\uD835\uDD12','\uD835\uDD13','\uD835\uDD14','\u211C','\uD835\uDD16','\uD835\uDD17','\uD835\uDD18','\uD835\uDD19','\uD835\uDD1A','\uD835\uDD1B','\uD835\uDD1C','\u2128',
//'\uD835\uDD1E','\uD835\uDD1F','\uD835\uDD20','\uD835\uDD21','\uD835\uDD22','\uD835\uDD23','\uD835\uDD24','\uD835\uDD25','\uD835\uDD26','\uD835\uDD27','\uD835\uDD28','\uD835\uDD29','\uD835\uDD2A','\uD835\uDD2B','\uD835\uDD2C','\uD835\uDD2D','\uD835\uDD2E','\uD835\uDD2F','\uD835\uDD30','\uD835\uDD31','\uD835\uDD32','\uD835\uDD33','\uD835\uDD34','\uD835\uDD35','\uD835\uDD36','\uD835\uDD37'];

//AM.bbb = ['\uD835\uDD38','\uD835\uDD39','\u2102','\uD835\uDD3B','\uD835\uDD3C','\uD835\uDD3D','\uD835\uDD3E','\u210D','\uD835\uDD40','\uD835\uDD41','\uD835\uDD42','\uD835\uDD43','\uD835\uDD44','\u2115','\uD835\uDD46','\u2119','\u211A','\u211D','\uD835\uDD4A','\uD835\uDD4B','\uD835\uDD4C','\uD835\uDD4D','\uD835\uDD4E','\uD835\uDD4F','\uD835\uDD50','\u2124',
//'\uD835\uDD52','\uD835\uDD53','\uD835\uDD54','\uD835\uDD55','\uD835\uDD56','\uD835\uDD57','\uD835\uDD58','\uD835\uDD59','\uD835\uDD5A','\uD835\uDD5B','\uD835\uDD5C','\uD835\uDD5D','\uD835\uDD5E','\uD835\uDD5F','\uD835\uDD60','\uD835\uDD61','\uD835\uDD62','\uD835\uDD63','\uD835\uDD64','\uD835\uDD65','\uD835\uDD66','\uD835\uDD67','\uD835\uDD68','\uD835\uDD69','\uD835\uDD6A','\uD835\uDD6B'];

//AM.scr = ['\u1D49C','\u1D49D','\u1D49E','\u1D49F','\u1D4A0','\u1D4A1','\u1D4A2','\u1D4A3','\u1D4A4','\u1D4A5','\u1D4A6','\u1D4A7','\u1D4A8','\u1D4A9','\u1D4AA','\u1D4AB;','\u1D4AC','\u1D4AD','\u1D4AE','\u1D4AF','\u1D4B0','\u1D4B1','\u1D4B2','\u1D4B3','\u1D4B4','\u1D4B5',
//'\u1D4B6','\u1D4B7','\u1D4B8','\u1D4B9','\u1D4BA','\u1D4BB','\u1D4BC','\u1D4BD','\u1D4BE','\u1D4BF','\u1D4C0','\u1D4C1','\u1D4C2','\u1D4C3','\u1D4C4','\u1D4C5','\u1D4C6','\u1D4C7','\u1D4C8','\u1D4C9','\u1D4CA','\u1D4CB','\u1D4CC','\u1D4CD','\u1D4CE','\u1D4CF'];

if (!AM.symbols) AM.symbols = [];

AM.symbols = AM.symbols.concat([
// greek letters
{input:'alpha',tag:'mi',output:'\u03B1',tex:null,ttype:CONST},
{input:'beta',tag:'mi',output:'\u03B2',tex:null,ttype:CONST},
{input:'gamma',tag:'mi',output:'\u03B3',tex:null,ttype:CONST},
{input:'Gamma',tag:'mo',output:'\u0393',tex:null,ttype:CONST},
{input:'delta',tag:'mi',output:'\u03B4',tex:null,ttype:CONST},
{input:'Delta',tag:'mtext',output:'\u0394',tex:null,ttype:CONST},
{input:'epsi',tag:'mi',output:AM.fixepsi?'\u03B5':'\u03F5',tex:AM.fixepsi?'varepsilon':'epsilon',ttype:CONST,notexcopy:true},
{input:'epsilon',tag:'mi',output:AM.fixepsi?'\u03B5':'\u03F5',tex:AM.fixepsi?'varepsilon':'epsilon',ttype:CONST,notexcopy:true},
{input:'varepsilon',tag:'mi',output:AM.fixepsi?'\u03F5':'\u03B5',tex:AM.fixepsi?'epsilon':'varepsilon',ttype:CONST,notexcopy:true},
{input:'zeta',tag:'mi',output:'\u03B6',tex:null,ttype:CONST},
{input:'eta',tag:'mi',output:'\u03B7',tex:null,ttype:CONST},
{input:'theta',tag:'mi',output:'\u03B8',tex:null,ttype:CONST},
{input:'Theta',tag:'mo',output:'\u0398',tex:null,ttype:CONST},
{input:'vartheta',tag:'mi',output:'\u03D1',tex:null,ttype:CONST},
{input:'iota',tag:'mi',output:'\u03B9',tex:null,ttype:CONST},
{input:'kappa',tag:'mi',output:'\u03BA',tex:null,ttype:CONST},
{input:'lambda',tag:'mi',output:'\u03BB',tex:null,ttype:CONST},
{input:'Lambda',tag:'mo',output:'\u039B',tex:null,ttype:CONST},
{input:'mu',tag:'mi',output:'\u03BC',tex:null,ttype:CONST},
{input:'nu',tag:'mi',output:'\u03BD',tex:null,ttype:CONST},
{input:'xi',tag:'mi',output:'\u03BE',tex:null,ttype:CONST},
{input:'Xi',tag:'mo',output:'\u039E',tex:null,ttype:CONST},
{input:'pi',tag:'mi',output:'\u03C0',tex:null,ttype:CONST},
{input:'Pi',tag:'mo',output:'\u03A0',tex:null,ttype:CONST},
{input:'rho',tag:'mi',output:'\u03C1',tex:null,ttype:CONST},
{input:'sigma',tag:'mi',output:'\u03C3',tex:null,ttype:CONST},
{input:'Sigma',tag:'mo',output:'\u03A3',tex:null,ttype:CONST},
{input:'tau',tag:'mi',output:'\u03C4',tex:null,ttype:CONST},
{input:'upsilon',tag:'mi',output:'\u03C5',tex:null,ttype:CONST},
{input:'phi',tag:'mi',output:AM.fixphi?'\u03D5':'\u03C6',tex:AM.fixphi?'phi':'varphi',ttype:CONST,notexcopy:true},
{input:'varphi',tag:'mi',output:AM.fixphi?'\u03C6':'\u03D5',tex:AM.fixphi?'varphi':'phi',ttype:CONST,notexcopy:true},
{input:'Phi',tag:'mo',output:'\u03A6',tex:null,ttype:CONST},
{input:'chi',tag:'mi',output:'\u03C7',tex:null,ttype:CONST},
{input:'psi',tag:'mi',output:'\u03C8',tex:null,ttype:CONST},
{input:'Psi',tag:'mi',output:'\u03A8',tex:null,ttype:CONST},
{input:'omega',tag:'mi',output:'\u03C9',tex:null,ttype:CONST},
{input:'Omega',tag:'mo',output:'\u03A9',tex:null,ttype:CONST},

// binary operators
//{input:'-',tag:'mo',output:'\u0096',tex:null,ttype:CONST},
{input:'*',tag:'mo',output:'\u22C5',tex:'cdot',ttype:CONST},
{input:'**',tag:'mo',output:'\u2217',tex:'ast',ttype:CONST},
{input:'***',tag:'mo',output:'\u22C6',tex:'star',ttype:CONST},
{input:'//',tag:'mo',output:'/',tex:'{/}',ttype:CONST,val:true},
{input:'\\\\',tag:'mo',output:'\\',tex:'backslash',ttype:CONST},
{input:'setminus',tag:'mo',output:'\\',tex:null,ttype:CONST},
{input:'xx',tag:'mo',output:'\u00D7',tex:'times',ttype:CONST},
{input:'|><',tag:'mo',output:'\u22C9',tex:'ltimes',ttype:CONST},
{input:'><|',tag:'mo',output:'\u22CA',tex:'rtimes',ttype:CONST},
{input:'|><|',tag:'mo',output:'\u22C8',tex:'bowtie',ttype:CONST},
{input:'-:',tag:'mo',output:'\u00F7',tex:'div',ttype:CONST},
{input:'@',tag:'mo',output:'\u2218',tex:'circ',ttype:CONST},
{input:'o+',tag:'mo',output:'\u2295',tex:'oplus',ttype:CONST},
{input:'ox',tag:'mo',output:'\u2297',tex:'otimes',ttype:CONST},
{input:'o.',tag:'mo',output:'\u2299',tex:'odot',ttype:CONST},
{input:'sum',tag:'mo',output:'\u2211',tex:null,ttype:UNDEROVER},
{input:'prod',tag:'mo',output:'\u220F',tex:null,ttype:UNDEROVER},
{input:'^^',tag:'mo',output:'\u2227',tex:'wedge',ttype:CONST},
{input:'^^^',tag:'mo',output:'\u22C0',tex:'bigwedge',ttype:UNDEROVER},
{input:'vv',tag:'mo',output:'\u2228',tex:'vee',ttype:CONST},
{input:'vvv',tag:'mo',output:'\u22C1',tex:'bigvee',ttype:UNDEROVER},
{input:'nn',tag:'mo',output:'\u2229',tex:'cap',ttype:CONST},
{input:'nnn',tag:'mo',output:'\u22C2',tex:'bigcap',ttype:UNDEROVER},
{input:'uu',tag:'mo',output:'\u222A',tex:'cup',ttype:CONST},
{input:'uuu',tag:'mo',output:'\u22C3',tex:'bigcup',ttype:UNDEROVER},

// relation symbols
{input:'!=',tag:'mo',output:'\u2260',tex:'ne',ttype:CONST},
{input:':=',tag:'mo',output:':=',tex:null,ttype:CONST,val:true},
{input:'lt',tag:'mo',output:'<',tex:null,ttype:CONST},
{input:'<=',tag:'mo',output:'\u2264',tex:'le',ttype:CONST},
{input:'lt=',tag:'mo',output:'\u2264',tex:'leq',ttype:CONST},
{input:'gt',tag:'mo',output:'>',tex:null,ttype:CONST},
{input:'>=',tag:'mo',output:'\u2265',tex:'ge',ttype:CONST},
{input:'gt=',tag:'mo',output:'\u2265',tex:'geq',ttype:CONST},
{input:'-<',tag:'mo',output:'\u227A',tex:'prec',ttype:CONST},
{input:'-lt',tag:'mo',output:'\u227A',tex:null,ttype:CONST},
{input:'>-',tag:'mo',output:'\u227B',tex:'succ',ttype:CONST},
{input:'-<=',tag:'mo',output:'\u2AAF',tex:'preceq',ttype:CONST},
{input:'>-=',tag:'mo',output:'\u2AB0',tex:'succeq',ttype:CONST},
{input:'in',tag:'mo',output:'\u2208',tex:null,ttype:CONST},
{input:'!in',tag:'mo',output:'\u2209',tex:'notin',ttype:CONST},
{input:'sub',tag:'mo',output:'\u2282',tex:'subset',ttype:CONST},
{input:'sup',tag:'mo',output:'\u2283',tex:'supset',ttype:CONST},
{input:'sube',tag:'mo',output:'\u2286',tex:'subseteq',ttype:CONST},
{input:'supe',tag:'mo',output:'\u2287',tex:'supseteq',ttype:CONST},
{input:'-=',tag:'mo',output:'\u2261',tex:'equiv',ttype:CONST},
{input:'~=',tag:'mo',output:'\u2245',tex:'cong',ttype:CONST},
{input:'~',tag:'mo',output:'~',tex:'sim',ttype:CONST},
{input:'~~',tag:'mo',output:'\u2248',tex:'approx',ttype:CONST},
{input:'prop',tag:'mo',output:'\u221D',tex:'propto',ttype:CONST},
{input:'complement',tag:'mo',output:'complement',tex:null,ttype:CONST},

// logical symbols
{input:'if',tag:'mtext',output:'if',tex:null,ttype:SPACE},
{input:'otherwise',tag:'mtext',output:'otherwise',tex:null,ttype:SPACE},
{input:'and',tag:'mtext',output:'and',tex:null,ttype:SPACE},
{input:'or',tag:'mtext',output:'or',tex:null,ttype:SPACE},
{input:'not',tag:'mo',output:'\u00AC',tex:'neg',ttype:CONST},
{input:'=>',tag:'mo',output:'\u21D2',tex:'implies',ttype:CONST},
{input:'<=>',tag:'mo',output:'\u21D4',tex:'iff',ttype:CONST},
{input:'AA',tag:'mo',output:'\u2200',tex:'forall',ttype:CONST},
{input:'EE',tag:'mo',output:'\u2203',tex:'exists',ttype:CONST},
{input:'_|_',tag:'mo',output:'\u22A5',tex:'bot',ttype:CONST},
{input:'TT',tag:'mo',output:'\u22A4',tex:'top',ttype:CONST},
{input:'|--',tag:'mo',output:'\u22A2',tex:'vdash',ttype:CONST},
{input:'|==',tag:'mo',output:'\u22A8',tex:'models',ttype:CONST},

// grouping brackets
{input:'(',tag:'mo',output:'(',tex:null,ttype:LEFTBRACKET},
{input:')',tag:'mo',output:')',tex:null,ttype:RIGHTBRACKET},
{input:'[',tag:'mo',output:'[',tex:null,ttype:LEFTBRACKET},
{input:']',tag:'mo',output:']',tex:null,ttype:RIGHTBRACKET},
{input:'{',tag:'mo',output:'{',tex:'lbrace',ttype:LEFTBRACKET},
{input:'}',tag:'mo',output:'}',tex:'rbrace',ttype:RIGHTBRACKET},
{input:'|',tag:'mo',output:'|',tex:null,ttype:LEFTRIGHT},
//{input:'||',tag:'mo',output:'||',tex:null,ttype:LEFTRIGHT},
{input:'(:',tag:'mo',output:'\u2329',tex:'langle',ttype:LEFTBRACKET},
{input:':)',tag:'mo',output:'\u232A',tex:'rangle',ttype:RIGHTBRACKET},
{input:'<<',tag:'mo',output:'\u2329',ttype:LEFTBRACKET},
{input:'>>',tag:'mo',output:'\u232A',ttype:RIGHTBRACKET},
{input:'{:',tag:'mo',output:'{:',tex:null,ttype:LEFTBRACKET,invisible:true},
{input:':}',tag:'mo',output:':}',tex:null,ttype:RIGHTBRACKET,invisible:true},

// miscellaneous symbols
{input:'int',tag:'mo',output:'\u222B',tex:null,ttype:CONST},
{input:'oint',tag:'mo',output:'\u222E',tex:null,ttype:CONST},
{input:'del',tag:'mo',output:'\u2202',tex:'partial',ttype:CONST},
{input:'grad',tag:'mo',output:'\u2207',tex:'nabla',ttype:CONST},
{input:'+-',tag:'mo',output:'\u00B1',tex:'pm',ttype:CONST},
{input:'O/',tag:'mo',output:'\u2205',tex:'varnothing',ttype:CONST},
{input:'oo',tag:'mo',output:'\u221E',tex:'infty',ttype:CONST},
{input:'aleph',tag:'mo',output:'\u2135',tex:null,ttype:CONST},
{input:'...',tag:'mo',output:'...',tex:'ldots',ttype:CONST},
{input:':.',tag:'mo',output:'\u2234',tex:'therefore',ttype:CONST},
{input:":'",tag:'mo',output:'\u2235',tex:'because',ttype:CONST},
{input:'/_',tag:'mo',output:'\u2220',tex:'angle',ttype:CONST},
{input:'/_\\',tag:'mo',output:'\u25B3',tex:'triangle',ttype:CONST},
{input:'\\ ',tag:'mtext',output:'\u00A0',tex:null,ttype:CONST,val:true},
{input:'quad',tag:'mo',output:'\u00A0\u00A0',tex:null,ttype:CONST},
{input:'qquad',tag:'mo',output:'\u00A0\u00A0\u00A0\u00A0',tex:null,ttype:CONST},
{input:'cdots',tag:'mo',output:'\u22EF',tex:null,ttype:CONST},
{input:'vdots',tag:'mo',output:'\u22EE',tex:null,ttype:CONST},
{input:'ddots',tag:'mo',output:'\u22F1',tex:null,ttype:CONST},
{input:'diamond',tag:'mo',output:'\u22C4',tex:null,ttype:CONST},
{input:'Lap',tag:'mo',output:'\u2112',tex:'mathscr{L}',ttype:CONST,notexcopy:true},
{input:'square',tag:'mo',output:'\u25A1',ttype:CONST},
{input:'|__',tag:'mo',output:'\u230A',tex:'lfloor',ttype:CONST},
{input:'__|',tag:'mo',output:'\u230B',tex:'rfloor',ttype:CONST},
{input:'|~',tag:'mo',output:'\u2308',tex:'lceil',ttype:CONST},
{input:'~|',tag:'mo',output:'\u2309',tex:'rceil',ttype:CONST},
{input:'CC',tag:'mo',output:'\u2102',tex:'mathbb{C}',ttype:CONST,notexcopy:true},
{input:'NN',tag:'mo',output:'\u2115',tex:'mathbb{N}',ttype:CONST,notexcopy:true},
{input:'QQ',tag:'mo',output:'\u211A',tex:'mathbb{Q}',ttype:CONST,notexcopy:true},
{input:'RR',tag:'mo',output:'\u211D',tex:'mathbb{R}',ttype:CONST,notexcopy:true},
{input:'ZZ',tag:'mo',output:'\u2124',tex:'mathbb{Z}',ttype:CONST,notexcopy:true},
{input:"'",tag:'mo',output:'\u2032',tex:'^\\prime',ttype:CONST,val:true},
{input:"''",tag:'mo',output:'\u2033',tex:null,ttype:CONST,val:true},
{input:"'''",tag:'mo',output:'\u2034',tex:null,ttype:CONST,val:true},

// functions
{input:'!!',tag:'mo',output:'!!',tex:null,ttype:UNARY,rfunc:true,val:true},
{input:'!',tag:'mo',output:'!',tex:null,ttype:UNARY,rfunc:true,val:true},
{input:'f',tag:'mi',output:'f',tex:null,ttype:UNARY,func:true,val:true},
{input:'g',tag:'mi',output:'g',tex:null,ttype:UNARY,func:true,val:true},
{input:'lim',tag:'mo',output:'lim',tex:null,ttype:UNDEROVER},
{input:'sin',tag:'mo',output:'sin',tex:null,ttype:UNARY,func:true},
{input:'cos',tag:'mo',output:'cos',tex:null,ttype:UNARY,func:true},
{input:'tan',tag:'mo',output:'tan',tex:null,ttype:UNARY,func:true},
{input:'sinh',tag:'mo',output:'sinh',tex:null,ttype:UNARY,func:true},
{input:'cosh',tag:'mo',output:'cosh',tex:null,ttype:UNARY,func:true},
{input:'tanh',tag:'mo',output:'tanh',tex:null,ttype:UNARY,func:true},
{input:'cot',tag:'mo',output:'cot',tex:null,ttype:UNARY,func:true},
{input:'sec',tag:'mo',output:'sec',tex:null,ttype:UNARY,func:true},
{input:'csc',tag:'mo',output:'csc',tex:null,ttype:UNARY,func:true},
{input:'arcsin',tag:'mo',output:'arcsin',tex:null,ttype:UNARY,func:true},
{input:'arccos',tag:'mo',output:'arccos',tex:null,ttype:UNARY,func:true},
{input:'arctan',tag:'mo',output:'arctan',tex:null,ttype:UNARY,func:true},
{input:'coth',tag:'mo',output:'coth',tex:null,ttype:UNARY,func:true},
{input:'sech',tag:'mo',output:'sech',tex:null,ttype:UNARY,func:true},
{input:'csch',tag:'mo',output:'csch',tex:null,ttype:UNARY,func:true},
{input:'exp',tag:'mo',output:'exp',tex:null,ttype:UNARY,func:true},
{input:'log',tag:'mo',output:'log',tex:null,ttype:UNARY,func:true},
{input:'ln',tag:'mo',output:'ln',tex:null,ttype:UNARY,func:true},
{input:'det',tag:'mo',output:'det',tex:null,ttype:UNARY,func:true},
{input:'dim',tag:'mo',output:'dim',tex:null,ttype:CONST},
{input:'gcd',tag:'mo',output:'gcd',tex:null,ttype:UNARY,func:true},
{input:'lcm',tag:'mo',output:'lcm',tex:'text{lcm}',ttype:UNARY,func:true,notexcopy:true},
{input:'min',tag:'mo',output:'min',tex:null,ttype:UNDEROVER},
{input:'max',tag:'mo',output:'max',tex:null,ttype:UNDEROVER},
{input:'Sup',tag:'mo',output:'sup',tex:'text{sup}',ttype:UNDEROVER},
{input:'inf',tag:'mo',output:'inf',tex:null,ttype:UNDEROVER},
{input:'mod',tag:'mo',output:'mod',tex:'text{mod}',ttype:CONST,notexcopy:true},
{input:'sgn',tag:'mo',output:'sgn',tex:'text{sgn}',ttype:UNARY,func:true,notexcopy:true},
{input:'lub',tag:'mo',output:'lub',tex:null,ttype:CONST},
{input:'glb',tag:'mo',output:'glb',tex:null,ttype:CONST},
{input:'abs',tag:'mo',output:'abs',tex:null,ttype:UNARY,notexcopy:true,rewriteLR:['|','|']},
{input:'norm',tag:'mo',output:'norm',tex:null,ttype:UNARY,notexcopy:true,rewriteLR:['\\|','\\|']},
{input:'floor',tag:'mo',output:'floor',tex:null,ttype:UNARY,notexcopy:true,rewriteLR:['\\lfloor','\\rfloor']},
{input:'ceil',tag:'mo',output:'ceil',tex:null,ttype:UNARY,notexcopy:true,rewriteLR:['\\lceil','\\rceil']},

// arrows
{input:'uarr',tag:'mo',output:'\u2191',tex:'uparrow',ttype:CONST},
{input:'darr',tag:'mo',output:'\u2193',tex:'downarrow',ttype:CONST},
{input:'rarr',tag:'mo',output:'\u2192',tex:'rightarrow',ttype:CONST},
{input:'->',tag:'mo',output:'\u2192',tex:'to',ttype:CONST},
{input:'>->',tag:'mo',output:'\u21A3',tex:'rightarrowtail',ttype:CONST},
{input:'->>',tag:'mo',output:'\u21A0',tex:'twoheadrightarrow',ttype:CONST},
{input:'>->>',tag:'mo',output:'\u2916',tex:'twoheadrightarrowtail',ttype:CONST},
{input:'|->',tag:'mo',output:'\u21A6',tex:'mapsto',ttype:CONST},
{input:'larr',tag:'mo',output:'\u2190',tex:'leftarrow',ttype:CONST},
{input:'harr',tag:'mo',output:'\u2194',tex:'leftrightarrow',ttype:CONST},
{input:'rArr',tag:'mo',output:'\u21D2',tex:'Rightarrow',ttype:CONST},
{input:'lArr',tag:'mo',output:'\u21D0',tex:'Leftarrow',ttype:CONST},
{input:'hArr',tag:'mo',output:'\u21D4',tex:'Leftrightarrow',ttype:CONST},
{input:'curvArrLt',tag:'mo',output:'\u21B6',tex:'curvearrowleft',ttype:CONST},
{input:'curvArrRt',tag:'mo',output:'\u21B7',tex:'curvearrowright',ttype:CONST},
{input:'circArrLt',tag:'mo',output:'\u21BA',tex:'circlearrowleft',ttype:CONST},
{input:'circArrRt',tag:'mo',output:'\u21BB',tex:'circlearrowright',ttype:CONST},
{input:'sqrt',tag:'msqrt',output:'sqrt',tex:null,ttype:UNARY},
{input:'root',tag:'mroot',output:'root',tex:null,ttype:BINARY},
{input:'frac',tag:'mfrac',output:'/',tex:null,ttype:BINARY},
{input:'/',tag:'mfrac',output:'/',tex:null,ttype:INFIX},
{input:'_',tag:'msub',output:'_',tex:null,ttype:INFIX},
{input:'^',tag:'msup',output:'^',tex:null,ttype:INFIX},

// commands with argument
{input:'stackrel',tag:'mover',output:'stackrel',tex:null,ttype:BINARY},
{input:'overset',tag:'mover',output:'stackrel',tex:null,ttype:BINARY},
{input:'underset',tag:'munder',output:'stackrel',tex:null,ttype:BINARY},
{input:'hat',tag:'mover',output:'\u005E',tex:null,ttype:UNARY,acc:true},
{input:'arc',tag:'mover',output:'\u23DC',tex:'stackrel{\\frown}',ttype:UNARY,acc:true},
{input:'bar',tag:'mover',output:'\u00AF',tex:'overline',ttype:UNARY,acc:true},
{input:'vec',tag:'mover',output:'\u2192',tex:null,ttype:UNARY,acc:true},
{input:'tilde',tag:'mover',output:'~',tex:null,ttype:UNARY,acc:true},
{input:'dot',tag:'mover',output:'.',tex:null,ttype:UNARY,acc:true},
{input:'ddot',tag:'mover',output:'..',tex:null,ttype:UNARY,acc:true},
{input:'ul',tag:'munder',output:'\u0332',tex:'underline',ttype:UNARY,acc:true},
{input:'underbrace',tag:'munder',output:'\u23DF',ttype:UNARYUNDEROVER,acc:true},
{input:'overbrace',tag:'mover',output:'\u23DE',ttype:UNARYUNDEROVER,acc:true},
{input:'color',tag:'mstyle',ttype:BINARY},
{input:'cancel',tag:'menclose',output:'cancel',tex:null,ttype:UNARY},
{input:'phantom',tag:'mphantom',ttype:UNARY},
{input:'text',tag:'mtext',output:'text',tex:null,ttype:TEXT},
{input:'mbox',tag:'mtext',output:'mbox',tex:null,ttype:TEXT},
{input:'"',tag:'mtext',output:'mbox',tex:null,ttype:TEXT},
{input:'op',tag:'mo',output:'operatorname',tex:'operatorname',ttype:UNARY},

// font commands
{input:'bb',tag:'mstyle',atname:'mathvariant',atval:'bold',output:'bb',tex:'mathbf',ttype:UNARY,notexcopy:true},
{input:'mathbf',tag:'mstyle',atname:'mathvariant',atval:'bold',output:'mathbf',tex:null,ttype:UNARY},
{input:'sf',tag:'mstyle',atname:'mathvariant',atval:'sans-serif',output:'sf',tex:'mathsf',ttype:UNARY,notexcopy:true},
{input:'mathsf',tag:'mstyle',atname:'mathvariant',atval:'sans-serif',output:'mathsf',tex:null,ttype:UNARY},
{input:'bbb',tag:'mstyle',atname:'mathvariant',atval:'double-struck',output:'bbb',tex:'mathbb',ttype:UNARY,notexcopy:true},
{input:'mathbb',tag:'mstyle',atname:'mathvariant',atval:'double-struck',output:'mathbb',tex:null,ttype:UNARY},
{input:'cc',tag:'mstyle',atname:'mathvariant',atval:'script',output:'cc',tex:'mathcal',ttype:UNARY,notexcopy:true},
{input:'mathcal',tag:'mstyle',atname:'mathvariant',atval:'script',output:'mathcal',tex:null,ttype:UNARY},
{input:'tt',tag:'mstyle',atname:'mathvariant',atval:'monospace',output:'tt',tex:'mathtt',ttype:UNARY,notexcopy:true},
{input:'mathtt',tag:'mstyle',atname:'mathvariant',atval:'monospace',output:'mathtt',tex:null,ttype:UNARY},
{input:'fr',tag:'mstyle',atname:'mathvariant',atval:'fraktur',output:'fr',tex:'mathfrak',ttype:UNARY,notexcopy:true},
{input:'mathfrak',tag:'mstyle',atname:'mathvariant',atval:'fraktur',output:'mathfrak',tex:null,ttype:UNARY},
{input:'bm',tag:'mstyle',atname:'mathvariant',atval:'bold-italic',output:'bm',tex:'boldsymbol',ttype:UNARY},
{input:'rm',tag:'mstyle',atname:'mathvariant',atval:'serif',output:'rm',tex:'mathrm',ttype:UNARY},

// zmx add
{input:'iint',tag:'mo',output:'\u222C',tex:null,ttype:CONST,val:true},
{input:'iiint',tag:'mo',output:'\u222D',tex:null,ttype:CONST,val:true},
{input:'oiint',tag:'mo',output:'\u222F',tex:null,ttype:CONST,val:true},
{input:'oiiint',tag:'mo',output:'\u2230',tex:null,ttype:CONST,val:true},
{input:'laplace',tag:'mtext',output:'\u0394',ttype:CONST},
{input:'==',tag:'mo',output:'\u2550'.repeat(2),tex:null,ttype:CONST,val:true},
{input:'====',tag:'mo',output:'\u2550'.repeat(4),tex:null,ttype:CONST,val:true},
{input:'||',tag:'mo',output:'\u2225',tex:null,ttype:CONST,val:true},
{input:'!||',tag:'mo',output:'\u2226',tex:null,ttype:CONST,val:true},
{input:'S=',tag:'mo',output:'\u224C',tex:null,ttype:CONST,val:true},
{input:'S~',tag:'mo',output:'\u223D',tex:null,ttype:CONST,val:true},
{input:'!-=',tag:'mo',output:'\u2262',tex:null,ttype:CONST,val:true},
{input:'!|',tag:'mo',output:'\u2224',tex:null,ttype:CONST,val:true},
{input:'!sube',tag:'mo',output:'\u2288',tex:null,ttype:CONST,val:true},
{input:'!supe',tag:'mo',output:'\u2289',tex:null,ttype:CONST,val:true},
{input:'subne',tag:'mo',output:'\u228A',tex:null,ttype:CONST,val:true},
{input:'supne',tag:'mo',output:'\u228B',tex:null,ttype:CONST,val:true},
{input:'normal',tag:'mo',output:'\u22B4',tex:null,ttype:CONST,val:true},

]); // AM.symbols

  AM.symbols.forEach(function (sym) {
    if (sym.tex && !sym.notexcopy) {
      AM.symbols.push({
        input: sym.tex,
        tag: sym.tag,
        output: sym.output,
        ttype: sym.ttype,
        acc: sym.acc
      });
    }
  })
  // build trie
  AM.symbols.forEach(function (sym) {
    var node = AMnames;
    sym.input.split('').forEach(function (ch) {
      if (!node[ch]) node[ch] = {}; // new Object()
      node = node[ch];
    })
    node['\0'] = sym; // preserved key
  })

  AM.symbols = null // free space

} // initSymbols()

// ----------------------------------------------------------------------

var isLeftBrace = /\(|\[|\{/;
var isRightBrace = /\)|\]|\}/;

function strip(node) {
  if (node.firstChild
    && (node.nodeName == 'mrow' || node.nodeName == 'M:MROW')
  ) {
    var grandchild = node.firstChild.firstChild;
    if (grandchild && isLeftBrace.test(grandchild.nodeValue))
      node.removeChild(node.firstChild);
    grandchild = node.lastChild.firstChild;
    if (grandchild && isRightBrace.test(grandchild.nodeValue))
      node.removeChild(node.lastChild);
  }
  return node;
}

function stripTex(node) {
  if (node[0] != '{' || node.slice(-1) != '}')
    return node;
  var leftchop = 0, s;
  if (node.startsWith('\\left', 1)) {
    if (isLeftBrace.test(node.charAt(6)))
      leftchop = 7;
    else if (node.startsWith('\\lbrace', 6))
      leftchop = 13;
  } else {
    s = node.charAt(1);
    if (s == "(" || s == "[")
      leftchop = 2;
  }
  if (leftchop > 0) {
    s = node.slice(-8);
    if (s == '\\right)}' || s == '\\right]}' || s == '\\right.}') {
      node = '{' + node.substr(leftchop);
      node = node.substr(0,node.length-8) + '}';
    } else if (s == '\\rbrace}') {
      node = '{' + node.substr(leftchop);
      node = node.substr(0,node.length-14) + '}';
    }
  }
  return node;
}

function getTexSymbol(sym) {
  return sym.val ? (sym.tex || sym.output) : '\\' + (sym.tex || sym.input);
}

function getTexBracket(sym) {
  return sym.tex ? '\\' + sym.tex : sym.input;
}

function b(s) {
  return '{' + s + '}';
}

// return true if s begins with {, end with } and they are matched
function braced(s) {
  if (s[0] != '{') return false;
  if (s.slice(-1) != '}') return false;
  var depth = 0;
  for (var i = 0; i < s.length; ++i) {
    if (s[i] == '{') ++depth;
    else if (s[i] == '}') --depth;
    if (depth == 0)
      return i == s.length-1;
  }
  return false;
}

// ----------------------------------------------------------------------

/*Parsing ASCII math expressions with the following grammar
v ::= [A-Za-z] | greek letters | numbers | other constant symbols
u ::= sqrt | text | bb | other unary symbols for font commands
b ::= frac | root | stackrel         binary symbols
l ::= ( | [ | { | (: | {:            left brackets
r ::= ) | ] | } | :) | :}            right brackets
S ::= v | lEr | uS | bSS             Simple expression
I ::= S_S | S^S | S_S^S | S          Intermediate expression
E ::= IE | I/I                       Expression
Each terminal symbol is translated into a corresponding mathml node.*/

var AMstr, // the asciimath string being processed
  AMbegin, // the beginning of AMstr
  AMnestingDepth, AMprevSym, AMcurSym, AMesc1;

function skip(n) {
  if (n)
    AMbegin += n;
  while (AMstr.charCodeAt(AMbegin) <= 32)
    ++AMbegin;
}

function getArg(begin) {
  var end = AMstr.length;
  if (AMstr[begin] == '{')
    end = AMstr.indexOf('}', begin+1);
  else if (AMstr[begin] == '(')
    end = AMstr.indexOf(')', begin+1);
  else if (AMstr[begin] == '[')
    end = AMstr.indexOf(']', begin+1);
  return AMstr.slice(begin+1, end);
}

// -> token or bracket or empty
// return maximal initial substring of str that appears in names
// or return null if there is none
function getSymbol() {
  var sym;
  var node = AMnames, i = AMbegin, end = AMstr.length;
  while (i < end) {
    node = node[AMstr[i++]];
    if (!node) break;
    if (node['\0']) sym = node['\0'];
  }
  AMprevSym = AMcurSym;
  if (sym) {
    AMcurSym = sym.ttype;
    return sym;
  }

  AMcurSym = CONST;
  var st, tagst;
  if (/\d/.test(AMstr[AMbegin])) {
    var i = AMbegin;
    while (/\d/.test(AMstr[++i]));
    if (AMstr[i] == '.')
      while (/\d/.test(AMstr[++i]));
    st = AMstr.slice(AMbegin, i);
    tagst = 'mn';
  } else {
    var cp = AMstr.codePointAt(AMbegin)
    st = isNaN(cp) ? '' : String.fromCodePoint(cp)
    if (/[a-zA-Z]/.test(st))
      tagst = 'mi';
    else if (cp > 0x4e00)
      tagst = 'mtext';
    else
      tagst = 'mo';
  }

  var sym = {input:st, tag:tagst, output:st, ttype:CONST, val:true};
  if (st == '-' && AMprevSym == INFIX) {
    AMcurSym = INFIX;  // trick '/' into recognizing '-' on second parse
    sym.ttype = UNARY;
    sym.func = true;
  }
  return sym;
}

function mspace() {
  var node = $math('mspace');
  node.setAttribute('width', '1ex');
  return node;
}

// -> node
function parseS() {
  var node, res, i, st;
  var sym = getSymbol();
  if (sym == null || sym.ttype == RIGHTBRACKET && AMnestingDepth > 0)
    return null;
  var len = sym.input.length;
  var frag = AM.katex ? '' : $();
  switch (sym.ttype) {
  case UNDEROVER:
  case CONST:
    skip(len);
    if (!AM.katex)
      return $math(sym.tag, $text(sym.output));
    else {
      node = getTexSymbol(sym);
      return (node[0] == '\\' || sym.tag == 'mo' ? node : b(node));
    }
  case LEFTBRACKET:
    skip(len);
    ++AMnestingDepth;
    res = parseExpr(true);
    --AMnestingDepth;
    if (AM.katex) {
      if (res.startsWith('\\right')) {
        res = res[6] == '.' ? res.slice(7) : res.slice(6);
        node = sym.invisible ? b(res) : b(getTexBracket(sym) + res);
      } else {
        node = sym.invisible ? '{\\left.' + res + '}' :
          '{\\left' + getTexBracket(sym) + res + '}';
      }
    } else {
      if (sym.invisible)
        node = $math('mrow', res);
      else {
        node = $math('mo', $text(sym.output));
        node = $math('mrow', node);
        node.appendChild(res);
      }
    }
    return node;
  case TEXT:
    if (sym.input != '"')
      skip(len);
    var i = AMbegin;
    if (AMstr[i] == '{') AMbegin = AMstr.indexOf('}', i+1);
    else if (AMstr[i] == '(') AMbegin = AMstr.indexOf(')', i+1);
    else if (AMstr[i] == '[') AMbegin = AMstr.indexOf(']', i+1);
    else if (sym.input == '"') AMbegin = AMstr.indexOf('"', i+1);
    if (AMbegin == -1) {
      AMbegin = AMstr.length;
      st = AMstr.slice(i+1);
    } else {
      st = AMstr.slice(i+1, AMbegin++);
    }
    skip();
    if (AM.katex)
      return (st[0] == ' ' ? '\\ ' : '')
        + '\\text{' + st + '}'
        + (st.slice(-1) == ' ' ? '\\ ' : '');
    if (st[0] == ' ') frag.appendChild(mspace());
    frag.appendChild($math(sym.tag, $text(st)));
    if (st.slice(-1) == ' ') frag.appendChild(mspace());
    return $math('mrow', frag);
  case UNARYUNDEROVER:
  case UNARY:
    skip(len);
    var rewind = AMbegin;
    res = parseS();
    if (res == null) {
      AMbegin = rewind;
      return AM.katex ? b(getTexSymbol(sym)) :
          $math(sym.tag, $text(sym.output));
    }
    if (sym.func) {
      st = AMstr.charAt(rewind);
      if (/\^|_|\/|\||,/.test(st) || (
        len == 1 && /\w/.test(sym.input) && st != '(')
      ) {
        AMbegin = rewind;
        return AM.katex ? b(getTexSymbol(sym)) :
          $math(sym.tag, $text(sym.output));
      } else {
        if (AM.katex)
          return ' ' + getTexSymbol(sym) + b(res);
        node = $math('mrow', $math(sym.tag, $text(sym.output)));
        node.appendChild(res);
        return node;
      }
    }
    res = strip(res);
    if (AM.katex) {
      if (sym.input == 'sqrt')
        node = '\\sqrt{' + res + '}';
      else if (sym.input == 'cancel')
        node = '\\cancel{' + res + '}';
      else if (sym.rewriteLR)
        node = '{\\left' + sym.rewriteLR[0] + res + '\\right'
          + sym.rewriteLR[1] + '}';
      else if (sym.acc)
        node = getTexSymbol(sym) + b(res);
      else
        node = '{' + getTexSymbol(sym) + '{' + res + '}}';
      return node;
    }

    // op
    if (sym.input == 'op') {
      node = $math('mo', $text(getArg(rewind)));
    }
    // sqrt
    else if (sym.input == 'sqrt') {
      node = $math(sym.tag, res);
    }
    // abs, floor, ceil
    else if (sym.rewriteLR) {
      node = $math('mrow', $math('mo', $text(sym.rewriteLR[0])));
      node.appendChild(res);
      node.appendChild($math('mo', $text(sym.rewriteLR[1])));
    }
    // cancel
    else if (sym.input == 'cancel') {
      node = $math(sym.tag, res);
      node.setAttribute('notation', 'updiagonalstrike');
    }
    // accent
    else if (sym.acc) {
      node = $math(sym.tag, res);
      node.appendChild($math('mo', $text(sym.output)));
    }
    // font change command
    else {
      if (!isIE && sym.codes) {
        for (i = 0; i < res.childNodes.length; i++) {
          if (res.childNodes[i].nodeName == 'mi'
              || res.nodeName == 'mi') {
            st = res.nodeName == 'mi' ? res.firstChild.nodeValue :
              res.childNodes[i].firstChild.nodeValue;
            var newst = [];
            for (var j = 0; j < st.length; j++) {
              var code = st.charCodeAt(j);
              if (code > 64 && code < 91)
                newst.push(sym.codes[code-65]);
              else if (code > 96 && code < 123)
                newst.push(sym.codes[code-71]);
              else
                newst.push(st.charAt(j));
            }
            if (res.nodeName == 'mi')
              res = $math('mo').appendChild($text(newst));
            else res.replaceChild($math('mo')
              .appendChild($text(newst)), res.childNodes[i]);
          }
        }
      }
      node = $math(sym.tag, res);
      node.setAttribute(sym.atname, sym.atval);
    }
    return node;
  case BINARY:
    skip(len);
    var rewind = AMbegin;
    res = parseS();
    if (res == null)
      return AM.katex ? b(getTexSymbol(sym)) :
          $math('mo', $text(sym.input));
    res = strip(res);
    var res2 = parseS();
    if (res2 == null)
      return AM.katex ? b(getTexSymbol(sym)) :
          $math('mo', $text(sym.input));
    res2 = strip(res2);
    if (AM.katex) {
      if (sym.input == 'color')
        frag = '{\\color{' + res.replace(/[\{\}]/g,'') + '}' + res2 + '}';
      else if (sym.input == 'root')
        frag = '{\\sqrt[' + res + ']{' + res2 + '}}';
      else if (sym.output == 'stackrel')
        frag = '{' + getTexSymbol(sym) + '{' + res + '}{' + res2 + '}}';
      else if (sym.input == "frac")
        frag = '{\\frac{' + res + '}{' + res2 + '}}';
      return frag;
    }

    if (sym.input == 'color') {
      var color = getArg(rewind);
      node = $math(sym.tag, res2);
      node.setAttribute('mathcolor', color);
      return node;
    }
    if (sym.input == 'root' || sym.output == 'stackrel')
      frag.appendChild(res2);
    frag.appendChild(res);
    if (sym.input == 'frac')
      frag.appendChild(res2);
    return $math(sym.tag, frag);
  case INFIX:
    skip(len);
    return AM.katex ? sym.output : $math('mo', $text(sym.output));
  case SPACE:
    skip(len);
    if (AM.katex)
      return '{\\quad\\text{' + sym.input + '}\\quad}';
    frag.appendChild(mspace());
    frag.appendChild($math(sym.tag,$text(sym.output)));
    frag.appendChild(mspace());
    return $math('mrow', frag);
  case LEFTRIGHT:
    skip(len);
    var rewind = AMbegin;
    AMnestingDepth++;
    res = parseExpr(false);
    AMnestingDepth--;
    if (AM.katex) {
      if (res.slice(-1) == '|')
        return '{\\left|' + res + '}';
      AMbegin = rewind;
      return '\\mid';
    }
    st = res.lastChild ? res.lastChild.firstChild.nodeValue : '';
    if (st == '|') { // absolute value subterm
      node = $math('mo', $text(sym.output));
      node = $math('mrow', node);
      node.appendChild(res);
    } else {
      // the '|' is a \mid so maybe use \u2223 (divides) for spacing??
      node = $math('mo', $text('|'));
      AMbegin = rewind;
    }
    return node;
  default:
    //console.warn("default");
    skip(len);
    return AM.katex ? b(getTexSymbol(sym)) :
        $math(sym.tag, $text(sym.output));
  }
}

function parseI() {
  skip();
  var sym1 = getSymbol();
  var underover = (sym1.ttype == UNDEROVER || sym1.ttype == UNARYUNDEROVER);
  var node = parseS();
  var sym = getSymbol();

  // 类似于 sin, log 相对分式优先
  // 阶乘, 或任意后缀函数也相对分式优先
  if (sym.rfunc) {
    skip(sym.input.length);
    if (AM.katex) {
      return b(node + sym.output);
    } else {
      node = $math('mrow', node);
      node.appendChild($math('mo', $text(sym.output)));
      return node
    }
  }

  // either _ or ^
  if (sym.ttype != INFIX || sym.input == '/')
    return node;
  skip(sym.input.length);
  var res = parseS();
  if (res)
    res = strip(res);
  else // show box in place of missing argument
    res = AM.katex ? '{}' : $math("mo", $text("\u25A1"));
  var sym2 = getSymbol();
  var subFirst = sym.input == '_';
  if (sym2.input == (subFirst ? '^' : '_')) {
    skip(sym2.input.length);
    var res2 = parseS();
    res2 = strip(res2);
    if (AM.katex) {
      //var lBraces = res.split('{').length;
      //var rBraces = res.split('}').length;
      //node += '^' + (lBraces == 2 && rBraces == 2 ? res : b(res));
      node = '{' + node + sym.input + '{' + res + '}' + sym2.input + '{' + res2 + '}}';
    } else {
      node = $math((underover?'munderover':'msubsup'), node);
      if (subFirst) {
        node.appendChild(res);
        node.appendChild(res2);
      } else {
        node.appendChild(res2);
        node.appendChild(res);
      }
      node = $math('mrow', node); // so sum does not stretch
    }
  } else {
    if (AM.katex) {
      node += sym.input + '{' + res + '}';
    } else {
      if (subFirst) {
        node = $math((underover?'munder':'msub'), node);
      } else {
        node = $math((underover?'mover':'msup'), node);
      }
      node.appendChild(res);
    }
  }
  if (sym1.func) {
    sym2 = getSymbol();
    if (sym2.ttype != INFIX && sym2.ttype != RIGHTBRACKET) {
      res = parseI();
      if (AM.katex) {
        node = b(node + res);
      } else {
        node = $math('mrow', node);
        node.appendChild(res);
      }
    }
  }
  return node;
}

/* new matrix grammar
  {:
    x ,= a + b + c + d;
    ,= abcd;
    ,= eeeee;
  :}
*/
function parseMatrix(sym, frag) {
  var ismatrix = false;
  for (var i = 0; i < frag.childNodes.length; ++i) {
    if (frag.childNodes[i].firstChild
      && frag.childNodes[i].firstChild.nodeValue == ';') {
      ismatrix = true;
      break;
    }
  }
  if (!ismatrix)
    return;
  var table = $(), row = $(), elem = $();
  while (frag.firstChild) {
    var val = frag.firstChild.firstChild.nodeValue;
    if (val == ';') {
      frag.removeChild(frag.firstChild);
      row.appendChild($math('mtd', elem));
      elem = $();
      table.appendChild($math('mtr', row));
      row = $();
    } else if (val == ',') {
      frag.removeChild(frag.firstChild);
      row.appendChild($math('mtd', elem));
      elem = $();
    } else {
      elem.appendChild(frag.firstChild);
    }
  }
  if (elem.firstChild)
    row.appendChild($math('mtd', elem));
  if (row.firstChild)
    table.appendChild($math('mtr', row));
  node = $math('mtable', table);
  if (sym.invisible) {
    node.setAttribute('columnalign', 'left');
    node.setAttribute('displaystyle', 'true');
  }
  frag.appendChild(node);
}

function parseMatrixTex(sym, frag) {
  var ismatrix = false;
  var len = frag.length;
  var depth = 0;
  for (i = 0; i < len; ++i) {
    if (isLeftBrace.test(frag[i]))
      ++depth;
    else if (isRightBrace.test(frag[i]))
      --depth;
    else if (frag[i] == ';' && depth == 0) {
      ismatrix = true;
      break;
    }
  }
  if (!ismatrix)
    return frag;
  var matrix = '';
  var begin = 0;
  var row = [];
  depth = 0;
  for (i = 0; i < len; ++i) {
    if (isLeftBrace.test(frag[i]))
      ++depth;
    else if (isRightBrace.test(frag[i]))
      --depth;
    else if (frag[i] == ';' && depth == 0) {
      row.push(frag.slice(begin, i));
      begin = i+1;
      matrix += row.join('&') + '\\\\';
      row = [];
    } else if (frag[i] == ',' && depth == 0) {
      row.push(frag.slice(begin, i));
      begin = i+1;
    }
  }
  if (begin < i)
    row.push(frag.slice(begin,i));
  if (row.length > 0)
    matrix += row.join('&') + '\\\\';
  return '\\begin{matrix}' + matrix + '\\end{matrix}';
}

// -> node
function parseExpr(rightbracket) {
  var closed = false;
  var sym;
  var frag = AM.katex ? '' : $();
  do {
    skip();
    var res = parseI();
    var node = res;
    sym = getSymbol();
    // fractions
    if (sym.input == '/' && sym.ttype == INFIX) {
      skip(sym.input.length);
      res = parseI();
      if (res)
        res = strip(res);
      else // show box in place of missing argument
        res = AM.katex ? '{}' : $math("mo", $text("\u25A1"));
      node = strip(node);
      if (AM.katex) {
        if (!braced(node))
          node = b(node);
        if (!braced(res))
          res = b(res);
        frag += '\\frac' + node + res;
      } else {
        node = $math(sym.tag, node);
        node.appendChild(res);
        frag.appendChild(node);
      }
      sym = getSymbol();
    } else if (node) {
      if (AM.katex)
        frag += node;
      else
        frag.appendChild(node);
    }
  } while ((sym.ttype != RIGHTBRACKET
    && (sym.ttype != LEFTRIGHT || rightbracket)
    || AMnestingDepth == 0) && sym != null && sym.output != '');

  if (sym.ttype == RIGHTBRACKET || sym.ttype == LEFTRIGHT) {
    skip(sym.input.length);
    if (AM.katex) {
      frag = parseMatrixTex(sym, frag);
      if (!sym.invisible) {
        frag += '\\right' + getTexBracket(sym);
        closed = true;
      }
    } else {
      parseMatrix(sym, frag);
      if (!sym.invisible)
        frag.appendChild($math('mo', $text(sym.output)));
    }
  }
  if (AM.katex && AMnestingDepth > 0 && !closed)
    frag += '\\right.';
  return frag;
}

// str -> <math>
function parseMath(str) {
  AMnestingDepth = 0;
  for (d of AM.define)
    str = str.replace(d[0], d[1]);
  AMstr = str.trimLeft();
  AMbegin = 0;
  var node = $math('mstyle', parseExpr(false));
  if (AM.color)
    node.setAttribute('mathcolor', AM.color);
  if (AM.fontfamily)
    node.setAttribute('fontfamily', AM.fontfamily);
  if (AM.displaystyle)
    node.setAttribute('displaystyle', 'true');
  node = $math("math", node);
  if (AM.viewsource)
    node.setAttribute('title', str);
  return node;
}

function am2tex(str, displayStyle) {
  if (displayStyle === undefined) displayStyle = AM.displaystyle
  AMnestingDepth = 0;
  for (d of AM.define)
    str = str.replace(d[0], d[1]);

  // html entity
  if (AM.env === 'nodejs') {
    str = str.replace(/&#(x?[0-9a-fA-F]+);/g, (match, $1) =>
      String.fromCodePoint($1[0] === 'x' ? '0' + $1 : $1)
    )
  }

  AMstr = str.trimLeft();
  AMbegin = 0;
  str = parseExpr(false);
  var args = [];
  if (AM.color)
    args.push('\\' + AM.color);
  if (displayStyle)
    args.push('\\displaystyle');
  else
    args.push('\\textstyle');
  AM.texstr = args.join('') + str.replace(/(\$|%)/g, '\\$1');
  return AM.texstr;
}

function parseMathTex(str) {
  str = am2tex(str);
  var node = $('<span>', str);
  try {
    katex.render(str, node);
  } catch (e) {
    node.className = 'katex-error';
    console.log(str);
    throw e
  }
  return node;
}

function parseNode(node) {
  var str = node.nodeValue;
  if (!str) return 0;
  var escaped = false;
  str = str.replace(AMesc1, function() {
    escaped = true; return 'AMesc1';
  }); // this is a problem??

  var arr = str.split(AM.delim1);
  if (arr.length > 1 || escaped) {
    var frag = $();
    var math = false;
    for (var i = 0; i < arr.length; ++i) {
      arr[i] = arr[i].replace(/AMesc1/g, AM.delim1);
      if (math) {
        frag.appendChild(parseMath(arr[i]));
      } else {
        frag.appendChild($text(arr[i]));
      }
      math = !math;
    }
    if (!math)
      console.warn('formula not closed:', str);
    node.parentNode.replaceChild(frag, node);
    return arr.length-1;
  }
  return 0;
}

// substitute formulae with mathml
function render(node) {
  if (node.nodeName == 'math' || node.nodeType == 8 // comment element
      || /form|textarea/i.test(node.parentNode.nodeName)
  ) return 0;

  if (node.childNodes.length > 0)
    for (var i = 0; i < node.childNodes.length; i++)
      i += render(node.childNodes[i]);

  return parseNode(node);
}

function autorender() {
  render(body);
}

function setDefaults(target, dict) {
  for (var attr in dict) {
    if (typeof target[attr] == 'undefined')
      target[attr] = dict[attr];
  }
}

function init() {

  setDefaults(AM, {
    katexpath: 'katex.min.js',
    onload: autorender,
    fixepsi: true,
    fixphi: true,
    delim1: '`',
    displaystyle:true,
    viewsource: false,
    define: {
      'dx': '{:"d"x:}',
      'dy': '{:"d"y:}',
      'dz': '{:"d"z:}',
      'dt': '{:"d"t:}',
      '√': 'sqrt',
    }
  });

  initSymbols();

  var toescape = /(\(|\)|\[|\]|\{|\}|\$|\^|\/|\\|\||\.|\*|\+|\?)/g;
  AM.delim1.replace(toescape, '\\$1');
  AMesc1 = new RegExp('\\\\' + AM.delim1, 'g');

  var def = []
  for (d in AM.define)
  	def.push([new RegExp(d, 'g'), AM.define[d]]);
  AM.define = def;

  if (!AM.katex && hasMathML())
    return AM.onload();

  if (AM.katex === false)
    notify();

  // use katex & tex version of functions
  AM.katex = true;
  strip = stripTex;
  parseMatrix = parseMatrixTex;
  parseMath = parseMathTex;

  if (AM.env === 'browser') {
    // local fonts cause CORS error
    loadCss('https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css');
    loadScript(AM.katexpath, AM.onload);
  }
}

if (typeof document === 'undefined') {
  AM.env = 'nodejs'
  AM.katex = true
  AM.displaystyle = true
  init()
} else if (typeof chrome !== 'undefined' && chrome.extension) {
  AM.env = 'extension'
  AM.katex = true
  AM.displaystyle = true
  init()
} else {
  AM.env = 'browser'
  var doc = document;
  var body = doc.body;
  var MATHML = 'http://www.w3.org/1998/Math/MathML';
  var XHTML = 'http://www.w3.org/1999/xhtml';
  var isIE = (navigator.appName.slice(0,9) == 'Microsoft');

  if (!doc.getElementById) {
    alert('This webpage requires a recent browser such as Mozilla Firefox');
    return;
  }

  if (isIE) {
    // add MathPlayer info to IE webpages
    doc.write('<object id="mathplayer" classid="clsid:32F66A20-7614-11D4-BD11-00104BD3F987"></object>');
    doc.write('<?import namespace="m" implementation="#mathplayer"?>');
    // redefine functions
    doc.createElementNS = function(namespace, tag) {
      if (namespace == MATHML)
        return doc.createElement('m:' + tag);
      return doc.createElement(tag);
    }
  }

  function loadCss(url) {
    var link = doc.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', url);
    link.setAttribute('crossorigin', '');
    body.appendChild(link);
  }

  function loadScript(url, callback) {
    var script = doc.createElement('script');
    script.type = 'application/javascript';
    if (typeof(callback) != 'undefined') {
      if (script.readyState) { // IE
        script.onreadystatechange = function() {
          if (script.readyState == 'loaded'
              || script.readyState == 'complete') {
            script.onreadystatechange = null;
            callback();
          }
        }
      } else { // others
        script.onload = function() { callback(); }
      }
    }
    script.src = url;
    body.appendChild(script);
  }

  // imitate jquery (迫真)
  function $(str, children, namespace) {
    if (typeof(str) == 'string') {
      if (str[0] == '#')
        return doc.getElementById(str.slice(1));
      if (str[0] == '.')
        return doc.getElementsByClassName(str.slice(1));
      if (str[0] == '"' && str.slice(-1) == '"')
        return doc.createTextNode(str.slice(1,-1));
      if (str[0] == '<' && str.slice(-1) == '>') {
        var elem;
        str = str.slice(1,-1);
        if (namespace == MATHML)
          elem = doc.createElementNS(MATHML, str);
        else if (!namespace)
          elem = doc.createElement(str);
        else if (namespace == XHTML)
          elem = doc.createElementNS(XHTML, str);
        if (!children)
          ;
        else if (typeof(children) == 'string')
          elem.appendChild(doc.createTextNode(children));
        else if (children instanceof Node)
          elem.appendChild(children);
        else if (children instanceof Array)
          for (c of children)
            elem.appendChild(c);
        return elem;
      }
      if (str.length > 0)
        return doc.getElementsByTagName(str);
    } else if (typeof(str) == 'undefined') {
      return doc.createDocumentFragment();
    }
  }

  function $math(str, children) {
    elem = doc.createElementNS(MATHML, str);
    if (children)
      elem.appendChild(children);
    return elem;
  }

  function $text(str) {
    return doc.createTextNode(str);
  }

  function hasMathML() {
    var explorer = navigator.userAgent;
    var foundSafari = explorer.indexOf('Safari') >= 0;
    var isFirefox = explorer.indexOf('Firefox') >= 0;
    var isChrome = explorer.indexOf('Chrome') >= 0;
    var isIE = navigator.appName.slice(0,9) == 'Microsoft';
    var isOpera = navigator.appName.slice(0,5) == 'Opera';

    if (isChrome)
      return false;
    else if (isFirefox || findSafari)
      return navigator.appVersion.slice(0,1) >= '5';
    else if (isIE)
      try {
        new ActiveXObject('MathPlayer.Factory.1');
        return true;
      } catch (e) {}
    else if (isOpera)
      return navigator.appVersion.slice(0,3) >= '9.5';
    else
      return false;
  }

  function notify(msgs) {
    var revert = body.onclick;
    body.onclick = function() {
      body.removeChild($('#AMnotify'));
      body.onclick = revert;
    }
    var div = $('<div>', null, XHTML);
    div.id = 'AMnotify';
    div.style = 'position:absolute; width:100%; top:0; left:0; z-index:200; text-align:center; font-size:1em; padding:0.5em 0 0.5em 0; color:#f00; background:#f99';

    var msg = 'To view the ASCIIMathML notation, use Mozilla Firefox >= 2.0 or latest version of Safari or Internet Explorer + MathPlayer.';
    var line = $('<div>', msg, XHTML);
    line.style.paddingBottom = '1em';
    div.appendChild(line);

    div.appendChild($('<p>', null, XHTML));
    div.appendChild($('"For instructions see the "'));
    var elem = $('<a>', 'ASCIIMathML', XHTML);
    elem.setAttribute('href', 'http://www.chapman.edu/~jipsen/asciimath.html');
    div.appendChild(elem);
    div.appendChild($('" homepage"'));
    elem = $('<div>', '(click anywhere to close)', XHTML);
    elem.style = 'font-size:0.8em; padding-top:1em; color:#014';
    div.appendChild(elem);
    body.insertBefore(div, body.firstChild);
  }

  // setup onload function
  if (typeof window.addEventListener == 'function') {
    // gecko, safari, konqueror and standard
    window.addEventListener('load', init, false);
  } else if (typeof document.addEventListener == 'function') {
    // opera 7
    document.addEventListener('load', init, false);
  } else if (typeof window.attachEvent == 'function') {
    // win/ie
    window.attachEvent('onload', init);
  } else {
    // mac/ie5 and anything else that gets this far
    // if there's an existing onload function
    if (typeof window.onload == 'function') {
      // store it
      var existing = onload;
      // add new onload handler
      window.onload = function() {
        existing(); // call existing onload function
        init();     // call init onload function
      };
    } else {
      window.onload = init;
    }
  }
}

// expose some functions to outside
AM.render = render;
AM.am2tex = am2tex;
})();

if (typeof module !== 'undefined')
  module.exports = asciimath
