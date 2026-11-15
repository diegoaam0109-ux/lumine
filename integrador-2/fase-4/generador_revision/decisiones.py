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
             'a 0,88% ponderado por la encuesta y la tarifa publicada (Datos, filas 37 a 40).')
nt.merge_cells('B62:H62')
nt.row_dimensions[62].height = 62
for r, alto in {24: 46, 37: 32, 38: 32, 39: 32, 40: 62, 54: 32}.items():
    d.row_dimensions[r].height = alto
    for c in (6, 7):
        al = copy.copy(d.cell(r, c).alignment)
        al.wrap_text = True
        al.vertical = 'center'
        d.cell(r, c).alignment = al
w.save(SAL)
print(f'Decisiones aplicadas: {n} celdas del piloto y la transición con selector; medios de pago ponderados.')
