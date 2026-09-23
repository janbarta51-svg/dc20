(() => {
  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const state={
    client:null,
    session:null,
    channel:null,
    membership:null,
    realtime:null,
    messages:[],
    profiles:new Map(),
    open:false,
    unread:0,
    loading:false
  };

  const fab=document.createElement('button');
  fab.type='button';
  fab.className='chat-fab';
  fab.setAttribute('aria-label','Otevřít chat');
  fab.innerHTML='<span aria-hidden="true">💬</span><span class="chat-badge" hidden>0</span>';
  document.body.appendChild(fab);

  const panel=document.createElement('section');
  panel.className='chat-panel';
  panel.hidden=true;
  panel.innerHTML=`
    <header class="chat-header">
      <div>
        <span class="chat-kicker">GANGSTERKA</span>
        <strong id="chatTitle">Družina</strong>
        <small id="chatConnection">Připojuji…</small>
      </div>
      <button class="chat-close" type="button" aria-label="Zavřít chat">×</button>
    </header>
    <div class="chat-body" id="chatBody"></div>
    <form class="chat-compose" id="chatForm">
      <textarea name="message" maxlength="8000" rows="1" placeholder="Napiš zprávu…" aria-label="Zpráva"></textarea>
      <button type="submit" aria-label="Odeslat zprávu">➤</button>
    </form>
  `;
  document.body.appendChild(panel);

  const body=panel.querySelector('#chatBody');
  const form=panel.querySelector('#chatForm');
  const textarea=form.querySelector('textarea');
  const connection=panel.querySelector('#chatConnection');
  const title=panel.querySelector('#chatTitle');
  const badge=fab.querySelector('.chat-badge');

  function readKey(){
    if(!state.session?.user?.id || !state.channel?.id) return '';
    return `dc20-chat-read-${state.session.user.id}-${state.channel.id}`;
  }

  function getLastRead(){
    const key=readKey();
    return key ? localStorage.getItem(key) : null;
  }

  function markRead(){
    if(!state.channel || !state.messages.length) {
      state.unread=0;
      updateBadge();
      return;
    }
    const latest=state.messages[state.messages.length-1]?.created_at || new Date().toISOString();
    const key=readKey();
    if(key) localStorage.setItem(key,latest);
    state.unread=0;
    updateBadge();
  }

  function updateBadge(){
    badge.hidden=state.unread<1;
    badge.textContent=state.unread>99?'99+':String(state.unread);
    fab.setAttribute('aria-label',state.unread?`Otevřít chat, ${state.unread} nepřečtených zpráv`:'Otevřít chat');
  }

  function setConnection(text,status=''){
    connection.textContent=text;
    connection.dataset.status=status;
  }

  function initials(name=''){
    return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || '?';
  }

  function formatTime(value){
    try{
      return new Intl.DateTimeFormat('cs-CZ',{hour:'2-digit',minute:'2-digit'}).format(new Date(value));
    }catch(e){
      return '';
    }
  }

  async function signedAvatar(path){
    if(!path || !state.client) return '';
    const {data,error}=await state.client.storage.from('avatars').createSignedUrl(path,3600);
    return error?'':(data?.signedUrl||'');
  }

  async function loadProfile(userId){
    if(!userId || state.profiles.has(userId)) return state.profiles.get(userId);
    const {data}=await state.client
      .from('profiles')
      .select('id,display_name,avatar_url')
      .eq('id',userId)
      .maybeSingle();
    if(!data) return null;
    const profile={...data,signed_avatar:await signedAvatar(data.avatar_url)};
    state.profiles.set(userId,profile);
    return profile;
  }

  async function loadProfiles(userIds){
    const missing=[...new Set(userIds.filter(Boolean))].filter(id=>!state.profiles.has(id));
    if(!missing.length) return;
    const {data}=await state.client
      .from('profiles')
      .select('id,display_name,avatar_url')
      .in('id',missing);
    await Promise.all((data||[]).map(async profile=>{
      state.profiles.set(profile.id,{...profile,signed_avatar:await signedAvatar(profile.avatar_url)});
    }));
  }

  function emptyState(titleText,copy,buttonText=''){
    body.innerHTML=`
      <div class="chat-empty">
        <div class="chat-empty-icon">💬</div>
        <strong>${esc(titleText)}</strong>
        <p>${esc(copy)}</p>
        ${buttonText?`<button type="button" class="chat-empty-action">${esc(buttonText)}</button>`:''}
      </div>
    `;
    const action=body.querySelector('.chat-empty-action');
    if(action) action.addEventListener('click',()=>document.querySelector('#accountToggle')?.click());
  }

  function messageMarkup(message){
    const mine=message.user_id===state.session?.user?.id;
    const profile=state.profiles.get(message.user_id);
    const name=profile?.display_name || (mine?'Ty':'Hráč');
    const avatar=profile?.signed_avatar
      ? `<img src="${esc(profile.signed_avatar)}" alt="">`
      : `<span>${esc(initials(name))}</span>`;
    const bodyHtml=esc(message.body).replace(/\n/g,'<br>');
    return `
      <article class="chat-message ${mine?'mine':''}" data-message-id="${esc(message.id)}">
        <div class="chat-message-avatar">${avatar}</div>
        <div class="chat-message-main">
          <div class="chat-message-meta"><strong>${esc(name)}</strong><time datetime="${esc(message.created_at)}">${esc(formatTime(message.created_at))}</time></div>
          <div class="chat-bubble">${bodyHtml}</div>
        </div>
      </article>
    `;
  }

  function renderMessages({stickBottom=true}={}){
    if(!state.session){
      form.hidden=true;
      emptyState('Přihlas se do chatu','Chat Družiny je dostupný pouze přihlášeným hráčům.','Otevřít účet');
      return;
    }
    if(!state.membership || !state.channel){
      form.hidden=true;
      emptyState('Zatím nejsi v Družině','Účet funguje, ale owner nebo admin tě ještě musí přidat do společného chatu.');
      return;
    }
    form.hidden=false;
    if(!state.messages.length){
      emptyState('Ticho před hodem kostkou','V Družině zatím není žádná zpráva.');
      return;
    }
    body.innerHTML=state.messages.map(messageMarkup).join('');
    if(stickBottom) requestAnimationFrame(()=>{body.scrollTop=body.scrollHeight;});
  }

  function calculateUnread(){
    const lastRead=getLastRead();
    if(!lastRead){
      state.unread=state.messages.filter(m=>m.user_id!==state.session?.user?.id).length;
    }else{
      const t=new Date(lastRead).getTime();
      state.unread=state.messages.filter(m=>m.user_id!==state.session?.user?.id && new Date(m.created_at).getTime()>t).length;
    }
    if(state.open && document.visibilityState==='visible') markRead();
    else updateBadge();
  }

  async function findChannel(){
    state.channel=null;
    state.membership=null;
    if(!state.session?.user) return;

    const {data:memberships,error}=await state.client
      .from('channel_members')
      .select('channel_id,role')
      .eq('user_id',state.session.user.id)
      .limit(10);

    if(error || !memberships?.length) return;

    for(const membership of memberships){
      const {data:channel}=await state.client
        .from('channels')
        .select('id,name,slug')
        .eq('id',membership.channel_id)
        .maybeSingle();
      if(channel?.slug==='druzina'){
        state.membership=membership;
        state.channel=channel;
        break;
      }
      if(!state.channel && channel){
        state.membership=membership;
        state.channel=channel;
      }
    }
  }

  async function loadHistory(){
    state.messages=[];
    if(!state.channel) return;

    const {data,error}=await state.client
      .from('messages')
      .select('id,channel_id,user_id,body,reply_to,created_at,edited_at')
      .eq('channel_id',state.channel.id)
      .order('created_at',{ascending:false})
      .limit(100);

    if(error){
      setConnection('Historii se nepodařilo načíst','error');
      return;
    }
    state.messages=(data||[]).reverse();
    await loadProfiles(state.messages.map(m=>m.user_id));
    renderMessages();
    calculateUnread();
  }

  function stopRealtime(){
    if(state.realtime && state.client) state.client.removeChannel(state.realtime);
    state.realtime=null;
  }

  function startRealtime(){
    stopRealtime();
    if(!state.channel || !state.client) return;

    state.realtime=state.client
      .channel('dc20-chat-'+state.channel.id)
      .on(
        'postgres_changes',
        {
          event:'INSERT',
          schema:'public',
          table:'messages',
          filter:'channel_id=eq.'+state.channel.id
        },
        async payload=>{
          const message=payload.new;
          if(state.messages.some(m=>m.id===message.id)) return;
          await loadProfile(message.user_id);
          const nearBottom=body.scrollHeight-body.scrollTop-body.clientHeight<120;
          state.messages.push(message);
          renderMessages({stickBottom:nearBottom || message.user_id===state.session?.user?.id});
          if(state.open && document.visibilityState==='visible'){
            markRead();
          }else if(message.user_id!==state.session?.user?.id){
            state.unread+=1;
            updateBadge();
          }
        }
      )
      .subscribe(status=>{
        if(status==='SUBSCRIBED') setConnection('Online · zprávy živě','ok');
        else if(status==='CHANNEL_ERROR') setConnection('Realtime chyba','error');
        else if(status==='TIMED_OUT') setConnection('Připojení vypršelo','error');
        else if(status==='CLOSED') setConnection('Odpojeno','');
      });
  }

  async function refreshSession(){
    if(!state.client) return;
    const {data}=await state.client.auth.getSession();
    state.session=data?.session||null;
    state.messages=[];
    state.profiles.clear();
    stopRealtime();

    if(!state.session){
      state.channel=null;
      state.membership=null;
      state.unread=0;
      updateBadge();
      setConnection('Přihlášení je potřeba','');
      renderMessages();
      return;
    }

    setConnection('Načítám…','');
    await findChannel();
    if(!state.channel){
      state.unread=0;
      updateBadge();
      setConnection('Bez přístupu do Družiny','');
      renderMessages();
      return;
    }

    title.textContent=state.channel.name||'Družina';
    await loadHistory();
    startRealtime();
  }

  async function sendMessage(event){
    event.preventDefault();
    if(!state.session?.user || !state.channel) return;
    const text=textarea.value.trim();
    if(!text) return;

    textarea.disabled=true;
    form.querySelector('button').disabled=true;
    const {error}=await state.client.from('messages').insert({
      channel_id:state.channel.id,
      user_id:state.session.user.id,
      body:text
    });
    textarea.disabled=false;
    form.querySelector('button').disabled=false;

    if(error){
      setConnection('Zpráva se neodeslala','error');
      textarea.focus();
      return;
    }
    textarea.value='';
    textarea.style.height='';
    setConnection('Online · zprávy živě','ok');
    textarea.focus();
  }

  function openChat(){
    state.open=true;
    panel.hidden=false;
    fab.classList.add('open');
    document.body.classList.add('chat-open');
    if(state.session && state.channel) markRead();
    requestAnimationFrame(()=>{
      body.scrollTop=body.scrollHeight;
      textarea.focus({preventScroll:true});
    });
  }

  function closeChat(){
    state.open=false;
    panel.hidden=true;
    fab.classList.remove('open');
    document.body.classList.remove('chat-open');
  }

  fab.addEventListener('click',()=>state.open?closeChat():openChat());
  panel.querySelector('.chat-close').addEventListener('click',closeChat);
  form.addEventListener('submit',sendMessage);
  textarea.addEventListener('keydown',event=>{
    if(event.key==='Enter' && !event.shiftKey){
      event.preventDefault();
      form.requestSubmit();
    }
  });
  textarea.addEventListener('input',()=>{
    textarea.style.height='auto';
    textarea.style.height=Math.min(textarea.scrollHeight,120)+'px';
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible' && state.open) markRead();
  });

  window.dc20SupabaseReady
    ?.then(async client=>{
      state.client=client;
      client.auth.onAuthStateChange(()=>setTimeout(refreshSession,0));
      await refreshSession();
    })
    .catch(()=>{
      setConnection('Chat potřebuje internet','error');
      emptyState('Chat je offline','Pravidla dál fungují, ale zprávy potřebují internetové připojení.');
    });
})();
