"""Rellena el resultado del campo TOC con los títulos y las páginas que da el PDF renderizado."""
import sys, subprocess, re
import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER
DOCX, PDF = sys.argv[1], sys.argv[2]
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', PDF], capture_output=True, text=True).stdout).group(1))
paginas = [subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', PDF, '-'], capture_output=True, text=True).stdout for i in range(1, n + 1)]
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
paginas = [norm(p) for p in paginas]
d = docx.Document(DOCX)
heads = [(p.style.name, p.text.strip()) for p in d.paragraphs if p.style.name in ('Heading 2', 'Heading 3') and p.text.strip() and p.text.strip() != 'Índice' and not p.text.startswith('Lumine forma')]
desde, entradas = 2, []
for est, txt in heads:
    for i in range(desde, n):
        if norm(txt)[:40] in paginas[i]:
            entradas.append((est, txt, i + 1)); desde = i; break
    else:
        print('NO ENCONTRADO', txt)
# Ubicar el párrafo del campo TOC y reemplazar su resultado
for p in d.paragraphs:
    if any('TOC' in (t.text or '') for t in p._p.iter(qn('w:instrText'))):
        campo = p; break
runs = list(campo._p.iter(qn('w:r')))
sep = [r for r in runs if r.find(qn('w:fldChar')) is not None and r.find(qn('w:fldChar')).get(qn('w:fldCharType')) == 'separate'][0]
end = [r for r in runs if r.find(qn('w:fldChar')) is not None and r.find(qn('w:fldChar')).get(qn('w:fldCharType')) == 'end'][0]
for r in runs[runs.index(sep) + 1:runs.index(end)]:
    r.getparent().remove(r)
# Los títulos van como párrafos propios entre separate y end: separar el campo en varios párrafos
end.getparent().remove(end)
ultimo = campo
for k, (est, txt, pag) in enumerate(entradas):
    q = d.add_paragraph()
    q.paragraph_format.tab_stops.add_tab_stop(Cm(16.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    q.paragraph_format.space_after = Pt(3 if est == 'Heading 3' else 4)
    q.paragraph_format.space_before = Pt(0 if est == 'Heading 3' else 6)
    if est == 'Heading 3': q.paragraph_format.left_indent = Cm(0.8)
    r = q.add_run(f'{txt}\t{pag}')
    r.font.size = Pt(10.5 if est == 'Heading 3' else 11); r.font.bold = est == 'Heading 2'
    ultimo._p.addnext(q._p); ultimo = q
r = ultimo.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'end'); r._r.append(f)
# Si ya se rellenó el índice, Word no necesita preguntar al abrir
for u in d.settings.element.findall(qn('w:updateFields')):
    d.settings.element.remove(u)
d.save(DOCX)
print(len(entradas), 'entradas'); [print(e) for e in entradas]
