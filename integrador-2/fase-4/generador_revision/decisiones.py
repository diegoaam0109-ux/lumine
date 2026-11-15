#!/usr/bin/env python3
"""Decisiones del equipo sobre la v6 (14-11-2026), aplicadas con fórmulas antes de dar formato.

1. El piloto y la transición quedan fuera de la evaluación financiera (acuerdo con el profesor guía): el flujo
   parte con la preapertura, cuando ya existe el reglamento. Selector en Datos!C24 (0 = fuera, 1 = dentro).
   Los costos de esas etapas se multiplican por el selector en el motor mensual; el escáner y las herramientas
   de alta tensión, que compraba el piloto, se compran en el primer mes de preapertura.
2. La comisión de medios de pago deja de ser un 2% supuesto: se pondera por los medios de cobro que declara
   la encuesta en el foco y la comisión publicada de tarjeta de crédito. Crédito bancario y contado se cobran
   por transferencia y no pagan comisión por venta (sin crédito propio ni comisión por convenio).

Uso: decisiones.py ENTRADA SALIDA
"""
import copy
import sys
import openpyxl
import openpyxl.utils

ENT, SAL = sys.argv[1:3]
w = openpyxl.load_workbook(ENT)
d = w['Datos']
m = w['Mensual']

SW = 'Datos!$C$24'


def estilo_como(dst, src):
    for a in ('font', 'fill', 'border', 'alignment', 'number_format', 'protection'):
        setattr(dst, a, copy.copy(getattr(src, a)))


def fila_dato(r, etiqueta, valor, unidad, estado, fuente, alcance=None, plantilla=6):
    for c in range(2, 8):
        estilo_como(d.cell(r, c), d.cell(plantilla, c))
    for c, v in zip(range(2, 8), (etiqueta, valor, unidad, estado, fuente, alcance)):
        d.cell(r, c).value = v


# ---------------------------------------------------------------- 1. Selector del piloto
assert d['B24'].value is None and d['B25'].value.startswith('Software'), 'Datos!B24 no está libre'
fila_dato(24, 'Piloto y transición dentro de la evaluación (1 = sí; 0 = no)', 0, 'selector',
          'Decisión del equipo (14-11-2026)',
          'Acuerdo con el profesor guía (14-11-2026): el flujo parte con la preapertura, cuando ya existe el reglamento. '
          'El piloto y la espera del reglamento se financiarían con un fondo público de I+D, sin afirmar que esté adjudicado.',
          'Con 1 se recupera la evaluación anterior (meses −17 a 0).')

EXCLUIDAS = ('Piloto', 'Transición')
cols_fuera = [c for c in range(4, m.max_column + 1) if m.cell(5, c).value in EXCLUIDAS]
primera_pre = next(c for c in range(4, m.max_column + 1) if m.cell(5, c).value == 'Preapertura')
assert cols_fuera and max(cols_fuera) < primera_pre

# Filas de costo con contenido propio (las de total se recalculan solas)
FILAS = [10, 85, 86, 87, 88, 89, 90, 91, 92, 93, 96, 97, 98, 99, 100, 101, 102, 105, 106, 107, 108, 109,
         112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 124, 130]
assert m['A124'].value.startswith('Equipos comprados para el piloto')
assert m['A122'].value.startswith('Desembolsos propios de las etapas previas')
originales_124 = []
n = 0
for r in FILAS:
    for c in cols_fuera:
        z = m.cell(r, c)
        v = z.value
        if v is None or v == 0:
            continue
        cuerpo = v[1:] if isinstance(v, str) and v.startswith('=') else repr(v)
        if r == 124:
            originales_124.append(cuerpo)
        z.value = f'=({cuerpo})*{SW}'
        n += 1
# El escáner y las herramientas pasan al primer mes de preapertura si el piloto queda fuera
if originales_124:
    z = m.cell(124, primera_pre)
    base = z.value[1:] if isinstance(z.value, str) and z.value.startswith('=') else repr(z.value or 0)
    z.value = f'={base}+(1-{SW})*(' + '+'.join(f'({o})' for o in originales_124) + ')'
m['A124'] = ('Escáner y herramientas de alta tensión (los compra el piloto; si el piloto queda fuera de la '
             'evaluación, se compran al iniciar la preapertura)')

