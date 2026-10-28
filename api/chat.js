import { atlasInstructions } from './atlas-system.js';

// This route uses Web-standard Request/Response both in the local server and Vercel Functions.
// Live API use is DISABLED until the owner explicitly configures billing and enabling variables.
const enabled = () => process.env.ATLAS_LIVE_AI_ENABLED === 'true' && Boolean(process.env.OPENAI_API_KEY);
const MAX_BYTES = 36000;
const windowMs = 60000;
let windowStart = Date.now(), calls = 0, inFlight = 0;
const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});

export function GET(){return json({enabled:enabled(),mode:enabled()?'live':'scripted-preview'});}

function sameOrigin(request){
  const origin=request.headers.get('origin');
  if(!origin)return false;
  try {const host=request.headers.get('host')||new URL(request.url).host;return new URL(origin).host===host && request.headers.get('sec-fetch-site')!=='cross-site';}catch{return false;}
}
async function readBounded(request){
  const declared=Number(request.headers.get('content-length')||0);
  if(declared>MAX_BYTES)throw new RangeError('Too large');
  let bytes=0;const chunks=[];
  if(!request.body)throw new Error('Empty request');
  for await(const part of request.body){bytes+=part.byteLength;if(bytes>MAX_BYTES)throw new RangeError('Too large');chunks.push(part);}
  const result=new Uint8Array(bytes);let offset=0;for(const part of chunks){result.set(part,offset);offset+=part.byteLength;}
  return JSON.parse(new TextDecoder().decode(result));
}
function validate(data){
  if(!data||typeof data!=='object'||!Array.isArray(data.messages)||data.messages.length<1||data.messages.length>16)return false;
  if(Object.keys(data).some(k=>k!=='messages'))return false;
  if(data.messages.at(-1)?.role!=='user')return false;
  return data.messages.every(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.trim()&&m.content.length<=3500&&Object.keys(m).every(k=>['role','content'].includes(k)));
}
function extractSse(block){
 const lines=block.split('\n').filter(line=>line.startsWith('data:'));
 if(!lines.length)return null;
 const joined=lines.map(x=>x.slice(5).trimStart()).join('\n').trim();
 if(!joined||joined==='[DONE]')return null;
 try{return JSON.parse(joined);}catch{return null;}
}
export async function POST(request){
  if(!sameOrigin(request))return json({error:'The Atlas only accepts messages from its own website.'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Send JSON.'},415);
  if(!enabled())return json({error:'Live AI is not activated. The preview remains available without API charges.'},503);
  let body;
  try{body=await readBounded(request);}catch(e){return json({error:e instanceof RangeError?'The conversation is too large.':'Invalid JSON request.'},e instanceof RangeError?413:400);}
  if(!validate(body))return json({error:'Invalid conversation. Please start a new exploration.'},400);
  const now=Date.now();if(now-windowStart>windowMs){windowStart=now;calls=0;}
  // Per-instance guard only. Production launch requires shared edge limits and spending controls.
  if(calls>=10||inFlight>=2)return json({error:'The Cart needs a short pause; try again shortly.'},429,{'Retry-After':'60'});
  calls++;inFlight++;
  try{
    const signal=AbortSignal.any([request.signal,AbortSignal.timeout(45000)]);
    const upstream=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-6-luna',instructions:atlasInstructions(),input:body.messages,store:false,stream:true,max_output_tokens:1200}),
      signal
    });
    if(!upstream.ok||!upstream.body)return json({error:'The live model could not start. Check the project configuration or try again.'},502);
    const encoder=new TextEncoder(),decoder=new TextDecoder();
    const stream=new ReadableStream({
      async start(controller){
        let buffer='';let completed=false;
        const emit=event=>controller.enqueue(encoder.encode(JSON.stringify(event)+'\n'));
        try{
          for await(const part of upstream.body){buffer+=decoder.decode(part,{stream:true}).replaceAll('\r\n','\n');let end;
            while((end=buffer.indexOf('\n\n'))>=0){const block=buffer.slice(0,end);buffer=buffer.slice(end+2);const event=extractSse(block);if(!event)continue;
              if(event.type==='response.output_text.delta'&&typeof event.delta==='string')emit({type:'delta',text:event.delta});
              if(event.type==='response.refusal.delta'&&typeof event.delta==='string')emit({type:'delta',text:event.delta});
              if(event.type==='response.completed'){completed=true;emit({type:'done'});}
              if(['response.failed','response.incomplete','error'].includes(event.type)){emit({type:'error'});completed=true;}
            }
          }
          if(!completed)emit({type:'error'});
        }catch{try{emit({type:'error'});}catch{}}
        finally{inFlight=Math.max(0,inFlight-1);try{controller.close();}catch{}}
      },cancel(){try{upstream.body.cancel();}catch{}inFlight=Math.max(0,inFlight-1);}
    });
    return new Response(stream,{headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Accel-Buffering':'no'}});
  }catch{inFlight=Math.max(0,inFlight-1);return json({error:'The live reply could not start. No response was generated.'},502);}
}
