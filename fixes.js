/* Nuvio Studio · correções: token do TMDB com diagnóstico claro e traduções que faltavam */
(function(){
"use strict";

/* ---------- traduções que faltavam ---------- */
Object.assign(EN,{
"⚡ Montar automaticamente":"⚡ Build automatically",
"Ex.: Harry Potter":"E.g. Harry Potter",
"Ex.: Minha saga":"E.g. My collection",
"Harry Potter\nSenhor dos Anéis\nStar Wars":"Harry Potter\nThe Lord of the Rings\nStar Wars",
"1600 px (recomendado)":"1600 px (recommended)",
"2400 px (alta)":"2400 px (high)",
"Pré-visualização":"Preview",
"O que gerar":"What to create",
"Alternar tema claro e escuro":"Toggle light and dark theme",
"Saga":"Collection",
"Paleta":"Palette",
"Paleta salva":"Saved palette",
"Fundo":"Background",
"Filmes de {n}:":"Movies from {n}:",
"Não foi possível gerar a imagem.":"Could not generate the image.",
"Não foi possível carregar essa fonte.":"Could not load this font.",
"Fonte carregada: {n} (vale só nesta visita).":"Font loaded: {n} (this visit only).",
"Pronto: {n}":"Done: {n}",
"Seção redefinida.":"Section reset.",
"Baixando modelo: {p}%":"Downloading model: {p}%",
"ZIP gerado: {n} itens. {f} com fallback; revise a lista e repita as falhas.":"ZIP created: {n} items. {f} used a fallback; review the list and retry the failures.",
"ZIP gerado: {n} itens.":"ZIP created: {n} items.",
"Não foi possível repetir as falhas.":"Could not retry the failures.",
"Restaurar todas as configurações e remover as imagens atuais?":"Restore all settings and remove the current images?",
"Restaurar configurações, opções do lote e remover as imagens atuais?":"Restore settings and batch options and remove the current images?",
"Testar token":"Test token",
"Testando...":"Testing...",
"O TMDB aceitou o token e respondeu normalmente.":"TMDB accepted the token and responded normally.",
"Cole seu token do TMDB para testar.":"Paste your TMDB token to test it.",
"O TMDB recusou o token (erro 401). Copie de novo o API Read Access Token em themoviedb.org, Configurações, API.":"TMDB rejected the token (error 401). Copy the API Read Access Token again from themoviedb.org, Settings, API.",
"O TMDB bloqueou o acesso (erro 403). Pode ser VPN, rede ou bloqueio do provedor.":"TMDB blocked the request (error 403). It may be a VPN, network or ISP block.",
"Muitas requisições ao TMDB (erro 429). Espere um minuto e tente de novo.":"Too many requests to TMDB (error 429). Wait a minute and try again.",
"O TMDB não encontrou esse endereço (erro 404).":"TMDB could not find that address (error 404).",
"O TMDB está instável agora (erro {s}). Tente de novo em alguns minutos.":"TMDB is unstable right now (error {s}). Try again in a few minutes.",
"O TMDB respondeu com erro {s}.":"TMDB responded with error {s}.",
"Não foi possível alcançar o TMDB. Verifique a internet. Bloqueio do provedor, DNS, VPN ou extensão de privacidade também causam isso.":"Could not reach TMDB. Check your internet. An ISP block, DNS, VPN or privacy extension can also cause this.",
"Token limpo: removi espaços, aspas ou a palavra Bearer.":"Token cleaned: removed spaces, quotes or the word Bearer."
});

/* ---------- token: limpeza e envio ---------- */
const cleanTok=raw=>String(raw||"")
  .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g,"")
  .replace(/^bearer\s+/i,"")
  .replace(/^api[_-]?key\s*[=:]\s*/i,"")
  .replace(/\s+/g,"");
const isJwt=k=>k.length>60&&/^[\w-]+\.[\w-]+\.[\w-]+$/.test(k);

/* ---------- campo e mensagem de diagnóstico ---------- */
const tk=$("tkey");
["autocomplete:new-password","name:tmdb-api-token","spellcheck:false","autocapitalize:off","data-lpignore:true","data-1p-ignore:true"]
  .forEach(p=>{const i=p.indexOf(":");tk.setAttribute(p.slice(0,i),p.slice(i+1))});
const stat=document.createElement("p");stat.className="msg";stat.id="tstat";stat.setAttribute("aria-live","polite");
$("kmsg").insertAdjacentElement("afterend",stat);
const test=document.createElement("button");test.className="ghost";test.textContent="Testar token";test.style.marginLeft="8px";
$("forgetKey").insertAdjacentElement("afterend",test);
if(typeof TN!=="undefined")TN.push([test.firstChild,"Testar token"]);

const MSG={
  ok:"O TMDB aceitou o token e respondeu normalmente.",
  key:"Cole seu token do TMDB para testar.",
  401:"O TMDB recusou o token (erro 401). Copie de novo o API Read Access Token em themoviedb.org, Configurações, API.",
  403:"O TMDB bloqueou o acesso (erro 403). Pode ser VPN, rede ou bloqueio do provedor.",
  404:"O TMDB não encontrou esse endereço (erro 404).",
  429:"Muitas requisições ao TMDB (erro 429). Espere um minuto e tente de novo.",
  net:"Não foi possível alcançar o TMDB. Verifique a internet. Bloqueio do provedor, DNS, VPN ou extensão de privacidade também causam isso."
};
function setStat(code,status){
  let m=MSG[code];
  if(!m)m=status>=500?"O TMDB está instável agora (erro {s}). Tente de novo em alguns minutos.":"O TMDB respondeu com erro {s}.";
  stat.textContent=tr(m,{s:status});
}

/* ---------- requisição ao TMDB com erro específico ---------- */
window.tm=async function(path,params){
  const k=cleanTok(tk.value);
  if(!k){setStat("key");throw new Error("key")}
  const u=new URL(TM+path);
  Object.entries(params||{}).forEach(([a,b])=>u.searchParams.set(a,b));
  const h={};
  if(isJwt(k))h.Authorization="Bearer "+k;else u.searchParams.set("api_key",k);
  let r;
  try{r=await fetch(u,{headers:h})}catch(e){setStat("net");throw new Error("net")}
  if(!r.ok){setStat(r.status,r.status);throw new Error("http"+r.status)}
  setStat("ok");
  return r.json();
};

async function testToken(){
  const raw=tk.value,k=cleanTok(raw);
  if(!k)return setStat("key");
  if(k!==raw){tk.value=k;stat.textContent=tr("Token limpo: removi espaços, aspas ou a palavra Bearer.")}
  try{localStorage.setItem("tmdbkey",k)}catch(e){}
  if(k===raw)stat.textContent=tr("Testando...");
  try{await window.tm("/authentication")}catch(e){}
}
test.onclick=testToken;
tk.addEventListener("change",()=>{if(tk.value.trim())testToken()});
tk.addEventListener("paste",()=>setTimeout(()=>{const c=cleanTok(tk.value);if(c!==tk.value){tk.value=c;tk.dispatchEvent(new Event("input"))}},0));

/* ---------- confirmações traduzidas ---------- */
if(typeof restoreDefaults==="function"){
  $("resetTop").onclick=()=>{if(window.confirm(tr("Restaurar todas as configurações e remover as imagens atuais?")))restoreDefaults()};
  $("restoreDefaults").onclick=()=>{if(window.confirm(tr("Restaurar configurações, opções do lote e remover as imagens atuais?")))restoreDefaults()};
}

applyLang();
})();
