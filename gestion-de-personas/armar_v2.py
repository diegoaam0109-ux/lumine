"""Word del informe v2: pandoc + portada, índice, estilos compactos, tablas y números de página."""
import sys, subprocess
import docx
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor
MD, OUT = sys.argv[1], sys.argv[2]
subprocess.run(['pandoc', MD, '-f', 'markdown', '-t', 'docx', '-o', OUT], check=True)
AZUL = RGBColor(0x14, 0x2B, 0x4C); GRIS = RGBColor(0x55, 0x5E, 0x6B); F = 'Calibri'
d = docx.Document(OUT); body = d.element.body
STY = {s.name: s for s in d.styles}
def fuente(nombre, size=None, bold=None, color=None, italic=None):
    st = STY[nombre]; st.font.name = F
    rpr = st.element.get_or_add_rPr(); rf = rpr.find(qn('w:rFonts'))
    if rf is None: rf = OxmlElement('w:rFonts'); rpr.append(rf)
    for k in list(rf.attrib): del rf.attrib[k]
    for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'): rf.set(qn(a), F)
    if size: st.font.size = Pt(size)
    if bold is not None: st.font.bold = bold
    if italic is not None: st.font.italic = italic
    if color is not None: st.font.color.rgb = color
for n in ('Normal', 'Body Text', 'First Paragraph', 'Compact'):
    if n in [s.name for s in d.styles]:
        fuente(n, 11, color=RGBColor(0x1A, 0x1A, 0x1A))
        pf = STY[n].paragraph_format; pf.space_after = Pt(6); pf.space_before = Pt(0); pf.line_spacing = 1.08
        pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
for n, t in (('Heading 1', 15), ('Heading 2', 12.5)):
    fuente(n, t, True, AZUL, False); pf = STY[n].paragraph_format
    pf.space_before = Pt(12 if n == 'Heading 1' else 8); pf.space_after = Pt(4); pf.keep_with_next = True
for p in d.paragraphs:
    t = p.text.strip()
    if t.startswith(('Tabla ', 'Figura ')) and p.runs and p.runs[0].italic:
        p.paragraph_format.space_after = Pt(3); p.paragraph_format.space_before = Pt(6); p.paragraph_format.keep_with_next = t.startswith('Tabla')
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs: r.font.size = Pt(9.5); r.font.color.rgb = GRIS
    if p.style.name == 'Heading 1' and t == 'Fuentes':
        p.paragraph_format.page_break_before = True
# Fuentes en letra menor
en_fuentes = False
for p in d.paragraphs:
    if p.style.name == 'Heading 1': en_fuentes = p.text.strip() == 'Fuentes'; continue
    if en_fuentes:
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT; p.paragraph_format.space_after = Pt(3)
        for r in p.runs: r.font.size = Pt(9.5)
# Tablas
ancho = Cm(16.5)
for t in d.tables:
    tblpr = t._tbl.tblPr
    for e in tblpr.findall(qn('w:tblW')): tblpr.remove(e)
    w = OxmlElement('w:tblW'); w.set(qn('w:w'), str(int(ancho.twips if hasattr(ancho,'twips') else 9355))); w.set(qn('w:type'), 'dxa'); tblpr.append(w)
    bord = OxmlElement('w:tblBorders')
    for lado in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{lado}'); e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), 'B8C0CC'); bord.append(e)
    for e in tblpr.findall(qn('w:tblBorders')): tblpr.remove(e)
    tblpr.append(bord)
    mar = OxmlElement('w:tblCellMar')
    for lado, v in (('top', 30), ('bottom', 30), ('left', 70), ('right', 70)):
        e = OxmlElement(f'w:{lado}'); e.set(qn('w:w'), str(v)); e.set(qn('w:type'), 'dxa'); mar.append(e)
    tblpr.append(mar)
    for i, row in enumerate(t.rows):
        trpr = row._tr.get_or_add_trPr(); cs = OxmlElement('w:cantSplit'); trpr.append(cs)
        if i == 0:
            th = OxmlElement('w:tblHeader'); trpr.append(th)
        for cell in row.cells:
            tcpr = cell._tc.get_or_add_tcPr()
            if i == 0:
                shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), '142B4C'); tcpr.append(shd)
            for p in cell.paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_after = Pt(0); p.paragraph_format.space_before = Pt(0); p.paragraph_format.line_spacing = 1.0
                for r in p.runs:
                    r.font.size = Pt(9); r.font.name = F
                    if i == 0: r.font.bold = True; r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
