import json, base64, io, string
from fontTools import subset

SP = '/tmp/claude-0/-home-user-jaff7787dev/5afc4c96-5917-56fb-8d14-3316acbf7ce4/scratchpad'
REPO = '/home/user/jaff7787dev'

vocab = json.load(open(f'{SP}/vocab.json'))
vocab_js = 'const VOCAB=' + json.dumps(vocab, ensure_ascii=False, separators=(',', ':')) + ';'

tpl = open(f'{SP}/app_template.html').read()

# character set: everything in template + vocab + ascii
chars = set(tpl) | set(vocab_js) | set(string.printable)
chars |= set('★☆·%')
text = ''.join(sorted(c for c in chars if ord(c) >= 32))
print('unique chars:', len(text))

def subset_font(path):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.hinting = False
    opts.desubroutinize = True
    font = subset.load_font(path, opts)
    ss = subset.Subsetter(options=opts)
    ss.populate(text=text)
    ss.subset(font)
    buf = io.BytesIO()
    font.save(buf)
    data = buf.getvalue()
    print(path.split('/')[-1], '->', len(data)//1024, 'KB woff2')
    return base64.b64encode(data).decode()

reg = subset_font(f'{REPO}/Pretendard-Regular.otf')
xb = subset_font(f'{REPO}/Pretendard-ExtraBold.otf')

html = tpl.replace('__FONT_REGULAR__', reg).replace('__FONT_XBOLD__', xb)

# repo version: external vocab.js
open(f'{REPO}/vocab.js', 'w').write(vocab_js)
repo_html = html.replace('__VOCAB_SCRIPT__', '<script src="vocab.js"></script>').replace('__PWA__', '<link rel="manifest" href="manifest.json">\n<link rel="icon" href="icon.svg" type="image/svg+xml">')
open(f'{REPO}/index.html', 'w').write(repo_html)

# artifact version: inline vocab
art_html = html.replace('__VOCAB_SCRIPT__', '<script>' + vocab_js + '</script>').replace('__PWA__', '')
open(f'{SP}/voca-quest.html', 'w').write(art_html)

import os
print('index.html', os.path.getsize(f'{REPO}/index.html')//1024, 'KB')
print('vocab.js', os.path.getsize(f'{REPO}/vocab.js')//1024, 'KB')
print('artifact', os.path.getsize(f'{SP}/voca-quest.html')//1024, 'KB')
