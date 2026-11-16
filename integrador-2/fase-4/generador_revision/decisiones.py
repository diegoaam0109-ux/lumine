#!/usr/bin/env python3
"""Decisiones del equipo sobre la v6 (14-11-2026), aplicadas con fórmulas antes de dar formato.

1. El piloto y la transición quedan fuera de la evaluación financiera (decisión del equipo): el flujo
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
import re
import openpyxl
from openpyxl.utils import get_column_letter
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
          'Se evalúa la decisión de abrir el taller una vez publicada la norma. El piloto es un proyecto experimental que no '
          'puede vender (D.S. N° 67 de 2020), se financiaría con un fondo público de I+D no reembolsable y, al momento de '
          'decidir la apertura, sería un costo ya incurrido. Con 1 se suma al flujo: el VAN puro sigue positivo.',
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

# ---------------------------------------------------------------- 1b. Capital de trabajo por déficit acumulado máximo
assert d['B23'].value is None and d['C23'].value is None, 'Datos!B23 no está libre'
fila_dato(23, 'Capital de trabajo por déficit acumulado máximo (1 = sí; 0 = saldo de inventario)', 1, 'selector',
          'Decisión del equipo (15-11-2026)',
          'Método del déficit acumulado máximo (Sapag, 2014): al abrir se invierte el stock comprado antes de la apertura más el '
          'mayor déficit operativo acumulado; desde el año 2 se suma el aumento del saldo de inventario, tránsito e IVA por '
          'crecimiento. Todo se recupera al cierre del año 5.',
          'Con 0 se recupera el método del saldo de inventario.')
ct = w['Capital de trabajo']
assert ct['C13'].value == '=C12' and ct['D13'].value == '=D12-C12' and ct['H17'].value == '=H12*Datos!$C$34'
ct['B13'] = 'Inversión en capital de trabajo (déficit al abrir y aumentos por crecimiento)'
ct['C13'] = '=C12+Datos!$C$23*C20'
ct['D13'] = '=(D12-C12)*(1-Datos!$C$23)'
ct['B17'] = 'Recuperación final (todo lo invertido en capital de trabajo)'
ct['H17'] = '=IF(Datos!$C$23=1,SUM(C13:H13),H12)*Datos!$C$34'
for h in ('Flujo puro', 'Flujo inversionista'):
    assert w[h]['C55'].value == "=-'Capital de trabajo'!C12"
    w[h]['C55'] = "=-'Capital de trabajo'!C13"
co = w['Controles']
assert co['C7'].value == "='Flujo puro'!C64+Calendario!U15" and co['C12'].value.startswith("='Flujo puro'!H57-")
co['C7'] = "='Flujo puro'!C64+Calendario!U15+Datos!$C$23*'Capital de trabajo'!C20"
co['C12'] = "='Flujo puro'!H57-'Capital de trabajo'!H17"
assert co['C22'].value == "=SUM('Capital de trabajo'!C10:H10)"
co['B22'] = 'Anticipos de clientes al cierre (informativo: la sensibilidad de precio los mantiene fijos)'
co['C22'] = '=0'
co['D22'] = "=SUM('Capital de trabajo'!C10:H10)"
for rr, h in ((24, 'Flujo puro'), (25, 'Flujo inversionista')):   # el aumento del año 1 ya está en el déficit del año 0
    assert co[f'C{rr}'].value.startswith(f"='{h}'!D64-SUM(")
    co[f'C{rr}'] = co[f'C{rr}'].value + "-Datos!$C$23*('Capital de trabajo'!D12-'Capital de trabajo'!C12)"

# ---------------------------------------------------------------- 1c. Compras y pago al proveedor (decisión del 15-11-2026)
assert d['A96'].value == 'hcob' and d['A97'].value == 'lsal' and d['B162'].value is None
d['C96'] = 2
d['E96'] = 'Decisión del equipo (15-11-2026)'
d['F96'] = ('Cada compra cubre dos meses de pedidos: inventario acorde a la demanda, sin inmovilizar capital de trabajo de más. '
            'Con 1 se compra solo lo pedido y el cliente espera la llegada del kit.')
d['B97'] = ('Meses entre el pedido y el pago del saldo, con historial de pagos (1 = contra copia del conocimiento de embarque; '
            '2 = 30 días después del embarque, a la llegada)')
d['C97'] = 2
d['F97'] = ('Práctica habitual al importar desde China: 30% de anticipo y 70% contra copia del conocimiento de embarque en los '
            'primeros pedidos; con historial de pagos el proveedor suele aceptar el saldo a 30 días del embarque. Rige desde el '
            'mes de operación de la fila 162; antes, el saldo se paga al mes siguiente del pedido.')
d['A162'] = 'lsal_m'
fila_dato(162, 'Mes de operación desde el que el saldo se paga 30 días después del embarque', 13, 'mes', 'Supuesto',
          'Supuesto del equipo: doce pedidos mensuales pagados a tiempo dan el historial para negociar el plazo (net 30 desde '
          'el embarque) en el contrato de suministro. Sin cotización.', '13 a 25')
NUM = re.compile(r'([A-Z]+)(\d+)')
def col(n):
    return get_column_letter(n)
L = lambda x: f'OR(Datos!$C$97=1,{x}$7<Datos!$C$162)'
for c in range(6, m.max_column + 1):
    x, p1, p2 = col(c), col(c - 1), col(c - 2)
    viejo44 = f'=Datos!$C$100*{x}39*Datos!$C$52+(1-Datos!$C$100)*IF(Datos!$C$97=1,{p1}39,{p2}39)*Datos!$C$52+{x}43'
    if m[f'{x}44'].value != viejo44:
        continue
    m[f'{x}44'] = (f'=Datos!$C$100*{x}39*Datos!$C$52+(1-Datos!$C$100)*(IF({L(x)},{p1}39,0)'
                   f'+IF(AND(NOT({L(x)}),NOT({L(p1)})),{p2}39,0))*Datos!$C$52+{x}43')
    assert m[f'{x}46'].value == f'=(Datos!$C$100*{x}39+IF(Datos!$C$97=1,1,Datos!$C$100)*{p1}39)*Datos!$C$52'
    m[f'{x}46'] = f'=(Datos!$C$100*{x}39+IF({L(x)},1,Datos!$C$100)*{p1}39)*Datos!$C$52'

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
          'El IVA de la comisión es crédito fiscal; no se suma al costo neto. La tasa se cobra sobre el monto pagado con '
          'tarjeta, que incluye el IVA de la venta.')
assert d['A54'].value == 'medios'
d['C54'] = '=C37*C40*(1+Datos!$C$44)+C38*0+C39*0'
d['E54'] = 'Cálculo'
d['F54'] = ('Promedio ponderado de los medios de cobro (filas 37 a 40), expresado sobre el ingreso neto: solo la venta con '
            'tarjeta de crédito paga comisión, y la paga sobre el precio con IVA (2,19% × 1,19 = 2,61% del ingreso neto de esa '
            'venta). Reemplaza el 2% supuesto de la versión anterior.')
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
TC = 'IF({m}="US$",Datos!$C$14,IF({m}="€",Datos!$C$15,IF({m}="£",Datos!$C$249,1)))'


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
         [30, 34, 34, 13, 8, 7, 11, 9, 15, 16, 80])
cab(h, 4, ['Ítem', 'Especificación', 'Proveedor (eslabón de la cadena)', 'Precio publicado', 'Moneda', 'Cant.',
           'Tipo de cambio', 'Arancel', 'Internación (pesos)', 'Valor neto (pesos)',
           'Fuente, método y mes de consulta'])
EQ = [
    ('e_din', 'Dinamómetro de chasis', 'Dynocom 2WD 5000 Series (rodillos para tracción delantera, freno de corrientes de Foucault)',
     'Dynocom Industries, fabricante (EE.UU.)', 29995, 'US$', 1, 0, '=(750+1.24*312.48+0.02*29995)*Datos!$C$14',
     'Precio de lista publicado por el fabricante en dynocom.net (consultado el 14-11-2026). Arancel 0% por el TLC Chile–EE.UU. '
     'con certificado de origen. Internación = cargos locales + flete + seguro: (1) cargos locales US$750, punto medio del rango de '
     'US$600 a US$900 por embarque que publica Cargo Partner (cargopartner.cl/importar-desde/china); (2) flete marítimo consolidado '
     'desde EE.UU. a San Antonio: 1,24 m³ × US$312,48 por m³ = US$387 (AB Group Shipping, octubre de 2026: US$625 por 2 m³, 27 días '
     'de tránsito); el volumen sale de las medidas publicadas del 5000 Series, 116 × 35,5 × 17,5 pulgadas = 1,17 m³, más 6% de '
     'embalaje; pesa 2.200 libras (998 kg), menos de una tonelada, por lo que se cobra por volumen; (3) seguro de 2% del valor, supuesto '
     'del equipo. Plazo: ver Datos, fila 163.'),
    ('e_esc', 'Escáner automotriz', 'Launch X431 PRO V 5.0 (diagnóstico bidireccional, CAN FD y DoIP)',
     'Proveedor en China por Alibaba, tramo de 1 a 9 unidades', 679, 'US$', 1, 0, '=6.118*16*Datos!$C$14',
     'Precio publicado en Alibaba (consultado el 14-11-2026). Reemplaza al precio al público de una tienda minorista '
     '($1.429.000). Arancel 0% por el TLC Chile–China. Envío courier: peso bruto publicado de 6,118 kg × US$16 por kilo, punto medio del '
     'rango de US$15 a US$17 por kilo que publica Tonlexing para courier exprés de China a Chile (2026) = US$97,89.'),
    ('e_ele', 'Elevador, por puesto', 'JAK 2 columnas, paso superior, 4,2 toneladas',
     'Importadora JAK, importador directo en Chile', 2390000, 'CLP', 1, 0, 0,
     'Precio normal publicado, más IVA (página actualizada el 11-10-2026, consultada el 14-11-2026). La oferta de $2.150.000 no '
     'informa vigencia, por eso se usa el precio normal.'),
    ('e_her', 'Herramientas de alta tensión, por puesto', 'Juego aislado Wiha 91890 de 26 piezas a 1.000 V y multímetro de aislamiento Fluke 1587 FC',
     'Tiendas oficiales de Wiha y de Fluke (fabricantes)', '=693.31+1080.55', 'US$', 1, 0, '=66*Datos!$C$14',
     'Precios regulares de wihatools.com (US$693,31) y shop.fluke.com (US$1.080,55), consultados el 14-11-2026. Los guantes '
     'dieléctricos y la protección personal ya están en «Curso externo de alta tensión y elementos de protección» (Datos), por '
     'eso no se suman. Arancel 0% por TLC con certificado de origen. Envío: el juego Wiha pesa 10,4 libras (4,7 kg) y el Fluke, 2,52 '
     'libras con embalaje (1,1 kg); 5,9 kg por casilla en Miami cuestan US$66 (eShopex, tramo hasta 6 kg, consultado el 15-11-2026).'),
    ('e_bod', 'Bodega de baterías clase 9', 'Dos armarios certificados para baterías de litio (90 minutos de resistencia al fuego) y autorización sanitaria',
     'asecos (fabricante), vendido por DENIOS, su distribuidor', 8560, 'US$', 2, 0, 177300,
     'Armario asecos ION-STORE-90: US$8.560 sin impuestos, envío incluido (DENIOS, consultado el 14-11-2026). Las baterías '
     'de litio son clase 9 y su bodega requiere autorización sanitaria de la SEREMI de Salud (D.S. N° 43): se suma el arancel '
     'máximo para hasta 3 bodegas, $177.300 (ChileAtiende). Capacidad publicada por asecos: 600 kg por armario y 75 kg por repisa; '
     'una batería de 31 celdas de 1,24 kg pesa 38 kg, de modo que cada repisa recibe una batería y los dos armarios, unas ocho. '
     'Alcanza con un dúo (15 instalaciones al mes); con más dúos, la llegada de cada lote exige más armarios o una bodega certificada.'),
    ('e_hab', 'Habilitación del local', 'Piso epóxico del taller (360 m²), instalación eléctrica e iluminación (400 m²) y oficina con atención de clientes (40 m²)',
     'Guías de precios publicadas por plataformas de cotización', '=360*25000+400*9000+40*350000', 'CLP', 1, 0, 0,
     'Suma por partida con precios por m² publicados (consultados el 14-11-2026): piso de resina epóxica $25.000/m², precio medio en '
     'Santiago (Cronoshare); instalación eléctrica e iluminación $9.000/m², tope del rango de $4.000 a $9.000 (Jobbing); habilitación '
     'estándar de oficina $350.000/m², piso del rango de $350.000 a $650.000 (Jobbing). El local se arrienda ya construido.'),
    ('e_mob', 'Mobiliario y computadores', 'Cinco notebooks ThinkPad E14 Gen 7 (un puesto por cargo de oficina al abrir) y mobiliario',
     'Lenovo Agencia en Chile, fabricante (computadores); Sodimac (mobiliario)', '=5*1799990/1.19+(5*79990+5*67990+6*76990)/1.19', 'CLP', 1, 0, 0,
     'Computadores: precio normal de $1.799.990 con IVA publicado directamente por Lenovo (consultado el 14-11-2026), cinco '
     'puestos (gerencia, administración, comercial, Responsable Técnico e Ingeniería de Calibración). Mobiliario, precios publicados por '
     'Sodimac con IVA (consultados el 15-11-2026): cinco escritorios con cajonera de 120 cm a $79.990, cinco sillas ergonómicas a $67.990 '
     'y seis mesones de trabajo de taller con cajón y panel a $76.990, uno por puesto de dúo (el local admite seis): $1.201.840 con IVA, '
     '$1.009.950 netos. No se suman estanterías de kits: el kit se instala al llegar y el inventario en bodega es cero al cierre de cada año.'),
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
    celda(h, r, 12, nota_, wrap=True)
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
for c, f in [(11, f'=SUM(K5:K{r-1})')]:
    celda(h, r, c, f, PESO, bold=True, fill=CLARO)
r += 2
celda(h, r, 2, 'Método: se busca primero al fabricante; si no publica precio, al importador o distribuidor; las tiendas '
               'minoristas y los avisos de Mercado Libre se descartan. Los precios en moneda extranjera se convierten con el tipo '
               'de cambio de Datos (filas 14 y 15). El IVA es crédito fiscal y no se suma.', italic=True, color=GRIS, wrap=True)
h.merge_cells(start_row=r, start_column=2, end_row=r, end_column=12)
h.row_dimensions[r].height = 36
h.freeze_panes = 'C5'

# ---------------------------------------------------------------- 5. Costo del kit pieza por pieza
k = hoja('1.2 Costo del kit', '1.2 Costo directo del kit, pieza por pieza (Esencial y Plus)',
         'Kit: dos motores en las ruedas traseras y batería de litio-titanato de 31 celdas (71,3 V; 2,14 kWh). '
         'Pesos netos de IVA.', [16, 30, 34, 36, 8, 8, 12, 8, 12, 8, 15, 15, 60, 48])
cab(k, 4, ['Bloque', 'Componente', 'Especificación', 'Proveedor (eslabón de la cadena)', 'Moneda', 'Cant. Esencial',
           'Precio unitario Esencial', 'Cant. Plus', 'Precio unitario Plus', 'Arancel', 'Subtotal Esencial (pesos)',
           'Subtotal Plus (pesos)', 'Fuente, método y mes de consulta', 'Enlace'])
D_ = lambda r: f'Datos!$C${r}'
P = [
    ('Tren motriz', 'Motor en la rueda trasera', 'QS273 V3, 72 V: 4.000 W (Esencial) y 6.000 W (Plus)', 'QS Motor, fabricante (China)',
     'US$', 2, 514.54, 2, 583.77, 0, 'Precio oficial publicado por QS Motor en cnqsmotor.com (consultado el 15-11-2026): QS273 de 4.000 W para auto eléctrico liviano, US$514,54 (enlace); QS273 de 6.000 W, US$583,77 (cnqsmotor.com/product/electric-car-hub-motor-72v-6000-watt-v3-electric-hub-motor/). La página no dice qué incluye el precio; las listas de kits de QS venden aparte el disco de freno (ver pendientes al pie). Arancel 0% por el TLC Chile–China, sujeto a certificado de origen.'),
    ('Tren motriz', 'Controlador del motor', 'Fardriver ND84680: 680 A de fase, 330 A de batería, pico de 100 V, con regeneración',
     'ZY Mobility, distribuidor de Fardriver (despacho desde Shenzhen)', 'US$', 2, 308, 2, 308, 0,
     'Modelo elegido por tensión, no por precio. La batería de 31 celdas carga hasta 2,8 V por celda (ficha de Yinlong 66160H, 30 Ah) '
     'y algunas fichas admiten 2,9 V: 86,8 a 89,9 V. El ND72680 tiene un pico de 88 V y quedaría sin margen o por debajo, sobre todo al '
     'regenerar con la batería llena; el ND84680 admite 100 V (11% a 15% de margen). Precio publicado por ZY Mobility para el ND84680: '
     'US$308 por unidad con su adaptador Bluetooth, despachado desde Shenzhen (consultado el 16-11-2026); QS Motor publica el mismo '
     'modelo a «308SD». Un reemplazo genérico a US$251 no declara regeneración ni programación y se descartó. Pendiente: ficha del '
     'fabricante con el rango mínimo de tensión y la regeneración. Arancel 0% sujeto a certificado de origen.'),
    ('Batería', 'Celda de litio-titanato 2,3 V y 30 Ah', 'Yinlong 66160, 30 Ah; 31 en serie = 71,3 V y 2,14 kWh; 180 A continuos',
     'Litio Store, distribuidor (despacho desde China)', '€', 31, 9.69, 31, 9.69, 0,
     'Precio publicado por Litio Store (lifepo4cells.eu): €9,69 por celda, sin IVA ni envío, en múltiplos de 4 (consultado el '
     '15-11-2026). Ficha del vendedor: 2,3 V y 30 Ah, carga hasta 2,9 V, corte en 1,5 V y 180 A continuos. Gobel Power publica la misma '
     'celda a US$14. Despacha desde China, por lo que viaja en el embarque marítimo. Pendiente: proforma, certificado del lote y UN38.3. '
     'Arancel 0% sujeto a certificado de origen chino (sensibilidad con 6% al pie).'),
    ('Batería', 'Sistema de gestión de la batería (BMS)', 'ANT de 10 a 32 series, 200 A, apto para LTO',
     'Vendedor comercial (eBay)', 'US$', 1, 149.28, 1, 149.28, 0,
     'Precio publicado por el vendedor idealmall8 en eBay: US$149,28 la versión de 200 A (consultado el 15-11-2026). Se despacha al '
     'almacén del transitario en China y viaja con el resto del kit. Pendiente: la tienda del fabricante publica para 10 a 32 series '
     'versiones de 80 y 120 A continuos; hay que confirmar si los 200 A de esta versión son continuos o de pico (ver pendientes al pie).'),
    ('Batería', 'Contactor principal', 'TE Kilovac LEV200A4ANA, bobina de 12 V, contactos de 12 a 900 V DC y 500 A, sellado',
     'DigiKey, distribuidor (EE.UU.)', 'US$', 1, 132.7148, 1, 132.7148, 0.06,
     'Precio publicado por DigiKey para el LEV200A4ANA: US$156,11 por una unidad, US$139,00 desde 10 y US$132,71 desde 25, con 43 en stock (consultado '
     'el 16-11-2026). Se usa el tramo de 25 porque el pedido promedio del modelo es de unos 49 kits (Datos, fila 266). Ficha de TE: '
     'contactos de 12 a 900 V DC y 500 A. La bobina consume cerca de 1,1 A y la salida de la unidad de control entrega hasta 1 A, por lo '
     'que se maneja con un relé de mando. Plazo del fabricante: 33 semanas. Arancel de 6% por prudencia, sin certificado de origen.'),
    ('Control', 'Unidad de control (hardware)', 'Macchina M2 Under-the-Hood, 2 CAN', 'Macchina, fabricante (EE.UU.)',
     'US$', 1, 99, 1, 99, 0.06, 'Precio publicado por el fabricante en macchina.cc: US$99 (consultado el 15-11-2026). El software es desarrollo propio. Arancel general de 6% por prudencia: no hay certificado de origen confirmado.'),
    ('Control', 'Sensor de presión de freno', 'Bosch 0 261 545 188: 0 a 250 bar, M10 × 1, salida de 0,5 a 4,5 V, apto para líquido de frenos',
     'Speeding, distribuidor de Bosch Motorsport (Finlandia)', '€', 1, 55.6, 1, 55.6, 0.06,
     'Reemplaza al DATAQ estándar, cuyo sello FKM no está indicado para líquido de frenos DOT (DATAQ ofrece la versión EPDM solo a '
     'pedido y sin precio). Speeding publica el sensor Bosch 0 261 545 188 a €55,60 sin IVA, con 0,5 V a 0 bar y 4,5 V a 250 bar, para '
     'combustible, aceite y líquido de frenos (consultado el 16-11-2026). Xtra Motorsport lo lista como número alternativo del Bosch '
     'Motorsport PSS-260, que vende a €78,50. Pendiente: conector Bosch Compact de 3 pines, que se vende aparte. Arancel de 6% por prudencia.'),
    ('Mecánica', 'Brida motor–mangueta y soporte de pinza', 'Mecanizado CNC en aluminio 6061 T6 desde bloque de 200 × 200 × 25 mm',
     'ESTIMACIÓN de costo de fabricación, no es cotización: talleres CNC de China (PCBWay, JLCCNC)', 'US$', 2, 42.61, 2, 42.61, 0,
     'ESTIMACIÓN, no cotización. Costo por pieza según los precios de mecanizado CNC en aluminio 6061 publicados por PCBWay y JLCCNC: '
     'cerca de US$65,55 una pieza suelta y US$42,61 en un lote de 40 piezas, es decir, 20 kits (consultado el 15-11-2026). Se fabrica en '
     'China y viaja con el resto del kit. Reemplaza la analogía con separadores de rueda de la versión anterior (€72,73 por brida), que '
     'correspondía a otro producto. Pendiente: presupuesto con plano. Sensibilidad en el pie de la hoja: de la mitad al doble.'),
    ('Mecánica', 'Pinza y disco de freno trasero (por rueda)', 'Pinza hidráulica trasera de auto y disco sólido de 230 × 9 mm, montados en la brida',
     'ULTI Repuestos y Mundo VAG, comercios en Chile', 'CLP', 2, '=(54990+24900)/1.19', 2, '=(54990+24900)/1.19', 0,
     'Precios publicados con IVA (consultados el 15-11-2026): pinza trasera ALS-CH03343 de ULTI Repuestos, $54.990, y disco trasero '
     'sólido Hipper Freios de 230 × 9 mm de Mundo VAG (mundovag.cl/frenos/discos-traseros), $24.900; netos, $46.210 y $20.924. Suma el '
     'disco, que QS Motor vende aparte, y reemplaza los avisos de Mercado Libre de la versión anterior. Pendiente: ajuste del disco al '
     'cubo del motor en el plano de la brida.'),
    ('Mecánica', 'Cable de potencia 35 mm² (metro)', 'H01N2-D flexible, 100 V y 245 A', 'Diacon, distribuidor en Chile',
     'CLP', 5, '=8900/1.19', 5, '=8900/1.19', 0, 'Precio publicado por Diacon: $8.900 con IVA por metro de cable H01N2-D de 35 mm², 100 V y 245 A (consultado el 15-11-2026); neto, $7.479. Vitel Energía publica $12.013. Pendiente: stock para pedidos por lote.'),
    ('Mecánica', 'Fusible clase T de 225 A con portafusible', 'Blue Sea 5117 (225 A, 20 kA a 125 V DC) y bloque 5502 con tapa (225 a 400 A, 160 V DC)',
     'Harbor Supply y Wholesale Marine, distribuidores (EE.UU.)', 'US$', 1, '=59.99+62.99', 1, '=59.99+62.99', 0.06,
     'Reemplaza al fusible ANL, cuya tensión típica de 32 V DC no sirve para una batería de 87 a 90 V. Fusible Blue Sea 5117 a US$59,99 '
     '(Harbor Supply, a pedido) y bloque 5502 con tapa a US$62,99 (Wholesale Marine, con stock), consultados el 15-11-2026; Fisheries '
     'Supply y Del City publican los mismos a US$92,51 y US$82,79. Se usa 225 A porque el bloque para fusibles de 110 a 200 A (5007100) '
     'admite solo 160 A continuos y la versión Plus llega a unos 170 A (12 kW / 71 V). Arancel de 6% por prudencia.'),
    ('Mecánica', 'Cortacorriente de emergencia', 'Albright ED250B-1: 250 A, hasta 96 V DC, con soplado magnético; corta 1.000 A a 96 V DC',
     'Arc Components, distribuidor de Albright (Reino Unido)', '£', 1, 49.96, 1, 49.96, 0.06,
     'Reemplaza al cortacorriente de Ferretools (12 a 36 V), que no sirve para la tensión del kit. Ficha de Albright ED250: tensión '
     'máxima recomendada 96 V DC en la versión B y corte de 1.000 A a 96 V DC; Arc Components publica £49,96 sin IVA del Reino Unido '
     '(consultado el 15-11-2026). Abre el circuito en una emergencia o para mantención; la conexión y desconexión normal la hace el '
     'contactor. Arancel de 6% por prudencia, sin certificado de origen.'),
    ('Mecánica', 'Caja metálica de la batería', 'Chapa de acero de 1,5 mm cortada con láser, plegada y pintada (batea, tapa y dos grillas porta-celdas)',
     'ESTIMACIÓN de costo de fabricación, no es cotización: talleres de chapa de China (Baosheng, PCBWay)', 'US$', 1, 82, 1, 82, 0,
     'ESTIMACIÓN, no cotización. Desglose de precios de chapa publicado por Baosheng Industry para una caja de este tamaño: US$99 en lote '
     'de 10, US$82 en lote de 20, US$72,45 en lote de 50 y US$56,70 en lote de 100 (consultado el 15-11-2026). Se usa el lote de 20, del '
     'lado conservador; viaja en el embarque marítimo. Pendiente: presupuesto con plano.'),
    ('Mecánica', 'Barras de conexión y consumibles', '30 barras M12 y 62 tuercas entre celdas, 10 terminales de 35 mm², termocontraíble y 10 m de cable de señal 18 AWG',
     'Jim\'s Machineworx (EE.UU.), Rhona, Easy y Líder (Chile)', 'CLP', 1, '=(1315*10+3990+27990*10/31)/1.19+(30*1+62*0.45)*Datos!$C$14*1.06',
     1, '=(1315*10+3990+27990*10/31)/1.19+(30*1+62*0.45)*Datos!$C$14*1.06', 0,
     'Barras de cobre estañado para borne M12 a US$1,00 y tuercas bridadas M12 a US$0,45 (Jim\'s Machineworx, US$57,90 por kit, con 6% '
     'de arancel por prudencia; viajan por courier). Terminales de compresión Sofamel de 35 mm² para espárrago M12 a $1.315 (Rhona), '
     'kit de termocontraíble a $3.990 y cable 18 AWG a $903 el metro, con IVA (consultados el 15-11-2026). Cantidades, supuesto del equipo '
     'según el circuito: diez extremos de cable de potencia y diez metros de señal. Pendiente: ampacidad y distancia entre centros de '
     'las barras.'),
    ('Logística', 'Flete marítimo LCL con recargo de carga peligrosa (por kit)', 'Volumen embalado por kit × tarifa por m³ × (1 + recargo); Datos, filas 250 a 253',
     'Cargo Partner y Great Hensen, transitarios', 'US$', 1, f'={D_(250)}*{D_(252)}*(1+{D_(253)})', 1, f'={D_(250)}*{D_(252)}*(1+{D_(253)})', 0,
     'Parte variable del flete desde China: 0,19 m³ por kit × US$180 por m³ (Cargo Partner) × 1,275 (recargo de carga peligrosa de '
     'Great Hensen, punto medio de 15% a 40%, aplicado a todo el kit). El kit pesa unos 95 kg, menos de una tonelada por cada m³, de '
     'modo que se cobra por volumen. Los cargos locales por embarque van aparte, como costo fijo de cada pedido (pie de la hoja).'),
    ('Logística', 'Seguro de carga marítima (por kit)', '0,22% del costo y flete de las piezas que vienen de China; Datos, fila 255',
     'Tasa de referencia de Chubb aceptada por el Servicio Nacional de Aduanas', 'US$', 1,
     f'={D_(255)}*(G5*H5+G6*H6+G7*H7*{D_(15)}/{D_(14)}+G8*H8+G12*H12+G17*H17+H19)', 1, f'={D_(255)}*(I5*J5+I6*J6+I7*J7*{D_(15)}/{D_(14)}+I8*J8+I12*J12+I17*J17+J19)', 0,
     'Resolución N° 307 del Servicio Nacional de Aduanas (valoración): tasa de 0,22% por viaje sobre el costo y flete de motores, controladores, celdas, BMS, bridas y caja, con prima mínima '
     'de US$25 por póliza. Con pedidos de 10 kits o más, la prima supera el mínimo. Sin seguro declarado, Aduanas valora con 2% teórico.'),
    ('Logística', 'Courier desde EE.UU., parte variable (por kit)', 'US$8,50 por kilo × 3,24 kg + seguro de 1,5% del valor; Datos, filas 257 a 262',
     'eShopex, casilla en Miami', 'US$', 1, f'={D_(260)}*{D_(257)}+{D_(262)}*(G9*H9+G10*H10+G15*H15+57.9)', 1,
     f'={D_(260)}*{D_(257)}+{D_(262)}*(I9*J9+I10*J10+I15*J15+57.9)', 0,
     'Tarifa publicada por eShopex (consultada el 15-11-2026): US$106 hasta 10 kg y US$8,50 por kilo adicional; manejo de US$2 a US$20 '
     'por paquete según su valor; seguro de US$1,50 por cada US$100 declarados. eShopex no consolida: llega un paquete por proveedor. '
     'Peso por kit: contactor 0,60 kg (ficha de TE), fusible 0,14 kg y bloque 0,50 kg (Blue Sea), unidad de control 0,20 kg '
     '(supuesto) y barras con tuercas 1,80 kg. La parte fija de cada paquete va en el costo fijo por embarque (pie de la hoja).'),
    ('Logística', 'Courier desde Europa (por kit)', '0,55 kg por kit × tarifa por kilo; Datos, filas 263 y 264',
     'ESTIMACIÓN: tarifa de courier desde Europa publicada por eShopex', 'US$', 1, f'={D_(264)}*{D_(263)}', 1, f'={D_(264)}*{D_(263)}', 0,
     'ESTIMACIÓN. Arc Components y Speeding no publican su tarifa de exportación; se usa la tarifa publicada por eShopex desde '
     'Europa (US$143 por 10 kg = US$14,30 por kilo) sobre el cortacorriente, 0,5 kg (Arc Components), y el sensor, 0,05 kg. Pendiente: cotizar el envío.'),
    ('Logística', 'Derecho de aduana sobre flete y seguro de las piezas afectas (base CIF)', '6% del flete y seguro del courier; Datos, fila 265',
     'Servicio Nacional de Aduanas', 'US$', 1, f'={D_(265)}*(H21+H22)', 1, f'={D_(265)}*(J21+J22)', 0,
     'El derecho ad valorem de 6% se calcula sobre el valor CIF (costo + seguro + flete). Las filas de cada pieza aplican el 6% sobre su '
     'precio; esta fila agrega el 6% sobre el flete y el seguro del courier. Las piezas de China van con 0% por el TLC, sujeto al '
     'certificado de origen; con 6% el kit subiría (ver pie de la hoja).'),
    ('Puesta en regla', 'Alineación después de la instalación', 'Taller externo', 'Neumax, servicio en Chile',
     'CLP', 1, 16806.72, 1, 16806.72, 0, 'Precio publicado por Neumax para la alineación de un auto: $20.000 con IVA (consultado el 15-11-2026); se usa neto, $16.807.'),
    ('Puesta en regla', 'Revisión técnica después de la instalación', 'Planta de revisión, Región Metropolitana',
     'Chilena de Revisiones Técnicas, planta en la Región Metropolitana', 'CLP', 1, '=20900/1.19', 1, '=20900/1.19', 0, 'Tarifa publicada por la Chilena de Revisiones Técnicas para automóvil 4 × 2: $20.900 (consultado el 15-11-2026); se trata como precio con IVA, $17.563 netos. SGS publica $21.800 en sus plantas.'),
]
r = 5
ENLACE = {
    'Motor en la rueda trasera': 'https://www.cnqsmotor.com/product/4000-watt-72v-80kph-qs273-hub-motor-for-electric-light-car/',
    'Controlador del motor': 'https://zymobility.com/product/fardriver-nd84680/',
    'Contactor principal': 'https://www.digikey.com/en/products/detail/te-connectivity-aerospace-defense-and-marine/LEV200A4ANA/2362822',
    'Unidad de control (hardware)': 'https://www.macchina.cc/catalog/m2-boards/m2-under-hood',
    'Brida motor–mangueta y soporte de pinza': 'https://www.pcbway.com/rapid-prototyping/cnc-machining/metal/aluminum/Aluminum-6061/',
    'Pinza y disco de freno trasero (por rueda)': 'https://ulti.cl/producto/Caliper-de-freno-trasero-izquierdo-ALS-CH03343/67645de1715ffd8219877de5',
    'Fusible clase T de 225 A con portafusible': 'https://harbor-supply.com/collections/electrical-fuse-blocks-fuses/products/blue-sea-5117-225amp-class-t-fuse-5117',
    'Cortacorriente de emergencia': 'https://arc-components.com/ed250b-1-albright-heavy-duty-emergency-stop-switch-250a-96v-max-5210.html',
    'Caja metálica de la batería': 'https://baoshengindustry.com/resources/sheet-metal-fabrication/sendcutsend-vs-direct-sheet-metal-factory/',
    'Barras de conexión y consumibles': 'https://rhona.cl/producto/11504/terminal-de-compresion-35mm.html',
    'Flete marítimo LCL con recargo de carga peligrosa (por kit)': 'https://www.cargopartner.cl/importar-desde/china',
    'Seguro de carga marítima (por kit)': 'https://www.aduana.cl/valoracion-resolucion-n-307/aduana/2007-02-24/205634.html',
    'Courier desde EE.UU., parte variable (por kit)': 'https://eshopex.cl/tarifas/',
    'Courier desde Europa (por kit)': 'https://eshopex.cl/tarifas/',
    'Derecho de aduana sobre flete y seguro de las piezas afectas (base CIF)': 'https://www.aduana.cl/cuanto-impuesto-se-paga-al-importar/aduana/2018-12-12/233227.html',
    'Alineación después de la instalación': 'https://neumax.cl/tienda/nuevos-productos/alineacion-auto-2/',
    'Revisión técnica después de la instalación': 'https://chrt.cl/tarifas/',
    'Celda de litio-titanato 2,3 V y 30 Ah': 'https://www.lifepo4cells.eu/en/cell/yinlong-66160-30ah-lto-cell/',
    'Sistema de gestión de la batería (BMS)': 'https://www.ebay.de/itm/204568705372',
    'Sensor de presión de freno': 'https://www.speeding.fi/p/bosch-high-pressure-sensor-m10x1-0-261-545-188.html?vat_disp=0',
    'Cable de potencia 35 mm² (metro)': 'https://diacon.cl/products/cable-flexible-h01n2-d-1x35mm2-100v-245a-negro-x-metro',
}
# Las fórmulas de logística apuntan a filas fijas del kit: si cambia el orden de P, se detiene
_orden = [p[1] for p in P]
assert _orden.index('Controlador del motor') == 1 and _orden.index('Sistema de gestión de la batería (BMS)') == 3
assert _orden.index('Contactor principal') == 4 and _orden.index('Fusible clase T de 225 A con portafusible') == 10
assert _orden.index('Flete marítimo LCL con recargo de carga peligrosa (por kit)') == 14
assert _orden.index('Courier desde EE.UU., parte variable (por kit)') == 16
assert _orden.index('Courier desde Europa (por kit)') == 17
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
    if comp in ENLACE:
        z = celda(k, r, 15, ENLACE[comp], wrap=True, color='0A6F9E')
        z.hyperlink = ENLACE[comp]
    else:
        raise SystemExit(f'Falta el enlace de la pieza {comp}')
    k.row_dimensions[r].height = 48
    r += 1
tot = r
celda(k, r, 3, 'Costo directo por kit', bold=True)
for c, col in [(12, 'L'), (13, 'M')]:
    celda(k, r, c, f'=SUM({col}5:{col}{r-1})', PESO, bold=True, fill=CLARO)
r += 1
celda(k, r, 3, 'Costo de la mezcla de ventas (participación de Plus en Datos)')
celda(k, r, 12, f'=(1-Datos!$C$48)*L{tot}+Datos!$C$48*M{tot}', PESO, bold=True)
r += 1
celda(k, r, 3, 'Parte que se paga en moneda extranjera (efecto de cada $10 de dólar)')
celda(k, r, 12, f'=SUMPRODUCT((F5:F{tot-1}="US$")*G5:G{tot-1}*H5:H{tot-1}*(1+K5:K{tot-1}))*10', PESO)
celda(k, r, 13, f'=SUMPRODUCT((F5:F{tot-1}="US$")*I5:I{tot-1}*J5:J{tot-1}*(1+K5:K{tot-1}))*10', PESO)
r += 1
fij = r
celda(k, r, 3, 'Costo logístico fijo por embarque (pesos; se paga en cada pedido, no por kit)', bold=True)
celda(k, r, 12, '=(Datos!$C$254+Datos!$C$258*(Datos!$C$259+Datos!$C$261)+Datos!$C$265*Datos!$C$258*Datos!$C$259)*Datos!$C$14',
      PESO, bold=True, fill=CLARO)
celda(k, r, 14, 'Cargos locales del embarque marítimo (US$750, punto medio de US$600 a US$900 de Cargo Partner) más, por cada uno '
               'de los cinco paquetes del courier desde EE.UU., la parte fija de la tarifa sobre 10 kg (US$106 − 10 × US$8,50 = US$21) y '
               'el manejo (US$20, tramo de mayor valor), con el 6% de derecho sobre esa parte del flete. Va a Datos, fila 101, y el '
               'modelo mensual lo carga en cada mes en que se hace un pedido.', wrap=True)
k.row_dimensions[r].height = 60
r += 1
celda(k, r, 3, 'Kits por embarque, promedio de los pedidos del modelo')
celda(k, r, 12, '=Datos!$C$266', '#,##0.0')
r += 1
celda(k, r, 3, 'Costo por kit con el embarque promedio (mezcla de ventas)', bold=True)
celda(k, r, 12, f'=L{tot+1}+L{fij}/L{fij+1}', PESO, bold=True)
r += 1
celda(k, r, 3, 'Sensibilidad de bridas y caja: a la mitad (columna L) y al doble (columna M), pesos por kit')
celda(k, r, 12, f'=-0.5*(L12+L17)', PESO)
celda(k, r, 13, f'=1*(M12+M17)', PESO)
r += 1
celda(k, r, 3, 'Sensibilidad: piezas de China con 6% de derecho sobre el valor CIF (pesos por kit)')
celda(k, r, 12, f'=Datos!$C$265*(L5+L6+L7+L8+L12+L17+L19+L20)', PESO)
celda(k, r, 13, f'=Datos!$C$265*(M5+M6+M7+M8+M12+M17+M19+M20)', PESO)
r += 2
celda(k, r, 2, 'Pendientes de confirmar con proveedores (no se suman al costo porque no hay precio publicado):', bold=True)
k.merge_cells(start_row=r, start_column=2, end_row=r, end_column=15)
for txt in [
    '1. Disco de freno: se costea un disco de auto de 230 mm montado en la brida; falta confirmar su ajuste al cubo del motor en el plano.',
    '2. Velocidad: el QS273 de 4 kW publicado está bobinado para 80 km/h. QS sugiere sobre 80 km/h una tapa con disco de auto por US$135 '
    'más por motor (US$270 por kit, sensibilidad en OBSERVACIONES_V7.md). Pedir a QS el bobinado, las rpm máximas arrastrado y la tensión en vacío.',
    '3. BMS: confirmar que la versión de 200 A sea continua. Si se necesitara un BMS externo (Orion BMS 2, US$890 sin accesorios), el kit subiría.',
    '4. Corriente de la versión Plus: las celdas admiten 180 A continuos; los dos controladores deben compartir un límite total de batería de 180 A.',
    '5. Ficha del fabricante del ND84680, conector del sensor de freno y certificado de origen de las piezas chinas (0% de arancel).',
    '6. Bridas y caja: presupuesto de fabricación con plano y cantidades; barras: ampacidad y distancia entre centros.',
    '7. Envío desde Europa: tarifa de exportación de Arc Components y Speeding.',
]:
    r += 1
    celda(k, r, 2, txt, wrap=True)
    k.merge_cells(start_row=r, start_column=2, end_row=r, end_column=15)
    k.row_dimensions[r].height = 30
r += 2
celda(k, r, 2, 'Método: cada pieza se cotiza en el eslabón más cercano al fabricante que publica precio. Las piezas sin precio '
               'publicado quedan como supuesto o estimación y lo dicen en su fila. No incluye la mano de obra del dúo (va en '
               'remuneraciones) ni la garantía (Datos, 3% del costo del kit).', italic=True, color=GRIS, wrap=True)
k.merge_cells(start_row=r, start_column=2, end_row=r, end_column=15)
k.row_dimensions[r].height = 36
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
    if ('publicad' in t or t.startswith('dato')) and 'supuesto' not in t:
        return 'Dato publicado: fuente y fecha en la columna F.'
    if 'decisión' in t or 'decision' in t:
        return 'Decisión del equipo; la fecha va en la columna E (si no la indica, octubre de 2026).'
    if 'estimación' in t or 'estimacion' in t:
        return 'Estimación del equipo con datos publicados (columna F); por confirmar con cotización.'
    if 'supuesto' in t or 'referencia' in t or 'observación' in t:
        return 'Supuesto del equipo, sin cotización ni medición (octubre de 2026); la columna G da el rango de prueba.'
    if 'selector' in t:
        return 'Selector del Tablero.'
    f = (fuente or '').lower()
    if not f:
        return None
    if 'fase 3' in f and 'dato y supuesto' in t:
        return 'Dato de mercado y supuesto del equipo, tomados del informe de la Fase 3 (sin cotización).'
    if 'estimación' in f or 'estimacion' in f:
        return 'Estimación del equipo, sin cotización ni contrato.'
    if 'supuesto' in f or 'no tarifa contratada' in f:
        return 'Supuesto del equipo, sin cotización ni contrato.'
    if 'escenario ilustrativo' in f or 'interés pagado' in f:
        return 'Supuesto del equipo: crédito propuesto, sin aprobación de un banco.'
    if 'convención' in f or 'método contable' in f:
        return 'Criterio de evaluación de proyectos (Sapag, 2014), no un dato de mercado.'
    if 'abril del año siguiente' in f:
        return 'Norma tributaria: la renta anual se declara y paga en abril (SII).'
    return 'Dato publicado: fuente y fecha en la columna F.'


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


# ---------------------------------------------------------------- 7. Beta y D/P ponderados por la composición del ingreso (15-11-2026)
assert all(d.cell(rr, 2).value is None for rr in range(241, 247)), 'Datos!B241:B246 no está libre'
d['B241'] = 'Ponderación de industrias para el beta y la relación deuda / patrimonio (decisión del equipo, 15-11-2026)'
estilo_como(d['B241'], d['B42'])
DAM = 'Damodaran, «Betas by Sector (US)», enero de 2026: '
fila_dato(242, 'Peso de autopartes en el ingreso por instalación (fijo del caso base)', '=C52/C49', '%', 'Supuesto con cálculo',
          'Lumine cobra un precio único que paga dos actividades: el kit, una autoparte importada y revendida, y la instalación y '
          'calibración, un servicio automotriz. Sin precios separados, se asigna al kit su costo de compra (fila 52) y el resto del '
          'ingreso neto (fila 49) al servicio; el cociente del caso base se fija como número, para que una sensibilidad del costo '
          'del kit no mueva el beta ni la deuda. Es un supuesto: con margen sobre el kit su peso subiría; con 100% (solo '
          'autopartes) Ku sería 8,65%.',
          'Con 1 se vuelve a la sola industria de autopartes.')
fila_dato(243, 'Beta desapalancado, autopartes («Auto Parts», corregido por caja)', 1.13, 'beta', 'Dato publicado',
          DAM + '35 empresas, beta desapalancado corregido por caja 1,13.')
fila_dato(244, 'Beta desapalancado, comercio y servicio automotriz («Retail (Automotive)», corregido por caja)', 0.71, 'beta',
          'Dato publicado', DAM + '34 empresas de venta y servicio automotriz, beta desapalancado corregido por caja 0,71.')
fila_dato(245, 'Deuda / patrimonio, autopartes', 0.4146, '%', 'Dato publicado', DAM + 'D/E de 41,46%.')
fila_dato(246, 'Deuda / patrimonio, comercio y servicio automotriz', 0.4536, '%', 'Dato publicado', DAM + 'D/E de 45,36%.')
for rr in (242, 245, 246):
    d.cell(rr, 3).number_format = '0.00%'
d['B8'] = 'Beta desapalancado (βu), ponderado: autopartes y comercio y servicio automotriz'
d['C8'] = '=C242*C243+(1-C242)*C244'
d['E8'] = 'Cálculo'
d['F8'] = ('Promedio ponderado de dos industrias de Damodaran (filas 242 a 244): el kit es una autoparte y la instalación, un '
           'servicio automotriz. Pesos según la composición del ingreso por instalación.')
d['B9'] = 'Relación deuda / patrimonio (D/P), ponderada'
d['C9'] = '=C242*C245+(1-C242)*C246'
d['E9'] = 'Cálculo'
d['F9'] = ('Promedio ponderado de la estructura de capital de las mismas dos industrias (filas 245 y 246): se supone que la '
           'empresa se financiaría como las que ya operan en su negocio, que llegaron a esa relación por experiencia.')

# ---------------------------------------------------------------- 8. Preapertura de seis meses, escalonada (15-11-2026)
# La norma se supone publicada al inicio del mes 13 (enero de 2028), tres meses antes que en el calendario anterior, y la
# preapertura dura seis meses (meses 13 a 18; −5 a 0): la apertura sigue en julio de 2028.
mes = {m.cell(3, c).value: c for c in range(4, m.max_column + 1) if isinstance(m.cell(3, c).value, int)}
P13, P14, P15, P16, P17, P18 = (mes[k] for k in range(13, 19))
CL = lambda c: get_column_letter(c)
m['A2'] = 'CALENDARIO BASE (enero de 2027 = mes 1; la norma se supone publicada al inicio del mes 13)'
for c in (P13, P14, P15):
    m.cell(5, c).value = 'Preapertura'
d['C161'] = 5
d['F161'] = ('El local se arrienda cinco meses antes de abrir: las obras de habilitación toman los meses −4 y −3, y en los dos '
             'últimos se instalan los equipos y se forman los técnicos.')
d['B161'] = 'Meses de arriendo del local antes de abrir'
assert d['A163'].value is None and d['B163'].value is None
d['A163'] = 'adin'
fila_dato(163, 'Anticipo al pedir el dinamómetro (el saldo se paga al recibirlo, tres meses después)', '=3000/29995', '%', 'Dato y cálculo',
          'Dynocom no publica plazo ni anticipo; se usa el de Mustang Dynamometer, otro fabricante de EE.UU. de dinamómetros de '
          'chasis, que para un modelo 2WD pide un depósito de US$3.000 y lo deja listo para despachar en 6 a 8 semanas (mustangdyne.com). '
          'Anticipo: US$3.000 / US$29.995 = 10%. Plazo total desde la orden = 6 a 8 semanas de fabricación + 27 días de flete marítimo '
          'a San Antonio (AB Group Shipping, octubre de 2026) + cerca de una semana de aduana y traslado = 11 a 13 semanas, es decir, '
          'unos tres meses: se pide en el mes −5 y se recibe en el −2.',
          'Con stock en fábrica, el plazo bajaría a unas cinco semanas.')
d['C163'].number_format = '0%'
# Personas: Responsable Técnico desde el mes −5; Ingeniería de Calibración desde el −3
for c in (P13, P14, P15):
    x = CL(c)
    m[f'{x}68'] = '=Datos!$C$228'
    m[f'{x}66'] = '=Datos!$C$226'
    m[f'{x}86'] = f'={x}66*Datos!$C$104'
    m[f'{x}88'] = f'={x}68*Datos!$C$105*{x}8'
    m[f'{x}89'] = f'={x}69*Datos!$C$106*{x}8'
    m[f'{x}85'] = 0
    m[f'{x}120'] = 0
for c in range(4, m.max_column + 1):
    v = m.cell(69, c).value
    if isinstance(v, str) and '<16,' in v:
        m.cell(69, c).value = v.replace('<16,', '<15,')
# Arriendo, servicios y seguros desde el mes −4 (con el contrato de arriendo)
for c in (P13, P14, P15, P16, P17, P18):
    x, n_ = CL(c), m.cell(3, c).value
    m[f'{x}96'] = f'=IF({n_}>=19-Datos!$C$161,Datos!$C$121,0)'
    m[f'{x}97'] = f'=IF({n_}>=19-Datos!$C$161,Datos!$C$122,0)'
    m[f'{x}98'] = f'=IF({n_}>=19-Datos!$C$161,Datos!$C$123,0)'
# Trámites de autorización: al publicarse la norma (mes −5)
m[f'{CL(P13)}121'] = '=Datos!$C$157'
m[f'{CL(P16)}121'] = 0
# Garantía de arriendo: con el contrato (mes −4)
m[f'{CL(P14)}130'] = '=Datos!$C$121'
m[f'{CL(P16)}130'] = 0
# Equipos escalonados: habilitación en −4 y −3; bodega en −3; escáner y herramientas en −3; mobiliario en −2;
# dinamómetro con anticipo en −5 y saldo en −2; elevador en 0 (sin cambio)
esc = m[f'{CL(P16)}124'].value     # el paso 1 llevó el escáner y las herramientas al mes 16 (antes, primer mes de preapertura)
assert isinstance(esc, str) and 'Datos!$C$129' in esc, esc
m[f'{CL(P15)}124'] = esc
for c in (P13, P14, P16, P17, P18):
    if c != P15:
        m[f'{CL(c)}124'] = 0
m[f'{CL(P13)}125'] = 0
m[f'{CL(P14)}125'] = '=0.5*Datos!$C$131'
m[f'{CL(P15)}125'] = '=0.5*Datos!$C$131+Datos!$C$130'
m[f'{CL(P16)}125'] = '=Datos!$C$132'
m[f'{CL(P17)}125'] = 0
m[f'{CL(P13)}126'] = '=Datos!$C$163*Datos!$C$128'
m[f'{CL(P16)}126'] = '=(1-Datos!$C$163)*Datos!$C$128'
m[f'{CL(P17)}126'] = 0


# Totales del calendario calculados directo del motor: el anexo A1 muestra solo los meses de preapertura
cal = w['Calendario']
assert cal['U6'].value == '=SUM(C6:T6)' and cal['U15'].value == '=SUM(C15:T15)'
cal['U6'] = '=SUM(Mensual!D128:U128)/1000000'
cal['U7'] = '=(SUM(Mensual!D137:U137)+SUM(Mensual!D138:U138))/1000000'
cal['U8'] = '=Mensual!U150/1000000'
cal['U9'] = '=SUM(Mensual!D130:U130)/1000000'
cal['U10'] = '=T10'
cal['U12'] = '=SUM(U6:U10)'
for fila_, tasa in ((15, 'Datos!$C$16'), (18, 'Datos!$C$18')):
    f_ = lambda rng: f'(1+{tasa})^(-{rng}/12)'
    cal[f'U{fila_}'] = ('=(SUMPRODUCT((Mensual!D128:U128+Mensual!D137:U137+Mensual!D138:U138+Mensual!D130:U130)*'
                        + f_('Mensual!D7:U7') + ')+Mensual!D150*' + f_('Mensual!D7')
                        + '+SUMPRODUCT((Mensual!E150:U150-Mensual!D150:T150)*' + f_('Mensual!E7:U7') + '))/1000000+T10')

# ---------------------------------------------------------------- 9. Rótulos del capital de trabajo
ct['B16'] = 'Capital de trabajo comprado antes de abrir (ya incluido en la inversión del año 0)'

# ---------------------------------------------------------------- Notas

# ---------------------------------------------------------------- 9. Importación del kit por embarque (revisión del 15-11-2026)
# Los cargos que se pagan por pedido (cargos locales, mínimos del courier y manejo) dejan de prorratearse en 20 kits fijos y
# se cargan en cada mes con pedido; el kit lleva solo la parte variable. Reemplaza el recargo de pedidos pequeños.
assert all(d.cell(rr, 2).value is None for rr in range(248, 267)), 'Datos!B248:B266 no está libre'
d['B248'] = 'Importación del kit: parámetros por embarque (revisión del 15-11-2026)'
estilo_como(d['B248'], d['B42'])
LOG = [
    (249, 'gbp', 'Tipo de cambio de la libra esterlina', 1308.03, 'pesos por libra', 'Dato',
     'Banco Central de Chile, tipos de cambio y paridades al 5-11-2026 (Diario Oficial N° 44.591): libra esterlina $1.308,03.'),
    (250, 'm3k', 'Volumen embalado por kit, vía marítima', 0.23, 'm³', 'Dato y supuesto',
     'Dos cajas de motor de 43 × 43 × 43 cm (QS Motor) = 0,159 m³, más celdas, controladores, BMS y bridas, unos 0,03 m³ (supuesto del equipo), y la caja de batería embalada, 0,040 m³ (58 × 30 × 23 cm, Baosheng).'),
    (251, 'kgk', 'Peso bruto por kit, vía marítima', '=2*25+31*1.24+2*3+1+2*1.5+12', 'kg', 'Dato y supuesto',
     'Motores de 25 kg brutos (QS Motor), 31 celdas de 1,24 kg (ficha de Yinlong), dos controladores de 3 kg (ficha del ND72680, misma '
     'carcasa), 1 kg de BMS (supuesto), dos bridas de 1,5 kg y la caja de 12 kg embalada. Unos 110 kg: menos de 1 t por m³, por lo que el flete se cobra por volumen.'),
    (252, 'tlcl', 'Flete marítimo consolidado desde China', 180, 'US$ por m³', 'Dato publicado',
     'Cargo Partner: US$700 a US$1.100 por 5 m³ desde Shanghái; punto medio US$900 / 5 = US$180 por m³ (consultado el 15-11-2026).'),
    (253, 'dgr', 'Recargo de carga peligrosa sobre el flete', 0.275, '%', 'Dato publicado (rango)',
     'Great Hensen: 15% a 40% sobre la carga normal; se usa el punto medio y se aplica a todo el kit (consultado el 15-11-2026).'),
    (254, 'cloc', 'Cargos locales por embarque marítimo', 750, 'US$ por embarque', 'Dato publicado (rango)',
     'Cargo Partner: US$600 a US$900 por embarque consolidado (desconsolidación, agente de aduana y transporte); punto medio.'),
    (255, 'segm', 'Seguro de carga marítima', 0.0022, '% de costo y flete', 'Dato publicado',
     'Servicio Nacional de Aduanas, Resolución N° 307 (valoración): tasa de 0,22% por viaje certificada por Chubb, prima mínima US$25.'),
    (256, 'segmin', 'Prima mínima del seguro de carga', 25, 'US$ por póliza', 'Dato publicado',
     'Misma fuente. No se activa: un pedido mínimo de 10 kits vale más de US$20.000 y su prima pasa de US$44.'),
    (257, 'kgus', 'Peso por kit de las piezas de EE.UU.', '=0.6+0.14+0.5+0.2+1.8', 'kg', 'Dato y supuesto',
     'Contactor 0,60 kg (ficha de TE), fusible 0,14 kg y bloque 0,50 kg (Blue Sea), unidad de control 0,20 kg (supuesto) y barras con tuercas 1,80 kg (Jim\'s Machineworx).'),
    (258, 'npus', 'Paquetes por embarque desde EE.UU.', 5, 'paquetes', 'Dato',
     'Un paquete por proveedor (DigiKey, Harbor Supply, Wholesale Marine, Macchina y Jim\'s Machineworx): eShopex no consolida (página de tarifas).'),
    (259, 'cbase', 'Parte fija de la tarifa del courier por paquete', '=106-10*8.5', 'US$ por paquete', 'Dato publicado y cálculo',
     'eShopex: US$106 hasta 10 kg y US$8,50 por kilo adicional; sobre 10 kg la tarifa es US$21 + US$8,50 por kilo.'),
    (260, 'ckg', 'Tarifa del courier por kilo', 8.5, 'US$ por kg', 'Dato publicado', 'eShopex, tarifa desde Miami (consultada el 15-11-2026).'),
    (261, 'cman', 'Manejo por paquete', 20, 'US$ por paquete', 'Dato publicado',
     'eShopex: US$2 a US$20 según el valor del paquete; se usa el tramo mayor (sobre US$1.000), del lado conservador.'),
    (262, 'cseg', 'Seguro del courier', 0.015, '% del valor declarado', 'Dato publicado',
     'eShopex: US$1,50 por cada US$100 declarados (cobertura hasta US$500 por paquete).'),
    (263, 'kguk', 'Peso por kit de las piezas de Europa', 0.55, 'kg', 'Dato publicado',
     'Peso de despacho del cortacorriente Albright ED250B-1 (Arc Components), 0,5 kg, y del sensor Bosch, 0,05 kg (supuesto).'),
    (264, 'cuk', 'Courier desde Europa por kilo', '=143/10', 'US$ por kg', 'Estimación',
     'Tarifa publicada por eShopex desde Europa, US$143 por 10 kg. Arc Components no publica la suya: pendiente de cotizar.'),
    (265, 'ara', 'Derecho ad valorem general', 0.06, '% del valor CIF', 'Dato publicado',
     'Servicio Nacional de Aduanas: 6% del valor CIF (costo, seguro y flete) para las mercancías sin tratado aplicable.'),
    (266, 'lote', 'Kits por embarque, promedio de los pedidos del modelo', '=SUM(Mensual!D39:CC39)/MAX(1,COUNTIF(Mensual!D39:CC39,">0"))',
     'kits', 'Cálculo', 'Promedio de los pedidos mensuales del modelo (fila 39 del motor mensual); solo informa el costo por kit con '
     'el embarque promedio en la hoja 1.2.'),
]
for rr, clave, et, val, uni, est, fue in LOG:
    d.cell(rr, 1).value = clave
    fila_dato(rr, et, val, uni, est, fue)
for rr in (253, 255, 262, 265):
    d.cell(rr, 3).number_format = '0.00%'
# Fila 101: costo fijo por embarque, desde la hoja 1.2; fila 102: ya no se usa (recargo de pedidos pequeños)
d['A101'] = 'lfij'
fila_dato(101, 'Costo logístico fijo por embarque (se paga en cada pedido)', f"='1.2 Costo del kit'!L{fij}", '$', 'Cálculo',
          'Hoja 1.2, pie de la tabla: cargos locales del embarque marítimo y parte fija de los paquetes del courier, con el derecho '
          'sobre esa parte del flete. Reemplaza al recargo de pedidos bajo 20 kits.')
d['A102'] = 'lfij_n'
fila_dato(102, 'Embarques por pedido', 1, 'embarques', 'Supuesto',
          'Cada pedido mensual viaja como un embarque marítimo consolidado y un envío de courier por proveedor.')
for c in range(4, m.max_column + 1):
    x = get_column_letter(c)
    if isinstance(m.cell(3, c).value, int):
        m[f'{x}43'] = f'=IF({x}39>0,Datos!$C$101*Datos!$C$102,0)'
m['A43'] = 'Costo logístico fijo del embarque (cargos locales, mínimos del courier y manejo)'
m['A138'] = 'Costo logístico fijo de los embarques (costo del período en que se paga)'
an = w['Anual']
if isinstance(an['A80'].value, str) and 'flete' in an['A80'].value.lower():
    an['A80'] = 'Costo logístico fijo de los embarques'

nt = w['Notas y cambios']
for row in nt.iter_rows():
    for z in row:
        if isinstance(z.value, str) and z.value.startswith('Financiamiento por terceros; no cartera propia.'):
            z.value = ('Financiamiento por terceros; no cartera propia. 30% al agendar y saldo al instalar. Desde el '
                       '14-11-2026 la comisión de medios de pago se pondera por la encuesta (40,0% tarjeta de crédito, '
                       '44,2% crédito bancario del cliente y 15,8% contado) con la tarifa publicada de 2,19% + IVA para '
                       'tarjeta de crédito, cobrada sobre el precio con IVA: 1,04% de la venta neta. El crédito bancario y el contado llegan por '
                       'transferencia y no pagan comisión.')
assert nt['B61'].value is None and nt['B62'].value is None and nt['B63'].value.startswith('Conciliación')
estilo_como(nt['B61'], nt['B57'])
estilo_como(nt['B62'], nt['B58'])
nt['B61'] = 'Decisiones del 14-11-2026 (reunión con el profesor guía)'
nt['B62'] = ('1) El piloto y la transición quedan fuera de la evaluación: el flujo parte con la preapertura, cuando ya existe '
             'el reglamento (Datos!C24 = 0; con 1 se recupera el cálculo anterior). El escáner y las herramientas que '
             'compraba el piloto se compran al iniciar la preapertura. Alcance: se evalúa la etapa comercial, una vez terminado el '
             'piloto y publicado el reglamento. La etapa previa se financiaría con un fondo público de I+D aún no adjudicado; '
             'una evaluación del desarrollo completo tendría que sumarla. 2) La comisión de medios de pago pasa de 2% supuesto '
             'a 1,04% del ingreso neto, ponderada por la encuesta y la tarifa publicada sobre el precio con IVA (Datos, filas 37 a 40). 3) Los equipos se respaldan con el '
             'precio del fabricante, importador o distribuidor (hoja 1.1) y el costo del kit se arma pieza por pieza (hoja 1.2), '
             'con el dólar y el euro de Datos (filas 14 y 15).')
nt.merge_cells('B62:H62')
nt.row_dimensions[62].height = 122
for r, alto in {23: 62, 24: 46, 96: 46, 97: 76, 162: 62, 37: 32, 38: 32, 39: 32, 40: 62, 54: 32}.items():
    d.row_dimensions[r].height = alto
    for c in (6, 7):
        al = copy.copy(d.cell(r, c).alignment)
        al.wrap_text = True
        al.vertical = 'center'
        d.cell(r, c).alignment = al
w.save(SAL)
print(f'Decisiones aplicadas: {n} celdas del piloto y la transición con selector; medios de pago ponderados.')
