/* Nuvio Studio · Plus
   Efeitos (vidro, grão, degradê e neon no texto, sombra do recorte, moldura), estilos prontos,
   desfazer/refazer, cores a partir da imagem, revisão do lote com cancelar, zona segura da TV
   e camada robusta para o TMDB (limpeza do token, diagnóstico, cache, fila e nova tentativa).
   Substitui o fixes.js. Carregue depois do script principal do index.html. */
(function(){
"use strict";
const safe=(n,f)=>{try{return f()}catch(e){console.error("[studio-plus] "+n,e)}};

/* ============ 1. configuração nova ============ */
const NEW=["gl","glBlur","glAlpha","glR","glPad","grain","tg","tc2","glowT","cutSh","frame","frameC","bPick","autoPal"];
Object.assign(D,{gl:false,glBlur:16,glAlpha:22,glR:28,glPad:8,grain:0,tg:false,tc2:"#ffd27a",glowT:0,cutSh:0,frame:0,frameC:"#ffffff",bPick:"top",autoPal:false});
NEW.forEach(k=>{if(!PK.includes(k))PK.push(k);o[k]=D[k]});
let cancelFlag=false;

/* ============ 2. desenho ============ */
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

function glassCard(c,x,y,w,h){
  const k=c.canvas.width/1280,rad=o.glR*k;
  const sn=document.createElement("canvas");sn.width=c.canvas.width;sn.height=c.canvas.height;sn.getContext("2d").drawImage(c.canvas,0,0);
  c.save();c.shadowColor="rgba(0,0,0,.4)";c.shadowBlur=36*k;c.shadowOffsetY=10*k;c.fillStyle="#000";rr(c,x,y,w,h,rad);c.fill();c.restore();
  c.save();rr(c,x,y,w,h,rad);c.clip();
  c.save();c.setTransform(1,0,0,1,0,0);if(o.glBlur>0)c.filter="blur("+o.glBlur*k+"px)";c.drawImage(sn,0,0);c.restore();
  c.fillStyle="rgba(255,255,255,"+o.glAlpha/100+")";c.fillRect(x,y,w,h);
  const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,"rgba(255,255,255,.30)");g.addColorStop(.45,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(255,255,255,.10)");
  c.fillStyle=g;c.fillRect(x,y,w,h);c.restore();
  c.save();rr(c,x,y,w,h,rad);c.lineWidth=Math.max(1,1.6*k);c.strokeStyle="rgba(255,255,255,.5)";c.stroke();c.restore();
}

window.putLines=function(c,L,x,y,size,lh,al){
  c.save();c.globalAlpha*=o.textOpacity/100;c.textAlign=al;c.textBaseline="middle";fx(c,size);
  let fill=o.tc;
  if(o.tg){const g=c.createLinearGradient(0,y,0,y+L.length*lh);g.addColorStop(0,o.tc);g.addColorStop(1,o.tc2);fill=g}
  const neon=o.tg?o.tc2:o.tc;
  L.forEach((l,i)=>{const yy=y+(i+.5)*lh;
    if(o.stroke>0){c.save();c.shadowColor="transparent";c.lineWidth=size*o.stroke/100;c.lineJoin="round";c.strokeStyle=o.strokeC;c.strokeText(l,x,yy);c.restore()}
    if(o.glowT>0){c.save();c.fillStyle=neon;c.shadowColor=neon;[1,.45].forEach(m=>{c.shadowBlur=size*.55*o.glowT/100*m;c.fillText(l,x,yy)});c.restore()}
    c.fillStyle=fill;c.shadowColor="rgba(0,0,0,"+.6*o.shadow/100+")";c.shadowBlur=size*.12*o.shadow/50;c.shadowOffsetY=size*.03*o.shadow/50;c.fillText(l,x,yy)});
  c.shadowColor="transparent";c.shadowBlur=0;c.shadowOffsetY=0;try{c.letterSpacing="0px"}catch(e){}c.restore();
};

window.drawBlock=function(c,W,H,layout){
  const L=lines(),n=L.length;c.font=fnt(100);fx(c,100);
  const mw=n?Math.max(...L.map(l=>c.measureText(l).width))||1:1,maxW=W*(layout==="bottom"?.78:.8);
  const size=Math.min(maxW/mw*100,H*.24,H*.55/((n*o.lineH/100)||1))*o.scale/100,lh=size*o.lineH/100,th=n*lh,tw=mw*size/100;
  c.font=fnt(size);c.fillStyle=o.tc;
  let iw=0,ih=0;const im=useImg();
  if(im){const[nw,nh]=wh(im);ih=H*(n?.28:o.mode==="hero"?.32:.5)*o.logoScale/100;iw=ih*nw/nh;const mx=W*(n?.6:.8);if(iw>mx){iw=mx;ih=iw*nh/nw}}
  const gap=size*.25,ox=W*o.lx/100,oy=H*o.ly/100,tx=W*o.tx/100;
  let ax,ay,al,lxA,lyA,band=null;
  if(layout==="bottom"){ax=W*.08+tx;ay=H*.92-th;al="left";lxA=ax;lyA=ay-ih-(n?gap:0)}
  else if(layout==="band"){const bh=th+size*.5,by=(H-bh)/2;band=[by,bh];ax=W/2+tx;ay=by+size*.25;al="center";lxA=(W-iw)/2;lyA=Math.max(H*.04,by-ih-H*.03)}
  else{const total=(im?ih+gap:0)+th,y0=(H-total)/2;ax=W/2+tx;ay=y0+(im?ih+gap:0);al="center";lxA=(W-iw)/2;lyA=y0}
  if(band&&n){c.fillStyle="rgba(0,0,0,.38)";c.fillRect(0,band[0],W,band[1])}
  if(o.gl&&(n||im)){
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    if(n){const a=al==="left"?ax:ax-tw/2;x0=a;x1=a+tw;y0=ay;y1=ay+th}
    if(im){x0=Math.min(x0,lxA+ox);x1=Math.max(x1,lxA+ox+iw);y0=Math.min(y0,lyA+oy);y1=Math.max(y1,lyA+oy+ih)}
    const p=size*o.glPad/20;glassCard(c,x0-p,y0-p,x1-x0+2*p,y1-y0+2*p);
  }
  if(im)c.drawImage(im,lxA+ox,lyA+oy,iw,ih);
  c.fillStyle=o.tc;putLines(c,L,ax,ay,size,lh,al);
};

window.drawCut=function(c,W,H){
  if(!o.cut)return;c.save();c.filter=filt(false,W);
  if(o.cutSh>0){c.shadowColor="rgba(0,0,0,"+.7*o.cutSh/100+")";c.shadowBlur=60*W/1280*o.cutSh/100;c.shadowOffsetY=12*W/1280}
  c.drawImage(o.cut,...bgRect(o.bg||o.cut,W,H));c.restore();
};

let NZ=null;
function noise(){if(NZ)return NZ;const n=document.createElement("canvas");n.width=n.height=256;const c=n.getContext("2d"),d=c.createImageData(256,256);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}c.putImageData(d,0,0);return NZ=n}
function post(c,W,H){
  if(o.grain>0){c.save();c.globalAlpha=o.grain/100*.35;c.globalCompositeOperation="overlay";const p=c.createPattern(noise(),"repeat");
    try{p.setTransform(new DOMMatrix().scale(Math.max(1,W/1280)))}catch(e){}c.fillStyle=p;c.fillRect(0,0,W,H);c.restore()}
  if(o.frame>0){const w=W*o.frame/100;c.save();c.lineWidth=w;c.strokeStyle=o.frameC;c.strokeRect(w/2,w/2,W-w,H-w);c.restore()}
}
const _renderTo=window.renderTo;
window.renderTo=function(cvs,mode,fmt){_renderTo(cvs,mode,fmt);if(mode!=="logo")post(cvs.getContext("2d"),cvs.width,cvs.height)};

function withState(patch,fn){const keep={};for(const k in patch)keep[k]=o[k];Object.assign(o,patch);try{return fn()}finally{Object.assign(o,keep)}}

/* ============ 3. lógica: paleta, histórico ============ */
const lum=c=>(.2126*c[0]+.7152*c[1]+.0722*c[2])/255;
const hex=c=>"#"+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
function paletteFrom(d){
  const B=new Map();let rs=0,gs=0,bs=0,n=0;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<128)continue;const r=d[i],g=d[i+1],b=d[i+2];rs+=r;gs+=g;bs+=b;n++;
    const key=((r>>5)<<6)|((g>>5)<<3)|(b>>5),e=B.get(key)||{r:0,g:0,b:0,c:0};e.r+=r;e.g+=g;e.b+=b;e.c++;B.set(key,e)}
  if(!n)return null;
  const avg=[rs/n,gs/n,bs/n];
  const arr=[...B.values()].map(e=>{const c=[e.r/e.c,e.g/e.c,e.b/e.c],mx=Math.max(...c),mn=Math.min(...c),sat=mx?(mx-mn)/mx:0;return{c,score:e.c*(.35+sat)*(mx>40?1:.2)}});
  arr.sort((a,b)=>b.score-a.score);
  const main=arr[0].c;
  return{c1:hex(main),c2:hex(main.map(v=>v*.18)),tc:lum(avg)>.7?"#12151c":"#ffffff"};
}
function paletteOf(img){const cs=document.createElement("canvas");cs.width=48;cs.height=27;const c=cs.getContext("2d");c.drawImage(img,0,0,48,27);return paletteFrom(c.getImageData(0,0,48,27).data)}
function applyPal(){
  if(!o.bg)return msg("Escolha uma imagem de fundo primeiro.");
  const p=safe("paleta",()=>paletteOf(o.bg));if(!p)return;
  o.c1=p.c1;o.c2=p.c2;o.tc=p.tc;sync();render();msg("Cores aplicadas a partir da imagem.");
}

