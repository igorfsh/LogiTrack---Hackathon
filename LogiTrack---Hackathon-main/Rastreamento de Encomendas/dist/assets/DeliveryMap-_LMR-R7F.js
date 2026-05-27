const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-B2CImqe3.js","assets/index-CL8yJDZC.js","assets/index-DaT0UfIz.css"])))=>i.map(i=>d[i]);
import{c as L,r as c,_ as U,j as e,T as q}from"./index-CL8yJDZC.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]],K=L("maximize-2",H);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],W=L("navigation",V);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],J=L("zoom-in",G);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]],X=L("zoom-out",Q);let A=null;function Y(t,i,o){const r=[];for(let u=0;u<=o;u++){const l=u/o;r.push([t[0]+(i[0]-t[0])*l,t[1]+(i[1]-t[1])*l])}return r}function E(t,i){if(!i)return t.map(r=>[r.lat,r.lng]);const o=[];for(let r=0;r<t.length-1;r++){const u=[t[r].lat,t[r].lng],l=[t[r+1].lat,t[r+1].lng],f=Y(u,l,i?30:5);r===0?o.push(...f):o.push(...f.slice(1))}return o}function P(t,i){if(t.length<2)return t[0]??[0,0];const o=Math.min(Math.max(i/100,0),1),r=t.length-1,u=o*r,l=Math.min(Math.floor(u),r-1),y=u-l,f=t[l],h=t[l+1]??t[l];return[f[0]+(h[0]-f[0])*y,f[1]+(h[1]-f[1])*y]}const _={origin:"#2563eb",transit:"#6b7280",current:"#7c3aed",destination:"#16a34a"},ee={origin:"Origem",transit:"Trânsito",current:"Localização atual",destination:"Destino"};function se({trackingInfo:t}){const i=c.useRef(null),o=c.useRef(null),r=c.useRef([]),u=c.useRef(null),l=c.useRef(null),[y,f]=c.useState(!1),[h,T]=c.useState(t.deliveryProgress??0),[te,O]=c.useState(!1),v=c.useRef(null),{routePoints:m,isInternational:b,status:x,deliveryProgress:j=0}=t;c.useEffect(()=>{if(x!=="out_for_delivery"){T(j);return}O(!0);let n=null;const s=j,z=95,R=12e3;function k(M){n||(n=M);const p=M-n,d=Math.min(p/R,1),N=d<.5?2*d*d:-1+(4-2*d)*d;T(s+(z-s)*N),d<1||(n=null),v.current=requestAnimationFrame(k)}return v.current=requestAnimationFrame(k),()=>{v.current&&cancelAnimationFrame(v.current)}},[x,j]),c.useEffect(()=>{if(!i.current||m.length===0)return;let n=!0;return(async()=>{const s=await U(()=>import("./leaflet-src-B2CImqe3.js").then(a=>a.l),__vite__mapDeps([0,1,2]));if(A=s,!n||!i.current)return;o.current&&(o.current.remove(),o.current=null),delete s.Icon.Default.prototype._getIconUrl,s.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});const z=m.map(a=>a.lat),R=m.map(a=>a.lng),k=(Math.min(...z)+Math.max(...z))/2,M=(Math.min(...R)+Math.max(...R))/2,p=s.map(i.current,{center:[k,M],zoom:b?2:6,zoomControl:!1,attributionControl:!0});s.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a>',maxZoom:18}).addTo(p),o.current=p,r.current=m.map(a=>{const w=_[a.type],g=a.type==="current",I=`
          <div style="position:relative; display:flex; align-items:center; justify-content:center;">
            ${g?`<div style="
              position:absolute;
              width:36px; height:36px;
              border-radius:50%;
              background:${w}33;
              animation:pulse 1.8s infinite;
            "></div>`:""}
            <div style="
              width:${g?18:14}px;
              height:${g?18:14}px;
              background:${w};
              border:3px solid white;
              border-radius:50%;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              position:relative;
              z-index:2;
            "></div>
          </div>`,D=s.divIcon({html:I,className:"",iconSize:[g?36:20,g?36:20],iconAnchor:[g?18:10,g?18:10]}),$=s.marker([a.lat,a.lng],{icon:D}).addTo(p);return $.bindPopup(`
          <div style="font-family:system-ui; min-width:140px;">
            <div style="font-size:11px; color:${w}; font-weight:600; margin-bottom:4px; text-transform:uppercase;">
              ${ee[a.type]}
            </div>
            <div style="font-size:13px; font-weight:500; color:#111;">${a.label}</div>
          </div>
        `,{closeButton:!1,maxWidth:220}),$});const d=E(m,b??!1),N=Math.floor(j/100*(d.length-1));N>0&&s.polyline(d.slice(0,N+1),{color:"#2563eb",weight:3,opacity:.8,dashArray:void 0}).addTo(p),s.polyline(d.slice(N),{color:"#9ca3af",weight:2.5,opacity:.6,dashArray:"8, 6"}).addTo(p),u.current=s.polyline(d,{opacity:0}).addTo(p);const Z=s.latLngBounds(m.map(a=>[a.lat,a.lng]));if(p.fitBounds(Z,{padding:[40,40]}),x!=="delivered"){const a=E(m,b??!1),w=P(a,j),I=s.divIcon({html:`
          <div style="
            background:#7c3aed;
            color:white;
            border-radius:50%;
            width:32px; height:32px;
            display:flex; align-items:center; justify-content:center;
            box-shadow:0 3px 10px rgba(124,58,237,0.5);
            border:2px solid white;
            font-size:16px;
          ">🚚</div>`,className:"",iconSize:[32,32],iconAnchor:[16,16]});l.current=s.marker(w,{icon:I,zIndexOffset:1e3}).addTo(p)}})(),()=>{n=!1}},[t.code]),c.useEffect(()=>{if(!o.current||!l.current||!A)return;const n=E(m,b??!1),s=P(n,h);l.current.setLatLng(s)},[h,m,b]);const C=()=>{var n;return(n=o.current)==null?void 0:n.zoomIn()},S=()=>{var n;return(n=o.current)==null?void 0:n.zoomOut()},F=()=>{if(!o.current||!A)return;const n=A.latLngBounds(m.map(s=>[s.lat,s.lng]));o.current.fitBounds(n,{padding:[40,40]})},B=[{color:_.origin,label:"Origem"},{color:_.current,label:"Posição atual"},{color:_.destination,label:"Destino"},{color:_.transit,label:"Trânsito"}];return e.jsxs("div",{className:`relative rounded-xl overflow-hidden border border-gray-200 shadow-sm ${y?"fixed inset-0 z-50 rounded-none":""}`,children:[e.jsxs("div",{className:"absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-200",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(W,{className:"size-4 text-blue-600"}),e.jsx("span",{className:"text-sm font-semibold text-gray-800",children:x==="out_for_delivery"?"Entregador a caminho":x==="delivered"?"Entrega concluída":b?"Rota internacional":"Rota de entrega"}),x==="out_for_delivery"&&e.jsxs("span",{className:"flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium",children:[e.jsxs("span",{className:"relative flex h-2 w-2",children:[e.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"}),e.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-purple-500"})]}),"Ao vivo"]})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("button",{onClick:C,className:"p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors",title:"Zoom in",children:e.jsx(J,{className:"size-4"})}),e.jsx("button",{onClick:S,className:"p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors",title:"Zoom out",children:e.jsx(X,{className:"size-4"})}),e.jsx("button",{onClick:F,className:"p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors",title:"Encaixar rota",children:e.jsx(K,{className:"size-4"})})]})]}),x==="out_for_delivery"&&e.jsxs("div",{className:"absolute top-[56px] left-0 right-0 z-[999] flex items-center gap-3 px-4 py-2.5 bg-purple-600 text-white",children:[e.jsx(q,{className:"size-4 shrink-0"}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-medium",children:"Seu pedido está a caminho!"}),e.jsxs("div",{className:"flex items-center gap-2 mt-1",children:[e.jsx("div",{className:"flex-1 bg-purple-400/50 rounded-full h-1.5",children:e.jsx("div",{className:"h-1.5 bg-white rounded-full transition-all duration-300",style:{width:`${h}%`}})}),e.jsxs("span",{className:"text-xs font-semibold shrink-0",children:[Math.round(h),"%"]})]})]})]}),e.jsx("div",{ref:i,className:"w-full",style:{height:y?"100vh":420,marginTop:x==="out_for_delivery"?96:52}}),e.jsxs("div",{className:"absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-sm",children:[B.map(n=>e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("div",{className:"size-2.5 rounded-full border-2 border-white shadow-sm",style:{background:n.color}}),e.jsx("span",{className:"text-xs text-gray-600",children:n.label})]},n.label)),x!=="delivered"&&e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("span",{className:"text-sm leading-none",children:"🚚"}),e.jsx("span",{className:"text-xs text-gray-600",children:"Entregador"})]})]}),e.jsx("style",{children:`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `})]})}export{se as DeliveryMap};
