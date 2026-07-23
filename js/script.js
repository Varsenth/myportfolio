(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Opening animation (film leader) ----
  var preloader = document.getElementById('preloader');
  var plNum = document.getElementById('plNum');
  var htmlEl = document.documentElement;

  if(preloader){
    if(!reduced){
      var count = 3;
      plNum.textContent = count;
      var countTimer = setInterval(function(){
        count -= 1;
        if(count >= 1){ plNum.textContent = count; }
        else { clearInterval(countTimer); }
      }, 600);
    }

    var totalTime = reduced ? 1650 : 4350; // matches CSS timings + small buffer
    var doneAt = reduced ? 1600 : 3600;

    setTimeout(function(){
      preloader.classList.add('done');
      htmlEl.classList.remove('loading');
    }, doneAt);

    setTimeout(function(){
      preloader.remove();
      window.scrollTo(0,0);
      onScroll();
    }, totalTime);
  } else {
    htmlEl.classList.remove('loading');
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if(reduced){
    revealEls.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealEls.forEach(function(el){ io.observe(el); });
  }

  // Progress bars
  var bars = document.querySelectorAll('.bar-fill');
  var barIo = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.style.width = entry.target.dataset.pct + '%';
        barIo.unobserve(entry.target);
      }
    });
  }, {threshold:0.4});
  bars.forEach(function(b){ barIo.observe(b); });

  // Count up stats
  var counters = document.querySelectorAll('[data-count]');
  var countIo = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var el = entry.target;
        var target = parseFloat(el.dataset.count);
        var isDecimal = target % 1 !== 0;
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts){
          if(!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var val = start + (target - start) * progress;
          el.textContent = isDecimal ? val.toFixed(2) : Math.floor(val);
          if(progress < 1) requestAnimationFrame(step);
          else el.textContent = isDecimal ? target.toFixed(2) : target;
        }
        requestAnimationFrame(step);
        countIo.unobserve(el);
      }
    });
  }, {threshold:0.5});
  counters.forEach(function(c){ countIo.observe(c); });

  // Scrubber show/hide + fill + timecode
  var scrubber = document.getElementById('scrubber');
  var fill = document.getElementById('scrubberFill');
  var tc = document.getElementById('timecode');
  var tcSection = document.getElementById('tcSection');
  var sections = document.querySelectorAll('section[id]');

  function frameCode(n){
    n = Math.max(0, Math.min(29, n));
    return n < 10 ? '0'+n : ''+n;
  }

  function onScroll(){
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var scrollHeight = doc.scrollHeight - window.innerHeight;
    var progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if(scrollTop > window.innerHeight * 0.6){
      scrubber.classList.add('show');
    } else {
      scrubber.classList.remove('show');
    }
    fill.style.width = (progress*100) + '%';

    // fake timecode from scroll position
    var totalSeconds = progress * 240; // pretend 4-minute reel
    var mm = Math.floor(totalSeconds/60);
    var ss = Math.floor(totalSeconds%60);
    var ff = Math.floor((totalSeconds*30)%30);
    tc.childNodes[0].textContent = '00:' + (mm<10?'0'+mm:mm) + ':' + (ss<10?'0'+ss:ss) + ':' + frameCode(ff) + ' ';

    // current section label
    var current = 'INTRO';
    sections.forEach(function(sec){
      var rect = sec.getBoundingClientRect();
      if(rect.top < window.innerHeight*0.5 && rect.bottom > window.innerHeight*0.2){
        current = sec.id.toUpperCase();
      }
    });
    tcSection.textContent = '— ' + current;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
