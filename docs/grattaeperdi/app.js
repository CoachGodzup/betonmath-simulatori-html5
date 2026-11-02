(function(){
  // Distribuzione esatta ricavata dall'APK (su 30.000.000 di biglietti)
  const PRIZES=[500000,100000,10000,1000,500,100,50,25,20,15,10,5,0];
  const COUNTS=[5,25,250,5000,7500,65000,120000,90000,270000,350000,2030000,8610000,18452220];
  const TOTAL_W=30000000;
  const CUM=[]; let acc=0;
  for(let i=0;i<PRIZES.length;i++){acc+=COUNTS[i];CUM.push(acc);}

  const state={
    spesa:0, premi:0, nbig:0,
    counts:new Array(PRIZES.length).fill(0),
    currentPrize:null
  };
  const $=id=>document.getElementById(id);
  const cardwrap=$('cardwrap'), scratch=$('scratch'), sctx=scratch.getContext('2d');

  // ---------- disegno biglietto ----------
  function drawTicket(prizeValue){
    state.currentPrize=prizeValue;
    const idx=PRIZES.indexOf(prizeValue);
    $('prizeImg').src='assets/'+prizeValue+'euro.png';
    $('lastPrize').textContent = prizeValue===0 ? 'Nessun premio' : prizeValue+' €';
    // ridisegna copertura
    cardwrap.classList.remove('revealed');
    const W=scratch.width,H=scratch.height;
    sctx.globalCompositeOperation='source-over';
    sctx.clearRect(0,0,W,H);
    const g=sctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#d8d2c6');g.addColorStop(.5,'#bfb8a8');g.addColorStop(1,'#cfc8ba');
    sctx.fillStyle=g;sctx.fillRect(0,0,W,H);
    // pattern leggero
    sctx.globalAlpha=.35;
    for(let x=0;x<W;x+=26){sctx.strokeStyle='#a89f8d';sctx.beginPath();sctx.moveTo(x,0);sctx.lineTo(x-60,H);sctx.stroke();}
    sctx.globalAlpha=1;
    sctx.fillStyle='#7d7462';sctx.font='bold 42px -apple-system,Segoe UI,Roboto,sans-serif';
    sctx.textAlign='center';sctx.textBaseline='middle';
    sctx.fillText('GRATTA QUI', W/2, H/2);
    // piccolo richiamo in alto
    sctx.font='20px -apple-system,Segoe UI,Roboto,sans-serif';sctx.fillStyle='#6b6252';
    sctx.fillText('Gratta e Perdi', W/2, H/2-54);
    erasedCells.clear();
  }

  // ---------- grattare ----------
  const GRID=16; // 16x16 celle
  const erasedCells=new Set();
  let scratching=false, lastX=0, lastY=0;

  function pos(ev){
    const r=scratch.getBoundingClientRect();
    const x=(ev.clientX-r.left)*scratch.width/r.width;
    const y=(ev.clientY-r.top)*scratch.height/r.height;
    return {x,y};
  }

  function scratchAt(x,y,r=44){
    sctx.globalCompositeOperation='destination-out';
    sctx.beginPath();sctx.arc(x,y,r,0,Math.PI*2);sctx.fill();
    sctx.globalCompositeOperation='source-over';
    // marca celle
    const cw=scratch.width/GRID, ch=scratch.height/GRID;
    const cx=Math.floor(x/cw), cy=Math.floor(y/ch);
    const rad=Math.ceil(r/cw);
    for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++){
      const gx=cx+dx, gy=cy+dy;
      if(gx>=0&&gy>=0&&gx<GRID&&gy<GRID) erasedCells.add(gy*GRID+gx);
    }
    if(erasedCells.size/(GRID*GRID) > 0.45) reveal();
  }

  function reveal(){
    if(cardwrap.classList.contains('revealed'))return;
    cardwrap.classList.add('revealed');
  }

  scratch.addEventListener('pointerdown',ev=>{
    if(cardwrap.classList.contains('revealed'))return;
    scratching=true;scratch.setPointerCapture(ev.pointerId);
    const p=pos(ev);lastX=p.x;lastY=p.y;scratchAt(p.x,p.y);
  });
  scratch.addEventListener('pointermove',ev=>{
    if(!scratching)return;
    const p=pos(ev);
    // interpola per fluidità
    const dx=p.x-lastX,dy=p.y-lastY;const dist=Math.hypot(dx,dy);const steps=Math.max(1,Math.floor(dist/12));
    for(let i=1;i<=steps;i++)scratchAt(lastX+dx*i/steps,lastY+dy*i/steps);
    lastX=p.x;lastY=p.y;
  });
  scratch.addEventListener('pointerup',()=>{scratching=false;});
  scratch.addEventListener('pointerleave',()=>{scratching=false;});

  // ---------- estrazione ----------
  function drawPrize(){
    const r=1+Math.floor(Math.random()*TOTAL_W);
    for(let i=0;i<CUM.length;i++){ if(r<=CUM[i]) return PRIZES[i]; }
    return 0;
  }

  function recordTicket(prize){
    const idx=PRIZES.indexOf(prize);
    state.counts[idx]++;
    state.nbig++;
    state.spesa+=state.cost();
    state.premi+=prize;
  }

  state.cost=function(){ const c=parseFloat($('cost').value); return isFinite(c)&&c>=0?c:5; };

  // ---------- UI ----------
  function fmt(n){ return n.toLocaleString('it-IT')+' €'; }

  function updateUI(){
    $('spesa').textContent=fmt(state.spesa);
    $('premi').textContent=fmt(state.premi);
    const diff=state.premi-state.spesa;
    $('diff').textContent=fmt(diff);
    $('nbig').textContent=state.nbig.toLocaleString('it-IT');
    $('pmedio').textContent=state.nbig? (state.premi/state.nbig).toFixed(2)+' €':'—';
    // sommario
    $('s_spesa').textContent=fmt(state.spesa);
    $('s_premi').textContent=fmt(state.premi);
    $('s_diff').textContent=fmt(diff);
    const tb=$('sumTable');
    if(tb){
      tb.innerHTML='';
      PRIZES.forEach((p,i)=>{
        const tr=document.createElement('tr');
        const freq=state.nbig?100*state.counts[i]/state.nbig:0;
        tr.innerHTML=`<td class="pz">${p===0?'Nessuno':p+' €'}</td>
          <td class="num">${state.counts[i].toLocaleString('it-IT')}</td>
          <td class="num">${freq.toFixed(1)}%</td>`;
        tb.appendChild(tr);
      });
    }
  }

  function drawChart(){
    const cv=$('chart'),ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height,padL=56,padR=16,padT=16,padB=44;
    ctx.clearRect(0,0,W,H);
    const labels=PRIZES.map(p=>p===0?'0':(p>=1000?(p/1000)+'k':''+p));
    const maxC=Math.max(1,...state.counts);
    const n=PRIZES.length;
    const gap=(W-padL-padR)/n;
    const bw=gap*0.68;
    ctx.textAlign='center';ctx.font='11px sans-serif';
    for(let i=0;i<n;i++){
      const x=padL+i*gap;
      const h=(H-padT-padB)*state.counts[i]/maxC;
      const y=H-padB-h;
      ctx.fillStyle = PRIZES[i]===0 ? '#b9b1a3' : (PRIZES[i]>=1000?'#c99a2e':'#8b1813');
      ctx.fillRect(x+gap/2-bw/2,y,bw,h);
      if(state.counts[i]>0){ctx.fillStyle='#6b6357';ctx.fillText(state.counts[i],x+gap/2,y-4);}
      ctx.fillStyle='#7a7266';ctx.fillText(labels[i],x+gap/2,H-padB+16);
    }
    ctx.fillStyle='#9a9284';ctx.textAlign='left';ctx.fillText('Premio (€)',padL,padT-2);
    ctx.save();ctx.translate(14,H/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('N. biglietti',0,0);ctx.restore();
    ctx.strokeStyle='#ddd3c2';ctx.beginPath();ctx.moveTo(padL,H-padB);ctx.lineTo(W-padR,H-padB);ctx.stroke();
  }

  function refresh(){updateUI();drawChart();}

  // ---------- azioni ----------
  $('btnOne').addEventListener('click',()=>{
    const prize=drawPrize();
    recordTicket(prize);
    drawTicket(prize);
    refresh();
  });

  $('btnMany').addEventListener('click',()=>{
    let n=parseInt($('nval').value,10); if(!isFinite(n)||n<1)n=100; if(n>2000000)n=2000000;
    let last=0;
    for(let i=0;i<n;i++){ last=drawPrize(); recordTicket(last); }
    // mostra l'ultimo biglietto già rivelato
    drawTicket(last);
    cardwrap.classList.add('revealed');
    refresh();
  });

  $('btnPM').addEventListener('click',()=>{
    if(state.nbig===0){alert('Gratta almeno un biglietto.');return;}
    const pm=state.premi/state.nbig;
    alert('Premio medio: '+pm.toFixed(2)+' €\nCosto biglietto: '+state.cost().toFixed(2)+' €\n'+
          (pm<state.cost() ? 'Perdi in media '+(state.cost()-pm).toFixed(2)+' € a biglietto.' : 'Vinci in media '+(pm-state.cost()).toFixed(2)+' € a biglietto.'));
  });

  $('btnSum').addEventListener('click',()=>{
    $('main').classList.add('hidden');$('main').classList.remove('show');
    $('sommario').classList.add('show');updateUI();
  });
  $('btnBack').addEventListener('click',()=>{
    $('sommario').classList.remove('show');$('main').classList.remove('hidden');$('main').classList.add('show');
  });

  function reset(){
    state.spesa=0;state.premi=0;state.nbig=0;state.counts=new Array(PRIZES.length).fill(0);
    erasedCells.clear();
    drawTicket(0);
    refresh();
  }
  $('btnReset').addEventListener('click',reset);
  $('btnReset2').addEventListener('click',reset);

  $('cost').addEventListener('input',()=>refresh());

  // init
  drawTicket(0);
  $('main').classList.add('show');
  refresh();
})();
