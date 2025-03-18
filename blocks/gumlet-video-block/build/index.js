(()=>{"use strict";const e=window.React,t=window.wp.blocks,l=window.wp.i18n,o=window.wp.blockEditor,n=window.wp.components;function a(e){const{assetId:t,autoplay:l,loop:o,controls:n,ccEnabled:a,userAnalytics:i}=e;let r=`https://play.gumlet.io/embed/${t}?`;return l&&(r+="autoplay=true&"),o&&(r+="loop=true&"),n||(r+="disable_player_controls=false&"),a&&(r+="caption=true&"),r.slice(0,-1)}(0,t.registerBlockType)("gumlet/gumlet-video-block",{edit:function({attributes:t,setAttributes:i}){const{assetId:r,width:c,height:s,ccEnabled:u,autoplay:d,loop:g,controls:m,userAnalytics:h}=t,p=(0,o.useBlockProps)({className:`align${t.align}`}),_=[{label:"100%",value:"100%"},{label:"75%",value:"75%"},{label:"50%",value:"50%"},{label:"25%",value:"25%"},{label:"Custom",value:"custom"}];return(0,e.createElement)(e.Fragment,null,(0,e.createElement)(o.InspectorControls,null,(0,e.createElement)(n.PanelBody,{title:(0,l.__)("Gumlet Video Settings","gumlet-video")},(0,e.createElement)(n.TextControl,{label:(0,l.__)("Asset ID","gumlet-video"),value:r,onChange:e=>i({assetId:e}),help:(0,l.__)("Enter the Gumlet Asset ID.","gumlet-video")}),(0,e.createElement)(n.SelectControl,{label:(0,l.__)("Width","gumlet-video"),value:c,options:_,onChange:e=>i({width:e})}),"custom"===c&&(0,e.createElement)(n.TextControl,{label:(0,l.__)("Custom Width","gumlet-video"),value:c,onChange:e=>i({width:e}),help:(0,l.__)("Enter width in px or %","gumlet-video")}),(0,e.createElement)(n.SelectControl,{label:(0,l.__)("Height","gumlet-video"),value:s,options:_,onChange:e=>i({height:e})}),"custom"===s&&(0,e.createElement)(n.TextControl,{label:(0,l.__)("Custom Height","gumlet-video"),value:s,onChange:e=>i({height:e}),help:(0,l.__)("Enter height in px or %","gumlet-video")}),(0,e.createElement)(n.ToggleControl,{label:(0,l.__)("Enable Closed Captions","gumlet-video"),checked:u,onChange:e=>i({ccEnabled:e})}),(0,e.createElement)(n.ToggleControl,{label:(0,l.__)("Autoplay","gumlet-video"),checked:d,onChange:e=>i({autoplay:e})}),(0,e.createElement)(n.ToggleControl,{label:(0,l.__)("Loop","gumlet-video"),checked:g,onChange:e=>i({loop:e})}),(0,e.createElement)(n.ToggleControl,{label:(0,l.__)("Show Player Controls","gumlet-video"),checked:m,onChange:e=>i({controls:e})}),(0,e.createElement)(n.ToggleControl,{label:(0,l.__)("Enable User Analytics","gumlet-video"),checked:h,onChange:e=>i({userAnalytics:e})}))),(0,e.createElement)("div",{...p},r?(0,e.createElement)("div",{className:"gumlet-video-container",style:{position:"relative",paddingTop:"56.25%",width:c,margin:"0 auto"}},(0,e.createElement)("iframe",{src:a(t),style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"},title:(0,l.__)("Gumlet Video Player","gumlet-video"),allow:"accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;",frameBorder:"0"})):(0,e.createElement)("p",{style:{textAlign:"center",padding:"2em",backgroundColor:"#f0f0f0",border:"1px dashed #999"}},(0,l.__)("Please enter an Asset ID in the block settings.","gumlet-video"))))},save:function({attributes:e}){return null}})})();