import test, {beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST} from '../api/chat.js';

const body={messages:[{role:'user',content:'Put the Atlas itself on trial.'}]};
const makeRequest=(input=body,headers={})=>new Request('http://localhost:3000/api/chat',{method:'POST',headers:{Host:'localhost:3000',Origin:'http://localhost:3000','Content-Type':'application/json',...headers},body:JSON.stringify(input)});
const env={...process.env};
const originalFetch=globalThis.fetch;
beforeEach(()=>{process.env.ATLAS_LIVE_AI_ENABLED='false';delete process.env.OPENAI_API_KEY;});
afterEach(()=>{globalThis.fetch=originalFetch;process.env= {...env};});

test('scripted preview remains safely disabled by default',async()=>{
 assert.equal((await GET().json()).enabled,false);
 const result=await POST(makeRequest());assert.equal(result.status,503);
 assert.match((await result.json()).error,/not activated/i);
});
test('origin and input validation block invalid requests before provider calls',async()=>{
 process.env.ATLAS_LIVE_AI_ENABLED='true';process.env.OPENAI_API_KEY='test-only';
 let called=false;globalThis.fetch=async()=>{called=true;throw Error('Should not call provider')};
 assert.equal((await POST(makeRequest(body,{Origin:'https://elsewhere.example'}))).status,403);
 assert.equal((await POST(makeRequest({messages:[{role:'user',content:'ok'}],notebook:[{text:'private'}]}))).status,400);
 assert.equal((await POST(makeRequest({messages:[{role:'assistant',content:'not a user'}]}))).status,400);
 assert.equal(called,false);
});
test('live response preserves stateless privacy and labeled streaming events',async()=>{
 process.env.ATLAS_LIVE_AI_ENABLED='true';process.env.OPENAI_API_KEY='test-only';
 let requestBody;
 globalThis.fetch=async(_url,options)=>{
   requestBody=JSON.parse(options.body);
   const s='event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"A question."}\n\nevent: response.completed\ndata: {"type":"response.completed"}\n\n';
   return new Response(s,{status:200,headers:{'Content-Type':'text/event-stream'}});
 };
 const result=await POST(makeRequest());assert.equal(result.status,200);
 const events=(await result.text()).trim().split('\n').map(JSON.parse);
 assert.deepEqual(events,[{type:'delta',text:'A question.'},{type:'done'}]);
 assert.equal(requestBody.stream,true);assert.equal(requestBody.store,false);
 assert.match(requestBody.instructions,/50%/);assert.match(requestBody.instructions,/The Living Notebook is a visitor-controlled feature/);
 assert.equal(requestBody.input.length,1);
});
test('request bodies are bounded and incomplete streams are errors',async()=>{
 process.env.ATLAS_LIVE_AI_ENABLED='true';process.env.OPENAI_API_KEY='test-only';
 assert.equal((await POST(makeRequest({messages:[{role:'user',content:'x'.repeat(40000)}]}))).status,413);
 globalThis.fetch=async()=>new Response('event: response.created\ndata: {"type":"response.created"}\n\n',{status:200});
 const result=await POST(makeRequest());assert.equal(result.status,200);assert.match(await result.text(),/"type":"error"/);
});