# ---------------------------------------------------------------- 2. Medios de cobro
assert all(d.cell(r, 2).value is None for r in range(36, 41)), 'Datos!B36:B40 no está libre'
d['B36'] = 'Medios de cobro de la venta (decisión del equipo, 14-11-2026)'
estilo_como(d['B36'], d['B42'])
ENC = 'Encuesta del equipo, octubre de 2026, foco de aplicaciones y colectivos (95 casos), pregunta P32: '
fila_dato(37, 'Clientes que pagarían con tarjeta de crédito en cuotas', '=38/95', '%', 'Dato de la encuesta',
          ENC + '38 de 95 prefieren cuotas con tarjeta.',
          'Preferencia declarada, no cupo disponible ni aprobación.')
fila_dato(38, 'Clientes que pagarían con un crédito bancario propio', '=42/95', '%', 'Dato de la encuesta',
          ENC + '42 de 95. El cliente toma el crédito por su cuenta y Lumine recibe el total por transferencia.',
          'Lumine no da crédito propio ni paga comisión por convenio.')
fila_dato(39, 'Clientes que pagarían al contado (transferencia)', '=1-C37-C38', '%', 'Dato de la encuesta',
          ENC + '15 de 95.', 'Una transferencia recibida no paga comisión por venta.')
fila_dato(40, 'Comisión por venta con tarjeta de crédito, neta de IVA', 0.0219, '%', 'Tarifa publicada',
          'SumUp Chile, «comisiones vigentes en 2026»: crédito nacional 2,19% + IVA con ventas sobre $15 millones al mes. '
          'Contraste: Mercado Pago Chile publica 2,69% en crédito bajo $2 millones al mes y ofrece una comisión especial '
          'sobre $25 millones. Las cuotas son del emisor (el interés lo paga el cliente).',
          'El IVA de la comisión es crédito fiscal; no se suma al costo neto.')
assert d['A54'].value == 'medios'
d['C54'] = '=C37*C40+C38*0+C39*0'
d['E54'] = 'Cálculo'
d['F54'] = ('Promedio ponderado de los medios de cobro (filas 37 a 40): solo la venta con tarjeta de crédito paga '
            'comisión. Reemplaza el 2% supuesto de la versión anterior.')
d['G54'] = 'De 0% (todo por transferencia) a 2,19% (todo con tarjeta).'
d['B54'] = 'Comisión de medios de pago (promedio ponderado de los medios de cobro)'
m['A60'] = 'Medios de pago: comisión de las ventas con tarjeta de crédito'


# ---------------------------------------------------------------- 3. Tipos de cambio (fuente única de las hojas 1.1 y 1.2)
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
assert d['B14'].value is None and d['B15'].value is None
fila_dato(14, 'Tipo de cambio del dólar (dólar observado)', 984.49, 'pesos por dólar', 'Dato',
          'Dólar observado del 12-11-2026 publicado por el SII con datos del Banco Central de Chile.')
fila_dato(15, 'Tipo de cambio del euro', 1089.61, 'pesos por euro', 'Dato',
          'Banco Central de Chile, euro del 11-11-2026.')
for c in ('C14', 'C15'):
    d[c].number_format = '#,##0.00'

PESO = r'_ "$"* #,##0_ ;_ "$"* \-#,##0_ ;_ "$"* "-"_ ;_ @_ '
CEL, CLARO, GRIS, F = '12AAE9', 'EAF7FD', '595959', 'Arial'
TC = 'IF({m}="US$",Datos!$C$14,IF({m}="€",Datos!$C$15,1))'


def hoja(nombre, titulo, bajada, anchos):
    h = w.create_sheet(nombre)
    h.sheet_view.showGridLines = False
    h.sheet_properties.tabColor = CEL
    h['B1'] = titulo
    h['B1'].font = Font(name=F, size=16, bold=True, color=CEL)
    h['B2'] = bajada
    h['B2'].font = Font(name=F, size=10, italic=True, color=GRIS)
    h.column_dimensions['A'].width = 2
    for i, a in enumerate(anchos, start=2):
        h.column_dimensions[openpyxl.utils.get_column_letter(i)].width = a
    h.page_setup.orientation = 'landscape'
    h.page_setup.fitToWidth = 1
    h.page_setup.fitToHeight = 0
    h.sheet_properties.pageSetUpPr.fitToPage = True
    return h


