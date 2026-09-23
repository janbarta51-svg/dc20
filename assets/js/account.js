(() => {
  const tools=document.querySelector('.header-tools');
  if(!tools) return;

  const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const state={client:null,session:null,profile:null,avatarUrl:'',busy:false};

  const button=document.createElement('button');
  button.type='button';
  button.id='accountToggle';
  button.className='tool-button account-toggle';
  button.title='Účet';
  button.innerHTML='<span class="account-avatar account-avatar-fallback">👤</span><span class="account-toggle-label">Přihlásit</span>';
  tools.prepend(button);

  const modal=document.createElement('div');
  modal.className='account-modal';
  modal.hidden=true;
  modal.innerHTML='<div class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="accountTitle"><button class="account-close" type="button" aria-label="Zavřít">×</button><div id="accountContent"></div></div>';
  document.body.appendChild(modal);
  const content=modal.querySelector('#accountContent');

  function initials(name=''){
    return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || '👤';
  }

  function status(message,type='info'){
    const el=modal.querySelector('.account-status');
    if(!el) return;
    el.textContent=message||'';
    el.dataset.type=type;
  }

  function open(){
    modal.hidden=false;
    document.body.classList.add('account-modal-open');
    render();
  }
  function close(){
    modal.hidden=true;
    document.body.classList.remove('account-modal-open');
  }

  async function signedAvatar(path){
    if(!path || !state.client) return '';
    const {data,error}=await state.client.storage.from('avatars').createSignedUrl(path,3600);
    if(error) return '';
    return data?.signedUrl||'';
  }

  async function refresh(){
    if(!state.client) return;
    const {data}=await state.client.auth.getSession();
    state.session=data?.session||null;
    state.profile=null;
    state.avatarUrl='';

    if(state.session?.user){
      const {data:profile}=await state.client
        .from('profiles')
        .select('display_name,avatar_url')
        .eq('id',state.session.user.id)
        .maybeSingle();
      state.profile=profile||{
        display_name:state.session.user.user_metadata?.display_name || state.session.user.email?.split('@')[0] || 'Hráč',
        avatar_url:null
      };
      state.avatarUrl=await signedAvatar(state.profile.avatar_url);
    }
    updateButton();
    if(!modal.hidden) render();
  }

  function updateButton(){
    if(!state.session){
      button.innerHTML='<span class="account-avatar account-avatar-fallback">👤</span><span class="account-toggle-label">Přihlásit</span>';
      return;
    }
    const name=state.profile?.display_name||'Účet';
    const avatar=state.avatarUrl
      ? '<img class="account-avatar" src="'+esc(state.avatarUrl)+'" alt="">'
      : '<span class="account-avatar account-avatar-fallback">'+esc(initials(name))+'</span>';
    button.innerHTML=avatar+'<span class="account-toggle-label">'+esc(name)+'</span>';
  }

  function loggedOutView(){
    content.innerHTML=`
      <section class="account-panel">
        <div class="account-heading">
          <span class="account-kicker">GANGSTERKA</span>
          <h2 id="accountTitle">Hráčský účet</h2>
          <p>Přihlášení propojí tvůj profil s chatem a dalšími funkcemi aplikace.</p>
        </div>
        <div class="account-tabs" role="tablist">
          <button type="button" class="active" data-auth-tab="login">Přihlásit</button>
          <button type="button" data-auth-tab="register">Nový účet</button>
        </div>
        <form class="account-form" id="loginForm">
          <label>E-mail<input type="email" name="email" autocomplete="email" required></label>
          <label>Heslo<input type="password" name="password" autocomplete="current-password" required></label>
          <button class="account-primary" type="submit">Přihlásit</button>
        </form>
        <form class="account-form" id="registerForm" hidden>
          <label>Jméno ve hře<input type="text" name="display_name" maxlength="40" autocomplete="nickname" required></label>
          <label>E-mail<input type="email" name="email" autocomplete="email" required></label>
          <label>Heslo<input type="password" name="password" minlength="8" autocomplete="new-password" required></label>
          <label>Kód správce <span class="account-optional">(jen úplně první účet)</span><input type="password" name="owner_code" autocomplete="off" maxlength="40" placeholder="Ostatní nechají prázdné"></label>
          <small class="account-hint">Jednorázový kód vytvoří prvního ownera Družiny. Běžní hráči ho nepotřebují.</small>
          <label>Heslo znovu<input type="password" name="password2" minlength="8" autocomplete="new-password" required></label>
          <button class="account-primary" type="submit">Vytvořit účet</button>
          <small class="account-hint">Po registraci může Supabase požadovat potvrzení e-mailu.</small>
        </form>
        <div class="account-status" role="status" aria-live="polite"></div>
      </section>`;

    modal.querySelectorAll('[data-auth-tab]').forEach(tab=>tab.addEventListener('click',()=>{
      modal.querySelectorAll('[data-auth-tab]').forEach(x=>x.classList.toggle('active',x===tab));
      modal.querySelector('#loginForm').hidden=tab.dataset.authTab!=='login';
      modal.querySelector('#registerForm').hidden=tab.dataset.authTab!=='register';
      status('');
    }));

    modal.querySelector('#loginForm').addEventListener('submit',signIn);
    modal.querySelector('#registerForm').addEventListener('submit',signUp);
  }

  function loggedInView(){
    const user=state.session.user;
    const name=state.profile?.display_name||user.user_metadata?.display_name||user.email?.split('@')[0]||'Hráč';
    const avatar=state.avatarUrl
      ? '<img class="account-profile-avatar" src="'+esc(state.avatarUrl)+'" alt="">'
      : '<div class="account-profile-avatar account-avatar-fallback">'+esc(initials(name))+'</div>';

    content.innerHTML=`
      <section class="account-panel">
        <div class="account-heading account-profile-heading">
          ${avatar}
          <div><span class="account-kicker">PŘIHLÁŠENÝ HRÁČ</span><h2 id="accountTitle">${esc(name)}</h2><p>${esc(user.email||'')}</p></div>
        </div>
        <form class="account-form" id="profileForm">
          <label>Jméno ve hře<input type="text" name="display_name" maxlength="40" value="${esc(name)}" required></label>
          <label>Avatar
            <input type="file" name="avatar" accept="image/jpeg,image/png,image/webp">
            <small class="account-hint">JPEG, PNG nebo WebP, maximálně 5 MB.</small>
          </label>
          <button class="account-primary" type="submit">Uložit profil</button>
        </form>
        <button class="account-secondary" id="signOutButton" type="button">Odhlásit</button>
        <div class="account-status" role="status" aria-live="polite"></div>
      </section>`;

    modal.querySelector('#profileForm').addEventListener('submit',saveProfile);
    modal.querySelector('#signOutButton').addEventListener('click',signOut);
  }

  function render(){
    if(!state.client){
      content.innerHTML=`
        <section class="account-panel">
          <div class="account-heading"><span class="account-kicker">GANGSTERKA</span><h2 id="accountTitle">Hráčský účet</h2></div>
          <div class="account-offline">Účet potřebuje internetové připojení. Pravidla a offline obsah dál fungují normálně.</div>
        </section>`;
      return;
    }
    if(state.session) loggedInView(); else loggedOutView();
  }

  async function signIn(event){
    event.preventDefault();
    if(state.busy) return;
    state.busy=true;
    const form=new FormData(event.currentTarget);
    status('Přihlašuji…');
    const {error}=await state.client.auth.signInWithPassword({
      email:String(form.get('email')||'').trim(),
      password:String(form.get('password')||'')
    });
    state.busy=false;
    if(error){ status('Přihlášení se nepovedlo: '+error.message,'error'); return; }
    await refresh();
  }

  async function signUp(event){
    event.preventDefault();
    if(state.busy) return;
    const form=new FormData(event.currentTarget);
    const displayName=String(form.get('display_name')||'').trim();
    const email=String(form.get('email')||'').trim();
    const password=String(form.get('password')||'');
    const password2=String(form.get('password2')||'');
    const ownerCode=String(form.get('owner_code')||'').trim();
    if(password!==password2){ status('Hesla se neshodují.','error'); return; }
    if(password.length<8){ status('Heslo musí mít alespoň 8 znaků.','error'); return; }

    state.busy=true;
    status('Vytvářím účet…');
    const {data,error}=await state.client.auth.signUp({
      email,
      password,
      options:{
        data:{display_name:displayName,...(ownerCode?{owner_code:ownerCode}:{})},
        emailRedirectTo:location.origin+location.pathname+'#home'
      }
    });
    state.busy=false;
    if(error){ status('Registrace se nepovedla: '+error.message,'error'); return; }
    if(data?.session){
      await refresh();
    }else{
      status('Účet je vytvořený. Zkontroluj e-mail a potvrď registraci.','success');
    }
  }

  async function saveProfile(event){
    event.preventDefault();
    if(state.busy || !state.session?.user) return;
    state.busy=true;
    const uid=state.session.user.id;
    const form=new FormData(event.currentTarget);
    const displayName=String(form.get('display_name')||'').trim();
    const file=form.get('avatar');

    if(!displayName){
      state.busy=false;
      status('Jméno nesmí být prázdné.','error');
      return;
    }

    status('Ukládám profil…');
    let avatarPath=state.profile?.avatar_url||null;

    if(file instanceof File && file.size){
      if(file.size>5242880){
        state.busy=false;
        status('Avatar je větší než 5 MB.','error');
        return;
      }
      const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
      const ext=allowed[file.type];
      if(!ext){
        state.busy=false;
        status('Použij JPEG, PNG nebo WebP.','error');
        return;
      }
      const newPath=uid+'/avatar.'+ext;
      const {error:uploadError}=await state.client.storage.from('avatars').upload(newPath,file,{
        upsert:true,
        contentType:file.type,
        cacheControl:'3600'
      });
      if(uploadError){
        state.busy=false;
        status('Avatar se nepodařilo nahrát: '+uploadError.message,'error');
        return;
      }
      if(avatarPath && avatarPath!==newPath){
        await state.client.storage.from('avatars').remove([avatarPath]).catch(()=>{});
      }
      avatarPath=newPath;
    }

    const {error}=await state.client
      .from('profiles')
      .update({display_name:displayName,avatar_url:avatarPath,updated_at:new Date().toISOString()})
      .eq('id',uid);

    if(!error){
      await state.client.auth.updateUser({data:{display_name:displayName}});
    }

    state.busy=false;
    if(error){ status('Profil se nepodařilo uložit: '+error.message,'error'); return; }
    await refresh();
    status('Profil uložen.','success');
  }

  async function signOut(){
    if(!state.client) return;
    await state.client.auth.signOut();
    await refresh();
  }

  button.addEventListener('click',open);
  modal.querySelector('.account-close').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden) close();});

  window.dc20SupabaseReady
    ?.then(async client=>{
      state.client=client;
      client.auth.onAuthStateChange(()=>setTimeout(refresh,0));
      await refresh();
    })
    .catch(()=>{
      state.client=null;
      updateButton();
      if(!modal.hidden) render();
    });
})();
