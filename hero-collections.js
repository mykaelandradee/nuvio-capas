/* Hero de Coleções — módulo independente do editor principal */
(()=>{"use strict";
const $=id=>document.getElementById(id),API="https://api.themoviedb.org/3",IMG="https://image.tmdb.org/t/p/";
const S={current:null,busy:false,cancel:false};
const style=document.createElement("style");
style.textContent="#hcPanel .hc-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}#hcPanel .hc-full{grid-column:1/-1}#hcPanel .hc-preview{margin:10px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#070910}#hcPanel .hc-preview canvas{display:block;width:100%;height:auto;max-height:none;box-shadow:none;border-radius:0}#hcPanel .hc-status,#hcPanel .hc-note{font-size:12px;color:var(--muted);line-height:1.5}#hcPanel .hc-status{min-height:18px;margin:8px 0}#hcPanel .hc-actions{display:flex;gap:8px;margin:8px 0}#hcPanel .hc-actions>*{flex:1}#hcPanel progress{width:100%;height:8px}#hcPanel .hc-items{display:grid;gap:5px;max-height:180px;overflow:auto}#hcPanel .hc-item{background:var(--chip);border-radius:8px;padding:7px 9px;font-size:12px;display:flex;justify-content:space-between;gap:8px}@media(max-width:420px){#hcPanel .hc-grid{grid-template-columns:1fr}}";
document.head.appendChild(style);
const field=(l,c,full)=>'<div class="'+(full?'hc-full':'')+'"><label>'+l+'</label>'+c+'</div>';
function insert(){const p=document.querySelector(".panel");if(!p||$("hcPanel"))return;const d=document.createElement("details");d.id="hcPanel";d.open=true;
d.innerHTML='<summary>Hero de Coleções <span style="font-size:11px;color:var(--accent)">NOVO</span></summary><div class="body"><p class="hc-note">Monte fundos cinematográficos com vários filmes ou séries. Gere uma arte individual ou um pacote de categorias em lote.</p><div class="hc-grid">'+
field("Tipo de coleção",'<select id="hcType"><option value="genre">Gênero</option><option value="year">Ano</option><option value="provider">Streaming</option><option value="custom">Personalizado</option></select>')+
field("Conteúdo",'<select id="hcMedia"><option value="movie">Filmes</option><option value="tv">Séries</option><option value="both">Filmes e séries</option></select>')+
field("Categoria",'<select id="hcTarget"></select>',true)+
field("Títulos na arte",'<select id="hcNumTitles"><option>5</option><option selected>10</option><option>15</option><option>20</option><option>25</option><option>30</option></select>')+
field("Estilo",'<select id="hcStyle"><option value="diagonal">Mural inclinado</option><option value="mosaic">Mosaico</option><option value="strips">Faixas dinâmicas</option></select>')+
field("Resolução",'<select id="hcRes"><option value="1920">Full HD · 1920 × 1080</option><option value="3840">4K · 3840 × 2160</option></select>')+
field("Título principal",'<input id="hcTitle" maxlength="60" placeholder="Ex.: AÇÃO">',true)+
field("Subtítulo",'<input id="hcSubtitle" maxlength="90" placeholder="Os melhores filmes e séries">',true)+
field("Lote",'<select id="hcScope"><option value="one">Somente categoria selecionada</option><option value="all">Todas as opções disponíveis (até 30)</option></select>',true)+'</div>'+
'<div id="hcCustomWrap" hidden><label for="hcCustom">Títulos (um por linha)</label><textarea id="hcCustom" rows="4" placeholder="Duna&#10;Interestelar&#10;Blade Runner 2049"></textarea></div>'+
'<div style="display:flex;gap:14px;margin:8px 0"><label><input id="hcText" type="checkbox" checked> Exibir título</label><label><input id="hcDark" type="checkbox" checked> Escurecer fundo</label></div>'+
'<div class="hc-preview"><canvas id="hcCanvas" width="960" height="540"></canvas></div><p class="hc-note" id="hcCount">Aguardando geração · Prévia 16:9</p>'+
'<div class="hc-actions"><button class="ghost" id="hcPreview">Gerar prévia</button><button class="primary" id="hcSave">Baixar PNG</button></div>'+
'<div class="hc-actions"><button class="ghost" id="hcBatch">Gerar lote ZIP</button><button class="ghost" id="hcCancel" hidden>Cancelar</button></div><progress id="hcProgress" value="0" max="100"></progress><p class="hc-status" id="hcStatus">Informe o token TMDB na seção Buscar no TMDB.</p><div class="hc-items" id="hcItems"></div>'+
'<p class="hc-note">Composição feita localmente no navegador. As imagens são fornecidas pelo TMDB; o token permanece no armazenamento local.</p></div>';
p.insertBefore(d,p.firstElementChild)}
function token(){const v=($("tkey")?.value||"").trim().replace(/^Bearer\s+/i,"");if(!v)throw Error("Informe seu API Read Access Token na seção Buscar no TMDB.");return v}
async function tm(path,params={}){const k=token(),u=new URL(API+path),h={};Object.entries(params).forEach(([a,b])=>{if(b!==""&&b!=null)u.searchParams.set(a,b)});if(k.startsWith("eyJ"))h.Authorization="Bearer "+k;else u.searchParams.set("api_key",k);const r=await fetch(u,{headers:h});if(!r.ok)throw Error("TMDB respondeu com erro "+r.status);return r.json()}
const popular=(a,b)=>(b.popularity||0)-(a.popularity||0)||(b.vote_count||0)-(a.vote_count||0),unique=a=>[...new Map(a.filter(x=>x?.id).map(x=>[x.id,x])).values()];
const label=()=>$("hcTarget").selectedOptions[0]?.textContent||"Coleção",say=t=>$("hcStatus").textContent=t;
async function loadOptions(){const t=$("hcType").value,m=$("hcMedia").value==="tv"?"tv":"movie",s=$("hcTarget");s.innerHTML="";s.add(new Option("Carregando opções…",""));say("Conectando ao TMDB para carregar as categorias…");
if(t==="genre"){const d=await tm("/genre/"+m+"/list",{language:"pt-BR"});(d.genres||[]).forEach(x=>s.add(new Option(x.name,x.id)));s.add(new Option("Todos os gêneros","all"))}
else if(t==="year"){for(let y=new Date().getFullYear();y>=new Date().getFullYear()-29;y--)s.add(new Option(String(y),String(y)));s.add(new Option("Todos os anos (últimos 30)","all"))}
else if(t==="provider"){const d=await tm("/watch/providers/"+m,{watch_region:"BR",language:"pt-BR"});(d.results||[]).sort((a,b)=>(a.display_priority||999)-(b.display_priority||999)).forEach(x=>s.add(new Option(x.provider_name,x.provider_id)));s.add(new Option("Todos os streamings","all"))}
else s.add(new Option("Lista personalizada","custom"));
$("hcCustomWrap").hidden=t!=="custom";$("hcScope").disabled=t==="custom";s.selectedIndex=0;if(!$("hcTitle").dataset.edited)$("hcTitle").value=label();say((s.options.length-1)+" opções carregadas.")}
async function discover(type,value){const count=+$("hcNumTitles").value;if(type==="custom"){const names=$("hcCustom").value.split(/\n/).map(x=>x.trim()).filter(Boolean).slice(0,20),out=[];for(const n of names){const d=await tm("/search/multi",{query:n,language:"pt-BR"});const x=(d.results||[]).filter(y=>["movie","tv"].includes(y.media_type)).sort(popular)[0];if(x)out.push(x)}return unique(out).slice(0,count)}
const media=$("hcMedia").value==="both"?["movie","tv"]:[$("hcMedia").value],lists=await Promise.all(media.map(async m=>{const p={language:"pt-BR",sort_by:"popularity.desc",include_adult:false,"vote_count.gte":35,page:1};if(type==="genre"&&value!=="all")p.with_genres=value;if(type==="year"&&value!=="all")p[m==="movie"?"primary_release_year":"first_air_date_year"]=value;if(type==="year"&&value==="all")p[m==="movie"?"primary_release_date.gte":"first_air_date.gte"]=(new Date().getFullYear()-9)+"-01-01";if(type==="provider"&&value!=="all"){p.with_watch_providers=value;p.watch_region="BR";p.with_watch_monetization_types="flatrate|free|ads"}const d=await tm("/discover/"+m,p);return(d.results||[]).map(x=>({...x,media_type:m}))}));return unique(lists.flat().sort(popular)).slice(0,count)}
async function images(items){return(await Promise.all(items.filter(x=>x.backdrop_path).slice(0,+$("hcNumTitles").value).map(async x=>{try{const r=await fetch(IMG+"w780"+x.backdrop_path);if(!r.ok)return null;return{im:await createImageBitmap(await r.blob()),name:x.title||x.name||"Título"}}catch{return null}}))).filter(Boolean)}
function paint(cv,imgs,title){
const W=+$("hcRes").value,H=W*9/16,sc=W/1920,c=cv.getContext("2d"),style=$("hcStyle").value,n=imgs.length;
cv.width=W;cv.height=H;c.fillStyle="#070910";c.fillRect(0,0,W,H);
if(!n)return;
const cover=(im,x,y,w,h)=>{const z=Math.max(w/im.width,h/im.height),dw=im.width*z,dh=im.height*z;c.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh)};
if(style==="diagonal"){
  // Fundo contínuo: amplia uma arte e desfoca para não deixar vazios nas bordas.
  c.save();c.filter="blur("+Math.round(24*sc)+"px)";cover(imgs[0].im,-35*sc,-35*sc,W+70*sc,H+70*sc);c.restore();
  c.fillStyle="rgba(3,6,14,.48)";c.fillRect(0,0,W,H);
  // Grade regular de painéis paralelos: inclinação uniforme e intervalo constante.
  const cols=Math.ceil(Math.sqrt(n*W/H)),rows=Math.ceil(n/cols),gap=Math.max(8,12*sc),cellW=W/cols,cellH=H/rows;
  const angle=-8*Math.PI/180,cardW=cellW-gap,cardH=cellH-gap;
  const items=imgs.map((p,i)=>({p,i,row:Math.floor(i/cols),col:i%cols}));
  items.forEach(({p,row,col})=>{
    const x=col*cellW+cellW/2+(row%2?cellW*.18:0),y=row*cellH+cellH/2;
    c.save();c.translate(x,y);c.rotate(angle);
    const w=cardW*1.02,h=cardH*1.02;
    c.shadowColor="rgba(0,0,0,.5)";c.shadowBlur=14*sc;c.shadowOffsetY=5*sc;
    c.fillStyle="#080b12";c.fillRect(-w/2,-h/2,w,h);
    c.shadowColor="transparent";c.beginPath();c.rect(-w/2,-h/2,w,h);c.clip();cover(p.im,-w/2,-h/2,w,h);
    c.fillStyle="rgba(0,0,0,.22)";c.fillRect(-w/2,-h/2,w,h);
    const fs=Math.max(12,15*sc);c.font="700 "+fs+"px Inter,sans-serif";c.textAlign="left";c.textBaseline="bottom";c.fillStyle="#fff";c.shadowColor="#000";c.shadowBlur=7*sc;
    c.fillText(p.name.slice(0,32),-w/2+12*sc,h/2-10*sc,w-24*sc);
    c.restore();
  });
}else{
  const cols=Math.ceil(Math.sqrt(n*W/H)),rows=Math.ceil(n/cols),cellW=W/cols,cellH=H/rows,gap=style==="mosaic"?0:Math.max(5,10*sc);
  imgs.forEach((p,i)=>{const row=Math.floor(i/cols),col=i%cols;let w=cellW-gap,h=cellH-gap,x=col*cellW+gap/2,y=row*cellH+gap/2,a=0;
    if(style==="strips"){h*=.82;y+=cellH*.09;a=(row%2?-.012:.012)}
    c.save();c.translate(x+w/2,y+h/2);c.rotate(a);const z=Math.max(w/p.im.width,h/p.im.height),dw=p.im.width*z,dh=p.im.height*z;c.beginPath();c.rect(-w/2,-h/2,w,h);c.clip();c.drawImage(p.im,-dw/2,-dh/2,dw,dh);
    if($("hcDark").checked){c.fillStyle="rgba(0,0,0,.2)";c.fillRect(-w/2,-h/2,w,h)}c.restore();
  });
}
const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"rgba(0,0,0,.06)");g.addColorStop(1,$("hcDark").checked?"rgba(0,0,0,.72)":"rgba(0,0,0,.28)");c.fillStyle=g;c.fillRect(0,0,W,H);
const v=c.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.72);v.addColorStop(0,"transparent");v.addColorStop(1,"rgba(0,0,0,.34)");c.fillStyle=v;c.fillRect(0,0,W,H);
if($("hcText").checked){c.font="800 "+Math.round(78*sc)+"px Inter,sans-serif";c.fillStyle="#fff";c.textAlign="left";c.shadowColor="#000";c.shadowBlur=18*sc;c.fillText((title||"").toUpperCase(),90*sc,H-125*sc,W-180*sc);const sub=$("hcSubtitle").value.trim();if(sub){c.font="500 "+Math.round(27*sc)+"px Inter,sans-serif";c.fillStyle="rgba(255,255,255,.85)";c.fillText(sub,94*sc,H-75*sc,W-188*sc)}}
c.strokeStyle="rgba(255,255,255,.18)";c.lineWidth=2*sc;c.strokeRect(1,1,W-2,H-2)}

