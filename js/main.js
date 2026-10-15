(function () {
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Mobile menu ---------------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Nav shadow on scroll ---------------- */
  var nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -10',
    end: 99999,
    toggleClass: { targets: nav, className: 'is-scrolled' }
  });

  /* ---------------- Reveal-up animations ---------------- */
  gsap.utils.toArray('.reveal-up').forEach(function (el) {
    if (reduceMotion) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
    });
  });

  /* ---------------- Stat count-up ---------------- */
  gsap.utils.toArray('.stat-num').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target, duration: 1.4, ease: 'power2.out',
          onUpdate: function () { el.textContent = Math.round(obj.val); }
        });
      }
    });
  });

  /* ---------------- Ticker marquee (GSAP tween) ---------------- */
  (function () {
    var wrap = document.getElementById('ticker');
    var track = document.getElementById('ticker-track');
    if (!wrap || !track) return;
    var tween;
    function build() {
      if (tween) tween.kill();
      gsap.set(track, { xPercent: 0 });
      var distance = track.scrollWidth / 2;
      var duration = distance / 60;
      tween = gsap.to(track, { xPercent: -50, duration: duration, ease: 'none', repeat: -1 });
    }
    if (!reduceMotion) {
      build();
      wrap.addEventListener('mouseenter', function () { tween && gsap.to(tween, { timeScale: 0.25, duration: 0.4 }); });
      wrap.addEventListener('mouseleave', function () { tween && gsap.to(tween, { timeScale: 1, duration: 0.4 }); });
      window.addEventListener('resize', build);
    }
  })();

  /* ---------------- Reader board: flip-letter marquee sign ---------------- */
  (function () {
    var row0 = document.getElementById('board-row-0');
    var row1 = document.getElementById('board-row-1');
    if (!row0 || !row1) return;

    var COLS = 16;
    var phrases = [
      ['HOME-STYLE', 'COOKING'],
      ['OPEN 7 DAYS', 'A WEEK'],
      ['SERVING OVIEDO', 'SINCE THE 50S'],
      ['BREAKFAST LUNCH', '& DINNER DAILY']
    ];

    function buildRow(rowEl) {
      rowEl.innerHTML = '';
      for (var i = 0; i < COLS; i++) {
        var tile = document.createElement('span');
        tile.className = 'board-tile space';
        var inner = document.createElement('span');
        inner.className = 'board-tile-inner';
        inner.textContent = '';
        tile.appendChild(inner);
        rowEl.appendChild(tile);
      }
    }
    buildRow(row0);
    buildRow(row1);

    var board = document.getElementById('reader-board');
    var rowsEl = document.getElementById('board-rows');
    function sizeBoard() {
      var gap = 4;
      var available = rowsEl.clientWidth;
      if (!available) return;
      var tileW = Math.max(12, Math.floor((available - (COLS - 1) * gap) / COLS));
      board.style.setProperty('--tile-w', tileW + 'px');
      board.style.setProperty('--tile-font', Math.max(8, Math.round(tileW * 0.5)) + 'px');
    }
    sizeBoard();
    window.addEventListener('resize', sizeBoard);

    function setRowInstant(rowEl, text) {
      var chars = text.toUpperCase().padEnd(COLS, ' ').slice(0, COLS).split('');
      var tiles = rowEl.children;
      chars.forEach(function (ch, i) {
        var tile = tiles[i];
        var inner = tile.querySelector('.board-tile-inner');
        inner.textContent = ch === ' ' ? '' : ch;
        tile.classList.toggle('space', ch === ' ');
      });
    }

    function setRowAnimated(rowEl, text) {
      var chars = text.toUpperCase().padEnd(COLS, ' ').slice(0, COLS).split('');
      var tiles = rowEl.children;
      chars.forEach(function (ch, i) {
        var tile = tiles[i];
        var inner = tile.querySelector('.board-tile-inner');
        var current = inner.textContent || ' ';
        if (current === (ch === ' ' ? ' ' : ch)) return;
        gsap.timeline({ delay: i * 0.025 })
          .to(inner, { rotateX: -90, duration: 0.16, ease: 'power1.in' })
          .add(function () {
            inner.textContent = ch === ' ' ? '' : ch;
            tile.classList.toggle('space', ch === ' ');
            gsap.set(inner, { rotateX: 90 });
          })
          .to(inner, { rotateX: 0, duration: 0.22, ease: 'power1.out' });
      });
    }

    setRowInstant(row0, phrases[0][0]);
    setRowInstant(row1, phrases[0][1]);

    if (reduceMotion) return;

    var idx = 0;
    var paused = false;
    board.addEventListener('mouseenter', function () { paused = true; });
    board.addEventListener('mouseleave', function () { paused = false; });

    setInterval(function () {
      if (paused) return;
      idx = (idx + 1) % phrases.length;
      setRowAnimated(row0, phrases[idx][0]);
      setRowAnimated(row1, phrases[idx][1]);
    }, 3400);
  })();

  /* ---------------- The Rail: scroll-scrubbed timeline ---------------- */
  (function () {
    var wrap = document.querySelector('.rail-wrap');
    var fill = document.getElementById('rail-fill');
    var tickets = gsap.utils.toArray('.rail-ticket');
    if (!wrap || !fill || !tickets.length) return;

    if (reduceMotion) {
      gsap.set(fill, { height: '100%' });
      tickets.forEach(function (t) { t.classList.add('is-lit'); });
      return;
    }

    ScrollTrigger.create({
      trigger: wrap,
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 0.6,
      onUpdate: function (self) {
        gsap.set(fill, { height: (self.progress * 100) + '%' });
        var wrapHeight = wrap.offsetHeight;
        tickets.forEach(function (t) {
          var threshold = t.offsetTop / wrapHeight;
          t.classList.toggle('is-lit', self.progress >= threshold - 0.04);
        });
      }
    });
  })();

  /* ---------------- Open/closed status ---------------- */
  (function () {
    var el = document.getElementById('open-status');
    if (!el) return;
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours() + now.getMinutes() / 60;
    var openHour = day === 0 ? 7 : 6;
    var isOpen = hour >= openHour && hour < 21;
    el.textContent = isOpen ? 'Open Now' : 'Closed Now';
    el.style.color = isOpen ? 'var(--primary)' : 'var(--accent)';
  })();

  /* ---------------- Call-ahead seating form ---------------- */
  (function () {
    var form = document.getElementById('seating-form');
    if (!form) return;
    var success = document.getElementById('form-success');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var wrap = field.closest('.form-field');
        var filled = field.value && field.value.trim().length > 0;
        wrap.classList.toggle('invalid', !filled);
        if (!filled) valid = false;
      });
      if (!valid) return;
      form.classList.add('submitted');
      success.classList.add('show');
      form.reset();
    });

    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () {
        field.closest('.form-field').classList.remove('invalid');
      });
    });
  })();

  /* ---------------- Refresh ScrollTrigger once layout settles ---------------- */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
