(function(){
  const SYMBOLS=['gold-64','cash-64','energi-64','staff-64','buil-64','good-64'];
  const NON_GOLD=['cash-64','energi-64','staff-64','buil-64','good-64'];
  const COST=1, PAY={1:1,2:10,3:100};
  const state={ spesi:0, premi:0, plays:0, timeline:[], last:[1,2,3] };
  const $=id=>document.getElementById(id);
  const reelEls=[$('reel1'),$('reel2'),$('reel3')];
  const reelImgs=reelEls.map(r=>r.querySelector('img'));
  const RED='#8b1813', BLUE='#3f6fb5', GREEN='#2f7d5b';

  // Un rullo: valore 1..9; 1 = lingotto, altrimenti uno degli altri 5 simboli
  function spinReel(){
    const v=1+Math.floor(Math.random()*9);
    if(v===1) return {value:1, img:'gold-64'};
    return {value:v, img:NON_GOLD[(v-2)%NON_GOLD.length]};
  }
  function spinAll(){ return [spinReel(),spinReel(),spinReel()]; }

  function payout(reels){
    const nGold=reels.filter(r=>r.value===1).length;
    return PAY[nGold]||0;
  }

  function setReels(reels){
    reels.forEach((r,i)=>{reelImgs[i].src='assets/'+r.img+'.png';reelEls[i].classList.toggle('win',r.value===1);});
    const nGold=reels.filter(r=>r.value===1).length;
    const el=$('msg');
    if(nGold===0){el.textContent='Nessun lingotto — niente premio';el.className='msg lose';}
    else{el.textContent=(nGold===1?'Un lingotto':nGold+' lingotti')+' → vinci '+PAY[nGold]+' €';el.className='msg win';}
  }

  function updateUI(){
    $('spesi').textContent=state.spesi.toFixed(0)+' €';
    $('premi').textContent=state.premi.toFixed(0)+' €';
    $('saldo').textContent=(state.premi-state.spesi).toFixed(0)+' €';
  }

  function draw(){
    const cv=$('chart'),ctx=cv.getContext('2d');
    const W=cv.width,H=cv.height,padL=54,padR=16,padT=16,padB=30;
    ctx.clearRect(0,0,W,H);
    const tl=state.timeline;
    let maxAbs=1; tl.forEach(p=>{maxAbs=Math.max(maxAbs,Math.abs(p[1]));});
    maxAbs=Math.ceil(maxAbs*1.15);
    const toY=v=>padT+(H-padT-padB)*(1-(v+maxAbs)/(2*maxAbs));
    const maxT=tl.length?tl[tl.length-1][0]:1;
    const toX=t=>padL+((W-padL-padR)*(t/maxT));
    ctx.strokeStyle='#eee6d8';ctx.fillStyle='#9a9284';ctx.font='11px sans-serif';ctx.textAlign='right';
    for(let g=-maxAbs;g<=maxAbs;g+=maxAbs/2){const y=toY(g);ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(W-padR,y);ctx.stroke();ctx.fillText(Math.round(g),padL-8,y+4);}
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(padL,toY(0));ctx.lineTo(W-padR,toY(0));ctx.stroke();
    if(tl.length>1){
      ctx.strokeStyle=RED;ctx.lineWidth=2;ctx.beginPath();
      tl.forEach((p,k)=>{const x=toX(p[0]),y=toY(p[1]);k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
    }
    ctx.scrollWidth; ctx.fillStyle='#9a9284';ctx.textAlign='center';
    for(let i=0;i<=4;i++){const t=maxT*i/4;ctx.fillText(Math.round(t),toX(t),H-8);}
    ctx.textAlign='left';ctx.fillStyle=RED;ctx.fillText('saldo = premi − spese',padL+6,padT+12);
  }

  function refresh(){updateUI();draw();}

  function playOne(){
    const reels=spinAll();
    state.plays++; state.spesi+=COST;
    const win=payout(reels);
    state.premi+=win;
    state.last=reels;
    state.timeline.push([state.plays, state.premi-state.spesi]);
    return reels;
  }

  // pulsante singolo con breve animazione
  $('btnPlay').addEventListener('click',()=>{
    reelEls.forEach(r=>r.classList.add('spinning'));
    const final=spinAll();
    let ticks=0;
    const iv=setInterval(()=>{
      ticks++;
      if(ticks>=8){
        clearInterval(iv);
        reelEls.forEach(r=>r.classList.remove('spinning'));
        state.plays++;state.spesi+=COST;
        const win=payout(final);state.premi+=win;state.last=final;
        state.timeline.push([state.plays,state.premi-state.spesi]);
        setReels(final);refresh();
      } else {
        final.forEach((f,i)=>{ if(ticks<6+ i || ticks<8) reelImgs[i].src='assets/'+spinReel().img+'.png'; });
      }
    },55);
  });

  $('btnMany').addEventListener('click',()=>{
    let n=parseInt($('nval').value,10); if(!isFinite(n)||n<1)n=100; if(n>200000)n=200000;
    for(let i=0;i<n;i++){playOne();}
    setReels(state.last);
    refresh();
  });

  $('btnReset').addEventListener('click',()=>{
    state.spesi=0;state.premi=0;state.plays=0;state.timeline=[];state.last=[1,2,3];
    reelImgs.forEach((im,i)=>{im.src='assets/gold-64.png';});
    reelEls.forEach(r=>r.classList.remove('win'));
    $('msg').textContent='Premi «Gioca» per iniziare';$('msg').className='msg lose';
    refresh();
  });

  refresh();
})();
