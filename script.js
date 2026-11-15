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
  var as=document.getElementById('autoscroll'),asOn=false,asRaf=0,asLast=0,asAcc=0,SPEED=65;
  function asStep(t){
    if(!asOn)return;
    if(asLast){asAcc+=(t-asLast)*SPEED/1000;var n=Math.floor(asAcc);if(n>=1){window.scrollBy(0,n);asAcc-=n}}
    asLast=t;
    var el=document.scrollingElement||document.documentElement;
    if(window.innerHeight+window.scrollY>=el.scrollHeight-2){asStop();return}
    asRaf=requestAnimationFrame(asStep);
  }
  function asStart(){asOn=true;asLast=0;asAcc=0;as.classList.add('on');as.setAttribute('aria-pressed','true');asRaf=requestAnimationFrame(asStep)}
  function asStop(){asOn=false;cancelAnimationFrame(asRaf);as.classList.remove('on');as.setAttribute('aria-pressed','false')}
  as.onclick=function(){asOn?asStop():asStart()};
  ['touchstart','wheel','keydown','mousedown'].forEach(function(ev){window.addEventListener(ev,function(e){if(asOn&&!(e.target.closest&&e.target.closest('#autoscroll')))asStop()},{passive:true})});
  var cv=document.getElementById('cover');
  document.getElementById('open').onclick=function(){
    cv.classList.add('gone');document.body.classList.remove('lock');window.scrollTo(0,0);
    btn.classList.add('show');as.classList.add('show');start();setTimeout(asStart,100);setTimeout(function(){cv.style.display='none'},950);
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
  /* Salin nomor rekening (hanya angka), dengan cadangan untuk browser lama */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    var label=b.textContent;
    b.onclick=function(){
      var t=b.getAttribute('data-copy');
      function ok(){b.textContent='Tersalin';setTimeout(function(){b.textContent=label},2000)}
      function fb(){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){b.textContent='Salin manual: '+t}document.body.removeChild(a)}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,fb)}else fb();
    };
  });

  /* ===== Ucapan & Doa (guestbook) =====
     Data disimpan di Google Sheet lewat Google Apps Script (lihat README.md).
     Isi GB_URL dengan URL Web App (berakhiran /exec). Kosong = fitur disembunyikan,
     RSVP tetap berjalan lewat WhatsApp. */
  var GB_URL='https://script.google.com/macros/s/AKfycbwCO4XVYM_lklhUI--9aBEmhS3IFDiYG439JDFRvMIKkiqBZz52QzmV4czmOmw0aPjsBA/exec';
  var gbsec=document.getElementById('gbsec'),gbl=document.getElementById('gblist'),gbs=document.getElementById('gbsend'),gbst=document.getElementById('gbstat'),
      nmEl=document.getElementById('nm'),stEl=document.getElementById('st'),msEl=document.getElementById('ms'),hpEl=document.getElementById('web'),
      hint=document.getElementById('wahint'),sending=false;
  function ago(ts){var d=(Date.now()-ts)/1000;if(!ts||isNaN(d))return '';if(d<60)return 'baru saja';if(d<3600)return Math.floor(d/60)+' menit lalu';if(d<86400)return Math.floor(d/3600)+' jam lalu';return Math.floor(d/86400)+' hari lalu'}
  function card(it){
    var c=document.createElement('div'),b=document.createElement('b'),sm=document.createElement('small'),p=document.createElement('p');
    c.className='gc';b.textContent=it.n||'Tamu';
    sm.textContent=[it.s,ago(it.t)].filter(Boolean).join(' \u00b7 ');
    p.textContent=it.m||'';
    c.appendChild(b);c.appendChild(sm);c.appendChild(p);return c;
  }
  var PAGE=10,MAXN=100,allItems=[],shown=PAGE;
  function more(label,fn){var bt=document.createElement('button');bt.type='button';bt.className='btn o gmore';bt.textContent=label;bt.onclick=fn;gbl.appendChild(bt)}
  function draw(){
    gbl.textContent='';
    if(!allItems.length){var e=document.createElement('p');e.className='sub gb-empty';e.textContent='Belum ada ucapan. Jadilah yang pertama!';gbl.appendChild(e);return}
    allItems.slice(0,shown).forEach(function(it){gbl.appendChild(card(it))});
    var rest=allItems.length-shown;
    if(rest>0)more('Lihat lebih banyak ('+rest+' lagi)',function(){shown+=PAGE;draw()});
    else if(allItems.length>PAGE)more('Tampilkan lebih sedikit',function(){shown=PAGE;draw();gbsec.scrollIntoView({behavior:'smooth',block:'start'})});
  }
  function render(items){allItems=items.slice(0,MAXN);shown=PAGE;draw()}
  function load(){
    fetch(GB_URL+'?action=list').then(function(r){return r.json()}).then(function(j){render(j&&j.ok&&j.items?j.items:[])}).catch(function(){
      gbl.textContent='';var e=document.createElement('p');e.className='sub';e.textContent='Ucapan belum dapat dimuat. Silakan muat ulang halaman.';gbl.appendChild(e);
    });
  }
  function say(t){gbst.textContent=t}
  if(GB_URL){
    gbsec.hidden=false;gbs.hidden=false;hint.textContent='Atau kirim lewat WhatsApp:';load();
    gbs.onclick=function(){
      if(sending)return;
      var n=nmEl.value.trim(),m=msEl.value.trim(),st=stEl.value;
      if(!n){say('Mohon isi nama Anda terlebih dahulu.');nmEl.focus();return}
      var last=0;try{last=+localStorage.getItem('gb_last')||0}catch(e){}
      if(Date.now()-last<30000){say('Mohon tunggu sebentar sebelum mengirim lagi.');return}
      sending=true;gbs.textContent='Mengirim...';say('');
      fetch(GB_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({n:n,s:st,m:m,website:hpEl.value})})
        .then(function(r){return r.json()})
        .then(function(j){
          if(!j||!j.ok)throw new Error('fail');
          try{localStorage.setItem('gb_last',String(Date.now()))}catch(e){}
          say('Terima kasih, konfirmasi dan ucapan Anda sudah terkirim. ');
          if(m){var lk=document.createElement('a');lk.href='#gbsec';lk.textContent='Lihat ucapan';lk.style.cssText='color:var(--gold);font-weight:600';lk.onclick=function(ev){ev.preventDefault();gbsec.scrollIntoView({behavior:'smooth',block:'start'})};gbst.appendChild(lk)}
          if(m){allItems.unshift({n:n,s:st,m:m,t:Date.now()});allItems=allItems.slice(0,MAXN);draw()}
          msEl.value='';
        })
        .catch(function(){say('Maaf, gagal mengirim. Silakan coba lagi atau kirim lewat WhatsApp.')})
        .then(function(){sending=false;gbs.textContent='Kirim Konfirmasi & Ucapan'});
    };
  }
})();
