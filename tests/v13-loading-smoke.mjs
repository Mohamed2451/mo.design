import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const api = readFileSync(new URL('../assets/api.js', import.meta.url), 'utf8');
const start=api.indexOf('export async function getPublicContent()');
const end=api.indexOf('export async function sendInquiry',start);
assert.ok(start>=0 && end>start,'public content loader present');
const source=api.slice(start,end).replace('export async function getPublicContent()', 'async function getPublicContent()');
const config={supabaseUrl:'https://demo.supabase.co',supabasePublishableKey:'public-key'};
function make(fetchMock) {
  const win={PORTFOLIO_CONFIG:config};
  const factory=new Function('fetch','window','connected','seed','readDemo',source+'\nreturn getPublicContent;');
  return factory(fetchMock,win,true,{settings:{fallback:true},services:[]},()=>({}));
}
const ok=rows=>({ok:true,json:async()=>rows});
const results={
 site_settings: [{id:1,brand_ar:'Real'}],
 projects:[{id:'live',is_published:true,sort_order:4}],
 services:[{id:'service',is_published:true}],
 testimonials:[],learning_items:[]
};
let calls=[];
let load=make(async url=>{
  const table=new URL(url).pathname.split('/').pop();
  calls.push({table,url:String(url)});
  return ok(results[table]||[]);
});
let result=await load();
assert.equal(result.projects[0].id,'live');
assert.equal(result.settings.brand_ar,'Real');
assert.deepEqual(result._loadWarnings,[]);
assert.equal(calls.length,5);
assert.ok(calls.every(x=>x.url.includes('/rest/v1/')));
assert.ok(!source.includes('getClient()'),'visitor reads must not load auth SDK');

load=make(async url=>{
  const table=new URL(url).pathname.split('/').pop();
  if(table==='services')return {ok:false,status:403};
  return ok(results[table]||[]);
});
result=await load();
assert.equal(result.projects[0].id,'live','failed services must not hide projects');
assert.deepEqual(result._loadWarnings,['services']);
assert.equal(result.services.length,0);

load=make(async()=>{throw new Error('network unavailable')});
result=await load();
assert.equal(result.projects.length,0);
assert.ok(result._loadWarnings.includes('projects'));
console.log('V13 lightweight public content checks passed');