async function make(type,value,name){const found=await discover(type,value);if(!found.length)throw Error("Nenhum título encontrado.");const imgs=await images(found);if(imgs.length<2)throw Error("Imagens insuficientes para "+name);const c=document.createElement("canvas");paint(c,imgs,name);return{canvas:c,imgs}}
const slug=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").slice(0,60)||"hero";
const blob=c=>new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(Error("Falha ao exportar.")),"image/png"));
function save(b,n){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)}
async function preview(){S.current=null;say("Buscando títulos e preparando a composição...");$("hcPreview").disabled=true;try{const r=await make($("hcType").value,$("hcTarget").value,$("hcTitle").value.trim()||label()),c=$("hcCanvas");c.width=r.canvas.width;c.height=r.canvas.height;c.getContext("2d").drawImage(r.canvas,0,0);S.current=r;$("hcCount").textContent=r.imgs.length+" títulos na composição · Prévia 16:9";$("hcItems").innerHTML=r.imgs.map((x,i)=>'<div class="hc-item"><span>'+String(i+1).padStart(2,"0")+' · '+x.name.replace(/[&<>]/g,"")+'</span><small>TMDB</small></div>').join("");say("Prévia pronta. Revise antes de exportar.")}catch(e){say(e.message)}finally{$("hcPreview").disabled=false}}
function batchList(){const t=$("hcType").value;if(t==="custom")return[{v:"custom",n:"Personalizado"}];if($("hcScope").value!=="all")return[{v:$("hcTarget").value,n:label()}];return[...$("hcTarget").options].filter(x=>x.value!=="all").map(x=>({v:x.value,n:x.textContent})).slice(0,30)}
async function batch(){if(S.busy)return;if(typeof JSZip==="undefined")return say("Módulo ZIP indisponível.");const list=batchList();S.busy=true;S.cancel=false;$("hcBatch").disabled=true;$("hcCancel").hidden=false;$("hcProgress").value=0;$("hcItems").innerHTML="";const zip=new JSZip(),errors=[];try{for(let i=0;i<list.length;i++){if(S.cancel)break;const it=list[i];say("Gerando "+(i+1)+" de "+list.length+": "+it.n);try{const r=await make($("hcType").value,it.v,it.n);zip.file(String(i+1).padStart(2,"0")+"-"+slug(it.n)+"-hero.png",await blob(r.canvas));const d=document.createElement("div");d.className="hc-item";d.textContent=it.n+" · "+r.imgs.length+" títulos";$("hcItems").appendChild(d)}catch(e){errors.push(it.n+": "+e.message)}$("hcProgress").value=Math.round((i+1)/list.length*100)}if(Object.keys(zip.files).length)save(await zip.generateAsync({type:"blob"}),"nuvio-heroes-"+slug($("hcType").value)+".zip");say((S.cancel?"Lote cancelado. ":"Lote concluído. ")+Object.keys(zip.files).length+" artes exportadas."+(errors.length?" · "+errors.length+" sem resultado.":""));errors.forEach(x=>{const d=document.createElement("div");d.className="hc-item";d.textContent=x;$("hcItems").appendChild(d)})}catch(e){say(e.message)}finally{S.busy=false;$("hcBatch").disabled=false;$("hcCancel").hidden=true}}
function loadOptionsSafe(){loadOptions().catch(e=>{const s=$("hcTarget");s.innerHTML="";s.add(new Option("Não foi possível carregar — verifique o token TMDB",""));say("Erro ao carregar categorias: "+(e?.message||"falha de conexão")+". Confira o token na seção Buscar no TMDB e tente novamente.")})}
function init(){const p=document.querySelector(".panel");if(!p)return;insert();$("hcType").onchange=loadOptionsSafe;$("hcMedia").onchange=loadOptionsSafe;$("hcTarget").onchange=()=>{if(!$("hcTitle").dataset.edited)$("hcTitle").value=label()};$("hcTitle").oninput=()=>$("hcTitle").dataset.edited="1";$("hcPreview").onclick=preview;$("hcSave").onclick=async()=>{if(!S.current)await preview();if(S.current)save(await blob(S.current.canvas),slug($("hcTitle").value||label())+"-hero.png")};$("hcBatch").onclick=batch;$("hcCancel").onclick=()=>{S.cancel=true;say("Cancelando após a arte atual...")};loadOptions().catch(e=>say(e.message))}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();