for sh in d.inline_shapes:
    ratio = sh.height / sh.width; sh.width = Cm(16); sh.height = int(Cm(16) * ratio)
for p in d.paragraphs:
    if p._p.findall('.//' + qn('w:drawing')): p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next = True
# Portada e índice
primero = body[0]
def antes(p): primero.addprevious(p._element); return p
def linea(texto='', tam=11, negrita=False, color=None, esp=0, centro=True):
    p = d.add_paragraph(); p.paragraph_format.space_after = Pt(esp)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if centro else WD_ALIGN_PARAGRAPH.LEFT
    if texto:
        r = p.add_run(texto); r.font.size = Pt(tam); r.font.bold = negrita
        if color: r.font.color.rgb = color
    return antes(p)
linea('UNIVERSIDAD ANDRÉS BELLO', 14, True, AZUL, 2)
linea('Facultad de Economía y Negocios · Ingeniería Comercial', 11, False, GRIS, 2)
linea('Gestión de Personas (Taller) · ICMA902 · Sección 601 · NRC 4121', 11, False, GRIS, 110)
linea('TRABAJO DE INVESTIGACIÓN GRUPAL · INFORME FINAL', 11, True, GRIS, 18)
linea('LUMINE MOTORS CHILE SpA', 26, True, AZUL, 10)
linea('Lumine Habilita: un sistema de gestión por competencias', 15, False, AZUL, 2)
linea('para formar, validar y retener al técnico instalador', 15, False, AZUL, 120)
linea('Integrantes', 11, True, GRIS, 2)
linea('Diego Alarcón · Benjamín Torres · Lukas Verdugo', 12, False, None, 16)
linea('Profesor', 11, True, GRIS, 2)
linea('Esteban Gómez Sotta', 12, False, None, 90)
p = linea('Santiago, noviembre de 2026', 11, False, GRIS, 0); p.add_run().add_break(WD_BREAK.PAGE)
linea('Índice', 15, True, AZUL, 10, centro=False)
p = antes(d.add_paragraph())
def fld(par, typ):
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), typ); r._r.append(f)
fld(p, 'begin'); r = p.add_run(); it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = 'TOC \\o "1-2" \\h \\z \\u'; r._r.append(it)
fld(p, 'separate'); p.add_run('Índice'); fld(p, 'end')
p.add_run().add_break(WD_BREAK.PAGE)
sec = d.sections[0]
sec.page_width, sec.page_height = Cm(21.59), Cm(27.94)
sec.left_margin = sec.right_margin = Cm(2.5); sec.top_margin = sec.bottom_margin = Cm(2.3)
sec.different_first_page_header_footer = True
hp = sec.header.paragraphs[0]; hp.text = 'Lumine Motors · Lumine Habilita · Gestión de Personas'; hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for r in hp.runs: r.font.size = Pt(8.5); r.font.color.rgb = GRIS
fp = sec.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
fld(fp, 'begin'); r = fp.add_run(); it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = 'PAGE'; r._r.append(it); fld(fp, 'end')
for r in fp.runs: r.font.size = Pt(9); r.font.color.rgb = GRIS
# Hipervínculos en azul
for h in body.iter(qn('w:hyperlink')):
    for r in h.iter(qn('w:r')):
        rpr = r.find(qn('w:rPr'))
        if rpr is None: rpr = OxmlElement('w:rPr'); r.insert(0, rpr)
        c = OxmlElement('w:color'); c.set(qn('w:val'), '1F5FA8'); rpr.append(c)
d.core_properties.title = 'Lumine Habilita: un sistema de gestión por competencias'
d.core_properties.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo'
d.save(OUT); print('ok')
