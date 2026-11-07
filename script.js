(function(){
  document.documentElement.classList.add('js');
  /* Musik latar: file audio dari pemilik undangan */
  var btn=document.getElementById('music'),au=document.getElementById('bgm'),playing=false;
  function ui(){btn.classList.toggle('on',playing);btn.setAttribute('aria-pressed',playing)}
  function start(){var r=au.play();if(r&&r.then)r.then(function(){playing=true;ui()},function(){playing=false;ui()});else{playing=true;ui()}}
  function stop(){au.pause();playing=false;ui()}
  btn.onclick=function(){playing?stop():start()};
  document.addEventListener('visibilitychange',function(){if(document.hidden&&playing){au.pause();btn.dataset.auto=1}else if(!document.hidden&&btn.dataset.auto){delete btn.dataset.auto;au.play()}});
  var g=new URLSearchParams(location.search).get('to');
  if(g){document.getElementById('guest').textContent=g;document.getElementById('nm').value=g}
  var cv=document.getElementById('cover');
  document.getElementById('open').onclick=function(){
    cv.classList.add('gone');document.body.classList.remove('lock');window.scrollTo(0,0);
    btn.classList.add('show');start();setTimeout(function(){cv.style.display='none'},950);
  };
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    document.querySelectorAll('.rv').forEach(function(x){io.observe(x)});
  }else document.querySelectorAll('.rv').forEach(function(x){x.classList.add('in')});
  var cds=document.querySelectorAll('.cd'),T=new Date('2026-12-05T10:00:00+07:00').getTime(),L=['Hari','Jam','Menit','Detik'];
  function tick(){var x=Math.max(0,T-Date.now()),v=[Math.floor(x/864e5),Math.floor(x%864e5/36e5),Math.floor(x%36e5/6e4),Math.floor(x%6e4/1e3)];
    cds.forEach(function(c){c.innerHTML=v.map(function(n,i){return '<div><b>'+(n<10?'0':'')+n+'</b>'+L[i]+'</div>'}).join('')})}
  tick();setInterval(tick,1000);
  document.querySelectorAll('.wa').forEach(function(bt){bt.onclick=function(){var WA=bt.dataset.wa;
    var n=document.getElementById('nm').value.trim()||'Tamu',m=document.getElementById('ms').value.trim();
    var t="Assalamu'alaikum, saya "+n+" ("+document.getElementById('st').value+") pada pernikahan Hendri & Nina, 05 Desember 2026."+(m?"\n\nUcapan: "+m:"");
    bt.href='https://wa.me/'+WA+'?text='+encodeURIComponent(t);
  }});
  var gb=document.getElementById('gbtn');gb.onclick=function(){var bk=document.getElementById('bank');bk.hidden=!bk.hidden;gb.setAttribute('aria-expanded',!bk.hidden)};
  document.querySelectorAll('[data-copy]').forEach(function(b){b.onclick=function(){try{navigator.clipboard.writeText(b.parentNode.querySelector('span').innerText);b.textContent='Tersalin'}catch(e){}}});
})();