def cab(h, r, textos, c0=2):
    for i, t in enumerate(textos):
        z = h.cell(r, c0 + i, t)
        z.font = Font(name=F, bold=True, color='FFFFFF')
        z.fill = PatternFill('solid', fgColor=CEL)
        z.alignment = Alignment(horizontal='left' if i == 0 else 'center', vertical='center', wrap_text=True)
    h.row_dimensions[r].height = 34


def celda(h, r, c, v, fmt=None, bold=False, wrap=False, italic=False, color='000000', fill=None):
    z = h.cell(r, c, v)
    z.font = Font(name=F, bold=bold, italic=italic, color=color)
    if fmt:
        z.number_format = fmt
    z.alignment = Alignment(vertical='center', wrap_text=wrap)
    if fill:
        z.fill = PatternFill('solid', fgColor=fill)
    return z


# ---------------------------------------------------------------- 4. Respaldo de la inversión en equipos
h = hoja('1.1 Respaldo inversión', '1.1 Respaldo de la inversión en equipos: proveedor, precio y método',
         'Precio del eslabón más cercano al fabricante que publica precio. Pesos netos de IVA. Fondo celeste: dato publicado editable.',
         [30, 34, 34, 13, 8, 7, 11, 9, 15, 16, 16, 15, 70])
cab(h, 4, ['Ítem', 'Especificación', 'Proveedor (eslabón de la cadena)', 'Precio publicado', 'Moneda', 'Cant.',
           'Tipo de cambio', 'Arancel', 'Internación (pesos)', 'Valor neto (pesos)', 'Valor anterior', 'Diferencia',
           'Fuente, método y mes de consulta'])
