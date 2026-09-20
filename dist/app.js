'use strict';
const domains=[
 {icon:'✧',name:'近期整体',question:'最近的生活，有什么值得看见？'},
 {icon:'❋',name:'身心状态',question:'我可以怎样更好地照顾自己？'},
 {icon:'◈',name:'金钱财务',question:'怎样更清楚地安排手中的资源？'},
 {icon:'♜',name:'工作事业',question:'工作中，我可以把力气用在哪里？'},
 {icon:'⌁',name:'出行安排',question:'怎样让行程准备得更从容？'},
 {icon:'⌂',name:'家庭生活',question:'怎样让相处多一点理解？'},
 {icon:'❦',name:'人际关系',question:'我想怎样与别人建立连接？'},
 {icon:'♡',name:'恋爱感情',question:'在感情里，我真正需要什么？'}
];
const app=document.querySelector('#app');
let stage='home',deck=[],drawn=[],busy=false;
const cardImage=c=>`cards/${c.id}.webp`;
function shuffled(cards,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296){
 const result=cards.slice();
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
let pageTransition=null;
function morph(update){
 if(pageTransition)return pageTransition;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!document.startViewTransition||reduced){
  const result=update();
  if(!reduced)app.animate([{opacity:0,transform:'translateY(10px) scale(.98)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'});
  return result;
 }
 let result;
 const transition=document.startViewTransition(()=>{result=update();});
 pageTransition=transition.finished.catch(()=>{}).then(()=>{pageTransition=null;return result;});
 return pageTransition;
}
function moveFocus(){const h=app.querySelector('h1');h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function resetReading(){drawn=[];deck=[];busy=false;home();moveFocus();}
function home(){
 stage='home';
 app.innerHTML=`<p class="eyebrow">EIGHT CARDS · A QUIET MOMENT</p><h1>与自己，轻轻相遇</h1><p class="sub">静下心，想一想最近的生活。<br>让八张牌，陪你看见八个不同的角度。</p><div class="ritual" aria-hidden="true"><div class="card-back"></div><div class="card-back"></div><div class="card-back"></div></div><div class="domains">${domains.map(d=>`<div class="domain"><span aria-hidden="true">${d.icon}</span>${d.name}</div>`).join('')}</div><button class="primary" id="start">开始抽取八张牌</button><p class="fine">78 张牌 · 正位解读 · 每次约 3 分钟</p><details><summary>第一次抽牌？</summary><p>想一想接下来两周的生活，然后从洗好的牌堆里逐张选择。这是本站设计的八领域环形牌阵，从上方开始顺时针排列。八个位置分别对应八个生活领域，同一轮不会重复抽到同一张牌。</p><p>每张牌都使用事先写好的解释，不调用 AI，也不预测确定的未来。牌面只使用正位。</p></details>`;
 document.querySelector('#start').onclick=()=>morph(start);
}
function start(){deck=shuffled(TAROT_CARDS);drawn=[];busy=false;stage='draw';renderDraw();moveFocus();return {stage,remaining:8};}
// Clockwise positions around the central star, starting at the top.
function renderSpread(results=false){
 const positions=[[50,13],[77,25],[88,50],[77,75],[50,87],[23,75],[12,50],[23,25]];
 return `<div class="spread" role="group" aria-label="八领域环形牌阵"><div class="spread-center" aria-hidden="true"><span class="moon-phases">☾ · ○ · ☽</span><span class="center-star">✧</span><b>月间星盘</b><small>八个角度 · 照见此刻</small></div>${domains.map((d,i)=>{
  const c=drawn[i],active=!results&&i===drawn.length;
  const face=c?`<img src="${cardImage(c)}" alt="${c.name}" width="1024" height="1536">`:`<span class="empty-slot" aria-hidden="true">${d.icon}</span>`;
  const content=`${face}<span class="slot-label"><small class="slot-number">0${i+1}</small>${d.name}</span>`;
  const attrs=`class="spread-slot ${c?'filled-slot':''} ${active?'next-slot':''} ${!results&&c&&i===drawn.length-1?'just-placed':''}" style="--x:${positions[i][0]}%;--y:${positions[i][1]}%"`;
  return results?`<button type="button" ${attrs} data-reading="${i}" aria-pressed="false" aria-controls="reading-panel" aria-label="${d.name}：${c.name}，查看解读">${content}</button>`:`<div ${attrs} aria-label="第${i+1}位，${d.name}，${c?c.name:active?'下一张放这里':'待抽取'}">${content}</div>`;
 }).join('')}</div>`;
}
function renderDraw(refillSlot=-1){
 const n=drawn.length,next=domains[n];
 app.innerHTML=`<p class="eyebrow">${n===8?'八张牌，已为你展开':`第 ${n+1} 张 · ${next.name}`}</p><h1>${n===8?'看看此刻的自己':'让八张牌，慢慢展开'}</h1><div class="progress" role="progressbar" aria-label="抽牌进度" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${n}">${domains.map((_,i)=>`<span class="${i<n?'filled':''}"></span>`).join('')}</div><p class="sub" aria-live="polite">${n===8?'已抽满 8 张，可以阅读完整解读。':`已抽 ${n} / 8 张 · 凭直觉选择一张牌<br>翻牌后，会依次放入上方发光的牌位。`}</p>${renderSpread()}${n<8?`<div class="draw-question" aria-live="polite"><p class="eyebrow">第 ${n+1} 张 · ${next.name}</p><h2>${next.question}</h2><p class="fine">凭直觉，选择下方一张牌</p></div><div class="deck">${deck.slice(0,12).map((_,i)=>`<button class="card-back${i===refillSlot?' replenishing':''}" data-slot="${i}" aria-label="选择第 ${i+1} 张牌" ${busy?'disabled':''}></button>`).join('')}</div>`:''}${n===8?'<button class="primary" id="read">阅读我的八张牌</button>':''}<p class="fine">抽牌没有“选错”。允许自己慢慢来。</p>`;
 app.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>pick(Number(b.dataset.slot)));
 if(n===8)document.querySelector('#read').onclick=()=>morph(showResults);
}
function pick(slot){
 if(stage!=='draw'||drawn.length===8)throw new Error('请先开始新一轮抽牌。');
 if(!Number.isInteger(slot)||slot<0||slot>=Math.min(12,deck.length))throw new Error('请选择展开牌堆中的有效位置。');
 if(busy)return {busy:true,count:drawn.length};
 const card=deck.splice(slot,1)[0],round=deck;
 drawn.push(card);busy=true;
 const selected=app.querySelector(`[data-slot="${slot}"]`);
 app.querySelectorAll('[data-slot]').forEach(b=>{
  b.classList.remove('replenishing');
  b.disabled=true;
 });
 selected.innerHTML=`<span class="flip-inner"><span class="flip-back"></span><img class="flip-front" src="${cardImage(card)}" alt="${card.name}"></span>`;
 selected.classList.add('flipping');
 selected.setAttribute('aria-label',`抽中${card.name}`);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const finish=()=>{
  if(deck!==round)return;
  busy=false;
  if(stage!=='draw')return;
  const update=()=>{
   if(deck!==round||stage!=='draw')return;
   renderDraw(slot);
   app.querySelector(drawn.length===8?'#read':`[data-slot="${slot}"]`)?.focus({preventScroll:true});
  };
  if(drawn.length===8)morph(update);else update();
 };
 setTimeout(()=>{
  if(deck!==round||stage!=='draw')return;
  if(reduced){finish();return;}
  const target=app.querySelector('.next-slot .empty-slot');
  const from=selected.getBoundingClientRect(),to=target.getBoundingClientRect();
  selected.classList.add('flying');
  selected.animate([
   {transform:'translate(0,0) scale(1)'},
   {transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`}
  ],{duration:650,easing:'cubic-bezier(.25,.65,.25,1)',fill:'forwards'});
  setTimeout(()=>{
   if(deck!==round||stage!=='draw')return;
   if(drawn.length!==8){finish();return;}
   // Land the final face before retiring the selection deck.
   target.innerHTML=`<img src="${cardImage(card)}" alt="${card.name}" width="62" height="93">`;
   selected.style.visibility='hidden';
   const tray=app.querySelector('.deck');
   tray.animate([{height:`${tray.getBoundingClientRect().height}px`,opacity:1,marginTop:'25px',marginBottom:'25px'},
    {height:'0px',opacity:0,marginTop:'0px',marginBottom:'0px'}],
    {duration:480,easing:'cubic-bezier(.22,.68,.2,1)',fill:'forwards'});
   tray.style.overflow='hidden';
   setTimeout(finish,480);
  },650);
 },reduced?0:720);
 return {count:drawn.length,domain:domains[drawn.length-1].name,card:drawn[drawn.length-1].name};
}
function showResults(){
 if(drawn.length!==8)throw new Error('请先抽满八张牌。');
 stage='results';openReading=null;closingReading=false;
 app.innerHTML=`<p class="eyebrow">YOUR EIGHT-CARD READING</p><h1>八个角度，照见此刻</h1><p class="sub">以接下来两周为观察范围。<br>留下有帮助的提醒，把选择握在自己手里。</p>${renderSpread(true)}<div class="results single-reading" id="reading-panel" tabindex="-1"><p class="reading-prompt">点选上方任意一张牌，阅读它给你的提醒。</p></div><p class="sub">选一条最有共鸣的提醒，<br>把它变成今天能做的一件小事。</p><button class="secondary" id="again">重新开始</button><p class="fine">重新开始会清除本次结果；关闭页面后不保存记录。</p>`;
 app.querySelectorAll('[data-reading]').forEach(button=>button.onclick=()=>selectReading(Number(button.dataset.reading)));
 document.querySelector('#again').onclick=()=>morph(resetReading);
 moveFocus();return {stage,cards:drawn.map((c,i)=>({domain:domains[i].name,card:c.name,theme:c.readings[i].theme,caution:c.readings[i].caution,advice:c.readings[i].advice}))};
}
let openReading=null,closingReading=false;
function selectReading(index){
 if(stage!=='results'||!Number.isInteger(index)||index<0||index>=drawn.length)throw new Error('请选择牌阵中的有效卡牌。');
 if(openReading===index){closeReading();return;}
 if(closingReading)return;
 openReading=index;
 const c=drawn[index],i=index,r=c.readings[index],panel=app.querySelector('#reading-panel');
 panel.innerHTML=`<dialog class="card-dialog" aria-label="${c.name}解读"><button class="dialog-close" aria-label="收回卡牌">×</button><article class="reading" id="reading-${i}"><div class="reading-head"><button class="expanded-card" aria-label="收回${c.name}"><img src="${cardImage(c)}" alt="${c.name}牌面" width="1024" height="1536"></button><div><p class="label">0${i+1} / ${domains[i].name}</p><h3>${c.name}</h3><p class="fine">${c.keywords} · 正位</p></div></div><div class="advice"><strong>当前主题</strong><p>${r.theme}</p></div><div class="advice"><strong>值得留意</strong><p>${r.caution}</p></div><div class="advice"><strong>给你的建议</strong><p>${r.advice}</p></div><p class="fine">再次点选牌面，收回牌阵</p></article></dialog>`;
 app.querySelectorAll('[data-reading]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.reading)===index)));
 const dialog=panel.querySelector('dialog');
 dialog.showModal();
 dialog.querySelector('.expanded-card').onclick=closeReading;
 dialog.querySelector('.dialog-close').onclick=closeReading;
 dialog.oncancel=e=>{e.preventDefault();closeReading();};
 animateReadingCard(index,false);

 return {domain:domains[i].name,card:c.name};
}

function animateReadingCard(index,closing){
 const source=app.querySelector(`[data-reading="${index}"] img`),image=app.querySelector('.expanded-card img');
 const a=source.getBoundingClientRect(),b=image.getBoundingClientRect();
 const small=`translate(${a.left-b.left}px,${a.top-b.top}px) scale(${a.width/b.width},${a.height/b.height})`;
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)image.animate(closing?[{transform:'none'},{transform:small}]:[{transform:small},{transform:'none'}],{duration:360,easing:'cubic-bezier(.22,.68,.2,1)',fill:'both'});
 source.style.opacity='0';
}
function closeReading(){
 if(openReading===null||closingReading)return;
 closingReading=true;
 const index=openReading;
 app.querySelector('.card-dialog').classList.add('closing');
 animateReadingCard(index,true);
 setTimeout(()=>{
  const panel=app.querySelector('#reading-panel');
  app.querySelector(`[data-reading="${index}"] img`).style.opacity='';
  panel.querySelector('dialog').close();
  panel.innerHTML='<p class="reading-prompt">点选任意一张牌，阅读它给你的提醒。</p>';
  app.querySelectorAll('[data-reading]').forEach(b=>b.setAttribute('aria-pressed','false'));
  app.querySelector(`[data-reading="${index}"]`)?.focus({preventScroll:true});
  openReading=null;closingReading=false;
 },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);
}

home();
document.querySelector('header a').onclick=e=>{e.preventDefault();morph(resetReading);};
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const tools=[
 {name:'start_tarot_reading',description:'开始新一轮八张牌占卜，清除本轮结果并洗牌。',inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(input&&Object.keys(input).length)throw new Error('不接受额外参数。');return morph(start);}},
 {name:'draw_tarot_card',description:'从当前展开的12个牌背位置选择一张，按顺序放入下一个领域。',inputSchema:{type:'object',properties:{slot:{type:'integer',minimum:0,maximum:11}},required:['slot'],additionalProperties:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='slot'))throw new Error('仅接受 slot 参数。');return pick(input.slot);}},
 {name:'read_tarot_results',description:'抽满八张后展示并读取本轮完整解读。',inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(input&&Object.keys(input).length)throw new Error('不接受额外参数。');return morph(showResults);}}
 ];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool({...tool,annotations:{readOnlyHint:false,untrustedContentHint:false}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
