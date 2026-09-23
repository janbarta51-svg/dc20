(() => {
  const VAPID_PUBLIC='BMQLVrWk4co437bwUW9MggYtAcPgmV4J59XUNqr9c6wXGXJjUmTbODYNA2O3WTltr0TQG6zu4t0GlOIUnhdFu8Q';
  const header=document.querySelector('.chat-header');
  const close=header?.querySelector('.chat-close');
  if(!header||!close) return;
  const bell=document.createElement('button');
  bell.type='button'; bell.className='chat-notification-toggle'; bell.title='Zapnout oznámení'; bell.textContent='🔕';
  close.before(bell);
  let client=null,session=null;

  const b64=s=>{const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(b);return Uint8Array.from(r,c=>c.charCodeAt(0))};
  function toast(title,body=''){
    document.querySelector('.push-toast')?.remove();
    const el=document.createElement('button'); el.type='button'; el.className='push-toast';
    el.innerHTML='<strong>'+String(title).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</strong><span>'+String(body).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</span>';
    el.addEventListener('click',()=>{document.querySelector('.chat-fab')?.click();el.remove()});
    document.body.appendChild(el); setTimeout(()=>el.remove(),5000);
  }
  async function syncButton(){
    if(!session||!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){bell.hidden=!session;return}
    bell.hidden=false;
    const sub=await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    const on=Notification.permission==='granted'&&!!sub;
    bell.textContent=on?'🔔':'🔕'; bell.title=on?'Oznámení zapnutá – kliknutím vypnout':'Zapnout oznámení';
    if(on) await save(sub);
  }
  async function save(sub){
    const j=sub.toJSON(),k=j.keys||{};
    if(!session||!k.p256dh||!k.auth) return;
    await client.from('push_subscriptions').upsert({user_id:session.user.id,endpoint:j.endpoint,p256dh:k.p256dh,auth:k.auth,user_agent:navigator.userAgent.slice(0,500),updated_at:new Date().toISOString()},{onConflict:'endpoint'});
  }
  async function toggle(){
    if(!session) return toast('Nejdřív se přihlas','Oznámení jsou vázaná na hráčský účet.');
    if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)) return toast('Oznámení nejsou podporovaná','Na iPhonu musí být Gangsterka přidaná na plochu.');
    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(sub&&Notification.permission==='granted'){
      await client.from('push_subscriptions').delete().eq('endpoint',sub.endpoint);
      await sub.unsubscribe(); await syncButton(); return toast('Oznámení vypnutá');
    }
    const permission=await Notification.requestPermission();
    if(permission!=='granted') return toast('Oznámení nejsou povolená','Povolení můžeš změnit v nastavení prohlížeče.');
    sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(VAPID_PUBLIC)});
    await save(sub); await syncButton(); toast('Oznámení zapnutá','Nové zprávy z Družiny mohou přijít i při zavřené aplikaci.');
  }
  bell.addEventListener('click',toggle);
  navigator.serviceWorker?.addEventListener('message',e=>{if(e.data?.type==='PUSH_NOTIFICATION') toast(e.data.data?.title||'Družina',e.data.data?.body||'')});
  window.addEventListener('dc20:new-chat-message',e=>{if(document.visibilityState==='visible') toast(e.detail?.sender||'Družina',e.detail?.body||'Nová zpráva')});
  if(new URLSearchParams(location.search).get('chat')==='1'){
    setTimeout(()=>document.querySelector('.chat-fab')?.click(),500);
    history.replaceState(null,'',location.pathname+location.hash);
  }
  window.dc20SupabaseReady?.then(async c=>{
    client=c; session=(await client.auth.getSession()).data?.session||null; await syncButton();
    client.auth.onAuthStateChange((_e,s)=>{session=s;setTimeout(syncButton,0)});
  });
})();