const HS={s:[],i:-1,skip:false,t:0};
const snapshot=()=>JSON.stringify(cfgNow());
function pushHist(){if(HS.skip)return;const s=snapshot();if(HS.s[HS.i]===s)return;HS.s=HS.s.slice(0,HS.i+1);HS.s.push(s);if(HS.s.length>80)HS.s.shift();HS.i=HS.s.length-1;updUndo()}
function updUndo(){const u=$("undo"),r=$("redo");if(u)u.disabled=HS.i<=0;if(r)r.disabled=HS.i>=HS.s.length-1}
const _render=window.render;
window.render=async function(){await _render();updGuide();clearTimeout(HS.t);HS.t=setTimeout(pushHist,350)};
function go(d){
  const j=HS.i+d;if(j<0||j>=HS.s.length)return;clearTimeout(HS.t);HS.i=j;HS.skip=true;
  PK.forEach(k=>o[k]=D[k]);applyCfg(JSON.parse(HS.s[j]));sync();
  _render().then(()=>{HS.skip=false;updUndo();updGuide()});
}

/* ============ 4. TMDB: token limpo, fila, cache e nova tentativa ============ */
const cleanTok=raw=>String(raw||"").replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g,"").replace(/^bearer\s+/i,"").replace(/^api[_-]?key\s*[=:]\s*/i,"").replace(/\s+/g,"");
const isJwt=k=>k.length>60&&/^[\w-]+\.[\w-]+\.[\w-]+$/.test(k);
const MSG={ok:"O TMDB aceitou o token e respondeu normalmente.",key:"Cole seu token do TMDB para testar.",
  401:"O TMDB recusou o token (erro 401). Copie de novo o API Read Access Token em themoviedb.org, Configurações, API.",
  403:"O TMDB bloqueou o acesso (erro 403). Pode ser VPN, rede ou bloqueio do provedor.",
  404:"O TMDB não encontrou esse endereço (erro 404).",
  429:"Muitas requisições ao TMDB (erro 429). Espere um minuto e tente de novo.",
  net:"Não foi possível alcançar o TMDB. Verifique a internet. Bloqueio do provedor, DNS, VPN ou extensão de privacidade também causam isso."};
