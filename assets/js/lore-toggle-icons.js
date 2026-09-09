(() => {
  function syncIcons(root=document){
    root.querySelectorAll('.lore-toggle').forEach(btn=>{
      const icon=btn.querySelector('.lore-chevron');
      if(!icon) return;
      const desired=btn.getAttribute('aria-expanded')==='true'?'−':'+';
      if(icon.textContent!==desired) icon.textContent=desired;
      if(icon.getAttribute('aria-hidden')!=='true') icon.setAttribute('aria-hidden','true');
    });
  }

  const app=document.getElementById('app');
  if(app){
    const observer=new MutationObserver(mutations=>{
      const relevant=mutations.some(m=>
        (m.type==='attributes' && m.attributeName==='aria-expanded') ||
        (m.type==='childList' && [...m.addedNodes].some(n=>n.nodeType===1))
      );
      if(relevant) syncIcons(app);
    });
    observer.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-expanded']});
  }

  document.addEventListener('DOMContentLoaded',()=>syncIcons());
  syncIcons();
})();
