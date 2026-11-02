(function(){
  // categorie: somma, combinazioni, indici delle somme
  const CATS=[
    {label:'2 o 12', sums:[2,12], combos:2},
    {label:'3 o 11', sums:[3,11], combos:4},
    {label:'4 o 10', sums:[4,10], combos:6},
    {label:'5 o 9',  sums:[5,9],  combos:8},
    {label:'6 o 8',  sums:[6,8],  combos:10},
    {label:'7',      sums:[7],    combos:6}
  ];
  // premi equi con costo 1: 6/combos (così Σ premio×P = costo)
  const FAIR=[3,1.5,1,0.75,0.6,1];
  const state={
    prizes: FAIR.slice(), cost:1,
    wins:new Array(CATS.length).fill(0),
    totalePremi:0, totaleSpesa:0, total:0,
    timeline:[], last:[1,1], lastCat:null
  };
  const $=id=>document.getElementById(id);
  const dieImgs=[$('die1').querySelector('img'),$('die2').querySelector('img')];
  const RED='#8b1813', GREEN='#2f7d5b';

  function catIndex(sum){
    for(let i=0;i<CATS.length;i++) if(CATS[i].sums.includes(sum)) return i;
    return -1;
  }

  function renderTable(){
    const tb=$('tbody'); tb.innerHTML='';
    CATS.forEach((c,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${c.label}</td>
        <td class="num">${c.combos}</td>
        <td class="num">${(100*c.combos/36).toFixed(1)}%</td>
        <td class="num"><input type="number" min="0" step="0.1" value="${state.prizes[i]}" data-i="${i}"></td>
        <td class="num" id="c${i}">—</td>
        <td class="num" id="w${i}">${state.wins[i]}</td>`;
      tb.appendChild(tr);
    });
    tb.querySelectorAll('input').forEach(inp=>{
      inp.addEventListener('input',()=>{
        const i=+inp.dataset.i; let v=parseFloat(inp.value); if(!isFinite(v)||v<0)v=0;
        state.prizes[i]=v; refresh();
      });
    });
  }

  function expectedValue(){ // Σ premio × P
    let ev=0; CATS.forEach((c,i)=>{ ev += state.prizes[i]*c.combos/36; }); return ev;
  }
  function theoreticalEquity(){ return state.cost>0 ? expectedValue()/state.cost : NaN; }

  function recompute(){
    const ev=expectedValue();
    const eq=state.cost>0?ev/state.cost:NaN;
    const el=$('eqTeorica');
    el.textContent=isFinite(eq)?eq.toFixed(3):'—';
    el.className='v '+(isFinite(eq)&&Math.abs(eq-1)<0.005?'ok':(isFinite(eq)&&eq<1?'bad':''));
    // contributi per riga
    let tp=0;
    CATS.forEach((c,i)=>{
      const contrib=state.prizes[i]*c.combos/36;
      tp+=contrib;
      const cell=$('c'+i); if(cell)cell.textContent=contrib.toFixed(2)+' €';
    });
    $('totContrib').textContent=tp.toFixed(2)+' €';
    $('totProb').textContent='100%';
    $('totWin').textContent=state.total;
    // hint premi equi proporzionali
    const fair=FAIR.map(f=>f*state.cost);
    $('fairHint').textContent='Tabella equa (per costo): '+fair.map(x=>x.toFixed(x%1?2:0)).join(', ')+' €';
  }

  function roll(){ const m1=1+Math.floor(Math.random()*6),m2=1+Math.floor(Math.random()*6); return {m1,m2,sum:m1+m2}; }

  function playOne(){
    const r=roll(); const ci=catIndex(r.sum);
    state.wins[ci]++; state.total++;
    state.totalePremi += state.prizes[ci];
    state.totaleSpesa += state.cost;
    state.last=[r.m1,r.m2]; state.lastCat=ci;
    return r;
  }
  function snapshot(){
    const eq=state.totaleSpesa>0?state.totalePremi/state.totaleSpesa:0;
    state.timeline.push([state.total,eq]);
  }

  function updateUI(){
    $('totPremi').textContent=state.totalePremi.toFixed(2)+' €';
    $('totSpesa').textContent=state.totaleSpesa.toFixed(2)+' €';
    const eq=state.totaleSpesa>0?state.totalePremi/state.totaleSpesa:NaN;
    const el=$('eqStimata');
    el.textContent=isFinite(eq)?eq.toFixed(3):'—';
    el.className='v '+(isFinite(eq)&&Math.abs(eq-1)<0.05?'ok':(isFinite(eq)&&eq<0.9?'bad':''));
    CATS.forEach((c,i)=>{const w=$('w'+i);if(w)w.textContent=state.wins[i];});
    $('totWin').textContent=state.total;
  }

  function setDice(m1,m2){
    dieImgs[0].src='assets/'+m1+'.png'; dieImgs[1].src='assets/'+m2+'.png';
    $('sum').textContent=m1+m2;
    $('cat').textContent=CATS[catIndex(m1+m2)].label;
  }
  function animate(){ [$('die1'),$('die2')].forEach(d=>{d.classList.remove('rolling');void d.offsetWidth;d.classList.add('rolling');}); }

  function draw(){
    const cv=$('chart'),ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height,padL=52,padR=16,padT=16,padB=30;
    ctx.clearRect(0,0,W,H);
    const tl=state.timeline;
    const theo=theoreticalEquity();
    let yMax=2; tl.forEach(p=>{if(p[1]>yMax)yMax=p[1];});
    if(isFinite(theo))yMax=Math.max(yMax,theo*1.2);
    yMax=Math.max(1.5,yMax);
    const toY=v=>padT+(H-padT-padB)*(1-v/yMax);
    const maxT=tl.length?tl[tl.length-1][0]:1;
    const toX=t=>padL+((W-padL-padR)*(t/maxT));
    ctx.strokeStyle='#eee6d8';ctx.fillStyle='#9a9284';ctx.font='11px sans-serif';ctx.textAlign='right';
    const step=yMax<=2?0.5:Math.ceil(yMax/4);
    for(let g=0;g<=yMax+1e-9;g+=step){const y=toY(g);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();ctx.fillText(g.toFixed(1),padL-8,y+4);}
    ctx.strokeStyle='rgba(47,125,91,.5)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(padL,toY(1));ctx.lineTo(W-padR,toY(1));ctx.stroke();ctx.setLineDash([]);
    if(isFinite(theo)){ctx.strokeStyle=GREEN;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(padL,toY(theo));ctx.lineTo(W-padR,toY(theo));ctx.stroke();}
    if(tl.length>1){
      ctx.strokeStyle=RED;ctx.lineWidth=2;ctx.beginPath();
      tl.forEach((p,k)=>{const x=toX(p[0]),y=toY(Math.min(p[1],yMax));k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
    }
    ctx.fillStyle='#9a9284';ctx.textAlign='center';
    for(let i=0;i<=4;i++){const t=maxT*i/4;ctx.fillText(Math.round(t),toX(t),H-8);}
    ctx.textAlign='left';ctx.fillStyle=RED;ctx.fillText('equità stimata',padL+6,padT+12);
    if(isFinite(theo)){ctx.fillStyle=GREEN;ctx.fillText('equità teorica',padL+120,padT+12);}
  }

  function refresh(){updateUI();recompute();draw();}

  $('btnMany').addEventListener('click',()=>{
    let n=parseInt($('nval').value,10); if(!isFinite(n)||n<1)n=100; if(n>200000)n=200000;
    const stride=Math.max(1,Math.floor(n/300));
    for(let i=0;i<n;i++){playOne(); if(i%stride===0||i===n-1)snapshot();}
    animate(); if(state.last)setDice(state.last[0],state.last[1]);
    refresh();
  });
  $('cost').addEventListener('input',()=>{
    let c=parseFloat($('cost').value); if(!isFinite(c)||c<=0)c=1;
    state.cost=c; refresh();
  });
  $('btnFair').addEventListener('click',()=>{
    const ev=expectedValue();
    if(ev>0){ const k=state.cost/ev; state.prizes=state.prizes.map(p=>+(p*k).toFixed(2)); }
    else { state.prizes=FAIR.map(f=>+(f*state.cost).toFixed(2)); }
    renderTable(); refresh();
  });
  $('btnReset').addEventListener('click',()=>{
    state.wins=new Array(CATS.length).fill(0);
    state.totalePremi=0;state.totaleSpesa=0;state.total=0;state.timeline=[];state.last=null;
    renderTable(); refresh();
  });

  renderTable(); refresh();
})();
