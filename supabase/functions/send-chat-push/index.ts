import { createClient } from 'npm:@supabase/supabase-js@2.116.0'
import { sendPushBatch } from 'npm:@mmmike/web-push@1.3.0/send'

const allowedOrigins=new Set(['https://dc20.honzanacestach.cz','http://localhost:8000','http://127.0.0.1:8000'])
const cors=(req:Request)=>({
  'Access-Control-Allow-Origin':allowedOrigins.has(req.headers.get('origin')||'')?(req.headers.get('origin')||''):'https://dc20.honzanacestach.cz',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin'
})

Deno.serve(async(req:Request)=>{
  const headers=cors(req)
  let admin:any=null
  let claimedMessageId:string|null=null
  if(req.method==='OPTIONS') return new Response('ok',{headers})
  if(req.method!=='POST') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers})
  try{
    const authHeader=req.headers.get('Authorization')
    if(!authHeader) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers})
    const url=Deno.env.get('SUPABASE_URL')!
    const pubs=JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}')
    const secs=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}')
    const pub=pubs.default||Deno.env.get('SUPABASE_ANON_KEY')
    const sec=secs.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if(!pub||!sec) throw new Error('Supabase keys unavailable')
    const userClient=createClient(url,pub,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false,autoRefreshToken:false}})
    admin=createClient(url,sec,{auth:{persistSession:false,autoRefreshToken:false}})
    const {data:userData,error:userError}=await userClient.auth.getUser()
    const user=userData?.user
    if(userError||!user) return new Response(JSON.stringify({error:'Unauthorized'}),{status:401,headers})
    const {message_id}=await req.json()
    const {data:message}=await userClient.from('messages').select('id,channel_id,user_id,body,share_title').eq('id',message_id).maybeSingle()
    if(!message) return new Response(JSON.stringify({error:'Message not found'}),{status:404,headers})
    if(message.user_id!==user.id) return new Response(JSON.stringify({error:'Forbidden'}),{status:403,headers})
    const {error:claimError}=await admin.from('push_dispatches').insert({message_id:message.id,claimed_by:user.id})
    if(claimError){
      if(claimError.code==='23505') return Response.json({delivered:0,gone:0,failed:0,already_dispatched:true},{headers})
      throw claimError
    }
    claimedMessageId=message.id
    const [{data:profile},{data:members},{data:vapid}]=await Promise.all([
      admin.from('profiles').select('display_name').eq('id',user.id).maybeSingle(),
      admin.from('channel_members').select('user_id').eq('channel_id',message.channel_id).neq('user_id',user.id),
      admin.from('push_server_secrets').select('vapid_public_key,vapid_private_key,vapid_subject').eq('id','default').maybeSingle()
    ])
    if(!vapid) throw new Error('VAPID configuration missing')
    const ids=(members||[]).map((x:any)=>x.user_id)
    if(!ids.length) return Response.json({delivered:0,gone:0,failed:0},{headers})
    const {data:subs}=await admin.from('push_subscriptions').select('endpoint,p256dh,auth').in('user_id',ids)
    if(!subs?.length) return Response.json({delivered:0,gone:0,failed:0},{headers})

    const allowedPushHost=(endpoint:string)=>{
      try{
        const host=new URL(endpoint).hostname.toLowerCase()
        return host==='fcm.googleapis.com'
          || host.endsWith('.push.services.mozilla.com')
          || host==='web.push.apple.com'
          || host.endsWith('.notify.windows.com')
      }catch(_e){ return false }
    }
    const safeSubs=subs.filter((x:any)=>allowedPushHost(x.endpoint))
    const rejected=subs.filter((x:any)=>!allowedPushHost(x.endpoint)).map((x:any)=>x.endpoint)
    if(rejected.length) await admin.from('push_subscriptions').delete().in('endpoint',rejected)
    if(!safeSubs.length) return Response.json({delivered:0,gone:0,failed:0,rejected:rejected.length},{headers})

    const result=await sendPushBatch(
      safeSubs.map((x:any)=>({endpoint:x.endpoint,expirationTime:null,keys:{p256dh:x.p256dh,auth:x.auth}})),
      {title:(profile?.display_name||'Hráč')+' · Družina',body:(message.body||'').trim().slice(0,180)||(message.share_title?'📚 Sdílí: '+message.share_title:'📷 Poslal obrázek nebo GIF'),url:'https://dc20.honzanacestach.cz/?chat=1#home',tag:'dc20-chat-'+message.channel_id},
      {publicKey:vapid.vapid_public_key,privateKey:vapid.vapid_private_key,subject:vapid.vapid_subject},
      {ttl:86400,urgency:'normal',concurrency:20}
    )
    if(result.gone?.length) await admin.from('push_subscriptions').delete().in('endpoint',result.gone)
    return Response.json({delivered:result.delivered,gone:result.gone?.length||0,failed:result.failed?.length||0},{headers})
  }catch(error){
    if(admin&&claimedMessageId){
      try{await admin.from('push_dispatches').delete().eq('message_id',claimedMessageId)}catch(_e){}
    }
    console.error(error)
    return new Response(JSON.stringify({error:error instanceof Error?error.message:'Unknown error'}),{status:500,headers})
  }
})
