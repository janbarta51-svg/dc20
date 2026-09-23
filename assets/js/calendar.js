(() => {
  const app=document.querySelector('#app');
  if(!app) return;
  const TZ='Europe/Prague';
  const state={client:null,session:null,channel:null,membership:null,sessions:[],viewMonth:new Date(),realtime:null};
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const isRoute=()=>location.hash==='#calendar';
  const canManage=()=>['owner','admin'].includes(state.membership?.role);

  function parts(value){
    const out={};
    new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).forEach(p=>{if(p.type!=='literal')out[p.type]=p.value;});
    return out;
  }
  function key(value){const p=parts(value);return `${p.year}-${p.month}-${p.day}`;}
  function fmtDate(value){return new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(value));}
  function fmtTime(value){return new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
  function fmtMonth(value){return new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,month:'long',year:'numeric'}).format(value);}
  function offsetMs(date){
    const map={};
    new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).forEach(p=>{if(p.type!=='literal')map[p.type]=Number(p.value);});
    return Date.UTC(map.year,map.month-1,map.day,map.hour,map.minute,map.second)-date.getTime();
  }
  function localIso(dateValue,timeValue){
    const [y,m,d]=dateValue.split('-').map(Number),[h,min]=timeValue.split(':').map(Number);
    const seed=new Date(Date.UTC(y,m-1,d,h,min,0));
    let offset=offsetMs(seed),result=new Date(seed.getTime()-offset),corrected=offsetMs(result);
    if(corrected!==offset) result=new Date(seed.getTime()-corrected);
    return result.toISOString();
  }
  function stamp(value){return new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
  function googleUrl(event){
    const params=new URLSearchParams({action:'TEMPLATE',text:event.title,dates:`${stamp(event.starts_at)}/${stamp(event.ends_at)}`,stz:TZ,etz:TZ,details:[event.description||'','Gangsterka: https://dc20.honzanacestach.cz/#calendar'].filter(Boolean).join('\n\n'),location:event.location||''});
    return 'https://calendar.google.com/calendar/r/eventedit?'+params.toString();
  }

  function locked(copy){
    app.innerHTML=`<article class='standard-reference calendar-reference'><section class='hero'><div class='eyebrow'>DRUŽINA</div><h1>Kalendář</h1><p>${esc(copy)}</p><div class='hero-actions'><button class='button calendar-open-account' type='button'>Otevřít účet</button></div></section></article>`;
    app.querySelector('.calendar-open-account')?.addEventListener('click',()=>document.querySelector('#accountToggle')?.click());
  }
  function loading(){app.innerHTML=`<article class='standard-reference calendar-reference'><section class='hero'><div class='eyebrow'>DRUŽINA</div><h1>Kalendář</h1><p>Načítám termíny Družiny…</p></section></article>`;}

  function monthGrid(){
    const y=state.viewMonth.getFullYear(),m=state.viewMonth.getMonth(),first=new Date(y,m,1),leading=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),today=key(new Date()),cells=[];
    for(let i=0;i<leading;i++) cells.push(`<div class='calendar-day calendar-day-empty' aria-hidden='true'></div>`);
    for(let day=1;day<=days;day++){
      const k=`${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const events=state.sessions.filter(e=>key(e.starts_at)===k);
      cells.push(`<div class='calendar-day ${k===today?'today':''} ${events.length?'has-session':''}'><span class='calendar-day-number'>${day}</span><div class='calendar-day-events'>${events.map(e=>`<button type='button' data-calendar-jump='${esc(e.id)}'><span>${esc(fmtTime(e.starts_at))}</span><strong>${esc(e.title)}</strong></button>`).join('')}</div></div>`);
    }
    return `<section class='calendar-month'><div class='calendar-month-head'><button type='button' data-month='-1' aria-label='Předchozí měsíc'>‹</button><h2>${esc(fmtMonth(first))}</h2><button type='button' data-month='1' aria-label='Další měsíc'>›</button></div><div class='calendar-weekdays'>${['Po','Út','St','Čt','Pá','So','Ne'].map(x=>`<span>${x}</span>`).join('')}</div><div class='calendar-grid'>${cells.join('')}</div></section>`;
  }

  function card(event){
    const past=new Date(event.ends_at)<new Date();
    const day=new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,day:'2-digit'}).format(new Date(event.starts_at));
    const mon=new Intl.DateTimeFormat('cs-CZ',{timeZone:TZ,month:'short'}).format(new Date(event.starts_at));
    return `<article class='calendar-session-card ${past?'past':''}' data-session-id='${esc(event.id)}'><div class='calendar-date-block'><strong>${esc(day)}</strong><span>${esc(mon)}</span></div><div class='calendar-session-main'><div class='calendar-session-kicker'>${past?'ODEHRÁNO':'DALŠÍ HRANÍ'}</div><h3>${esc(event.title)}</h3><p class='calendar-session-time'>🕒 ${esc(fmtDate(event.starts_at))}, ${esc(fmtTime(event.starts_at))}–${esc(fmtTime(event.ends_at))}</p>${event.location?`<p>📍 ${esc(event.location)}</p>`:''}${event.description?`<p class='calendar-session-description'>${esc(event.description)}</p>`:''}<div class='calendar-session-actions'><a class='button calendar-google-button' target='_blank' rel='noopener noreferrer' href='${esc(googleUrl(event))}'>Google Kalendář</a>${canManage()?`<button class='button secondary' type='button' data-edit-session='${esc(event.id)}'>Upravit</button><button class='button ghost calendar-delete' type='button' data-delete-session='${esc(event.id)}'>Smazat</button>`:''}</div></div></article>`;
  }

  function render(){
    if(!isRoute()) return;
    const upcoming=state.sessions.filter(e=>new Date(e.ends_at)>=new Date()),past=state.sessions.filter(e=>new Date(e.ends_at)<new Date()).slice(-4).reverse();
    app.innerHTML=`<article class='standard-reference calendar-reference'><section class='hero calendar-hero'><div class='eyebrow'>DRUŽINA</div><h1>Kalendář</h1><p>Termíny hraní Družiny. Kliknutím na Google Kalendář se otevře předvyplněná událost, kterou už jen potvrdíš.</p>${canManage()?`<div class='hero-actions'><button class='button' id='calendarNewSession' type='button'>+ Nový termín</button></div>`:''}</section>${monthGrid()}<section class='calendar-list-section'><div class='section-head'><h2>Nadcházející hraní</h2><p>${upcoming.length?upcoming.length+' naplánováno':'Zatím nic naplánovaného'}</p></div><div class='calendar-session-list'>${upcoming.length?upcoming.map(card).join(''):`<div class='calendar-empty'>🎲 Žádný další termín zatím není zadaný.</div>`}</div></section>${past.length?`<section class='calendar-list-section calendar-past-section'><div class='section-head'><h2>Poslední termíny</h2></div><div class='calendar-session-list'>${past.map(card).join('')}</div></section>`:''}<div class='calendar-modal' id='calendarModal' hidden></div></article>`;
    bind();
  }

  function bind(){
    app.querySelector('#calendarNewSession')?.addEventListener('click',()=>openForm());
    app.querySelectorAll('[data-month]').forEach(b=>b.addEventListener('click',()=>{state.viewMonth=new Date(state.viewMonth.getFullYear(),state.viewMonth.getMonth()+Number(b.dataset.month),1);render();}));
    app.querySelectorAll('[data-calendar-jump]').forEach(b=>b.addEventListener('click',()=>{const t=app.querySelector(`[data-session-id='${CSS.escape(b.dataset.calendarJump)}']`);if(t){t.scrollIntoView({behavior:'smooth',block:'center'});t.classList.add('calendar-session-focus');setTimeout(()=>t.classList.remove('calendar-session-focus'),1800);}}));
    app.querySelectorAll('[data-edit-session]').forEach(b=>b.addEventListener('click',()=>{const e=state.sessions.find(x=>x.id===b.dataset.editSession);if(e)openForm(e);}));
    app.querySelectorAll('[data-delete-session]').forEach(b=>b.addEventListener('click',()=>removeSession(b.dataset.deleteSession)));
  }

  function localForm(event){
    if(!event){const p=parts(new Date());return {sd:`${p.year}-${p.month}-${p.day}`,st:'18:00',ed:`${p.year}-${p.month}-${p.day}`,et:'22:00'};}
    const s=parts(event.starts_at),e=parts(event.ends_at);
    return {sd:`${s.year}-${s.month}-${s.day}`,st:`${s.hour}:${s.minute}`,ed:`${e.year}-${e.month}-${e.day}`,et:`${e.hour}:${e.minute}`};
  }
  function openForm(event=null){
    if(!canManage()) return;
    const modal=app.querySelector('#calendarModal'),v=localForm(event);
    if(!modal) return;
    modal.hidden=false;
    modal.innerHTML=`<div class='calendar-dialog' role='dialog' aria-modal='true'><button class='calendar-modal-close' type='button' aria-label='Zavřít'>×</button><div class='calendar-dialog-heading'><span>DRUŽINA</span><h2>${event?'Upravit termín':'Nový termín'}</h2></div><form id='calendarSessionForm'><label>Název<input name='title' maxlength='120' required value='${esc(event?.title||'DC20 – Kostelec')}'></label><div class='calendar-form-grid'><label>Začátek – datum<input name='start_date' type='date' required value='${esc(v.sd)}'></label><label>Čas<input name='start_time' type='time' required value='${esc(v.st)}'></label><label>Konec – datum<input name='end_date' type='date' required value='${esc(v.ed)}'></label><label>Čas<input name='end_time' type='time' required value='${esc(v.et)}'></label></div><label>Místo<input name='location' maxlength='240' placeholder='např. Kostelec / u Honzy' value='${esc(event?.location||'')}'></label><label>Poznámka<textarea name='description' maxlength='2000' rows='4' placeholder='Co se bude hrát, co vzít s sebou…'>${esc(event?.description||'')}</textarea></label><div class='calendar-form-status' role='status'></div><div class='calendar-form-actions'><button class='button' type='submit'>${event?'Uložit změny':'Vytvořit termín'}</button><button class='button ghost calendar-form-cancel' type='button'>Zrušit</button></div></form></div>`;
    const close=()=>{modal.hidden=true;modal.innerHTML='';};
    modal.querySelector('.calendar-modal-close').addEventListener('click',close);
    modal.querySelector('.calendar-form-cancel').addEventListener('click',close);
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
    modal.querySelector('#calendarSessionForm').addEventListener('submit',e=>save(e,event,close));
  }

  async function save(ev,existing,close){
    ev.preventDefault();
    if(!state.client||!state.channel||!state.session||!canManage()) return;
    const f=new FormData(ev.currentTarget),status=ev.currentTarget.querySelector('.calendar-form-status'),submit=ev.currentTarget.querySelector('[type=submit]');
    const start=localIso(String(f.get('start_date')),String(f.get('start_time'))),end=localIso(String(f.get('end_date')),String(f.get('end_time')));
    if(new Date(end)<=new Date(start)){status.textContent='Konec musí být později než začátek.';status.dataset.kind='error';return;}
    const payload={channel_id:state.channel.id,title:String(f.get('title')||'').trim(),starts_at:start,ends_at:end,timezone:TZ,location:String(f.get('location')||'').trim()||null,description:String(f.get('description')||'').trim()||null,created_by:state.session.user.id};
    submit.disabled=true;status.textContent='Ukládám…';
    const res=existing?await state.client.from('game_sessions').update({title:payload.title,starts_at:start,ends_at:end,timezone:TZ,location:payload.location,description:payload.description}).eq('id',existing.id):await state.client.from('game_sessions').insert(payload);
    if(res.error){status.textContent='Termín se nepodařilo uložit.';status.dataset.kind='error';submit.disabled=false;return;}
    close();await load();
  }
  async function removeSession(id){
    if(!state.client||!canManage()) return;
    const event=state.sessions.find(x=>x.id===id);
    if(!event||!confirm(`Smazat termín „${event.title}“?`)) return;
    const {error}=await state.client.from('game_sessions').delete().eq('id',id);
    if(error){alert('Termín se nepodařilo smazat.');return;}
    await load();
  }

  async function load(){
    const {data,error}=await state.client.from('game_sessions').select('id,channel_id,title,starts_at,ends_at,timezone,location,description,created_by,created_at,updated_at').eq('channel_id',state.channel.id).order('starts_at',{ascending:true});
    if(!error) state.sessions=data||[];
    render();
  }
  function stopRealtime(){if(state.realtime&&state.client)state.client.removeChannel(state.realtime);state.realtime=null;}
  function startRealtime(){
    stopRealtime();
    if(!state.client||!state.channel)return;
    state.realtime=state.client.channel('calendar:'+state.channel.id).on('postgres_changes',{event:'*',schema:'public',table:'game_sessions',filter:'channel_id=eq.'+state.channel.id},()=>load()).subscribe();
  }

  async function init(){
    if(!isRoute()) return;
    loading();
    try{state.client=await window.dc20SupabaseReady;}catch(_e){locked('Kalendář je momentálně nedostupný.');return;}
    const {data:{session}}=await state.client.auth.getSession();state.session=session;
    if(!session){stopRealtime();locked('Termíny hraní vidí pouze přihlášení členové Družiny.');return;}
    const {data:channels}=await state.client.from('channels').select('id,name,slug').eq('slug','druzina').limit(1);
    state.channel=channels?.[0]||null;
    if(!state.channel){stopRealtime();locked('Jsi přihlášený, ale zatím nejsi členem Družiny.');return;}
    const {data:membership}=await state.client.from('channel_members').select('channel_id,user_id,role').eq('channel_id',state.channel.id).eq('user_id',session.user.id).limit(1);
    state.membership=membership?.[0]||null;
    if(!state.membership){stopRealtime();locked('Tvůj účet zatím nemá přístup do Kalendáře Družiny.');return;}
    await load();startRealtime();
  }

  window.renderDC20Calendar=init;
  window.addEventListener('hashchange',()=>{if(isRoute())init();else stopRealtime();});
  window.dc20SupabaseReady?.then(client=>client.auth.onAuthStateChange(()=>setTimeout(()=>{if(isRoute())init();},0)));
  if(isRoute()) init();
})();