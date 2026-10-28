import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { Readable } from 'node:stream';
import { GET, POST } from './api/chat.js';

const PORT=Number(process.env.PORT||3000);
const HOST=process.env.HOST||'127.0.0.1';
const staticPaths=new Map([
  ['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/app.js','app.js'],['/content/atlas-content.js','content/atlas-content.js'],
  ['/assets/atlas-welcome.webp','assets/atlas-welcome.webp'],['/assets/exhibit-cart.webp','assets/exhibit-cart.webp']
]);
for(const pose of ['welcoming','curious','skeptical','delighted'])staticPaths.set(`/assets/cart/${pose}.webp`,`assets/cart/${pose}.webp`);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp'};

const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,`http://${req.headers.host||`localhost:${PORT}`}`);
  if(url.pathname==='/api/chat'){
    const request=new Request(url,{method:req.method,headers:req.headers,body:req.method==='POST'?Readable.toWeb(req):undefined,duplex:req.method==='POST'?'half':undefined});
    const result=req.method==='GET'?GET():req.method==='POST'?await POST(request):new Response('Method Not Allowed',{status:405});
    res.writeHead(result.status,Object.fromEntries(result.headers));if(result.body)Readable.fromWeb(result.body).pipe(res);else res.end();return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  const filename=staticPaths.get(url.pathname);if(!filename){res.writeHead(404);res.end('Not found');return;}
  const data=await readFile(resolve(process.cwd(),filename));
  res.writeHead(200,{'Content-Type':mime[extname(filename)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'"});
  if(req.method==='HEAD')res.end();else res.end(data);
 }catch(e){res.writeHead(500);res.end('An internal error occurred.');}
});
server.listen(PORT,HOST,()=>console.log(`Full Color Atlas preview: http://${HOST}:${PORT}`));
