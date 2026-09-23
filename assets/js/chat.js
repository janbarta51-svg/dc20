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
    reactions:new Map(),
    members:[],
    onlineUsers:new Set(),
    replyTo:null,
    selectedShare:null,
    shareCatalog:[],
    shareCatalogLoaded:false,
    presenceTimer:null,
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
        <div class="chat-status-line">
          <small id="chatConnection">Připojuji…</small>
          <small id="chatOnline" class="chat-online-status">0 online</small>
        </div>
      </div>
      <button class="chat-close" type="button" aria-label="Zavřít chat">×</button>
    </header>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-share-picker" id="chatSharePicker" hidden></div>
    <div class="chat-mention-menu" id="chatMentionMenu" hidden></div>
    <div class="chat-reply-preview" id="chatReplyPreview" hidden></div>
    <div class="chat-share-preview" id="chatSharePreview" hidden></div>
    <div class="chat-attachment-preview" id="chatAttachmentPreview" hidden></div>
    <form class="chat-compose" id="chatForm">
      <button class="chat-share-button" type="button" title="Sdílet obsah z Gangsterky" aria-label="Sdílet obsah z Gangsterky">📚</button>
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
  const mentionMenu=panel.querySelector('#chatMentionMenu');
  const sharePicker=panel.querySelector('#chatSharePicker');
  const sharePreview=panel.querySelector('#chatSharePreview');
  const shareButton=panel.querySelector('.chat-share-button');
  const replyPreview=panel.querySelector('#chatReplyPreview');
  const connection=panel.querySelector('#chatConnection');
  const onlineStatus=panel.querySelector('#chatOnline');
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

  function formatFullTime(value){
    try{
      return new Intl.DateTimeFormat('cs-CZ',{
        day:'numeric',month:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'
      }).format(new Date(value));
    }catch(e){
      return '';
    }
  }

  function dayKey(value){
    try{
      const d=new Date(value);
      return [d.getFullYear(),d.getMonth(),d.getDate()].join('-');
    }catch(e){
      return '';
    }
  }

  function formatDay(value){
    try{
      const d=new Date(value);
      const today=new Date();
      const yesterday=new Date();
      yesterday.setDate(today.getDate()-1);
      if(dayKey(d)===dayKey(today)) return 'Dnes';
      if(dayKey(d)===dayKey(yesterday)) return 'Včera';
      return new Intl.DateTimeFormat('cs-CZ',{weekday:'short',day:'numeric',month:'numeric',year:'numeric'}).format(d);
    }catch(e){
      return '';
    }
  }

  function mentionHandle(name=''){
    return name.trim()
      .replace(/\s+/g,'_')
      .replace(/[^\p{L}\p{N}_-]/gu,'')
      .slice(0,40);
  }

  function richMessageText(text=''){
    const known=new Set(
      [...state.profiles.values()]
        .map(profile=>mentionHandle(profile.display_name).toLocaleLowerCase('cs-CZ'))
        .filter(Boolean)
    );
    return esc(text)
      .replace(/(@[\p{L}\p{N}_-]+)/gu,token=>{
        const handle=token.slice(1).toLocaleLowerCase('cs-CZ');
        return known.has(handle)?`<mark class="chat-mention">${token}</mark>`:token;
      })
      .replace(/\n/g,'<br>');
  }

  function messageById(id){
    return state.messages.find(message=>message.id===id)||null;
  }

  function updateOnlineStatus(){
    const count=state.onlineUsers.size;
    onlineStatus.textContent=`${count} online`;
    const names=[...state.onlineUsers]
      .map(id=>state.profiles.get(id)?.display_name)
      .filter(Boolean);
    onlineStatus.title=names.length?names.join(', '):'Nikdo další není online';
  }

  function clearReply(){
    state.replyTo=null;
    replyPreview.hidden=true;
    replyPreview.innerHTML='';
  }

  function setReply(messageId){
    const message=messageById(messageId);
    if(!message) return;
    state.replyTo=message;
    const profile=state.profiles.get(message.user_id);
    const name=profile?.display_name || (message.user_id===state.session?.user?.id?'Ty':'Hráč');
    const snippet=(message.body||'Příloha').replace(/\s+/g,' ').slice(0,90);
    replyPreview.hidden=false;
    replyPreview.innerHTML=`
      <div>
        <span>Odpovídáš na <strong>${esc(name)}</strong></span>
        <small>${esc(snippet)}</small>
      </div>
      <button type="button" aria-label="Zrušit odpověď">×</button>
    `;
    replyPreview.querySelector('button').addEventListener('click',clearReply);
    textarea.focus();
  }

  function hideMentionMenu(){
    mentionMenu.hidden=true;
    mentionMenu.innerHTML='';
  }

  function updateMentionMenu(){
    if(!state.members.length){
      hideMentionMenu();
      return;
    }
    const caret=textarea.selectionStart??textarea.value.length;
    const before=textarea.value.slice(0,caret);
    const match=before.match(/(?:^|\s)@([\p{L}\p{N}_-]*)$/u);
    if(!match){
      hideMentionMenu();
      return;
    }
    const query=(match[1]||'').toLocaleLowerCase('cs-CZ');
    const choices=state.members
      .map(member=>state.profiles.get(member.user_id))
      .filter(Boolean)
      .map(profile=>({...profile,handle:mentionHandle(profile.display_name)}))
      .filter(profile=>profile.handle && profile.handle.toLocaleLowerCase('cs-CZ').includes(query))
      .slice(0,6);
    if(!choices.length){
      hideMentionMenu();
      return;
    }
    mentionMenu.hidden=false;
    mentionMenu.innerHTML=choices.map(profile=>`
      <button type="button" data-mention-handle="${esc(profile.handle)}">
        <span class="chat-mention-avatar">${profile.signed_avatar?`<img src="${esc(profile.signed_avatar)}" alt="">`:esc(initials(profile.display_name))}</span>
        <span><strong>${esc(profile.display_name)}</strong><small>@${esc(profile.handle)}</small></span>
      </button>
    `).join('');
    mentionMenu.querySelectorAll('[data-mention-handle]').forEach(button=>button.addEventListener('click',()=>{
      const handle=button.dataset.mentionHandle||'';
      const start=caret-match[1].length-1;
      textarea.value=textarea.value.slice(0,start)+'@'+handle+' '+textarea.value.slice(caret);
      const pos=start+handle.length+2;
      textarea.setSelectionRange(pos,pos);
      hideMentionMenu();
      textarea.focus();
    }));
  }

  function slugify(value=''){
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  function plainText(value=''){
    const box=document.createElement('div');
    box.innerHTML=String(value||'');
    return (box.textContent||'').replace(/\s+/g,' ').trim();
  }

  function spellRoute(spell){
    const sources=String(spell.source||'').split(',').map(x=>x.trim());
    if(sources.includes('Divine')) return '#cleric';
    const bardTags=new Set(['Embolden','Enfeeble','Healing','Illusion','Sound']);
    if(spell.school==='Enchantment'||(spell.tags||[]).some(tag=>bardTags.has(tag))) return '#bard';
    if(['Astromancy','Conjuration','Transmutation'].includes(spell.school)||(spell.tags||[]).includes('Summoning')) return '#summoner';
    return '#home';
  }

  function shareRoute(type,key,baseHash){
    return '?focus='+encodeURIComponent(type+':'+key)+baseHash;
  }

  async function loadShareCatalog(){
    if(state.shareCatalogLoaded) return state.shareCatalog;
    const rules=window.DC20_RULES||{};
    const spells=(rules.spells||[]).map(spell=>({
      type:'spell',key:spell.id,title:spell.name,
      subtitle:[spell.school,spell.cost,spell.range].filter(Boolean).join(' · '),
      body:plainText(spell.body_en).slice(0,360),image:'',
      route:shareRoute('spell',spell.id,spellRoute(spell)),icon:'✨'
    }));
    const maneuvers=(rules.maneuvers||[]).map(item=>({
      type:'maneuver',key:item.id,title:item.name,
      subtitle:[item.category,item.cost,item.range].filter(Boolean).join(' · '),
      body:plainText(item.body_en).slice(0,360),image:'',
      route:shareRoute('maneuver',item.id,'#champion'),icon:'⚔️'
    }));
    let characters=[],gangs=[];
    try{
      const responses=await Promise.all([
        fetch('content/postavy.json',{cache:'no-store'}),
        fetch('content/gangcyklopedie.json',{cache:'no-store'})
      ]);
      const pdata=responses[0].ok?await responses[0].json():[];
      const gdata=responses[1].ok?await responses[1].json():[];
      characters=(Array.isArray(pdata)?pdata:[]).map(item=>{
        const title=item.name||item.title||'Postava';
        const key=slugify(title);
        return {type:'character',key,title,subtitle:'Postava z Kostelce',body:plainText(item.description||item.body||'').slice(0,360),image:item.image||'',route:shareRoute('character',key,'#postavy'),icon:'🧙'};
      });
      gangs=(Array.isArray(gdata)?gdata:[]).map(item=>{
        const title=item.title||item.name||'Gang';
        const key=slugify(title);
        return {type:'gang',key,title,subtitle:'Gang z Kostelce',body:plainText(item.description||item.body||'').slice(0,360),image:item.icon||item.image||'',route:shareRoute('gang',key,'#gangcyklopedie'),icon:'☠️'};
      });
    }catch(e){}
    state.shareCatalog=[...spells,...maneuvers,...characters,...gangs];
    state.shareCatalogLoaded=true;
    return state.shareCatalog;
  }

  function shareTypeLabel(type){
    return ({spell:'Spell',maneuver:'Maneuver',character:'Postava',gang:'Gang',item:'Item'})[type]||'Obsah';
  }

  function clearShare(){
    state.selectedShare=null;
    sharePreview.hidden=true;
    sharePreview.innerHTML='';
  }

  function showSharePreview(item){
    state.selectedShare=item;
    sharePreview.hidden=false;
    const media=item.image?'<img src="'+esc(item.image)+'" alt="">':'<span class="chat-share-preview-icon">'+esc(item.icon||'📚')+'</span>';
    sharePreview.innerHTML='<div class="chat-share-preview-card">'+media+'<div><small>'+esc(shareTypeLabel(item.type))+'</small><strong>'+esc(item.title)+'</strong><span>'+esc(item.subtitle||'')+'</span></div><button type="button" aria-label="Odebrat sdílenou kartu">×</button></div>';
    sharePreview.querySelector('button').addEventListener('click',clearShare);
    sharePicker.hidden=true;
  }

  async function openSharePicker(){
    if(!state.session){ setConnection('Pro sdílení se nejdřív přihlas','error'); return; }
    const catalog=await loadShareCatalog();
    sharePicker.hidden=false;
    sharePicker.innerHTML='<div class="chat-share-picker-head"><strong>Sdílet z Gangsterky</strong><button type="button" class="chat-share-picker-close" aria-label="Zavřít">×</button></div><div class="chat-share-filters"><input type="search" placeholder="Hledat spell, postavu, gang…" aria-label="Hledat obsah"><select aria-label="Typ obsahu"><option value="">Vše</option><option value="spell">Spelly</option><option value="maneuver">Maneuvers</option><option value="character">Postavy</option><option value="gang">Gangy</option></select></div><div class="chat-share-results"></div>';
    const input=sharePicker.querySelector('input');
    const select=sharePicker.querySelector('select');
    const results=sharePicker.querySelector('.chat-share-results');
    const render=()=>{
      const q=(input.value||'').toLocaleLowerCase('cs-CZ').trim();
      const type=select.value;
      const filtered=catalog.filter(item=>(!type||item.type===type)&&(!q||[item.title,item.subtitle,item.body].join(' ').toLocaleLowerCase('cs-CZ').includes(q))).slice(0,80);
      if(!filtered.length){ results.innerHTML='<p class="chat-share-empty">Nic jsem nenašel.</p>'; return; }
      results.innerHTML=filtered.map((item,index)=>{
        const media=item.image?'<img src="'+esc(item.image)+'" alt="">':esc(item.icon||'📚');
        const meta=shareTypeLabel(item.type)+(item.subtitle?' · '+item.subtitle:'');
        return '<button type="button" data-share-index="'+index+'"><span class="chat-share-result-icon">'+media+'</span><span><strong>'+esc(item.title)+'</strong><small>'+esc(meta)+'</small></span></button>';
      }).join('');
      results.querySelectorAll('[data-share-index]').forEach(button=>button.addEventListener('click',()=>{
        const item=filtered[Number(button.dataset.shareIndex)];
        if(item) showSharePreview(item);
      }));
    };
    input.addEventListener('input',render);
    select.addEventListener('change',render);
    sharePicker.querySelector('.chat-share-picker-close').addEventListener('click',()=>{sharePicker.hidden=true;});
    render();
    input.focus();
  }

  function shareCardMarkup(message){
    if(!message.share_type||!message.share_title) return '';
    const route=String(message.share_route||'');
    const safeRoute=/^\?focus=[^#]{1,140}#(?:home|cleric|champion|bard|summoner|postavy|gangcyklopedie)$/.test(route)?route:'';
    const image=String(message.share_image||'');
    const safeImage=/^(?:assets\/|https:\/\/)/.test(image)?image:'';
    const icon=({spell:'✨',maneuver:'⚔️',character:'🧙',gang:'☠️',item:'🎒'})[message.share_type]||'📚';
    const media=safeImage?'<img src="'+esc(safeImage)+'" alt="">':'<b>'+icon+'</b>';
    let copy='<span class="chat-shared-card-copy"><small>'+esc(shareTypeLabel(message.share_type))+'</small><strong>'+esc(message.share_title)+'</strong>';
    if(message.share_subtitle) copy+='<em>'+esc(message.share_subtitle)+'</em>';
    if(message.share_body) copy+='<span>'+esc(message.share_body)+'</span>';
    copy+='</span>';
    const open=safeRoute?'<span class="chat-shared-card-open">Otevřít ›</span>':'';
    const inner='<span class="chat-shared-card-media">'+media+'</span>'+copy+open;
    return safeRoute?'<a class="chat-shared-card" href="'+esc(safeRoute)+'">'+inner+'</a>':'<div class="chat-shared-card">'+inner+'</div>';
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

  async function loadMembers(){
    state.members=[];
    if(!state.channel) return;
    const {data,error}=await state.client
      .from('channel_members')
      .select('user_id,role,joined_at')
      .eq('channel_id',state.channel.id);
    if(error) return;
    state.members=data||[];
    await loadProfiles(state.members.map(member=>member.user_id));
  }

  async function loadReactions(messageIds){
    state.reactions.clear();
    const ids=[...new Set(messageIds.filter(Boolean))];
    if(!ids.length || !state.channel) return;
    const {data,error}=await state.client
      .from('reactions')
      .select('message_id,channel_id,user_id,emoji,created_at')
      .eq('channel_id',state.channel.id)
      .in('message_id',ids);
    if(error) return;
    (data||[]).forEach(reaction=>{
      const list=state.reactions.get(reaction.message_id)||[];
      list.push(reaction);
      state.reactions.set(reaction.message_id,list);
    });
  }

  async function loadPresence(){
    state.onlineUsers.clear();
    if(!state.channel) return;
    const cutoff=new Date(Date.now()-90000).toISOString();
    const {data,error}=await state.client
      .from('member_presence')
      .select('user_id,last_seen')
      .eq('channel_id',state.channel.id)
      .gte('last_seen',cutoff);
    if(!error){
      (data||[]).forEach(row=>state.onlineUsers.add(row.user_id));
    }
    updateOnlineStatus();
  }

  async function touchPresence(){
    if(!state.session?.user || !state.channel) return;
    await state.client
      .from('member_presence')
      .upsert({
        channel_id:state.channel.id,
        user_id:state.session.user.id,
        last_seen:new Date().toISOString()
      },{onConflict:'channel_id,user_id'});
  }

  function stopPresence(){
    if(state.presenceTimer) clearInterval(state.presenceTimer);
    state.presenceTimer=null;
    state.onlineUsers.clear();
    updateOnlineStatus();
  }

  async function startPresence(){
    stopPresence();
    if(!state.session?.user || !state.channel) return;
    await touchPresence();
    await loadPresence();
    state.presenceTimer=setInterval(async()=>{
      await touchPresence();
      await loadPresence();
    },45000);
  }

  function reactionMarkup(messageId){
    const list=state.reactions.get(messageId)||[];
    if(!list.length) return '';
    const grouped=new Map();
    list.forEach(reaction=>{
      const group=grouped.get(reaction.emoji)||{count:0,mine:false};
      group.count+=1;
      if(reaction.user_id===state.session?.user?.id) group.mine=true;
      grouped.set(reaction.emoji,group);
    });
    return `<div class="chat-reactions">${[...grouped.entries()].map(([emoji,group])=>`
      <button type="button" class="chat-reaction-chip ${group.mine?'mine':''}" data-reaction-emoji="${esc(emoji)}" data-message-id="${esc(messageId)}">
        <span>${esc(emoji)}</span><small>${group.count}</small>
      </button>
    `).join('')}</div>`;
  }

  function replyMarkup(message){
    if(!message.reply_to) return '';
    const parent=messageById(message.reply_to);
    if(!parent) return '<div class="chat-reply-quote"><strong>Odpověď</strong><span>Starší zpráva</span></div>';
    const profile=state.profiles.get(parent.user_id);
    const name=profile?.display_name || (parent.user_id===state.session?.user?.id?'Ty':'Hráč');
    const snippet=(parent.body||'Příloha').replace(/\s+/g,' ').slice(0,100);
    return `<button type="button" class="chat-reply-quote" data-scroll-message="${esc(parent.id)}">
      <strong>${esc(name)}</strong><span>${esc(snippet)}</span>
    </button>`;
  }

  async function toggleReaction(messageId,emoji){
    if(!state.session?.user || !state.channel || !messageId || !emoji) return;
    const list=state.reactions.get(messageId)||[];
    const mine=list.find(reaction=>reaction.user_id===state.session.user.id && reaction.emoji===emoji);
    if(mine){
      const {error}=await state.client.from('reactions')
        .delete()
        .eq('message_id',messageId)
        .eq('user_id',state.session.user.id)
        .eq('emoji',emoji);
      if(error){
        setConnection('Reakci se nepodařilo odebrat','error');
        return;
      }
    }else{
      const {error}=await state.client.from('reactions').insert({
        message_id:messageId,
        channel_id:state.channel.id,
        user_id:state.session.user.id,
        emoji
      });
      if(error){
        setConnection('Reakci se nepodařilo přidat','error');
        return;
      }
    }
    await loadReactions(state.messages.map(message=>message.id));
    renderMessages({stickBottom:false});
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
    const bodyHtml=richMessageText(message.body);
    const mediaHtml=attachmentMarkup(message.id);
    const shareHtml=shareCardMarkup(message);
    const online=state.onlineUsers.has(message.user_id);
    const reactions=reactionMarkup(message.id);
    const reply=replyMarkup(message);
    return `
      <article class="chat-message ${mine?'mine':''}" data-message-id="${esc(message.id)}">
        <div class="chat-message-avatar">${avatar}<i class="chat-presence-dot ${online?'online':''}"></i></div>
        <div class="chat-message-main">
          <div class="chat-message-meta">
            <strong>${esc(name)}</strong>
            <time datetime="${esc(message.created_at)}" title="${esc(formatFullTime(message.created_at))}">${esc(formatTime(message.created_at))}</time>
          </div>
          <div class="chat-bubble ${!bodyHtml&&(mediaHtml||shareHtml)?'media-only':''}">
            ${reply}
            ${bodyHtml?`<div class="chat-message-text">${bodyHtml}</div>`:''}
            ${shareHtml}
            ${mediaHtml}
          </div>
          <div class="chat-message-actions">
            <button type="button" data-reply-message="${esc(message.id)}" title="Odpovědět">↩</button>
            <div class="chat-reaction-picker-wrap">
              <button type="button" data-open-reactions="${esc(message.id)}" title="Přidat reakci">☺</button>
              <div class="chat-reaction-picker" data-picker-for="${esc(message.id)}" hidden>
                ${['👍','❤️','😂','🔥','🎲','💀'].map(emoji=>`<button type="button" data-pick-reaction="${esc(emoji)}" data-message-id="${esc(message.id)}">${emoji}</button>`).join('')}
              </div>
            </div>
          </div>
          ${reactions}
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
    let lastDay='';
    const parts=[];
    state.messages.forEach(message=>{
      const day=dayKey(message.created_at);
      if(day!==lastDay){
        parts.push(`<div class="chat-day-separator"><span>${esc(formatDay(message.created_at))}</span></div>`);
        lastDay=day;
      }
      parts.push(messageMarkup(message));
    });
    body.innerHTML=parts.join('');
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
      .select('id,channel_id,user_id,body,reply_to,share_type,share_key,share_title,share_subtitle,share_body,share_route,share_image,created_at,edited_at')
      .eq('channel_id',state.channel.id)
      .order('created_at',{ascending:false})
      .limit(100);

    if(error){
      setConnection('Historii se nepodařilo načíst','error');
      return;
    }
    state.messages=(data||[]).reverse();
    await loadMembers();
    await Promise.all([
      loadProfiles(state.messages.map(m=>m.user_id)),
      loadAttachments(state.messages.map(m=>m.id)),
      loadReactions(state.messages.map(m=>m.id)),
      loadPresence()
    ]);
    renderMessages();
    calculateUnread();
  }

  function stopRealtime(){
    if(state.realtime && state.client) state.client.removeChannel(state.realtime);
    state.realtime=null;
    stopPresence();
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
          if(message.user_id!==state.session?.user?.id){
            const sender=state.profiles.get(message.user_id)?.display_name||'Družina';
            window.dispatchEvent(new CustomEvent('dc20:new-chat-message',{detail:{sender,body:message.body||'📷 Nová příloha'}}));
          }
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
      .on(
        'postgres_changes',
        {event:'*',schema:'public',table:'reactions'},
        async ()=>{
          await loadReactions(state.messages.map(message=>message.id));
          renderMessages({stickBottom:false});
        }
      )
      .on(
        'postgres_changes',
        {
          event:'*',
          schema:'public',
          table:'member_presence',
          filter:'channel_id=eq.'+state.channel.id
        },
        async ()=>{
          await loadPresence();
          renderMessages({stickBottom:false});
        }
      )
      .subscribe(async status=>{
        if(status==='SUBSCRIBED'){
          setConnection('Online · zprávy živě','ok');
          await startPresence();
        }
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
    state.reactions.clear();
    state.members=[];
    state.onlineUsers.clear();
    clearSelectedFile();
    clearShare();
    sharePicker.hidden=true;
    clearReply();
    hideMentionMenu();
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

  function notifyPush(messageId){
    state.client?.functions?.invoke('send-chat-push',{body:{message_id:messageId}}).catch(()=>{});
  }

  async function sendMessage(event){
    event.preventDefault();
    if(!state.session?.user || !state.channel) return;
    const text=textarea.value.trim();
    const file=state.selectedFile;
    const share=state.selectedShare;
    if(!text && !file && !share) return;

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
        body:text,
        reply_to:state.replyTo?.id||null,
        share_type:share?.type||null,
        share_key:share?.key||null,
        share_title:share?.title||null,
        share_subtitle:share?.subtitle||null,
        share_body:share?.body||null,
        share_route:share?.route||null,
        share_image:share?.image||null
      })
      .select('id,channel_id,user_id,body,reply_to,share_type,share_key,share_title,share_subtitle,share_body,share_route,share_image,created_at,edited_at')
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

    if(!file) notifyPush(messageId);

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
        if(text) notifyPush(messageId);
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
        if(text) notifyPush(messageId);
        setConnection(text?'Text odeslán, obrázek selhal':'Obrázek se nepodařilo uložit','error');
        return;
      }

      if(attachment){
        const item={...attachment,signed_url:await signedChatMedia(storagePath)};
        state.attachments.set(messageId,[item]);
        renderMessages();
        notifyPush(messageId);
      }
    }

    textarea.value='';
    textarea.style.height='';
    clearSelectedFile();
    clearShare();
    clearReply();
    hideMentionMenu();
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
  shareButton.addEventListener('click',()=>sharePicker.hidden?openSharePicker():(sharePicker.hidden=true));
  body.addEventListener('click',async event=>{
    const replyButton=event.target.closest('[data-reply-message]');
    if(replyButton){
      setReply(replyButton.dataset.replyMessage);
      return;
    }
    const openPicker=event.target.closest('[data-open-reactions]');
    if(openPicker){
      const id=openPicker.dataset.openReactions;
      body.querySelectorAll('.chat-reaction-picker').forEach(picker=>{
        picker.hidden=picker.dataset.pickerFor!==id ? true : !picker.hidden;
      });
      return;
    }
    const pick=event.target.closest('[data-pick-reaction]');
    if(pick){
      await toggleReaction(pick.dataset.messageId,pick.dataset.pickReaction);
      return;
    }
    const chip=event.target.closest('[data-reaction-emoji]');
    if(chip){
      await toggleReaction(chip.dataset.messageId,chip.dataset.reactionEmoji);
      return;
    }
    const scroll=event.target.closest('[data-scroll-message]');
    if(scroll){
      const target=body.querySelector(`[data-message-id="${CSS.escape(scroll.dataset.scrollMessage)}"]`);
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'center'});
        target.classList.add('chat-message-highlight');
        setTimeout(()=>target.classList.remove('chat-message-highlight'),1200);
      }
    }
  });
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
    updateMentionMenu();
  });
  document.addEventListener('visibilitychange',async()=>{
    if(document.visibilityState==='visible'){
      if(state.open) markRead();
      if(state.session?.user && state.channel){
        await touchPresence();
        await loadPresence();
      }
    }
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
