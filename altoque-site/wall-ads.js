'use strict';

state.wall=[];
state.ads={top:[],context:[],wall:[]};
state.wallFilter='all';

(function injectWallAndAds(){
  const home=document.querySelector('[data-view="home"]');
  const hero=home?.querySelector('.hero');
  const actions=home?.querySelector('.actions');
  if(hero)hero.insertAdjacentHTML('beforebegin','<div id="topSponsored" class="sponsored-slot hidden" aria-label="Publicidad patrocinada"></div>');
  if(actions)actions.insertAdjacentHTML('afterend',`<section class="wall-section"><div class="wall-head"><div><h2>El muro de ALTOQUE</h2><p>Recados, changas y oportunidades que acaban de publicarse.</p></div><button class="link" data-go="wall">Ver todo</button></div><div class="wall-board"><div class="sticky-row" id="homeWall"></div></div></section>`);
  const filters=document.querySelector('.filters');
  if(filters)filters.insertAdjacentHTML('afterend','<div id="contextSponsored" class="sponsored-slot context-sponsored hidden" aria-label="Publicidad relacionada"></div>');
  document.querySelector('main')?.insertAdjacentHTML('beforeend',`<section class="view" data-view="wall"><div class="page-title"><h2>El muro de ALTOQUE</h2><p>Lo último que se necesita, ofrece o publica cerca tuyo.</p></div><div class="wall-controls"><button class="wall-filter active" data-wall-filter="all">Todo</button><button class="wall-filter" data-wall-filter="today">Para hoy</button><button class="wall-filter" data-wall-filter="urgent">Urgentes</button><button class="wall-filter" data-wall-filter="service">Recados y changas</button><button class="wall-filter" data-wall-filter="employment">Empleo</button></div><div class="wall-grid" id="fullWall"></div></section>`);
  const publishForm=document.querySelector('#publishForm');
  const privacy=publishForm?.querySelector('.notice');
  if(privacy)privacy.insertAdjacentHTML('beforebegin',`<div class="wall-fields"><div class="two"><label>Horario o referencia breve<input name="schedule_text" maxlength="140" placeholder="Ej.: Entre las 10 y las 12 hs"></label><label>Vencimiento<select name="expires_mode"><option value="none">Sin vencimiento automático</option><option value="1h">En 1 hora</option><option value="3h">En 3 horas</option><option value="today">Al terminar hoy</option><option value="24h">En 24 horas</option><option value="3d">En 3 días</option></select></label></div><label class="wall-toggle"><input name="is_wall_visible" type="checkbox" checked><span><strong>Mostrar en el muro</strong><br>La nota desaparecerá automáticamente cuando venza o se asigne.</span></label></div>`);
})();

function wallTone(post){
  const group=(state.categories.find(c=>String(c.id)===String(post.category_id))?.group_name||'').toLowerCase();
  if(post.urgency==='urgent')return'urgent';
  if(post.kind==='employment')return'employment';
  if(group.includes('transporte'))return'transport';
  return'';
}

function wallKind(post){
  if(post.kind==='employment')return'Empleo';
  if(post.urgency==='urgent')return'Urgente';
  return categoryName(post.category_id);
}

function expiryLabel(post){
  if(!post.expires_at)return'';
  const ms=new Date(post.expires_at).getTime()-Date.now();
  if(ms<=0)return'Vencida';
  const mins=Math.ceil(ms/60000);
  if(mins<60)return`Vence en ${mins} min`;
  const hours=Math.ceil(mins/60);
  if(hours<24)return`Vence en ${hours} h`;
  return`Vence en ${Math.ceil(hours/24)} d`;
}

function wallNote(post){
  return`<button class="sticky-note ${wallTone(post)}" data-job="${post.id}"><span class="sticky-pin"></span><span class="note-type">${esc(wallKind(post))}</span><strong>${esc(post.title)}</strong><span class="note-schedule">${esc(post.schedule_text||post.locality||'Ver detalles')}</span><footer><span>${esc(post.locality)}</span><span>${esc(expiryLabel(post)||age(post.published_at))}</span></footer></button>`;
}

