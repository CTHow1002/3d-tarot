const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const dummy = {style:{},showModal(){},close(){},innerHTML:'',focus(){},scrollIntoView(){},getBoundingClientRect(){return {left:0,top:0,width:62,height:93}},animate(){},classList:{add(){},remove(){}},setAttribute(){},querySelector(){return dummy},querySelectorAll(){return []}};
const timers=[];const registry=[];
const context=vm.createContext({document:{querySelector(){return dummy},modelContext:{registerTool(tool){registry.push(tool)}}},window:{matchMedia(){return {matches:false}},scrollTo(){},addEventListener(){}},crypto:require('node:crypto').webcrypto,AbortController,setTimeout(fn){timers.push(fn)}});
vm.runInContext(fs.readFileSync('dist/cards.js','utf8')+fs.readFileSync('dist/app.js','utf8'),context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('TAROT_CARDS.length'),78);
assert.equal(run('new Set(TAROT_CARDS.map(c=>c.id)).size'),78);
assert.equal(run('domains.length'),8);
assert.equal(run('TAROT_CARDS.every(c=>c.readings.length===8&&c.readings.every(r=>[r.theme,r.caution,r.advice].every(t=>typeof t==="string"&&t.length>10)))'),true);
assert.equal(run('new Set(TAROT_CARDS.flatMap(c=>c.readings.map(r=>r.advice))).size'),624);
for(let round=0;round<100;round++){
 run('start()');
 assert.equal(run('deck.length'),78);
 assert.throws(()=>run('pick(-1)'),/有效位置/);
 assert.throws(()=>run('pick(12)'),/有效位置/);
 assert.throws(()=>run('pick(1.5)'),/有效位置/);
 assert.equal(run('drawn.length'),0);
 assert.ok(dummy.innerHTML.indexOf('class="spread"')<dummy.innerHTML.indexOf('class="draw-question"'));
 assert.ok(dummy.innerHTML.indexOf('class="draw-question"')<dummy.innerHTML.indexOf('class="deck"'));
 assert.ok(dummy.innerHTML.includes(run('domains[0].question')));
 assert.equal((run('renderSpread()').match(/class="spread-slot /g)||[]).length,8);
 assert.equal((run('renderSpread()').match(/next-slot/g)||[]).length,1);
 assert.throws(()=>run('showResults()'),/抽满八张/);
 for(let i=0;i<8;i++){
  run(`pick(${i%12})`);
  if(i<7){assert.equal(run('pick(0).busy'),true);assert.equal(run('drawn.length'),i+1);}
  while(timers.length)timers.shift()();
  assert.equal((dummy.innerHTML.match(/card-back replenishing/g)||[]).length,i<7?1:0,'Only the vacated slot animates when replenished');
 }
 assert.equal(run('drawn.length'),8);
 assert.equal(run('new Set(drawn.map(c=>c.id)).size'),8);
 assert.equal(run('deck.length'),70);
 assert.equal((run('renderSpread(true)').match(/data-reading="/g)||[]).length,8);
 assert.equal((run('renderSpread()').match(/<img /g)||[]).length,8);
 assert.equal(run('showResults().cards.length'),8);
 assert.equal((dummy.innerHTML.match(/<article /g)||[]).length,0);
 assert.throws(()=>run('selectReading(8)'),/有效卡牌/);
 for(let n=0;n<8;n++){run(`selectReading(${n})`);assert.equal((dummy.innerHTML.match(/<article /g)||[]).length,1);assert.ok(dummy.innerHTML.includes(`id="reading-${n}"`));assert.ok(dummy.innerHTML.includes(run(`drawn[${n}].readings[${n}].advice`)));assert.ok(dummy.innerHTML.includes('值得留意'));assert.ok(!dummy.innerHTML.includes('可以尝试的一小步'));run('closeReading()');while(timers.length)timers.shift()();assert.equal(run('openReading'),null);assert.equal((dummy.innerHTML.match(/<article /g)||[]).length,0);}
 assert.throws(()=>run('pick(0)'),/开始新一轮/);
}
run('start()');
for(let i=0;i<7;i++){run('pick(0)');while(timers.length)timers.shift()();}
run('pick(0)');run('showResults()');
const resultsHtml=dummy.innerHTML;
while(timers.length)timers.shift()();
assert.equal(dummy.innerHTML,resultsHtml,'Unlock timer must not replace results after a fast final click');
run('start();pick(0);start();pick(1)');
timers.shift()();
assert.equal(run('busy'),true,'Previous round timer must not unlock a new flip');
while(timers.length)timers.shift()();
assert.equal(run('busy'),false);
assert.deepEqual(registry.map(t=>t.name),['start_tarot_reading','draw_tarot_card','read_tarot_results']);
assert.throws(()=>registry[0].execute({extra:true}),/额外参数/);
assert.throws(()=>registry[1].execute({slot:0,extra:true}),/仅接受/);
// A prior refill must release opacity/transform before the next selection.
run('start()');
const buttons=Array.from({length:12},()=>({disabled:false,refill:true,classList:{remove(name){assert.equal(name,'replenishing');this.owner.refill=false;}}}));
buttons.forEach(b=>b.classList.owner=b);
const originalQueryAll=dummy.querySelectorAll;
dummy.querySelectorAll=()=>buttons;
run('pick(2)');
assert.ok(buttons.every(b=>b.disabled&&!b.refill));
dummy.querySelectorAll=originalQueryAll;
while(timers.length)timers.shift()();
console.log('PASS: 78-card coverage; eight domains; 100 unique eight-card rounds; invalid input; double-tap guard; reset; WebMCP schemas/actions.');
