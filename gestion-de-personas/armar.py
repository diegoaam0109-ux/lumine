"""Arma el Word final del informe de Habilita: portada UNAB, índice, encabezado, pie con número de página y estilos."""
import copy, sys
import docx
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

SRC, OUT = sys.argv[1], sys.argv[2]
AZUL = RGBColor(0x14, 0x2B, 0x4C)
GRIS = RGBColor(0x55, 0x5E, 0x6B)
FUENTE = 'Calibri'

d = docx.Document(SRC)
body = d.element.body

# 1. Fuera el título y la línea de fecha del documento en línea: van en la portada
for p in d.paragraphs[:2]:
    p._element.getparent().remove(p._element)

# 2. Estilos
def fuente(style, size=None, bold=None, color=None):
    st = d.styles[style]
    st.font.name = FUENTE
    rpr = st.element.get_or_add_rPr()
    rf = rpr.find(qn('w:rFonts'))
    if rf is None:
        rf = OxmlElement('w:rFonts'); rpr.append(rf)
    for a in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'):
        rf.set(qn(a), FUENTE)
    if size: st.font.size = Pt(size)
    if bold is not None: st.font.bold = bold
    if color: st.font.color.rgb = color

fuente('Normal', 11)
d.styles['Normal'].paragraph_format.space_after = Pt(6)
d.styles['Normal'].paragraph_format.line_spacing = 1.15
for nombre, tam in (('Heading 1', 18), ('Heading 2', 15), ('Heading 3', 12.5), ('Heading 4', 11.5), ('Heading 5', 11)):
    fuente(nombre, tam, True, AZUL)
    pf = d.styles[nombre].paragraph_format
    pf.space_before = Pt(14 if nombre == 'Heading 2' else 10)
    pf.space_after = Pt(6)
    pf.keep_with_next = True
fuente('List Paragraph', 11)

# Cada sección principal (Heading 2) empieza en página nueva
for p in d.paragraphs:
    if p.style.name == 'Heading 2':
        p.paragraph_format.page_break_before = True

# Tablas: letra 9,5, encabezado azul con texto blanco, celdas con margen
for t in d.tables:
    for i, row in enumerate(t.rows):
        for cell in row.cells:
            tcpr = cell._tc.get_or_add_tcPr()
            if i == 0:
                shd = tcpr.find(qn('w:shd'))
                if shd is None:
                    shd = OxmlElement('w:shd'); tcpr.append(shd)
                shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), '142B4C')
            for p in cell.paragraphs:
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.0
                for r in p.runs:
                    r.font.size = Pt(9.5)
                    if i == 0:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    tblpr = t._tbl.tblPr
    mar = OxmlElement('w:tblCellMar')
    for lado in ('top', 'bottom'):
        e = OxmlElement(f'w:{lado}'); e.set(qn('w:w'), '50'); e.set(qn('w:type'), 'dxa'); mar.append(e)
    for lado in ('left', 'right'):
        e = OxmlElement(f'w:{lado}'); e.set(qn('w:w'), '90'); e.set(qn('w:type'), 'dxa'); mar.append(e)
    tblpr.append(mar)

# Imágenes: ancho completo de la caja de texto
for shape in d.inline_shapes:
    ratio = shape.height / shape.width
    shape.width = Cm(16)
    shape.height = int(Cm(16) * ratio)

# 3. Portada e índice, antes del primer párrafo
primero = body[0]
def antes(p):
    primero.addprevious(p._element)
    return p

def linea(texto='', tam=11, negrita=False, color=None, espacio=0, centro=True, italica=False):
    p = d.add_paragraph()
    if centro: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(espacio)
    if texto:
        r = p.add_run(texto)
        r.font.size = Pt(tam); r.font.bold = negrita; r.font.italic = italica
        if color: r.font.color.rgb = color
    return antes(p)

linea('UNIVERSIDAD ANDRÉS BELLO', 14, True, AZUL, 2)
linea('Facultad de Economía y Negocios · Ingeniería Comercial', 11, False, GRIS, 2)
linea('Gestión de Personas', 11, False, GRIS, 110)
linea('TRABAJO DE INVESTIGACIÓN GRUPAL · INFORME FINAL', 11, True, GRIS, 18)
linea('LUMINE MOTORS CHILE SpA', 26, True, AZUL, 10)
linea('Lumine Habilita: un sistema de gestión por competencias', 15, False, AZUL, 2)
linea('para formar, validar y retener al técnico instalador', 15, False, AZUL, 120)
linea('Integrantes', 11, True, GRIS, 2)
linea('Diego Alarcón · Benjamín Torres · Lukas Verdugo', 12, False, None, 16)
linea('Profesor', 11, True, GRIS, 2)
linea('Esteban Gómez Sotta', 12, False, None, 90)
p = linea('Santiago, noviembre de 2026', 11, False, GRIS, 0)
p.add_run().add_break(WD_BREAK.PAGE)

idx = linea('Índice', 18, True, AZUL, 12, centro=False)
# Campo de tabla de contenido (Word lo completa al abrir)
p = antes(d.add_paragraph())
def campo(par, instr):
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'begin'); r._r.append(f)
    r = par.add_run(); t = OxmlElement('w:instrText'); t.set(qn('xml:space'), 'preserve'); t.text = instr; r._r.append(t)
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'separate'); r._r.append(f)
    r = par.add_run('Abra el archivo en Word y acepte actualizar los campos para ver el índice.'); r.font.color.rgb = GRIS
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'end'); r._r.append(f)
campo(p, 'TOC \\o "2-3" \\h \\z \\u')

# Word actualiza los campos al abrir
st = d.settings.element
u = OxmlElement('w:updateFields'); u.set(qn('w:val'), 'true'); st.append(u)

# 4. Página, encabezado y pie
sec = d.sections[0]
sec.page_width, sec.page_height = Cm(21.59), Cm(27.94)
for lado in ('left_margin', 'right_margin'): setattr(sec, lado, Cm(2.5))
sec.top_margin = sec.bottom_margin = Cm(2.5)
sec.different_first_page_header_footer = True
hp = sec.header.paragraphs[0]
hp.text = 'Lumine Motors · Lumine Habilita · Gestión de Personas'
hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for r in hp.runs: r.font.size = Pt(8.5); r.font.color.rgb = GRIS
fp = sec.footer.paragraphs[0]
fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = fp.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'begin'); r._r.append(f)
r = fp.add_run(); t = OxmlElement('w:instrText'); t.set(qn('xml:space'), 'preserve'); t.text = 'PAGE'; r._r.append(t)
r = fp.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'end'); r._r.append(f)
for r in fp.runs: r.font.size = Pt(9); r.font.color.rgb = GRIS

d.core_properties.title = 'Lumine Habilita: informe para Gestión de Personas'
d.core_properties.author = 'Diego Alarcón, Benjamín Torres y Lukas Verdugo'
d.save(OUT)
print('ok', OUT)
