/*
 * Client-side parts of the Get payment docs page that the server-rendered HTML leaves empty
 * (header content, breadcrumb, navigation tree, right "Try it" panel, follow button, response tabs).
 * No network requests are made. Tree data is injected at build time (__TREE__).
 */
(function () {
  'use strict';
  var TREE = __TREE__;
  var CURRENT = 'get-payment';
  var ASSET = '/apidocs/assets/';
  var DOCS = 'https://docs.xendit.co';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function scope(el) {
    if (!el) return null;
    for (var i = 0; i < el.attributes.length; i++) if (el.attributes[i].name.indexOf('_ngcontent') === 0) return el.attributes[i].name;
    return null;
  }
  /** create element; `sc` is the Angular scope attribute so component-scoped styles still apply */
  function h(tag, cls, attrs, kids, sc) {
    var e = document.createElement(tag);
    if (sc) e.setAttribute(sc, '');
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function icon(cls) { return h('i', cls, { 'aria-hidden': 'true' }); }

  /* ---------- header ---------- */
  function buildHeader() {
    var primary = $('.primary-nav-bar-container');
    var sc = scope(primary);
    if (!primary) return;
    primary.innerHTML = '';
    primary.appendChild(
      h('div', 'nav-bar primary-nav-bar', null, [
        h('div', 'nav-bar-brand', null, [h('a', null, { href: DOCS + '/', 'aria-label': 'Xendit docs home' }, [h('img', null, { src: ASSET + 'logo_dark.png', alt: 'Xendit' }, null, sc)], sc)], sc),
        h('div', 'nav-bar-left', null, [], sc),
        h('div', 'nav-bar-right', null, [
          h('div', 'nav-bar-nav', null, [
            h('ul', null, null, [
              h('li', null, null, [h('a', 'btn btn-secondary xd-doc-btn', { href: 'https://xendit-docs.document360.io/docs/overview' }, [h('span', null, null, ['Documentation'], sc)], sc)], sc),
              h('li', null, null, [h('a', 'xd-login', { href: DOCS + '/login?returnTo=%2Fapidocs%2F' + CURRENT, 'aria-disabled': 'true' }, [h('span', null, null, ['Login'], sc)], sc)], sc),
            ], sc),
          ], sc),
        ], sc),
      ], sc)
    );
    var li = $('.breadcrumb-nav .secondaryUL li');
    if (li) {
      var bsc = scope($('.breadcrumb-nav ul'));
      var ul = $('.breadcrumb-nav .secondaryUL');
      ul.innerHTML = '';
      [['API Documentation', '/apidocs'], ['Payments', null], ['Payment', null]].forEach(function (c, i, a) {
        var last = i === a.length - 1;
        ul.appendChild(h('li', last ? 'no-arrow min-w-0' : 'min-w-0', null, [
          last ? h('span', 'xd-crumb current', null, [c[0]], bsc) : h('a', 'xd-crumb', { href: DOCS + (c[1] || '/apidocs') }, [c[0]], bsc),
          last ? null : icon('fa-regular fa-angle-right xd-sep'),
        ], bsc));
      });
    }
  }

  /* ---------- navigation tree ---------- */
  function buildTree() {
    var host = $('site-category-list-tree-view');
    if (!host) return;
    var expanded = {};
    function findPath(nodes, path) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.s === CURRENT) return path.concat([n]);
        var r = n.c && findPath(n.c, path.concat([n]));
        if (r) return r;
      }
      return null;
    }
    (findPath(TREE, []) || []).forEach(function (n) { expanded[n.id] = true; });
    TREE.forEach(function (n) { expanded[n.id] = true; }); // top-level groups start open

    var wrap = h('div', 'xd-tree');
    var vs = h('div', 'virtual-scroll');
    var vp = h('div', 'virtual-scroll-container', { role: 'tree' });
    vs.appendChild(vp);
    wrap.appendChild(vs);
    host.innerHTML = '';
    host.appendChild(wrap);

    function row(n, level) {
      var isGroup = level === 0 && n.c && n.c.length;
      var hasKids = n.c && n.c.length;
      var active = n.s === CURRENT;
      var r = h('div', 'node tree-wrapper' + (active ? ' active' : '') + (isGroup ? ' xd-root' : ''), { role: 'treeitem', 'data-id': n.id });
      for (var i = 0; i < level; i++) r.appendChild(h('div', 'filler'));
      if (hasKids) {
        var arrow = h('div', 'tree-arrow', { role: 'button', tabindex: '0', 'aria-expanded': String(!!expanded[n.id]), 'aria-label': (expanded[n.id] ? 'Collapse ' : 'Expand ') + n.t + ' section' },
          [icon(expanded[n.id] ? 'fa-solid fa-angle-down' : 'fa-solid fa-angle-right')]);
        arrow.addEventListener('click', function () { expanded[n.id] = !expanded[n.id]; render(); });
        arrow.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); arrow.click(); } });
        r.appendChild(arrow);
      } else {
        r.appendChild(h('div', 'tree-active-circle', null, [icon('fa-solid fa-circle')]));
      }
      if (n.m) r.appendChild(h('div', 'method-type method-' + n.m, null, [n.m]));
      if (n.s) r.appendChild(h('a', 'data-title', { href: n.s === CURRENT ? '#' : DOCS + '/apidocs/' + n.s, 'aria-current': active ? 'page' : null }, [n.t]));
      else {
        var t = h('a', 'data-title', { href: '#', role: 'button' }, [n.t]);
        t.addEventListener('click', function (e) { e.preventDefault(); if (hasKids) { expanded[n.id] = !expanded[n.id]; render(); } });
        r.appendChild(t);
      }
      if (isGroup) r.appendChild(h('div', 'xd-dots', { 'aria-hidden': 'true' }, [icon('fa-sharp fa-solid fa-ellipsis')]));
      return r;
    }
    var query = '';
    function filterNodes(nodes, q) {
      var out = [];
      nodes.forEach(function (n) {
        var kids = n.c ? filterNodes(n.c, q) : [];
        if (kids.length || n.t.toLowerCase().indexOf(q) >= 0) out.push(Object.assign({}, n, { c: kids.length ? kids : undefined }));
      });
      return out;
    }
    function walk(nodes, level) {
      nodes.forEach(function (n) {
        vp.appendChild(row(n, level));
        if (n.c && n.c.length && (query || expanded[n.id])) walk(n.c, level + 1);
      });
    }
    window.__xdFilter = function (q) { query = (q || '').trim().toLowerCase(); vp.scrollTop = 0; render(); };
    function render() {
      var top = vp.scrollTop;
      vp.innerHTML = '';
      walk(query ? filterNodes(TREE, query) : TREE, 0);
      vp.scrollTop = top;
      if (typeof syncSb === 'function' && track) syncSb();
    }
    var track = h('div', 'xd-sb', { 'aria-hidden': 'true' }, [h('div', 'xd-sb-thumb')]);
    vs.appendChild(track);
    var thumb = track.firstChild;
    function syncSb() {
      var ch = vp.clientHeight, sh = vp.scrollHeight;
      track.style.display = sh > ch + 1 ? '' : 'none';
      var th = Math.max(32, ch * ch / sh);
      thumb.style.height = th + 'px';
      thumb.style.transform = 'translateY(' + (vp.scrollTop / (sh - ch || 1)) * (ch - th) + 'px)';
    }
    vp.addEventListener('scroll', syncSb);
    window.addEventListener('resize', syncSb);
    render();
    // scroll so the first page-level entry ("Webhook behavior") sits at the top, as on the live page
    var focus = $('.tree-wrapper[data-id="' + (window.__XD_SCROLL_TO || '') + '"]', vp);
    var target = $$('.tree-wrapper', vp).filter(function (r) { var d = $('.data-title', r); return d && d.textContent === 'Webhook behavior'; })[0];
    if (target) vp.scrollTop = target.offsetTop - vp.offsetTop;
    syncSb();
  }

  /* ---------- article follow button ---------- */
  function buildFollow() {
    var more = $('.article-info-bottom .article-more-options');
    if (!more) return;
    var sc = scope(more);
    var btn = h('button', 'btn btn-secondary xd-follow', { type: 'button' }, [icon('fa-regular fa-bell-plus'), h('span', null, null, ['FOLLOW'], sc)], sc);
    more.parentNode.insertBefore(h('div', 'article-follow', null, [btn], sc), more);
  }

  /* ---------- response tabs (200 / 400 / 404 / 500) ---------- */
  function buildResponseTabs() {
    var body = $('.api-response-body > .api-content');
    if (!body) return;
    var blocks = $$(':scope > .api-response', body);
    if (blocks.length < 2) return;
    var bar = h('div', 'xd-resp-tabs', { role: 'tablist' });
    blocks.forEach(function (b, i) {
      var head = $('.api-status', b);
      var code = $('.api-code', b).textContent.trim();
      var tab = h('button', 'xd-resp-tab ' + (head.className.match(/api-status-[a-z-]+/) || [''])[0], { type: 'button', role: 'tab', 'aria-selected': String(i === 0) }, [h('span', 'dot'), code]);
      tab.addEventListener('click', function () { select(i); });
      bar.appendChild(tab);
    });
    body.insertBefore(bar, body.firstChild);
    blocks.forEach(function (b) {
      var c = $('.api-content', b);
      if (!c) return;
      var ex = h('button', 'xd-close-example', { type: 'button' }, ['Close example']);
      ex.addEventListener('click', function () {
        var closed = c.classList.toggle('xd-example-closed');
        ex.textContent = closed ? 'Open example' : 'Close example';
      });
      c.insertBefore(ex, c.firstChild);
    });
    function select(i) {
      blocks.forEach(function (b, j) { b.classList.toggle('xd-hidden', j !== i); });
      $$('.xd-resp-tab', bar).forEach(function (t, j) { t.setAttribute('aria-selected', String(j === i)); });
    }
    blocks.forEach(function (b) { var hd = $('.api-status', b); if (hd) hd.classList.add('xd-hidden'); });
    select(0);
  }

  /* ---------- right panel: Try it / Code samples ---------- */
  function buildTryIt() {
    var host = $('.right-panel-content');
    if (!host) return;
    host.innerHTML = '';
    var tabs = h('ul', 'nav nav-tabs xd-tabs', { role: 'tablist' }, [
      h('li', 'nav-item', null, [h('button', 'nav-link active', { type: 'button', role: 'tab', 'data-tab': 'try', 'aria-selected': 'true' }, [icon('fa-solid fa-rocket-launch'), 'TRY IT'])]),
      h('li', 'nav-item', null, [h('button', 'nav-link', { type: 'button', role: 'tab', 'data-tab': 'code', 'aria-selected': 'false' }, [icon('fa-regular fa-message-code'), 'CODE SAMPLES'])]),
    ]);

    function field(label, required, control, extra) {
      return h('div', 'xd-field' + (extra ? ' ' + extra : ''), null, [h('label', null, null, [label, required ? h('span', 'req' + (label === 'payment_id' ? ' req-sm' : ''), null, ['*']) : null]), control]);
    }
    var user = h('input', 'form-control xd-invalid', { type: 'text', placeholder: 'username', autocomplete: 'off', 'aria-label': 'Username' });
    var pass = h('input', 'form-control xd-pass', { type: 'password', value: '', placeholder: '••••••••', autocomplete: 'off', 'aria-label': 'Password' });
    var url = h('input', 'form-control xd-readonly', { type: 'text', value: 'https://api.xendit.co', readonly: 'readonly', 'aria-label': 'URL' });
    var pid = h('input', 'form-control', { type: 'text', placeholder: 'string', autocomplete: 'off', 'aria-label': 'payment_id' });
    var ver = h('select', 'form-select', { 'aria-label': 'api-version' }, [h('option', null, { value: '2024-11-11' }, ['2024-11-11'])]);
    var send = h('button', 'btn btn-primary xd-send', { type: 'button', id: 'tryit-btn', disabled: 'disabled' }, ['Try it & see response']);
    var note = h('div', 'xd-note', { role: 'status', hidden: 'hidden' }, ['Requests are not sent from this copy of the page.']);

    function accordion(id, title, bodyEls, open) {
      var item = h('div', 'accordion-item' + (open ? '' : ' xd-collapsed'), { 'data-acc': id });
      var btn = h('button', 'accordion-button' + (open ? '' : ' collapsed'), { type: 'button', 'aria-expanded': String(open) }, [title]);
      var coll = h('div', 'accordion-collapse collapse' + (open ? ' show' : ''), null, [h('div', 'accordion-body', null, bodyEls)]);
      btn.addEventListener('click', function () {
        var o = coll.classList.toggle('show');
        btn.classList.toggle('collapsed', !o); btn.setAttribute('aria-expanded', String(o)); item.classList.toggle('xd-collapsed', !o);
      });
      item.appendChild(h('h2', 'accordion-header', null, [btn]));
      item.appendChild(coll);
      return item;
    }
    var tryPane = h('div', 'xd-pane', { 'data-pane': 'try' }, [
      h('div', 'accordion', null, [
        accordion('auth', 'Authentication', [field('Username', true, user), field('Password', false, pass)], true),
        accordion('request', 'Request', [field('URL', false, url), field('payment_id', true, pid), field('api-version', false, ver), send, note], true),
        accordion('response', 'Response', [h('div', 'xd-resp-empty', null, ['Send a request to see the response.'])], false),
      ]),
    ]);
    var curl = "curl --request GET \\\n  --url 'https://api.xendit.co/v3/payments/{payment_id}' \\\n  --header 'api-version: 2024-11-11' \\\n  --user '{username}:{password}'";
    var codePane = h('div', 'xd-pane', { 'data-pane': 'code', hidden: 'hidden' }, [
      h('div', 'xd-code-label', null, ['cURL']), h('pre', 'xd-code', null, [h('code', null, null, [curl])]),
    ]);
    host.appendChild(tabs); host.appendChild(tryPane); host.appendChild(codePane);

    $$('.nav-link', tabs).forEach(function (b) {
      b.addEventListener('click', function () {
        var which = b.getAttribute('data-tab');
        $$('.nav-link', tabs).forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-selected', String(on)); });
        tryPane.hidden = which !== 'try'; codePane.hidden = which !== 'code';
      });
    });
    function sync() { var ok = user.value.trim() && pid.value.trim(); send.disabled = !ok; user.classList.toggle('xd-invalid', !user.value.trim()); }
    user.addEventListener('input', sync); pid.addEventListener('input', sync);
    send.addEventListener('click', function () {
      note.hidden = false;
      var resp = $('[data-acc="response"]');
      $('.accordion-collapse', resp).classList.add('show'); $('.accordion-button', resp).classList.remove('collapsed'); resp.classList.remove('xd-collapsed');
    });
  }

  /* ---------- misc ---------- */
  function wireBanner() {
    var close = $('.smart-bar-close');
    if (close) close.addEventListener('click', function () { var b = close.closest('.info-bar'); if (b) b.parentNode.removeChild(b); });
  }
  function wireCollapse() {
    var btn = $('.expand-collapse-btn'); var panel = $('.left-container');
    if (!btn || !panel) return;
    var host = $('site-docs-left-panel-container');
    btn.addEventListener('click', function () {
      var c = panel.classList.toggle('left-container-collapsed');
      if (host) host.classList.toggle('xd-collapsed', c);
      btn.setAttribute('aria-expanded', String(!c));
    });
  }
  function wireFilter() {
    var input = $('.filter-input'); var clear = $('.btn-clear-filter');
    if (!input) return;
    function apply() { if (window.__xdFilter) window.__xdFilter(input.value); }
    input.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', function () { input.value = ''; apply(); input.focus(); });
  }

  function init() { buildHeader(); buildTree(); buildFollow(); buildResponseTabs(); buildTryIt(); wireBanner(); wireCollapse(); wireFilter(); document.documentElement.classList.add('xd-ready'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
