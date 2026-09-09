(() => {
  function syncIcons(root=document){
    root.querySelectorAll('.lore-toggle').forEach(btn=>{
      const icon=btn.querySelector('.lore-chevron');
      if(!icon) return;
      const expanded=btn.getAttribute('aria-expanded')==='true';
      icon.textContent=expanded?'−':'+';
      icon.setAttribute('aria-hidden','true');
    });
  }

  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('.lore-toggle');
    if(!btn) return;
    // app.js updates aria-expanded during the same click handler; wait for it.
    queueMicrotask(()=>syncIcons(btn.closest('.lore-item')||document));
  });

  const app=document.getElementById('app');
  if(app){
    const observer=new MutationObserver(()=>syncIcons(app));
    observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-expanded']});
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>syncIcons());
  }else{
    syncIcons();
  }
})();
