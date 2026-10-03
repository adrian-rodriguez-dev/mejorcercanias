import {test,expect} from '@playwright/test';
import manifest from '../src/data/renfe-manifest.json' with {type:'json'};
const coverage = manifest.networks.find(n=>n.id==='bilbao')!.coverageDates;
const serviceDay = coverage[Math.min(2, coverage.length - 1)];
test.beforeEach(async({page})=>{
  await page.clock.install({time:new Date(serviceDay+'T06:00:00+02:00')});
  await page.addInitScript(()=>{
    if(!localStorage.getItem('test.offline')) {
      localStorage.setItem('mejorcercanias.network.v1','bilbao');
      localStorage.setItem('mejorcercanias.journey.v1',JSON.stringify({stationId:'13400',destination:'',lines:[]}));
      localStorage.setItem('test.offline','1');
    }
  });
});
test('reapertura offline, horarios por fecha, ausencia de estación y caducidad',async({page,context})=>{
  await page.goto('./');
  await expect(page.locator('.departures li')).toHaveCount(8);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.departures li')).toHaveCount(8);
  await expect(page.locator('.offline-status')).toContainText('Sin conexión');
  expect(await page.evaluate(async()=>{try{await fetch('./app-version.json',{cache:'no-store'});return true}catch{return false}})).toBe(false);
  await page.getByRole('button',{name:'Horario completo',exact:true}).click();
  await expect(page.locator('.schedule-table tbody tr').first()).toBeVisible();
  await page.getByRole('button',{name:'Día siguiente',exact:true}).click();
  await expect(page.locator('.schedule-table tbody tr').first()).toBeVisible();
  await page.getByLabel('Fecha',{exact:true}).fill('2099-01-01');
  await expect(page.getByText(/Horario aún no publicado para esta fecha/)).toBeVisible();
  await expect(page.locator('.schedule-table')).toHaveCount(0);
  await page.getByRole('button',{name:'Próximos trenes',exact:true}).click();
  await page.getByLabel('¿Desde dónde sales?').fill('Bilbao-Abando');
  await expect(page.getByText('Esta estación no está guardada.',{exact:true})).toBeVisible();
  await expect(page.locator('.departures li')).toHaveCount(0);
  await context.setOffline(false);
  await expect(page.locator('.departures li')).toHaveCount(8);
});
test('worker nuevo espera el gesto y conserva preferencias al actualizar',async({page,request})=>{
  await page.goto('./');
  await expect(page.locator('.departures li')).toHaveCount(8);
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.evaluate(()=>{sessionStorage.setItem('loaded','yes');document.documentElement.dataset.beforeUpdate='yes';});
  await request.post('/__test/revision');
  try {
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r!.update();});
    await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.waiting);
    await page.clock.fastForward(60001);
    await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
    await expect(page.getByRole('button',{name:'Actualizar',exact:true})).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-before-update','yes');
    await page.getByRole('button',{name:'Actualizar',exact:true}).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-before-update','yes');
    await expect(page.getByLabel('¿Desde dónde sales?')).toHaveValue(/Barakaldo/);
    await page.waitForFunction(async()=>!(await navigator.serviceWorker.getRegistration())?.waiting);
  } finally {await request.post('/__test/revision');}
});
