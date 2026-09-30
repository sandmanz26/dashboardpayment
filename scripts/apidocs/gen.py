#!/usr/bin/env python3
"""
Build public/apidocs/overlay.{js,css} for the standalone Get payment docs page.

Inputs (kept outside the repo): state.json  - the server-rendered transfer state of the source page
                                 component-styles.json - component styles extracted from the public site bundles
Usage: gen.py <input_dir>
"""
import json, re, shutil, sys, os
IN = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public', 'apidocs')
os.makedirs(OUT + '/assets', exist_ok=True)

st = json.load(open(f'{IN}/state.json'))
root = st['ARTICLE_BODY_TRANSFER_KEY']['result']['categories']
METHODS = {'Get': 'GET', 'Post': 'POST', 'Put': 'PUT', 'Delete': 'DELETE', 'Patch': 'PATCH'}

def conv(n):
    if n.get('isHidden'): return None
    kids = [k for k in (conv(c) for c in (n.get('children') or [])) if k]
    o = {'id': n['id'], 't': n['title']}
    if n.get('slug'): o['s'] = n['slug']
    m = METHODS.get(n.get('operationType')) if n.get('articleType') == 1 else None
    if m: o['m'] = m
    if kids: o['c'] = kids
    return o
tree = [k for k in (conv(c) for c in root['children']) if k]

js = open(f'{HERE}/overlay.src.js').read().replace('__TREE__', json.dumps(tree, separators=(',', ':')))
open(f'{OUT}/overlay.js', 'w').write(js)

# component styles -> plain css. [_ngcontent] is dropped, [_nghost] becomes a class we put on our own host element
blocks = {(f, p): c for f, p, c in json.load(open(f'{IN}/component-styles.json'))}
def plain(css, host):
    css = css.replace('[_ngcontent-%COMP%]', '').replace('[_nghost-%COMP%]', host)
    return css
parts = [
    '/* --- navigation tree (component styles from the source site) --- */',
    plain(blocks[('chunk-XJBCGPQ3.js', 1119720)], '.xd-tree'),
    '/* --- try-it accordion / tabs --- */',
    plain(blocks[('chunk-ECX5KNEU.js', 530561)], ''),
]
glue = open(f'{HERE}/overlay.src.css').read()
open(f'{OUT}/overlay.css', 'w').write('\n'.join(parts) + '\n/* --- glue --- */\n' + glue)

# logo
shutil.copy(f'{IN}/logo.png', f'{OUT}/assets/logo_dark.png')

# wire overlay into the page (idempotent)
p = f'{OUT}/get-payment.html'
h = open(p, encoding='utf8').read()
if 'data-bs-theme=' not in h.split('>',1)[0] and '<html' in h:
    h = h.replace('<html ', '<html data-bs-theme="light" ', 1)
if 'name="robots"' not in h:
    h = h.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>', 1)
if 'overlay.css' not in h:
    h = h.replace('</head>', '<link rel="stylesheet" href="/apidocs/overlay.css"></head>', 1)
if 'overlay.js' not in h:
    h = h.replace('</body>', '<script src="/apidocs/overlay.js"></script></body>', 1)
open(p, 'w', encoding='utf8').write(h)
print('tree roots:', len(tree), '| overlay.js', len(js), '| overlay.css', os.path.getsize(f'{OUT}/overlay.css'))
