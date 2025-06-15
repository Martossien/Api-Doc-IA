import{s as lr,e as X,t as ve,k as ge,c as J,a as ee,b as we,d as W,o as _e,f as H,i as fe,g as V,h as Te,j as zr,p as ya,q as Wd,z as Zs,u as sr,I as Ld,V as oa,n as ct,E as Ys,F as Xs,A as qd,C as Hd,G as jm,r as Km,v as Qm,w as Zm,x as Ym,l as ua,y as Pi}from"../chunks/BGNgVYh3.js";import{S as dr,i as pr,b as Pe,d as Ue,m as Ve,t as he,g as $t,a as be,c as vt,e as We,f as Gd}from"../chunks/C6dEUarp.js";import{t as Wa}from"../chunks/DkM_xcvk.js";import{g as Xm}from"../chunks/D0QH3NT1.js";import{e as la,u as Fd,d as Jm,o as eg}from"../chunks/turx_FrY.js";import{_ as tg,a as rg,b as ag}from"../chunks/B_i_4WXY.js";import{m as ig}from"../chunks/Ddw9c9t3.js";import{S as ng}from"../chunks/DXnw_on2.js";import{T as cr}from"../chunks/BgYnntxx.js";import{M as sg}from"../chunks/C07PinlS.js";import{A as og,f as ug}from"../chunks/CKSS_H7Q.js";import{d as Ui,r as lg}from"../chunks/aTHIJebK.js";import{d as dg,e as pg,g as cg}from"../chunks/D3sf5Q8i.js";import{B as en}from"../chunks/BXIh2GG5.js";import{P as hg}from"../chunks/Cjcxd78M.js";import"../chunks/D38m4i5G.js";import{D as fg,M as mg}from"../chunks/CRb_EfEa.js";import{b as gg}from"../chunks/DAAfIqeh.js";import{f as _g}from"../chunks/g5t9vw8M.js";import{G as yg}from"../chunks/CsxgVbqO.js";import{E as bg}from"../chunks/DOrDDWcM.js";/*!
 * ONNX Runtime Web v1.21.0-dev.20250206-d981b153d3
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var tn=Object.defineProperty,$g=Object.getOwnPropertyDescriptor,vg=Object.getOwnPropertyNames,wg=Object.prototype.hasOwnProperty,xg=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),Y=(e,t)=>()=>(e&&(t=e(e=0)),t),Or=(e,t)=>{for(var r in t)tn(e,r,{get:t[r],enumerable:!0})},kg=(e,t,r,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of vg(t))!wg.call(e,i)&&i!==r&&tn(e,i,{get:()=>t[i],enumerable:!(a=$g(t,i))||a.enumerable});return e},da=e=>kg(tn({},"__esModule",{value:!0}),e),mr,Rt,ar,Js,jd,Kd=Y(()=>{mr=new Map,Rt=[],ar=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let a=mr.get(e);if(a===void 0)mr.set(e,{backend:t,priority:r});else{if(a.priority>r)return;if(a.priority===r&&a.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let i=Rt.indexOf(e);i!==-1&&Rt.splice(i,1);for(let s=0;s<Rt.length;s++)if(mr.get(Rt[s]).priority<=r){Rt.splice(s,0,e);return}Rt.push(e)}return}throw new TypeError("not a valid backend")},Js=async e=>{let t=mr.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(a){return r||(t.error=`${a}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},jd=async e=>{let t=e.executionProviders||[],r=t.map(d=>typeof d=="string"?d:d.name),a=r.length===0?Rt:r,i,s=[],n=new Set;for(let d of a){let p=await Js(d);typeof p=="string"?s.push({name:d,err:p}):(i||(i=p),i===p&&n.add(d))}if(!i)throw new Error(`no available backend found. ERR: ${s.map(d=>`[${d.name}] ${d.err}`).join(", ")}`);for(let{name:d,err:p}of s)r.includes(d)&&console.warn(`removing requested execution provider "${d}" from session options because it is not available: ${p}`);let o=t.filter(d=>n.has(typeof d=="string"?d:d.name));return[i,new Proxy(e,{get:(d,p)=>p==="executionProviders"?o:Reflect.get(d,p)})]}}),Sg=Y(()=>{Kd()}),Qd,Tg=Y(()=>{Qd="1.21.0-dev.20250206-d981b153d3"}),La,nt,Zd=Y(()=>{Tg(),La="warning",nt={wasm:{},webgl:{},webgpu:{},versions:{common:Qd},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);La=e}},get logLevel(){return La}},Object.defineProperty(nt,"logLevel",{enumerable:!0})}),De,Eg=Y(()=>{Zd(),De=nt}),Yd,Xd,Ig=Y(()=>{Yd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let a=r.getContext("2d");if(a!=null){let i,s;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(i=e.dims[2],s=e.dims[3]):(i=e.dims[3],s=e.dims[2]);let n=(t==null?void 0:t.format)!==void 0?t.format:"RGB",o=t==null?void 0:t.norm,d,p;o===void 0||o.mean===void 0?d=[255,255,255,255]:typeof o.mean=="number"?d=[o.mean,o.mean,o.mean,o.mean]:(d=[o.mean[0],o.mean[1],o.mean[2],0],o.mean[3]!==void 0&&(d[3]=o.mean[3])),o===void 0||o.bias===void 0?p=[0,0,0,0]:typeof o.bias=="number"?p=[o.bias,o.bias,o.bias,o.bias]:(p=[o.bias[0],o.bias[1],o.bias[2],0],o.bias[3]!==void 0&&(p[3]=o.bias[3]));let h=s*i,f=0,l=h,g=h*2,_=-1;n==="RGBA"?(f=0,l=h,g=h*2,_=h*3):n==="RGB"?(f=0,l=h,g=h*2):n==="RBG"&&(f=0,g=h,l=h*2);for(let y=0;y<s;y++)for(let $=0;$<i;$++){let w=(e.data[f++]-p[0])*d[0],v=(e.data[l++]-p[1])*d[1],S=(e.data[g++]-p[2])*d[2],k=_===-1?255:(e.data[_++]-p[3])*d[3];a.fillStyle="rgba("+w+","+v+","+S+","+k+")",a.fillRect($,y,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},Xd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),a;if(r!=null){let i,s,n;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(i=e.dims[2],s=e.dims[1],n=e.dims[3]):(i=e.dims[3],s=e.dims[2],n=e.dims[1]);let o=t!==void 0&&t.format!==void 0?t.format:"RGB",d=t==null?void 0:t.norm,p,h;d===void 0||d.mean===void 0?p=[255,255,255,255]:typeof d.mean=="number"?p=[d.mean,d.mean,d.mean,d.mean]:(p=[d.mean[0],d.mean[1],d.mean[2],255],d.mean[3]!==void 0&&(p[3]=d.mean[3])),d===void 0||d.bias===void 0?h=[0,0,0,0]:typeof d.bias=="number"?h=[d.bias,d.bias,d.bias,d.bias]:(h=[d.bias[0],d.bias[1],d.bias[2],0],d.bias[3]!==void 0&&(h[3]=d.bias[3]));let f=s*i;if(t!==void 0&&(t.format!==void 0&&n===4&&t.format!=="RGBA"||n===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let l=4,g=0,_=1,y=2,$=3,w=0,v=f,S=f*2,k=-1;o==="RGBA"?(w=0,v=f,S=f*2,k=f*3):o==="RGB"?(w=0,v=f,S=f*2):o==="RBG"&&(w=0,S=f,v=f*2),a=r.createImageData(i,s);for(let T=0;T<s*i;g+=l,_+=l,y+=l,$+=l,T++)a.data[g]=(e.data[w++]-h[0])*p[0],a.data[_]=(e.data[v++]-h[1])*p[1],a.data[y]=(e.data[S++]-h[2])*p[2],a.data[$]=k===-1?255:(e.data[k++]-h[3])*p[3]}else throw new Error("Can not access image data");return a}}),Fr,Jd,ep,tp,rp,ap,Cg=Y(()=>{rn(),Fr=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:a}=t,i=t.norm??{mean:255,bias:0},s,n;typeof i.mean=="number"?s=[i.mean,i.mean,i.mean,i.mean]:s=[i.mean[0],i.mean[1],i.mean[2],i.mean[3]??255],typeof i.bias=="number"?n=[i.bias,i.bias,i.bias,i.bias]:n=[i.bias[0],i.bias[1],i.bias[2],i.bias[3]??0];let o=t.format!==void 0?t.format:"RGBA",d=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*a,h=d==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),f=4,l=0,g=1,_=2,y=3,$=0,w=p,v=p*2,S=-1;o==="RGB"&&(f=3,l=0,g=1,_=2,y=-1),d==="RGBA"?S=p*3:d==="RBG"?($=0,v=p,w=p*2):d==="BGR"&&(v=0,w=p,$=p*2);for(let k=0;k<p;k++,l+=f,_+=f,g+=f,y+=f)h[$++]=(e[l]+n[0])/s[0],h[w++]=(e[g]+n[1])/s[1],h[v++]=(e[_]+n[2])/s[2],S!==-1&&y!==-1&&(h[S++]=(e[y]+n[3])/s[3]);return d==="RGBA"?new rt("float32",h,[1,4,r,a]):new rt("float32",h,[1,3,r,a])},Jd=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,a=typeof ImageData<"u"&&e instanceof ImageData,i=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,s=typeof e=="string",n,o=t??{},d=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=h=>typeof HTMLCanvasElement<"u"&&h instanceof HTMLCanvasElement||h instanceof OffscreenCanvas?h.getContext("2d"):null;if(r){let h=d();h.width=e.width,h.height=e.height;let f=p(h);if(f!=null){let l=e.height,g=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(l=t.resizedHeight,g=t.resizedWidth),t!==void 0){if(o=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");o.tensorFormat="RGBA",o.height=l,o.width=g}else o.tensorFormat="RGBA",o.height=l,o.width=g;f.drawImage(e,0,0),n=f.getImageData(0,0,g,l).data}else throw new Error("Can not access image data")}else if(a){let h,f;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(h=t.resizedHeight,f=t.resizedWidth):(h=e.height,f=e.width),t!==void 0&&(o=t),o.format="RGBA",o.height=h,o.width=f,t!==void 0){let l=d();l.width=f,l.height=h;let g=p(l);if(g!=null)g.putImageData(e,0,0),n=g.getImageData(0,0,f,h).data;else throw new Error("Can not access image data")}else n=e.data}else if(i){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let h=d();h.width=e.width,h.height=e.height;let f=p(h);if(f!=null){let l=e.height,g=e.width;return f.drawImage(e,0,0,g,l),n=f.getImageData(0,0,g,l).data,o.height=l,o.width=g,Fr(n,o)}else throw new Error("Can not access image data")}else{if(s)return new Promise((h,f)=>{let l=d(),g=p(l);if(!e||!g)return f();let _=new Image;_.crossOrigin="Anonymous",_.src=e,_.onload=()=>{l.width=_.width,l.height=_.height,g.drawImage(_,0,0,l.width,l.height);let y=g.getImageData(0,0,l.width,l.height);o.height=l.height,o.width=l.width,h(Fr(y.data,o))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(n!==void 0)return Fr(n,o);throw new Error("Input data provided is not supported - aborted tensor creation")},ep=(e,t)=>{let{width:r,height:a,download:i,dispose:s}=t,n=[1,a,r,4];return new rt({location:"texture",type:"float32",texture:e,dims:n,download:i,dispose:s})},tp=(e,t)=>{let{dataType:r,dims:a,download:i,dispose:s}=t;return new rt({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:a,download:i,dispose:s})},rp=(e,t)=>{let{dataType:r,dims:a,download:i,dispose:s}=t;return new rt({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:a,download:i,dispose:s})},ap=(e,t,r)=>new rt({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),Ft,kr,qa,ip,zg=Y(()=>{Ft=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),kr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),qa=!1,ip=()=>{if(!qa){qa=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=typeof Float16Array<"u"&&Float16Array.from;e&&(Ft.set("int64",BigInt64Array),kr.set(BigInt64Array,"int64")),t&&(Ft.set("uint64",BigUint64Array),kr.set(BigUint64Array,"uint64")),r?(Ft.set("float16",Float16Array),kr.set(Float16Array,"float16")):Ft.set("float16",Uint16Array)}}}),np,sp,Ag=Y(()=>{rn(),np=e=>{let t=1;for(let r=0;r<e.length;r++){let a=e[r];if(typeof a!="number"||!Number.isSafeInteger(a))throw new TypeError(`dims[${r}] must be an integer, got: ${a}`);if(a<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${a}`);t*=a}return t},sp=(e,t)=>{switch(e.location){case"cpu":return new rt(e.type,e.data,t);case"cpu-pinned":return new rt({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new rt({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new rt({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new rt({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),rt,rn=Y(()=>{Ig(),Cg(),zg(),Ag(),rt=class{constructor(e,t,r){ip();let a,i;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,a=e.type,i=e.dims,e.location){case"cpu-pinned":{let n=Ft.get(a);if(!n)throw new TypeError(`unsupported type "${a}" to create tensor from pinned buffer`);if(!(e.data instanceof n))throw new TypeError(`buffer should be of type ${n.name}`);this.cpuData=e.data;break}case"texture":{if(a!=="float32")throw new TypeError(`unsupported type "${a}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(a!=="float32"&&a!=="float16"&&a!=="int32"&&a!=="int64"&&a!=="uint32"&&a!=="uint8"&&a!=="bool"&&a!=="uint4"&&a!=="int4")throw new TypeError(`unsupported type "${a}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(a!=="float32"&&a!=="float16"&&a!=="int32"&&a!=="int64"&&a!=="uint32"&&a!=="uint64"&&a!=="int8"&&a!=="uint8"&&a!=="bool"&&a!=="uint4"&&a!=="int4")throw new TypeError(`unsupported type "${a}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let n,o;if(typeof e=="string")if(a=e,o=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");n=t}else{let d=Ft.get(e);if(d===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&d===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${d.name} as data.`);e==="uint64"||e==="int64"?n=d.from(t,BigInt):n=d.from(t)}else if(t instanceof d)n=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")n=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else throw new TypeError(`A ${a} tensor's data must be type of ${d}`)}else if(o=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let d=typeof e[0];if(d==="string")a="string",n=e;else if(d==="boolean")a="bool",n=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${d}.`)}else if(e instanceof Uint8ClampedArray)a="uint8",n=Uint8Array.from(e);else{let d=kr.get(e.constructor);if(d===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);a=d,n=e}if(o===void 0)o=[n.length];else if(!Array.isArray(o))throw new TypeError("A tensor's dims must be a number array");i=o,this.cpuData=n,this.dataLocation="cpu"}let s=np(i);if(this.cpuData&&s!==this.cpuData.length&&!((a==="uint4"||a==="int4")&&Math.ceil(s/2)===this.cpuData.length))throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);this.type=a,this.dims=i,this.size=s}static async fromImage(e,t){return Jd(e,t)}static fromTexture(e,t){return ep(e,t)}static fromGpuBuffer(e,t){return tp(e,t)}static fromMLTensor(e,t){return rp(e,t)}static fromPinnedBuffer(e,t,r){return ap(e,t,r)}toDataURL(e){return Yd(this,e)}toImageData(e){return Xd(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return sp(this,e)}}}),bt,op=Y(()=>{rn(),bt=rt}),pa,Ha,wt,pt,up=Y(()=>{Zd(),pa=(e,t)=>{(typeof nt.trace>"u"?!nt.wasm.trace:!nt.trace)||console.timeStamp(`${e}::ORT::${t}`)},Ha=(e,t)=>{var i;let r=((i=new Error().stack)==null?void 0:i.split(/\r\n|\r|\n/g))||[],a=!1;for(let s=0;s<r.length;s++){if(a&&!r[s].includes("TRACE_FUNC")){let n=`FUNC_${e}::${r[s].trim().split(" ")[1]}`;t&&(n+=`::${t}`),pa("CPU",n);return}r[s].includes("TRACE_FUNC")&&(a=!0)}},wt=e=>{(typeof nt.trace>"u"?!nt.wasm.trace:!nt.trace)||Ha("BEGIN",e)},pt=e=>{(typeof nt.trace>"u"?!nt.wasm.trace:!nt.trace)||Ha("END",e)}}),lp,Og=Y(()=>{Kd(),op(),up(),lp=class dp{constructor(t){this.handler=t}async run(t,r,a){wt();let i={},s={};if(typeof t!="object"||t===null||t instanceof bt||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let n=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof bt)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");n=!1;for(let p of r){if(typeof p!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw new RangeError(`'fetches' contains invalid output name: ${p}.`);i[p]=null}if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else{let p=!1,h=Object.getOwnPropertyNames(r);for(let f of this.outputNames)if(h.indexOf(f)!==-1){let l=r[f];(l===null||l instanceof bt)&&(p=!0,n=!1,i[f]=l)}if(p){if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else s=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw new Error(`input '${p}' is missing in 'feeds'.`);if(n)for(let p of this.outputNames)i[p]=null;let o=await this.handler.run(t,i,s),d={};for(let p in o)if(Object.hasOwnProperty.call(o,p)){let h=o[p];h instanceof bt?d[p]=h:d[p]=new bt(h.type,h.data,h.dims)}return pt(),d}async release(){return this.handler.dispose()}static async create(t,r,a,i){wt();let s,n={};if(typeof t=="string"){if(s=t,typeof r=="object"&&r!==null)n=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(s=t,typeof r=="object"&&r!==null)n=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let h=t,f=0,l=t.byteLength;if(typeof r=="object"&&r!==null)n=r;else if(typeof r=="number"){if(f=r,!Number.isSafeInteger(f))throw new RangeError("'byteOffset' must be an integer.");if(f<0||f>=h.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);if(l=t.byteLength-f,typeof a=="number"){if(l=a,!Number.isSafeInteger(l))throw new RangeError("'byteLength' must be an integer.");if(l<=0||f+l>h.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength-f}].`);if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else if(typeof a<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");s=new Uint8Array(h,f,l)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[o,d]=await jd(n),p=await o.createInferenceSessionHandler(s,d);return pt(),new dp(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}}}),pp,Rg=Y(()=>{Og(),pp=lp}),Dg=Y(()=>{}),Bg=Y(()=>{}),Mg=Y(()=>{}),Ng=Y(()=>{}),Pg={};Or(Pg,{InferenceSession:()=>pp,TRACE:()=>pa,TRACE_FUNC_BEGIN:()=>wt,TRACE_FUNC_END:()=>pt,Tensor:()=>bt,env:()=>De,registerBackend:()=>ar});var ht=Y(()=>{Sg(),Eg(),Rg(),op(),Dg(),Bg(),up(),Mg(),Ng()}),an=Y(()=>{}),cp={};Or(cp,{default:()=>hp});var Ga,Fa,hp,Ug=Y(()=>{var e;_f(),Yt(),nn(),Ga="ort-wasm-proxy-worker",Fa=((e=globalThis.self)==null?void 0:e.name)===Ga,Fa&&(self.onmessage=t=>{let{type:r,in:a}=t.data;try{switch(r){case"init-wasm":sn(a.wasm).then(()=>{kn(a).then(()=>{postMessage({type:r})},i=>{postMessage({type:r,err:i})})},i=>{postMessage({type:r,err:i})});break;case"init-ep":{let{epName:i,env:s}=a;Sn(s,i).then(()=>{postMessage({type:r})},n=>{postMessage({type:r,err:n})});break}case"copy-from":{let{buffer:i}=a,s=_a(i);postMessage({type:r,out:s});break}case"create":{let{model:i,options:s}=a;Tn(i,s).then(n=>{postMessage({type:r,out:n})},n=>{postMessage({type:r,err:n})});break}case"release":En(a),postMessage({type:r});break;case"run":{let{sessionId:i,inputIndices:s,inputs:n,outputIndices:o,options:d}=a;In(i,s,n,o,new Array(o.length).fill(null),d).then(p=>{p.some(h=>h[3]!=="cpu")?postMessage({type:r,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:r,out:p},zn([...n,...p]))},p=>{postMessage({type:r,err:p})});break}case"end-profiling":Cn(a),postMessage({type:r});break;default:}}catch(i){postMessage({type:r,err:i})}}),hp=Fa?null:t=>new Worker(t??tt,{type:"module",name:Ga})}),fp={};Or(fp,{default:()=>mp});var ja,Ka,mp,Vg=Y(()=>{var e;Ka=(ja=import.meta.url,async function(t={}){function r(){return R.buffer!=j.buffer&&ke(),j}function a(){return R.buffer!=j.buffer&&ke(),re}function i(){return R.buffer!=j.buffer&&ke(),ne}function s(){return R.buffer!=j.buffer&&ke(),D}function n(){return R.buffer!=j.buffer&&ke(),F}function o(){return R.buffer!=j.buffer&&ke(),te}function d(){return R.buffer!=j.buffer&&ke(),ce}function p(){return R.buffer!=j.buffer&&ke(),Ge}var h,f,l=Object.assign({},t),g=new Promise((u,c)=>{h=u,f=c}),_=typeof window=="object",y=typeof importScripts=="function",$=y&&self.name=="em-pthread";l.mountExternalData=(u,c)=>{u.startsWith("./")&&(u=u.substring(2)),(l.Fb||(l.Fb=new Map)).set(u,c)},l.unmountExternalData=()=>{delete l.Fb};var w=globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,shared:!0}).buffer.constructor;let v=()=>{let u=(m,b,x)=>(...z)=>{let L=gt,K=b==null?void 0:b();z=m(...z);let ae=b==null?void 0:b();return K!==ae&&(m=ae,x(K),b=x=null),gt!=L?new Promise((ie,de)=>{Ra={resolve:ie,reject:de}}):z},c=m=>async(...b)=>{var x;try{if(l.Gb)throw Error("Session already started");let z=l.Gb={hc:b[0],errors:[]},L=await m(...b);if(l.Gb!==z)throw Error("Session mismatch");(x=l.Hb)==null||x.flush();let K=z.errors;if(0<K.length){let ae=await Promise.all(K);if(ae=ae.filter(ie=>ie),0<ae.length)throw Error(ae.join(`
`))}return L}finally{l.Gb=null}};l._OrtCreateSession=u(l._OrtCreateSession,()=>l._OrtCreateSession,m=>l._OrtCreateSession=m),l._OrtRun=c(u(l._OrtRun,()=>l._OrtRun,m=>l._OrtRun=m)),l._OrtRunWithBinding=c(u(l._OrtRunWithBinding,()=>l._OrtRunWithBinding,m=>l._OrtRunWithBinding=m)),l._OrtBindInput=u(l._OrtBindInput,()=>l._OrtBindInput,m=>l._OrtBindInput=m),v=void 0};l.jsepInit=(u,c)=>{if(v==null||v(),u==="webgpu"){[l.Hb,l.Vb,l.Zb,l.Ob,l.Yb,l.kb,l.$b,l.cc,l.Wb,l.Xb,l.ac]=c;let m=l.Hb;l.jsepRegisterBuffer=(b,x,z,L)=>m.registerBuffer(b,x,z,L),l.jsepGetBuffer=b=>m.getBuffer(b),l.jsepCreateDownloader=(b,x,z)=>m.createDownloader(b,x,z),l.jsepOnCreateSession=b=>{m.onCreateSession(b)},l.jsepOnReleaseSession=b=>{m.onReleaseSession(b)},l.jsepOnRunStart=b=>m.onRunStart(b),l.dc=(b,x)=>{m.upload(b,x)}}else if(u==="webnn"){[l.Hb,l.bc,l.Pb,l.jsepEnsureTensor,l.ec,l.jsepDownloadTensor]=c,l.jsepReleaseTensorId=l.Pb;let m=l.Hb;l.jsepOnRunStart=b=>m.onRunStart(b),l.jsepRegisterMLContext=(b,x)=>{m.registerMLContext(b,x)},l.jsepOnReleaseSession=b=>{m.onReleaseSession(b)},l.jsepCreateMLTensorDownloader=(b,x)=>m.createMLTensorDownloader(b,x),l.jsepRegisterMLTensor=(b,x,z)=>m.registerMLTensor(b,x,z),l.jsepCreateMLContext=b=>m.createMLContext(b),l.jsepRegisterMLConstant=(b,x,z,L,K)=>m.registerMLConstant(b,x,z,L,K,l.Fb)}};var S,k,T=Object.assign({},l),I=(u,c)=>{throw c},C="";(_||y)&&(y?C=self.location.href:typeof document<"u"&&document.currentScript&&(C=document.currentScript.src),ja&&(C=ja),C=C.startsWith("blob:")?"":C.substr(0,C.replace(/[?#].*/,"").lastIndexOf("/")+1),y&&(k=u=>{var c=new XMLHttpRequest;return c.open("GET",u,!1),c.responseType="arraybuffer",c.send(null),new Uint8Array(c.response)}),S=(u,c,m)=>{var b=new XMLHttpRequest;b.open("GET",u,!0),b.responseType="arraybuffer",b.onload=()=>{b.status==200||b.status==0&&b.response?c(b.response):m()},b.onerror=m,b.send(null)});var E,O=console.log.bind(console),A=console.error.bind(console),P=O,G=A;if(Object.assign(l,T),T=null,$){let u=function(c){try{var m=c.data,b=m.cmd;if(b==="load"){let x=[];self.onmessage=z=>x.push(z),self.startWorker=()=>{postMessage({cmd:"loaded"});for(let z of x)u(z);self.onmessage=u};for(let z of m.handlers)l[z]&&!l[z].proxy||(l[z]=(...L)=>{postMessage({Nb:"callHandler",pc:z,args:L})},z=="print"&&(P=l[z]),z=="printErr"&&(G=l[z]));R=m.wasmMemory,ke(),N(m.wasmModule)}else if(b==="run"){Na(m.pthread_ptr,0,0,1,0,0),Aa(m.pthread_ptr),Af(),Wn(),M||(Ps(),M=!0);try{Of(m.start_routine,m.arg)}catch(x){if(x!="unwind")throw x}}else b==="cancel"?tr()&&Hr(-1):m.target!=="setimmediate"&&(b==="checkMailbox"?M&&Dr():b&&(G(`worker: received unknown command ${b}`),G(m)))}catch(x){throw Us(),x}};var N,M=!1;G=function(...c){c=c.join(" "),console.error(c)},self.alert=function(...c){postMessage({Nb:"alert",text:c.join(" "),rc:tr()})},l.instantiateWasm=(c,m)=>new Promise(b=>{N=x=>{x=new WebAssembly.Instance(x,Mn()),m(x),b()}}),self.onunhandledrejection=c=>{throw c.reason||c},self.onmessage=u}l.wasmBinary&&(E=l.wasmBinary);var R,Q,Z,j,re,ne,D,F,te,ce,$e,Re,Ge,He=!1;function ke(){var u=R.buffer;l.HEAP8=j=new Int8Array(u),l.HEAP16=ne=new Int16Array(u),l.HEAPU8=re=new Uint8Array(u),l.HEAPU16=D=new Uint16Array(u),l.HEAP32=F=new Int32Array(u),l.HEAPU32=te=new Uint32Array(u),l.HEAPF32=ce=new Float32Array(u),l.HEAPF64=Ge=new Float64Array(u),l.HEAP64=$e=new BigInt64Array(u),l.HEAPU64=Re=new BigUint64Array(u)}if(!$){if(!((R=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0})).buffer instanceof w))throw G("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),Error("bad memory");ke()}var Oe=[],Ye=[],xt=[],Pt=0,hr=null;function An(){if(--Pt==0&&hr){var u=hr;hr=null,u()}}function It(u){throw G(u="Aborted("+u+")"),He=!0,Z=1,u=new WebAssembly.RuntimeError(u+". Build with -sASSERTIONS for more info."),f(u),u}var ba,On=u=>u.startsWith("data:application/octet-stream;base64,"),Rn=u=>u.startsWith("file://");function Dn(u){if(u==ba&&E)return new Uint8Array(E);if(k)return k(u);throw"both async and sync fetching of the wasm failed"}function Bn(u,c,m){return function(b){if(!E&&(_||y)){if(typeof fetch=="function"&&!Rn(b))return fetch(b,{credentials:"same-origin"}).then(x=>{if(!x.ok)throw`failed to load wasm binary file at '${b}'`;return x.arrayBuffer()}).catch(()=>Dn(b));if(S)return new Promise((x,z)=>{S(b,L=>x(new Uint8Array(L)),z)})}return Promise.resolve().then(()=>Dn(b))}(u).then(b=>WebAssembly.instantiate(b,c)).then(m,b=>{G(`failed to asynchronously prepare wasm: ${b}`),It(b)})}function Mn(){return{a:{O:zf,Aa:Cf,b:Df,aa:Gn,B:Kn,qa:Qn,Y:Yn,_:Xn,ra:Jn,oa:es,ha:ts,na:rs,L:as,Z:is,W:ns,pa:ss,X:os,va:Bf,F:Mf,Q:Nf,P:Uf,E:Wf,u:Lf,q:qf,G:Hf,A:Yf,R:Xf,ua:Jf,ka:em,U:tm,ba:rm,H:am,ja:Aa,ta:im,t:nm,Ba:sm,x:lm,o:dm,m:cm,c:Ca,n:hm,k:gm,w:_m,p:ym,f:bm,s:$m,l:vm,e:wm,j:xm,i:km,g:Sm,d:Tm,ea:Em,fa:Im,ga:Cm,ca:vs,da:ws,T:zm,h:Am,D:Om,I:Rm,M:Dm,y:Bm,sa:Mm,V:Nm,v:ks,z:Pm,N:Um,S:Vm,za:Wm,ya:Lm,la:Es,ma:Is,$:ka,C:Cs,K:zs,ia:As,J:Os,a:R,xa,wa:Bs,r:Gm}}}var $a={916868:(u,c,m,b,x)=>{if(l===void 0||!l.Fb)return 1;if((u=qe(Number(u>>>0))).startsWith("./")&&(u=u.substring(2)),!(u=l.Fb.get(u)))return 2;if(c=Number(c>>>0),m=Number(m>>>0),b=Number(b>>>0),c+m>u.byteLength)return 3;try{let z=u.subarray(c,c+m);switch(x){case 0:a().set(z,b>>>0);break;case 1:l.dc(b,z);break;default:return 4}return 0}catch{return 4}},917583:(u,c,m)=>{l.ec(u,a().subarray(c>>>0,c+m>>>0))},917646:()=>l.bc(),917687:u=>{l.Pb(u)},917723:()=>{l.Wb()},917754:()=>{l.Xb()},917783:()=>{l.ac()},917808:u=>l.Vb(u),917841:u=>l.Zb(u),917873:(u,c,m)=>{l.Ob(Number(u),Number(c),Number(m),!0)},917936:(u,c,m)=>{l.Ob(Number(u),Number(c),Number(m))},917993:()=>typeof wasmOffsetConverter<"u",918050:u=>{l.kb("Abs",u,void 0)},918101:u=>{l.kb("Neg",u,void 0)},918152:u=>{l.kb("Floor",u,void 0)},918205:u=>{l.kb("Ceil",u,void 0)},918257:u=>{l.kb("Reciprocal",u,void 0)},918315:u=>{l.kb("Sqrt",u,void 0)},918367:u=>{l.kb("Exp",u,void 0)},918418:u=>{l.kb("Erf",u,void 0)},918469:u=>{l.kb("Sigmoid",u,void 0)},918524:(u,c,m)=>{l.kb("HardSigmoid",u,{alpha:c,beta:m})},918603:u=>{l.kb("Log",u,void 0)},918654:u=>{l.kb("Sin",u,void 0)},918705:u=>{l.kb("Cos",u,void 0)},918756:u=>{l.kb("Tan",u,void 0)},918807:u=>{l.kb("Asin",u,void 0)},918859:u=>{l.kb("Acos",u,void 0)},918911:u=>{l.kb("Atan",u,void 0)},918963:u=>{l.kb("Sinh",u,void 0)},919015:u=>{l.kb("Cosh",u,void 0)},919067:u=>{l.kb("Asinh",u,void 0)},919120:u=>{l.kb("Acosh",u,void 0)},919173:u=>{l.kb("Atanh",u,void 0)},919226:u=>{l.kb("Tanh",u,void 0)},919278:u=>{l.kb("Not",u,void 0)},919329:(u,c,m)=>{l.kb("Clip",u,{min:c,max:m})},919398:u=>{l.kb("Clip",u,void 0)},919450:(u,c)=>{l.kb("Elu",u,{alpha:c})},919508:u=>{l.kb("Gelu",u,void 0)},919560:u=>{l.kb("Relu",u,void 0)},919612:(u,c)=>{l.kb("LeakyRelu",u,{alpha:c})},919676:(u,c)=>{l.kb("ThresholdedRelu",u,{alpha:c})},919746:(u,c)=>{l.kb("Cast",u,{to:c})},919804:u=>{l.kb("Add",u,void 0)},919855:u=>{l.kb("Sub",u,void 0)},919906:u=>{l.kb("Mul",u,void 0)},919957:u=>{l.kb("Div",u,void 0)},920008:u=>{l.kb("Pow",u,void 0)},920059:u=>{l.kb("Equal",u,void 0)},920112:u=>{l.kb("Greater",u,void 0)},920167:u=>{l.kb("GreaterOrEqual",u,void 0)},920229:u=>{l.kb("Less",u,void 0)},920281:u=>{l.kb("LessOrEqual",u,void 0)},920340:(u,c,m,b,x)=>{l.kb("ReduceMean",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},920515:(u,c,m,b,x)=>{l.kb("ReduceMax",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},920689:(u,c,m,b,x)=>{l.kb("ReduceMin",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},920863:(u,c,m,b,x)=>{l.kb("ReduceProd",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},921038:(u,c,m,b,x)=>{l.kb("ReduceSum",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},921212:(u,c,m,b,x)=>{l.kb("ReduceL1",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},921385:(u,c,m,b,x)=>{l.kb("ReduceL2",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},921558:(u,c,m,b,x)=>{l.kb("ReduceLogSum",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},921735:(u,c,m,b,x)=>{l.kb("ReduceSumSquare",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},921915:(u,c,m,b,x)=>{l.kb("ReduceLogSumExp",u,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},922095:u=>{l.kb("Where",u,void 0)},922148:(u,c,m)=>{l.kb("Transpose",u,{perm:c?Array.from(n().subarray(Number(c)>>>0,Number(m)>>>0)):[]})},922272:(u,c,m,b)=>{l.kb("DepthToSpace",u,{blocksize:c,mode:qe(m),format:b?"NHWC":"NCHW"})},922405:(u,c,m,b)=>{l.kb("DepthToSpace",u,{blocksize:c,mode:qe(m),format:b?"NHWC":"NCHW"})},922538:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U,xe)=>{l.kb("ConvTranspose",u,{format:ae?"NHWC":"NCHW",autoPad:c,dilations:[m],group:b,kernelShape:[x],pads:[z,L],strides:[K],wIsConst:()=>!!r()[ie>>>0],outputPadding:de?Array.from(n().subarray(Number(de)>>>0,Number(Se)>>>0)):[],outputShape:Ce?Array.from(n().subarray(Number(Ce)>>>0,Number(U)>>>0)):[],activation:qe(xe)})},922971:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U)=>{l.kb("ConvTranspose",u,{format:K?"NHWC":"NCHW",autoPad:c,dilations:Array.from(n().subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:b,kernelShape:Array.from(n().subarray(Number(x)>>>0,2+(Number(x)>>>0)>>>0)),pads:Array.from(n().subarray(Number(z)>>>0,4+(Number(z)>>>0)>>>0)),strides:Array.from(n().subarray(Number(L)>>>0,2+(Number(L)>>>0)>>>0)),wIsConst:()=>!!r()[ae>>>0],outputPadding:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],outputShape:Se?Array.from(n().subarray(Number(Se)>>>0,Number(Ce)>>>0)):[],activation:qe(U)})},923632:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U,xe)=>{l.kb("ConvTranspose",u,{format:ae?"NHWC":"NCHW",autoPad:c,dilations:[m],group:b,kernelShape:[x],pads:[z,L],strides:[K],wIsConst:()=>!!r()[ie>>>0],outputPadding:de?Array.from(n().subarray(Number(de)>>>0,Number(Se)>>>0)):[],outputShape:Ce?Array.from(n().subarray(Number(Ce)>>>0,Number(U)>>>0)):[],activation:qe(xe)})},924065:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U)=>{l.kb("ConvTranspose",u,{format:K?"NHWC":"NCHW",autoPad:c,dilations:Array.from(n().subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:b,kernelShape:Array.from(n().subarray(Number(x)>>>0,2+(Number(x)>>>0)>>>0)),pads:Array.from(n().subarray(Number(z)>>>0,4+(Number(z)>>>0)>>>0)),strides:Array.from(n().subarray(Number(L)>>>0,2+(Number(L)>>>0)>>>0)),wIsConst:()=>!!r()[ae>>>0],outputPadding:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],outputShape:Se?Array.from(n().subarray(Number(Se)>>>0,Number(Ce)>>>0)):[],activation:qe(U)})},924726:(u,c)=>{l.kb("GlobalAveragePool",u,{format:c?"NHWC":"NCHW"})},924817:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U)=>{l.kb("AveragePool",u,{format:U?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:b,storage_order:x,dilations:z?Array.from(n().subarray(Number(z)>>>0,Number(L)>>>0)):[],kernel_shape:K?Array.from(n().subarray(Number(K)>>>0,Number(ae)>>>0)):[],pads:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],strides:Se?Array.from(n().subarray(Number(Se)>>>0,Number(Ce)>>>0)):[]})},925296:(u,c)=>{l.kb("GlobalAveragePool",u,{format:c?"NHWC":"NCHW"})},925387:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U)=>{l.kb("AveragePool",u,{format:U?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:b,storage_order:x,dilations:z?Array.from(n().subarray(Number(z)>>>0,Number(L)>>>0)):[],kernel_shape:K?Array.from(n().subarray(Number(K)>>>0,Number(ae)>>>0)):[],pads:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],strides:Se?Array.from(n().subarray(Number(Se)>>>0,Number(Ce)>>>0)):[]})},925866:(u,c)=>{l.kb("GlobalMaxPool",u,{format:c?"NHWC":"NCHW"})},925953:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U)=>{l.kb("MaxPool",u,{format:U?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:b,storage_order:x,dilations:z?Array.from(n().subarray(Number(z)>>>0,Number(L)>>>0)):[],kernel_shape:K?Array.from(n().subarray(Number(K)>>>0,Number(ae)>>>0)):[],pads:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],strides:Se?Array.from(n().subarray(Number(Se)>>>0,Number(Ce)>>>0)):[]})},926428:(u,c)=>{l.kb("GlobalMaxPool",u,{format:c?"NHWC":"NCHW"})},926515:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U)=>{l.kb("MaxPool",u,{format:U?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:b,storage_order:x,dilations:z?Array.from(n().subarray(Number(z)>>>0,Number(L)>>>0)):[],kernel_shape:K?Array.from(n().subarray(Number(K)>>>0,Number(ae)>>>0)):[],pads:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],strides:Se?Array.from(n().subarray(Number(Se)>>>0,Number(Ce)>>>0)):[]})},926990:(u,c,m,b,x)=>{l.kb("Gemm",u,{alpha:c,beta:m,transA:b,transB:x})},927094:u=>{l.kb("MatMul",u,void 0)},927148:(u,c,m,b)=>{l.kb("ArgMax",u,{keepDims:!!c,selectLastIndex:!!m,axis:b})},927256:(u,c,m,b)=>{l.kb("ArgMin",u,{keepDims:!!c,selectLastIndex:!!m,axis:b})},927364:(u,c)=>{l.kb("Softmax",u,{axis:c})},927427:(u,c)=>{l.kb("Concat",u,{axis:c})},927487:(u,c,m,b,x)=>{l.kb("Split",u,{axis:c,numOutputs:m,splitSizes:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},927643:u=>{l.kb("Expand",u,void 0)},927697:(u,c)=>{l.kb("Gather",u,{axis:Number(c)})},927768:(u,c)=>{l.kb("GatherElements",u,{axis:Number(c)})},927847:(u,c)=>{l.kb("GatherND",u,{batch_dims:Number(c)})},927926:(u,c,m,b,x,z,L,K,ae,ie,de)=>{l.kb("Resize",u,{antialias:c,axes:m?Array.from(n().subarray(Number(m)>>>0,Number(b)>>>0)):[],coordinateTransformMode:qe(x),cubicCoeffA:z,excludeOutside:L,extrapolationValue:K,keepAspectRatioPolicy:qe(ae),mode:qe(ie),nearestMode:qe(de)})},928288:(u,c,m,b,x,z,L)=>{l.kb("Slice",u,{starts:c?Array.from(n().subarray(Number(c)>>>0,Number(m)>>>0)):[],ends:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[],axes:z?Array.from(n().subarray(Number(z)>>>0,Number(L)>>>0)):[]})},928552:u=>{l.kb("Tile",u,void 0)},928604:(u,c,m)=>{l.kb("InstanceNormalization",u,{epsilon:c,format:m?"NHWC":"NCHW"})},928718:(u,c,m)=>{l.kb("InstanceNormalization",u,{epsilon:c,format:m?"NHWC":"NCHW"})},928832:u=>{l.kb("Range",u,void 0)},928885:(u,c)=>{l.kb("Einsum",u,{equation:qe(c)})},928966:(u,c,m,b,x)=>{l.kb("Pad",u,{mode:c,value:m,pads:b?Array.from(n().subarray(Number(b)>>>0,Number(x)>>>0)):[]})},929109:(u,c,m,b,x,z)=>{l.kb("BatchNormalization",u,{epsilon:c,momentum:m,spatial:!!x,trainingMode:!!b,format:z?"NHWC":"NCHW"})},929278:(u,c,m,b,x,z)=>{l.kb("BatchNormalization",u,{epsilon:c,momentum:m,spatial:!!x,trainingMode:!!b,format:z?"NHWC":"NCHW"})},929447:(u,c,m)=>{l.kb("CumSum",u,{exclusive:Number(c),reverse:Number(m)})},929544:(u,c,m)=>{l.kb("DequantizeLinear",u,{axis:c,blockSize:m})},929634:(u,c,m,b,x)=>{l.kb("GridSample",u,{align_corners:c,mode:qe(m),padding_mode:qe(b),format:x?"NHWC":"NCHW"})},929804:(u,c,m,b,x)=>{l.kb("GridSample",u,{align_corners:c,mode:qe(m),padding_mode:qe(b),format:x?"NHWC":"NCHW"})},929974:(u,c,m,b,x,z,L,K,ae)=>{l.kb("Attention",u,{numHeads:c,isUnidirectional:m,maskFilterValue:b,scale:x,doRotary:z,qkvHiddenSizes:L?Array.from(n().subarray(Number(K)>>>0,Number(K)+L>>>0)):[],pastPresentShareBuffer:!!ae})},930246:u=>{l.kb("BiasAdd",u,void 0)},930301:u=>{l.kb("BiasSplitGelu",u,void 0)},930362:u=>{l.kb("FastGelu",u,void 0)},930418:(u,c,m,b,x,z,L,K,ae,ie,de,Se,Ce,U,xe,Ne)=>{l.kb("Conv",u,{format:Se?"NHWC":"NCHW",auto_pad:c,dilations:m?Array.from(n().subarray(Number(m)>>>0,Number(b)>>>0)):[],group:x,kernel_shape:z?Array.from(n().subarray(Number(z)>>>0,Number(L)>>>0)):[],pads:K?Array.from(n().subarray(Number(K)>>>0,Number(ae)>>>0)):[],strides:ie?Array.from(n().subarray(Number(ie)>>>0,Number(de)>>>0)):[],w_is_const:()=>!!r()[Number(Ce)>>>0],activation:qe(U),activation_params:xe?Array.from(d().subarray(Number(xe)>>>0,Number(Ne)>>>0)):[]})},931002:u=>{l.kb("Gelu",u,void 0)},931054:(u,c,m,b,x,z,L,K,ae)=>{l.kb("GroupQueryAttention",u,{numHeads:c,kvNumHeads:m,scale:b,softcap:x,doRotary:z,rotaryInterleaved:L,smoothSoftmax:K,localWindowSize:ae})},931271:(u,c,m,b)=>{l.kb("LayerNormalization",u,{axis:c,epsilon:m,simplified:!!b})},931382:(u,c,m,b)=>{l.kb("LayerNormalization",u,{axis:c,epsilon:m,simplified:!!b})},931493:(u,c,m,b,x,z)=>{l.kb("MatMulNBits",u,{k:c,n:m,accuracyLevel:b,bits:x,blockSize:z})},931620:(u,c,m,b,x,z)=>{l.kb("MultiHeadAttention",u,{numHeads:c,isUnidirectional:m,maskFilterValue:b,scale:x,doRotary:z})},931779:(u,c)=>{l.kb("QuickGelu",u,{alpha:c})},931843:(u,c,m,b,x)=>{l.kb("RotaryEmbedding",u,{interleaved:!!c,numHeads:m,rotaryEmbeddingDim:b,scale:x})},931982:(u,c,m)=>{l.kb("SkipLayerNormalization",u,{epsilon:c,simplified:!!m})},932084:(u,c,m)=>{l.kb("SkipLayerNormalization",u,{epsilon:c,simplified:!!m})},932186:(u,c,m,b)=>{l.kb("GatherBlockQuantized",u,{gatherAxis:c,quantizeAxis:m,blockSize:b})},932307:u=>{l.$b(u)},932341:(u,c)=>l.cc(Number(u),Number(c),l.Gb.hc,l.Gb.errors)};function Cf(u,c,m){return gs(async()=>{await l.Yb(Number(u),Number(c),Number(m))})}function zf(){return typeof wasmOffsetConverter<"u"}function va(u){this.name="ExitStatus",this.message=`Program terminated with exit(${u})`,this.status=u}var wa=u=>{u.terminate(),u.onmessage=()=>{}},Nn=u=>{Ct.length==0&&(qn(),Ln(Ct[0]));var c=Ct.pop();if(!c)return 6;Vt.push(c),ft[u.Bb]=c,c.Bb=u.Bb;var m={cmd:"run",start_routine:u.ic,arg:u.Rb,pthread_ptr:u.Bb};return c.postMessage(m,u.nc),0},Ut=0,Be=(u,c,...m)=>{for(var b=2*m.length,x=Va(),z=Ua(8*b),L=z>>>3,K=0;K<m.length;K++){var ae=m[K];typeof ae=="bigint"?($e[L+2*K]=1n,$e[L+2*K+1]=ae):($e[L+2*K]=0n,p()[L+2*K+1>>>0]=ae)}return u=Vs(u,0,b,z,c),Gr(x),u};function xa(u){if($)return Be(0,1,u);if(Z=u,!(0<Ut)){for(var c of Vt)wa(c);for(c of Ct)wa(c);Ct=[],Vt=[],ft=[],He=!0}I(0,new va(u))}function Pn(u){if($)return Be(1,0,u);ka(u)}var ka=u=>{if(Z=u,$)throw Pn(u),"unwind";xa(u)},Ct=[],Vt=[],Un=[],ft={},Vn=u=>{var c=u.Bb;delete ft[c],Ct.push(u),Vt.splice(Vt.indexOf(u),1),u.Bb=0,Pa(c)};function Wn(){Un.forEach(u=>u())}var Ln=u=>new Promise(c=>{u.onmessage=x=>{var z=(x=x.data).cmd;if(x.targetThread&&x.targetThread!=tr()){var L=ft[x.targetThread];L?L.postMessage(x,x.transferList):G(`Internal error! Worker sent a message "${z}" to target pthread ${x.targetThread}, but that thread no longer exists!`)}else z==="checkMailbox"?Dr():z==="spawnThread"?Nn(x):z==="cleanupThread"?Vn(ft[x.thread]):z==="killThread"?(x=x.thread,z=ft[x],delete ft[x],wa(z),Pa(x),Vt.splice(Vt.indexOf(z),1),z.Bb=0):z==="cancelThread"?ft[x.thread].postMessage({cmd:"cancel"}):z==="loaded"?(u.loaded=!0,c(u)):z==="alert"?alert(`Thread ${x.threadId}: ${x.text}`):x.target==="setimmediate"?u.postMessage(x):z==="callHandler"?l[x.handler](...x.args):z&&G(`worker sent an unknown command ${z}`)},u.onerror=x=>{throw G(`worker sent an error! ${x.filename}:${x.lineno}: ${x.message}`),x};var m,b=[];for(m of[])l.hasOwnProperty(m)&&b.push(m);u.postMessage({cmd:"load",handlers:b,wasmMemory:R,wasmModule:Q})});function qn(){var u=new Worker(import.meta.url.startsWith("file:")?new URL(""+new URL("../assets/ort.bundle.min.D2-GKZ-g.mjs",import.meta.url).href,import.meta.url):new URL(import.meta.url),{type:"module",workerData:"em-pthread",name:"em-pthread"});Ct.push(u)}var Rr=u=>{for(;0<u.length;)u.shift()(l)},Af=()=>{var u=tr(),c=o()[u+52>>>2>>>0];u=o()[u+56>>>2>>>0],Ls(c,c-u),Gr(c)},Of=(u,c)=>{Ut=0,u=qs(u,c),0<Ut?Z=u:Hr(u)};class Rf{constructor(c){this.Kb=c-24}}function Df(u,c,m){var b=new Rf(u>>>=0);throw c>>>=0,m>>>=0,o()[b.Kb+16>>>2>>>0]=0,o()[b.Kb+4>>>2>>>0]=c,o()[b.Kb+8>>>2>>>0]=m,u}function Hn(u,c,m,b){return $?Be(2,1,u,c,m,b):Gn(u,c,m,b)}function Gn(u,c,m,b){if(u>>>=0,c>>>=0,m>>>=0,b>>>=0,w===void 0)return G("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;var x=[];return $&&x.length===0?Hn(u,c,m,b):(u={ic:m,Bb:u,Rb:b,nc:x},$?(u.Nb="spawnThread",postMessage(u,x),0):Nn(u))}var Fn=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0,jn=(u,c,m)=>{var b=(c>>>=0)+m;for(m=c;u[m]&&!(m>=b);)++m;if(16<m-c&&u.buffer&&Fn)return Fn.decode(u.buffer instanceof w?u.slice(c,m):u.subarray(c,m));for(b="";c<m;){var x=u[c++];if(128&x){var z=63&u[c++];if((224&x)==192)b+=String.fromCharCode((31&x)<<6|z);else{var L=63&u[c++];65536>(x=(240&x)==224?(15&x)<<12|z<<6|L:(7&x)<<18|z<<12|L<<6|63&u[c++])?b+=String.fromCharCode(x):(x-=65536,b+=String.fromCharCode(55296|x>>10,56320|1023&x))}}else b+=String.fromCharCode(x)}return b},qe=(u,c)=>(u>>>=0)?jn(a(),u,c):"";function Kn(u,c,m){return $?Be(3,1,u,c,m):0}function Qn(u,c){if($)return Be(4,1,u,c)}var Sa=u=>{for(var c=0,m=0;m<u.length;++m){var b=u.charCodeAt(m);127>=b?c++:2047>=b?c+=2:55296<=b&&57343>=b?(c+=4,++m):c+=3}return c},Zn=(u,c,m,b)=>{if(!(0<b))return 0;var x=m>>>=0;b=m+b-1;for(var z=0;z<u.length;++z){var L=u.charCodeAt(z);if(55296<=L&&57343>=L&&(L=65536+((1023&L)<<10)|1023&u.charCodeAt(++z)),127>=L){if(m>=b)break;c[m++>>>0]=L}else{if(2047>=L){if(m+1>=b)break;c[m++>>>0]=192|L>>6}else{if(65535>=L){if(m+2>=b)break;c[m++>>>0]=224|L>>12}else{if(m+3>=b)break;c[m++>>>0]=240|L>>18,c[m++>>>0]=128|L>>12&63}c[m++>>>0]=128|L>>6&63}c[m++>>>0]=128|63&L}}return c[m>>>0]=0,m-x},Jt=(u,c,m)=>Zn(u,a(),c,m);function Yn(u,c){if($)return Be(5,1,u,c)}function Xn(u,c,m){if($)return Be(6,1,u,c,m)}function Jn(u,c,m){return $?Be(7,1,u,c,m):0}function es(u,c){if($)return Be(8,1,u,c)}function ts(u,c,m){if($)return Be(9,1,u,c,m)}function rs(u,c,m,b){if($)return Be(10,1,u,c,m,b)}function as(u,c,m,b){if($)return Be(11,1,u,c,m,b)}function is(u,c,m,b){if($)return Be(12,1,u,c,m,b)}function ns(u){if($)return Be(13,1,u)}function ss(u,c){if($)return Be(14,1,u,c)}function os(u,c,m){if($)return Be(15,1,u,c,m)}var us,zt,Bf=()=>{It("")},mt=u=>{for(var c="";a()[u>>>0];)c+=us[a()[u++>>>0]];return c},Ta={},Ea={};function kt(u,c,m={}){if(!("argPackAdvance"in c))throw new TypeError("registerType registeredInstance requires argPackAdvance");return function(b,x,z={}){var L=x.name;if(!b)throw new zt(`type "${L}" must have a positive integer typeid pointer`);if(Ea.hasOwnProperty(b)){if(z.Tb)return;throw new zt(`Cannot register type '${L}' twice`)}Ea[b]=x,Ta.hasOwnProperty(b)&&(x=Ta[b],delete Ta[b],x.forEach(K=>K()))}(u,c,m)}var ls=(u,c,m)=>{switch(c){case 1:return m?b=>r()[b>>>0]:b=>a()[b>>>0];case 2:return m?b=>i()[b>>>1>>>0]:b=>s()[b>>>1>>>0];case 4:return m?b=>n()[b>>>2>>>0]:b=>o()[b>>>2>>>0];case 8:return m?b=>$e[b>>>3]:b=>Re[b>>>3];default:throw new TypeError(`invalid integer width (${c}): ${u}`)}};function Mf(u,c,m){m>>>=0,kt(u>>>=0,{name:c=mt(c>>>0),fromWireType:b=>b,toWireType:function(b,x){if(typeof x!="bigint"&&typeof x!="number")throw x=x===null?"null":(b=typeof x)=="object"||b==="array"||b==="function"?x.toString():""+x,new TypeError(`Cannot convert "${x}" to ${this.name}`);return typeof x=="number"&&(x=BigInt(x)),x},argPackAdvance:At,readValueFromPointer:ls(c,m,c.indexOf("u")==-1),Eb:null})}var At=8;function Nf(u,c,m,b){kt(u>>>=0,{name:c=mt(c>>>0),fromWireType:function(x){return!!x},toWireType:function(x,z){return z?m:b},argPackAdvance:At,readValueFromPointer:function(x){return this.fromWireType(a()[x>>>0])},Eb:null})}var Ia=[],St=[];function Ca(u){9<(u>>>=0)&&--St[u+1]==0&&(St[u]=void 0,Ia.push(u))}var et=u=>{if(!u)throw new zt("Cannot use deleted val. handle = "+u);return St[u]},it=u=>{switch(u){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let c=Ia.pop()||St.length;return St[c]=u,St[c+1]=1,c}};function za(u){return this.fromWireType(o()[u>>>2>>>0])}var Pf={name:"emscripten::val",fromWireType:u=>{var c=et(u);return Ca(u),c},toWireType:(u,c)=>it(c),argPackAdvance:At,readValueFromPointer:za,Eb:null};function Uf(u){return kt(u>>>0,Pf)}var Vf=(u,c)=>{switch(c){case 4:return function(m){return this.fromWireType(d()[m>>>2>>>0])};case 8:return function(m){return this.fromWireType(p()[m>>>3>>>0])};default:throw new TypeError(`invalid float width (${c}): ${u}`)}};function Wf(u,c,m){m>>>=0,kt(u>>>=0,{name:c=mt(c>>>0),fromWireType:b=>b,toWireType:(b,x)=>x,argPackAdvance:At,readValueFromPointer:Vf(c,m),Eb:null})}function Lf(u,c,m,b,x){if(u>>>=0,m>>>=0,c=mt(c>>>0),x===-1&&(x=4294967295),x=K=>K,b===0){var z=32-8*m;x=K=>K<<z>>>z}var L=c.includes("unsigned")?function(K,ae){return ae>>>0}:function(K,ae){return ae};kt(u,{name:c,fromWireType:x,toWireType:L,argPackAdvance:At,readValueFromPointer:ls(c,m,b!==0),Eb:null})}function qf(u,c,m){function b(z){var L=o()[z>>>2>>>0];return z=o()[z+4>>>2>>>0],new x(r().buffer,z,L)}var x=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][c];kt(u>>>=0,{name:m=mt(m>>>0),fromWireType:b,argPackAdvance:At,readValueFromPointer:b},{Tb:!0})}function Hf(u,c){u>>>=0;var m=(c=mt(c>>>0))==="std::string";kt(u,{name:c,fromWireType:function(b){var x=o()[b>>>2>>>0],z=b+4;if(m)for(var L=z,K=0;K<=x;++K){var ae=z+K;if(K==x||a()[ae>>>0]==0){if(L=qe(L,ae-L),ie===void 0)var ie=L;else ie+="\0",ie+=L;L=ae+1}}else{for(ie=Array(x),K=0;K<x;++K)ie[K]=String.fromCharCode(a()[z+K>>>0]);ie=ie.join("")}return _t(b),ie},toWireType:function(b,x){x instanceof ArrayBuffer&&(x=new Uint8Array(x));var z=typeof x=="string";if(!(z||x instanceof Uint8Array||x instanceof Uint8ClampedArray||x instanceof Int8Array))throw new zt("Cannot pass non-string to std::string");var L=m&&z?Sa(x):x.length,K=qr(4+L+1),ae=K+4;if(o()[K>>>2>>>0]=L,m&&z)Jt(x,ae,L+1);else if(z)for(z=0;z<L;++z){var ie=x.charCodeAt(z);if(255<ie)throw _t(ae),new zt("String has UTF-16 code units that do not fit in 8 bits");a()[ae+z>>>0]=ie}else for(z=0;z<L;++z)a()[ae+z>>>0]=x[z];return b!==null&&b.push(_t,K),K},argPackAdvance:At,readValueFromPointer:za,Eb(b){_t(b)}})}var ds=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0,Gf=(u,c)=>{for(var m=u>>1,b=m+c/2;!(m>=b)&&s()[m>>>0];)++m;if(32<(m<<=1)-u&&ds)return ds.decode(a().slice(u,m));for(m="",b=0;!(b>=c/2);++b){var x=i()[u+2*b>>>1>>>0];if(x==0)break;m+=String.fromCharCode(x)}return m},Ff=(u,c,m)=>{if(m??(m=2147483647),2>m)return 0;var b=c;m=(m-=2)<2*u.length?m/2:u.length;for(var x=0;x<m;++x){var z=u.charCodeAt(x);i()[c>>>1>>>0]=z,c+=2}return i()[c>>>1>>>0]=0,c-b},jf=u=>2*u.length,Kf=(u,c)=>{for(var m=0,b="";!(m>=c/4);){var x=n()[u+4*m>>>2>>>0];if(x==0)break;++m,65536<=x?(x-=65536,b+=String.fromCharCode(55296|x>>10,56320|1023&x)):b+=String.fromCharCode(x)}return b},Qf=(u,c,m)=>{if(c>>>=0,m??(m=2147483647),4>m)return 0;var b=c;m=b+m-4;for(var x=0;x<u.length;++x){var z=u.charCodeAt(x);if(55296<=z&&57343>=z&&(z=65536+((1023&z)<<10)|1023&u.charCodeAt(++x)),n()[c>>>2>>>0]=z,(c+=4)+4>m)break}return n()[c>>>2>>>0]=0,c-b},Zf=u=>{for(var c=0,m=0;m<u.length;++m){var b=u.charCodeAt(m);55296<=b&&57343>=b&&++m,c+=4}return c};function Yf(u,c,m){if(u>>>=0,c>>>=0,m=mt(m>>>=0),c===2)var b=Gf,x=Ff,z=jf,L=K=>s()[K>>>1>>>0];else c===4&&(b=Kf,x=Qf,z=Zf,L=K=>o()[K>>>2>>>0]);kt(u,{name:m,fromWireType:K=>{for(var ae,ie=o()[K>>>2>>>0],de=K+4,Se=0;Se<=ie;++Se){var Ce=K+4+Se*c;Se!=ie&&L(Ce)!=0||(de=b(de,Ce-de),ae===void 0?ae=de:(ae+="\0",ae+=de),de=Ce+c)}return _t(K),ae},toWireType:(K,ae)=>{if(typeof ae!="string")throw new zt(`Cannot pass non-string to C++ string type ${m}`);var ie=z(ae),de=qr(4+ie+c);return o()[de>>>2>>>0]=ie/c,x(ae,de+4,ie+c),K!==null&&K.push(_t,de),de},argPackAdvance:At,readValueFromPointer:za,Eb(K){_t(K)}})}function Xf(u,c){kt(u>>>=0,{Ub:!0,name:c=mt(c>>>0),argPackAdvance:0,fromWireType:()=>{},toWireType:()=>{}})}var Jf=()=>1;function em(u){Na(u>>>0,!y,1,!_,131072,!1),Wn()}var ps=u=>{if(!He)try{if(u(),!(0<Ut))try{$?Hr(Z):ka(Z)}catch(c){c instanceof va||c=="unwind"||I(0,c)}}catch(c){c instanceof va||c=="unwind"||I(0,c)}};function Aa(u){u>>>=0,typeof Atomics.oc=="function"&&(Atomics.oc(n(),u>>>2,u).value.then(Dr),u+=128,Atomics.store(n(),u>>>2,1))}var Dr=()=>{var u=tr();u&&(Aa(u),ps(Ws))};function tm(u,c){(u>>>=0)==c>>>0?setTimeout(Dr):$?postMessage({targetThread:u,cmd:"checkMailbox"}):(u=ft[u])&&u.postMessage({cmd:"checkMailbox"})}var Oa=[];function rm(u,c,m,b,x){for(c>>>=0,b/=2,Oa.length=b,m=x>>>0>>>3,x=0;x<b;x++)Oa[x]=$e[m+2*x]?$e[m+2*x+1]:p()[m+2*x+1>>>0];return(c?$a[c]:Fm[u])(...Oa)}function am(u){u>>>=0,$?postMessage({cmd:"cleanupThread",thread:u}):Vn(ft[u])}function im(u){}var Br=(u,c)=>{var m=Ea[u];if(m===void 0)throw u=Ns(u),m=mt(u),_t(u),new zt(`${c} has unknown type ${m}`);return m},cs=(u,c,m)=>{var b=[];return u=u.toWireType(b,m),b.length&&(o()[c>>>2>>>0]=it(b)),u};function nm(u,c,m){return c>>>=0,m>>>=0,u=et(u>>>0),c=Br(c,"emval::as"),cs(c,m,u)}function sm(u,c){return c>>>=0,u=et(u>>>0),(c=Br(c,"emval::as")).toWireType(null,u)}var Mr=u=>{try{u()}catch(c){It(c)}},Ot=0,gt=null,hs=0,Nr=[],fs={},ms={},om=0,Ra=null,um=[];function gs(u){return function(c){if(!He){if(Ot===0){var m=!1,b=!1;c((x=0)=>{if(!He&&(hs=x,m=!0,b)){Ot=2,Mr(()=>Fs(gt)),typeof Browser<"u"&&Browser.Lb.Sb&&Browser.Lb.resume(),x=!1;try{var z=function(){var ae=n()[gt+8>>>2>>>0];return ae=le[ms[ae]],--Ut,ae()}()}catch(ae){z=ae,x=!0}var L=!1;if(!gt){var K=Ra;K&&(Ra=null,(x?K.reject:K.resolve)(z),L=!0)}if(x&&!L)throw z}}),b=!0,m||(Ot=1,gt=function(){var x=qr(65548),z=x+12;o()[x>>>2>>>0]=z,o()[x+4>>>2>>>0]=z+65536,z=Nr[0];var L=fs[z];return L===void 0&&(L=om++,fs[z]=L,ms[L]=z),z=L,n()[x+8>>>2>>>0]=z,x}(),typeof Browser<"u"&&Browser.Lb.Sb&&Browser.Lb.pause(),Mr(()=>Hs(gt)))}else Ot===2?(Ot=0,Mr(js),_t(gt),gt=null,um.forEach(ps)):It(`invalid state: ${Ot}`);return hs}}(c=>{u().then(c)})}function lm(u){return u>>>=0,gs(()=>(u=et(u)).then(it))}var Pr=[];function dm(u,c,m,b){return m>>>=0,b>>>=0,(u=Pr[u>>>0])(null,c=et(c>>>0),m,b)}var pm={},Ur=u=>{var c=pm[u];return c===void 0?mt(u):c};function cm(u,c,m,b,x){return m>>>=0,b>>>=0,x>>>=0,(u=Pr[u>>>0])(c=et(c>>>0),c[m=Ur(m)],b,x)}var _s=()=>typeof globalThis=="object"?globalThis:Function("return this")();function hm(u){return(u>>>=0)==0?it(_s()):(u=Ur(u),it(_s()[u]))}var fm=u=>{var c=Pr.length;return Pr.push(u),c},mm=(u,c)=>{for(var m=Array(u),b=0;b<u;++b)m[b]=Br(o()[c+4*b>>>2>>>0],"parameter "+b);return m},ys=(u,c)=>Object.defineProperty(c,"name",{value:u});function gm(u,c,m){var b=(c=mm(u,c>>>0)).shift();u--;var x=`return function (obj, func, destructorsRef, args) {
`,z=0,L=[];m===0&&L.push("obj");for(var K=["retType"],ae=[b],ie=0;ie<u;++ie)L.push("arg"+ie),K.push("argType"+ie),ae.push(c[ie]),x+=`  var arg${ie} = argType${ie}.readValueFromPointer(args${z?"+"+z:""});
`,z+=c[ie].argPackAdvance;return x+=`  var rv = ${m===1?"new func":"func.call"}(${L.join(", ")});
`,b.Ub||(K.push("emval_returnValue"),ae.push(cs),x+=`  return emval_returnValue(retType, destructorsRef, rv);
`),K.push(x+`};
`),u=function(de){var Se=Function;if(!(Se instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof Se} which is not a function`);var Ce=ys(Se.name||"unknownFunctionName",function(){});return Ce.prototype=Se.prototype,Ce=new Ce,(de=Se.apply(Ce,de))instanceof Object?de:Ce}(K)(...ae),m=`methodCaller<(${c.map(de=>de.name).join(", ")}) => ${b.name}>`,fm(ys(m,u))}function _m(u){return u=Ur(u>>>0),it(l[u])}function ym(u,c){return c>>>=0,u=et(u>>>0),c=et(c),it(u[c])}function bm(u){9<(u>>>=0)&&(St[u+1]+=1)}function $m(){return it([])}function vm(u){u=et(u>>>0);for(var c=Array(u.length),m=0;m<u.length;m++)c[m]=u[m];return it(c)}function wm(u){return it(Ur(u>>>0))}function xm(){return it({})}function km(u){for(var c=et(u>>>=0);c.length;){var m=c.pop();c.pop()(m)}Ca(u)}function Sm(u,c,m){c>>>=0,m>>>=0,u=et(u>>>0),c=et(c),m=et(m),u[c]=m}function Tm(u,c){return c>>>=0,u=(u=Br(u>>>0,"_emval_take_value")).readValueFromPointer(c),it(u)}function Em(u,c){u=-9007199254740992>u||9007199254740992<u?NaN:Number(u),c>>>=0,u=new Date(1e3*u),n()[c>>>2>>>0]=u.getUTCSeconds(),n()[c+4>>>2>>>0]=u.getUTCMinutes(),n()[c+8>>>2>>>0]=u.getUTCHours(),n()[c+12>>>2>>>0]=u.getUTCDate(),n()[c+16>>>2>>>0]=u.getUTCMonth(),n()[c+20>>>2>>>0]=u.getUTCFullYear()-1900,n()[c+24>>>2>>>0]=u.getUTCDay(),u=(u.getTime()-Date.UTC(u.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,n()[c+28>>>2>>>0]=u}var er=u=>u%4==0&&(u%100!=0||u%400==0),bs=[0,31,60,91,121,152,182,213,244,274,305,335],$s=[0,31,59,90,120,151,181,212,243,273,304,334];function Im(u,c){u=-9007199254740992>u||9007199254740992<u?NaN:Number(u),c>>>=0,u=new Date(1e3*u),n()[c>>>2>>>0]=u.getSeconds(),n()[c+4>>>2>>>0]=u.getMinutes(),n()[c+8>>>2>>>0]=u.getHours(),n()[c+12>>>2>>>0]=u.getDate(),n()[c+16>>>2>>>0]=u.getMonth(),n()[c+20>>>2>>>0]=u.getFullYear()-1900,n()[c+24>>>2>>>0]=u.getDay();var m=(er(u.getFullYear())?bs:$s)[u.getMonth()]+u.getDate()-1|0;n()[c+28>>>2>>>0]=m,n()[c+36>>>2>>>0]=-60*u.getTimezoneOffset(),m=new Date(u.getFullYear(),6,1).getTimezoneOffset();var b=new Date(u.getFullYear(),0,1).getTimezoneOffset();u=0|(m!=b&&u.getTimezoneOffset()==Math.min(b,m)),n()[c+32>>>2>>>0]=u}function Cm(u){u>>>=0;var c=new Date(n()[u+20>>>2>>>0]+1900,n()[u+16>>>2>>>0],n()[u+12>>>2>>>0],n()[u+8>>>2>>>0],n()[u+4>>>2>>>0],n()[u>>>2>>>0],0),m=n()[u+32>>>2>>>0],b=c.getTimezoneOffset(),x=new Date(c.getFullYear(),6,1).getTimezoneOffset(),z=new Date(c.getFullYear(),0,1).getTimezoneOffset(),L=Math.min(z,x);return 0>m?n()[u+32>>>2>>>0]=+(x!=z&&L==b):0<m!=(L==b)&&(x=Math.max(z,x),c.setTime(c.getTime()+6e4*((0<m?L:x)-b))),n()[u+24>>>2>>>0]=c.getDay(),m=(er(c.getFullYear())?bs:$s)[c.getMonth()]+c.getDate()-1|0,n()[u+28>>>2>>>0]=m,n()[u>>>2>>>0]=c.getSeconds(),n()[u+4>>>2>>>0]=c.getMinutes(),n()[u+8>>>2>>>0]=c.getHours(),n()[u+12>>>2>>>0]=c.getDate(),n()[u+16>>>2>>>0]=c.getMonth(),n()[u+20>>>2>>>0]=c.getYear(),u=c.getTime(),BigInt(isNaN(u)?-1:u/1e3)}function vs(u,c,m,b,x,z,L){return $?Be(16,1,u,c,m,b,x,z,L):-52}function ws(u,c,m,b,x,z){if($)return Be(17,1,u,c,m,b,x,z)}function zm(u,c,m,b){u>>>=0,c>>>=0,m>>>=0,b>>>=0;var x=new Date().getFullYear(),z=new Date(x,0,1),L=new Date(x,6,1);x=z.getTimezoneOffset();var K=L.getTimezoneOffset(),ae=Math.max(x,K);o()[u>>>2>>>0]=60*ae,n()[c>>>2>>>0]=+(x!=K),z=(u=ie=>ie.toLocaleTimeString(void 0,{hour12:!1,timeZoneName:"short"}).split(" ")[1])(z),L=u(L),K<x?(Jt(z,m,17),Jt(L,b,17)):(Jt(z,b,17),Jt(L,m,17))}var Da=[],xs=(u,c)=>{Da.length=0;for(var m;m=a()[u++>>>0];){var b=m!=105;c+=(b&=m!=112)&&c%8?4:0,Da.push(m==112?o()[c>>>2>>>0]:m==106?$e[c>>>3]:m==105?n()[c>>>2>>>0]:p()[c>>>3>>>0]),c+=b?8:4}return Da};function Am(u,c,m){return u>>>=0,c=xs(c>>>0,m>>>0),$a[u](...c)}function Om(u,c,m){return u>>>=0,c=xs(c>>>0,m>>>0),$a[u](...c)}var Rm=()=>{},Dm=()=>Date.now();function Bm(u,c){return G(qe(u>>>0,c>>>0))}var ks,Mm=()=>{throw Ut+=1,"unwind"};function Nm(){return 4294901760}ks=()=>performance.timeOrigin+performance.now();var Pm=()=>navigator.hardwareConcurrency;function Um(){return It("Cannot use emscripten_pc_get_function without -sUSE_OFFSET_CONVERTER"),0}function Vm(u){u>>>=0;var c=a().length;if(u<=c||4294901760<u)return!1;for(var m=1;4>=m;m*=2){var b=c*(1+.2/m);b=Math.min(b,u+100663296);var x=Math;b=Math.max(u,b);e:{x=(x.min.call(x,4294901760,b+(65536-b%65536)%65536)-R.buffer.byteLength+65535)/65536;try{R.grow(x),ke();var z=1;break e}catch{}z=void 0}if(z)return!0}return!1}var Vr=()=>(It("Cannot use convertFrameToPC (needed by __builtin_return_address) without -sUSE_OFFSET_CONVERTER"),0),fr={},Ss=u=>{u.forEach(c=>{Vr()})};function Wm(){var u=Error().stack.toString().split(`
`);return u[0]=="Error"&&u.shift(),Ss(u),fr.Qb=Vr(),fr.fc=u,fr.Qb}function Lm(u,c,m){if(u>>>=0,c>>>=0,fr.Qb==u)var b=fr.fc;else(b=Error().stack.toString().split(`
`))[0]=="Error"&&b.shift(),Ss(b);for(var x=3;b[x]&&Vr()!=u;)++x;for(u=0;u<m&&b[u+x];++u)n()[c+4*u>>>2>>>0]=Vr();return u}var Ba,Ma={},Ts=()=>{if(!Ba){var u,c={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:"./this.program"};for(u in Ma)Ma[u]===void 0?delete c[u]:c[u]=Ma[u];var m=[];for(u in c)m.push(`${u}=${c[u]}`);Ba=m}return Ba};function Es(u,c){if($)return Be(18,1,u,c);u>>>=0,c>>>=0;var m=0;return Ts().forEach((b,x)=>{var z=c+m;for(x=o()[u+4*x>>>2>>>0]=z,z=0;z<b.length;++z)r()[x++>>>0]=b.charCodeAt(z);r()[x>>>0]=0,m+=b.length+1}),0}function Is(u,c){if($)return Be(19,1,u,c);u>>>=0,c>>>=0;var m=Ts();o()[u>>>2>>>0]=m.length;var b=0;return m.forEach(x=>b+=x.length+1),o()[c>>>2>>>0]=b,0}function Cs(u){return $?Be(20,1,u):52}function zs(u,c,m,b){return $?Be(21,1,u,c,m,b):52}function As(u,c,m,b){return $?Be(22,1,u,c,m,b):70}var qm=[null,[],[]];function Os(u,c,m,b){if($)return Be(23,1,u,c,m,b);c>>>=0,m>>>=0,b>>>=0;for(var x=0,z=0;z<m;z++){var L=o()[c>>>2>>>0],K=o()[c+4>>>2>>>0];c+=8;for(var ae=0;ae<K;ae++){var ie=a()[L+ae>>>0],de=qm[u];ie===0||ie===10?((u===1?P:G)(jn(de,0)),de.length=0):de.push(ie)}x+=K}return o()[b>>>2>>>0]=x,0}var Rs=[31,29,31,30,31,30,31,31,30,31,30,31],Ds=[31,28,31,30,31,30,31,31,30,31,30,31],Hm=(u,c)=>{r().set(u,c>>>0)};function Bs(u,c,m,b){function x(U,xe,Ne){for(U=typeof U=="number"?U.toString():U||"";U.length<xe;)U=Ne[0]+U;return U}function z(U,xe){return x(U,xe,"0")}function L(U,xe){function Ne(Qs){return 0>Qs?-1:0<Qs?1:0}var Wt;return(Wt=Ne(U.getFullYear()-xe.getFullYear()))===0&&(Wt=Ne(U.getMonth()-xe.getMonth()))===0&&(Wt=Ne(U.getDate()-xe.getDate())),Wt}function K(U){switch(U.getDay()){case 0:return new Date(U.getFullYear()-1,11,29);case 1:return U;case 2:return new Date(U.getFullYear(),0,3);case 3:return new Date(U.getFullYear(),0,2);case 4:return new Date(U.getFullYear(),0,1);case 5:return new Date(U.getFullYear()-1,11,31);case 6:return new Date(U.getFullYear()-1,11,30)}}function ae(U){var xe=U.Cb;for(U=new Date(new Date(U.Db+1900,0,1).getTime());0<xe;){var Ne=U.getMonth(),Wt=(er(U.getFullYear())?Rs:Ds)[Ne];if(!(xe>Wt-U.getDate())){U.setDate(U.getDate()+xe);break}xe-=Wt-U.getDate()+1,U.setDate(1),11>Ne?U.setMonth(Ne+1):(U.setMonth(0),U.setFullYear(U.getFullYear()+1))}return Ne=new Date(U.getFullYear()+1,0,4),xe=K(new Date(U.getFullYear(),0,4)),Ne=K(Ne),0>=L(xe,U)?0>=L(Ne,U)?U.getFullYear()+1:U.getFullYear():U.getFullYear()-1}u>>>=0,c>>>=0,m>>>=0,b>>>=0;var ie=o()[b+40>>>2>>>0];for(var de in b={lc:n()[b>>>2>>>0],kc:n()[b+4>>>2>>>0],Ib:n()[b+8>>>2>>>0],Mb:n()[b+12>>>2>>>0],Jb:n()[b+16>>>2>>>0],Db:n()[b+20>>>2>>>0],vb:n()[b+24>>>2>>>0],Cb:n()[b+28>>>2>>>0],sc:n()[b+32>>>2>>>0],jc:n()[b+36>>>2>>>0],mc:ie?qe(ie):""},m=qe(m),ie={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"})m=m.replace(new RegExp(de,"g"),ie[de]);var Se="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),Ce="January February March April May June July August September October November December".split(" ");for(de in ie={"%a":U=>Se[U.vb].substring(0,3),"%A":U=>Se[U.vb],"%b":U=>Ce[U.Jb].substring(0,3),"%B":U=>Ce[U.Jb],"%C":U=>z((U.Db+1900)/100|0,2),"%d":U=>z(U.Mb,2),"%e":U=>x(U.Mb,2," "),"%g":U=>ae(U).toString().substring(2),"%G":ae,"%H":U=>z(U.Ib,2),"%I":U=>((U=U.Ib)==0?U=12:12<U&&(U-=12),z(U,2)),"%j":U=>{for(var xe=0,Ne=0;Ne<=U.Jb-1;xe+=(er(U.Db+1900)?Rs:Ds)[Ne++]);return z(U.Mb+xe,3)},"%m":U=>z(U.Jb+1,2),"%M":U=>z(U.kc,2),"%n":()=>`
`,"%p":U=>0<=U.Ib&&12>U.Ib?"AM":"PM","%S":U=>z(U.lc,2),"%t":()=>"	","%u":U=>U.vb||7,"%U":U=>z(Math.floor((U.Cb+7-U.vb)/7),2),"%V":U=>{var xe=Math.floor((U.Cb+7-(U.vb+6)%7)/7);if(2>=(U.vb+371-U.Cb-2)%7&&xe++,xe)xe==53&&((Ne=(U.vb+371-U.Cb)%7)==4||Ne==3&&er(U.Db)||(xe=1));else{xe=52;var Ne=(U.vb+7-U.Cb-1)%7;(Ne==4||Ne==5&&er(U.Db%400-1))&&xe++}return z(xe,2)},"%w":U=>U.vb,"%W":U=>z(Math.floor((U.Cb+7-(U.vb+6)%7)/7),2),"%y":U=>(U.Db+1900).toString().substring(2),"%Y":U=>U.Db+1900,"%z":U=>{var xe=0<=(U=U.jc);return U=Math.abs(U)/60,(xe?"+":"-")+("0000"+(U/60*100+U%60)).slice(-4)},"%Z":U=>U.mc,"%%":()=>"%"},m=m.replace(/%%/g,"\0\0"),ie)m.includes(de)&&(m=m.replace(new RegExp(de,"g"),ie[de](b)));return de=function(U){var xe=Array(Sa(U)+1);return Zn(U,xe,0,xe.length),xe}(m=m.replace(/\0\0/g,"%")),de.length>c?0:(Hm(de,u),de.length-1)}function Gm(u,c,m,b){return Bs(u>>>0,c>>>0,m>>>0,b>>>0)}$||function(){for(var u=l.numThreads-1;u--;)qn();Oe.unshift(()=>{Pt++,function(c){$?c():Promise.all(Ct.map(Ln)).then(c)}(()=>An())})}();for(var Ms=Array(256),Wr=0;256>Wr;++Wr)Ms[Wr]=String.fromCharCode(Wr);us=Ms,zt=l.BindingError=class extends Error{constructor(u){super(u),this.name="BindingError"}},l.InternalError=class extends Error{constructor(u){super(u),this.name="InternalError"}},St.push(0,1,void 0,1,null,1,!0,1,!1,1),l.count_emval_handles=()=>St.length/2-5-Ia.length;var Fm=[xa,Pn,Hn,Kn,Qn,Yn,Xn,Jn,es,ts,rs,as,is,ns,ss,os,vs,ws,Es,Is,Cs,zs,As,Os],le=function(){function u(m,b){return le=m.exports,le=function(){var x=le,z={};for(let[L,K]of Object.entries(x))z[L]=typeof K=="function"?(...ae)=>{Nr.push(L);try{return K(...ae)}finally{He||(Nr.pop(),gt&&Ot===1&&Nr.length===0&&(Ot=0,Ut+=1,Mr(Gs),typeof Fibers<"u"&&Fibers.tc()))}}:K;return z}(),le=function(){var x=le,z=K=>ae=>K(ae)>>>0,L=K=>()=>K()>>>0;return(x=Object.assign({},x)).Da=z(x.Da),x.gb=L(x.gb),x.ib=z(x.ib),x.emscripten_main_runtime_thread_id=L(x.emscripten_main_runtime_thread_id),x.tb=z(x.tb),x.ub=L(x.ub),x}(),Un.push(le.jb),Ye.unshift(le.Ca),Q=b,An(),le}var c=Mn();if(Pt++,l.instantiateWasm)try{return l.instantiateWasm(c,u)}catch(m){G(`Module.instantiateWasm callback failed with error: ${m}`),f(m)}return ba||(ba=l.locateFile?On("ort-wasm-simd-threaded.jsep.wasm")?"ort-wasm-simd-threaded.jsep.wasm":l.locateFile?l.locateFile("ort-wasm-simd-threaded.jsep.wasm",C):C+"ort-wasm-simd-threaded.jsep.wasm":new URL(""+new URL("../assets/ort-wasm-simd-threaded.jsep.Y7jqkEt_.wasm",import.meta.url).href,import.meta.url).href),function(m,b){var x=ba;return E||typeof WebAssembly.instantiateStreaming!="function"||On(x)||Rn(x)||typeof fetch!="function"?Bn(x,m,b):fetch(x,{credentials:"same-origin"}).then(z=>WebAssembly.instantiateStreaming(z,m).then(b,function(L){return G(`wasm streaming compile failed: ${L}`),G("falling back to ArrayBuffer instantiation"),Bn(x,m,b)}))}(c,function(m){u(m.instance,m.module)}).catch(f),{}}(),Ns=u=>(Ns=le.Da)(u),Ps=()=>(Ps=le.Ea)();l._OrtInit=(u,c)=>(l._OrtInit=le.Fa)(u,c),l._OrtGetLastError=(u,c)=>(l._OrtGetLastError=le.Ga)(u,c),l._OrtCreateSessionOptions=(u,c,m,b,x,z,L,K,ae,ie)=>(l._OrtCreateSessionOptions=le.Ha)(u,c,m,b,x,z,L,K,ae,ie),l._OrtAppendExecutionProvider=(u,c)=>(l._OrtAppendExecutionProvider=le.Ia)(u,c),l._OrtAddFreeDimensionOverride=(u,c,m)=>(l._OrtAddFreeDimensionOverride=le.Ja)(u,c,m),l._OrtAddSessionConfigEntry=(u,c,m)=>(l._OrtAddSessionConfigEntry=le.Ka)(u,c,m),l._OrtReleaseSessionOptions=u=>(l._OrtReleaseSessionOptions=le.La)(u),l._OrtCreateSession=(u,c,m)=>(l._OrtCreateSession=le.Ma)(u,c,m),l._OrtReleaseSession=u=>(l._OrtReleaseSession=le.Na)(u),l._OrtGetInputOutputCount=(u,c,m)=>(l._OrtGetInputOutputCount=le.Oa)(u,c,m),l._OrtGetInputName=(u,c)=>(l._OrtGetInputName=le.Pa)(u,c),l._OrtGetOutputName=(u,c)=>(l._OrtGetOutputName=le.Qa)(u,c),l._OrtFree=u=>(l._OrtFree=le.Ra)(u),l._OrtCreateTensor=(u,c,m,b,x,z)=>(l._OrtCreateTensor=le.Sa)(u,c,m,b,x,z),l._OrtGetTensorData=(u,c,m,b,x)=>(l._OrtGetTensorData=le.Ta)(u,c,m,b,x),l._OrtReleaseTensor=u=>(l._OrtReleaseTensor=le.Ua)(u),l._OrtCreateRunOptions=(u,c,m,b)=>(l._OrtCreateRunOptions=le.Va)(u,c,m,b),l._OrtAddRunConfigEntry=(u,c,m)=>(l._OrtAddRunConfigEntry=le.Wa)(u,c,m),l._OrtReleaseRunOptions=u=>(l._OrtReleaseRunOptions=le.Xa)(u),l._OrtCreateBinding=u=>(l._OrtCreateBinding=le.Ya)(u),l._OrtBindInput=(u,c,m)=>(l._OrtBindInput=le.Za)(u,c,m),l._OrtBindOutput=(u,c,m,b)=>(l._OrtBindOutput=le._a)(u,c,m,b),l._OrtClearBoundOutputs=u=>(l._OrtClearBoundOutputs=le.$a)(u),l._OrtReleaseBinding=u=>(l._OrtReleaseBinding=le.ab)(u),l._OrtRunWithBinding=(u,c,m,b,x)=>(l._OrtRunWithBinding=le.bb)(u,c,m,b,x),l._OrtRun=(u,c,m,b,x,z,L,K)=>(l._OrtRun=le.cb)(u,c,m,b,x,z,L,K),l._OrtEndProfiling=u=>(l._OrtEndProfiling=le.db)(u),l._JsepOutput=(u,c,m)=>(l._JsepOutput=le.eb)(u,c,m),l._JsepGetNodeName=u=>(l._JsepGetNodeName=le.fb)(u);var Lr,tr=()=>(tr=le.gb)(),_t=l._free=u=>(_t=l._free=le.hb)(u),qr=l._malloc=u=>(qr=l._malloc=le.ib)(u),Na=(u,c,m,b,x,z)=>(Na=le.lb)(u,c,m,b,x,z),Us=()=>(Us=le.mb)(),Vs=(u,c,m,b,x)=>(Vs=le.nb)(u,c,m,b,x),Pa=u=>(Pa=le.ob)(u),Hr=u=>(Hr=le.pb)(u),Ws=()=>(Ws=le.qb)(),Ls=(u,c)=>(Ls=le.rb)(u,c),Gr=u=>(Gr=le.sb)(u),Ua=u=>(Ua=le.tb)(u),Va=()=>(Va=le.ub)(),qs=l.dynCall_ii=(u,c)=>(qs=l.dynCall_ii=le.wb)(u,c),Hs=u=>(Hs=le.xb)(u),Gs=()=>(Gs=le.yb)(),Fs=u=>(Fs=le.zb)(u),js=()=>(js=le.Ab)();function Ks(){0<Pt||($?(h(l),$||Rr(Ye),startWorker(l)):(Rr(Oe),0<Pt||Lr||(Lr=!0,l.calledRun=!0,He||($||Rr(Ye),h(l),$||Rr(xt)))))}return l.___start_em_js=932469,l.___stop_em_js=932715,l.stackSave=()=>Va(),l.stackRestore=u=>Gr(u),l.stackAlloc=u=>Ua(u),l.setValue=function(u,c,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":r()[u>>>0]=c;break;case"i16":i()[u>>>1>>>0]=c;break;case"i32":n()[u>>>2>>>0]=c;break;case"i64":$e[u>>>3]=BigInt(c);break;case"float":d()[u>>>2>>>0]=c;break;case"double":p()[u>>>3>>>0]=c;break;case"*":o()[u>>>2>>>0]=c;break;default:It(`invalid type for setValue: ${m}`)}},l.getValue=function(u,c="i8"){switch(c.endsWith("*")&&(c="*"),c){case"i1":case"i8":return r()[u>>>0];case"i16":return i()[u>>>1>>>0];case"i32":return n()[u>>>2>>>0];case"i64":return $e[u>>>3];case"float":return d()[u>>>2>>>0];case"double":return p()[u>>>3>>>0];case"*":return o()[u>>>2>>>0];default:It(`invalid type for getValue: ${c}`)}},l.UTF8ToString=qe,l.stringToUTF8=Jt,l.lengthBytesUTF8=Sa,hr=function u(){Lr||Ks(),Lr||(hr=u)},Ks(),l.PTR_SIZE=4,g}),mp=Ka,((e=globalThis.self)==null?void 0:e.name)==="em-pthread"&&Ka()}),Qa,eo,tt,gp,jr,to,ro,Za,ao,Ya,_p,Xa,yp,nn=Y(()=>{an(),Qa=typeof location>"u"?void 0:location.origin,eo=()=>{var e;return(e=import.meta.url)!=null&&e.startsWith("file:")?new URL(new URL(""+new URL("../assets/ort.bundle.min.D2-GKZ-g.mjs",import.meta.url).href,import.meta.url).href,Qa).href:import.meta.url},tt=eo(),gp=()=>{if(tt&&!tt.startsWith("blob:"))return tt.substring(0,tt.lastIndexOf("/")+1)},jr=(e,t)=>{try{let r=t??tt;return(r?new URL(e,r):new URL(e)).origin===Qa}catch{return!1}},to=(e,t)=>{let r=t??tt;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},ro=(e,t)=>`${t??"./"}${e}`,Za=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},ao=async e=>(await import(e)).default,Ya=(Ug(),da(cp)).default,_p=async()=>{if(!tt)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(jr(tt))return[void 0,Ya()];let e=await Za(tt);return[e,Ya(e)]},Xa=(Vg(),da(fp)).default,yp=async(e,t,r)=>{if(!e&&!t&&Xa&&tt&&jr(tt))return[void 0,Xa];{let a="ort-wasm-simd-threaded.jsep.mjs",i=e??to(a,t),s=r&&i&&!jr(i,t),n=s?await Za(i):i??ro(a,t);return[s?n:void 0,await ao(n)]}}}),Ja,Kr,gr,ei,io,no,sn,Fe,Yt=Y(()=>{nn(),Kr=!1,gr=!1,ei=!1,io=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},no=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},sn=async e=>{if(Kr)return Promise.resolve();if(gr)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(ei)throw new Error("previous call to 'initializeWebAssembly()' failed.");gr=!0;let t=e.initTimeout,r=e.numThreads;if(!no())throw new Error("WebAssembly SIMD is not supported in the current environment.");let a=io();r>1&&!a&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let i=e.wasmPaths,s=typeof i=="string"?i:void 0,n=i==null?void 0:i.mjs,o=(n==null?void 0:n.href)??n,d=i==null?void 0:i.wasm,p=(d==null?void 0:d.href)??d,h=e.wasmBinary,[f,l]=await yp(o,s,r>1),g=!1,_=[];if(t>0&&_.push(new Promise(y=>{setTimeout(()=>{g=!0,y()},t)})),_.push(new Promise((y,$)=>{let w={numThreads:r};if(h)w.wasmBinary=h;else if(p||s)w.locateFile=v=>p??s+v;else if(o&&o.indexOf("blob:")!==0)w.locateFile=v=>new URL(v,o).href;else if(f){let v=gp();v&&(w.locateFile=S=>v+S)}l(w).then(v=>{gr=!1,Kr=!0,Ja=v,y(),f&&URL.revokeObjectURL(f)},v=>{gr=!1,ei=!0,$(v)})})),await Promise.race(_),g)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},Fe=()=>{if(Kr&&Ja)return Ja;throw new Error("WebAssembly is not initialized yet.")}}),Qe,ca,Ie,on=Y(()=>{Yt(),Qe=(e,t)=>{let r=Fe(),a=r.lengthBytesUTF8(e)+1,i=r._malloc(a);return r.stringToUTF8(e,i,a),t.push(i),i},ca=(e,t,r,a)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([i,s])=>{let n=t?t+i:i;if(typeof s=="object")ca(s,n+".",r,a);else if(typeof s=="string"||typeof s=="number")a(n,s.toString());else if(typeof s=="boolean")a(n,s?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof s}`)})},Ie=e=>{let t=Fe(),r=t.stackSave();try{let a=t.PTR_SIZE,i=t.stackAlloc(2*a);t._OrtGetLastError(i,i+a);let s=Number(t.getValue(i,a===4?"i32":"i64")),n=t.getValue(i+a,"*"),o=n?t.UTF8ToString(n):"";throw new Error(`${e} ERROR_CODE: ${s}, ERROR_MESSAGE: ${o}`)}finally{t.stackRestore(r)}}}),bp,Wg=Y(()=>{Yt(),on(),bp=e=>{let t=Fe(),r=0,a=[],i=e||{};try{if((e==null?void 0:e.logSeverityLevel)===void 0)i.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log serverity level is not valid: ${e.logSeverityLevel}`);if((e==null?void 0:e.logVerbosityLevel)===void 0)i.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);(e==null?void 0:e.terminate)===void 0&&(i.terminate=!1);let s=0;return(e==null?void 0:e.tag)!==void 0&&(s=Qe(e.tag,a)),r=t._OrtCreateRunOptions(i.logSeverityLevel,i.logVerbosityLevel,!!i.terminate,s),r===0&&Ie("Can't create run options."),(e==null?void 0:e.extra)!==void 0&&ca(e.extra,"",new WeakSet,(n,o)=>{let d=Qe(n,a),p=Qe(o,a);t._OrtAddRunConfigEntry(r,d,p)!==0&&Ie(`Can't set a run config entry: ${n} - ${o}.`)}),[r,a]}catch(s){throw r!==0&&t._OrtReleaseRunOptions(r),a.forEach(n=>t._free(n)),s}}}),so,oo,uo,lo,$p,Lg=Y(()=>{Yt(),on(),so=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},oo=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},uo=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},lo=(e,t,r)=>{for(let a of t){let i=typeof a=="string"?a:a.name;switch(i){case"webnn":if(i="WEBNN",typeof a!="string"){let n=a==null?void 0:a.deviceType;if(n){let o=Qe("deviceType",r),d=Qe(n,r);Fe()._OrtAddSessionConfigEntry(e,o,d)!==0&&Ie(`Can't set a session config entry: 'deviceType' - ${n}.`)}}break;case"webgpu":if(i="JS",typeof a!="string"){let n=a;if(n!=null&&n.preferredLayout){if(n.preferredLayout!=="NCHW"&&n.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${n.preferredLayout}`);let o=Qe("preferredLayout",r),d=Qe(n.preferredLayout,r);Fe()._OrtAddSessionConfigEntry(e,o,d)!==0&&Ie(`Can't set a session config entry: 'preferredLayout' - ${n.preferredLayout}.`)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${i}`)}let s=Qe(i,r);Fe()._OrtAppendExecutionProvider(e,s)!==0&&Ie(`Can't append execution provider: ${i}.`)}},$p=e=>{let t=Fe(),r=0,a=[],i=e||{};uo(i);try{let s=so(i.graphOptimizationLevel??"all"),n=oo(i.executionMode??"sequential"),o=typeof i.logId=="string"?Qe(i.logId,a):0,d=i.logSeverityLevel??2;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log serverity level is not valid: ${d}`);let p=i.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let h=typeof i.optimizedModelFilePath=="string"?Qe(i.optimizedModelFilePath,a):0;if(r=t._OrtCreateSessionOptions(s,!!i.enableCpuMemArena,!!i.enableMemPattern,n,!!i.enableProfiling,0,o,d,p,h),r===0&&Ie("Can't create session options."),i.executionProviders&&lo(r,i.executionProviders,a),i.enableGraphCapture!==void 0){if(typeof i.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${i.enableGraphCapture}`);let f=Qe("enableGraphCapture",a),l=Qe(i.enableGraphCapture.toString(),a);t._OrtAddSessionConfigEntry(r,f,l)!==0&&Ie(`Can't set a session config entry: 'enableGraphCapture' - ${i.enableGraphCapture}.`)}if(i.freeDimensionOverrides)for(let[f,l]of Object.entries(i.freeDimensionOverrides)){if(typeof f!="string")throw new Error(`free dimension override name must be a string: ${f}`);if(typeof l!="number"||!Number.isInteger(l)||l<0)throw new Error(`free dimension override value must be a non-negative integer: ${l}`);let g=Qe(f,a);t._OrtAddFreeDimensionOverride(r,g,l)!==0&&Ie(`Can't set a free dimension override: ${f} - ${l}.`)}return i.extra!==void 0&&ca(i.extra,"",new WeakSet,(f,l)=>{let g=Qe(f,a),_=Qe(l,a);t._OrtAddSessionConfigEntry(r,g,_)!==0&&Ie(`Can't set a session config entry: ${f} - ${l}.`)}),[r,a]}catch(s){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&Ie("Can't release session options."),a.forEach(n=>t._free(n)),s}}}),Sr,jt,ir,un,ha,ln,dn,Vi,pe=Y(()=>{Sr=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},jt=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},ir=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],a=typeof t=="number"?t:t.reduce((i,s)=>i*s,1);return r>0?Math.ceil(a*r):void 0},un=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},ha=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},ln=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",dn=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Vi=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),pn,vp=Y(()=>{an(),pn=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),a=r?parseInt(r,10):0;if(a<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let i=t.body.getReader(),s;try{s=new ArrayBuffer(a)}catch(o){if(o instanceof RangeError){let d=Math.ceil(a/65536);s=new WebAssembly.Memory({initial:d,maximum:d}).buffer}else throw o}let n=0;for(;;){let{done:o,value:d}=await i.read();if(o)break;let p=d.byteLength;new Uint8Array(s,n,p).set(d),n+=p}return new Uint8Array(s,0,a)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),po,co,ho,fo,cn,mo,ze,Et=Y(()=>{pe(),po=["V","I","W","E","F"],co=(e,t)=>{console.log(`[${po[e]},${new Date().toISOString()}]${t}`)},cn=(e,t)=>{ho=e,fo=t},mo=(e,t)=>{let r=ha(e),a=ha(ho);r>=a&&co(r,typeof t=="function"?t():t)},ze=(...e)=>{fo&&mo(...e)}}),hn,wp=Y(()=>{pe(),hn=(e,t)=>new(un(t))(e)}),fn=Y(()=>{}),ti,Qr,Zr,go,_o,ri,Wi,yo,xp,qg=Y(()=>{Et(),fn(),ti=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Qr=[],Zr=e=>Math.ceil(Number(e)/16)*16,go=e=>{for(let t=0;t<Qr.length;t++){let r=Qr[t];if(e<=r)return r}return Math.ceil(e/16)*16},_o=1,ri=()=>_o++,Wi=async(e,t,r,a)=>{let i=Zr(r),s=e.device.createBuffer({size:i,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let n=e.getCommandEncoder();e.endComputePass(),n.copyBufferToBuffer(t,0,s,0,i),e.flush(),await s.mapAsync(GPUMapMode.READ);let o=s.getMappedRange();if(a){let d=a();return d.set(new Uint8Array(o,0,r)),d}else return new Uint8Array(o.slice(0,r))}finally{s.destroy()}},yo=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of ti)Qr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,a=t.byteOffset,i=t.byteLength,s=Zr(i),n=this.storageCache.get(e);if(!n)throw new Error("gpu data for uploading does not exist");if(Number(n.originalSize)!==i)throw new Error(`inconsistent data size. gpu data size=${n.originalSize}, data size=${i}`);let o=this.backend.device.createBuffer({mappedAtCreation:!0,size:s,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),d=o.getMappedRange();new Uint8Array(d).set(new Uint8Array(r,a,i)),o.unmap();let p=this.backend.device.createCommandEncoder();p.copyBufferToBuffer(o,0,n.gpuData.buffer,0,s),this.backend.device.queue.submit([p.finish()]),o.destroy(),ze("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let a=this.storageCache.get(t);if(!a)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==a.originalSize)throw new Error("inconsistent source and destination gpu data size");let i=Zr(r.originalSize),s=this.backend.getCommandEncoder();this.backend.endComputePass(),s.copyBufferToBuffer(r.gpuData.buffer,0,a.gpuData.buffer,0,i)}registerExternalBuffer(e,t,r){let a;if(r){if(a=r[0],e===r[1])return ze("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${a}, buffer is the same, skip.`),a;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else a=ri();return this.storageCache.set(a,{gpuData:{id:a,type:0,buffer:e},originalSize:t}),ze("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${a}, registered.`),a}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),ze("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=go(e),a,i=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,s=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(i||s){let o=(i?this.freeBuffers:this.freeUniformBuffers).get(r);o?o.length>0?a=o.pop():a=this.backend.device.createBuffer({size:r,usage:t}):a=this.backend.device.createBuffer({size:r,usage:t})}else a=this.backend.device.createBuffer({size:r,usage:t});let n={id:ri(),type:0,buffer:a};return this.storageCache.set(n.id,{gpuData:n,originalSize:Number(e)}),ze("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${n.id}`),n}get(e){var t;return(t=this.storageCache.get(e))==null?void 0:t.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return ze("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Wi(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=ti.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(ze("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},xp=(...e)=>new yo(...e)}),bo,Ae,Le=Y(()=>{bo=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},Ae=e=>new bo(e)}),$o,or,B,fa,kp,Sp,Tp,me=Y(()=>{$o=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},or=class{static calcShape(e,t,r=!1){let a=e.length,i=t.length;if(a===0)return t;if(i===0)return e;let s=Math.max(e.length,t.length),n=new Array(s);if(r){if(a<2||i<2)return;let o=$o.calcMatMulShape([e[a-2],e[a-1]],[t[i-2],t[i-1]]);if(o===void 0)return;[n[s-2],n[s-1]]=o}for(let o=r?3:1;o<=s;o++){let d=a-o<0?1:e[a-o],p=i-o<0?1:t[i-o];if(d!==p&&d>1&&p>1)return;let h=Math.max(d,p);if(d&&p)n[s-o]=Math.max(d,p);else{if(h>1)return;n[s-o]=0}}return n}static isValidBroadcast(e,t){let r=e.length,a=t.length;if(r>a)return!1;for(let i=1;i<=r;i++)if(e[r-i]!==1&&e[r-i]!==t[a-i])return!1;return!0}},B=class na{static size(t){return na.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let a=t.length;if(a===0)return[];let i=new Array(a),s=a-1;for(;s>=0;){if(t[s]%r===0){i[s]=t[s]/r;break}if(r%t[s]!==0)throw new Error("cannot convert shape");i[s]=1,r/=t[s],s--}for(s--;s>=0;s--)i[s]=t[s];return i}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return na.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return na.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,a){let i=1;for(let s=r;s<a;s++){if(t[s]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");i*=Number(t[s])}return i}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let a=new Array(r);a[r-1]=1,a[r-2]=t[r-1];for(let i=r-3;i>=0;--i)a[i]=a[i+1]*t[i+1];return a}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(a=>this.normalizeAxis(a,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(a=>t[a]):t.slice().reverse()}static padShape(t,r){let a=t.length;return t.map((i,s)=>i+r[s]+r[s+a])}static areEqual(t,r){return t.length!==r.length?!1:t.every((a,i)=>a===r[i])}},fa=class Tr{static adjustPoolAttributes(t,r,a,i,s,n){if(!t&&a.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let o=0;o<r.length-2;o++)o>=a.length?a.push(r[o+2]):a[o]=r[o+2];for(let o=0;o<a.length;o++)if(o<i.length){if(i[o]<0)throw new Error("strides should be greater than or equal to 1")}else i.push(1);for(let o=0;o<a.length;o++)if(o<s.length){if(s[o]<0)throw new Error("dilations should be greater than or equal to 1")}else s.push(1);for(let o=0;o<a.length*2;o++)if(o<n.length){if(n[o]<0)throw new Error("pad should be greater than or equal to 1")}else n.push(0);for(let o=0;o<a.length;o++){if(a[o]<=0)throw new Error("kernel shapes need to be greater than 0");if(n[o]>=a[o]||n[o+a.length]>=a[o])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,a,i,s,n,o){if(o){if(s.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(i.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let d=0;d<t.length-2;d++)Tr.adjustPadAndReturnShape(t[d+(n?1:2)],r[d],a[d],i[d],s,d,d+t.length-2,o)}}static computePoolOutputShape(t,r,a,i,s,n,o){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let d=[r[0],r[1]];return Tr.computeShapeHelper(t,r,d,a,i,s,n,o),d}static computeConvOutputShape(t,r,a,i,s,n,o){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let d=[t[0],r[0]];return Tr.computeShapeHelper(!1,t,d,a,i,s,n,o),d}static computeShapeHelper(t,r,a,i,s,n,o,d){if(t)for(let p=0;p<r.length-2;p++)a.push(1);else for(let p=0;p<r.length-2;p++)a.push(Tr.adjustPadAndReturnShape(r[p+2],i[p],s[p],n[p],o,p,p+r.length-2,d))}static adjustPadAndReturnShape(t,r,a,i,s,n,o,d){let p=a*(i-1)+1;if(d&&d!=="NOTSET")switch(d){case"VALID":return s[n]=0,s[o]=0,Math.floor((t-p)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(a!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let h=((t+r-1)/r-1)*r+i-t;return s[n]=Math.floor(d==="SAME_LOWER"?(h+1)/2:h/2),s[o]=h-s[n],Math.floor((t+h-i)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+s[n]+s[o]-p)/r+1)}},kp=class{static getShapeOfGemmResult(e,t,r,a,i){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let s,n,o;t?(s=e[1],n=e[0]):(s=e[0],n=e[1]);let d=-1;if(a?(o=r[0],d=1):(o=r[1],d=0),r[d]!==n)throw new Error("dimension mismatch");if(s<=0||o<=0||n<=0)throw new Error("invalid shape specified");if(i&&!or.isValidBroadcast(i,[s,o]))throw new Error("gemm: invalid bias shape for broadcast");return[s,o,n]}},Sp=-34028234663852886e22,Tp=34028234663852886e22}),ur,Yr,je,Ze,ue,Me,Li,nr,Mt,oe,_r,q,se,Ep,mn,vo,Ip,ye=Y(()=>{pe(),me(),ur=64,Yr=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},je=(e,t=1)=>{let r=Yr(e,t);return typeof r=="string"?r:r[0]},Ze=(e,t=1)=>{let r=Yr(e,t);return typeof r=="string"?r:r[1]},ue=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:B.computeStrides(r)})}),t},Me=e=>e%4===0?4:e%2===0?2:1,Li=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,nr=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,Mt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,oe=(e,t,r,a)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?a==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:a==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,_r=(e,t,r,a,i)=>{let s=typeof r=="number",n=s?r:r.length,o=[...new Array(n).keys()],d=n<2?"u32":n<=4?`vec${n}<u32>`:`array<u32, ${n}>`,p=Yr(t,i),h=typeof p=="string"?p:p[1],f=typeof p=="string"?p:p[0],l={indices:d,value:h,storage:f,tensor:t},g=D=>typeof D=="string"?D:`${D}u`,_={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},y=s?"uniforms.":"",$=`${y}${e}_shape`,w=`${y}${e}_strides`,v="";for(let D=0;D<n-1;D++)v+=`
    let dim${D} = current / ${oe(w,D,n)};
    let rest${D} = current % ${oe(w,D,n)};
    indices[${D}] = dim${D};
    current = rest${D};
    `;v+=`indices[${n-1}] = current;`;let S=n<2?"":`
  fn o2i_${e}(offset: u32) -> ${l.indices} {
    var indices: ${l.indices};
    var current = offset;
    ${v}
    return indices;
  }`,k=D=>(_.offsetToIndices=!0,n<2?D:`o2i_${e}(${D})`),T=[];if(n>=2)for(let D=n-1;D>=0;D--)T.push(`${oe(w,D,n)} * (indices[${D}])`);let I=n<2?"":`
  fn i2o_${e}(indices: ${l.indices}) -> u32 {
    return ${T.join("+")};
  }`,C=D=>(_.indicesToOffset=!0,n<2?D:`i2o_${e}(${D})`),E=(...D)=>n===0?"0u":`${l.indices}(${D.map(g).join(",")})`,O=(D,F)=>n<2?`${D}`:`${oe(D,F,n)}`,A=(D,F,te)=>n<2?`${D}=${te};`:`${oe(D,F,n)}=${te};`,P={},G=(D,F)=>{_.broadcastedIndicesToOffset=!0;let te=`${F.name}broadcastedIndicesTo${e}Offset`;if(te in P)return`${te}(${D})`;let ce=[];for(let $e=n-1;$e>=0;$e--){let Re=F.indicesGet("outputIndices",$e+F.rank-n);ce.push(`${O(w,$e)} * (${Re} % ${O($,$e)})`)}return P[te]=`fn ${te}(outputIndices: ${F.type.indices}) -> u32 {
             return ${ce.length>0?ce.join("+"):"0u"};
           }`,`${te}(${D})`},N=(D,F)=>(()=>{if(l.storage===l.value)return`${e}[${D}]=${F};`;if(l.storage==="vec2<u32>"&&l.value==="i32")return`${e}[${D}]=vec2<u32>(u32(${F}), select(0u, 0xFFFFFFFFu, ${F} < 0));`;if(l.storage==="vec2<u32>"&&l.value==="u32")return`${e}[${D}]=vec2<u32>(u32(${F}), 0u);`;if(l.storage==="u32"&&l.value==="vec4<bool>")return`${e}[${D}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${F}));`;throw new Error(`not supported combination of storage type ${l.storage} and value type ${l.value} yet`)})(),M=D=>(()=>{if(l.storage===l.value)return`${e}[${D}]`;if(l.storage==="vec2<u32>"&&l.value==="i32")return`i32(${e}[${D}].x)`;if(l.storage==="vec2<u32>"&&l.value==="u32")return`u32(${e}[${D}].x)`;if(l.storage==="u32"&&l.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${D}] & 0xFFu), bool(${e}[${D}] & 0xFF00u), bool(${e}[${D}] & 0xFF0000u), bool(${e}[${D}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${l.storage} and value type ${l.value} yet`)})(),R=n<2?"":`
  fn get_${e}ByIndices(indices: ${l.indices}) -> ${h} {
    return ${M(`i2o_${e}(indices)`)};
  }`,Q=n<2?"":(()=>{let D=o.map(te=>`d${te}: u32`).join(", "),F=o.map(te=>`d${te}`).join(", ");return`
  fn get_${e}(${D}) -> ${h} {
    return get_${e}ByIndices(${E(F)});
  }`})(),Z=(...D)=>{if(D.length!==n)throw new Error(`indices length must be ${n}`);let F=D.map(g).join(",");return n===0?M("0u"):n===1?M(F[0]):(_.get=!0,_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}(${F})`)},j=D=>n<2?M(D):(_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}ByIndices(${D})`),re=n<2?"":`
  fn set_${e}ByIndices(indices: ${l.indices}, value: ${h}) {
    ${N(`i2o_${e}(indices)`,"value")}
  }`,ne=n<2?"":(()=>{let D=o.map(te=>`d${te}: u32`).join(", "),F=o.map(te=>`d${te}`).join(", ");return`
  fn set_${e}(${D}, value: ${h}) {
    set_${e}ByIndices(${E(F)}, value);
  }`})();return{impl:()=>{let D=[],F=!1;return _.offsetToIndices&&(D.push(S),F=!0),_.indicesToOffset&&(D.push(I),F=!0),_.broadcastedIndicesToOffset&&(Object.values(P).forEach(te=>D.push(te)),F=!0),_.set&&(D.push(ne),F=!0),_.setByIndices&&(D.push(re),F=!0),_.get&&(D.push(Q),F=!0),_.getByIndices&&(D.push(R),F=!0),!s&&F&&D.unshift(`const ${$} = ${l.indices}(${r.join(",")});`,`const ${w} = ${l.indices}(${B.computeStrides(r).join(",")});`),D.join(`
`)},type:l,offsetToIndices:k,indicesToOffset:C,broadcastedIndicesToOffset:G,indices:E,indicesGet:O,indicesSet:A,set:(...D)=>{if(D.length!==n+1)throw new Error(`indices length must be ${n}`);let F=D[n];if(typeof F!="string")throw new Error("value must be string");let te=D.slice(0,n).map(g).join(",");return n===0?N("0u",F):n===1?N(te[0],F):(_.set=!0,_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}(${te}, ${F})`)},setByOffset:N,setByIndices:(D,F)=>n<2?N(D,F):(_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}ByIndices(${D}, ${F});`),get:Z,getByOffset:M,getByIndices:j,usage:a,name:e,strides:w,shape:$,rank:n}},q=(e,t,r,a=1)=>_r(e,t,r,"input",a),se=(e,t,r,a=1)=>_r(e,t,r,"output",a),Ep=(e,t,r)=>_r(e,t,r,"atomicOutput",1),mn=(e,t,r,a=1)=>_r(e,t,r,"internal",a),vo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=ur){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],a=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||a>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${a}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*a>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${a}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let i=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,s=i?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,n=i?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*a}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${a})
  fn main(${s}) {
    ${n}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",a=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${a}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:a}of this.uniforms)if(a&&a>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(a/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(a/4)}>`);else{let i=a==null||a===1?r:`vec${a}<${r}>`;e.push(`${t}:${i}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},Ip=(e,t)=>new vo(e,t)}),wo,ai,xo,ko,So,To,at,Cp,zp,Nt=Y(()=>{pe(),me(),Le(),ye(),wo=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},ai=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),xo=(e,t)=>B.sortBasedOnPerm(e,ai(e.length,t)),ko=(e,t,r,a)=>{let i=`fn perm(i: ${a.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let s=0;s<t;++s)i+=`a[${e[s]}]=i[${s}];`;return i+="return a;}"},So=(e,t)=>{let r=[],a=[];for(let i=0;i<e.length;++i)e[i]!==1&&r.push(e[i]),e[t[i]]!==1&&a.push(t[i]);return{newShape:r,newPerm:a}},To=(e,t)=>{let r=0;for(let a=0;a<e.length;++a)if(t[e[a]]!==1){if(e[a]<r)return!1;r=e[a]}return!0},at=(e,t)=>{let r=e.dataType,a=e.dims.length,i=ai(a,t),s=xo(e.dims,i),n=e.dims,o=s,d=a<2||To(i,e.dims),p;if(d)return p=_=>{let y=q("input",r,n,4),$=se("output",r,o,4);return`
  ${_.registerUniform("output_size","u32").declareVariables(y,$)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=B.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64/4)},programUniforms:[{type:12,data:Math.ceil(_/4)}]}},getShaderSource:p};let{newShape:h,newPerm:f}=So(e.dims,i),l=B.areEqual(f,[2,3,1]),g=B.areEqual(f,[3,1,2]);if(h.length===2||l||g){n=l?[h[0],h[1]*h[2]]:g?[h[0]*h[1],h[2]]:h,o=[n[1],n[0]];let _=16;return p=y=>{let $=q("a",r,n.length),w=se("output",r,o.length);return`
  ${y.registerUniform("output_size","u32").declareVariables($,w)}
  var<workgroup> tile : array<array<${w.type.value}, ${_+1}>, ${_}>;
  ${y.mainStart([_,_,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${$.getByIndices(`${$.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${w.setByIndices(`${w.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let y=B.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(o[1]/_),y:Math.ceil(o[0]/_)},programUniforms:[{type:12,data:y},...ue(n,o)]}},getShaderSource:p}}return p=_=>{let y=q("a",r,n.length),$=se("output",r,o.length);return`
  ${_.registerUniform("output_size","u32").declareVariables(y,$)}

  ${ko(i,a,y,$)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${$.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${$.setByOffset("global_idx",y.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let _=B.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...ue(n,o)]}},getShaderSource:p}},Cp=(e,t)=>{wo(e.inputs,t.perm),e.compute(at(e.inputs[0],t.perm))},zp=e=>Ae({perm:e.perm})}),Eo,Io,Co,zo,Ao,Oo,Ro,Do,Bo,Mo,st,Ap,Op,Rp,Dp,Bp,Mp,Np,Pp,Up,Vp,Hg=Y(()=>{pe(),me(),ye(),gn(),Nt(),Eo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},Io={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Co={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},zo={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Ao=(e,t)=>{let r=[];for(let a=t-e;a<t;++a)r.push(a);return r},Oo=(e,t)=>{let r=[],a=e.length;for(let s=0;s<a;s++)t.indexOf(s)===-1&&r.push(e[s]);let i=t.map(s=>e[s]);return[r,i]},Ro=(e,t)=>{let r=e.length+t.length,a=[],i=0;for(let s=0;s<r;s++)t.indexOf(s)===-1?a.push(e[i++]):a.push(1);return a},Do=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Bo=(e,t)=>{let r=[];if(!Do(e,t)){for(let a=0;a<t;++a)e.indexOf(a)===-1&&r.push(a);e.forEach(a=>r.push(a))}return r},Mo=(e,t,r,a,i,s,n)=>{let o=r[0].dims,d=B.size(s),p=B.size(n),h=q("_A",r[0].dataType,o),f=se("output",i,s),l=64;d===1&&(l=256);let g=`
          var<workgroup> aBestValues : array<f32, ${l}>;
       `,_=y=>`
        ${y.registerUniform("reduceSize","u32").declareVariables(h,f)}
        ${g}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${y.mainStart(l)}

          let outputIndex = global_idx / ${l};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Co[a]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${l}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${Eo[a]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${l}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${Io[a]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${f.setByOffset("outputIndex",`${a==="mean"?`${f.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${f.type.storage}(${zo[a]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${l}`,inputDependencies:["type"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:s,dataType:i}],dispatchGroup:{x:d},programUniforms:[{type:12,data:p}]})}},st=(e,t,r,a)=>{let i=e.inputs.length===1?r:qi(e.inputs,r),s=i.axes;s.length===0&&!i.noopWithEmptyAxes&&(s=e.inputs[0].dims.map((g,_)=>_));let n=B.normalizeAxes(s,e.inputs[0].dims.length),o=n,d=e.inputs[0],p=Bo(o,e.inputs[0].dims.length);p.length>0&&(d=e.compute(at(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],o=Ao(o.length,d.dims.length));let[h,f]=Oo(d.dims,o),l=h;i.keepDims&&(l=Ro(h,n)),e.compute(Mo(t,i.cacheKey,[d],a,e.inputs[0].dataType,l,f),{inputs:[d]})},Ap=(e,t)=>{st(e,"ReduceMeanShared",t,"mean")},Op=(e,t)=>{st(e,"ReduceL1Shared",t,"l1")},Rp=(e,t)=>{st(e,"ReduceL2Shared",t,"l2")},Dp=(e,t)=>{st(e,"ReduceLogSumExpShared",t,"logSumExp")},Bp=(e,t)=>{st(e,"ReduceMaxShared",t,"max")},Mp=(e,t)=>{st(e,"ReduceMinShared",t,"min")},Np=(e,t)=>{st(e,"ReduceProdShared",t,"prod")},Pp=(e,t)=>{st(e,"ReduceSumShared",t,"sum")},Up=(e,t)=>{st(e,"ReduceSumSquareShared",t,"sumSquare")},Vp=(e,t)=>{st(e,"ReduceLogSumShared",t,"logSum")}}),ot,No,ma,qi,ut,Po,Uo,Vo,Wo,Lo,qo,Ho,Go,Fo,jo,lt,Wp,Lp,qp,Hp,Gp,Fp,jp,Kp,Qp,Zp,gn=Y(()=>{pe(),me(),Le(),ye(),Hg(),ot=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},No=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],ma=(e,t,r,a,i,s,n=!1,o=!1)=>{let d=[],p=r[0].dims,h=p.length,f=B.normalizeAxes(i,h),l=!o&&f.length===0;p.forEach((y,$)=>{l||f.indexOf($)>=0?n&&d.push(1):d.push(y)});let g=d.length,_=B.size(d);return{name:e,shaderCache:t,getShaderSource:y=>{let $=[],w=q("_A",r[0].dataType,h),v=se("output",s,g),S=a(w,v,f),k=S[2];for(let T=0,I=0;T<h;T++)l||f.indexOf(T)>=0?(n&&I++,k=`for(var j${T}: u32 = 0; j${T} < ${p[T]}; j${T}++) {
                  ${S[2].includes("last_index")?`let last_index = j${T};`:""}
                  ${w.indicesSet("input_indices",T,`j${T}`)}
                  ${k}
                }`):($.push(`${w.indicesSet("input_indices",T,v.indicesGet("output_indices",I))};`),I++);return`

        ${y.registerUniform("output_size","u32").declareVariables(w,v)}

        ${y.mainStart()}
          ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${w.type.indices};
          let output_indices = ${v.offsetToIndices("global_idx")};

          ${$.join(`
`)}
          ${S[0]}       // init ops for reduce max/min
          ${S[1]}
          ${k}
          ${S[3]}
          ${S.length===4?v.setByOffset("global_idx","value"):S.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:d,dataType:s}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...ue(p,d)]})}},qi=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),Ae({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},ut=(e,t,r,a)=>{let i=e.inputs,s=i.length===1?r:qi(i,r);e.compute(ma(t,{hint:s.cacheKey,inputDependencies:["rank"]},[i[0]],s.noopWithEmptyAxes&&s.axes.length===0?No:a,s.axes,i[0].dataType,s.keepDims,s.noopWithEmptyAxes),{inputs:[0]})},Po=(e,t)=>{ot(e.inputs),ut(e,"ReduceLogSum",t,(r,a)=>[`var value = ${a.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},Uo=(e,t)=>{ot(e.inputs),ut(e,"ReduceL1",t,(r,a)=>[`var value = ${a.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Vo=(e,t)=>{ot(e.inputs),ut(e,"ReduceL2",t,(r,a)=>[`var t = ${a.type.value}(0); var value = ${a.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Wo=(e,t)=>{ot(e.inputs),ut(e,"ReduceLogSumExp",t,(r,a)=>[`var value = ${a.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Lo=(e,t)=>{ot(e.inputs),ut(e,"ReduceMax",t,(r,a,i)=>{let s=[];for(let n=0;n<r.rank;n++)(i.indexOf(n)>=0||i.length===0)&&s.push(r.indicesSet("input_indices",n,0));return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},qo=(e,t)=>{ot(e.inputs),ut(e,"ReduceMean",t,(r,a,i)=>{let s=1;for(let n=0;n<r.rank;n++)(i.indexOf(n)>=0||i.length===0)&&(s*=e.inputs[0].dims[n]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${a.type.value}(sum / ${s});`]})},Ho=(e,t)=>{ot(e.inputs),ut(e,"ReduceMin",t,(r,a,i)=>{let s=[];for(let n=0;n<r.rank;n++)(i.indexOf(n)>=0||i.length===0)&&s.push(`input_indices[${n}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Go=(e,t)=>{ot(e.inputs),ut(e,"ReduceProd",t,(r,a)=>[`var value = ${a.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Fo=(e,t)=>{ot(e.inputs),ut(e,"ReduceSum",t,(r,a)=>[`var value = ${a.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},jo=(e,t)=>{ot(e.inputs),ut(e,"ReduceSumSquare",t,(r,a)=>[`var t = ${a.type.value}(0); var value = ${a.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},lt=(e,t,r)=>{if(t.length===0)return r;let a=1,i=1;for(let s=0;s<t.length;s++)t.indexOf(s)===-1?a*=e[s]:i*=e[s];return i<32&&a>1024},Wp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?qo(e,t):Ap(e,t)},Lp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Uo(e,t):Op(e,t)},qp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Vo(e,t):Rp(e,t)},Hp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Wo(e,t):Dp(e,t)},Gp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Lo(e,t):Bp(e,t)},Fp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ho(e,t):Mp(e,t)},jp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Go(e,t):Np(e,t)},Kp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Fo(e,t):Pp(e,t)},Qp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?jo(e,t):Up(e,t)},Zp=(e,t)=>{lt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Po(e,t):Vp(e,t)}}),ii,Yp,Xp,Hi,Gg=Y(()=>{pe(),Le(),gn(),ii=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Yp=(e,t)=>{ii(e.inputs);let r=(a,i,s)=>{let n=[];for(let o=0;o<a.rank;o++)(s.indexOf(o)>=0||s.length===0)&&n.push(`input_indices[${o}] = 0;`);return[`${n.join(`
`)}`,`var value = ${a.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${a.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${a.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",i.setByOffset("global_idx","best_index")]};e.compute(ma("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Xp=(e,t)=>{ii(e.inputs);let r=(a,i,s)=>{let n=[];for(let o=0;o<a.rank;o++)(s.indexOf(o)>=0||s.length===0)&&n.push(`input_indices[${o}] = 0;`);return[`${n.join(`
`)}`,`var value = ${a.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${a.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${a.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",i.setByOffset("global_idx","best_index")]};e.compute(ma("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Hi=e=>Ae(e)}),Ko,Xr,Qo,Zo,Yo,Ar,Xo,Jp,_n=Y(()=>{pe(),me(),fn(),ye(),Ko=(e,t)=>{let r=e[0],a=e[1],i=e[2],s=e[3],n=e[4],o=e[5];if(n&&o)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let d=r.dims[0],p=r.dims[1],h=r.dims[2];if(i.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(a.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(a.dims[0]!==h)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(i.dims[0]!==a.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let f=i.dims[0]/3,l=f,g=l;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let S of t.qkvHiddenSizes)if(S%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");f=t.qkvHiddenSizes[0],l=t.qkvHiddenSizes[1],g=t.qkvHiddenSizes[2]}let _=p;if(f!==l)throw new Error("qkv_hidden_sizes first element should be same as the second");if(i.dims[0]!==f+l+g)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let y=0;if(n){if(l!==g)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(n.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(n.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(n.dims[1]!==d)throw new Error('Input "past" second dimension must be batch_size');if(n.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(n.dims[4]!==l/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(y=n.dims[3])}let $=_+y,w=-1,v=0;if(s)throw new Error("Mask not supported");if(n)throw new Error("past is not supported");if(o){if(o.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(o.dims[0]!==d||o.dims[1]!==t.numHeads||o.dims[2]!==p||o.dims[3]!==$)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:d,sequenceLength:p,pastSequenceLength:y,kvSequenceLength:_,totalSequenceLength:$,maxSequenceLength:w,inputHiddenSize:h,hiddenSize:f,vHiddenSize:g,headSize:Math.floor(f/t.numHeads),vHeadSize:Math.floor(g/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:v,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Xr=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e==null?void 0:e.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Qo=(e,t,r,a,i,s,n,o)=>{let d=Me(n?1:s),p=64,h=s/d;h<p&&(p=32);let f=Math.ceil(s/d/p),l=[{type:12,data:t},{type:12,data:r},{type:12,data:a},{type:12,data:i},{type:12,data:h},{type:12,data:f}],g=je(e.dataType,d),_=Ze(1,d),y=["type"];n&&y.push("type"),o&&y.push("type");let $=w=>{let v=se("x",e.dataType,e.dims,d),S=[v],k=n?q("seq_lens",n.dataType,n.dims):void 0;k&&S.push(k);let T=o?q("total_sequence_length_input",o.dataType,o.dims):void 0;T&&S.push(T);let I=Ze(e.dataType),C=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${w.registerUniforms(C).declareVariables(...S)}
  ${w.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Xr(k,T,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${n?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${_}(-3.402823e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${_}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(d){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.402823e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${_}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${_}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(d){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${v.type.value}(${I}(1.0) / ${I}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${_}(x[offset + i]);
        x[offset + i] = ${v.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${n?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${v.type.value}(${I}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${g};${d}`,inputDependencies:y},getShaderSource:$,getRunData:()=>({outputs:[],dispatchGroup:{x:Math.ceil(s/p),y:i,z:t*r},programUniforms:l})}},Zo=(e,t,r,a,i,s,n,o,d)=>{let p=n+s.kvSequenceLength,h=[s.batchSize,s.numHeads,s.sequenceLength,p],f=e>1&&a,l=s.kvNumHeads?s.kvNumHeads:s.numHeads,g=f?[s.batchSize,l,p,s.headSize]:void 0,_=s.nReps?s.nReps:1,y=s.scale===0?1/Math.sqrt(s.headSize):s.scale,$=Me(s.headSize),w=s.headSize/$,v=12,S={x:Math.ceil(p/v),y:Math.ceil(s.sequenceLength/v),z:s.batchSize*s.numHeads},k=[{type:12,data:s.sequenceLength},{type:12,data:w},{type:12,data:p},{type:12,data:s.numHeads},{type:12,data:s.headSize},{type:1,data:y},{type:12,data:n},{type:12,data:s.kvSequenceLength},{type:12,data:_}],T=f&&a&&B.size(a.dims)>0,I=["type","type"];T&&I.push("type"),i&&I.push("type"),o&&I.push("type"),d&&I.push("type");let C=[{dims:h,dataType:t.dataType,gpuDataType:0}];f&&C.push({dims:g,dataType:t.dataType,gpuDataType:0});let E=O=>{let A=q("q",t.dataType,t.dims,$),P=q("key",r.dataType,r.dims,$),G=[A,P];if(T){let re=q("past_key",a.dataType,a.dims,$);G.push(re)}i&&G.push(q("attention_bias",i.dataType,i.dims));let N=o?q("seq_lens",o.dataType,o.dims):void 0;N&&G.push(N);let M=d?q("total_sequence_length_input",d.dataType,d.dims):void 0;M&&G.push(M);let R=se("output",t.dataType,h),Q=[R];f&&Q.push(se("present_key",t.dataType,g,$));let Z=Ze(1,$),j=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${v}u;

  var<workgroup> tileQ: array<${A.type.storage}, ${v*v}>;
  var<workgroup> tileK: array<${A.type.storage}, ${v*v}>;
  ${O.registerUniforms(j).declareVariables(...G,...Q)}
  ${O.mainStart([v,v,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${_===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${_===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Xr(N,M,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${T&&f?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${f?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${Z}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${T&&f?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${f?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${Z}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch($){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${$}`)}})()};
        output[outputIdx] = ${R.type.value} (sum * uniforms.alpha) + ${i?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${$};${i!==void 0};${a!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:C,dispatchGroup:S,programUniforms:k}),getShaderSource:E}},Yo=(e,t,r,a,i,s,n=void 0,o=void 0)=>{let d=s+i.kvSequenceLength,p=i.nReps?i.nReps:1,h=i.vHiddenSize*p,f=e>1&&a,l=i.kvNumHeads?i.kvNumHeads:i.numHeads,g=f?[i.batchSize,l,d,i.headSize]:void 0,_=[i.batchSize,i.sequenceLength,h],y=12,$={x:Math.ceil(i.vHeadSize/y),y:Math.ceil(i.sequenceLength/y),z:i.batchSize*i.numHeads},w=[{type:12,data:i.sequenceLength},{type:12,data:d},{type:12,data:i.vHeadSize},{type:12,data:i.numHeads},{type:12,data:i.headSize},{type:12,data:h},{type:12,data:s},{type:12,data:i.kvSequenceLength},{type:12,data:p}],v=f&&a&&B.size(a.dims)>0,S=["type","type"];v&&S.push("type"),n&&S.push("type"),o&&S.push("type");let k=[{dims:_,dataType:t.dataType,gpuDataType:0}];f&&k.push({dims:g,dataType:t.dataType,gpuDataType:0});let T=I=>{let C=q("probs",t.dataType,t.dims),E=q("v",r.dataType,r.dims),O=[C,E];v&&O.push(q("past_value",a.dataType,a.dims));let A=n?q("seq_lens",n.dataType,n.dims):void 0;n&&O.push(A);let P=o?q("total_sequence_length_input",o.dataType,o.dims):void 0;o&&O.push(P);let G=[se("output",t.dataType,_)];f&&G.push(se("present_value",t.dataType,g));let N=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${y}u;
  var<workgroup> tileQ: array<${C.type.value}, ${y*y}>;
  var<workgroup> tileV: array<${C.type.value}, ${y*y}>;
  ${I.registerUniforms(N).declareVariables(...O,...G)}
  ${I.mainStart([y,y,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Xr(A,P,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${v&&f?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${f?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${C.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${v&&f?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${f?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${a!==void 0};${e}`,inputDependencies:S},getRunData:()=>({outputs:k,dispatchGroup:$,programUniforms:w}),getShaderSource:T}},Ar=(e,t,r,a,i,s,n,o,d,p,h=void 0,f=void 0)=>{let l=Math.min(e.outputCount,1+(n?1:0)+(o?1:0)),g=l>1?p.pastSequenceLength:0,_=g+p.kvSequenceLength,y=d&&B.size(d.dims)>0?d:void 0,$=[t,r];l>1&&n&&B.size(n.dims)>0&&$.push(n),y&&$.push(y),h&&$.push(h),f&&$.push(f);let w=e.compute(Zo(l,t,r,n,y,p,g,h,f),{inputs:$,outputs:l>1?[-1,1]:[-1]})[0];e.compute(Qo(w,p.batchSize,p.numHeads,g,p.sequenceLength,_,h,f),{inputs:h&&f?[w,h,f]:[w],outputs:[]});let v=[w,a];l>1&&o&&B.size(o.dims)>0&&v.push(o),h&&v.push(h),f&&v.push(f),e.compute(Yo(l,w,a,o,p,g,h,f),{inputs:v,outputs:l>1?[0,2]:[0]})},Xo=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],a=t.sequenceLength,i=t.inputHiddenSize,s=t.headSize,n=12,o={x:Math.ceil(t.headSize/n),y:Math.ceil(t.sequenceLength/n),z:t.batchSize*t.numHeads},d=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:a},{type:12,data:i},{type:12,data:s},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],h=f=>{let l=se("output_q",d[0].dataType,r),g=se("output_k",d[0].dataType,r),_=se("output_v",d[0].dataType,r),y=q("input",d[0].dataType,d[0].dims),$=q("weight",d[1].dataType,d[1].dims),w=q("bias",d[2].dataType,d[2].dims),v=y.type.storage,S=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${n}u;
  var<workgroup> tileInput: array<${v}, ${n*n}>;
  var<workgroup> tileWeightQ: array<${v}, ${n*n}>;
  var<workgroup> tileWeightK: array<${v}, ${n*n}>;
  var<workgroup> tileWeightV: array<${v}, ${n*n}>;
  ${f.registerUniforms(S).declareVariables(y,$,w,l,g,_)}
  ${f.mainStart([n,n,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${v}(0);
    var valueK = ${v}(0);
    var valueV = ${v}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:o,programUniforms:p}),getShaderSource:h},{inputs:d,outputs:[-1,-1,-1]})},Jp=(e,t)=>{let r=Ko(e.inputs,t),[a,i,s]=Xo(e,r);return Ar(e,a,i,s,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),Jo,eu,tu,ec,Fg=Y(()=>{ht(),pe(),me(),Le(),ye(),Jo=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(a,i,s)=>{let n=i.length;if(n!==a.length)throw new Error(`${s}: num dimensions != ${n}`);i.forEach((o,d)=>{if(o!==a[d])throw new Error(`${s}: dim[${d}] do not match`)})};if(e[0].dims.length>1){let a=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,a,"Invalid input scale"),r(e[2].dims,a,"Invalid input B"),r(e[3].dims,a,"Invalid input mean"),r(e[4].dims,a,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},eu=(e,t)=>{let{epsilon:r,spatial:a,format:i}=t,s=e[0].dims,n=a?Me(s[s.length-1]):1,o=i==="NHWC"&&s.length>1?n:1,d=B.size(s)/n,p=a,h=p?s.length:s,f=q("x",e[0].dataType,e[0].dims,n),l=q("scale",e[1].dataType,e[1].dims,o),g=q("bias",e[2].dataType,e[2].dims,o),_=q("inputMean",e[3].dataType,e[3].dims,o),y=q("inputVar",e[4].dataType,e[4].dims,o),$=se("y",e[0].dataType,h,n),w=()=>{let S="";if(a)S=`let cOffset = ${s.length===1?"0u":i==="NHWC"?`outputIndices[${s.length-1}] / ${n}`:"outputIndices[1]"};`;else if(i==="NCHW")S=`
            ${$.indicesSet("outputIndices","0","0")}
            let cOffset = ${$.indicesToOffset("outputIndices")};`;else{S=`var cIndices = ${l.type.indices}(0);
                       cIndices[0] = outputIndices[${s.length-1}];`;for(let k=1;k<l.rank;k++)S+=`cIndices[${k}] = outputIndices[${k}];`;S+=`let cOffset = ${l.indicesToOffset("cIndices")};`}return S},v=S=>`
  const epsilon = ${r};
  ${S.registerUniform("outputSize","u32").declareVariables(f,l,g,_,y,$)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${$.offsetToIndices(`global_idx * ${n}`)};
    ${w()}
    let scale = ${l.getByOffset("cOffset")};
    let bias = ${g.getByOffset("cOffset")};
    let inputMean = ${_.getByOffset("cOffset")};
    let inputVar = ${y.getByOffset("cOffset")};
    let x = ${f.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${$.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${a}_${n}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:v,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p?[{type:12,data:d},...ue(s)]:[{type:12,data:d}]})}},tu=e=>Ae(e),ec=(e,t)=>{let{inputs:r,outputCount:a}=e,i=tu({...t,outputCount:a});if(De.webgpu.validateInputContent&&Jo(r,i),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(eu(r,i))}}),ru,au,tc,jg=Y(()=>{me(),ye(),ru=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},au=e=>{let t=e[0].dims,r=e[0].dims[2],a=B.size(t)/4,i=e[0].dataType,s=q("input",i,t,4),n=q("bias",i,[r],4),o=q("residual",i,t,4),d=se("output",i,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(s,n,o,d)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(a)}
    let value = ${s.getByOffset("global_idx")}
      + ${n.getByOffset("global_idx % channels")} + ${o.getByOffset("global_idx")};
    ${d.setByOffset("global_idx","value")}
  }`}},tc=e=>{ru(e.inputs),e.compute(au(e.inputs))}}),iu,Ee,rc,ac,ic,nc,sc,oc,uc,lc,dc,nu,pc,cc,hc,fc,Er,mc,sa,gc,_c,yc,bc,$c,vc,wc,xc,kc,Sc,Tc,Ec,Ic,Cc,zc,Ac,ni,Oc,Gi,Fi,Rc,Dc,Bc,su,ou,Mc,yn=Y(()=>{pe(),me(),Le(),ye(),iu=(e,t,r,a,i,s,n)=>{let o=Math.ceil(t/4),d="";typeof i=="string"?d=`${i}(a)`:d=i("a");let p=q("inputData",r,[o],4),h=se("outputData",a,[o],4),f=[{name:"vec_size",type:"u32"}];return n&&f.push(...n),`
      ${e.registerUniforms(f).declareVariables(p,h)}

  ${s??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${h.setByOffset("global_idx",d)}
  }`},Ee=(e,t,r,a,i,s=e.dataType,n,o)=>{let d=[{type:12,data:Math.ceil(B.size(e.dims)/4)}];return n&&d.push(...n),{name:t,shaderCache:{hint:i,inputDependencies:["type"]},getShaderSource:p=>iu(p,B.size(e.dims),e.dataType,s,r,a,o),getRunData:p=>({outputs:[{dims:e.dims,dataType:s}],dispatchGroup:{x:Math.ceil(B.size(p[0].dims)/64/4)},programUniforms:d})}},rc=e=>{e.compute(Ee(e.inputs[0],"Abs","abs"))},ac=e=>{e.compute(Ee(e.inputs[0],"Acos","acos"))},ic=e=>{e.compute(Ee(e.inputs[0],"Acosh","acosh"))},nc=e=>{e.compute(Ee(e.inputs[0],"Asin","asin"))},sc=e=>{e.compute(Ee(e.inputs[0],"Asinh","asinh"))},oc=e=>{e.compute(Ee(e.inputs[0],"Atan","atan"))},uc=e=>{e.compute(Ee(e.inputs[0],"Atanh","atanh"))},lc=e=>Ae(e),dc=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(Ee(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},nu=e=>{let t,r,a=e.length>=2&&e[1].data!==0,i=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=a?e[1].getFloat32Array()[0]:-34028234663852886e22,r=i?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=a?e[1].getUint16Array()[0]:64511,r=i?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return Ae({min:t,max:r})},pc=(e,t)=>{let r=t||nu(e.inputs),a=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"Clip",i=>`clamp(${i}, vec4<${a}>(uniforms.min), vec4<${a}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:a},{name:"max",type:a}]),{inputs:[0]})},cc=e=>{e.compute(Ee(e.inputs[0],"Ceil","ceil"))},hc=e=>{e.compute(Ee(e.inputs[0],"Cos","cos"))},fc=e=>{e.compute(Ee(e.inputs[0],"Cosh","cosh"))},Er=e=>Ae(e),mc=(e,t)=>{let r=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"Elu",a=>`elu_vf32(${a})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},sa=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,gc=e=>{let t=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,sa(t)))},_c=e=>{e.compute(Ee(e.inputs[0],"Exp","exp"))},yc=e=>{e.compute(Ee(e.inputs[0],"Floor","floor"))},bc=e=>{let t=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,sa(t)))},$c=(e,t)=>{let r=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"LeakyRelu",a=>`select(leaky_relu_alpha_ * ${a}, ${a}, ${a} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},vc=e=>{e.compute(Ee(e.inputs[0],"Not",t=>`!${t}`))},wc=e=>{e.compute(Ee(e.inputs[0],"Neg",t=>`-${t}`))},xc=e=>{e.compute(Ee(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},kc=e=>{let t=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},Sc=e=>{e.compute(Ee(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Tc=e=>Ae(e),Ec=(e,t)=>{let r=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"HardSigmoid",a=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${a} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Ic=e=>{e.compute(Ee(e.inputs[0],"Sin","sin"))},Cc=e=>{e.compute(Ee(e.inputs[0],"Sinh","sinh"))},zc=e=>{e.compute(Ee(e.inputs[0],"Sqrt","sqrt"))},Ac=e=>{e.compute(Ee(e.inputs[0],"Tan","tan"))},ni=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Oc=e=>{e.compute(Ee(e.inputs[0],"Tanh",ni))},Gi=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${ni("v")};
}
`,Fi=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Rc=e=>{let t=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"FastGelu",Fi,Gi(t),void 0,e.inputs[0].dataType))},Dc=(e,t)=>{let r=Ze(e.inputs[0].dataType);return e.compute(Ee(e.inputs[0],"ThresholdedRelu",a=>`select(vec4<${r}>(0.0), ${a}, ${a} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Bc=e=>{e.compute(Ee(e.inputs[0],"Log","log"))},su=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,ou=e=>`quick_gelu_impl(${e})`,Mc=(e,t)=>{let r=Ze(e.inputs[0].dataType);e.compute(Ee(e.inputs[0],"QuickGelu",ou,su(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),uu,lu,Nc,Kg=Y(()=>{me(),ye(),yn(),uu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},lu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=q("input",e[0].dataType,e[0].dims,4),a=q("bias",e[0].dataType,[e[0].dims[2]],4),i=se("output",e[0].dataType,t,4),s=B.size(t)/4,n=je(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)}}),getShaderSource:o=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${o.declareVariables(r,a,i)}

  ${sa(n)}

  ${o.mainStart()}
    ${o.guardAgainstOutOfBoundsWorkgroupSizes(s)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${i.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Nc=e=>{uu(e.inputs),e.compute(lu(e.inputs))}}),du,pu,dt,Pc,Uc,Vc,Wc,Lc,qc,Hc,Gc,Fc,jc,Qg=Y(()=>{pe(),me(),ye(),du=(e,t,r,a,i,s,n,o,d,p,h,f)=>{let l,g;typeof o=="string"?l=g=(v,S)=>`${o}((${v}),(${S}))`:typeof o=="function"?l=g=o:(l=o.scalar,g=o.vector);let _=se("outputData",h,a.length,4),y=q("aData",d,t.length,4),$=q("bData",p,r.length,4),w;if(i)if(s){let v=B.size(t)===1,S=B.size(r)===1,k=t.length>0&&t[t.length-1]%4===0,T=r.length>0&&r[r.length-1]%4===0;v||S?w=_.setByOffset("global_idx",g(v?`${y.type.value}(${y.getByOffset("0")}.x)`:y.getByOffset("global_idx"),S?`${$.type.value}(${$.getByOffset("0")}.x)`:$.getByOffset("global_idx"))):w=`
            let outputIndices = ${_.offsetToIndices("global_idx * 4u")};
            let offsetA = ${y.broadcastedIndicesToOffset("outputIndices",_)};
            let offsetB = ${$.broadcastedIndicesToOffset("outputIndices",_)};
            ${_.setByOffset("global_idx",g(n||k?y.getByOffset("offsetA / 4u"):`${y.type.value}(${y.getByOffset("offsetA / 4u")}[offsetA % 4u])`,n||T?$.getByOffset("offsetB / 4u"):`${$.type.value}(${$.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else w=_.setByOffset("global_idx",g(y.getByOffset("global_idx"),$.getByOffset("global_idx")));else{if(!s)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let v=(S,k,T="")=>{let I=`aData[indexA${k}][componentA${k}]`,C=`bData[indexB${k}][componentB${k}]`;return`
            let outputIndices${k} = ${_.offsetToIndices(`global_idx * 4u + ${k}u`)};
            let offsetA${k} = ${y.broadcastedIndicesToOffset(`outputIndices${k}`,_)};
            let offsetB${k} = ${$.broadcastedIndicesToOffset(`outputIndices${k}`,_)};
            let indexA${k} = offsetA${k} / 4u;
            let indexB${k} = offsetB${k} / 4u;
            let componentA${k} = offsetA${k} % 4u;
            let componentB${k} = offsetB${k} % 4u;
            ${S}[${k}] = ${T}(${l(I,C)});
          `};h===9?w=`
            var data = vec4<u32>(0);
            ${v("data",0,"u32")}
            ${v("data",1,"u32")}
            ${v("data",2,"u32")}
            ${v("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:w=`
            ${v("outputData[global_idx]",0)}
            ${v("outputData[global_idx]",1)}
            ${v("outputData[global_idx]",2)}
            ${v("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(y,$,_)}

        ${f??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${w}
      }`},pu=(e,t,r,a,i,s,n=r.dataType)=>{let o=r.dims.map(y=>Number(y)??1),d=a.dims.map(y=>Number(y)??1),p=!B.areEqual(o,d),h=o,f=B.size(o),l=!1,g=!1,_=[p];if(p){let y=or.calcShape(o,d,!1);if(!y)throw new Error("Can't perform binary op on the given tensors");h=y.slice(),f=B.size(h);let $=B.size(o)===1,w=B.size(d)===1,v=o.length>0&&o[o.length-1]%4===0,S=d.length>0&&d[d.length-1]%4===0;_.push($),_.push(w),_.push(v),_.push(S);let k=1;for(let T=1;T<h.length;T++){let I=o[o.length-T],C=d[d.length-T];if(I===C)k*=I;else break}k%4===0?(g=!0,l=!0):($||w||v||S)&&(l=!0)}else l=!0;return _.push(l),{name:e,shaderCache:{hint:t+_.map(y=>y.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:y=>du(y,o,d,h,l,p,g,i,r.dataType,a.dataType,n,s),getRunData:()=>({outputs:[{dims:h,dataType:n}],dispatchGroup:{x:Math.ceil(f/64/4)},programUniforms:[{type:12,data:Math.ceil(B.size(h)/4)},...ue(o,d,h)]})}},dt=(e,t,r,a,i,s)=>{e.compute(pu(t,i??"",e.inputs[0],e.inputs[1],r,a,s))},Pc=e=>{dt(e,"Add",(t,r)=>`${t}+${r}`)},Uc=e=>{dt(e,"Div",(t,r)=>`${t}/${r}`)},Vc=e=>{dt(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Wc=e=>{dt(e,"Mul",(t,r)=>`${t}*${r}`)},Lc=e=>{let t=q("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;dt(e,"Pow",{scalar:(r,a)=>`pow_custom(${r},${a})`,vector:(r,a)=>`pow_vector_custom(${r},${a})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},qc=e=>{dt(e,"Sub",(t,r)=>`${t}-${r}`)},Hc=e=>{dt(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Gc=e=>{dt(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Fc=e=>{dt(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},jc=e=>{dt(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),cu,hu,fu,mu,Kc,Qc,Zg=Y(()=>{pe(),me(),Le(),ye(),cu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,a=e[r],i=a.dataType,s=a.dims.length;e.forEach((n,o)=>{if(o!==r){if(n.dataType!==i)throw new Error("input tensors should be one type");if(n.dims.length!==s)throw new Error("input tensors should have the same shape");n.dims.forEach((d,p)=>{if(p!==t&&d!==a.dims[p])throw new Error("non concat dimensions must match")})}})},hu=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,fu=(e,t)=>{let r=e.length,a=[];for(let i=0;i<r;++i){let s=t.setByOffset("global_idx",e[i].getByIndices("indices"));r===1?a.push(s):i===0?a.push(`if (inputIndex == ${i}u) { ${s} }`):i===r-1?a.push(`else { ${s} }`):a.push(`else if (inputIndex == ${i}) { ${s} }`)}return a.join(`
`)},mu=(e,t,r,a)=>{let i=B.size(r),s=new Array(e.length),n=new Array(e.length),o=0,d=[],p=[],h=[{type:12,data:i}];for(let y=0;y<e.length;++y)o+=e[y].dims[t],s[y]=o,p.push(e[y].dims.length),n[y]=q(`input${y}`,a,p[y]),d.push("rank"),h.push({type:12,data:s[y]});for(let y=0;y<e.length;++y)h.push(...ue(e[y].dims));h.push(...ue(r));let f=se("output",a,r.length),l=f.indicesGet("indices",t),g=Array.from(Array(s.length).keys()).map(y=>`uniforms.sizeInConcatAxis${y}`).join(","),_=y=>`

  ${(()=>{y.registerUniform("outputSize","u32");for(let $=0;$<e.length;$++)y.registerUniform(`sizeInConcatAxis${$}`,"u32");return y.declareVariables(...n,f)})()}

  ${hu(s.length,g)}

  ${y.mainStart()}
    ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${f.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${l});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${s.length}u>(${g});
      ${l} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${fu(n,f)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:r,dataType:a}],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:h}),getShaderSource:_}},Kc=(e,t)=>{let r=e.inputs,a=r[0].dims,i=B.normalizeAxis(t.axis,a.length);cu(r,i);let s=a.slice();s[i]=r.reduce((o,d)=>o+(d.dims.length>i?d.dims[i]:0),0);let n=r.filter(o=>B.size(o.dims)>0);e.compute(mu(n,i,s,r[0].dataType),{inputs:n})},Qc=e=>Ae({axis:e.axis})}),Kt,Qt,Zt,bn,Xt=Y(()=>{pe(),me(),Kt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Qt=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Zt=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},bn=e=>{let t=(e==null?void 0:e.activation)||"";if(t==="HardSigmoid"){let[r,a]=(e==null?void 0:e.activation_params)||[.2,.5];return{activation:t,alpha:r,beta:a}}else if(t==="Clip"){let[r,a]=(e==null?void 0:e.activation_params)||[Sp,Tp];return{activation:t,clipMax:a,clipMin:r}}else if(t==="LeakyRelu"){let[r]=(e==null?void 0:e.activation_params)||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ke,Zc,$n=Y(()=>{Ke=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},Zc=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),Yc,Yg=Y(()=>{Yc=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),Cr,vn,wn=Y(()=>{pe(),me(),ye(),Xt(),Cr=(e,t,r,a,i)=>{let s=a-r;return`
      ${Array.from({length:r}).map((n,o)=>`
      if (${oe(t.shape,o,t.rank)} != 1) {
        ${t.indicesSet(e,o,oe(i,o+s,a))}
      } else {
        ${t.indicesSet(e,o,0)}
      }`).join("")}
`},vn=(e,t,r,a,i=!1,s)=>{let n=e[0].dims,o=e[1].dims,d=n[n.length-2],p=o[o.length-1],h=n[n.length-1],f=Me(p),l=Me(h),g=Me(d),_=B.size(r)/f/g,y=e.length>2,$=a?a.slice(0,-2):r.slice(0,-2),w=[B.size($),d,p],v=[{type:12,data:_},{type:12,data:d},{type:12,data:p},{type:12,data:h}];Qt(t,v),v.push(...ue($,n,o)),y&&v.push(...ue(e[2].dims)),v.push(...ue(w));let S=k=>{let T=mn("batch_dims",e[0].dataType,$.length),I=q("a",e[0].dataType,n.length,l),C=q("b",e[1].dataType,o.length,f),E=se("output",e[0].dataType,w.length,f),O=je(E.type.tensor),A=Kt(t,E.type.value,O),P=[I,C],G="";if(y){let R=i?f:1;P.push(q("bias",e[2].dataType,e[2].dims.length,R)),G=`${i?`value += bias[col / ${R}];`:`value += ${E.type.value}(bias[row + i]);`}`}let N=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Zt(t,N);let M=()=>{let R=`var a_data: ${I.type.value};`;for(let Q=0;Q<l;Q++)R+=`
              let b_data${Q} = b[(b_offset + (k + ${Q}) * uniforms.N + col) / ${f}];`;for(let Q=0;Q<g;Q++){R+=`a_data = a[(a_offset + (row + ${Q}) * uniforms.K + k) / ${l}];`;for(let Z=0;Z<l;Z++)R+=`
            values[${Q}] = fma(${C.type.value}(a_data${l===1?"":`[${Z}]`}), b_data${Z}, values[${Q}]);
`}return R};return`
  ${k.registerUniforms(N).registerInternalVariables(T).declareVariables(...P,E)}
  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${f})) * ${f};
    var index1 = global_idx / (uniforms.N / ${f});
    let stride1 = uniforms.M / ${g};
    let row = (index1 % stride1) * ${g};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${T.offsetToIndices("batch")};`}

    var a_indices: ${I.type.indices};
    ${Cr("a_indices",I,I.rank-2,T.rank,"batch_indices")}
    ${I.indicesSet("a_indices",I.rank-2,0)}
    ${I.indicesSet("a_indices",I.rank-1,0)}
    let a_offset = ${I.indicesToOffset("a_indices")};

    var b_indices: ${C.type.indices};
    ${Cr("b_indices",C,C.rank-2,T.rank,"batch_indices")}
    ${C.indicesSet("b_indices",C.rank-2,0)}
    ${C.indicesSet("b_indices",C.rank-1,0)}
    let b_offset = ${C.indicesToOffset("b_indices")};
    var values: array<${E.type.value}, ${g}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${l}) {
      ${M()}
    }
    for (var i = 0u; i < ${g}u; i++) {
      var value = values[i];
      ${G}
      ${A}
      let cur_indices = ${E.type.indices}(batch, row + i, col);
      let offset = ${E.indicesToOffset("cur_indices")};
      ${E.setByOffset(`offset / ${f}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${f};${l};${g};${i}`,inputDependencies:y?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:v}),getShaderSource:S}}}),gu,_u,ji,si,yu,Ki,bu,ga,xn=Y(()=>{pe(),me(),ye(),Xt(),wn(),$n(),gu=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,_u=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,ji=(e,t,r="f32",a,i=!1,s=32,n=!1,o=32)=>{let d=t[1]*e[1],p=t[0]*e[0],h=i?d:s,f=i?s:d,l=h/t[0],g=s/t[1];if(!((i&&l===4&&e[1]===4||!i&&(l===3||l===4))&&h%t[0]===0&&s%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${i} is true, innerElementSize ${l} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${l} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${s} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${l}<${r}>, ${h/l}>, ${f}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${s}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${l};
const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${n?"0":"i32(globalId.z)"};
  ${a?`let batchIndices = ${a.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${d};

  let num_tiles = ${n?`${Math.ceil(o/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${n?`i32(globalId.z) * ${o}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${g};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${gu(i,a)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${g}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${a?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${l===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${_u(i,l)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},si=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,yu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ki=(e,t,r="f32",a,i=!1,s=32,n=!1,o=32,d=!1)=>{let p=e[1]*t[1],h=e[0]*t[0],f=i?p:s,l=i?s:p;if(!(l%t[1]===0&&f%t[0]===0&&s%t[1]===0))throw new Error(`tileAHight ${l} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${f} must be divisible by workgroupSize[0]${t[0]}, tileInner ${s} must be divisible by workgroupSize[1]${t[1]}`);let g=l/t[1],_=f/t[0],y=s/t[1],$=d?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${l}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${f}; inputCol = inputCol + ${t[0]}) {
          ${si(i,a)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${s}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${a?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${i?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${g};
let tileColA = i32(localId.x) * ${_};
let tileRowB = i32(localId.y) * ${y};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${g}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${_}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${si(i,a)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${a?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${yu(i)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${f}>, ${l}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${s}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${n?"0":"i32(globalId.z)"};
    ${a?`let batchIndices = ${a.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${n?`${Math.ceil(o/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${n?`i32(globalId.z) * ${o}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${$}
  }
`},bu=(e,t,r,a,i=!1)=>{let[s,n,o,d]=a,p=je(a[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Ke(e,p)} {
      var value = ${Ke(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${n.type.indices};
        ${Cr("aIndices",n,n.rank-2,s.rank,"batchIndices")}
        ${n.indicesSet("aIndices",n.rank-2,"u32(row)")}
        ${n.indicesSet("aIndices",n.rank-1,"u32(colIn)")}
        value = ${n.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Ke(e,p)} {
      var value = ${Ke(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${o.type.indices};
        ${Cr("bIndices",o,o.rank-2,s.rank,"batchIndices")}
        ${o.indicesSet("bIndices",o.rank-2,"u32(row)")}
        ${o.indicesSet("bIndices",o.rank-1,"u32(colIn)")}
        value = ${o.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ke(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${i?"bias[colIn]":`${Ke(e,p)}(bias[row])`};`:""}
        ${r}
        ${d.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},ga=(e,t,r,a,i=!1,s)=>{let n=e[0].dims,o=e[1].dims,d=n.slice(0,-2),p=o.slice(0,-2),h=a?a.slice(0,-2):r.slice(0,-2),f=B.size(h),l=n[n.length-2],g=n[n.length-1],_=o[o.length-1],y=g%4===0&&_%4===0,$=l<=8?[4,1,1]:[4,4,1],w=[8,8,1],v=[Math.ceil(_/w[0]/$[0]),Math.ceil(l/w[1]/$[1]),Math.ceil(f/w[2]/$[2])],S=y?4:1,k=[...d,l,g/S],T=k.length,I=[...p,g,_/S],C=I.length,E=[f,l,_/S],O=[{type:6,data:l},{type:6,data:_},{type:6,data:g}];Qt(t,O),O.push(...ue(h,k,I));let A=["rank","rank"],P=e.length>2;P&&(O.push(...ue(e[2].dims)),A.push("rank")),O.push(...ue(E));let G=N=>{let M=h.length,R=mn("batchDims",e[0].dataType,M,1),Q=je(e[0].dataType),Z=q("a",e[0].dataType,T,S),j=q("b",e[1].dataType,C,S),re=se("result",e[0].dataType,E.length,S),ne=[Z,j];if(P){let $e=i?S:1;ne.push(q("bias",e[2].dataType,e[2].dims.length,$e))}let D=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Zt(t,D);let F=je(re.type.tensor),te=Kt(t,re.type.value,F),ce=bu(S,P,te,[R,Z,j,re],i);return`
  ${N.registerUniforms(D).registerInternalVariables(R).declareVariables(...ne,re)}
  ${ce}
  ${y?ji($,w,Q,R):Ki($,w,Q,R)}
                   `};return{name:"MatMul",shaderCache:{hint:`${$};${t.activation};${y};${i}`,inputDependencies:A},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:v[0],y:v[1],z:v[2]},programUniforms:O}),getShaderSource:G}}}),$u,Xc,Xg=Y(()=>{pe(),Et(),ye(),Xt(),$n(),Yg(),xn(),$u=(e,t,r,a,i=!1,s,n=4,o=4,d=4,p="f32")=>{let h=O=>{switch(O){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${O} is not supported.`)}},f=O=>{switch(O){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${O} is not supported.`)}},l=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,g=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,_=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",y=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",$=e?"row":"col",w=e?"col":"row",v=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${$} / outWidth;
    let outCol = ${$} % outWidth;

    let WRow = ${w} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${w} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${w} % inChannels;
    var resData = ${Ke(n,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${_} && xCol >= 0 && xCol < ${y}) {
      ${l}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(n)}
    }
    return resData;`,S=e?t&&a?`
    let col = colIn * ${n};
    ${v}`:`
    let col = colIn * ${n};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${v}
    }
    return ${Ke(n,p)}(0.0);`:a&&r?`
    let col = colIn * ${n};
    ${v}`:`
    let col = colIn * ${n};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${v}
    }
    return ${Ke(n,p)}(0.0);`,k=e?a&&r?f(o):`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${f(o)}
    }
    return ${Ke(o,p)}(0.0);`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${f(o)}
    }
    return ${Ke(o,p)}(0.0);`,T=Ke(d,p),I=Ke(e?n:o,p),C=Ke(e?o:n,p),E=Kt(s,T,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${I} {
      ${e?S:k}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?k:S}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${T}) {
      let col = colIn * ${d};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${g}
      ${Zc(i)}
      ${E}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Xc=(e,t,r,a,i,s,n,o,d)=>{let p=t.format==="NHWC",h=p?e[0].dims[3]:e[0].dims[1],f=r[0],l=p?r[2]:r[3],g=p?r[1]:r[2],_=p?r[3]:r[1],y=p&&(h%4===0||h%3===0)&&_%4===0,$=p?_:l*g,w=p?l*g:_,v=[8,8,1],S=a<=8?[4,1,1]:[4,4,1],k=[Math.ceil($/v[0]/S[0]),Math.ceil(w/v[1]/S[1]),Math.ceil(f/v[2]/S[2])];ze("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${k}`);let T=y?p&&h%4!==0?3:4:1,I=v[1]*S[1],C=v[0]*S[0],E=Math.max(v[0]*T,v[1]),O=a%I===0,A=i%C===0,P=s%E===0,G=y?[T,4,4]:[1,1,1],N=[{type:6,data:a},{type:6,data:i},{type:6,data:s},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Qt(t,N),N.push(...ue(e[0].dims,e[1].dims));let M=["rank","rank"];n&&(N.push(...ue(e[2].dims)),M.push("rank")),N.push(...ue(r));let R=Q=>{let Z=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Zt(t,Z);let j=y?4:1,re=je(e[0].dataType),ne=`
      fn setOutputAtIndex(flatIndex : i32, value : ${y?`vec4<${re}>`:re}) {
        result[flatIndex] = ${y?`vec4<${re}>`:re}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${y?`vec4<${re}>`:re}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${y?"/ 4":""}, value);
      }`,D=q("x",e[0].dataType,e[0].dims.length,T===3?1:T),F=q("w",e[1].dataType,e[1].dims.length,j),te=[D,F],ce=se("result",e[0].dataType,r.length,j);if(n){let $e=q("bias",e[2].dataType,e[2].dims.length,j);te.push($e),ne+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${y?`vec4<${re}>`:re} {
          return bias[coords.${p?"w":"y"}${y?"/ 4":""}];
        }`}return`
        ${Yc("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${Q.registerUniforms(Z).declareVariables(...te,ce)}
        ${ne}
        ${$u(p,O,A,P,n,t,G[0],G[1],G[2],re)}
        ${y?ji(S,v,re,void 0,!p,E):Ki(S,v,re,void 0,!p,E,!1,void 0,o)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${T};${y};${O};${A};${P};${I};${C};${E}`,inputDependencies:M},getRunData:()=>({outputs:[{dims:d?d(r):r,dataType:e[0].dataType}],dispatchGroup:{x:k[0],y:k[1],z:k[2]},programUniforms:N}),getShaderSource:R}}}),vu,oi,yr,wu,ui,xu,Jc,eh,Jg=Y(()=>{pe(),Et(),me(),ye(),Xt(),$n(),vu=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},oi=e=>typeof e=="number"?[e,e,e]:e,yr=(e,t)=>t<=1?e:e+(e-1)*(t-1),wu=(e,t,r,a=1)=>{let i=yr(t,a);return Math.floor((e[0]*(r-1)-r+i)/2)},ui=(e,t,r,a,i)=>{i==null&&(i=wu(e,t[0],a[0]));let s=[0,0,0,r];for(let n=0;n<3;n++)e[n]+2*i>=t[n]&&(s[n]=Math.trunc((e[n]-t[n]+2*i)/a[n]+1));return s},xu=(e,t,r,a,i,s,n,o,d,p)=>{let h,f,l,g;if(e==="VALID"&&(e=0),typeof e=="number"){h={top:e,bottom:e,left:e,right:e,front:e,back:e};let _=ui([t,r,a,1],[o,d,p],1,[i,s,n],e);f=_[0],l=_[1],g=_[2]}else if(Array.isArray(e)){if(!e.every((y,$,w)=>y===w[0]))throw Error(`Unsupported padding parameter: ${e}`);h={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let _=ui([t,r,a,1],[o,d,p],1,[i,s,n],e[0]);f=_[0],l=_[1],g=_[2]}else if(e==="SAME_UPPER"){f=Math.ceil(t/i),l=Math.ceil(r/s),g=Math.ceil(a/n);let _=(f-1)*i+o-t,y=(l-1)*s+d-r,$=(g-1)*n+p-a,w=Math.floor(_/2),v=_-w,S=Math.floor(y/2),k=y-S,T=Math.floor($/2),I=$-T;h={top:S,bottom:k,left:T,right:I,front:w,back:v}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:h,outDepth:f,outHeight:l,outWidth:g}},Jc=(e,t,r,a,i,s=!1,n="channelsLast")=>{let o,d,p,h,f;if(n==="channelsLast")[o,d,p,h,f]=e;else if(n==="channelsFirst")[o,f,d,p,h]=e;else throw new Error(`Unknown dataFormat ${n}`);let[l,,g,_,y]=t,[$,w,v]=oi(r),[S,k,T]=oi(a),I=yr(g,S),C=yr(_,k),E=yr(y,T),{padInfo:O,outDepth:A,outHeight:P,outWidth:G}=xu(i,d,p,h,$,w,v,I,C,E),N=s?l*f:l,M=[0,0,0,0,0];return n==="channelsFirst"?M=[o,N,A,P,G]:n==="channelsLast"&&(M=[o,A,P,G,N]),{batchSize:o,dataFormat:n,inDepth:d,inHeight:p,inWidth:h,inChannels:f,outDepth:A,outHeight:P,outWidth:G,outChannels:N,padInfo:O,strideDepth:$,strideHeight:w,strideWidth:v,filterDepth:g,filterHeight:_,filterWidth:y,effectiveFilterDepth:I,effectiveFilterHeight:C,effectiveFilterWidth:E,dilationDepth:S,dilationHeight:k,dilationWidth:T,inShape:e,outShape:M,filterShape:t}},eh=(e,t,r,a,i,s)=>{let n=s==="channelsLast";n?e[0].dims[3]:e[0].dims[1];let o=[64,1,1],d={x:r.map(($,w)=>w)},p=[Math.ceil(vu(d.x.map($=>r[$]))/o[0]),1,1];ze("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${p}`);let h=1,f=B.size(r),l=[{type:12,data:f},{type:12,data:a},{type:12,data:i},{type:12,data:t.strides},{type:12,data:t.dilations}];Qt(t,l),l.push(...ue(e[0].dims,e[1].dims));let g=["rank","rank"],_=e.length===3;_&&(l.push(...ue(e[2].dims)),g.push("rank")),l.push(...ue(r));let y=$=>{let w=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:a.length},{name:"pads",type:"u32",length:i.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Zt(t,w);let v=1,S=je(e[0].dataType),k=q("x",e[0].dataType,e[0].dims.length,h),T=q("W",e[1].dataType,e[1].dims.length,v),I=[k,T],C=se("result",e[0].dataType,r.length,v),E="";if(_){let P=q("bias",e[2].dataType,e[2].dims.length,v);I.push(P),E+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${S} {
          return bias[${n?oe("coords",4,5):oe("coords",1,5)}];
        }`}let O=Ke(h,S),A=Kt(t,O,S);return`
            ${E}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${k.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${T.getByIndices("aIndices")};
            }
          ${$.registerUniforms(w).declareVariables(...I,C)}
          ${$.mainStart()}
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${C.offsetToIndices("global_idx")};
              let batch = ${oe("coords",0,k.rank)};
              let d2 = ${n?oe("coords",k.rank-1,k.rank):oe("coords",1,k.rank)};
              let xFRCCorner = vec3<u32>(${n?oe("coords",1,k.rank):oe("coords",2,k.rank)},
              ${n?oe("coords",2,k.rank):oe("coords",3,k.rank)},
              ${n?oe("coords",3,k.rank):oe("coords",4,k.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${n?oe("uniforms.x_shape",1,k.rank):oe("uniforms.x_shape",2,k.rank)};
              let xShapeZ = ${n?oe("uniforms.x_shape",2,k.rank):oe("uniforms.x_shape",3,k.rank)};
              let xShapeW = ${n?oe("uniforms.x_shape",3,k.rank):oe("uniforms.x_shape",4,k.rank)};
              let xShapeU = ${n?oe("uniforms.x_shape",4,k.rank):oe("uniforms.x_shape",1,k.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${n?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${n?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${n?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${n?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${_?"value = value + getBiasByOutputCoords(coords)":""};
              ${A}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${n};${h};${_}`,inputDependencies:g},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:p[0],y:p[1],z:p[2]},programUniforms:l}),getShaderSource:y}}}),th,rh,e0=Y(()=>{pe(),me(),ye(),Xt(),th=(e,t,r,a)=>{let i=e.length>2,s=i?"value += b[output_channel];":"",n=e[0].dims,o=e[1].dims,d=t.format==="NHWC",p=d?r[3]:r[1],h=p/t.group,f=d&&h>=4?Me(p):1,l=B.size(r)/f,g=[{type:12,data:l},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:h}];Qt(t,g),g.push(...ue(n,[o[0],o[1],o[2],o[3]/f]));let _=i?["rank","rank","rank"]:["rank","rank"];g.push(...ue([r[0],r[1],r[2],r[3]/f]));let y=$=>{let w=se("output",e[0].dataType,r.length,f),v=je(w.type.tensor),S=Kt(t,w.type.value,v),k=q("x",e[0].dataType,n.length),T=q("w",e[1].dataType,o.length,f),I=[k,T];i&&I.push(q("b",e[2].dataType,e[2].dims,f));let C=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Zt(t,C);let E=d?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${k.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${T.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${k.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${T.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${$.registerUniforms(C).declareVariables(...I,w)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${w.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${d?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${d?1:2}], outputIndices[${d?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${f} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${d?2:1}];

    var value: ${w.type.value} = ${w.type.value}(0);
    ${E}
    ${s}
    ${S}
    ${w.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${f}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:g}),getShaderSource:y}},rh=(e,t,r,a)=>{let i=e.length>2,s=Me(r[3]),n=Me(r[2]),o=B.size(r)/s/n,d=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/s],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/s],h=[r[0],r[1],r[2],r[3]/s],f=[{type:12,data:o},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Qt(t,f),f.push(...ue(d,p,h));let l=(n-1)*t.strides[1]+p[1],g=_=>{let y=se("output",e[0].dataType,h.length,s),$=je(y.type.tensor),w=Kt(t,y.type.value,$),v=q("x",e[0].dataType,d.length,s),S=q("w",e[1].dataType,p.length,s),k=[v,S];i&&k.push(q("b",e[2].dataType,e[2].dims,s));let T=i?"value += b[output_channel];":"",I=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Zt(t,I),`
  ${_.registerUniforms(I).declareVariables(...k,y)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${n}u;
    let col = (index1 % width1) * ${n}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${v.type.value}, ${l}>;
    var values: array<${y.type.value}, ${n}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${l}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${v.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${v.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${S.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${n}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${n}u; i++) {
      var value = values[i];
      ${T}
      ${w}
      ${y.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${s};${n};${l};${p[0]};${p[1]}`,inputDependencies:i?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:a?a(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:f}),getShaderSource:g}}}),ku,Jr,Su,ea,Qi,li,Tu,Eu,Zi,t0=Y(()=>{me(),Xg(),Jg(),xn(),e0(),Xt(),wn(),Nt(),ku=(e,t,r,a,i,s)=>{let n=e[0],o=e.slice(s?1:2,s?3:4),d=o.length,p=t[0],h=t.slice(2).map((l,g)=>l+(l-1)*(r[g]-1)),f=o.map((l,g)=>l+a[g]+a[g+d]).map((l,g)=>Math.floor((l-h[g]+i[g])/i[g]));return f.splice(0,0,n),f.splice(s?3:1,0,p),f},Jr=[2,3,1,0],Su=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],a=e[1].dims[1]*t.group;if(r!==a)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let i=e[0].dims.length-2;if(t.dilations.length!==i)throw new Error(`dilations should be ${i}D`);if(t.strides.length!==i)throw new Error(`strides should be ${i}D`);if(t.pads.length!==i*2)throw new Error(`pads should be ${i*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},ea=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let s=2;s<t[1].dims.length;++s)r[s-2]===0&&(r[s-2]=t[1].dims[s]);let a=e.pads.slice();fa.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,a,e.format==="NHWC",e.autoPad);let i=Object.assign({},e);return Object.assign(i,{kernelShape:r,pads:a}),i},Qi=e=>{let t=bn(e),r=e.format,a=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],i=e.dilations,s=e.group,n=e.kernel_shape,o=e.pads,d=e.strides,p=e.w_is_const();return{autoPad:a,format:r,dilations:i,group:s,kernelShape:n,pads:o,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},li=(e,t,r,a)=>{let i=r.format==="NHWC",s=ku(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,i);if(r.group!==1){let I=[t[0]];if(i){let C=e.kernelCustomData.wT??e.compute(at(t[1],Jr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=C),I.push(C)}else I.push(t[1]);t.length===3&&I.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&i&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(rh(I,r,s,a),{inputs:I}):e.compute(th(I,r,s,a),{inputs:I});return}let n=t.length===3,o=t[0].dims[i?1:2],d=t[0].dims[i?2:3],p=t[0].dims[i?3:1],h=t[1].dims[2],f=t[1].dims[3],l=s[i?1:2],g=s[i?2:3],_=s[i?3:1],y=i&&h===o&&f===d&&r.pads[0]===0&&r.pads[1]===0;if(y||h===1&&f===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let I=s[0],C,E,O,A=[];if(i){let N=e.kernelCustomData.wT??e.compute(at(t[1],Jr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=N),y){let M=o*d*p;C=t[0].reshape([1,I,M]),E=N.reshape([1,M,_]),O=[1,I,_]}else C=t[0].reshape([I,o*d,p]),E=N.reshape([1,p,_]),O=[I,l*g,_];A.push(C),A.push(E)}else C=t[0].reshape([I,p,o*d]),E=t[1].reshape([1,_,p]),O=[I,_,l*g],A.push(E),A.push(C);n&&A.push(t[2]);let P=O[2],G=A[0].dims[A[0].dims.length-1];P<8&&G<8?e.compute(vn(A,r,s,O,i,a),{inputs:A}):e.compute(ga(A,r,s,O,i,a),{inputs:A});return}let $=!0,w=e.kernelCustomData.wT??e.compute(at(t[1],Jr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=w);let v=[t[0],w];n&&v.push(t[2]);let S=i?l*g:_,k=i?_:l*g,T=h*f*p;e.compute(Xc(v,r,s,S,k,T,n,$,a),{inputs:v})},Tu=(e,t)=>{let r=t.format==="NHWC",a=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&a.push(e.inputs[2]);let i=[0,t.pads[0],0,t.pads[1]],s=[1].concat(t.strides),n=[1].concat(t.dilations),o=[1].concat(t.kernelShape),d=ea({...t,pads:i,strides:s,dilations:n,kernelShape:o},a);li(e,a,d,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Eu=(e,t,r)=>{let a=r.format==="NHWC"?"channelsLast":"channelsFirst",i=ea(r,t),s=r.autoPad==="NOTSET"?r.pads:r.autoPad,n=Jc(t[0].dims,t[1].dims,r.strides,r.dilations,s,!1,a);e.compute(eh(t,i,n.outShape,[n.filterDepth,n.filterHeight,n.filterWidth],[n.padInfo.front,n.padInfo.top,n.padInfo.left],a))},Zi=(e,t)=>{if(Su(e.inputs,t),e.inputs[0].dims.length===3)Tu(e,t);else if(e.inputs[0].dims.length===5)Eu(e,e.inputs,t);else{let r=ea(t,e.inputs);li(e,e.inputs,r)}}}),ah,r0=Y(()=>{pe(),Et(),me(),ye(),ah=(e,t,r)=>{let a=e.length>2,i=t.outputShape,s=t.format==="NHWC",n=t.group,o=e[1].dims,d=o[2]/n,p=o[3],h=s?Me(d):1,f=s?Me(p):1,l=s?p===1?h:f:1,g=B.size(i)/f,_=[Math.ceil(g/64),1,1];ze("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${_}`);let y=["rank","rank"],$=[t.strides[0],t.strides[1]],w=[t.kernelShape[s?1:2],t.kernelShape[s?2:3]],v=[t.dilations[0],t.dilations[1]],S=[w[0]+(t.dilations[0]<=1?0:(t.kernelShape[s?1:2]-1)*(t.dilations[0]-1)),w[1]+(t.dilations[1]<=1?0:(t.kernelShape[s?2:3]-1)*(t.dilations[1]-1))],k=[S[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),S[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],T=[{type:12,data:g},{type:12,data:$},{type:12,data:w},{type:12,data:v},{type:12,data:S},{type:6,data:k},{type:12,data:d},{type:12,data:p},...ue(e[0].dims,e[1].dims)];a&&(T.push(...ue(e[2].dims)),y.push("rank")),T.push(...ue(i));let I=C=>{let E=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:$.length},{name:"filter_dims",type:"u32",length:w.length},{name:"dilations",type:"u32",length:w.length},{name:"effective_filter_dims",type:"u32",length:S.length},{name:"pads",type:"i32",length:k.length},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],O=je(e[0].dataType),A=s?1:2,P=s?2:3,G=s?3:1,N=q("W",e[1].dataType,e[1].dims.length,l),M=q("Dy",e[0].dataType,e[0].dims.length,h),R=[M,N];a&&R.push(q("bias",e[2].dataType,[i[G]].length,f));let Q=se("result",e[0].dataType,i.length,f),Z=()=>{let re="";if(h===1)re+=`
        let w_offset = ${N.indicesToOffset(`${N.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
        let wValue = ${N.getByOffset(`w_offset / ${l}`)};
        dotProd = dotProd + xValue * wValue;`;else if(p===1)re+=`
          let wValue = ${N.getByOffset(`${N.indicesToOffset(`${N.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)} / ${l}`)};
          dotProd = dotProd + dot(xValue, wValue);`;else for(let ne=0;ne<h;ne++)re+=`
            let wValue${ne} = ${N.getByOffset(`${N.indicesToOffset(`${N.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${ne}, wOutChannel)`)} / ${l}`)};
            dotProd = dotProd + xValue[${ne}] * wValue${ne};`;return re},j=`
            let outputIndices = ${Q.offsetToIndices(`global_idx * ${f}`)};
            let batch = ${Q.indicesGet("outputIndices",0)};
            let d1 = ${Q.indicesGet("outputIndices",G)};
            let r = ${Q.indicesGet("outputIndices",A)};
            let c = ${Q.indicesGet("outputIndices",P)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${Q.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${O}(dyRCorner) + ${O}(wR)) / ${O}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${O}(uniforms.Dy_shape[${A}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }

              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${O}(dyCCorner) + ${O}(wC)) / ${O}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${O}(uniforms.Dy_shape[${P}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group; d2 = d2 + ${h}) {
                  let xValue = ${s?M.getByOffset(`${M.indicesToOffset(`${M.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`):M.get("batch","inputChannel","idyR","idyC")};
                  ${Z()}
                  inputChannel = inputChannel + ${h};
                }
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${a?` + bias[d1 / ${f}]`:""};
            ${Q.setByOffset("global_idx","value")};
          `;return`
    ${C.registerUniforms(E).declareVariables(...R,Q)}
      ${C.mainStart()}
      ${C.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${j}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${h}${l}${f}${p===1}`,inputDependencies:y},getRunData:()=>({dispatchGroup:{x:_[0],y:_[1],z:_[2]},outputs:[{dims:r?r(i):i,dataType:e[0].dataType}],programUniforms:T}),getShaderSource:I}}}),Iu,Cu,zu,di,ih,Au,pi,Ou,nh,a0=Y(()=>{r0(),Xt(),Nt(),Iu=(e,t,r,a,i,s)=>(e-1)*t+r+(a-1)*i+1-s,Cu=(e,t,r,a,i)=>{let s=Math.floor(e/2);t==="SAME_UPPER"?(r[a]=s,r[i]=e-s):t==="SAME_LOWER"&&(r[a]=e-s,r[i]=s)},zu=(e,t,r,a,i,s,n,o,d,p)=>{let h=e.length-2,f=p.length===0;d.length<h&&d.push(...Array(h-d.length).fill(0));let l=e[0],g=t[o?3:1]*i;for(let _=0,y=e.length-h-(o?1:0);_<h;++_,++y){let $=e[y],w=f?$*n[_]:p[_],v=Iu($,n[_],s[_],t[y],r[_],w);Cu(v,a,s,_,_+h),f&&p.push(n[_]*($-1)+d[_]+(t[y]-1)*r[_]+1-s[_]-s[_+h])}p.splice(0,0,l),p.splice(o?3:1,0,g)},di=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((f,l)=>f*l,1)===0){r.length=0;for(let f=2;f<t[1].dims.length;++f)r.push(t[1].dims[f])}let a=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(a?3:1,0,t[1].dims[1]);let i=e.pads.slice(),s=e.outputShape.slice(),n=e.outputPadding.slice(),o=t[0].dims,d=e.dilations.slice();if(d.reduce((f,l)=>f+l,0)===0){let f=t[0].dims.length-2;d=new Array(f).fill(1)}let p=e.strides.slice();if(p.reduce((f,l)=>f+l,0)===0){let f=t[0].dims.length-2;p=new Array(f).fill(1)}zu(o,r,d,e.autoPad,e.group,i,p,a,n,s);let h=Object.assign({},e);return Object.assign(h,{kernelShape:r,pads:i,outputPadding:n,outputShape:s,dilations:d,strides:p}),h},ih=e=>{let t=bn(e),r=e.format,a=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],i=e.dilations,s=e.group,n=e.kernelShape,o=e.pads,d=e.strides,p=e.wIsConst(),h=e.outputPadding,f=e.outputShape;return{autoPad:a,format:r,dilations:i,group:s,kernelShape:n,outputPadding:h,outputShape:f,pads:o,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Au=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],a=e[1].dims[0];if(r!==a)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let i=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==i))throw new Error("invalid bias");let s=e[0].dims.length-2;if(t.dilations.reduce((n,o)=>n+o,0)>0&&t.dilations.length!==s)throw new Error(`dilations should be ${s}D`);if(t.strides.reduce((n,o)=>n+o,0)>0&&t.strides.length!==s)throw new Error(`strides should be ${s}D`);if(t.pads.reduce((n,o)=>n+o,0)>0&&t.pads.length!==s*2)throw new Error(`pads should be ${s*2}D`);if(t.outputPadding.length!==s&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${s}D`);if(t.kernelShape.reduce((n,o)=>n+o,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},pi=(e,t,r,a)=>{let i=e.kernelCustomData.wT??e.compute(at(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=i);let s=[t[0],i];t.length===3&&s.push(t[2]),e.compute(ah(s,r,a),{inputs:s})},Ou=(e,t)=>{let r=t.format==="NHWC",a=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&a.push(e.inputs[2]);let i=t.kernelShape;(i.length===0||i[0]===0)&&(i=[e.inputs[1].dims[2]]);let s=t.dilations;(s.length===0||s[0]===0)&&(s=[1]);let n=t.strides;(n.length===0||n[0]===0)&&(n=[1]);let o=t.pads;o.length===0&&(o=[0,0]),o=[0,o[0],0,o[1]],n=[1].concat(n),s=[1].concat(s),i=[1].concat(i);let d=t.outputPadding;d=[0].concat(d);let p=di({...t,pads:o,strides:n,dilations:s,kernelShape:i,outputPadding:d},a);pi(e,a,p,h=>r?[h[0],h[2],h[3]]:[h[0],h[1],h[3]])},nh=(e,t)=>{if(Au(e.inputs,t),e.inputs[0].dims.length===3)Ou(e,t);else{let r=di(t,e.inputs);pi(e,e.inputs,r)}}}),Ru,sh,oh,i0=Y(()=>{pe(),me(),Le(),ye(),Ru=(e,t,r,a)=>{let i=B.size(t),s=t.length,n=q("input",e,s),o=se("output",e,s),d=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=B.normalizeAxis(d,s),h=f=>{let l=` i32(${n.indicesGet("inputIndices","uniforms.axis")}) `,g=oe("uniforms.input_shape","uniforms.axis",s),_=a.reverse?l+(a.exclusive?" + 1":""):"0",y=a.reverse?g:l+(a.exclusive?"":" + 1");return`
                ${f.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(n,o)}
                ${f.mainStart()}
                  ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${o.offsetToIndices("global_idx")};
                  var sum = ${o.type.value}(0);
                  let first : i32 = ${_};
                  let last : i32 = ${y};
                  for (var i : i32 = first; i < last; i++) {
                    ${n.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${n.getByIndices("inputIndices")};
                  }
                  ${o.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:a.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:[{type:12,data:i},{type:12,data:p},...ue(t,t)]}),getShaderSource:h}},sh=(e,t)=>{let r=e.inputs[0].dims,a=e.inputs[0].dataType,i=e.inputs[1];e.compute(Ru(a,r,i,t),{inputs:[0]})},oh=e=>{let t=e.exclusive===1,r=e.reverse===1;return Ae({exclusive:t,reverse:r})}}),Du,Bu,Mu,uh,lh,n0=Y(()=>{pe(),me(),Le(),ye(),Du=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Bu=(e,t,r,a)=>{let i=[];i.push(`fn perm(i: ${a.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let s=0;s<t;++s)i.push(r.indicesSet("a",e[s],`i[${s}]`));return i.push("return a;}"),i.join(`
`)},Mu=(e,t)=>{let r,a,i,s,n,o,d=t.format==="NHWC",p=t.blocksize,h=t.mode==="DCR";d?([r,a,i,s]=e.dims,n=h?[r,a,i,p,p,s/p**2]:[r,a,i,s/p**2,p,p],o=h?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,a,i,s]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],n=h?[r,p,p,s/p**2,a,i]:[r,s/p**2,p,p,a,i],o=h?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let f=e.reshape(n),l=f.dims.length,g=e.dataType,_=q("a",g,l),y=se("output",g,l),$=w=>`
  ${w.registerUniform("output_size","u32").declareVariables(_,y)}

  ${Bu(o,l,_,y)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${y.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${y.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:w=>{let v=d?[r,a*p,i*p,s/p**2]:[r,s/p**2,a*p,i*p],S=B.size(v),k=f.dims,T=B.sortBasedOnPerm(k,o);return{outputs:[{dims:v,dataType:w[0].dataType}],dispatchGroup:{x:Math.ceil(S/64)},programUniforms:[{type:12,data:S},...ue(k,T)]}},getShaderSource:$}},uh=(e,t)=>{Du(e.inputs),e.compute(Mu(e.inputs[0],t))},lh=e=>Ae({blocksize:e.blocksize,mode:e.mode,format:e.format})}),ta,br,ci,Nu,Pu,Uu,Vu,hi,Wu,dh,ph,s0=Y(()=>{pe(),me(),Le(),ye(),ta="[a-zA-Z]|\\.\\.\\.",br="("+ta+")+",ci="^"+br+"$",Nu="("+br+",)*"+br,Pu="^"+Nu+"$",Uu=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},Vu=class{constructor(e,t){var i;this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,a]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Pu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((s,n)=>{let o=e[n].dims.slice();if(!s.match(RegExp(ci)))throw new Error("Invalid LHS term");let d=this.processTerm(s,!0,o,n);this.lhs.push(d)}),a==="")a+=[...this.symbolToInfo.entries()].filter(([s,n])=>n.count===1||s==="...").map(([s])=>s).join("");else if(!a.match(RegExp(br)))throw new Error("Invalid RHS");(i=a.match(RegExp(ta,"g")))==null||i.forEach(s=>{if(s==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let n=this.symbolToInfo.get(s);if(n===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(n.dimValue)}}),this.rhs=this.processTerm(a,!1,this.outputDims)}addSymbol(e,t,r){let a=this.symbolToInfo.get(e);if(a!==void 0){if(a.dimValue!==t&&a.count!==1)throw new Error("Dimension mismatch");a.count++,a.inputIndices.push(r)}else a={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,a)}processTerm(e,t,r,a=-1){let i=r.length,s=!1,n=[],o=0;if(!e.match(RegExp(ci))&&!t&&e!=="")throw new Error("Invalid LHS term");let d=e.match(RegExp(ta,"g")),p=new Uu(a);return d==null||d.forEach((h,f)=>{if(h==="..."){if(s)throw new Error("Only one ellipsis is allowed per input term");s=!0;let l=i-d.length+1;if(l<0)throw new Error("Ellipsis out of bounds");if(n=r.slice(o,o+l),this.hasEllipsis){if(this.ellipsisDims.length!==n.length||this.ellipsisDims.toString()!==n.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=n;else throw new Error("Ellipsis must be specified in the LHS");for(let g=0;g<n.length;g++){let _=String.fromCharCode(48+g);p.addSymbol(_,f+g),this.addSymbol(_,r[o++],a)}}else p.addSymbol(h,f+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(h,r[o++],a)}),p}},hi=e=>e+"_max",Wu=(e,t,r,a)=>{let i=e.map(p=>p.length).map((p,h)=>q(`input${h}`,t,p)),s=B.size(a),n=se("output",t,a.length),o=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),d=p=>{let h=[],f="var prod = 1.0;",l="var sum = 0.0;",g="sum += prod;",_=[],y=[],$=[],w=[],v=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((k,T)=>{var I;if(r.rhs.symbolToIndices.has(T)){let C=(I=r.rhs.symbolToIndices.get(T))==null?void 0:I[0];C!==void 0&&r.lhs.forEach((E,O)=>{if(k.inputIndices.includes(O)){let A=E.symbolToIndices.get(T);if(A===void 0)throw new Error("Invalid symbol error");A.forEach(P=>{h.push(`${i[O].indicesSet(`input${O}Indices`,P,n.indicesGet("outputIndices",C))}`)})}})}else r.lhs.forEach((C,E)=>{if(k.inputIndices.includes(E)){let O=C.symbolToIndices.get(T);if(O===void 0)throw new Error("Invalid symbol error");O.forEach(A=>{_.push(`${i[E].indicesSet(`input${E}Indices`,A,`${T}`)}`)}),w.push(`prod *= ${i[E].getByIndices(`input${E}Indices`)};`)}}),y.push(`for(var ${T}: u32 = 0; ${T} < uniforms.${hi(T)}; ${T}++) {`),$.push("}")});let S=v?[...h,`let sum = ${i.map((k,T)=>k.getByIndices(`input${T}Indices`)).join(" * ")};`]:[...h,l,...y,..._,f,...w,g,...$];return`
            ${p.registerUniforms(o.map(k=>({name:`${hi(k)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...i,n)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${n.offsetToIndices("global_idx")};
            ${i.map((k,T)=>`var input${T}Indices: ${i[T].type.indices};`).join(`
`)}
            ${S.join(`
`)};
            ${n.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=o.filter(f=>r.symbolToInfo.has(f)).map(f=>{var l;return{type:12,data:((l=r.symbolToInfo.get(f))==null?void 0:l.dimValue)||0}});p.push({type:12,data:s});let h=e.map((f,l)=>[...ue(f)]).reduce((f,l)=>f.concat(l),p);return h.push(...ue(a)),{outputs:[{dims:a,dataType:t}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:h}},getShaderSource:d}},dh=(e,t)=>{let r=new Vu(e.inputs,t.equation),a=r.outputDims,i=e.inputs.map((s,n)=>s.dims);e.compute(Wu(i,e.inputs[0].dataType,r,a))},ph=e=>{let t=e.equation.replace(/\s+/g,"");return Ae({equation:t})}}),Lu,fi,qu,Hu,ch,o0=Y(()=>{pe(),me(),ye(),Lu=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),a=r.length<t.length?0:r.length-t.length,i=t.length<r.length?0:t.length-r.length;for(;a<r.length&&i<t.length;++a,++i)if(r[a]!==t[i]&&r[a]!==1&&t[i]!==1)throw new Error("Expand requires shape to be broadcastable to input")},fi=(e,t)=>{let r=e.length-t.length,a=[];for(let i=0;i<r;++i)a.push(e[i]);for(let i=0;i<t.length;++i)a.push(t[i]===1?e[i+r]:t[i]);return a},qu=(e,t)=>e.length>t.length?fi(e,t):fi(t,e),Hu=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),a=qu(t,r),i=e[0].dataType,s=i===9||B.size(t)===1,n=i===9||t.length>0&&t[t.length-1]%4===0?4:1,o=s||a.length>0&&a[a.length-1]%4===0?4:1,d=Math.ceil(B.size(a)/o),p=f=>{let l=q("input",i,t.length,n),g=se("output",i,a.length,o),_;if(i===9){let y=($,w,v="")=>`
          let outputIndices${w} = ${g.offsetToIndices(`outputOffset + ${w}u`)};
          let offset${w} = ${l.broadcastedIndicesToOffset(`outputIndices${w}`,g)};
          let index${w} = offset${w} / 4u;
          let component${w} = offset${w} % 4u;
          ${$}[${w}] = ${v}(${l.getByOffset(`index${w}`)}[component${w}]);
        `;_=`
        let outputOffset = global_idx * ${o};
        var data = vec4<u32>(0);
        ${y("data",0,"u32")}
        ${y("data",1,"u32")}
        ${y("data",2,"u32")}
        ${y("data",3,"u32")}
        ${g.setByOffset("global_idx","data")}
      }`}else _=`
        let outputIndices = ${g.offsetToIndices(`global_idx * ${o}`)};
        let inputOffset = ${l.broadcastedIndicesToOffset("outputIndices",g)};
        let data = ${g.type.value}(${l.getByOffset(`inputOffset / ${n}`)});
        ${g.setByOffset("global_idx","data")}
      }`;return`
    ${f.registerUniform("vec_size","u32").declareVariables(l,g)}
    ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${_}`},h=[{type:12,data:d},...ue(t,a)];return{name:"Expand",shaderCache:{hint:`${a.length};${n}${o}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h})}},ch=e=>{Lu(e.inputs),e.compute(Hu(e.inputs),{inputs:[0]})}}),Gu,hh,u0=Y(()=>{pe(),me(),ye(),yn(),Gu=e=>{let t=e[0].dataType,r=B.size(e[0].dims),a=B.size(e[1].dims),i=a%4===0,s=n=>{let o=q("x",t,[1],4),d=q("bias",t,[1],4),p=se("y",t,[1],4),h=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],f=g=>`
      let bias${g}_offset: u32 = (global_idx * 4 + ${g}) % uniforms.bias_size;
      let bias${g} = ${d.getByOffset(`bias${g}_offset / 4`)}[bias${g}_offset % 4];`,l=i?`
      let bias = ${d.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${f(0)}${f(1)}${f(2)}${f(3)}
      let bias = ${o.type.value}(bias0, bias1, bias2, bias3);`;return`${n.registerUniforms(h).declareVariables(o,d,p)}

    ${Gi(Ze(t))}

    ${n.mainStart(ur)}
      ${n.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${o.getByOffset("global_idx")};
      ${l}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",Fi("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${i}`,inputDependencies:["type","type"]},getShaderSource:s,getRunData:n=>({outputs:[{dims:n[0].dims,dataType:n[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:a}],dispatchGroup:{x:Math.ceil(r/ur/4)}})}},hh=e=>{e.inputs.length<2||B.size(e.inputs[1].dims)===0?Rc(e):e.compute(Gu(e.inputs))}}),Fu,ju,fh,mh,l0=Y(()=>{pe(),me(),Le(),ye(),Fu=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},ju=(e,t)=>{let r=e[0].dims,a=e[1].dims,i=r.length,s=B.normalizeAxis(t.axis,i),n=r.slice(0);n.splice(s,1,...a);let o=r[s],d=e[0].dataType===9?4:1,p=Math.ceil(B.size(n)/d),h=[{type:12,data:p},{type:6,data:o},{type:12,data:s},...ue(e[0].dims,e[1].dims,n)],f=l=>{let g=q("data",e[0].dataType,e[0].dims.length,d),_=q("inputIndices",e[1].dataType,e[1].dims.length),y=se("output",e[0].dataType,n.length,d),$=v=>{let S=a.length,k=`var indicesIndices${v}  = ${_.type.indices}(0);`;for(let T=0;T<S;T++)k+=`${S>1?`indicesIndices${v}[${T}]`:`indicesIndices${v}`} = ${n.length>1?`outputIndices${v}[uniforms.axis + ${T}]`:`outputIndices${v}`};`;k+=`
          var idx${v} = ${_.getByIndices(`indicesIndices${v}`)};
          if (idx${v} < 0) {
            idx${v} = idx${v} + uniforms.axisDimLimit;
          }
          var dataIndices${v} : ${g.type.indices};
        `;for(let T=0,I=0;T<i;T++)T===s?(k+=`${i>1?`dataIndices${v}[${T}]`:`dataIndices${v}`} = u32(idx${v});`,I+=S):(k+=`${i>1?`dataIndices${v}[${T}]`:`dataIndices${v}`} = ${n.length>1?`outputIndices${v}[${I}]`:`outputIndices${v}`};`,I++);return k},w;if(e[0].dataType===9){let v=(S,k,T="")=>`
          let outputIndices${k} = ${y.offsetToIndices(`outputOffset + ${k}u`)};
          ${$(k)};
          let offset${k} = ${g.indicesToOffset(`dataIndices${k}`)};
          let index${k} = offset${k} / 4u;
          let component${k} = offset${k} % 4u;
          ${S}[${k}] = ${T}(${g.getByOffset(`index${k}`)}[component${k}]);
        `;w=`
        let outputOffset = global_idx * ${d};
        var value = vec4<u32>(0);
        ${v("value",0,"u32")}
        ${v("value",1,"u32")}
        ${v("value",2,"u32")}
        ${v("value",3,"u32")}
        ${y.setByOffset("global_idx","value")}
      `}else w=`
      let outputIndices = ${y.offsetToIndices("global_idx")};
      ${$("")};
      let value = ${g.getByIndices("dataIndices")};
      ${y.setByOffset("global_idx","value")};
      `;return`
      ${l.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(g,_,y)}
      ${l.mainStart()}
        ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${w}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:f}},fh=e=>Ae({axis:e.axis}),mh=(e,t)=>{let r=e.inputs;Fu(r),e.compute(ju(e.inputs,t))}}),Ku,gh,_h,d0=Y(()=>{pe(),me(),ye(),Ku=(e,t,r,a,i,s,n,o,d)=>{let p=[{type:12,data:s},{type:12,data:a},{type:12,data:i},{type:12,data:r},{type:12,data:n},{type:12,data:o},{type:12,data:d}],h=[s];p.push(...ue(t.dims,h));let f=l=>{let g=q("indices_data",t.dataType,t.dims.length),_=se("input_slice_offsets_data",12,1,1),y=[g,_],$=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:i.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${l.registerUniforms($).declareVariables(...y)}
  ${l.mainStart()}
    ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${i.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${i.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:h,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:f},{inputs:[t],outputs:[-1]})[0]},gh=(e,t)=>{let r=e.inputs,a=r[0].dims,i=r[0].dataType,s=r[1].dims,n=s[s.length-1],o=B.sizeToDimension(s,s.length-1),d=B.sizeFromDimension(a,t.batchDims+n),p=B.sizeToDimension(a,t.batchDims),h=B.sizeFromDimension(a,t.batchDims),f=o/p,l=new Array(n),g=d;for(let k=0;k<n;++k)l[n-1-k]=g,g*=a[t.batchDims+n-1-k];let _=Ku(e,r[1],l,t.batchDims,a,o,f,h,n),y=t.batchDims+n;if(y>a.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let $=s.slice(0,-1).concat(a.slice(y)),w=B.size($),v=[{type:12,data:w},{type:12,data:d},...ue(r[0].dims,_.dims,$)],S=k=>{let T=q("data",r[0].dataType,r[0].dims.length),I=q("slice_offsets",12,_.dims.length),C=se("output",r[0].dataType,$.length);return`
          ${k.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(T,I,C)}
            ${k.mainStart()}
            ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:$,dataType:i}],dispatchGroup:{x:Math.ceil(w/64)},programUniforms:v}),getShaderSource:S},{inputs:[r[0],_]})},_h=e=>({batchDims:e.batch_dims,cacheKey:""})}),Qu,Zu,yh,bh,p0=Y(()=>{pe(),me(),Le(),ye(),Qu=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=B.normalizeAxis(t.quantizeAxis,e[0].dims.length),a=t.blockSize,i=e[0],s=e[2],n=e.length===4?e[3]:void 0;if(s.dims.length!==i.dims.length||!i.dims.map((o,d)=>d===r?Math.ceil(o/a)===s.dims[d]:o===s.dims[d]).reduce((o,d)=>o&&d,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(n){if(n.dataType!==i.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(n.dims.length!==s.dims.length||!n.dims.map((o,d)=>o===s.dims[d]).reduce((o,d)=>o&&d,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Zu=(e,t)=>{let r=e[0].dims,a=e[1].dims,i=r.length,s=B.normalizeAxis(t.gatherAxis,i),n=B.normalizeAxis(t.quantizeAxis,i),o=r.slice(0);o.splice(s,1,...a);let d=B.size(o),p=e[2].dataType,h=e[0].dataType===22,f=[{type:12,data:d},{type:12,data:n},{type:12,data:s},{type:12,data:t.blockSize},...ue(...e.map((g,_)=>g.dims),o)],l=g=>{let _=q("data",e[0].dataType,e[0].dims.length),y=q("inputIndices",e[1].dataType,e[1].dims.length),$=q("scales",e[2].dataType,e[2].dims.length),w=e.length>3?q("zeroPoint",e[3].dataType,e[3].dims.length):void 0,v=se("output",p,o.length),S=[_,y,$];w&&S.push(w);let k=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${g.registerUniforms(k).declareVariables(...S,v)}
        ${g.mainStart()}
        let output_indices = ${v.offsetToIndices("global_idx")};
        var indices_indices = ${y.type.indices}(0);
        ${a.length>1?`
          for (var i: u32 = 0; i < ${a.length}; i++) {
            let index = ${v.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${y.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${v.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${v.indicesGet("output_indices","i")};
          ${_.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${y.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[s]};
        }
        ${_.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${o.length}; i++) {
          let index = ${v.indicesGet("output_indices",`i + ${a.length} - 1`)};
          ${_.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${$.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${$.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${$.getByIndices("scale_indices")};
        ${w?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${w.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${w.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Ze(p)}(quantized_data - zero_point) * scale;
        ${v.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((g,_)=>_!==1).map(g=>g.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(g,_)=>"rank")},getRunData:()=>({outputs:[{dims:o,dataType:p}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:f}),getShaderSource:l}},yh=(e,t)=>{let r=e.inputs;Qu(r,t),e.compute(Zu(e.inputs,t))},bh=e=>Ae({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),Yu,Xu,$h,vh,c0=Y(()=>{pe(),me(),Le(),ye(),Yu=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Xu=(e,t)=>{let r=e[0].dims,a=e[0].dataType,i=r.length,s=e[1].dims,n=e[1].dataType,o=B.normalizeAxis(t.axis,i),d=r[o],p=s.slice(0),h=B.size(p),f=q("input",a,i),l=q("indicesInput",n,s.length),g=se("output",a,p.length),_=[{type:12,data:h},{type:6,data:d},{type:12,data:o}];return _.push(...ue(r,s,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:_}),getShaderSource:y=>`
      ${y.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(f,l,g)}
      ${y.mainStart()}
      ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${g.offsetToIndices("global_idx")};

      var idx = ${l.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${f.type.indices}(outputIndices);
      ${f.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${f.getByIndices("inputIndices")};

      ${g.setByOffset("global_idx","value")};
  }`}},$h=e=>Ae({axis:e.axis}),vh=(e,t)=>{let r=e.inputs;Yu(r),e.compute(Xu(e.inputs,t))}}),Ju,el,wh,xh,h0=Y(()=>{pe(),me(),ye(),Ju=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},el=(e,t)=>{let r=e[0].dims.slice(),a=e[1].dims.slice(),[i,s,n]=kp.getShapeOfGemmResult(r,t.transA,a,t.transB,e.length===3?e[2].dims:void 0),o=[i,s];if(!o)throw new Error("Can't use gemm on the given tensors");let d=16,p=Math.ceil(s/d),h=Math.ceil(i/d),f=!0,l=B.size(o),g=[{type:12,data:f?p:l},{type:12,data:i},{type:12,data:s},{type:12,data:n},{type:1,data:t.alpha},{type:1,data:t.beta}],_=["type","type"];e.length===3&&(g.push(...ue(e[2].dims)),_.push("rank")),g.push(...ue(o));let y=w=>{let v="";t.transA&&t.transB?v="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?v="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?v="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(v="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let S=t.alpha===1?"":"value *= uniforms.alpha;",k=q("a",e[0].dataType,e[0].dims),T=q("b",e[1].dataType,e[1].dims),I=k.type.value,C=null,E=[k,T];e.length===3&&(C=q("c",e[2].dataType,e[2].dims.length),E.push(C));let O=se("output",e[0].dataType,o.length);E.push(O);let A=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${w.registerUniforms(A).declareVariables(...E)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${I}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${v}
    }

    ${S}
    ${C!=null?`let cOffset = ${C.broadcastedIndicesToOffset("vec2(m, n)",O)}; value += ${I}(uniforms.beta) * ${C.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},$=w=>{let v=q("a",e[0].dataType,e[0].dims),S=q("b",e[1].dataType,e[1].dims),k=null,T=[v,S];e.length===3&&(k=q("c",e[2].dataType,e[2].dims.length),T.push(k));let I=se("output",e[0].dataType,o.length);T.push(I);let C=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],E="",O="";t.transA&&t.transB?(O=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,E="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(O=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,E="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(O=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,E="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(O=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${v.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${S.type.value}(0);
      }
      `,E="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let A=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${w.registerUniforms(C).declareVariables(...T)}
  var<workgroup> tile_a: array<array<${v.type.storage}, ${d}>, ${d}>;
  var<workgroup> tile_b: array<array<${S.type.storage}, ${d}>, ${d}>;
  ${w.mainStart([d,d,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${d};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${d};
    let num_tiles = (uniforms.K - 1) / ${d} + 1;
    var k_start = 0u;
    var value = ${I.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${O}
      k_start = k_start + ${d};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${d}; k++) {
        ${E}
      }
      workgroupBarrier();
    }

    ${A}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${k!=null?`let cOffset = ${k.broadcastedIndicesToOffset("vec2(m, n)",I)}; value += ${I.type.value}(uniforms.beta) * ${k.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return f?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:p*h},programUniforms:g}),getShaderSource:$}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:g}),getShaderSource:y}},wh=e=>{let t=e.transA,r=e.transB,a=e.alpha,i=e.beta;return{transA:t,transB:r,alpha:a,beta:i,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},xh=(e,t)=>{Ju(e.inputs),e.compute(el(e.inputs,t))}}),yt,Tt,Lt,qt,tl,rl,al,il,nl,sl,ol,ul,kh,Sh,f0=Y(()=>{pe(),me(),Le(),ye(),[yt,Tt,Lt,qt]=[0,1,2,3],tl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},rl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,al=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,il=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,nl=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,sl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${yt}] = batch;
     indices[${Tt}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Lt}] = u32(r);
            indices[${qt}] = u32(c);
          }
        `;case"border":return`
          indices[${Lt}] = u32(clamp(r, 0, H - 1));
          indices[${qt}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Lt}] = gs_reflect(r, border[1], border[3]);
          indices[${qt}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,ol=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${yt}], indices[${Tt}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${yt}], indices[${Tt}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${yt}], indices[${Tt}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${yt}], indices[${Tt}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${yt}], indices[${Tt}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${yt}], indices[${Tt}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,ul=(e,t)=>{let r=q("x",e[0].dataType,e[0].dims.length),a=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],i=q("grid",e[1].dataType,a.length,2),s=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(s=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[yt,Tt,Lt,qt]=[0,3,1,2]);let n=se("output",e[0].dataType,s.length),o=r.type.value,d=B.size(s),p=[{type:12,data:d},...ue(e[0].dims,a,s)],h=f=>`
  ${f.registerUniform("output_size","u32").declareVariables(r,i,n)}
  ${rl}
  ${al(o)}
  ${il(t)}
  ${nl(t)}
  ${sl(r,o,t)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Lt}]);
      let W_in = i32(uniforms.x_shape[${qt}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${n.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${yt}], indices[${Lt}], indices[${qt}]);
      let nxy = ${i.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${ol(n,o,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:f=>{let l=B.size(s);return{outputs:[{dims:s,dataType:f[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}},getShaderSource:h}},kh=(e,t)=>{tl(e.inputs),e.compute(ul(e.inputs,t))},Sh=e=>Ae({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Xe,ll,Th,mi,dl,Ir,Eh,Ih=Y(()=>{pe(),me(),Le(),fn(),_n(),ye(),Nt(),Xe=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,ll=(e,t)=>{let r=e[0],a=Xe(e,1),i=Xe(e,2),s=Xe(e,3),n=Xe(e,4),o=Xe(e,5),d=Xe(e,6),p=Xe(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let h=r.dims[0],f=r.dims[1],l=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],g=f,_=0,y=0,$=Math.floor(l/t.numHeads);if(d&&p&&B.size(d.dims)&&B.size(p.dims)){if(d.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(d.dims[0]!==h||d.dims[1]!==t.numHeads||d.dims[3]!==$)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==h||p.dims[1]!==t.numHeads||p.dims[3]!==$)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');_=d.dims[2],y=d.dims[2]}else if(d&&B.size(d.dims)||p&&B.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let w;if(a&&B.size(a.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(a.dims.length<3||a.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(a.dims.length===3){if(a.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');w=2,g=a.dims[1]}else if(a.dims.length===5){if(a.dims[2]!==t.numHeads||a.dims[3]!==2||a.dims[4]!==$)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(i)throw new Error('Expect "value" be none when "key" has packed kv format.');w=5,g=a.dims[1]}else{if(a.dims[1]!==t.numHeads||a.dims[3]!==$)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');w=0,g=a.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');w=3}if(s&&B.size(s.dims)>0){if(s.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(a&&a.dims.length===5&&a.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let v=_+g,S=0;if(n&&B.size(n.dims)>0){S=8;let C=n.dims;throw C.length===1?C[0]===h?S=1:C[0]===3*h+2&&(S=3):C.length===2&&C[0]===h&&C[1]===v&&(S=5),S===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let k=!1,T=l;if(i&&B.size(i.dims)>0){if(i.dims.length!==3&&i.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(i.dims.length===3){if(g!==i.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');T=i.dims[2]}else{if(g!==i.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');T=i.dims[1]*i.dims[3],k=!0}}let I=!1;if(n&&B.size(n.dims)>0)throw new Error("Key padding mask is not supported");if(o&&B.size(o.dims)>0){if(o.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(o.dims[0]!==h||o.dims[1]!==t.numHeads||o.dims[2]!==f||o.dims[3]!==v)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:h,sequenceLength:f,pastSequenceLength:_,kvSequenceLength:g,totalSequenceLength:v,maxSequenceLength:y,inputHiddenSize:0,hiddenSize:l,vHiddenSize:T,headSize:$,vHeadSize:Math.floor(T/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:S,scale:t.scale,broadcastResPosBias:I,passPastInKv:k,qkvFormat:w}},Th=e=>Ae({...e}),mi=Ae({perm:[0,2,1,3]}),dl=(e,t,r,a,i,s,n)=>{let o=[a,i,s],d=B.size(o),p=[{type:12,data:d},{type:12,data:n},{type:12,data:s}],h=f=>{let l=se("qkv_with_bias",t.dataType,o),g=q("qkv",t.dataType,o),_=q("bias",r.dataType,o),y=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${f.registerUniforms(y).declareVariables(g,_,l)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:o,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p}),getShaderSource:h},{inputs:[t,r],outputs:[-1]})[0]},Ir=(e,t,r,a,i,s,n,o)=>{let d=s;if(n&&B.size(n.dims)>0){if(a===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return d=dl(e,s,n,t,a,r*i,o),d=d.reshape([t,a,r,i]),r===1||a===1?d:e.compute(at(d,mi.perm),{inputs:[d],outputs:[-1]})[0]}else return s.dims.length===3&&(d=s.reshape([t,a,r,i])),r===1||a===1?d:e.compute(at(d,mi.perm),{inputs:[d],outputs:[-1]})[0]},Eh=(e,t)=>{let r=ll(e.inputs,t),a=e.inputs[0],i=Xe(e.inputs,1),s=Xe(e.inputs,2),n=Xe(e.inputs,3),o=Xe(e.inputs,4),d=Xe(e.inputs,5),p=Xe(e.inputs,6),h=Xe(e.inputs,7);if(a.dims.length===5)throw new Error("Packed QKV is not implemented");if((i==null?void 0:i.dims.length)===5)throw new Error("Packed KV is not implemented");let f=i&&s&&i.dims.length===4&&s.dims.length===4,l=Ir(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,a,n,0);if(f)return Ar(e,l,i,s,o,void 0,p,h,d,r);if(!i||!s)throw new Error("key and value must be provided");let g=Ir(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,i,n,r.hiddenSize),_=Ir(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,s,n,2*r.hiddenSize);Ar(e,l,g,_,o,void 0,p,h,d,r)}}),pl,cl,hl,fl,Yi,Ch,zh,Ah=Y(()=>{pe(),me(),Le(),ye(),pl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},cl=(e,t)=>{let r=[],a=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),a=r.length),Ae({numOutputs:a,axis:t.axis,splitSizes:r})},hl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${oe("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,fl=e=>{let t=e.length,r=[];for(let a=0;a<t;++a){let i=e[a].setByIndices("indices","input[global_idx]");t===1?r.push(i):a===0?r.push(`if (output_number == ${a}u) { ${i} }`):a===t-1?r.push(`else { ${i} }`):r.push(`else if (output_number == ${a}) { ${i} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Yi=(e,t)=>{let r=e[0].dims,a=B.size(r),i=e[0].dataType,s=B.normalizeAxis(t.axis,r.length),n=new Array(t.numOutputs),o=q("input",i,r.length),d=new Array(t.numOutputs),p=[],h=[],f=0,l=[{type:12,data:a}];for(let _=0;_<t.numOutputs;_++){f+=t.splitSizes[_],d[_]=f;let y=r.slice();y[s]=t.splitSizes[_],h.push(y),n[_]=se(`output${_}`,i,y.length),p.push({dims:h[_],dataType:e[0].dataType})}l.push({type:12,data:d},...ue(r,...h));let g=_=>`
  ${_.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",d.length).declareVariables(o,...n)}
  ${hl(d.length)}
  ${fl(n)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${o.offsetToIndices("global_idx")};
    var index = ${o.indicesGet("indices",s)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${oe("uniforms.size_in_split_axis","output_number - 1u",d.length)};
      ${o.indicesSet("indices",s,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:g,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(a/64)},programUniforms:l})}},Ch=(e,t)=>{pl(e.inputs);let r=e.inputs.length===1?t:cl(e.inputs,t);e.compute(Yi(e.inputs,r),{inputs:[0]})},zh=e=>{let t=e.axis,r=e.splitSizes,a=e.numOutputs<0?r.length:e.numOutputs;if(a!==r.length)throw new Error("numOutputs and splitSizes lengh must be equal");return Ae({axis:t,numOutputs:a,splitSizes:r})}}),ml,gl,gi,Oh,m0=Y(()=>{Le(),_n(),Ih(),Ah(),Nt(),ml=(e,t)=>{if(t.doRotary)throw new Error("GroupQuerryAttention do_rotary attribute is not supported");if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],a=e[1],i=e[2],s=e[3],n=e[4];if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let o=!1,d=r.dims[0],p=r.dims[1],h=r.dims.length===3?o?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],f=p,l=0,g=!a||a.dims.length===0,_=Math.floor(g?h/(t.numHeads+2*t.kvNumHeads):h/t.numHeads);g&&(h=_*t.numHeads);let y=s&&s.dims.length!==0,$=n&&n.dims.length!==0;if(y&&s.dims.length===4&&s.dims[0]===d&&s.dims[1]!==t.kvNumHeads&&s.dims[2]===t.kvNumHeads&&s.dims[3]===_)throw new Error("BSNH pastKey/pastValue is not supported");if(y&&$){if(s.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(n.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');l=s.dims[2]}else if(y||$)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let w=1;if(a&&a.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(a.dims.length<3||a.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(a.dims.length===3){if(r.dims[2]%a.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');f=a.dims[1]}else if(a.dims.length===5){if(a.dims[2]!==t.numHeads||a.dims[3]!==2||a.dims[4]!==_)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(i)throw new Error('Expect "value" be none when "key" has packed kv format.');f=a.dims[1]}else{if(a.dims[1]!==t.numHeads||a.dims[3]!==_)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');f=a.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');w=3}let v=0,S=!1,k=t.kvNumHeads?_*t.kvNumHeads:h;if(i&&i.dims.length>0){if(i.dims.length!==3&&i.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(i.dims.length===3){if(f!==i.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');k=i.dims[2]}else{if(f!==i.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');k=i.dims[1]*i.dims[3],S=!0}}let T=e.length>4?e[5]:void 0;if(T&&T.dims.length!==1&&T.dims[0]!==d)throw new Error('Input "seqlens" is expected to have 1 dimension and the same dim 0 as batch_size');return{batchSize:d,sequenceLength:p,pastSequenceLength:l,kvSequenceLength:f,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:h,vHiddenSize:k,headSize:_,vHeadSize:Math.floor(k/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:v,scale:t.scale,broadcastResPosBias:!1,passPastInKv:S,qkvFormat:w}},gl=Ae({perm:[0,2,1,3]}),gi=(e,t,r)=>{let a=t,i=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(a=t.reshape([r.batchSize,r.kvSequenceLength,i,r.headSize]),a=e.compute(at(a,gl.perm),{inputs:[a],outputs:[-1]})[0]),a},Oh=(e,t)=>{var $;let r=ml(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if((($=e.inputs[1])==null?void 0:$.dims.length)===5)throw new Error("Packed KV is not implemented");let a=e.inputs[0],i=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,s=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,n=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,o=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,d=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,h=r.kvNumHeads?r.kvNumHeads:r.numHeads,f=Ae({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,h*r.headSize,h*r.headSize]}),[l,g,_]=!i&&!s?e.compute(Yi([a],f),{inputs:[a],outputs:[-1,-1,-1]}):[a,i,s],y=Ir(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,l,void 0,0);Ar(e,y,gi(e,g,r),gi(e,_,r),void 0,void 0,n,o,void 0,r,d,p)}}),_i,_l,yl,Rh,g0=Y(()=>{pe(),me(),Nt(),ye(),_i=(e,t,r,a,i,s,n,o)=>{let d=Me(s),p=d===1?"f32":`vec${d}f`,h=d===1?"vec2f":`mat2x${d}f`,f=i*n,l=64;f===1&&(l=256);let g=[i,n,s/d],_=[i,n,2],y=["rank","type","type"],$=[];$.push(...ue(g,_));let w=v=>{let S=q("x",t.dataType,3,d),k=q("scale",r.dataType,r.dims),T=q("bias",a.dataType,a.dims),I=se("output",1,3,2),C=[S,k,T,I];return`
  var<workgroup> workgroup_shared : array<${h}, ${l}>;
  const workgroup_size = ${l}u;
  ${v.declareVariables(...C)}
  ${v.mainStart(l)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${S.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${Mt("workgroup_shared[0][0]",d)} / f32(hight * ${d});
      let squared_sum_final = ${Mt("workgroup_shared[0][1]",d)} / f32(hight * ${d});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${o}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${d};${o};${l}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:_,dataType:1}],dispatchGroup:{x:f},programUniforms:$}),getShaderSource:w},{inputs:[t,r,a],outputs:[-1]})[0]},_l=(e,t,r)=>{let a=t[0].dims,i=a,s=2,n=a[0],o=a[1],d=B.sizeFromDimension(a,s),p=Me(d),h=B.size(i)/p,f=_i(e,t[0],t[1],t[2],n,d,o,r.epsilon),l=[n,o,d/p],g=[n,o],_=["type","none"],y=$=>{let w=q("x",t[0].dataType,l.length,p),v=q("scale_shift",1,g.length,2),S=se("output",t[0].dataType,l.length,p),k=[w,v,S];return`
  ${$.registerUniform("output_size","u32").declareVariables(...k)}
  ${$.mainStart()}
  ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${S.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${v.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${w.getByOffset("global_idx")} * ${S.type.value}(scale_shift.x) + ${S.type.value}(scale_shift.y);
      ${S.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:i,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...ue(l,g,l)]}),getShaderSource:y},{inputs:[t[0],f]})},yl=(e,t,r)=>{let a=t[0].dims,i=a,s=a[0],n=a[a.length-1],o=B.sizeFromDimension(a,1)/n,d=Me(n),p=B.size(i)/d,h=[{type:12,data:o},{type:12,data:Math.floor(n/d)}],f=["type","type"],l=!1,g=[0,a.length-1];for(let w=0;w<a.length-2;w++)l=l||a[w+1]!==1,g.push(w+1);l=l&&a[a.length-1]!==1;let _=l?e.compute(at(e.inputs[0],g),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:a.length},(w,v)=>a[g[v]])),y=_i(e,_,t[1],t[2],s,o,n,r.epsilon),$=w=>{let v=je(t[0].dataType),S=d===1?"vec2f":`mat${d}x2f`,k=C=>{let E=C===0?"x":"y",O=d===1?"f32":`vec${d}f`;switch(d){case 1:return`${v}(${O}(scale.${E}))`;case 2:return`vec2<${v}>(${O}(scale[0].${E}, scale[1].${E}))`;case 4:return`vec4<${v}>(${O}(scale[0].${E}, scale[1].${E}, scale[2].${E}, scale[3].${E}))`;default:throw new Error(`Not supported compoents ${d}`)}},T=q("input",t[0].dataType,t[0].dims,d),I=se("output",t[0].dataType,i,d);return`
  @group(0) @binding(0) var<storage, read> input : array<${T.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${S}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${I.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${w.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${k(0)}, ${k(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${d}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:i,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:$},{inputs:[t[0],y]})},Rh=(e,t)=>{t.format==="NHWC"?yl(e,e.inputs,t):_l(e,e.inputs,t)}}),bl,$l,Dh,_0=Y(()=>{pe(),me(),ye(),bl=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},$l=(e,t,r)=>{let a=t.simplified,i=e[0].dims,s=e[1],n=!a&&e[2],o=i,d=B.normalizeAxis(t.axis,i.length),p=B.sizeToDimension(i,d),h=B.sizeFromDimension(i,d),f=B.size(s.dims),l=n?B.size(n.dims):0;if(f!==h||n&&l!==h)throw new Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${f} and bias size of ${l}`);let g=[];for(let T=0;T<i.length;++T)T<d?g.push(i[T]):g.push(1);let _=Me(h),y=["type","type"],$=[{type:12,data:p},{type:1,data:h},{type:12,data:Math.floor(h/_)},{type:1,data:t.epsilon}];n&&y.push("type");let w=r>1,v=r>2,S=T=>{let I=je(e[0].dataType),C=[q("x",e[0].dataType,e[0].dims,_),q("scale",s.dataType,s.dims,_)];n&&C.push(q("bias",n.dataType,n.dims,_)),C.push(se("output",e[0].dataType,o,_)),w&&C.push(se("mean_data_output",1,g)),v&&C.push(se("inv_std_output",1,g));let E=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${T.registerUniforms(E).declareVariables(...C)}
  ${T.mainStart()}
    ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Li("f32",_)};
    var mean_square_vector = ${Li("f32",_)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${nr(I,_,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${Mt("mean_vector",_)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${Mt("mean_square_vector",_)} / uniforms.norm_size ${a?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${nr(I,_,"x[j + offset]")};
      let f32scale = ${nr(I,_,"scale[j]")};
      output[j + offset] = ${C[0].type.value}((f32input ${a?"":"- mean"}) * inv_std_dev * f32scale
        ${n?`+ ${nr(I,_,"bias[j]")}`:""}
      );
    }

    ${w?"mean_data_output[global_idx] = mean":""};
    ${v?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},k=[{dims:o,dataType:e[0].dataType}];return w&&k.push({dims:g,dataType:1}),v&&k.push({dims:g,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${_};${r};${a}`,inputDependencies:y},getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:$}),getShaderSource:S}},Dh=(e,t)=>{bl(e.inputs),e.compute($l(e.inputs,t,e.outputCount))}}),vl,Bh,y0=Y(()=>{me(),wn(),xn(),vl=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},Bh=e=>{vl(e.inputs);let t=or.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],a=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&a<8)e.compute(vn(e.inputs,{activation:""},t));else{let i=t[t.length-2],s=B.size(e.inputs[0].dims.slice(0,-2)),n=B.size(e.inputs[1].dims.slice(0,-2));if(s!==1&&i===1&&n===1){let o=e.inputs[0].reshape([1,s,a]),d=e.inputs[1].reshape([1,a,r]),p=[1,s,r],h=[o,d];e.compute(ga(h,{activation:""},t,p),{inputs:h})}else e.compute(ga(e.inputs,{activation:""},t))}}}),wl,xl,kl,Mh,Nh,b0=Y(()=>{pe(),me(),Le(),ye(),wl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],a=r.dims.length;if(r.dims[a-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let i=Math.floor((t.k+t.blockSize-1)/t.blockSize),s=t.blockSize/8*t.bits,n=e[1];if(!B.areEqual(n.dims,[t.n,i,s]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let o=e[2].dims;if(B.size(o)!==t.n*i)throw new Error("scales input size error.");if(e.length===4){let d=e[3].dims,p=t.bits>4?t.n*i:t.n*Math.floor((i+1)/2);if(B.size(d)!==p)throw new Error("zeroPoints input size error.")}},xl=(e,t)=>{let r=e[0].dims,a=r.length,i=r[a-2],s=t.k,n=t.n,o=r.slice(0,a-2),d=B.size(o),p=e[1].dims[2]/4,h=e[0].dataType,f=Me(t.k),l=Me(p),g=Me(n),_=o.concat([i,n]),y=i>1&&n/g%2===0?2:1,$=B.size(_)/g/y,w=64,v=[],S=[d,i,s/f],k=B.convertShape(e[1].dims).slice();k.splice(-1,1,p/l),v.push(...ue(S)),v.push(...ue(k)),v.push(...ue(e[2].dims)),e.length===4&&v.push(...ue(B.convertShape(e[3].dims)));let T=[d,i,n/g];v.push(...ue(T));let I=C=>{let E=S.length,O=q("a",e[0].dataType,E,f),A=q("b",12,k.length,l),P=q("scales",e[2].dataType,e[2].dims.length),G=[O,A,P],N=e.length===4?q("zero_points",12,e[3].dims.length):void 0;N&&G.push(N);let M=T.length,R=se("output",e[0].dataType,M,g),Q=je(e[0].dataType),Z=(()=>{switch(f){case 1:return`array<${Q}, 8>`;case 2:return`mat4x2<${Q}>`;case 4:return`mat2x4<${Q}>`;default:throw new Error(`${f}-component is not supported.`)}})(),j=()=>{let D=`
          // reuse a data
            var input_offset = ${O.indicesToOffset(`${O.type.indices}(batch, row, word_offset)`)};
            var a_data: ${Z};
            for (var j: u32 = 0; j < ${8/f}; j++) {
              a_data[j] = ${O.getByOffset("input_offset")};
              input_offset++;
            }
          `;for(let F=0;F<g*y;F++)D+=`
            b_value = ${l===1?`b${F}_data`:`b${F}_data[i]`};
            b_value_lower = unpack4xU8(b_value & b_mask);
            b_value_upper = unpack4xU8((b_value >> 4) & b_mask);
            b_quantized_values = ${Z}(${Array.from({length:4},(te,ce)=>`${Q}(b_value_lower[${ce}]), ${Q}(b_value_upper[${ce}])`).join(", ")});
            b_dequantized_values = ${f===1?`${Z}(${Array.from({length:8},(te,ce)=>`(b_quantized_values[${ce}] - ${N?`zero_point${F}`:"zero_point"}) * scale${F}`).join(", ")});`:`(b_quantized_values - ${Z}(${Array(8).fill(`${N?`zero_point${F}`:"zero_point"}`).join(",")})) * scale${F};`};
            workgroup_shared[local_id.x * ${y} + ${Math.floor(F/g)}]${g>1?`[${F%g}]`:""} += ${Array.from({length:8/f},(te,ce)=>`${f===1?`a_data[${ce}] * b_dequantized_values[${ce}]`:`dot(a_data[${ce}], b_dequantized_values[${ce}])`}`).join(" + ")};
          `;return D},re=()=>{let D=`
            var col_index = col * ${g};
            ${N?`
            let zero_point_bytes_per_col = (nBlocksPerCol + 1) / 2;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${Q}(8);`}
            `;for(let F=0;F<g*y;F++)D+=`
            let scale${F} = ${P.getByOffset("col_index * nBlocksPerCol + block")};
            ${N?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block >> 0x1u);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            zero_point_word = ${N.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${F} = ${Q}((zero_point_word) & 0xFu);`:""}
            col_index += 1;`;return D},ne=()=>{let D=`col_index = col * ${g};`;for(let F=0;F<g*y;F++)D+=`
            let b${F}_data = ${A.getByIndices(`${A.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return D+=`
            var b_value: u32;
            let b_mask: u32 = 0x0F0F0F0Fu;
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${Z};
            var b_dequantized_values: ${Z};`,D};return`
        var<workgroup> workgroup_shared: array<${R.type.value}, ${y*w}>;
        ${C.declareVariables(...G,R)}
        ${C.mainStart([w,1,1])}
          let output_indices = ${R.offsetToIndices(`(global_idx / ${w}) * ${y}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${w}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/f};
            ${re()}
            for (var word: u32 = 0; word < ${p}; word += ${l}) {
              ${ne()}
              for (var i: u32 = 0; i < ${l}; i++) {
                ${j()}
                word_offset += ${8/f};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${y}) {
            var output_value: ${R.type.value} = ${R.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${w}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${y};
            }
            ${R.setByIndices(`${R.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${f};${l};${g};${y};${w}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:h}],dispatchGroup:{x:$},programUniforms:v}),getShaderSource:I}},kl=(e,t)=>{let r=e[0].dims,a=r.length,i=r[a-2],s=t.k,n=t.n,o=r.slice(0,a-2),d=B.size(o),p=e[1].dims[2]/4,h=e[0].dataType,f=Me(t.k),l=Me(p),g=o.concat([i,n]),_=128,y=n%8===0?8:n%4===0?4:1,$=_/y,w=$*l*8,v=w/f,S=w/t.blockSize,k=B.size(g)/y,T=[],I=[d,i,s/f],C=B.convertShape(e[1].dims).slice();C.splice(-1,1,p/l),T.push(...ue(I)),T.push(...ue(C)),T.push(...ue(e[2].dims)),e.length===4&&T.push(...ue(B.convertShape(e[3].dims)));let E=[d,i,n];T.push(...ue(E));let O=A=>{let P=I.length,G=q("a",e[0].dataType,P,f),N=q("b",12,C.length,l),M=q("scales",e[2].dataType,e[2].dims.length),R=[G,N,M],Q=e.length===4?q("zero_points",12,e[3].dims.length):void 0;Q&&R.push(Q);let Z=E.length,j=se("output",e[0].dataType,Z),re=je(e[0].dataType),ne=()=>{switch(f){case 1:return`
          let a_data0 = vec4<${re}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${re}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${re}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${re}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${f}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${G.type.value}, ${v}>;
        var<workgroup> inter_results: array<array<${j.type.value}, ${$}>, ${y}>;
        ${A.declareVariables(...R,j)}
        ${A.mainStart([$,y,1])}
          let output_indices = ${j.offsetToIndices(`workgroup_index * ${y}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${S} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${v};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${v}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${G.getByIndices(`${G.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${G.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${S} + local_id.x;
            ${Q?`
            let zero_point_bytes_per_col = (n_blocks_per_col + 1) / 2;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block >> 0x1u);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            let zero_point_word = ${Q.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${re}((zero_point_word) & 0xFu);`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${re}(8);`}
            let scale = ${M.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${N.getByIndices(`${N.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/f};
            for (var i: u32 = 0; i < ${l}; i++) {
              ${ne()}
              let b_value = ${l===1?"b_data":"b_data[i]"};
              let b_value_lower = unpack4xU8(b_value & 0x0F0F0F0Fu);
              let b_value_upper = unpack4xU8((b_value >> 4) & 0x0F0F0F0Fu);
              let b_quantized_values = mat2x4<${re}>(${Array.from({length:4},(D,F)=>`${re}(b_value_lower[${F}]), ${re}(b_value_upper[${F}])`).join(", ")});
              let b_dequantized_values = (b_quantized_values - mat2x4<${re}>(${Array(8).fill("zero_point").join(",")})) * scale;
              inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(D,F)=>`${`dot(a_data${F}, b_dequantized_values[${F}])`}`).join(" + ")};
              word_offset += ${8/f};
            }
            workgroupBarrier();
          }

          if (local_idx < ${y}) {
            var output_value: ${j.type.value} = ${j.type.value}(0);
            for (var b = 0u; b < ${$}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${j.setByIndices(`${j.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${f};${l};${$};${y}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:g,dataType:h}],dispatchGroup:{x:k},programUniforms:T}),getShaderSource:O}},Mh=(e,t)=>{wl(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(kl(e.inputs,t)):e.compute(xl(e.inputs,t))},Nh=e=>Ae(e)}),Sl,Tl,El,Il,Cl,zl,Al,Ol,Ph,$0=Y(()=>{pe(),me(),ye(),Sl=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Tl=(e,t,r)=>{let a="";for(let i=t-1;i>=0;--i)a+=`
            k = i32(${e.indicesGet("indices",i)}) - ${oe("uniforms.pads",i,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${oe("uniforms.x_shape",i,t)})) {
              break;
            }
            offset += k * i32(${oe("uniforms.x_strides",i,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${a}
            value = x[offset];
          }
      `},El=(e,t,r)=>{let a="";for(let i=t-1;i>=0;--i)a+=`
                k = i32(${e.indicesGet("indices",i)}) - ${oe("uniforms.pads",i,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${oe("uniforms.x_shape",i,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${oe("uniforms.x_shape",i,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${oe("uniforms.x_strides",i,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${a}
              value = x[offset];
          `},Il=(e,t,r)=>{let a="";for(let i=t-1;i>=0;--i)a+=`
                k = i32(${e.indicesGet("indices",i)}) - ${oe("uniforms.pads",i,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${oe("uniforms.x_shape",i,t)})) {
                  k = i32(${oe("uniforms.x_shape",i,t)}) - 1;
                }
                offset += k * i32(${oe("uniforms.x_strides",i,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${a}
              value = x[offset];
          `},Cl=(e,t,r)=>{let a="";for(let i=t-1;i>=0;--i)a+=`
                k = i32(${e.indicesGet("indices",i)}) - ${oe("uniforms.pads",i,r)};
                if (k < 0)  {
                  k += i32(${oe("uniforms.x_shape",i,t)}]);
                }
                if (k >= i32(${oe("uniforms.x_shape",i,t)})) {
                  k -= i32(${oe("uniforms.x_shape",i,t)});
                }
                offset += k * i32(${oe("uniforms.x_strides",i,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${a}
              value = x[offset];
          `},zl=(e,t,r)=>{switch(r.mode){case 0:return Tl(e,t,r.pads.length);case 1:return El(e,t,r.pads.length);case 2:return Il(e,t,r.pads.length);case 3:return Cl(e,t,r.pads.length);default:throw new Error("Invalid mode")}},Al=(e,t)=>{let r=B.padShape(e[0].dims.slice(),t.pads),a=e[0].dims,i=B.size(r),s=[{type:12,data:i},{type:6,data:t.pads}],n=e.length>=3&&e[2].data;t.mode===0&&s.push({type:n?e[2].dataType:1,data:t.value}),s.push(...ue(e[0].dims,r));let o=["rank"],d=p=>{let h=se("output",e[0].dataType,r.length),f=q("x",e[0].dataType,a.length),l=f.type.value,g=zl(h,a.length,t),_=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&_.push({name:"constant_value",type:n?l:"f32"}),`
            ${p.registerUniforms(_).declareVariables(f,h)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${h.offsetToIndices("global_idx")};

            var value = ${l}(0);
            ${g}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${n}`,inputDependencies:o},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(B.size(r)/64)},programUniforms:s}),getShaderSource:d}},Ol=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),a=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,i=e[0].dims.length,s=new Int32Array(2*i).fill(0);if(e.length>=4){let o=e[3].getBigInt64Array();for(let d=0;d<o.length;d++)s[Number(o[d])]=Number(r[d]),s[Number(o[d])+i]=Number(r[d+o.length])}else r.forEach((o,d)=>s[Number(d)]=Number(o));let n=[];return s.forEach(o=>n.push(o)),{mode:t.mode,value:a,pads:n}}else return t},Ph=(e,t)=>{Sl(e.inputs);let r=Ol(e.inputs,t);e.compute(Al(e.inputs,r),{inputs:[0]})}}),$r,yi,bi,$i,vi,Rl,Dl,wi,xi,Uh,Vh,ki,Wh,Lh,Si,qh,Hh,Gh,Fh,v0=Y(()=>{ht(),pe(),me(),ye(),$r=e=>{if(De.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},yi=(e,t,r)=>{let a=t.format==="NHWC",i=e.dims.slice();a&&i.splice(1,0,i.pop());let s=Object.hasOwnProperty.call(t,"dilations"),n=t.kernelShape.slice(),o=t.strides.slice(),d=s?t.dilations.slice():[],p=t.pads.slice();fa.adjustPoolAttributes(r,i,n,o,d,p);let h=fa.computePoolOutputShape(r,i,o,d,n,p,t.autoPad),f=Object.assign({},t);s?Object.assign(f,{kernelShape:n,strides:o,pads:p,dilations:d,cacheKey:t.cacheKey}):Object.assign(f,{kernelShape:n,strides:o,pads:p,cacheKey:t.cacheKey});let l=h.slice();return l.push(l.splice(1,1)[0]),[f,a?l:h]},bi=(e,t)=>{let r=t.format==="NHWC",a=B.size(e),i=B.size(t.kernelShape),s=[{type:12,data:a},{type:12,data:i}],n=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let o=t.kernelShape[t.kernelShape.length-1],d=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],h=t.pads[t.pads.length-1],f=!!(p+h);s.push({type:12,data:o},{type:12,data:d},{type:12,data:p},{type:12,data:h}),n.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let l=!1;if(t.kernelShape.length===2){let g=t.kernelShape[t.kernelShape.length-2],_=t.strides[t.strides.length-2],y=t.pads[t.pads.length/2-2],$=t.pads[t.pads.length-2];l=!!(y+$),s.push({type:12,data:g},{type:12,data:_},{type:12,data:y},{type:12,data:$}),n.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[s,n,!0,f,l]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let o=B.computeStrides(t.kernelShape);s.push({type:12,data:o},{type:12,data:t.pads},{type:12,data:t.strides}),n.push({name:"kernelStrides",type:"u32",length:o.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let d=t.pads.reduce((p,h)=>p+h);return[s,n,!!d,!1,!1]}},$i=(e,t,r,a,i,s,n,o,d,p,h,f)=>{let l=i.format==="NHWC",g=t.type.value,_=se("output",t.type.tensor,a);if(i.kernelShape.length<=2){let y="",$="",w="",v=r-(l?2:1);if(h?y=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${v}] = indices[${v}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${v}] < 0 || xIndices[${v}]
                      >= uniforms.x_shape[${v}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`:y=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${v}] = indices[${v}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`,i.kernelShape.length===2){let S=r-(l?3:2);f?$=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${S}] = indices[${S}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${S}] < 0 || xIndices[${S}] >= uniforms.x_shape[${S}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:$=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${S}] = indices[${S}] * uniforms.sh - uniforms.phStart + j;
                `,w=`
              }
            `}return`
            ${e.registerUniforms(d).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var value = ${g}(${o});
              var pad = 0;
              ${$}
              ${y}
              ${w}
              ${n}

              output[global_idx] = value;
            }`}else{if(l)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let y=i.kernelShape.length,$=i.pads.length,w="";return p?w=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${s}
              }`:w=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${s}
            `,`
            ${e.registerUniforms(d).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var offsets: array<u32, ${y}>;

              var value = ${g}(${o});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${y-1}u; j++) {
                  offsets[j] = offset / ${oe("uniforms.kernelStrides","j",y)};
                  offset -= offsets[j] * ${oe("uniforms.kernelStrides","j",y)};
                }
                offsets[${y-1}] = offset;

                isPad = false;
                for (var j = ${r-y}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${oe("uniforms.strides",`j - ${r-y}u`,y)}
                    + offsets[j - ${r-y}u] - ${oe("uniforms.pads","j - 2u",$)};
                  ${w}
              }
              ${n}

              output[global_idx] = value;
            }`}},vi=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Rl=e=>`${vi(e)};${e.countIncludePad}`,Dl=e=>`${vi(e)};${e.storageOrder};${e.dilations}`,wi=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),xi=(e,t,r,a)=>{let[i,s]=yi(t,a,r),n=q("x",t.dataType,t.dims.length),o=n.type.value,d="value += x_val;",p="";i.countIncludePad?p+=`value /= ${o}(uniforms.kernelSize);`:p+=`value /= ${o}(i32(uniforms.kernelSize) - pad);`;let[h,f,l,g,_]=bi(s,i);h.push(...ue(t.dims,s));let y=["rank"];return{name:e,shaderCache:{hint:`${a.cacheKey};${l};${g};${_}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(B.size(s)/64)},programUniforms:h}),getShaderSource:$=>$i($,n,t.dims.length,s.length,i,d,p,0,f,l,g,_)}},Uh=e=>{let t=e.count_include_pad!==0,r=wi(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let a={countIncludePad:t,...r,cacheKey:""};return{...a,cacheKey:Rl(a)}},Vh=(e,t)=>{$r(e.inputs),e.compute(xi("AveragePool",e.inputs[0],!1,t))},ki={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Wh=e=>{let t=e.format;return{format:t,...ki,cacheKey:t}},Lh=(e,t)=>{$r(e.inputs),e.compute(xi("GlobalAveragePool",e.inputs[0],!0,t))},Si=(e,t,r,a)=>{let[i,s]=yi(t,a,r),n=`
      value = max(x_val, value);
    `,o="",d=q("x",t.dataType,t.dims.length),p=["rank"],[h,f,l,g,_]=bi(s,i);return h.push(...ue(t.dims,s)),{name:e,shaderCache:{hint:`${a.cacheKey};${l};${g};${_}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(B.size(s)/64)},programUniforms:h}),getShaderSource:y=>$i(y,d,t.dims.length,s.length,i,n,o,t.dataType===10?-65504:-1e5,f,l,g,_)}},qh=(e,t)=>{$r(e.inputs),e.compute(Si("MaxPool",e.inputs[0],!1,t))},Hh=e=>{let t=e.storage_order,r=e.dilations,a=wi(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(a.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let i={storageOrder:t,dilations:r,...a,cacheKey:""};return{...i,cacheKey:Dl(i)}},Gh=e=>{let t=e.format;return{format:t,...ki,cacheKey:t}},Fh=(e,t)=>{$r(e.inputs),e.compute(Si("GlobalMaxPool",e.inputs[0],!0,t))}}),Bl,Ml,jh,Kh,w0=Y(()=>{pe(),me(),Le(),ye(),Bl=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[0].dataType===6&&e.length>2)throw new Error("In the case of dequantizing int32 there is no zero point.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,a)=>r===e[2].dims[a]).reduce((r,a)=>r&&a,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((i,s)=>s===t.axis||i===e[0].dims[s]).reduce((i,s)=>i&&s,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],a=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/a)||t.blockSize>Math.ceil(r/(a-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Ml=(e,t)=>{let r=B.normalizeAxis(t.axis,e[0].dims.length),a=e[0].dataType,i=a===3,s=e[0].dims,n=e[1].dataType,o=B.size(s),d=a===3||a===2,p=d?[Math.ceil(B.size(e[0].dims)/4)]:e[0].dims,h=e[1].dims,f=e.length>2?e[2]:void 0,l=f?d?[Math.ceil(B.size(f.dims)/4)]:f.dims:void 0,g=h.length===0||h.length===1&&h[0]===1,_=g===!1&&h.length===1,y=Me(o),$=g&&(!d||y===4),w=$?y:1,v=$&&!d?y:1,S=q("input",d?12:a,p.length,v),k=q("scale",n,h.length),T=f?q("zero_point",d?12:a,l.length):void 0,I=se("output",n,s.length,w),C=[S,k];T&&C.push(T);let E=[p,h];f&&E.push(l);let O=[{type:12,data:o/w},{type:12,data:r},{type:12,data:t.blockSize},...ue(...E,s)],A=P=>{let G=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${P.registerUniforms(G).declareVariables(...C,I)}
      ${P.mainStart()}
          ${P.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${I.offsetToIndices("global_idx")};

          // Set input x
          ${d?`
            let input = ${S.getByOffset("global_idx / 4")};
            let x_vec = ${i?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${w===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${S.getByOffset("global_idx")};`};

          // Set scale input
          ${g?`let scale_value= ${k.getByOffset("0")}`:_?`
            let scale_index = ${I.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${k.getByOffset("scale_index")};`:`
            var scale_indices: ${k.type.indices} = output_indices;
            let index = ${k.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${k.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${k.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${T?g?d?`
                let zero_point_input = ${T.getByOffset("0")};
                let zero_point_vec =  ${i?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${T.getByOffset("0")}`:_?d?`
                let zero_point_index = ${I.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${T.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${i?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${I.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${T.getByOffset("zero_point_index")};`:d?`
                let zero_point_offset = ${k.indicesToOffset("scale_indices")};
                let zero_point_input = ${T.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${i?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${T.getByIndices("scale_indices")};`:`let zero_point_value = ${d?i?"i32":"u32":S.type.value}(0);`};
      // Compute and write output
      ${I.setByOffset("global_idx",`${I.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:T?["rank","rank","rank"]:["rank","rank"]},getShaderSource:A,getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(o/w/64),y:1,z:1},programUniforms:O})}},jh=(e,t)=>{Bl(e.inputs,t),e.compute(Ml(e.inputs,t))},Kh=e=>Ae({axis:e.axis,blockSize:e.blockSize})}),Nl,Pl,Qh,x0=Y(()=>{ht(),pe(),ye(),Nl=(e,t,r)=>{let a=e===t,i=e<t&&r<0,s=e>t&&r>0;if(a||i||s)throw new Error("Range these inputs' contents are invalid.")},Pl=(e,t,r,a)=>{let i=Math.abs(Math.ceil((t-e)/r)),s=[i],n=i,o=[{type:12,data:n},{type:a,data:e},{type:a,data:r},...ue(s)],d=p=>{let h=se("output",a,s.length),f=h.type.value,l=[{name:"outputSize",type:"u32"},{name:"start",type:f},{name:"delta",type:f}];return`
        ${p.registerUniforms(l).declareVariables(h)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${f}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${a}`},getShaderSource:d,getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:o})}},Qh=e=>{let t=0,r=0,a=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],a=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],a=e.inputs[2].getFloat32Array()[0]),De.webgpu.validateInputContent&&Nl(t,r,a),e.compute(Pl(t,r,a,e.inputs[0].dataType),{inputs:[]})}}),Ul,Vl,Zh,Yh,k0=Y(()=>{pe(),me(),Le(),ye(),Ul=(e,t,r,a)=>{if(e!=="none"&&a!=="i32"&&a!=="u32"&&a!=="f32")throw new Error(`Input ${a} is not supported with reduction ${e}.`);let i=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,s=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return a==="i32"||a==="u32"?`atomicAdd(&${t}, bitcast<${a}>(${r}));`:`
              ${i}bitcast<${a}>(oldValue) + (${r})${s}`;case"max":return a==="i32"||a==="u32"?`atomicMax(&${t}, bitcast<${a}>(${r}));`:`
                ${i}max(bitcast<f32>(oldValue), (${r}))${s}`;case"min":return a==="i32"||a==="u32"?`atomicMin(&${t}, bitcast<${a}>(${r}));`:`${i}min(bitcast<${a}>(oldValue), (${r}))${s}`;case"mul":return`${i}(bitcast<${a}>(oldValue) * (${r}))${s}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Vl=(e,t)=>{let r=e[0].dims,a=e[1].dims,i=r,s=1,n=Math.ceil(B.size(a)/s),o=a[a.length-1],d=B.sizeFromDimension(r,o),p=[{type:12,data:n},{type:12,data:o},{type:12,data:d},...ue(e[1].dims,e[2].dims,i)],h=f=>{let l=q("indices",e[1].dataType,e[1].dims.length),g=q("updates",e[2].dataType,e[2].dims.length,s),_=t.reduction!=="none"&&t.reduction!==""?Ep("output",e[0].dataType,i.length):se("output",e[0].dataType,i.length,s);return`
      ${f.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(l,g,_)}
      ${f.mainStart()}
        ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start + uniforms.last_index_dimension];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Ul(t.reduction,"output[data_offset + i]","value",_.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:p}),getShaderSource:h}},Zh=e=>Ae({reduction:e.reduction}),Yh=(e,t)=>{e.compute(Vl(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Wl,Ll,ql,Ti,Hl,Gl,Fl,jl,Kl,Ql,Zl,Yl,Ei,Xl,Jl,ed,td,rd,Xh,Jh,S0=Y(()=>{pe(),me(),Le(),ye(),Wl=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Ll=(e,t,r)=>{t.every(i=>i>=0&&i<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let a=new Array(r).fill(1);return t.forEach((i,s)=>a[i]=e[s]),a},ql=(e,t,r,a,i,s)=>{let[n,o,d]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(n>0&&e.length>n&&e[n].dims.length>0)e[n].getFloat32Array().forEach(h=>s.push(h));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(o>0&&e.length>o&&e[o].dims.length===1&&e[o].dims[0]>0){if(e[o].getFloat32Array().forEach(h=>a.push(h)),a.length!==0&&a.length!==p&&r>=18&&a.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Wl(a,t),t.axes.length>0&&Ll(a,t.axes,p).forEach((h,f)=>a[f]=h)}if(d>0&&e.length>d&&e[d].dims.length===1&&e[d].dims[0]>0&&(e[d].getBigInt64Array().forEach(h=>i.push(Number(h))),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof a<"u"&&typeof i<"u"&&a.length>0&&i.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},Ti=(e,t,r,a)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${a}(big / (${r}));
  let fract = ${a}(big % (${r})) / ${a}(${r});
  return whole + fract;
`,Hl=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${Ti("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${Ti("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Gl=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";case"simple":default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Fl=(e,t,r)=>{let a=new Array(r).fill(0).concat(new Array(r).fill(1)),i=e.length===0?a:e.slice();return t.length>0?(t.forEach((s,n)=>{a[s]=i[n],a[n+r]=i[t.length+n]}),a):i},jl=(e,t,r,a)=>{let i=[];if(r.length>0)if(a.length>0){if(e.forEach(s=>i.push(s)),Math.max(...a)>e.length)throw new Error("axes is out of bound");a.forEach((s,n)=>i[s]=r[n])}else r.forEach(s=>i.push(s));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");i=e.map((s,n)=>Math.round(s*t[n]))}return i},Kl=(e,t,r)=>{let a=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(s=>t[s]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(s=>t[s]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let i=e.slice();return r.axes.length>0?(r.axes.forEach(s=>t[s]=a),r.axes.forEach(s=>i[s]=Math.round(e[s]*t[s]))):(t.fill(a,0,t.length),i.forEach((s,n)=>i[n]=Math.round(s*t[n]))),i},Ql=(e,t,r,a,i)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${oe("uniforms.scales","i",a)};
        var roi_low = ${oe("uniforms.roi","i",i)};
        var roi_hi = ${oe("uniforms.roi",`i + ${t.length}`,i)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${oe("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${oe("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Zl=(e,t,r,a,i,s,n)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${a.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${oe("uniforms.scales","i",i)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${oe("uniforms.roi","i",s)};
          var roi_hi = ${oe("uniforms.roi",`i + ${r.length}`,s)};
          var input_shape_i = ${oe("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${oe("uniforms.output_shape","i",a.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${n} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,Yl=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${oe("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,Ei=(e,t,r,a)=>e.rank>a?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Xl=(e,t,r,a,i)=>{let[s,n,o,d]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",n,`max(0, min(row, ${r[n]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(col, ${r[o]} - 1))`)};
      ${Ei(e,d,s,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${n}];
      var col:${p} = originalIndices[${o}];
      ${a?`if (row < 0 || row > (${r[n]} - 1) || col < 0 || col > (${r[o]} - 1)) {
        return ${i};
      }`:""};
      row = max(0, min(row, ${r[n]} - 1));
      col = max(0, min(col, ${r[o]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${s}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Jl=(e,t,r,a,i,s,n,o,d,p)=>{let h=r.length===2,[f,l]=h?[0,1]:[2,3],g=e.type.value,_=y=>{let $=y===f?"row":"col";return`
      fn ${$}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${g} {
        var output_index = ${t.indicesGet("output_indices",y)};
        var originalIdx: ${g} = getOriginalCoordinateFromResizedCoordinate(output_index, ${i[y]},
        ${a[y]}, ${r[y]}, ${s[y]}, ${s[y]} + ${r.length});
        var fractOriginalIdx: ${g} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${o} && (originalIdx < 0 || originalIdx > (${r[y]} - 1))) {
          return ${d};
        }
        var data: array<${g}, 4> = array<${g}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${$}: ${g} = originalIdx + ${g}(i);
          if (${$} < 0 || ${$} >= ${r[y]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:o?`return ${d};`:`${$} = max(0, min(${$}, ${r[y]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",y,`u32(${$})`)};
          data[i + 1] = ${y===f?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(f)};
    ${_(l)};
  fn getCubicInterpolationCoefs(s: ${g}) -> array<${g}, 4> {
    var absS = abs(s);
    var coeffs: array<${g}, 4> = array<${g}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${g} = 1.0 - absS;
    var twoMinusAbsS: ${g} = 2.0 - absS;
    var onePlusAbsS: ${g} = 1.0 + absS;
    coeffs[0] = ((${n} * onePlusAbsS - 5 * ${n}) * onePlusAbsS + 8 * ${n}) * onePlusAbsS - 4 * ${n};
    coeffs[1] = ((${n} + 2) * absS - (${n} + 3)) * absS * absS + 1;
    coeffs[2] = ((${n} + 2) * oneMinusAbsS - (${n} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${n} * twoMinusAbsS - 5 * ${n}) * twoMinusAbsS + 8 * ${n}) * twoMinusAbsS - 4 * ${n};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${g}, 4>, coefs: array<${g}, 4>) -> ${g} {
    var coefsSum: ${g} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${g} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},ed=(e,t,r,a,i)=>{let[s,n,o,d,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],h=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",n,`max(0, min(depth, ${r[n]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(height, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",d,`max(0, min(width, ${r[d]} - 1))`)};
      ${Ei(e,p,s,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${n}];
      var height:${h} = originalIndices[${o}];
      var width:${h} = originalIndices[${d}];
      ${a?`if (depth < 0 || depth > (${r[n]} - 1) || height < 0 || height > (${r[o]} - 1) || width < 0 || (width > ${r[d]} - 1)) {
      return ${i};
        }`:""};

    depth = max(0, min(depth, ${r[n]} - 1));
      height = max(0, min(height, ${r[o]} - 1));
      width = max(0, min(width, ${r[d]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${s}])`:"0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},td=(e,t,r,a,i,s)=>{let n=e.dims,o=Fl(s,t.axes,n.length),d=jl(n,a,i,t.axes),p=a.slice();a.length===0&&(p=n.map((v,S)=>v===0?1:d[S]/v),t.keepAspectRatioPolicy!=="stretch"&&(d=Kl(n,p,t)));let h=se("output",e.dataType,d.length),f=q("input",e.dataType,n.length),l=B.size(d),g=n.length===d.length&&n.every((v,S)=>v===d[S]),_=t.coordinateTransformMode==="tf_crop_and_resize",y=t.extrapolationValue,$=f.type.value,w=v=>`
      ${g?"":`
      ${Hl(t.coordinateTransformMode,$)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${Yl(f,n)};
              ${Gl(t.nearestMode,r,$)};
              ${Zl(f,h,n,d,p.length,o.length,_)};
              `;case"linear":return`
              ${Ql(h,n,d,p.length,o.length)};
              ${(()=>{if(n.length===2||n.length===4)return`${Xl(f,h,n,_,y)}`;if(n.length===3||n.length===5)return`${ed(f,h,n,_,y)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(n.length===2||n.length===4)return`${Jl(f,h,n,d,p,o,t.cubicCoeffA,_,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${v.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",o.length).declareVariables(f,h)}
      ${v.mainStart()}
        ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${g?"output[global_idx] = input[global_idx];":`
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${f.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${f.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${n.length===2||n.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${i.length>0?i:""}|${o.length>0?o:""}|${g}|${t.mode==="nearest"?n.length:n}`,inputDependencies:["rank"]},getShaderSource:w,getRunData:()=>({outputs:[{dims:d,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:[{type:12,data:l},{type:1,data:p},{type:1,data:o},...ue(n,d)]})}},rd=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},Xh=(e,t)=>{let r=[],a=[],i=[],s=rd(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");ql(e.inputs,t,s,r,a,i),e.compute(td(e.inputs[0],t,s,r,a,i),{inputs:[0]})},Jh=e=>{let t=e.antialias,r=e.axes,a=e.coordinateTransformMode,i=e.cubicCoeffA,s=e.excludeOutside!==0,n=e.extrapolationValue,o=e.keepAspectRatioPolicy,d=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return Ae({antialias:t,axes:r,coordinateTransformMode:a,cubicCoeffA:i,excludeOutside:s,extrapolationValue:n,keepAspectRatioPolicy:o,mode:d,nearestMode:p})}}),ad,id,ef,T0=Y(()=>{pe(),me(),Le(),ye(),ad=(e,t)=>{let[r,a,i,s]=e,{numHeads:n,rotaryEmbeddingDim:o}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!B.areEqual(a.dims,[])&&!B.areEqual(a.dims,[1])&&a.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${a.dims.length}`);if(i.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${i.dims.length}`);if(s.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${s.dims.length}`);if(!B.areEqual(i.dims,s.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(o>0&&n===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let d=r.dims[0],p=r.dims[r.dims.length-2],h=i.dims[0],f=B.sizeFromDimension(r.dims,1)/p,l=o===0?i.dims[1]*2:f/n;if(o>l)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(a.dims.length===2){if(d!==a.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${a.dims[0]}`);if(p!==a.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${a.dims[1]}`)}if(l/2!==i.dims[1]&&o/2!==i.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${i.dims[1]}`);if(p>h)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported")},id=(e,t)=>{let{interleaved:r,numHeads:a,rotaryEmbeddingDim:i,scale:s}=t,n=e[0].dims[0],o=B.sizeFromDimension(e[0].dims,1),d=e[0].dims[e[0].dims.length-2],p=o/d,h=e[2].dims[1],f=i===0?h*2:p/a,l=new Array(n,d,p/f,f-h),g=B.computeStrides(l),_=[{type:1,data:s},{type:12,data:l},{type:12,data:g},...e[0].dims.length===3?new Array({type:12,data:[o,p,f,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[o,f,d*f,1]}):[],...ue(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],y=$=>{let w=q("input",e[0].dataType,e[0].dims.length),v=q("position_ids",e[1].dataType,e[1].dims.length),S=q("cos_cache",e[2].dataType,e[2].dims.length),k=q("sin_cache",e[3].dataType,e[3].dims.length),T=se("output",e[0].dataType,e[0].dims.length);return $.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:l.length},{name:"global_strides",type:"u32",length:g.length},{name:"input_output_strides",type:"u32",length:g.length}]),`
        ${$.declareVariables(w,v,S,k,T)}

        ${$.mainStart(ur)}
          let half_rotary_emb_dim = uniforms.${S.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${v.broadcastedIndicesToOffset("bsnh.xy",se("",v.type.tensor,2))};
            let position_id =
                u32(${v.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${w.getByOffset("i")} * ${S.get("position_id","bsnh[3]")} -
                ${w.getByOffset("j")} * ${k.get("position_id","bsnh[3]")};
            ${T.setByOffset("i","re")}
            let im = ${w.getByOffset("i")} * ${k.get("position_id","bsnh[3]")} +
                ${w.getByOffset("j")} * ${S.get("position_id","bsnh[3]")};
            ${T.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${T.setByOffset("k",w.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:Ae({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:y,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(B.size(l)/ur)},programUniforms:_})}},ef=(e,t)=>{ad(e.inputs,t),e.compute(id(e.inputs,t))}}),nd,sd,tf,E0=Y(()=>{pe(),me(),ye(),nd=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],a=e[2];if(t.dataType!==r.dataType||t.dataType!==a.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let i=t.dims[t.dims.length-1],s=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==i)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==s)throw new Error("Skip must have the same sequence length as input");if(a.dims.length!==1)throw new Error("Gamma must be 1D");if(a.dims[a.dims.length-1]!==i)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let n=e[3];if(n.dims.length!==1)throw new Error("Beta must be 1D");if(n.dims[n.dims.length-1]!==i)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let n=e[4];if(n.dims.length!==1)throw new Error("Bias must be 1D");if(n.dims[n.dims.length-1]!==i)throw new Error("Bias must have the same hidden size as input")}},sd=(e,t,r,a)=>{let i=t.simplified,s=e[0].dims,n=B.size(s),o=s,d=n,p=s.slice(-1)[0],h=a?s.slice(0,-1).concat(1):[],f=!i&&e.length>3,l=e.length>4,g=a&&r>1,_=a&&r>2,y=r>3,$=64,w=Me(p),v=[{type:12,data:d},{type:12,data:w},{type:12,data:p},{type:1,data:t.epsilon}],S=T=>{let I=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],C=[q("x",e[0].dataType,e[0].dims,w),q("skip",e[1].dataType,e[1].dims,w),q("gamma",e[2].dataType,e[2].dims,w)];f&&C.push(q("beta",e[3].dataType,e[3].dims,w)),l&&C.push(q("bias",e[4].dataType,e[4].dims,w)),C.push(se("output",e[0].dataType,o,w)),g&&C.push(se("mean_output",1,h)),_&&C.push(se("inv_std_output",1,h)),y&&C.push(se("input_skip_bias_sum",e[0].dataType,o,w));let E=je(e[0].dataType),O=je(1,w);return`

      ${T.registerUniforms(I).declareVariables(...C)}
      var<workgroup> sum_shared : array<${O}, ${$}>;
      var<workgroup> sum_squared_shared : array<${O}, ${$}>;

      ${T.mainStart([$,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${$};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${$};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${$-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${l?"bias[offset1d + i]":E+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${y?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${nr(E,w,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${$};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${Mt("sum",w)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${Mt("square_sum",w)} / f32(uniforms.hidden_size) ${i?"":"- mean * mean"} + uniforms.epsilon);
        ${g?"mean_output[global_idx] = mean;":""}
        ${_?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${i?"":`- ${E}(mean)`}) *
            ${E}(inv_std_dev) * gamma[offset1d + i]
            ${f?"+ beta[offset1d + i]":""};
        }
      }`},k=[{dims:o,dataType:e[0].dataType}];return r>1&&k.push({dims:h,dataType:1}),r>2&&k.push({dims:h,dataType:1}),r>3&&k.push({dims:s,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${w};${g};${_};${y}`,inputDependencies:e.map((T,I)=>"type")},getShaderSource:S,getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(d/p)},programUniforms:v})}},tf=(e,t)=>{nd(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(sd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),od,vr,ud,Ii,ld,dd,rf,af,I0=Y(()=>{pe(),me(),Le(),ye(),od=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,a)=>{if(e[a+1].dataType!==6&&e[a+1].dataType!==7)throw new Error(`Input ${a} must be an array of int32 or int64`)})},vr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(a=>r.push(Number(a)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(a=>r.push(Number(a)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},ud=(e,t)=>{if(e.length>1){let r=vr(e,1),a=vr(e,2),i=vr(e,3);return i.length===0&&(i=[...Array(e[0].dims.length).keys()]),Ae({starts:r,ends:a,axes:i})}else return t},Ii=(e,t,r,a,i)=>{let s=e;return e<0&&(s+=r[a[t]]),i[t]<0?Math.max(0,Math.min(s,r[a[t]]-1)):Math.max(0,Math.min(s,r[a[t]]))},ld=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length}; i >= 0; i--) {
            let input_shape_i = ${oe("uniforms.input_shape","i",r.length)};
            let steps_i = ${oe("uniforms.steps","i",r.length)};
            let signs_i = ${oe("uniforms.signs","i",r.length)};
            let starts_i = ${oe("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,dd=(e,t)=>{let r=e[0].dims,a=B.size(r),i=t.axes.length>0?B.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],s=vr(e,4);s.forEach(w=>w!==0||(()=>{throw new Error("step cannot be 0")})),s.length===0&&(s=Array(i.length).fill(1));let n=t.starts.map((w,v)=>Ii(w,v,r,i,s)),o=t.ends.map((w,v)=>Ii(w,v,r,i,s));if(i.length!==n.length||i.length!==o.length)throw new Error("start, ends and axes should have the same number of elements");if(i.length!==r.length)for(let w=0;w<r.length;++w)i.includes(w)||(n.splice(w,0,0),o.splice(w,0,r[w]),s.splice(w,0,1));let d=s.map(w=>Math.sign(w));s.forEach((w,v,S)=>{if(w<0){let k=(o[v]-n[v])/w,T=n[v],I=T+k*s[v];n[v]=I,o[v]=T,S[v]=-w}});let p=r.slice(0);i.forEach((w,v)=>{p[w]=Math.ceil((o[w]-n[w])/s[w])});let h={dims:p,dataType:e[0].dataType},f=se("output",e[0].dataType,p.length),l=q("input",e[0].dataType,e[0].dims.length),g=B.size(p),_=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:n.length},{name:"signs",type:"i32",length:d.length},{name:"steps",type:"u32",length:s.length}],y=[{type:12,data:g},{type:12,data:n},{type:6,data:d},{type:12,data:s},...ue(e[0].dims,p)],$=w=>`
      ${w.registerUniforms(_).declareVariables(l,f)}
        ${ld(l,f,r)}
        ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${f.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${f.setByOffset("global_idx",l.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${d.length}_${n.length}_${s.length}`,inputDependencies:["rank"]},getShaderSource:$,getRunData:()=>({outputs:[h],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:y})}},rf=(e,t)=>{od(e.inputs,t);let r=ud(e.inputs,t);e.compute(dd(e.inputs,r),{inputs:[0]})},af=e=>{let t=e.starts,r=e.ends,a=e.axes;return Ae({starts:t,ends:r,axes:a})}}),pd,cd,nf,sf,C0=Y(()=>{pe(),me(),Le(),Nt(),ye(),pd=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},cd=(e,t)=>{let r=e.inputs[0],a=r.dims,i=B.size(a),s=a.length,n=B.normalizeAxis(t.axis,s),o=n<a.length-1,d,p=[];o?(p=Array.from({length:s},(C,E)=>E),p[n]=s-1,p[s-1]=n,d=e.compute(at(r,p),{inputs:[r],outputs:[-1]})[0]):d=r;let h=d.dims,f=h[s-1],l=i/f,g=Me(f),_=f/g,y=64;l===1&&(y=256);let $=(C,E)=>E===4?`max(max(${C}.x, ${C}.y), max(${C}.z, ${C}.w))`:E===2?`max(${C}.x, ${C}.y)`:E===3?`max(max(${C}.x, ${C}.y), ${C}.z)`:C,w=q("x",d.dataType,d.dims,g),v=se("result",d.dataType,d.dims,g),S=w.type.value,k=je(d.dataType)==="f32"?`var threadMax = ${S}(-3.402823e+38f);`:`var threadMax = ${S}(-65504.0h);`,T=C=>`
      var<workgroup> rowMaxShared : ${S};
      var<workgroup> rowSumShared : ${S};
      var<workgroup> threadShared : array<${S}, ${y}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${S} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${S}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${C.registerUniform("packedCols","i32").declareVariables(w,v)}
      ${C.mainStart(y)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${y};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${k}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${S}(${$("threadShared[0]",g)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${S}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${S}(${Mt("threadShared[0]",g)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          let value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          setValue(row, col, row_stride, value);
        }
      }`,I=e.compute({name:"Softmax",shaderCache:{hint:`${g};${y}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:h,dataType:d.dataType}],dispatchGroup:{x:l},programUniforms:[{type:6,data:_}]}),getShaderSource:T},{inputs:[d],outputs:[o?-1:0]})[0];o&&e.compute(at(I,p),{inputs:[I]})},nf=(e,t)=>{pd(e.inputs),cd(e,t)},sf=e=>Ae({axis:e.axis})}),Ci,hd,fd,md,of,z0=Y(()=>{pe(),me(),ye(),Ci=e=>Array.from(e.getBigInt64Array(),Number),hd=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(Ci(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},fd=(e,t)=>{let r=[];for(let a=0;a<e.length;++a)r.push(e[a]*t[a]);return r},md=(e,t)=>{let r=e[0].dims,a=t??Ci(e[1]),i=fd(r,a),s=B.size(i),n=e[0].dataType,o=q("input",n,r.length),d=se("output",n,i.length),p=h=>`
      const inputShape = ${o.indices(...r)};
      ${h.registerUniform("output_size","u32").declareVariables(o,d)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${d.offsetToIndices("global_idx")};
      var input_indices: ${o.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${o.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${d.indicesGet("output_indices","i")}  % input_dim_i;

        ${o.indicesSet("input_indices","i","input_dim_value")}
      }
      ${d.setByOffset("global_idx",o.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${a}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:[{type:12,data:s},...ue(e[0].dims,i)]}),getShaderSource:p}},of=e=>{hd(e.inputs),e.compute(md(e.inputs),{inputs:[0]})}}),gd,_d,uf,A0=Y(()=>{pe(),me(),ye(),gd=(e,t,r,a,i)=>{let s=se("output_data",i,r.length,4),n=q("a_data",t[1].dataType,t[1].dims.length,4),o=q("b_data",t[2].dataType,t[2].dims.length,4),d=q("c_data",t[0].dataType,t[0].dims.length,4),p,h=(f,l,g)=>`select(${l}, ${f}, ${g})`;if(!a)p=s.setByOffset("global_idx",h(n.getByOffset("global_idx"),o.getByOffset("global_idx"),d.getByOffset("global_idx")));else{let f=(l,g,_="")=>{let y=`a_data[index_a${g}][component_a${g}]`,$=`b_data[index_b${g}][component_b${g}]`,w=`bool(c_data[index_c${g}] & (0xffu << (component_c${g} * 8)))`;return`
            let output_indices${g} = ${s.offsetToIndices(`global_idx * 4u + ${g}u`)};
            let offset_a${g} = ${n.broadcastedIndicesToOffset(`output_indices${g}`,s)};
            let offset_b${g} = ${o.broadcastedIndicesToOffset(`output_indices${g}`,s)};
            let offset_c${g} = ${d.broadcastedIndicesToOffset(`output_indices${g}`,s)};
            let index_a${g} = offset_a${g} / 4u;
            let index_b${g} = offset_b${g} / 4u;
            let index_c${g} = offset_c${g} / 4u;
            let component_a${g} = offset_a${g} % 4u;
            let component_b${g} = offset_b${g} % 4u;
            let component_c${g} = offset_c${g} % 4u;
            ${l}[${g}] = ${_}(${h(y,$,w)});
          `};i===9?p=`
            var data = vec4<u32>(0);
            ${f("data",0,"u32")}
            ${f("data",1,"u32")}
            ${f("data",2,"u32")}
            ${f("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${f("output_data[global_idx]",0)}
            ${f("output_data[global_idx]",1)}
            ${f("output_data[global_idx]",2)}
            ${f("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(d,n,o,s)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},_d=e=>{let t=e[1].dims,r=e[2].dims,a=e[0].dims,i=e[1].dataType,s=!(B.areEqual(t,r)&&B.areEqual(r,a)),n=t,o=B.size(t);if(s){let p=or.calcShape(or.calcShape(t,r,!1),a,!1);if(!p)throw new Error("Can't perform where op on the given tensors");n=p,o=B.size(n)}let d=Math.ceil(o/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>gd(p,e,n,s,i),getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(o/64/4)},programUniforms:[{type:12,data:d},...ue(a,t,r,n)]})}},uf=e=>{e.compute(_d(e.inputs))}}),lf,O0=Y(()=>{Gg(),_n(),Fg(),jg(),Kg(),Qg(),Zg(),t0(),a0(),i0(),n0(),s0(),o0(),u0(),l0(),d0(),p0(),c0(),h0(),f0(),m0(),g0(),_0(),y0(),b0(),Ih(),$0(),v0(),w0(),x0(),k0(),gn(),S0(),T0(),E0(),I0(),C0(),Ah(),z0(),Nt(),yn(),A0(),lf=new Map([["Abs",[rc]],["Acos",[ac]],["Acosh",[ic]],["Add",[Pc]],["ArgMax",[Xp,Hi]],["ArgMin",[Yp,Hi]],["Asin",[nc]],["Asinh",[sc]],["Atan",[oc]],["Atanh",[uc]],["Attention",[Jp]],["AveragePool",[Vh,Uh]],["BatchNormalization",[ec]],["BiasAdd",[tc]],["BiasSplitGelu",[Nc]],["Cast",[dc,lc]],["Ceil",[cc]],["Clip",[pc]],["Concat",[Kc,Qc]],["Conv",[Zi,Qi]],["ConvTranspose",[nh,ih]],["Cos",[hc]],["Cosh",[fc]],["CumSum",[sh,oh]],["DepthToSpace",[uh,lh]],["DequantizeLinear",[jh,Kh]],["Div",[Uc]],["Einsum",[dh,ph]],["Elu",[mc,Er]],["Equal",[Vc]],["Erf",[gc]],["Exp",[_c]],["Expand",[ch]],["FastGelu",[hh]],["Floor",[yc]],["FusedConv",[Zi,Qi]],["Gather",[mh,fh]],["GatherElements",[vh,$h]],["GatherBlockQuantized",[yh,bh]],["GatherND",[gh,_h]],["Gelu",[bc]],["Gemm",[xh,wh]],["GlobalAveragePool",[Lh,Wh]],["GlobalMaxPool",[Fh,Gh]],["Greater",[Hc]],["GreaterOrEqual",[Fc]],["GridSample",[kh,Sh]],["GroupQueryAttention",[Oh]],["HardSigmoid",[Ec,Tc]],["InstanceNormalization",[Rh]],["LayerNormalization",[Dh]],["LeakyRelu",[$c,Er]],["Less",[Gc]],["LessOrEqual",[jc]],["Log",[Bc]],["MatMul",[Bh]],["MatMulNBits",[Mh,Nh]],["MaxPool",[qh,Hh]],["Mul",[Wc]],["MultiHeadAttention",[Eh,Th]],["Neg",[wc]],["Not",[vc]],["Pad",[Ph]],["Pow",[Lc]],["QuickGelu",[Mc,Er]],["Range",[Qh]],["Reciprocal",[xc]],["ReduceMin",[Fp]],["ReduceMean",[Wp]],["ReduceMax",[Gp]],["ReduceSum",[Kp]],["ReduceProd",[jp]],["ReduceL1",[Lp]],["ReduceL2",[qp]],["ReduceLogSum",[Zp]],["ReduceLogSumExp",[Hp]],["ReduceSumSquare",[Qp]],["Relu",[kc]],["Resize",[Xh,Jh]],["RotaryEmbedding",[ef]],["ScatterND",[Yh,Zh]],["Sigmoid",[Sc]],["Sin",[Ic]],["Sinh",[Cc]],["Slice",[rf,af]],["SkipLayerNormalization",[tf]],["Split",[Ch,zh]],["Sqrt",[zc]],["Softmax",[nf,sf]],["Sub",[qc]],["Tan",[Ac]],["Tanh",[Oc]],["ThresholdedRelu",[Dc,Er]],["Tile",[of]],["Transpose",[Cp,zp]],["Where",[uf]]])}),df,R0=Y(()=>{ht(),Et(),ye(),df=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,a,i){wt(e.programInfo.name);let s=this.backend.device,n=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let o=[];for(let p of t)o.push({binding:o.length,resource:{buffer:p.buffer}});for(let p of r)o.push({binding:o.length,resource:{buffer:p.buffer}});i&&o.push({binding:o.length,resource:i});let d=s.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:o,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:d,dispatchGroup:a};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}n.setPipeline(e.computePipeline),n.setBindGroup(0,d),n.dispatchWorkgroups(...a),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),pt(e.programInfo.name)}dispose(){}build(e,t){wt(e.name);let r=this.backend.device,a=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"},{feature:"subgroups-f16",extension:"subgroups_f16"}].forEach(p=>{r.features.has(p.feature)&&a.push(`enable ${p.extension};`)});let i=Ip(t,this.backend.device.limits),s=e.getShaderSource(i),n=`${a.join(`
`)}
${i.additionalImplementations}
${s}`,o=r.createShaderModule({code:n,label:e.name});ze("verbose",()=>`[WebGPU] ${e.name} shader code: ${n}`);let d=r.createComputePipeline({compute:{module:o,entryPoint:"main"},layout:"auto",label:e.name});return pt(e.name),{programInfo:e,computePipeline:d,uniformVariablesInfo:i.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,a=typeof e=="number"?1:e.z||1,i=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=i&&r<=i&&a<=i)return[t,r,a];let s=t*r*a,n=Math.ceil(Math.sqrt(s));if(n>i){if(n=Math.ceil(Math.cbrt(s)),n>i)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[n,n,n]}else return[n,n,1]}}}),yd,bd,$d,vd,pf,D0=Y(()=>{ht(),pe(),Et(),wp(),qg(),O0(),R0(),yd=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let a=0;a<e.length;++a){let i=e[a].dataType;switch(t[a]){case"none":{r.push("");break}case"type":{r.push(`${i}`);break}case"rank":{let s=e[a].dims.length;r.push(`${i};${s}`);break}case"dims":{let s=e[a].dims.join(",");r.push(`${i};${s}`);break}default:throw new Error(`unsupported input dependency: ${t[a]}`)}}return r.join("|")},bd=(e,t,r)=>{var i,s;let a=e.name;return(i=e.shaderCache)!=null&&i.hint&&(a+="["+e.shaderCache.hint+"]"),a+=":"+r+`:${yd(t,((s=e.shaderCache)==null?void 0:s.inputDependencies)??new Array(t.length).fill("dims"))}`,a},$d=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},vd=class{constructor(e){this.subgroupsSupported=e.features.has("subgroups"),this.subgroupsF16Supported=e.features.has("subgroups");let t=e.limits;!this.subgroupsSupported||!t.minSubgroupSize||!t.maxSubgroupSize?this.subgroupSizeRange=void 0:this.subgroupSizeRange=[t.minSubgroupSize,t.maxSubgroupSize]}},pf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],a={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},i=s=>t.features.has(s)&&r.push(s)&&!0;i("chromium-experimental-timestamp-query-inside-passes")||i("timestamp-query"),i("shader-f16"),i("subgroups")&&i("subgroups-f16"),this.device=await t.requestDevice(a),this.deviceInfo=new vd(this.device),this.adapterInfo=new $d(t.info||await t.requestAdapterInfo()),this.gpuDataManager=xp(this),this.programManager=new df(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,cn(e.logLevel,!!e.debug),this.device.onuncapturederror=s=>{s.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${s.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!1}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose()}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;wt(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{var a;let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let s=r[i],n=s.kernelId,o=this.kernels.get(n),d=o.kernelType,p=o.kernelName,h=s.programName,f=s.inputTensorViews,l=s.outputTensorViews,g=t[i*2],_=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let y=Number(g-this.queryTimeBase),$=Number(_-this.queryTimeBase);if(!Number.isSafeInteger(y)||!Number.isSafeInteger($))throw new RangeError("incorrect timestamp range");if((a=this.env.webgpu.profiling)!=null&&a.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:f.map(w=>({dims:w.dims,dataType:jt(w.dataType)})),outputsMetadata:l.map(w=>({dims:w.dims,dataType:jt(w.dataType)})),kernelId:n,kernelType:d,kernelName:p,programName:h,startTime:y,endTime:$});else{let w="";f.forEach((S,k)=>{w+=`input[${k}]: [${S.dims}] | ${jt(S.dataType)}, `});let v="";l.forEach((S,k)=>{v+=`output[${k}]: [${S.dims}] | ${jt(S.dataType)}, `}),console.log(`[profiling] kernel "${n}|${d}|${p}|${h}" ${w}${v}execution time: ${$-y} ns`)}pa("GPU",`${h}::${g}::${_}`)}e.unmap(),this.pendingQueries.delete(e)}),pt()}run(e,t,r,a,i,s){wt(e.name);let n=[];for(let v=0;v<t.length;++v){let S=t[v].data;if(S===0)continue;let k=this.gpuDataManager.get(S);if(!k)throw new Error(`no GPU data for input: ${S}`);n.push(k)}let{outputs:o,dispatchGroup:d,programUniforms:p}=e.getRunData(t),h=r.length===0?o.map((v,S)=>S):r;if(h.length!==o.length)throw new Error(`Output size ${h.length} must be equal to ${o.length}.`);let f=[],l=[];for(let v=0;v<o.length;++v){if(!Number.isInteger(h[v])||h[v]<-3||h[v]>=s)throw new Error(`Invalid output index: ${h[v]}`);if(h[v]===-3)continue;let S=h[v]===-1,k=h[v]===-2,T=S||k?i(o[v].dataType,o[v].dims):a(h[v],o[v].dataType,o[v].dims);if(f.push(T),T.data===0)continue;let I=this.gpuDataManager.get(T.data);if(!I)throw new Error(`no GPU data for output: ${T.data}`);if(S&&this.temporaryData.push(I),k){let C=this.kernelPersistentData.get(this.currentKernelId);C||(C=[],this.kernelPersistentData.set(this.currentKernelId,C)),C.push(I)}l.push(I)}if(n.length!==t.length||l.length!==f.length){if(l.length===0)return pt(e.name),f;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let g;if(p){let v=0,S=[];p.forEach(C=>{let E=typeof C.data=="number"?[C.data]:C.data;if(E.length===0)return;let O=C.type===10?2:4,A,P;C.type===10?(P=E.length>4?16:E.length>2?8:E.length*O,A=E.length>4?16:O*E.length):(P=E.length<=2?E.length*O:16,A=16),v=Math.ceil(v/P)*P,S.push(v);let G=C.type===10?8:4;v+=E.length>4?Math.ceil(E.length/G)*A:E.length*O});let k=16;v=Math.ceil(v/k)*k;let T=new ArrayBuffer(v);p.forEach((C,E)=>{let O=S[E],A=typeof C.data=="number"?[C.data]:C.data;if(C.type===6)new Int32Array(T,O,A.length).set(A);else if(C.type===12)new Uint32Array(T,O,A.length).set(A);else if(C.type===10)new Uint16Array(T,O,A.length).set(A);else if(C.type===1)new Float32Array(T,O,A.length).set(A);else throw new Error(`Unsupported uniform type: ${jt(C.type)}`)});let I=this.gpuDataManager.create(v,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(I.buffer,0,T,0,v),this.gpuDataManager.release(I.id),g={offset:0,size:v,buffer:I.buffer}}let _=this.programManager.normalizeDispatchGroupSize(d),y=_[1]===1&&_[2]===1,$=bd(e,t,y),w=this.programManager.getArtifact($);if(w||(w=this.programManager.build(e,_),this.programManager.setArtifact($,w),ze("info",()=>`[artifact] key: ${$}, programName: ${e.name}`)),p&&w.uniformVariablesInfo){if(p.length!==w.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${w.uniformVariablesInfo.length}, got ${p.length} in program "${w.programInfo.name}".`);for(let v=0;v<p.length;v++){let S=p[v],k=S.type,T=typeof S.data=="number"?1:S.data.length,[I,C]=w.uniformVariablesInfo[v];if(k!==I||T!==C)throw new Error(`Uniform variable ${v} mismatch: expect type ${I} with size ${C}, got type ${k} with size ${T} in program "${w.programInfo.name}".`)}}if(ze("info",()=>`[ProgramManager] run "${e.name}" (key=${$}) with ${_[0]}x${_[1]}x${_[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let v={kernelId:this.currentKernelId,programName:w.programInfo.name,inputTensorViews:t,outputTensorViews:f};this.pendingKernels.push(v),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(v)}return this.programManager.run(w,n,l,_,g),pt(e.name),f}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,a){let i=lf.get(e);if(!i)throw new Error(`kernel not implemented: ${e}`);let s={kernelType:e,kernelName:a,kernelEntry:i[0],attributes:[i[1],r]};this.kernels.set(t,s)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let a=this.kernels.get(e);if(!a)throw new Error(`kernel not created: ${e}`);let i=a.kernelType,s=a.kernelName,n=a.kernelEntry,o=a.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${i}] ${s}" is not allowed to be called recursively`);this.currentKernelId=e,o[0]&&(o[1]=o[0](o[1]),o[0]=void 0),ze("info",()=>`[WebGPU] Start to run kernel "[${i}] ${s}"...`);let d=this.env.debug;this.temporaryData=[];try{return d&&this.device.pushErrorScope("validation"),n(t,o[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${i}] ${s}" failed. ${p}`)),1}finally{d&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${i}] ${s}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,a){let i=this.sessionExternalDataMapping.get(e);i||(i=new Map,this.sessionExternalDataMapping.set(e,i));let s=i.get(t),n=this.gpuDataManager.registerExternalBuffer(r,a,s);return i.set(t,[n,r]),n}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let a=await Wi(this,e,t);return hn(a.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){var e;this.queryType="none",(((e=this.env.webgpu.profiling)==null?void 0:e.mode)==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){ze("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){ze("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){ze("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let a=0;a<r;a++){let i=this.getComputePassEncoder(),s=e[a];this.writeTimestamp(this.pendingDispatchNumber*2),i.setPipeline(s.computePipeline),i.setBindGroup(0,s.bindGroup),i.dispatchWorkgroups(...s.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[a]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),wd,zi,xd,Ai,Oi,Ri,kd,cf,B0=Y(()=>{Et(),wd=1,zi=()=>wd++,xd=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),Ai=(e,t)=>{let r=xd.get(e);if(!r)throw new Error("Unsupported data type.");return t.length>0?Math.ceil(t.reduce((a,i)=>a*i)*r/8):0},Oi=class{constructor(e){this.sessionId=e.sessionId,this.mlContext=e.context,this.mlTensor=e.tensor,this.dataType=e.dataType,this.tensorShape=e.shape}get tensor(){return this.mlTensor}get type(){return this.dataType}get shape(){return this.tensorShape}get byteLength(){return Ai(this.dataType,this.tensorShape)}destroy(){ze("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((a,i)=>a===r[i])}},Ri=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,a){if(this.wrapper){if(this.wrapper.canReuseTensor(e,t,r))return this.wrapper.tensor;if(a){if(this.wrapper.byteLength!==Ai(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let i=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(t,r,i,!0,!0),a&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){if(this.wrapper)if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(e);return}else ze("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor();this.activeUpload?this.activeUpload.set(e):this.activeUpload=new Uint8Array(e)}async download(e){if(this.activeUpload)if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(this.activeUpload):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(this.activeUpload);return}else return this.activeUpload.buffer;if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},kd=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}reserveTensorId(){let e=zi();return this.tensorTrackersById.set(e,new Ri(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,a){ze("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${e}, dataType: ${t}, shape: ${r}, copyOld: ${a}}`);let i=this.tensorTrackersById.get(e);if(!i)throw new Error("Tensor not found.");return i.ensureTensor(this.backend.currentContext,t,r,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){ze("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t==null?void 0:t.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,a){let i=zi(),s=new Oi({sessionId:this.backend.currentSessionId,context:e,tensor:t,dataType:r,shape:a});return this.tensorTrackersById.set(i,new Ri(this,s)),this.externalTensors.add(s),i}async getCachedTensor(e,t,r,a,i){let s=this.backend.currentSessionId,n=this.backend.currentContext;for(let[d,p]of this.freeTensors.entries())if(p.canReuseTensor(n,e,t)){ze("verbose",()=>`[WebNN] Reusing tensor {dataType: ${e}, shape: ${t}}`);let h=this.freeTensors.splice(d,1)[0];return h.sessionId=s,h}ze("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${e}, shape: ${t}}`);let o=await n.createTensor({dataType:e,shape:t,dimensions:t,usage:r,writable:a,readable:i});return new Oi({sessionId:s,context:n,tensor:o,dataType:e,shape:t})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},cf=(...e)=>new kd(...e)}),Di,Sd,hf,M0=Y(()=>{pe(),Yt(),wp(),B0(),Et(),Di=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Sd=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),a=Object.keys(t).sort();return r.length===a.length&&r.every((i,s)=>i===a[s]&&e[i]===t[i])},hf=class{constructor(e){this.tensorManager=cf(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],cn(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){this.activeSessionId=e}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(a=>a.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let a=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:a}),a}}else if(e===void 0){let r=this.mlContextCache.findIndex(a=>a.options===void 0&&a.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let a=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:a}),a}}let t=this.mlContextCache.findIndex(r=>Sd(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}get currentContext(){let e=this.getMLContext(this.currentSessionId);if(!e)throw new Error(`No MLContext found for session ${this.currentSessionId}`);return e}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e)}onReleaseSession(e){let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let a=this.mlContextCache.findIndex(i=>i.mlContext===t);a!==-1&&this.mlContextCache.splice(a,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){ze("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,a){let i=Di.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);return this.tensorManager.ensureTensor(e,i,r,a)}uploadTensor(e,t){if(!Fe().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");ze("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return hn(r,t)}}registerMLTensor(e,t,r){let a=Di.get(t);if(!a)throw new Error(`Unsupported ONNX data type: ${t}`);let i=this.tensorManager.registerTensor(this.currentContext,e,a,r);return ze("verbose",()=>`[WebNN] registerMLTensor {tensor: ${e}, dataType: ${a}, dimensions: ${r}} -> {tensorId: ${i}}`),i}registerMLConstant(e,t,r,a,i,s){if(!s)throw new Error("External mounted files are not available.");let n=e;e.startsWith("./")&&(n=e.substring(2));let o=s.get(n);if(!o)throw new Error(`File with name ${n} not found in preloaded files.`);if(t+r>o.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let d=o.slice(t,t+r).buffer,p;switch(i.dataType){case"float32":p=new Float32Array(d);break;case"float16":p=new Uint16Array(d);break;case"int32":p=new Int32Array(d);break;case"uint32":p=new Uint32Array(d);break;case"int64":p=new BigInt64Array(d);break;case"uint64":p=new BigUint64Array(d);break;case"int8":p=new Int8Array(d);break;case"int4":case"uint4":case"uint8":p=new Uint8Array(d);break;default:throw new Error(`Unsupported data type: ${i.dataType} in creating WebNN Constant from external data.`)}return ze("verbose",()=>`[WebNN] registerMLConstant {dataType: ${i.dataType}, shape: ${i.shape}}}`),a.constant(i,p)}flush(){}}}),ff={};Or(ff,{init:()=>mf});var ra,Td,mf,N0=Y(()=>{pe(),D0(),Et(),me(),M0(),ra=class gf{constructor(t,r,a,i){this.module=t,this.dataType=r,this.data=a,this.dims=i}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=B.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(B.size(t)!==B.size(this.dims))throw new Error("Invalid new shape");return new gf(this.module,this.dataType,this.data,t)}},Td=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo,this.deviceInfo=t.deviceInfo;let a=e.PTR_SIZE,i=r/e.PTR_SIZE,s=a===4?"i32":"i64";this.opKernelContext=Number(e.getValue(a*i++,s));let n=Number(e.getValue(a*i++,s));this.outputCount=Number(e.getValue(a*i++,s)),this.customDataOffset=Number(e.getValue(a*i++,"*")),this.customDataSize=Number(e.getValue(a*i++,s));let o=[];for(let d=0;d<n;d++){let p=Number(e.getValue(a*i++,s)),h=Number(e.getValue(a*i++,"*")),f=Number(e.getValue(a*i++,s)),l=[];for(let g=0;g<f;g++)l.push(Number(e.getValue(a*i++,s)));o.push(new ra(e,p,h,l))}this.inputs=o}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){var n;let r=((n=t==null?void 0:t.inputs)==null?void 0:n.map(o=>typeof o=="number"?this.inputs[o]:o))??this.inputs,a=(t==null?void 0:t.outputs)??[],i=(o,d,p)=>new ra(this.module,d,this.output(o,p),p),s=(o,d)=>{let p=ir(o,d);if(!p)throw new Error(`Unsupported data type: ${o}`);let h=p>0?this.backend.gpuDataManager.create(p).id:0;return new ra(this.module,o,h,d)};return this.backend.run(e,r,a,i,s,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let a=this.module.PTR_SIZE,i=a===4?"i32":"i64",s=this.module.stackAlloc((1+t.length)*a);this.module.setValue(s,t.length,i);for(let n=0;n<t.length;n++)this.module.setValue(s+a*(n+1),t[n],i);return this.module._JsepOutput(this.opKernelContext,e,s)}catch(a){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${a}`)}finally{this.module.stackRestore(r)}}},mf=async(e,t,r,a)=>{let i=t.jsepInit;if(!i)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let s=new pf;await s.initialize(r,a),i("webgpu",[s,n=>s.alloc(Number(n)),n=>s.free(n),(n,o,d,p=!1)=>{if(p)ze("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(n)}, dst=${Number(o)}, size=${Number(d)}`),s.memcpy(Number(n),Number(o));else{ze("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(n)}, gpuDataId=${Number(o)}, size=${Number(d)}`);let h=t.HEAPU8.subarray(Number(n>>>0),Number(n>>>0)+Number(d));s.upload(Number(o),h)}},async(n,o,d)=>{ze("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${n}, dataOffset=${o}, size=${d}`),await s.download(Number(n),()=>t.HEAPU8.subarray(Number(o)>>>0,Number(o+d)>>>0))},(n,o,d)=>s.createKernel(n,Number(o),d,t.UTF8ToString(t._JsepGetNodeName(Number(o)))),n=>s.releaseKernel(n),(n,o,d,p)=>{ze("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${d}, kernel=${n}, contextDataOffset=${o}`);let h=new Td(t,s,Number(o));return s.computeKernel(Number(n),h,p)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let s=new hf(r);i("webnn",[s,()=>s.reserveTensorId(),n=>s.releaseTensorId(n),async(n,o,d,p)=>s.ensureTensor(n,o,d,p),(n,o)=>{s.uploadTensor(n,o)},async(n,o)=>s.downloadTensor(n,o)])}}}),Ed,kn,Sn,Dt,Id,_a,Tn,En,Bi,In,Cn,zn,_f=Y(()=>{Wg(),Lg(),pe(),Yt(),on(),vp(),Ed=(e,t)=>{Fe()._OrtInit(e,t)!==0&&Ie("Can't initialize onnxruntime.")},kn=async e=>{Ed(e.wasm.numThreads,ha(e.logLevel))},Sn=async(e,t)=>{{let r=(N0(),da(ff)).init;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");let a=e.webgpu.adapter;if(a){if(typeof a.limits!="object"||typeof a.features!="object"||typeof a.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw new Error(`Invalid powerPreference setting: "${i}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(a=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:s}),!a)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}await r("webgpu",Fe(),e,a)}if(t==="webnn"){if(typeof navigator>"u"||!navigator.ml)throw new Error("WebNN is not supported in current environment");await r("webnn",Fe(),e)}}},Dt=new Map,Id=e=>{let t=Fe(),r=t.stackSave();try{let a=t.PTR_SIZE,i=t.stackAlloc(2*a);t._OrtGetInputOutputCount(e,i,i+a)!==0&&Ie("Can't get session input/output count.");let s=a===4?"i32":"i64";return[Number(t.getValue(i,s)),Number(t.getValue(i+a,s))]}finally{t.stackRestore(r)}},_a=e=>{let t=Fe(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},Tn=async(e,t)=>{var f,l,g;let r,a,i=Fe();Array.isArray(e)?[r,a]=e:e.buffer===i.HEAPU8.buffer?[r,a]=[e.byteOffset,e.byteLength]:[r,a]=_a(e);let s=0,n=0,o=0,d=[],p=[],h=[];try{if([n,d]=$p(t),(t==null?void 0:t.externalData)&&i.mountExternalData){let T=[];for(let I of t.externalData){let C=typeof I=="string"?I:I.path;T.push(pn(typeof I=="string"?I:I.data).then(E=>{i.mountExternalData(C,E)}))}await Promise.all(T)}for(let T of(t==null?void 0:t.executionProviders)??[])if((typeof T=="string"?T:T.name)==="webnn"){if(i.shouldTransferToMLTensor=!1,typeof T!="string"){let I=T,C=I==null?void 0:I.context,E=I==null?void 0:I.gpuDevice,O=I==null?void 0:I.deviceType,A=I==null?void 0:I.powerPreference;C?i.currentContext=C:E?i.currentContext=await i.jsepCreateMLContext(E):i.currentContext=await i.jsepCreateMLContext({deviceType:O,powerPreference:A})}else i.currentContext=await i.jsepCreateMLContext();break}s=await i._OrtCreateSession(r,a,n),s===0&&Ie("Can't create a session."),(f=i.jsepOnCreateSession)==null||f.call(i),i.currentContext&&(i.jsepRegisterMLContext(s,i.currentContext),i.currentContext=void 0,i.shouldTransferToMLTensor=!0);let[_,y]=Id(s),$=!!(t!=null&&t.enableGraphCapture),w=[],v=[],S=[];for(let T=0;T<_;T++){let I=i._OrtGetInputName(s,T);I===0&&Ie("Can't get an input name."),p.push(I),w.push(i.UTF8ToString(I))}for(let T=0;T<y;T++){let I=i._OrtGetOutputName(s,T);I===0&&Ie("Can't get an output name."),h.push(I);let C=i.UTF8ToString(I);v.push(C);{if($&&(t==null?void 0:t.preferredOutputLocation)===void 0){S.push("gpu-buffer");continue}let E=typeof(t==null?void 0:t.preferredOutputLocation)=="string"?t.preferredOutputLocation:((l=t==null?void 0:t.preferredOutputLocation)==null?void 0:l[C])??"cpu";if(E!=="cpu"&&E!=="cpu-pinned"&&E!=="gpu-buffer"&&E!=="ml-tensor")throw new Error(`Not supported preferred output location: ${E}.`);if($&&E!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${E}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);S.push(E)}}let k=null;return S.some(T=>T==="gpu-buffer"||T==="ml-tensor")&&(o=i._OrtCreateBinding(s),o===0&&Ie("Can't create IO binding."),k={handle:o,outputPreferredLocations:S,outputPreferredLocationsEncoded:S.map(T=>Vi(T))}),Dt.set(s,[s,p,h,k,$,!1]),[s,w,v]}catch(_){throw p.forEach(y=>i._OrtFree(y)),h.forEach(y=>i._OrtFree(y)),o!==0&&i._OrtReleaseBinding(o)!==0&&Ie("Can't release IO binding."),s!==0&&i._OrtReleaseSession(s)!==0&&Ie("Can't release session."),_}finally{i._free(r),n!==0&&i._OrtReleaseSessionOptions(n)!==0&&Ie("Can't release session options."),d.forEach(_=>i._free(_)),(g=i.unmountExternalData)==null||g.call(i)}},En=e=>{var d;let t=Fe(),r=Dt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[a,i,s,n,o]=r;n&&(o&&t._OrtClearBoundOutputs(n.handle)!==0&&Ie("Can't clear bound outputs."),t._OrtReleaseBinding(n.handle)!==0&&Ie("Can't release IO binding.")),(d=t.jsepOnReleaseSession)==null||d.call(t,e),i.forEach(p=>t._OrtFree(p)),s.forEach(p=>t._OrtFree(p)),t._OrtReleaseSession(a)!==0&&Ie("Can't release session."),Dt.delete(e)},Bi=(e,t,r,a,i,s=!1)=>{if(!e){t.push(0);return}let n=Fe(),o=n.PTR_SIZE,d=e[0],p=e[1],h=e[3],f,l;if(d==="string"&&(h==="gpu-buffer"||h==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&h!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${i} when enableGraphCapture is true.`);if(h==="gpu-buffer"){let y=e[2].gpuBuffer;l=ir(Sr(d),p);let $=n.jsepRegisterBuffer;if(!$)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');f=$(a,i,y,l)}else if(h==="ml-tensor"){let y=e[2].mlTensor;l=ir(Sr(d),p);let $=n.jsepRegisterMLTensor;if(!$)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');f=$(y,Sr(d),p)}else{let y=e[2];if(Array.isArray(y)){l=o*y.length,f=n._malloc(l),r.push(f);for(let $=0;$<y.length;$++){if(typeof y[$]!="string")throw new TypeError(`tensor data at index ${$} is not a string`);n.setValue(f+$*o,Qe(y[$],r),"*")}}else l=y.byteLength,f=n._malloc(l),r.push(f),n.HEAPU8.set(new Uint8Array(y.buffer,y.byteOffset,l),f)}let g=n.stackSave(),_=n.stackAlloc(4*p.length);try{p.forEach(($,w)=>n.setValue(_+w*o,$,o===4?"i32":"i64"));let y=n._OrtCreateTensor(Sr(d),f,l,_,p.length,Vi(h));y===0&&Ie(`Can't create tensor for input/output. session=${a}, index=${i}.`),t.push(y)}finally{n.stackRestore(g)}},In=async(e,t,r,a,i,s)=>{var P,G;let n=Fe(),o=n.PTR_SIZE,d=Dt.get(e);if(!d)throw new Error(`cannot run inference. invalid session id: ${e}`);let p=d[0],h=d[1],f=d[2],l=d[3],g=d[4],_=d[5],y=t.length,$=a.length,w=0,v=[],S=[],k=[],T=[],I=n.stackSave(),C=n.stackAlloc(y*o),E=n.stackAlloc(y*o),O=n.stackAlloc($*o),A=n.stackAlloc($*o);try{(P=n.jsepOnRunStart)==null||P.call(n,p),[w,v]=bp(s);for(let R=0;R<y;R++)Bi(r[R],S,T,e,t[R],g);for(let R=0;R<$;R++)Bi(i[R],k,T,e,y+a[R],g);for(let R=0;R<y;R++)n.setValue(C+R*o,S[R],"*"),n.setValue(E+R*o,h[t[R]],"*");for(let R=0;R<$;R++)n.setValue(O+R*o,k[R],"*"),n.setValue(A+R*o,f[a[R]],"*");if(l&&!_){let{handle:R,outputPreferredLocations:Q,outputPreferredLocationsEncoded:Z}=l;if(h.length!==y)throw new Error(`input count from feeds (${y}) is expected to be always equal to model's input count (${h.length}).`);for(let j=0;j<y;j++){let re=t[j];await n._OrtBindInput(R,h[re],S[j])!==0&&Ie(`Can't bind input[${j}] for session=${e}.`)}for(let j=0;j<$;j++){let re=a[j];(G=i[j])!=null&&G[3]?n._OrtBindOutput(R,f[re],k[j],0)!==0&&Ie(`Can't bind pre-allocated output[${j}] for session=${e}.`):n._OrtBindOutput(R,f[re],0,Z[re])!==0&&Ie(`Can't bind output[${j}] to ${Q[j]} for session=${e}.`)}Dt.set(e,[p,h,f,l,g,!0])}let N;l?N=await n._OrtRunWithBinding(p,l.handle,$,O,w):N=await n._OrtRun(p,E,C,y,A,$,O,w),N!==0&&Ie("failed to call OrtRun().");let M=[];for(let R=0;R<$;R++){let Q=Number(n.getValue(O+R*o,"*"));if(Q===k[R]){M.push(i[R]);continue}let Z=n.stackSave(),j=n.stackAlloc(4*o),re=!1,ne,D=0;try{n._OrtGetTensorData(Q,j,j+o,j+2*o,j+3*o)!==0&&Ie(`Can't access output tensor data on index ${R}.`);let F=o===4?"i32":"i64",te=Number(n.getValue(j,F));D=n.getValue(j+o,"*");let ce=n.getValue(j+o*2,"*"),$e=Number(n.getValue(j+o*3,F)),Re=[];for(let ke=0;ke<$e;ke++)Re.push(Number(n.getValue(ce+ke*o,F)));n._OrtFree(ce)!==0&&Ie("Can't free memory for tensor dims.");let Ge=Re.reduce((ke,Oe)=>ke*Oe,1);ne=jt(te);let He=l==null?void 0:l.outputPreferredLocations[a[R]];if(ne==="string"){if(He==="gpu-buffer"||He==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let ke=[];for(let Oe=0;Oe<Ge;Oe++){let Ye=n.getValue(D+Oe*o,"*"),xt=n.getValue(D+(Oe+1)*o,"*"),Pt=Oe===Ge-1?void 0:xt-Ye;ke.push(n.UTF8ToString(Ye,Pt))}M.push([ne,Re,ke,"cpu"])}else if(He==="gpu-buffer"&&Ge>0){let ke=n.jsepGetBuffer;if(!ke)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let Oe=ke(D),Ye=ir(te,Ge);if(Ye===void 0||!ln(ne))throw new Error(`Unsupported data type: ${ne}`);re=!0,M.push([ne,Re,{gpuBuffer:Oe,download:n.jsepCreateDownloader(Oe,Ye,ne),dispose:()=>{n._OrtReleaseTensor(Q)!==0&&Ie("Can't release tensor.")}},"gpu-buffer"])}else if(He==="ml-tensor"&&Ge>0){let ke=n.jsepEnsureTensor;if(!ke)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(ir(te,Ge)===void 0||!dn(ne))throw new Error(`Unsupported data type: ${ne}`);let Oe=await ke(D,te,Re,!1);re=!0,M.push([ne,Re,{mlTensor:Oe,download:n.jsepCreateMLTensorDownloader(D,ne),dispose:()=>{n.jsepReleaseTensorId(D),n._OrtReleaseTensor(Q)}},"ml-tensor"])}else{let ke=un(ne),Oe=new ke(Ge);new Uint8Array(Oe.buffer,Oe.byteOffset,Oe.byteLength).set(n.HEAPU8.subarray(D,D+Oe.byteLength)),M.push([ne,Re,Oe,"cpu"])}}finally{n.stackRestore(Z),ne==="string"&&D&&n._free(D),re||n._OrtReleaseTensor(Q)}}return l&&!g&&(n._OrtClearBoundOutputs(l.handle)!==0&&Ie("Can't clear bound outputs."),Dt.set(e,[p,h,f,l,g,!1])),M}finally{n.stackRestore(I),S.forEach(N=>n._OrtReleaseTensor(N)),k.forEach(N=>n._OrtReleaseTensor(N)),T.forEach(N=>n._free(N)),w!==0&&n._OrtReleaseRunOptions(w),v.forEach(N=>n._free(N))}},Cn=e=>{let t=Fe(),r=Dt.get(e);if(!r)throw new Error("invalid session id");let a=r[0],i=t._OrtEndProfiling(a);i===0&&Ie("Can't get an profile file name."),t._OrtFree(i)},zn=e=>{let t=[];for(let r of e){let a=r[2];!Array.isArray(a)&&"buffer"in a&&t.push(a.buffer)}return t}}),Bt,Je,rr,wr,xr,aa,Mi,ia,Ht,Gt,Cd,yf,bf,$f,vf,wf,xf,kf,Sf=Y(()=>{ht(),_f(),Yt(),nn(),Bt=()=>!!De.wasm.proxy&&typeof document<"u",rr=!1,wr=!1,xr=!1,ia=new Map,Ht=(e,t)=>{let r=ia.get(e);r?r.push(t):ia.set(e,[t])},Gt=()=>{if(rr||!wr||xr||!Je)throw new Error("worker not ready")},Cd=e=>{switch(e.data.type){case"init-wasm":rr=!1,e.data.err?(xr=!0,Mi[1](e.data.err)):(wr=!0,Mi[0]()),aa&&(URL.revokeObjectURL(aa),aa=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=ia.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}}},yf=async()=>{if(!wr){if(rr)throw new Error("multiple calls to 'initWasm()' detected.");if(xr)throw new Error("previous call to 'initWasm()' failed.");if(rr=!0,Bt())return new Promise((e,t)=>{Je==null||Je.terminate(),_p().then(([r,a])=>{var i;try{Je=a,Je.onerror=n=>t(n),Je.onmessage=Cd,Mi=[e,t];let s={type:"init-wasm",in:De};!s.in.wasm.wasmPaths&&(r||(i=import.meta.url)!=null&&i.startsWith("file:"))&&(s.in.wasm.wasmPaths={wasm:new URL(""+new URL("../assets/ort-wasm-simd-threaded.jsep.Y7jqkEt_.wasm",import.meta.url).href,import.meta.url).href}),Je.postMessage(s),aa=r}catch(s){t(s)}},t)});try{await sn(De.wasm),await kn(De),wr=!0}catch(e){throw xr=!0,e}finally{rr=!1}}},bf=async e=>{if(Bt())return Gt(),new Promise((t,r)=>{Ht("init-ep",[t,r]);let a={type:"init-ep",in:{epName:e,env:De}};Je.postMessage(a)});await Sn(De,e)},$f=async e=>Bt()?(Gt(),new Promise((t,r)=>{Ht("copy-from",[t,r]);let a={type:"copy-from",in:{buffer:e}};Je.postMessage(a,[e.buffer])})):_a(e),vf=async(e,t)=>{if(Bt()){if(t!=null&&t.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Gt(),new Promise((r,a)=>{Ht("create",[r,a]);let i={type:"create",in:{model:e,options:{...t}}},s=[];e instanceof Uint8Array&&s.push(e.buffer),Je.postMessage(i,s)})}else return Tn(e,t)},wf=async e=>{if(Bt())return Gt(),new Promise((t,r)=>{Ht("release",[t,r]);let a={type:"release",in:e};Je.postMessage(a)});En(e)},xf=async(e,t,r,a,i,s)=>{if(Bt()){if(r.some(n=>n[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(i.some(n=>n))throw new Error("pre-allocated output tensor is not supported for proxy.");return Gt(),new Promise((n,o)=>{Ht("run",[n,o]);let d=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:d,outputIndices:a,options:s}};Je.postMessage(p,zn(d))})}else return In(e,t,r,a,i,s)},kf=async e=>{if(Bt())return Gt(),new Promise((t,r)=>{Ht("end-profiling",[t,r]);let a={type:"end-profiling",in:e};Je.postMessage(a)});Cn(e)}}),Ni,zd,Tf,P0=Y(()=>{ht(),Sf(),pe(),an(),vp(),Ni=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},zd=e=>{switch(e[3]){case"cpu":return new bt(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!ln(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:a,dispose:i}=e[2];return bt.fromGpuBuffer(r,{dataType:t,dims:e[1],download:a,dispose:i})}case"ml-tensor":{let t=e[0];if(!dn(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:a,dispose:i}=e[2];return bt.fromMLTensor(r,{dataType:t,dims:e[1],download:a,dispose:i})}default:throw new Error(`invalid data location: ${e[3]}`)}},Tf=class{async fetchModelAndCopyToWasmMemory(e){return $f(await pn(e))}async loadModel(e,t){wt();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames]=await vf(r,t),pt()}async dispose(){return wf(this.sessionId)}async run(e,t,r){wt();let a=[],i=[];Object.entries(e).forEach(f=>{let l=f[0],g=f[1],_=this.inputNames.indexOf(l);if(_===-1)throw new Error(`invalid input '${l}'`);a.push(g),i.push(_)});let s=[],n=[];Object.entries(t).forEach(f=>{let l=f[0],g=f[1],_=this.outputNames.indexOf(l);if(_===-1)throw new Error(`invalid output '${l}'`);s.push(g),n.push(_)});let o=a.map((f,l)=>Ni(f,()=>`input "${this.inputNames[i[l]]}"`)),d=s.map((f,l)=>f?Ni(f,()=>`output "${this.outputNames[n[l]]}"`):null),p=await xf(this.sessionId,i,o,n,d,r),h={};for(let f=0;f<p.length;f++)h[this.outputNames[n[f]]]=s[f]??zd(p[f]);return pt(),h}startProfiling(){}endProfiling(){kf(this.sessionId)}}}),Ef={};Or(Ef,{OnnxruntimeWebAssemblyBackend:()=>Ji,initializeFlags:()=>Xi,wasmBackend:()=>If});var Xi,Ji,If,U0=Y(()=>{ht(),Sf(),P0(),Xi=()=>{if((typeof De.wasm.initTimeout!="number"||De.wasm.initTimeout<0)&&(De.wasm.initTimeout=0),De.wasm.simd===!1&&console.warn('Deprecated property "env.wasm.simd" is set to false. non-SIMD build is no longer provided, and this setting will be ignored.'),typeof De.wasm.proxy!="boolean"&&(De.wasm.proxy=!1),typeof De.wasm.trace!="boolean"&&(De.wasm.trace=!1),typeof De.wasm.numThreads!="number"||!Number.isInteger(De.wasm.numThreads)||De.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)De.wasm.numThreads=1;else{let e=typeof navigator>"u"?xg("node:os").cpus().length:navigator.hardwareConcurrency;De.wasm.numThreads=Math.min(4,Math.ceil((e||1)/2))}},Ji=class{async init(e){Xi(),await yf(),await bf(e)}async createInferenceSessionHandler(e,t){let r=new Tf;return await r.loadModel(e,t),Promise.resolve(r)}},If=new Ji});ht();ht();ht();var V0="1.21.0-dev.20250206-d981b153d3";{let e=(U0(),da(Ef)).wasmBackend;ar("webgpu",e,5),ar("webnn",e,5),ar("cpu",e,10),ar("wasm",e,10)}Object.defineProperty(De.versions,"web",{value:V0,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */const{Map:W0}=Xm;function Ad(e,t,r){const a=e.slice();return a[4]=t[r],a[23]=r,a}function L0(e){let t,r,a,i,s,n,o,d,p;return a=new sg({props:{className:"size-3"}}),{c(){t=X("div"),r=X("div"),Pe(a.$$.fragment),i=ge(),s=X("input"),this.h()},l(h){t=J(h,"DIV",{class:!0});var f=ee(t);r=J(f,"DIV",{class:!0});var l=ee(r);Ue(a.$$.fragment,l),l.forEach(W),i=_e(f),s=J(f,"INPUT",{class:!0,placeholder:!0}),f.forEach(W),this.h()},h(){H(r,"class","self-center ml-1 mr-3"),H(s,"class","w-full text-sm pr-4 py-1 rounded-r-xl outline-hidden bg-transparent"),H(s,"placeholder",n=e[3].t("Search")),H(t,"class","flex flex-1")},m(h,f){fe(h,t,f),V(t,r),Ve(a,r,null),V(t,i),V(t,s),Zs(s,e[0]),o=!0,d||(p=[sr(s,"input",e[8]),sr(s,"focus",e[9])],d=!0)},p(h,f){(!o||f&8&&n!==(n=h[3].t("Search")))&&H(s,"placeholder",n),f&1&&s.value!==h[0]&&Zs(s,h[0])},i(h){o||(he(a.$$.fragment,h),o=!0)},o(h){be(a.$$.fragment,h),o=!1},d(h){h&&W(t),We(a),d=!1,Ld(p)}}}function Od(e){let t,r,a,i;return a=new ng({}),{c(){t=X("div"),r=X("div"),Pe(a.$$.fragment),this.h()},l(s){t=J(s,"DIV",{class:!0});var n=ee(t);r=J(n,"DIV",{class:!0});var o=ee(r);Ue(a.$$.fragment,o),o.forEach(W),n.forEach(W),this.h()},h(){H(r,"class","m-auto"),H(t,"class","absolute top-0 bottom-0 left-0 right-0 flex")},m(s,n){fe(s,t,n),V(t,r),Ve(a,r,null),i=!0},i(s){i||(he(a.$$.fragment,s),i=!0)},o(s){be(a.$$.fragment,s),i=!1},d(s){s&&W(t),We(a)}}}function q0(e){let t,r,a,i,s=e[3].t("RK")+"",n,o,d,p=e[3].t("Model")+"",h,f,l,g=e[3].t("Rating")+"",_,y,$,w=e[3].t("Won")+"",v,S,k,T=e[3].t("Lost")+"",I,C,E,O=[],A=new W0,P,G=la(e[1]);const N=M=>M[4].id;for(let M=0;M<G.length;M+=1){let R=Ad(e,G,M),Q=N(R);A.set(Q,O[M]=Rd(Q,R))}return{c(){t=X("table"),r=X("thead"),a=X("tr"),i=X("th"),n=ve(s),o=ge(),d=X("th"),h=ve(p),f=ge(),l=X("th"),_=ve(g),y=ge(),$=X("th"),v=ve(w),S=ge(),k=X("th"),I=ve(T),C=ge(),E=X("tbody");for(let M=0;M<O.length;M+=1)O[M].c();this.h()},l(M){t=J(M,"TABLE",{class:!0});var R=ee(t);r=J(R,"THEAD",{class:!0});var Q=ee(r);a=J(Q,"TR",{class:!0});var Z=ee(a);i=J(Z,"TH",{scope:!0,class:!0});var j=ee(i);n=we(j,s),j.forEach(W),o=_e(Z),d=J(Z,"TH",{scope:!0,class:!0});var re=ee(d);h=we(re,p),re.forEach(W),f=_e(Z),l=J(Z,"TH",{scope:!0,class:!0});var ne=ee(l);_=we(ne,g),ne.forEach(W),y=_e(Z),$=J(Z,"TH",{scope:!0,class:!0});var D=ee($);v=we(D,w),D.forEach(W),S=_e(Z),k=J(Z,"TH",{scope:!0,class:!0});var F=ee(k);I=we(F,T),F.forEach(W),Z.forEach(W),Q.forEach(W),C=_e(R),E=J(R,"TBODY",{class:!0});var te=ee(E);for(let ce=0;ce<O.length;ce+=1)O[ce].l(te);te.forEach(W),R.forEach(W),this.h()},h(){H(i,"scope","col"),H(i,"class","px-3 py-1.5 cursor-pointer select-none w-3"),H(d,"scope","col"),H(d,"class","px-3 py-1.5 cursor-pointer select-none"),H(l,"scope","col"),H(l,"class","px-3 py-1.5 text-right cursor-pointer select-none w-fit"),H($,"scope","col"),H($,"class","px-3 py-1.5 text-right cursor-pointer select-none w-5"),H(k,"scope","col"),H(k,"class","px-3 py-1.5 text-right cursor-pointer select-none w-5"),H(a,"class",""),H(r,"class","text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-850 dark:text-gray-400 -translate-y-0.5"),H(E,"class",""),H(t,"class",P="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full rounded "+(e[2]?"opacity-20":""))},m(M,R){fe(M,t,R),V(t,r),V(r,a),V(a,i),V(i,n),V(a,o),V(a,d),V(d,h),V(a,f),V(a,l),V(l,_),V(a,y),V(a,$),V($,v),V(a,S),V(a,k),V(k,I),V(t,C),V(t,E);for(let Q=0;Q<O.length;Q+=1)O[Q]&&O[Q].m(E,null)},p(M,R){R&8&&s!==(s=M[3].t("RK")+"")&&Te(n,s),R&8&&p!==(p=M[3].t("Model")+"")&&Te(h,p),R&8&&g!==(g=M[3].t("Rating")+"")&&Te(_,g),R&8&&w!==(w=M[3].t("Won")+"")&&Te(v,w),R&8&&T!==(T=M[3].t("Lost")+"")&&Te(I,T),R&2&&(G=la(M[1]),O=Fd(O,R,N,1,M,G,A,E,Jm,Rd,null,Ad)),R&4&&P!==(P="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full rounded "+(M[2]?"opacity-20":""))&&H(t,"class",P)},d(M){M&&W(t);for(let R=0;R<O.length;R+=1)O[R].d()}}}function H0(e){let t,r=e[3].t("No models found")+"",a;return{c(){t=X("div"),a=ve(r),this.h()},l(i){t=J(i,"DIV",{class:!0});var s=ee(t);a=we(s,r),s.forEach(W),this.h()},h(){H(t,"class","text-center text-xs text-gray-500 dark:text-gray-400 py-1")},m(i,s){fe(i,t,s),V(t,a)},p(i,s){s&8&&r!==(r=i[3].t("No models found")+"")&&Te(a,r)},d(i){i&&W(t)}}}function G0(e){let t,r=(e[4].stats.won/e[4].stats.count*100).toFixed(1)+"",a,i,s,n,o=e[4].stats.won+"",d;return{c(){t=X("span"),a=ve(r),i=ve("%"),s=ge(),n=X("span"),d=ve(o),this.h()},l(p){t=J(p,"SPAN",{class:!0});var h=ee(t);a=we(h,r),i=we(h,"%"),h.forEach(W),s=_e(p),n=J(p,"SPAN",{class:!0});var f=ee(n);d=we(f,o),f.forEach(W),this.h()},h(){H(t,"class","hidden group-hover:inline"),H(n,"class","group-hover:hidden")},m(p,h){fe(p,t,h),V(t,a),V(t,i),fe(p,s,h),fe(p,n,h),V(n,d)},p(p,h){h&2&&r!==(r=(p[4].stats.won/p[4].stats.count*100).toFixed(1)+"")&&Te(a,r),h&2&&o!==(o=p[4].stats.won+"")&&Te(d,o)},d(p){p&&(W(t),W(s),W(n))}}}function F0(e){let t;return{c(){t=ve("-")},l(r){t=we(r,"-")},m(r,a){fe(r,t,a)},p:ct,d(r){r&&W(t)}}}function j0(e){let t,r=(e[4].stats.lost/e[4].stats.count*100).toFixed(1)+"",a,i,s,n,o=e[4].stats.lost+"",d;return{c(){t=X("span"),a=ve(r),i=ve("%"),s=ge(),n=X("span"),d=ve(o),this.h()},l(p){t=J(p,"SPAN",{class:!0});var h=ee(t);a=we(h,r),i=we(h,"%"),h.forEach(W),s=_e(p),n=J(p,"SPAN",{class:!0});var f=ee(n);d=we(f,o),f.forEach(W),this.h()},h(){H(t,"class","hidden group-hover:inline"),H(n,"class","group-hover:hidden")},m(p,h){fe(p,t,h),V(t,a),V(t,i),fe(p,s,h),fe(p,n,h),V(n,d)},p(p,h){h&2&&r!==(r=(p[4].stats.lost/p[4].stats.count*100).toFixed(1)+"")&&Te(a,r),h&2&&o!==(o=p[4].stats.lost+"")&&Te(d,o)},d(p){p&&(W(t),W(s),W(n))}}}function K0(e){let t;return{c(){t=ve("-")},l(r){t=we(r,"-")},m(r,a){fe(r,t,a)},p:ct,d(r){r&&W(t)}}}function Rd(e,t){var re;let r,a,i,s=(((re=t[4])==null?void 0:re.rating)!=="-"?t[23]+1:"-")+"",n,o,d,p,h,f,l,g,_,y,$=t[4].name+"",w,v,S,k=t[4].rating+"",T,I,C,E,O,A,P,G;function N(ne,D){return ne[4].stats.won==="-"?F0:G0}let M=N(t),R=M(t);function Q(ne,D){return ne[4].stats.lost==="-"?K0:j0}let Z=Q(t),j=Z(t);return{key:e,first:null,c(){r=X("tr"),a=X("td"),i=X("div"),n=ve(s),o=ge(),d=X("td"),p=X("div"),h=X("div"),f=X("img"),_=ge(),y=X("div"),w=ve($),v=ge(),S=X("td"),T=ve(k),I=ge(),C=X("td"),E=X("div"),R.c(),O=ge(),A=X("td"),P=X("div"),j.c(),G=ge(),this.h()},l(ne){r=J(ne,"TR",{class:!0});var D=ee(r);a=J(D,"TD",{class:!0});var F=ee(a);i=J(F,"DIV",{class:!0});var te=ee(i);n=we(te,s),te.forEach(W),F.forEach(W),o=_e(D),d=J(D,"TD",{class:!0});var ce=ee(d);p=J(ce,"DIV",{class:!0});var $e=ee(p);h=J($e,"DIV",{class:!0});var Re=ee(h);f=J(Re,"IMG",{src:!0,alt:!0,class:!0}),Re.forEach(W),_=_e($e),y=J($e,"DIV",{class:!0});var Ge=ee(y);w=we(Ge,$),Ge.forEach(W),$e.forEach(W),ce.forEach(W),v=_e(D),S=J(D,"TD",{class:!0});var He=ee(S);T=we(He,k),He.forEach(W),I=_e(D),C=J(D,"TD",{class:!0});var ke=ee(C);E=J(ke,"DIV",{class:!0});var Oe=ee(E);R.l(Oe),Oe.forEach(W),ke.forEach(W),O=_e(D),A=J(D,"TD",{class:!0});var Ye=ee(A);P=J(Ye,"DIV",{class:!0});var xt=ee(P);j.l(xt),xt.forEach(W),Ye.forEach(W),G=_e(D),D.forEach(W),this.h()},h(){var ne,D,F;H(i,"class","line-clamp-1"),H(a,"class","px-3 py-1.5 text-left font-medium text-gray-900 dark:text-white w-fit"),oa(f.src,l=((F=(D=(ne=t[4])==null?void 0:ne.info)==null?void 0:D.meta)==null?void 0:F.profile_image_url)??"/favicon.png")||H(f,"src",l),H(f,"alt",g=t[4].name),H(f,"class","size-5 rounded-full object-cover shrink-0"),H(h,"class","shrink-0"),H(y,"class","font-medium text-gray-800 dark:text-gray-200 pr-4"),H(p,"class","flex items-center gap-2"),H(d,"class","px-3 py-1.5 flex flex-col justify-center"),H(S,"class","px-3 py-1.5 text-right font-medium text-gray-900 dark:text-white w-max"),H(E,"class","w-10"),H(C,"class","px-3 py-1.5 text-right font-semibold text-green-500"),H(P,"class","w-10"),H(A,"class","px-3 py-1.5 text-right font-semibold text-red-500"),H(r,"class","bg-white dark:bg-gray-900 dark:border-gray-850 text-xs group"),this.first=r},m(ne,D){fe(ne,r,D),V(r,a),V(a,i),V(i,n),V(r,o),V(r,d),V(d,p),V(p,h),V(h,f),V(p,_),V(p,y),V(y,w),V(r,v),V(r,S),V(S,T),V(r,I),V(r,C),V(C,E),R.m(E,null),V(r,O),V(r,A),V(A,P),j.m(P,null),V(r,G)},p(ne,D){var F,te,ce,$e;t=ne,D&2&&s!==(s=(((F=t[4])==null?void 0:F.rating)!=="-"?t[23]+1:"-")+"")&&Te(n,s),D&2&&!oa(f.src,l=(($e=(ce=(te=t[4])==null?void 0:te.info)==null?void 0:ce.meta)==null?void 0:$e.profile_image_url)??"/favicon.png")&&H(f,"src",l),D&2&&g!==(g=t[4].name)&&H(f,"alt",g),D&2&&$!==($=t[4].name+"")&&Te(w,$),D&2&&k!==(k=t[4].rating+"")&&Te(T,k),M===(M=N(t))&&R?R.p(t,D):(R.d(1),R=M(t),R&&(R.c(),R.m(E,null))),Z===(Z=Q(t))&&j?j.p(t,D):(j.d(1),j=Z(t),j&&(j.c(),j.m(P,null)))},d(ne){ne&&W(r),R.d(),j.d()}}}function Q0(e){let t,r,a,i=e[3].t("Leaderboard")+"",s,n,o,d,p,h=e[1].length+"",f,l,g,_,y,$,w,v,S,k,T,I,C=e[3].t("The evaluation leaderboard is based on the Elo rating system and is updated in real-time.")+"",E,O,A=e[3].t("The leaderboard is currently in beta, and we may adjust the rating calculations as we refine the algorithm.")+"",P,G;_=new cr({props:{content:e[3].t("Re-rank models by topic similarity"),$$slots:{default:[L0]},$$scope:{ctx:e}}});let N=e[2]&&Od();function M(Z,j){return(Z[1]??[]).length===0?H0:q0}let R=M(e),Q=R(e);return{c(){t=X("div"),r=X("div"),a=X("div"),s=ve(i),n=ge(),o=X("div"),d=ge(),p=X("span"),f=ve(h),l=ge(),g=X("div"),Pe(_.$$.fragment),y=ge(),$=X("div"),N&&N.c(),w=ge(),Q.c(),v=ge(),S=X("div"),k=X("div"),T=X("div"),I=ve("ⓘ "),E=ve(C),O=ge(),P=ve(A),this.h()},l(Z){t=J(Z,"DIV",{class:!0});var j=ee(t);r=J(j,"DIV",{class:!0});var re=ee(r);a=J(re,"DIV",{class:!0});var ne=ee(a);s=we(ne,i),ne.forEach(W),n=_e(re),o=J(re,"DIV",{class:!0}),ee(o).forEach(W),d=_e(re),p=J(re,"SPAN",{class:!0});var D=ee(p);f=we(D,h),D.forEach(W),re.forEach(W),l=_e(j),g=J(j,"DIV",{class:!0});var F=ee(g);Ue(_.$$.fragment,F),F.forEach(W),j.forEach(W),y=_e(Z),$=J(Z,"DIV",{class:!0});var te=ee($);N&&N.l(te),w=_e(te),Q.l(te),te.forEach(W),v=_e(Z),S=J(Z,"DIV",{class:!0});var ce=ee(S);k=J(ce,"DIV",{class:!0});var $e=ee(k);T=J($e,"DIV",{class:!0});var Re=ee(T);I=we(Re,"ⓘ "),E=we(Re,C),Re.forEach(W),O=_e($e),P=we($e,A),$e.forEach(W),ce.forEach(W),this.h()},h(){H(a,"class","gap-1"),H(o,"class","flex self-center w-[1px] h-6 mx-2.5 bg-gray-50 dark:bg-gray-850"),H(p,"class","text-lg font-medium text-gray-500 dark:text-gray-300 mr-1.5"),H(r,"class","flex md:self-center text-lg font-medium px-0.5 shrink-0 items-center"),H(g,"class","flex space-x-2"),H(t,"class","mt-0.5 mb-2 gap-1 flex flex-col md:flex-row justify-between"),H($,"class","scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full rounded-sm pt-0.5"),H(T,"class","line-clamp-1"),H(k,"class","text-right"),H(S,"class","text-gray-500 text-xs mt-1.5 w-full flex justify-end")},m(Z,j){fe(Z,t,j),V(t,r),V(r,a),V(a,s),V(r,n),V(r,o),V(r,d),V(r,p),V(p,f),V(t,l),V(t,g),Ve(_,g,null),fe(Z,y,j),fe(Z,$,j),N&&N.m($,null),V($,w),Q.m($,null),fe(Z,v,j),fe(Z,S,j),V(S,k),V(k,T),V(T,I),V(T,E),V(k,O),V(k,P),G=!0},p(Z,[j]){(!G||j&8)&&i!==(i=Z[3].t("Leaderboard")+"")&&Te(s,i),(!G||j&2)&&h!==(h=Z[1].length+"")&&Te(f,h);const re={};j&8&&(re.content=Z[3].t("Re-rank models by topic similarity")),j&16777225&&(re.$$scope={dirty:j,ctx:Z}),_.$set(re),Z[2]?N?j&4&&he(N,1):(N=Od(),N.c(),he(N,1),N.m($,w)):N&&($t(),be(N,1,1,()=>{N=null}),vt()),R===(R=M(Z))&&Q?Q.p(Z,j):(Q.d(1),Q=R(Z),Q&&(Q.c(),Q.m($,null))),(!G||j&8)&&C!==(C=Z[3].t("The evaluation leaderboard is based on the Elo rating system and is updated in real-time.")+"")&&Te(E,C),(!G||j&8)&&A!==(A=Z[3].t("The leaderboard is currently in beta, and we may adjust the rating calculations as we refine the algorithm.")+"")&&Te(P,A)},i(Z){G||(he(_.$$.fragment,Z),he(N),G=!0)},o(Z){be(_.$$.fragment,Z),be(N),G=!1},d(Z){Z&&(W(t),W(y),W($),W(v),W(S)),We(_),N&&N.d(),Q.d()}}}const Dd="TaylorAI/bge-micro-v2";function Z0(e,t,r){let a,i;zr(e,ig,E=>r(13,a=E)),tg.backends.onnx.wasm.wasmPaths="/wasm/";const s=ya("i18n");zr(e,s,E=>r(3,i=E));let n=null,o=null,{feedbacks:d=[]}=t,p=[],h="",f=new Map,l=!0,g;const _=async(E=new Map)=>{const O=y(d,E);r(1,p=a.filter(A=>{var P,G;return(A==null?void 0:A.owned_by)!=="arena"&&(((G=(P=A==null?void 0:A.info)==null?void 0:P.meta)==null?void 0:G.hidden)??!1)!==!0}).map(A=>{const P=O.get(A.id);return{...A,rating:P?Math.round(P.rating):"-",stats:{count:P?P.won+P.lost:0,won:P?P.won.toString():"-",lost:P?P.lost.toString():"-"}}}).sort((A,P)=>A.rating==="-"&&P.rating!=="-"?1:P.rating==="-"&&A.rating!=="-"?-1:A.rating!=="-"&&P.rating!=="-"?P.rating-A.rating:A.name.localeCompare(P.name))),r(2,l=!1)};function y(E,O){const A=new Map,P=32;function G(R){return A.get(R)||{rating:1e3,won:0,lost:0}}function N(R,Q,Z){const j=G(R);j.rating+=Q,Z===1?j.won++:Z===0&&j.lost++,A.set(R,j)}function M(R,Q,Z,j){const re=1/(1+Math.pow(10,(Q-R)/400));return P*(Z-re)*j}return E.forEach(R=>{const Q=R.data.model_id,Z=G(Q);let j;switch(R.data.rating.toString()){case"1":j=1;break;case"-1":j=0;break;default:return}const re=h!==""?O.get(R.id)||0:1;(R.data.sibling_model_ids||[]).forEach(D=>{const F=G(D),te=M(Z.rating,F.rating,j,re),ce=M(F.rating,Z.rating,1-j,re);N(Q,te,j),N(D,ce,1-j)})}),A}const $=(E,O)=>{if(E.length!==O.length)throw new Error("Vectors must be the same length");let A=0,P=0,G=0;for(let N=0;N<E.length;N++)A+=E[N]*O[N],P+=E[N]**2,G+=O[N]**2;return P=Math.sqrt(P),G=Math.sqrt(G),P===0||G===0?0:A/(P*G)},w=(E,O)=>{let A=0;for(const P of O.values()){const G=$(E,P);A=Math.max(A,G)}return A},v=async()=>{window.tokenizer||(window.tokenizer=await rg.from_pretrained(Dd)),window.model||(window.model=await ag.from_pretrained(Dd)),n=window.tokenizer,r(4,o=window.model);const E=new Set(d.flatMap(O=>O.data.tags||[]));await k(Array.from(E))},S=async E=>{const O=await n(E);return(await o(O)).last_hidden_state.mean(1).ort_tensor.data},k=async E=>{const O=new Map;for(const A of E)f.has(A)||f.set(A,await S(A)),O.set(A,f.get(A));return O},T=async()=>{if(r(2,l=!0),h.trim()===""){_();return}clearTimeout(g),g=setTimeout(async()=>{const E=await S(h),O=new Map;for(const A of d){const P=A.data.tags||[],G=await k(P),N=w(E,G);O.set(A.id,N)}_(O)},1500)};Wd(async()=>{_()});function I(){h=this.value,r(0,h)}const C=()=>{v()};return e.$$set=E=>{"feedbacks"in E&&r(7,d=E.feedbacks)},e.$$.update=()=>{e.$$.dirty&1&&T()},[h,p,l,i,o,s,v,d,I,C]}class Y0 extends dr{constructor(t){super(),pr(this,t,Z0,Q0,lr,{feedbacks:7})}}function X0(e){let t,r;return{c(){t=Ys("svg"),r=Ys("path"),this.h()},l(a){t=Xs(a,"svg",{xmlns:!0,fill:!0,viewBox:!0,"stroke-width":!0,stroke:!0,class:!0});var i=ee(t);r=Xs(i,"path",{"stroke-linecap":!0,"stroke-linejoin":!0,d:!0}),ee(r).forEach(W),i.forEach(W),this.h()},h(){H(r,"stroke-linecap","round"),H(r,"stroke-linejoin","round"),H(r,"d","M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"),H(t,"xmlns","http://www.w3.org/2000/svg"),H(t,"fill","none"),H(t,"viewBox","0 0 24 24"),H(t,"stroke-width",e[1]),H(t,"stroke","currentColor"),H(t,"class",e[0])},m(a,i){fe(a,t,i),V(t,r)},p(a,[i]){i&2&&H(t,"stroke-width",a[1]),i&1&&H(t,"class",a[0])},i:ct,o:ct,d(a){a&&W(t)}}}function J0(e,t,r){let{className:a="w-4 h-4"}=t,{strokeWidth:i="1.5"}=t;return e.$$set=s=>{"className"in s&&r(0,a=s.className),"strokeWidth"in s&&r(1,i=s.strokeWidth)},[a,i]}class e_ extends dr{constructor(t){super(),pr(this,t,J0,X0,lr,{className:0,strokeWidth:1})}}function t_(e){let t;const r=e[4].default,a=Km(r,e,e[7],null);return{c(){a&&a.c()},l(i){a&&a.l(i)},m(i,s){a&&a.m(i,s),t=!0},p(i,s){a&&a.p&&(!t||s&128)&&Qm(a,r,i,i[7],t?Ym(r,i[7],s,null):Zm(i[7]),null)},i(i){t||(he(a,i),t=!0)},o(i){be(a,i),t=!1},d(i){a&&a.d(i)}}}function r_(e){let t,r;return t=new cr({props:{content:e[1].t("More"),$$slots:{default:[t_]},$$scope:{ctx:e}}}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&2&&(s.content=a[1].t("More")),i&128&&(s.$$scope={dirty:i,ctx:a}),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function a_(e){let t,r,a,i=e[1].t("Delete")+"",s,n;return t=new yg({props:{strokeWidth:"2"}}),{c(){Pe(t.$$.fragment),r=ge(),a=X("div"),s=ve(i),this.h()},l(o){Ue(t.$$.fragment,o),r=_e(o),a=J(o,"DIV",{class:!0});var d=ee(a);s=we(d,i),d.forEach(W),this.h()},h(){H(a,"class","flex items-center")},m(o,d){Ve(t,o,d),fe(o,r,d),fe(o,a,d),V(a,s),n=!0},p(o,d){(!n||d&2)&&i!==(i=o[1].t("Delete")+"")&&Te(s,i)},i(o){n||(he(t.$$.fragment,o),n=!0)},o(o){be(t.$$.fragment,o),n=!1},d(o){o&&(W(r),W(a)),We(t,o)}}}function i_(e){let t,r;return t=new mg({props:{class:"flex  gap-2  items-center px-3 py-1.5 text-sm  cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md",$$slots:{default:[a_]},$$scope:{ctx:e}}}),t.$on("click",e[5]),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&130&&(s.$$scope={dirty:i,ctx:a}),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function n_(e){let t,r,a;return r=new gg({props:{class:"w-full max-w-[150px] rounded-xl px-1 py-1.5 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg",sideOffset:-2,side:"bottom",align:"start",transition:_g,$$slots:{default:[i_]},$$scope:{ctx:e}}}),{c(){t=X("div"),Pe(r.$$.fragment),this.h()},l(i){t=J(i,"DIV",{slot:!0});var s=ee(t);Ue(r.$$.fragment,s),s.forEach(W),this.h()},h(){H(t,"slot","content")},m(i,s){fe(i,t,s),Ve(r,t,null),a=!0},p(i,s){const n={};s&131&&(n.$$scope={dirty:s,ctx:i}),r.$set(n)},i(i){a||(he(r.$$.fragment,i),a=!0)},o(i){be(r.$$.fragment,i),a=!1},d(i){i&&W(t),We(r)}}}function s_(e){let t,r,a;function i(n){e[6](n)}let s={$$slots:{content:[n_],default:[r_]},$$scope:{ctx:e}};return e[0]!==void 0&&(s.show=e[0]),t=new fg({props:s}),qd.push(()=>Gd(t,"show",i)),t.$on("change",o_),{c(){Pe(t.$$.fragment)},l(n){Ue(t.$$.fragment,n)},m(n,o){Ve(t,n,o),a=!0},p(n,[o]){const d={};o&131&&(d.$$scope={dirty:o,ctx:n}),!r&&o&1&&(r=!0,d.show=n[0],Hd(()=>r=!1)),t.$set(d)},i(n){a||(he(t.$$.fragment,n),a=!0)},o(n){be(t.$$.fragment,n),a=!1},d(n){We(t,n)}}}const o_=e=>{};function u_(e,t,r){let a,{$$slots:i={},$$scope:s}=t;const n=jm(),o=ya("i18n");zr(e,o,f=>r(1,a=f));let d=!1;const p=()=>{n("delete"),r(0,d=!1)};function h(f){d=f,r(0,d)}return e.$$set=f=>{"$$scope"in f&&r(7,s=f.$$scope)},[d,a,n,o,i,p,h,s]}class l_ extends dr{constructor(t){super(),pr(this,t,u_,s_,lr,{})}}function Bd(e,t,r){const a=e.slice();return a[13]=t[r],a}function Md(e){let t,r,a;return r=new cr({props:{content:e[3].t("Export"),$$slots:{default:[d_]},$$scope:{ctx:e}}}),{c(){t=X("div"),Pe(r.$$.fragment)},l(i){t=J(i,"DIV",{});var s=ee(t);Ue(r.$$.fragment,s),s.forEach(W)},m(i,s){fe(i,t,s),Ve(r,t,null),a=!0},p(i,s){const n={};s&8&&(n.content=i[3].t("Export")),s&65536&&(n.$$scope={dirty:s,ctx:i}),r.$set(n)},i(i){a||(he(r.$$.fragment,i),a=!0)},o(i){be(r.$$.fragment,i),a=!1},d(i){i&&W(t),We(r)}}}function d_(e){let t,r,a,i,s;return r=new og({props:{className:"size-3"}}),{c(){t=X("button"),Pe(r.$$.fragment),this.h()},l(n){t=J(n,"BUTTON",{class:!0});var o=ee(t);Ue(r.$$.fragment,o),o.forEach(W),this.h()},h(){H(t,"class","p-2 rounded-xl hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-850 transition font-medium text-sm flex items-center space-x-1")},m(n,o){fe(n,t,o),Ve(r,t,null),a=!0,i||(s=sr(t,"click",e[8]),i=!0)},p:ct,i(n){a||(he(r.$$.fragment,n),a=!0)},o(n){be(r.$$.fragment,n),a=!1},d(n){n&&W(t),We(r),i=!1,s()}}}function p_(e){let t,r,a,i,s=e[3].t("User")+"",n,o,d,p=e[3].t("Models")+"",h,f,l,g=e[3].t("Result")+"",_,y,$,w=e[3].t("Updated At")+"",v,S,k,T="",I,C,E=[],O=new Map,A,P=la(e[2]);const G=N=>N[13].id;for(let N=0;N<P.length;N+=1){let M=Bd(e,P,N),R=G(M);O.set(R,E[N]=Nd(R,M))}return{c(){t=X("table"),r=X("thead"),a=X("tr"),i=X("th"),n=ve(s),o=ge(),d=X("th"),h=ve(p),f=ge(),l=X("th"),_=ve(g),y=ge(),$=X("th"),v=ve(w),S=ge(),k=X("th"),k.innerHTML=T,I=ge(),C=X("tbody");for(let N=0;N<E.length;N+=1)E[N].c();this.h()},l(N){t=J(N,"TABLE",{class:!0});var M=ee(t);r=J(M,"THEAD",{class:!0});var R=ee(r);a=J(R,"TR",{class:!0});var Q=ee(a);i=J(Q,"TH",{scope:!0,class:!0});var Z=ee(i);n=we(Z,s),Z.forEach(W),o=_e(Q),d=J(Q,"TH",{scope:!0,class:!0});var j=ee(d);h=we(j,p),j.forEach(W),f=_e(Q),l=J(Q,"TH",{scope:!0,class:!0});var re=ee(l);_=we(re,g),re.forEach(W),y=_e(Q),$=J(Q,"TH",{scope:!0,class:!0});var ne=ee($);v=we(ne,w),ne.forEach(W),S=_e(Q),k=J(Q,"TH",{scope:!0,class:!0,"data-svelte-h":!0}),Pi(k)!=="svelte-twvnjj"&&(k.innerHTML=T),Q.forEach(W),R.forEach(W),I=_e(M),C=J(M,"TBODY",{class:!0});var D=ee(C);for(let F=0;F<E.length;F+=1)E[F].l(D);D.forEach(W),M.forEach(W),this.h()},h(){H(i,"scope","col"),H(i,"class","px-3 text-right cursor-pointer select-none w-0"),H(d,"scope","col"),H(d,"class","px-3 pr-1.5 cursor-pointer select-none"),H(l,"scope","col"),H(l,"class","px-3 py-1.5 text-right cursor-pointer select-none w-fit"),H($,"scope","col"),H($,"class","px-3 py-1.5 text-right cursor-pointer select-none w-0"),H(k,"scope","col"),H(k,"class","px-3 py-1.5 text-right cursor-pointer select-none w-0"),H(a,"class",""),H(r,"class","text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-850 dark:text-gray-400 -translate-y-0.5"),H(C,"class",""),H(t,"class","w-full text-sm text-left text-gray-500 dark:text-gray-400 table-auto max-w-full rounded-sm")},m(N,M){fe(N,t,M),V(t,r),V(r,a),V(a,i),V(i,n),V(a,o),V(a,d),V(d,h),V(a,f),V(a,l),V(l,_),V(a,y),V(a,$),V($,v),V(a,S),V(a,k),V(t,I),V(t,C);for(let R=0;R<E.length;R+=1)E[R]&&E[R].m(C,null);A=!0},p(N,M){(!A||M&8)&&s!==(s=N[3].t("User")+"")&&Te(n,s),(!A||M&8)&&p!==(p=N[3].t("Models")+"")&&Te(h,p),(!A||M&8)&&g!==(g=N[3].t("Result")+"")&&Te(_,g),(!A||M&8)&&w!==(w=N[3].t("Updated At")+"")&&Te(v,w),M&44&&(P=la(N[2]),$t(),E=Fd(E,M,G,1,N,P,O,C,eg,Nd,null,Bd),vt())},i(N){if(!A){for(let M=0;M<P.length;M+=1)he(E[M]);A=!0}},o(N){for(let M=0;M<E.length;M+=1)be(E[M]);A=!1},d(N){N&&W(t);for(let M=0;M<E.length;M+=1)E[M].d()}}}function c_(e){let t,r=e[3].t("No feedbacks found")+"",a;return{c(){t=X("div"),a=ve(r),this.h()},l(i){t=J(i,"DIV",{class:!0});var s=ee(t);a=we(s,r),s.forEach(W),this.h()},h(){H(t,"class","text-center text-xs text-gray-500 dark:text-gray-400 py-1")},m(i,s){fe(i,t,s),V(t,a)},p(i,s){s&8&&r!==(r=i[3].t("No feedbacks found")+"")&&Te(a,r)},i:ct,o:ct,d(i){i&&W(t)}}}function h_(e){let t,r,a,i;return{c(){t=X("div"),r=X("img"),this.h()},l(s){t=J(s,"DIV",{class:!0});var n=ee(t);r=J(n,"IMG",{src:!0,alt:!0,class:!0}),n.forEach(W),this.h()},h(){var s,n,o,d;oa(r.src,a=((n=(s=e[13])==null?void 0:s.user)==null?void 0:n.profile_image_url)??"/user.png")||H(r,"src",a),H(r,"alt",i=(d=(o=e[13])==null?void 0:o.user)==null?void 0:d.name),H(r,"class","size-5 rounded-full object-cover shrink-0"),H(t,"class","shrink-0")},m(s,n){fe(s,t,n),V(t,r)},p(s,n){var o,d,p,h;n&4&&!oa(r.src,a=((d=(o=s[13])==null?void 0:o.user)==null?void 0:d.profile_image_url)??"/user.png")&&H(r,"src",a),n&4&&i!==(i=(h=(p=s[13])==null?void 0:p.user)==null?void 0:h.name)&&H(r,"alt",i)},d(s){s&&W(t)}}}function f_(e){var i;let t,r=((i=e[13].data)==null?void 0:i.model_id)+"",a;return{c(){t=X("div"),a=ve(r),this.h()},l(s){t=J(s,"DIV",{class:!0});var n=ee(t);a=we(n,r),n.forEach(W),this.h()},h(){H(t,"class","text-sm font-medium text-gray-600 dark:text-gray-400 flex-1 py-1.5")},m(s,n){fe(s,t,n),V(t,a)},p(s,n){var o;n&4&&r!==(r=((o=s[13].data)==null?void 0:o.model_id)+"")&&Te(a,r)},i:ct,o:ct,d(s){s&&W(t)}}}function m_(e){var o;let t,r=((o=e[13].data)==null?void 0:o.model_id)+"",a,i,s,n;return s=new cr({props:{content:e[13].data.sibling_model_ids.join(", "),$$slots:{default:[y_]},$$scope:{ctx:e}}}),{c(){t=X("div"),a=ve(r),i=ge(),Pe(s.$$.fragment),this.h()},l(d){t=J(d,"DIV",{class:!0});var p=ee(t);a=we(p,r),p.forEach(W),i=_e(d),Ue(s.$$.fragment,d),this.h()},h(){H(t,"class","font-semibold text-gray-600 dark:text-gray-400 flex-1")},m(d,p){fe(d,t,p),V(t,a),fe(d,i,p),Ve(s,d,p),n=!0},p(d,p){var f;(!n||p&4)&&r!==(r=((f=d[13].data)==null?void 0:f.model_id)+"")&&Te(a,r);const h={};p&4&&(h.content=d[13].data.sibling_model_ids.join(", ")),p&65548&&(h.$$scope={dirty:p,ctx:d}),s.$set(h)},i(d){n||(he(s.$$.fragment,d),n=!0)},o(d){be(s.$$.fragment,d),n=!1},d(d){d&&(W(t),W(i)),We(s,d)}}}function g_(e){let t=e[13].data.sibling_model_ids.join(", ")+"",r;return{c(){r=ve(t)},l(a){r=we(a,t)},m(a,i){fe(a,r,i)},p(a,i){i&4&&t!==(t=a[13].data.sibling_model_ids.join(", ")+"")&&Te(r,t)},d(a){a&&W(r)}}}function __(e){let t=e[13].data.sibling_model_ids.slice(0,2).join(", ")+"",r,a,i=e[3].t("and {{COUNT}} more",{COUNT:e[13].data.sibling_model_ids.length-2})+"",s;return{c(){r=ve(t),a=ve(", "),s=ve(i)},l(n){r=we(n,t),a=we(n,", "),s=we(n,i)},m(n,o){fe(n,r,o),fe(n,a,o),fe(n,s,o)},p(n,o){o&4&&t!==(t=n[13].data.sibling_model_ids.slice(0,2).join(", ")+"")&&Te(r,t),o&12&&i!==(i=n[3].t("and {{COUNT}} more",{COUNT:n[13].data.sibling_model_ids.length-2})+"")&&Te(s,i)},d(n){n&&(W(r),W(a),W(s))}}}function y_(e){let t;function r(s,n){return s[13].data.sibling_model_ids.length>2?__:g_}let a=r(e),i=a(e);return{c(){t=X("div"),i.c(),this.h()},l(s){t=J(s,"DIV",{class:!0});var n=ee(t);i.l(n),n.forEach(W),this.h()},h(){H(t,"class","text-[0.65rem] text-gray-600 dark:text-gray-400 line-clamp-1")},m(s,n){fe(s,t,n),i.m(t,null)},p(s,n){a===(a=r(s))&&i?i.p(s,n):(i.d(1),i=a(s),i&&(i.c(),i.m(t,null)))},d(s){s&&W(t),i.d()}}}function b_(e){let t,r;return t=new en({props:{type:"error",content:e[3].t("Lost")}}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&8&&(s.content=a[3].t("Lost")),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function $_(e){let t,r;return t=new en({props:{type:"muted",content:e[3].t("Draw")}}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&8&&(s.content=a[3].t("Draw")),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function v_(e){let t,r;return t=new en({props:{type:"info",content:e[3].t("Won")}}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&8&&(s.content=a[3].t("Won")),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function w_(e){let t,r,a;return r=new bg({}),{c(){t=X("button"),Pe(r.$$.fragment),this.h()},l(i){t=J(i,"BUTTON",{class:!0});var s=ee(t);Ue(r.$$.fragment,s),s.forEach(W),this.h()},h(){H(t,"class","self-center w-fit text-sm p-1.5 dark:text-gray-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl")},m(i,s){fe(i,t,s),Ve(r,t,null),a=!0},p:ct,i(i){a||(he(r.$$.fragment,i),a=!0)},o(i){be(r.$$.fragment,i),a=!1},d(i){i&&W(t),We(r)}}}function Nd(e,t){var ne,D;let r,a,i,s,n,o,d,p,h,f,l,g,_,y,$,w,v,S,k,T,I=Ui(t[13].updated_at*1e3).fromNow()+"",C,E,O,A,P,G;s=new cr({props:{content:(D=(ne=t[13])==null?void 0:ne.user)==null?void 0:D.name,$$slots:{default:[h_]},$$scope:{ctx:t}}});const N=[m_,f_],M=[];function R(F,te){var ce;return(ce=F[13].data)!=null&&ce.sibling_model_ids?0:1}h=R(t),f=M[h]=N[h](t);const Q=[v_,$_,b_],Z=[];function j(F,te){return te&4&&(y=null),te&4&&($=null),te&4&&(w=null),y==null&&(y=F[13].data.rating.toString()==="1"),y?0:($==null&&($=F[13].data.rating.toString()==="0"),$?1:(w==null&&(w=F[13].data.rating.toString()==="-1"),w?2:-1))}~(v=j(t,-1))&&(S=Z[v]=Q[v](t));function re(...F){return t[9](t[13],...F)}return A=new l_({props:{$$slots:{default:[w_]},$$scope:{ctx:t}}}),A.$on("delete",re),{key:e,first:null,c(){r=X("tr"),a=X("td"),i=X("div"),Pe(s.$$.fragment),n=ge(),o=X("td"),d=X("div"),p=X("div"),f.c(),l=ge(),g=X("td"),_=X("div"),S&&S.c(),k=ge(),T=X("td"),C=ve(I),E=ge(),O=X("td"),Pe(A.$$.fragment),P=ge(),this.h()},l(F){r=J(F,"TR",{class:!0});var te=ee(r);a=J(te,"TD",{class:!0});var ce=ee(a);i=J(ce,"DIV",{class:!0});var $e=ee(i);Ue(s.$$.fragment,$e),$e.forEach(W),ce.forEach(W),n=_e(te),o=J(te,"TD",{class:!0});var Re=ee(o);d=J(Re,"DIV",{class:!0});var Ge=ee(d);p=J(Ge,"DIV",{class:!0});var He=ee(p);f.l(He),He.forEach(W),Ge.forEach(W),Re.forEach(W),l=_e(te),g=J(te,"TD",{class:!0});var ke=ee(g);_=J(ke,"DIV",{class:!0});var Oe=ee(_);S&&S.l(Oe),Oe.forEach(W),ke.forEach(W),k=_e(te),T=J(te,"TD",{class:!0});var Ye=ee(T);C=we(Ye,I),Ye.forEach(W),E=_e(te),O=J(te,"TD",{class:!0});var xt=ee(O);Ue(A.$$.fragment,xt),xt.forEach(W),P=_e(te),te.forEach(W),this.h()},h(){H(i,"class","flex justify-center"),H(a,"class","py-0.5 text-right font-semibold"),H(p,"class","flex flex-col h-full"),H(d,"class","flex flex-col items-start gap-0.5 h-full"),H(o,"class","py-1 pl-3 flex flex-col"),H(_,"class","flex justify-end"),H(g,"class","px-3 py-1 text-right font-medium text-gray-900 dark:text-white w-max"),H(T,"class","px-3 py-1 text-right font-medium"),H(O,"class","px-3 py-1 text-right font-semibold"),H(r,"class","bg-white dark:bg-gray-900 dark:border-gray-850 text-xs"),this.first=r},m(F,te){fe(F,r,te),V(r,a),V(a,i),Ve(s,i,null),V(r,n),V(r,o),V(o,d),V(d,p),M[h].m(p,null),V(r,l),V(r,g),V(g,_),~v&&Z[v].m(_,null),V(r,k),V(r,T),V(T,C),V(r,E),V(r,O),Ve(A,O,null),V(r,P),G=!0},p(F,te){var He,ke;t=F;const ce={};te&4&&(ce.content=(ke=(He=t[13])==null?void 0:He.user)==null?void 0:ke.name),te&65540&&(ce.$$scope={dirty:te,ctx:t}),s.$set(ce);let $e=h;h=R(t),h===$e?M[h].p(t,te):($t(),be(M[$e],1,1,()=>{M[$e]=null}),vt(),f=M[h],f?f.p(t,te):(f=M[h]=N[h](t),f.c()),he(f,1),f.m(p,null));let Re=v;v=j(t,te),v===Re?~v&&Z[v].p(t,te):(S&&($t(),be(Z[Re],1,1,()=>{Z[Re]=null}),vt()),~v?(S=Z[v],S?S.p(t,te):(S=Z[v]=Q[v](t),S.c()),he(S,1),S.m(_,null)):S=null),(!G||te&4)&&I!==(I=Ui(t[13].updated_at*1e3).fromNow()+"")&&Te(C,I);const Ge={};te&65536&&(Ge.$$scope={dirty:te,ctx:t}),A.$set(Ge)},i(F){G||(he(s.$$.fragment,F),he(f),he(S),he(A.$$.fragment,F),G=!0)},o(F){be(s.$$.fragment,F),be(f),be(S),be(A.$$.fragment,F),G=!1},d(F){F&&W(r),We(s),M[h].d(),~v&&Z[v].d(),We(A)}}}function Pd(e){let t,r,a=e[3].t("Help us create the best community leaderboard by sharing your feedback history!")+"",i,s,n,o,d;return o=new cr({props:{content:e[3].t("To protect your privacy, only ratings, model IDs, tags, and metadata are shared from your feedback—your chat logs remain private and are not included."),$$slots:{default:[x_]},$$scope:{ctx:e}}}),{c(){t=X("div"),r=X("div"),i=ve(a),s=ge(),n=X("div"),Pe(o.$$.fragment),this.h()},l(p){t=J(p,"DIV",{class:!0});var h=ee(t);r=J(h,"DIV",{class:!0});var f=ee(r);i=we(f,a),f.forEach(W),s=_e(h),n=J(h,"DIV",{class:!0});var l=ee(n);Ue(o.$$.fragment,l),l.forEach(W),h.forEach(W),this.h()},h(){H(r,"class","line-clamp-1 text-gray-500 text-xs"),H(n,"class","flex space-x-1 ml-auto"),H(t,"class","flex flex-col justify-end w-full text-right gap-1")},m(p,h){fe(p,t,h),V(t,r),V(r,i),V(t,s),V(t,n),Ve(o,n,null),d=!0},p(p,h){(!d||h&8)&&a!==(a=p[3].t("Help us create the best community leaderboard by sharing your feedback history!")+"")&&Te(i,a);const f={};h&8&&(f.content=p[3].t("To protect your privacy, only ratings, model IDs, tags, and metadata are shared from your feedback—your chat logs remain private and are not included.")),h&65544&&(f.$$scope={dirty:h,ctx:p}),o.$set(f)},i(p){d||(he(o.$$.fragment,p),d=!0)},o(p){be(o.$$.fragment,p),d=!1},d(p){p&&W(t),We(o)}}}function x_(e){let t,r,a=e[3].t("Share to Open WebUI Community")+"",i,s,n,o,d,p,h;return o=new e_({props:{className:"size-3",strokeWidth:"3"}}),{c(){t=X("button"),r=X("div"),i=ve(a),s=ge(),n=X("div"),Pe(o.$$.fragment),this.h()},l(f){t=J(f,"BUTTON",{class:!0});var l=ee(t);r=J(l,"DIV",{class:!0});var g=ee(r);i=we(g,a),g.forEach(W),s=_e(l),n=J(l,"DIV",{class:!0});var _=ee(n);Ue(o.$$.fragment,_),_.forEach(W),l.forEach(W),this.h()},h(){H(r,"class","self-center mr-2 font-medium line-clamp-1"),H(n,"class","self-center"),H(t,"class","flex text-xs items-center px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 dark:text-gray-200 transition")},m(f,l){fe(f,t,l),V(t,r),V(r,i),V(t,s),V(t,n),Ve(o,n,null),d=!0,p||(h=sr(t,"click",e[10]),p=!0)},p(f,l){(!d||l&8)&&a!==(a=f[3].t("Share to Open WebUI Community")+"")&&Te(i,a)},i(f){d||(he(o.$$.fragment,f),d=!0)},o(f){be(o.$$.fragment,f),d=!1},d(f){f&&W(t),We(o),p=!1,h()}}}function Ud(e){let t,r,a;function i(n){e[11](n)}let s={count:e[0].length,perPage:10};return e[1]!==void 0&&(s.page=e[1]),t=new hg({props:s}),qd.push(()=>Gd(t,"page",i)),{c(){Pe(t.$$.fragment)},l(n){Ue(t.$$.fragment,n)},m(n,o){Ve(t,n,o),a=!0},p(n,o){const d={};o&1&&(d.count=n[0].length),!r&&o&2&&(r=!0,d.page=n[1],Hd(()=>r=!1)),t.$set(d)},i(n){a||(he(t.$$.fragment,n),a=!0)},o(n){be(t.$$.fragment,n),a=!1},d(n){We(t,n)}}}function k_(e){let t,r,a=e[3].t("Feedback History")+"",i,s,n,o,d,p=e[0].length+"",h,f,l,g,_,y,$,w,v,S,k=e[0].length>0&&Md(e);const T=[c_,p_],I=[];function C(A,P){return(A[0]??[]).length===0?0:1}_=C(e),y=I[_]=T[_](e);let E=e[0].length>0&&Pd(e),O=e[0].length>10&&Ud(e);return{c(){t=X("div"),r=X("div"),i=ve(a),s=ge(),n=X("div"),o=ge(),d=X("span"),h=ve(p),f=ge(),k&&k.c(),l=ge(),g=X("div"),y.c(),$=ge(),E&&E.c(),w=ge(),O&&O.c(),v=ua(),this.h()},l(A){t=J(A,"DIV",{class:!0});var P=ee(t);r=J(P,"DIV",{class:!0});var G=ee(r);i=we(G,a),s=_e(G),n=J(G,"DIV",{class:!0}),ee(n).forEach(W),o=_e(G),d=J(G,"SPAN",{class:!0});var N=ee(d);h=we(N,p),N.forEach(W),G.forEach(W),f=_e(P),k&&k.l(P),P.forEach(W),l=_e(A),g=J(A,"DIV",{class:!0});var M=ee(g);y.l(M),M.forEach(W),$=_e(A),E&&E.l(A),w=_e(A),O&&O.l(A),v=ua(),this.h()},h(){H(n,"class","flex self-center w-[1px] h-6 mx-2.5 bg-gray-50 dark:bg-gray-850"),H(d,"class","text-lg font-medium text-gray-500 dark:text-gray-300"),H(r,"class","flex md:self-center text-lg font-medium px-0.5"),H(t,"class","mt-0.5 mb-2 gap-1 flex flex-row justify-between"),H(g,"class","scrollbar-hidden relative whitespace-nowrap overflow-x-auto max-w-full rounded-sm pt-0.5")},m(A,P){fe(A,t,P),V(t,r),V(r,i),V(r,s),V(r,n),V(r,o),V(r,d),V(d,h),V(t,f),k&&k.m(t,null),fe(A,l,P),fe(A,g,P),I[_].m(g,null),fe(A,$,P),E&&E.m(A,P),fe(A,w,P),O&&O.m(A,P),fe(A,v,P),S=!0},p(A,[P]){(!S||P&8)&&a!==(a=A[3].t("Feedback History")+"")&&Te(i,a),(!S||P&1)&&p!==(p=A[0].length+"")&&Te(h,p),A[0].length>0?k?(k.p(A,P),P&1&&he(k,1)):(k=Md(A),k.c(),he(k,1),k.m(t,null)):k&&($t(),be(k,1,1,()=>{k=null}),vt());let G=_;_=C(A),_===G?I[_].p(A,P):($t(),be(I[G],1,1,()=>{I[G]=null}),vt(),y=I[_],y?y.p(A,P):(y=I[_]=T[_](A),y.c()),he(y,1),y.m(g,null)),A[0].length>0?E?(E.p(A,P),P&1&&he(E,1)):(E=Pd(A),E.c(),he(E,1),E.m(w.parentNode,w)):E&&($t(),be(E,1,1,()=>{E=null}),vt()),A[0].length>10?O?(O.p(A,P),P&1&&he(O,1)):(O=Ud(A),O.c(),he(O,1),O.m(v.parentNode,v)):O&&($t(),be(O,1,1,()=>{O=null}),vt())},i(A){S||(he(k),he(y),he(E),he(O),S=!0)},o(A){be(k),be(y),be(E),be(O),S=!1},d(A){A&&(W(t),W(l),W(g),W($),W(w),W(v)),k&&k.d(),I[_].d(),E&&E.d(A),O&&O.d(A)}}}function S_(e,t,r){let a,i;const{saveAs:s}=ug;Ui.extend(lg);const n=ya("i18n");zr(e,n,$=>r(3,i=$));let{feedbacks:o=[]}=t,d=1;const p=async $=>{await dg(localStorage.token,$).catch(v=>(Wa.error(v),null))&&r(0,o=o.filter(v=>v.id!==$))},h=async()=>{Wa.success(i.t("Redirecting you to Open WebUI Community"));const $=o.map(k=>{const{snapshot:T,user:I,...C}=k;return C});console.log($);const w="https://openwebui.com",v=await window.open(`${w}/leaderboard`,"_blank"),S=k=>{k.origin===w&&k.data==="loaded"&&(v.postMessage(JSON.stringify($),"*"),window.removeEventListener("message",S))};window.addEventListener("message",S,!1)},f=async()=>{const $=await pg(localStorage.token).catch(w=>(Wa.error(w),null));if($){let w=new Blob([JSON.stringify($)],{type:"application/json"});s(w,`feedback-history-export-${Date.now()}.json`)}},l=()=>{f()},g=($,w)=>{p($.id)},_=async()=>{h()};function y($){d=$,r(1,d)}return e.$$set=$=>{"feedbacks"in $&&r(0,o=$.feedbacks)},e.$$.update=()=>{e.$$.dirty&3&&r(2,a=o.slice((d-1)*10,d*10))},[o,d,a,i,n,p,h,f,l,g,_,y]}class T_ extends dr{constructor(t){super(),pr(this,t,S_,k_,lr,{feedbacks:0})}}function Vd(e){let t,r,a,i,s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm6 5.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Zm-2.75 1.5a.75.75 0 0 1 1.5 0v2a.75.75 0 0 1-1.5 0v-2Zm-2 .75a.75.75 0 0 0-.75.75v.5a.75.75 0 0 0 1.5 0v-.5a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd"></path></svg>',n,o,d=e[3].t("Leaderboard")+"",p,h,f,l,g,_='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4"><path fill-rule="evenodd" d="M5.25 2A2.25 2.25 0 0 0 3 4.25v9a.75.75 0 0 0 1.183.613l1.692-1.195 1.692 1.195a.75.75 0 0 0 .866 0l1.692-1.195 1.693 1.195A.75.75 0 0 0 13 13.25v-9A2.25 2.25 0 0 0 10.75 2h-5.5Zm3.03 3.28a.75.75 0 0 0-1.06-1.06L4.97 6.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 0 0 1.06-1.06l-.97-.97h1.315c.76 0 1.375.616 1.375 1.375a.75.75 0 0 0 1.5 0A2.875 2.875 0 0 0 8.625 6.25H7.311l.97-.97Z" clip-rule="evenodd"></path></svg>',y,$,w=e[3].t("Feedbacks")+"",v,S,k,T,I,C,E,O,A;const P=[I_,E_],G=[];function N(M,R){return M[0]==="leaderboard"?0:M[0]==="feedbacks"?1:-1}return~(I=N(e))&&(C=G[I]=P[I](e)),{c(){t=X("div"),r=X("div"),a=X("button"),i=X("div"),i.innerHTML=s,n=ge(),o=X("div"),p=ve(d),f=ge(),l=X("button"),g=X("div"),g.innerHTML=_,y=ge(),$=X("div"),v=ve(w),k=ge(),T=X("div"),C&&C.c(),this.h()},l(M){t=J(M,"DIV",{class:!0});var R=ee(t);r=J(R,"DIV",{id:!0,class:!0});var Q=ee(r);a=J(Q,"BUTTON",{class:!0});var Z=ee(a);i=J(Z,"DIV",{class:!0,"data-svelte-h":!0}),Pi(i)!=="svelte-ujm47k"&&(i.innerHTML=s),n=_e(Z),o=J(Z,"DIV",{class:!0});var j=ee(o);p=we(j,d),j.forEach(W),Z.forEach(W),f=_e(Q),l=J(Q,"BUTTON",{class:!0});var re=ee(l);g=J(re,"DIV",{class:!0,"data-svelte-h":!0}),Pi(g)!=="svelte-1fzwrf2"&&(g.innerHTML=_),y=_e(re),$=J(re,"DIV",{class:!0});var ne=ee($);v=we(ne,w),ne.forEach(W),re.forEach(W),Q.forEach(W),k=_e(R),T=J(R,"DIV",{class:!0});var D=ee(T);C&&C.l(D),D.forEach(W),R.forEach(W),this.h()},h(){H(i,"class","self-center mr-2"),H(o,"class","self-center"),H(a,"class",h="px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition "+(e[0]==="leaderboard"?"":" text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")),H(g,"class","self-center mr-2"),H($,"class","self-center"),H(l,"class",S="px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition "+(e[0]==="feedbacks"?"":" text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")),H(r,"id","users-tabs-container"),H(r,"class","tabs flex flex-row overflow-x-auto gap-2.5 max-w-full lg:gap-1 lg:flex-col lg:flex-none lg:w-40 dark:text-gray-200 text-sm font-medium text-left scrollbar-none"),H(T,"class","flex-1 mt-1 lg:mt-0 overflow-y-scroll"),H(t,"class","flex flex-col lg:flex-row w-full h-full pb-2 lg:space-x-4")},m(M,R){fe(M,t,R),V(t,r),V(r,a),V(a,i),V(a,n),V(a,o),V(o,p),V(r,f),V(r,l),V(l,g),V(l,y),V(l,$),V($,v),V(t,k),V(t,T),~I&&G[I].m(T,null),E=!0,O||(A=[sr(a,"click",e[5]),sr(l,"click",e[6])],O=!0)},p(M,R){(!E||R&8)&&d!==(d=M[3].t("Leaderboard")+"")&&Te(p,d),(!E||R&1&&h!==(h="px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition "+(M[0]==="leaderboard"?"":" text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")))&&H(a,"class",h),(!E||R&8)&&w!==(w=M[3].t("Feedbacks")+"")&&Te(v,w),(!E||R&1&&S!==(S="px-0.5 py-1 min-w-fit rounded-lg lg:flex-none flex text-right transition "+(M[0]==="feedbacks"?"":" text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white")))&&H(l,"class",S);let Q=I;I=N(M),I===Q?~I&&G[I].p(M,R):(C&&($t(),be(G[Q],1,1,()=>{G[Q]=null}),vt()),~I?(C=G[I],C?C.p(M,R):(C=G[I]=P[I](M),C.c()),he(C,1),C.m(T,null)):C=null)},i(M){E||(he(C),E=!0)},o(M){be(C),E=!1},d(M){M&&W(t),~I&&G[I].d(),O=!1,Ld(A)}}}function E_(e){let t,r;return t=new T_({props:{feedbacks:e[2]}}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&4&&(s.feedbacks=a[2]),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function I_(e){let t,r;return t=new Y0({props:{feedbacks:e[2]}}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p(a,i){const s={};i&4&&(s.feedbacks=a[2]),t.$set(s)},i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}function C_(e){let t,r,a=e[1]&&Vd(e);return{c(){a&&a.c(),t=ua()},l(i){a&&a.l(i),t=ua()},m(i,s){a&&a.m(i,s),fe(i,t,s),r=!0},p(i,[s]){i[1]?a?(a.p(i,s),s&2&&he(a,1)):(a=Vd(i),a.c(),he(a,1),a.m(t.parentNode,t)):a&&($t(),be(a,1,1,()=>{a=null}),vt())},i(i){r||(he(a),r=!0)},o(i){be(a),r=!1},d(i){i&&W(t),a&&a.d(i)}}}function z_(e,t,r){let a;const i=ya("i18n");zr(e,i,h=>r(3,a=h));let s="leaderboard",n=!1,o=[];return Wd(async()=>{r(2,o=await cg(localStorage.token)),r(1,n=!0);const h=document.getElementById("users-tabs-container");h&&h.addEventListener("wheel",function(f){f.deltaY!==0&&(h.scrollLeft+=f.deltaY)})}),[s,n,o,a,i,()=>{r(0,s="leaderboard")},()=>{r(0,s="feedbacks")}]}class A_ extends dr{constructor(t){super(),pr(this,t,z_,C_,lr,{})}}function O_(e){let t,r;return t=new A_({}),{c(){Pe(t.$$.fragment)},l(a){Ue(t.$$.fragment,a)},m(a,i){Ve(t,a,i),r=!0},p:ct,i(a){r||(he(t.$$.fragment,a),r=!0)},o(a){be(t.$$.fragment,a),r=!1},d(a){We(t,a)}}}class ey extends dr{constructor(t){super(),pr(this,t,null,O_,lr,{})}}export{ey as component};
//# sourceMappingURL=10.WQxFJvKY.js.map