EQ = [
    ('e_din', 'Dinamómetro de chasis', 'Dynocom 2WD 5000 Series (rodillos para tracción delantera, freno de corrientes de Foucault)',
     'Dynocom Industries, fabricante (EE.UU.)', 29995, 'US$', 1, 0, '=750*Datos!$C$14',
     'Precio de lista publicado por el fabricante en dynocom.net (consultado el 14-11-2026). Arancel 0% por el TLC Chile–EE.UU. '
     'con certificado de origen. Internación: cargos locales promedio de US$750 por embarque (Cargo Partner, tarifa LCL 2026). '
     'Flete marítimo desde EE.UU.: por confirmar, no incluido.'),
    ('e_esc', 'Escáner automotriz', 'Launch X431 PRO V 5.0 (diagnóstico bidireccional, CAN FD y DoIP)',
     'Proveedor en China por Alibaba, tramo de 1 a 9 unidades', 679, 'US$', 1, 0, 0,
     'Precio publicado en Alibaba (consultado el 14-11-2026). Reemplaza al precio al público de una tienda minorista '
     '($1.429.000). Arancel 0% por el TLC Chile–China. Envío courier: por confirmar.'),
    ('e_ele', 'Elevador, por puesto', 'JAK 2 columnas, paso superior, 4,2 toneladas',
     'Importadora JAK, importador directo en Chile', 2390000, 'CLP', 1, 0, 0,
     'Precio normal publicado, más IVA (página actualizada el 11-10-2026, consultada el 14-11-2026). La oferta de $2.150.000 no '
     'informa vigencia, por eso se usa el precio normal.'),
    ('e_her', 'Herramientas de alta tensión, por puesto', 'Juego aislado Wiha 91890 de 26 piezas a 1.000 V y multímetro de aislamiento Fluke 1587 FC',
     'Tiendas oficiales de Wiha y de Fluke (fabricantes)', '=693.31+1080.55', 'US$', 1, 0, 0,
     'Precios regulares de wihatools.com (US$693,31) y shop.fluke.com (US$1.080,55), consultados el 14-11-2026. Los guantes '
     'dieléctricos y la protección personal ya están en «Curso externo de alta tensión y elementos de protección» (Datos), por '
     'eso no se suman. Arancel 0% por TLC con certificado de origen; envío por confirmar.'),
    ('e_bod', 'Bodega de baterías clase 9', 'Dos armarios certificados para baterías de litio (90 minutos de resistencia al fuego) y autorización sanitaria',
     'asecos (fabricante), vendido por DENIOS, su distribuidor', 8560, 'US$', 2, 0, 177300,
     'Armario asecos ION-STORE-90: US$8.560 sin impuestos, envío incluido (DENIOS, consultado el 14-11-2026). Las baterías '
     'de litio son clase 9 y su bodega requiere autorización sanitaria de la SEREMI de Salud (D.S. N° 43): se suma el arancel '
     'máximo para hasta 3 bodegas, $177.300 (ChileAtiende). La capacidad de dos armarios frente al inventario de kits está por confirmar.'),
    ('e_hab', 'Habilitación del local', 'Piso epóxico del taller (360 m²), instalación eléctrica e iluminación (400 m²) y oficina con atención de clientes (40 m²)',
     'Guías de precios publicadas por plataformas de cotización', '=360*25000+400*9000+40*350000', 'CLP', 1, 0, 0,
     'Suma por partida con precios por m² publicados (consultados el 14-11-2026): piso de resina epóxica $25.000/m², precio medio en '
     'Santiago (Cronoshare); instalación eléctrica e iluminación $9.000/m², tope del rango de $4.000 a $9.000 (Jobbing); habilitación '
     'estándar de oficina $350.000/m², piso del rango de $350.000 a $650.000 (Jobbing). El local se arrienda ya construido.'),
    ('e_mob', 'Mobiliario y computadores', 'Cinco notebooks ThinkPad E14 Gen 7 (un puesto por cargo de oficina al abrir) y mobiliario',
     'Lenovo Agencia en Chile, fabricante (computadores); mobiliario sin proveedor identificado', '=5*1799990/1.19+4000000', 'CLP', 1, 0, 0,
     'Computadores: precio normal de $1.799.990 con IVA publicado directamente por Lenovo (consultado el 14-11-2026), cinco '
     'puestos (gerencia, administración, comercial, Responsable Técnico e Ingeniería de Calibración). Mobiliario: $4.000.000, '
     'supuesto del equipo por confirmar (el valor que antes cubría todo el ítem).'),
]
fila_d = {r: d.cell(r, 1).value for r in range(42, 160)}
fila_clave = {v: k for k, v in fila_d.items() if v}
r = 5
for clave, item, esp, prov, precio, mon, cant, ara, intern, nota_ in EQ:
    rd = fila_clave[clave]
    anterior = d.cell(rd, 3).value
    celda(h, r, 2, item, wrap=True)
    celda(h, r, 3, esp, wrap=True)
    celda(h, r, 4, prov, wrap=True)
    celda(h, r, 5, precio, '#,##0.00' if mon != 'CLP' else PESO, fill=CLARO)
    celda(h, r, 6, mon)
    celda(h, r, 7, cant, '0')
    celda(h, r, 8, '=' + TC.format(m=f'F{r}'), '#,##0.00')
    celda(h, r, 9, ara, '0%')
    celda(h, r, 10, intern, PESO)
    celda(h, r, 11, f'=E{r}*G{r}*H{r}*(1+I{r})+J{r}', PESO, bold=True)
    celda(h, r, 12, anterior, PESO, color=GRIS)
    celda(h, r, 13, f'=K{r}-L{r}', PESO)
    celda(h, r, 14, nota_, wrap=True)
    h.row_dimensions[r].height = 92
    d.cell(rd, 3).value = f"='1.1 Respaldo inversión'!K{r}"
    d.cell(rd, 3).fill = PatternFill(fill_type=None)
    d.cell(rd, 5).value = {'e_hab': 'Guía de precios publicada',
                           'e_mob': 'Precio publicado (computadores) y supuesto (muebles)'}.get(
        clave, 'Precio publicado' if 'Supuesto' not in nota_[:9] else 'Supuesto del equipo')
    d.cell(rd, 7).value = None   # el rango de trabajo anterior queda reemplazado por el respaldo de la hoja 1.1
    d.cell(rd, 6).value = ('Respaldo en la hoja 1.1 (proveedor, precio, tipo de cambio y mes). La vida útil aplicada está en '
                           'las filas 165 a 171 de esta hoja.')
    r += 1
