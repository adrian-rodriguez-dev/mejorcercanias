import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
// Compare optimization with its parent implementation under the SAME 60-second policy.
fs.mkdirSync('work',{recursive:true});
const baseline=execFileSync('git',['show','e867f10:src/data/router.ts'],{encoding:'utf8'})
 .replace('DEFAULT_TRANSFER = 300','DEFAULT_TRANSFER = 60')
 .replace('{ from: node, to: node, seconds: DEFAULT_TRANSFER }','{ from: node, to: node, seconds: DEFAULT_TRANSFER, estimated: true }');
fs.writeFileSync('work/router-benchmark-baseline.ts',baseline);
const {findJourneys:before}=await import('../work/router-benchmark-baseline.ts');
const {findJourneys:after}=await import('../src/data/router.ts');
const m=JSON.parse(fs.readFileSync('src/data/renfe-manifest.json','utf8'));
const cases=[['bilbao','13405','13509'],['bilbao','13400','05451'],['bilbao','13200','05451'],['bilbao','13509','13405'],['bilbao','13400','13200'],['valencia','valencia-65200','valencia-65000']];
const result=[];
for(const [network,origin,destination] of cases){
 const g=JSON.parse(fs.readFileSync(`public/data/renfe/${m.version}/routing-${network}.json`,'utf8'));
 const start=performance.now(),old=before(g,origin,destination,'2026-10-03'),beforeMs=performance.now()-start;
 const next=performance.now(),optimized=after(g,origin,destination,'2026-10-03'),afterMs=performance.now()-next;
 assert.deepEqual(optimized,old);
 result.push({network,origin,destination,journeys:old.length,beforeMs:Math.round(beforeMs),afterMs:Math.round(afterMs)});
}
let seed=1703;const random=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
for(let i=0;i<150;i++) {
 const ids=['A','B','C','D','E'];
 const trips=Array.from({length:12},(_,j)=>{
  let time=1000+random(1800);let pos=random(2);
  const calls=Array.from({length:2+random(3)},()=>{const node=ids[(pos++)%ids.length];time+=60+random(300);return [node,time,time,random(8)===0?1:0,random(8)===0?1:0];});
  return {id:'t'+j,route:'r'+j%3,line:'C'+(j%3+1),calendar:0,calls};
 });
 const transfers=Array.from({length:3},()=>({from:ids[random(5)],to:ids[random(5)],seconds:random(4)===0?null:60+random(500),...(random(2)?{to_route_id:'r'+random(3)}:{})}));
 const g={schemaVersion:1,version:'test',network:'test',trips,transfers,calendars:[['2026-10-03']],nodes:Object.fromEntries(ids.map(id=>[id,{stationId:id,name:id}])),groups:Object.fromEntries(ids.map(id=>[id,[id]]))};
 assert.deepEqual(after(g,'A','E','2026-10-03'),before(g,'A','E','2026-10-03'));
}
const report={snapshot:m.version,policySeconds:60,syntheticComparisons:150,cases:result};
fs.writeFileSync('work/routing-benchmark.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
