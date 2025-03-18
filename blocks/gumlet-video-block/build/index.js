(()=>{"use strict";const e=window.React,t=window.wp.blocks,l=window.wp.i18n,o=window.wp.blockEditor,a=window.wp.components;function n(e){const{id:t,autoplay:l,loop:o}=e;let a=`https://play.gumlet.io/embed/${t}?`;return l&&(a+="autoplay=true&"),o&&(a+="loop=true&"),a.slice(0,-1)}(0,t.registerBlockType)("gumlet/gumlet-video-block",{icon:()=>(0,e.createElement)(a.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512"},(0,e.createElement)("g",{fill:"none",fillRule:"evenodd"},(0,e.createElement)("g",{transform:"translate(19.000000, 16.000000)",fillRule:"nonzero"},(0,e.createElement)("path",{d:"M183.495852,321 L101,436.009196 C137.642797,460.951517 179.534085,476.864557 227,479 L227,336.418835 C210.484441,334.607026 196.847994,329.377094 183.495852,321 Z",fill:"#104A70"}),(0,e.createElement)("path",{d:"M227,142.035823 L226.045644,0 C179.158623,2.25262891 137.49284,17.3099552 101,42.3153853 L183.328582,157 C196.391424,148.863938 210.760449,143.65905 227,142.035823 Z",fill:"#ED7324"}),(0,e.createElement)("path",{d:"M368,39.5906938 C331.321477,14.5430029 288.269929,1.40285171 240.899143,0 L240,141.404682 C256.275249,142.581267 271.707616,146.865723 284.858649,155 L368,39.5906938 Z",fill:"#FBBC05"}),(0,e.createElement)("path",{d:"M146.399364,276 L13,320.353428 C28.5868283,364.147938 55.1834273,401.021122 90.8634416,429 L174,314.157382 C162.031743,303.917045 152.467776,290.871246 146.399364,276 Z",fill:"#0F1E2A"}),(0,e.createElement)("path",{d:"M173,164.244507 L90.6368513,50 C66.6051653,68.8886842 47.0024012,91.8778109 31.4879891,118.532287 C23.9293157,131.518437 18.0990813,144.804447 13,159.191026 L146.007075,203 C152.037003,188.065089 161.041582,174.550736 173,164.244507 Z",fill:"#DF5216"}),(0,e.createElement)("path",{d:"M140.689865,239.584492 C140.498182,231.330855 141.394269,222.566269 143.18955,215.087837 L9.63860874,172 C3.4510985,193.371797 0,215.136971 0,238.5 C0,261.998794 2.68434767,283.526378 8.9283133,305 L144,262.540959 C142.148263,254.949389 140.881548,247.83813 140.689865,239.584492 Z",fill:"#D53C0D"}),(0,e.createElement)("path",{d:"M297,316.315341 L380.375299,431 C416.091509,402.954871 444.461422,365.645689 460,321.813793 L325.968709,278 C319.682404,292.790202 309.338793,306.220367 297,316.315341 Z",fill:"#378A9B"}),(0,e.createElement)("path",{d:"M240,336.909297 L240,480 C287.212475,478.532518 331.477778,464.495141 368,439.43507 L284.492522,324 C271.238897,332.04962 256.225252,335.905567 240,336.909297 Z",fill:"#1D77B2"}),(0,e.createElement)("path",{d:"M463.933746,171 L304,220.441337 C305.788198,228.255795 306.503499,232.105998 306.480194,238.995856 C306.456888,245.885715 305.617254,249.536501 304,257.376392 L464.500106,307 C470.781061,285.512277 474,262.476249 474,239 C474.012327,215.398696 470.488895,192.959643 463.933746,171 Z",fill:"#539E82"})))),edit:function({attributes:t,setAttributes:i}){const{id:r,width:m,height:u,ccEnabled:d,autoplay:c,loop:s}=t,g=(0,o.useBlockProps)({className:`align${t.align}`}),p=[{label:"100%",value:"100%"},{label:"75%",value:"75%"},{label:"50%",value:"50%"},{label:"25%",value:"25%"},{label:"Custom",value:"custom",placeholder:"e.g. 1000px or 50%"}],h=(e,t,l=!1)=>{i("custom"===t?{[e]:""}:l?{[e]:t}:{[e]:t})};return(0,e.createElement)(e.Fragment,null,(0,e.createElement)(o.InspectorControls,null,(0,e.createElement)(a.PanelBody,{title:(0,l.__)("Gumlet Video Settings","gumlet-video")},(0,e.createElement)(a.TextControl,{label:(0,l.__)("Asset ID","gumlet-video"),value:r,onChange:e=>i({id:e}),help:(0,l.__)("Enter the Gumlet Asset ID.","gumlet-video")}),(0,e.createElement)(a.SelectControl,{label:(0,l.__)("Width","gumlet-video"),value:""===m?"custom":p.some((e=>e.value===m))?m:"custom",options:p,onChange:e=>h("width",e)}),(""===m||!p.some((e=>e.value===m)))&&(0,e.createElement)(a.TextControl,{label:(0,l.__)("Custom Width","gumlet-video"),value:m,onChange:e=>h("width",e,!0),placeholder:(0,l.__)("e.g. 1000px or 50%","gumlet-video"),help:(0,l.__)("Enter width in px or %","gumlet-video")}),(0,e.createElement)(a.SelectControl,{label:(0,l.__)("Height","gumlet-video"),value:""===u?"custom":p.some((e=>e.value===u))?u:"custom",options:p,onChange:e=>h("height",e)}),(""===u||!p.some((e=>e.value===u)))&&(0,e.createElement)(a.TextControl,{label:(0,l.__)("Custom Height","gumlet-video"),value:u,onChange:e=>h("height",e,!0),placeholder:(0,l.__)("e.g. 1000px or 50%","gumlet-video"),help:(0,l.__)("Enter height in px or %","gumlet-video")}),(0,e.createElement)(a.ToggleControl,{label:(0,l.__)("Autoplay","gumlet-video"),checked:c,onChange:e=>i({autoplay:e})}),(0,e.createElement)(a.ToggleControl,{label:(0,l.__)("Loop","gumlet-video"),checked:s,onChange:e=>i({loop:e})}))),(0,e.createElement)("div",{...g},r?(0,e.createElement)("div",{className:"gumlet-video-container",style:{position:"relative",paddingTop:"56.25%",width:m,margin:"0 auto"}},(0,e.createElement)("iframe",{src:n(t),style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"},title:(0,l.__)("Gumlet Video Player","gumlet-video"),allow:"accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;",frameBorder:"0"})):(0,e.createElement)("div",{style:{textAlign:"center",padding:"2em",backgroundColor:"#f0f0f0",border:"1px dashed #999",marginBottom:"1em"}},(0,e.createElement)(a.TextControl,{label:(0,l.__)("Enter Gumlet Asset ID","gumlet-video"),value:r,onChange:e=>i({id:e}),placeholder:(0,l.__)("e.g., abc123xyz","gumlet-video"),help:(0,l.__)("Paste your Gumlet Asset ID here to embed the video.","gumlet-video")}))))},save:function({attributes:e}){return null}})})();