let stat=null;
function setStat(code,status){if(!stat)return;let m=MSG[code];if(!m)m=status>=500?"O TMDB está instável agora (erro {s}). Tente de novo em alguns minutos.":"O TMDB respondeu com erro {s}.";stat.textContent=tr(m,{s:status})}
const cache=new Map(),waiting=[];let active=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function acquire(){while(active>=4)await new Promise(r=>waiting.push(r));active++}
function release(){active--;const n=waiting.shift();if(n)n()}
window.tm=async function(path,params){
  const tk=$("tkey"),k=cleanTok(tk.value);
  if(!k){setStat("key");throw new Error("key")}
  const u=new URL(TM+path);Object.entries(params||{}).forEach(([a,b])=>u.searchParams.set(a,b));
  const h={};if(isJwt(k))h.Authorization="Bearer "+k;else u.searchParams.set("api_key",k);
  const key=u.pathname+u.search+(h.Authorization?"|b":""),useCache=path!=="/authentication";
  if(useCache&&cache.has(key))return cache.get(key);
  const p=(async()=>{
    for(let a=0;;a++){
      if(cancelFlag)throw new Error("cancel");
      await acquire();let r;
      try{try{r=await fetch(u,{headers:h})}catch(e){setStat("net");throw new Error("net")}}finally{release()}
      if((r.status===429||r.status>=500)&&a<3){const ra=+r.headers.get("Retry-After");await sleep(ra?ra*1000:600*(a+1)*(a+1));continue}
      if(!r.ok){setStat(r.status,r.status);throw new Error("http"+r.status)}
      setStat("ok");return r.json();
    }
  })();
  if(useCache){cache.set(key,p);p.catch(()=>cache.delete(key))}
  return p;
};