# Notas de vida útil (Datos, filas 165 a 171): la clase de la tabla del SII y dónde está el valor de compra
for rv in range(160, 180):
    txt = d.cell(rv, 6).value
    if isinstance(txt, str) and d.cell(rv, 3).value is not None and '. ' in txt and \
            any(t in txt for t in ('Supuesto del equipo', 'Precio publicado', 'Valor de referencia')):
        clase = txt.split('. ')[0]
        d.cell(rv, 6).value = f'Tabla de vida útil del SII: {clase}. Valor de compra y fuente en la hoja 1.1.'
        d.cell(rv, 8).value = 'Dato publicado (tabla del SII); la clase asignada a cada bien es criterio del equipo.'
celda(h, r, 2, 'Inversión inicial en equipos (un puesto)', bold=True)
for c, f in [(11, f'=SUM(K5:K{r-1})'), (12, f'=SUM(L5:L{r-1})'), (13, f'=SUM(M5:M{r-1})')]:
    celda(h, r, c, f, PESO, bold=True, fill=CLARO)
r += 2
celda(h, r, 2, 'Método: se busca primero al fabricante; si no publica precio, al importador o distribuidor; las tiendas '
               'minoristas y los avisos de Mercado Libre se descartan. Los precios en moneda extranjera se convierten con el tipo '
               'de cambio de Datos (filas 14 y 15). El IVA es crédito fiscal y no se suma.', italic=True, color=GRIS, wrap=True)
h.merge_cells(start_row=r, start_column=2, end_row=r, end_column=14)
h.row_dimensions[r].height = 36
h.freeze_panes = 'C5'

# ---------------------------------------------------------------- 5. Costo del kit pieza por pieza
k = hoja('1.2 Costo del kit', '1.2 Costo directo del kit, pieza por pieza (Esencial y Plus)',
         'Kit de la Fase 3: dos motores en las ruedas traseras y batería de litio-titanato de 31 celdas (71,3 V; 2,14 kWh). '
         'Pesos netos de IVA.', [16, 30, 34, 36, 8, 8, 12, 8, 12, 8, 15, 15, 70])
cab(k, 4, ['Bloque', 'Componente', 'Especificación', 'Proveedor (eslabón de la cadena)', 'Moneda', 'Cant. Esencial',
           'Precio unitario Esencial', 'Cant. Plus', 'Precio unitario Plus', 'Arancel', 'Subtotal Esencial (pesos)',
           'Subtotal Plus (pesos)', 'Fuente, método y mes de consulta'])
