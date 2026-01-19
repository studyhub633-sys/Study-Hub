import{r as c,a as Cr,R as Er,b as Ie}from"./react-vendor-CW_qxVlV.js";var ft={exports:{}},ye={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Mr=c,Sr=Symbol.for("react.element"),Pr=Symbol.for("react.fragment"),Rr=Object.prototype.hasOwnProperty,_r=Mr.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Ar={key:!0,ref:!0,__self:!0,__source:!0};function pt(e,t,r){var n,o={},a=null,i=null;r!==void 0&&(a=""+r),t.key!==void 0&&(a=""+t.key),t.ref!==void 0&&(i=t.ref);for(n in t)Rr.call(t,n)&&!Ar.hasOwnProperty(n)&&(o[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps,t)o[n]===void 0&&(o[n]=t[n]);return{$$typeof:Sr,type:e,key:a,ref:i,props:o,_owner:_r.current}}ye.Fragment=Pr;ye.jsx=pt;ye.jsxs=pt;ft.exports=ye;var x=ft.exports,Te=function(e,t){return Te=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(r,n){r.__proto__=n}||function(r,n){for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(r[o]=n[o])},Te(e,t)};function ht(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");Te(e,t);function r(){this.constructor=e}e.prototype=t===null?Object.create(t):(r.prototype=t.prototype,new r)}var A=function(){return A=Object.assign||function(t){for(var r,n=1,o=arguments.length;n<o;n++){r=arguments[n];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(t[a]=r[a])}return t},A.apply(this,arguments)};function me(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,n=Object.getOwnPropertySymbols(e);o<n.length;o++)t.indexOf(n[o])<0&&Object.prototype.propertyIsEnumerable.call(e,n[o])&&(r[n[o]]=e[n[o]]);return r}function yt(e,t,r,n){var o=arguments.length,a=o<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,r):n,i;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(e,t,r,n);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(a=(o<3?i(a):o>3?i(t,r,a):i(t,r))||a);return o>3&&a&&Object.defineProperty(t,r,a),a}function mt(e,t){return function(r,n){t(r,n,e)}}function vt(e,t,r,n,o,a){function i(g){if(g!==void 0&&typeof g!="function")throw new TypeError("Function expected");return g}for(var s=n.kind,u=s==="getter"?"get":s==="setter"?"set":"value",l=!t&&e?n.static?e:e.prototype:null,d=t||(l?Object.getOwnPropertyDescriptor(l,n.name):{}),p,v=!1,m=r.length-1;m>=0;m--){var b={};for(var f in n)b[f]=f==="access"?{}:n[f];for(var f in n.access)b.access[f]=n.access[f];b.addInitializer=function(g){if(v)throw new TypeError("Cannot add initializers after decoration has completed");a.push(i(g||null))};var y=(0,r[m])(s==="accessor"?{get:d.get,set:d.set}:d[u],b);if(s==="accessor"){if(y===void 0)continue;if(y===null||typeof y!="object")throw new TypeError("Object expected");(p=i(y.get))&&(d.get=p),(p=i(y.set))&&(d.set=p),(p=i(y.init))&&o.unshift(p)}else(p=i(y))&&(s==="field"?o.unshift(p):d[u]=p)}l&&Object.defineProperty(l,n.name,d),v=!0}function gt(e,t,r){for(var n=arguments.length>2,o=0;o<t.length;o++)r=n?t[o].call(e,r):t[o].call(e);return n?r:void 0}function bt(e){return typeof e=="symbol"?e:"".concat(e)}function wt(e,t,r){return typeof t=="symbol"&&(t=t.description?"[".concat(t.description,"]"):""),Object.defineProperty(e,"name",{configurable:!0,value:r?"".concat(r," ",t):t})}function xt(e,t){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(e,t)}function kt(e,t,r,n){function o(a){return a instanceof r?a:new r(function(i){i(a)})}return new(r||(r=Promise))(function(a,i){function s(d){try{l(n.next(d))}catch(p){i(p)}}function u(d){try{l(n.throw(d))}catch(p){i(p)}}function l(d){d.done?a(d.value):o(d.value).then(s,u)}l((n=n.apply(e,t||[])).next())})}function Ct(e,t){var r={label:0,sent:function(){if(a[0]&1)throw a[1];return a[1]},trys:[],ops:[]},n,o,a,i=Object.create((typeof Iterator=="function"?Iterator:Object).prototype);return i.next=s(0),i.throw=s(1),i.return=s(2),typeof Symbol=="function"&&(i[Symbol.iterator]=function(){return this}),i;function s(l){return function(d){return u([l,d])}}function u(l){if(n)throw new TypeError("Generator is already executing.");for(;i&&(i=0,l[0]&&(r=0)),r;)try{if(n=1,o&&(a=l[0]&2?o.return:l[0]?o.throw||((a=o.return)&&a.call(o),0):o.next)&&!(a=a.call(o,l[1])).done)return a;switch(o=0,a&&(l=[l[0]&2,a.value]),l[0]){case 0:case 1:a=l;break;case 4:return r.label++,{value:l[1],done:!1};case 5:r.label++,o=l[1],l=[0];continue;case 7:l=r.ops.pop(),r.trys.pop();continue;default:if(a=r.trys,!(a=a.length>0&&a[a.length-1])&&(l[0]===6||l[0]===2)){r=0;continue}if(l[0]===3&&(!a||l[1]>a[0]&&l[1]<a[3])){r.label=l[1];break}if(l[0]===6&&r.label<a[1]){r.label=a[1],a=l;break}if(a&&r.label<a[2]){r.label=a[2],r.ops.push(l);break}a[2]&&r.ops.pop(),r.trys.pop();continue}l=t.call(e,r)}catch(d){l=[6,d],o=0}finally{n=a=0}if(l[0]&5)throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}}var ve=Object.create?function(e,t,r,n){n===void 0&&(n=r);var o=Object.getOwnPropertyDescriptor(t,r);(!o||("get"in o?!t.__esModule:o.writable||o.configurable))&&(o={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,o)}:function(e,t,r,n){n===void 0&&(n=r),e[n]=t[r]};function Et(e,t){for(var r in e)r!=="default"&&!Object.prototype.hasOwnProperty.call(t,r)&&ve(t,e,r)}function fe(e){var t=typeof Symbol=="function"&&Symbol.iterator,r=t&&e[t],n=0;if(r)return r.call(e);if(e&&typeof e.length=="number")return{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function ze(e,t){var r=typeof Symbol=="function"&&e[Symbol.iterator];if(!r)return e;var n=r.call(e),o,a=[],i;try{for(;(t===void 0||t-- >0)&&!(o=n.next()).done;)a.push(o.value)}catch(s){i={error:s}}finally{try{o&&!o.done&&(r=n.return)&&r.call(n)}finally{if(i)throw i.error}}return a}function Mt(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(ze(arguments[t]));return e}function St(){for(var e=0,t=0,r=arguments.length;t<r;t++)e+=arguments[t].length;for(var n=Array(e),o=0,t=0;t<r;t++)for(var a=arguments[t],i=0,s=a.length;i<s;i++,o++)n[o]=a[i];return n}function Fe(e,t,r){if(r||arguments.length===2)for(var n=0,o=t.length,a;n<o;n++)(a||!(n in t))&&(a||(a=Array.prototype.slice.call(t,0,n)),a[n]=t[n]);return e.concat(a||Array.prototype.slice.call(t))}function X(e){return this instanceof X?(this.v=e,this):new X(e)}function Pt(e,t,r){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var n=r.apply(e,t||[]),o,a=[];return o=Object.create((typeof AsyncIterator=="function"?AsyncIterator:Object).prototype),s("next"),s("throw"),s("return",i),o[Symbol.asyncIterator]=function(){return this},o;function i(m){return function(b){return Promise.resolve(b).then(m,p)}}function s(m,b){n[m]&&(o[m]=function(f){return new Promise(function(y,g){a.push([m,f,y,g])>1||u(m,f)})},b&&(o[m]=b(o[m])))}function u(m,b){try{l(n[m](b))}catch(f){v(a[0][3],f)}}function l(m){m.value instanceof X?Promise.resolve(m.value.v).then(d,p):v(a[0][2],m)}function d(m){u("next",m)}function p(m){u("throw",m)}function v(m,b){m(b),a.shift(),a.length&&u(a[0][0],a[0][1])}}function Rt(e){var t,r;return t={},n("next"),n("throw",function(o){throw o}),n("return"),t[Symbol.iterator]=function(){return this},t;function n(o,a){t[o]=e[o]?function(i){return(r=!r)?{value:X(e[o](i)),done:!1}:a?a(i):i}:a}}function _t(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t=e[Symbol.asyncIterator],r;return t?t.call(e):(e=typeof fe=="function"?fe(e):e[Symbol.iterator](),r={},n("next"),n("throw"),n("return"),r[Symbol.asyncIterator]=function(){return this},r);function n(a){r[a]=e[a]&&function(i){return new Promise(function(s,u){i=e[a](i),o(s,u,i.done,i.value)})}}function o(a,i,s,u){Promise.resolve(u).then(function(l){a({value:l,done:s})},i)}}function At(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e}var Or=Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t},Ne=function(e){return Ne=Object.getOwnPropertyNames||function(t){var r=[];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(r[r.length]=n);return r},Ne(e)};function Ot(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var r=Ne(e),n=0;n<r.length;n++)r[n]!=="default"&&ve(t,e,r[n]);return Or(t,e),t}function Tt(e){return e&&e.__esModule?e:{default:e}}function Nt(e,t,r,n){if(r==="a"&&!n)throw new TypeError("Private accessor was defined without a getter");if(typeof t=="function"?e!==t||!n:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return r==="m"?n:r==="a"?n.call(e):n?n.value:t.get(e)}function jt(e,t,r,n,o){if(n==="m")throw new TypeError("Private method is not writable");if(n==="a"&&!o)throw new TypeError("Private accessor was defined without a setter");if(typeof t=="function"?e!==t||!o:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return n==="a"?o.call(e,r):o?o.value=r:t.set(e,r),r}function Lt(e,t){if(t===null||typeof t!="object"&&typeof t!="function")throw new TypeError("Cannot use 'in' operator on non-object");return typeof e=="function"?t===e:e.has(t)}function Dt(e,t,r){if(t!=null){if(typeof t!="object"&&typeof t!="function")throw new TypeError("Object expected.");var n,o;if(r){if(!Symbol.asyncDispose)throw new TypeError("Symbol.asyncDispose is not defined.");n=t[Symbol.asyncDispose]}if(n===void 0){if(!Symbol.dispose)throw new TypeError("Symbol.dispose is not defined.");n=t[Symbol.dispose],r&&(o=n)}if(typeof n!="function")throw new TypeError("Object not disposable.");o&&(n=function(){try{o.call(this)}catch(a){return Promise.reject(a)}}),e.stack.push({value:t,dispose:n,async:r})}else r&&e.stack.push({async:!0});return t}var Tr=typeof SuppressedError=="function"?SuppressedError:function(e,t,r){var n=new Error(r);return n.name="SuppressedError",n.error=e,n.suppressed=t,n};function It(e){function t(a){e.error=e.hasError?new Tr(a,e.error,"An error was suppressed during disposal."):a,e.hasError=!0}var r,n=0;function o(){for(;r=e.stack.pop();)try{if(!r.async&&n===1)return n=0,e.stack.push(r),Promise.resolve().then(o);if(r.dispose){var a=r.dispose.call(r.value);if(r.async)return n|=2,Promise.resolve(a).then(o,function(i){return t(i),o()})}else n|=1}catch(i){t(i)}if(n===1)return e.hasError?Promise.reject(e.error):Promise.resolve();if(e.hasError)throw e.error}return o()}function zt(e,t){return typeof e=="string"&&/^\.\.?\//.test(e)?e.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i,function(r,n,o,a,i){return n?t?".jsx":".js":o&&(!a||!i)?r:o+a+"."+i.toLowerCase()+"js"}):e}const Nr={__extends:ht,__assign:A,__rest:me,__decorate:yt,__param:mt,__esDecorate:vt,__runInitializers:gt,__propKey:bt,__setFunctionName:wt,__metadata:xt,__awaiter:kt,__generator:Ct,__createBinding:ve,__exportStar:Et,__values:fe,__read:ze,__spread:Mt,__spreadArrays:St,__spreadArray:Fe,__await:X,__asyncGenerator:Pt,__asyncDelegator:Rt,__asyncValues:_t,__makeTemplateObject:At,__importStar:Ot,__importDefault:Tt,__classPrivateFieldGet:Nt,__classPrivateFieldSet:jt,__classPrivateFieldIn:Lt,__addDisposableResource:Dt,__disposeResources:It,__rewriteRelativeImportExtension:zt},ca=Object.freeze(Object.defineProperty({__proto__:null,__addDisposableResource:Dt,get __assign(){return A},__asyncDelegator:Rt,__asyncGenerator:Pt,__asyncValues:_t,__await:X,__awaiter:kt,__classPrivateFieldGet:Nt,__classPrivateFieldIn:Lt,__classPrivateFieldSet:jt,__createBinding:ve,__decorate:yt,__disposeResources:It,__esDecorate:vt,__exportStar:Et,__extends:ht,__generator:Ct,__importDefault:Tt,__importStar:Ot,__makeTemplateObject:At,__metadata:xt,__param:mt,__propKey:bt,__read:ze,__rest:me,__rewriteRelativeImportExtension:zt,__runInitializers:gt,__setFunctionName:wt,__spread:Mt,__spreadArray:Fe,__spreadArrays:St,__values:fe,default:Nr},Symbol.toStringTag,{value:"Module"}));/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jr=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Ft=(...e)=>e.filter((t,r,n)=>!!t&&t.trim()!==""&&n.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Lr={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Dr=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:n,className:o="",children:a,iconNode:i,...s},u)=>c.createElement("svg",{ref:u,...Lr,width:t,height:t,stroke:e,strokeWidth:n?Number(r)*24/Number(t):r,className:Ft("lucide",o),...s},[...i.map(([l,d])=>c.createElement(l,d)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=(e,t)=>{const r=c.forwardRef(({className:n,...o},a)=>c.createElement(Dr,{ref:a,iconNode:t,className:Ft(`lucide-${jr(e)}`,n),...o}));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const la=h("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ua=h("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const da=h("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fa=h("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pa=h("Bold",[["path",{d:"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",key:"mg9rjx"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ha=h("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ya=h("Bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ma=h("Brain",[["path",{d:"M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",key:"l5xja"}],["path",{d:"M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",key:"ep3f8r"}],["path",{d:"M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4",key:"1p4c4q"}],["path",{d:"M17.599 6.5a3 3 0 0 0 .399-1.375",key:"tmeiqw"}],["path",{d:"M6.003 5.125A3 3 0 0 0 6.401 6.5",key:"105sqy"}],["path",{d:"M3.477 10.896a4 4 0 0 1 .585-.396",key:"ql3yin"}],["path",{d:"M19.938 10.5a4 4 0 0 1 .585.396",key:"1qfode"}],["path",{d:"M6 18a4 4 0 0 1-1.967-.516",key:"2e4loj"}],["path",{d:"M19.967 17.484A4 4 0 0 1 18 18",key:"159ez6"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const va=h("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ga=h("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ba=h("Calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wa=h("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xa=h("ChartColumn",[["path",{d:"M3 3v16a2 2 0 0 0 2 2h16",key:"c24i48"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ka=h("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ca=h("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ea=h("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ma=h("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sa=h("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pa=h("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ra=h("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _a=h("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Aa=h("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oa=h("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ta=h("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Na=h("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ja=h("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const La=h("CreditCard",[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Da=h("Crown",[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ia=h("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const za=h("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fa=h("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Va=h("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wa=h("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ba=h("FileCheck",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"m9 15 2 2 4-4",key:"1grp1n"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qa=h("FileImage",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["circle",{cx:"10",cy:"12",r:"2",key:"737tya"}],["path",{d:"m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22",key:"wt3hpn"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $a=h("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ua=h("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ha=h("Flame",[["path",{d:"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",key:"96xj49"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ga=h("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Za=h("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ka=h("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xa=h("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ya=h("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qa=h("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ja=h("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const es=h("LayoutTemplate",[["rect",{width:"18",height:"7",x:"3",y:"3",rx:"1",key:"f1a2em"}],["rect",{width:"9",height:"7",x:"3",y:"14",rx:"1",key:"jqznyg"}],["rect",{width:"5",height:"7",x:"16",y:"14",rx:"1",key:"q5h2i8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ts=h("Library",[["path",{d:"m16 6 4 14",key:"ji33uf"}],["path",{d:"M12 6v14",key:"1n7gus"}],["path",{d:"M8 8v12",key:"1gg7y9"}],["path",{d:"M4 4v16",key:"6qkkli"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rs=h("Lightbulb",[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ns=h("Link",[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const os=h("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const as=h("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ss=h("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const is=h("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cs=h("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ls=h("Medal",[["path",{d:"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",key:"143lza"}],["path",{d:"M11 12 5.12 2.2",key:"qhuxz6"}],["path",{d:"m13 12 5.88-9.8",key:"hbye0f"}],["path",{d:"M8 7h8",key:"i86dvs"}],["circle",{cx:"12",cy:"17",r:"5",key:"qbz8iq"}],["path",{d:"M12 18v-2h-.5",key:"fawc4q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const us=h("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ds=h("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fs=h("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ps=h("Music",[["path",{d:"M9 18V5l12-2v13",key:"1jmyc2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["circle",{cx:"18",cy:"16",r:"3",key:"1hluhg"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hs=h("Network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ys=h("Palette",[["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ms=h("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vs=h("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gs=h("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bs=h("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ws=h("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xs=h("Rocket",[["path",{d:"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",key:"m3kijz"}],["path",{d:"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",key:"1fmvmk"}],["path",{d:"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",key:"1f8sc4"}],["path",{d:"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",key:"qeys4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ks=h("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cs=h("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Es=h("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ms=h("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ss=h("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ps=h("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rs=h("Shuffle",[["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22",key:"1ailkh"}],["path",{d:"M2 6h1.972a4 4 0 0 1 3.6 2.2",key:"km57vx"}],["path",{d:"M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45",key:"os18l9"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _s=h("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const As=h("SquarePen",[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Os=h("Star",[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ts=h("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ns=h("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const js=h("Ticket",[["path",{d:"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",key:"qn84l0"}],["path",{d:"M13 5v2",key:"dyzc3o"}],["path",{d:"M13 17v2",key:"1ont0d"}],["path",{d:"M13 11v2",key:"1wjjxi"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ls=h("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ds=h("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Is=h("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zs=h("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Fs=h("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vs=h("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ws=h("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bs=h("UserX",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qs=h("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $s=h("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Us=h("Video",[["path",{d:"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",key:"ftymec"}],["rect",{x:"2",y:"6",width:"14",height:"12",rx:"2",key:"158x01"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hs=h("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gs=h("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);function B(e,t,{checkForDefaultPrevented:r=!0}={}){return function(o){if(e==null||e(o),r===!1||!o.defaultPrevented)return t==null?void 0:t(o)}}function Ke(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function ge(...e){return t=>{let r=!1;const n=e.map(o=>{const a=Ke(o,t);return!r&&typeof a=="function"&&(r=!0),a});if(r)return()=>{for(let o=0;o<n.length;o++){const a=n[o];typeof a=="function"?a():Ke(e[o],null)}}}}function $(...e){return c.useCallback(ge(...e),e)}function Ir(e,t){const r=c.createContext(t),n=a=>{const{children:i,...s}=a,u=c.useMemo(()=>s,Object.values(s));return x.jsx(r.Provider,{value:u,children:i})};n.displayName=e+"Provider";function o(a){const i=c.useContext(r);if(i)return i;if(t!==void 0)return t;throw new Error(`\`${a}\` must be used within \`${e}\``)}return[n,o]}function zr(e,t=[]){let r=[];function n(a,i){const s=c.createContext(i),u=r.length;r=[...r,i];const l=p=>{var g;const{scope:v,children:m,...b}=p,f=((g=v==null?void 0:v[e])==null?void 0:g[u])||s,y=c.useMemo(()=>b,Object.values(b));return x.jsx(f.Provider,{value:y,children:m})};l.displayName=a+"Provider";function d(p,v){var f;const m=((f=v==null?void 0:v[e])==null?void 0:f[u])||s,b=c.useContext(m);if(b)return b;if(i!==void 0)return i;throw new Error(`\`${p}\` must be used within \`${a}\``)}return[l,d]}const o=()=>{const a=r.map(i=>c.createContext(i));return function(s){const u=(s==null?void 0:s[e])||a;return c.useMemo(()=>({[`__scope${e}`]:{...s,[e]:u}}),[s,u])}};return o.scopeName=e,[n,Fr(o,...t)]}function Fr(...e){const t=e[0];if(e.length===1)return t;const r=()=>{const n=e.map(o=>({useScope:o(),scopeName:o.scopeName}));return function(a){const i=n.reduce((s,{useScope:u,scopeName:l})=>{const p=u(a)[`__scope${l}`];return{...s,...p}},{});return c.useMemo(()=>({[`__scope${t.scopeName}`]:i}),[i])}};return r.scopeName=t.scopeName,r}function Vr(e){const t=Wr(e),r=c.forwardRef((n,o)=>{const{children:a,...i}=n,s=c.Children.toArray(a),u=s.find(qr);if(u){const l=u.props.children,d=s.map(p=>p===u?c.Children.count(l)>1?c.Children.only(null):c.isValidElement(l)?l.props.children:null:p);return x.jsx(t,{...i,ref:o,children:c.isValidElement(l)?c.cloneElement(l,void 0,d):null})}return x.jsx(t,{...i,ref:o,children:a})});return r.displayName=`${e}.Slot`,r}function Wr(e){const t=c.forwardRef((r,n)=>{const{children:o,...a}=r;if(c.isValidElement(o)){const i=Ur(o),s=$r(a,o.props);return o.type!==c.Fragment&&(s.ref=n?ge(n,i):i),c.cloneElement(o,s)}return c.Children.count(o)>1?c.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Br=Symbol("radix.slottable");function qr(e){return c.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Br}function $r(e,t){const r={...t};for(const n in t){const o=e[n],a=t[n];/^on[A-Z]/.test(n)?o&&a?r[n]=(...s)=>{const u=a(...s);return o(...s),u}:o&&(r[n]=o):n==="style"?r[n]={...o,...a}:n==="className"&&(r[n]=[o,a].filter(Boolean).join(" "))}return{...e,...r}}function Ur(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var Hr=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],I=Hr.reduce((e,t)=>{const r=Vr(`Primitive.${t}`),n=c.forwardRef((o,a)=>{const{asChild:i,...s}=o,u=i?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),x.jsx(u,{...s,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function Gr(e,t){e&&Cr.flushSync(()=>e.dispatchEvent(t))}function te(e){const t=c.useRef(e);return c.useEffect(()=>{t.current=e}),c.useMemo(()=>(...r)=>{var n;return(n=t.current)==null?void 0:n.call(t,...r)},[])}function Zr(e,t=globalThis==null?void 0:globalThis.document){const r=te(e);c.useEffect(()=>{const n=o=>{o.key==="Escape"&&r(o)};return t.addEventListener("keydown",n,{capture:!0}),()=>t.removeEventListener("keydown",n,{capture:!0})},[r,t])}var Kr="DismissableLayer",je="dismissableLayer.update",Xr="dismissableLayer.pointerDownOutside",Yr="dismissableLayer.focusOutside",Xe,Vt=c.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),Ve=c.forwardRef((e,t)=>{const{disableOutsidePointerEvents:r=!1,onEscapeKeyDown:n,onPointerDownOutside:o,onFocusOutside:a,onInteractOutside:i,onDismiss:s,...u}=e,l=c.useContext(Vt),[d,p]=c.useState(null),v=(d==null?void 0:d.ownerDocument)??(globalThis==null?void 0:globalThis.document),[,m]=c.useState({}),b=$(t,E=>p(E)),f=Array.from(l.layers),[y]=[...l.layersWithOutsidePointerEventsDisabled].slice(-1),g=f.indexOf(y),k=d?f.indexOf(d):-1,M=l.layersWithOutsidePointerEventsDisabled.size>0,C=k>=g,R=Jr(E=>{const T=E.target,N=[...l.branches].some(j=>j.contains(T));!C||N||(o==null||o(E),i==null||i(E),E.defaultPrevented||s==null||s())},v),_=en(E=>{const T=E.target;[...l.branches].some(j=>j.contains(T))||(a==null||a(E),i==null||i(E),E.defaultPrevented||s==null||s())},v);return Zr(E=>{k===l.layers.size-1&&(n==null||n(E),!E.defaultPrevented&&s&&(E.preventDefault(),s()))},v),c.useEffect(()=>{if(d)return r&&(l.layersWithOutsidePointerEventsDisabled.size===0&&(Xe=v.body.style.pointerEvents,v.body.style.pointerEvents="none"),l.layersWithOutsidePointerEventsDisabled.add(d)),l.layers.add(d),Ye(),()=>{r&&l.layersWithOutsidePointerEventsDisabled.size===1&&(v.body.style.pointerEvents=Xe)}},[d,v,r,l]),c.useEffect(()=>()=>{d&&(l.layers.delete(d),l.layersWithOutsidePointerEventsDisabled.delete(d),Ye())},[d,l]),c.useEffect(()=>{const E=()=>m({});return document.addEventListener(je,E),()=>document.removeEventListener(je,E)},[]),x.jsx(I.div,{...u,ref:b,style:{pointerEvents:M?C?"auto":"none":void 0,...e.style},onFocusCapture:B(e.onFocusCapture,_.onFocusCapture),onBlurCapture:B(e.onBlurCapture,_.onBlurCapture),onPointerDownCapture:B(e.onPointerDownCapture,R.onPointerDownCapture)})});Ve.displayName=Kr;var Qr="DismissableLayerBranch",Wt=c.forwardRef((e,t)=>{const r=c.useContext(Vt),n=c.useRef(null),o=$(t,n);return c.useEffect(()=>{const a=n.current;if(a)return r.branches.add(a),()=>{r.branches.delete(a)}},[r.branches]),x.jsx(I.div,{...e,ref:o})});Wt.displayName=Qr;function Jr(e,t=globalThis==null?void 0:globalThis.document){const r=te(e),n=c.useRef(!1),o=c.useRef(()=>{});return c.useEffect(()=>{const a=s=>{if(s.target&&!n.current){let u=function(){Bt(Xr,r,l,{discrete:!0})};const l={originalEvent:s};s.pointerType==="touch"?(t.removeEventListener("click",o.current),o.current=u,t.addEventListener("click",o.current,{once:!0})):u()}else t.removeEventListener("click",o.current);n.current=!1},i=window.setTimeout(()=>{t.addEventListener("pointerdown",a)},0);return()=>{window.clearTimeout(i),t.removeEventListener("pointerdown",a),t.removeEventListener("click",o.current)}},[t,r]),{onPointerDownCapture:()=>n.current=!0}}function en(e,t=globalThis==null?void 0:globalThis.document){const r=te(e),n=c.useRef(!1);return c.useEffect(()=>{const o=a=>{a.target&&!n.current&&Bt(Yr,r,{originalEvent:a},{discrete:!1})};return t.addEventListener("focusin",o),()=>t.removeEventListener("focusin",o)},[t,r]),{onFocusCapture:()=>n.current=!0,onBlurCapture:()=>n.current=!1}}function Ye(){const e=new CustomEvent(je);document.dispatchEvent(e)}function Bt(e,t,r,{discrete:n}){const o=r.originalEvent.target,a=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:r});t&&o.addEventListener(e,t,{once:!0}),n?Gr(o,a):o.dispatchEvent(a)}var Zs=Ve,Ks=Wt,re=globalThis!=null&&globalThis.document?c.useLayoutEffect:()=>{},tn="Portal",qt=c.forwardRef((e,t)=>{var s;const{container:r,...n}=e,[o,a]=c.useState(!1);re(()=>a(!0),[]);const i=r||o&&((s=globalThis==null?void 0:globalThis.document)==null?void 0:s.body);return i?Er.createPortal(x.jsx(I.div,{...n,ref:t}),i):null});qt.displayName=tn;function rn(e,t){return c.useReducer((r,n)=>t[r][n]??r,e)}var be=e=>{const{present:t,children:r}=e,n=nn(t),o=typeof r=="function"?r({present:n.isPresent}):c.Children.only(r),a=$(n.ref,on(o));return typeof r=="function"||n.isPresent?c.cloneElement(o,{ref:a}):null};be.displayName="Presence";function nn(e){const[t,r]=c.useState(),n=c.useRef(null),o=c.useRef(e),a=c.useRef("none"),i=e?"mounted":"unmounted",[s,u]=rn(i,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return c.useEffect(()=>{const l=ae(n.current);a.current=s==="mounted"?l:"none"},[s]),re(()=>{const l=n.current,d=o.current;if(d!==e){const v=a.current,m=ae(l);e?u("MOUNT"):m==="none"||(l==null?void 0:l.display)==="none"?u("UNMOUNT"):u(d&&v!==m?"ANIMATION_OUT":"UNMOUNT"),o.current=e}},[e,u]),re(()=>{if(t){let l;const d=t.ownerDocument.defaultView??window,p=m=>{const f=ae(n.current).includes(CSS.escape(m.animationName));if(m.target===t&&f&&(u("ANIMATION_END"),!o.current)){const y=t.style.animationFillMode;t.style.animationFillMode="forwards",l=d.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=y)})}},v=m=>{m.target===t&&(a.current=ae(n.current))};return t.addEventListener("animationstart",v),t.addEventListener("animationcancel",p),t.addEventListener("animationend",p),()=>{d.clearTimeout(l),t.removeEventListener("animationstart",v),t.removeEventListener("animationcancel",p),t.removeEventListener("animationend",p)}}else u("ANIMATION_END")},[t,u]),{isPresent:["mounted","unmountSuspended"].includes(s),ref:c.useCallback(l=>{n.current=l?getComputedStyle(l):null,r(l)},[])}}function ae(e){return(e==null?void 0:e.animationName)||"none"}function on(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var an=Ie[" useInsertionEffect ".trim().toString()]||re;function sn({prop:e,defaultProp:t,onChange:r=()=>{},caller:n}){const[o,a,i]=cn({defaultProp:t,onChange:r}),s=e!==void 0,u=s?e:o;{const d=c.useRef(e!==void 0);c.useEffect(()=>{const p=d.current;if(p!==s){const v=p?"controlled":"uncontrolled",m=s?"controlled":"uncontrolled"}d.current=s},[s,n])}const l=c.useCallback(d=>{var p;if(s){const v=ln(d)?d(e):d;v!==e&&((p=i.current)==null||p.call(i,v))}else a(d)},[s,e,a,i]);return[u,l]}function cn({defaultProp:e,onChange:t}){const[r,n]=c.useState(e),o=c.useRef(r),a=c.useRef(t);return an(()=>{a.current=t},[t]),c.useEffect(()=>{var i;o.current!==r&&((i=a.current)==null||i.call(a,r),o.current=r)},[r,o]),[r,n,a]}function ln(e){return typeof e=="function"}function $t(e){var t,r,n="";if(typeof e=="string"||typeof e=="number")n+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(r=$t(e[t]))&&(n&&(n+=" "),n+=r)}else for(r in e)e[r]&&(n&&(n+=" "),n+=r);return n}function un(){for(var e,t,r=0,n="",o=arguments.length;r<o;r++)(e=arguments[r])&&(t=$t(e))&&(n&&(n+=" "),n+=t);return n}const Qe=e=>typeof e=="boolean"?`${e}`:e===0?"0":e,Je=un,Xs=(e,t)=>r=>{var n;if((t==null?void 0:t.variants)==null)return Je(e,r==null?void 0:r.class,r==null?void 0:r.className);const{variants:o,defaultVariants:a}=t,i=Object.keys(o).map(l=>{const d=r==null?void 0:r[l],p=a==null?void 0:a[l];if(d===null)return null;const v=Qe(d)||Qe(p);return o[l][v]}),s=r&&Object.entries(r).reduce((l,d)=>{let[p,v]=d;return v===void 0||(l[p]=v),l},{}),u=t==null||(n=t.compoundVariants)===null||n===void 0?void 0:n.reduce((l,d)=>{let{class:p,className:v,...m}=d;return Object.entries(m).every(b=>{let[f,y]=b;return Array.isArray(y)?y.includes({...a,...s}[f]):{...a,...s}[f]===y})?[...l,p,v]:l},[]);return Je(e,i,u,r==null?void 0:r.class,r==null?void 0:r.className)},We="-",dn=e=>{const t=pn(e),{conflictingClassGroups:r,conflictingClassGroupModifiers:n}=e;return{getClassGroupId:i=>{const s=i.split(We);return s[0]===""&&s.length!==1&&s.shift(),Ut(s,t)||fn(i)},getConflictingClassGroupIds:(i,s)=>{const u=r[i]||[];return s&&n[i]?[...u,...n[i]]:u}}},Ut=(e,t)=>{var i;if(e.length===0)return t.classGroupId;const r=e[0],n=t.nextPart.get(r),o=n?Ut(e.slice(1),n):void 0;if(o)return o;if(t.validators.length===0)return;const a=e.join(We);return(i=t.validators.find(({validator:s})=>s(a)))==null?void 0:i.classGroupId},et=/^\[(.+)\]$/,fn=e=>{if(et.test(e)){const t=et.exec(e)[1],r=t==null?void 0:t.substring(0,t.indexOf(":"));if(r)return"arbitrary.."+r}},pn=e=>{const{theme:t,prefix:r}=e,n={nextPart:new Map,validators:[]};return yn(Object.entries(e.classGroups),r).forEach(([a,i])=>{Le(i,n,a,t)}),n},Le=(e,t,r,n)=>{e.forEach(o=>{if(typeof o=="string"){const a=o===""?t:tt(t,o);a.classGroupId=r;return}if(typeof o=="function"){if(hn(o)){Le(o(n),t,r,n);return}t.validators.push({validator:o,classGroupId:r});return}Object.entries(o).forEach(([a,i])=>{Le(i,tt(t,a),r,n)})})},tt=(e,t)=>{let r=e;return t.split(We).forEach(n=>{r.nextPart.has(n)||r.nextPart.set(n,{nextPart:new Map,validators:[]}),r=r.nextPart.get(n)}),r},hn=e=>e.isThemeGetter,yn=(e,t)=>t?e.map(([r,n])=>{const o=n.map(a=>typeof a=="string"?t+a:typeof a=="object"?Object.fromEntries(Object.entries(a).map(([i,s])=>[t+i,s])):a);return[r,o]}):e,mn=e=>{if(e<1)return{get:()=>{},set:()=>{}};let t=0,r=new Map,n=new Map;const o=(a,i)=>{r.set(a,i),t++,t>e&&(t=0,n=r,r=new Map)};return{get(a){let i=r.get(a);if(i!==void 0)return i;if((i=n.get(a))!==void 0)return o(a,i),i},set(a,i){r.has(a)?r.set(a,i):o(a,i)}}},Ht="!",vn=e=>{const{separator:t,experimentalParseClassName:r}=e,n=t.length===1,o=t[0],a=t.length,i=s=>{const u=[];let l=0,d=0,p;for(let y=0;y<s.length;y++){let g=s[y];if(l===0){if(g===o&&(n||s.slice(y,y+a)===t)){u.push(s.slice(d,y)),d=y+a;continue}if(g==="/"){p=y;continue}}g==="["?l++:g==="]"&&l--}const v=u.length===0?s:s.substring(d),m=v.startsWith(Ht),b=m?v.substring(1):v,f=p&&p>d?p-d:void 0;return{modifiers:u,hasImportantModifier:m,baseClassName:b,maybePostfixModifierPosition:f}};return r?s=>r({className:s,parseClassName:i}):i},gn=e=>{if(e.length<=1)return e;const t=[];let r=[];return e.forEach(n=>{n[0]==="["?(t.push(...r.sort(),n),r=[]):r.push(n)}),t.push(...r.sort()),t},bn=e=>({cache:mn(e.cacheSize),parseClassName:vn(e),...dn(e)}),wn=/\s+/,xn=(e,t)=>{const{parseClassName:r,getClassGroupId:n,getConflictingClassGroupIds:o}=t,a=[],i=e.trim().split(wn);let s="";for(let u=i.length-1;u>=0;u-=1){const l=i[u],{modifiers:d,hasImportantModifier:p,baseClassName:v,maybePostfixModifierPosition:m}=r(l);let b=!!m,f=n(b?v.substring(0,m):v);if(!f){if(!b){s=l+(s.length>0?" "+s:s);continue}if(f=n(v),!f){s=l+(s.length>0?" "+s:s);continue}b=!1}const y=gn(d).join(":"),g=p?y+Ht:y,k=g+f;if(a.includes(k))continue;a.push(k);const M=o(f,b);for(let C=0;C<M.length;++C){const R=M[C];a.push(g+R)}s=l+(s.length>0?" "+s:s)}return s};function kn(){let e=0,t,r,n="";for(;e<arguments.length;)(t=arguments[e++])&&(r=Gt(t))&&(n&&(n+=" "),n+=r);return n}const Gt=e=>{if(typeof e=="string")return e;let t,r="";for(let n=0;n<e.length;n++)e[n]&&(t=Gt(e[n]))&&(r&&(r+=" "),r+=t);return r};function Cn(e,...t){let r,n,o,a=i;function i(u){const l=t.reduce((d,p)=>p(d),e());return r=bn(l),n=r.cache.get,o=r.cache.set,a=s,s(u)}function s(u){const l=n(u);if(l)return l;const d=xn(u,r);return o(u,d),d}return function(){return a(kn.apply(null,arguments))}}const P=e=>{const t=r=>r[e]||[];return t.isThemeGetter=!0,t},Zt=/^\[(?:([a-z-]+):)?(.+)\]$/i,En=/^\d+\/\d+$/,Mn=new Set(["px","full","screen"]),Sn=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,Pn=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,Rn=/^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/,_n=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,An=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,D=e=>Z(e)||Mn.has(e)||En.test(e),F=e=>Y(e,"length",zn),Z=e=>!!e&&!Number.isNaN(Number(e)),Ce=e=>Y(e,"number",Z),J=e=>!!e&&Number.isInteger(Number(e)),On=e=>e.endsWith("%")&&Z(e.slice(0,-1)),w=e=>Zt.test(e),V=e=>Sn.test(e),Tn=new Set(["length","size","percentage"]),Nn=e=>Y(e,Tn,Kt),jn=e=>Y(e,"position",Kt),Ln=new Set(["image","url"]),Dn=e=>Y(e,Ln,Vn),In=e=>Y(e,"",Fn),ee=()=>!0,Y=(e,t,r)=>{const n=Zt.exec(e);return n?n[1]?typeof t=="string"?n[1]===t:t.has(n[1]):r(n[2]):!1},zn=e=>Pn.test(e)&&!Rn.test(e),Kt=()=>!1,Fn=e=>_n.test(e),Vn=e=>An.test(e),Wn=()=>{const e=P("colors"),t=P("spacing"),r=P("blur"),n=P("brightness"),o=P("borderColor"),a=P("borderRadius"),i=P("borderSpacing"),s=P("borderWidth"),u=P("contrast"),l=P("grayscale"),d=P("hueRotate"),p=P("invert"),v=P("gap"),m=P("gradientColorStops"),b=P("gradientColorStopPositions"),f=P("inset"),y=P("margin"),g=P("opacity"),k=P("padding"),M=P("saturate"),C=P("scale"),R=P("sepia"),_=P("skew"),E=P("space"),T=P("translate"),N=()=>["auto","contain","none"],j=()=>["auto","hidden","clip","visible","scroll"],z=()=>["auto",w,t],S=()=>[w,t],Ue=()=>["",D,F],ne=()=>["auto",Z,w],He=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],oe=()=>["solid","dashed","dotted","double","none"],Ge=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],ke=()=>["start","end","center","between","around","evenly","stretch"],Q=()=>["","0",w],Ze=()=>["auto","avoid","all","avoid-page","page","left","right","column"],L=()=>[Z,w];return{cacheSize:500,separator:":",theme:{colors:[ee],spacing:[D,F],blur:["none","",V,w],brightness:L(),borderColor:[e],borderRadius:["none","","full",V,w],borderSpacing:S(),borderWidth:Ue(),contrast:L(),grayscale:Q(),hueRotate:L(),invert:Q(),gap:S(),gradientColorStops:[e],gradientColorStopPositions:[On,F],inset:z(),margin:z(),opacity:L(),padding:S(),saturate:L(),scale:L(),sepia:Q(),skew:L(),space:S(),translate:S()},classGroups:{aspect:[{aspect:["auto","square","video",w]}],container:["container"],columns:[{columns:[V]}],"break-after":[{"break-after":Ze()}],"break-before":[{"break-before":Ze()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...He(),w]}],overflow:[{overflow:j()}],"overflow-x":[{"overflow-x":j()}],"overflow-y":[{"overflow-y":j()}],overscroll:[{overscroll:N()}],"overscroll-x":[{"overscroll-x":N()}],"overscroll-y":[{"overscroll-y":N()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[f]}],"inset-x":[{"inset-x":[f]}],"inset-y":[{"inset-y":[f]}],start:[{start:[f]}],end:[{end:[f]}],top:[{top:[f]}],right:[{right:[f]}],bottom:[{bottom:[f]}],left:[{left:[f]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",J,w]}],basis:[{basis:z()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",w]}],grow:[{grow:Q()}],shrink:[{shrink:Q()}],order:[{order:["first","last","none",J,w]}],"grid-cols":[{"grid-cols":[ee]}],"col-start-end":[{col:["auto",{span:["full",J,w]},w]}],"col-start":[{"col-start":ne()}],"col-end":[{"col-end":ne()}],"grid-rows":[{"grid-rows":[ee]}],"row-start-end":[{row:["auto",{span:[J,w]},w]}],"row-start":[{"row-start":ne()}],"row-end":[{"row-end":ne()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",w]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",w]}],gap:[{gap:[v]}],"gap-x":[{"gap-x":[v]}],"gap-y":[{"gap-y":[v]}],"justify-content":[{justify:["normal",...ke()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...ke(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...ke(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[k]}],px:[{px:[k]}],py:[{py:[k]}],ps:[{ps:[k]}],pe:[{pe:[k]}],pt:[{pt:[k]}],pr:[{pr:[k]}],pb:[{pb:[k]}],pl:[{pl:[k]}],m:[{m:[y]}],mx:[{mx:[y]}],my:[{my:[y]}],ms:[{ms:[y]}],me:[{me:[y]}],mt:[{mt:[y]}],mr:[{mr:[y]}],mb:[{mb:[y]}],ml:[{ml:[y]}],"space-x":[{"space-x":[E]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[E]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",w,t]}],"min-w":[{"min-w":[w,t,"min","max","fit"]}],"max-w":[{"max-w":[w,t,"none","full","min","max","fit","prose",{screen:[V]},V]}],h:[{h:[w,t,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[w,t,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[w,t,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[w,t,"auto","min","max","fit"]}],"font-size":[{text:["base",V,F]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",Ce]}],"font-family":[{font:[ee]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",w]}],"line-clamp":[{"line-clamp":["none",Z,Ce]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",D,w]}],"list-image":[{"list-image":["none",w]}],"list-style-type":[{list:["none","disc","decimal",w]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[g]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[g]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...oe(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",D,F]}],"underline-offset":[{"underline-offset":["auto",D,w]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:S()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",w]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",w]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[g]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...He(),jn]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",Nn]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},Dn]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[b]}],"gradient-via-pos":[{via:[b]}],"gradient-to-pos":[{to:[b]}],"gradient-from":[{from:[m]}],"gradient-via":[{via:[m]}],"gradient-to":[{to:[m]}],rounded:[{rounded:[a]}],"rounded-s":[{"rounded-s":[a]}],"rounded-e":[{"rounded-e":[a]}],"rounded-t":[{"rounded-t":[a]}],"rounded-r":[{"rounded-r":[a]}],"rounded-b":[{"rounded-b":[a]}],"rounded-l":[{"rounded-l":[a]}],"rounded-ss":[{"rounded-ss":[a]}],"rounded-se":[{"rounded-se":[a]}],"rounded-ee":[{"rounded-ee":[a]}],"rounded-es":[{"rounded-es":[a]}],"rounded-tl":[{"rounded-tl":[a]}],"rounded-tr":[{"rounded-tr":[a]}],"rounded-br":[{"rounded-br":[a]}],"rounded-bl":[{"rounded-bl":[a]}],"border-w":[{border:[s]}],"border-w-x":[{"border-x":[s]}],"border-w-y":[{"border-y":[s]}],"border-w-s":[{"border-s":[s]}],"border-w-e":[{"border-e":[s]}],"border-w-t":[{"border-t":[s]}],"border-w-r":[{"border-r":[s]}],"border-w-b":[{"border-b":[s]}],"border-w-l":[{"border-l":[s]}],"border-opacity":[{"border-opacity":[g]}],"border-style":[{border:[...oe(),"hidden"]}],"divide-x":[{"divide-x":[s]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[s]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[g]}],"divide-style":[{divide:oe()}],"border-color":[{border:[o]}],"border-color-x":[{"border-x":[o]}],"border-color-y":[{"border-y":[o]}],"border-color-s":[{"border-s":[o]}],"border-color-e":[{"border-e":[o]}],"border-color-t":[{"border-t":[o]}],"border-color-r":[{"border-r":[o]}],"border-color-b":[{"border-b":[o]}],"border-color-l":[{"border-l":[o]}],"divide-color":[{divide:[o]}],"outline-style":[{outline:["",...oe()]}],"outline-offset":[{"outline-offset":[D,w]}],"outline-w":[{outline:[D,F]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:Ue()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[g]}],"ring-offset-w":[{"ring-offset":[D,F]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",V,In]}],"shadow-color":[{shadow:[ee]}],opacity:[{opacity:[g]}],"mix-blend":[{"mix-blend":[...Ge(),"plus-lighter","plus-darker"]}],"bg-blend":[{"bg-blend":Ge()}],filter:[{filter:["","none"]}],blur:[{blur:[r]}],brightness:[{brightness:[n]}],contrast:[{contrast:[u]}],"drop-shadow":[{"drop-shadow":["","none",V,w]}],grayscale:[{grayscale:[l]}],"hue-rotate":[{"hue-rotate":[d]}],invert:[{invert:[p]}],saturate:[{saturate:[M]}],sepia:[{sepia:[R]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[r]}],"backdrop-brightness":[{"backdrop-brightness":[n]}],"backdrop-contrast":[{"backdrop-contrast":[u]}],"backdrop-grayscale":[{"backdrop-grayscale":[l]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[d]}],"backdrop-invert":[{"backdrop-invert":[p]}],"backdrop-opacity":[{"backdrop-opacity":[g]}],"backdrop-saturate":[{"backdrop-saturate":[M]}],"backdrop-sepia":[{"backdrop-sepia":[R]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[i]}],"border-spacing-x":[{"border-spacing-x":[i]}],"border-spacing-y":[{"border-spacing-y":[i]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",w]}],duration:[{duration:L()}],ease:[{ease:["linear","in","out","in-out",w]}],delay:[{delay:L()}],animate:[{animate:["none","spin","ping","pulse","bounce",w]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[C]}],"scale-x":[{"scale-x":[C]}],"scale-y":[{"scale-y":[C]}],rotate:[{rotate:[J,w]}],"translate-x":[{"translate-x":[T]}],"translate-y":[{"translate-y":[T]}],"skew-x":[{"skew-x":[_]}],"skew-y":[{"skew-y":[_]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",w]}],accent:[{accent:["auto",e]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",w]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":S()}],"scroll-mx":[{"scroll-mx":S()}],"scroll-my":[{"scroll-my":S()}],"scroll-ms":[{"scroll-ms":S()}],"scroll-me":[{"scroll-me":S()}],"scroll-mt":[{"scroll-mt":S()}],"scroll-mr":[{"scroll-mr":S()}],"scroll-mb":[{"scroll-mb":S()}],"scroll-ml":[{"scroll-ml":S()}],"scroll-p":[{"scroll-p":S()}],"scroll-px":[{"scroll-px":S()}],"scroll-py":[{"scroll-py":S()}],"scroll-ps":[{"scroll-ps":S()}],"scroll-pe":[{"scroll-pe":S()}],"scroll-pt":[{"scroll-pt":S()}],"scroll-pr":[{"scroll-pr":S()}],"scroll-pb":[{"scroll-pb":S()}],"scroll-pl":[{"scroll-pl":S()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",w]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[D,F,Ce]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}},Ys=Cn(Wn);var Bn=Ie[" useId ".trim().toString()]||(()=>{}),qn=0;function Ee(e){const[t,r]=c.useState(Bn());return re(()=>{r(n=>n??String(qn++))},[e]),e||(t?`radix-${t}`:"")}var $n=Symbol.for("react.lazy"),pe=Ie[" use ".trim().toString()];function Un(e){return typeof e=="object"&&e!==null&&"then"in e}function Xt(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===$n&&"_payload"in e&&Un(e._payload)}function Hn(e){const t=Gn(e),r=c.forwardRef((n,o)=>{let{children:a,...i}=n;Xt(a)&&typeof pe=="function"&&(a=pe(a._payload));const s=c.Children.toArray(a),u=s.find(Kn);if(u){const l=u.props.children,d=s.map(p=>p===u?c.Children.count(l)>1?c.Children.only(null):c.isValidElement(l)?l.props.children:null:p);return x.jsx(t,{...i,ref:o,children:c.isValidElement(l)?c.cloneElement(l,void 0,d):null})}return x.jsx(t,{...i,ref:o,children:a})});return r.displayName=`${e}.Slot`,r}var Qs=Hn("Slot");function Gn(e){const t=c.forwardRef((r,n)=>{let{children:o,...a}=r;if(Xt(o)&&typeof pe=="function"&&(o=pe(o._payload)),c.isValidElement(o)){const i=Yn(o),s=Xn(a,o.props);return o.type!==c.Fragment&&(s.ref=n?ge(n,i):i),c.cloneElement(o,s)}return c.Children.count(o)>1?c.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Zn=Symbol("radix.slottable");function Kn(e){return c.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Zn}function Xn(e,t){const r={...t};for(const n in t){const o=e[n],a=t[n];/^on[A-Z]/.test(n)?o&&a?r[n]=(...s)=>{const u=a(...s);return o(...s),u}:o&&(r[n]=o):n==="style"?r[n]={...o,...a}:n==="className"&&(r[n]=[o,a].filter(Boolean).join(" "))}return{...e,...r}}function Yn(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var Me="focusScope.autoFocusOnMount",Se="focusScope.autoFocusOnUnmount",rt={bubbles:!1,cancelable:!0},Qn="FocusScope",Yt=c.forwardRef((e,t)=>{const{loop:r=!1,trapped:n=!1,onMountAutoFocus:o,onUnmountAutoFocus:a,...i}=e,[s,u]=c.useState(null),l=te(o),d=te(a),p=c.useRef(null),v=$(t,f=>u(f)),m=c.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;c.useEffect(()=>{if(n){let f=function(M){if(m.paused||!s)return;const C=M.target;s.contains(C)?p.current=C:W(p.current,{select:!0})},y=function(M){if(m.paused||!s)return;const C=M.relatedTarget;C!==null&&(s.contains(C)||W(p.current,{select:!0}))},g=function(M){if(document.activeElement===document.body)for(const R of M)R.removedNodes.length>0&&W(s)};document.addEventListener("focusin",f),document.addEventListener("focusout",y);const k=new MutationObserver(g);return s&&k.observe(s,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",f),document.removeEventListener("focusout",y),k.disconnect()}}},[n,s,m.paused]),c.useEffect(()=>{if(s){ot.add(m);const f=document.activeElement;if(!s.contains(f)){const g=new CustomEvent(Me,rt);s.addEventListener(Me,l),s.dispatchEvent(g),g.defaultPrevented||(Jn(oo(Qt(s)),{select:!0}),document.activeElement===f&&W(s))}return()=>{s.removeEventListener(Me,l),setTimeout(()=>{const g=new CustomEvent(Se,rt);s.addEventListener(Se,d),s.dispatchEvent(g),g.defaultPrevented||W(f??document.body,{select:!0}),s.removeEventListener(Se,d),ot.remove(m)},0)}}},[s,l,d,m]);const b=c.useCallback(f=>{if(!r&&!n||m.paused)return;const y=f.key==="Tab"&&!f.altKey&&!f.ctrlKey&&!f.metaKey,g=document.activeElement;if(y&&g){const k=f.currentTarget,[M,C]=eo(k);M&&C?!f.shiftKey&&g===C?(f.preventDefault(),r&&W(M,{select:!0})):f.shiftKey&&g===M&&(f.preventDefault(),r&&W(C,{select:!0})):g===k&&f.preventDefault()}},[r,n,m.paused]);return x.jsx(I.div,{tabIndex:-1,...i,ref:v,onKeyDown:b})});Yt.displayName=Qn;function Jn(e,{select:t=!1}={}){const r=document.activeElement;for(const n of e)if(W(n,{select:t}),document.activeElement!==r)return}function eo(e){const t=Qt(e),r=nt(t,e),n=nt(t.reverse(),e);return[r,n]}function Qt(e){const t=[],r=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:n=>{const o=n.tagName==="INPUT"&&n.type==="hidden";return n.disabled||n.hidden||o?NodeFilter.FILTER_SKIP:n.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;r.nextNode();)t.push(r.currentNode);return t}function nt(e,t){for(const r of e)if(!to(r,{upTo:t}))return r}function to(e,{upTo:t}){if(getComputedStyle(e).visibility==="hidden")return!0;for(;e;){if(t!==void 0&&e===t)return!1;if(getComputedStyle(e).display==="none")return!0;e=e.parentElement}return!1}function ro(e){return e instanceof HTMLInputElement&&"select"in e}function W(e,{select:t=!1}={}){if(e&&e.focus){const r=document.activeElement;e.focus({preventScroll:!0}),e!==r&&ro(e)&&t&&e.select()}}var ot=no();function no(){let e=[];return{add(t){const r=e[0];t!==r&&(r==null||r.pause()),e=at(e,t),e.unshift(t)},remove(t){var r;e=at(e,t),(r=e[0])==null||r.resume()}}}function at(e,t){const r=[...e],n=r.indexOf(t);return n!==-1&&r.splice(n,1),r}function oo(e){return e.filter(t=>t.tagName!=="A")}var Pe=0;function ao(){c.useEffect(()=>{const e=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",e[0]??st()),document.body.insertAdjacentElement("beforeend",e[1]??st()),Pe++,()=>{Pe===1&&document.querySelectorAll("[data-radix-focus-guard]").forEach(t=>t.remove()),Pe--}},[])}function st(){const e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}var ue="right-scroll-bar-position",de="width-before-scroll-bar",so="with-scroll-bars-hidden",io="--removed-body-scroll-bar-size";function Re(e,t){return typeof e=="function"?e(t):e&&(e.current=t),e}function co(e,t){var r=c.useState(function(){return{value:e,callback:t,facade:{get current(){return r.value},set current(n){var o=r.value;o!==n&&(r.value=n,r.callback(n,o))}}}})[0];return r.callback=t,r.facade}var lo=typeof window<"u"?c.useLayoutEffect:c.useEffect,it=new WeakMap;function uo(e,t){var r=co(null,function(n){return e.forEach(function(o){return Re(o,n)})});return lo(function(){var n=it.get(r);if(n){var o=new Set(n),a=new Set(e),i=r.current;o.forEach(function(s){a.has(s)||Re(s,null)}),a.forEach(function(s){o.has(s)||Re(s,i)})}it.set(r,e)},[e]),r}function fo(e){return e}function po(e,t){t===void 0&&(t=fo);var r=[],n=!1,o={read:function(){if(n)throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return r.length?r[r.length-1]:e},useMedium:function(a){var i=t(a,n);return r.push(i),function(){r=r.filter(function(s){return s!==i})}},assignSyncMedium:function(a){for(n=!0;r.length;){var i=r;r=[],i.forEach(a)}r={push:function(s){return a(s)},filter:function(){return r}}},assignMedium:function(a){n=!0;var i=[];if(r.length){var s=r;r=[],s.forEach(a),i=r}var u=function(){var d=i;i=[],d.forEach(a)},l=function(){return Promise.resolve().then(u)};l(),r={push:function(d){i.push(d),l()},filter:function(d){return i=i.filter(d),r}}}};return o}function ho(e){e===void 0&&(e={});var t=po(null);return t.options=A({async:!0,ssr:!1},e),t}var Jt=function(e){var t=e.sideCar,r=me(e,["sideCar"]);if(!t)throw new Error("Sidecar: please provide `sideCar` property to import the right car");var n=t.read();if(!n)throw new Error("Sidecar medium not found");return c.createElement(n,A({},r))};Jt.isSideCarExport=!0;function yo(e,t){return e.useMedium(t),Jt}var er=ho(),_e=function(){},we=c.forwardRef(function(e,t){var r=c.useRef(null),n=c.useState({onScrollCapture:_e,onWheelCapture:_e,onTouchMoveCapture:_e}),o=n[0],a=n[1],i=e.forwardProps,s=e.children,u=e.className,l=e.removeScrollBar,d=e.enabled,p=e.shards,v=e.sideCar,m=e.noRelative,b=e.noIsolation,f=e.inert,y=e.allowPinchZoom,g=e.as,k=g===void 0?"div":g,M=e.gapMode,C=me(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noRelative","noIsolation","inert","allowPinchZoom","as","gapMode"]),R=v,_=uo([r,t]),E=A(A({},C),o);return c.createElement(c.Fragment,null,d&&c.createElement(R,{sideCar:er,removeScrollBar:l,shards:p,noRelative:m,noIsolation:b,inert:f,setCallbacks:a,allowPinchZoom:!!y,lockRef:r,gapMode:M}),i?c.cloneElement(c.Children.only(s),A(A({},E),{ref:_})):c.createElement(k,A({},E,{className:u,ref:_}),s))});we.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1};we.classNames={fullWidth:de,zeroRight:ue};var mo=function(){if(typeof __webpack_nonce__<"u")return __webpack_nonce__};function vo(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=mo();return t&&e.setAttribute("nonce",t),e}function go(e,t){e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t))}function bo(e){var t=document.head||document.getElementsByTagName("head")[0];t.appendChild(e)}var wo=function(){var e=0,t=null;return{add:function(r){e==0&&(t=vo())&&(go(t,r),bo(t)),e++},remove:function(){e--,!e&&t&&(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},xo=function(){var e=wo();return function(t,r){c.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&r])}},tr=function(){var e=xo(),t=function(r){var n=r.styles,o=r.dynamic;return e(n,o),null};return t},ko={left:0,top:0,right:0,gap:0},Ae=function(e){return parseInt(e||"",10)||0},Co=function(e){var t=window.getComputedStyle(document.body),r=t[e==="padding"?"paddingLeft":"marginLeft"],n=t[e==="padding"?"paddingTop":"marginTop"],o=t[e==="padding"?"paddingRight":"marginRight"];return[Ae(r),Ae(n),Ae(o)]},Eo=function(e){if(e===void 0&&(e="margin"),typeof window>"u")return ko;var t=Co(e),r=document.documentElement.clientWidth,n=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,n-r+t[2]-t[0])}},Mo=tr(),K="data-scroll-locked",So=function(e,t,r,n){var o=e.left,a=e.top,i=e.right,s=e.gap;return r===void 0&&(r="margin"),`
  .`.concat(so,` {
   overflow: hidden `).concat(n,`;
   padding-right: `).concat(s,"px ").concat(n,`;
  }
  body[`).concat(K,`] {
    overflow: hidden `).concat(n,`;
    overscroll-behavior: contain;
    `).concat([t&&"position: relative ".concat(n,";"),r==="margin"&&`
    padding-left: `.concat(o,`px;
    padding-top: `).concat(a,`px;
    padding-right: `).concat(i,`px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(s,"px ").concat(n,`;
    `),r==="padding"&&"padding-right: ".concat(s,"px ").concat(n,";")].filter(Boolean).join(""),`
  }
  
  .`).concat(ue,` {
    right: `).concat(s,"px ").concat(n,`;
  }
  
  .`).concat(de,` {
    margin-right: `).concat(s,"px ").concat(n,`;
  }
  
  .`).concat(ue," .").concat(ue,` {
    right: 0 `).concat(n,`;
  }
  
  .`).concat(de," .").concat(de,` {
    margin-right: 0 `).concat(n,`;
  }
  
  body[`).concat(K,`] {
    `).concat(io,": ").concat(s,`px;
  }
`)},ct=function(){var e=parseInt(document.body.getAttribute(K)||"0",10);return isFinite(e)?e:0},Po=function(){c.useEffect(function(){return document.body.setAttribute(K,(ct()+1).toString()),function(){var e=ct()-1;e<=0?document.body.removeAttribute(K):document.body.setAttribute(K,e.toString())}},[])},Ro=function(e){var t=e.noRelative,r=e.noImportant,n=e.gapMode,o=n===void 0?"margin":n;Po();var a=c.useMemo(function(){return Eo(o)},[o]);return c.createElement(Mo,{styles:So(a,!t,o,r?"":"!important")})},De=!1;if(typeof window<"u")try{var se=Object.defineProperty({},"passive",{get:function(){return De=!0,!0}});window.addEventListener("test",se,se),window.removeEventListener("test",se,se)}catch{De=!1}var U=De?{passive:!1}:!1,_o=function(e){return e.tagName==="TEXTAREA"},rr=function(e,t){if(!(e instanceof Element))return!1;var r=window.getComputedStyle(e);return r[t]!=="hidden"&&!(r.overflowY===r.overflowX&&!_o(e)&&r[t]==="visible")},Ao=function(e){return rr(e,"overflowY")},Oo=function(e){return rr(e,"overflowX")},lt=function(e,t){var r=t.ownerDocument,n=t;do{typeof ShadowRoot<"u"&&n instanceof ShadowRoot&&(n=n.host);var o=nr(e,n);if(o){var a=or(e,n),i=a[1],s=a[2];if(i>s)return!0}n=n.parentNode}while(n&&n!==r.body);return!1},To=function(e){var t=e.scrollTop,r=e.scrollHeight,n=e.clientHeight;return[t,r,n]},No=function(e){var t=e.scrollLeft,r=e.scrollWidth,n=e.clientWidth;return[t,r,n]},nr=function(e,t){return e==="v"?Ao(t):Oo(t)},or=function(e,t){return e==="v"?To(t):No(t)},jo=function(e,t){return e==="h"&&t==="rtl"?-1:1},Lo=function(e,t,r,n,o){var a=jo(e,window.getComputedStyle(t).direction),i=a*n,s=r.target,u=t.contains(s),l=!1,d=i>0,p=0,v=0;do{if(!s)break;var m=or(e,s),b=m[0],f=m[1],y=m[2],g=f-y-a*b;(b||g)&&nr(e,s)&&(p+=g,v+=b);var k=s.parentNode;s=k&&k.nodeType===Node.DOCUMENT_FRAGMENT_NODE?k.host:k}while(!u&&s!==document.body||u&&(t.contains(s)||t===s));return(d&&Math.abs(p)<1||!d&&Math.abs(v)<1)&&(l=!0),l},ie=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},ut=function(e){return[e.deltaX,e.deltaY]},dt=function(e){return e&&"current"in e?e.current:e},Do=function(e,t){return e[0]===t[0]&&e[1]===t[1]},Io=function(e){return`
  .block-interactivity-`.concat(e,` {pointer-events: none;}
  .allow-interactivity-`).concat(e,` {pointer-events: all;}
`)},zo=0,H=[];function Fo(e){var t=c.useRef([]),r=c.useRef([0,0]),n=c.useRef(),o=c.useState(zo++)[0],a=c.useState(tr)[0],i=c.useRef(e);c.useEffect(function(){i.current=e},[e]),c.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(o));var f=Fe([e.lockRef.current],(e.shards||[]).map(dt),!0).filter(Boolean);return f.forEach(function(y){return y.classList.add("allow-interactivity-".concat(o))}),function(){document.body.classList.remove("block-interactivity-".concat(o)),f.forEach(function(y){return y.classList.remove("allow-interactivity-".concat(o))})}}},[e.inert,e.lockRef.current,e.shards]);var s=c.useCallback(function(f,y){if("touches"in f&&f.touches.length===2||f.type==="wheel"&&f.ctrlKey)return!i.current.allowPinchZoom;var g=ie(f),k=r.current,M="deltaX"in f?f.deltaX:k[0]-g[0],C="deltaY"in f?f.deltaY:k[1]-g[1],R,_=f.target,E=Math.abs(M)>Math.abs(C)?"h":"v";if("touches"in f&&E==="h"&&_.type==="range")return!1;var T=window.getSelection(),N=T&&T.anchorNode,j=N?N===_||N.contains(_):!1;if(j)return!1;var z=lt(E,_);if(!z)return!0;if(z?R=E:(R=E==="v"?"h":"v",z=lt(E,_)),!z)return!1;if(!n.current&&"changedTouches"in f&&(M||C)&&(n.current=R),!R)return!0;var S=n.current||R;return Lo(S,y,f,S==="h"?M:C)},[]),u=c.useCallback(function(f){var y=f;if(!(!H.length||H[H.length-1]!==a)){var g="deltaY"in y?ut(y):ie(y),k=t.current.filter(function(R){return R.name===y.type&&(R.target===y.target||y.target===R.shadowParent)&&Do(R.delta,g)})[0];if(k&&k.should){y.cancelable&&y.preventDefault();return}if(!k){var M=(i.current.shards||[]).map(dt).filter(Boolean).filter(function(R){return R.contains(y.target)}),C=M.length>0?s(y,M[0]):!i.current.noIsolation;C&&y.cancelable&&y.preventDefault()}}},[]),l=c.useCallback(function(f,y,g,k){var M={name:f,delta:y,target:g,should:k,shadowParent:Vo(g)};t.current.push(M),setTimeout(function(){t.current=t.current.filter(function(C){return C!==M})},1)},[]),d=c.useCallback(function(f){r.current=ie(f),n.current=void 0},[]),p=c.useCallback(function(f){l(f.type,ut(f),f.target,s(f,e.lockRef.current))},[]),v=c.useCallback(function(f){l(f.type,ie(f),f.target,s(f,e.lockRef.current))},[]);c.useEffect(function(){return H.push(a),e.setCallbacks({onScrollCapture:p,onWheelCapture:p,onTouchMoveCapture:v}),document.addEventListener("wheel",u,U),document.addEventListener("touchmove",u,U),document.addEventListener("touchstart",d,U),function(){H=H.filter(function(f){return f!==a}),document.removeEventListener("wheel",u,U),document.removeEventListener("touchmove",u,U),document.removeEventListener("touchstart",d,U)}},[]);var m=e.removeScrollBar,b=e.inert;return c.createElement(c.Fragment,null,b?c.createElement(a,{styles:Io(o)}):null,m?c.createElement(Ro,{noRelative:e.noRelative,gapMode:e.gapMode}):null)}function Vo(e){for(var t=null;e!==null;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}const Wo=yo(er,Fo);var ar=c.forwardRef(function(e,t){return c.createElement(we,A({},e,{ref:t,sideCar:Wo}))});ar.classNames=we.classNames;var Bo=function(e){if(typeof document>"u")return null;var t=Array.isArray(e)?e[0]:e;return t.ownerDocument.body},G=new WeakMap,ce=new WeakMap,le={},Oe=0,sr=function(e){return e&&(e.host||sr(e.parentNode))},qo=function(e,t){return t.map(function(r){if(e.contains(r))return r;var n=sr(r);return n&&e.contains(n)?n:null}).filter(function(r){return!!r})},$o=function(e,t,r,n){var o=qo(t,Array.isArray(e)?e:[e]);le[r]||(le[r]=new WeakMap);var a=le[r],i=[],s=new Set,u=new Set(o),l=function(p){!p||s.has(p)||(s.add(p),l(p.parentNode))};o.forEach(l);var d=function(p){!p||u.has(p)||Array.prototype.forEach.call(p.children,function(v){if(s.has(v))d(v);else try{var m=v.getAttribute(n),b=m!==null&&m!=="false",f=(G.get(v)||0)+1,y=(a.get(v)||0)+1;G.set(v,f),a.set(v,y),i.push(v),f===1&&b&&ce.set(v,!0),y===1&&v.setAttribute(r,"true"),b||v.setAttribute(n,"true")}catch{}})};return d(t),s.clear(),Oe++,function(){i.forEach(function(p){var v=G.get(p)-1,m=a.get(p)-1;G.set(p,v),a.set(p,m),v||(ce.has(p)||p.removeAttribute(n),ce.delete(p)),m||p.removeAttribute(r)}),Oe--,Oe||(G=new WeakMap,G=new WeakMap,ce=new WeakMap,le={})}},Uo=function(e,t,r){r===void 0&&(r="data-aria-hidden");var n=Array.from(Array.isArray(e)?e:[e]),o=Bo(e);return o?(n.push.apply(n,Array.from(o.querySelectorAll("[aria-live], script"))),$o(n,o,r,"aria-hidden")):function(){return null}};function Ho(e){const t=Go(e),r=c.forwardRef((n,o)=>{const{children:a,...i}=n,s=c.Children.toArray(a),u=s.find(Ko);if(u){const l=u.props.children,d=s.map(p=>p===u?c.Children.count(l)>1?c.Children.only(null):c.isValidElement(l)?l.props.children:null:p);return x.jsx(t,{...i,ref:o,children:c.isValidElement(l)?c.cloneElement(l,void 0,d):null})}return x.jsx(t,{...i,ref:o,children:a})});return r.displayName=`${e}.Slot`,r}function Go(e){const t=c.forwardRef((r,n)=>{const{children:o,...a}=r;if(c.isValidElement(o)){const i=Yo(o),s=Xo(a,o.props);return o.type!==c.Fragment&&(s.ref=n?ge(n,i):i),c.cloneElement(o,s)}return c.Children.count(o)>1?c.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Zo=Symbol("radix.slottable");function Ko(e){return c.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Zo}function Xo(e,t){const r={...t};for(const n in t){const o=e[n],a=t[n];/^on[A-Z]/.test(n)?o&&a?r[n]=(...s)=>{const u=a(...s);return o(...s),u}:o&&(r[n]=o):n==="style"?r[n]={...o,...a}:n==="className"&&(r[n]=[o,a].filter(Boolean).join(" "))}return{...e,...r}}function Yo(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var xe="Dialog",[ir,Js]=zr(xe),[Qo,O]=ir(xe),cr=e=>{const{__scopeDialog:t,children:r,open:n,defaultOpen:o,onOpenChange:a,modal:i=!0}=e,s=c.useRef(null),u=c.useRef(null),[l,d]=sn({prop:n,defaultProp:o??!1,onChange:a,caller:xe});return x.jsx(Qo,{scope:t,triggerRef:s,contentRef:u,contentId:Ee(),titleId:Ee(),descriptionId:Ee(),open:l,onOpenChange:d,onOpenToggle:c.useCallback(()=>d(p=>!p),[d]),modal:i,children:r})};cr.displayName=xe;var lr="DialogTrigger",ur=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=O(lr,r),a=$(t,o.triggerRef);return x.jsx(I.button,{type:"button","aria-haspopup":"dialog","aria-expanded":o.open,"aria-controls":o.contentId,"data-state":$e(o.open),...n,ref:a,onClick:B(e.onClick,o.onOpenToggle)})});ur.displayName=lr;var Be="DialogPortal",[Jo,dr]=ir(Be,{forceMount:void 0}),fr=e=>{const{__scopeDialog:t,forceMount:r,children:n,container:o}=e,a=O(Be,t);return x.jsx(Jo,{scope:t,forceMount:r,children:c.Children.map(n,i=>x.jsx(be,{present:r||a.open,children:x.jsx(qt,{asChild:!0,container:o,children:i})}))})};fr.displayName=Be;var he="DialogOverlay",pr=c.forwardRef((e,t)=>{const r=dr(he,e.__scopeDialog),{forceMount:n=r.forceMount,...o}=e,a=O(he,e.__scopeDialog);return a.modal?x.jsx(be,{present:n||a.open,children:x.jsx(ta,{...o,ref:t})}):null});pr.displayName=he;var ea=Ho("DialogOverlay.RemoveScroll"),ta=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=O(he,r);return x.jsx(ar,{as:ea,allowPinchZoom:!0,shards:[o.contentRef],children:x.jsx(I.div,{"data-state":$e(o.open),...n,ref:t,style:{pointerEvents:"auto",...n.style}})})}),q="DialogContent",hr=c.forwardRef((e,t)=>{const r=dr(q,e.__scopeDialog),{forceMount:n=r.forceMount,...o}=e,a=O(q,e.__scopeDialog);return x.jsx(be,{present:n||a.open,children:a.modal?x.jsx(ra,{...o,ref:t}):x.jsx(na,{...o,ref:t})})});hr.displayName=q;var ra=c.forwardRef((e,t)=>{const r=O(q,e.__scopeDialog),n=c.useRef(null),o=$(t,r.contentRef,n);return c.useEffect(()=>{const a=n.current;if(a)return Uo(a)},[]),x.jsx(yr,{...e,ref:o,trapFocus:r.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:B(e.onCloseAutoFocus,a=>{var i;a.preventDefault(),(i=r.triggerRef.current)==null||i.focus()}),onPointerDownOutside:B(e.onPointerDownOutside,a=>{const i=a.detail.originalEvent,s=i.button===0&&i.ctrlKey===!0;(i.button===2||s)&&a.preventDefault()}),onFocusOutside:B(e.onFocusOutside,a=>a.preventDefault())})}),na=c.forwardRef((e,t)=>{const r=O(q,e.__scopeDialog),n=c.useRef(!1),o=c.useRef(!1);return x.jsx(yr,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:a=>{var i,s;(i=e.onCloseAutoFocus)==null||i.call(e,a),a.defaultPrevented||(n.current||(s=r.triggerRef.current)==null||s.focus(),a.preventDefault()),n.current=!1,o.current=!1},onInteractOutside:a=>{var u,l;(u=e.onInteractOutside)==null||u.call(e,a),a.defaultPrevented||(n.current=!0,a.detail.originalEvent.type==="pointerdown"&&(o.current=!0));const i=a.target;((l=r.triggerRef.current)==null?void 0:l.contains(i))&&a.preventDefault(),a.detail.originalEvent.type==="focusin"&&o.current&&a.preventDefault()}})}),yr=c.forwardRef((e,t)=>{const{__scopeDialog:r,trapFocus:n,onOpenAutoFocus:o,onCloseAutoFocus:a,...i}=e,s=O(q,r),u=c.useRef(null),l=$(t,u);return ao(),x.jsxs(x.Fragment,{children:[x.jsx(Yt,{asChild:!0,loop:!0,trapped:n,onMountAutoFocus:o,onUnmountAutoFocus:a,children:x.jsx(Ve,{role:"dialog",id:s.contentId,"aria-describedby":s.descriptionId,"aria-labelledby":s.titleId,"data-state":$e(s.open),...i,ref:l,onDismiss:()=>s.onOpenChange(!1)})}),x.jsxs(x.Fragment,{children:[x.jsx(oa,{titleId:s.titleId}),x.jsx(sa,{contentRef:u,descriptionId:s.descriptionId})]})]})}),qe="DialogTitle",mr=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=O(qe,r);return x.jsx(I.h2,{id:o.titleId,...n,ref:t})});mr.displayName=qe;var vr="DialogDescription",gr=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=O(vr,r);return x.jsx(I.p,{id:o.descriptionId,...n,ref:t})});gr.displayName=vr;var br="DialogClose",wr=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=O(br,r);return x.jsx(I.button,{type:"button",...n,ref:t,onClick:B(e.onClick,()=>o.onOpenChange(!1))})});wr.displayName=br;function $e(e){return e?"open":"closed"}var xr="DialogTitleWarning",[ei,kr]=Ir(xr,{contentName:q,titleName:qe,docsSlug:"dialog"}),oa=({titleId:e})=>{const t=kr(xr),r=`\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;return c.useEffect(()=>{if(e){const n=document.getElementById(e)}},[r,e]),null},aa="DialogDescriptionWarning",sa=({contentRef:e,descriptionId:t})=>{const n=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${kr(aa).contentName}}.`;return c.useEffect(()=>{var a;const o=(a=e.current)==null?void 0:a.getAttribute("aria-describedby");if(t&&o){const i=document.getElementById(t)}},[n,e,t]),null},ti=cr,ri=ur,ni=fr,oi=pr,ai=hr,si=mr,ii=gr,ci=wr;export{Ua as $,la as A,Ks as B,Da as C,Ve as D,Wa as E,Ta as F,ba as G,Fs as H,da as I,Ga as J,Fa as K,os as L,Na as M,ps as N,Ka as O,I as P,va as Q,Zs as R,Ps as S,Is as T,$s as U,As as V,Ds as W,Hs as X,Ma as Y,gs as Z,kt as _,me as a,ei as a$,Rs as a0,ha as a1,ka as a2,Ea as a3,ks as a4,_a as a5,Ee as a6,ts as a7,$a as a8,Qa as a9,Hn as aA,ms as aB,fa as aC,Ha as aD,ls as aE,ds as aF,ja as aG,ga as aH,Us as aI,vs as aJ,zs as aK,ti as aL,ri as aM,ni as aN,ai as aO,ci as aP,si as aQ,ii as aR,oi as aS,cs as aT,qa as aU,Cs as aV,Za as aW,Ba as aX,xa as aY,as as aZ,Js as a_,Ya as aa,rs as ab,ua as ac,Pa as ad,za as ae,Ca as af,Ra as ag,Ns as ah,fs as ai,Ts as aj,us as ak,is as al,Va as am,Uo as an,ao,ar as ap,Yt as aq,Oa as ar,hs as as,es as at,pa as au,ns as av,Xa as aw,Os as ax,Ls as ay,Vs as az,zr as b,Gs as b0,xs as b1,js as b2,ws as b3,Ja as b4,Ss as b5,ss as b6,Qs as b7,Sa as b8,Aa as b9,ys as ba,La as bb,wa as bc,ge as c,sn as d,be as e,B as f,te as g,qt as h,re as i,x as j,Gr as k,Ys as l,un as m,Xs as n,Ia as o,Es as p,Ws as q,Bs as r,_s as s,ca as t,$ as u,ma as v,ya as w,qs as x,Ms as y,bs as z};
