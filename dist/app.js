'use strict';
const domains=[
 {icon:'✧',name:'近期整体',question:'最近的生活，有什么值得看见？',lens:{begin:'为生活留出一点尝试新方向的空间。',steady:'把注意力放回能够持续的日常节奏。',connect:'留意正在支持你的人与让你感到有活力的事。',reflect:'先理清真正重要的事，不必急着给所有问题答案。',adjust:'检查哪些安排需要调整，把精力放在可控的部分。',release:'给旧阶段一个温柔的收尾，再慢慢走向下一步。'}},
 {icon:'❋',name:'身心状态',question:'我可以怎样更好地照顾自己？',lens:{begin:'从一个轻量、可持续的照顾习惯开始。',steady:'保持休息与活动的节奏，避免把自律变成苛责。',connect:'允许自己获得陪伴和支持，不必独自承担所有情绪。',reflect:'留意疲惫与压力，给自己休息和整理感受的空间。',adjust:'辨认持续消耗你的安排，减少一项不必要的负担。',release:'允许自己从消耗中慢慢恢复，不要求立刻回到最佳状态。'}},
 {icon:'◈',name:'金钱财务',question:'怎样更清楚地安排手中的资源？',lens:{begin:'面对新机会先了解条件，用小规模验证代替冲动投入。',steady:'先确认必要开支与储备，再规划可自由使用的部分。',connect:'涉及共同开支或借贷时，把双方责任和边界说清楚。',reflect:'核对账目、条款与实际需求，不凭一时感受作决定。',adjust:'检查重复支出和过高承诺，给预算留出调整余地。',release:'评估已经无益的支出或投入，不因过去花费而继续追加。'}},
 {icon:'♜',name:'工作事业',question:'工作中，我可以把力气用在哪里？',lens:{begin:'选一个可执行的小目标，把想法变成能获得反馈的行动。',steady:'明确优先级与交付标准，让进度建立在可持续的安排上。',connect:'关注合作与沟通，主动确认同事或伙伴的期待。',reflect:'先弄清问题、事实与职责，再决定下一步。',adjust:'及时暴露阻碍，协商范围或期限，避免独自硬撑。',release:'整理阶段经验，结束无效消耗，为下一步腾出精力。'}},
 {icon:'⌁',name:'出行安排',question:'怎样让行程准备得更从容？',lens:{begin:'新行程先核对路线、预约与所需资料，保留合理余量。',steady:'按实际体力与时间安排行程，保持必要的休息。',connect:'同行时提前沟通节奏、预算与各自想做的事。',reflect:'以实时路况、天气和正式通知为准，不凭猜测安排行动。',adjust:'准备替代路线或时间安排，出现变化时灵活调整。',release:'必要时简化或改期，把可执行与舒适放在勉强完成之前。'}},
 {icon:'⌂',name:'家庭生活',question:'怎样让相处多一点理解？',lens:{begin:'从一件小事开始改善相处，不要求一次解决所有旧问题。',steady:'把家务、责任与个人空间说清楚，建立彼此认可的安排。',connect:'用具体陪伴与倾听表达关心，也照顾自己的需要。',reflect:'分清事实、期待与旧情绪，选择合适时机平静沟通。',adjust:'遇到分歧时先减少相互消耗，再协商可接受的边界。',release:'给旧摩擦一点修复空间，也允许相处方式随着阶段改变。'}},
 {icon:'❦',name:'人际关系',question:'我想怎样与别人建立连接？',lens:{begin:'试着发出一个自然、轻量的联系，给关系发展的空间。',steady:'珍惜稳定的往来，守信，也守住自己的时间与边界。',connect:'关注是否互相倾听与回应，让付出与接受更平衡。',reflect:'先澄清对方的意思，避免把猜测当成已经确认的态度。',adjust:'把不同意见具体说清楚，必要时与持续消耗保持距离。',release:'允许一些关系改变，珍惜仍能彼此尊重的连接。'}},
 {icon:'♡',name:'恋爱感情',question:'在感情里，我真正需要什么？',lens:{begin:'有意愿时可以温和表达兴趣；已有伴侣时尝试一个新的相处方式。',steady:'看见日常行动是否与承诺一致，用稳定回应建立信任。',connect:'表达你希望得到的理解，也认真倾听对方愿意分享的需要。',reflect:'把自己的感受说清楚；对方的心意仍需要通过真实沟通确认。',adjust:'留意相处中的压力与边界，不靠试探或控制换取安全感。',release:'诚实面对不再适合的相处模式，给自己整理与修复的时间。'}}
];
const app=document.querySelector('#app');
let stage='home',deck=[],drawn=[],busy=false;
const cardImage=c=>`cards/${c.id}.webp`;
function shuffled(cards,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296){
 const result=cards.slice();
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
function moveFocus(){const h=app.querySelector('h1');h.tabIndex=-1;h.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function home(){
 stage='home';
 app.innerHTML=`<p class="eyebrow">EIGHT CARDS · A QUIET MOMENT</p><h1>与自己，轻轻相遇</h1><p class="sub">静下心，想一想最近的生活。<br>让八张牌，陪你看见八个不同的角度。</p><div class="ritual" aria-hidden="true"><div class="card-back"></div><div class="card-back"></div><div class="card-back"></div></div><div class="domains">${domains.map(d=>`<div class="domain"><span aria-hidden="true">${d.icon}</span>${d.name}</div>`).join('')}</div><button class="primary" id="start">开始抽取八张牌</button><p class="fine">78 张牌 · 正位解读 · 每次约 3 分钟</p><details><summary>第一次抽牌？</summary><p>想一想接下来两周的生活，然后从洗好的牌堆里逐张选择。八个位置分别对应八个生活领域，同一轮不会重复抽到同一张牌。</p><p>每张牌都使用事先写好的解释，不调用 AI，也不预测确定的未来。牌面只使用正位。</p></details>`;
 document.querySelector('#start').onclick=start;
}
function start(){deck=shuffled(TAROT_CARDS);drawn=[];busy=false;stage='draw';renderDraw();moveFocus();return {stage,remaining:8};}
function renderDraw(){
 const n=drawn.length,next=domains[n],last=drawn[n-1];
 app.innerHTML=`<p class="eyebrow">${n===8?'八张牌，已为你展开':`第 ${n+1} 张 · ${next.name}`}</p><h1>${n===8?'看看此刻的自己':next.question}</h1><div class="progress" role="progressbar" aria-label="抽牌进度" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${n}">${domains.map((_,i)=>`<span class="${i<n?'filled':''}"></span>`).join('')}</div><p class="sub" aria-live="polite">${n===8?'已抽满 8 张，可以阅读完整解读。':`已抽 ${n} / 8 张 · 凭直觉选择一张牌<br>选牌后，牌堆会自动补入下一张。`}</p>${last?`<div class="chosen reveal" aria-live="polite"><img src="${cardImage(last)}" alt="${last.name}" width="80" height="120"><div><p class="eyebrow">${domains[n-1].name}</p><h2>${last.name}</h2><p class="fine">${last.keywords}</p></div></div>`:''}${n<8?`<div class="deck">${deck.slice(0,12).map((_,i)=>`<button class="card-back" data-slot="${i}" aria-label="选择第 ${i+1} 张牌" ${busy?'disabled':''}></button>`).join('')}</div>`:''}<div class="picked">${drawn.map((c,i)=>`<span>${domains[i].name} · ${c.name}</span>`).join('')}</div>${n===8?'<button class="primary" id="read">阅读我的八张牌</button>':''}<p class="fine">抽牌没有“选错”。允许自己慢慢来。</p>`;
 app.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>pick(Number(b.dataset.slot)));
 if(n===8)document.querySelector('#read').onclick=showResults;
}
function pick(slot){
 if(stage!=='draw'||drawn.length===8)throw new Error('请先开始新一轮抽牌。');
 if(!Number.isInteger(slot)||slot<0||slot>=Math.min(12,deck.length))throw new Error('请选择展开牌堆中的有效位置。');
 if(busy)return {busy:true,count:drawn.length};
 drawn.push(deck.splice(slot,1)[0]);busy=true;renderDraw();
 setTimeout(()=>{
  busy=false;
  if(stage!=='draw')return;
  app.querySelectorAll('[data-slot]').forEach(b=>b.disabled=false);
  app.querySelector(drawn.length===8?'#read':`[data-slot="${slot}"]`)?.focus({preventScroll:true});
 },450);
 return {count:drawn.length,domain:domains[drawn.length-1].name,card:drawn[drawn.length-1].name};
}
function showResults(){
 if(drawn.length!==8)throw new Error('请先抽满八张牌。');
 stage='results';
 app.innerHTML=`<p class="eyebrow">YOUR EIGHT-CARD READING</p><h1>八个角度，照见此刻</h1><p class="sub">以接下来两周为观察范围。<br>留下有帮助的提醒，把选择握在自己手里。</p><div class="result-overview">${drawn.map((c,i)=>`<a href="#reading-${i}" aria-label="查看${domains[i].name}解读"><img src="${cardImage(c)}" alt="${c.name}" width="1024" height="1536"><span>${domains[i].name}</span></a>`).join('')}</div><div class="results">${drawn.map((c,i)=>`<article class="reading" id="reading-${i}"><div class="reading-head"><a href="${cardImage(c)}" target="_blank" aria-label="查看${c.name}大图"><img src="${cardImage(c)}" alt="${c.name}牌面" width="90" height="135" loading="lazy"></a><div><p class="label">0${i+1} / ${domains[i].name}</p><h3>${c.name}</h3><p class="fine">${c.keywords} · 正位</p></div></div><p>${c.meaning}</p><div class="advice"><strong>${domains[i].name}的提醒</strong><p>${domains[i].lens[c.kind]}</p></div><div class="advice"><strong>可以尝试的一小步</strong><p>${c.advice}</p></div></article>`).join('')}</div><p class="sub">选一条最有共鸣的提醒，<br>把它变成今天能做的一件小事。</p><button class="secondary" id="again">重新开始</button><p class="fine">重新开始会清除本次结果；关闭页面后不保存记录。</p>`;
 document.querySelector('#again').onclick=()=>{drawn=[];deck=[];home();moveFocus();};
 moveFocus();return {stage,cards:drawn.map((c,i)=>({domain:domains[i].name,card:c.name,meaning:c.meaning,focus:domains[i].lens[c.kind],advice:c.advice}))};
}
home();
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const tools=[
 {name:'start_tarot_reading',description:'开始新一轮八张牌占卜，清除本轮结果并洗牌。',inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(input&&Object.keys(input).length)throw new Error('不接受额外参数。');return start();}},
 {name:'draw_tarot_card',description:'从当前展开的12个牌背位置选择一张，按顺序放入下一个领域。',inputSchema:{type:'object',properties:{slot:{type:'integer',minimum:0,maximum:11}},required:['slot'],additionalProperties:false},execute(input){if(!input||Object.keys(input).some(k=>k!=='slot'))throw new Error('仅接受 slot 参数。');return pick(input.slot);}},
 {name:'read_tarot_results',description:'抽满八张后展示并读取本轮完整解读。',inputSchema:{type:'object',properties:{},additionalProperties:false},execute(input){if(input&&Object.keys(input).length)throw new Error('不接受额外参数。');return showResults();}}
 ];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool({...tool,annotations:{readOnlyHint:false,untrustedContentHint:false}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
