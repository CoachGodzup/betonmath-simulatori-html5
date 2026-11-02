(function(){
  const state = {
    counts:[0,0,0], total:0,
    timeline:[],      // [ [t, p1, p2, p3], ... ] campionata
    last:[null,null]
  };
  const SAMPLE_EVERY = 1;  // per singolo lancio; nei batch campioniamo
  const colors=['#b23b36','#2f7d5b','#3f6fb5'];
  const names=['2 Croci','2 Teste','1 Testa e 1 Croce'];

  const $=id=>document.getElementById(id);
  const coinImgs=[$('coin1').querySelector('img'),$('coin2').querySelector('img')];

  function flipOne(){
    // testa = 1, croce = 2
    const m1 = Math.random()<0.5?1:2;
    const m2 = Math.random()<0.5?1:2;
    // outcome index: 0 -> 2 croci (both croce=2), 1 -> 2 teste (both 1), 2 -> mista
    let idx;
    if(m1===2 && m2===2) idx=0;
    else if(m1===1 && m2===1) idx=1;
    else idx=2;
    return {m1,m2,idx};
  }

  function snapshot(){
    const t=state.total;
    state.timeline.push([t,
      100*state.counts[0]/t, 100*state.counts[1]/t, 100*state.counts[2]/t]);
  }

  function apply(r){
    state.counts[r.idx]++;
    state.total++;
    state.last=[r.m1,r.m2];
  }

  function setCoin(i,m){
    coinImgs[i].src = m===1 ? 'assets/testa.jpg' : 'assets/croce.jpg';
    coinImgs[i].alt = m===1 ? 'testa' : 'croce';
  }

  function animateCoins(){
    [$('coin1'),$('coin2')].forEach(c=>{c.classList.remove('flipping');void c.offsetWidth;c.classList.add('flipping');});
  }

  function updateUI(){
    for(let i=0;i<3;i++){
      $('count'+(i+1)).textContent = state.counts[i];
      const pct = state.total? (100*state.counts[i]/state.total):0;
      $('pct'+(i+1)).textContent = pct.toFixed(1)+'% \u00B7 '+state.total+' lanci';
    }
  }

  function drawLine(){
    const cv=$('chartLine'), ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    // grid
    ctx.strokeStyle='#eee6d8';ctx.lineWidth=1;
    for(let g=0;g<=100;g+=25){const y=H-20-(H-40)*g/100;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-8,y);ctx.stroke();
      ctx.fillStyle='#9a9284';ctx.font='11px sans-serif';ctx.fillText(g+'%',4,y+4);}
    // theory lines
    const theory=[25,25,50];
    theory.forEach((t,i)=>{ctx.strokeStyle=colors[i];ctx.setLineDash([4,4]);ctx.globalAlpha=.5;
      const y=H-20-(H-40)*t/100;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(W-8,y);ctx.stroke();});
    ctx.setLineDash([]);ctx.globalAlpha=1;
    // series from sampled timeline
    const tl=state.timeline;
    if(tl.length>1){
      const maxT=tl[tl.length-1][0];
      for(let i=0;i<3;i++){
        ctx.strokeStyle=colors[i];ctx.lineWidth=2;ctx.beginPath();
        for(let k=0;k<tl.length;k++){
          const x=40+(W-48)*(tl[k][0]/maxT);
          const y=H-20-(H-40)*Math.min(tl[k][1+i],100)/100;
          if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
    }
  }

  function drawBar(){
    const cv=$('chartBar'), ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    const base=H-30, top=20;
    const theory=[25,25,50];
    const padL=40, availW=W-padL-20, groupW=availW/3;
    ctx.font='11px sans-serif';
    for(let i=0;i<3;i++){
      const pct = state.total? 100*state.counts[i]/state.total:0;
      const gx=padL+i*groupW;
      const bw=groupW*0.42;
      // empirical
      const eh=(base-top)*Math.min(pct,100)/100;
      ctx.fillStyle=colors[i];
      ctx.fillRect(gx+groupW*0.06, base-eh, bw, eh);
      // theory
      const th=(base-top)*theory[i]/100;
      ctx.fillStyle='rgba(0,0,0,.12)';
      ctx.fillRect(gx+groupW*0.54, base-th, bw, th);
      ctx.fillStyle='#6b6357';ctx.textAlign='center';
      ctx.fillText(pct.toFixed(1)+'%', gx+bw, base-eh-4);
      ctx.fillText(['2 Croci','2 Teste','Mista'][i], gx+groupW/2, base+16);
    }
    ctx.textAlign='left';
    ctx.strokeStyle='#ddd3c2';ctx.beginPath();ctx.moveTo(padL,base);ctx.lineTo(W-8,base);ctx.stroke();
  }

  function refresh(){updateUI();drawLine();drawBar();}

  function flipMany(n){
    const stride=Math.max(1,Math.floor(n/200));
    for(let i=0;i<n;i++){
      apply(flipOne());
      if(i%stride===0 || i===n-1) snapshot();
    }
    const last=state.last;
    if(last[0]!=null){setCoin(0,last[0]);setCoin(1,last[1]);}
    refresh();
  }

  $('btnOne').addEventListener('click',()=>{
    const r=flipOne(); apply(r); snapshot();
    animateCoins();
    setCoin(0,r.m1);setCoin(1,r.m2);
    // highlight winner
    for(let i=0;i<3;i++){$('p'+(i+1)).classList.toggle('win',i===r.idx);}
    refresh();
  });
  $('btnMany').addEventListener('click',()=>{
    let n=parseInt($('nval').value,10); if(!isFinite(n)||n<1)n=100; if(n>100000)n=100000;
    flipMany(n);
    for(let i=0;i<3;i++){$('p'+(i+1)).classList.remove('win');}
  });
  $('btnReset').addEventListener('click',()=>{
    state.counts=[0,0,0];state.total=0;state.timeline=[];
    for(let i=0;i<3;i++){$('p'+(i+1)).classList.remove('win');}
    coinImgs[0].src='assets/testa.jpg';coinImgs[1].src='assets/testa.jpg';
    refresh();
  });

  refresh();
})();