/* ============ 5. revisão do lote ============ */
const BT={items:[],busy:false};
const bestFirst=a=>[...a].sort((x,y)=>(y.vote_average||0)-(x.vote_average||0)||(y.vote_count||0)-(x.vote_count||0)||(y.width||0)-(x.width||0));
const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[r[i],r[j]]=[r[j],r[i]]}return r};
const itemState=it=>({text:it.text,bg:it.bgImg,bgBlob:it.bgBlob,img:it.imgEl,cut:null});
async function setItemBg(it,idx){const p=it.backs[idx],blob=await tmImg(p.file_path,p.profile?"original":"w1280");it.bgImg=await blobImg(blob);it.bgBlob=blob;it.bi=idx}
async function drawItemThumb(it){
  try{await document.fonts.load(fnt(100),it.text)}catch(e){}
  const cs=document.createElement("canvas");withState(itemState(it),()=>renderTo(cs,"cover","land"));
  const t=it.canvas.getContext("2d");t.clearRect(0,0,it.canvas.width,it.canvas.height);t.drawImage(cs,0,0,it.canvas.width,it.canvas.height);
}
function addCard(it){
  const card=document.createElement("div");card.className="bcard";it.card=card;
  const cs=document.createElement("canvas");cs.width=240;cs.height=135;it.canvas=cs;card.appendChild(cs);
  const t=document.createElement("div");t.className="t";t.textContent=it.name+(it.ok?"":" · "+tr("Fallback: usando o fundo atual"));card.appendChild(t);
  const acts=document.createElement("div");acts.className="acts";card.appendChild(acts);
  if(it.backs.length>1){const b=document.createElement("button");b.className="ghost";b.textContent=tr("Outro fundo");
    b.onclick=async()=>{b.disabled=true;try{await setItemBg(it,(it.bi+1)%it.backs.length);await drawItemThumb(it)}catch(e){}b.disabled=false};acts.appendChild(b)}
  const rm=document.createElement("button");rm.className="ghost";rm.textContent=tr("Remover");
  rm.onclick=()=>{BT.items=BT.items.filter(x=>x!==it);card.remove();if(!BT.items.length)$("bZip").hidden=true;updateRetryButton()};acts.appendChild(rm);
  $("bGrid").appendChild(card);return drawItemThumb(it);
}
function updateRetryButton(){
  const b=$("bRetryFailed");if(!b)return;
  const count=BT.items.filter(it=>!it.ok).length;
  b.hidden=count===0;b.textContent=tr("Repetir falhas ({n})",{n:count});
}
async function prepareItem(name){
  const raw=name.replace(/\\s*\\|\\s*/g,"\\n");
  const it={name,raw,text:raw,bgImg:o.bg,bgBlob:o.bgBlob,imgEl:o.img,backs:[],bi:0,ok:true};
  if(!$("bTmdb").checked)return it;
  try{
    const r=await tmBest(name.replace(/\\s*\\|\\s*/g," "));
    it.backs=$("bPick").value==="random"?shuffle(r.backs||[]):bestFirst(r.backs||[]);
    const needsBackground=$("bCover").checked||$("bHero").checked;
    if(needsBackground&&!it.backs.length)throw new Error("no-backdrop");
    if(it.backs.length)await setItemBg(it,0);
    it.imgEl=r.logos&&r.logos[0]?await blobImg(await tmImg(r.logos[0].file_path,"original")):null;
    if($("bAutoText").checked)it.text=r.logos&&r.logos.length?"":String(r.text||r.name||raw).replace(/\\s*\\|\\s*/g,"\\n");
  }catch(e){
    if(e.message==="cancel")throw e;
    it.ok=false;it.backs=[];it.bgImg=o.bg;it.bgBlob=o.bgBlob;it.imgEl=o.img;it.text=raw;
  }
  return it;
}
async function prepare(){
  const names=$("bText").value.split("\\n").map(s=>s.trim()).filter(Boolean).slice(0,40);
  if(!names.length)return bmsg("Escreva um nome por linha.");
  if(!$("bCover").checked&&!$("bLogo").checked&&!$("bHero").checked)return bmsg("Marque pelo menos um tipo de arquivo.");
  BT.items=[];BT.busy=true;cancelFlag=false;$("bGrid").innerHTML="";$("bZip").hidden=true;$("bPrep").disabled=true;$("bRetryFailed").hidden=true;$("bCancel").hidden=false;$("bProgress").value=0;
  try{
    for(let i=0;i<names.length;i++){
      if(cancelFlag)break;
      bmsg("Buscando {a} de {b}: {c}",{a:i+1,b:names.length,c:names[i]});
      const it=await prepareItem(names[i]);
      BT.items.push(it);await addCard(it);$("bProgress").value=Math.round((i+1)/names.length*100);
    }
  }finally{BT.busy=false;$("bPrep").disabled=false;$("bCancel").hidden=true;cancelFlag=false}
  if(BT.items.length){$("bZip").hidden=false;updateRetryButton();bmsg(BT.items.length<names.length?"Cancelado: {n} item(ns) prontos para revisar.":"Revise os cartões e clique em Baixar ZIP. {n} item(ns).",{n:BT.items.length})}
  else bmsg("Nenhum item para gerar.");
}
async function retryFailed(){
  const failed=BT.items.filter(it=>!it.ok);
  if(!failed.length)return;
  BT.busy=true;cancelFlag=false;$("bPrep").disabled=true;$("bRetryFailed").disabled=true;$("bCancel").hidden=false;$("bProgress").value=0;
  try{
    for(let i=0;i<failed.length;i++){
      if(cancelFlag)break;
      const old=failed[i],index=BT.items.indexOf(old),next=old.card&&old.card.nextSibling;
      bmsg("Repetindo falha {a} de {b}: {c}",{a:i+1,b:failed.length,c:old.name});
      const fresh=await prepareItem(old.name);
      if(index>=0)BT.items[index]=fresh;
      if(old.card)old.card.remove();
      await addCard(fresh);
      if(next)$("bGrid").insertBefore(fresh.card,next);
      $("bProgress").value=Math.round((i+1)/failed.length*100);
    }
  }finally{BT.busy=false;$("bPrep").disabled=false;$("bRetryFailed").disabled=false;$("bCancel").hidden=true;cancelFlag=false}
  updateRetryButton();
  bmsg("Repetição concluída. {n} item(ns) ainda precisam de revisão.",{n:BT.items.filter(it=>!it.ok).length});
}
async function buildZip(){
  if(!BT.items.length)return bmsg("Nenhum item para gerar.");
  if(typeof JSZip==="undefined")return bmsg("Não foi possível carregar o módulo de ZIP.");
  const outs=[["cover",$("bCover").checked],["logo",$("bLogo").checked],["hero",$("bHero").checked]].filter(x=>x[1]).map(x=>x[0]);
  const z=new JSZip();$("bZip").disabled=true;
  try{
    for(let i=0;i<BT.items.length;i++){
      const it=BT.items[i];bmsg("Gerando arquivos {a} de {b}...",{a:i+1,b:BT.items.length});
      try{await document.fonts.load(fnt(100),it.text)}catch(e){}
      for(const m of outs){const cs=document.createElement("canvas");withState(itemState(it),()=>renderTo(cs,m,o.fmt));
        const nm=String(i+1).padStart(2,"0")+"-"+slug(it.raw)+"-"+(m==="cover"?"capa-"+o.fmt:m);z.file(nm+ext(m),await canvasBlob(cs,m))}
      $("bProgress").value=Math.round((i+1)/BT.items.length*100);
    }
    await saveBlob(await z.generateAsync({type:"blob"}),"colecao-nuvio.zip");bmsg("ZIP gerado: {n} itens.",{n:BT.items.length});
  }catch(e){bmsg("Algo deu errado no lote. Confira o token do TMDB e tente de novo.")}
  finally{$("bZip").disabled=false}
}

