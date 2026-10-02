import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';
test('fixed upstream, restricted origins and preserved timestamp',async()=>{
 const original=globalThis.fetch;let called='';
 globalThis.fetch=async(url)=>{called=String(url);return new Response(JSON.stringify({header:{timestamp:'123'},entity:[]}))};
 try{
 const r=await worker.fetch(new Request('https://worker.test/alerts',{headers:{Origin:'https://adrian-rodriguez-dev.github.io'}}));assert.equal(r.status,200);assert.equal(called,'https://gtfsrt.renfe.com/alerts.json');assert.equal((await r.json()).header.timestamp,'123');assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://adrian-rodriguez-dev.github.io');
 assert.equal((await worker.fetch(new Request('https://worker.test/alerts',{headers:{Origin:'https://other.test'}}))).status,403);
 assert.equal((await worker.fetch(new Request('https://worker.test/proxy?url=https://other.test'))).status,404);
 globalThis.fetch=async()=>{throw Error('offline')};assert.equal((await worker.fetch(new Request('https://worker.test/alerts'))).status,502);
 }finally{globalThis.fetch=original}
});
