"""Rellena el índice del informe v2 con los títulos y las páginas del PDF renderizado."""
import sys, subprocess, re
import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER, WD_BREAK
DOCX, PDF = sys.argv[1], sys.argv[2]
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', PDF], capture_output=True, text=True).stdout).group(1))
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
pag = [norm(subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), PDF, '-'], capture_output=True, text=True).stdout) for i in range(1, n + 1)]
d = docx.Document(DOCX)
heads = [(p.style.name, p.text.strip()) for p in d.paragraphs if p.style.name in ('Heading 1', 'Heading 2')]
desde, ent = 2, []
for est, txt in heads:
    for i in range(desde, n):
        if norm(txt) in pag[i]:
            ent.append((est, txt, i + 1)); desde = i; break
    else: print('NO', txt)
campo = next(p for p in d.paragraphs if any('TOC' in (t.text or '') for t in p._p.iter(qn('w:instrText'))))
runs = list(campo._p.iter(qn('w:r')))
tipo = lambda r: (r.find(qn('w:fldChar')).get(qn('w:fldCharType')) if r.find(qn('w:fldChar')) is not None else None)
sep = next(r for r in runs if tipo(r) == 'separate'); end = next(r for r in runs if tipo(r) == 'end')
for r in runs[runs.index(sep) + 1:]: r.getparent().remove(r)
ultimo = campo
for est, txt, p_ in ent:
    q = d.add_paragraph()
    q.paragraph_format.tab_stops.add_tab_stop(Cm(16.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    q.paragraph_format.space_after = Pt(3); q.paragraph_format.space_before = Pt(6 if est == 'Heading 1' else 0)
    if est == 'Heading 2': q.paragraph_format.left_indent = Cm(0.8)
    r = q.add_run(f'{txt}\t{p_}'); r.font.size = Pt(11 if est == 'Heading 1' else 10.5); r.font.bold = est == 'Heading 1'
    ultimo._p.addnext(q._p); ultimo = q
r = ultimo.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'end'); r._r.append(f)
ultimo.add_run().add_break(WD_BREAK.PAGE)
d.save(DOCX); print(len(ent), 'entradas'); [print(e) for e in ent]
