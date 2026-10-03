import {expect,it} from 'vitest';
import manifest from './renfe-manifest.json';
import {lineInk} from './networks';
it('todos los colores oficiales conservan contraste de texto de al menos 4.5:1',()=>{
  const luminance=(hex:string)=>hex.replace('#','').match(/.{2}/g)!.map(v=>parseInt(v,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0);
  for(const color of [...manifest.networks.flatMap(n=>Object.values(n.colors)),'101010','ffffff']) {
    const bg=luminance(color), ink=luminance(lineInk(color));
    expect((Math.max(bg,ink)+0.05)/(Math.min(bg,ink)+0.05)).toBeGreaterThanOrEqual(4.5);
  }
});