/* ============ 6. interface ============ */
const PRESETS=[
["Cinema",{font:"Bebas Neue",upper:true,ls:8,shadow:60,glow:35,vig:true,dark:35,tint:45,grain:22,c1:"#e50914",c2:"#140506",tc:"#ffffff"}],
["Vidro",{font:"Poppins",gl:true,glBlur:18,glAlpha:24,glR:30,glPad:10,c1:"#2563eb",c2:"#050b24",tc:"#ffffff",shadow:35,glow:45,tint:35,dark:15,vig:false}],
["Neon",{font:"Bungee",tc:"#aef6ff",glowT:85,shadow:0,c1:"#8b5cf6",c2:"#0a0420",glow:20,vig:true,dark:40,tint:55}],
["Ouro",{font:"Cinzel",upper:true,ls:6,tg:true,tc:"#fff1b8",tc2:"#c9951a",shadow:70,c1:"#1a1403",c2:"#050403",glow:25,vig:true,dark:30,tint:40,grain:18}],
["Minimalista",{font:"Montserrat",tc:"#12151c",shadow:0,glow:0,vig:false,c1:"#ffffff",c2:"#d9dee6",dark:0,tint:30}],
["Retrô",{font:"Anton",upper:true,ls:4,stroke:5,strokeC:"#2a0f3a",tg:true,tc:"#ffe27a",tc2:"#ff5fa2",c1:"#f97316",c2:"#ec4899",shadow:40,grain:30,glow:25,frame:2,frameC:"#ffe27a"}],
["Sombrio",{font:"Playfair Display",upper:true,ls:5,tc:"#e8e1d0",c1:"#0b0d12",c2:"#000000",vig:true,dark:55,tint:35,grain:28,glow:10,shadow:80}],
["Pôster",{font:"Oswald",upper:true,ls:3,layout:"bottom",c1:"#1d4ed8",c2:"#050b24",tc:"#ffffff",shadow:55,glow:30}]
];
const STYLE_KEYS=["font","tc","strokeC","upper","scale","ls","lineH","stroke","shadow","textOpacity","layout","c1","c2","angle","glow","vig","dark","tint","blur","bri","con","sat","gray","gl","glBlur","glAlpha","glR","glPad","grain","tg","tc2","glowT","cutSh","frame","frameC"];
const styleBase=()=>Object.fromEntries(STYLE_KEYS.map(k=>[k,D[k]]));
function applyPreset(name,cfg){STYLE_KEYS.forEach(k=>o[k]=D[k]);Object.assign(o,cfg);document.querySelectorAll("#pstGrid .pst").forEach(b=>{const selected=b.querySelector("span")?.textContent===name;b.classList.toggle("is-selected",selected);b.setAttribute("aria-pressed",selected?"true":"false")});sync();render();msg("Estilo aplicado: {n}",{n:tr(name)})}
async function drawThumbs(){
  try{await Promise.all(PRESETS.map(([,c])=>document.fonts.load((FW[c.font]||400)+' 100px "'+c.font+'"',"Aa")))}catch(e){}
  document.querySelectorAll("#pstGrid canvas").forEach((cs2,i)=>safe("miniatura",()=>{
    const cs=document.createElement("canvas");
    withState({...styleBase(),...PRESETS[i][1],text:"Aa",tmode:"text",img:null,bg:null,cut:null,tx:0,ty:0,lx:0,ly:0},()=>renderTo(cs,"cover","land"));
    cs2.getContext("2d").drawImage(cs,0,0,cs2.width,cs2.height)}));
}
function updGuide(){
  const g=$("guide");if(!g)return;const on=$("safeZ")&&$("safeZ").checked&&o.mode!=="logo";g.hidden=!on;if(!on)return;
  const w=cv.offsetWidth,h=cv.offsetHeight;g.style.left=cv.offsetLeft+w*.05+"px";g.style.top=cv.offsetTop+h*.05+"px";g.style.width=w*.9+"px";g.style.height=h*.9+"px";
}
function adopt(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode.closest("script,style,textarea,option")||!n.nodeValue.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  let n;while(n=w.nextNode())TN.push([n,n.nodeValue]);
  root.querySelectorAll("[placeholder],[aria-label]").forEach(e=>["placeholder","aria-label"].forEach(a=>{if(e.hasAttribute(a))AT.push([e,a,e.getAttribute(a)])}));
  root.querySelectorAll("select:not(#font) option").forEach(op=>OP.push([op,op.textContent]));
}
function bindData(root){root.querySelectorAll("[data-k]").forEach(el=>el.addEventListener("input",()=>{const k=el.dataset.k;o[k]=el.type==="checkbox"?el.checked:el.type==="range"?+el.value:el.value;render()}))}
function addReset(d){const b=document.createElement("button");b.className="ghost full";b.textContent="Redefinir esta seção";
  b.onclick=()=>{d.dataset.reset.split(",").forEach(k=>o[k]=D[k]);sync();render();msg("Seção redefinida.")};d.querySelector(".body").appendChild(b)}
const html=s=>{const t=document.createElement("template");t.innerHTML=s.trim();return t.content.firstElementChild};
const rng=(id,l,a,b)=>'<label for="'+id+'">'+l+'</label><input type="range" id="'+id+'" data-k="'+id+'" min="'+a+'" max="'+b+'">';

