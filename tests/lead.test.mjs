import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/lead.js';
const request = body => new Request('https://dexits.com/api/lead', {method:'POST', body:JSON.stringify(body)});
const valid = {email:'release-check@example.invalid',site:'dexits.com',extra:{intent:'Just exploring'}};
test('missing storage never claims receipt', async()=>{
 const result=await onRequestPost({request:request(valid),env:{}});
 assert.equal(result.status,503); assert.equal((await result.json()).ok,false);
});
test('malformed input cannot write a lead',async()=>{
 for(const body of [null,[],{email:123},{email:'bad'}, {...valid,extra:{url:'a'.repeat(1200)}}]){
  const result=await onRequestPost({request:request(body),env:{DB:{prepare(){throw new Error('must not write')}}}});
  assert.equal(result.status,400);
 }
});
test('oversized input is refused',async()=>{
 const result=await onRequestPost({request:request({...valid,other:'a'.repeat(9000)}),env:{DB:{}}});
 assert.equal(result.status,413);
});
test('storage failure never claims receipt',async()=>{
 const DB={prepare(sql){return {bind(){return {sql}}}}, async batch(){throw new Error('db unavailable')}};
 const result=await onRequestPost({request:request(valid),env:{DB}});
 assert.equal(result.status,500); assert.equal((await result.json()).ok,false);
});
test('receipt requires the lead and audit event in one storage batch',async()=>{
 let statements; let notification;
 const DB={prepare(sql){return {bind(...values){return {sql,values}}}},async batch(batch){statements=batch}};
 const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{notification={url,options};return new Response('{}')};
 try {
 const pending=[];
 const result=await onRequestPost({request:request(valid),env:{DB},waitUntil:p=>pending.push(p)});
 await Promise.all(pending);
 assert.equal(result.status,200); assert.equal((await result.json()).ok,true);
 assert.equal(statements.length,2); assert.match(statements[0].sql,/INSERT INTO leads/);
 assert.equal(statements[0].values[5],valid.email); assert.match(statements[1].sql,/INSERT INTO events/);
 assert.equal(notification.url,'https://dexits.com/api/notify');
 }finally{globalThis.fetch=original}
});
