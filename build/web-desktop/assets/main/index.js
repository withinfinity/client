System.register("chunks:///_virtual/claim_pet.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(t){var e,n,r,a,o,c,i;return{setters:[function(t){e=t.inheritsLoose,n=t.asyncToGenerator,r=t.regeneratorRuntime},function(t){a=t.cclegacy,o=t._decorator,c=t.Component,i=t.sys}],execute:function(){var s;a._RF.push({},"f2858Ci+CtJ6awC7zUI/cob","claim_pet",void 0);var u=o.ccclass;o.property,t("test",u("test")(s=function(t){function a(){return t.apply(this,arguments)||this}e(a,t);var o=a.prototype;return o.start=function(){var t=n(r().mark((function t(){var e;return r().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:console.log("1"),e=window.obelisk,console.log(e);case 4:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),o.sui_account_create=function(){var t=n(r().mark((function t(){var e,n,a,o;return r().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:e=window.sui,null==JSON.parse(i.localStorage.getItem("withinfinity-userWalletData"))?(n=new e.Ed25519Keypair,a=n.export(),o=JSON.stringify(a),i.localStorage.setItem("withinfinity-userWalletData",o)):window.alert("你有账号了");case 3:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),o.formatData=function(t){var e=[];return t.forEach((function(t){var n,r=t[0],a=t[1];if("0x1::string::String"===a)n=r.map((function(t){return String.fromCharCode(t)})).join("");else if("bool"===a)n=0!==r[0]?"true":"false";else if("u64"===a){var o=new DataView(new ArrayBuffer(8));r.forEach((function(t,e){return o.setUint8(e,t)})),n=o.getBigUint64(0).toString()}else n="Unknown Format";e.push(n)})),e.join("\n")},o.get_metadata=function(){var t=n(r().mark((function t(){var e,n,a,o,c,i,s,u,f,l;return r().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e=window.obelisk,n="testnet",a="0x6afbf113a5872b781a2a0068b95c0d9d0ee89428518fdd65f862c841eab45b82",t.next=5,e.getMetadata(n,a);case 5:return o=t.sent,c=new e.Obelisk({networkType:n,packageId:a,metadata:o}),console.log(c),i=new e.TransactionBlock,s=[i.pure("0x6fa43c68221960f942572905f3c198a5bccaa0700506b3b6bd83dd9b007e6324"),i.pure("0xbf64721f0961a0426ccde6b8d9343e2cb2c26a105a5c33e57074580fd98b2cb1"),i.pure("0x6")],t.next=12,c.query.pet_system.get_pet_basic_info(i,s);case 12:u=t.sent,f=u.results[0].returnValues,l=this.formatData(f),console.log(l);case 16:case"end":return t.stop()}}),t,this)})));return function(){return t.apply(this,arguments)}}(),o.update=function(t){},a}(c))||s);a._RF.pop()}}}));

System.register("chunks:///_virtual/debug-view-runtime-control.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(t){var e,o,i,n,s,l,r,a,g,h,p,c,C,d,m,u,L;return{setters:[function(t){e=t.applyDecoratedDescriptor,o=t.inheritsLoose,i=t.initializerDefineProperty,n=t.assertThisInitialized},function(t){s=t.cclegacy,l=t._decorator,r=t.Node,a=t.Color,g=t.Canvas,h=t.UITransform,p=t.instantiate,c=t.Label,C=t.RichText,d=t.Toggle,m=t.Button,u=t.director,L=t.Component}],execute:function(){var f,M,b,v,T,S,x,E,I;s._RF.push({},"b2bd1+njXxJxaFY3ymm06WU","debug-view-runtime-control",void 0);var A=l.ccclass,y=l.property;t("DebugViewRuntimeControl",(f=A("internal.DebugViewRuntimeControl"),M=y(r),b=y(r),v=y(r),f((x=e((S=function(t){function e(){for(var e,o=arguments.length,s=new Array(o),l=0;l<o;l++)s[l]=arguments[l];return e=t.call.apply(t,[this].concat(s))||this,i(e,"compositeModeToggle",x,n(e)),i(e,"singleModeToggle",E,n(e)),i(e,"EnableAllCompositeModeButton",I,n(e)),e._single=0,e.strSingle=["No Single Debug","Vertex Color","Vertex Normal","Vertex Tangent","World Position","Vertex Mirror","Face Side","UV0","UV1","UV Lightmap","Project Depth","Linear Depth","Fragment Normal","Fragment Tangent","Fragment Binormal","Base Color","Diffuse Color","Specular Color","Transparency","Metallic","Roughness","Specular Intensity","IOR","Direct Diffuse","Direct Specular","Direct All","Env Diffuse","Env Specular","Env All","Emissive","Light Map","Shadow","AO","Fresnel","Direct Transmit Diffuse","Direct Transmit Specular","Env Transmit Diffuse","Env Transmit Specular","Transmit All","Direct Internal Specular","Env Internal Specular","Internal All","Fog"],e.strComposite=["Direct Diffuse","Direct Specular","Env Diffuse","Env Specular","Emissive","Light Map","Shadow","AO","Normal Map","Fog","Tone Mapping","Gamma Correction","Fresnel","Transmit Diffuse","Transmit Specular","Internal Specular","TT"],e.strMisc=["CSM Layer Coloration","Lighting With Albedo"],e.compositeModeToggleList=[],e.singleModeToggleList=[],e.miscModeToggleList=[],e.textComponentList=[],e.labelComponentList=[],e.textContentList=[],e.hideButtonLabel=void 0,e._currentColorIndex=0,e.strColor=["<color=#ffffff>","<color=#000000>","<color=#ff0000>","<color=#00ff00>","<color=#0000ff>"],e.color=[a.WHITE,a.BLACK,a.RED,a.GREEN,a.BLUE],e}o(e,t);var s=e.prototype;return s.start=function(){if(this.node.parent.getComponent(g)){var t=this.node.parent.getComponent(h),e=.5*t.width,o=.5*t.height,i=.1*e-e,n=o-.1*o,s=this.node.getChildByName("MiscMode"),l=p(s);l.parent=this.node,l.name="Buttons";var r=p(s);r.parent=this.node,r.name="Titles";for(var u=0;u<2;u++){var L=p(this.EnableAllCompositeModeButton.getChildByName("Label"));L.setPosition(i+(u>0?450:150),n,0),L.setScale(.75,.75,.75),L.parent=r;var f=L.getComponent(c);f.string=u?"----------Composite Mode----------":"----------Single Mode----------",f.color=a.WHITE,f.overflow=0,this.labelComponentList[this.labelComponentList.length]=f}n-=20;for(var M=0,b=0;b<this.strSingle.length;b++,M++){b===this.strSingle.length>>1&&(i+=200,M=0);var v=b?p(this.singleModeToggle):this.singleModeToggle;v.setPosition(i,n-20*M,0),v.setScale(.5,.5,.5),v.parent=this.singleModeToggle.parent;var T=v.getComponentInChildren(C);T.string=this.strSingle[b],this.textComponentList[this.textComponentList.length]=T,this.textContentList[this.textContentList.length]=T.string,v.on(d.EventType.TOGGLE,this.toggleSingleMode,this),this.singleModeToggleList[b]=v}i+=200,this.EnableAllCompositeModeButton.setPosition(i+15,n,0),this.EnableAllCompositeModeButton.setScale(.5,.5,.5),this.EnableAllCompositeModeButton.on(m.EventType.CLICK,this.enableAllCompositeMode,this),this.EnableAllCompositeModeButton.parent=l;var S=this.EnableAllCompositeModeButton.getComponentInChildren(c);this.labelComponentList[this.labelComponentList.length]=S;var x=p(this.EnableAllCompositeModeButton);x.setPosition(i+90,n,0),x.setScale(.5,.5,.5),x.on(m.EventType.CLICK,this.changeTextColor,this),x.parent=l,(S=x.getComponentInChildren(c)).string="TextColor",this.labelComponentList[this.labelComponentList.length]=S;var E=p(this.EnableAllCompositeModeButton);E.setPosition(i+200,n,0),E.setScale(.5,.5,.5),E.on(m.EventType.CLICK,this.hideUI,this),E.parent=this.node.parent,(S=E.getComponentInChildren(c)).string="Hide UI",this.labelComponentList[this.labelComponentList.length]=S,this.hideButtonLabel=S,n-=40;for(var I=0;I<this.strMisc.length;I++){var A=p(this.compositeModeToggle);A.setPosition(i,n-20*I,0),A.setScale(.5,.5,.5),A.parent=s;var y=A.getComponentInChildren(C);y.string=this.strMisc[I],this.textComponentList[this.textComponentList.length]=y,this.textContentList[this.textContentList.length]=y.string,A.getComponent(d).isChecked=!!I,A.on(d.EventType.TOGGLE,I?this.toggleLightingWithAlbedo:this.toggleCSMColoration,this),this.miscModeToggleList[I]=A}n-=150;for(var D=0;D<this.strComposite.length;D++){var B=D?p(this.compositeModeToggle):this.compositeModeToggle;B.setPosition(i,n-20*D,0),B.setScale(.5,.5,.5),B.parent=this.compositeModeToggle.parent;var w=B.getComponentInChildren(C);w.string=this.strComposite[D],this.textComponentList[this.textComponentList.length]=w,this.textContentList[this.textContentList.length]=w.string,B.on(d.EventType.TOGGLE,this.toggleCompositeMode,this),this.compositeModeToggleList[D]=B}}else console.error("debug-view-runtime-control should be child of Canvas")},s.isTextMatched=function(t,e){var o=new String(t),i=o.search(">");return-1===i?t===e:(o=(o=o.substr(i+1)).substr(0,o.search("<")))===e},s.toggleSingleMode=function(t){for(var e=u.root.debugView,o=t.getComponentInChildren(C),i=0;i<this.strSingle.length;i++)this.isTextMatched(o.string,this.strSingle[i])&&(e.singleMode=i)},s.toggleCompositeMode=function(t){for(var e=u.root.debugView,o=t.getComponentInChildren(C),i=0;i<this.strComposite.length;i++)this.isTextMatched(o.string,this.strComposite[i])&&e.enableCompositeMode(i,t.isChecked)},s.toggleLightingWithAlbedo=function(t){u.root.debugView.lightingWithAlbedo=t.isChecked},s.toggleCSMColoration=function(t){u.root.debugView.csmLayerColoration=t.isChecked},s.enableAllCompositeMode=function(t){var e=u.root.debugView;e.enableAllCompositeMode(!0);for(var o=0;o<this.compositeModeToggleList.length;o++){this.compositeModeToggleList[o].getComponent(d).isChecked=!0}var i=this.miscModeToggleList[0].getComponent(d);i.isChecked=!1,e.csmLayerColoration=!1,(i=this.miscModeToggleList[1].getComponent(d)).isChecked=!0,e.lightingWithAlbedo=!0},s.hideUI=function(t){var e=this.node.getChildByName("Titles"),o=!e.active;this.singleModeToggleList[0].parent.active=o,this.miscModeToggleList[0].parent.active=o,this.compositeModeToggleList[0].parent.active=o,this.EnableAllCompositeModeButton.parent.active=o,e.active=o,this.hideButtonLabel.string=o?"Hide UI":"Show UI"},s.changeTextColor=function(t){this._currentColorIndex++,this._currentColorIndex>=this.strColor.length&&(this._currentColorIndex=0);for(var e=0;e<this.textComponentList.length;e++)this.textComponentList[e].string=this.strColor[this._currentColorIndex]+this.textContentList[e]+"</color>";for(var o=0;o<this.labelComponentList.length;o++)this.labelComponentList[o].color=this.color[this._currentColorIndex]},s.onLoad=function(){},s.update=function(t){},e}(L)).prototype,"compositeModeToggle",[M],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),E=e(S.prototype,"singleModeToggle",[b],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),I=e(S.prototype,"EnableAllCompositeModeButton",[v],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),T=S))||T));s._RF.pop()}}}));

System.register("chunks:///_virtual/gen.ts",["cc"],(function(){var e;return{setters:[function(t){e=t.cclegacy}],execute:function(){e._RF.push({},"4ae2a67yGdGj7Bm0zmoYRQI","gen",void 0),e._RF.pop()}}}));

System.register("chunks:///_virtual/main",["./debug-view-runtime-control.ts","./gen.ts","./claim_pet.ts","./sui.ts"],(function(){return{setters:[null,null,null,null],execute:function(){}}}));

System.register("chunks:///_virtual/sui.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(e){var t,n,r,a,o,i,c,s;return{setters:[function(e){t=e.inheritsLoose,n=e.asyncToGenerator,r=e.regeneratorRuntime},function(e){a=e.cclegacy,o=e._decorator,i=e.Component,c=e.sys,s=e.director}],execute:function(){var u;a._RF.push({},"1aea1REPTpJDrS8orfWBsAB","sui",void 0);var f=o.ccclass;o.property,e("sui",f("sui")(u=function(e){function a(){return e.apply(this,arguments)||this}t(a,e);var o=a.prototype;return o.start=function(){var e=n(r().mark((function e(){var t;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:console.log("1"),t=window.obelisk,console.log(t);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),o.sui_account_create=function(){var e=n(r().mark((function e(){var t,n,a,o;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t=window.sui,null==JSON.parse(c.localStorage.getItem("withinfinity-userWalletData"))?(n=new t.Ed25519Keypair,a=n.export(),o=JSON.stringify(a),c.localStorage.setItem("withinfinity-userWalletData",o)):s.loadScene("claim_pet");case 3:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),o.formatData=function(e){var t=[];return e.forEach((function(e){var n,r=e[0],a=e[1];if("0x1::string::String"===a)n=r.map((function(e){return String.fromCharCode(e)})).join("");else if("bool"===a)n=0!==r[0]?"true":"false";else if("u64"===a){var o=new DataView(new ArrayBuffer(8));r.forEach((function(e,t){return o.setUint8(t,e)})),n=o.getBigUint64(0).toString()}else n="Unknown Format";t.push(n)})),t.join("\n")},o.get_metadata=function(){var e=n(r().mark((function e(){var t,n,a,o,i,c,s,u,f,l;return r().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=window.obelisk,n="testnet",a="0x6afbf113a5872b781a2a0068b95c0d9d0ee89428518fdd65f862c841eab45b82",e.next=5,t.initialize(n,a);case 5:return o=e.sent,i=new t.Obelisk({networkType:n,packageId:a,metadata:o}),c=new t.TransactionBlock,s=[c.pure("0x6fa43c68221960f942572905f3c198a5bccaa0700506b3b6bd83dd9b007e6324"),c.pure("0xbf64721f0961a0426ccde6b8d9343e2cb2c26a105a5c33e57074580fd98b2cb1"),c.pure("0x6")],e.next=11,i.query.pet_system.get_pet_basic_info(c,s);case 11:u=e.sent,f=u.results[0].returnValues,l=this.formatData(f),console.log(l);case 15:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}(),o.update=function(e){},a}(i))||u);a._RF.pop()}}}));

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});