function wallExample(title,schedule,tone=''){
  return`<div class="sticky-note example ${tone}"><span class="sticky-pin"></span><span class="note-type">Ejemplo</span><strong>${esc(title)}</strong><span class="note-schedule">${esc(schedule)}</span><footer><span>Ingeniero Luiggi</span><span>Así se verá</span></footer></div>`;
}

function sponsoredNote(ad){
  return`<button class="sticky-note sponsored-note" data-ad-url="${esc(ad.cta_url||'')}"><span class="sticky-pin"></span><span class="note-type">Patrocinado · ${esc(ad.business_name)}</span><strong>${esc(ad.title)}</strong><span class="note-schedule">${esc(ad.body||ad.cta_label||'Conocé esta propuesta local')}</span><div class="commercial-note">${esc(ad.coupon_code?`Cupón: ${ad.coupon_code}`:(ad.cta_label||'Ver comercio'))}</div></button>`;
}

function currentWallPosts(){
  const now=new Date(),today=now.toDateString();
  return state.wall.filter(post=>{
    if(state.wallFilter==='urgent')return post.urgency==='urgent';
    if(state.wallFilter==='employment')return post.kind==='employment';
    if(state.wallFilter==='service')return post.kind==='service';
    if(state.wallFilter==='today')return post.desired_date===new Date().toISOString().slice(0,10)||(post.expires_at&&new Date(post.expires_at).toDateString()===today);
    return true;
  });
}

function renderWall(){
  const posts=currentWallPosts();
  const sponsored=state.ads.wall[0]?sponsoredNote(state.ads.wall[0]):'';
  const home=posts.length?posts.slice(0,8).map(wallNote).join('')+sponsored:`<div class="wall-empty"><p>Todavía no hay recados reales pegados en el muro. Las próximas publicaciones aparecerán automáticamente aquí.</p><div class="sticky-row">${wallExample('Hacer mandados entre las 10 y las 12 hs','Disponible hoy')}${wallExample('Necesito cortar el pasto esta tarde','Antes de las 18 hs','urgent')}${wallExample('Se busca ayudante para comercio','Media jornada','employment')}</div></div>`;
  const full=posts.length?posts.map(wallNote).join('')+sponsored:`${wallExample('Hacer mandados entre las 10 y las 12 hs','Disponible hoy')}${wallExample('Necesito cortar el pasto esta tarde','Antes de las 18 hs','urgent')}${wallExample('Se busca ayudante para comercio','Media jornada','employment')}`;
  const homeEl=$('#homeWall'),fullEl=$('#fullWall');
  if(homeEl)homeEl.innerHTML=home;
  if(fullEl)fullEl.innerHTML=full;
}

async function loadWall(){
  try{
    state.wall=await restQuery('job_posts','select=*&status=eq.open&is_wall_visible=eq.true&order=published_at.desc&limit=30');
    renderWall();
  }catch(error){
    console.error('Wall load',error);
    const home=$('#homeWall');
    if(home)home.innerHTML='<div class="empty">No se pudo cargar el muro en este momento.</div>';
  }
}

function categoryGroup(categoryId){return state.categories.find(c=>String(c.id)===String(categoryId))?.group_name||null}

async function fetchAds(placement,{categoryId=null,groupName=null,limit=2}={}){
  try{
    const data=await rpc('get_contextual_ads',{p_placement:placement,p_category_id:categoryId,p_group_name:groupName,p_locality:'Ingeniero Luiggi',p_province:'La Pampa',p_limit:limit});
    return Array.isArray(data)?data:[];
  }catch(error){console.warn('Ads unavailable',error);return[]}
}

function sponsorBanner(ad){
  const initial=(ad.business_name||'A').slice(0,1).toUpperCase();
  return`<button class="sponsored-banner" data-ad-url="${esc(ad.cta_url||'')}"><span class="sponsor-copy"><span class="sponsor-label">Patrocinado · Comercio local</span><h3>${esc(ad.title)}</h3><p>${esc(ad.body||ad.business_name)}</p><span class="sponsor-cta">${esc(ad.cta_label||'Ver comercio')} →</span></span><span class="sponsor-logo">${ad.image_url?`<img src="${esc(ad.image_url)}" alt="">`:ad.business_logo_url?`<img src="${esc(ad.business_logo_url)}" alt="">`:esc(initial)}</span></button>`;
}

