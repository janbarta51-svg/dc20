(() => {
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;
  document.documentElement.classList.toggle('pwa-standalone',standalone);
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  let deferredInstall=null;

  function syncViewport(){
    const viewport=window.visualViewport;
    const height=viewport?.height || window.innerHeight;
    const top=viewport?.offsetTop || 0;
    document.documentElement.style.setProperty('--visual-viewport-height',height+'px');
    document.documentElement.style.setProperty('--visual-viewport-top',top+'px');
    document.documentElement.classList.toggle('soft-keyboard-open',Boolean(viewport && window.innerHeight-height>120));
  }

  syncViewport();
  window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncViewport,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(syncViewport,120),{passive:true});
  window.addEventListener('resize',syncViewport,{passive:true});

  document.addEventListener('focusin',event=>{
    if(!event.target.matches?.('input,textarea,select')) return;
    setTimeout(()=>{
      syncViewport();
      if(event.target.closest('.chat-panel')){
        document.querySelector('#chatBody')?.scrollTo({top:document.querySelector('#chatBody')?.scrollHeight||0,behavior:'auto'});
      }
    },180);
  });

  function dismissed(){
    return localStorage.getItem('dc20-install-dismissed')==='1';
  }

  function removeInstallUI(){
    document.querySelector('.install-app-chip')?.remove();
    document.querySelector('.install-help-modal')?.remove();
  }

  function showIOSHelp(){
    document.querySelector('.install-help-modal')?.remove();
    const modal=document.createElement('div');
    modal.className='install-help-modal';
    modal.innerHTML=`
      <div class="install-help-card" role="dialog" aria-modal="true" aria-labelledby="installHelpTitle">
        <button class="install-help-close" type="button" aria-label="Zavřít">×</button>
        <span class="install-help-icon">📲</span>
        <h2 id="installHelpTitle">Přidat Gangsterku na plochu</h2>
        <p>V prohlížeči otevři nabídku <strong>Sdílet</strong> a vyber <strong>Přidat na plochu</strong>. Potom se Gangsterka otevírá jako samostatná aplikace.</p>
        <button class="install-help-ok" type="button">Rozumím</button>
      </div>
    `;
    document.body.appendChild(modal);
    const close=()=>modal.remove();
    modal.querySelector('.install-help-close').addEventListener('click',close);
    modal.querySelector('.install-help-ok').addEventListener('click',close);
    modal.addEventListener('click',event=>{if(event.target===modal) close();});
  }

  function ensureInstallChip(){
    if(standalone || dismissed() || document.querySelector('.install-app-chip')) return;
    if(!deferredInstall && !isIOS) return;

    const chip=document.createElement('div');
    chip.className='install-app-chip';
    chip.innerHTML=`
      <button class="install-app-action" type="button">📲 <span>Přidat na plochu</span></button>
      <button class="install-app-dismiss" type="button" aria-label="Skrýt nabídku instalace">×</button>
    `;
    document.body.appendChild(chip);

    chip.querySelector('.install-app-action').addEventListener('click',async()=>{
      if(deferredInstall){
        const prompt=deferredInstall;
        deferredInstall=null;
        await prompt.prompt();
        removeInstallUI();
        return;
      }
      if(isIOS) showIOSHelp();
    });
    chip.querySelector('.install-app-dismiss').addEventListener('click',()=>{
      localStorage.setItem('dc20-install-dismissed','1');
      chip.remove();
    });
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredInstall=event;
    ensureInstallChip();
  });

  window.addEventListener('appinstalled',()=>{
    deferredInstall=null;
    localStorage.removeItem('dc20-install-dismissed');
    removeInstallUI();
  });

  if(isIOS && !standalone){
    setTimeout(ensureInstallChip,1600);
  }

  document.addEventListener('click',event=>{
    const link=event.target.closest?.('.nav-cluster a');
    if(!link) return;
    const header=document.querySelector('#siteHeader');
    header?.classList.remove('mobile-open');
    document.querySelector('#navToggle')?.setAttribute('aria-expanded','false');
  });
})();