P = [
    ('Tren motriz', 'Motor en la rueda trasera', 'QS273 V3, 72 V: 4.000 W (Esencial) y 6.000 W (Plus)', 'QS Motor, fabricante (China)',
     'US$', 2, 514.54, 2, 583.77, 0, 'Precio oficial en cnqsmotor.com (consultado el 14-11-2026). Arancel 0% por el TLC Chile–China.'),
    ('Tren motriz', 'Controlador del motor', 'Fardriver ND72680, 72 V, para motores de 4 a 6 kW, con regeneración',
     'QS Motor, distribuidor oficial de Fardriver', 'US$', 2, 328.70, 2, 328.70, 0,
     'Precio oficial de lista en cnqsmotor.com; la oferta vigente es de US$285,97 y no se usa. QS lo vende junto a su motor de 4.000 W. '
     'Consultado el 14-11-2026.'),
    ('Batería', 'Celda de litio-titanato 2,3 V y 30 Ah', 'Yinlong 66160H; 31 en serie = 71,3 V y 2,14 kWh',
     'Gobel Power, distribuidor de fábrica', 'US$', 31, 14, 31, 14, 0, 'Precio publicado por celda (2026), el mismo de la Fase 3.'),
    ('Batería', 'Sistema de gestión de la batería (BMS)', 'ANT de 10 a 32 series, 200 A, apto para LTO',
     'Vendedor comercial (eBay)', 'US$', 1, 149.28, 1, 149.28, 0,
     'Precio publicado (consultado el 14-11-2026). El fabricante no publica precio; es el único dato encontrado para 31 series.'),
    ('Batería', 'Contactor principal 200 A', 'Tipo Albright SW200', 'EV Drives, distribuidor (EE.UU.)',
     'US$', 1, 110, 1, 110, 0.06, 'Precio publicado (septiembre de 2026). Arancel general de 6% por prudencia.'),
    ('Control', 'Unidad de control (hardware)', 'Macchina M2 Under-the-Hood, 2 CAN', 'Macchina, fabricante (EE.UU.)',
     'US$', 1, 99, 1, 99, 0.06, 'Precio publicado por el fabricante (septiembre de 2026). El software es desarrollo propio.'),
    ('Control', 'Sensor de presión de freno', 'Transductor 0,5–4,5 V con sello para líquido de frenos', 'DATAQ, fabricante (EE.UU.)',
     'US$', 1, 68, 1, 68, 0.06, 'Precio publicado por el fabricante (septiembre de 2026).'),
    ('Mecánica', 'Brida motor–mangueta y soporte de pinza (par)', 'Mecanizado CNC en aluminio 6061 T6',
     'Referencia: WSP Separadores de Rueda (€104 el par con IVA)', '€', 2, 85.9504, 2, 85.9504, 0,
     'Estimación por pieza de complejidad equivalente (septiembre de 2026); por confirmar con un taller de mecanizado.'),
    ('Mecánica', 'Pinza de freno trasera', 'Pinza de repuesto sobre el disco del motor', 'eBay Chile, tramos publicados',
     'CLP', 2, 52800, 2, 52800, 0, 'Punto medio del rango publicado de $33.600 a $72.000 (septiembre de 2026).'),
    ('Mecánica', 'Cable de potencia 35 mm² (metro)', 'H01N2-D flexible', 'Vitel Energía, distribuidor en Chile',
     'CLP', 5, 10094.96, 5, 10094.96, 0, 'Precio publicado $12.013 con IVA por metro (septiembre de 2026).'),
    ('Mecánica', 'Fusible ANL con portafusible', 'ANL con portafusible', 'Soliot, comercio en Chile',
     'CLP', 1, 11756.30, 1, 11756.30, 0, 'Precio publicado $13.990 con IVA (septiembre de 2026).'),
    ('Mecánica', 'Cortacorriente de batería 300 A', 'Desconectador manual de emergencia', 'Ferretools, comercio en Chile',
     'CLP', 1, 24690, 1, 24690, 0, 'Precio publicado $24.690 más IVA (septiembre de 2026).'),
    ('Mecánica', 'Caja metálica de la batería', 'Mecanizado, misma referencia que la brida', 'Referencia: WSP Separadores de Rueda',
     '€', 1, 85.9504, 1, 85.9504, 0, 'Estimación por pieza equivalente (septiembre de 2026); por confirmar.'),
    ('Mecánica', 'Consumibles de conexión', 'Terminales de cobre, termocontraíble y arnés', 'Sin precio unitario publicado',
     'CLP', 1, 20000, 1, 20000, 0, 'Supuesto del equipo: cerca del 1% del costo del kit.'),
    ('Logística', 'Flete marítimo LCL China–San Antonio', '0,19 m³ por kit (cajas de 43 × 43 × 43 cm de los motores)',
     'Cargo Partner, transitario', 'US$', 1, 19.95, 1, 19.95, 0,
     'Tarifa publicada de US$80 a 130 por W/M (2026); se usa US$105 × 0,19 m³.'),
    ('Logística', 'Cargos locales por embarque, prorrateados en 20 kits', 'Desconsolidación, agente de aduana y transporte',
     'Cargo Partner, transitario', 'US$', 1, 37.5, 1, 37.5, 0, 'Tarifa publicada de US$600 a 900 por embarque (2026); US$750 / 20 kits.'),
    ('Logística', 'Recargos de carga peligrosa clase 9, prorrateados', 'Baterías de litio: manejo, documentos y recargo',
     'Great Hensen, transitario', 'US$', 1, 20.75, 1, 20.75, 0, 'Tarifa publicada de US$230 a 600 por embarque (julio de 2026); US$415 / 20 kits.'),
    ('Logística', 'Courier de los ítems de EE.UU.', 'Contactor, unidad de control y sensor', 'Sin tarifa publicada',
     'US$', 1, 45, 1, 45, 0, 'Supuesto del equipo.'),
    ('Puesta en regla', 'Alineación después de la instalación', 'Taller externo', 'Neumax, servicio en Chile',
     'CLP', 1, 19998, 1, 19998, 0, 'Precio publicado (septiembre de 2026).'),
    ('Puesta en regla', 'Revisión técnica después de la instalación', 'Planta de revisión, Región Metropolitana',
     'Autofact con datos de las plantas', 'CLP', 1, 16250, 1, 16250, 0, 'Valor promedio publicado (enero de 2026).'),
]
r = 5
for blo, comp, esp, prov, mon, ce, pe, cp, pp, ara, nota_ in P:
    for c, v in [(2, blo), (3, comp), (4, esp), (5, prov)]:
        celda(k, r, c, v, wrap=True)
    celda(k, r, 6, mon)
    fmt = '#,##0.00' if mon != 'CLP' else PESO
    celda(k, r, 7, ce, '0', fill=CLARO)
    celda(k, r, 8, pe, fmt, fill=CLARO)
    celda(k, r, 9, cp, '0', fill=CLARO)
    celda(k, r, 10, pp, fmt, fill=CLARO)
    celda(k, r, 11, ara, '0%')
    tc = TC.format(m=f'F{r}')
    celda(k, r, 12, f'=G{r}*H{r}*{tc}*(1+K{r})', PESO)
    celda(k, r, 13, f'=I{r}*J{r}*{tc}*(1+K{r})', PESO)
    celda(k, r, 14, nota_, wrap=True)
    k.row_dimensions[r].height = 48
    r += 1