function renderAdSlot(selector,ads){
  const el=$(selector);
  if(!el)return;
  if(!ads?.length){el.classList.add('hidden');el.innerHTML='';return}
  el.innerHTML=sponsorBanner(ads[0]);
  el.classList.remove('hidden');
}

async function loadTopAndWallAds(){
  const [top,wall]=await Promise.all([fetchAds('top_banner',{limit:1}),fetchAds('wall_note',{limit:1})]);
  state.ads.top=top;state.ads.wall=wall;
  renderAdSlot('#topSponsored',top);
  renderWall();
}

async function loadContextAd(){
  const categoryId=$('#jobCategory')?.value?Number($('#jobCategory').value):null;
  const groupName=categoryId?categoryGroup(categoryId):null;
  state.ads.context=await fetchAds('contextual_card',{categoryId,groupName,limit:1});
  renderAdSlot('#contextSponsored',state.ads.context);
}

function expiryFromMode(mode){
  if(!mode||mode==='none')return null;
  const date=new Date();
  if(mode==='1h')date.setHours(date.getHours()+1);
  if(mode==='3h')date.setHours(date.getHours()+3);
  if(mode==='24h')date.setHours(date.getHours()+24);
  if(mode==='3d')date.setDate(date.getDate()+3);
  if(mode==='today')date.setHours(23,59,59,999);
  return date.toISOString();
}

const originalLoadPosts=loadPosts;
loadPosts=async function(){
  await originalLoadPosts();
  await Promise.allSettled([loadWall(),loadTopAndWallAds(),loadContextAd()]);
};

publish=async function(ev){
  ev.preventDefault();
  const f=ev.currentTarget,b=f.querySelector('button[type=submit]');
  b.disabled=true;
  try{
    const min=f.elements.budget_min.value===''?null:Number(f.elements.budget_min.value),max=f.elements.budget_max.value===''?null:Number(f.elements.budget_max.value);
    if(min!=null&&max!=null&&min>max)throw new Error('El monto mínimo no puede superar al máximo.');
    const rows=await insertRow('job_posts',{author_id:state.user.id,category_id:Number(f.elements.category_id.value),kind:f.elements.kind.value,title:f.elements.title.value.trim(),description:f.elements.description.value.trim(),province:f.elements.province.value.trim(),locality:f.elements.locality.value.trim(),urgency:f.elements.urgency.value,budget_mode:f.elements.budget_mode.value,budget_min:min,budget_max:max,desired_date:f.elements.desired_date.value||null,status:'open',is_wall_visible:f.elements.is_wall_visible.checked,schedule_text:f.elements.schedule_text.value.trim()||null,expires_at:expiryFromMode(f.elements.expires_mode.value)});
    const post=rows[0];
    for(const [i,file] of [...f.elements.images.files].slice(0,4).entries()){
      const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-'),path=`${state.user.id}/${post.id}/${Date.now()}-${i}-${safe}`;
      await uploadFile('job-images',path,file,false);
      await insertRow('job_images',{post_id:post.id,owner_id:state.user.id,storage_path:path,sort_order:i});
    }
    f.reset();f.elements.province.value='La Pampa';f.elements.locality.value='Ingeniero Luiggi';f.elements.is_wall_visible.checked=true;
    toast('Publicación creada y pegada en el muro.');
    await loadPosts();
    go('wall');
  }catch(error){toast(error.message,true)}finally{b.disabled=false}
};

document.addEventListener('click',event=>{
  const filter=event.target.closest('[data-wall-filter]');
  if(filter){state.wallFilter=filter.dataset.wallFilter;$$('.wall-filter').forEach(b=>b.classList.toggle('active',b===filter));renderWall()}
  const ad=event.target.closest('[data-ad-url]');
  if(ad){const url=ad.dataset.adUrl;if(url)window.open(url,'_blank','noopener,noreferrer')}
});

document.addEventListener('change',event=>{if(event.target.id==='jobCategory')loadContextAd()});
setInterval(()=>loadWall(),60000);
