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
    attachments:new Map(),
    selectedFile:null,
    previewUrl:'',
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
    <div class="chat-attachment-preview" id="chatAttachmentPreview" hidden></div>
    <form class="chat-compose" id="chatForm">
      <label class="chat-attach-button" title="Přidat obrázek nebo GIF" aria-label="Přidat obrázek nebo GIF">
        <input id="chatFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
        <span aria-hidden="true">＋</span>
      </label>
      <textarea name="message" maxlength="8000" rows="1" placeholder="Napiš zprávu…" aria-label="Zpráva"></textarea>
      <button class="chat-send-button" type="submit" aria-label="Odeslat zprávu">➤</button>
    </form>
  `;
  document.body.appendChild(panel);

  const body=panel.querySelector('#chatBody');
  const form=panel.querySelector('#chatForm');
  const textarea=form.querySelector('textarea');
  const fileInput=panel.querySelector('#chatFile');
  const attachmentPreview=panel.querySelector('#chatAttachmentPreview');
  const sendButton=form.querySelector('.chat-send-button');
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

  async function signedChatMedia(path){
    if(!path || !state.client) return '';
    const {data,error}=await state.client.storage.from('chat-media').createSignedUrl(path,3600);
    return error?'':(data?.signedUrl||'');
  }

  function clearSelectedFile(){
    if(state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl='';
    state.selectedFile=null;
    fileInput.value='';
    attachmentPreview.hidden=true;
    attachmentPreview.innerHTML='';
  }

  function showSelectedFile(file){
    clearSelectedFile();
    state.selectedFile=file;
    state.previewUrl=URL.createObjectURL(file);
    const isGif=file.type==='image/gif';
    attachmentPreview.hidden=false;
    attachmentPreview.innerHTML=`
      <div class="chat-preview-card">
        <img src="${esc(state.previewUrl)}" alt="">
        <div><strong>${isGif?'GIF':'Obrázek'}</strong><small>${esc(file.name)} · ${(file.size/1024/1024).toFixed(1)} MB</small></div>
        <button type="button" class="chat-preview-remove" aria-label="Odebrat přílohu">×</button>
      </div>
    `;
    attachmentPreview.querySelector('.chat-preview-remove').addEventListener('click',clearSelectedFile);
  }

  async function loadAttachments(messageIds){
    const ids=[...new Set(messageIds.filter(Boolean))];
    state.attachments.clear();
    if(!ids.length || !state.channel) return;
    const {data,error}=await state.client
      .from('attachments')
      .select('id,message_id,channel_id,user_id,storage_path,kind,mime_type,file_name,size_bytes,created_at')
      .eq('channel_id',state.channel.id)
      .in('message_id',ids);
    if(error) return;
    await Promise.all((data||[]).map(async attachment=>{
      const item={...attachment,signed_url:await signedChatMedia(attachment.storage_path)};
      const list=state.attachments.get(item.message_id)||[];
      list.push(item);
      state.attachments.set(item.message_id,list);
    }));
  }

  function attachmentMarkup(messageId){
    const list=state.attachments.get(messageId)||[];
    return list.map(item=>{
      if(!item.signed_url) return '';
      const gif=item.kind==='gif' || item.mime_type==='image/gif';
      return `
        <a class="chat-media-link" href="${esc(item.signed_url)}" target="_blank" rel="noopener">
          <img class="chat-media-image" src="${esc(item.signed_url)}" alt="${esc(item.file_name||'Příloha')}" loading="lazy" decoding="async">
          ${gif?'<span class="chat-gif-badge">GIF</span>':''}
        </a>
      `;
    }).join('');
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
    const mediaHtml=attachmentMarkup(message.id);
    return `
      <article class="chat-message ${mine?'mine':''}" data-message-id="${esc(message.id)}">
        <div class="chat-message-avatar">${avatar}</div>
        <div class="chat-message-main">
          <div class="chat-message-meta"><strong>${esc(name)}</strong><time datetime="${esc(message.created_at)}">${esc(formatTime(message.created_at))}</time></div>
          <div class="chat-bubble ${!bodyHtml&&mediaHtml?'media-only':''}">
            ${bodyHtml?`<div class="chat-message-text">${bodyHtml}</div>`:''}
            ${mediaHtml}
          </div>
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
    await Promise.all([
      loadProfiles(state.messages.map(m=>m.user_id)),
      loadAttachments(state.messages.map(m=>m.id))
    ]);
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
      .on(
        'postgres_changes',
        {
          event:'INSERT',
          schema:'public',
          table:'attachments',
          filter:'channel_id=eq.'+state.channel.id
        },
        async payload=>{
          const attachment={...payload.new,signed_url:await signedChatMedia(payload.new.storage_path)};
          const list=state.attachments.get(attachment.message_id)||[];
          if(!list.some(item=>item.id===attachment.id)){
            list.push(attachment);
            state.attachments.set(attachment.message_id,list);
          }
          const nearBottom=body.scrollHeight-body.scrollTop-body.clientHeight<120;
          renderMessages({stickBottom:nearBottom});
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
    state.attachments.clear();
    clearSelectedFile();
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
    const file=state.selectedFile;
    if(!text && !file) return;

    textarea.disabled=true;
    fileInput.disabled=true;
    sendButton.disabled=true;
    setConnection(file?'Nahrávám přílohu…':'Odesílám…','');

    const messageId=crypto.randomUUID();
    const {data:sentMessage,error:messageError}=await state.client
      .from('messages')
      .insert({
        id:messageId,
        channel_id:state.channel.id,
        user_id:state.session.user.id,
        body:text
      })
      .select('id,channel_id,user_id,body,reply_to,created_at,edited_at')
      .single();

    if(messageError){
      textarea.disabled=false;
      fileInput.disabled=false;
      sendButton.disabled=false;
      setConnection('Zpráva se neodeslala','error');
      textarea.focus();
      return;
    }

    if(sentMessage && !state.messages.some(m=>m.id===sentMessage.id)){
      state.messages.push(sentMessage);
      renderMessages();
    }

    if(file){
      const extByType={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
      const ext=extByType[file.type];
      const storagePath=`${state.channel.id}/${state.session.user.id}/${messageId}/image.${ext}`;
      const {error:uploadError}=await state.client.storage
        .from('chat-media')
        .upload(storagePath,file,{upsert:false,contentType:file.type,cacheControl:'3600'});

      if(uploadError){
        if(!text) await state.client.from('messages').delete().eq('id',messageId);
        textarea.disabled=false;
        fileInput.disabled=false;
        sendButton.disabled=false;
        setConnection(text?'Text odeslán, obrázek selhal':'Obrázek se nepodařilo odeslat','error');
        return;
      }

      const {data:attachment,error:attachmentError}=await state.client
        .from('attachments')
        .insert({
          message_id:messageId,
          channel_id:state.channel.id,
          user_id:state.session.user.id,
          storage_path:storagePath,
          kind:file.type==='image/gif'?'gif':'image',
          mime_type:file.type,
          file_name:file.name,
          size_bytes:file.size
        })
        .select('id,message_id,channel_id,user_id,storage_path,kind,mime_type,file_name,size_bytes,created_at')
        .single();

      if(attachmentError){
        await state.client.storage.from('chat-media').remove([storagePath]);
        if(!text) await state.client.from('messages').delete().eq('id',messageId);
        textarea.disabled=false;
        fileInput.disabled=false;
        sendButton.disabled=false;
        setConnection(text?'Text odeslán, obrázek selhal':'Obrázek se nepodařilo uložit','error');
        return;
      }

      if(attachment){
        const item={...attachment,signed_url:await signedChatMedia(storagePath)};
        state.attachments.set(messageId,[item]);
        renderMessages();
      }
    }

    textarea.value='';
    textarea.style.height='';
    clearSelectedFile();
    textarea.disabled=false;
    fileInput.disabled=false;
    sendButton.disabled=false;
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
  fileInput.addEventListener('change',()=>{
    const file=fileInput.files?.[0];
    if(!file) return clearSelectedFile();
    const allowed=['image/jpeg','image/png','image/webp','image/gif'];
    if(!allowed.includes(file.type)){
      clearSelectedFile();
      setConnection('Použij JPEG, PNG, WebP nebo GIF','error');
      return;
    }
    if(file.size>10485760){
      clearSelectedFile();
      setConnection('Obrázek je větší než 10 MB','error');
      return;
    }
    showSelectedFile(file);
    setConnection('Příloha připravena','ok');
  });
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