tot = r
celda(k, r, 3, 'Costo directo por kit', bold=True)
for c, col in [(12, 'L'), (13, 'M')]:
    celda(k, r, c, f'=SUM({col}5:{col}{r-1})', PESO, bold=True, fill=CLARO)
r += 1
celda(k, r, 3, 'Valor usado antes (Fase 3, dólar $981,58)', color=GRIS)
celda(k, r, 12, 3031028, PESO, color=GRIS)
celda(k, r, 13, 3396013, PESO, color=GRIS)
r += 1
celda(k, r, 3, 'Diferencia')
celda(k, r, 12, f'=L{tot}-L{tot+1}', PESO)
celda(k, r, 13, f'=M{tot}-M{tot+1}', PESO)
r += 1
celda(k, r, 3, 'Costo de la mezcla de ventas (participación de Plus en Datos)')
celda(k, r, 12, f'=(1-Datos!$C$48)*L{tot}+Datos!$C$48*M{tot}', PESO, bold=True)
r += 1
celda(k, r, 3, 'Parte que se paga en moneda extranjera (efecto de cada $10 de dólar)')
celda(k, r, 12, f'=SUMPRODUCT((F5:F{tot-1}="US$")*G5:G{tot-1}*H5:H{tot-1}*(1+K5:K{tot-1}))*10', PESO)
celda(k, r, 13, f'=SUMPRODUCT((F5:F{tot-1}="US$")*I5:I{tot-1}*J5:J{tot-1}*(1+K5:K{tot-1}))*10', PESO)
r += 2
celda(k, r, 2, 'Método: cada pieza se cotiza en el eslabón más cercano al fabricante que publica precio. Las piezas sin precio '
               'publicado quedan como supuesto o estimación y lo dicen en su fila. No incluye la mano de obra del dúo (va en '
               'remuneraciones) ni la garantía (Datos, 3% del costo del kit).', italic=True, color=GRIS, wrap=True)
k.merge_cells(start_row=r, start_column=2, end_row=r, end_column=14)
k.row_dimensions[r].height = 36
r += 2
celda(k, r, 2, 'Imagen ilustrativa del kit (conceptual): el kit real lleva un motor en cada rueda trasera.', italic=True, color=GRIS)
KIT_IMG_FILA = r + 1
k.freeze_panes = 'D5'
assert d['A50'].value == 'k_es' and d['A51'].value == 'k_pl'
for rd, col in [(50, 'L'), (51, 'M')]:
    d.cell(rd, 3).value = f"='1.2 Costo del kit'!{col}{tot}"
    d.cell(rd, 3).fill = PatternFill(fill_type=None)
    d.cell(rd, 5).value = 'Precios publicados por pieza'
    d.cell(rd, 6).value = 'Pieza por pieza en la hoja 1.2 (fabricantes y distribuidores, noviembre de 2026).'


