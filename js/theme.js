(function () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  var STORAGE_KEY = 'townhouse-theme';
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var theme = stored || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  function applyTheme(next, animate) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function swap() {
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    }
    if (animate && !reduce && document.startViewTransition) {
      document.startViewTransition(swap);
    } else {
      swap();
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light', true);
  }

  window.__townhouseTheme = { apply: applyTheme, toggle: toggleTheme };

  document.addEventListener('DOMContentLoaded', function () {
    var toggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  });
})();
