var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function r(e){e.forEach(t)}function i(e){return"function"==typeof e}function l(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function a(e,t){e.appendChild(t)}function o(e,t,n){e.insertBefore(t,n||null)}function u(e){e.parentNode.removeChild(e)}function c(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function s(e){return document.createElement(e)}function d(e){return document.createTextNode(e)}function f(){return d(" ")}function p(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function h(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function m(e){return""===e?void 0:+e}function v(e,t){t=""+t,e.data!==t&&(e.data=t)}function g(e,t){for(let n=0;n<e.options.length;n+=1){const r=e.options[n];if(r.__value===t)return void(r.selected=!0)}}let y;function $(e){y=e}const _=[],b=Promise.resolve();let x=!1;const L=[],q=[],N=[];function M(e){q.push(e)}function O(){const e=new Set;do{for(;_.length;){const e=_.shift();$(e),U(e.$$)}for(;L.length;)L.shift()();for(;q.length;){const t=q.pop();e.has(t)||(t(),e.add(t))}}while(_.length);for(;N.length;)N.pop()();x=!1}function U(e){e.fragment&&(e.update(e.dirty),r(e.before_render),e.fragment.p(e.dirty,e.ctx),e.dirty=null,e.after_render.forEach(M))}function j(e,t){e.$$.dirty||(_.push(e),x||(x=!0,b.then(O)),e.$$.dirty=n()),e.$$.dirty[t]=!0}function E(l,a,o,u,c,s){const d=y;$(l);const f=a.props||{},p=l.$$={fragment:null,ctx:null,props:s,update:e,not_equal:c,bound:n(),on_mount:[],on_destroy:[],before_render:[],after_render:[],context:new Map(d?d.$$.context:[]),callbacks:n(),dirty:null};let h=!1;p.ctx=o?o(l,f,(e,t)=>{p.ctx&&c(p.ctx[e],p.ctx[e]=t)&&(p.bound[e]&&p.bound[e](t),h&&j(l,e))}):f,p.update(),h=!0,r(p.before_render),p.fragment=u(p.ctx),a.target&&(a.hydrate?p.fragment.l(function(e){return Array.from(e.childNodes)}(a.target)):p.fragment.c(),a.intro&&l.$$.fragment.i&&l.$$.fragment.i(),function(e,n,l){const{fragment:a,on_mount:o,on_destroy:u,after_render:c}=e.$$;a.m(n,l),M(()=>{const n=o.map(t).filter(i);u?u.push(...n):r(n),e.$$.on_mount=[]}),c.forEach(M)}(l,a.target,a.anchor),O()),$(d)}class R{$destroy(){var t,n;n=!0,(t=this).$$&&(r(t.$$.on_destroy),t.$$.fragment.d(n),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={}),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}var V={iron:[0,32,65,100,135,172,211,250,291,333,418,506,598,693,791,893,998,1106,1218,1333,1503,1679,1862,2052,2249,2452,2662,2879,3103,3333],bronze:[0,35,72,110,149,189,232,275,320,366,460,557,658,762,870,982,1098,1217,1340,1466,1653,1847,2048,2257,2474,2697,2928,3167,3413,3666,3978,4301,4637,4984,5345,5718,6103,6501,6910,7334],silver:[0,38,78,120,162,206,253,300,349,400,502,607,718,832,949,1072,1198,1327,1462,1600,1804,2015,2234,2462,2699,2942,3194,3455,3724,4e3,4339,4692,5058,5437,5831,6238,6658,7092,7538,8e3,8678,9383,10115,10874,11662,12474,13315,14183,15078,16e3,17017,18074,19172,20312,21492],gold:[0,42,85,130,176,224,274,325,378,433,543,658,777,901,1028,1161,1297,1438,1583,1733,1954,2183,2421,2668,2924,3188,3461,3743,4034,4333,4701,5083,5480,5890,6317,6757,7212,7683,8167,8667,9402,10165,10958,11781,12633,13514,14425,15365,16335,17333,18435,19581,20770,22005,23283,24605,25970,27381,28835,30333,31802,33329,34917,36561,38266,40028,41850,43729,45669,47667,49503,51412,53395,55452,57582,59786,62062,64412,66836,69333,71904,74577,77354,80233,83214,86299,89487,92777,96170,99667,102237,104911,107687,110566,113549,116633,119820,123111,126504],platinum:[0,45,91,140,189,241,295,350,407,466,585,708,837,970,1107,1250,1397,1548,1705,1866,2104,2351,2607,2873,3149,3433,3727,4031,4344,4666,5062,5474,5901,6343,6803,7277,7767,8274,8795,9334,10125,10947,11801,12687,13605,14553,15534,16547,17591,18666,19853,21087,22368,23698,25074,26498,27968,29487,31053,32666,34248,35893,37603,39374,41209,43107,45069,47093,49182,51334,53311,55367,57502,59717,62012,64385,66836,69367,71977,74666,77435,80314,83304,86405,89615,92938,96370,99914,103568,107334,110102,112981,115970,119071,122283,125605,129037,132581,136235],black:[0,48,98,150,203,258,317,375,437,500,627,759,897,1040,1187,1340,1497,1659,1827,2e3,2255,2519,2793,3078,3374,3678,3993,4319,4655,5e3,5424,5865,6323,6797,7289,7797,8322,8865,9423,10001,10848,11729,12644,13593,14577,15593,16644,17729,18848,2e4,21272,22593,23966,25391,26865,28391,29966,31593,33272,35e3,36695,38457,40289,42186,44153,46187,48288,50457,52695,55001,57119,59322,61610,63983,66441,68984,71610,74322,77118,8e4,82967,86051,89255,92577,96017,99576,103254,107051,110966,115001,117966,121052,124254,127577,131018,134577,138254,142052,145967]};function k(e,t,n){const r=Object.create(e);return r.unitName=t[n][0],r.value=t[n][1],r}function C(e,t,n){const r=Object.create(e);return r.name=t[n],r}function S(e){var t,n,r,i,l,a=e.requiredMinLevel+1,c=V[e.selectedRarity][e.requiredMinLevel+1]-e.requiredMinValue||"-";return{c(){t=d("需先餵銅肥至 LV"),n=d(a),r=d(" ("),i=d(c),l=d(")。")},m(e,a){o(e,t,a),o(e,n,a),o(e,r,a),o(e,i,a),o(e,l,a)},p(e,t){e.requiredMinLevel&&a!==(a=t.requiredMinLevel+1)&&v(n,a),(e.selectedRarity||e.requiredMinLevel||e.requiredMinValue)&&c!==(c=V[t.selectedRarity][t.requiredMinLevel+1]-t.requiredMinValue||"-")&&v(i,c)},d(e){e&&(u(t),u(n),u(r),u(i),u(l))}}}function w(e){var t,n,r,i=-e.requiredMinValue;return{c(){t=d("經驗值溢出 "),n=d(i),r=d("。")},m(e,i){o(e,t,i),o(e,n,i),o(e,r,i)},p(e,t){e.requiredMinValue&&i!==(i=-t.requiredMinValue)&&v(n,i)},d(e){e&&(u(t),u(n),u(r))}}}function A(e){var t,n,r=e.name;return{c(){t=s("option"),n=d(r),t.__value=e.name,t.value=t.__value},m(e,r){o(e,t,r),a(t,n)},p(e,n){t.value=t.__value},d(e){e&&u(t)}}}function F(e){var t,n,r,i,l,c,m,v,g=e.unitName,y=e.value;function $(){e.input_input_handler.call(m,e)}return{c(){t=s("label"),n=d(g),r=d(" ("),i=d(y),l=d(")"),c=f(),m=s("input"),t.htmlFor=e.unitName,t.className="svelte-12rui1u",m.id=e.unitName,h(m,"type","number"),m.min="0",m.className="svelte-12rui1u",v=p(m,"input",$)},m(u,s){o(u,t,s),a(t,n),a(t,r),a(t,i),a(t,l),o(u,c,s),o(u,m,s),m.value=e.selectedUnits[e.unitName]},p(t,n){e=n,(t.selectedUnits||t.Object||t.expUnits)&&(m.value=e.selectedUnits[e.unitName])},d(e){e&&(u(t),u(c),u(m)),v()}}}function I(t){var n,i,l,m,y,$,_,b,x,L,q,N,O,U,j,E,R,V,I,J,P,z,B,T,X;function D(e){return e.requiredMinValue<0?w:S}for(var G=D(t),H=G(t),K=t.rarityNames,Q=[],W=0;W<K.length;W+=1)Q[W]=A(C(t,K,W));var Y=t.Object.entries(t.expUnits),Z=[];for(W=0;W<Y.length;W+=1)Z[W]=F(k(t,Y,W));return{c(){(n=s("h1")).textContent="Aigis EXP Calculator",i=f(),l=s("p"),m=d("共可獲得 "),y=d(t.totalExp),$=d(" 經驗。\n\n"),H.c(),_=f(),b=s("div"),(x=s("label")).textContent="稀有度",L=f(),q=s("select");for(var e=0;e<Q.length;e+=1)Q[e].c();N=f(),(O=s("label")).textContent="目標等級",U=f(),j=s("input"),E=f(),R=s("label"),V=s("input"),I=d("\n    使用育成聖靈"),J=f(),P=s("fieldset"),(z=s("legend")).textContent="聖靈︰",B=f(),T=s("div");for(e=0;e<Z.length;e+=1)Z[e].c();x.htmlFor="rarity",x.className="svelte-12rui1u",void 0===t.selectedRarity&&M(()=>t.select_change_handler.call(q)),q.id="rarity",q.className="svelte-12rui1u",O.htmlFor="goalLevel",O.className="svelte-12rui1u",j.id="goalLevel",h(j,"type","number"),j.className="svelte-12rui1u",h(V,"type","checkbox"),V.className="svelte-12rui1u",R.className="span-2 svelte-12rui1u",b.className="form-group svelte-12rui1u",T.className="form-group svelte-12rui1u",X=[p(q,"change",t.select_change_handler),p(j,"input",t.input0_input_handler),p(V,"change",t.input1_change_handler)]},m(e,r){o(e,n,r),o(e,i,r),o(e,l,r),a(l,m),a(l,y),a(l,$),H.m(l,null),o(e,_,r),o(e,b,r),a(b,x),a(b,L),a(b,q);for(var u=0;u<Q.length;u+=1)Q[u].m(q,null);g(q,t.selectedRarity),a(b,N),a(b,O),a(b,U),a(b,j),j.value=t.goalLevel,a(b,E),a(b,R),a(R,V),V.checked=t.sarietto,a(R,I),o(e,J,r),o(e,P,r),a(P,z),a(P,B),a(P,T);for(u=0;u<Z.length;u+=1)Z[u].m(T,null)},p(e,t){if(e.totalExp&&v(y,t.totalExp),G===(G=D(t))&&H?H.p(e,t):(H.d(1),(H=G(t))&&(H.c(),H.m(l,null))),e.rarityNames){K=t.rarityNames;for(var n=0;n<K.length;n+=1){const r=C(t,K,n);Q[n]?Q[n].p(e,r):(Q[n]=A(r),Q[n].c(),Q[n].m(q,null))}for(;n<Q.length;n+=1)Q[n].d(1);Q.length=K.length}if(e.selectedRarity&&g(q,t.selectedRarity),e.goalLevel&&(j.value=t.goalLevel),e.sarietto&&(V.checked=t.sarietto),e.Object||e.expUnits||e.selectedUnits){Y=t.Object.entries(t.expUnits);for(n=0;n<Y.length;n+=1){const r=k(t,Y,n);Z[n]?Z[n].p(e,r):(Z[n]=F(r),Z[n].c(),Z[n].m(T,null))}for(;n<Z.length;n+=1)Z[n].d(1);Z.length=Y.length}},i:e,o:e,d(e){e&&(u(n),u(i),u(l)),H.d(),e&&(u(_),u(b)),c(Q,e),e&&(u(J),u(P)),c(Z,e),r(X)}}}function J(e,t,n){const r={get:function(e,t){const n=localStorage.getItem(e);return null===n?t:JSON.parse(n)},set:function(e,t){localStorage.setItem(e,JSON.stringify(t))}},i=Object.keys(V);let l=r.get("selectedRarity","iron"),a=Math.min(r.get("goalLevel",99),V[l].length);const o={"微金祝":1750,"小銀祝":4e3,"八倍白胖":8e3,"活動經驗包":1e4,"八倍皇帝":16e3,"小金祝/贈送祝聖":18e3,"小白祝":19e3,"小黑祝":2e4,"八倍黑胖":4e4,"大祝聖哈比":15e4},u=Object.assign(Object.fromEntries(Object.entries(o).map(([e])=>[e,0])),r.get("selectedUnits"));let c,s=0,d=0,f=r.get("sarietto",!1);return e.$$.update=(e={sarietto:1,selectedUnits:1,selectedRarity:1,goalLevel:1,totalExp:1,requiredMinValue:1,requiredMinLevel:1})=>{if(e.sarietto||e.selectedUnits){n("totalExp",s=0);const e=f?11:10;for(const[t,r]of Object.entries(u))n("totalExp",s+=r*o[t]*e/10)}(e.selectedRarity||e.goalLevel||e.totalExp)&&n("requiredMinValue",c=V[l][a-1]-s),e.selectedRarity&&r.set("selectedRarity",l),e.goalLevel&&r.set("goalLevel",a),e.selectedUnits&&r.set("selectedUnits",u),e.sarietto&&r.set("sarietto",f),(e.selectedRarity||e.requiredMinValue||e.requiredMinLevel)&&(n("requiredMinLevel",d=V[l].findIndex(e=>e>c)),d<0&&n("requiredMinLevel",d=V[l].length),n("requiredMinLevel",--d),n("selectedRarity",l),n("requiredMinValue",c),n("goalLevel",a),n("totalExp",s),n("sarietto",f),n("selectedUnits",u))},{rarityNames:i,selectedRarity:l,goalLevel:a,expUnits:o,selectedUnits:u,totalExp:s,requiredMinLevel:d,sarietto:f,Object:Object,requiredMinValue:c,select_change_handler:function(){l=function(e){const t=e.querySelector(":checked")||e.options[0];return t&&t.__value}(this),n("selectedRarity",l),n("rarityNames",i)},input0_input_handler:function(){a=m(this.value),n("goalLevel",a)},input1_change_handler:function(){f=this.checked,n("sarietto",f)},input_input_handler:function({unitName:e}){u[e]=m(this.value),n("selectedUnits",u),n("Object",Object),n("expUnits",o)}}}return new class extends R{constructor(e){super(),E(this,e,J,I,l,[])}}({target:document.querySelector(".container")})}();
//# sourceMappingURL=bundle.js.map
