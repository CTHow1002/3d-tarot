const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const dummy = {innerHTML:'',focus(){},querySelector(){return dummy},querySelectorAll(){return []}};
const timers=[];const registry=[];
const context=vm.createContext({document:{querySelector(){return dummy},modelContext:{registerTool(tool){registry.push(tool)}}},window:{scrollTo(){},addEventListener(){}},crypto:require('node:crypto').webcrypto,AbortController,setTimeout(fn){timers.push(fn)}});
vm.runInContext(fs.readFileSync('dist/cards.js','utf8')+fs.readFileSync('dist/app.js','utf8'),context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('TAROT_CARDS.length'),78);
assert.equal(run('new Set(TAROT_CARDS.map(c=>c.id)).size'),78);
assert.equal(run('domains.length'),8);
assert.equal(run('TAROT_CARDS.every(c=>domains.every(d=>typeof d.lens[c.kind]==="string"))'),true);
for(let round=0;round<100;round++){
 run('start()');
 assert.equal(run('deck.length'),78);
 assert.throws(()=>run('pick(-1)'),/有效位置/);
 assert.throws(()=>run('pick(12)'),/有效位置/);
 assert.throws(()=>run('pick(1.5)'),/有效位置/);
 assert.equal(run('drawn.length'),0);
 assert.throws(()=>run('showResults()'),/抽满八张/);
 for(let i=0;i<8;i++){
  run(`pick(${i%12})`);
  if(i<7){assert.equal(run('pick(0).busy'),true);assert.equal(run('drawn.length'),i+1);}
  while(timers.length)timers.shift()();
 }
 assert.equal(run('drawn.length'),8);
 assert.equal(run('new Set(drawn.map(c=>c.id)).size'),8);
 assert.equal(run('deck.length'),70);
 assert.equal(run('showResults().cards.length'),8);
 assert.throws(()=>run('pick(0)'),/开始新一轮/);
}
run('start()');
for(let i=0;i<7;i++){run('pick(0)');while(timers.length)timers.shift()();}
run('pick(0)');run('showResults()');
const resultsHtml=dummy.innerHTML;
while(timers.length)timers.shift()();
assert.equal(dummy.innerHTML,resultsHtml,'Unlock timer must not replace results after a fast final click');
assert.deepEqual(registry.map(t=>t.name),['start_tarot_reading','draw_tarot_card','read_tarot_results']);
assert.throws(()=>registry[0].execute({extra:true}),/额外参数/);
assert.throws(()=>registry[1].execute({slot:0,extra:true}),/仅接受/);
console.log('PASS: 78-card coverage; eight domains; 100 unique eight-card rounds; invalid input; double-tap guard; reset; WebMCP schemas/actions.');
