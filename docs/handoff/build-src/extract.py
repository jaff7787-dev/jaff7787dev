import fitz, json, re

doc = fitz.open('/root/.claude/uploads/5afc4c96-5917-56fb-8d14-3316acbf7ce4/eb5c8e8f-_____2027_______________________.pdf')

days = {}
for page in doc:
    text = page.get_text().replace("\x01", " ")
    m = re.search(r'Day\s*(\d+)\s*정답', text)
    if not m:
        continue
    day = int(m.group(1))
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    # expected number sequence: 1,26,2,27,...,25,50
    seq = []
    for i in range(1, 26):
        seq.append(i); seq.append(i + 25)
    entries = {}
    idx = 0          # position in seq
    cur_no = None
    cur_word = None
    cur_meaning = []
    started = False
    for li, l in enumerate(lines):
        if not started:
            if re.match(r'^meaning$', l):
                # last 'meaning' header before rows; keep scanning until second one passes
                pass
            if l == '1':
                started = True
            else:
                continue
        if idx < len(seq) and l == str(seq[idx]):
            # flush previous
            if cur_no is not None:
                entries[cur_no] = (cur_word, ' '.join(cur_meaning))
            cur_no = seq[idx]
            cur_word = None
            cur_meaning = []
            idx += 1
            continue
        if cur_no is not None:
            if cur_word is None:
                cur_word = l
            else:
                cur_meaning.append(l)
    if cur_no is not None:
        entries[cur_no] = (cur_word, ' '.join(cur_meaning))
    days[day] = entries

# report
bad = []
for d in sorted(days):
    if len(days[d]) != 50:
        bad.append((d, len(days[d])))
print('days:', len(days), 'incomplete:', bad)
# sample
for no in [1, 25, 26, 50]:
    print(no, days[1].get(no))
print('day48:', days[max(days)].get(1), days[max(days)].get(50))
json.dump(days, open('/tmp/claude-0/-home-user-jaff7787dev/5afc4c96-5917-56fb-8d14-3316acbf7ce4/scratchpad/raw.json','w'), ensure_ascii=False)
