(function(){
  const state={ teste:0, croci:0, total:0, timeline:[], mode:'freq', last:null };
  const $=id=>document.getElementById(id);
  const coinImg=$('coin').querySelector('img');
  const RED='#8b1813', BLUE='#3f6fb5', GREEN='#2f7d5b';

  function flip(){ return Math.random()<0.5 ? 1 : 2; } // 1 testa, 2 croce

  function apply(m){
    if(m===1)state.teste++; else state.croci++;
    state.total++; state.last=m;
  }
  function snapshot(){
    const t=state.total;
    state.timeline.push([t, 100*state.teste/t, 100*state.croci/t, state.teste-state.croci]);
  }

  function setCoin(m){
    coinImg.src = m===1 ? 'assets/testa.jpg':'assets/croce.jpg';
    coinImg.alt = m===1 ? 'testa':'croce';
  }
  function animate(){ const c=$('coin');c.classList.remove('flipping');void c.offsetWidth;c.classList.add('flipping'); }

  function updateUI(){
    $('total').textContent=state.total;
    $('teste').textContent=state.teste;
    $('croci').textContent=state.croci;
    const pt=state.total?100*state.teste/state.total:0;
    const pc=state.total?100*state.croci/state.total:0;
    $('pt').textContent=pt.toFixed(1)+'%';
    $('pc').textContent=pc.toFixed(1)+'%';
    $('ptbig').textContent=state.total?pt.toFixed(1)+'%':'—';
    $('diff').textContent=(state.teste-state.croci);
  }

  function draw(){
    const cv=$('chart'),ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height,padL=52,padR=16,padT=16,padB=32;
    ctx.clearRect(0,0,W,H);
    const tl=state.timeline;
    if(tl.length<2){ drawAxesEmpty(ctx,W,H,padL,padR,padT,padB); return; }
    const maxT=tl[tl.length-1][0];

    if(state.mode==='freq'){
      const yMin=0,yMax=100;
      const toY=v=>padT+(H-padT-padB)*(1-(v-yMin)/(yMax-yMin));
      const toX=t=>padL+((W-padL-padR)*(t/maxT));
      // grid
      ctx.strokeStyle='#eee6d8';ctx.fillStyle='#9a9284';ctx.font='11px sans-serif';ctx.textAlign='right';
      for(let g=0;g<=100;g+=25){const y=toY(g);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();ctx.fillText(g+'%',padL-8,y+4);}
      // 50% line
      ctx.strokeStyle='rgba(139,24,19,.35)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(padL,toY(50));ctx.lineTo(W-padR,toY(50));ctx.stroke();ctx.setLineDash([]);
      // teste
      ctx.strokeStyle=GREEN;ctx.lineWidth=2;ctx.beginPath();
      tl.forEach((p,k)=>{const x=toX(p[0]),y=toY(p[1]);k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
      // croci
      ctx.strokeStyle=BLUE;ctx.lineWidth=2;ctx.beginPath();
      tl.forEach((p,k)=>{const x=toX(p[0]),y=toY(p[2]);k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
      // x labels
      ctx.fillStyle='#9a9284';ctx.textAlign='center';
      for(let i=0;i<=4;i++){const t=maxT*i/4;ctx.fillText(Math.round(t),toX(t),H-8);}
      ctx.textAlign='left';ctx.fillStyle=GREEN;ctx.fillText('Teste',padL+6,padT+12);
      ctx.fillStyle=BLUE;ctx.fillText('Croci',padL+60,padT+12);
    } else {
      // difference: symmetric around 0
      let maxAbs=1; tl.forEach(p=>{maxAbs=Math.max(maxAbs,Math.abs(p[3]));});
      maxAbs=Math.ceil(maxAbs*1.15);
      const toY=v=>padT+(H-padT-padB)*(1-(v+maxAbs)/(2*maxAbs));
      const toX=t=>padL+((W-padL-padR)*(t/maxT));
      ctx.strokeStyle='#eee6d8';ctx.fillStyle='#9a9284';ctx.font='11px sans-serif';ctx.textAlign='right';
      for(let g=-maxAbs;g<=maxAbs;g+=maxAbs/2){const y=toY(g);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();ctx.fillText(Math.round(g),padL-8,y+4);}
      // zero line
      ctx.strokeStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(padL,toY(0));ctx.lineTo(W-padR,toY(0));ctx.stroke();
      // difference
      ctx.strokeStyle=RED;ctx.lineWidth=2;ctx.beginPath();
      tl.forEach((p,k)=>{const x=toX(p[0]),y=toY(p[3]);k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
      ctx.fillStyle='#9a9284';ctx.textAlign='center';
      for(let i=0;i<=4;i++){const t=maxT*i/4;ctx.fillText(Math.round(t),toX(t),H-8);}
      ctx.textAlign='left';ctx.fillStyle=RED;ctx.fillText('Teste − Croci',padL+6,padT+12);
    }
  }

  function drawAxesEmpty(ctx,W,H,padL,padR,padT,padB){
    ctx.strokeStyle='#eee6d8';ctx.fillStyle='#9a9284';ctx.font='11px sans-serif';ctx.textAlign='right';
    for(let g=0;g<=100;g+=25){const y=padT+(H-padT-padB)*(1-g/100);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();ctx.fillText(g+'%',padL-8,y+4);}
    ctx.textAlign='center';ctx.fillText('lancia per iniziare',W/2,H/2);
  }

  function refresh(){updateUI();draw();}

  $('btnOne').addEventListener('click',()=>{
    const m=flip();apply(m);snapshot();animate();setCoin(m);refresh();
  });
  $('btnMany').addEventListener('click',()=>{
    let n=parseInt($('nval').value,10); if(!isFinite(n)||n<1)n=1000; if(n>500000)n=500000;
    const stride=Math.max(1,Math.floor(n/300));
    for(let i=0;i<n;i++){apply(flip()); if(i%stride===0||i===n-1)snapshot();}
    if(state.last)setCoin(state.last);
    refresh();
  });
  $('btnFreq').addEventListener('click',()=>{
    state.mode='freq';$('btnFreq').classList.add('active');$('btnDiff').classList.remove('active');
    $('chartTitle').textContent='Frequenza delle teste';
    $('chartHint').textContent='Percentuale di teste sul totale dei lanci: converge verso il 50%.';
    draw();
  });
  $('btnDiff').addEventListener('click',()=>{
    state.mode='diff';$('btnDiff').classList.add('active');$('btnFreq').classList.remove('active');
    $('chartTitle').textContent='Differenza Teste − Croci';
    $('chartHint').textContent='La differenza assoluta cresce come √N: non si "annulla" con altri lanci.';
    draw();
  });
  $('btnReset').addEventListener('click',()=>{
    state.teste=0;state.croci=0;state.total=0;state.timeline=[];state.last=null;
    coinImg.src='assets/testa.jpg';refresh();
  });

  refresh();
})();
