import test from 'node:test';
import assert from 'node:assert/strict';
import { createReminderController } from './controller.ts';
import { loadSlots, saveSlots, STORAGE_KEY } from './storage.ts';
import { applyAction, createEmptySlots } from './state.ts';
import type { GoogleTaskSource } from './types.ts';

const source: GoogleTaskSource = { provider:'google-tasks', taskListId:'list', taskId:'task', dueDate:'2026-10-24' };
test('Google import survives reload/edit/completion and rejects duplicates or occupied slots', () => {
  const data = new Map<string,string>();
  const storage = { getItem:(key:string)=>data.get(key)??null, setItem:(key:string,value:string)=>{data.set(key,value);} };
  let slots = applyAction(createEmptySlots(), {type:'add',slotId:1,title:'Existing',id:'local'});
  assert.throws(()=>applyAction(slots,{type:'importGoogle',slotId:1,title:'Imported',id:'import',source}),/already/);
  const metadataWithExtra = { ...source, access_token:'must-not-be-stored' };
  slots = applyAction(slots,{type:'importGoogle',slotId:2,title:'Imported',id:'import',source:metadataWithExtra});
  slots = applyAction(slots,{type:'edit',slotId:2,title:'Renamed'});
  slots = applyAction(slots,{type:'activateControl',slotId:2});
  saveSlots(storage,slots); slots=loadSlots(storage);
  assert.equal(data.get(STORAGE_KEY)!.includes('must-not-be-stored'),false);
  assert.deepEqual(slots[1].reminder?.source,source);
  assert.equal(slots[1].reminder?.completed,true);
  assert.equal(slots[0].reminder?.title,'Existing');
  assert.throws(()=>applyAction(slots,{type:'importGoogle',slotId:3,title:'Duplicate',id:'other',source:{...source,dueDate:'2026-10-25'}}),/already assigned/);
});

test('stale tabs rebase provenance and occupied slots, including memory-only rejection safety', () => {
  const values = new Map<string,string>();
  let denied=false;
  const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{if(denied)throw new Error('quota');values.set(key,value);}};
  const a=createReminderController(()=>storage),b=createReminderController(()=>storage);
  assert.equal(a.dispatch({type:'importGoogle',slotId:1,title:'Imported',id:'a',source}),true);
  assert.equal(b.dispatch({type:'importGoogle',slotId:2,title:'Duplicate',id:'b',source}),false);
  assert.equal(b.dispatch({type:'add',slotId:1,title:'Overwrite',id:'c'}),false);
  denied=true;
  assert.equal(b.dispatch({type:'importGoogle',slotId:2,title:'Local only',id:'d',source:{...source,taskId:'other'}}),true);
  assert.equal(b.getSnapshot().persistenceStatus,'unavailable');
  assert.equal(b.dispatch({type:'importGoogle',slotId:3,title:'Repeat local',id:'e',source:{...source,taskId:'other'}}),false);
});

test('existing v1 saves remain valid; invalid or duplicate provenance is preserved and rejected', () => {
  const slots=applyAction(createEmptySlots(),{type:'add',slotId:4,id:'old',title:'Old reminder'});
  let raw=JSON.stringify({version:1,slots});
  const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
  assert.deepEqual(loadSlots(storage),slots);
  for(const invalid of [null,{...source,dueDate:'2026-02-30'},{...source,provider:'calendar'},{...source,taskId:''}]){
    const bad=structuredClone(slots) as unknown as {reminder:unknown}[];bad[0].reminder={id:'new',title:'New',completed:false,source:invalid};
    raw=JSON.stringify({version:1,slots:bad});const before=raw;
    assert.throws(()=>loadSlots(storage),/Google task/);assert.equal(raw,before);
  }
  const duplicate=createEmptySlots();duplicate[0].reminder={id:'a',title:'A',completed:false,source};duplicate[1].reminder={id:'b',title:'B',completed:false,source};
  raw=JSON.stringify({version:1,slots:duplicate});assert.throws(()=>loadSlots(storage),/Google task/);
  assert.equal(STORAGE_KEY,'sasehacks-ou-2026.reminders.v1');
});

test('racing whole-snapshot imports may lose one update but cannot combine duplicate sources', () => {
  const original=createEmptySlots();
  // Force both actors to have read before either writes, unlike the sequential rebase test.
  const a=applyAction(structuredClone(original),{type:'importGoogle',slotId:1,title:'A',id:'a',source});
  const b=applyAction(structuredClone(original),{type:'importGoogle',slotId:2,title:'B',id:'b',source});
  let raw:string|null=null;
  const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
  for(const order of [[a,b],[b,a]]){
    order.forEach(slots=>saveSlots(storage,slots));
    const result=loadSlots(storage);
    assert.equal(result.filter(slot=>slot.reminder?.source).length,1);
    assert.deepEqual(result,order[1]);
  }
});
