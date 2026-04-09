(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=e(i);fetch(i.href,s)}})();const eu="modulepreload",nu=function(r){return"/"+r},ba={},Ze=function(t,e,n){let i=Promise.resolve();if(e&&e.length>0){let o=function(l){return Promise.all(l.map(u=>Promise.resolve(u).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=a?.nonce||a?.getAttribute("nonce");i=o(e.map(l=>{if(l=nu(l),l in ba)return;ba[l]=!0;const u=l.endsWith(".css"),h=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${h}`))return;const d=document.createElement("link");if(d.rel=u?"stylesheet":eu,u||(d.as="script"),d.crossOrigin="",d.href=l,c&&d.setAttribute("nonce",c),document.head.appendChild(d),u)return new Promise((p,_)=>{d.addEventListener("load",p),d.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${l}`)))})}))}function s(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return i.then(o=>{for(const a of o||[])a.status==="rejected"&&s(a.reason);return t().catch(s)})};async function iu(r="../../assets/data/maps/skirmish-96x96.json"){const[t,e,n,i,s,o,a,c,l,u,h,d,p]=await Promise.all([Ze(()=>import("./humans-CVvu8o8R.js"),[]),Ze(()=>import("./orcs-BArmWLr4.js"),[]),Ze(()=>import("./humans-D9hN7Owq.js"),[]),Ze(()=>import("./orcs-Bb7-mMaG.js"),[]),Ze(()=>import("./resources-R4pl3Ngc.js"),[]),Ze(()=>import("./starting-loadout-CEKlC0qG.js"),[]),Ze(()=>import("./damage-matrix-UIzIPPFC.js"),[]),Ze(()=>import("./tech-tree-Ceh9tqjG.js"),[]),Ze(()=>import("./blood-rush-Cz0Slrlq.js"),[]),Ze(()=>import("./discipline-aura-qLpgSGCI.js"),[]),Ze(()=>import("./spells-KHwUZa8G.js"),[]),Ze(()=>import("./behavior-By0H-BRV.js"),[]),import(r)]),_={resources:s.default,startingLoadout:o.default},x={bloodRush:l.default,disciplineAura:u.default,spells:h.default};return{humanUnits:t.default,orcUnits:e.default,humanBuildings:n.default,orcBuildings:i.default,economy:_,startingLoadout:_.startingLoadout,combat:a.default,techTree:c.default,bloodRush:x.bloodRush,disciplineAura:x.disciplineAura,spells:x.spells,factionAbilities:x,aiBehavior:d.default,map:p.default}}const ge=0;class ru{_nextId=1;_freeList=[];_liveCount=0;create(){let t;return this._freeList.length>0?t=this._freeList.pop():t=this._nextId++,this._liveCount++,t}destroy(t){t!==ge&&(this._freeList.push(t),this._liveCount=Math.max(0,this._liveCount-1))}isValid(t){return t>ge&&t<this._nextId}get liveCount(){return this._liveCount}reset(){this._nextId=1,this._freeList.length=0,this._liveCount=0}}const su=500;class ou{_entities=new ru;_components=new Map;_systems=[];_archetypeIndexActive=!1;_entityComponentTypes=new Map;_archetypes=new Map;createEntity(){return this._entities.create()}destroyEntity(t){if(t!==ge){this._archetypeIndexActive&&(this.removeEntityFromArchetype(t,this._entityComponentTypes.get(t)),this._entityComponentTypes.delete(t));for(const e of this._components.values())e.delete(t);this._entities.destroy(t)}}get entityCount(){return this._entities.liveCount}get queryStrategy(){return this._archetypeIndexActive?"archetype":"scan"}addComponent(t,e,n){let i=this._components.get(e);i===void 0&&(i=new Map,this._components.set(e,i));const s="type"in n?n:{...n,type:e};if(i.set(t,s),this._archetypeIndexActive){this.recordComponentAdded(t,e);return}this.ensureArchetypeIndexIsReady()}getComponent(t,e){const n=this._components.get(e);if(n!==void 0)return n.get(t)}hasComponent(t,e){return this._components.get(e)?.has(t)??!1}removeComponent(t,e){const n=this._components.get(e);n===void 0||!n.has(t)||(n.delete(t),this._archetypeIndexActive&&this.recordComponentRemoved(t,e))}*query(t,...e){const n=this._components.get(t);if(n!==void 0){if(this.ensureArchetypeIndexIsReady(),!this._archetypeIndexActive){yield*this.scanQuery(n,e);return}yield*this.queryArchetypes(n,t,e.map(i=>i))}}registerSystem(t){this._systems.includes(t)||(this._systems.push(t),t.init(this))}unregisterSystem(t){const e=this._systems.indexOf(t);e!==-1&&(this._systems.splice(e,1),t.destroy())}update(t){for(const e of this._systems)e.enabled&&e.update(t)}destroy(){for(let t=this._systems.length-1;t>=0;t--)this._systems[t].destroy();this._systems.length=0,this._components.clear(),this._archetypes.clear(),this._entityComponentTypes.clear(),this._archetypeIndexActive=!1,this._entities.reset()}ensureArchetypeIndexIsReady(){this._archetypeIndexActive||this.entityCount<=su||(this.rebuildArchetypeIndex(),this._archetypeIndexActive=!0)}rebuildArchetypeIndex(){this._archetypes.clear(),this._entityComponentTypes.clear();for(const[t,e]of this._components)for(const n of e.keys()){let i=this._entityComponentTypes.get(n);i===void 0&&(i=new Set,this._entityComponentTypes.set(n,i)),i.add(t)}for(const[t,e]of this._entityComponentTypes)this.addEntityToArchetype(t,e)}recordComponentAdded(t,e){const n=this._entityComponentTypes.get(t);if(n?.has(e))return;const i=new Set(n??[]);i.add(e),this.moveEntityBetweenArchetypes(t,n,i)}recordComponentRemoved(t,e){const n=this._entityComponentTypes.get(t);if(n===void 0||!n.has(e))return;const i=new Set(n);i.delete(e),this.moveEntityBetweenArchetypes(t,n,i)}moveEntityBetweenArchetypes(t,e,n){if(this.removeEntityFromArchetype(t,e),n.size===0){this._entityComponentTypes.delete(t);return}this._entityComponentTypes.set(t,new Set(n)),this.addEntityToArchetype(t,n)}addEntityToArchetype(t,e){const n=this.getArchetypeKey(e);if(n===void 0)return;let i=this._archetypes.get(n);i===void 0&&(i={key:n,componentTypes:new Set(e),entities:new Set},this._archetypes.set(n,i)),i.entities.add(t)}removeEntityFromArchetype(t,e){const n=this.getArchetypeKey(e);if(n===void 0)return;const i=this._archetypes.get(n);i!==void 0&&(i.entities.delete(t),i.entities.size===0&&this._archetypes.delete(n))}getArchetypeKey(t){if(!(t===void 0||t.size===0))return[...t].sort().join("|")}*scanQuery(t,e){for(const[n,i]of t){let s=!0;for(const o of e)if(!(this._components.get(o)?.has(n)??!1)){s=!1;break}s&&(yield[n,i])}}*queryArchetypes(t,e,n){const i=new Set([e,...n]);for(const s of this._archetypes.values())if(this.bucketMatchesQuery(s,i))for(const o of s.entities){const a=t.get(o);a!==void 0&&(yield[o,a])}}bucketMatchesQuery(t,e){for(const n of e)if(!t.componentTypes.has(n))return!1;return!0}}class is{_listeners=new Map;on(t,e){let n=this._listeners.get(t);return n===void 0&&(n=[],this._listeners.set(t,n)),n.push(e),()=>this.off(t,e)}once(t,e){const n=s=>{i(),e(s)},i=this.on(t,n);return i}off(t,e){const n=this._listeners.get(t);if(n===void 0)return;const i=n.indexOf(e);i!==-1&&n.splice(i,1)}emit(t,e){const n=this._listeners.get(t);if(n===void 0||n.length===0)return;const i=n.slice();for(const s of i)s(e)}clearTopic(t){this._listeners.delete(t)}clearAll(){this._listeners.clear()}listenerCount(t){return this._listeners.get(t)?.length??0}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Xo="172",au=0,Ta=1,cu=2,il=1,lu=2,Tn=3,Xn=0,Oe=1,An=2,Gn=0,Oi=1,Aa=2,Ca=3,Ra=4,uu=5,ri=100,hu=101,du=102,fu=103,pu=104,mu=200,_u=201,gu=202,vu=203,to=204,eo=205,xu=206,yu=207,Mu=208,Su=209,wu=210,Eu=211,bu=212,Tu=213,Au=214,no=0,io=1,ro=2,zi=3,so=4,oo=5,ao=6,co=7,rl=0,Cu=1,Ru=2,Vn=0,Pu=1,Iu=2,Du=3,Lu=4,Uu=5,Nu=6,Fu=7,sl=300,Hi=301,Gi=302,lo=303,uo=304,ds=306,ho=1e3,Ve=1001,fo=1002,ve=1003,Ou=1004,Mr=1005,en=1006,xs=1007,oi=1008,vn=1009,ol=1010,al=1011,hr=1012,qo=1013,ci=1014,_n=1015,mr=1016,Yo=1017,$o=1018,Vi=1020,cl=35902,ll=1021,ul=1022,nn=1023,hl=1024,dl=1025,Bi=1026,Wi=1027,jo=1028,Ko=1029,fl=1030,Zo=1031,Jo=1033,Kr=33776,Zr=33777,Jr=33778,Qr=33779,po=35840,mo=35841,_o=35842,go=35843,vo=36196,xo=37492,yo=37496,Mo=37808,So=37809,wo=37810,Eo=37811,bo=37812,To=37813,Ao=37814,Co=37815,Ro=37816,Po=37817,Io=37818,Do=37819,Lo=37820,Uo=37821,ts=36492,No=36494,Fo=36495,pl=36283,Oo=36284,Bo=36285,ko=36286,Bu=3200,ku=3201,ml=0,zu=1,zn="",Ne="srgb",li="srgb-linear",rs="linear",re="srgb",fi=7680,Pa=519,Hu=512,Gu=513,Vu=514,_l=515,Wu=516,Xu=517,qu=518,Yu=519,zo=35044,Ia="300 es",Cn=2e3,ss=2001;class Yi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const s=i.indexOf(e);s!==-1&&i.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let s=0,o=i.length;s<o;s++)i[s].call(this,t);t.target=null}}}const Ce=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Da=1234567;const lr=Math.PI/180,dr=180/Math.PI;function Rn(){const r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ce[r&255]+Ce[r>>8&255]+Ce[r>>16&255]+Ce[r>>24&255]+"-"+Ce[t&255]+Ce[t>>8&255]+"-"+Ce[t>>16&15|64]+Ce[t>>24&255]+"-"+Ce[e&63|128]+Ce[e>>8&255]+"-"+Ce[e>>16&255]+Ce[e>>24&255]+Ce[n&255]+Ce[n>>8&255]+Ce[n>>16&255]+Ce[n>>24&255]).toLowerCase()}function zt(r,t,e){return Math.max(t,Math.min(e,r))}function Qo(r,t){return(r%t+t)%t}function $u(r,t,e,n,i){return n+(r-t)*(i-n)/(e-t)}function ju(r,t,e){return r!==t?(e-r)/(t-r):0}function ur(r,t,e){return(1-e)*r+e*t}function Ku(r,t,e,n){return ur(r,t,1-Math.exp(-e*n))}function Zu(r,t=1){return t-Math.abs(Qo(r,t*2)-t)}function Ju(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*(3-2*r))}function Qu(r,t,e){return r<=t?0:r>=e?1:(r=(r-t)/(e-t),r*r*r*(r*(r*6-15)+10))}function th(r,t){return r+Math.floor(Math.random()*(t-r+1))}function eh(r,t){return r+Math.random()*(t-r)}function nh(r){return r*(.5-Math.random())}function ih(r){r!==void 0&&(Da=r);let t=Da+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function rh(r){return r*lr}function sh(r){return r*dr}function oh(r){return(r&r-1)===0&&r!==0}function ah(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function ch(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function lh(r,t,e,n,i){const s=Math.cos,o=Math.sin,a=s(e/2),c=o(e/2),l=s((t+n)/2),u=o((t+n)/2),h=s((t-n)/2),d=o((t-n)/2),p=s((n-t)/2),_=o((n-t)/2);switch(i){case"XYX":r.set(a*u,c*h,c*d,a*l);break;case"YZY":r.set(c*d,a*u,c*h,a*l);break;case"ZXZ":r.set(c*h,c*d,a*u,a*l);break;case"XZX":r.set(a*u,c*_,c*p,a*l);break;case"YXY":r.set(c*p,a*u,c*_,a*l);break;case"ZYZ":r.set(c*_,c*p,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function hn(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ne(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const Li={DEG2RAD:lr,RAD2DEG:dr,generateUUID:Rn,clamp:zt,euclideanModulo:Qo,mapLinear:$u,inverseLerp:ju,lerp:ur,damp:Ku,pingpong:Zu,smoothstep:Ju,smootherstep:Qu,randInt:th,randFloat:eh,randFloatSpread:nh,seededRandom:ih,degToRad:rh,radToDeg:sh,isPowerOfTwo:oh,ceilPowerOfTwo:ah,floorPowerOfTwo:ch,setQuaternionFromProperEuler:lh,normalize:ne,denormalize:hn};class Nt{constructor(t=0,e=0){Nt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(zt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(zt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*n-o*i+t.x,this.y=s*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ot{constructor(t,e,n,i,s,o,a,c,l){Ot.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,c,l)}set(t,e,n,i,s,o,a,c,l){const u=this.elements;return u[0]=t,u[1]=i,u[2]=a,u[3]=e,u[4]=s,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],h=n[7],d=n[2],p=n[5],_=n[8],x=i[0],m=i[3],f=i[6],E=i[1],w=i[4],y=i[7],P=i[2],C=i[5],T=i[8];return s[0]=o*x+a*E+c*P,s[3]=o*m+a*w+c*C,s[6]=o*f+a*y+c*T,s[1]=l*x+u*E+h*P,s[4]=l*m+u*w+h*C,s[7]=l*f+u*y+h*T,s[2]=d*x+p*E+_*P,s[5]=d*m+p*w+_*C,s[8]=d*f+p*y+_*T,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8];return e*o*u-e*a*l-n*s*u+n*a*c+i*s*l-i*o*c}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8],h=u*o-a*l,d=a*c-u*s,p=l*s-o*c,_=e*h+n*d+i*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/_;return t[0]=h*x,t[1]=(i*l-u*n)*x,t[2]=(a*n-i*o)*x,t[3]=d*x,t[4]=(u*e-i*c)*x,t[5]=(i*s-a*e)*x,t[6]=p*x,t[7]=(n*c-l*e)*x,t[8]=(o*e-n*s)*x,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,s,o,a){const c=Math.cos(s),l=Math.sin(s);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-i*l,i*c,-i*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(ys.makeScale(t,e)),this}rotate(t){return this.premultiply(ys.makeRotation(-t)),this}translate(t,e){return this.premultiply(ys.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const ys=new Ot;function gl(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function fr(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function uh(){const r=fr("canvas");return r.style.display="block",r}const La={};function Di(r){r in La||(La[r]=!0,console.warn(r))}function hh(r,t,e){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:n()}}setTimeout(s,e)})}function dh(r){const t=r.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function fh(r){const t=r.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Ua=new Ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Na=new Ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ph(){const r={enabled:!0,workingColorSpace:li,spaces:{},convert:function(i,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===re&&(i.r=Pn(i.r),i.g=Pn(i.g),i.b=Pn(i.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[s].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===re&&(i.r=ki(i.r),i.g=ki(i.g),i.b=ki(i.b))),i},fromWorkingColorSpace:function(i,s){return this.convert(i,this.workingColorSpace,s)},toWorkingColorSpace:function(i,s){return this.convert(i,s,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===zn?rs:this.spaces[i].transfer},getLuminanceCoefficients:function(i,s=this.workingColorSpace){return i.fromArray(this.spaces[s].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,s,o){return i.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return r.define({[li]:{primaries:t,whitePoint:n,transfer:rs,toXYZ:Ua,fromXYZ:Na,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ne},outputColorSpaceConfig:{drawingBufferColorSpace:Ne}},[Ne]:{primaries:t,whitePoint:n,transfer:re,toXYZ:Ua,fromXYZ:Na,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ne}}}),r}const Jt=ph();function Pn(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function ki(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let pi;class mh{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{pi===void 0&&(pi=fr("canvas")),pi.width=t.width,pi.height=t.height;const n=pi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=pi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=fr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),s=i.data;for(let o=0;o<s.length;o++)s[o]=Pn(s[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Pn(e[n]/255)*255):e[n]=Pn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let _h=0;class vl{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_h++}),this.uuid=Rn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?s.push(Ms(i[o].image)):s.push(Ms(i[o]))}else s=Ms(i);n.url=s}return e||(t.images[this.uuid]=n),n}}function Ms(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?mh.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let gh=0;class Ie extends Yi{constructor(t=Ie.DEFAULT_IMAGE,e=Ie.DEFAULT_MAPPING,n=Ve,i=Ve,s=en,o=oi,a=nn,c=vn,l=Ie.DEFAULT_ANISOTROPY,u=zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:gh++}),this.uuid=Rn(),this.name="",this.source=new vl(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Nt(0,0),this.repeat=new Nt(1,1),this.center=new Nt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==sl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ho:t.x=t.x-Math.floor(t.x);break;case Ve:t.x=t.x<0?0:1;break;case fo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ho:t.y=t.y-Math.floor(t.y);break;case Ve:t.y=t.y<0?0:1;break;case fo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ie.DEFAULT_IMAGE=null;Ie.DEFAULT_MAPPING=sl;Ie.DEFAULT_ANISOTROPY=1;class ue{constructor(t=0,e=0,n=0,i=1){ue.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*s,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*s,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*s,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,s;const c=t.elements,l=c[0],u=c[4],h=c[8],d=c[1],p=c[5],_=c[9],x=c[2],m=c[6],f=c[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(_+m)<.1&&Math.abs(l+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const w=(l+1)/2,y=(p+1)/2,P=(f+1)/2,C=(u+d)/4,T=(h+x)/4,R=(_+m)/4;return w>y&&w>P?w<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(w),i=C/n,s=T/n):y>P?y<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(y),n=C/i,s=R/i):P<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(P),n=T/s,i=R/s),this.set(n,i,s,e),this}let E=Math.sqrt((m-_)*(m-_)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-_)/E,this.y=(h-x)/E,this.z=(d-u)/E,this.w=Math.acos((l+p+f-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this.z=zt(this.z,t.z,e.z),this.w=zt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this.z=zt(this.z,t,e),this.w=zt(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(zt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class vh extends Yi{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ue(0,0,t,e),this.scissorTest=!1,this.viewport=new ue(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:en,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Ie(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;const e=Object.assign({},t.texture.image);return this.texture.source=new vl(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ui extends vh{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class xl extends Ie{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=ve,this.minFilter=ve,this.wrapR=Ve,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class xh extends Ie{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=ve,this.minFilter=ve,this.wrapR=Ve,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _r{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,s,o,a){let c=n[i+0],l=n[i+1],u=n[i+2],h=n[i+3];const d=s[o+0],p=s[o+1],_=s[o+2],x=s[o+3];if(a===0){t[e+0]=c,t[e+1]=l,t[e+2]=u,t[e+3]=h;return}if(a===1){t[e+0]=d,t[e+1]=p,t[e+2]=_,t[e+3]=x;return}if(h!==x||c!==d||l!==p||u!==_){let m=1-a;const f=c*d+l*p+u*_+h*x,E=f>=0?1:-1,w=1-f*f;if(w>Number.EPSILON){const P=Math.sqrt(w),C=Math.atan2(P,f*E);m=Math.sin(m*C)/P,a=Math.sin(a*C)/P}const y=a*E;if(c=c*m+d*y,l=l*m+p*y,u=u*m+_*y,h=h*m+x*y,m===1-a){const P=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=P,l*=P,u*=P,h*=P}}t[e]=c,t[e+1]=l,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,i,s,o){const a=n[i],c=n[i+1],l=n[i+2],u=n[i+3],h=s[o],d=s[o+1],p=s[o+2],_=s[o+3];return t[e]=a*_+u*h+c*p-l*d,t[e+1]=c*_+u*d+l*h-a*p,t[e+2]=l*_+u*p+a*d-c*h,t[e+3]=u*_-a*h-c*d-l*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,s=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(i/2),h=a(s/2),d=c(n/2),p=c(i/2),_=c(s/2);switch(o){case"XYZ":this._x=d*u*h+l*p*_,this._y=l*p*h-d*u*_,this._z=l*u*_+d*p*h,this._w=l*u*h-d*p*_;break;case"YXZ":this._x=d*u*h+l*p*_,this._y=l*p*h-d*u*_,this._z=l*u*_-d*p*h,this._w=l*u*h+d*p*_;break;case"ZXY":this._x=d*u*h-l*p*_,this._y=l*p*h+d*u*_,this._z=l*u*_+d*p*h,this._w=l*u*h-d*p*_;break;case"ZYX":this._x=d*u*h-l*p*_,this._y=l*p*h+d*u*_,this._z=l*u*_-d*p*h,this._w=l*u*h+d*p*_;break;case"YZX":this._x=d*u*h+l*p*_,this._y=l*p*h+d*u*_,this._z=l*u*_-d*p*h,this._w=l*u*h-d*p*_;break;case"XZY":this._x=d*u*h-l*p*_,this._y=l*p*h-d*u*_,this._z=l*u*_+d*p*h,this._w=l*u*h+d*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],s=e[8],o=e[1],a=e[5],c=e[9],l=e[2],u=e[6],h=e[10],d=n+a+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-c)*p,this._y=(s-l)*p,this._z=(o-i)*p}else if(n>a&&n>h){const p=2*Math.sqrt(1+n-a-h);this._w=(u-c)/p,this._x=.25*p,this._y=(i+o)/p,this._z=(s+l)/p}else if(a>h){const p=2*Math.sqrt(1+a-n-h);this._w=(s-l)/p,this._x=(i+o)/p,this._y=.25*p,this._z=(c+u)/p}else{const p=2*Math.sqrt(1+h-n-a);this._w=(o-i)/p,this._x=(s+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(zt(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,s=t._z,o=t._w,a=e._x,c=e._y,l=e._z,u=e._w;return this._x=n*u+o*a+i*l-s*c,this._y=i*u+o*c+s*a-n*l,this._z=s*u+o*l+n*c-i*a,this._w=o*u-n*a-i*c-s*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,s=this._z,o=this._w;let a=o*t._w+n*t._x+i*t._y+s*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=s,this;const c=1-a*a;if(c<=Number.EPSILON){const p=1-e;return this._w=p*o+e*this._w,this._x=p*n+e*this._x,this._y=p*i+e*this._y,this._z=p*s+e*this._z,this.normalize(),this}const l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-e)*u)/l,d=Math.sin(e*u)/l;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=i*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(t=0,e=0,n=0){L.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Fa.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Fa.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*i,this.y=s[1]*e+s[4]*n+s[7]*i,this.z=s[2]*e+s[5]*n+s[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,s=t.elements,o=1/(s[3]*e+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*i+s[12])*o,this.y=(s[1]*e+s[5]*n+s[9]*i+s[13])*o,this.z=(s[2]*e+s[6]*n+s[10]*i+s[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,s=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*i-a*n),u=2*(a*e-s*i),h=2*(s*n-o*e);return this.x=e+c*l+o*h-a*u,this.y=n+c*u+a*l-s*h,this.z=i+c*h+s*u-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*i,this.y=s[1]*e+s[5]*n+s[9]*i,this.z=s[2]*e+s[6]*n+s[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this.z=zt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this.z=zt(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(zt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,s=t.z,o=e.x,a=e.y,c=e.z;return this.x=i*c-s*a,this.y=s*o-n*c,this.z=n*a-i*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ss.copy(this).projectOnVector(t),this.sub(Ss)}reflect(t){return this.sub(Ss.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(zt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ss=new L,Fa=new _r;class hi{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(on.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(on.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=on.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,on):on.fromBufferAttribute(s,o),on.applyMatrix4(t.matrixWorld),this.expandByPoint(on);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Sr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Sr.copy(n.boundingBox)),Sr.applyMatrix4(t.matrixWorld),this.union(Sr)}const i=t.children;for(let s=0,o=i.length;s<o;s++)this.expandByObject(i[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,on),on.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ji),wr.subVectors(this.max,Ji),mi.subVectors(t.a,Ji),_i.subVectors(t.b,Ji),gi.subVectors(t.c,Ji),Ln.subVectors(_i,mi),Un.subVectors(gi,_i),Zn.subVectors(mi,gi);let e=[0,-Ln.z,Ln.y,0,-Un.z,Un.y,0,-Zn.z,Zn.y,Ln.z,0,-Ln.x,Un.z,0,-Un.x,Zn.z,0,-Zn.x,-Ln.y,Ln.x,0,-Un.y,Un.x,0,-Zn.y,Zn.x,0];return!ws(e,mi,_i,gi,wr)||(e=[1,0,0,0,1,0,0,0,1],!ws(e,mi,_i,gi,wr))?!1:(Er.crossVectors(Ln,Un),e=[Er.x,Er.y,Er.z],ws(e,mi,_i,gi,wr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,on).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(on).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Mn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Mn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Mn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Mn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Mn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Mn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Mn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Mn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Mn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Mn=[new L,new L,new L,new L,new L,new L,new L,new L],on=new L,Sr=new hi,mi=new L,_i=new L,gi=new L,Ln=new L,Un=new L,Zn=new L,Ji=new L,wr=new L,Er=new L,Jn=new L;function ws(r,t,e,n,i){for(let s=0,o=r.length-3;s<=o;s+=3){Jn.fromArray(r,s);const a=i.x*Math.abs(Jn.x)+i.y*Math.abs(Jn.y)+i.z*Math.abs(Jn.z),c=t.dot(Jn),l=e.dot(Jn),u=n.dot(Jn);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}const yh=new hi,Qi=new L,Es=new L;class $i{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):yh.setFromPoints(t).getCenter(n);let i=0;for(let s=0,o=t.length;s<o;s++)i=Math.max(i,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Qi.subVectors(t,this.center);const e=Qi.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Qi,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Es.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Qi.copy(t.center).add(Es)),this.expandByPoint(Qi.copy(t.center).sub(Es))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Sn=new L,bs=new L,br=new L,Nn=new L,Ts=new L,Tr=new L,As=new L;class ta{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Sn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Sn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Sn.copy(this.origin).addScaledVector(this.direction,e),Sn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){bs.copy(t).add(e).multiplyScalar(.5),br.copy(e).sub(t).normalize(),Nn.copy(this.origin).sub(bs);const s=t.distanceTo(e)*.5,o=-this.direction.dot(br),a=Nn.dot(this.direction),c=-Nn.dot(br),l=Nn.lengthSq(),u=Math.abs(1-o*o);let h,d,p,_;if(u>0)if(h=o*c-a,d=o*a-c,_=s*u,h>=0)if(d>=-_)if(d<=_){const x=1/u;h*=x,d*=x,p=h*(h+o*d+2*a)+d*(o*h+d+2*c)+l}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;else d<=-_?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-c),s),p=-h*h+d*(d+2*c)+l):d<=_?(h=0,d=Math.min(Math.max(-s,-c),s),p=d*(d+2*c)+l):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-c),s),p=-h*h+d*(d+2*c)+l);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),i&&i.copy(bs).addScaledVector(br,d),p}intersectSphere(t,e){Sn.subVectors(t.center,this.origin);const n=Sn.dot(this.direction),i=Sn.dot(Sn)-n*n,s=t.radius*t.radius;if(i>s)return null;const o=Math.sqrt(s-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,s,o,a,c;const l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return l>=0?(n=(t.min.x-d.x)*l,i=(t.max.x-d.x)*l):(n=(t.max.x-d.x)*l,i=(t.min.x-d.x)*l),u>=0?(s=(t.min.y-d.y)*u,o=(t.max.y-d.y)*u):(s=(t.max.y-d.y)*u,o=(t.min.y-d.y)*u),n>o||s>i||((s>n||isNaN(n))&&(n=s),(o<i||isNaN(i))&&(i=o),h>=0?(a=(t.min.z-d.z)*h,c=(t.max.z-d.z)*h):(a=(t.max.z-d.z)*h,c=(t.min.z-d.z)*h),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Sn)!==null}intersectTriangle(t,e,n,i,s){Ts.subVectors(e,t),Tr.subVectors(n,t),As.crossVectors(Ts,Tr);let o=this.direction.dot(As),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Nn.subVectors(this.origin,t);const c=a*this.direction.dot(Tr.crossVectors(Nn,Tr));if(c<0)return null;const l=a*this.direction.dot(Ts.cross(Nn));if(l<0||c+l>o)return null;const u=-a*Nn.dot(As);return u<0?null:this.at(u/o,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ie{constructor(t,e,n,i,s,o,a,c,l,u,h,d,p,_,x,m){ie.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,s,o,a,c,l,u,h,d,p,_,x,m)}set(t,e,n,i,s,o,a,c,l,u,h,d,p,_,x,m){const f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=i,f[1]=s,f[5]=o,f[9]=a,f[13]=c,f[2]=l,f[6]=u,f[10]=h,f[14]=d,f[3]=p,f[7]=_,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ie().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/vi.setFromMatrixColumn(t,0).length(),s=1/vi.setFromMatrixColumn(t,1).length(),o=1/vi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,s=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),u=Math.cos(s),h=Math.sin(s);if(t.order==="XYZ"){const d=o*u,p=o*h,_=a*u,x=a*h;e[0]=c*u,e[4]=-c*h,e[8]=l,e[1]=p+_*l,e[5]=d-x*l,e[9]=-a*c,e[2]=x-d*l,e[6]=_+p*l,e[10]=o*c}else if(t.order==="YXZ"){const d=c*u,p=c*h,_=l*u,x=l*h;e[0]=d+x*a,e[4]=_*a-p,e[8]=o*l,e[1]=o*h,e[5]=o*u,e[9]=-a,e[2]=p*a-_,e[6]=x+d*a,e[10]=o*c}else if(t.order==="ZXY"){const d=c*u,p=c*h,_=l*u,x=l*h;e[0]=d-x*a,e[4]=-o*h,e[8]=_+p*a,e[1]=p+_*a,e[5]=o*u,e[9]=x-d*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){const d=o*u,p=o*h,_=a*u,x=a*h;e[0]=c*u,e[4]=_*l-p,e[8]=d*l+x,e[1]=c*h,e[5]=x*l+d,e[9]=p*l-_,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){const d=o*c,p=o*l,_=a*c,x=a*l;e[0]=c*u,e[4]=x-d*h,e[8]=_*h+p,e[1]=h,e[5]=o*u,e[9]=-a*u,e[2]=-l*u,e[6]=p*h+_,e[10]=d-x*h}else if(t.order==="XZY"){const d=o*c,p=o*l,_=a*c,x=a*l;e[0]=c*u,e[4]=-h,e[8]=l*u,e[1]=d*h+x,e[5]=o*u,e[9]=p*h-_,e[2]=_*h-p,e[6]=a*u,e[10]=x*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Mh,t,Sh)}lookAt(t,e,n){const i=this.elements;return He.subVectors(t,e),He.lengthSq()===0&&(He.z=1),He.normalize(),Fn.crossVectors(n,He),Fn.lengthSq()===0&&(Math.abs(n.z)===1?He.x+=1e-4:He.z+=1e-4,He.normalize(),Fn.crossVectors(n,He)),Fn.normalize(),Ar.crossVectors(He,Fn),i[0]=Fn.x,i[4]=Ar.x,i[8]=He.x,i[1]=Fn.y,i[5]=Ar.y,i[9]=He.y,i[2]=Fn.z,i[6]=Ar.z,i[10]=He.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,s=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],h=n[5],d=n[9],p=n[13],_=n[2],x=n[6],m=n[10],f=n[14],E=n[3],w=n[7],y=n[11],P=n[15],C=i[0],T=i[4],R=i[8],S=i[12],g=i[1],A=i[5],B=i[9],O=i[13],X=i[2],Y=i[6],q=i[10],J=i[14],G=i[3],ot=i[7],at=i[11],Mt=i[15];return s[0]=o*C+a*g+c*X+l*G,s[4]=o*T+a*A+c*Y+l*ot,s[8]=o*R+a*B+c*q+l*at,s[12]=o*S+a*O+c*J+l*Mt,s[1]=u*C+h*g+d*X+p*G,s[5]=u*T+h*A+d*Y+p*ot,s[9]=u*R+h*B+d*q+p*at,s[13]=u*S+h*O+d*J+p*Mt,s[2]=_*C+x*g+m*X+f*G,s[6]=_*T+x*A+m*Y+f*ot,s[10]=_*R+x*B+m*q+f*at,s[14]=_*S+x*O+m*J+f*Mt,s[3]=E*C+w*g+y*X+P*G,s[7]=E*T+w*A+y*Y+P*ot,s[11]=E*R+w*B+y*q+P*at,s[15]=E*S+w*O+y*J+P*Mt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],s=t[12],o=t[1],a=t[5],c=t[9],l=t[13],u=t[2],h=t[6],d=t[10],p=t[14],_=t[3],x=t[7],m=t[11],f=t[15];return _*(+s*c*h-i*l*h-s*a*d+n*l*d+i*a*p-n*c*p)+x*(+e*c*p-e*l*d+s*o*d-i*o*p+i*l*u-s*c*u)+m*(+e*l*h-e*a*p-s*o*h+n*o*p+s*a*u-n*l*u)+f*(-i*a*u-e*c*h+e*a*d+i*o*h-n*o*d+n*c*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],u=t[8],h=t[9],d=t[10],p=t[11],_=t[12],x=t[13],m=t[14],f=t[15],E=h*m*l-x*d*l+x*c*p-a*m*p-h*c*f+a*d*f,w=_*d*l-u*m*l-_*c*p+o*m*p+u*c*f-o*d*f,y=u*x*l-_*h*l+_*a*p-o*x*p-u*a*f+o*h*f,P=_*h*c-u*x*c-_*a*d+o*x*d+u*a*m-o*h*m,C=e*E+n*w+i*y+s*P;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/C;return t[0]=E*T,t[1]=(x*d*s-h*m*s-x*i*p+n*m*p+h*i*f-n*d*f)*T,t[2]=(a*m*s-x*c*s+x*i*l-n*m*l-a*i*f+n*c*f)*T,t[3]=(h*c*s-a*d*s-h*i*l+n*d*l+a*i*p-n*c*p)*T,t[4]=w*T,t[5]=(u*m*s-_*d*s+_*i*p-e*m*p-u*i*f+e*d*f)*T,t[6]=(_*c*s-o*m*s-_*i*l+e*m*l+o*i*f-e*c*f)*T,t[7]=(o*d*s-u*c*s+u*i*l-e*d*l-o*i*p+e*c*p)*T,t[8]=y*T,t[9]=(_*h*s-u*x*s-_*n*p+e*x*p+u*n*f-e*h*f)*T,t[10]=(o*x*s-_*a*s+_*n*l-e*x*l-o*n*f+e*a*f)*T,t[11]=(u*a*s-o*h*s-u*n*l+e*h*l+o*n*p-e*a*p)*T,t[12]=P*T,t[13]=(u*x*i-_*h*i+_*n*d-e*x*d-u*n*m+e*h*m)*T,t[14]=(_*a*i-o*x*i-_*n*c+e*x*c+o*n*m-e*a*m)*T,t[15]=(o*h*i-u*a*i+u*n*c-e*h*c-o*n*d+e*a*d)*T,this}scale(t){const e=this.elements,n=t.x,i=t.y,s=t.z;return e[0]*=n,e[4]*=i,e[8]*=s,e[1]*=n,e[5]*=i,e[9]*=s,e[2]*=n,e[6]*=i,e[10]*=s,e[3]*=n,e[7]*=i,e[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),s=1-n,o=t.x,a=t.y,c=t.z,l=s*o,u=s*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,u*a+n,u*c-i*o,0,l*c-i*a,u*c+i*o,s*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,s,o){return this.set(1,n,s,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,s=e._x,o=e._y,a=e._z,c=e._w,l=s+s,u=o+o,h=a+a,d=s*l,p=s*u,_=s*h,x=o*u,m=o*h,f=a*h,E=c*l,w=c*u,y=c*h,P=n.x,C=n.y,T=n.z;return i[0]=(1-(x+f))*P,i[1]=(p+y)*P,i[2]=(_-w)*P,i[3]=0,i[4]=(p-y)*C,i[5]=(1-(d+f))*C,i[6]=(m+E)*C,i[7]=0,i[8]=(_+w)*T,i[9]=(m-E)*T,i[10]=(1-(d+x))*T,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let s=vi.set(i[0],i[1],i[2]).length();const o=vi.set(i[4],i[5],i[6]).length(),a=vi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(s=-s),t.x=i[12],t.y=i[13],t.z=i[14],an.copy(this);const l=1/s,u=1/o,h=1/a;return an.elements[0]*=l,an.elements[1]*=l,an.elements[2]*=l,an.elements[4]*=u,an.elements[5]*=u,an.elements[6]*=u,an.elements[8]*=h,an.elements[9]*=h,an.elements[10]*=h,e.setFromRotationMatrix(an),n.x=s,n.y=o,n.z=a,this}makePerspective(t,e,n,i,s,o,a=Cn){const c=this.elements,l=2*s/(e-t),u=2*s/(n-i),h=(e+t)/(e-t),d=(n+i)/(n-i);let p,_;if(a===Cn)p=-(o+s)/(o-s),_=-2*o*s/(o-s);else if(a===ss)p=-o/(o-s),_=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,s,o,a=Cn){const c=this.elements,l=1/(e-t),u=1/(n-i),h=1/(o-s),d=(e+t)*l,p=(n+i)*u;let _,x;if(a===Cn)_=(o+s)*h,x=-2*h;else if(a===ss)_=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-p,c[2]=0,c[6]=0,c[10]=x,c[14]=-_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const vi=new L,an=new ie,Mh=new L(0,0,0),Sh=new L(1,1,1),Fn=new L,Ar=new L,He=new L,Oa=new ie,Ba=new _r;class xn{constructor(t=0,e=0,n=0,i=xn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,s=i[0],o=i[4],a=i[8],c=i[1],l=i[5],u=i[9],h=i[2],d=i[6],p=i[10];switch(e){case"XYZ":this._y=Math.asin(zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-zt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(zt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-zt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(zt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Oa.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Oa,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Ba.setFromEuler(this),this.setFromQuaternion(Ba,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}xn.DEFAULT_ORDER="XYZ";class ea{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let wh=0;const ka=new L,xi=new _r,wn=new ie,Cr=new L,tr=new L,Eh=new L,bh=new _r,za=new L(1,0,0),Ha=new L(0,1,0),Ga=new L(0,0,1),Va={type:"added"},Th={type:"removed"},yi={type:"childadded",child:null},Cs={type:"childremoved",child:null};class Se extends Yi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:wh++}),this.uuid=Rn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Se.DEFAULT_UP.clone();const t=new L,e=new xn,n=new _r,i=new L(1,1,1);function s(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new ie},normalMatrix:{value:new Ot}}),this.matrix=new ie,this.matrixWorld=new ie,this.matrixAutoUpdate=Se.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ea,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return xi.setFromAxisAngle(t,e),this.quaternion.multiply(xi),this}rotateOnWorldAxis(t,e){return xi.setFromAxisAngle(t,e),this.quaternion.premultiply(xi),this}rotateX(t){return this.rotateOnAxis(za,t)}rotateY(t){return this.rotateOnAxis(Ha,t)}rotateZ(t){return this.rotateOnAxis(Ga,t)}translateOnAxis(t,e){return ka.copy(t).applyQuaternion(this.quaternion),this.position.add(ka.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(za,t)}translateY(t){return this.translateOnAxis(Ha,t)}translateZ(t){return this.translateOnAxis(Ga,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(wn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Cr.copy(t):Cr.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wn.lookAt(tr,Cr,this.up):wn.lookAt(Cr,tr,this.up),this.quaternion.setFromRotationMatrix(wn),i&&(wn.extractRotation(i.matrixWorld),xi.setFromRotationMatrix(wn),this.quaternion.premultiply(xi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Va),yi.child=t,this.dispatchEvent(yi),yi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Th),Cs.child=t,this.dispatchEvent(Cs),Cs.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),wn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),wn.multiply(t.parent.matrixWorld)),t.applyMatrix4(wn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Va),yi.child=t,this.dispatchEvent(yi),yi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,t,Eh),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,bh,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let s=0,o=i.length;s<o;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const h=c[l];s(t.shapes,h)}else s(t.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(t.materials,this.material[c]));i.material=a}else i.material=s(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];i.animations.push(s(t.animations,c))}}if(e){const a=o(t.geometries),c=o(t.materials),l=o(t.textures),u=o(t.images),h=o(t.shapes),d=o(t.skeletons),p=o(t.animations),_=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=i,n;function o(a){const c=[];for(const l in a){const u=a[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Se.DEFAULT_UP=new L(0,1,0);Se.DEFAULT_MATRIX_AUTO_UPDATE=!0;Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const cn=new L,En=new L,Rs=new L,bn=new L,Mi=new L,Si=new L,Wa=new L,Ps=new L,Is=new L,Ds=new L,Ls=new ue,Us=new ue,Ns=new ue;class tn{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),cn.subVectors(t,e),i.cross(cn);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(t,e,n,i,s){cn.subVectors(i,e),En.subVectors(n,e),Rs.subVectors(t,e);const o=cn.dot(cn),a=cn.dot(En),c=cn.dot(Rs),l=En.dot(En),u=En.dot(Rs),h=o*l-a*a;if(h===0)return s.set(0,0,0),null;const d=1/h,p=(l*c-a*u)*d,_=(o*u-a*c)*d;return s.set(1-p-_,_,p)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,bn)===null?!1:bn.x>=0&&bn.y>=0&&bn.x+bn.y<=1}static getInterpolation(t,e,n,i,s,o,a,c){return this.getBarycoord(t,e,n,i,bn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,bn.x),c.addScaledVector(o,bn.y),c.addScaledVector(a,bn.z),c)}static getInterpolatedAttribute(t,e,n,i,s,o){return Ls.setScalar(0),Us.setScalar(0),Ns.setScalar(0),Ls.fromBufferAttribute(t,e),Us.fromBufferAttribute(t,n),Ns.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(Ls,s.x),o.addScaledVector(Us,s.y),o.addScaledVector(Ns,s.z),o}static isFrontFacing(t,e,n,i){return cn.subVectors(n,e),En.subVectors(t,e),cn.cross(En).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return cn.subVectors(this.c,this.b),En.subVectors(this.a,this.b),cn.cross(En).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return tn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return tn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,s){return tn.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}containsPoint(t){return tn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return tn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,s=this.c;let o,a;Mi.subVectors(i,n),Si.subVectors(s,n),Ps.subVectors(t,n);const c=Mi.dot(Ps),l=Si.dot(Ps);if(c<=0&&l<=0)return e.copy(n);Is.subVectors(t,i);const u=Mi.dot(Is),h=Si.dot(Is);if(u>=0&&h<=u)return e.copy(i);const d=c*h-u*l;if(d<=0&&c>=0&&u<=0)return o=c/(c-u),e.copy(n).addScaledVector(Mi,o);Ds.subVectors(t,s);const p=Mi.dot(Ds),_=Si.dot(Ds);if(_>=0&&p<=_)return e.copy(s);const x=p*l-c*_;if(x<=0&&l>=0&&_<=0)return a=l/(l-_),e.copy(n).addScaledVector(Si,a);const m=u*_-p*h;if(m<=0&&h-u>=0&&p-_>=0)return Wa.subVectors(s,i),a=(h-u)/(h-u+(p-_)),e.copy(i).addScaledVector(Wa,a);const f=1/(m+x+d);return o=x*f,a=d*f,e.copy(n).addScaledVector(Mi,o).addScaledVector(Si,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const yl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},On={h:0,s:0,l:0},Rr={h:0,s:0,l:0};function Fs(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}class Xt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ne){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Jt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=Jt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Jt.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=Jt.workingColorSpace){if(t=Qo(t,1),e=zt(e,0,1),n=zt(n,0,1),e===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+e):n+e-n*e,o=2*n-s;this.r=Fs(o,s,t+1/3),this.g=Fs(o,s,t),this.b=Fs(o,s,t-1/3)}return Jt.toWorkingColorSpace(this,i),this}setStyle(t,e=Ne){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let s;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const s=i[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ne){const n=yl[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Pn(t.r),this.g=Pn(t.g),this.b=Pn(t.b),this}copyLinearToSRGB(t){return this.r=ki(t.r),this.g=ki(t.g),this.b=ki(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ne){return Jt.fromWorkingColorSpace(Re.copy(this),t),Math.round(zt(Re.r*255,0,255))*65536+Math.round(zt(Re.g*255,0,255))*256+Math.round(zt(Re.b*255,0,255))}getHexString(t=Ne){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Jt.workingColorSpace){Jt.fromWorkingColorSpace(Re.copy(this),e);const n=Re.r,i=Re.g,s=Re.b,o=Math.max(n,i,s),a=Math.min(n,i,s);let c,l;const u=(a+o)/2;if(a===o)c=0,l=0;else{const h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case n:c=(i-s)/h+(i<s?6:0);break;case i:c=(s-n)/h+2;break;case s:c=(n-i)/h+4;break}c/=6}return t.h=c,t.s=l,t.l=u,t}getRGB(t,e=Jt.workingColorSpace){return Jt.fromWorkingColorSpace(Re.copy(this),e),t.r=Re.r,t.g=Re.g,t.b=Re.b,t}getStyle(t=Ne){Jt.fromWorkingColorSpace(Re.copy(this),t);const e=Re.r,n=Re.g,i=Re.b;return t!==Ne?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(On),this.setHSL(On.h+t,On.s+e,On.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(On),t.getHSL(Rr);const n=ur(On.h,Rr.h,e),i=ur(On.s,Rr.s,e),s=ur(On.l,Rr.l,e);return this.setHSL(n,i,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*i,this.g=s[1]*e+s[4]*n+s[7]*i,this.b=s[2]*e+s[5]*n+s[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Re=new Xt;Xt.NAMES=yl;let Ah=0;class $n extends Yi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ah++}),this.uuid=Rn(),this.name="",this.type="Material",this.blending=Oi,this.side=Xn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=to,this.blendDst=eo,this.blendEquation=ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Xt(0,0,0),this.blendAlpha=0,this.depthFunc=zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Pa,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fi,this.stencilZFail=fi,this.stencilZPass=fi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Oi&&(n.blending=this.blending),this.side!==Xn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==to&&(n.blendSrc=this.blendSrc),this.blendDst!==eo&&(n.blendDst=this.blendDst),this.blendEquation!==ri&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==zi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Pa&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const o=[];for(const a in s){const c=s[a];delete c.metadata,o.push(c)}return o}if(e){const s=i(t.textures),o=i(t.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Wn extends $n{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Xt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xn,this.combine=rl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const me=new L,Pr=new Nt;class Xe{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=zo,this.updateRanges=[],this.gpuType=_n,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Pr.fromBufferAttribute(this,e),Pr.applyMatrix3(t),this.setXY(e,Pr.x,Pr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)me.fromBufferAttribute(this,e),me.applyMatrix3(t),this.setXYZ(e,me.x,me.y,me.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)me.fromBufferAttribute(this,e),me.applyMatrix4(t),this.setXYZ(e,me.x,me.y,me.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)me.fromBufferAttribute(this,e),me.applyNormalMatrix(t),this.setXYZ(e,me.x,me.y,me.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)me.fromBufferAttribute(this,e),me.transformDirection(t),this.setXYZ(e,me.x,me.y,me.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=hn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ne(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=hn(e,this.array)),e}setX(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=hn(e,this.array)),e}setY(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=hn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=hn(e,this.array)),e}setW(t,e){return this.normalized&&(e=ne(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,s){return t*=this.itemSize,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array),s=ne(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==zo&&(t.usage=this.usage),t}}class Ml extends Xe{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Sl extends Xe{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class fe extends Xe{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Ch=0;const Je=new ie,Os=new Se,wi=new L,Ge=new hi,er=new hi,Me=new L;class ke extends Yi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ch++}),this.uuid=Rn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(gl(t)?Sl:Ml)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ot().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Je.makeRotationFromQuaternion(t),this.applyMatrix4(Je),this}rotateX(t){return Je.makeRotationX(t),this.applyMatrix4(Je),this}rotateY(t){return Je.makeRotationY(t),this.applyMatrix4(Je),this}rotateZ(t){return Je.makeRotationZ(t),this.applyMatrix4(Je),this}translate(t,e,n){return Je.makeTranslation(t,e,n),this.applyMatrix4(Je),this}scale(t,e,n){return Je.makeScale(t,e,n),this.applyMatrix4(Je),this}lookAt(t){return Os.lookAt(t),Os.updateMatrix(),this.applyMatrix4(Os.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,s=t.length;i<s;i++){const o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new fe(n,3))}else{const n=Math.min(t.length,e.count);for(let i=0;i<n;i++){const s=t[i];e.setXYZ(i,s.x,s.y,s.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const s=e[n];Ge.setFromBufferAttribute(s),this.morphTargetsRelative?(Me.addVectors(this.boundingBox.min,Ge.min),this.boundingBox.expandByPoint(Me),Me.addVectors(this.boundingBox.max,Ge.max),this.boundingBox.expandByPoint(Me)):(this.boundingBox.expandByPoint(Ge.min),this.boundingBox.expandByPoint(Ge.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new $i);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){const n=this.boundingSphere.center;if(Ge.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){const a=e[s];er.setFromBufferAttribute(a),this.morphTargetsRelative?(Me.addVectors(Ge.min,er.min),Ge.expandByPoint(Me),Me.addVectors(Ge.max,er.max),Ge.expandByPoint(Me)):(Ge.expandByPoint(er.min),Ge.expandByPoint(er.max))}Ge.getCenter(n);let i=0;for(let s=0,o=t.count;s<o;s++)Me.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(Me));if(e)for(let s=0,o=e.length;s<o;s++){const a=e[s],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)Me.fromBufferAttribute(a,l),c&&(wi.fromBufferAttribute(t,l),Me.add(wi)),i=Math.max(i,n.distanceToSquared(Me))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,s=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Xe(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let R=0;R<n.count;R++)a[R]=new L,c[R]=new L;const l=new L,u=new L,h=new L,d=new Nt,p=new Nt,_=new Nt,x=new L,m=new L;function f(R,S,g){l.fromBufferAttribute(n,R),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,g),d.fromBufferAttribute(s,R),p.fromBufferAttribute(s,S),_.fromBufferAttribute(s,g),u.sub(l),h.sub(l),p.sub(d),_.sub(d);const A=1/(p.x*_.y-_.x*p.y);isFinite(A)&&(x.copy(u).multiplyScalar(_.y).addScaledVector(h,-p.y).multiplyScalar(A),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-_.x).multiplyScalar(A),a[R].add(x),a[S].add(x),a[g].add(x),c[R].add(m),c[S].add(m),c[g].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:t.count}]);for(let R=0,S=E.length;R<S;++R){const g=E[R],A=g.start,B=g.count;for(let O=A,X=A+B;O<X;O+=3)f(t.getX(O+0),t.getX(O+1),t.getX(O+2))}const w=new L,y=new L,P=new L,C=new L;function T(R){P.fromBufferAttribute(i,R),C.copy(P);const S=a[R];w.copy(S),w.sub(P.multiplyScalar(P.dot(S))).normalize(),y.crossVectors(C,S);const A=y.dot(c[R])<0?-1:1;o.setXYZW(R,w.x,w.y,w.z,A)}for(let R=0,S=E.length;R<S;++R){const g=E[R],A=g.start,B=g.count;for(let O=A,X=A+B;O<X;O+=3)T(t.getX(O+0)),T(t.getX(O+1)),T(t.getX(O+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Xe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const i=new L,s=new L,o=new L,a=new L,c=new L,l=new L,u=new L,h=new L;if(t)for(let d=0,p=t.count;d<p;d+=3){const _=t.getX(d+0),x=t.getX(d+1),m=t.getX(d+2);i.fromBufferAttribute(e,_),s.fromBufferAttribute(e,x),o.fromBufferAttribute(e,m),u.subVectors(o,s),h.subVectors(i,s),u.cross(h),a.fromBufferAttribute(n,_),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),a.add(u),c.add(u),l.add(u),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,p=e.count;d<p;d+=3)i.fromBufferAttribute(e,d+0),s.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),u.subVectors(o,s),h.subVectors(i,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Me.fromBufferAttribute(t,e),Me.normalize(),t.setXYZ(e,Me.x,Me.y,Me.z)}toNonIndexed(){function t(a,c){const l=a.array,u=a.itemSize,h=a.normalized,d=new l.constructor(c.length*u);let p=0,_=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?p=c[x]*a.data.stride+a.offset:p=c[x]*u;for(let f=0;f<u;f++)d[_++]=l[p++]}return new Xe(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new ke,n=this.index.array,i=this.attributes;for(const a in i){const c=i[a],l=t(c,n);e.setAttribute(a,l)}const s=this.morphAttributes;for(const a in s){const c=[],l=s[a];for(let u=0,h=l.length;u<h;u++){const d=l[u],p=t(d,n);c.push(p)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const c in n){const l=n[c];t.data.attributes[c]=l.toJSON(t.data)}const i={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let h=0,d=l.length;h<d;h++){const p=l[h];u.push(p.toJSON(t.data))}u.length>0&&(i[c]=u,s=!0)}s&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const l in i){const u=i[l];this.setAttribute(l,u.clone(e))}const s=t.morphAttributes;for(const l in s){const u=[],h=s[l];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(e));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,u=o.length;l<u;l++){const h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Xa=new ie,Qn=new ta,Ir=new $i,qa=new L,Dr=new L,Lr=new L,Ur=new L,Bs=new L,Nr=new L,Ya=new L,Fr=new L;class st extends Se{constructor(t=new ke,e=new Wn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const a=this.morphTargetInfluences;if(s&&a){Nr.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const u=a[c],h=s[c];u!==0&&(Bs.fromBufferAttribute(h,t),o?Nr.addScaledVector(Bs,u):Nr.addScaledVector(Bs.sub(e),u))}e.add(Nr)}return e}raycast(t,e){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ir.copy(n.boundingSphere),Ir.applyMatrix4(s),Qn.copy(t.ray).recast(t.near),!(Ir.containsPoint(Qn.origin)===!1&&(Qn.intersectSphere(Ir,qa)===null||Qn.origin.distanceToSquared(qa)>(t.far-t.near)**2))&&(Xa.copy(s).invert(),Qn.copy(t.ray).applyMatrix4(Xa),!(n.boundingBox!==null&&Qn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Qn)))}_computeIntersections(t,e,n){let i;const s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,x=d.length;_<x;_++){const m=d[_],f=o[m.materialIndex],E=Math.max(m.start,p.start),w=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=E,P=w;y<P;y+=3){const C=a.getX(y),T=a.getX(y+1),R=a.getX(y+2);i=Or(this,f,t,n,l,u,h,C,T,R),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const _=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let m=_,f=x;m<f;m+=3){const E=a.getX(m),w=a.getX(m+1),y=a.getX(m+2);i=Or(this,o,t,n,l,u,h,E,w,y),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let _=0,x=d.length;_<x;_++){const m=d[_],f=o[m.materialIndex],E=Math.max(m.start,p.start),w=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let y=E,P=w;y<P;y+=3){const C=y,T=y+1,R=y+2;i=Or(this,f,t,n,l,u,h,C,T,R),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const _=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let m=_,f=x;m<f;m+=3){const E=m,w=m+1,y=m+2;i=Or(this,o,t,n,l,u,h,E,w,y),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}}}function Rh(r,t,e,n,i,s,o,a){let c;if(t.side===Oe?c=n.intersectTriangle(o,s,i,!0,a):c=n.intersectTriangle(i,s,o,t.side===Xn,a),c===null)return null;Fr.copy(a),Fr.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Fr);return l<e.near||l>e.far?null:{distance:l,point:Fr.clone(),object:r}}function Or(r,t,e,n,i,s,o,a,c,l){r.getVertexPosition(a,Dr),r.getVertexPosition(c,Lr),r.getVertexPosition(l,Ur);const u=Rh(r,t,e,n,Dr,Lr,Ur,Ya);if(u){const h=new L;tn.getBarycoord(Ya,Dr,Lr,Ur,h),i&&(u.uv=tn.getInterpolatedAttribute(i,a,c,l,h,new Nt)),s&&(u.uv1=tn.getInterpolatedAttribute(s,a,c,l,h,new Nt)),o&&(u.normal=tn.getInterpolatedAttribute(o,a,c,l,h,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a,b:c,c:l,normal:new L,materialIndex:0};tn.getNormal(Dr,Lr,Ur,d.normal),u.face=d,u.barycoord=h}return u}class jt extends ke{constructor(t=1,e=1,n=1,i=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:s,depthSegments:o};const a=this;i=Math.floor(i),s=Math.floor(s),o=Math.floor(o);const c=[],l=[],u=[],h=[];let d=0,p=0;_("z","y","x",-1,-1,n,e,t,o,s,0),_("z","y","x",1,-1,n,e,-t,o,s,1),_("x","z","y",1,1,t,n,e,i,o,2),_("x","z","y",1,-1,t,n,-e,i,o,3),_("x","y","z",1,-1,t,e,n,i,s,4),_("x","y","z",-1,-1,t,e,-n,i,s,5),this.setIndex(c),this.setAttribute("position",new fe(l,3)),this.setAttribute("normal",new fe(u,3)),this.setAttribute("uv",new fe(h,2));function _(x,m,f,E,w,y,P,C,T,R,S){const g=y/T,A=P/R,B=y/2,O=P/2,X=C/2,Y=T+1,q=R+1;let J=0,G=0;const ot=new L;for(let at=0;at<q;at++){const Mt=at*A-O;for(let nt=0;nt<Y;nt++){const ht=nt*g-B;ot[x]=ht*E,ot[m]=Mt*w,ot[f]=X,l.push(ot.x,ot.y,ot.z),ot[x]=0,ot[m]=0,ot[f]=C>0?1:-1,u.push(ot.x,ot.y,ot.z),h.push(nt/T),h.push(1-at/R),J+=1}}for(let at=0;at<R;at++)for(let Mt=0;Mt<T;Mt++){const nt=d+Mt+Y*at,ht=d+Mt+Y*(at+1),I=d+(Mt+1)+Y*(at+1),V=d+(Mt+1)+Y*at;c.push(nt,ht,V),c.push(ht,I,V),G+=6}a.addGroup(p,G,S),p+=G,d+=J}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new jt(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Xi(r){const t={};for(const e in r){t[e]={};for(const n in r[e]){const i=r[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Ue(r){const t={};for(let e=0;e<r.length;e++){const n=Xi(r[e]);for(const i in n)t[i]=n[i]}return t}function Ph(r){const t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function wl(r){const t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Jt.workingColorSpace}const Ih={clone:Xi,merge:Ue};var Dh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class qn extends $n{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Dh,this.fragmentShader=Lh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Xi(t.uniforms),this.uniformsGroups=Ph(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class El extends Se{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ie,this.projectionMatrix=new ie,this.projectionMatrixInverse=new ie,this.coordinateSystem=Cn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Bn=new L,$a=new Nt,ja=new Nt;class un extends El{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=dr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(lr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return dr*2*Math.atan(Math.tan(lr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Bn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Bn.x,Bn.y).multiplyScalar(-t/Bn.z),Bn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bn.x,Bn.y).multiplyScalar(-t/Bn.z)}getViewSize(t,e){return this.getViewBounds(t,$a,ja),e.subVectors(ja,$a)}setViewOffset(t,e,n,i,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(lr*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,s=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*i/c,e-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ei=-90,bi=1;class Uh extends Se{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new un(Ei,bi,t,e);i.layers=this.layers,this.add(i);const s=new un(Ei,bi,t,e);s.layers=this.layers,this.add(s);const o=new un(Ei,bi,t,e);o.layers=this.layers,this.add(o);const a=new un(Ei,bi,t,e);a.layers=this.layers,this.add(a);const c=new un(Ei,bi,t,e);c.layers=this.layers,this.add(c);const l=new un(Ei,bi,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,s,o,a,c]=e;for(const l of e)this.remove(l);if(t===Cn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,c,l,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,s),t.setRenderTarget(n,1,i),t.render(e,o),t.setRenderTarget(n,2,i),t.render(e,a),t.setRenderTarget(n,3,i),t.render(e,c),t.setRenderTarget(n,4,i),t.render(e,l),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,i),t.render(e,u),t.setRenderTarget(h,d,p),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class bl extends Ie{constructor(t,e,n,i,s,o,a,c,l,u){t=t!==void 0?t:[],e=e!==void 0?e:Hi,super(t,e,n,i,s,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Nh extends ui{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new bl(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:en}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new jt(5,5,5),s=new qn({name:"CubemapFromEquirect",uniforms:Xi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Oe,blending:Gn});s.uniforms.tEquirect.value=e;const o=new st(i,s),a=e.minFilter;return e.minFilter===oi&&(e.minFilter=en),new Uh(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){const s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(s)}}class Fh extends Se{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new xn,this.environmentIntensity=1,this.environmentRotation=new xn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Oh{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=zo,this.updateRanges=[],this.version=0,this.uuid=Rn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,s=this.stride;i<s;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Le=new L;class os{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix4(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyNormalMatrix(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.transformDirection(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=hn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ne(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ne(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=hn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=hn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=hn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=hn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ne(e,this.array),n=ne(n,this.array),i=ne(i,this.array),s=ne(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=s,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[i+s])}return new Xe(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new os(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class na extends $n{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Xt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Ti;const nr=new L,Ai=new L,Ci=new L,Ri=new Nt,ir=new Nt,Tl=new ie,Br=new L,rr=new L,kr=new L,Ka=new Nt,ks=new Nt,Za=new Nt;class Ho extends Se{constructor(t=new na){if(super(),this.isSprite=!0,this.type="Sprite",Ti===void 0){Ti=new ke;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Oh(e,5);Ti.setIndex([0,1,2,0,2,3]),Ti.setAttribute("position",new os(n,3,0,!1)),Ti.setAttribute("uv",new os(n,2,3,!1))}this.geometry=Ti,this.material=t,this.center=new Nt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ai.setFromMatrixScale(this.matrixWorld),Tl.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ci.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ai.multiplyScalar(-Ci.z);const n=this.material.rotation;let i,s;n!==0&&(s=Math.cos(n),i=Math.sin(n));const o=this.center;zr(Br.set(-.5,-.5,0),Ci,o,Ai,i,s),zr(rr.set(.5,-.5,0),Ci,o,Ai,i,s),zr(kr.set(.5,.5,0),Ci,o,Ai,i,s),Ka.set(0,0),ks.set(1,0),Za.set(1,1);let a=t.ray.intersectTriangle(Br,rr,kr,!1,nr);if(a===null&&(zr(rr.set(-.5,.5,0),Ci,o,Ai,i,s),ks.set(0,1),a=t.ray.intersectTriangle(Br,kr,rr,!1,nr),a===null))return;const c=t.ray.origin.distanceTo(nr);c<t.near||c>t.far||e.push({distance:c,point:nr.clone(),uv:tn.getInterpolation(nr,Br,rr,kr,Ka,ks,Za,new Nt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function zr(r,t,e,n,i,s){Ri.subVectors(r,e).addScalar(.5).multiply(n),i!==void 0?(ir.x=s*Ri.x-i*Ri.y,ir.y=i*Ri.x+s*Ri.y):ir.copy(Ri),r.copy(t),r.x+=ir.x,r.y+=ir.y,r.applyMatrix4(Tl)}class Al extends Ie{constructor(t=null,e=1,n=1,i,s,o,a,c,l=ve,u=ve,h,d){super(null,o,a,c,l,u,i,s,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ja extends Xe{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Pi=new ie,Qa=new ie,Hr=[],tc=new hi,Bh=new ie,sr=new st,or=new $i;class kh extends st{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ja(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Bh)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new hi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Pi),tc.copy(t.boundingBox).applyMatrix4(Pi),this.boundingBox.union(tc)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new $i),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Pi),or.copy(t.boundingSphere).applyMatrix4(Pi),this.boundingSphere.union(or)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,o=t*s+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(sr.geometry=this.geometry,sr.material=this.material,sr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),or.copy(this.boundingSphere),or.applyMatrix4(n),t.ray.intersectsSphere(or)!==!1))for(let s=0;s<i;s++){this.getMatrixAt(s,Pi),Qa.multiplyMatrices(n,Pi),sr.matrixWorld=Qa,sr.raycast(t,Hr);for(let o=0,a=Hr.length;o<a;o++){const c=Hr[o];c.instanceId=s,c.object=this,e.push(c)}Hr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Ja(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Al(new Float32Array(i*this.count),i,this.count,jo,_n));const s=this.morphTexture.source.data.data;let o=0;for(let l=0;l<n.length;l++)o+=n[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=i*t;s[c]=a,s.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}const zs=new L,zh=new L,Hh=new Ot;class kn{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=zs.subVectors(n,e).cross(zh.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(zs),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const s=-(t.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:e.copy(t.start).addScaledVector(n,s)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Hh.getNormalMatrix(t),i=this.coplanarPoint(zs).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ti=new $i,Gr=new L;class ia{constructor(t=new kn,e=new kn,n=new kn,i=new kn,s=new kn,o=new kn){this.planes=[t,e,n,i,s,o]}set(t,e,n,i,s,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(s),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Cn){const n=this.planes,i=t.elements,s=i[0],o=i[1],a=i[2],c=i[3],l=i[4],u=i[5],h=i[6],d=i[7],p=i[8],_=i[9],x=i[10],m=i[11],f=i[12],E=i[13],w=i[14],y=i[15];if(n[0].setComponents(c-s,d-l,m-p,y-f).normalize(),n[1].setComponents(c+s,d+l,m+p,y+f).normalize(),n[2].setComponents(c+o,d+u,m+_,y+E).normalize(),n[3].setComponents(c-o,d-u,m-_,y-E).normalize(),n[4].setComponents(c-a,d-h,m-x,y-w).normalize(),e===Cn)n[5].setComponents(c+a,d+h,m+x,y+w).normalize();else if(e===ss)n[5].setComponents(a,h,x,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ti.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ti.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ti)}intersectsSprite(t){return ti.center.set(0,0,0),ti.radius=.7071067811865476,ti.applyMatrix4(t.matrixWorld),this.intersectsSphere(ti)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(Gr.x=i.normal.x>0?t.max.x:t.min.x,Gr.y=i.normal.y>0?t.max.y:t.min.y,Gr.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Gr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Cl extends $n{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Xt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const as=new L,cs=new L,ec=new ie,ar=new ta,Vr=new $i,Hs=new L,nc=new L;class Gh extends Se{constructor(t=new ke,e=new Cl){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let i=1,s=e.count;i<s;i++)as.fromBufferAttribute(e,i-1),cs.fromBufferAttribute(e,i),n[i]=n[i-1],n[i]+=as.distanceTo(cs);t.setAttribute("lineDistance",new fe(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,s=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Vr.copy(n.boundingSphere),Vr.applyMatrix4(i),Vr.radius+=s,t.ray.intersectsSphere(Vr)===!1)return;ec.copy(i).invert(),ar.copy(t.ray).applyMatrix4(ec);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const p=Math.max(0,o.start),_=Math.min(u.count,o.start+o.count);for(let x=p,m=_-1;x<m;x+=l){const f=u.getX(x),E=u.getX(x+1),w=Wr(this,t,ar,c,f,E);w&&e.push(w)}if(this.isLineLoop){const x=u.getX(_-1),m=u.getX(p),f=Wr(this,t,ar,c,x,m);f&&e.push(f)}}else{const p=Math.max(0,o.start),_=Math.min(d.count,o.start+o.count);for(let x=p,m=_-1;x<m;x+=l){const f=Wr(this,t,ar,c,x,x+1);f&&e.push(f)}if(this.isLineLoop){const x=Wr(this,t,ar,c,_-1,p);x&&e.push(x)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=i.length;s<o;s++){const a=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Wr(r,t,e,n,i,s){const o=r.geometry.attributes.position;if(as.fromBufferAttribute(o,i),cs.fromBufferAttribute(o,s),e.distanceSqToSegment(as,cs,Hs,nc)>n)return;Hs.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(Hs);if(!(c<t.near||c>t.far))return{distance:c,point:nc.clone().applyMatrix4(r.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:r}}const ic=new L,rc=new L;class Vh extends Gh{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let i=0,s=e.count;i<s;i+=2)ic.fromBufferAttribute(e,i),rc.fromBufferAttribute(e,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+ic.distanceTo(rc);t.setAttribute("lineDistance",new fe(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class de extends Se{constructor(){super(),this.isGroup=!0,this.type="Group"}}class Rl extends Ie{constructor(t,e,n,i,s,o,a,c,l,u=Bi){if(u!==Bi&&u!==Wi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Bi&&(n=ci),n===void 0&&u===Wi&&(n=Vi),super(null,i,s,o,a,c,u,n,l),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:ve,this.minFilter=c!==void 0?c:ve,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class Ee extends ke{constructor(t=1,e=1,n=1,i=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};const l=this;i=Math.floor(i),s=Math.floor(s);const u=[],h=[],d=[],p=[];let _=0;const x=[],m=n/2;let f=0;E(),o===!1&&(t>0&&w(!0),e>0&&w(!1)),this.setIndex(u),this.setAttribute("position",new fe(h,3)),this.setAttribute("normal",new fe(d,3)),this.setAttribute("uv",new fe(p,2));function E(){const y=new L,P=new L;let C=0;const T=(e-t)/n;for(let R=0;R<=s;R++){const S=[],g=R/s,A=g*(e-t)+t;for(let B=0;B<=i;B++){const O=B/i,X=O*c+a,Y=Math.sin(X),q=Math.cos(X);P.x=A*Y,P.y=-g*n+m,P.z=A*q,h.push(P.x,P.y,P.z),y.set(Y,T,q).normalize(),d.push(y.x,y.y,y.z),p.push(O,1-g),S.push(_++)}x.push(S)}for(let R=0;R<i;R++)for(let S=0;S<s;S++){const g=x[S][R],A=x[S+1][R],B=x[S+1][R+1],O=x[S][R+1];(t>0||S!==0)&&(u.push(g,A,O),C+=3),(e>0||S!==s-1)&&(u.push(A,B,O),C+=3)}l.addGroup(f,C,0),f+=C}function w(y){const P=_,C=new Nt,T=new L;let R=0;const S=y===!0?t:e,g=y===!0?1:-1;for(let B=1;B<=i;B++)h.push(0,m*g,0),d.push(0,g,0),p.push(.5,.5),_++;const A=_;for(let B=0;B<=i;B++){const X=B/i*c+a,Y=Math.cos(X),q=Math.sin(X);T.x=S*q,T.y=m*g,T.z=S*Y,h.push(T.x,T.y,T.z),d.push(0,g,0),C.x=Y*.5+.5,C.y=q*.5*g+.5,p.push(C.x,C.y),_++}for(let B=0;B<i;B++){const O=P+B,X=A+B;y===!0?u.push(X,X+1,O):u.push(X+1,X,O),R+=3}l.addGroup(f,R,y===!0?1:2),f+=R}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ee(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Hn extends Ee{constructor(t=1,e=1,n=32,i=1,s=!1,o=0,a=Math.PI*2){super(0,t,e,n,i,s,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Hn(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class ra extends ke{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const s=[],o=[];a(i),l(n),u(),this.setAttribute("position",new fe(s,3)),this.setAttribute("normal",new fe(s.slice(),3)),this.setAttribute("uv",new fe(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(E){const w=new L,y=new L,P=new L;for(let C=0;C<e.length;C+=3)p(e[C+0],w),p(e[C+1],y),p(e[C+2],P),c(w,y,P,E)}function c(E,w,y,P){const C=P+1,T=[];for(let R=0;R<=C;R++){T[R]=[];const S=E.clone().lerp(y,R/C),g=w.clone().lerp(y,R/C),A=C-R;for(let B=0;B<=A;B++)B===0&&R===C?T[R][B]=S:T[R][B]=S.clone().lerp(g,B/A)}for(let R=0;R<C;R++)for(let S=0;S<2*(C-R)-1;S++){const g=Math.floor(S/2);S%2===0?(d(T[R][g+1]),d(T[R+1][g]),d(T[R][g])):(d(T[R][g+1]),d(T[R+1][g+1]),d(T[R+1][g]))}}function l(E){const w=new L;for(let y=0;y<s.length;y+=3)w.x=s[y+0],w.y=s[y+1],w.z=s[y+2],w.normalize().multiplyScalar(E),s[y+0]=w.x,s[y+1]=w.y,s[y+2]=w.z}function u(){const E=new L;for(let w=0;w<s.length;w+=3){E.x=s[w+0],E.y=s[w+1],E.z=s[w+2];const y=m(E)/2/Math.PI+.5,P=f(E)/Math.PI+.5;o.push(y,1-P)}_(),h()}function h(){for(let E=0;E<o.length;E+=6){const w=o[E+0],y=o[E+2],P=o[E+4],C=Math.max(w,y,P),T=Math.min(w,y,P);C>.9&&T<.1&&(w<.2&&(o[E+0]+=1),y<.2&&(o[E+2]+=1),P<.2&&(o[E+4]+=1))}}function d(E){s.push(E.x,E.y,E.z)}function p(E,w){const y=E*3;w.x=t[y+0],w.y=t[y+1],w.z=t[y+2]}function _(){const E=new L,w=new L,y=new L,P=new L,C=new Nt,T=new Nt,R=new Nt;for(let S=0,g=0;S<s.length;S+=9,g+=6){E.set(s[S+0],s[S+1],s[S+2]),w.set(s[S+3],s[S+4],s[S+5]),y.set(s[S+6],s[S+7],s[S+8]),C.set(o[g+0],o[g+1]),T.set(o[g+2],o[g+3]),R.set(o[g+4],o[g+5]),P.copy(E).add(w).add(y).divideScalar(3);const A=m(P);x(C,g+0,E,A),x(T,g+2,w,A),x(R,g+4,y,A)}}function x(E,w,y,P){P<0&&E.x===1&&(o[w]=E.x-1),y.x===0&&y.z===0&&(o[w]=P/2/Math.PI+.5)}function m(E){return Math.atan2(E.z,-E.x)}function f(E){return Math.atan2(-E.y,Math.sqrt(E.x*E.x+E.z*E.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ra(t.vertices,t.indices,t.radius,t.details)}}class sa extends ra{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new sa(t.radius,t.detail)}}class Yn extends ke{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const s=t/2,o=e/2,a=Math.floor(n),c=Math.floor(i),l=a+1,u=c+1,h=t/a,d=e/c,p=[],_=[],x=[],m=[];for(let f=0;f<u;f++){const E=f*d-o;for(let w=0;w<l;w++){const y=w*h-s;_.push(y,-E,0),x.push(0,0,1),m.push(w/a),m.push(1-f/c)}}for(let f=0;f<c;f++)for(let E=0;E<a;E++){const w=E+l*f,y=E+l*(f+1),P=E+1+l*(f+1),C=E+1+l*f;p.push(w,y,C),p.push(y,P,C)}this.setIndex(p),this.setAttribute("position",new fe(_,3)),this.setAttribute("normal",new fe(x,3)),this.setAttribute("uv",new fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yn(t.width,t.height,t.widthSegments,t.heightSegments)}}class Qe extends ke{constructor(t=1,e=32,n=16,i=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const u=[],h=new L,d=new L,p=[],_=[],x=[],m=[];for(let f=0;f<=n;f++){const E=[],w=f/n;let y=0;f===0&&o===0?y=.5/e:f===n&&c===Math.PI&&(y=-.5/e);for(let P=0;P<=e;P++){const C=P/e;h.x=-t*Math.cos(i+C*s)*Math.sin(o+w*a),h.y=t*Math.cos(o+w*a),h.z=t*Math.sin(i+C*s)*Math.sin(o+w*a),_.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(C+y,1-w),E.push(l++)}u.push(E)}for(let f=0;f<n;f++)for(let E=0;E<e;E++){const w=u[f][E+1],y=u[f][E],P=u[f+1][E],C=u[f+1][E+1];(f!==0||o>0)&&p.push(w,y,C),(f!==n-1||c<Math.PI)&&p.push(y,P,C)}this.setIndex(p),this.setAttribute("position",new fe(_,3)),this.setAttribute("normal",new fe(x,3)),this.setAttribute("uv",new fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Qe(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class gr extends ke{constructor(t=1,e=.4,n=12,i=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:s},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],c=[],l=[],u=new L,h=new L,d=new L;for(let p=0;p<=n;p++)for(let _=0;_<=i;_++){const x=_/i*s,m=p/n*Math.PI*2;h.x=(t+e*Math.cos(m))*Math.cos(x),h.y=(t+e*Math.cos(m))*Math.sin(x),h.z=e*Math.sin(m),a.push(h.x,h.y,h.z),u.x=t*Math.cos(x),u.y=t*Math.sin(x),d.subVectors(h,u).normalize(),c.push(d.x,d.y,d.z),l.push(_/i),l.push(p/n)}for(let p=1;p<=n;p++)for(let _=1;_<=i;_++){const x=(i+1)*p+_-1,m=(i+1)*(p-1)+_-1,f=(i+1)*(p-1)+_,E=(i+1)*p+_;o.push(x,m,E),o.push(m,f,E)}this.setIndex(o),this.setAttribute("position",new fe(a,3)),this.setAttribute("normal",new fe(c,3)),this.setAttribute("uv",new fe(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gr(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class In extends $n{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Xt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Xt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ml,this.normalScale=new Nt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Wh extends $n{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Bu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Xh extends $n{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const sc={enabled:!1,files:{},add:function(r,t){this.enabled!==!1&&(this.files[r]=t)},get:function(r){if(this.enabled!==!1)return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};class qh{constructor(t,e,n){const i=this;let s=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(u){a++,s===!1&&i.onStart!==void 0&&i.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(s=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){const h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=l.length;h<d;h+=2){const p=l[h],_=l[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return _}return null}}}const Yh=new qh;class oa{constructor(t){this.manager=t!==void 0?t:Yh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const n=this;return new Promise(function(i,s){n.load(t,i,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}oa.DEFAULT_MATERIAL_NAME="__DEFAULT";class $h extends oa{constructor(t){super(t)}load(t,e,n,i){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const s=this,o=sc.get(t);if(o!==void 0)return s.manager.itemStart(t),setTimeout(function(){e&&e(o),s.manager.itemEnd(t)},0),o;const a=fr("img");function c(){u(),sc.add(t,this),e&&e(this),s.manager.itemEnd(t)}function l(h){u(),i&&i(h),s.manager.itemError(t),s.manager.itemEnd(t)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),s.manager.itemStart(t),a.src=t,a}}class Pl extends oa{constructor(t){super(t)}load(t,e,n,i){const s=new Ie,o=new $h(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(t,function(a){s.image=a,s.needsUpdate=!0,e!==void 0&&e(s)},n,i),s}}class Il extends Se{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Xt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}const Gs=new ie,oc=new L,ac=new L;class jh{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Nt(512,512),this.map=null,this.mapPass=null,this.matrix=new ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ia,this._frameExtents=new Nt(1,1),this._viewportCount=1,this._viewports=[new ue(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;oc.setFromMatrixPosition(t.matrixWorld),e.position.copy(oc),ac.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ac),e.updateMatrixWorld(),Gs.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Gs),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Gs)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class aa extends El{constructor(t=-1,e=1,n=1,i=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-t,o=n+t,a=i+e,c=i-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class Kh extends jh{constructor(){super(new aa(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Zh extends Il{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.target=new Se,this.shadow=new Kh}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class Jh extends Il{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class Qh extends un{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}const cc=new ie;class td{constructor(t,e,n=0,i=1/0){this.ray=new ta(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new ea,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return cc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(cc),this}intersectObject(t,e=!0,n=[]){return Go(t,this,n,e),n.sort(lc),n}intersectObjects(t,e=!0,n=[]){for(let i=0,s=t.length;i<s;i++)Go(t[i],this,n,e);return n.sort(lc),n}}function lc(r,t){return r.distance-t.distance}function Go(r,t,e,n){let i=!0;if(r.layers.test(t.layers)&&r.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){const s=r.children;for(let o=0,a=s.length;o<a;o++)Go(s[o],t,e,!0)}}function uc(r,t,e,n){const i=ed(n);switch(e){case ll:return r*t;case hl:return r*t;case dl:return r*t*2;case jo:return r*t/i.components*i.byteLength;case Ko:return r*t/i.components*i.byteLength;case fl:return r*t*2/i.components*i.byteLength;case Zo:return r*t*2/i.components*i.byteLength;case ul:return r*t*3/i.components*i.byteLength;case nn:return r*t*4/i.components*i.byteLength;case Jo:return r*t*4/i.components*i.byteLength;case Kr:case Zr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case Jr:case Qr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case mo:case go:return Math.max(r,16)*Math.max(t,8)/4;case po:case _o:return Math.max(r,8)*Math.max(t,8)/2;case vo:case xo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case yo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Mo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case So:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case wo:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case Eo:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case bo:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case To:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case Ao:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case Co:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case Ro:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case Po:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case Io:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case Do:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case Lo:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case Uo:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case ts:case No:case Fo:return Math.ceil(r/4)*Math.ceil(t/4)*16;case pl:case Oo:return Math.ceil(r/4)*Math.ceil(t/4)*8;case Bo:case ko:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function ed(r){switch(r){case vn:case ol:return{byteLength:1,components:1};case hr:case al:case mr:return{byteLength:2,components:1};case Yo:case $o:return{byteLength:2,components:4};case ci:case qo:case _n:return{byteLength:4,components:1};case cl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Xo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Xo);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Dl(){let r=null,t=!1,e=null,n=null;function i(s,o){e(s,o),n=r.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=r.requestAnimationFrame(i),t=!0)},stop:function(){r.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function nd(r){const t=new WeakMap;function e(a,c){const l=a.array,u=a.usage,h=l.byteLength,d=r.createBuffer();r.bindBuffer(c,d),r.bufferData(c,l,u),a.onUploadCallback();let p;if(l instanceof Float32Array)p=r.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?p=r.HALF_FLOAT:p=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=r.SHORT;else if(l instanceof Uint32Array)p=r.UNSIGNED_INT;else if(l instanceof Int32Array)p=r.INT;else if(l instanceof Int8Array)p=r.BYTE;else if(l instanceof Uint8Array)p=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,c,l){const u=c.array,h=c.updateRanges;if(r.bindBuffer(l,a),h.length===0)r.bufferSubData(l,0,u);else{h.sort((p,_)=>p.start-_.start);let d=0;for(let p=1;p<h.length;p++){const _=h[d],x=h[p];x.start<=_.start+_.count+1?_.count=Math.max(_.count,x.start+x.count-_.start):(++d,h[d]=x)}h.length=d+1;for(let p=0,_=h.length;p<_;p++){const x=h[p];r.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);c&&(r.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:s,update:o}}var id=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,rd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,sd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,od=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ad=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,cd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ld=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ud=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,hd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,dd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,fd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,pd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,md=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,_d=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,gd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,vd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,xd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,yd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Md=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Sd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,wd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ed=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,bd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Td=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ad=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Cd=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Rd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Pd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Id=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Dd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ld="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ud=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Nd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Fd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Od=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Bd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,zd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Hd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Gd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Vd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Wd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Xd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Yd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$d=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,jd=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Kd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Zd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Jd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Qd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,tf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ef=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,nf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,rf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,sf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,of=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,af=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,lf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,uf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,hf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,df=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ff=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,pf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,mf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,_f=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,gf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,vf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,yf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Mf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Sf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,wf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ef=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Tf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Af=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Cf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Rf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Pf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,If=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Df=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Lf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Uf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Nf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ff=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Of=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Bf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,kf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,zf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Hf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Gf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Vf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Xf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,qf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Yf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$f=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,jf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Kf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Jf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Qf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ep=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,np=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ip=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,op=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ap=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,up=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,hp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,dp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,fp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,pp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_p=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,gp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,vp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yp=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Mp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Sp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Ep=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,bp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tp=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ap=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Cp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pp=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ip=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Dp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Lp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Up=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Np=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Fp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kt={alphahash_fragment:id,alphahash_pars_fragment:rd,alphamap_fragment:sd,alphamap_pars_fragment:od,alphatest_fragment:ad,alphatest_pars_fragment:cd,aomap_fragment:ld,aomap_pars_fragment:ud,batching_pars_vertex:hd,batching_vertex:dd,begin_vertex:fd,beginnormal_vertex:pd,bsdfs:md,iridescence_fragment:_d,bumpmap_pars_fragment:gd,clipping_planes_fragment:vd,clipping_planes_pars_fragment:xd,clipping_planes_pars_vertex:yd,clipping_planes_vertex:Md,color_fragment:Sd,color_pars_fragment:wd,color_pars_vertex:Ed,color_vertex:bd,common:Td,cube_uv_reflection_fragment:Ad,defaultnormal_vertex:Cd,displacementmap_pars_vertex:Rd,displacementmap_vertex:Pd,emissivemap_fragment:Id,emissivemap_pars_fragment:Dd,colorspace_fragment:Ld,colorspace_pars_fragment:Ud,envmap_fragment:Nd,envmap_common_pars_fragment:Fd,envmap_pars_fragment:Od,envmap_pars_vertex:Bd,envmap_physical_pars_fragment:jd,envmap_vertex:kd,fog_vertex:zd,fog_pars_vertex:Hd,fog_fragment:Gd,fog_pars_fragment:Vd,gradientmap_pars_fragment:Wd,lightmap_pars_fragment:Xd,lights_lambert_fragment:qd,lights_lambert_pars_fragment:Yd,lights_pars_begin:$d,lights_toon_fragment:Kd,lights_toon_pars_fragment:Zd,lights_phong_fragment:Jd,lights_phong_pars_fragment:Qd,lights_physical_fragment:tf,lights_physical_pars_fragment:ef,lights_fragment_begin:nf,lights_fragment_maps:rf,lights_fragment_end:sf,logdepthbuf_fragment:of,logdepthbuf_pars_fragment:af,logdepthbuf_pars_vertex:cf,logdepthbuf_vertex:lf,map_fragment:uf,map_pars_fragment:hf,map_particle_fragment:df,map_particle_pars_fragment:ff,metalnessmap_fragment:pf,metalnessmap_pars_fragment:mf,morphinstance_vertex:_f,morphcolor_vertex:gf,morphnormal_vertex:vf,morphtarget_pars_vertex:xf,morphtarget_vertex:yf,normal_fragment_begin:Mf,normal_fragment_maps:Sf,normal_pars_fragment:wf,normal_pars_vertex:Ef,normal_vertex:bf,normalmap_pars_fragment:Tf,clearcoat_normal_fragment_begin:Af,clearcoat_normal_fragment_maps:Cf,clearcoat_pars_fragment:Rf,iridescence_pars_fragment:Pf,opaque_fragment:If,packing:Df,premultiplied_alpha_fragment:Lf,project_vertex:Uf,dithering_fragment:Nf,dithering_pars_fragment:Ff,roughnessmap_fragment:Of,roughnessmap_pars_fragment:Bf,shadowmap_pars_fragment:kf,shadowmap_pars_vertex:zf,shadowmap_vertex:Hf,shadowmask_pars_fragment:Gf,skinbase_vertex:Vf,skinning_pars_vertex:Wf,skinning_vertex:Xf,skinnormal_vertex:qf,specularmap_fragment:Yf,specularmap_pars_fragment:$f,tonemapping_fragment:jf,tonemapping_pars_fragment:Kf,transmission_fragment:Zf,transmission_pars_fragment:Jf,uv_pars_fragment:Qf,uv_pars_vertex:tp,uv_vertex:ep,worldpos_vertex:np,background_vert:ip,background_frag:rp,backgroundCube_vert:sp,backgroundCube_frag:op,cube_vert:ap,cube_frag:cp,depth_vert:lp,depth_frag:up,distanceRGBA_vert:hp,distanceRGBA_frag:dp,equirect_vert:fp,equirect_frag:pp,linedashed_vert:mp,linedashed_frag:_p,meshbasic_vert:gp,meshbasic_frag:vp,meshlambert_vert:xp,meshlambert_frag:yp,meshmatcap_vert:Mp,meshmatcap_frag:Sp,meshnormal_vert:wp,meshnormal_frag:Ep,meshphong_vert:bp,meshphong_frag:Tp,meshphysical_vert:Ap,meshphysical_frag:Cp,meshtoon_vert:Rp,meshtoon_frag:Pp,points_vert:Ip,points_frag:Dp,shadow_vert:Lp,shadow_frag:Up,sprite_vert:Np,sprite_frag:Fp},ct={common:{diffuse:{value:new Xt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ot}},envmap:{envMap:{value:null},envMapRotation:{value:new Ot},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ot},normalScale:{value:new Nt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Xt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Xt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0},uvTransform:{value:new Ot}},sprite:{diffuse:{value:new Xt(16777215)},opacity:{value:1},center:{value:new Nt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}}},mn={basic:{uniforms:Ue([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:kt.meshbasic_vert,fragmentShader:kt.meshbasic_frag},lambert:{uniforms:Ue([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Xt(0)}}]),vertexShader:kt.meshlambert_vert,fragmentShader:kt.meshlambert_frag},phong:{uniforms:Ue([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Xt(0)},specular:{value:new Xt(1118481)},shininess:{value:30}}]),vertexShader:kt.meshphong_vert,fragmentShader:kt.meshphong_frag},standard:{uniforms:Ue([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new Xt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag},toon:{uniforms:Ue([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new Xt(0)}}]),vertexShader:kt.meshtoon_vert,fragmentShader:kt.meshtoon_frag},matcap:{uniforms:Ue([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:kt.meshmatcap_vert,fragmentShader:kt.meshmatcap_frag},points:{uniforms:Ue([ct.points,ct.fog]),vertexShader:kt.points_vert,fragmentShader:kt.points_frag},dashed:{uniforms:Ue([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:kt.linedashed_vert,fragmentShader:kt.linedashed_frag},depth:{uniforms:Ue([ct.common,ct.displacementmap]),vertexShader:kt.depth_vert,fragmentShader:kt.depth_frag},normal:{uniforms:Ue([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:kt.meshnormal_vert,fragmentShader:kt.meshnormal_frag},sprite:{uniforms:Ue([ct.sprite,ct.fog]),vertexShader:kt.sprite_vert,fragmentShader:kt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:kt.background_vert,fragmentShader:kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ot}},vertexShader:kt.backgroundCube_vert,fragmentShader:kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:kt.cube_vert,fragmentShader:kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:kt.equirect_vert,fragmentShader:kt.equirect_frag},distanceRGBA:{uniforms:Ue([ct.common,ct.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:kt.distanceRGBA_vert,fragmentShader:kt.distanceRGBA_frag},shadow:{uniforms:Ue([ct.lights,ct.fog,{color:{value:new Xt(0)},opacity:{value:1}}]),vertexShader:kt.shadow_vert,fragmentShader:kt.shadow_frag}};mn.physical={uniforms:Ue([mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ot},clearcoatNormalScale:{value:new Nt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ot},sheen:{value:0},sheenColor:{value:new Xt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ot},transmissionSamplerSize:{value:new Nt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ot},attenuationDistance:{value:0},attenuationColor:{value:new Xt(0)},specularColor:{value:new Xt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ot},anisotropyVector:{value:new Nt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ot}}]),vertexShader:kt.meshphysical_vert,fragmentShader:kt.meshphysical_frag};const Xr={r:0,b:0,g:0},ei=new xn,Op=new ie;function Bp(r,t,e,n,i,s,o){const a=new Xt(0);let c=s===!0?0:1,l,u,h=null,d=0,p=null;function _(w){let y=w.isScene===!0?w.background:null;return y&&y.isTexture&&(y=(w.backgroundBlurriness>0?e:t).get(y)),y}function x(w){let y=!1;const P=_(w);P===null?f(a,c):P&&P.isColor&&(f(P,1),y=!0);const C=r.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(r.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function m(w,y){const P=_(y);P&&(P.isCubeTexture||P.mapping===ds)?(u===void 0&&(u=new st(new jt(1,1,1),new qn({name:"BackgroundCubeMaterial",uniforms:Xi(mn.backgroundCube.uniforms),vertexShader:mn.backgroundCube.vertexShader,fragmentShader:mn.backgroundCube.fragmentShader,side:Oe,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,T,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),ei.copy(y.backgroundRotation),ei.x*=-1,ei.y*=-1,ei.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),u.material.uniforms.envMap.value=P,u.material.uniforms.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Op.makeRotationFromEuler(ei)),u.material.toneMapped=Jt.getTransfer(P.colorSpace)!==re,(h!==P||d!==P.version||p!==r.toneMapping)&&(u.material.needsUpdate=!0,h=P,d=P.version,p=r.toneMapping),u.layers.enableAll(),w.unshift(u,u.geometry,u.material,0,0,null)):P&&P.isTexture&&(l===void 0&&(l=new st(new Yn(2,2),new qn({name:"BackgroundMaterial",uniforms:Xi(mn.background.uniforms),vertexShader:mn.background.vertexShader,fragmentShader:mn.background.fragmentShader,side:Xn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=P,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=Jt.getTransfer(P.colorSpace)!==re,P.matrixAutoUpdate===!0&&P.updateMatrix(),l.material.uniforms.uvTransform.value.copy(P.matrix),(h!==P||d!==P.version||p!==r.toneMapping)&&(l.material.needsUpdate=!0,h=P,d=P.version,p=r.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function f(w,y){w.getRGB(Xr,wl(r)),n.buffers.color.setClear(Xr.r,Xr.g,Xr.b,y,o)}function E(){u!==void 0&&(u.geometry.dispose(),u.material.dispose()),l!==void 0&&(l.geometry.dispose(),l.material.dispose())}return{getClearColor:function(){return a},setClearColor:function(w,y=1){a.set(w),c=y,f(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(w){c=w,f(a,c)},render:x,addToRenderList:m,dispose:E}}function kp(r,t){const e=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=d(null);let s=i,o=!1;function a(g,A,B,O,X){let Y=!1;const q=h(O,B,A);s!==q&&(s=q,l(s.object)),Y=p(g,O,B,X),Y&&_(g,O,B,X),X!==null&&t.update(X,r.ELEMENT_ARRAY_BUFFER),(Y||o)&&(o=!1,y(g,A,B,O),X!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(X).buffer))}function c(){return r.createVertexArray()}function l(g){return r.bindVertexArray(g)}function u(g){return r.deleteVertexArray(g)}function h(g,A,B){const O=B.wireframe===!0;let X=n[g.id];X===void 0&&(X={},n[g.id]=X);let Y=X[A.id];Y===void 0&&(Y={},X[A.id]=Y);let q=Y[O];return q===void 0&&(q=d(c()),Y[O]=q),q}function d(g){const A=[],B=[],O=[];for(let X=0;X<e;X++)A[X]=0,B[X]=0,O[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:A,enabledAttributes:B,attributeDivisors:O,object:g,attributes:{},index:null}}function p(g,A,B,O){const X=s.attributes,Y=A.attributes;let q=0;const J=B.getAttributes();for(const G in J)if(J[G].location>=0){const at=X[G];let Mt=Y[G];if(Mt===void 0&&(G==="instanceMatrix"&&g.instanceMatrix&&(Mt=g.instanceMatrix),G==="instanceColor"&&g.instanceColor&&(Mt=g.instanceColor)),at===void 0||at.attribute!==Mt||Mt&&at.data!==Mt.data)return!0;q++}return s.attributesNum!==q||s.index!==O}function _(g,A,B,O){const X={},Y=A.attributes;let q=0;const J=B.getAttributes();for(const G in J)if(J[G].location>=0){let at=Y[G];at===void 0&&(G==="instanceMatrix"&&g.instanceMatrix&&(at=g.instanceMatrix),G==="instanceColor"&&g.instanceColor&&(at=g.instanceColor));const Mt={};Mt.attribute=at,at&&at.data&&(Mt.data=at.data),X[G]=Mt,q++}s.attributes=X,s.attributesNum=q,s.index=O}function x(){const g=s.newAttributes;for(let A=0,B=g.length;A<B;A++)g[A]=0}function m(g){f(g,0)}function f(g,A){const B=s.newAttributes,O=s.enabledAttributes,X=s.attributeDivisors;B[g]=1,O[g]===0&&(r.enableVertexAttribArray(g),O[g]=1),X[g]!==A&&(r.vertexAttribDivisor(g,A),X[g]=A)}function E(){const g=s.newAttributes,A=s.enabledAttributes;for(let B=0,O=A.length;B<O;B++)A[B]!==g[B]&&(r.disableVertexAttribArray(B),A[B]=0)}function w(g,A,B,O,X,Y,q){q===!0?r.vertexAttribIPointer(g,A,B,X,Y):r.vertexAttribPointer(g,A,B,O,X,Y)}function y(g,A,B,O){x();const X=O.attributes,Y=B.getAttributes(),q=A.defaultAttributeValues;for(const J in Y){const G=Y[J];if(G.location>=0){let ot=X[J];if(ot===void 0&&(J==="instanceMatrix"&&g.instanceMatrix&&(ot=g.instanceMatrix),J==="instanceColor"&&g.instanceColor&&(ot=g.instanceColor)),ot!==void 0){const at=ot.normalized,Mt=ot.itemSize,nt=t.get(ot);if(nt===void 0)continue;const ht=nt.buffer,I=nt.type,V=nt.bytesPerElement,it=I===r.INT||I===r.UNSIGNED_INT||ot.gpuType===qo;if(ot.isInterleavedBufferAttribute){const j=ot.data,rt=j.stride,mt=ot.offset;if(j.isInstancedInterleavedBuffer){for(let Rt=0;Rt<G.locationSize;Rt++)f(G.location+Rt,j.meshPerAttribute);g.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Rt=0;Rt<G.locationSize;Rt++)m(G.location+Rt);r.bindBuffer(r.ARRAY_BUFFER,ht);for(let Rt=0;Rt<G.locationSize;Rt++)w(G.location+Rt,Mt/G.locationSize,I,at,rt*V,(mt+Mt/G.locationSize*Rt)*V,it)}else{if(ot.isInstancedBufferAttribute){for(let j=0;j<G.locationSize;j++)f(G.location+j,ot.meshPerAttribute);g.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let j=0;j<G.locationSize;j++)m(G.location+j);r.bindBuffer(r.ARRAY_BUFFER,ht);for(let j=0;j<G.locationSize;j++)w(G.location+j,Mt/G.locationSize,I,at,Mt*V,Mt/G.locationSize*j*V,it)}}else if(q!==void 0){const at=q[J];if(at!==void 0)switch(at.length){case 2:r.vertexAttrib2fv(G.location,at);break;case 3:r.vertexAttrib3fv(G.location,at);break;case 4:r.vertexAttrib4fv(G.location,at);break;default:r.vertexAttrib1fv(G.location,at)}}}}E()}function P(){R();for(const g in n){const A=n[g];for(const B in A){const O=A[B];for(const X in O)u(O[X].object),delete O[X];delete A[B]}delete n[g]}}function C(g){if(n[g.id]===void 0)return;const A=n[g.id];for(const B in A){const O=A[B];for(const X in O)u(O[X].object),delete O[X];delete A[B]}delete n[g.id]}function T(g){for(const A in n){const B=n[A];if(B[g.id]===void 0)continue;const O=B[g.id];for(const X in O)u(O[X].object),delete O[X];delete B[g.id]}}function R(){S(),o=!0,s!==i&&(s=i,l(s.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:R,resetDefaultState:S,dispose:P,releaseStatesOfGeometry:C,releaseStatesOfProgram:T,initAttributes:x,enableAttribute:m,disableUnusedAttributes:E}}function zp(r,t,e){let n;function i(l){n=l}function s(l,u){r.drawArrays(n,l,u),e.update(u,n,1)}function o(l,u,h){h!==0&&(r.drawArraysInstanced(n,l,u,h),e.update(u,n,h))}function a(l,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,h);let p=0;for(let _=0;_<h;_++)p+=u[_];e.update(p,n,1)}function c(l,u,h,d){if(h===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<l.length;_++)o(l[_],u[_],d[_]);else{p.multiDrawArraysInstancedWEBGL(n,l,0,u,0,d,0,h);let _=0;for(let x=0;x<h;x++)_+=u[x]*d[x];e.update(_,n,1)}}this.setMode=i,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Hp(r,t,e,n){let i;function s(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const T=t.get("EXT_texture_filter_anisotropic");i=r.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(T){return!(T!==nn&&n.convert(T)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){const R=T===mr&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==vn&&n.convert(T)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==_n&&!R)}function c(T){if(T==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const h=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),_=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),f=r.getParameter(r.MAX_VERTEX_ATTRIBS),E=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),w=r.getParameter(r.MAX_VARYING_VECTORS),y=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),P=_>0,C=r.getParameter(r.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:E,maxVaryings:w,maxFragmentUniforms:y,vertexTextures:P,maxSamples:C}}function Gp(r){const t=this;let e=null,n=0,i=!1,s=!1;const o=new kn,a=new Ot,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const p=h.length!==0||d||n!==0||i;return i=d,n=h.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,p){const _=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,f=r.get(h);if(!i||_===null||_.length===0||s&&!m)s?u(null):l();else{const E=s?0:n,w=E*4;let y=f.clippingState||null;c.value=y,y=u(_,d,w,p);for(let P=0;P!==w;++P)y[P]=e[P];f.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,d,p,_){const x=h!==null?h.length:0;let m=null;if(x!==0){if(m=c.value,_!==!0||m===null){const f=p+x*4,E=d.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<f)&&(m=new Float32Array(f));for(let w=0,y=p;w!==x;++w,y+=4)o.copy(h[w]).applyMatrix4(E,a),o.normal.toArray(m,y),m[y+3]=o.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}function Vp(r){let t=new WeakMap;function e(o,a){return a===lo?o.mapping=Hi:a===uo&&(o.mapping=Gi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===lo||a===uo)if(t.has(o)){const c=t.get(o).texture;return e(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new Nh(c.height);return l.fromEquirectangularTexture(r,o),t.set(o,l),o.addEventListener("dispose",i),e(l.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const c=t.get(a);c!==void 0&&(t.delete(a),c.dispose())}function s(){t=new WeakMap}return{get:n,dispose:s}}const Ui=4,hc=[.125,.215,.35,.446,.526,.582],si=20,Vs=new aa,dc=new Xt;let Ws=null,Xs=0,qs=0,Ys=!1;const ii=(1+Math.sqrt(5))/2,Ii=1/ii,fc=[new L(-ii,Ii,0),new L(ii,Ii,0),new L(-Ii,0,ii),new L(Ii,0,ii),new L(0,ii,-Ii),new L(0,ii,Ii),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class pc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){Ws=this._renderer.getRenderTarget(),Xs=this._renderer.getActiveCubeFace(),qs=this._renderer.getActiveMipmapLevel(),Ys=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,n,i,s),e>0&&this._blur(s,0,0,e),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_c(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Ws,Xs,qs),this._renderer.xr.enabled=Ys,t.scissorTest=!1,qr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Hi||t.mapping===Gi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Ws=this._renderer.getRenderTarget(),Xs=this._renderer.getActiveCubeFace(),qs=this._renderer.getActiveMipmapLevel(),Ys=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:en,minFilter:en,generateMipmaps:!1,type:mr,format:nn,colorSpace:li,depthBuffer:!1},i=mc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mc(t,e,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Wp(s)),this._blurMaterial=Xp(s,t,e)}return i}_compileMaterial(t){const e=new st(this._lodPlanes[0],t);this._renderer.compile(e,Vs)}_sceneToCubeUV(t,e,n,i){const a=new un(90,1,e,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(dc),u.toneMapping=Vn,u.autoClear=!1;const p=new Wn({name:"PMREM.Background",side:Oe,depthWrite:!1,depthTest:!1}),_=new st(new jt,p);let x=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,x=!0):(p.color.copy(dc),x=!0);for(let f=0;f<6;f++){const E=f%3;E===0?(a.up.set(0,c[f],0),a.lookAt(l[f],0,0)):E===1?(a.up.set(0,0,c[f]),a.lookAt(0,l[f],0)):(a.up.set(0,c[f],0),a.lookAt(0,0,l[f]));const w=this._cubeSize;qr(i,E*w,f>2?w:0,w,w),u.setRenderTarget(i),x&&u.render(_,a),u.render(t,a)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=d,u.autoClear=h,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===Hi||t.mapping===Gi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=gc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_c());const s=i?this._cubemapMaterial:this._equirectMaterial,o=new st(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=t;const c=this._cubeSize;qr(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,Vs)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let s=1;s<i;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=fc[(i-s-1)%fc.length];this._blur(t,s-1,s,o,a)}e.autoClear=n}_blur(t,e,n,i,s){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",s),this._halfBlur(o,t,n,n,i,"longitudinal",s)}_halfBlur(t,e,n,i,s,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new st(this._lodPlanes[i],l),d=l.uniforms,p=this._sizeLods[n]-1,_=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*si-1),x=s/_,m=isFinite(s)?1+Math.floor(u*x):si;m>si&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${si}`);const f=[];let E=0;for(let T=0;T<si;++T){const R=T/x,S=Math.exp(-R*R/2);f.push(S),T===0?E+=S:T<m&&(E+=2*S)}for(let T=0;T<f.length;T++)f[T]=f[T]/E;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:w}=this;d.dTheta.value=_,d.mipInt.value=w-n;const y=this._sizeLods[i],P=3*y*(i>w-Ui?i-w+Ui:0),C=4*(this._cubeSize-y);qr(e,P,C,3*y,2*y),c.setRenderTarget(e),c.render(h,Vs)}}function Wp(r){const t=[],e=[],n=[];let i=r;const s=r-Ui+1+hc.length;for(let o=0;o<s;o++){const a=Math.pow(2,i);e.push(a);let c=1/a;o>r-Ui?c=hc[o-r+Ui-1]:o===0&&(c=0),n.push(c);const l=1/(a-2),u=-l,h=1+l,d=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,_=6,x=3,m=2,f=1,E=new Float32Array(x*_*p),w=new Float32Array(m*_*p),y=new Float32Array(f*_*p);for(let C=0;C<p;C++){const T=C%3*2/3-1,R=C>2?0:-1,S=[T,R,0,T+2/3,R,0,T+2/3,R+1,0,T,R,0,T+2/3,R+1,0,T,R+1,0];E.set(S,x*_*C),w.set(d,m*_*C);const g=[C,C,C,C,C,C];y.set(g,f*_*C)}const P=new ke;P.setAttribute("position",new Xe(E,x)),P.setAttribute("uv",new Xe(w,m)),P.setAttribute("faceIndex",new Xe(y,f)),t.push(P),i>Ui&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function mc(r,t,e){const n=new ui(r,t,e);return n.texture.mapping=ds,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function qr(r,t,e,n,i){r.viewport.set(t,e,n,i),r.scissor.set(t,e,n,i)}function Xp(r,t,e){const n=new Float32Array(si),i=new L(0,1,0);return new qn({name:"SphericalGaussianBlur",defines:{n:si,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ca(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function _c(){return new qn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ca(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function gc(){return new qn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ca(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function ca(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function qp(r){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const c=a.mapping,l=c===lo||c===uo,u=c===Hi||c===Gi;if(l||u){let h=t.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new pc(r)),h=l?e.fromEquirectangular(a,h):e.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),h.texture;if(h!==void 0)return h.texture;{const p=a.image;return l&&p&&p.height>0||u&&p&&i(p)?(e===null&&(e=new pc(r)),h=l?e.fromEquirectangular(a):e.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function i(a){let c=0;const l=6;for(let u=0;u<l;u++)a[u]!==void 0&&c++;return c===l}function s(a){const c=a.target;c.removeEventListener("dispose",s);const l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Yp(r){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=r.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&Di("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function $p(r,t,e,n){const i={},s=new WeakMap;function o(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const _ in d.attributes)t.remove(d.attributes[_]);d.removeEventListener("dispose",o),delete i[d.id];const p=s.get(d);p&&(t.remove(p),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(h,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,e.memory.geometries++),d}function c(h){const d=h.attributes;for(const p in d)t.update(d[p],r.ARRAY_BUFFER)}function l(h){const d=[],p=h.index,_=h.attributes.position;let x=0;if(p!==null){const E=p.array;x=p.version;for(let w=0,y=E.length;w<y;w+=3){const P=E[w+0],C=E[w+1],T=E[w+2];d.push(P,C,C,T,T,P)}}else if(_!==void 0){const E=_.array;x=_.version;for(let w=0,y=E.length/3-1;w<y;w+=3){const P=w+0,C=w+1,T=w+2;d.push(P,C,C,T,T,P)}}else return;const m=new(gl(d)?Sl:Ml)(d,1);m.version=x;const f=s.get(h);f&&t.remove(f),s.set(h,m)}function u(h){const d=s.get(h);if(d){const p=h.index;p!==null&&d.version<p.version&&l(h)}else l(h);return s.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function jp(r,t,e){let n;function i(d){n=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function c(d,p){r.drawElements(n,p,s,d*o),e.update(p,n,1)}function l(d,p,_){_!==0&&(r.drawElementsInstanced(n,p,s,d*o,_),e.update(p,n,_))}function u(d,p,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,s,d,0,_);let m=0;for(let f=0;f<_;f++)m+=p[f];e.update(m,n,1)}function h(d,p,_,x){if(_===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)l(d[f]/o,p[f],x[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,s,d,0,x,0,_);let f=0;for(let E=0;E<_;E++)f+=p[E]*x[E];e.update(f,n,1)}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Kp(r){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function Zp(r,t,e){const n=new WeakMap,i=new ue;function s(o,a,c){const l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let g=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",g)};var p=g;d!==void 0&&d.texture.dispose();const _=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,f=a.morphAttributes.position||[],E=a.morphAttributes.normal||[],w=a.morphAttributes.color||[];let y=0;_===!0&&(y=1),x===!0&&(y=2),m===!0&&(y=3);let P=a.attributes.position.count*y,C=1;P>t.maxTextureSize&&(C=Math.ceil(P/t.maxTextureSize),P=t.maxTextureSize);const T=new Float32Array(P*C*4*h),R=new xl(T,P,C,h);R.type=_n,R.needsUpdate=!0;const S=y*4;for(let A=0;A<h;A++){const B=f[A],O=E[A],X=w[A],Y=P*C*4*A;for(let q=0;q<B.count;q++){const J=q*S;_===!0&&(i.fromBufferAttribute(B,q),T[Y+J+0]=i.x,T[Y+J+1]=i.y,T[Y+J+2]=i.z,T[Y+J+3]=0),x===!0&&(i.fromBufferAttribute(O,q),T[Y+J+4]=i.x,T[Y+J+5]=i.y,T[Y+J+6]=i.z,T[Y+J+7]=0),m===!0&&(i.fromBufferAttribute(X,q),T[Y+J+8]=i.x,T[Y+J+9]=i.y,T[Y+J+10]=i.z,T[Y+J+11]=X.itemSize===4?i.w:1)}}d={count:h,texture:R,size:new Nt(P,C)},n.set(a,d),a.addEventListener("dispose",g)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",o.morphTexture,e);else{let _=0;for(let m=0;m<l.length;m++)_+=l[m];const x=a.morphTargetsRelative?1:1-_;c.getUniforms().setValue(r,"morphTargetBaseInfluence",x),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",d.texture,e),c.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function Jp(r,t,e,n){let i=new WeakMap;function s(c){const l=n.render.frame,u=c.geometry,h=t.get(c,u);if(i.get(h)!==l&&(t.update(h),i.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==l&&(e.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,r.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const d=c.skeleton;i.get(d)!==l&&(d.update(),i.set(d,l))}return h}function o(){i=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:s,dispose:o}}const Ll=new Ie,vc=new Rl(1,1),Ul=new xl,Nl=new xh,Fl=new bl,xc=[],yc=[],Mc=new Float32Array(16),Sc=new Float32Array(9),wc=new Float32Array(4);function ji(r,t,e){const n=r[0];if(n<=0||n>0)return r;const i=t*e;let s=xc[i];if(s===void 0&&(s=new Float32Array(i),xc[i]=s),t!==0){n.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function xe(r,t){if(r.length!==t.length)return!1;for(let e=0,n=r.length;e<n;e++)if(r[e]!==t[e])return!1;return!0}function ye(r,t){for(let e=0,n=t.length;e<n;e++)r[e]=t[e]}function fs(r,t){let e=yc[t];e===void 0&&(e=new Int32Array(t),yc[t]=e);for(let n=0;n!==t;++n)e[n]=r.allocateTextureUnit();return e}function Qp(r,t){const e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function tm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(xe(e,t))return;r.uniform2fv(this.addr,t),ye(e,t)}}function em(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(xe(e,t))return;r.uniform3fv(this.addr,t),ye(e,t)}}function nm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(xe(e,t))return;r.uniform4fv(this.addr,t),ye(e,t)}}function im(r,t){const e=this.cache,n=t.elements;if(n===void 0){if(xe(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),ye(e,t)}else{if(xe(e,n))return;wc.set(n),r.uniformMatrix2fv(this.addr,!1,wc),ye(e,n)}}function rm(r,t){const e=this.cache,n=t.elements;if(n===void 0){if(xe(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),ye(e,t)}else{if(xe(e,n))return;Sc.set(n),r.uniformMatrix3fv(this.addr,!1,Sc),ye(e,n)}}function sm(r,t){const e=this.cache,n=t.elements;if(n===void 0){if(xe(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),ye(e,t)}else{if(xe(e,n))return;Mc.set(n),r.uniformMatrix4fv(this.addr,!1,Mc),ye(e,n)}}function om(r,t){const e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function am(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(xe(e,t))return;r.uniform2iv(this.addr,t),ye(e,t)}}function cm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(xe(e,t))return;r.uniform3iv(this.addr,t),ye(e,t)}}function lm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(xe(e,t))return;r.uniform4iv(this.addr,t),ye(e,t)}}function um(r,t){const e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function hm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(xe(e,t))return;r.uniform2uiv(this.addr,t),ye(e,t)}}function dm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(xe(e,t))return;r.uniform3uiv(this.addr,t),ye(e,t)}}function fm(r,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(xe(e,t))return;r.uniform4uiv(this.addr,t),ye(e,t)}}function pm(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(vc.compareFunction=_l,s=vc):s=Ll,e.setTexture2D(t||s,i)}function mm(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Nl,i)}function _m(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Fl,i)}function gm(r,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Ul,i)}function vm(r){switch(r){case 5126:return Qp;case 35664:return tm;case 35665:return em;case 35666:return nm;case 35674:return im;case 35675:return rm;case 35676:return sm;case 5124:case 35670:return om;case 35667:case 35671:return am;case 35668:case 35672:return cm;case 35669:case 35673:return lm;case 5125:return um;case 36294:return hm;case 36295:return dm;case 36296:return fm;case 35678:case 36198:case 36298:case 36306:case 35682:return pm;case 35679:case 36299:case 36307:return mm;case 35680:case 36300:case 36308:case 36293:return _m;case 36289:case 36303:case 36311:case 36292:return gm}}function xm(r,t){r.uniform1fv(this.addr,t)}function ym(r,t){const e=ji(t,this.size,2);r.uniform2fv(this.addr,e)}function Mm(r,t){const e=ji(t,this.size,3);r.uniform3fv(this.addr,e)}function Sm(r,t){const e=ji(t,this.size,4);r.uniform4fv(this.addr,e)}function wm(r,t){const e=ji(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function Em(r,t){const e=ji(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function bm(r,t){const e=ji(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function Tm(r,t){r.uniform1iv(this.addr,t)}function Am(r,t){r.uniform2iv(this.addr,t)}function Cm(r,t){r.uniform3iv(this.addr,t)}function Rm(r,t){r.uniform4iv(this.addr,t)}function Pm(r,t){r.uniform1uiv(this.addr,t)}function Im(r,t){r.uniform2uiv(this.addr,t)}function Dm(r,t){r.uniform3uiv(this.addr,t)}function Lm(r,t){r.uniform4uiv(this.addr,t)}function Um(r,t,e){const n=this.cache,i=t.length,s=fs(e,i);xe(n,s)||(r.uniform1iv(this.addr,s),ye(n,s));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||Ll,s[o])}function Nm(r,t,e){const n=this.cache,i=t.length,s=fs(e,i);xe(n,s)||(r.uniform1iv(this.addr,s),ye(n,s));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||Nl,s[o])}function Fm(r,t,e){const n=this.cache,i=t.length,s=fs(e,i);xe(n,s)||(r.uniform1iv(this.addr,s),ye(n,s));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||Fl,s[o])}function Om(r,t,e){const n=this.cache,i=t.length,s=fs(e,i);xe(n,s)||(r.uniform1iv(this.addr,s),ye(n,s));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||Ul,s[o])}function Bm(r){switch(r){case 5126:return xm;case 35664:return ym;case 35665:return Mm;case 35666:return Sm;case 35674:return wm;case 35675:return Em;case 35676:return bm;case 5124:case 35670:return Tm;case 35667:case 35671:return Am;case 35668:case 35672:return Cm;case 35669:case 35673:return Rm;case 5125:return Pm;case 36294:return Im;case 36295:return Dm;case 36296:return Lm;case 35678:case 36198:case 36298:case 36306:case 35682:return Um;case 35679:case 36299:case 36307:return Nm;case 35680:case 36300:case 36308:case 36293:return Fm;case 36289:case 36303:case 36311:case 36292:return Om}}class km{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=vm(e.type)}}class zm{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Bm(e.type)}}class Hm{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let s=0,o=i.length;s!==o;++s){const a=i[s];a.setValue(t,e[a.id],n)}}}const $s=/(\w+)(\])?(\[|\.)?/g;function Ec(r,t){r.seq.push(t),r.map[t.id]=t}function Gm(r,t,e){const n=r.name,i=n.length;for($s.lastIndex=0;;){const s=$s.exec(n),o=$s.lastIndex;let a=s[1];const c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){Ec(e,l===void 0?new km(a,r,t):new zm(a,r,t));break}else{let h=e.map[a];h===void 0&&(h=new Hm(a),Ec(e,h)),e=h}}}class es{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const s=t.getActiveUniform(e,i),o=t.getUniformLocation(e,s.name);Gm(s,o,this)}}setValue(t,e,n,i){const s=this.map[e];s!==void 0&&s.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let s=0,o=e.length;s!==o;++s){const a=e[s],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,s=t.length;i!==s;++i){const o=t[i];o.id in e&&n.push(o)}return n}}function bc(r,t,e){const n=r.createShader(t);return r.shaderSource(n,e),r.compileShader(n),n}const Vm=37297;let Wm=0;function Xm(r,t){const e=r.split(`
`),n=[],i=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=i;o<s;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const Tc=new Ot;function qm(r){Jt._getMatrix(Tc,Jt.workingColorSpace,r);const t=`mat3( ${Tc.elements.map(e=>e.toFixed(4))} )`;switch(Jt.getTransfer(r)){case rs:return[t,"LinearTransferOETF"];case re:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",r),[t,"LinearTransferOETF"]}}function Ac(r,t,e){const n=r.getShaderParameter(t,r.COMPILE_STATUS),i=r.getShaderInfoLog(t).trim();if(n&&i==="")return"";const s=/ERROR: 0:(\d+)/.exec(i);if(s){const o=parseInt(s[1]);return e.toUpperCase()+`

`+i+`

`+Xm(r.getShaderSource(t),o)}else return i}function Ym(r,t){const e=qm(t);return[`vec4 ${r}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function $m(r,t){let e;switch(t){case Pu:e="Linear";break;case Iu:e="Reinhard";break;case Du:e="Cineon";break;case Lu:e="ACESFilmic";break;case Nu:e="AgX";break;case Fu:e="Neutral";break;case Uu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Yr=new L;function jm(){Jt.getLuminanceCoefficients(Yr);const r=Yr.x.toFixed(4),t=Yr.y.toFixed(4),e=Yr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Km(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cr).join(`
`)}function Zm(r){const t=[];for(const e in r){const n=r[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Jm(r,t){const e={},n=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(t,i),o=s.name;let a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function cr(r){return r!==""}function Cc(r,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Rc(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Qm=/^[ \t]*#include +<([\w\d./]+)>/gm;function Vo(r){return r.replace(Qm,e_)}const t_=new Map;function e_(r,t){let e=kt[t];if(e===void 0){const n=t_.get(t);if(n!==void 0)e=kt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Vo(e)}const n_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Pc(r){return r.replace(n_,i_)}function i_(r,t,e,n){let i="";for(let s=parseInt(t);s<parseInt(e);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function Ic(r){let t=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function r_(r){let t="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===il?t="SHADOWMAP_TYPE_PCF":r.shadowMapType===lu?t="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===Tn&&(t="SHADOWMAP_TYPE_VSM"),t}function s_(r){let t="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case Hi:case Gi:t="ENVMAP_TYPE_CUBE";break;case ds:t="ENVMAP_TYPE_CUBE_UV";break}return t}function o_(r){let t="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case Gi:t="ENVMAP_MODE_REFRACTION";break}return t}function a_(r){let t="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case rl:t="ENVMAP_BLENDING_MULTIPLY";break;case Cu:t="ENVMAP_BLENDING_MIX";break;case Ru:t="ENVMAP_BLENDING_ADD";break}return t}function c_(r){const t=r.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function l_(r,t,e,n){const i=r.getContext(),s=e.defines;let o=e.vertexShader,a=e.fragmentShader;const c=r_(e),l=s_(e),u=o_(e),h=a_(e),d=c_(e),p=Km(e),_=Zm(s),x=i.createProgram();let m,f,E=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(cr).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(cr).join(`
`),f.length>0&&(f+=`
`)):(m=[Ic(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cr).join(`
`),f=[Ic(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Vn?"#define TONE_MAPPING":"",e.toneMapping!==Vn?kt.tonemapping_pars_fragment:"",e.toneMapping!==Vn?$m("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",kt.colorspace_pars_fragment,Ym("linearToOutputTexel",e.outputColorSpace),jm(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(cr).join(`
`)),o=Vo(o),o=Cc(o,e),o=Rc(o,e),a=Vo(a),a=Cc(a,e),a=Rc(a,e),o=Pc(o),a=Pc(a),e.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===Ia?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ia?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const w=E+m+o,y=E+f+a,P=bc(i,i.VERTEX_SHADER,w),C=bc(i,i.FRAGMENT_SHADER,y);i.attachShader(x,P),i.attachShader(x,C),e.index0AttributeName!==void 0?i.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(x,0,"position"),i.linkProgram(x);function T(A){if(r.debug.checkShaderErrors){const B=i.getProgramInfoLog(x).trim(),O=i.getShaderInfoLog(P).trim(),X=i.getShaderInfoLog(C).trim();let Y=!0,q=!0;if(i.getProgramParameter(x,i.LINK_STATUS)===!1)if(Y=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,x,P,C);else{const J=Ac(i,P,"vertex"),G=Ac(i,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(x,i.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+B+`
`+J+`
`+G)}else B!==""?console.warn("THREE.WebGLProgram: Program Info Log:",B):(O===""||X==="")&&(q=!1);q&&(A.diagnostics={runnable:Y,programLog:B,vertexShader:{log:O,prefix:m},fragmentShader:{log:X,prefix:f}})}i.deleteShader(P),i.deleteShader(C),R=new es(i,x),S=Jm(i,x)}let R;this.getUniforms=function(){return R===void 0&&T(this),R};let S;this.getAttributes=function(){return S===void 0&&T(this),S};let g=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return g===!1&&(g=i.getProgramParameter(x,Vm)),g},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Wm++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=P,this.fragmentShader=C,this}let u_=0;class h_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new d_(t),e.set(t,n)),n}}class d_{constructor(t){this.id=u_++,this.code=t,this.usedTimes=0}}function f_(r,t,e,n,i,s,o){const a=new ea,c=new h_,l=new Set,u=[],h=i.logarithmicDepthBuffer,d=i.vertexTextures;let p=i.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(S){return l.add(S),S===0?"uv":`uv${S}`}function m(S,g,A,B,O){const X=B.fog,Y=O.geometry,q=S.isMeshStandardMaterial?B.environment:null,J=(S.isMeshStandardMaterial?e:t).get(S.envMap||q),G=J&&J.mapping===ds?J.image.height:null,ot=_[S.type];S.precision!==null&&(p=i.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));const at=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Mt=at!==void 0?at.length:0;let nt=0;Y.morphAttributes.position!==void 0&&(nt=1),Y.morphAttributes.normal!==void 0&&(nt=2),Y.morphAttributes.color!==void 0&&(nt=3);let ht,I,V,it;if(ot){const ee=mn[ot];ht=ee.vertexShader,I=ee.fragmentShader}else ht=S.vertexShader,I=S.fragmentShader,c.update(S),V=c.getVertexShaderID(S),it=c.getFragmentShaderID(S);const j=r.getRenderTarget(),rt=r.state.buffers.depth.getReversed(),mt=O.isInstancedMesh===!0,Rt=O.isBatchedMesh===!0,Kt=!!S.map,qt=!!S.matcap,he=!!J,D=!!S.aoMap,$e=!!S.lightMap,Gt=!!S.bumpMap,Vt=!!S.normalMap,At=!!S.displacementMap,oe=!!S.emissiveMap,bt=!!S.metalnessMap,b=!!S.roughnessMap,v=S.anisotropy>0,k=S.clearcoat>0,K=S.dispersion>0,Q=S.iridescence>0,$=S.sheen>0,St=S.transmission>0,dt=v&&!!S.anisotropyMap,gt=k&&!!S.clearcoatMap,Yt=k&&!!S.clearcoatNormalMap,et=k&&!!S.clearcoatRoughnessMap,vt=Q&&!!S.iridescenceMap,It=Q&&!!S.iridescenceThicknessMap,Dt=$&&!!S.sheenColorMap,xt=$&&!!S.sheenRoughnessMap,Wt=!!S.specularMap,Bt=!!S.specularColorMap,se=!!S.specularIntensityMap,U=St&&!!S.transmissionMap,lt=St&&!!S.thicknessMap,W=!!S.gradientMap,Z=!!S.alphaMap,pt=S.alphaTest>0,ft=!!S.alphaHash,Ft=!!S.extensions;let ce=Vn;S.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(ce=r.toneMapping);const Ae={shaderID:ot,shaderType:S.type,shaderName:S.name,vertexShader:ht,fragmentShader:I,defines:S.defines,customVertexShaderID:V,customFragmentShaderID:it,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:Rt,batchingColor:Rt&&O._colorsTexture!==null,instancing:mt,instancingColor:mt&&O.instanceColor!==null,instancingMorph:mt&&O.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:j===null?r.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:li,alphaToCoverage:!!S.alphaToCoverage,map:Kt,matcap:qt,envMap:he,envMapMode:he&&J.mapping,envMapCubeUVHeight:G,aoMap:D,lightMap:$e,bumpMap:Gt,normalMap:Vt,displacementMap:d&&At,emissiveMap:oe,normalMapObjectSpace:Vt&&S.normalMapType===zu,normalMapTangentSpace:Vt&&S.normalMapType===ml,metalnessMap:bt,roughnessMap:b,anisotropy:v,anisotropyMap:dt,clearcoat:k,clearcoatMap:gt,clearcoatNormalMap:Yt,clearcoatRoughnessMap:et,dispersion:K,iridescence:Q,iridescenceMap:vt,iridescenceThicknessMap:It,sheen:$,sheenColorMap:Dt,sheenRoughnessMap:xt,specularMap:Wt,specularColorMap:Bt,specularIntensityMap:se,transmission:St,transmissionMap:U,thicknessMap:lt,gradientMap:W,opaque:S.transparent===!1&&S.blending===Oi&&S.alphaToCoverage===!1,alphaMap:Z,alphaTest:pt,alphaHash:ft,combine:S.combine,mapUv:Kt&&x(S.map.channel),aoMapUv:D&&x(S.aoMap.channel),lightMapUv:$e&&x(S.lightMap.channel),bumpMapUv:Gt&&x(S.bumpMap.channel),normalMapUv:Vt&&x(S.normalMap.channel),displacementMapUv:At&&x(S.displacementMap.channel),emissiveMapUv:oe&&x(S.emissiveMap.channel),metalnessMapUv:bt&&x(S.metalnessMap.channel),roughnessMapUv:b&&x(S.roughnessMap.channel),anisotropyMapUv:dt&&x(S.anisotropyMap.channel),clearcoatMapUv:gt&&x(S.clearcoatMap.channel),clearcoatNormalMapUv:Yt&&x(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&x(S.clearcoatRoughnessMap.channel),iridescenceMapUv:vt&&x(S.iridescenceMap.channel),iridescenceThicknessMapUv:It&&x(S.iridescenceThicknessMap.channel),sheenColorMapUv:Dt&&x(S.sheenColorMap.channel),sheenRoughnessMapUv:xt&&x(S.sheenRoughnessMap.channel),specularMapUv:Wt&&x(S.specularMap.channel),specularColorMapUv:Bt&&x(S.specularColorMap.channel),specularIntensityMapUv:se&&x(S.specularIntensityMap.channel),transmissionMapUv:U&&x(S.transmissionMap.channel),thicknessMapUv:lt&&x(S.thicknessMap.channel),alphaMapUv:Z&&x(S.alphaMap.channel),vertexTangents:!!Y.attributes.tangent&&(Vt||v),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!Y.attributes.uv&&(Kt||Z),fog:!!X,useFog:S.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:rt,skinning:O.isSkinnedMesh===!0,morphTargets:Y.morphAttributes.position!==void 0,morphNormals:Y.morphAttributes.normal!==void 0,morphColors:Y.morphAttributes.color!==void 0,morphTargetsCount:Mt,morphTextureStride:nt,numDirLights:g.directional.length,numPointLights:g.point.length,numSpotLights:g.spot.length,numSpotLightMaps:g.spotLightMap.length,numRectAreaLights:g.rectArea.length,numHemiLights:g.hemi.length,numDirLightShadows:g.directionalShadowMap.length,numPointLightShadows:g.pointShadowMap.length,numSpotLightShadows:g.spotShadowMap.length,numSpotLightShadowsWithMaps:g.numSpotLightShadowsWithMaps,numLightProbes:g.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:r.shadowMap.enabled&&A.length>0,shadowMapType:r.shadowMap.type,toneMapping:ce,decodeVideoTexture:Kt&&S.map.isVideoTexture===!0&&Jt.getTransfer(S.map.colorSpace)===re,decodeVideoTextureEmissive:oe&&S.emissiveMap.isVideoTexture===!0&&Jt.getTransfer(S.emissiveMap.colorSpace)===re,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===An,flipSided:S.side===Oe,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ft&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ft&&S.extensions.multiDraw===!0||Rt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Ae.vertexUv1s=l.has(1),Ae.vertexUv2s=l.has(2),Ae.vertexUv3s=l.has(3),l.clear(),Ae}function f(S){const g=[];if(S.shaderID?g.push(S.shaderID):(g.push(S.customVertexShaderID),g.push(S.customFragmentShaderID)),S.defines!==void 0)for(const A in S.defines)g.push(A),g.push(S.defines[A]);return S.isRawShaderMaterial===!1&&(E(g,S),w(g,S),g.push(r.outputColorSpace)),g.push(S.customProgramCacheKey),g.join()}function E(S,g){S.push(g.precision),S.push(g.outputColorSpace),S.push(g.envMapMode),S.push(g.envMapCubeUVHeight),S.push(g.mapUv),S.push(g.alphaMapUv),S.push(g.lightMapUv),S.push(g.aoMapUv),S.push(g.bumpMapUv),S.push(g.normalMapUv),S.push(g.displacementMapUv),S.push(g.emissiveMapUv),S.push(g.metalnessMapUv),S.push(g.roughnessMapUv),S.push(g.anisotropyMapUv),S.push(g.clearcoatMapUv),S.push(g.clearcoatNormalMapUv),S.push(g.clearcoatRoughnessMapUv),S.push(g.iridescenceMapUv),S.push(g.iridescenceThicknessMapUv),S.push(g.sheenColorMapUv),S.push(g.sheenRoughnessMapUv),S.push(g.specularMapUv),S.push(g.specularColorMapUv),S.push(g.specularIntensityMapUv),S.push(g.transmissionMapUv),S.push(g.thicknessMapUv),S.push(g.combine),S.push(g.fogExp2),S.push(g.sizeAttenuation),S.push(g.morphTargetsCount),S.push(g.morphAttributeCount),S.push(g.numDirLights),S.push(g.numPointLights),S.push(g.numSpotLights),S.push(g.numSpotLightMaps),S.push(g.numHemiLights),S.push(g.numRectAreaLights),S.push(g.numDirLightShadows),S.push(g.numPointLightShadows),S.push(g.numSpotLightShadows),S.push(g.numSpotLightShadowsWithMaps),S.push(g.numLightProbes),S.push(g.shadowMapType),S.push(g.toneMapping),S.push(g.numClippingPlanes),S.push(g.numClipIntersection),S.push(g.depthPacking)}function w(S,g){a.disableAll(),g.supportsVertexTextures&&a.enable(0),g.instancing&&a.enable(1),g.instancingColor&&a.enable(2),g.instancingMorph&&a.enable(3),g.matcap&&a.enable(4),g.envMap&&a.enable(5),g.normalMapObjectSpace&&a.enable(6),g.normalMapTangentSpace&&a.enable(7),g.clearcoat&&a.enable(8),g.iridescence&&a.enable(9),g.alphaTest&&a.enable(10),g.vertexColors&&a.enable(11),g.vertexAlphas&&a.enable(12),g.vertexUv1s&&a.enable(13),g.vertexUv2s&&a.enable(14),g.vertexUv3s&&a.enable(15),g.vertexTangents&&a.enable(16),g.anisotropy&&a.enable(17),g.alphaHash&&a.enable(18),g.batching&&a.enable(19),g.dispersion&&a.enable(20),g.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),g.fog&&a.enable(0),g.useFog&&a.enable(1),g.flatShading&&a.enable(2),g.logarithmicDepthBuffer&&a.enable(3),g.reverseDepthBuffer&&a.enable(4),g.skinning&&a.enable(5),g.morphTargets&&a.enable(6),g.morphNormals&&a.enable(7),g.morphColors&&a.enable(8),g.premultipliedAlpha&&a.enable(9),g.shadowMapEnabled&&a.enable(10),g.doubleSided&&a.enable(11),g.flipSided&&a.enable(12),g.useDepthPacking&&a.enable(13),g.dithering&&a.enable(14),g.transmission&&a.enable(15),g.sheen&&a.enable(16),g.opaque&&a.enable(17),g.pointsUvs&&a.enable(18),g.decodeVideoTexture&&a.enable(19),g.decodeVideoTextureEmissive&&a.enable(20),g.alphaToCoverage&&a.enable(21),S.push(a.mask)}function y(S){const g=_[S.type];let A;if(g){const B=mn[g];A=Ih.clone(B.uniforms)}else A=S.uniforms;return A}function P(S,g){let A;for(let B=0,O=u.length;B<O;B++){const X=u[B];if(X.cacheKey===g){A=X,++A.usedTimes;break}}return A===void 0&&(A=new l_(r,g,S,s),u.push(A)),A}function C(S){if(--S.usedTimes===0){const g=u.indexOf(S);u[g]=u[u.length-1],u.pop(),S.destroy()}}function T(S){c.remove(S)}function R(){c.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:y,acquireProgram:P,releaseProgram:C,releaseShaderCache:T,programs:u,dispose:R}}function p_(){let r=new WeakMap;function t(o){return r.has(o)}function e(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function n(o){r.delete(o)}function i(o,a,c){r.get(o)[a]=c}function s(){r=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:s}}function m_(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.z!==t.z?r.z-t.z:r.id-t.id}function Dc(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function Lc(){const r=[];let t=0;const e=[],n=[],i=[];function s(){t=0,e.length=0,n.length=0,i.length=0}function o(h,d,p,_,x,m){let f=r[t];return f===void 0?(f={id:h.id,object:h,geometry:d,material:p,groupOrder:_,renderOrder:h.renderOrder,z:x,group:m},r[t]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=p,f.groupOrder=_,f.renderOrder=h.renderOrder,f.z=x,f.group=m),t++,f}function a(h,d,p,_,x,m){const f=o(h,d,p,_,x,m);p.transmission>0?n.push(f):p.transparent===!0?i.push(f):e.push(f)}function c(h,d,p,_,x,m){const f=o(h,d,p,_,x,m);p.transmission>0?n.unshift(f):p.transparent===!0?i.unshift(f):e.unshift(f)}function l(h,d){e.length>1&&e.sort(h||m_),n.length>1&&n.sort(d||Dc),i.length>1&&i.sort(d||Dc)}function u(){for(let h=t,d=r.length;h<d;h++){const p=r[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:i,init:s,push:a,unshift:c,finish:u,sort:l}}function __(){let r=new WeakMap;function t(n,i){const s=r.get(n);let o;return s===void 0?(o=new Lc,r.set(n,[o])):i>=s.length?(o=new Lc,s.push(o)):o=s[i],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function g_(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new Xt};break;case"SpotLight":e={position:new L,direction:new L,color:new Xt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new Xt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new Xt,groundColor:new Xt};break;case"RectAreaLight":e={color:new Xt,position:new L,halfWidth:new L,halfHeight:new L};break}return r[t.id]=e,e}}}function v_(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Nt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Nt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Nt,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}let x_=0;function y_(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function M_(r){const t=new g_,e=v_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new L);const i=new L,s=new ie,o=new ie;function a(l){let u=0,h=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,_=0,x=0,m=0,f=0,E=0,w=0,y=0,P=0,C=0,T=0;l.sort(y_);for(let S=0,g=l.length;S<g;S++){const A=l[S],B=A.color,O=A.intensity,X=A.distance,Y=A.shadow&&A.shadow.map?A.shadow.map.texture:null;if(A.isAmbientLight)u+=B.r*O,h+=B.g*O,d+=B.b*O;else if(A.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(A.sh.coefficients[q],O);T++}else if(A.isDirectionalLight){const q=t.get(A);if(q.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const J=A.shadow,G=e.get(A);G.shadowIntensity=J.intensity,G.shadowBias=J.bias,G.shadowNormalBias=J.normalBias,G.shadowRadius=J.radius,G.shadowMapSize=J.mapSize,n.directionalShadow[p]=G,n.directionalShadowMap[p]=Y,n.directionalShadowMatrix[p]=A.shadow.matrix,E++}n.directional[p]=q,p++}else if(A.isSpotLight){const q=t.get(A);q.position.setFromMatrixPosition(A.matrixWorld),q.color.copy(B).multiplyScalar(O),q.distance=X,q.coneCos=Math.cos(A.angle),q.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),q.decay=A.decay,n.spot[x]=q;const J=A.shadow;if(A.map&&(n.spotLightMap[P]=A.map,P++,J.updateMatrices(A),A.castShadow&&C++),n.spotLightMatrix[x]=J.matrix,A.castShadow){const G=e.get(A);G.shadowIntensity=J.intensity,G.shadowBias=J.bias,G.shadowNormalBias=J.normalBias,G.shadowRadius=J.radius,G.shadowMapSize=J.mapSize,n.spotShadow[x]=G,n.spotShadowMap[x]=Y,y++}x++}else if(A.isRectAreaLight){const q=t.get(A);q.color.copy(B).multiplyScalar(O),q.halfWidth.set(A.width*.5,0,0),q.halfHeight.set(0,A.height*.5,0),n.rectArea[m]=q,m++}else if(A.isPointLight){const q=t.get(A);if(q.color.copy(A.color).multiplyScalar(A.intensity),q.distance=A.distance,q.decay=A.decay,A.castShadow){const J=A.shadow,G=e.get(A);G.shadowIntensity=J.intensity,G.shadowBias=J.bias,G.shadowNormalBias=J.normalBias,G.shadowRadius=J.radius,G.shadowMapSize=J.mapSize,G.shadowCameraNear=J.camera.near,G.shadowCameraFar=J.camera.far,n.pointShadow[_]=G,n.pointShadowMap[_]=Y,n.pointShadowMatrix[_]=A.shadow.matrix,w++}n.point[_]=q,_++}else if(A.isHemisphereLight){const q=t.get(A);q.skyColor.copy(A.color).multiplyScalar(O),q.groundColor.copy(A.groundColor).multiplyScalar(O),n.hemi[f]=q,f++}}m>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const R=n.hash;(R.directionalLength!==p||R.pointLength!==_||R.spotLength!==x||R.rectAreaLength!==m||R.hemiLength!==f||R.numDirectionalShadows!==E||R.numPointShadows!==w||R.numSpotShadows!==y||R.numSpotMaps!==P||R.numLightProbes!==T)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=m,n.point.length=_,n.hemi.length=f,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=y+P-C,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=T,R.directionalLength=p,R.pointLength=_,R.spotLength=x,R.rectAreaLength=m,R.hemiLength=f,R.numDirectionalShadows=E,R.numPointShadows=w,R.numSpotShadows=y,R.numSpotMaps=P,R.numLightProbes=T,n.version=x_++)}function c(l,u){let h=0,d=0,p=0,_=0,x=0;const m=u.matrixWorldInverse;for(let f=0,E=l.length;f<E;f++){const w=l[f];if(w.isDirectionalLight){const y=n.directional[h];y.direction.setFromMatrixPosition(w.matrixWorld),i.setFromMatrixPosition(w.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(m),h++}else if(w.isSpotLight){const y=n.spot[p];y.position.setFromMatrixPosition(w.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(w.matrixWorld),i.setFromMatrixPosition(w.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(m),p++}else if(w.isRectAreaLight){const y=n.rectArea[_];y.position.setFromMatrixPosition(w.matrixWorld),y.position.applyMatrix4(m),o.identity(),s.copy(w.matrixWorld),s.premultiply(m),o.extractRotation(s),y.halfWidth.set(w.width*.5,0,0),y.halfHeight.set(0,w.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),_++}else if(w.isPointLight){const y=n.point[d];y.position.setFromMatrixPosition(w.matrixWorld),y.position.applyMatrix4(m),d++}else if(w.isHemisphereLight){const y=n.hemi[x];y.direction.setFromMatrixPosition(w.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:n}}function Uc(r){const t=new M_(r),e=[],n=[];function i(u){l.camera=u,e.length=0,n.length=0}function s(u){e.push(u)}function o(u){n.push(u)}function a(){t.setup(e)}function c(u){t.setupView(e,u)}const l={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:a,setupLightsView:c,pushLight:s,pushShadow:o}}function S_(r){let t=new WeakMap;function e(i,s=0){const o=t.get(i);let a;return o===void 0?(a=new Uc(r),t.set(i,[a])):s>=o.length?(a=new Uc(r),o.push(a)):a=o[s],a}function n(){t=new WeakMap}return{get:e,dispose:n}}const w_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,E_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function b_(r,t,e){let n=new ia;const i=new Nt,s=new Nt,o=new ue,a=new Wh({depthPacking:ku}),c=new Xh,l={},u=e.maxTextureSize,h={[Xn]:Oe,[Oe]:Xn,[An]:An},d=new qn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Nt},radius:{value:4}},vertexShader:w_,fragmentShader:E_}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const _=new ke;_.setAttribute("position",new Xe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new st(_,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=il;let f=this.type;this.render=function(C,T,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const S=r.getRenderTarget(),g=r.getActiveCubeFace(),A=r.getActiveMipmapLevel(),B=r.state;B.setBlending(Gn),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const O=f!==Tn&&this.type===Tn,X=f===Tn&&this.type!==Tn;for(let Y=0,q=C.length;Y<q;Y++){const J=C[Y],G=J.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",J,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;i.copy(G.mapSize);const ot=G.getFrameExtents();if(i.multiply(ot),s.copy(G.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(s.x=Math.floor(u/ot.x),i.x=s.x*ot.x,G.mapSize.x=s.x),i.y>u&&(s.y=Math.floor(u/ot.y),i.y=s.y*ot.y,G.mapSize.y=s.y)),G.map===null||O===!0||X===!0){const Mt=this.type!==Tn?{minFilter:ve,magFilter:ve}:{};G.map!==null&&G.map.dispose(),G.map=new ui(i.x,i.y,Mt),G.map.texture.name=J.name+".shadowMap",G.camera.updateProjectionMatrix()}r.setRenderTarget(G.map),r.clear();const at=G.getViewportCount();for(let Mt=0;Mt<at;Mt++){const nt=G.getViewport(Mt);o.set(s.x*nt.x,s.y*nt.y,s.x*nt.z,s.y*nt.w),B.viewport(o),G.updateMatrices(J,Mt),n=G.getFrustum(),y(T,R,G.camera,J,this.type)}G.isPointLightShadow!==!0&&this.type===Tn&&E(G,R),G.needsUpdate=!1}f=this.type,m.needsUpdate=!1,r.setRenderTarget(S,g,A)};function E(C,T){const R=t.update(x);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new ui(i.x,i.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,r.setRenderTarget(C.mapPass),r.clear(),r.renderBufferDirect(T,null,R,d,x,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,r.setRenderTarget(C.map),r.clear(),r.renderBufferDirect(T,null,R,p,x,null)}function w(C,T,R,S){let g=null;const A=R.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(A!==void 0)g=A;else if(g=R.isPointLight===!0?c:a,r.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const B=g.uuid,O=T.uuid;let X=l[B];X===void 0&&(X={},l[B]=X);let Y=X[O];Y===void 0&&(Y=g.clone(),X[O]=Y,T.addEventListener("dispose",P)),g=Y}if(g.visible=T.visible,g.wireframe=T.wireframe,S===Tn?g.side=T.shadowSide!==null?T.shadowSide:T.side:g.side=T.shadowSide!==null?T.shadowSide:h[T.side],g.alphaMap=T.alphaMap,g.alphaTest=T.alphaTest,g.map=T.map,g.clipShadows=T.clipShadows,g.clippingPlanes=T.clippingPlanes,g.clipIntersection=T.clipIntersection,g.displacementMap=T.displacementMap,g.displacementScale=T.displacementScale,g.displacementBias=T.displacementBias,g.wireframeLinewidth=T.wireframeLinewidth,g.linewidth=T.linewidth,R.isPointLight===!0&&g.isMeshDistanceMaterial===!0){const B=r.properties.get(g);B.light=R}return g}function y(C,T,R,S,g){if(C.visible===!1)return;if(C.layers.test(T.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&g===Tn)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,C.matrixWorld);const O=t.update(C),X=C.material;if(Array.isArray(X)){const Y=O.groups;for(let q=0,J=Y.length;q<J;q++){const G=Y[q],ot=X[G.materialIndex];if(ot&&ot.visible){const at=w(C,ot,S,g);C.onBeforeShadow(r,C,T,R,O,at,G),r.renderBufferDirect(R,null,O,at,C,G),C.onAfterShadow(r,C,T,R,O,at,G)}}}else if(X.visible){const Y=w(C,X,S,g);C.onBeforeShadow(r,C,T,R,O,Y,null),r.renderBufferDirect(R,null,O,Y,C,null),C.onAfterShadow(r,C,T,R,O,Y,null)}}const B=C.children;for(let O=0,X=B.length;O<X;O++)y(B[O],T,R,S,g)}function P(C){C.target.removeEventListener("dispose",P);for(const R in l){const S=l[R],g=C.target.uuid;g in S&&(S[g].dispose(),delete S[g])}}}const T_={[no]:io,[ro]:ao,[so]:co,[zi]:oo,[io]:no,[ao]:ro,[co]:so,[oo]:zi};function A_(r,t){function e(){let U=!1;const lt=new ue;let W=null;const Z=new ue(0,0,0,0);return{setMask:function(pt){W!==pt&&!U&&(r.colorMask(pt,pt,pt,pt),W=pt)},setLocked:function(pt){U=pt},setClear:function(pt,ft,Ft,ce,Ae){Ae===!0&&(pt*=ce,ft*=ce,Ft*=ce),lt.set(pt,ft,Ft,ce),Z.equals(lt)===!1&&(r.clearColor(pt,ft,Ft,ce),Z.copy(lt))},reset:function(){U=!1,W=null,Z.set(-1,0,0,0)}}}function n(){let U=!1,lt=!1,W=null,Z=null,pt=null;return{setReversed:function(ft){if(lt!==ft){const Ft=t.get("EXT_clip_control");lt?Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.ZERO_TO_ONE_EXT):Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.NEGATIVE_ONE_TO_ONE_EXT);const ce=pt;pt=null,this.setClear(ce)}lt=ft},getReversed:function(){return lt},setTest:function(ft){ft?j(r.DEPTH_TEST):rt(r.DEPTH_TEST)},setMask:function(ft){W!==ft&&!U&&(r.depthMask(ft),W=ft)},setFunc:function(ft){if(lt&&(ft=T_[ft]),Z!==ft){switch(ft){case no:r.depthFunc(r.NEVER);break;case io:r.depthFunc(r.ALWAYS);break;case ro:r.depthFunc(r.LESS);break;case zi:r.depthFunc(r.LEQUAL);break;case so:r.depthFunc(r.EQUAL);break;case oo:r.depthFunc(r.GEQUAL);break;case ao:r.depthFunc(r.GREATER);break;case co:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}Z=ft}},setLocked:function(ft){U=ft},setClear:function(ft){pt!==ft&&(lt&&(ft=1-ft),r.clearDepth(ft),pt=ft)},reset:function(){U=!1,W=null,Z=null,pt=null,lt=!1}}}function i(){let U=!1,lt=null,W=null,Z=null,pt=null,ft=null,Ft=null,ce=null,Ae=null;return{setTest:function(ee){U||(ee?j(r.STENCIL_TEST):rt(r.STENCIL_TEST))},setMask:function(ee){lt!==ee&&!U&&(r.stencilMask(ee),lt=ee)},setFunc:function(ee,rn,yn){(W!==ee||Z!==rn||pt!==yn)&&(r.stencilFunc(ee,rn,yn),W=ee,Z=rn,pt=yn)},setOp:function(ee,rn,yn){(ft!==ee||Ft!==rn||ce!==yn)&&(r.stencilOp(ee,rn,yn),ft=ee,Ft=rn,ce=yn)},setLocked:function(ee){U=ee},setClear:function(ee){Ae!==ee&&(r.clearStencil(ee),Ae=ee)},reset:function(){U=!1,lt=null,W=null,Z=null,pt=null,ft=null,Ft=null,ce=null,Ae=null}}}const s=new e,o=new n,a=new i,c=new WeakMap,l=new WeakMap;let u={},h={},d=new WeakMap,p=[],_=null,x=!1,m=null,f=null,E=null,w=null,y=null,P=null,C=null,T=new Xt(0,0,0),R=0,S=!1,g=null,A=null,B=null,O=null,X=null;const Y=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let q=!1,J=0;const G=r.getParameter(r.VERSION);G.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(G)[1]),q=J>=1):G.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),q=J>=2);let ot=null,at={};const Mt=r.getParameter(r.SCISSOR_BOX),nt=r.getParameter(r.VIEWPORT),ht=new ue().fromArray(Mt),I=new ue().fromArray(nt);function V(U,lt,W,Z){const pt=new Uint8Array(4),ft=r.createTexture();r.bindTexture(U,ft),r.texParameteri(U,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(U,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Ft=0;Ft<W;Ft++)U===r.TEXTURE_3D||U===r.TEXTURE_2D_ARRAY?r.texImage3D(lt,0,r.RGBA,1,1,Z,0,r.RGBA,r.UNSIGNED_BYTE,pt):r.texImage2D(lt+Ft,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,pt);return ft}const it={};it[r.TEXTURE_2D]=V(r.TEXTURE_2D,r.TEXTURE_2D,1),it[r.TEXTURE_CUBE_MAP]=V(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),it[r.TEXTURE_2D_ARRAY]=V(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),it[r.TEXTURE_3D]=V(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),j(r.DEPTH_TEST),o.setFunc(zi),Gt(!1),Vt(Ta),j(r.CULL_FACE),D(Gn);function j(U){u[U]!==!0&&(r.enable(U),u[U]=!0)}function rt(U){u[U]!==!1&&(r.disable(U),u[U]=!1)}function mt(U,lt){return h[U]!==lt?(r.bindFramebuffer(U,lt),h[U]=lt,U===r.DRAW_FRAMEBUFFER&&(h[r.FRAMEBUFFER]=lt),U===r.FRAMEBUFFER&&(h[r.DRAW_FRAMEBUFFER]=lt),!0):!1}function Rt(U,lt){let W=p,Z=!1;if(U){W=d.get(lt),W===void 0&&(W=[],d.set(lt,W));const pt=U.textures;if(W.length!==pt.length||W[0]!==r.COLOR_ATTACHMENT0){for(let ft=0,Ft=pt.length;ft<Ft;ft++)W[ft]=r.COLOR_ATTACHMENT0+ft;W.length=pt.length,Z=!0}}else W[0]!==r.BACK&&(W[0]=r.BACK,Z=!0);Z&&r.drawBuffers(W)}function Kt(U){return _!==U?(r.useProgram(U),_=U,!0):!1}const qt={[ri]:r.FUNC_ADD,[hu]:r.FUNC_SUBTRACT,[du]:r.FUNC_REVERSE_SUBTRACT};qt[fu]=r.MIN,qt[pu]=r.MAX;const he={[mu]:r.ZERO,[_u]:r.ONE,[gu]:r.SRC_COLOR,[to]:r.SRC_ALPHA,[wu]:r.SRC_ALPHA_SATURATE,[Mu]:r.DST_COLOR,[xu]:r.DST_ALPHA,[vu]:r.ONE_MINUS_SRC_COLOR,[eo]:r.ONE_MINUS_SRC_ALPHA,[Su]:r.ONE_MINUS_DST_COLOR,[yu]:r.ONE_MINUS_DST_ALPHA,[Eu]:r.CONSTANT_COLOR,[bu]:r.ONE_MINUS_CONSTANT_COLOR,[Tu]:r.CONSTANT_ALPHA,[Au]:r.ONE_MINUS_CONSTANT_ALPHA};function D(U,lt,W,Z,pt,ft,Ft,ce,Ae,ee){if(U===Gn){x===!0&&(rt(r.BLEND),x=!1);return}if(x===!1&&(j(r.BLEND),x=!0),U!==uu){if(U!==m||ee!==S){if((f!==ri||y!==ri)&&(r.blendEquation(r.FUNC_ADD),f=ri,y=ri),ee)switch(U){case Oi:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Aa:r.blendFunc(r.ONE,r.ONE);break;case Ca:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Ra:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case Oi:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Aa:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case Ca:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Ra:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}E=null,w=null,P=null,C=null,T.set(0,0,0),R=0,m=U,S=ee}return}pt=pt||lt,ft=ft||W,Ft=Ft||Z,(lt!==f||pt!==y)&&(r.blendEquationSeparate(qt[lt],qt[pt]),f=lt,y=pt),(W!==E||Z!==w||ft!==P||Ft!==C)&&(r.blendFuncSeparate(he[W],he[Z],he[ft],he[Ft]),E=W,w=Z,P=ft,C=Ft),(ce.equals(T)===!1||Ae!==R)&&(r.blendColor(ce.r,ce.g,ce.b,Ae),T.copy(ce),R=Ae),m=U,S=!1}function $e(U,lt){U.side===An?rt(r.CULL_FACE):j(r.CULL_FACE);let W=U.side===Oe;lt&&(W=!W),Gt(W),U.blending===Oi&&U.transparent===!1?D(Gn):D(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),s.setMask(U.colorWrite);const Z=U.stencilWrite;a.setTest(Z),Z&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),oe(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?j(r.SAMPLE_ALPHA_TO_COVERAGE):rt(r.SAMPLE_ALPHA_TO_COVERAGE)}function Gt(U){g!==U&&(U?r.frontFace(r.CW):r.frontFace(r.CCW),g=U)}function Vt(U){U!==au?(j(r.CULL_FACE),U!==A&&(U===Ta?r.cullFace(r.BACK):U===cu?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):rt(r.CULL_FACE),A=U}function At(U){U!==B&&(q&&r.lineWidth(U),B=U)}function oe(U,lt,W){U?(j(r.POLYGON_OFFSET_FILL),(O!==lt||X!==W)&&(r.polygonOffset(lt,W),O=lt,X=W)):rt(r.POLYGON_OFFSET_FILL)}function bt(U){U?j(r.SCISSOR_TEST):rt(r.SCISSOR_TEST)}function b(U){U===void 0&&(U=r.TEXTURE0+Y-1),ot!==U&&(r.activeTexture(U),ot=U)}function v(U,lt,W){W===void 0&&(ot===null?W=r.TEXTURE0+Y-1:W=ot);let Z=at[W];Z===void 0&&(Z={type:void 0,texture:void 0},at[W]=Z),(Z.type!==U||Z.texture!==lt)&&(ot!==W&&(r.activeTexture(W),ot=W),r.bindTexture(U,lt||it[U]),Z.type=U,Z.texture=lt)}function k(){const U=at[ot];U!==void 0&&U.type!==void 0&&(r.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function K(){try{r.compressedTexImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Q(){try{r.compressedTexImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function $(){try{r.texSubImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function St(){try{r.texSubImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function dt(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function gt(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Yt(){try{r.texStorage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function et(){try{r.texStorage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function vt(){try{r.texImage2D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function It(){try{r.texImage3D.apply(r,arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Dt(U){ht.equals(U)===!1&&(r.scissor(U.x,U.y,U.z,U.w),ht.copy(U))}function xt(U){I.equals(U)===!1&&(r.viewport(U.x,U.y,U.z,U.w),I.copy(U))}function Wt(U,lt){let W=l.get(lt);W===void 0&&(W=new WeakMap,l.set(lt,W));let Z=W.get(U);Z===void 0&&(Z=r.getUniformBlockIndex(lt,U.name),W.set(U,Z))}function Bt(U,lt){const Z=l.get(lt).get(U);c.get(lt)!==Z&&(r.uniformBlockBinding(lt,Z,U.__bindingPointIndex),c.set(lt,Z))}function se(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),u={},ot=null,at={},h={},d=new WeakMap,p=[],_=null,x=!1,m=null,f=null,E=null,w=null,y=null,P=null,C=null,T=new Xt(0,0,0),R=0,S=!1,g=null,A=null,B=null,O=null,X=null,ht.set(0,0,r.canvas.width,r.canvas.height),I.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:j,disable:rt,bindFramebuffer:mt,drawBuffers:Rt,useProgram:Kt,setBlending:D,setMaterial:$e,setFlipSided:Gt,setCullFace:Vt,setLineWidth:At,setPolygonOffset:oe,setScissorTest:bt,activeTexture:b,bindTexture:v,unbindTexture:k,compressedTexImage2D:K,compressedTexImage3D:Q,texImage2D:vt,texImage3D:It,updateUBOMapping:Wt,uniformBlockBinding:Bt,texStorage2D:Yt,texStorage3D:et,texSubImage2D:$,texSubImage3D:St,compressedTexSubImage2D:dt,compressedTexSubImage3D:gt,scissor:Dt,viewport:xt,reset:se}}function C_(r,t,e,n,i,s,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Nt,u=new WeakMap;let h;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(b,v){return p?new OffscreenCanvas(b,v):fr("canvas")}function x(b,v,k){let K=1;const Q=bt(b);if((Q.width>k||Q.height>k)&&(K=k/Math.max(Q.width,Q.height)),K<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const $=Math.floor(K*Q.width),St=Math.floor(K*Q.height);h===void 0&&(h=_($,St));const dt=v?_($,St):h;return dt.width=$,dt.height=St,dt.getContext("2d").drawImage(b,0,0,$,St),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+$+"x"+St+")."),dt}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),b;return b}function m(b){return b.generateMipmaps}function f(b){r.generateMipmap(b)}function E(b){return b.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:b.isWebGL3DRenderTarget?r.TEXTURE_3D:b.isWebGLArrayRenderTarget||b.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function w(b,v,k,K,Q=!1){if(b!==null){if(r[b]!==void 0)return r[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let $=v;if(v===r.RED&&(k===r.FLOAT&&($=r.R32F),k===r.HALF_FLOAT&&($=r.R16F),k===r.UNSIGNED_BYTE&&($=r.R8)),v===r.RED_INTEGER&&(k===r.UNSIGNED_BYTE&&($=r.R8UI),k===r.UNSIGNED_SHORT&&($=r.R16UI),k===r.UNSIGNED_INT&&($=r.R32UI),k===r.BYTE&&($=r.R8I),k===r.SHORT&&($=r.R16I),k===r.INT&&($=r.R32I)),v===r.RG&&(k===r.FLOAT&&($=r.RG32F),k===r.HALF_FLOAT&&($=r.RG16F),k===r.UNSIGNED_BYTE&&($=r.RG8)),v===r.RG_INTEGER&&(k===r.UNSIGNED_BYTE&&($=r.RG8UI),k===r.UNSIGNED_SHORT&&($=r.RG16UI),k===r.UNSIGNED_INT&&($=r.RG32UI),k===r.BYTE&&($=r.RG8I),k===r.SHORT&&($=r.RG16I),k===r.INT&&($=r.RG32I)),v===r.RGB_INTEGER&&(k===r.UNSIGNED_BYTE&&($=r.RGB8UI),k===r.UNSIGNED_SHORT&&($=r.RGB16UI),k===r.UNSIGNED_INT&&($=r.RGB32UI),k===r.BYTE&&($=r.RGB8I),k===r.SHORT&&($=r.RGB16I),k===r.INT&&($=r.RGB32I)),v===r.RGBA_INTEGER&&(k===r.UNSIGNED_BYTE&&($=r.RGBA8UI),k===r.UNSIGNED_SHORT&&($=r.RGBA16UI),k===r.UNSIGNED_INT&&($=r.RGBA32UI),k===r.BYTE&&($=r.RGBA8I),k===r.SHORT&&($=r.RGBA16I),k===r.INT&&($=r.RGBA32I)),v===r.RGB&&k===r.UNSIGNED_INT_5_9_9_9_REV&&($=r.RGB9_E5),v===r.RGBA){const St=Q?rs:Jt.getTransfer(K);k===r.FLOAT&&($=r.RGBA32F),k===r.HALF_FLOAT&&($=r.RGBA16F),k===r.UNSIGNED_BYTE&&($=St===re?r.SRGB8_ALPHA8:r.RGBA8),k===r.UNSIGNED_SHORT_4_4_4_4&&($=r.RGBA4),k===r.UNSIGNED_SHORT_5_5_5_1&&($=r.RGB5_A1)}return($===r.R16F||$===r.R32F||$===r.RG16F||$===r.RG32F||$===r.RGBA16F||$===r.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function y(b,v){let k;return b?v===null||v===ci||v===Vi?k=r.DEPTH24_STENCIL8:v===_n?k=r.DEPTH32F_STENCIL8:v===hr&&(k=r.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===ci||v===Vi?k=r.DEPTH_COMPONENT24:v===_n?k=r.DEPTH_COMPONENT32F:v===hr&&(k=r.DEPTH_COMPONENT16),k}function P(b,v){return m(b)===!0||b.isFramebufferTexture&&b.minFilter!==ve&&b.minFilter!==en?Math.log2(Math.max(v.width,v.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?v.mipmaps.length:1}function C(b){const v=b.target;v.removeEventListener("dispose",C),R(v),v.isVideoTexture&&u.delete(v)}function T(b){const v=b.target;v.removeEventListener("dispose",T),g(v)}function R(b){const v=n.get(b);if(v.__webglInit===void 0)return;const k=b.source,K=d.get(k);if(K){const Q=K[v.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&S(b),Object.keys(K).length===0&&d.delete(k)}n.remove(b)}function S(b){const v=n.get(b);r.deleteTexture(v.__webglTexture);const k=b.source,K=d.get(k);delete K[v.__cacheKey],o.memory.textures--}function g(b){const v=n.get(b);if(b.depthTexture&&(b.depthTexture.dispose(),n.remove(b.depthTexture)),b.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(v.__webglFramebuffer[K]))for(let Q=0;Q<v.__webglFramebuffer[K].length;Q++)r.deleteFramebuffer(v.__webglFramebuffer[K][Q]);else r.deleteFramebuffer(v.__webglFramebuffer[K]);v.__webglDepthbuffer&&r.deleteRenderbuffer(v.__webglDepthbuffer[K])}else{if(Array.isArray(v.__webglFramebuffer))for(let K=0;K<v.__webglFramebuffer.length;K++)r.deleteFramebuffer(v.__webglFramebuffer[K]);else r.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&r.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&r.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let K=0;K<v.__webglColorRenderbuffer.length;K++)v.__webglColorRenderbuffer[K]&&r.deleteRenderbuffer(v.__webglColorRenderbuffer[K]);v.__webglDepthRenderbuffer&&r.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const k=b.textures;for(let K=0,Q=k.length;K<Q;K++){const $=n.get(k[K]);$.__webglTexture&&(r.deleteTexture($.__webglTexture),o.memory.textures--),n.remove(k[K])}n.remove(b)}let A=0;function B(){A=0}function O(){const b=A;return b>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+i.maxTextures),A+=1,b}function X(b){const v=[];return v.push(b.wrapS),v.push(b.wrapT),v.push(b.wrapR||0),v.push(b.magFilter),v.push(b.minFilter),v.push(b.anisotropy),v.push(b.internalFormat),v.push(b.format),v.push(b.type),v.push(b.generateMipmaps),v.push(b.premultiplyAlpha),v.push(b.flipY),v.push(b.unpackAlignment),v.push(b.colorSpace),v.join()}function Y(b,v){const k=n.get(b);if(b.isVideoTexture&&At(b),b.isRenderTargetTexture===!1&&b.version>0&&k.__version!==b.version){const K=b.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{I(k,b,v);return}}e.bindTexture(r.TEXTURE_2D,k.__webglTexture,r.TEXTURE0+v)}function q(b,v){const k=n.get(b);if(b.version>0&&k.__version!==b.version){I(k,b,v);return}e.bindTexture(r.TEXTURE_2D_ARRAY,k.__webglTexture,r.TEXTURE0+v)}function J(b,v){const k=n.get(b);if(b.version>0&&k.__version!==b.version){I(k,b,v);return}e.bindTexture(r.TEXTURE_3D,k.__webglTexture,r.TEXTURE0+v)}function G(b,v){const k=n.get(b);if(b.version>0&&k.__version!==b.version){V(k,b,v);return}e.bindTexture(r.TEXTURE_CUBE_MAP,k.__webglTexture,r.TEXTURE0+v)}const ot={[ho]:r.REPEAT,[Ve]:r.CLAMP_TO_EDGE,[fo]:r.MIRRORED_REPEAT},at={[ve]:r.NEAREST,[Ou]:r.NEAREST_MIPMAP_NEAREST,[Mr]:r.NEAREST_MIPMAP_LINEAR,[en]:r.LINEAR,[xs]:r.LINEAR_MIPMAP_NEAREST,[oi]:r.LINEAR_MIPMAP_LINEAR},Mt={[Hu]:r.NEVER,[Yu]:r.ALWAYS,[Gu]:r.LESS,[_l]:r.LEQUAL,[Vu]:r.EQUAL,[qu]:r.GEQUAL,[Wu]:r.GREATER,[Xu]:r.NOTEQUAL};function nt(b,v){if(v.type===_n&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===en||v.magFilter===xs||v.magFilter===Mr||v.magFilter===oi||v.minFilter===en||v.minFilter===xs||v.minFilter===Mr||v.minFilter===oi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(b,r.TEXTURE_WRAP_S,ot[v.wrapS]),r.texParameteri(b,r.TEXTURE_WRAP_T,ot[v.wrapT]),(b===r.TEXTURE_3D||b===r.TEXTURE_2D_ARRAY)&&r.texParameteri(b,r.TEXTURE_WRAP_R,ot[v.wrapR]),r.texParameteri(b,r.TEXTURE_MAG_FILTER,at[v.magFilter]),r.texParameteri(b,r.TEXTURE_MIN_FILTER,at[v.minFilter]),v.compareFunction&&(r.texParameteri(b,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(b,r.TEXTURE_COMPARE_FUNC,Mt[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===ve||v.minFilter!==Mr&&v.minFilter!==oi||v.type===_n&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const k=t.get("EXT_texture_filter_anisotropic");r.texParameterf(b,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,i.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function ht(b,v){let k=!1;b.__webglInit===void 0&&(b.__webglInit=!0,v.addEventListener("dispose",C));const K=v.source;let Q=d.get(K);Q===void 0&&(Q={},d.set(K,Q));const $=X(v);if($!==b.__cacheKey){Q[$]===void 0&&(Q[$]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,k=!0),Q[$].usedTimes++;const St=Q[b.__cacheKey];St!==void 0&&(Q[b.__cacheKey].usedTimes--,St.usedTimes===0&&S(v)),b.__cacheKey=$,b.__webglTexture=Q[$].texture}return k}function I(b,v,k){let K=r.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(K=r.TEXTURE_2D_ARRAY),v.isData3DTexture&&(K=r.TEXTURE_3D);const Q=ht(b,v),$=v.source;e.bindTexture(K,b.__webglTexture,r.TEXTURE0+k);const St=n.get($);if($.version!==St.__version||Q===!0){e.activeTexture(r.TEXTURE0+k);const dt=Jt.getPrimaries(Jt.workingColorSpace),gt=v.colorSpace===zn?null:Jt.getPrimaries(v.colorSpace),Yt=v.colorSpace===zn||dt===gt?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,v.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,v.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Yt);let et=x(v.image,!1,i.maxTextureSize);et=oe(v,et);const vt=s.convert(v.format,v.colorSpace),It=s.convert(v.type);let Dt=w(v.internalFormat,vt,It,v.colorSpace,v.isVideoTexture);nt(K,v);let xt;const Wt=v.mipmaps,Bt=v.isVideoTexture!==!0,se=St.__version===void 0||Q===!0,U=$.dataReady,lt=P(v,et);if(v.isDepthTexture)Dt=y(v.format===Wi,v.type),se&&(Bt?e.texStorage2D(r.TEXTURE_2D,1,Dt,et.width,et.height):e.texImage2D(r.TEXTURE_2D,0,Dt,et.width,et.height,0,vt,It,null));else if(v.isDataTexture)if(Wt.length>0){Bt&&se&&e.texStorage2D(r.TEXTURE_2D,lt,Dt,Wt[0].width,Wt[0].height);for(let W=0,Z=Wt.length;W<Z;W++)xt=Wt[W],Bt?U&&e.texSubImage2D(r.TEXTURE_2D,W,0,0,xt.width,xt.height,vt,It,xt.data):e.texImage2D(r.TEXTURE_2D,W,Dt,xt.width,xt.height,0,vt,It,xt.data);v.generateMipmaps=!1}else Bt?(se&&e.texStorage2D(r.TEXTURE_2D,lt,Dt,et.width,et.height),U&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,et.width,et.height,vt,It,et.data)):e.texImage2D(r.TEXTURE_2D,0,Dt,et.width,et.height,0,vt,It,et.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Bt&&se&&e.texStorage3D(r.TEXTURE_2D_ARRAY,lt,Dt,Wt[0].width,Wt[0].height,et.depth);for(let W=0,Z=Wt.length;W<Z;W++)if(xt=Wt[W],v.format!==nn)if(vt!==null)if(Bt){if(U)if(v.layerUpdates.size>0){const pt=uc(xt.width,xt.height,v.format,v.type);for(const ft of v.layerUpdates){const Ft=xt.data.subarray(ft*pt/xt.data.BYTES_PER_ELEMENT,(ft+1)*pt/xt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,ft,xt.width,xt.height,1,vt,Ft)}v.clearLayerUpdates()}else e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,0,xt.width,xt.height,et.depth,vt,xt.data)}else e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,W,Dt,xt.width,xt.height,et.depth,0,xt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Bt?U&&e.texSubImage3D(r.TEXTURE_2D_ARRAY,W,0,0,0,xt.width,xt.height,et.depth,vt,It,xt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,W,Dt,xt.width,xt.height,et.depth,0,vt,It,xt.data)}else{Bt&&se&&e.texStorage2D(r.TEXTURE_2D,lt,Dt,Wt[0].width,Wt[0].height);for(let W=0,Z=Wt.length;W<Z;W++)xt=Wt[W],v.format!==nn?vt!==null?Bt?U&&e.compressedTexSubImage2D(r.TEXTURE_2D,W,0,0,xt.width,xt.height,vt,xt.data):e.compressedTexImage2D(r.TEXTURE_2D,W,Dt,xt.width,xt.height,0,xt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Bt?U&&e.texSubImage2D(r.TEXTURE_2D,W,0,0,xt.width,xt.height,vt,It,xt.data):e.texImage2D(r.TEXTURE_2D,W,Dt,xt.width,xt.height,0,vt,It,xt.data)}else if(v.isDataArrayTexture)if(Bt){if(se&&e.texStorage3D(r.TEXTURE_2D_ARRAY,lt,Dt,et.width,et.height,et.depth),U)if(v.layerUpdates.size>0){const W=uc(et.width,et.height,v.format,v.type);for(const Z of v.layerUpdates){const pt=et.data.subarray(Z*W/et.data.BYTES_PER_ELEMENT,(Z+1)*W/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,Z,et.width,et.height,1,vt,It,pt)}v.clearLayerUpdates()}else e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,vt,It,et.data)}else e.texImage3D(r.TEXTURE_2D_ARRAY,0,Dt,et.width,et.height,et.depth,0,vt,It,et.data);else if(v.isData3DTexture)Bt?(se&&e.texStorage3D(r.TEXTURE_3D,lt,Dt,et.width,et.height,et.depth),U&&e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,vt,It,et.data)):e.texImage3D(r.TEXTURE_3D,0,Dt,et.width,et.height,et.depth,0,vt,It,et.data);else if(v.isFramebufferTexture){if(se)if(Bt)e.texStorage2D(r.TEXTURE_2D,lt,Dt,et.width,et.height);else{let W=et.width,Z=et.height;for(let pt=0;pt<lt;pt++)e.texImage2D(r.TEXTURE_2D,pt,Dt,W,Z,0,vt,It,null),W>>=1,Z>>=1}}else if(Wt.length>0){if(Bt&&se){const W=bt(Wt[0]);e.texStorage2D(r.TEXTURE_2D,lt,Dt,W.width,W.height)}for(let W=0,Z=Wt.length;W<Z;W++)xt=Wt[W],Bt?U&&e.texSubImage2D(r.TEXTURE_2D,W,0,0,vt,It,xt):e.texImage2D(r.TEXTURE_2D,W,Dt,vt,It,xt);v.generateMipmaps=!1}else if(Bt){if(se){const W=bt(et);e.texStorage2D(r.TEXTURE_2D,lt,Dt,W.width,W.height)}U&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,vt,It,et)}else e.texImage2D(r.TEXTURE_2D,0,Dt,vt,It,et);m(v)&&f(K),St.__version=$.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function V(b,v,k){if(v.image.length!==6)return;const K=ht(b,v),Q=v.source;e.bindTexture(r.TEXTURE_CUBE_MAP,b.__webglTexture,r.TEXTURE0+k);const $=n.get(Q);if(Q.version!==$.__version||K===!0){e.activeTexture(r.TEXTURE0+k);const St=Jt.getPrimaries(Jt.workingColorSpace),dt=v.colorSpace===zn?null:Jt.getPrimaries(v.colorSpace),gt=v.colorSpace===zn||St===dt?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,v.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,v.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt);const Yt=v.isCompressedTexture||v.image[0].isCompressedTexture,et=v.image[0]&&v.image[0].isDataTexture,vt=[];for(let Z=0;Z<6;Z++)!Yt&&!et?vt[Z]=x(v.image[Z],!0,i.maxCubemapSize):vt[Z]=et?v.image[Z].image:v.image[Z],vt[Z]=oe(v,vt[Z]);const It=vt[0],Dt=s.convert(v.format,v.colorSpace),xt=s.convert(v.type),Wt=w(v.internalFormat,Dt,xt,v.colorSpace),Bt=v.isVideoTexture!==!0,se=$.__version===void 0||K===!0,U=Q.dataReady;let lt=P(v,It);nt(r.TEXTURE_CUBE_MAP,v);let W;if(Yt){Bt&&se&&e.texStorage2D(r.TEXTURE_CUBE_MAP,lt,Wt,It.width,It.height);for(let Z=0;Z<6;Z++){W=vt[Z].mipmaps;for(let pt=0;pt<W.length;pt++){const ft=W[pt];v.format!==nn?Dt!==null?Bt?U&&e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt,0,0,ft.width,ft.height,Dt,ft.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt,Wt,ft.width,ft.height,0,ft.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Bt?U&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt,0,0,ft.width,ft.height,Dt,xt,ft.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt,Wt,ft.width,ft.height,0,Dt,xt,ft.data)}}}else{if(W=v.mipmaps,Bt&&se){W.length>0&&lt++;const Z=bt(vt[0]);e.texStorage2D(r.TEXTURE_CUBE_MAP,lt,Wt,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(et){Bt?U&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,vt[Z].width,vt[Z].height,Dt,xt,vt[Z].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Wt,vt[Z].width,vt[Z].height,0,Dt,xt,vt[Z].data);for(let pt=0;pt<W.length;pt++){const Ft=W[pt].image[Z].image;Bt?U&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt+1,0,0,Ft.width,Ft.height,Dt,xt,Ft.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt+1,Wt,Ft.width,Ft.height,0,Dt,xt,Ft.data)}}else{Bt?U&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Dt,xt,vt[Z]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Wt,Dt,xt,vt[Z]);for(let pt=0;pt<W.length;pt++){const ft=W[pt];Bt?U&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt+1,0,0,Dt,xt,ft.image[Z]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Z,pt+1,Wt,Dt,xt,ft.image[Z])}}}m(v)&&f(r.TEXTURE_CUBE_MAP),$.__version=Q.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function it(b,v,k,K,Q,$){const St=s.convert(k.format,k.colorSpace),dt=s.convert(k.type),gt=w(k.internalFormat,St,dt,k.colorSpace),Yt=n.get(v),et=n.get(k);if(et.__renderTarget=v,!Yt.__hasExternalTextures){const vt=Math.max(1,v.width>>$),It=Math.max(1,v.height>>$);Q===r.TEXTURE_3D||Q===r.TEXTURE_2D_ARRAY?e.texImage3D(Q,$,gt,vt,It,v.depth,0,St,dt,null):e.texImage2D(Q,$,gt,vt,It,0,St,dt,null)}e.bindFramebuffer(r.FRAMEBUFFER,b),Vt(v)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,K,Q,et.__webglTexture,0,Gt(v)):(Q===r.TEXTURE_2D||Q>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,K,Q,et.__webglTexture,$),e.bindFramebuffer(r.FRAMEBUFFER,null)}function j(b,v,k){if(r.bindRenderbuffer(r.RENDERBUFFER,b),v.depthBuffer){const K=v.depthTexture,Q=K&&K.isDepthTexture?K.type:null,$=y(v.stencilBuffer,Q),St=v.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,dt=Gt(v);Vt(v)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,dt,$,v.width,v.height):k?r.renderbufferStorageMultisample(r.RENDERBUFFER,dt,$,v.width,v.height):r.renderbufferStorage(r.RENDERBUFFER,$,v.width,v.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,St,r.RENDERBUFFER,b)}else{const K=v.textures;for(let Q=0;Q<K.length;Q++){const $=K[Q],St=s.convert($.format,$.colorSpace),dt=s.convert($.type),gt=w($.internalFormat,St,dt,$.colorSpace),Yt=Gt(v);k&&Vt(v)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,Yt,gt,v.width,v.height):Vt(v)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Yt,gt,v.width,v.height):r.renderbufferStorage(r.RENDERBUFFER,gt,v.width,v.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function rt(b,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(r.FRAMEBUFFER,b),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const K=n.get(v.depthTexture);K.__renderTarget=v,(!K.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),Y(v.depthTexture,0);const Q=K.__webglTexture,$=Gt(v);if(v.depthTexture.format===Bi)Vt(v)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,Q,0,$):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,Q,0);else if(v.depthTexture.format===Wi)Vt(v)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,Q,0,$):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function mt(b){const v=n.get(b),k=b.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==b.depthTexture){const K=b.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),K){const Q=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,K.removeEventListener("dispose",Q)};K.addEventListener("dispose",Q),v.__depthDisposeCallback=Q}v.__boundDepthTexture=K}if(b.depthTexture&&!v.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");rt(v.__webglFramebuffer,b)}else if(k){v.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(r.FRAMEBUFFER,v.__webglFramebuffer[K]),v.__webglDepthbuffer[K]===void 0)v.__webglDepthbuffer[K]=r.createRenderbuffer(),j(v.__webglDepthbuffer[K],b,!1);else{const Q=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,$=v.__webglDepthbuffer[K];r.bindRenderbuffer(r.RENDERBUFFER,$),r.framebufferRenderbuffer(r.FRAMEBUFFER,Q,r.RENDERBUFFER,$)}}else if(e.bindFramebuffer(r.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=r.createRenderbuffer(),j(v.__webglDepthbuffer,b,!1);else{const K=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Q=v.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,Q),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,Q)}e.bindFramebuffer(r.FRAMEBUFFER,null)}function Rt(b,v,k){const K=n.get(b);v!==void 0&&it(K.__webglFramebuffer,b,b.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),k!==void 0&&mt(b)}function Kt(b){const v=b.texture,k=n.get(b),K=n.get(v);b.addEventListener("dispose",T);const Q=b.textures,$=b.isWebGLCubeRenderTarget===!0,St=Q.length>1;if(St||(K.__webglTexture===void 0&&(K.__webglTexture=r.createTexture()),K.__version=v.version,o.memory.textures++),$){k.__webglFramebuffer=[];for(let dt=0;dt<6;dt++)if(v.mipmaps&&v.mipmaps.length>0){k.__webglFramebuffer[dt]=[];for(let gt=0;gt<v.mipmaps.length;gt++)k.__webglFramebuffer[dt][gt]=r.createFramebuffer()}else k.__webglFramebuffer[dt]=r.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){k.__webglFramebuffer=[];for(let dt=0;dt<v.mipmaps.length;dt++)k.__webglFramebuffer[dt]=r.createFramebuffer()}else k.__webglFramebuffer=r.createFramebuffer();if(St)for(let dt=0,gt=Q.length;dt<gt;dt++){const Yt=n.get(Q[dt]);Yt.__webglTexture===void 0&&(Yt.__webglTexture=r.createTexture(),o.memory.textures++)}if(b.samples>0&&Vt(b)===!1){k.__webglMultisampledFramebuffer=r.createFramebuffer(),k.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let dt=0;dt<Q.length;dt++){const gt=Q[dt];k.__webglColorRenderbuffer[dt]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,k.__webglColorRenderbuffer[dt]);const Yt=s.convert(gt.format,gt.colorSpace),et=s.convert(gt.type),vt=w(gt.internalFormat,Yt,et,gt.colorSpace,b.isXRRenderTarget===!0),It=Gt(b);r.renderbufferStorageMultisample(r.RENDERBUFFER,It,vt,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+dt,r.RENDERBUFFER,k.__webglColorRenderbuffer[dt])}r.bindRenderbuffer(r.RENDERBUFFER,null),b.depthBuffer&&(k.__webglDepthRenderbuffer=r.createRenderbuffer(),j(k.__webglDepthRenderbuffer,b,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if($){e.bindTexture(r.TEXTURE_CUBE_MAP,K.__webglTexture),nt(r.TEXTURE_CUBE_MAP,v);for(let dt=0;dt<6;dt++)if(v.mipmaps&&v.mipmaps.length>0)for(let gt=0;gt<v.mipmaps.length;gt++)it(k.__webglFramebuffer[dt][gt],b,v,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+dt,gt);else it(k.__webglFramebuffer[dt],b,v,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+dt,0);m(v)&&f(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(St){for(let dt=0,gt=Q.length;dt<gt;dt++){const Yt=Q[dt],et=n.get(Yt);e.bindTexture(r.TEXTURE_2D,et.__webglTexture),nt(r.TEXTURE_2D,Yt),it(k.__webglFramebuffer,b,Yt,r.COLOR_ATTACHMENT0+dt,r.TEXTURE_2D,0),m(Yt)&&f(r.TEXTURE_2D)}e.unbindTexture()}else{let dt=r.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(dt=b.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(dt,K.__webglTexture),nt(dt,v),v.mipmaps&&v.mipmaps.length>0)for(let gt=0;gt<v.mipmaps.length;gt++)it(k.__webglFramebuffer[gt],b,v,r.COLOR_ATTACHMENT0,dt,gt);else it(k.__webglFramebuffer,b,v,r.COLOR_ATTACHMENT0,dt,0);m(v)&&f(dt),e.unbindTexture()}b.depthBuffer&&mt(b)}function qt(b){const v=b.textures;for(let k=0,K=v.length;k<K;k++){const Q=v[k];if(m(Q)){const $=E(b),St=n.get(Q).__webglTexture;e.bindTexture($,St),f($),e.unbindTexture()}}}const he=[],D=[];function $e(b){if(b.samples>0){if(Vt(b)===!1){const v=b.textures,k=b.width,K=b.height;let Q=r.COLOR_BUFFER_BIT;const $=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,St=n.get(b),dt=v.length>1;if(dt)for(let gt=0;gt<v.length;gt++)e.bindFramebuffer(r.FRAMEBUFFER,St.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+gt,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,St.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+gt,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,St.__webglMultisampledFramebuffer),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,St.__webglFramebuffer);for(let gt=0;gt<v.length;gt++){if(b.resolveDepthBuffer&&(b.depthBuffer&&(Q|=r.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&(Q|=r.STENCIL_BUFFER_BIT)),dt){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,St.__webglColorRenderbuffer[gt]);const Yt=n.get(v[gt]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Yt,0)}r.blitFramebuffer(0,0,k,K,0,0,k,K,Q,r.NEAREST),c===!0&&(he.length=0,D.length=0,he.push(r.COLOR_ATTACHMENT0+gt),b.depthBuffer&&b.resolveDepthBuffer===!1&&(he.push($),D.push($),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,D)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,he))}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),dt)for(let gt=0;gt<v.length;gt++){e.bindFramebuffer(r.FRAMEBUFFER,St.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+gt,r.RENDERBUFFER,St.__webglColorRenderbuffer[gt]);const Yt=n.get(v[gt]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,St.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+gt,r.TEXTURE_2D,Yt,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,St.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&c){const v=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[v])}}}function Gt(b){return Math.min(i.maxSamples,b.samples)}function Vt(b){const v=n.get(b);return b.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function At(b){const v=o.render.frame;u.get(b)!==v&&(u.set(b,v),b.update())}function oe(b,v){const k=b.colorSpace,K=b.format,Q=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||k!==li&&k!==zn&&(Jt.getTransfer(k)===re?(K!==nn||Q!==vn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),v}function bt(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(l.width=b.naturalWidth||b.width,l.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(l.width=b.displayWidth,l.height=b.displayHeight):(l.width=b.width,l.height=b.height),l}this.allocateTextureUnit=O,this.resetTextureUnits=B,this.setTexture2D=Y,this.setTexture2DArray=q,this.setTexture3D=J,this.setTextureCube=G,this.rebindTextures=Rt,this.setupRenderTarget=Kt,this.updateRenderTargetMipmap=qt,this.updateMultisampleRenderTarget=$e,this.setupDepthRenderbuffer=mt,this.setupFrameBufferTexture=it,this.useMultisampledRTT=Vt}function R_(r,t){function e(n,i=zn){let s;const o=Jt.getTransfer(i);if(n===vn)return r.UNSIGNED_BYTE;if(n===Yo)return r.UNSIGNED_SHORT_4_4_4_4;if(n===$o)return r.UNSIGNED_SHORT_5_5_5_1;if(n===cl)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===ol)return r.BYTE;if(n===al)return r.SHORT;if(n===hr)return r.UNSIGNED_SHORT;if(n===qo)return r.INT;if(n===ci)return r.UNSIGNED_INT;if(n===_n)return r.FLOAT;if(n===mr)return r.HALF_FLOAT;if(n===ll)return r.ALPHA;if(n===ul)return r.RGB;if(n===nn)return r.RGBA;if(n===hl)return r.LUMINANCE;if(n===dl)return r.LUMINANCE_ALPHA;if(n===Bi)return r.DEPTH_COMPONENT;if(n===Wi)return r.DEPTH_STENCIL;if(n===jo)return r.RED;if(n===Ko)return r.RED_INTEGER;if(n===fl)return r.RG;if(n===Zo)return r.RG_INTEGER;if(n===Jo)return r.RGBA_INTEGER;if(n===Kr||n===Zr||n===Jr||n===Qr)if(o===re)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Kr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Zr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Jr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Qr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Kr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Zr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Jr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Qr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===po||n===mo||n===_o||n===go)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===po)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===mo)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===_o)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===go)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===vo||n===xo||n===yo)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(n===vo||n===xo)return o===re?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===yo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Mo||n===So||n===wo||n===Eo||n===bo||n===To||n===Ao||n===Co||n===Ro||n===Po||n===Io||n===Do||n===Lo||n===Uo)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Mo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===So)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===wo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Eo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===bo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===To)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ao)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Co)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ro)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Po)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Io)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Do)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Lo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Uo)return o===re?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ts||n===No||n===Fo)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(n===ts)return o===re?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===No)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===pl||n===Oo||n===Bo||n===ko)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(n===ts)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Oo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Bo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ko)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Vi?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:e}}const P_={type:"move"};class js{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new de,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new de,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new de,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,s=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const x of t.hand.values()){const m=e.getJointPose(x,n),f=this._getHandJoint(l,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,_=.005;l.inputState.pinching&&d>p+_?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&d<=p-_&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,n),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(P_)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new de;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const I_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,D_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class L_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new Ie,s=t.properties.get(i);s.__webglTexture=e.texture,(e.depthNear!==n.depthNear||e.depthFar!==n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new qn({vertexShader:I_,fragmentShader:D_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new st(new Yn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class U_ extends Yi{constructor(t,e){super();const n=this;let i=null,s=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,d=null,p=null,_=null;const x=new L_,m=e.getContextAttributes();let f=null,E=null;const w=[],y=[],P=new Nt;let C=null;const T=new un;T.viewport=new ue;const R=new un;R.viewport=new ue;const S=[T,R],g=new Qh;let A=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(I){let V=w[I];return V===void 0&&(V=new js,w[I]=V),V.getTargetRaySpace()},this.getControllerGrip=function(I){let V=w[I];return V===void 0&&(V=new js,w[I]=V),V.getGripSpace()},this.getHand=function(I){let V=w[I];return V===void 0&&(V=new js,w[I]=V),V.getHandSpace()};function O(I){const V=y.indexOf(I.inputSource);if(V===-1)return;const it=w[V];it!==void 0&&(it.update(I.inputSource,I.frame,l||o),it.dispatchEvent({type:I.type,data:I.inputSource}))}function X(){i.removeEventListener("select",O),i.removeEventListener("selectstart",O),i.removeEventListener("selectend",O),i.removeEventListener("squeeze",O),i.removeEventListener("squeezestart",O),i.removeEventListener("squeezeend",O),i.removeEventListener("end",X),i.removeEventListener("inputsourceschange",Y);for(let I=0;I<w.length;I++){const V=y[I];V!==null&&(y[I]=null,w[I].disconnect(V))}A=null,B=null,x.reset(),t.setRenderTarget(f),p=null,d=null,h=null,i=null,E=null,ht.stop(),n.isPresenting=!1,t.setPixelRatio(C),t.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(I){s=I,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(I){a=I,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(I){l=I},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return _},this.getSession=function(){return i},this.setSession=async function(I){if(i=I,i!==null){if(f=t.getRenderTarget(),i.addEventListener("select",O),i.addEventListener("selectstart",O),i.addEventListener("selectend",O),i.addEventListener("squeeze",O),i.addEventListener("squeezestart",O),i.addEventListener("squeezeend",O),i.addEventListener("end",X),i.addEventListener("inputsourceschange",Y),m.xrCompatible!==!0&&await e.makeXRCompatible(),C=t.getPixelRatio(),t.getSize(P),i.enabledFeatures!==void 0&&i.enabledFeatures.includes("layers")){let it=null,j=null,rt=null;m.depth&&(rt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,it=m.stencil?Wi:Bi,j=m.stencil?Vi:ci);const mt={colorFormat:e.RGBA8,depthFormat:rt,scaleFactor:s};h=new XRWebGLBinding(i,e),d=h.createProjectionLayer(mt),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),E=new ui(d.textureWidth,d.textureHeight,{format:nn,type:vn,depthTexture:new Rl(d.textureWidth,d.textureHeight,j,void 0,void 0,void 0,void 0,void 0,void 0,it),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}else{const it={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(i,e,it),i.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),E=new ui(p.framebufferWidth,p.framebufferHeight,{format:nn,type:vn,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),ht.setContext(i),ht.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function Y(I){for(let V=0;V<I.removed.length;V++){const it=I.removed[V],j=y.indexOf(it);j>=0&&(y[j]=null,w[j].disconnect(it))}for(let V=0;V<I.added.length;V++){const it=I.added[V];let j=y.indexOf(it);if(j===-1){for(let mt=0;mt<w.length;mt++)if(mt>=y.length){y.push(it),j=mt;break}else if(y[mt]===null){y[mt]=it,j=mt;break}if(j===-1)break}const rt=w[j];rt&&rt.connect(it)}}const q=new L,J=new L;function G(I,V,it){q.setFromMatrixPosition(V.matrixWorld),J.setFromMatrixPosition(it.matrixWorld);const j=q.distanceTo(J),rt=V.projectionMatrix.elements,mt=it.projectionMatrix.elements,Rt=rt[14]/(rt[10]-1),Kt=rt[14]/(rt[10]+1),qt=(rt[9]+1)/rt[5],he=(rt[9]-1)/rt[5],D=(rt[8]-1)/rt[0],$e=(mt[8]+1)/mt[0],Gt=Rt*D,Vt=Rt*$e,At=j/(-D+$e),oe=At*-D;if(V.matrixWorld.decompose(I.position,I.quaternion,I.scale),I.translateX(oe),I.translateZ(At),I.matrixWorld.compose(I.position,I.quaternion,I.scale),I.matrixWorldInverse.copy(I.matrixWorld).invert(),rt[10]===-1)I.projectionMatrix.copy(V.projectionMatrix),I.projectionMatrixInverse.copy(V.projectionMatrixInverse);else{const bt=Rt+At,b=Kt+At,v=Gt-oe,k=Vt+(j-oe),K=qt*Kt/b*bt,Q=he*Kt/b*bt;I.projectionMatrix.makePerspective(v,k,K,Q,bt,b),I.projectionMatrixInverse.copy(I.projectionMatrix).invert()}}function ot(I,V){V===null?I.matrixWorld.copy(I.matrix):I.matrixWorld.multiplyMatrices(V.matrixWorld,I.matrix),I.matrixWorldInverse.copy(I.matrixWorld).invert()}this.updateCamera=function(I){if(i===null)return;let V=I.near,it=I.far;x.texture!==null&&(x.depthNear>0&&(V=x.depthNear),x.depthFar>0&&(it=x.depthFar)),g.near=R.near=T.near=V,g.far=R.far=T.far=it,(A!==g.near||B!==g.far)&&(i.updateRenderState({depthNear:g.near,depthFar:g.far}),A=g.near,B=g.far),T.layers.mask=I.layers.mask|2,R.layers.mask=I.layers.mask|4,g.layers.mask=T.layers.mask|R.layers.mask;const j=I.parent,rt=g.cameras;ot(g,j);for(let mt=0;mt<rt.length;mt++)ot(rt[mt],j);rt.length===2?G(g,T,R):g.projectionMatrix.copy(T.projectionMatrix),at(I,g,j)};function at(I,V,it){it===null?I.matrix.copy(V.matrixWorld):(I.matrix.copy(it.matrixWorld),I.matrix.invert(),I.matrix.multiply(V.matrixWorld)),I.matrix.decompose(I.position,I.quaternion,I.scale),I.updateMatrixWorld(!0),I.projectionMatrix.copy(V.projectionMatrix),I.projectionMatrixInverse.copy(V.projectionMatrixInverse),I.isPerspectiveCamera&&(I.fov=dr*2*Math.atan(1/I.projectionMatrix.elements[5]),I.zoom=1)}this.getCamera=function(){return g},this.getFoveation=function(){if(!(d===null&&p===null))return c},this.setFoveation=function(I){c=I,d!==null&&(d.fixedFoveation=I),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=I)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(g)};let Mt=null;function nt(I,V){if(u=V.getViewerPose(l||o),_=V,u!==null){const it=u.views;p!==null&&(t.setRenderTargetFramebuffer(E,p.framebuffer),t.setRenderTarget(E));let j=!1;it.length!==g.cameras.length&&(g.cameras.length=0,j=!0);for(let mt=0;mt<it.length;mt++){const Rt=it[mt];let Kt=null;if(p!==null)Kt=p.getViewport(Rt);else{const he=h.getViewSubImage(d,Rt);Kt=he.viewport,mt===0&&(t.setRenderTargetTextures(E,he.colorTexture,d.ignoreDepthValues?void 0:he.depthStencilTexture),t.setRenderTarget(E))}let qt=S[mt];qt===void 0&&(qt=new un,qt.layers.enable(mt),qt.viewport=new ue,S[mt]=qt),qt.matrix.fromArray(Rt.transform.matrix),qt.matrix.decompose(qt.position,qt.quaternion,qt.scale),qt.projectionMatrix.fromArray(Rt.projectionMatrix),qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(),qt.viewport.set(Kt.x,Kt.y,Kt.width,Kt.height),mt===0&&(g.matrix.copy(qt.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale)),j===!0&&g.cameras.push(qt)}const rt=i.enabledFeatures;if(rt&&rt.includes("depth-sensing")){const mt=h.getDepthInformation(it[0]);mt&&mt.isValid&&mt.texture&&x.init(t,mt,i.renderState)}}for(let it=0;it<w.length;it++){const j=y[it],rt=w[it];j!==null&&rt!==void 0&&rt.update(j,V,l||o)}Mt&&Mt(I,V),V.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:V}),_=null}const ht=new Dl;ht.setAnimationLoop(nt),this.setAnimationLoop=function(I){Mt=I},this.dispose=function(){}}}const ni=new xn,N_=new ie;function F_(r,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,wl(r)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function i(m,f,E,w,y){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(m,f):f.isMeshToonMaterial?(s(m,f),h(m,f)):f.isMeshPhongMaterial?(s(m,f),u(m,f)):f.isMeshStandardMaterial?(s(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,y)):f.isMeshMatcapMaterial?(s(m,f),_(m,f)):f.isMeshDepthMaterial?s(m,f):f.isMeshDistanceMaterial?(s(m,f),x(m,f)):f.isMeshNormalMaterial?s(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?c(m,f,E,w):f.isSpriteMaterial?l(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Oe&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Oe&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const E=t.get(f),w=E.envMap,y=E.envMapRotation;w&&(m.envMap.value=w,ni.copy(y),ni.x*=-1,ni.y*=-1,ni.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(ni.y*=-1,ni.z*=-1),m.envMapRotation.value.setFromMatrix4(N_.makeRotationFromEuler(ni)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function c(m,f,E,w){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*E,m.scale.value=w*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function l(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function h(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,E){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Oe&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){const E=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function O_(r,t,e,n){let i={},s={},o=[];const a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,w){const y=w.program;n.uniformBlockBinding(E,y)}function l(E,w){let y=i[E.id];y===void 0&&(_(E),y=u(E),i[E.id]=y,E.addEventListener("dispose",m));const P=w.program;n.updateUBOMapping(E,P);const C=t.render.frame;s[E.id]!==C&&(d(E),s[E.id]=C)}function u(E){const w=h();E.__bindingPointIndex=w;const y=r.createBuffer(),P=E.__size,C=E.usage;return r.bindBuffer(r.UNIFORM_BUFFER,y),r.bufferData(r.UNIFORM_BUFFER,P,C),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,w,y),y}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){const w=i[E.id],y=E.uniforms,P=E.__cache;r.bindBuffer(r.UNIFORM_BUFFER,w);for(let C=0,T=y.length;C<T;C++){const R=Array.isArray(y[C])?y[C]:[y[C]];for(let S=0,g=R.length;S<g;S++){const A=R[S];if(p(A,C,S,P)===!0){const B=A.__offset,O=Array.isArray(A.value)?A.value:[A.value];let X=0;for(let Y=0;Y<O.length;Y++){const q=O[Y],J=x(q);typeof q=="number"||typeof q=="boolean"?(A.__data[0]=q,r.bufferSubData(r.UNIFORM_BUFFER,B+X,A.__data)):q.isMatrix3?(A.__data[0]=q.elements[0],A.__data[1]=q.elements[1],A.__data[2]=q.elements[2],A.__data[3]=0,A.__data[4]=q.elements[3],A.__data[5]=q.elements[4],A.__data[6]=q.elements[5],A.__data[7]=0,A.__data[8]=q.elements[6],A.__data[9]=q.elements[7],A.__data[10]=q.elements[8],A.__data[11]=0):(q.toArray(A.__data,X),X+=J.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,B,A.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function p(E,w,y,P){const C=E.value,T=w+"_"+y;if(P[T]===void 0)return typeof C=="number"||typeof C=="boolean"?P[T]=C:P[T]=C.clone(),!0;{const R=P[T];if(typeof C=="number"||typeof C=="boolean"){if(R!==C)return P[T]=C,!0}else if(R.equals(C)===!1)return R.copy(C),!0}return!1}function _(E){const w=E.uniforms;let y=0;const P=16;for(let T=0,R=w.length;T<R;T++){const S=Array.isArray(w[T])?w[T]:[w[T]];for(let g=0,A=S.length;g<A;g++){const B=S[g],O=Array.isArray(B.value)?B.value:[B.value];for(let X=0,Y=O.length;X<Y;X++){const q=O[X],J=x(q),G=y%P,ot=G%J.boundary,at=G+ot;y+=ot,at!==0&&P-at<J.storage&&(y+=P-at),B.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=y,y+=J.storage}}}const C=y%P;return C>0&&(y+=P-C),E.__size=y,E.__cache={},this}function x(E){const w={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(w.boundary=4,w.storage=4):E.isVector2?(w.boundary=8,w.storage=8):E.isVector3||E.isColor?(w.boundary=16,w.storage=12):E.isVector4?(w.boundary=16,w.storage=16):E.isMatrix3?(w.boundary=48,w.storage=48):E.isMatrix4?(w.boundary=64,w.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),w}function m(E){const w=E.target;w.removeEventListener("dispose",m);const y=o.indexOf(w.__bindingPointIndex);o.splice(y,1),r.deleteBuffer(i[w.id]),delete i[w.id],delete s[w.id]}function f(){for(const E in i)r.deleteBuffer(i[E]);o=[],i={},s={}}return{bind:c,update:l,dispose:f}}class B_{constructor(t={}){const{canvas:e=uh(),context:n=null,depth:i=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const _=new Uint32Array(4),x=new Int32Array(4);let m=null,f=null;const E=[],w=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ne,this.toneMapping=Vn,this.toneMappingExposure=1;const y=this;let P=!1,C=0,T=0,R=null,S=-1,g=null;const A=new ue,B=new ue;let O=null;const X=new Xt(0);let Y=0,q=e.width,J=e.height,G=1,ot=null,at=null;const Mt=new ue(0,0,q,J),nt=new ue(0,0,q,J);let ht=!1;const I=new ia;let V=!1,it=!1;this.transmissionResolutionScale=1;const j=new ie,rt=new ie,mt=new L,Rt=new ue,Kt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let qt=!1;function he(){return R===null?G:1}let D=n;function $e(M,N){return e.getContext(M,N)}try{const M={alpha:!0,depth:i,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Xo}`),e.addEventListener("webglcontextlost",Z,!1),e.addEventListener("webglcontextrestored",pt,!1),e.addEventListener("webglcontextcreationerror",ft,!1),D===null){const N="webgl2";if(D=$e(N,M),D===null)throw $e(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let Gt,Vt,At,oe,bt,b,v,k,K,Q,$,St,dt,gt,Yt,et,vt,It,Dt,xt,Wt,Bt,se,U;function lt(){Gt=new Yp(D),Gt.init(),Bt=new R_(D,Gt),Vt=new Hp(D,Gt,t,Bt),At=new A_(D,Gt),Vt.reverseDepthBuffer&&d&&At.buffers.depth.setReversed(!0),oe=new Kp(D),bt=new p_,b=new C_(D,Gt,At,bt,Vt,Bt,oe),v=new Vp(y),k=new qp(y),K=new nd(D),se=new kp(D,K),Q=new $p(D,K,oe,se),$=new Jp(D,Q,K,oe),Dt=new Zp(D,Vt,b),et=new Gp(bt),St=new f_(y,v,k,Gt,Vt,se,et),dt=new F_(y,bt),gt=new __,Yt=new S_(Gt),It=new Bp(y,v,k,At,$,p,c),vt=new b_(y,$,Vt),U=new O_(D,oe,Vt,At),xt=new zp(D,Gt,oe),Wt=new jp(D,Gt,oe),oe.programs=St.programs,y.capabilities=Vt,y.extensions=Gt,y.properties=bt,y.renderLists=gt,y.shadowMap=vt,y.state=At,y.info=oe}lt();const W=new U_(y,D);this.xr=W,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const M=Gt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=Gt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(M){M!==void 0&&(G=M,this.setSize(q,J,!1))},this.getSize=function(M){return M.set(q,J)},this.setSize=function(M,N,z=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=M,J=N,e.width=Math.floor(M*G),e.height=Math.floor(N*G),z===!0&&(e.style.width=M+"px",e.style.height=N+"px"),this.setViewport(0,0,M,N)},this.getDrawingBufferSize=function(M){return M.set(q*G,J*G).floor()},this.setDrawingBufferSize=function(M,N,z){q=M,J=N,G=z,e.width=Math.floor(M*z),e.height=Math.floor(N*z),this.setViewport(0,0,M,N)},this.getCurrentViewport=function(M){return M.copy(A)},this.getViewport=function(M){return M.copy(Mt)},this.setViewport=function(M,N,z,H){M.isVector4?Mt.set(M.x,M.y,M.z,M.w):Mt.set(M,N,z,H),At.viewport(A.copy(Mt).multiplyScalar(G).round())},this.getScissor=function(M){return M.copy(nt)},this.setScissor=function(M,N,z,H){M.isVector4?nt.set(M.x,M.y,M.z,M.w):nt.set(M,N,z,H),At.scissor(B.copy(nt).multiplyScalar(G).round())},this.getScissorTest=function(){return ht},this.setScissorTest=function(M){At.setScissorTest(ht=M)},this.setOpaqueSort=function(M){ot=M},this.setTransparentSort=function(M){at=M},this.getClearColor=function(M){return M.copy(It.getClearColor())},this.setClearColor=function(){It.setClearColor.apply(It,arguments)},this.getClearAlpha=function(){return It.getClearAlpha()},this.setClearAlpha=function(){It.setClearAlpha.apply(It,arguments)},this.clear=function(M=!0,N=!0,z=!0){let H=0;if(M){let F=!1;if(R!==null){const tt=R.texture.format;F=tt===Jo||tt===Zo||tt===Ko}if(F){const tt=R.texture.type,ut=tt===vn||tt===ci||tt===hr||tt===Vi||tt===Yo||tt===$o,_t=It.getClearColor(),yt=It.getClearAlpha(),Lt=_t.r,Ut=_t.g,Ct=_t.b;ut?(_[0]=Lt,_[1]=Ut,_[2]=Ct,_[3]=yt,D.clearBufferuiv(D.COLOR,0,_)):(x[0]=Lt,x[1]=Ut,x[2]=Ct,x[3]=yt,D.clearBufferiv(D.COLOR,0,x))}else H|=D.COLOR_BUFFER_BIT}N&&(H|=D.DEPTH_BUFFER_BIT),z&&(H|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Z,!1),e.removeEventListener("webglcontextrestored",pt,!1),e.removeEventListener("webglcontextcreationerror",ft,!1),It.dispose(),gt.dispose(),Yt.dispose(),bt.dispose(),v.dispose(),k.dispose(),$.dispose(),se.dispose(),U.dispose(),St.dispose(),W.dispose(),W.removeEventListener("sessionstart",va),W.removeEventListener("sessionend",xa),jn.stop()};function Z(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function pt(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;const M=oe.autoReset,N=vt.enabled,z=vt.autoUpdate,H=vt.needsUpdate,F=vt.type;lt(),oe.autoReset=M,vt.enabled=N,vt.autoUpdate=z,vt.needsUpdate=H,vt.type=F}function ft(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ft(M){const N=M.target;N.removeEventListener("dispose",Ft),ce(N)}function ce(M){Ae(M),bt.remove(M)}function Ae(M){const N=bt.get(M).programs;N!==void 0&&(N.forEach(function(z){St.releaseProgram(z)}),M.isShaderMaterial&&St.releaseShaderCache(M))}this.renderBufferDirect=function(M,N,z,H,F,tt){N===null&&(N=Kt);const ut=F.isMesh&&F.matrixWorld.determinant()<0,_t=jl(M,N,z,H,F);At.setMaterial(H,ut);let yt=z.index,Lt=1;if(H.wireframe===!0){if(yt=Q.getWireframeAttribute(z),yt===void 0)return;Lt=2}const Ut=z.drawRange,Ct=z.attributes.position;let $t=Ut.start*Lt,Qt=(Ut.start+Ut.count)*Lt;tt!==null&&($t=Math.max($t,tt.start*Lt),Qt=Math.min(Qt,(tt.start+tt.count)*Lt)),yt!==null?($t=Math.max($t,0),Qt=Math.min(Qt,yt.count)):Ct!=null&&($t=Math.max($t,0),Qt=Math.min(Qt,Ct.count));const pe=Qt-$t;if(pe<0||pe===1/0)return;se.setup(F,H,_t,z,yt);let le,Zt=xt;if(yt!==null&&(le=K.get(yt),Zt=Wt,Zt.setIndex(le)),F.isMesh)H.wireframe===!0?(At.setLineWidth(H.wireframeLinewidth*he()),Zt.setMode(D.LINES)):Zt.setMode(D.TRIANGLES);else if(F.isLine){let Pt=H.linewidth;Pt===void 0&&(Pt=1),At.setLineWidth(Pt*he()),F.isLineSegments?Zt.setMode(D.LINES):F.isLineLoop?Zt.setMode(D.LINE_LOOP):Zt.setMode(D.LINE_STRIP)}else F.isPoints?Zt.setMode(D.POINTS):F.isSprite&&Zt.setMode(D.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Zt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Gt.get("WEBGL_multi_draw"))Zt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Pt=F._multiDrawStarts,we=F._multiDrawCounts,te=F._multiDrawCount,sn=yt?K.get(yt).bytesPerElement:1,di=bt.get(H).currentProgram.getUniforms();for(let ze=0;ze<te;ze++)di.setValue(D,"_gl_DrawID",ze),Zt.render(Pt[ze]/sn,we[ze])}else if(F.isInstancedMesh)Zt.renderInstances($t,pe,F.count);else if(z.isInstancedBufferGeometry){const Pt=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,we=Math.min(z.instanceCount,Pt);Zt.renderInstances($t,pe,we)}else Zt.render($t,pe)};function ee(M,N,z){M.transparent===!0&&M.side===An&&M.forceSinglePass===!1?(M.side=Oe,M.needsUpdate=!0,yr(M,N,z),M.side=Xn,M.needsUpdate=!0,yr(M,N,z),M.side=An):yr(M,N,z)}this.compile=function(M,N,z=null){z===null&&(z=M),f=Yt.get(z),f.init(N),w.push(f),z.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),M!==z&&M.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();const H=new Set;return M.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const tt=F.material;if(tt)if(Array.isArray(tt))for(let ut=0;ut<tt.length;ut++){const _t=tt[ut];ee(_t,z,F),H.add(_t)}else ee(tt,z,F),H.add(tt)}),w.pop(),f=null,H},this.compileAsync=function(M,N,z=null){const H=this.compile(M,N,z);return new Promise(F=>{function tt(){if(H.forEach(function(ut){bt.get(ut).currentProgram.isReady()&&H.delete(ut)}),H.size===0){F(M);return}setTimeout(tt,10)}Gt.get("KHR_parallel_shader_compile")!==null?tt():setTimeout(tt,10)})};let rn=null;function yn(M){rn&&rn(M)}function va(){jn.stop()}function xa(){jn.start()}const jn=new Dl;jn.setAnimationLoop(yn),typeof self<"u"&&jn.setContext(self),this.setAnimationLoop=function(M){rn=M,W.setAnimationLoop(M),M===null?jn.stop():jn.start()},W.addEventListener("sessionstart",va),W.addEventListener("sessionend",xa),this.render=function(M,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(N),N=W.getCamera()),M.isScene===!0&&M.onBeforeRender(y,M,N,R),f=Yt.get(M,w.length),f.init(N),w.push(f),rt.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),I.setFromProjectionMatrix(rt),it=this.localClippingEnabled,V=et.init(this.clippingPlanes,it),m=gt.get(M,E.length),m.init(),E.push(m),W.enabled===!0&&W.isPresenting===!0){const tt=y.xr.getDepthSensingMesh();tt!==null&&gs(tt,N,-1/0,y.sortObjects)}gs(M,N,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(ot,at),qt=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,qt&&It.addToRenderList(m,M),this.info.render.frame++,V===!0&&et.beginShadows();const z=f.state.shadowsArray;vt.render(z,M,N),V===!0&&et.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,F=m.transmissive;if(f.setupLights(),N.isArrayCamera){const tt=N.cameras;if(F.length>0)for(let ut=0,_t=tt.length;ut<_t;ut++){const yt=tt[ut];Ma(H,F,M,yt)}qt&&It.render(M);for(let ut=0,_t=tt.length;ut<_t;ut++){const yt=tt[ut];ya(m,M,yt,yt.viewport)}}else F.length>0&&Ma(H,F,M,N),qt&&It.render(M),ya(m,M,N);R!==null&&T===0&&(b.updateMultisampleRenderTarget(R),b.updateRenderTargetMipmap(R)),M.isScene===!0&&M.onAfterRender(y,M,N),se.resetDefaultState(),S=-1,g=null,w.pop(),w.length>0?(f=w[w.length-1],V===!0&&et.setGlobalState(y.clippingPlanes,f.state.camera)):f=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function gs(M,N,z,H){if(M.visible===!1)return;if(M.layers.test(N.layers)){if(M.isGroup)z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(N);else if(M.isLight)f.pushLight(M),M.castShadow&&f.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||I.intersectsSprite(M)){H&&Rt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(rt);const ut=$.update(M),_t=M.material;_t.visible&&m.push(M,ut,_t,z,Rt.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||I.intersectsObject(M))){const ut=$.update(M),_t=M.material;if(H&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Rt.copy(M.boundingSphere.center)):(ut.boundingSphere===null&&ut.computeBoundingSphere(),Rt.copy(ut.boundingSphere.center)),Rt.applyMatrix4(M.matrixWorld).applyMatrix4(rt)),Array.isArray(_t)){const yt=ut.groups;for(let Lt=0,Ut=yt.length;Lt<Ut;Lt++){const Ct=yt[Lt],$t=_t[Ct.materialIndex];$t&&$t.visible&&m.push(M,ut,$t,z,Rt.z,Ct)}}else _t.visible&&m.push(M,ut,_t,z,Rt.z,null)}}const tt=M.children;for(let ut=0,_t=tt.length;ut<_t;ut++)gs(tt[ut],N,z,H)}function ya(M,N,z,H){const F=M.opaque,tt=M.transmissive,ut=M.transparent;f.setupLightsView(z),V===!0&&et.setGlobalState(y.clippingPlanes,z),H&&At.viewport(A.copy(H)),F.length>0&&xr(F,N,z),tt.length>0&&xr(tt,N,z),ut.length>0&&xr(ut,N,z),At.buffers.depth.setTest(!0),At.buffers.depth.setMask(!0),At.buffers.color.setMask(!0),At.setPolygonOffset(!1)}function Ma(M,N,z,H){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[H.id]===void 0&&(f.state.transmissionRenderTarget[H.id]=new ui(1,1,{generateMipmaps:!0,type:Gt.has("EXT_color_buffer_half_float")||Gt.has("EXT_color_buffer_float")?mr:vn,minFilter:oi,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Jt.workingColorSpace}));const tt=f.state.transmissionRenderTarget[H.id],ut=H.viewport||A;tt.setSize(ut.z*y.transmissionResolutionScale,ut.w*y.transmissionResolutionScale);const _t=y.getRenderTarget();y.setRenderTarget(tt),y.getClearColor(X),Y=y.getClearAlpha(),Y<1&&y.setClearColor(16777215,.5),y.clear(),qt&&It.render(z);const yt=y.toneMapping;y.toneMapping=Vn;const Lt=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),f.setupLightsView(H),V===!0&&et.setGlobalState(y.clippingPlanes,H),xr(M,z,H),b.updateMultisampleRenderTarget(tt),b.updateRenderTargetMipmap(tt),Gt.has("WEBGL_multisampled_render_to_texture")===!1){let Ut=!1;for(let Ct=0,$t=N.length;Ct<$t;Ct++){const Qt=N[Ct],pe=Qt.object,le=Qt.geometry,Zt=Qt.material,Pt=Qt.group;if(Zt.side===An&&pe.layers.test(H.layers)){const we=Zt.side;Zt.side=Oe,Zt.needsUpdate=!0,Sa(pe,z,H,le,Zt,Pt),Zt.side=we,Zt.needsUpdate=!0,Ut=!0}}Ut===!0&&(b.updateMultisampleRenderTarget(tt),b.updateRenderTargetMipmap(tt))}y.setRenderTarget(_t),y.setClearColor(X,Y),Lt!==void 0&&(H.viewport=Lt),y.toneMapping=yt}function xr(M,N,z){const H=N.isScene===!0?N.overrideMaterial:null;for(let F=0,tt=M.length;F<tt;F++){const ut=M[F],_t=ut.object,yt=ut.geometry,Lt=H===null?ut.material:H,Ut=ut.group;_t.layers.test(z.layers)&&Sa(_t,N,z,yt,Lt,Ut)}}function Sa(M,N,z,H,F,tt){M.onBeforeRender(y,N,z,H,F,tt),M.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),F.onBeforeRender(y,N,z,H,M,tt),F.transparent===!0&&F.side===An&&F.forceSinglePass===!1?(F.side=Oe,F.needsUpdate=!0,y.renderBufferDirect(z,N,H,F,M,tt),F.side=Xn,F.needsUpdate=!0,y.renderBufferDirect(z,N,H,F,M,tt),F.side=An):y.renderBufferDirect(z,N,H,F,M,tt),M.onAfterRender(y,N,z,H,F,tt)}function yr(M,N,z){N.isScene!==!0&&(N=Kt);const H=bt.get(M),F=f.state.lights,tt=f.state.shadowsArray,ut=F.state.version,_t=St.getParameters(M,F.state,tt,N,z),yt=St.getProgramCacheKey(_t);let Lt=H.programs;H.environment=M.isMeshStandardMaterial?N.environment:null,H.fog=N.fog,H.envMap=(M.isMeshStandardMaterial?k:v).get(M.envMap||H.environment),H.envMapRotation=H.environment!==null&&M.envMap===null?N.environmentRotation:M.envMapRotation,Lt===void 0&&(M.addEventListener("dispose",Ft),Lt=new Map,H.programs=Lt);let Ut=Lt.get(yt);if(Ut!==void 0){if(H.currentProgram===Ut&&H.lightsStateVersion===ut)return Ea(M,_t),Ut}else _t.uniforms=St.getUniforms(M),M.onBeforeCompile(_t,y),Ut=St.acquireProgram(_t,yt),Lt.set(yt,Ut),H.uniforms=_t.uniforms;const Ct=H.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Ct.clippingPlanes=et.uniform),Ea(M,_t),H.needsLights=Zl(M),H.lightsStateVersion=ut,H.needsLights&&(Ct.ambientLightColor.value=F.state.ambient,Ct.lightProbe.value=F.state.probe,Ct.directionalLights.value=F.state.directional,Ct.directionalLightShadows.value=F.state.directionalShadow,Ct.spotLights.value=F.state.spot,Ct.spotLightShadows.value=F.state.spotShadow,Ct.rectAreaLights.value=F.state.rectArea,Ct.ltc_1.value=F.state.rectAreaLTC1,Ct.ltc_2.value=F.state.rectAreaLTC2,Ct.pointLights.value=F.state.point,Ct.pointLightShadows.value=F.state.pointShadow,Ct.hemisphereLights.value=F.state.hemi,Ct.directionalShadowMap.value=F.state.directionalShadowMap,Ct.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ct.spotShadowMap.value=F.state.spotShadowMap,Ct.spotLightMatrix.value=F.state.spotLightMatrix,Ct.spotLightMap.value=F.state.spotLightMap,Ct.pointShadowMap.value=F.state.pointShadowMap,Ct.pointShadowMatrix.value=F.state.pointShadowMatrix),H.currentProgram=Ut,H.uniformsList=null,Ut}function wa(M){if(M.uniformsList===null){const N=M.currentProgram.getUniforms();M.uniformsList=es.seqWithValue(N.seq,M.uniforms)}return M.uniformsList}function Ea(M,N){const z=bt.get(M);z.outputColorSpace=N.outputColorSpace,z.batching=N.batching,z.batchingColor=N.batchingColor,z.instancing=N.instancing,z.instancingColor=N.instancingColor,z.instancingMorph=N.instancingMorph,z.skinning=N.skinning,z.morphTargets=N.morphTargets,z.morphNormals=N.morphNormals,z.morphColors=N.morphColors,z.morphTargetsCount=N.morphTargetsCount,z.numClippingPlanes=N.numClippingPlanes,z.numIntersection=N.numClipIntersection,z.vertexAlphas=N.vertexAlphas,z.vertexTangents=N.vertexTangents,z.toneMapping=N.toneMapping}function jl(M,N,z,H,F){N.isScene!==!0&&(N=Kt),b.resetTextureUnits();const tt=N.fog,ut=H.isMeshStandardMaterial?N.environment:null,_t=R===null?y.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:li,yt=(H.isMeshStandardMaterial?k:v).get(H.envMap||ut),Lt=H.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ut=!!z.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ct=!!z.morphAttributes.position,$t=!!z.morphAttributes.normal,Qt=!!z.morphAttributes.color;let pe=Vn;H.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(pe=y.toneMapping);const le=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Zt=le!==void 0?le.length:0,Pt=bt.get(H),we=f.state.lights;if(V===!0&&(it===!0||M!==g)){const De=M===g&&H.id===S;et.setState(H,M,De)}let te=!1;H.version===Pt.__version?(Pt.needsLights&&Pt.lightsStateVersion!==we.state.version||Pt.outputColorSpace!==_t||F.isBatchedMesh&&Pt.batching===!1||!F.isBatchedMesh&&Pt.batching===!0||F.isBatchedMesh&&Pt.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Pt.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Pt.instancing===!1||!F.isInstancedMesh&&Pt.instancing===!0||F.isSkinnedMesh&&Pt.skinning===!1||!F.isSkinnedMesh&&Pt.skinning===!0||F.isInstancedMesh&&Pt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Pt.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Pt.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Pt.instancingMorph===!1&&F.morphTexture!==null||Pt.envMap!==yt||H.fog===!0&&Pt.fog!==tt||Pt.numClippingPlanes!==void 0&&(Pt.numClippingPlanes!==et.numPlanes||Pt.numIntersection!==et.numIntersection)||Pt.vertexAlphas!==Lt||Pt.vertexTangents!==Ut||Pt.morphTargets!==Ct||Pt.morphNormals!==$t||Pt.morphColors!==Qt||Pt.toneMapping!==pe||Pt.morphTargetsCount!==Zt)&&(te=!0):(te=!0,Pt.__version=H.version);let sn=Pt.currentProgram;te===!0&&(sn=yr(H,N,F));let di=!1,ze=!1,Zi=!1;const ae=sn.getUniforms(),je=Pt.uniforms;if(At.useProgram(sn.program)&&(di=!0,ze=!0,Zi=!0),H.id!==S&&(S=H.id,ze=!0),di||g!==M){At.buffers.depth.getReversed()?(j.copy(M.projectionMatrix),dh(j),fh(j),ae.setValue(D,"projectionMatrix",j)):ae.setValue(D,"projectionMatrix",M.projectionMatrix),ae.setValue(D,"viewMatrix",M.matrixWorldInverse);const Fe=ae.map.cameraPosition;Fe!==void 0&&Fe.setValue(D,mt.setFromMatrixPosition(M.matrixWorld)),Vt.logarithmicDepthBuffer&&ae.setValue(D,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&ae.setValue(D,"isOrthographic",M.isOrthographicCamera===!0),g!==M&&(g=M,ze=!0,Zi=!0)}if(F.isSkinnedMesh){ae.setOptional(D,F,"bindMatrix"),ae.setOptional(D,F,"bindMatrixInverse");const De=F.skeleton;De&&(De.boneTexture===null&&De.computeBoneTexture(),ae.setValue(D,"boneTexture",De.boneTexture,b))}F.isBatchedMesh&&(ae.setOptional(D,F,"batchingTexture"),ae.setValue(D,"batchingTexture",F._matricesTexture,b),ae.setOptional(D,F,"batchingIdTexture"),ae.setValue(D,"batchingIdTexture",F._indirectTexture,b),ae.setOptional(D,F,"batchingColorTexture"),F._colorsTexture!==null&&ae.setValue(D,"batchingColorTexture",F._colorsTexture,b));const Ke=z.morphAttributes;if((Ke.position!==void 0||Ke.normal!==void 0||Ke.color!==void 0)&&Dt.update(F,z,sn),(ze||Pt.receiveShadow!==F.receiveShadow)&&(Pt.receiveShadow=F.receiveShadow,ae.setValue(D,"receiveShadow",F.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(je.envMap.value=yt,je.flipEnvMap.value=yt.isCubeTexture&&yt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&N.environment!==null&&(je.envMapIntensity.value=N.environmentIntensity),ze&&(ae.setValue(D,"toneMappingExposure",y.toneMappingExposure),Pt.needsLights&&Kl(je,Zi),tt&&H.fog===!0&&dt.refreshFogUniforms(je,tt),dt.refreshMaterialUniforms(je,H,G,J,f.state.transmissionRenderTarget[M.id]),es.upload(D,wa(Pt),je,b)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(es.upload(D,wa(Pt),je,b),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&ae.setValue(D,"center",F.center),ae.setValue(D,"modelViewMatrix",F.modelViewMatrix),ae.setValue(D,"normalMatrix",F.normalMatrix),ae.setValue(D,"modelMatrix",F.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const De=H.uniformsGroups;for(let Fe=0,vs=De.length;Fe<vs;Fe++){const Kn=De[Fe];U.update(Kn,sn),U.bind(Kn,sn)}}return sn}function Kl(M,N){M.ambientLightColor.needsUpdate=N,M.lightProbe.needsUpdate=N,M.directionalLights.needsUpdate=N,M.directionalLightShadows.needsUpdate=N,M.pointLights.needsUpdate=N,M.pointLightShadows.needsUpdate=N,M.spotLights.needsUpdate=N,M.spotLightShadows.needsUpdate=N,M.rectAreaLights.needsUpdate=N,M.hemisphereLights.needsUpdate=N}function Zl(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(M,N,z){bt.get(M.texture).__webglTexture=N,bt.get(M.depthTexture).__webglTexture=z;const H=bt.get(M);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=z===void 0,H.__autoAllocateDepthBuffer||Gt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,N){const z=bt.get(M);z.__webglFramebuffer=N,z.__useDefaultFramebuffer=N===void 0};const Jl=D.createFramebuffer();this.setRenderTarget=function(M,N=0,z=0){R=M,C=N,T=z;let H=!0,F=null,tt=!1,ut=!1;if(M){const yt=bt.get(M);if(yt.__useDefaultFramebuffer!==void 0)At.bindFramebuffer(D.FRAMEBUFFER,null),H=!1;else if(yt.__webglFramebuffer===void 0)b.setupRenderTarget(M);else if(yt.__hasExternalTextures)b.rebindTextures(M,bt.get(M.texture).__webglTexture,bt.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Ct=M.depthTexture;if(yt.__boundDepthTexture!==Ct){if(Ct!==null&&bt.has(Ct)&&(M.width!==Ct.image.width||M.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");b.setupDepthRenderbuffer(M)}}const Lt=M.texture;(Lt.isData3DTexture||Lt.isDataArrayTexture||Lt.isCompressedArrayTexture)&&(ut=!0);const Ut=bt.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ut[N])?F=Ut[N][z]:F=Ut[N],tt=!0):M.samples>0&&b.useMultisampledRTT(M)===!1?F=bt.get(M).__webglMultisampledFramebuffer:Array.isArray(Ut)?F=Ut[z]:F=Ut,A.copy(M.viewport),B.copy(M.scissor),O=M.scissorTest}else A.copy(Mt).multiplyScalar(G).floor(),B.copy(nt).multiplyScalar(G).floor(),O=ht;if(z!==0&&(F=Jl),At.bindFramebuffer(D.FRAMEBUFFER,F)&&H&&At.drawBuffers(M,F),At.viewport(A),At.scissor(B),At.setScissorTest(O),tt){const yt=bt.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+N,yt.__webglTexture,z)}else if(ut){const yt=bt.get(M.texture),Lt=N;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,yt.__webglTexture,z,Lt)}else if(M!==null&&z!==0){const yt=bt.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,yt.__webglTexture,z)}S=-1},this.readRenderTargetPixels=function(M,N,z,H,F,tt,ut){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _t=bt.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ut!==void 0&&(_t=_t[ut]),_t){At.bindFramebuffer(D.FRAMEBUFFER,_t);try{const yt=M.texture,Lt=yt.format,Ut=yt.type;if(!Vt.textureFormatReadable(Lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Vt.textureTypeReadable(Ut)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=M.width-H&&z>=0&&z<=M.height-F&&D.readPixels(N,z,H,F,Bt.convert(Lt),Bt.convert(Ut),tt)}finally{const yt=R!==null?bt.get(R).__webglFramebuffer:null;At.bindFramebuffer(D.FRAMEBUFFER,yt)}}},this.readRenderTargetPixelsAsync=async function(M,N,z,H,F,tt,ut){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _t=bt.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ut!==void 0&&(_t=_t[ut]),_t){const yt=M.texture,Lt=yt.format,Ut=yt.type;if(!Vt.textureFormatReadable(Lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Vt.textureTypeReadable(Ut))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=M.width-H&&z>=0&&z<=M.height-F){At.bindFramebuffer(D.FRAMEBUFFER,_t);const Ct=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Ct),D.bufferData(D.PIXEL_PACK_BUFFER,tt.byteLength,D.STREAM_READ),D.readPixels(N,z,H,F,Bt.convert(Lt),Bt.convert(Ut),0);const $t=R!==null?bt.get(R).__webglFramebuffer:null;At.bindFramebuffer(D.FRAMEBUFFER,$t);const Qt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await hh(D,Qt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Ct),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,tt),D.deleteBuffer(Ct),D.deleteSync(Qt),tt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,N=null,z=0){M.isTexture!==!0&&(Di("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,M=arguments[1]);const H=Math.pow(2,-z),F=Math.floor(M.image.width*H),tt=Math.floor(M.image.height*H),ut=N!==null?N.x:0,_t=N!==null?N.y:0;b.setTexture2D(M,0),D.copyTexSubImage2D(D.TEXTURE_2D,z,0,0,ut,_t,F,tt),At.unbindTexture()};const Ql=D.createFramebuffer(),tu=D.createFramebuffer();this.copyTextureToTexture=function(M,N,z=null,H=null,F=0,tt=null){M.isTexture!==!0&&(Di("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,M=arguments[1],N=arguments[2],tt=arguments[3]||0,z=null),tt===null&&(F!==0?(Di("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),tt=F,F=0):tt=0);let ut,_t,yt,Lt,Ut,Ct,$t,Qt,pe;const le=M.isCompressedTexture?M.mipmaps[tt]:M.image;if(z!==null)ut=z.max.x-z.min.x,_t=z.max.y-z.min.y,yt=z.isBox3?z.max.z-z.min.z:1,Lt=z.min.x,Ut=z.min.y,Ct=z.isBox3?z.min.z:0;else{const Ke=Math.pow(2,-F);ut=Math.floor(le.width*Ke),_t=Math.floor(le.height*Ke),M.isDataArrayTexture?yt=le.depth:M.isData3DTexture?yt=Math.floor(le.depth*Ke):yt=1,Lt=0,Ut=0,Ct=0}H!==null?($t=H.x,Qt=H.y,pe=H.z):($t=0,Qt=0,pe=0);const Zt=Bt.convert(N.format),Pt=Bt.convert(N.type);let we;N.isData3DTexture?(b.setTexture3D(N,0),we=D.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(b.setTexture2DArray(N,0),we=D.TEXTURE_2D_ARRAY):(b.setTexture2D(N,0),we=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,N.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,N.unpackAlignment);const te=D.getParameter(D.UNPACK_ROW_LENGTH),sn=D.getParameter(D.UNPACK_IMAGE_HEIGHT),di=D.getParameter(D.UNPACK_SKIP_PIXELS),ze=D.getParameter(D.UNPACK_SKIP_ROWS),Zi=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,le.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,le.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Lt),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ut),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ct);const ae=M.isDataArrayTexture||M.isData3DTexture,je=N.isDataArrayTexture||N.isData3DTexture;if(M.isDepthTexture){const Ke=bt.get(M),De=bt.get(N),Fe=bt.get(Ke.__renderTarget),vs=bt.get(De.__renderTarget);At.bindFramebuffer(D.READ_FRAMEBUFFER,Fe.__webglFramebuffer),At.bindFramebuffer(D.DRAW_FRAMEBUFFER,vs.__webglFramebuffer);for(let Kn=0;Kn<yt;Kn++)ae&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,bt.get(M).__webglTexture,F,Ct+Kn),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,bt.get(N).__webglTexture,tt,pe+Kn)),D.blitFramebuffer(Lt,Ut,ut,_t,$t,Qt,ut,_t,D.DEPTH_BUFFER_BIT,D.NEAREST);At.bindFramebuffer(D.READ_FRAMEBUFFER,null),At.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(F!==0||M.isRenderTargetTexture||bt.has(M)){const Ke=bt.get(M),De=bt.get(N);At.bindFramebuffer(D.READ_FRAMEBUFFER,Ql),At.bindFramebuffer(D.DRAW_FRAMEBUFFER,tu);for(let Fe=0;Fe<yt;Fe++)ae?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Ke.__webglTexture,F,Ct+Fe):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Ke.__webglTexture,F),je?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,De.__webglTexture,tt,pe+Fe):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,De.__webglTexture,tt),F!==0?D.blitFramebuffer(Lt,Ut,ut,_t,$t,Qt,ut,_t,D.COLOR_BUFFER_BIT,D.NEAREST):je?D.copyTexSubImage3D(we,tt,$t,Qt,pe+Fe,Lt,Ut,ut,_t):D.copyTexSubImage2D(we,tt,$t,Qt,Lt,Ut,ut,_t);At.bindFramebuffer(D.READ_FRAMEBUFFER,null),At.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else je?M.isDataTexture||M.isData3DTexture?D.texSubImage3D(we,tt,$t,Qt,pe,ut,_t,yt,Zt,Pt,le.data):N.isCompressedArrayTexture?D.compressedTexSubImage3D(we,tt,$t,Qt,pe,ut,_t,yt,Zt,le.data):D.texSubImage3D(we,tt,$t,Qt,pe,ut,_t,yt,Zt,Pt,le):M.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,tt,$t,Qt,ut,_t,Zt,Pt,le.data):M.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,tt,$t,Qt,le.width,le.height,Zt,le.data):D.texSubImage2D(D.TEXTURE_2D,tt,$t,Qt,ut,_t,Zt,Pt,le);D.pixelStorei(D.UNPACK_ROW_LENGTH,te),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,sn),D.pixelStorei(D.UNPACK_SKIP_PIXELS,di),D.pixelStorei(D.UNPACK_SKIP_ROWS,ze),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Zi),tt===0&&N.generateMipmaps&&D.generateMipmap(we),At.unbindTexture()},this.copyTextureToTexture3D=function(M,N,z=null,H=null,F=0){return M.isTexture!==!0&&(Di("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,H=arguments[1]||null,M=arguments[2],N=arguments[3],F=arguments[4]||0),Di('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,N,z,H,F)},this.initRenderTarget=function(M){bt.get(M).__webglFramebuffer===void 0&&b.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?b.setTextureCube(M,0):M.isData3DTexture?b.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?b.setTexture2DArray(M,0):b.setTexture2D(M,0),At.unbindTexture()},this.resetState=function(){C=0,T=0,R=null,At.reset(),se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=Jt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Jt._getUnpackColorSpace()}}const k_=JSON.parse('{"peasant":{"faction":"human","portrait":"/art/portraits/peasant.png","worldScale":{"x":1.4,"y":1.7},"states":{"idle":{"src":"/art/characters/peasant/peasant_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/peasant/peasant_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/peasant/peasant_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/peasant/peasant_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/peasant/peasant_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"footman":{"faction":"human","portrait":"/art/portraits/footman.png","worldScale":{"x":1.6,"y":1.9},"states":{"idle":{"src":"/art/characters/footman/footman_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/footman/footman_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/footman/footman_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/footman/footman_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/footman/footman_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"archer":{"faction":"human","portrait":"/art/portraits/archer.png","worldScale":{"x":1.55,"y":1.85},"states":{"idle":{"src":"/art/characters/archer/archer_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/archer/archer_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/archer/archer_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/archer/archer_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/archer/archer_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"knight":{"faction":"human","portrait":"/art/portraits/knight.png","worldScale":{"x":2.4,"y":2.55},"states":{"idle":{"src":"/art/characters/knight/knight_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/knight/knight_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/knight/knight_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/knight/knight_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/knight/knight_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"cleric":{"faction":"human","portrait":"/art/portraits/cleric.png","worldScale":{"x":1.6,"y":2},"states":{"idle":{"src":"/art/characters/cleric/cleric_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/cleric/cleric_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/cleric/cleric_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/cleric/cleric_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/cleric/cleric_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"catapult":{"faction":"human","portrait":"/art/portraits/catapult.png","worldScale":{"x":2.8,"y":2.1},"states":{"idle":{"src":"/art/characters/catapult/catapult_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/catapult/catapult_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/catapult/catapult_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/catapult/catapult_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/catapult/catapult_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"captain":{"faction":"human","portrait":"/art/portraits/captain.png","worldScale":{"x":1.8,"y":2.15},"states":{"idle":{"src":"/art/characters/captain/captain_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/captain/captain_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/captain/captain_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/captain/captain_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/captain/captain_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"thrall":{"faction":"orc","portrait":"/art/portraits/thrall.png","worldScale":{"x":1.4,"y":1.7},"states":{"idle":{"src":"/art/characters/thrall/thrall_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/thrall/thrall_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/thrall/thrall_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/thrall/thrall_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/thrall/thrall_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"grunt":{"faction":"orc","portrait":"/art/portraits/grunt.png","worldScale":{"x":1.6,"y":1.9},"states":{"idle":{"src":"/art/characters/grunt/grunt_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/grunt/grunt_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/grunt/grunt_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/grunt/grunt_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/grunt/grunt_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"hunter":{"faction":"orc","portrait":"/art/portraits/hunter.png","worldScale":{"x":1.55,"y":1.85},"states":{"idle":{"src":"/art/characters/hunter/hunter_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/hunter/hunter_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/hunter/hunter_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/hunter/hunter_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/hunter/hunter_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"berserker":{"faction":"orc","portrait":"/art/portraits/berserker.png","worldScale":{"x":2.4,"y":2.55},"states":{"idle":{"src":"/art/characters/berserker/berserker_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/berserker/berserker_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/berserker/berserker_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/berserker/berserker_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/berserker/berserker_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"shaman":{"faction":"orc","portrait":"/art/portraits/shaman.png","worldScale":{"x":1.6,"y":2},"states":{"idle":{"src":"/art/characters/shaman/shaman_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/shaman/shaman_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/shaman/shaman_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/shaman/shaman_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/shaman/shaman_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"war_catapult":{"faction":"orc","portrait":"/art/portraits/war_catapult.png","worldScale":{"x":2.8,"y":2.1},"states":{"idle":{"src":"/art/characters/war_catapult/war_catapult_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/war_catapult/war_catapult_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/war_catapult/war_catapult_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/war_catapult/war_catapult_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/war_catapult/war_catapult_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}},"warlord":{"faction":"orc","portrait":"/art/portraits/warlord.png","worldScale":{"x":1.8,"y":2.15},"states":{"idle":{"src":"/art/characters/warlord/warlord_idle_sheet.png","frameSize":64,"frameCount":4,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"walk":{"src":"/art/characters/warlord/warlord_walk_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"attack":{"src":"/art/characters/warlord/warlord_attack_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"hurt":{"src":"/art/characters/warlord/warlord_hurt_sheet.png","frameSize":64,"frameCount":3,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]},"death":{"src":"/art/characters/warlord/warlord_death_sheet.png","frameSize":64,"frameCount":6,"rowCount":8,"directionOrder":["south","south_east","east","north_east","north","north_west","west","south_west"]}}}}'),z_={keep:{faction:"human",sprite:"/art/buildings/keep.png",portrait:"/art/portraits/keep.png",worldScale:{x:5.2,y:4.8}},farm:{faction:"human",sprite:"/art/buildings/farm.png",portrait:"/art/portraits/farm.png",worldScale:{x:3,y:2.7}},barracks:{faction:"human",sprite:"/art/buildings/barracks.png",portrait:"/art/portraits/barracks.png",worldScale:{x:4.2,y:3.7}},archery_range:{faction:"human",sprite:"/art/buildings/archery_range.png",portrait:"/art/portraits/archery_range.png",worldScale:{x:4,y:3.5}},sanctum:{faction:"human",sprite:"/art/buildings/sanctum.png",portrait:"/art/portraits/sanctum.png",worldScale:{x:4,y:3.9}},blacksmith:{faction:"human",sprite:"/art/buildings/blacksmith.png",portrait:"/art/portraits/blacksmith.png",worldScale:{x:3.8,y:3.4}},workshop:{faction:"human",sprite:"/art/buildings/workshop.png",portrait:"/art/portraits/workshop.png",worldScale:{x:4.3,y:3.8}},watch_tower:{faction:"human",sprite:"/art/buildings/watch_tower.png",portrait:"/art/portraits/watch_tower.png",worldScale:{x:2.7,y:4.5}},stronghold:{faction:"orc",sprite:"/art/buildings/stronghold.png",portrait:"/art/portraits/stronghold.png",worldScale:{x:5.2,y:4.8}},war_hut:{faction:"orc",sprite:"/art/buildings/war_hut.png",portrait:"/art/portraits/war_hut.png",worldScale:{x:3,y:2.7}},war_camp:{faction:"orc",sprite:"/art/buildings/war_camp.png",portrait:"/art/portraits/war_camp.png",worldScale:{x:4.2,y:3.7}},beast_den:{faction:"orc",sprite:"/art/buildings/beast_den.png",portrait:"/art/portraits/beast_den.png",worldScale:{x:4,y:3.5}},spirit_lodge:{faction:"orc",sprite:"/art/buildings/spirit_lodge.png",portrait:"/art/portraits/spirit_lodge.png",worldScale:{x:4,y:3.9}},war_forge:{faction:"orc",sprite:"/art/buildings/war_forge.png",portrait:"/art/portraits/war_forge.png",worldScale:{x:3.8,y:3.4}},siege_pit:{faction:"orc",sprite:"/art/buildings/siege_pit.png",portrait:"/art/portraits/siege_pit.png",worldScale:{x:4.3,y:3.8}},watch_post:{faction:"orc",sprite:"/art/buildings/watch_post.png",portrait:"/art/portraits/watch_post.png",worldScale:{x:2.7,y:4.5}}},H_={resources:{gold:"/art/icons/resources/gold.png",wood:"/art/icons/resources/wood.png",supply:"/art/icons/resources/supply.png"},commands:{harvest:"/art/icons/commands/harvest.png","build-farm":"/art/icons/commands/build-farm.png","build-barracks":"/art/icons/commands/build-barracks.png","build-tower":"/art/icons/commands/build-tower.png","build-archery":"/art/icons/commands/build-archery.png","build-blacksmith":"/art/icons/commands/build-blacksmith.png","train-worker":"/art/icons/commands/train-worker.png","train-melee":"/art/icons/commands/train-melee.png","train-ranged":"/art/icons/commands/train-ranged.png",attack:"/art/icons/commands/attack.png",stop:"/art/icons/commands/stop.png"}},G_={frames:{panel:{src:"/art/ui/frame_panel.png",slice:16},button:{src:"/art/ui/frame_button.png",slice:10},minimap:{src:"/art/ui/frame_minimap.png",slice:16},portrait:{src:"/art/ui/frame_portrait.png",slice:10}}},V_={fire:"/art/vfx/fire.png",smoke:"/art/vfx/smoke.png",explosion:"/art/vfx/explosion.png",heal:"/art/vfx/heal.png",lightning:"/art/vfx/lightning.png",hit_spark:"/art/vfx/hit_spark.png"},W_={characters:k_,buildings:z_,icons:H_,ui:G_,vfx:V_},Dn=W_;function X_(r){return Dn.characters[r]??null}function q_(r,t="idle"){return Dn.characters[r]?.states[t]??null}function Y_(r){return Dn.buildings[r]??null}function Nc(r){return Dn.characters[r]?.portrait??Dn.buildings[r]?.portrait??null}function ln(r){return Dn.icons.commands[r]??null}function Ks(r){return Dn.icons.resources[r]??null}function $_(r){return Dn.ui.frames[r]??null}function j_(r){return Dn.vfx[r]??null}function ai(r,t,e,n){const i=$_(t);if(!i)return;const s=e??Math.max(4,Math.round(i.slice*.5));r.style.border=`${s}px solid transparent`,r.style.borderImageSource=`url(${i.src})`,r.style.borderImageSlice=`${i.slice} fill`,r.style.borderImageWidth=`${s}px`,r.style.borderImageRepeat="stretch",n!==void 0&&(r.style.background=n)}var Ni=(r=>(r.Normal="Normal",r.Pierce="Pierce",r.Siege="Siege",r.Magic="Magic",r))(Ni||{}),Fi=(r=>(r.Light="Light",r.Medium="Medium",r.Heavy="Heavy",r.Fortified="Fortified",r))(Fi||{}),fn=(r=>(r.Human="Human",r.Orc="Orc",r))(fn||{}),be=(r=>(r.Grassland="Grassland",r.Forest="Forest",r.Cliff="Cliff",r.Road="Road",r))(be||{});const K_={[be.Grassland]:5934908,[be.Forest]:2972199,[be.Cliff]:8022613,[be.Road]:11575440},Z_=3368635,J_=6719692,Q_=13412932,tg=4491306,eg=6719556,ng=13386786;function Fc(r){return r===fn.Human?{primary:Z_,secondary:J_,accent:Q_}:{primary:tg,secondary:eg,accent:ng}}function Tt(r,t){return new In({color:r,emissive:t?.emissive??0,roughness:t?.roughness??.7,metalness:t?.metalness??0})}const ls=new Map;function wt(r,t){let e=ls.get(r);return e||(e=t(),ls.set(r,e)),e}class ig{_materials=new Map;_spriteMaterials=new Map;_textures=new Map;createTerrainLayer(t){const e=new de;e.name="terrain-layer";const n=new Map;for(const s of t.terrainTiles){const o=this._getTerrainGeometryKey(s,t.terrainAtlas),a=this._getTerrainGeometry(s,t.terrainAtlas),c=this._getTerrainMaterial(t.terrainAtlas,s.terrain),l=`${o}|${c.uuid}`;let u=n.get(l);u||(u={geometry:a,material:c,positions:[]},n.set(l,u)),u.positions.push({x:s.x,z:s.z})}const i=new ie;for(const s of n.values()){const o=new kh(s.geometry,s.material,s.positions.length);o.receiveShadow=!0,o.frustumCulled=!1;for(let a=0;a<s.positions.length;a++){const{x:c,z:l}=s.positions[a];i.makeTranslation(c,0,l),o.setMatrixAt(a,i)}o.instanceMatrix.needsUpdate=!0,e.add(o)}return e}createTerrainTile(t,e){const n=new st(this._getTerrainGeometry(t,e),this._getTerrainMaterial(e,t.terrain));return n.position.set(t.x,0,t.z),n.receiveShadow=!0,n}createUnitMesh(t,e){const n=Fc(t),i=e??"generic",s=this._createCharacterSprite(i);if(s!==null)return s;switch(i){case"peasant":case"thrall":return this._makeWorker(n);case"footman":case"grunt":return this._makeMelee(n);case"archer":case"hunter":return this._makeRanged(n);case"knight":case"berserker":return this._makeMounted(n);case"cleric":case"shaman":return this._makeCaster(n);case"catapult":case"war_catapult":return this._makeSiege(n);case"captain":case"warlord":return this._makeHero(n);default:return this._makeMelee(n)}}_makeWorker(t){const e=new de,n=new st(wt("wcyl",()=>new Ee(.25,.3,.7,8)),Tt(t.secondary));n.position.y=.35,e.add(n);const i=new st(wt("wsph",()=>new Qe(.18,8,6)),Tt(14531464));i.position.y=.85,e.add(i);const s=new st(wt("wbox",()=>new jt(.1,.5,.1)),Tt(8947848,{metalness:.5}));return s.position.set(.35,.5,0),s.rotation.z=-.3,e.add(s),e}_makeMelee(t){const e=new de,n=new st(wt("mbod",()=>new jt(.5,.9,.4)),Tt(t.primary));n.position.y=.45,e.add(n);const i=new st(wt("msph",()=>new Qe(.2,8,6)),Tt(14531464));i.position.y=1.05,e.add(i);const s=new st(wt("mshd",()=>new jt(.08,.5,.4)),Tt(t.accent,{metalness:.4}));s.position.set(-.35,.5,0),e.add(s);const o=new st(wt("mswd",()=>new Ee(.03,.03,.7,4)),Tt(13421772,{metalness:.7}));return o.position.set(.35,.6,0),o.rotation.z=-.2,e.add(o),e}_makeRanged(t){const e=new de,n=new st(wt("rbod",()=>new Ee(.2,.25,.8,8)),Tt(t.secondary));n.position.y=.4,e.add(n);const i=new st(wt("rsph",()=>new Qe(.17,8,6)),Tt(14531464));i.position.y=.95,e.add(i);const s=new st(wt("rbow",()=>new gr(.3,.025,4,8,Math.PI)),Tt(9136404));return s.position.set(.3,.55,0),s.rotation.y=Math.PI/2,e.add(s),e}_makeMounted(t){const e=new de,n=new st(wt("hors",()=>new jt(.5,.6,.9)),Tt(9136450));n.position.y=.3,e.add(n);for(const[a,c]of[[-.15,-.3],[.15,-.3],[-.15,.3],[.15,.3]]){const l=new st(wt("hleg",()=>new Ee(.04,.04,.3,4)),Tt(9136450));l.position.set(a,0,c),e.add(l)}const i=new st(wt("ridr",()=>new jt(.35,.5,.3)),Tt(t.primary));i.position.y=.85,e.add(i);const s=new st(wt("rhdm",()=>new Qe(.15,8,6)),Tt(14531464));s.position.y=1.25,e.add(s);const o=new st(wt("lnce",()=>new Ee(.02,.02,1.2,4)),Tt(11184810,{metalness:.5}));return o.position.set(.3,.9,.3),o.rotation.x=-.5,e.add(o),e}_makeCaster(t){const e=new de,n=new st(wt("crob",()=>new Hn(.35,.9,8)),Tt(t.primary));n.position.y=.45,e.add(n);const i=new st(wt("csph",()=>new Qe(.18,8,6)),Tt(14531464));i.position.y=1,e.add(i);const s=new st(wt("chat",()=>new Hn(.2,.35,6)),Tt(t.accent));s.position.y=1.3,e.add(s);const o=new st(wt("cstf",()=>new Ee(.03,.03,1.1,4)),Tt(9136404));o.position.set(.35,.55,0),e.add(o);const a=new st(wt("corb",()=>new Qe(.1,6,4)),Tt(4521983,{emissive:2271914}));return a.position.set(.35,1.15,0),e.add(a),e}_makeSiege(t){const e=new de,n=new st(wt("sbas",()=>new jt(1,.3,.7)),Tt(6965802));n.position.y=.15,e.add(n);for(const[o,a]of[[-.4,-.35],[.4,-.35],[-.4,.35],[.4,.35]]){const c=new st(wt("swhl",()=>new Ee(.15,.15,.08,8)),Tt(4864554));c.position.set(o,.15,a),c.rotation.x=Math.PI/2,e.add(c)}const i=new st(wt("sarm",()=>new jt(.12,.8,.12)),Tt(6965802));i.position.set(0,.6,0),i.rotation.z=.4,e.add(i);const s=new st(wt("scw",()=>new jt(.25,.25,.25)),Tt(5592405,{metalness:.3}));return s.position.set(-.3,.9,0),e.add(s),e}_makeHero(t){const e=new de,n=new st(wt("hbod",()=>new jt(.6,1.1,.5)),Tt(t.primary));n.position.y=.55,e.add(n);const i=new st(wt("hhd",()=>new Qe(.22,8,6)),Tt(14531464));i.position.y=1.25,e.add(i);const s=new st(wt("hcrn",()=>new Ee(.18,.22,.15,8)),Tt(t.accent,{metalness:.6}));s.position.y=1.48,e.add(s);const o=new st(wt("hshd",()=>new jt(.1,.7,.5)),Tt(t.accent,{metalness:.4}));o.position.set(-.4,.6,0),e.add(o);const a=new st(wt("hswd",()=>new Ee(.04,.04,.9,4)),Tt(15658734,{metalness:.8}));a.position.set(.4,.75,0),a.rotation.z=-.15,e.add(a);const c=new st(wt("hcap",()=>new jt(.5,.8,.05)),Tt(t.accent,{emissive:t.accent&4473924}));return c.position.set(0,.5,-.28),e.add(c),e}createBuildingMesh(t,e){const n=Fc(t),i=e??"generic",s=this._createBuildingSprite(i);if(s!==null)return s;switch(i){case"keep":case"stronghold":return this._makeHQ(n);case"farm":case"war_hut":return this._makeFarm(n);case"barracks":case"war_camp":return this._makeBarracks(n);case"archery_range":case"beast_den":return this._makeRange(n);case"watch_tower":case"watch_post":return this._makeTower(n);case"blacksmith":case"war_forge":return this._makeSmith(n);case"sanctum":case"spirit_lodge":return this._makeTemple(n);case"workshop":case"siege_pit":return this._makeWorkshop(n);default:return this._makeBarracks(n)}}_makeHQ(t){const e=new de,n=new st(wt("hqm",()=>new jt(3,2,3)),Tt(t.primary));n.position.y=1,e.add(n);const i=new st(wt("hqt",()=>new jt(1.2,1.5,1.2)),Tt(t.secondary));i.position.set(.5,2.75,.5),e.add(i);const s=new st(wt("hqr",()=>new Hn(1,1,4)),Tt(t.accent));s.position.set(.5,3.8,.5),s.rotation.y=Math.PI/4,e.add(s);const o=new st(wt("hqfp",()=>new Ee(.03,.03,1.5,4)),Tt(8947848));o.position.set(.5,4.55,.5),e.add(o);const a=new st(wt("hqfl",()=>new jt(.5,.3,.02)),Tt(t.accent));return a.position.set(.75,5.1,.5),e.add(a),e}_makeFarm(t){const e=new de,n=new st(wt("frmm",()=>new jt(2,.8,2)),Tt(t.secondary));n.position.y=.4,e.add(n);const i=new st(wt("frmr",()=>new jt(2.2,.1,1.5)),Tt(9132587));i.position.y=.95,i.rotation.z=.3,e.add(i);const s=new st(wt("frmr",()=>new jt(2.2,.1,1.5)),Tt(9132587));return s.position.y=.95,s.rotation.z=-.3,e.add(s),e}_makeBarracks(t){const e=new de,n=new st(wt("brkm",()=>new jt(2.5,1.5,2.5)),Tt(t.primary));n.position.y=.75,e.add(n);const i=new st(wt("brkt",()=>new jt(2.7,.1,2.7)),Tt(t.accent));i.position.y=1.55,e.add(i);const s=new st(wt("brkd",()=>new jt(.6,.9,.05)),Tt(4864554));return s.position.set(0,.45,1.28),e.add(s),e}_makeRange(t){const e=new de,n=new st(wt("rngw",()=>new jt(.15,1.2,2)),Tt(t.secondary));n.position.set(-1,.6,0),e.add(n);const i=new st(wt("rngw",()=>new jt(.15,1.2,2)),Tt(t.secondary));i.position.set(1,.6,0),e.add(i);const s=new st(wt("rngt",()=>new Ee(.4,.4,.05,12)),Tt(13378082));return s.position.set(0,.8,-.95),s.rotation.x=Math.PI/2,e.add(s),e}_makeTower(t){const e=new de,n=new st(wt("twrm",()=>new jt(1,3,1)),Tt(t.primary));n.position.y=1.5,e.add(n);const i=new st(wt("twrc",()=>new Hn(.7,.8,4)),Tt(t.accent));return i.position.y=3.4,i.rotation.y=Math.PI/4,e.add(i),e}_makeSmith(t){const e=new de,n=new st(wt("smtm",()=>new jt(2,1.2,2)),Tt(t.secondary));n.position.y=.6,e.add(n);const i=new st(wt("smtc",()=>new Ee(.2,.25,1.2,8)),Tt(5592405));i.position.set(.6,1.8,.6),e.add(i);const s=new st(wt("smtg",()=>new jt(.6,.4,.05)),Tt(16737792,{emissive:16724736}));return s.position.set(0,.3,1.03),e.add(s),e}_makeTemple(t){const e=new de,n=new st(wt("tmpm",()=>new Hn(1.2,2.5,6)),Tt(t.primary));n.position.y=1.25,e.add(n);const i=new st(wt("tmpo",()=>new Qe(.25,8,6)),Tt(4521983,{emissive:2271914}));return i.position.y=2.7,e.add(i),e}_makeWorkshop(t){const e=new de,n=new st(wt("wkpm",()=>new jt(3,1,2)),Tt(t.secondary));n.position.y=.5,e.add(n);const i=new st(wt("wkpa",()=>new jt(.1,.1,1.5)),Tt(6965802));i.position.set(.5,1.3,-.5),e.add(i);const s=new st(wt("wkph",()=>new Ee(.02,.02,.5,4)),Tt(8947848));return s.position.set(.5,1,-1.2),e.add(s),e}_getTerrainGeometryKey(t,e){return!e||t.atlasFrame===null?"terrain-fallback-plane":`terrain-plane-${t.atlasFrame.col}-${t.atlasFrame.row}-${t.rotationQuarterTurns}`}_getTerrainGeometry(t,e){const n=this._getTerrainGeometryKey(t,e);return wt(n,()=>{const i=new Yn(1,1);return i.rotateX(-Math.PI/2),e&&t.atlasFrame&&this._applyTerrainAtlasUVs(i,e,t.atlasFrame.col,t.atlasFrame.row,t.rotationQuarterTurns),i})}_applyTerrainAtlasUVs(t,e,n,i,s){const o=t.getAttribute("uv");if(!(o instanceof Xe))return;const a=1/e.columns,c=1/e.rows,l=a*.035,u=c*.035,h=n*a+l,d=(n+1)*a-l,p=1-i*c-u,_=1-(i+1)*c+u,x=(h+d)*.5,m=(p+_)*.5,f=[{u:h,v:p},{u:d,v:p},{u:h,v:_},{u:d,v:_}];for(let E=0;E<f.length;E++){let{u:w,v:y}=f[E];for(let P=0;P<s;P++){const C=w-x,T=y-m;w=x+T,y=m-C}o.setXY(E,w,y)}o.needsUpdate=!0}_getTerrainMaterial(t,e){if(!t)return this._getMat(`terrain-${e}`,K_[e]);const n=`terrain-atlas:${t.image}`;let i=this._materials.get(n);return i||(i=new In({color:16777215,map:this._getTexture(t.image),roughness:1,metalness:0}),this._materials.set(n,i)),i}_getTexture(t){let e=this._textures.get(t);return e||(e=new Pl().load(t),e.colorSpace=Ne,e.wrapS=Ve,e.wrapT=Ve,e.minFilter=ve,e.magFilter=ve,e.generateMipmaps=!1,this._textures.set(t,e)),e}_getTextureFrame(t,e,n,i,s){const o=`frame:${t}:${e}:${n}:${i}:${s}`;let a=this._textures.get(o);return a||(a=this._getTexture(t).clone(),a.colorSpace=Ne,a.wrapS=Ve,a.wrapT=Ve,a.minFilter=ve,a.magFilter=ve,a.generateMipmaps=!1,a.repeat.set(1/i,1/s),a.offset.set(e/i,1-(n+1)/s),a.needsUpdate=!0,this._textures.set(o,a)),a}_createCharacterSprite(t){const e=X_(t),n=q_(t,"idle");if(e===null||n===null)return null;const i=this._getTextureFrame(n.src,0,0,n.frameCount,n.rowCount),s=this._getSpriteMaterial(`character:${n.src}:0:0`,i),o=new Ho(s);return o.center.set(.5,0),o.scale.set(e.worldScale.x,e.worldScale.y,1),o}_createBuildingSprite(t){const e=Y_(t);if(e===null)return null;const n=this._getSpriteMaterial(`building:${e.sprite}`,this._getTexture(e.sprite)),i=new Ho(n);return i.center.set(.5,0),i.scale.set(e.worldScale.x,e.worldScale.y,1),i}_getSpriteMaterial(t,e){let n=this._spriteMaterials.get(t);return n||(n=new na({map:e,transparent:!0,alphaTest:.08,depthWrite:!1}),this._spriteMaterials.set(t,n)),n}_getMat(t,e){let n=this._materials.get(t);return n||(n=new In({color:e,roughness:.8}),this._materials.set(t,n)),n}dispose(){for(const t of this._materials.values())t.dispose();this._materials.clear();for(const t of this._spriteMaterials.values())t.dispose();this._spriteMaterials.clear();for(const t of this._textures.values())t.dispose();this._textures.clear();for(const t of ls.values())t.dispose();ls.clear()}}function rg(r){const t=new Map,e=[r.humanUnits,r.orcUnits,r.humanBuildings,r.orcBuildings];for(const n of e)n===void 0||t.has(n.faction)||t.set(n.faction,{id:n.faction,faction:n.faction});return[...t.values()]}function sg(r){return Array.isArray(r.players)&&r.players.length>0?r.players:rg(r)}function Ol(r){const t=new Map;for(const e of sg(r)){if(t.has(e.id))throw new Error(`Duplicate player slot: ${e.id}`);t.set(e.id,e)}return t}function Bl(r,t){const e=r.get(t);if(e!==void 0)return e;throw new Error(`Unknown player slot: ${t}`)}function kl(r){const t=new Map;for(const e of r){if(t.has(e.faction))throw new Error(`Duplicate faction config: ${e.faction}`);t.set(e.faction,e)}return t}const og={normal:Ni.Normal,pierce:Ni.Pierce,siege:Ni.Siege,magic:Ni.Magic},ag={light:Fi.Light,medium:Fi.Medium,heavy:Fi.Heavy,fortified:Fi.Fortified};function zl(r){return og[r.toLowerCase()]??Ni.Normal}function Hl(r){return ag[r.toLowerCase()]??Fi.Light}const Et="Owner",Ht="Position",We="Movement",qe="Health",la="CombatStats",Ki="Armor",_e="Alive",dn="AttackTarget",ps="Harvester",pr="ResourceNode",gn="Construction",vr="TrainingQueue",Be="Building",Te="Unit",Gl="Selectable",Vl="SelectionRing",cg="FactionTag",Wl="Worker",ua="DisplayStats",ns="Tech",ms="Renderable",qi="Buffs",Wo="SpellCaster",Xl="AuraSource",_s="BloodRush";function Oc(r){switch(r){case"human":return fn.Human;case"orc":return fn.Orc;default:throw new Error(`Unsupported faction: ${r}`)}}class lg{constructor(t,e,n,i,s){this.world=t,this.config=e,this.sceneManager=n,this.meshFactory=i,this.hpBarSystem=s,this.playerConfigs=Ol(e),this.factionUnits=kl([e.humanUnits,e.orcUnits]);for(const o of this.playerConfigs.values()){const a=this.factionUnits.get(o.faction);if(a===void 0)throw new Error(`Missing unit config for faction: ${o.faction}`);for(const c of a.units)this.unitLookup.set(`${o.id}:${c.id}`,c)}}unitLookup=new Map;playerConfigs;factionUnits;getUnitDef(t,e){return this.unitLookup.get(`${e}:${t}`)}createUnit(t,e,n,i){const s=Bl(this.playerConfigs,e),o=this.unitLookup.get(`${s.id}:${t}`);if(!o)throw new Error(`Unknown unit: ${s.id}:${t}`);const a=this.world.createEntity();this.world.addComponent(a,Ht,{x:n,z:i}),this.world.addComponent(a,qe,{current:o.hp,max:o.hp}),this.world.addComponent(a,We,{targetX:void 0,targetZ:void 0,speed:o.moveSpeed,waypoints:[],waypointIndex:0}),o.canAttack&&this.world.addComponent(a,la,{baseDamage:o.baseDamage,bonusDamage:0,weaponLevel:0,attackType:zl(o.attackType),attackRange:o.attackRange,attackCooldown:o.attackCooldown,attackCooldownRemaining:0}),this.world.addComponent(a,Ki,{armorType:Hl(o.armorType),armorValue:o.armorValue,bonusArmor:0,armorLevel:0}),this.world.addComponent(a,ua,{armor:o.armorValue,damage:o.canAttack?o.baseDamage:0,range:o.canAttack?o.attackRange:0,sight:o.sightRange,speed:o.moveSpeed}),this.world.addComponent(a,_e,{}),this.world.addComponent(a,Et,{faction:Oc(s.faction),playerId:s.id}),this.world.addComponent(a,Te,{unitId:o.id,displayName:o.name,tier:o.tier,supplyCost:o.supplyCost,isWorker:o.isWorker}),o.isWorker&&(this.world.addComponent(a,Wl,{}),this.world.addComponent(a,ps,{state:"idle",assignedResource:0,assignedDropOff:0,carryType:"gold",carryAmount:0,gatherTimer:0}));const c=this.meshFactory.createUnitMesh(Oc(s.faction),o.id);c.position.set(n,0,i);const l=`unit-${a}`;c.userData.entityId=a,this.sceneManager.addObject(l,c),this.world.addComponent(a,ms,{sceneKey:l,visible:!0}),this.world.addComponent(a,Gl,{selected:!1});const u=new gr(.55,.05,8,24),h=new Wn({color:4059840}),d=new st(u,h);return d.rotation.x=-Math.PI/2,d.position.set(n,.05,i),d.visible=!1,this.sceneManager.addObject(`unit-ring-${a}`,d),this.world.addComponent(a,Vl,{mesh:d}),this.addFactionComponents(a,o,s),this.hpBarSystem.registerBar(a),a}addFactionComponents(t,e,n){const i=this.config.factionAbilities,{bloodRush:s,disciplineAura:o,spells:a}=i;this.world.addComponent(t,qi,{buffList:[]});const c=a.spells.filter(l=>l.faction===n.faction&&l.caster===e.id);if(c.length>0&&this.world.addComponent(t,Wo,{spellIds:c.map(l=>l.id),cooldowns:new Map}),o.sources.includes(e.id)){const l=n.faction==="human"?"discipline_aura":n.faction==="orc"?"warlord_aura":void 0;l!==void 0&&this.world.addComponent(t,Xl,{auraId:l,radius:o.radius,updateTimer:0})}n.faction==="orc"&&!s.excludeTypes.includes(e.id)&&this.world.addComponent(t,_s,{hpThreshold:s.hpThreshold,maxBonus:s.maxBonus,bonusIncrease:0,currentBonus:0})}}const ug=8;function Bc(r){switch(r){case"human":return fn.Human;case"orc":return fn.Orc;default:throw new Error(`Unsupported faction: ${r}`)}}function hg(r){const t=r.split("x");return parseInt(t[0],10)||3}class dg{constructor(t,e,n,i,s){this.world=t,this.config=e,this.sceneManager=n,this.meshFactory=i,this.hpBarSystem=s,this.playerConfigs=Ol(e),this.factionBuildings=kl([e.humanBuildings,e.orcBuildings]);for(const o of this.playerConfigs.values()){const a=this.factionBuildings.get(o.faction);if(a===void 0)throw new Error(`Missing building config for faction: ${o.faction}`);for(const c of a.buildings)this.buildingLookup.set(`${o.id}:${c.id}`,c)}}buildingLookup=new Map;playerConfigs;factionBuildings;getBuildingDef(t,e){return this.buildingLookup.get(`${e}:${t}`)}createBuilding(t,e,n,i,s=!1,o=0){const a=Bl(this.playerConfigs,e),c=this.buildingLookup.get(`${a.id}:${t}`);if(!c)throw new Error(`Unknown building: ${a.id}:${t}`);const l=this.world.createEntity(),u=hg(c.gridSize);this.world.addComponent(l,Ht,{x:n,z:i}),this.world.addComponent(l,qe,{current:s?c.hp:1,max:c.hp}),this.world.addComponent(l,Ki,{armorType:Hl(c.armorType),armorValue:c.armorValue,bonusArmor:0,armorLevel:0}),this.world.addComponent(l,ua,{armor:c.armorValue,damage:c.attack?.damage??0,range:c.attack?.range??0,sight:ug,speed:0}),this.world.addComponent(l,_e,{}),this.world.addComponent(l,Et,{faction:Bc(a.faction),playerId:a.id}),this.world.addComponent(l,Be,{buildingId:c.id,displayName:c.name,populationProvided:c.populationProvided,gridSize:c.gridSize,isComplete:s}),s||this.world.addComponent(l,gn,{buildTime:c.buildTime,elapsed:0,builderEntity:o}),c.trains.length>0&&this.world.addComponent(l,vr,{queue:[],progress:0,currentBuildTime:0}),c.canAttack&&c.attack&&this.world.addComponent(l,la,{baseDamage:c.attack.damage,bonusDamage:0,weaponLevel:0,attackType:zl(c.attack.attackType),attackRange:c.attack.range,attackCooldown:c.attack.cooldown,attackCooldownRemaining:0});const h=this.meshFactory.createBuildingMesh(Bc(a.faction),c.id);h.position.set(n,0,i);const d=`building-${l}`;h.userData.entityId=l,this.sceneManager.addObject(d,h),this.world.addComponent(l,ms,{sceneKey:d,visible:!0}),this.world.addComponent(l,Gl,{selected:!1});const p=u*.65,_=new gr(p,.07,8,32),x=new Wn({color:4059840}),m=new st(_,x);return m.rotation.x=-Math.PI/2,m.position.set(n,.05,i),m.visible=!1,this.sceneManager.addObject(`building-ring-${l}`,m),this.world.addComponent(l,Vl,{mesh:m}),this.hpBarSystem.registerBar(l),l}}class Ye{world;enabled=!0;init(t){this.world=t}destroy(){}}const fg=.05;class pg extends Ye{name="MovementSystem";_scene;constructor(t){super(),this._scene=t}update(t){for(const[e,n]of this.world.query(We,Ht)){if(n.targetX===void 0||n.targetZ===void 0)continue;const i=this.world.getComponent(e,Ht);if(i===void 0)continue;const s=n.waypoints!==void 0&&n.waypoints.length>0&&n.waypointIndex<n.waypoints.length;let o,a;s?(o=n.waypoints[n.waypointIndex].x,a=n.waypoints[n.waypointIndex].z):(o=n.targetX,a=n.targetZ);const c=o-i.x,l=a-i.z,u=Math.sqrt(c*c+l*l);if(u<=fg)i.x=o,i.z=a,s?(n.waypointIndex++,n.waypointIndex>=n.waypoints.length&&(n.waypoints=[],n.waypointIndex=0,n.targetX=void 0,n.targetZ=void 0)):(n.targetX=void 0,n.targetZ=void 0);else{const d=Math.min(n.speed*t,u);i.x+=c/u*d,i.z+=l/u*d}const h=this.world.getComponent(e,ms);if(h!==void 0&&h.visible){const d=this._scene.getObject(h.sceneKey);d!==void 0&&(d.position.x=i.x,d.position.z=i.z)}}}}class mg extends Ye{name="HarvestSystem";_bus;_config;constructor(t,e){super(),this._bus=t,this._config=e}update(t){for(const[e,n]of this.world.query(ps))switch(n.state){case"idle":break;case"movingToResource":this._tickMovingToResource(e,n);break;case"harvesting":this._tickHarvesting(e,n,t);break;case"movingToDropOff":this._tickMovingToDropOff(e,n);break;case"droppingOff":this._tickDroppingOff(e,n,t);break}}_tickMovingToResource(t,e){const n=this.world.getComponent(t,We);n!==void 0&&n.targetX===void 0&&(e.gatherTimer=0,e.state="harvesting")}_tickHarvesting(t,e,n){if(e.assignedResource===ge){e.state="idle";return}const i=this.world.getComponent(e.assignedResource,pr);if(i===void 0||i.remaining<=0){e.state="idle";return}const s=e.carryType==="gold"?this._config.goldMine.mineTime:this._config.tree.chopTime;if(e.gatherTimer+=n,e.gatherTimer<s)return;const o=e.carryType==="gold"?this._config.goldMine.workerCarry:this._config.tree.workerCarry,a=Math.min(o,i.remaining);i.remaining-=a,e.carryAmount=a,e.gatherTimer=0,i.remaining<=0&&this._bus.emit("RESOURCE_DEPLETED",{nodeEntity:e.assignedResource,kind:e.carryType}),e.assignedDropOff!==ge?this._issueMoveToDropOff(t,e):e.state="idle"}_tickMovingToDropOff(t,e){const n=this.world.getComponent(t,We);n!==void 0&&n.targetX===void 0&&(e.gatherTimer=0,e.state="droppingOff")}_tickDroppingOff(t,e,n){if(e.gatherTimer+=n,e.gatherTimer<this._config.dropOffTime)return;const i=this.world.getComponent(t,Et);if(i!==void 0&&e.carryAmount>0&&this._bus.emit("RESOURCE_DEPOSITED",{playerId:i.playerId,kind:e.carryType,amount:e.carryAmount,workerEntity:t,dropOffEntity:e.assignedDropOff}),e.carryAmount=0,e.gatherTimer=0,e.assignedResource!==ge){const s=this.world.getComponent(e.assignedResource,pr);if(s!==void 0&&s.remaining>0){this._issueMoveToResource(t,e);return}}e.state="idle"}_issueMoveToResource(t,e){const n=this.world.getComponent(e.assignedResource,Ht);if(n===void 0){e.state="idle";return}const i=this.world.getComponent(t,We);if(i===void 0){e.state="idle";return}i.targetX=n.x,i.targetZ=n.z,e.state="movingToResource"}_issueMoveToDropOff(t,e){const n=this.world.getComponent(e.assignedDropOff,Ht);if(n===void 0){e.state="idle";return}const i=this.world.getComponent(t,We);if(i===void 0){e.state="idle";return}i.targetX=n.x,i.targetZ=n.z,e.state="movingToDropOff"}}class _g{_bus;_world;_config;_players=new Map;_unsubs=[];constructor(t,e,n){this._bus=t,this._world=e,this._config=n,this._subscribeToEvents()}initPlayer(t){this._players.set(t,{gold:this._config.gold,wood:this._config.wood,supplyUsed:0,supplyCap:this._config.initialSupply})}getResources(t){return this._players.get(t)}canAfford(t,e){const n=this._players.get(t);return n===void 0?!1:n.gold>=e.gold&&n.wood>=e.wood}hasSupply(t,e){const n=this._players.get(t);return n===void 0?!1:n.supplyUsed+e<=Math.min(n.supplyCap,this._config.maxSupplyCap)}spend(t,e){const n=this._players.get(t);if(n===void 0)return;const i={gold:n.gold,wood:n.wood};n.gold-=e.gold,n.wood-=e.wood,this._bus.emit("RESOURCES_CHANGED",{playerId:t,gold:n.gold,wood:n.wood,goldDelta:n.gold-i.gold,woodDelta:n.wood-i.wood})}credit(t,e,n){const i=this._players.get(t);if(i===void 0)return;const s={gold:i.gold,wood:i.wood};e==="gold"?i.gold+=n:i.wood+=n,this._bus.emit("RESOURCES_CHANGED",{playerId:t,gold:i.gold,wood:i.wood,goldDelta:i.gold-s.gold,woodDelta:i.wood-s.wood})}addSupplyCap(t,e){const n=this._players.get(t);n===void 0||e<=0||(n.supplyCap=Math.min(n.supplyCap+e,this._config.maxSupplyCap),this._bus.emit("SUPPLY_CHANGED",{playerId:t,current:n.supplyUsed,cap:n.supplyCap}))}chargeSupply(t,e){const n=this._players.get(t);n!==void 0&&(n.supplyUsed+=e,this._bus.emit("SUPPLY_CHANGED",{playerId:t,current:n.supplyUsed,cap:n.supplyCap}))}refundSupply(t,e){const n=this._players.get(t);n!==void 0&&(n.supplyUsed=Math.max(0,n.supplyUsed-e),this._bus.emit("SUPPLY_CHANGED",{playerId:t,current:n.supplyUsed,cap:n.supplyCap}))}destroy(){for(const t of this._unsubs)t();this._unsubs.length=0}_subscribeToEvents(){this._unsubs.push(this._bus.on("RESOURCE_DEPOSITED",t=>{this.credit(t.playerId,t.kind,t.amount)}),this._bus.on("BUILDING_COMPLETE",t=>{const e=this._world.getComponent(t.entityId,Be);e!==void 0&&e.populationProvided>0&&this.addSupplyCap(t.playerId,e.populationProvided)}),this._bus.on("UNIT_TRAINED",t=>{const e=this._world.getComponent(t.spawnedEntity,Te);e!==void 0&&this.chargeSupply(t.playerId,e.supplyCost)}),this._bus.on("UNIT_DIED",t=>{const e=this._world.getComponent(t.entityId,Te);if(e!==void 0){const i=this._world.getComponent(t.entityId,Et)?.playerId??t.faction.toLowerCase();this.refundSupply(i,e.supplyCost)}}))}}class gg extends Ye{constructor(t){super(),this.eventBus=t}name="ConstructionSystem";_unsubUnitDied;init(t){super.init(t),this._unsubUnitDied=this.eventBus.on("UNIT_DIED",({entityId:e})=>{this._handleBuilderDeath(e)})}destroy(){this._unsubUnitDied?.(),this._unsubUnitDied=void 0}update(t){const e=this.world;for(const[n,i]of e.query(gn)){if(!this._ensureAssignedBuilder(n,i.builderEntity))continue;i.elapsed+=t;const s=e.getComponent(n,qe);if(s){const o=Math.min(i.elapsed/i.buildTime,1);s.current=Math.max(1,Math.floor(s.max*o))}if(i.elapsed>=i.buildTime){s&&(s.current=s.max);const o=e.getComponent(n,Be);o&&(o.isComplete=!0),e.removeComponent(n,gn);const a=e.getComponent(n,Et);this.eventBus.emit("BUILDING_COMPLETE",{entityId:n,buildingId:o?.buildingId??"",faction:a?.faction??fn.Human,playerId:a?.playerId??"human"})}}}_handleBuilderDeath(t){for(const[e,n]of this.world.query(gn))n.builderEntity===t&&this._ensureAssignedBuilder(e,t)}_ensureAssignedBuilder(t,e){if(e!==ge&&this.world.hasComponent(e,_e))return!0;const n=this.world.getComponent(t,gn);return n?(n.builderEntity=this._findReplacementBuilder(t),n.builderEntity!==ge):!1}_findReplacementBuilder(t){const e=this.world.getComponent(t,Et);if(!e)return ge;for(const[n,i]of this.world.query(Te,Et,_e))if(this.world.getComponent(n,Et)?.playerId===e.playerId&&i.isWorker)return n;return ge}}const kc=3;class vg extends Ye{constructor(t,e,n){super(),this.unitFactory=t,this.eventBus=e,this.config=n}name="TrainingQueueSystem";update(t){const e=this.world;for(const[n,i]of e.query(vr)){if(e.hasComponent(n,gn)||i.queue.length===0)continue;const s=i.queue[0];if(i.currentBuildTime===0){const a=e.getComponent(n,Et)?.playerId??"human",c=this.unitFactory.getUnitDef(s,a);i.currentBuildTime=c?.buildTime??20}if(i.progress+=t,i.progress>=i.currentBuildTime){const o=e.getComponent(n,Et),a=e.getComponent(n,Ht),c=o?.playerId??"human",l=(a?.x??0)+kc,u=(a?.z??0)+kc,h=this.unitFactory.createUnit(s,c,l,u),d=c==="human"?fn.Human:fn.Orc;this.eventBus.emit("UNIT_TRAINED",{spawnedEntity:h,unitId:s,faction:d,playerId:c,buildingEntity:n}),i.queue.shift(),i.progress=0,i.currentBuildTime=0}}}}function xg(r,t){const e=r.attackType.toLowerCase(),n=r.armorType.toLowerCase(),i=t.matrix[e]?.[n]??1,s=(r.baseDamage+r.bonusDamage)*i,o=Math.min(1,Math.max(0,r.armorValue*t.armorReductionFactor)),a=s*(1-o),c=Math.max(t.minimumDamage,Math.floor(a));return{rawDamage:s,typeMultiplier:i,armorReduction:o,finalDamage:c}}class yg extends Ye{name="AttackSystem";_bus;_combatConfig;constructor(t,e){super(),this._bus=t,this._combatConfig=e}update(t){for(const[e,n]of this.world.query(dn)){if(!this.world.hasComponent(e,_e)){this.world.removeComponent(e,dn);continue}const i=n.targetEntity;if(i===ge||!this.world.hasComponent(i,_e)){this.world.removeComponent(e,dn);continue}const s=this.world.getComponent(e,la),o=this.world.getComponent(e,Ht),a=this.world.getComponent(i,Ht);if(s===void 0||o===void 0||a===void 0)continue;if(s.attackCooldownRemaining>0){s.attackCooldownRemaining=Math.max(0,s.attackCooldownRemaining-t);continue}const c=a.x-o.x,l=a.z-o.z;if(Math.sqrt(c*c+l*l)>s.attackRange)continue;const h=this.world.getComponent(i,Ki),d=h!==void 0?h.armorValue+h.bonusArmor:0,p=h?.armorType;if(p===void 0)continue;const _=xg({baseDamage:s.baseDamage,bonusDamage:s.bonusDamage,attackType:s.attackType,armorType:p,armorValue:d},this._combatConfig),x=this.world.getComponent(i,qe);x!==void 0&&(x.current=Math.max(0,x.current-_.finalDamage),s.attackCooldownRemaining=s.attackCooldown,this._bus.emit("UNIT_ATTACKED",{attackerEntity:e,targetEntity:i,finalDamage:_.finalDamage}),x.current<=0&&this._handleDeath(i,e))}}_handleDeath(t,e){this.world.removeComponent(t,_e),this.world.removeComponent(t,dn);const n=this.world.getComponent(t,Et),i=n?.faction??fn.Human,s=n?.playerId??"unknown",o=this.world.getComponent(t,Be);o!==void 0?this._bus.emit("BUILDING_DESTROYED",{entityId:t,buildingId:o.buildingId,faction:i,playerId:s,destroyedByEntity:e}):this._bus.emit("UNIT_DIED",{entityId:t,killedByEntity:e,faction:i})}}class Mg{width;height;_walkable;_cost;_neighborBuffer;constructor(t,e){this.width=t,this.height=e;const n=t*e;this._walkable=new Uint8Array(n),this._cost=new Float32Array(n),this._walkable.fill(1),this._cost.fill(1),this._neighborBuffer=[{x:0,z:0},{x:0,z:0},{x:0,z:0},{x:0,z:0}]}isInBounds(t,e){return t>=0&&t<this.width&&e>=0&&e<this.height}isWalkable(t,e){return this.isInBounds(t,e)?this._walkable[e*this.width+t]===1:!1}setWalkable(t,e,n){this.isInBounds(t,e)&&(this._walkable[e*this.width+t]=n?1:0)}getTerrainCost(t,e){return this.isInBounds(t,e)?this._cost[e*this.width+t]:1/0}setTerrainCost(t,e,n){this.isInBounds(t,e)&&(this._cost[e*this.width+t]=n)}getNeighbors(t,e){let n=0;const i=[[t,e-1],[t,e+1],[t-1,e],[t+1,e]];for(const[s,o]of i)this.isWalkable(s,o)&&(this._neighborBuffer[n].x=s,this._neighborBuffer[n].z=o,n++);return this._neighborBuffer.slice(0,n)}}const ql={[be.Grassland]:1,[be.Forest]:1.35,[be.Cliff]:1,[be.Road]:1},Sg={grassland:be.Grassland,forest:be.Forest,cliff:be.Cliff,road:be.Road};function wg(r,t){const e=$l(t.terrain.default),n=Ag(r.width,r.height,e),i=Cg(t.terrain.atlas);return Tg(r,e),bg(r,n,t.treeLines),Eg(r,n,t.terrain.cliffs),{terrainAtlas:i,terrainTiles:Rg(r.width,r.height,n,i)}}function Eg(r,t,e){for(const n of e){const{x:i,z:s,w:o,h:a}=n.rect;for(let c=s;c<s+a;c++)for(let l=i;l<i+o;l++)Yl(r,t,l,c,be.Cliff,!1)}}function bg(r,t,e){for(const n of e){const{start:i,end:s}=n,o=Math.min(i.x,s.x),a=Math.max(i.x,s.x),c=Math.min(i.z,s.z),l=Math.max(i.z,s.z);for(let u=c;u<=l;u++)for(let h=o;h<=a;h++)Yl(r,t,h,u,be.Forest,!1)}}function Tg(r,t){const e=ql[t];for(let n=0;n<r.height;n++)for(let i=0;i<r.width;i++)r.setTerrainCost(i,n,e)}function Ag(r,t,e){return new Array(r*t).fill(e)}function Yl(r,t,e,n,i,s){r.isInBounds(e,n)&&(t[n*r.width+e]=i,r.setWalkable(e,n,s),r.setTerrainCost(e,n,ql[i]))}function Cg(r){if(!r)return null;const t={};for(const[e,n]of Object.entries(r.tiles))n.variants.length!==0&&(t[$l(e)]={variants:n.variants.map(({col:i,row:s})=>({col:i,row:s})),randomRotation:n.randomRotation??!1});return{image:r.image,columns:r.columns,rows:r.rows,tiles:t}}function Rg(r,t,e,n){const i=new Array(r*t);let s=0;for(let o=0;o<t;o++)for(let a=0;a<r;a++){const c=e[o*r+a],l=Ig(a,o,c),u=Pg(n,c),h=u?u.variants[l%u.variants.length]:null,d=u&&u.randomRotation?l>>>8&3:0;i[s++]={x:a,z:o,terrain:c,atlasFrame:h?{col:h.col,row:h.row}:null,rotationQuarterTurns:d}}return i}function Pg(r,t){return r?r.tiles[t]??r.tiles[be.Grassland]??Object.values(r.tiles).find(e=>e!==void 0)??null:null}function $l(r){return Sg[r.toLowerCase()]??be.Grassland}function Ig(r,t,e){let n=Math.imul(r+1,374761393)^Math.imul(t+1,668265263)^Math.imul(e.length+e.charCodeAt(0),1442695041);return n=Math.imul(n^n>>>13,1274126177),(n^n>>>16)>>>0}class Dg{_data=[];_score;constructor(t){this._score=t}push(t){this._data.push(t),this._siftUp(this._data.length-1)}pop(){if(this._data.length===0)return;const t=this._data[0],e=this._data.pop();return this._data.length>0&&(this._data[0]=e,this._siftDown(0)),t}get size(){return this._data.length}clear(){this._data.length=0}_siftUp(t){const e=this._data[t],n=this._score(e);for(;t>0;){const i=t-1>>1,s=this._data[i];if(n>=this._score(s))break;this._data[t]=s,t=i}this._data[t]=e}_siftDown(t){const e=this._data.length,n=this._data[t],i=this._score(n);for(;;){const s=2*t+1,o=2*t+2;let a=t,c=i;if(s<e){const l=this._score(this._data[s]);l<c&&(a=s,c=l)}if(o<e&&this._score(this._data[o])<c&&(a=o),a===t)break;this._data[t]=this._data[a],this._data[a]=n,t=a}}}const Lg=2e3;function zc(r,t,e,n){return Math.abs(r-e)+Math.abs(t-n)}function Ug(r,t,e){const n=Math.floor(Math.min(r.width,r.height)/2);for(let i=1;i<=n;i++)for(let s=-i;s<=i;s++)for(let o=-i;o<=i;o++){if(Math.abs(o)!==i&&Math.abs(s)!==i)continue;const a=t+o,c=e+s;if(r.isWalkable(a,c))return{x:a,z:c}}return null}function Ng(r,t,e,n,i,s=Lg){const o=Math.round(t),a=Math.round(e);let c=Math.round(n),l=Math.round(i);if(o===c&&a===l)return[{x:o,z:a}];if(!r.isWalkable(c,l)){const w=Ug(r,c,l);if(w===null)return null;c=w.x,l=w.z}if(!r.isWalkable(o,a))return null;const{width:u,height:h}=r,d=u*h,p=new Float32Array(d).fill(1/0),_=new Int32Array(d).fill(-1),x=new Uint8Array(d),m=new Dg(w=>w.f),f=a*u+o;p[f]=0,_[f]=-2,m.push({x:o,z:a,g:0,f:zc(o,a,c,l),parentIndex:-2});let E=0;for(;m.size>0&&E<s;){E++;const w=m.pop(),y=w.x,P=w.z,C=P*u+y;if(x[C]===1)continue;if(x[C]=1,y===c&&P===l)return Fg(_,u,y,P,o,a);const T=r.getNeighbors(y,P);for(let R=0;R<T.length;R++){const S=T[R].x,g=T[R].z,A=g*u+S;if(x[A]===1)continue;const B=w.g+r.getTerrainCost(S,g);if(B<p[A]){p[A]=B,_[A]=C;const O=zc(S,g,c,l);m.push({x:S,z:g,g:B,f:B+O,parentIndex:C})}}}return null}function Fg(r,t,e,n,i,s){const o=[];let a=e,c=n;for(;!(a===i&&c===s);){o.push({x:a,z:c});const l=r[c*t+a];if(l===-2)break;a=l%t,c=Math.floor(l/t)}return o.push({x:i,z:s}),o.reverse(),o}const Og=16;class Bg extends Ye{name="PathfindingSystem";_grid;constructor(t){super(),this._grid=t}update(t){let e=0;for(const[n,i]of this.world.query(We,Ht)){if(e>=Og)break;if(i.targetX===void 0||i.targetZ===void 0||i.waypoints.length>0)continue;const s=this.world.getComponent(n,Ht);if(s===void 0)continue;e++;const o=Ng(this._grid,s.x,s.z,i.targetX,i.targetZ);if(o===null){console.warn(`[PathfindingSystem] No path found for entity ${n} from (${Math.round(s.x)}, ${Math.round(s.z)}) to (${i.targetX}, ${i.targetZ}). Clearing target.`),i.targetX=void 0,i.targetZ=void 0,i.waypoints=[],i.waypointIndex=0;continue}const a=o[0],c=Math.round(s.x)===a.x&&Math.round(s.z)===a.z;i.waypoints=c?o.slice(1):o,i.waypointIndex=0}}}const Hc=3;function kg(r,t){return t>=r}function Gc(r,t,e,n,i){for(const s of r.upgrades){const o=s.unlocks[t];if(!(o===void 0||!o[e].includes(n)))return i>=s.tier}return!0}class zg extends Ye{name="TechTreeSystem";_eventBus;_config;constructor(t,e){super(),this._eventBus=t,this._config=e}update(t){for(const[e,n]of this.world.query(ns,Be))n.researching&&(n.researchProgress+=t,n.researchProgress>=n.researchTarget&&this._completeTierResearch(e,n))}getPlayerTier(t){let e=1;for(const[n,i]of this.world.query(ns,Et))this.world.getComponent(n,Et)?.playerId===t&&(e=Math.max(e,i.currentTier));return e}canTrainUnit(t,e,n,i){const s=this.getPlayerTier(t);return kg(i,s)&&Gc(this._config,e,"units",n,s)}canConstructBuilding(t,e,n){const i=this.getPlayerTier(t);return Gc(this._config,e,"buildings",n,i)}_completeTierResearch(t,e){const n=Math.min(e.currentTier+1,Hc);e.currentTier=n,e.researching=!1,e.researchProgress=0,e.researchTarget=0,e.researchCost={gold:0,wood:0};const i=this.world.getComponent(t,Et);this._eventBus.emit("TECH_RESEARCHED",{entityId:t,newTier:n,faction:i?.faction??"",playerId:i?.playerId??""})}startResearch(t,e){const n=this.world.getComponent(t,ns);if(n===void 0||n.researching||n.currentTier>=Hc||e!==n.currentTier+1)return!1;const i=this._config.upgrades.find(s=>s.tier===e);return i===void 0?!1:(n.researching=!0,n.researchProgress=0,n.researchTarget=i.researchTime,n.researchCost={...i.cost},!0)}}const Zs=12;class Hg{_world;_root=null;_singleView=null;_multiView=null;_emptyView=null;_singlePortrait=null;_singleName=null;_singleMeta=null;_singleHpBar=null;_singleHpLabel=null;_singleStats=null;_portraitGrid=null;constructor(t){this._world=t}mount(t){this._root===null&&(this._root=this._buildRoot(),this._buildEmptyView(),this._buildSingleView(),this._buildMultiView(),t.appendChild(this._root),this._showView("empty"))}destroy(){this._root?.remove(),this._root=null}refresh(t){if(this._root!==null)if(t.size===0)this._showView("empty");else if(t.size===1){const[e]=t;this._updateSingleView(e),this._showView("single")}else this._updateMultiView(t),this._showView("multi")}_buildRoot(){const t=document.createElement("div");return t.id="selection-panel",t.setAttribute("role","region"),t.setAttribute("aria-label","Unit selection details"),Object.assign(t.style,{width:"100%",height:"100%",padding:"14px",boxSizing:"border-box",display:"flex",flexDirection:"column",pointerEvents:"auto",fontFamily:"'Space Mono', monospace"}),t}_buildEmptyView(){const t=document.createElement("div");t.id="sp-empty",t.setAttribute("aria-hidden","true"),t.textContent="Select a unit or structure",Object.assign(t.style,{margin:"auto 0",fontFamily:"'Poppins', sans-serif",fontWeight:"500",fontSize:"0.82rem",color:"rgba(255,255,255,0.28)",textAlign:"center"}),this._emptyView=t,this._root.appendChild(t)}_buildSingleView(){const t=document.createElement("div");t.id="sp-single",Object.assign(t.style,{display:"none",flexDirection:"column",gap:"14px",height:"100%"});const e=document.createElement("div");Object.assign(e.style,{display:"grid",gridTemplateColumns:"104px minmax(0, 1fr)",gap:"14px",alignItems:"start"}),this._singlePortrait=document.createElement("div"),Object.assign(this._singlePortrait.style,{position:"relative",width:"104px",aspectRatio:"1 / 1",borderRadius:"6px",overflow:"hidden",background:"rgba(255,255,255,0.03)"}),ai(this._singlePortrait,"portrait",6,"rgba(12,18,22,0.94)");const n=document.createElement("div");Object.assign(n.style,{minWidth:"0",display:"flex",flexDirection:"column",gap:"8px"}),this._singleName=document.createElement("h3"),Object.assign(this._singleName.style,{fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"1.05rem",color:"#ffffff",margin:"0",lineHeight:"1.2"}),this._singleMeta=document.createElement("div"),Object.assign(this._singleMeta.style,{fontSize:"0.68rem",color:"rgba(255,255,255,0.58)",minHeight:"1.2em"});const i=document.createElement("div");Object.assign(i.style,{display:"flex",alignItems:"center",gap:"10px"});const s=document.createElement("div");Object.assign(s.style,{flex:"1",height:"6px",background:"rgba(255,255,255,0.10)",borderRadius:"3px",overflow:"hidden"}),this._singleHpBar=document.createElement("div"),this._singleHpBar.setAttribute("role","progressbar"),this._singleHpBar.setAttribute("aria-valuemin","0"),this._singleHpBar.setAttribute("aria-valuenow","0"),this._singleHpBar.setAttribute("aria-valuemax","100"),this._singleHpBar.setAttribute("aria-label","Health"),Object.assign(this._singleHpBar.style,{height:"100%",width:"100%",background:"#3df2c0",borderRadius:"3px",transformOrigin:"left",transition:"transform 0.15s ease, background-color 0.15s ease"}),s.appendChild(this._singleHpBar),this._singleHpLabel=document.createElement("span"),Object.assign(this._singleHpLabel.style,{fontFamily:"'Space Mono', monospace",fontSize:"0.75rem",color:"#3df2c0",whiteSpace:"nowrap",minWidth:"64px",textAlign:"right"}),i.appendChild(s),i.appendChild(this._singleHpLabel),this._singleStats=document.createElement("div"),Object.assign(this._singleStats.style,{display:"grid",gridTemplateColumns:"repeat(2, minmax(0, 1fr))",gap:"8px"}),n.appendChild(this._singleName),n.appendChild(this._singleMeta),n.appendChild(i),e.appendChild(this._singlePortrait),e.appendChild(n),t.appendChild(e),t.appendChild(this._singleStats),this._singleView=t,this._root.appendChild(t)}_buildMultiView(){const t=document.createElement("div");t.id="sp-multi",Object.assign(t.style,{display:"none",flexDirection:"column",gap:"10px"});const e=document.createElement("div");e.textContent="Selection",Object.assign(e.style,{fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"0.8rem",color:"rgba(255,255,255,0.72)"}),this._portraitGrid=document.createElement("div"),Object.assign(this._portraitGrid.style,{display:"grid",gridTemplateColumns:"repeat(4, minmax(0, 1fr))",gap:"8px"}),t.appendChild(e),t.appendChild(this._portraitGrid),this._multiView=t,this._root.appendChild(t)}_showView(t){this._emptyView&&(this._emptyView.style.display=t==="empty"?"block":"none"),this._singleView&&(this._singleView.style.display=t==="single"?"flex":"none"),this._multiView&&(this._multiView.style.display=t==="multi"?"flex":"none")}_updateSingleView(t){const e=this._world.getComponent(t,qe),n=this._world.getComponent(t,Te),i=this._world.getComponent(t,Be),s=this._world.getComponent(t,ua),o=this._world.getComponent(t,cg),a=n?.displayName??i?.displayName??"Unknown",c=Nc(n?.unitId??i?.buildingId??"");if(this._singleName!==null&&(this._singleName.textContent=a),this._singleMeta!==null){const l=[];i!==void 0?(l.push("Building"),l.push(i.isComplete?"Complete":"Under Construction")):n!==void 0&&(l.push(n.isWorker?"Worker":"Unit"),l.push(`Tier ${n.tier}`)),this._singleMeta.textContent=l.join(" • ")}if(this._singlePortrait!==null&&(this._singlePortrait.innerHTML="",this._singlePortrait.appendChild(this._buildPortraitArt(a,c))),e!==void 0&&this._singleHpBar!==null&&this._singleHpLabel!==null){const l=e.max>0?Math.max(0,Math.min(1,e.current/e.max)):0;this._singleHpBar.style.transform=`scaleX(${l})`,this._singleHpBar.style.backgroundColor=l<.3?"#f2913d":"#3df2c0",this._singleHpBar.setAttribute("aria-valuenow",String(Math.round(e.current))),this._singleHpBar.setAttribute("aria-valuemax",String(e.max)),this._singleHpLabel.textContent=`${Math.round(e.current)} / ${e.max}`}if(this._singleStats!==null){this._singleStats.innerHTML="";const l=this._world.hasComponent(t,Wl)?"Worker":i!==void 0?"Structure":"Combatant",u=[["Faction",o?.faction??"Neutral"],["Role",l],["Armor",this._formatStat(s?.armor)],["Damage",this._formatStat(s?.damage)],["Range",this._formatStat(s?.range)],["Sight",this._formatStat(s?.sight)],["Speed",this._formatStat(s?.speed)],["Status",i!==void 0&&!i.isComplete?"Building...":"Ready"]];for(const[h,d]of u)this._singleStats.appendChild(this._statChip(h,d))}}_updateMultiView(t){if(this._portraitGrid===null)return;this._portraitGrid.innerHTML="";let e=0;for(const n of t){if(e>=Zs)break;this._portraitGrid.appendChild(this._buildPortrait(n)),e++}if(t.size>Zs){const n=document.createElement("div");n.textContent=`+${t.size-Zs}`,Object.assign(n.style,{display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Poppins', sans-serif",fontWeight:"700",fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",background:"rgba(61,242,192,0.08)",border:"1px solid rgba(61,242,192,0.15)",borderRadius:"4px",aspectRatio:"1 / 1"}),this._portraitGrid.appendChild(n)}}_buildPortrait(t){const e=this._world.getComponent(t,qe),n=this._world.getComponent(t,Te),i=this._world.getComponent(t,Be),s=n?.displayName??i?.displayName??"Unit",o=e&&e.max>0?Math.max(0,Math.min(1,e.current/e.max)):1,a=Nc(n?.unitId??i?.buildingId??""),c=document.createElement("div");c.setAttribute("role","img"),c.setAttribute("aria-label",`${s}, HP ${Math.round(o*100)}%`),Object.assign(c.style,{position:"relative",borderRadius:"4px",aspectRatio:"1 / 1",overflow:"hidden",cursor:"default"}),ai(c,"portrait",4,"rgba(12,18,22,0.94)"),c.appendChild(this._buildPortraitArt(s,a));const l=document.createElement("div");return Object.assign(l.style,{position:"absolute",bottom:"0",left:"0",height:"3px",width:`${Math.round(o*100)}%`,background:o<.3?"#f2913d":"#3df2c0",transition:"width 0.15s ease, background-color 0.15s ease"}),c.appendChild(l),c}_buildPortraitArt(t,e){if(e!==null){const i=document.createElement("img");return i.src=e,i.alt="",i.setAttribute("aria-hidden","true"),Object.assign(i.style,{position:"absolute",inset:"0",width:"100%",height:"100%",objectFit:"cover",imageRendering:"pixelated"}),i}const n=document.createElement("span");return n.textContent=t.charAt(0).toUpperCase(),n.setAttribute("aria-hidden","true"),Object.assign(n.style,{position:"absolute",inset:"0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Poppins', sans-serif",fontWeight:"700",fontSize:"1.1rem",color:"#3df2c0"}),n}_statChip(t,e){const n=document.createElement("div");Object.assign(n.style,{display:"flex",justifyContent:"space-between",gap:"12px",padding:"8px 10px",borderRadius:"4px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(61,242,192,0.10)",fontSize:"0.72rem",color:"#ffffff"});const i=document.createElement("span");i.textContent=t.toUpperCase(),Object.assign(i.style,{opacity:"0.55",fontFamily:"'Poppins', sans-serif",fontWeight:"600"});const s=document.createElement("span");return s.textContent=e,Object.assign(s.style,{color:"#3df2c0",textAlign:"right"}),n.appendChild(i),n.appendChild(s),n}_formatStat(t){if(typeof t!="number")return"--";const e=Number(t.toFixed(1));return Number.isInteger(e)?String(e):e.toFixed(1)}}class Gg{_root=null;_grid=null;_items=[];_hotkeyMap=new Map;mount(t){this._root===null&&(this._root=this._buildRoot(),this._grid=this._buildGrid(),this._root.appendChild(this._grid),t.appendChild(this._root),this._injectBaseStyles())}destroy(){this._root?.remove(),this._root=null,this._grid=null,this._hotkeyMap.clear(),this._items=[]}setCommands(t){this._items=t.slice(0,9),this._hotkeyMap.clear(),this._grid!==null&&this._renderButtons()}handleHotkey(t){const e=t.startsWith("Key")?t.slice(3).toUpperCase():t.toUpperCase(),n=this._hotkeyMap.get(e);n!==void 0&&!n.disabled&&n.click()}_buildRoot(){const t=document.createElement("div");return t.id="command-card",Object.assign(t.style,{width:"100%",height:"100%",padding:"14px",boxSizing:"border-box",display:"flex",flexDirection:"column",pointerEvents:"auto"}),t}_buildGrid(){const t=document.createElement("div");return t.setAttribute("role","toolbar"),t.setAttribute("aria-label","Unit commands"),Object.assign(t.style,{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gridTemplateRows:"repeat(3, minmax(0, 1fr))",gap:"8px",flex:"1"}),t}_renderButtons(){if(this._grid!==null){this._grid.innerHTML="",this._hotkeyMap.clear();for(let t=0;t<9;t++){const e=this._items[t];if(e!==void 0){const n=this._buildButton(e);this._grid.appendChild(n),this._hotkeyMap.set(e.hotkey.toUpperCase(),n)}else{const n=document.createElement("div");Object.assign(n.style,{width:"100%",aspectRatio:"1 / 1"}),this._grid.appendChild(n)}}}}_buildButton(t){const e=document.createElement("button");e.id=`cmd-${t.id}`,e.type="button",e.disabled=t.disabled??!1,e.setAttribute("aria-label",`${t.label}${t.hotkey?` (${t.hotkey})`:""}`),t.disabled&&e.setAttribute("aria-disabled","true"),Object.assign(e.style,{position:"relative",width:"100%",aspectRatio:"1 / 1",borderRadius:"4px",cursor:t.disabled?"not-allowed":"pointer",opacity:t.disabled?"0.30":"1",display:"flex",alignItems:"center",justifyContent:"center",color:"#ffffff",fontSize:"1.3rem",fontFamily:"'Poppins', sans-serif",transition:"background 0.12s, border-color 0.12s",outline:"none"}),ai(e,"button",4,"rgba(10,12,16,0.78)");const n=t.icon??t.label.charAt(0),i=n.startsWith("/")?document.createElement("img"):document.createElement("span");if(i.setAttribute("aria-hidden","true"),i instanceof HTMLImageElement?(i.src=n,i.alt="",Object.assign(i.style,{pointerEvents:"none",width:"28px",height:"28px",imageRendering:"pixelated"})):(i.textContent=n,Object.assign(i.style,{pointerEvents:"none",fontSize:"1.3rem",lineHeight:"1"})),e.appendChild(i),t.hotkey){const o=document.createElement("span");o.textContent=t.hotkey.toUpperCase(),o.setAttribute("aria-hidden","true"),Object.assign(o.style,{position:"absolute",top:"3px",right:"4px",fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"0.58rem",color:"#3df2c0",lineHeight:"1",pointerEvents:"none",letterSpacing:"0"}),e.appendChild(o)}const s=document.createElement("span");return s.textContent=t.label,s.setAttribute("aria-hidden","true"),Object.assign(s.style,{position:"absolute",bottom:"-28px",left:"50%",transform:"translateX(-50%)",whiteSpace:"nowrap",background:"rgba(10,12,16,0.96)",border:"1px solid rgba(61,242,192,0.20)",borderRadius:"3px",padding:"2px 6px",fontFamily:"'Poppins', sans-serif",fontSize:"0.65rem",color:"#ffffff",pointerEvents:"none",opacity:"0",transition:"opacity 0.15s",zIndex:"10"}),e.appendChild(s),t.disabled||(e.addEventListener("mouseenter",()=>{e.style.background="rgba(61,242,192,0.04)",e.style.borderColor="rgba(61,242,192,0.50)",s.style.opacity="1"}),e.addEventListener("mouseleave",()=>{e.style.background="rgba(10,12,16,0.75)",e.style.borderColor="rgba(61,242,192,0.18)",s.style.opacity="0"}),e.addEventListener("focus",()=>{e.style.borderColor="rgba(61,242,192,0.70)",s.style.opacity="1"}),e.addEventListener("blur",()=>{e.style.borderColor="rgba(61,242,192,0.18)",s.style.opacity="0"}),e.addEventListener("mousedown",()=>{e.style.background="rgba(61,242,192,0.18)"}),e.addEventListener("mouseup",()=>{e.style.background="rgba(61,242,192,0.04)"}),e.addEventListener("click",()=>{t.onActivate()})),e}_injectBaseStyles(){const t="command-card-styles";if(document.getElementById(t)!==null)return;const e=document.createElement("style");e.id=t,e.textContent=`
      #command-card button:focus-visible {
        outline: 2px solid #3df2c0;
        outline-offset: 2px;
      }
    `,document.head.appendChild(e)}}const Pe=160,Vg="#050512",Vc="#3df2c0",Wc="#ff5533",Wg="#f2c03d",Xc=1.5,$r=2,Xg=80,qg=60*Math.PI/180,Yg=500;class $g{_world;_fogGrid;_mapW;_mapH;_onClick;_container=null;_canvas=null;_ctx=null;_lastDrawMs=-1/0;_reducedMotion;constructor(t,e,n,i,s){this._world=t,this._fogGrid=e,this._mapW=n,this._mapH=i,this._onClick=s,this._reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches}mount(t){if(this._canvas!==null)return;t.innerHTML="",this._container=this._buildContainer();const e=this._buildLabel();this._container.appendChild(e),this._canvas=this._buildCanvas(),this._ctx=this._canvas.getContext("2d"),this._container.appendChild(this._canvas),t.appendChild(this._container),this._reducedMotion||(this._container.style.opacity="0",requestAnimationFrame(()=>{this._container!==null&&(this._container.style.transition="opacity 0.3s ease",this._container.style.opacity="1")})),this._draw(),this._lastDrawMs=performance.now()}update(){if(this._canvas===null)return;const t=performance.now();t-this._lastDrawMs<Yg||(this._lastDrawMs=t,this._draw())}dispose(){this._container?.remove(),this._container=null,this._canvas=null,this._ctx=null}_buildContainer(){const t=document.createElement("div");return Object.assign(t.style,{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",width:"100%",height:"100%",padding:"10px",boxSizing:"border-box"}),t}_buildLabel(){const t=document.createElement("div");return t.textContent="MINIMAP",t.setAttribute("aria-hidden","true"),Object.assign(t.style,{fontFamily:"'Space Mono', monospace",fontWeight:"700",fontSize:"0.65rem",letterSpacing:"0.14em",color:"rgba(61,242,192,0.50)",userSelect:"none",lineHeight:"1"}),t}_buildCanvas(){const t=document.createElement("canvas");return t.width=Pe,t.height=Pe,t.setAttribute("role","img"),t.setAttribute("aria-label","Minimap — overview of the battlefield"),t.tabIndex=0,Object.assign(t.style,{width:`${Pe}px`,height:`${Pe}px`,display:"block",cursor:"crosshair",borderRadius:"2px",outline:"none",maxWidth:"100%",maxHeight:"100%"}),t.addEventListener("click",this._handleClick.bind(this)),t.addEventListener("keydown",e=>{(e.code==="Enter"||e.code==="Space")&&(e.preventDefault(),this._onClick({x:this._mapW/2,z:this._mapH/2}))}),this._injectFocusStyle(),t}_injectFocusStyle(){const t="minimap-focus-style";if(document.getElementById(t)!==null)return;const e=document.createElement("style");e.id=t,e.textContent=`
      canvas[aria-label*="Minimap"]:focus-visible {
        outline: 2px solid #3df2c0;
        outline-offset: 2px;
      }
    `,document.head.appendChild(e)}_handleClick(t){if(this._canvas===null)return;const e=this._canvas.getBoundingClientRect(),n=t.clientX-e.left,i=t.clientY-e.top,s=Pe/e.width,o=Pe/e.height,a=n*s,c=i*o,l=this._canvasToWorld(a,c);this._onClick(l)}_worldToCanvas(t,e){return{cx:t/this._mapW*Pe,cz:e/this._mapH*Pe}}_canvasToWorld(t,e){return{x:t/Pe*this._mapW,z:e/Pe*this._mapH}}_draw(){const t=this._ctx;t!==null&&(t.clearRect(0,0,Pe,Pe),t.fillStyle=Vg,t.fillRect(0,0,Pe,Pe),this._drawResourceNodes(t),this._drawBuildings(t),this._drawUnits(t))}_drawResourceNodes(t){for(const[e,n]of this._world.query(pr)){if(n.remaining<=0)continue;const i=this._world.getComponent(e,Ht);if(i===void 0)continue;const s=Math.floor(i.x),o=Math.floor(i.z),a=this._fogGrid.getState(s,o);if(a==="hidden")continue;const{cx:c,cz:l}=this._worldToCanvas(i.x,i.z);t.globalAlpha=a==="explored"?.4:1,t.fillStyle=Wg,t.beginPath(),t.arc(c,l,Xc,0,Math.PI*2),t.fill()}t.globalAlpha=1}_drawBuildings(t){for(const[e]of this._world.query(Be)){const n=this._world.getComponent(e,Ht),i=this._world.getComponent(e,Et);if(n===void 0||i===void 0)continue;const s=Math.floor(n.x),o=Math.floor(n.z),a=this._fogGrid.getState(s,o);if(a==="hidden")continue;const{cx:c,cz:l}=this._worldToCanvas(n.x,n.z),u=i.faction==="Orc"?Wc:Vc;t.globalAlpha=a==="explored"?.4:1,t.fillStyle=u,t.fillRect(c-$r,l-$r,$r*2,$r*2)}t.globalAlpha=1}_drawUnits(t){for(const[e]of this._world.query(Te)){const n=this._world.getComponent(e,Ht),i=this._world.getComponent(e,Et);if(n===void 0||i===void 0)continue;const s=Math.floor(n.x),o=Math.floor(n.z),a=this._fogGrid.getState(s,o);if(a==="hidden")continue;const{cx:c,cz:l}=this._worldToCanvas(n.x,n.z),u=i.faction==="Orc"?Wc:Vc;t.globalAlpha=a==="explored"?.4:1,t.fillStyle=u,t.beginPath(),t.arc(c,l,Xc,0,Math.PI*2),t.fill()}t.globalAlpha=1}drawViewport(t,e){const n=this._ctx;if(n===null)return;const i=Math.tan(qg/2)*Xg,s=t-i,o=e-i,a=i*2,c=i*2,{cx:l,cz:u}=this._worldToCanvas(s,o),h=a/this._mapW*Pe,d=c/this._mapH*Pe;n.strokeStyle="rgba(255,255,255,0.70)",n.lineWidth=1,n.strokeRect(l,u,h,d)}}class jg extends Ye{name="AISystem";_controllers=[];addController(t){this._controllers.push(t)}removeController(t){const e=this._controllers.indexOf(t);e!==-1&&(this._controllers.splice(e,1),t.destroy())}update(t){for(const e of this._controllers)e.update(t)}destroy(){for(const t of this._controllers)t.destroy();this._controllers.length=0}}class Kg{_playerId;_profile;_fsm;_ctx;_world;_tracker;_bus;_unsubs=[];constructor(t,e,n,i,s,o,a){this._playerId=t,this._profile=e,this._fsm=n,this._ctx=i,this._world=s,this._tracker=o,this._bus=a}init(){this._subscribeToEvents(),this._fsm.start("EcoState",this._ctx)}update(t){this._refreshContext(),this._fsm.update(this._ctx,t)}destroy(){for(const t of this._unsubs)t();this._unsubs.length=0}_refreshContext(){const t=this._tracker.getResources(this._playerId);t!==void 0&&(this._ctx.gold=t.gold,this._ctx.wood=t.wood,this._ctx.supplyUsed=t.supplyUsed,this._ctx.supplyCap=t.supplyCap),this._ctx.workerCount=0,this._ctx.armySize=0,this._ctx.completedBuildings.clear(),this._ctx.buildingsUnderConstruction.clear(),this._ctx.hqEntity=ge;const e=this._world;for(const[n,i]of e.query(Te,Et))e.getComponent(n,Et)?.playerId===this._playerId&&(i.isWorker?this._ctx.workerCount+=1:this._ctx.armySize+=1);for(const[n,i]of e.query(Be,Et))e.getComponent(n,Et)?.playerId===this._playerId&&(e.hasComponent(n,gn)?this._ctx.buildingsUnderConstruction.add(i.buildingId):this._ctx.completedBuildings.add(i.buildingId),i.buildingId==="stronghold"&&!e.hasComponent(n,gn)&&(this._ctx.hqEntity=n))}_subscribeToEvents(){this._unsubs.push(this._bus.on("BUILDING_DESTROYED",t=>{t.playerId===this._playerId&&this._profile.defenseOverride.triggerOnBuildingAttacked&&(this._ctx.previousStateName=this._fsm.activeStateName??"EcoState",this._ctx.defenseTimer=0,this._fsm.forceTransition("DefenseOverride",this._ctx))}))}}class Zg{_states=new Map;_active=null;registerState(t){this._states.set(t.name,t)}start(t,e){const n=this._states.get(t);if(n===void 0){console.warn(`[AIStateMachine] start: unknown state "${t}"`);return}this._active=n,n.enter(e)}update(t,e){if(this._active===null)return;const n=this._active.update(t,e);n!=null&&n!==this._active.name&&this._transition(n,t)}forceTransition(t,e){this._active?.name!==t&&this._transition(t,e)}get activeStateName(){return this._active?.name??null}_transition(t,e){const n=this._states.get(t);if(n===void 0){console.warn(`[AIStateMachine] transition: unknown state "${t}"`);return}this._active?.exit(e),this._active=n,n.enter(e)}}class ha{name="EcoState";_profile;_world;_tracker;_workerData;_workerBuildingId;_accumulator=0;static INTERVAL=1;constructor(t,e,n,i,s){this._profile=t,this._world=e,this._tracker=n,this._workerData=i,this._workerBuildingId=s}enter(t){this._accumulator=0}update(t,e){if(this._accumulator+=e,this._accumulator<ha.INTERVAL)return null;if(this._accumulator=0,t.workerCount>=this._profile.ecoPhase.minWorkers)return"BuildState";const n=this._profile.ecoPhase.targetGoldWorkers+this._profile.ecoPhase.targetWoodWorkers;return t.workerCount<n&&this._tryQueueWorker(t),null}exit(t){}_tryQueueWorker(t){const e=this._workerData.cost,n=this._workerData.supplyCost;if(!this._tracker.canAfford(t.playerId,e)||!this._tracker.hasSupply(t.playerId,n))return;const i=this._world;for(const[s,o]of i.query(Be,Et)){if(i.getComponent(s,Et)?.playerId!==t.playerId||o.buildingId!==this._workerBuildingId||!o.isComplete||i.hasComponent(s,gn))continue;const c=i.getComponent(s,vr);if(c!==void 0&&!(c.queue.length>=2)){c.queue.push(this._workerData.id),this._tracker.spend(t.playerId,e);break}}}}const qc=["war_camp","war_hut","beast_den","spirit_lodge","war_hut","war_forge","siege_pit"],Jg=new Set(["war_camp","beast_den","spirit_lodge","siege_pit"]);class da{name="BuildState";_profile;_world;_tracker;_techSystem;_buildingDataMap;_accumulator=0;static INTERVAL=2;constructor(t,e,n,i,s){this._profile=t,this._world=e,this._tracker=n,this._techSystem=i,this._buildingDataMap=s}enter(t){this._accumulator=0}update(t,e){if(this._accumulator+=e,this._accumulator<da.INTERVAL)return null;if(this._accumulator=0,t.workerCount<this._profile.ecoPhase.minWorkers)return"EcoState";this._tryResearchUpgrade(t),this._tryBuild(t);for(const n of Jg)if(t.completedBuildings.has(n))return"ArmyState";return null}exit(t){}_tryResearchUpgrade(t){if(t.hqEntity===ge||t.gold<this._profile.buildPhase.upgradeGoldThreshold||!this._techSystem.startResearch(t.hqEntity,2))return;const n=this._world.getComponent(t.hqEntity,ns);n!==void 0&&n.researching&&this._tracker.spend(t.playerId,n.researchCost)}_tryBuild(t){const e=this._countNeeded(t);if(e===null)return;const[n]=e,i=this._buildingDataMap.get(n);if(i===void 0||!this._techSystem.canConstructBuilding(t.playerId,"orc",n)||!this._tracker.canAfford(t.playerId,i.cost))return;const s=this._findIdleWorker(t);if(s===ge)return;this._tracker.spend(t.playerId,i.cost),t.buildingsUnderConstruction.add(n);const o=this._world.getComponent(s,Ht),a=this._world.getComponent(s,We);o!==void 0&&a!==void 0&&(a.targetX=o.x-5,a.targetZ=o.z)}_countNeeded(t){const e=new Map;for(const s of t.completedBuildings)e.set(s,(e.get(s)??0)+1);for(const s of t.buildingsUnderConstruction)e.set(s,(e.get(s)??0)+1);const n=new Map;for(const s of qc)n.set(s,(n.get(s)??0)+1);const i=new Map;for(const s of qc){const o=n.get(s)??0,a=e.get(s)??0,c=i.get(s)??0;if(i.set(s,c+1),a<o&&(i.get(s)??0)<=o-a)return[s]}return null}_findIdleWorker(t){const e=this._world;for(const[n,i]of e.query(Te,Et)){if(e.getComponent(n,Et)?.playerId!==t.playerId||!i.isWorker)continue;const o=e.getComponent(n,ps);if(o!==void 0&&o.state!=="idle")continue;const a=e.getComponent(n,We);if(!(a!==void 0&&a.targetX!==void 0))return n}return ge}}const Qg=new Set(["grunt","berserker","warlord"]),t0=new Set(["hunter","shaman","war_catapult"]),Yc=new Map([["war_camp","grunt"],["beast_den","hunter"],["spirit_lodge","shaman"],["siege_pit","war_catapult"]]),e0=3;class fa{name="ArmyState";_profile;_world;_tracker;_techSystem;_unitDataMap;_accumulator=0;static INTERVAL=1;constructor(t,e,n,i,s){this._profile=t,this._world=e,this._tracker=n,this._techSystem=i,this._unitDataMap=s}enter(t){this._accumulator=0}update(t,e){if(this._accumulator+=e,this._accumulator<fa.INTERVAL)return null;if(this._accumulator=0,t.supplyUsed>=this._profile.armyPhase.attackSupplyThreshold)return"AttackState";if(![...Yc.keys()].some(o=>t.completedBuildings.has(o)))return"BuildState";const{meleeCount:i,rangedCount:s}=this._countArmyComposition(t);return this._queueUnits(t,i,s),null}exit(t){}_countArmyComposition(t){let e=0,n=0;const i=this._world;for(const[s,o]of i.query(Te,Et))i.getComponent(s,Et)?.playerId===t.playerId&&(o.isWorker||(Qg.has(o.unitId)&&(e+=1),t0.has(o.unitId)&&(n+=1)));return{meleeCount:e,rangedCount:n}}_queueUnits(t,e,n){const i=this._world,s=this._profile.armyPhase.meleeToRangedRatio,a=(n===0?1/0:e/n)<s;for(const[c,l]of i.query(Be,Et)){if(i.getComponent(c,Et)?.playerId!==t.playerId||!l.isComplete||i.hasComponent(c,gn)||Yc.get(l.buildingId)===void 0)continue;const d=i.getComponent(c,vr);if(d===void 0||d.queue.length>=e0)continue;const p=this._pickUnit(l.buildingId,a);if(p===null)continue;const _=this._unitDataMap.get(p);_!==void 0&&this._techSystem.canTrainUnit(t.playerId,"orc",_.id,_.tier)&&this._tracker.canAfford(t.playerId,_.cost)&&this._tracker.hasSupply(t.playerId,_.supplyCost)&&(d.queue.push(p),this._tracker.spend(t.playerId,_.cost))}}_pickUnit(t,e){switch(t){case"war_camp":return"grunt";case"beast_den":return e?null:"hunter";case"spirit_lodge":return e?null:"shaman";case"siege_pit":return e?null:"war_catapult";default:return null}}}class pa{name="AttackState";_profile;_world;_enemyPlayerId;_accumulator=0;static INTERVAL=.5;constructor(t,e,n){this._profile=t,this._world=e,this._enemyPlayerId=n}enter(t){this._accumulator=0}update(t,e){return this._accumulator+=e,this._accumulator<pa.INTERVAL?null:(this._accumulator=0,t.supplyUsed<this._profile.attackPhase.retreatSupplyThreshold?"ArmyState":(this._issueAttackOrders(t),null))}exit(t){this._clearAttackOrders(t)}_issueAttackOrders(t){const e=this._world;for(const[n,i]of e.query(Te,Et,_e)){if(e.getComponent(n,Et)?.playerId!==t.playerId||i.isWorker||e.hasComponent(n,dn))continue;const o=e.getComponent(n,Ht);if(o===void 0)continue;const a=this._findNearestEnemy(o.x,o.z);a!==ge&&e.addComponent(n,dn,{type:"AttackTarget",targetEntity:a})}}_clearAttackOrders(t){const e=this._world;for(const[n,i]of e.query(Te,Et))e.getComponent(n,Et)?.playerId===t.playerId&&(i.isWorker||e.removeComponent(n,dn))}_findNearestEnemy(t,e){const n=this._world;let i=ge,s=1/0;for(const[o]of n.query(Et,_e,Ht)){if(n.getComponent(o,Et)?.playerId!==this._enemyPlayerId)continue;const c=n.getComponent(o,Ht);if(c===void 0)continue;const l=c.x-t,u=c.z-e,h=l*l+u*u;h<s&&(s=h,i=o)}return i}}const n0=30;class ma{name="DefenseOverride";_profile;_world;_enemyPlayerId;_accumulator=0;static INTERVAL=.5;constructor(t,e,n){this._profile=t,this._world=e,this._enemyPlayerId=n}enter(t){this._accumulator=0,t.defenseTimer=0}update(t,e){if(t.defenseTimer+=e,this._accumulator+=e,t.defenseTimer>=n0){const n=t.previousStateName||"EcoState";return t.previousStateName="",t.defenseTimer=0,n}return this._accumulator<ma.INTERVAL||(this._accumulator=0,this._issueDefenseOrders(t)),null}exit(t){this._clearDefenseOrders(t),t.defenseTimer=0,t.previousStateName=""}_issueDefenseOrders(t){const e=this._world;for(const[n,i]of e.query(Te,Et,_e)){if(e.getComponent(n,Et)?.playerId!==t.playerId||i.isWorker||e.hasComponent(n,dn))continue;const o=e.getComponent(n,Ht);if(o===void 0)continue;const a=this._findNearestEnemy(o.x,o.z);a!==ge&&e.addComponent(n,dn,{type:"AttackTarget",targetEntity:a})}}_clearDefenseOrders(t){const e=this._world;for(const[n,i]of e.query(Te,Et))e.getComponent(n,Et)?.playerId===t.playerId&&(i.isWorker||e.removeComponent(n,dn))}_findNearestEnemy(t,e){const n=this._world;let i=ge,s=1/0;for(const[o]of n.query(Et,_e,Ht)){if(n.getComponent(o,Et)?.playerId!==this._enemyPlayerId)continue;const c=n.getComponent(o,Ht);if(c===void 0)continue;const l=c.x-t,u=c.z-e,h=l*l+u*u;h<s&&(s=h,i=o)}return i}}class i0{_opts;_root=null;_heading=null;_subline=null;_playAgainBtn=null;_mainMenuBtn=null;_visible=!1;_reducedMotion=!1;_onKeyDown=null;constructor(t){this._opts=t}mount(t){this._root===null&&(this._reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches,this._root=this._buildRoot(),this._buildContent(),t.appendChild(this._root),this._root.style.opacity="0",this._root.style.pointerEvents="none",this._root.setAttribute("aria-hidden","true"))}destroy(){this.hide(),this._root?.remove(),this._root=null}show(t,e){if(this._root===null)return;this._applyOutcome(t,e),this._visible=!0,this._root.style.display="flex",this._root.style.pointerEvents="all",this._root.removeAttribute("aria-hidden"),this._reducedMotion?this._root.style.opacity="1":requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._root!==null&&(this._root.style.opacity="1")})}),this._trapFocus();const n=this._reducedMotion?0:420;setTimeout(()=>{this._playAgainBtn?.focus()},n)}hide(){this._root===null||!this._visible||(this._visible=!1,this._releaseFocus(),this._reducedMotion?(this._root.style.opacity="0",this._root.style.display="none",this._root.style.pointerEvents="none",this._root.setAttribute("aria-hidden","true")):(this._root.style.opacity="0",this._root.style.pointerEvents="none",this._root.setAttribute("aria-hidden","true"),setTimeout(()=>{this._root!==null&&!this._visible&&(this._root.style.display="none")},400)))}_buildRoot(){const t=document.createElement("div");return t.id="victory-screen",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-label","Match result"),Object.assign(t.style,{position:"fixed",inset:"0",display:"none",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(6,8,12,0.94)",backdropFilter:"blur(12px)",zIndex:"9000",transition:this._reducedMotion?"none":"opacity 0.4s ease",gap:"0"}),t}_buildContent(){const t=document.createElement("div");Object.assign(t.style,{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px",padding:"48px 64px",position:"relative"});const e=document.createElement("div");e.setAttribute("aria-hidden","true"),Object.assign(e.style,{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"400px",height:"300px",background:"radial-gradient(ellipse at center, rgba(61,242,192,0.08) 0%, transparent 70%)",pointerEvents:"none",zIndex:"-1"}),t.appendChild(e),this._heading=document.createElement("h1"),Object.assign(this._heading.style,{fontFamily:"'Poppins', sans-serif",fontWeight:"700",fontSize:"clamp(2.5rem, 7vw, 5rem)",letterSpacing:"0.08em",margin:"0",transition:this._reducedMotion?"none":"color 0.4s"}),t.appendChild(this._heading),this._subline=document.createElement("p"),Object.assign(this._subline.style,{fontFamily:"'Space Mono', monospace",fontSize:"0.95rem",color:"rgba(255,255,255,0.60)",margin:"0 0 16px 0",textAlign:"center",maxWidth:"420px",lineHeight:"1.5"}),t.appendChild(this._subline);const n=document.createElement("div");n.setAttribute("aria-hidden","true"),Object.assign(n.style,{width:"160px",height:"1px",background:"rgba(61,242,192,0.25)",marginBottom:"8px"}),t.appendChild(n);const i=document.createElement("div");Object.assign(i.style,{display:"flex",gap:"16px",marginTop:"8px"}),this._playAgainBtn=this._buildButton("Play Again",!0,()=>{this.hide(),this._opts.onPlayAgain()}),this._mainMenuBtn=this._buildButton("Main Menu",!1,()=>{this.hide(),this._opts.onMainMenu()}),i.appendChild(this._playAgainBtn),i.appendChild(this._mainMenuBtn),t.appendChild(i),this._root.appendChild(t)}_buildButton(t,e,n){const i=document.createElement("button");return i.type="button",i.textContent=t,Object.assign(i.style,{fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"0.95rem",padding:"10px 32px",borderRadius:"4px",cursor:"pointer",border:"1px solid #3df2c0",background:e?"#3df2c0":"transparent",color:e?"#060810":"#3df2c0",transition:"background 0.15s, color 0.15s, box-shadow 0.15s",outline:"none",letterSpacing:"0.04em"}),i.addEventListener("mouseenter",()=>{e?i.style.background="#6af7d5":(i.style.background="rgba(61,242,192,0.10)",i.style.boxShadow="0 0 12px rgba(61,242,192,0.25)")}),i.addEventListener("mouseleave",()=>{i.style.background=e?"#3df2c0":"transparent",i.style.boxShadow="none"}),i.addEventListener("click",n),i}_applyOutcome(t,e){this._heading===null||this._subline===null||(t==="win"?(this._heading.textContent="VICTORY",this._heading.style.color="#3df2c0",this._subline.textContent=e??"The battle is won.",this._root.setAttribute("aria-label","Victory — match won")):(this._heading.textContent="DEFEAT",this._heading.style.color="rgba(255,255,255,0.55)",this._subline.textContent=e??"Your forces have been defeated.",this._root.setAttribute("aria-label","Defeat — match lost")))}_trapFocus(){this._onKeyDown=t=>{if(t.key==="Escape"){this.hide(),this._opts.onMainMenu();return}if(t.key!=="Tab")return;const e=[this._playAgainBtn,this._mainMenuBtn].filter(s=>s!==null);if(e.length===0)return;const n=e[0],i=e[e.length-1];t.shiftKey?document.activeElement===n&&(t.preventDefault(),i.focus()):document.activeElement===i&&(t.preventDefault(),n.focus())},window.addEventListener("keydown",this._onKeyDown)}_releaseFocus(){this._onKeyDown!==null&&(window.removeEventListener("keydown",this._onKeyDown),this._onKeyDown=null)}}class r0{_bus;_container=null;_goldEl=null;_woodEl=null;_supplyEl=null;_clockEl=null;_minimapFrame=null;_selectionFrame=null;_commandFrame=null;_unsubs=[];_reducedMotion=!1;constructor(t){this._bus=t}mount(t){this._container===null&&(this._reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches,this._container=this._buildContainer(),this._buildResourceBar(),this._buildSidebar(),t.appendChild(this._container),this._unsubs.push(this._bus.on("resourceUpdate",({gold:e,wood:n})=>{this._setResource("gold",e),this._setResource("wood",n)}),this._bus.on("clockUpdate",({seconds:e})=>{this._setClock(e)}),this._bus.on("supplyUpdate",({current:e,cap:n})=>{this._supplyEl&&(this._supplyEl.textContent=`${e}/${n}`)})))}destroy(){for(const t of this._unsubs)t();this._unsubs.length=0,this._container?.remove(),this._container=null}get minimapFrame(){return this._minimapFrame}get selectionFrame(){return this._selectionFrame}get commandFrame(){return this._commandFrame}_buildContainer(){const t=document.createElement("div");return t.id="hud-root",Object.assign(t.style,{position:"fixed",inset:"0",pointerEvents:"none",zIndex:"100",fontFamily:"'Space Mono', 'Poppins', monospace"}),t}_buildResourceBar(){const t=document.createElement("div");t.setAttribute("role","status"),t.setAttribute("aria-label","Resource bar"),Object.assign(t.style,{position:"fixed",top:"0",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"32px",alignItems:"center",padding:"6px 24px",borderRadius:"0 0 8px 8px",backdropFilter:"blur(6px)",pointerEvents:"none"}),ai(t,"panel",10,"rgba(10,12,16,0.78)"),t.style.borderTop="",t.appendChild(this._buildResourceWidget("gold","Gold",Ks("gold")??"⬡")),t.appendChild(this._buildDivider()),t.appendChild(this._buildResourceWidget("wood","Wood",Ks("wood")??"⬟")),t.appendChild(this._buildDivider()),t.appendChild(this._buildResourceWidget("supply","Supply",Ks("supply")??"⊞")),t.appendChild(this._buildDivider());const e=document.createElement("div");Object.assign(e.style,{display:"flex",alignItems:"center",gap:"6px"});const n=document.createElement("span");n.textContent="TIME",Object.assign(n.style,{fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"0.65rem",color:"rgba(255,255,255,0.45)",letterSpacing:"0.08em"}),this._clockEl=document.createElement("span"),this._clockEl.setAttribute("aria-label","Elapsed time"),this._clockEl.textContent="00:00",Object.assign(this._clockEl.style,{fontFamily:"'Space Mono', monospace",fontWeight:"700",fontSize:"0.95rem",color:"#3df2c0",minWidth:"50px"}),e.appendChild(n),e.appendChild(this._clockEl),t.appendChild(e),this._container.appendChild(t)}_buildResourceWidget(t,e,n){const i=document.createElement("div");Object.assign(i.style,{display:"flex",alignItems:"center",gap:"6px"});const s=n.startsWith("/")?document.createElement("img"):document.createElement("span");s.setAttribute("aria-hidden","true"),s instanceof HTMLImageElement?(s.src=n,s.alt="",Object.assign(s.style,{width:"18px",height:"18px",imageRendering:"pixelated"})):(s.textContent=n,Object.assign(s.style,{fontSize:"0.9rem",color:"#3df2c0"}));const o=document.createElement("span");o.textContent=e.toUpperCase(),Object.assign(o.style,{fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"0.65rem",color:"rgba(255,255,255,0.45)",letterSpacing:"0.08em"});const a=document.createElement("span");return a.id=`hud-${t}`,a.setAttribute("aria-label",`${e} count`),a.textContent="0",Object.assign(a.style,{fontFamily:"'Space Mono', monospace",fontWeight:"700",fontSize:"0.95rem",color:"#3df2c0",minWidth:"52px",textAlign:"right",transition:this._reducedMotion?"none":"color 0.2s"}),t==="gold"?this._goldEl=a:t==="wood"?this._woodEl=a:t==="supply"&&(this._supplyEl=a,a.textContent="0/10"),i.appendChild(s),i.appendChild(o),i.appendChild(a),i}_buildDivider(){const t=document.createElement("div");return Object.assign(t.style,{width:"1px",height:"20px",background:"rgba(61,242,192,0.20)"}),t.setAttribute("aria-hidden","true"),t}_buildSidebar(){const t=document.createElement("aside");t.id="hud-sidebar",t.setAttribute("role","complementary"),t.setAttribute("aria-label","Battlefield command sidebar"),Object.assign(t.style,{position:"fixed",left:"12px",bottom:"12px",width:"360px",maxWidth:"calc(100vw - 24px)",height:"min(640px, calc(100vh - 96px))",display:"grid",gridTemplateRows:"180px minmax(0, 1fr) 220px",gap:"10px",pointerEvents:"none"});const e=this._createSidebarSection("Minimap");e.id="hud-minimap",ai(e,"minimap",12,"rgba(10,12,16,0.90)"),e.appendChild(this._buildSidebarPlaceholder("MINIMAP")),this._minimapFrame=e;const n=this._createSidebarSection("Selection details");n.id="hud-selection-frame",ai(n,"panel",10,"rgba(10,12,16,0.90)"),this._selectionFrame=n;const i=this._createSidebarSection("Command card");i.id="hud-command-frame",ai(i,"panel",10,"rgba(10,12,16,0.90)"),this._commandFrame=i,t.appendChild(e),t.appendChild(n),t.appendChild(i),this._container.appendChild(t)}_createSidebarSection(t){const e=document.createElement("div");return e.setAttribute("role","region"),e.setAttribute("aria-label",t),Object.assign(e.style,{position:"relative",overflow:"hidden",pointerEvents:"auto",boxSizing:"border-box"}),e}_buildSidebarPlaceholder(t){const e=document.createElement("div");return e.textContent=t,Object.assign(e.style,{position:"absolute",inset:"0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Poppins', sans-serif",fontWeight:"600",fontSize:"0.7rem",color:"rgba(61,242,192,0.25)",letterSpacing:"0.12em",pointerEvents:"none"}),e}_setResource(t,e){const n=t==="gold"?this._goldEl:this._woodEl;n!=null&&(this._reducedMotion?n.textContent=String(e):this._animateValue(n,e))}_setClock(t){if(this._clockEl===null)return;const e=Math.floor(t/60).toString().padStart(2,"0"),n=(t%60).toString().padStart(2,"0");this._clockEl.textContent=`${e}:${n}`}_animateValue(t,e){t.textContent=String(e),t.style.color="#ffffff";const n=setTimeout(()=>{t.style.color="#3df2c0"},160),i=t._flashHandle;i!==void 0&&clearTimeout(i),t._flashHandle=n}}const s0="discipline_aura_attackspeed",o0="discipline_aura_armor";class a0 extends Ye{constructor(t,e){super(),this.config=t,this.bus=e;const n=t;this._radius=n.radius,this._updateFrequency=n.updateFrequency,this._maxAuraAllies=n.maxAuraAllies,this._maxAttackSpeedBonus=n.maxAttackSpeedBonus,this._maxArmorBonus=n.maxArmorBonus}name="DisciplineAuraSystem";_radius;_updateFrequency;_maxAuraAllies;_maxAttackSpeedBonus;_maxArmorBonus;_candidateCache=[];update(t){const e=this._radius*this._radius;for(const[n,i]of this.world.query(Xl,_e)){if(i.auraId!=="discipline_aura"||(i.updateTimer+=t,i.updateTimer<this._updateFrequency))continue;i.updateTimer-=this._updateFrequency;const s=this.world.getComponent(n,Et),o=this.world.getComponent(n,Ht);if(s===void 0||o===void 0)continue;this._candidateCache.length=0;for(const[l]of this.world.query(qi,Ht,Et,_e)){if(l===n)continue;const u=this.world.getComponent(l,Et);if(u===void 0||u.playerId!==s.playerId)continue;const h=this.world.getComponent(l,Ht);if(h===void 0)continue;const d=h.x-o.x,p=h.z-o.z,_=d*d+p*p;_<=e&&this._candidateCache.push({entity:l,distSq:_})}this._candidateCache.sort((l,u)=>l.distSq-u.distSq);const a=Math.min(this._candidateCache.length,this._maxAuraAllies),c=this._updateFrequency*2;for(let l=0;l<a;l++){const u=this._candidateCache[l].entity;this._applyOrRefreshBuff(u,n,s0,this._maxAttackSpeedBonus,c,{attackSpeedBonus:this._maxAttackSpeedBonus}),this._applyOrRefreshBuff(u,n,o0,this._maxArmorBonus,c,{armorBonus:this._maxArmorBonus})}}}_applyOrRefreshBuff(t,e,n,i,s,o={}){const a=this.world.getComponent(t,qi);if(a===void 0)return;const c=a.buffList.findIndex(u=>u.buffId===n);if(c!==-1){const u=a.buffList[c];if(u===void 0)return;u.remainingDuration=s;return}const l={buffId:n,sourceEntity:e,remainingDuration:s,magnitude:i,...o};if(a.buffList.push(l),o.armorBonus!==void 0&&o.armorBonus!==0){const u=this.world.getComponent(t,Ki);u!==void 0&&(u.bonusArmor+=o.armorBonus)}this.bus.emit("BUFF_APPLIED",{targetEntity:t,sourceEntity:e,buffId:n,duration:s,magnitude:i})}}class c0 extends Ye{name="BloodRushSystem";update(t){for(const[e,n]of this.world.query(_s,_e)){const i=this.world.getComponent(e,qe);if(i===void 0||i.max<=0){n.currentBonus=0;continue}const s=i.current/i.max;if(s>=n.hpThreshold){n.currentBonus=0;continue}const o=n.maxBonus+n.bonusIncrease,a=1-s/n.hpThreshold;n.currentBonus=o*a}}}class l0 extends Ye{constructor(t,e){super(),this.config=t,this.bus=e;for(const n of t.spells)this._spellLookup.set(n.id,n)}name="SpellSystem";_spellLookup=new Map;update(t){for(const[,e]of this.world.query(Wo,_e))for(const[n,i]of e.cooldowns){const s=i-t;s<=0?e.cooldowns.delete(n):e.cooldowns.set(n,s)}}castSpell(t,e,n){const i=this.world.getComponent(t,Wo);if(i===void 0)return!1;const s=this._spellLookup.get(e);return s===void 0||(i.cooldowns.get(e)??0)>0||!this.world.hasComponent(t,_e)||!this._isInRange(t,n,s.range)||!this._isValidTarget(t,n,s.targetType)?!1:(this._resolveEffect(s,t,n),i.cooldowns.set(e,s.cooldown),this.bus.emit("SPELL_CAST",{casterEntity:t,spellId:e,targetEntity:n}),!0)}_resolveEffect(t,e,n){const{effect:i}=t;switch(i.type){case"restore_hp":this._resolveRestoreHp(n,i.amount??0);break;case"buff_armor":this._resolveBuffArmor(e,n,t.id,i.amount??0,i.duration??0);break;case"buff_blood_rush":this._resolveBuffBloodRush(e,n,t.id,i.bonusIncrease??0,i.duration??0);break;case"chain_damage":this._resolveChainDamage(e,n,i.damage??0,i.bounces??0,i.bounceRadius??0);break;default:console.warn(`[SpellSystem] Unknown effect type: "${i.type}" on spell "${t.id}"`)}}_resolveRestoreHp(t,e){const n=this.world.getComponent(t,qe);n!==void 0&&(n.current=Math.min(n.current+e,n.max))}_resolveBuffArmor(t,e,n,i,s){const o=this.world.getComponent(e,qi);if(o===void 0)return;const a=`spell_${n}`,c=o.buffList.findIndex(h=>h.buffId===a);if(c!==-1){const h=o.buffList[c];if(h===void 0)return;h.remainingDuration=s;return}const l={buffId:a,sourceEntity:t,remainingDuration:s,magnitude:i,armorBonus:i};o.buffList.push(l);const u=this.world.getComponent(e,Ki);u!==void 0&&(u.bonusArmor+=i),this.bus.emit("BUFF_APPLIED",{targetEntity:e,sourceEntity:t,buffId:a,duration:s,magnitude:i})}_resolveBuffBloodRush(t,e,n,i,s){const o=this.world.getComponent(e,qi);if(o===void 0)return;const a=`spell_${n}`,c=o.buffList.findIndex(h=>h.buffId===a);if(c!==-1){const h=o.buffList[c];if(h===void 0)return;h.remainingDuration=s;return}const l={buffId:a,sourceEntity:t,remainingDuration:s,magnitude:i,bloodRushBonus:i};o.buffList.push(l);const u=this.world.getComponent(e,_s);u!==void 0&&(u.bonusIncrease+=i),this.bus.emit("BUFF_APPLIED",{targetEntity:e,sourceEntity:t,buffId:a,duration:s,magnitude:i})}_resolveChainDamage(t,e,n,i,s){const o=this.world.getComponent(t,Et);if(o===void 0)return;const a=s*s,c=new Set;let l=e;for(let u=0;u<=i&&!c.has(l);u++){c.add(l);const h=this.world.getComponent(l,qe);if(h!==void 0&&(h.current=Math.max(0,h.current-n)),u<i){const d=this._findNearestUnhitEnemy(l,o.playerId,a,c);if(d===void 0)break;l=d}}}_isInRange(t,e,n){const i=this.world.getComponent(t,Ht),s=this.world.getComponent(e,Ht);if(i===void 0||s===void 0)return!1;const o=s.x-i.x,a=s.z-i.z;return o*o+a*a<=n*n}_isValidTarget(t,e,n){const i=this.world.getComponent(t,Et),s=this.world.getComponent(e,Et);if(i===void 0||s===void 0||!this.world.hasComponent(e,_e))return!1;const o=i.playerId===s.playerId;return n==="friendly_unit"?o:n==="enemy_unit"?!o:!1}_findNearestUnhitEnemy(t,e,n,i){const s=this.world.getComponent(t,Ht);if(s===void 0)return;let o,a=1/0;for(const[c]of this.world.query(qe,Ht,Et,_e)){if(i.has(c))continue;const l=this.world.getComponent(c,Et);if(l===void 0||l.playerId===e)continue;const u=this.world.getComponent(c,Ht);if(u===void 0)continue;const h=u.x-s.x,d=u.z-s.z,p=h*h+d*d;p<=n&&p<a&&(a=p,o=c)}return o}}const jr=[];class u0 extends Ye{constructor(t){super(),this.bus=t}name="BuffSystem";update(t){for(const[e,n]of this.world.query(qi,_e)){const i=n.buffList;if(i.length!==0){jr.length=0;for(let s=0;s<i.length;s++)i[s].remainingDuration-=t,i[s].remainingDuration<=0&&jr.push(s);for(let s=jr.length-1;s>=0;s--){const o=jr[s],a=i[o];if(a.armorBonus!==void 0&&a.armorBonus!==0){const c=this.world.getComponent(e,Ki);c!==void 0&&(c.bonusArmor-=a.armorBonus,c.bonusArmor<0&&(c.bonusArmor=0))}if(a.bloodRushBonus!==void 0&&a.bloodRushBonus!==0){const c=this.world.getComponent(e,_s);c!==void 0&&(c.bonusIncrease-=a.bloodRushBonus,c.bonusIncrease<0&&(c.bonusIncrease=0))}i.splice(o,1),this.bus.emit("BUFF_EXPIRED",{targetEntity:e,buffId:a.buffId,sourceEntity:a.sourceEntity})}}}}}class h0{width;height;_visible;_explored;constructor(t,e){this.width=t,this.height=e;const n=t*e;this._visible=new Uint8Array(n),this._explored=new Uint8Array(n)}beginFrame(){this._visible.fill(0)}reveal(t,e){if(t<0||t>=this.width||e<0||e>=this.height)return;const n=e*this.width+t;this._visible[n]=1,this._explored[n]=1}getState(t,e){if(t<0||t>=this.width||e<0||e>=this.height)return"hidden";const n=e*this.width+t;return this._visible[n]===1?"visible":this._explored[n]===1?"explored":"hidden"}isVisible(t,e){return t<0||t>=this.width||e<0||e>=this.height?!1:this._visible[e*this.width+t]===1}isExplored(t,e){return t<0||t>=this.width||e<0||e>=this.height?!1:this._explored[e*this.width+t]===1}get rawVisible(){return this._visible}get rawExplored(){return this._explored}}const $c=8;class d0 extends Ye{name="FogOfWarSystem";_tileGrid;_fowGrid;_localPlayerId;_renderer;_rayBuffer;constructor(t,e,n,i=null){super(),this._tileGrid=t,this._fowGrid=e,this._localPlayerId=n,this._renderer=i;const s=$c+1;this._rayBuffer=Array.from({length:s},()=>({x:0,z:0}))}setRenderer(t){this._renderer=t}update(t){this._fowGrid.beginFrame();for(const[e,n]of this.world.query(Ht,Et)){const i=this.world.getComponent(e,Et);if(i===void 0||i.playerId!==this._localPlayerId)continue;const s=Math.floor(n.x),o=Math.floor(n.z);this._revealCircle(s,o,$c)}this._renderer!==null&&this._renderer.markDirty()}_revealCircle(t,e,n){this._fowGrid.reveal(t,e);for(let i=-n;i<=n;i++){const s=n-Math.abs(i);for(let o=-s;o<=s;o++)o===0&&i===0||this._castRay(t,e,t+o,e+i)}}_castRay(t,e,n,i){let s=t,o=e;const a=Math.abs(n-t),c=Math.abs(i-e),l=t<n?1:-1,u=e<i?1:-1;let h=a-c;for(;;){if(s!==t||o!==e){const p=this._tileGrid.isWalkable(s,o);if(this._fowGrid.reveal(s,o),!p)return}if(s===n&&o===i)return;const d=2*h;d>-c&&(h-=c,s+=l),d<a&&(h+=a,o+=u)}}}const f0=255,p0=140,m0=0;class us{_mapWidth;_mapHeight;_fowGrid;_sceneManager;_texelBuffer;_texture;_mesh;_dirty=!1;static SCENE_KEY="fog-of-war";constructor(t,e,n,i){this._sceneManager=t,this._fowGrid=e,this._mapWidth=n,this._mapHeight=i,this._texelBuffer=new Uint8Array(n*i*4);for(let a=0;a<this._texelBuffer.length;a+=4)this._texelBuffer[a+0]=0,this._texelBuffer[a+1]=0,this._texelBuffer[a+2]=0,this._texelBuffer[a+3]=0;this._texture=new Al(this._texelBuffer,n,i,nn,vn),this._texture.minFilter=ve,this._texture.magFilter=ve,this._texture.generateMipmaps=!1,this._texture.colorSpace=li,this._texture.needsUpdate=!0;const s=new Yn(n,i);s.rotateX(-Math.PI/2);const o=new Wn({map:this._texture,transparent:!0,depthWrite:!1});this._mesh=new st(s,o),this._mesh.position.set(n/2,.05,i/2),this._mesh.renderOrder=1,this._mesh.raycast=()=>{},this._sceneManager.addObject(us.SCENE_KEY,this._mesh)}markDirty(){this._dirty=!0}update(){this._dirty&&(this._rebuildTexelBuffer(),this._texture.needsUpdate=!0,this._dirty=!1)}isVisible(t,e){return this._fowGrid.isVisible(t,e)}isExplored(t,e){return this._fowGrid.isExplored(t,e)}dispose(){this._sceneManager.removeObject(us.SCENE_KEY),this._texture.dispose(),this._mesh.geometry.dispose(),this._mesh.material.dispose()}_rebuildTexelBuffer(){const t=this._fowGrid.rawVisible,e=this._fowGrid.rawExplored,n=this._texelBuffer,i=this._mapWidth,s=this._mapHeight;for(let o=0;o<s;o++){const a=s-1-o;for(let c=0;c<i;c++){const l=o*i+c,u=(a*i+c)*4,h=t[l]===1?m0:e[l]===1?p0:f0;n[u+0]=0,n[u+1]=0,n[u+2]=0,n[u+3]=h}}}}class _0{_sceneManager;_world;_effects=[];_textures=new Map;_nextEffectId=0;_flashGeo=new Qe(.3,6,4);_flashMat=new Wn({color:16777028,transparent:!0,opacity:.9});_deathMat=new Wn({color:16729156,transparent:!0,opacity:.8});_explosionGeo=new Qe(.8,8,6);_explosionMat=new Wn({color:16737792,transparent:!0,opacity:.9});constructor(t,e,n){this._sceneManager=t,this._world=e,n.on("UNIT_ATTACKED",i=>{const s=i,o=this._getPos(s.targetEntity);o&&this.spawnFlash(o.x,o.z)}),n.on("UNIT_DIED",i=>{const s=i,o=this._getPos(s.entityId);o&&this.spawnDeath(o.x,o.z)}),n.on("BUILDING_DESTROYED",i=>{const s=i,o=this._getPos(s.entityId);o&&this.spawnExplosion(o.x,o.z)})}_getPos(t){return this._world.getComponent(t,Ht)}spawnFlash(t,e){const n=`effect-${this._nextEffectId++}`,i=this._createEffectMesh("hit_spark",t,.8,e,1.1,16777164)??new st(this._flashGeo,this._flashMat.clone());i.position.set(t,.8,e),this._sceneManager.addObject(n,i),this._effects.push({key:n,mesh:i,lifetime:.2,elapsed:0,type:"flash"})}spawnDeath(t,e){const n=`effect-${this._nextEffectId++}`,i=this._createEffectMesh("smoke",t,.6,e,1.8,14185558)??new st(this._flashGeo,this._deathMat.clone());i.position.set(t,.5,e),i.scale.setScalar(1.5),this._sceneManager.addObject(n,i),this._effects.push({key:n,mesh:i,lifetime:.5,elapsed:0,type:"death"})}spawnExplosion(t,e){const n=`effect-${this._nextEffectId++}`,i=this._createEffectMesh("explosion",t,1,e,2.3,16765072)??new st(this._explosionGeo,this._explosionMat.clone());i.position.set(t,1,e),this._sceneManager.addObject(n,i),this._effects.push({key:n,mesh:i,lifetime:.8,elapsed:0,type:"explosion"})}_createEffectMesh(t,e,n,i,s,o){const a=j_(t);if(a===null)return null;const c=new Ho(new na({map:this._getTexture(a),color:o,transparent:!0,depthWrite:!1}));return c.position.set(e,n,i),c.scale.set(s,s,1),c}_getTexture(t){let e=this._textures.get(t);return e||(e=new Pl().load(t),e.colorSpace=Ne,e.wrapS=Ve,e.wrapT=Ve,e.minFilter=en,e.magFilter=en,this._textures.set(t,e)),e}update(t){for(let e=this._effects.length-1;e>=0;e--){const n=this._effects[e];n.elapsed+=t;const i=n.elapsed/n.lifetime;if(i>=1){this._sceneManager.removeObject(n.key);const o=n.mesh.material;o instanceof $n&&o.dispose(),this._effects.splice(e,1);continue}const s=n.mesh.material;s.opacity=1-i,n.type==="death"?(n.mesh.scale.setScalar(1.5+i*.5),n.mesh.position.y=.5+i*.3):n.type==="explosion"?n.mesh.scale.setScalar(1+i*2):n.mesh.scale.setScalar(1+i*.5)}}dispose(){for(const t of this._effects)this._sceneManager.removeObject(t.key);this._effects.length=0,this._flashGeo.dispose(),this._flashMat.dispose(),this._deathMat.dispose(),this._explosionGeo.dispose(),this._explosionMat.dispose();for(const t of this._textures.values())t.dispose();this._textures.clear()}}class g0{_ctx=null;_masterGain=null;constructor(t){const e=()=>{this._ctx||(this._ctx=new AudioContext,this._masterGain=this._ctx.createGain(),this._masterGain.gain.value=.3,this._masterGain.connect(this._ctx.destination),window.removeEventListener("click",e),window.removeEventListener("keydown",e))};window.addEventListener("click",e),window.addEventListener("keydown",e),t.on("UNIT_ATTACKED",()=>this._playHit()),t.on("UNIT_DIED",()=>this._playDeath()),t.on("BUILDING_COMPLETE",()=>this._playBuildComplete()),t.on("UNIT_TRAINED",()=>this._playTrainComplete()),t.on("BUILDING_DESTROYED",()=>this._playExplosion())}_playHit(){if(!this._ctx||!this._masterGain)return;const t=this._ctx.createOscillator(),e=this._ctx.createGain();t.type="square",t.frequency.setValueAtTime(800,this._ctx.currentTime),t.frequency.exponentialRampToValueAtTime(200,this._ctx.currentTime+.08),e.gain.setValueAtTime(.15,this._ctx.currentTime),e.gain.exponentialRampToValueAtTime(.001,this._ctx.currentTime+.1),t.connect(e).connect(this._masterGain),t.start(),t.stop(this._ctx.currentTime+.1)}_playDeath(){if(!this._ctx||!this._masterGain)return;const t=this._ctx.createOscillator(),e=this._ctx.createGain();t.type="sine",t.frequency.setValueAtTime(150,this._ctx.currentTime),t.frequency.exponentialRampToValueAtTime(40,this._ctx.currentTime+.3),e.gain.setValueAtTime(.3,this._ctx.currentTime),e.gain.exponentialRampToValueAtTime(.001,this._ctx.currentTime+.3),t.connect(e).connect(this._masterGain),t.start(),t.stop(this._ctx.currentTime+.35)}_playBuildComplete(){if(!this._ctx||!this._masterGain)return;const t=[523,659,784];for(let e=0;e<t.length;e++){const n=this._ctx.createOscillator(),i=this._ctx.createGain();n.type="sine",n.frequency.value=t[e];const s=this._ctx.currentTime+e*.1;i.gain.setValueAtTime(.15,s),i.gain.exponentialRampToValueAtTime(.001,s+.2),n.connect(i).connect(this._masterGain),n.start(s),n.stop(s+.25)}}_playTrainComplete(){if(!this._ctx||!this._masterGain)return;const t=this._ctx.createOscillator(),e=this._ctx.createGain();t.type="triangle",t.frequency.value=880,e.gain.setValueAtTime(.2,this._ctx.currentTime),e.gain.exponentialRampToValueAtTime(.001,this._ctx.currentTime+.15),t.connect(e).connect(this._masterGain),t.start(),t.stop(this._ctx.currentTime+.2)}_playExplosion(){if(!this._ctx||!this._masterGain)return;const t=this._ctx.createOscillator(),e=this._ctx.createGain();t.type="sawtooth",t.frequency.setValueAtTime(100,this._ctx.currentTime),t.frequency.exponentialRampToValueAtTime(30,this._ctx.currentTime+.5),e.gain.setValueAtTime(.25,this._ctx.currentTime),e.gain.exponentialRampToValueAtTime(.001,this._ctx.currentTime+.5),t.connect(e).connect(this._masterGain),t.start(),t.stop(this._ctx.currentTime+.55)}}const jc="mow_tutorial_done";class Kc{_steps;_overlay;_gameEventBus;_currentIndex=0;_active=!1;_unsubs=[];_timer=null;constructor(t,e,n){this._steps=t,this._overlay=e,this._gameEventBus=n,this._overlay.onSkip=()=>this.finish()}static isDone(){return localStorage.getItem(jc)==="true"}get active(){return this._active}start(){this._active||this._steps.length===0||(this._active=!0,this._currentIndex=0,this._showCurrentStep())}poll(){if(!this._active)return;const t=this._steps[this._currentIndex];t&&t.completion.type==="poll"&&t.completion.pollCheck&&t.completion.pollCheck()&&this._advance()}finish(){this._active&&(this._active=!1,this._cleanupCurrentStep(),this._overlay.hide(),localStorage.setItem(jc,"true"))}_showCurrentStep(){const t=this._steps[this._currentIndex];if(!t){this.finish();return}if(this._cleanupCurrentStep(),this._overlay.showStep(t,t.completionHint),t.completion.type==="event"&&t.completion.eventName){const e=t.completion.eventName,n=t.completion.eventFilter,i=this._gameEventBus.on(e,s=>{(!n||n(s))&&this._advance()});this._unsubs.push(i)}t.completion.type==="timer"&&t.completion.timerMs&&(this._timer=setTimeout(()=>this._advance(),t.completion.timerMs))}_advance(){this._cleanupCurrentStep(),this._currentIndex++,this._currentIndex>=this._steps.length?this.finish():this._showCurrentStep()}_cleanupCurrentStep(){for(const t of this._unsubs)t();this._unsubs=[],this._timer!==null&&(clearTimeout(this._timer),this._timer=null)}}const Zc="tutorial-overlay-styles";function v0(){if(document.getElementById(Zc))return;const r=document.createElement("style");r.id=Zc,r.textContent=`
    @keyframes tut-pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(61,242,192,0.35); }
      50%      { box-shadow: 0 0 0 10px rgba(61,242,192,0.08); }
    }
    @keyframes tut-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tut-highlight-ring {
      animation: tut-pulse 1.5s ease-in-out infinite;
      border-radius: 6px;
      pointer-events: none;
    }
    #tut-tooltip {
      position: fixed;
      width: 360px;
      background: #0a0c10;
      border: 2px solid rgba(61,242,192,0.45);
      border-radius: 8px;
      padding: 16px 20px;
      pointer-events: auto;
      z-index: 8002;
      box-sizing: border-box;
    }
    #tut-tooltip.tut-fade {
      animation: tut-fade-in 0.3s ease forwards;
    }
    #tut-step-counter {
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      color: rgba(61,242,192,0.5);
      margin-bottom: 6px;
      letter-spacing: 0.08em;
    }
    #tut-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 1.05rem;
      color: #ffffff;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    #tut-body {
      font-family: 'Space Mono', monospace;
      font-size: 0.82rem;
      color: rgba(255,255,255,0.75);
      margin: 0 0 8px 0;
      line-height: 1.5;
    }
    #tut-hint {
      font-family: 'Space Mono', monospace;
      font-size: 0.7rem;
      font-style: italic;
      color: rgba(61,242,192,0.6);
      margin: 0 0 10px 0;
    }
    #tut-skip-btn {
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.30);
      background: none;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    #tut-skip-btn:hover {
      color: rgba(255,255,255,0.60);
      border-color: rgba(255,255,255,0.25);
    }
  `,document.head.appendChild(r)}class x0{_root=null;_highlightRing=null;onSkip=null;_reducedMotion=typeof window<"u"?window.matchMedia("(prefers-reduced-motion: reduce)").matches:!1;mount(t){if(this._root)return;v0(),this._root=document.createElement("div"),this._root.style.cssText="position:fixed;inset:0;z-index:8000;pointer-events:none;";const e=document.createElement("div");e.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,0.15);pointer-events:none;",this._root.appendChild(e),this._highlightRing=document.createElement("div"),this._highlightRing.className="tut-highlight-ring",this._highlightRing.style.cssText="position:fixed;display:none;pointer-events:none;z-index:8001;",this._root.appendChild(this._highlightRing);const n=document.createElement("div");n.id="tut-tooltip",n.setAttribute("role","dialog"),n.setAttribute("aria-label","Tutorial"),n.style.display="none",n.innerHTML=`
      <div id="tut-step-counter"></div>
      <h3 id="tut-title"></h3>
      <p id="tut-body"></p>
      <div id="tut-hint"></div>
      <button type="button" id="tut-skip-btn">Skip Tutorial</button>
    `,this._root.appendChild(n),t.appendChild(this._root);const i=document.getElementById("tut-skip-btn");i&&i.addEventListener("click",()=>{this.onSkip&&this.onSkip()})}destroy(){this._root?.remove(),this._root=null,this._highlightRing=null}showStep(t,e){const n=document.getElementById("tut-tooltip");if(!this._root||!n)return;const i=document.getElementById("tut-step-counter"),s=document.getElementById("tut-title"),o=document.getElementById("tut-body"),a=document.getElementById("tut-hint");i&&(i.textContent=`Step ${t.stepNumber} of ${t.totalSteps}`),s&&(s.textContent=t.title),o&&(o.textContent=t.body),a&&(a.textContent=e??"",a.style.display=e?"block":"none"),this.clearHighlight(),t.highlight.type==="ui"&&t.highlight.uiSelector&&this.highlightElement(t.highlight.uiSelector),this._positionTooltip(n,t),this._root.style.display="block",n.style.display="block",this._reducedMotion||(n.classList.remove("tut-fade"),n.offsetWidth,n.classList.add("tut-fade"))}highlightElement(t){const e=document.querySelector(t);if(!e||!this._highlightRing)return;const n=e.getBoundingClientRect(),i=6;this._highlightRing.style.display="block",this._highlightRing.style.left=`${n.left-i}px`,this._highlightRing.style.top=`${n.top-i}px`,this._highlightRing.style.width=`${n.width+i*2}px`,this._highlightRing.style.height=`${n.height+i*2}px`}clearHighlight(){this._highlightRing&&(this._highlightRing.style.display="none")}hide(){this._root&&(this._root.style.display="none",this.clearHighlight())}_positionTooltip(t,e){if(t.style.top="",t.style.bottom="",t.style.left="",t.style.right="",t.style.transform="",e.highlight.type==="ui"&&e.highlight.uiSelector){const n=document.querySelector(e.highlight.uiSelector);if(n){const i=n.getBoundingClientRect(),s=window.innerHeight,o=window.innerWidth;i.top>s/2?(t.style.bottom=`${s-i.top+16}px`,t.style.left=`${Math.min(o-400,Math.max(20,i.left))}px`):(t.style.top=`${i.bottom+16}px`,t.style.left=`${Math.min(o-400,Math.max(20,i.left))}px`);return}}t.style.top="50px",t.style.right="20px"}}const pn=10;function y0(r){const{selectionMgr:t,world:e,camCtrl:n,getPlacementMode:i}=r,s=n.camera.position.x,o=n.camera.position.z;function a(){if(t.selected.size===0)return!1;for(const h of t.selected)if(e.getComponent(h,Te)?.isWorker)return!0;return!1}function c(h){for(const d of t.selected)if(e.getComponent(d,Be)?.buildingId===h)return!0;return!1}const l=i;let u=!1;return[{id:"welcome",title:"Welcome, Commander!",body:"Welcome to Minds of War! Use WASD keys or move your mouse to the screen edges to pan the camera.",completionHint:"> Pan the camera to continue...",stepNumber:1,totalSteps:pn,highlight:{type:"none"},completion:{type:"poll",pollCheck:()=>{const h=Math.abs(n.camera.position.x-s),d=Math.abs(n.camera.position.z-o);return h>3||d>3}}},{id:"select-worker",title:"Select a Worker",body:"Left-click on one of your Peasant workers to select them. You'll see a cyan ring appear around them.",completionHint:"> Click a Peasant to continue...",stepNumber:2,totalSteps:pn,highlight:{type:"none"},completion:{type:"poll",pollCheck:()=>a()}},{id:"harvest-gold",title:"Harvest Gold",body:"With your worker selected, right-click on a Gold Mine (the glowing yellow crystal) to begin harvesting.",completionHint:"> Right-click a Gold Mine. Wait for the worker to deliver gold...",stepNumber:3,totalSteps:pn,highlight:{type:"none"},completion:{type:"event",eventName:"RESOURCE_DEPOSITED",eventFilter:h=>{const d=h;return d.playerId==="human"&&d.kind==="gold"}}},{id:"watch-resources",title:"Resources Incoming!",body:"Your worker is gathering gold! Watch the Gold counter increase in the resource bar at the top.",stepNumber:4,totalSteps:pn,highlight:{type:"ui",uiSelector:"#hud-gold"},completion:{type:"timer",timerMs:4e3}},{id:"select-worker-build",title:"Select a Worker",body:"Select an idle Peasant worker. We're going to build a Farm to increase your supply cap.",completionHint:"> Click a Peasant to continue...",stepNumber:5,totalSteps:pn,highlight:{type:"none"},completion:{type:"poll",pollCheck:()=>a()}},{id:"build-farm",title:"Build a Farm",body:'Press Q or click "Build Farm" in the command card (bottom-right) to enter build mode.',completionHint:"> Press Q or click Build Farm...",stepNumber:6,totalSteps:pn,highlight:{type:"ui",uiSelector:"#command-card"},completion:{type:"poll",pollCheck:()=>{const h=l();return h!==null&&(u=!0),h!==null}}},{id:"place-farm",title:"Place the Farm",body:"Click on an open area near your Keep to place the Farm. Your worker will start building it.",completionHint:"> Click the ground to place the Farm...",stepNumber:7,totalSteps:pn,highlight:{type:"none"},completion:{type:"poll",pollCheck:()=>{const h=l();return!!(u&&h===null)}}},{id:"select-keep",title:"Select Your Keep",body:"Left-click on your Keep (the large building with the tower and flag) to select it.",completionHint:"> Click the Keep to continue...",stepNumber:8,totalSteps:pn,highlight:{type:"none"},completion:{type:"poll",pollCheck:()=>c("keep")}},{id:"train-peasant",title:"Train a Peasant",body:'Press Q or click "Train Peasant" in the command card to queue a new worker. It costs 75 gold.',completionHint:"> Press Q or click Train Peasant...",stepNumber:9,totalSteps:pn,highlight:{type:"ui",uiSelector:"#command-card"},completion:{type:"event",eventName:"UNIT_QUEUED",eventFilter:h=>h.playerId==="human"}},{id:"complete",title:"Tutorial Complete!",body:"You're ready! Build a Barracks to train combat units, then destroy the Orc Stronghold to win. Good luck, Commander!",stepNumber:10,totalSteps:pn,highlight:{type:"none"},completion:{type:"timer",timerMs:6e3}}]}function Jc(r){return r===1?1:r===2?2:0}function Js(r,t){const e=t.getBoundingClientRect();return{x:r.clientX-e.left,y:r.clientY-e.top}}class M0{_canvas;_bus;_mounted=!1;_onMouseDown;_onMouseUp;_onMouseMove;_onWheel;_onKeyDown;_onKeyUp;_onContextMenu;constructor(t,e){this._canvas=t,this._bus=e,this._onMouseDown=this._handleMouseDown.bind(this),this._onMouseUp=this._handleMouseUp.bind(this),this._onMouseMove=this._handleMouseMove.bind(this),this._onWheel=this._handleWheel.bind(this),this._onKeyDown=this._handleKeyDown.bind(this),this._onKeyUp=this._handleKeyUp.bind(this),this._onContextMenu=n=>n.preventDefault()}mount(){this._mounted||(this._mounted=!0,this._canvas.addEventListener("mousedown",this._onMouseDown),this._canvas.addEventListener("mouseup",this._onMouseUp),this._canvas.addEventListener("mousemove",this._onMouseMove),this._canvas.addEventListener("wheel",this._onWheel,{passive:!0}),this._canvas.addEventListener("contextmenu",this._onContextMenu),window.addEventListener("keydown",this._onKeyDown),window.addEventListener("keyup",this._onKeyUp))}destroy(){this._mounted&&(this._mounted=!1,this._canvas.removeEventListener("mousedown",this._onMouseDown),this._canvas.removeEventListener("mouseup",this._onMouseUp),this._canvas.removeEventListener("mousemove",this._onMouseMove),this._canvas.removeEventListener("wheel",this._onWheel),this._canvas.removeEventListener("contextmenu",this._onContextMenu),window.removeEventListener("keydown",this._onKeyDown),window.removeEventListener("keyup",this._onKeyUp))}_handleMouseDown(t){const e=Js(t,this._canvas);this._bus.emit("pointerDown",{...e,button:Jc(t.button)})}_handleMouseUp(t){const e=Js(t,this._canvas);this._bus.emit("pointerUp",{...e,button:Jc(t.button)})}_handleMouseMove(t){const e=Js(t,this._canvas);this._bus.emit("pointerMove",e),t.buttons!==0&&this._bus.emit("pointerDrag",{...e,buttons:t.buttons})}_handleWheel(t){this._bus.emit("wheel",{deltaY:t.deltaY})}_handleKeyDown(t){t.repeat||this._bus.emit("keyDown",{code:t.code,shiftKey:t.shiftKey,ctrlKey:t.ctrlKey,altKey:t.altKey})}_handleKeyUp(t){this._bus.emit("keyUp",{code:t.code})}}const Qs="Selectable",S0="SelectionRing";class w0{_world;_entityAtPosition;_localPlayer;_selected=new Set;constructor(t,e,n){this._world=t,this._entityAtPosition=e,this._localPlayer=n}get selected(){return this._selected}isSelected(t){return this._selected.has(t)}get count(){return this._selected.size}selectAt(t,e){const n=this._entityAtPosition(t);if(n===null){e||this._clearAll();return}if(!this._world.hasComponent(n,Qs)){e||this._clearAll();return}e?this._selected.has(n)?this._deselect(n):this._select(n):(this._clearAll(),this._select(n))}selectInBox(t,e,n){n||this._clearAll();const i=Math.min(t.x,e.x),s=Math.max(t.x,e.x),o=Math.min(t.z,e.z),a=Math.max(t.z,e.z);for(const[c]of this._world.query(Qs)){if(!this._isOwnedByLocalPlayer(c))continue;const l=this._world.getComponent(c,Ht);l!==void 0&&l.x>=i&&l.x<=s&&l.z>=o&&l.z<=a&&this._select(c)}}clearSelection(){this._clearAll()}_select(t){this._selected.add(t),this._syncComponentState(t,!0)}_deselect(t){this._selected.delete(t),this._syncComponentState(t,!1)}_clearAll(){for(const t of this._selected)this._syncComponentState(t,!1);this._selected.clear()}_syncComponentState(t,e){const n=this._world.getComponent(t,Qs);n!==void 0&&(n.selected=e);const i=this._world.getComponent(t,S0);i!==void 0&&(i.mesh.visible=e)}_isOwnedByLocalPlayer(t){return this._world.getComponent(t,Et)?.playerId===this._localPlayer}}class E0{_selection;_bus;_entityAtPosition;_localPlayer;_world;constructor(t,e,n,i,s){this._selection=t,this._bus=e,this._world=n,this._entityAtPosition=i,this._localPlayer=s}issueRightClick(t){const e=this._selectedEntities();if(e.length===0)return;const n=this._entityAtPosition(t);n!==null&&this._isEnemy(n)?this._bus.emit("attackCommand",{entities:e,targetId:n,playerId:this._localPlayer}):this._bus.emit("moveCommand",{entities:e,target:t,playerId:this._localPlayer})}issueHotkey(t,e){const n=this._selectedEntities();if(n.length!==0)switch(t){case"KeyS":this._bus.emit("stopCommand",{entities:n,playerId:this._localPlayer});break;case"KeyP":e!==void 0&&this._bus.emit("patrolCommand",{entities:n,target:e,playerId:this._localPlayer});break}}issueBuild(t,e,n){this._bus.emit("buildCommand",{workerEntity:t,buildingType:e,target:n,playerId:this._localPlayer})}_selectedEntities(){return Array.from(this._selection.selected)}_isEnemy(t){if(!this._world.hasComponent(t,qe))return!1;const e=this._world.getComponent(t,Et);return e===void 0?!1:e.playerId!==this._localPlayer}}class b0{_container=null;_rectEl=null;_dragging=!1;_origin={x:0,z:0};_current={x:0,z:0};mount(t){this._container===null&&(this._container=document.createElement("div"),Object.assign(this._container.style,{position:"fixed",inset:"0",pointerEvents:"none",zIndex:"50",overflow:"hidden"}),this._container.setAttribute("aria-hidden","true"),this._rectEl=document.createElement("div"),Object.assign(this._rectEl.style,{position:"absolute",display:"none",border:"1px solid #3df2c0",background:"rgba(61,242,192,0.06)"}),this._container.appendChild(this._rectEl),t.appendChild(this._container))}destroy(){this._container?.remove(),this._container=null,this._rectEl=null,this._dragging=!1}begin(t){this._dragging=!0,this._origin={...t},this._current={...t},this._applyRect(),this._rectEl!==null&&(this._rectEl.style.display="block")}update(t){this._dragging&&(this._current={...t},this._applyRect())}end(){if(!this._dragging)return null;const t={origin:{...this._origin},current:{...this._current}};return this._dragging=!1,this._rectEl!==null&&(this._rectEl.style.display="none"),t}cancel(){this._dragging=!1,this._rectEl!==null&&(this._rectEl.style.display="none")}get isDragging(){return this._dragging}_applyRect(){if(this._rectEl===null)return;const t=this._origin.x,e=this._origin.z,n=this._current.x,i=this._current.z,s=Math.min(t,n),o=Math.min(e,i),a=Math.abs(n-t),c=Math.abs(i-e);this._rectEl.style.left=`${s}px`,this._rectEl.style.top=`${o}px`,this._rectEl.style.width=`${a}px`,this._rectEl.style.height=`${c}px`}}function T0({appRoot:r,renderer:t,scene:e,sceneManager:n,cameraController:i,world:s,gameEventBus:o,config:a,techTreeSystem:c,resourceTracker:l,buildingFactory:u,commandCard:h,mapWidth:d,mapHeight:p}){const _=new td,x=new Nt,m=new kn(new L(0,1,0),0),f=new L;let E=null;const w=(nt,ht)=>{const I=t.domElement.getBoundingClientRect();x.set((nt-I.left)/I.width*2-1,-((ht-I.top)/I.height)*2+1)},y=(nt,ht)=>(w(nt,ht),_.setFromCamera(x,i.camera),_.ray.intersectPlane(m,f)?{x:f.x,z:f.z}:null),P=(nt,ht)=>{w(nt,ht),_.setFromCamera(x,i.camera),E=null;for(const I of _.intersectObjects(e.children,!0)){let V=I.object;for(;V;){if(V.userData.entityId!=null){E=V.userData.entityId;return}V=V.parent}}},C=nt=>E,T=new is,R=new is,S=new M0(t.domElement,T),g=new b0,A=new w0(s,C,"human"),B=new E0(A,R,s,C,"human");g.mount(r),S.mount();let O=null,X=null;const Y=()=>{O=null,X&&(n.removeObject("placement-ghost"),X=null)},q=nt=>{Y(),O=nt,X=new st(new jt(2,1,2),new In({color:65416,transparent:!0,opacity:.5})),X.position.y=.5,X.raycast=()=>{},n.addObject("placement-ghost",X)},J=(nt,ht)=>{const I=s.getComponent(nt,Et);if(!I)return;const V=I.playerId,j=(V==="human"?a.humanUnits.units:a.orcUnits.units).find(Rt=>Rt.id===ht);if(!j){console.warn(`Unknown unit: ${ht}`);return}if(!c.canTrainUnit(V,V,j.id,j.tier)){console.log("Unit is not unlocked yet",ht);return}const rt=j.cost??{gold:0,wood:0};if(!l.canAfford(V,rt)){console.log("Cannot afford",ht);return}l.spend(V,rt);const mt=s.getComponent(nt,vr);mt&&(mt.queue.push(ht),o.emit("UNIT_QUEUED",{unitId:ht,buildingEntity:nt,playerId:V,queueLength:mt.queue.length}),console.log(`Queued ${ht} at building ${nt}, queue length: ${mt.queue.length}`))},G=()=>{const nt=A.selected;if(nt.size===0){h.setCommands([]);return}const ht=nt.values().next().value,I=[],V=s.getComponent(ht,Te),it=s.getComponent(ht,Be);if(V&&V.isWorker)I.push({id:"harvest",label:"Harvest",hotkey:"H",icon:ln("harvest")??"⛏",onActivate:()=>{}}),I.push({id:"build-farm",label:"Build Farm",hotkey:"Q",icon:ln("build-farm")??"🌾",onActivate:()=>q("farm")}),I.push({id:"build-barracks",label:"Build Barracks",hotkey:"W",icon:ln("build-barracks")??"⚔",onActivate:()=>q("barracks")}),I.push({id:"build-tower",label:"Build Tower",hotkey:"E",icon:ln("build-tower")??"🗼",onActivate:()=>q("watch_tower")}),I.push({id:"build-archery",label:"Archery Range",hotkey:"R",icon:ln("build-archery")??"🏹",onActivate:()=>q("archery_range")}),c.canConstructBuilding("human","human","blacksmith")&&I.push({id:"build-blacksmith",label:"Blacksmith",hotkey:"T",icon:ln("build-blacksmith")??"🔨",onActivate:()=>q("blacksmith")});else if(it){const j=it.buildingId;if(j==="keep"||j==="stronghold"){const rt=j==="keep"?"peasant":"thrall";I.push({id:"train-worker",label:`Train ${rt}`,hotkey:"Q",icon:ln("train-worker")??"👷",onActivate:()=>J(ht,rt)})}if(j==="barracks"||j==="war_camp"){const rt=j==="barracks"?"footman":"grunt";I.push({id:"train-melee",label:`Train ${rt}`,hotkey:"Q",icon:ln("train-melee")??"⚔",onActivate:()=>J(ht,rt)})}if(j==="archery_range"||j==="beast_den"){const rt=j==="archery_range"?"archer":"hunter";I.push({id:"train-ranged",label:`Train ${rt}`,hotkey:"Q",icon:ln("train-ranged")??"🏹",onActivate:()=>J(ht,rt)})}}else V&&(I.push({id:"attack",label:"Attack",hotkey:"A",icon:ln("attack")??"⚔",onActivate:()=>{}}),I.push({id:"stop",label:"Stop",hotkey:"S",icon:ln("stop")??"⛔",onActivate:()=>B.issueHotkey("KeyS")}));h.setCommands(I)},ot=(nt,ht)=>{const I=s.getComponent(nt,Ht);if(!I)return;let V=null,it=1/0;for(const[j,rt]of s.query(Be)){const mt=s.getComponent(j,Et);if(!mt||mt.playerId!=="human"||!rt.isComplete)continue;const Rt=s.getComponent(j,Ht);if(!Rt)continue;const Kt=Math.abs(Rt.x-I.x)+Math.abs(Rt.z-I.z);Kt<it&&(it=Kt,V=j)}if(V!==null){for(const j of A.selected){const rt=s.getComponent(j,ps);if(!rt)continue;rt.assignedResource=nt,rt.assignedDropOff=V,rt.carryType=ht.kind,rt.state="movingToResource",rt.carryAmount=0,rt.gatherTimer=0;const mt=s.getComponent(j,We);mt&&(mt.targetX=I.x,mt.targetZ=I.z,mt.waypoints=[],mt.waypointIndex=0)}console.log(`Harvest order: ${A.selected.size} workers → ${ht.kind}`)}};let at=null,Mt=!1;return T.on("pointerDown",({x:nt,y:ht,button:I})=>{if(P(nt,ht),I===0){if(O){const V=y(nt,ht);if(V){const it=Math.round(V.x),j=Math.round(V.z);if(it>=0&&it<d&&j>=0&&j<p){let rt=null;for(const mt of A.selected)if(s.getComponent(mt,Te)?.isWorker){rt=mt;break}if(rt!==null){const mt=a.humanBuildings.buildings.find(Rt=>Rt.id===O);if(mt){if(!c.canConstructBuilding("human","human",mt.id)){console.log("Building is not unlocked yet",mt.id),Y();return}const Rt=mt.cost??{gold:0,wood:0};if(l.canAfford("human",Rt)){l.spend("human",Rt),u.createBuilding(O,"human",it,j,!1,rt);const Kt=s.getComponent(rt,We);Kt&&(Kt.targetX=it,Kt.targetZ=j,Kt.waypoints=[],Kt.waypointIndex=0),console.log(`Building ${O} at (${it}, ${j})`)}}}}}Y();return}at={x:nt,y:ht},Mt=!1}if(I===2){if(O){Y();return}const V=y(nt,ht);if(!V)return;const it=E;if(it!==null){const j=s.getComponent(it,pr);if(j){ot(it,j);return}}B.issueRightClick(V)}}),T.on("pointerDrag",({x:nt,y:ht,buttons:I})=>{!(I&1)||!at||(!Mt&&Math.hypot(nt-at.x,ht-at.y)>=5&&(Mt=!0,g.begin({x:at.x,z:at.y})),Mt&&g.update({x:nt,z:ht}))}),T.on("pointerUp",({x:nt,y:ht,button:I})=>{if(I===0){if(Mt){const V=g.end();if(V){const it=y(V.origin.x,V.origin.z),j=y(V.current.x,V.current.z);it&&j&&A.selectInBox(it,j,!1)}}else{P(nt,ht);const V=y(nt,ht);V&&A.selectAt(V,!1)}at=null,Mt=!1,G()}}),T.on("pointerMove",({x:nt,y:ht})=>{if(!O||!X)return;const I=y(nt,ht);I&&(X.position.x=Math.round(I.x),X.position.z=Math.round(I.z))}),T.on("keyDown",({code:nt})=>{if(nt==="Escape"){Y();return}h.handleHotkey(nt),B.issueHotkey(nt)}),R.on("moveCommand",({entities:nt,target:ht})=>{for(const I of nt){const V=s.getComponent(I,We);V&&(V.targetX=ht.x,V.targetZ=ht.z,V.waypoints=[],V.waypointIndex=0)}}),R.on("attackCommand",({entities:nt,targetId:ht})=>{for(const I of nt)s.addComponent(I,dn,{targetEntity:ht})}),R.on("stopCommand",({entities:nt})=>{for(const ht of nt){const I=s.getComponent(ht,We);I&&(I.targetX=void 0,I.targetZ=void 0,I.waypoints=[],I.waypointIndex=0)}}),{inputBus:T,commandBus:R,inputManager:S,selectionManager:A,commandDispatcher:B,getPlacementMode:()=>O}}class A0{_config;_onUpdate;_onRender;_running=!1;_rafHandle=0;_accumulator=0;_previousTime=0;constructor(t,e,n){this._config=t,this._onUpdate=e,this._onRender=n,this._tick=this._tick.bind(this)}start(){this._running||(this._running=!0,this._accumulator=0,this._previousTime=performance.now(),this._rafHandle=requestAnimationFrame(this._tick))}stop(){this._running&&(this._running=!1,cancelAnimationFrame(this._rafHandle),this._rafHandle=0,this._accumulator=0)}get isRunning(){return this._running}_tick(t){if(!this._running)return;const{tickRate:e,maxFrameTime:n}=this._config,i=(t-this._previousTime)/1e3,s=Math.min(i,n);for(this._previousTime=t,this._accumulator+=s;this._accumulator>=e;)this._onUpdate(e),this._accumulator-=e;if(this._onRender!==void 0){const o=this._accumulator/e;this._onRender(o)}this._rafHandle=requestAnimationFrame(this._tick)}}class hs{_threshold;_result={horizontal:0,vertical:0};constructor(t=20){if(!isFinite(t)||t<=0)throw new RangeError(`EdgeScroll: threshold must be a positive finite number, got ${t}`);this._threshold=t}update(t,e,n,i){return this._result.horizontal=hs._edgeAxis(t,n,this._threshold),this._result.vertical=hs._edgeAxis(e,i,this._threshold),this._result}static _edgeAxis(t,e,n){const i=t,s=e-t;return i<n?-(1-i/n):s<n?1-s/n:0}}function C0({renderer:r,sceneManager:t,cameraController:e,world:n,hpBarSystem:i,selectionPanel:s,selectionManager:o,minimap:a,fogRenderer:c,effectsSystem:l,tutorial:u,hudBus:h}){const d=new hs(20);let p=0,_=0;window.addEventListener("mousemove",y=>{p=y.clientX,_=y.clientY});const x={};window.addEventListener("keydown",y=>{x[y.key.toLowerCase()]=!0}),window.addEventListener("keyup",y=>{x[y.key.toLowerCase()]=!1});let m=0,f=performance.now();const E=new L,w=new A0({tickRate:1/20,maxFrameTime:.25},y=>{try{n.update(y)}catch(P){console.error("[TICK]",P)}m+=y},()=>{const y=performance.now(),P=Math.min((y-f)/1e3,.05);f=y;const C=(x.d?1:0)-(x.a?1:0),T=(x.s?1:0)-(x.w?1:0),R=d.update(p,_,innerWidth,innerHeight),S=Li.clamp(C+R.horizontal,-1,1),g=Li.clamp(T+R.vertical,-1,1);e.update(P,{horizontal:S,vertical:g}),s.refresh(o.selected),a.update(),a.drawViewport(e.camera.position.x,e.camera.position.z),c.update(),l.update(P),u.poll(),h.emit("clockUpdate",{seconds:Math.floor(m)}),r.render(t.threeScene,e.camera),e.camera.updateMatrixWorld(!0),e.camera.updateProjectionMatrix();for(const[A,B]of n.query(Ht)){const O=n.getComponent(A,qe);O&&(O.current<O.max&&O.current>0?(i.hasBar(A)||i.registerBar(A),E.set(B.x,2,B.z),i.updateBar(A,O.current,O.max,E,e.camera)):i.hasBar(A)&&O.current>=O.max&&i.removeBar(A))}});return window.addEventListener("resize",()=>{e.onResize(innerWidth,innerHeight),r.setSize(innerWidth,innerHeight)}),w}class _a{camera;_panSpeed;_mapWidth;_mapHeight;_baseViewWidth;_zoom=1;static CAM_OFFSET=new L(0,60,20);_lookTarget=new L;_moveDir=new L;_viewW;_viewH;constructor(t,e,n={}){const{panSpeed:i=30,mapWidth:s=96,mapHeight:o=96,baseViewWidth:a=50}=n;this._panSpeed=i,this._mapWidth=s,this._mapHeight=o,this._baseViewWidth=a,this._viewW=t,this._viewH=e;const c=t/e,l=a/2,u=l/c;this.camera=new aa(-l,l,u,-u,.1,200),this._lookTarget.set(s/2,0,o/2),this._updateCameraTransform()}update(t,e){const n=Li.clamp(e.horizontal,-1,1),i=Li.clamp(e.vertical,-1,1);if(n!==0||i!==0){const s=this._panSpeed*t;this._lookTarget.x+=n*s,this._lookTarget.z+=i*s}this._clampToMapBounds(),this._updateCameraTransform()}centerOn(t,e){this._lookTarget.x=t,this._lookTarget.z=e,this._clampToMapBounds(),this._updateCameraTransform()}setZoom(t){}adjustZoom(t){}get zoom(){return this._zoom}get viewHalfWidth(){return this._baseViewWidth/2/this._zoom}get viewHalfHeight(){const t=this._viewW/this._viewH;return this.viewHalfWidth/t}onResize(t,e){this._viewW=t,this._viewH=e,this._updateFrustum(),this._clampToMapBounds(),this._updateCameraTransform()}_updateFrustum(){const t=this.viewHalfWidth,e=this.viewHalfHeight;this.camera.left=-t,this.camera.right=t,this.camera.top=e,this.camera.bottom=-e,this.camera.updateProjectionMatrix()}_clampToMapBounds(){const t=this.viewHalfWidth,e=this.viewHalfHeight;t*2>=this._mapWidth?this._lookTarget.x=this._mapWidth/2:this._lookTarget.x=Li.clamp(this._lookTarget.x,t,this._mapWidth-t),e*2>=this._mapHeight?this._lookTarget.z=this._mapHeight/2:this._lookTarget.z=Li.clamp(this._lookTarget.z,e,this._mapHeight-e)}_updateCameraTransform(){const t=_a.CAM_OFFSET;this.camera.position.set(this._lookTarget.x+t.x,this._lookTarget.y+t.y,this._lookTarget.z+t.z),this.camera.lookAt(this._lookTarget)}}const R0=48,P0=6,I0=30,Qc="#22cc44",D0="#ffaa00",L0="#ee2222",U0=.5,N0=.25;class ga{_overlay;_bars=new Map;_ndcPos=new L;constructor(t){this._overlay=t}registerBar(t){this._bars.has(t)&&this.removeBar(t);const e=document.createElement("div");e.style.cssText=["position:absolute",`width:${R0}px`,`height:${P0}px`,"background:rgba(0,0,0,0.55)","border-radius:3px","overflow:hidden","transform:translate(-50%,-100%)","pointer-events:none"].join(";"),e.dataset.entityId=String(t);const n=document.createElement("div");n.style.cssText=["height:100%","width:100%",`background:${Qc}`,"transition:width 0.1s linear"].join(";"),e.appendChild(n),this._overlay.appendChild(e),this._bars.set(t,{container:e,fill:n})}updateBar(t,e,n,i,s){const o=this._bars.get(t);if(o===void 0)return;this._ndcPos.set(i.x,0,i.z),this._ndcPos.project(s);const a=(this._ndcPos.x*.5+.5)*window.innerWidth,c=(-this._ndcPos.y*.5+.5)*window.innerHeight-I0,l=this._ndcPos.z>1;if(o.container.style.display=l?"none":"block",l)return;o.container.style.left=`${a}px`,o.container.style.top=`${c}px`;const u=Math.max(0,Math.min(e,n)),h=n>0?u/n:0;o.fill.style.width=`${h*100}%`,o.fill.style.background=ga._colorForFraction(h)}removeBar(t){const e=this._bars.get(t);e!==void 0&&(e.container.remove(),this._bars.delete(t))}hasBar(t){return this._bars.has(t)}get barCount(){return this._bars.size}dispose(){for(const t of this._bars.values())t.container.remove();this._bars.clear()}static _colorForFraction(t){return t<=N0?L0:t<=U0?D0:Qc}}class F0{_scene;_objects=new Map;constructor(t){this._scene=t,this._scene.background=new Xt(328978),this._setupLighting()}get threeScene(){return this._scene}addObject(t,e){const n=this._objects.get(t);n!==e&&(n!==void 0&&this._scene.remove(n),this._objects.set(t,e),this._scene.add(e))}removeObject(t){const e=this._objects.get(t);e!==void 0&&(this._scene.remove(e),this._objects.delete(t))}getObject(t){return this._objects.get(t)}hasObject(t){return this._objects.has(t)}get objectCount(){return this._objects.size}clear(){for(const t of this._objects.values())this._scene.remove(t);this._objects.clear()}_setupLighting(){const t=new Jh(16777215,.6);this._scene.add(t);const e=new Zh(16774624,1.2);e.position.set(50,80,30),e.castShadow=!0,e.shadow.camera.left=-60,e.shadow.camera.right=60,e.shadow.camera.top=60,e.shadow.camera.bottom=-60,e.shadow.camera.near=.5,e.shadow.camera.far=200,e.shadow.mapSize.set(2048,2048),e.shadow.bias=-.001,this._scene.add(e)}}const tl=24,el=80;function O0({appRoot:r,mapWidth:t,mapHeight:e,initialCameraTarget:n}){const i=new B_({antialias:!0});i.setSize(window.innerWidth,window.innerHeight),i.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.domElement.style.cssText="position:fixed;inset:0;z-index:0;",r.appendChild(i.domElement);const s=new Fh,o=new F0(s),a=new st(new Yn(t+tl,e+tl),new In({color:3824170,roughness:.9}));a.rotation.x=-Math.PI/2,a.position.set(t/2,-.01,e/2),a.receiveShadow=!0,o.addObject("ground",a);const c=new st(new Yn(t+el,e+el),new In({color:1714714,roughness:1}));c.rotation.x=-Math.PI/2,c.position.set(t/2,-.02,e/2),o.addObject("border",c);const l=new Cl({color:4876858,transparent:!0,opacity:.3}),u=new ke().setFromPoints([new L(0,.01,0),new L(t,.01,0),new L(t,.01,0),new L(t,.01,e),new L(t,.01,e),new L(0,.01,e),new L(0,.01,e),new L(0,.01,0)]);o.addObject("map-boundary",new Vh(u,l));const h=new _a(window.innerWidth,window.innerHeight,{panSpeed:15,mapWidth:t,mapHeight:e,baseViewWidth:70});h.centerOn(n.x,n.z);const d=document.createElement("div");d.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:50;",r.appendChild(d);const p=new ga(d);return{renderer:i,scene:s,sceneManager:o,cameraController:h,hpBarSystem:p}}let B0=0;function nl(r,t,e,n,i,s){const o=r.createEntity(),a=`res-${B0++}`;r.addComponent(o,Ht,{x:n,z:i}),r.addComponent(o,qe,{current:s,max:s}),r.addComponent(o,_e,{}),r.addComponent(o,Et,{faction:fn.Human,playerId:"neutral"}),r.addComponent(o,pr,{kind:e,remaining:s,capacity:s,assignedWorkers:0,maxEffectiveWorkers:e==="gold"?5:3}),r.addComponent(o,ms,{sceneKey:a,visible:!0});let c;if(e==="gold")c=new st(new sa(1),new In({color:16766720,emissive:5583616,emissiveIntensity:.4,roughness:.3})),c.position.set(n,1,i);else{const l=new de,u=new st(new Ee(.15,.2,.8,6),new In({color:5913114}));u.position.y=.4,l.add(u);const h=new st(new Hn(.6,1.2,6),new In({color:2783786,roughness:.8}));h.position.y=1.2,l.add(h),l.position.set(n,0,i),c=l}c.userData.entityId=o,t.addObject(a,c)}async function k0(){console.log("Minds of War — initializing...");const r=document.getElementById("app"),t=await iu(),e=t.map,n=96,i=96,s=O0({appRoot:r,mapWidth:n,mapHeight:i,initialCameraTarget:e.startingPositions.player1}),o=new ou,a=new is,c=new ig,l=new lg(o,t,s.sceneManager,c,s.hpBarSystem),u=new dg(o,t,s.sceneManager,c,s.hpBarSystem),h=new Mg(n,i),d=wg(h,t.map);s.sceneManager.addObject("terrain",c.createTerrainLayer(d));const p=new h0(n,i),_=new us(s.sceneManager,p,n,i),x=new d0(h,p,"human",_),m=new _g(a,o,t.startingLoadout);m.initPlayer("human"),m.initPlayer("orc"),o.registerSystem(new Bg(h)),o.registerSystem(new pg(s.sceneManager)),o.registerSystem(new mg(a,t.economy.resources)),o.registerSystem(new gg(a));const f=new zg(a,t.techTree);o.registerSystem(f),o.registerSystem(new vg(l,a,t)),o.registerSystem(new a0(t.disciplineAura,a)),o.registerSystem(new c0),o.registerSystem(new u0(a)),o.registerSystem(new l0(t.spells,a)),o.registerSystem(x),o.registerSystem(new yg(a,t.combat));const E=new jg;o.registerSystem(E);const w=t.aiBehavior.normal,y=t.orcUnits.units.find(I=>I.isWorker);if(y===void 0)throw new Error("Missing worker unit in orc unit config");const P={playerId:"orc",gold:t.startingLoadout.gold,wood:t.startingLoadout.wood,supplyUsed:0,supplyCap:t.startingLoadout.initialSupply,workerCount:t.startingLoadout.workers,armySize:0,completedBuildings:new Set(["stronghold"]),buildingsUnderConstruction:new Set,hqEntity:0,previousStateName:"",defenseTimer:0},C=new Map(t.orcBuildings.buildings.map(I=>[I.id,I])),T=new Map(t.orcUnits.units.map(I=>[I.id,I])),R=new Zg;R.registerState(new ha(w,o,m,y,"stronghold")),R.registerState(new da(w,o,m,f,C)),R.registerState(new fa(w,o,m,f,T)),R.registerState(new pa(w,o,"human")),R.registerState(new ma(w,o,"human"));const S=new Kg("orc",w,R,P,o,m,a);S.init(),E.addController(S),console.log("All systems registered");const g=e.startingPositions.player1,A=e.startingPositions.player2;u.createBuilding("keep","human",g.x,g.z,!0);for(let I=0;I<t.startingLoadout.workers;I+=1)l.createUnit("peasant","human",g.x+3+I*2,g.z+3);u.createBuilding("stronghold","orc",A.x,A.z,!0);for(let I=0;I<t.startingLoadout.workers;I+=1)l.createUnit("thrall","orc",A.x-3-I*2,A.z-3);for(const I of e.goldMines)nl(o,s.sceneManager,"gold",I.x,I.z,I.capacity);for(const I of e.treeLines){const V=I.end.x-I.start.x,it=I.end.z-I.start.z,j=Math.max(Math.abs(V),Math.abs(it))+1;for(let rt=0;rt<j;rt+=1){const mt=I.start.x+(V===0?0:Math.sign(V)*rt),Rt=I.start.z+(it===0?0:Math.sign(it)*rt);nl(o,s.sceneManager,"wood",mt,Rt,100)}}console.log(`Entities spawned, scene.children=${s.scene.children.length}`);const B=new is,O=new r0(B);O.mount(r),B.emit("resourceUpdate",{gold:t.startingLoadout.gold,wood:t.startingLoadout.wood}),a.on("RESOURCES_CHANGED",I=>{I.playerId==="human"&&B.emit("resourceUpdate",{gold:I.gold,wood:I.wood})}),a.on("SUPPLY_CHANGED",I=>{I.playerId==="human"&&B.emit("supplyUpdate",{current:I.current,cap:I.cap})});const X=new $g(o,p,n,i,I=>{s.cameraController.centerOn(I.x,I.z)});O.minimapFrame&&X.mount(O.minimapFrame);const Y=new i0({onPlayAgain:()=>location.reload(),onMainMenu:()=>location.reload()});Y.mount(r),a.on("BUILDING_DESTROYED",I=>{I.buildingId==="keep"&&I.playerId==="human"?Y.show("lose","Your Keep has been destroyed!"):I.buildingId==="stronghold"&&I.playerId==="orc"&&Y.show("win","The Orc Stronghold has fallen!")});const q=new Hg(o);q.mount(O.selectionFrame??r);const J=new Gg;J.mount(O.commandFrame??r);const G=T0({appRoot:r,renderer:s.renderer,scene:s.scene,sceneManager:s.sceneManager,cameraController:s.cameraController,world:o,gameEventBus:a,config:t,techTreeSystem:f,resourceTracker:m,buildingFactory:u,commandCard:J,mapWidth:n,mapHeight:i}),ot=new _0(s.sceneManager,o,a);new g0(a),localStorage.removeItem("mow_tutorial_done");const at=new x0;at.mount(r);const Mt=y0({selectionMgr:G.selectionManager,world:o,camCtrl:s.cameraController,getPlacementMode:G.getPlacementMode}),nt=new Kc(Mt,at,a);Kc.isDone()||nt.start(),console.log("[Tutorial] active:",nt.active,"tooltip el:",document.getElementById("tut-tooltip"),"title el:",document.getElementById("tut-title")),C0({renderer:s.renderer,sceneManager:s.sceneManager,cameraController:s.cameraController,world:o,hpBarSystem:s.hpBarSystem,selectionPanel:q,selectionManager:G.selectionManager,minimap:X,fogRenderer:_,effectsSystem:ot,tutorial:nt,hudBus:B}).start(),console.log("Game loop started")}k0().catch(r=>{console.error("Fatal:",r),document.body.innerHTML=`<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#ff5c7a;font-family:monospace;padding:2rem;text-align:center;font-size:18px;">CRASH: ${r instanceof Error?r.message:String(r)}</div>`});
