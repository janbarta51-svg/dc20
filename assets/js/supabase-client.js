(() => {
  const URL='https://vnbmfhxbjcrfvhpzblnv.supabase.co';
  const PUBLISHABLE_KEY='sb_publishable_jPqlfIMqmnITW8w0Cn7-7g_3fhxPVTC';
  const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.min.js';

  function makeClient(){
    if(window.dc20Supabase) return window.dc20Supabase;
    if(!window.supabase?.createClient) throw new Error('Supabase SDK unavailable');
    window.dc20Supabase=window.supabase.createClient(URL,PUBLISHABLE_KEY,{
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:true
      }
    });
    return window.dc20Supabase;
  }

  window.dc20SupabaseReady=new Promise((resolve,reject)=>{
    try{
      if(window.supabase?.createClient){
        resolve(makeClient());
        return;
      }
      const script=document.createElement('script');
      script.src=SDK;
      script.async=true;
      script.crossOrigin='anonymous';
      script.addEventListener('load',()=>{try{resolve(makeClient());}catch(err){reject(err);}});
      script.addEventListener('error',()=>reject(new Error('Supabase SDK failed to load')));
      document.head.appendChild(script);
    }catch(err){
      reject(err);
    }
  });
})();