function init(){
  /* estilos */
  const css=document.createElement("style");css.textContent=
    ".pst{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;gap:8px;min-width:0;padding:8px;border:1px solid color-mix(in srgb,var(--line) 65%,var(--accent) 35%);border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--panel) 76%,white 4%),color-mix(in srgb,var(--chip) 88%,var(--accent) 12%));backdrop-filter:blur(16px) saturate(135%);-webkit-backdrop-filter:blur(16px) saturate(135%);color:var(--text);font-size:12px;font-weight:700;cursor:pointer;box-shadow:inset 0 1px 0 #ffffff25,0 8px 22px -16px #000c;transition:transform .25s cubic-bezier(.2,.8,.2,1),border-color .25s ease,box-shadow .25s ease,background .25s ease}"+
    ".pst:before{content:'';position:absolute;z-index:0;inset:-45%;pointer-events:none;background:radial-gradient(circle at 78% 18%,color-mix(in srgb,var(--accent) 58%,transparent),transparent 35%),radial-gradient(circle at 10% 100%,color-mix(in srgb,var(--accent2) 32%,transparent),transparent 42%);filter:blur(22px);opacity:.22;transition:opacity .3s ease,transform .45s ease}"+
    ".pst:after{content:'';position:absolute;z-index:2;inset:-60% auto -60% -75%;width:48%;pointer-events:none;transform:rotate(22deg) translateX(-140%);background:linear-gradient(90deg,transparent,#ffffff08,#ffffff38,#ffffff08,transparent);transition:transform .65s cubic-bezier(.2,.7,.2,1)}"+
    ".pst canvas{position:relative;z-index:1;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:11px;display:block;box-shadow:0 7px 18px -12px #000d;max-height:none;transition:transform .35s cubic-bezier(.2,.8,.2,1),filter .35s ease}"+
    ".pst span{position:relative;z-index:3;display:block;padding:3px 20px 4px;text-align:center;letter-spacing:.045em}.pst:hover{transform:translateY(-4px);border-color:color-mix(in srgb,var(--accent) 78%,white 22%);box-shadow:inset 0 1px 0 #ffffff38,0 15px 30px -17px var(--accent),0 5px 12px -9px #000}.pst:hover:before{opacity:.48;transform:scale(1.12) rotate(8deg)}.pst:hover:after{transform:rotate(22deg) translateX(430%)}.pst:hover canvas{transform:scale(1.035);filter:saturate(1.12)}.pst.is-selected{border-color:var(--accent);background:linear-gradient(145deg,color-mix(in srgb,var(--panel) 66%,var(--accent) 12%),color-mix(in srgb,var(--chip) 78%,var(--accent) 22%));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 55%,transparent),inset 0 1px 0 #ffffff45,0 0 0 2px color-mix(in srgb,var(--accent) 22%,transparent),0 12px 28px -17px var(--accent)}.pst.is-selected:before{opacity:.52}.pst.is-selected span:after{content:'✓';position:absolute;right:3px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:16px;height:16px;border-radius:50%;background:var(--accent);color:var(--panel);font-size:10px;font-weight:900}.pst:active{transform:translateY(-1px) scale(.985)}.pst:focus-visible{outline:2px solid var(--accent);outline-offset:3px}"+
    "@media(prefers-reduced-motion:reduce){.pst,.pst:before,.pst:after,.pst canvas{transition:none}}"+
    "#pstGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}"+
    ".bgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}.bcard{border:1px solid var(--line);border-radius:12px;padding:6px;background:var(--chip)}"+
    ".bcard canvas{width:100%;height:auto;border-radius:8px;display:block;box-shadow:none;max-height:none}.bcard .t{font-size:12px;font-weight:600;margin:4px 0;word-break:break-word}.bcard .acts{display:flex;gap:4px;flex-wrap:wrap}"+
    "#guide{position:absolute;border:2px dashed #ffd27a;border-radius:6px;pointer-events:none;box-shadow:0 0 0 1px #0008}button:disabled{opacity:.45;cursor:default}";
  document.head.appendChild(css);

  /* estilos prontos */
  const tit=document.querySelector('details[data-reset^="text,"]');
  const pst=html('<details open><summary>Estilos prontos</summary><div class="body"><p class="msg">Aplica fontes, cores e efeitos de uma vez. O texto e as imagens não mudam.</p><div id="pstGrid"></div></div></details>');
  PRESETS.forEach(([n,c])=>{const b=document.createElement("button");b.className="pst";b.type="button";b.setAttribute("aria-pressed","false");b.innerHTML='<canvas width="160" height="90"></canvas><span></span>';b.lastChild.textContent=n;b.onclick=()=>applyPreset(n,c);pst.querySelector("#pstGrid").appendChild(b)});
  if(tit)tit.insertAdjacentElement("beforebegin",pst);

  /* efeitos */
  const cores=document.querySelector('details[data-reset^="c1,"]');
  const fx2=html('<details data-m="cover hero" data-reset="gl,glBlur,glAlpha,glR,glPad,grain,tg,tc2,glowT,cutSh,frame,frameC"><summary>Efeitos</summary><div class="body">'+
    '<label class="chk"><input type="checkbox" id="gl" data-k="gl"> Cartão de vidro atrás do título</label>'+
    '<div class="row"><div>'+rng("glBlur","Desfoque do vidro",0,40)+'</div><div>'+rng("glAlpha","Brilho do vidro",0,60)+'</div></div>'+
    '<div class="row"><div>'+rng("glR","Cantos arredondados",0,80)+'</div><div>'+rng("glPad","Margem do cartão",0,20)+'</div></div>'+
    rng("grain","Grão de filme",0,100)+
    '<label class="chk"><input type="checkbox" id="tg" data-k="tg"> Degradê no texto</label>'+
    '<label for="tc2">Cor final do degradê</label><input type="color" id="tc2" data-k="tc2">'+
    rng("glowT","Brilho neon no texto",0,100)+rng("cutSh","Sombra do assunto recortado",0,100)+
    '<div class="row"><div>'+rng("frame","Moldura",0,6)+'</div><div><label for="frameC">Cor da moldura</label><input type="color" id="frameC" data-k="frameC"></div></div>'+
    '</div></details>');
  if(cores)cores.insertAdjacentElement("afterend",fx2);bindData(fx2);addReset(fx2);

  /* cores a partir da imagem */
  const fundo=document.querySelector('details[data-reset^="bz,"]');
  if(fundo){const body=fundo.querySelector(".body"),rs=body.lastElementChild;
    const ex=html('<div><button class="ghost full" id="palBtn">Cores a partir da imagem</button><label class="chk"><input type="checkbox" id="autoPal" data-k="autoPal"> Aplicar ao escolher um fundo</label></div>');
    body.insertBefore(ex,rs);bindData(ex);ex.querySelector("#palBtn").onclick=applyPal;adopt(ex)}

  /* barra: desfazer, refazer */
  const rt=$("resetTop");
  const ur=html('<span style="display:contents"><button class="ghost" id="undo" aria-label="Desfazer">↶</button><button class="ghost" id="redo" aria-label="Refazer">↷</button></span>');
  if(rt)rt.parentNode.insertBefore(ur,rt);
  $("undo").onclick=()=>go(-1);$("redo").onclick=()=>go(1);

  /* zona segura */
  const view=$("view");
  const gd=html('<div id="guide" hidden></div>');view.appendChild(gd);
  const sz=html('<div class="msg" style="margin:8px 4px 0"><label class="chk" style="margin:0"><input type="checkbox" id="safeZ"> Zona segura da TV</label></div>');
  view.insertAdjacentElement("afterend",sz);$("safeZ").onchange=updGuide;addEventListener("resize",updGuide);

  /* teclado: desfazer, refazer e setas no título */
  document.addEventListener("keydown",e=>{
    const t=e.target,typing=t&&(t.tagName==="TEXTAREA"||t.tagName==="SELECT"||(t.tagName==="INPUT"&&!["range","checkbox","color","file","button"].includes(t.type)));
    if((e.ctrlKey||e.metaKey)&&!typing){const k=e.key.toLowerCase();if(k==="z"){e.preventDefault();go(e.shiftKey?1:-1)}else if(k==="y"){e.preventDefault();go(1)}}
  });
  cv.tabIndex=0;cv.setAttribute("aria-label","Pré-visualização. Use as setas para mover o título.");AT.forEach(a=>{if(a[0]===cv&&a[1]==="aria-label")a[2]="Pré-visualização. Use as setas para mover o título."});
  cv.addEventListener("pointerdown",()=>cv.focus({preventScroll:true}));
  cv.addEventListener("keydown",e=>{
    const s=e.shiftKey?3:.5;let d=null;
    if(e.key==="ArrowLeft")d=["tx",-s];else if(e.key==="ArrowRight")d=["tx",s];else if(e.key==="ArrowUp")d=["ty",-s];else if(e.key==="ArrowDown")d=["ty",s];
    if(!d||o.mode==="logo")return;e.preventDefault();o[d[0]]=Math.max(-40,Math.min(40,o[d[0]]+d[1]));sync();render();
  });

  /* token: campo, teste e diagnóstico */
  const tk=$("tkey");
  ["autocomplete:new-password","name:tmdb-api-token","spellcheck:false","autocapitalize:off","data-lpignore:true","data-1p-ignore:true"].forEach(p=>{const i=p.indexOf(":");tk.setAttribute(p.slice(0,i),p.slice(i+1))});
  stat=html('<p class="msg" id="tstat" aria-live="polite"></p>');$("kmsg").insertAdjacentElement("afterend",stat);
  const test=html('<button class="ghost" id="testTok" style="margin-left:8px">Testar token</button>');$("forgetKey").insertAdjacentElement("afterend",test);adopt(test);
  const testToken=async()=>{
    const raw=tk.value,k=cleanTok(raw);if(!k)return setStat("key");
    if(k!==raw){tk.value=k;stat.textContent=tr("Token limpo: removi espaços, aspas ou a palavra Bearer.")}
    try{localStorage.setItem("tmdbkey",k)}catch(e){}
    cache.clear();if(k===raw)stat.textContent=tr("Testando...");
    try{await window.tm("/authentication")}catch(e){}
  };
  test.onclick=testToken;
  tk.addEventListener("change",()=>{if(tk.value.trim())testToken()});
  tk.addEventListener("input",()=>cache.clear());
  tk.addEventListener("paste",()=>setTimeout(()=>{const c=cleanTok(tk.value);if(c!==tk.value){tk.value=c;tk.dispatchEvent(new Event("input"))}},0));

  /* lote com revisão */
  const bd=$("bText").closest("details"),bBody=bd.querySelector(".body");
  ["bGo","bRetry"].forEach(i=>{const e=$(i);if(e)e.hidden=true});
  const pan=html('<div id="bPlus"><label for="bPick">Escolha do fundo</label><select id="bPick" data-k="bPick"><option value="top">Melhor avaliado</option><option value="random">Aleatório</option></select>'+
    '<div class="row" style="margin-top:8px"><button class="primary" id="bPrep">Buscar e revisar</button><button class="ghost" id="bCancel" hidden>Cancelar</button></div>'+
    '<button class="ghost full" id="bRetryFailed" hidden>Repetir falhas</button><div class="bgrid" id="bGrid"></div><button class="primary full" id="bZip" hidden>Baixar ZIP</button></div>');
  bBody.insertBefore(pan,$("bmsg"));bindData(pan);adopt(pan);
  $("bPrep").onclick=()=>safe("lote",()=>prepare().catch(e=>bmsg("Algo deu errado no lote. Confira o token do TMDB e tente de novo.")));
  $("bCancel").onclick=()=>{cancelFlag=true;bmsg("Cancelando...")};
  $("bRetryFailed").onclick=()=>safe("repetir falhas",()=>retryFailed().catch(e=>bmsg("Não foi possível repetir as falhas.")));
  $("bZip").onclick=buildZip;

  /* redefinir também limpa a revisão */
  if(typeof restoreDefaults==="function"){
    const _rd=restoreDefaults;
    window.restoreDefaults=function(){_rd();BT.items=[];$("bGrid").innerHTML="";$("bZip").hidden=true;cancelFlag=false;updGuide()};
    $("resetTop").onclick=()=>{if(window.confirm(tr("Restaurar todas as configurações e remover as imagens atuais?")))window.restoreDefaults()};
    $("restoreDefaults").onclick=()=>{if(window.confirm(tr("Restaurar configurações, opções do lote e remover as imagens atuais?")))window.restoreDefaults()};
  }

  /* cores automáticas ao escolher um fundo */
  if(typeof setBg==="function"){const _sb=setBg;window.setBg=function(im,b){_sb(im,b);if(o.autoPal)applyPal()}}

  /* idioma e restauração */
  adopt(pst);adopt(fx2);adopt(ur);adopt(sz);
  safe("cfg salvo",()=>{applyCfg(JSON.parse(localStorage.getItem("nuvio_cfg")||"null"))});
  sync();applyMode();applyLang();updUndo();
}