# ---------------------------------------------------------------- 6. Columna «Método» en Datos
def metodo(tipo, fuente):
    t = (tipo or '').lower()
    if 'cálculo' in t or 'calculo' in t:
        return 'Cálculo con otras celdas del libro.'
    if 'encuesta' in t:
        return 'Dato de la encuesta del equipo (octubre de 2026); preferencia declarada, no compra observada.'
    if 'publicad' in t or t.startswith('dato'):
        return 'Dato publicado: fuente y fecha en la columna F.'
    if 'decisión' in t or 'decision' in t:
        return 'Decisión del equipo; la fecha va en la columna E (si no la indica, octubre de 2026).'
    if 'estimación' in t or 'estimacion' in t:
        return 'Estimación del equipo con datos publicados (columna F); por confirmar con cotización.'
    if 'supuesto' in t or 'referencia' in t or 'observación' in t:
        return 'Supuesto del equipo, sin cotización ni medición (octubre de 2026); la columna G da el rango de prueba.'
    if 'selector' in t:
        return 'Selector del Tablero.'
    return 'Dato publicado: fuente y fecha en la columna F.' if fuente else None


d.column_dimensions['H'].width = 46
for rr in (5, 41):
    estilo_como(d.cell(rr, 8), d.cell(rr, 7))
    d.cell(rr, 8).value = 'Método'
for rr in list(range(6, 41)) + list(range(43, 172)):
    if d.cell(rr, 2).value is None or d.cell(rr, 3).value is None:
        continue
    m_ = metodo(d.cell(rr, 5).value, d.cell(rr, 6).value)
    if m_:
        estilo_como(d.cell(rr, 8), d.cell(rr, 6))
        d.cell(rr, 8).value = m_

# ---------------------------------------------------------------- Notas
nt = w['Notas y cambios']
for row in nt.iter_rows():
    for z in row:
        if isinstance(z.value, str) and z.value.startswith('Financiamiento por terceros; no cartera propia.'):
            z.value = ('Financiamiento por terceros; no cartera propia. 30% al agendar y saldo al instalar. Desde el '
                       '14-11-2026 la comisión de medios de pago se pondera por la encuesta (40,0% tarjeta de crédito, '
                       '44,2% crédito bancario del cliente y 15,8% contado) con la tarifa publicada de 2,19% + IVA para '
                       'tarjeta de crédito: 0,88% de la venta neta. El crédito bancario y el contado llegan por '
                       'transferencia y no pagan comisión.')
assert nt['B61'].value is None and nt['B62'].value is None and nt['B63'].value.startswith('Conciliación')
estilo_como(nt['B61'], nt['B57'])
estilo_como(nt['B62'], nt['B58'])
nt['B61'] = 'Decisiones del 14-11-2026 (reunión con el profesor guía)'
nt['B62'] = ('1) El piloto y la transición quedan fuera de la evaluación: el flujo parte con la preapertura, cuando ya existe '
             'el reglamento (Datos!C24 = 0; con 1 se recupera el cálculo anterior). El escáner y las herramientas que '
             'compraba el piloto se compran al iniciar la preapertura. 2) La comisión de medios de pago pasa de 2% supuesto '
             'a 0,88% ponderado por la encuesta y la tarifa publicada (Datos, filas 37 a 40). 3) Los equipos se respaldan con el '
             'precio del fabricante, importador o distribuidor (hoja 1.1) y el costo del kit se arma pieza por pieza (hoja 1.2), '
             'con el dólar y el euro de Datos (filas 14 y 15).')
nt.merge_cells('B62:H62')
nt.row_dimensions[62].height = 92
for r, alto in {24: 46, 37: 32, 38: 32, 39: 32, 40: 62, 54: 32}.items():
    d.row_dimensions[r].height = alto
    for c in (6, 7):
        al = copy.copy(d.cell(r, c).alignment)
        al.wrap_text = True
        al.vertical = 'center'
        d.cell(r, c).alignment = al
w.save(SAL)
print(f'Decisiones aplicadas: {n} celdas del piloto y la transición con selector; medios de pago ponderados.')
