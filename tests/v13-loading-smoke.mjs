import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api = readFileSync(new URL('../assets/api.js', import.meta.url), 'utf8');
const source = api.slice(api.indexOf('export async function getPublicContent()'), api.indexOf('export async function sendInquiry'))
  .replace('export async function getPublicContent()', 'async function getPublicContent()');
const make = (getClient) => new Function('getClient', 'connected', 'seed', 'readDemo', `${source}\nreturn getPublicContent;`)(getClient, true, {settings:{brand:'fallback'},services:[{id:'fallback'}]},()=>({}));
function dbWith(results, attempts={}) {
  return {from(table){return {select(){return this},eq(){return this},order(){return this},single(){return Promise.resolve(results[table])},then(resolve,reject){attempts[table]=(attempts[table]||0)+1;return Promise.resolve(typeof results[table]==='function'?results[table](attempts[table]):results[table]).then(resolve,reject)}}}};
}
const ok = data=>({data,error:null});
let load=make(async()=>dbWith({site_settings:ok({brand:'real'}),projects:ok([{id:'real'}]),services:ok([]),testimonials:ok([]),learning_items:ok([])}));
let res=await load();assert.deepEqual(res._loadWarnings,[]);assert.equal(res.projects[0].id,'real');assert.deepEqual(res.services,[]);
load=make(async()=>dbWith({site_settings:ok({brand:'real'}),projects:ok([{id:'real'}]),services:{data:null,error:{code:'42501',message:'permission denied'}},testimonials:ok([]),learning_items:ok([])}));
res=await load();assert.equal(res.projects[0].id,'real');assert.deepEqual(res._loadWarnings,['services']);
const tries={};load=make(async()=>dbWith({site_settings:ok({}),projects:n=>n===1?{data:null,error:{status:503,message:'network temporarily unavailable'}}:ok([{id:'recovered'}]),services:ok([]),testimonials:ok([]),learning_items:ok([])},tries));
res=await load();assert.equal(tries.projects,2);assert.equal(res.projects[0].id,'recovered');assert.deepEqual(res._loadWarnings,[]);
load=make(async()=>{throw new Error('CDN unavailable')});res=await load();assert.deepEqual(res.projects,[]);assert.deepEqual(res._loadWarnings,['connection']);
console.log('V13 loading checks passed');