/* ============ 7. traduções ============ */
Object.assign(EN,{
"Estilos prontos":"Style presets","Aplica fontes, cores e efeitos de uma vez. O texto e as imagens não mudam.":"Applies fonts, colors and effects at once. Text and images stay as they are.",
"Cinema":"Cinema","Vidro":"Glass","Neon":"Neon","Ouro":"Gold","Minimalista":"Minimal","Retrô":"Retro","Sombrio":"Dark","Pôster":"Poster",
"Efeitos":"Effects","Cartão de vidro atrás do título":"Glass card behind the title","Desfoque do vidro":"Glass blur","Brilho do vidro":"Glass brightness","Cantos arredondados":"Rounded corners","Margem do cartão":"Card padding",
"Grão de filme":"Film grain","Degradê no texto":"Gradient on text","Cor final do degradê":"Gradient end color","Brilho neon no texto":"Neon glow on text","Sombra do assunto recortado":"Cutout shadow","Moldura":"Frame","Cor da moldura":"Frame color",
"Cores a partir da imagem":"Colors from the image","Aplicar ao escolher um fundo":"Apply when choosing a background","Escolha uma imagem de fundo primeiro.":"Choose a background image first.","Cores aplicadas a partir da imagem.":"Colors applied from the image.",
"Desfazer":"Undo","Refazer":"Redo","Zona segura da TV":"TV safe zone","Pré-visualização. Use as setas para mover o título.":"Preview. Use the arrow keys to move the title.",
"Escolha do fundo":"Background choice","Melhor avaliado":"Top rated","Aleatório":"Random","Buscar e revisar":"Search and review","Cancelar":"Cancel","Baixar ZIP":"Download ZIP","Outro fundo":"Another background","Remover":"Remove","Repetir falhas ({n})":"Retry failed ({n})","Repetindo falha {a} de {b}: {c}":"Retrying failed item {a} of {b}: {c}","Repetição concluída. {n} item(ns) ainda precisam de revisão.":"Retry finished. {n} item(s) still need attention.",
"Buscando {a} de {b}: {c}":"Searching {a} of {b}: {c}","Cancelando...":"Canceling...","Cancelado: {n} item(ns) prontos para revisar.":"Canceled: {n} item(s) ready to review.","Revise os cartões e clique em Baixar ZIP. {n} item(ns).":"Review the cards and click Download ZIP. {n} item(s).",
"Nenhum item para gerar.":"No items to generate.","Fallback: usando o fundo atual":"Fallback: using the current background","Gerando arquivos {a} de {b}...":"Creating files {a} of {b}...","ZIP gerado: {n} itens.":"ZIP created: {n} items.",
"Estilo aplicado: {n}":"Style applied: {n}","Seção redefinida.":"Section reset.","Redefinir esta seção":"Reset this section",
"Testar token":"Test token","Testando...":"Testing...","O TMDB aceitou o token e respondeu normalmente.":"TMDB accepted the token and responded normally.","Cole seu token do TMDB para testar.":"Paste your TMDB token to test it.",
"O TMDB recusou o token (erro 401). Copie de novo o API Read Access Token em themoviedb.org, Configurações, API.":"TMDB rejected the token (error 401). Copy the API Read Access Token again from themoviedb.org, Settings, API.",
"O TMDB bloqueou o acesso (erro 403). Pode ser VPN, rede ou bloqueio do provedor.":"TMDB blocked the request (error 403). It may be a VPN, network or ISP block.",
"Muitas requisições ao TMDB (erro 429). Espere um minuto e tente de novo.":"Too many requests to TMDB (error 429). Wait a minute and try again.",
"O TMDB não encontrou esse endereço (erro 404).":"TMDB could not find that address (error 404).","O TMDB está instável agora (erro {s}). Tente de novo em alguns minutos.":"TMDB is unstable right now (error {s}). Try again in a few minutes.",
"O TMDB respondeu com erro {s}.":"TMDB responded with error {s}.","Não foi possível alcançar o TMDB. Verifique a internet. Bloqueio do provedor, DNS, VPN ou extensão de privacidade também causam isso.":"Could not reach TMDB. Check your internet. An ISP block, DNS, VPN or privacy extension can also cause this.",
"Token limpo: removi espaços, aspas ou a palavra Bearer.":"Token cleaned: removed spaces, quotes or the word Bearer.",
"⚡ Montar automaticamente":"⚡ Build automatically","Ex.: Harry Potter":"E.g. Harry Potter","Ex.: Minha saga":"E.g. My collection","Harry Potter\nSenhor dos Anéis\nStar Wars":"Harry Potter\nThe Lord of the Rings\nStar Wars",
"1600 px (recomendado)":"1600 px (recommended)","2400 px (alta)":"2400 px (high)","Pré-visualização":"Preview","O que gerar":"What to create","Alternar tema claro e escuro":"Toggle light and dark theme",
"Saga":"Collection","Paleta":"Palette","Paleta salva":"Saved palette","Fundo":"Background","Filmes de {n}:":"Movies from {n}:","Não foi possível gerar a imagem.":"Could not generate the image.","Não foi possível carregar essa fonte.":"Could not load this font.",
"Fonte carregada: {n} (vale só nesta visita).":"Font loaded: {n} (this visit only).","Pronto: {n}":"Done: {n}","Baixando modelo: {p}%":"Downloading model: {p}%","Não foi possível repetir as falhas.":"Could not retry the failures.",
"Restaurar todas as configurações e remover as imagens atuais?":"Restore all settings and remove the current images?","Restaurar configurações, opções do lote e remover as imagens atuais?":"Restore settings and batch options and remove the current images?"
});

/* ============ 8. partida ============ */
safe("init",init);
safe("miniaturas",drawThumbs);
safe("histórico",()=>{pushHist();_render()});

/* ponte para testes */
window.__plus={paletteFrom,withState,go,HS,cache,prepare,buildZip};
})();
