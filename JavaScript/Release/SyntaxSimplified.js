// ==UserScript==
// @name         SyntaxSimplified
// @version      2024/04/09
// @author       Canaan HS
// @description  Library for simplifying code logic and syntax
// @namespace    https://greasyfork.org/users/989635
// @match        *://*/*
// ==/UserScript==
class Syntax{constructor(){this.ListenerRecord={};this.Parser=new DOMParser;this.Buffer=document.createDocumentFragment();this.print={log:a=>console.log(a),warn:a=>console.warn(a),error:a=>console.error(a),count:a=>console.count(a)};this.query={Match:/[ .#=:]/,"#":(a,c,b)=>a.getElementById(c.slice(1)),".":(a,c,b)=>{a=a.getElementsByClassName(c.slice(1));return b?Array.from(a):a[0]},tag:(a,c,b)=>{a=a.getElementsByTagName(c);return b?Array.from(a):a[0]},"default":(a,c,b)=>b?a.querySelectorAll(c):a.querySelector(c)};this.formula={Type:a=>Object.prototype.toString.call(a).slice(8,-1),String:(a,c,b)=>b?(a.setItem(c,JSON.stringify(b)),!0):JSON.parse(c),Number:(a,c,b)=>b?(a.setItem(c,JSON.stringify(b)),!0):Number(c),Array:(a,c,b)=>b?(a.setItem(c,JSON.stringify(b)),!0):JSON.parse(c),Object:(a,c,b)=>b?(a.setItem(c,JSON.stringify(b)),!0):JSON.parse(c),Boolean:(a,c,b)=>b?(a.setItem(c,JSON.stringify(b)),!0):JSON.parse(c),Date:(a,c,b)=>b?(a.setItem(c,JSON.stringify(b)),!0):new Date(c),Map:(a,c,b)=>b?(a.setItem(c,JSON.stringify([...b])),!0):new Map(JSON.parse(c))}}$$(a,{all:c=!1,source:b=document}={}){const e=this.query.Match.test(a)?this.query.Match.test(a.slice(1))?"default":a[0]:"tag";return this.query[e](b,a,c)}DomParse(a){return this.Parser.parseFromString(a,"text/html")}GetFill(a){return Math.max(2,`${a}`.length)}Mantissa(a,c,b="0"){return`${++a}`.padStart(c,b)}IllegalCharacters(a){return a.replace(/[\/\?<>\\:\*\|":]/g,"")}ExtensionName(a){try{return a.match(/\.([^.]+)$/)[1].toLowerCase()||"png"}catch{return"png"}}WorkerCreation(a){a=new Blob([a],{type:"application/javascript"});return new Worker(URL.createObjectURL(a))}sleep(a){return new Promise(c=>setTimeout(c,a))}async AddStyle(a,c="New-Style"){let b=document.getElementById(c);b||(b=document.createElement("style"),b.id=c,document.head.appendChild(b));b.appendChild(document.createTextNode(a))}async AddScript(a,c="New-Script"){let b=document.getElementById(c);b||(b=document.createElement("script"),b.id=c,document.head.appendChild(b));b.appendChild(document.createTextNode(a))}async AddListener(a,c,b,e={}){this.ListenerRecord[a]?.[c]||(a.addEventListener(c,b,e),this.ListenerRecord[a]||(this.ListenerRecord[a]={}),this.ListenerRecord[a][c]=b)}async RemovListener(a,c){const b=this.ListenerRecord[a]?.[c];b&&(a.removeEventListener(c,b),delete this.ListenerRecord[a][c])}async Listen(a,c,b,e={},d=null){try{a.addEventListener(c,b,e),d&&d(!0)}catch{d&&d(!1)}}async WaitElem(a,c,b,e,{object:d=document.body,throttle:g=0}={}){let f,h,k;const l=new MutationObserver(this.Throttle_discard(()=>{h=c?document.querySelectorAll(a):document.querySelector(a);if(k=c?0<h.length&&Array.from(h).every(m=>null!==m&&"undefined"!==typeof m):h)l.disconnect(),clearTimeout(f),e(h)},g));l.observe(d,{childList:!0,subtree:!0});f=setTimeout(()=>{l.disconnect()},1E3*b)}async WaitMap(a,c,b,{object:e=document.body,throttle:d=0}={}){let g,f;const h=new MutationObserver(this.Throttle_discard(()=>{f=a.map(k=>document.querySelector(k));f.every(k=>null!==k&&"undefined"!==typeof k)&&(h.disconnect(),clearTimeout(g),b(f))},d));h.observe(e,{childList:!0,subtree:!0});g=setTimeout(()=>{h.disconnect()},1E3*c)}async log(a=null,c="print",b="log"){b="string"===typeof b&&this.print[b]?b:b="log";if(null==a)this.print[b](c);else console.groupCollapsed(a),this.print[b](c),console.groupEnd()}Runtime(a=null,c=!0){return a?c?console.log("\u001b[1m\u001b[36m%s\u001b[0m",`Elapsed Time: ${(Date.now()-a)/1E3}s`):Date.now()-a:Date.now()}Throttle(a,c){let b=null;return function(){let e=this,d=arguments;null==b&&(b=setTimeout(function(){a.apply(e,d);b=null},c))}}Throttle_discard(a,c){let b=0;return function(){const e=arguments,d=Date.now();d-b>=c&&(a.apply(this,e),b=d)}}ScopeParsing(a,c){const b=new Set,e=new Set,d=c.length;for(const f of a.split(/\s*,\s*/))if(/^\d+$/.test(f))b.add(Number(f)-1);else if(/^\d+(?:~\d+|-\d+)$/.test(f)){var g=f.split(/-|~/);a=Number(g[0]-1);g=Number(g[1]-1);const h=a<=g;for(;h?a<=g:a>=g;h?a++:a--)b.add(a)}else/(!|-)+\d+/.test(f)&&e.add(Number(f.slice(1)-1));return[...b].filter(f=>!e.has(f)&&f<d&&0<=f).sort((f,h)=>f-h).map(f=>c[f])}Storage(a,{value:c=null,storage:b=sessionStorage}={}){let e;return null!=c?this.formula[this.formula.Type(c)](b,a,c):!!(e=b.getItem(a))&&this.formula[this.formula.Type(JSON.parse(e))](b,e)}store(a,c=null,b=null){const e=d=>void 0!==d?d:null;return{del:d=>GM_deleteValue(d),all:()=>e(GM_listValues()),set:(d,g)=>GM_setValue(d,g),get:(d,g)=>e(GM_getValue(d,g)),sjs:(d,g)=>GM_setValue(d,JSON.stringify(g,null,4)),gjs:(d,g)=>JSON.parse(e(GM_getValue(d,g)))}[a](c,b)}async Menu(a,c="Menu",b=1){for(const [e,d]of Object.entries(a))GM_registerMenuCommand(e,()=>{d.func()},{title:d.desc,id:`${c}-${b++}`,autoClose:d.close,accessKey:d.hotkey})}};