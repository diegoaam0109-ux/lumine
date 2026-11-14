"""Base de cálculo mensual de Lumine Motors (piloto a año 5). Genera el Excel con fórmulas."""
import sys, re, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter as L

OUT = sys.argv[1]
NPRE, NOP = 18, 60                    # 12 de piloto, 3 de transición, 3 de preapertura; 60 de operación
N = NPRE + NOP
C0 = 4                                # primera columna de meses (D)
MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
wb = Workbook()
wsS = wb.active; wsS.title = 'Supuestos'
wsM = wb.create_sheet('Mensual'); wsA = wb.create_sheet('Anual'); wsE = wb.create_sheet('Escenarios'); wsL = wb.create_sheet('Leeme')
BOLD = Font(bold=True); HEAD = PatternFill('solid', fgColor='0E2A47'); HF = Font(bold=True, color='FFFFFF')
INP = PatternFill('solid', fgColor='FFF2CC'); SEC = PatternFill('solid', fgColor='E8F2FC')

# ------------------------------------------------------------------ Supuestos
S = {}
wsS.append(['Clave', 'Supuesto', 'Valor', 'Unidad', 'Tipo', 'Fuente o criterio'])
for c in wsS[1]: c.font = HF; c.fill = HEAD


def sec(t):
    wsS.append([None, t]); wsS.cell(wsS.max_row, 2).font = BOLD
    for c in wsS[wsS.max_row]: c.fill = SEC


def sup(k, label, v, unit, tipo, fuente):
    wsS.append([k, label, v, unit, tipo, fuente]); r = wsS.max_row
    S[k] = "Supuestos!$C$%d" % r
    if not (isinstance(v, str) and v.startswith('=')): wsS.cell(r, 3).fill = INP
    return r


def sx(expr):
    return re.sub(r'\{(\w+)\}', lambda m: S[m.group(1)], expr)


sec('General')
sup('esc', 'Escenario activo (1 bajo, 2 central, 3 alto)', 2, 'selector', 'Decisión', 'Cambiar para recalcular todo el libro')
sup('iva', 'IVA', 0.19, '%', 'Dato', 'D.L. N° 825')
sec('Precio y costo por instalación (pesos)')
sup('p_es', 'Precio Esencial, con IVA', 4590000, '$', 'Decisión del equipo (13-11-2026)', 'Sube $300.000; queda bajo los $4.990.000 que aceptó el techo de adopción')
sup('p_pl', 'Precio Plus, con IVA', 5290000, '$', 'Decisión del equipo (13-11-2026)', 'Sube $300.000; 25 de los 32 conductores del foco con intención definitiva aceptaron $5.990.000 en la encuesta (5 más aceptaron solo $4.990.000)')
sup('mix', 'Participación de Plus', 0.6, '%', 'Supuesto', 'Fase 3, Tabla 1')
sup('precio', 'Ingreso neto por instalación (mezcla)', sx('=((1-{mix})*{p_es}+{mix}*{p_pl})/(1+{iva})'), '$ netos', 'Cálculo', '')
sup('k_es', 'Costo directo del kit Esencial', 3031028, '$ netos', 'Dato documentado', 'Anexo 9: precios publicados, dólar $981,58')
sup('k_pl', 'Costo directo del kit Plus', 3396013, '$ netos', 'Dato documentado', 'Anexo 9')
sup('kit', 'Costo directo del kit (mezcla)', sx('=(1-{mix})*{k_es}+{mix}*{k_pl}'), '$ netos', 'Cálculo', '')
sup('gar', 'Provisión de garantía sobre el costo del kit', 0.03, '%', 'Supuesto', 'Fase 3, Tabla 36')
sup('medios', 'Medios de pago, evaluación de crédito e incobrables', 0.02, '% del ingreso', 'Supuesto', 'Fase 3, Tabla 36')
sup('com', 'Comisión por instalación (bruta)', 15000, '$', 'Decisión del equipo', 'Fase 3, compensaciones')
sup('sello', 'Sello de instalación certificada', 5000, '$', 'Supuesto', 'Fase 3, Tabla 27')
sup('ref', 'Premio por referido', 50000, '$', 'Decisión del equipo', 'Fase 3, promoción')
sup('refp', 'Instalaciones que pagan premio de referido', 0.15, '%', 'Supuesto (tope de gasto)', 'Fase 3, Tabla 27')
sup('dpil', 'Descuento al cliente piloto de cada modelo nuevo', 0.5, '%', 'Decisión del equipo', 'Fase 3, promoción')
sup('pie', 'Pie al agendar', 0.3, '%', 'Decisión del equipo', 'Fase 3, Tabla 1')
sec('Embudo comercial')
sup('cq1', 'Costo por cotización digital, escenario bajo', 15000, '$', 'Supuesto', 'Sensibilidad')
sup('cq2', 'Costo por cotización digital, escenario central', 10000, '$', 'Supuesto provisional', 'Fase 3, Tabla 1')
sup('cq3', 'Costo por cotización digital, escenario alto', 7500, '$', 'Supuesto', 'Sensibilidad')
sup('cq', 'Costo por cotización del escenario activo', sx('=CHOOSE({esc},{cq1},{cq2},{cq3})'), '$', 'Cálculo', '')
sup('vis', 'Cotizaciones por visitas a líneas de colectivos', 30, 'al mes', 'Supuesto provisional', 'Fase 3, Tabla 21')
sup('cr1', 'Conversión de régimen, bajo', 0.20, '%', 'Supuesto', 'Sensibilidad')
sup('cr2', 'Conversión de régimen, central', 0.30, '%', 'Supuesto provisional', 'Fase 3, Tabla 1')
sup('cr3', 'Conversión de régimen, alto', 0.30, '%', 'Supuesto', 'Igual a la central; se alcanza antes')
sup('ci1', 'Conversión del primer mes, bajo', 0.10, '%', 'Supuesto', 'Mitad del régimen: solo hay evidencia del piloto')
sup('ci2', 'Conversión del primer mes, central', 0.15, '%', 'Supuesto', 'Mitad del régimen: solo hay evidencia del piloto')
sup('ci3', 'Conversión del primer mes, alto', 0.20, '%', 'Supuesto', '')
sup('mr1', 'Meses hasta la conversión de régimen, bajo', 12, 'meses', 'Supuesto', 'Casos de clientes medidos')
sup('mr2', 'Meses hasta la conversión de régimen, central', 12, 'meses', 'Supuesto', 'Casos de clientes medidos')
sup('mr3', 'Meses hasta la conversión de régimen, alto', 6, 'meses', 'Supuesto', '')
sup('cr', 'Conversión de régimen activa', sx('=CHOOSE({esc},{cr1},{cr2},{cr3})'), '%', 'Cálculo', '')
sup('ci', 'Conversión inicial activa', sx('=CHOOSE({esc},{ci1},{ci2},{ci3})'), '%', 'Cálculo', '')
sup('mr', 'Meses de rampa activos', sx('=CHOOSE({esc},{mr1},{mr2},{mr3})'), 'meses', 'Cálculo', '')
sup('canc', 'Pedidos pendientes que se cancelan cada mes', 0.05, '%', 'Supuesto', 'Sin dato observado; el pie se devuelve')
sec('Capacidad')
sup('capd', 'Capacidad de un dúo', 15, 'vehículos al mes', 'Estimación del equipo', '8,4 h por vehículo; 126 h de 173 al mes; el resto es formación, postventa y retrabajos')
sup('ap1', 'Rendimiento del dúo en su primer mes', 0.6, '%', 'Supuesto', 'Aprendizaje y supervisión directa')
sup('ap2', 'Rendimiento del dúo en su segundo mes', 0.8, '%', 'Supuesto', 'Aprendizaje')
sup('umb', 'Umbral de uso que gatilla un dúo nuevo', 0.8, '%', 'Decisión del equipo', 'Fase 3, regla de capacidad')
DUOS = {1: [1, 0, 0, 0, 0, 0], 2: [1, 0, 0, 0, 0, 0], 3: [1, 0, 0, 0, 0, 0]}   # se completan con plan_duos()
duo_rows = {}
for e, name in ((1, 'bajo'), (2, 'central'), (3, 'alto')):
    for k in range(1, 7):
        duo_rows[(e, k)] = sup('d%d_%d' % (e, k), 'Mes de operación en que entra el dúo %d, %s (0 = no entra)' % (k, name), 0, 'mes', 'Resultado de la regla', 'Primer mes en que los pedidos previstos superan el 80% de la capacidad anterior; no antes del mes 6')
for k in range(1, 7):
    sup('d%d' % k, 'Entrada del dúo %d, escenario activo' % k, sx('=CHOOSE({esc},{d1_%d},{d2_%d},{d3_%d})' % (k, k, k)), 'mes', 'Cálculo', '')
sec('Abastecimiento')
sup('ss', 'Stock de seguridad', 0.5, 'meses de pedidos', 'Decisión', 'Dos semanas: cubre el error de pronóstico y la mezcla de versiones')
sup('lmin', 'Pedido mínimo al proveedor', 10, 'kits', 'Supuesto', 'Sin cotización; rango de 5 a 20')
sup('lmul', 'Múltiplo de pedido', 5, 'kits', 'Supuesto', '')
sup('ant', 'Anticipo al proveedor al pedir', 0.3, '%', 'Supuesto', 'Fase 3, existencias; el saldo se paga el mes siguiente')
sup('lumb', 'Tamaño bajo el cual el flete se encarece', 20, 'kits', 'Supuesto', 'Sin cotización')
sup('rfl', 'Recargo de flete por kit en pedidos pequeños', 62500, '$', 'Supuesto', '50% del flete del Anexo 9; rango de 0% a 100%')
sec('Rentas brutas mensuales (pesos de 2026)')
for k, lab, v in (('r_gg', 'Gerencia General', 2470000), ('r_rt', 'Responsable Técnico', 1700000), ('r_ic', 'Ingeniería de Calibración', 1500000), ('r_adm', 'Administración y Personas', 900000),
                  ('r_com', 'Comercial y postventa', 850000), ('r_n1', 'Técnico N1', 700000), ('r_n2', 'Técnico N2', 770000), ('r_n3', 'Técnico N3', 840000), ('r_n4', 'Técnico N4', 900000),
                  ('r_sop', 'Soporte técnico de la red', 900000), ('r_pla', 'Plataforma de la red, media jornada a honorarios', 450000), ('r_asi', 'Asistente', 692000)):
    sup(k, lab, v, '$', 'Dato y supuesto', 'Fase 3, Tabla 30')
sup('b2', 'Bono por validar N2', 140000, '$', 'Decisión del equipo', 'Dos meses del alza de renta')
sup('b3', 'Bono por validar N3', 140000, '$', 'Decisión del equipo', 'Dos meses del alza de renta')
sup('b4', 'Bono por validar N4', 120000, '$', 'Decisión del equipo', 'Dos meses del alza de renta')
sup('jtec', 'Jornada de técnico contratado por servicio en el piloto', 60000, '$ por día', 'Supuesto', 'Renta de un N3 más recargo por servicio')
sec('Operación del taller')
sup('arr', 'Arriendo del local', 3600000, '$ al mes', 'Dato', 'Aviso publicado de taller de 400 m²')
sup('serv', 'Servicios básicos', 700000, '$ al mes', 'Supuesto', 'Fase 3, Tabla 35')
sup('seg', 'Seguros', 600000, '$ al mes', 'Supuesto', 'Fase 3, Tabla 35')
sup('mant', 'Mantención anual de equipos', 0.03, '% del equipamiento', 'Supuesto', 'Fase 3, Tabla 35')
sup('plat', 'Plataformas: alojamiento y mantención', 375000, '$ al mes', 'Supuesto', 'Fase 3, Tabla 35')
sup('epp', 'Curso externo de alta tensión y elementos de protección', 750000, '$ por técnico', 'Supuesto', 'Fase 3, Tabla 35')
sec('Equipamiento (pesos, netos)')
for k, lab, v, vu in (('e_din', 'Dinamómetro de chasis', 22423170, 10), ('e_esc', 'Escáner automotriz', 1429000, 5), ('e_bod', 'Bodega de baterías clase 9', 4000000, 10),
                      ('e_hab', 'Habilitación del local', 15000000, 5), ('e_mob', 'Mobiliario y computadores', 4000000, 5), ('e_ele', 'Elevador, por puesto', 2150000, 10), ('e_her', 'Herramientas de alta tensión, por puesto', 1200000, 5)):
    sup(k, lab, v, '$', 'Dato y supuesto', 'Fase 3, Tabla 34. Vida útil para depreciar: %d años (criterio del equipo, lineal)' % vu)
sec('Red Lumine')
sup('ent', 'Paquete de entrada por taller', 6000000, '$', 'Supuesto con referencia', 'Fase 3, precio de la red')
sup('cuo', 'Cuota mensual por taller', 250000, '$', 'Supuesto', 'Fase 3')
sup('hab', 'Habilita por técnico inscrito', 45000, '$ al mes', 'Supuesto con referencia', 'Fase 3')
sup('tred', 'Técnicos inscritos por taller', 2, 'técnicos', 'Supuesto', 'Fase 3')
sup('cred', 'Comisión por taller incorporado', 0.05, '% de la entrada', 'Decisión del equipo', 'Fase 3')
sup('aud', 'Costo de la auditoría anual por taller', 300000, '$', 'Supuesto', 'Viaje y dos días del auditor')
sec('Piloto')
sup('pk_es', 'Kits Esencial del piloto', 2, 'kits', 'Decisión', 'Dos perfiles del foco con una versión cada uno')
sup('pk_pl', 'Kits Plus del piloto', 4, 'kits', 'Decisión', 'Versión de mayor peso en la mezcla, replicada en ambos perfiles')
sup('prec', 'Recargo por compra unitaria del lote piloto', 0.10, '%', 'Supuesto', 'Sin descuento por volumen y con envío expreso')
sup('prep', 'Repuestos del piloto', 0.05, '% del lote', 'Supuesto', '')
sup('ppuesto', 'Puesto con elevador arrendado por uso', 900000, '$ al mes', 'Supuesto', 'Arriendo de referencia dividido en seis puestos, más 50% por servicios')
sup('pinsp', 'Uso del puesto en los meses de inspección', 150000, '$ al mes', 'Supuesto', 'Un día al mes')
sup('pens', 'Ensayo controlado de consumo, por vehículo', 400000, '$', 'Supuesto', 'Sin cotización; rango de $250.000 a $600.000')
sup('pter', 'Medición independiente: protocolo, seguimiento e informe', 6000000, '$', 'Supuesto', 'Sin cotización; rango de 4 a 9 millones')
sup('ptel', 'Telemetría: equipo por vehículo', 60000, '$', 'Supuesto', '')
sup('ptelm', 'Telemetría: plan mensual por vehículo', 15000, '$', 'Supuesto', '')
sup('pseg', 'Seguro de responsabilidad civil del proyecto', 1500000, '$', 'Supuesto', 'Sin cotización')
sup('ptra', 'Notaría, garantías y trámites', 500000, '$', 'Supuesto', '')
sup('pcomp', 'Compensación al conductor por día sin auto', 50000, '$', 'Supuesto', 'Cuatro días por vehículo')
sup('ptrans', 'Bodegaje en la transición', 100000, '$ al mes', 'Supuesto', '')
sup('paut', 'Trámites de la autorización del taller', 1000000, '$', 'Supuesto', 'Sin arancel publicado')

# ------------------------------------------------------------------ Mensual
ROW = {}; order = []


def col(c):               # c = 1..N
    return L(C0 + c - 1)


def fx(tmpl, c):
    """[clave] misma columna; [clave-1] columna anterior (0 si no existe); [clave+2] posterior (última si no existe); {clave} supuesto."""
    def rep(m):
        k, off = m.group(1), int(m.group(2) or 0)
        cc = c + off
        if cc < 1: return '0'
        cc = min(cc, N)
        return '%s%d' % (col(cc), ROW[k])
    return sx(re.sub(r'\[(\w+)([+-]\d+)?\]', rep, tmpl))


SPEC = []
_next = [2]


def row(k, label, unit, content, section=None):
    if section: _next[0] += 1
    ROW[k] = _next[0]; _next[0] += 1; order.append(k)
    SPEC.append((k, label, unit, content, section))


def build_rows():
    for k, label, unit, content, section in SPEC:
        r = ROW[k]
        if section:
            wsM.cell(r - 1, 1, section).font = BOLD
            for cc in range(1, C0 + N): wsM.cell(r - 1, cc).fill = SEC
        wsM.cell(r, 1, label); wsM.cell(r, 2, unit)
        for c in range(1, N + 1):
            v = content(c) if callable(content) else content
            if isinstance(v, str) and v.startswith('='): v = fx(v, c)
            cell = wsM.cell(r, C0 + c - 1, v)
            if not (isinstance(v, str) and str(v).startswith('=')) and k not in ('c', 'fecha', 'etapa', 'anio', 'm', 'fac'): cell.fill = INP
        if unit in ('$', 'vehículos', 'kits', 'cotizaciones'):
            wsM.cell(r, 3, '=SUM(%s%d:%s%d)' % (col(1), r, col(N), r))


def m_of(c): return c - NPRE
def fecha(c):
    y, mo = divmod(c - 1, 12); return '%s %d' % (MES[mo], 2027 + y)
def etapa(c): return 'Piloto' if c <= 12 else 'Transición' if c <= 15 else 'Preapertura' if c <= NPRE else 'Operación'
def anio(c): return 0 if c <= NPRE else (m_of(c) - 1) // 12 + 1
def factor(c):
    d = datetime.date(2027 + (c - 1) // 12, (c - 1) % 12 + 1, 1)
    return 1.0938 if d < datetime.date(2027, 8, 1) else 1.1013 if d < datetime.date(2028, 8, 1) else 1.1088 if d < datetime.date(2030, 8, 1) else 1.1298


wsM.append(['Concepto', 'Unidad', 'Total'] + [None] * N)
for c in wsM[1]: c.font = HF; c.fill = HEAD
row('c', 'Mes del calendario', 'n', lambda c: c, 'CALENDARIO BASE (enero de 2027 = mes 1; la norma se supone publicada al inicio del mes 16)')
row('fecha', 'Fecha del calendario base', '', fecha)
row('etapa', 'Etapa', '', etapa)
row('anio', 'Año de operación (0 = antes de abrir)', 'n', anio)
row('m', 'Mes de operación', 'n', m_of)
row('fac', 'Factor de costo empresa (Ley N° 21.735, cesantía y Ley N° 16.744)', 'factor', factor)

# --- embudo
def pauta(c):
    m = m_of(c)
    if m < 1: return 0
    return 700000 if m <= 3 else 1000000 if m <= 6 else 1300000 if m <= 9 else 1500000 if m <= 24 else 2000000 if m <= 48 else 2500000
COB = [0.19, 0.47, 0.64, 0.71, 0.77]
def cob(c):
    m = m_of(c); return 0 if m < 1 else COB[m - 1] if m <= 5 else 0.80
row('pauta', 'Pauta digital', '$', pauta, 'EMBUDO COMERCIAL')
row('cotd', 'Cotizaciones digitales', 'cotizaciones', '=IF([m]>=1,[pauta]/{cq},0)')
row('cotv', 'Cotizaciones por visitas a líneas', 'cotizaciones', '=IF([m]>=1,{vis},0)')
row('cot', 'Cotizaciones totales', 'cotizaciones', '=[cotd]+[cotv]')
row('cob', 'Cotizaciones con modelo calibrado (cobertura de la biblioteca)', '%', cob)
row('conv', 'Conversión de cotización cubierta a pedido', '%', '=IF([m]>=1,MIN({cr},{ci}+({cr}-{ci})/{mr}*([m]-1)),0)')
row('ped', 'Pedidos nuevos', 'vehículos', '=[cot]*[cob]*[conv]')
# --- capacidad
for k in range(1, 7):
    row('cap%d' % k, 'Capacidad del dúo %d' % k, 'veh/mes', '=IF(OR({d%d}=0,[m]<{d%d}),0,IF([m]={d%d},{ap1},IF([m]={d%d}+1,{ap2},1))*{capd})' % (k, k, k, k), 'CAPACIDAD' if k == 1 else None)
row('cap', 'Capacidad operativa', 'veh/mes', '=' + '+'.join('[cap%d]' % k for k in range(1, 7)))
row('duos', 'Dúos en operación', 'n', '=' + '+'.join('IF(AND({d%d}>0,[m]>={d%d}),1,0)' % (k, k) for k in range(1, 7)))
row('uso', 'Pedidos sobre capacidad nominal de los dúos en operación', '%', '=IF([duos]>0,[ped]/([duos]*{capd}),0)')
# --- pedidos, instalaciones y pendientes
row('pini', 'Pendientes al inicio', 'veh', '=[pfin-1]', 'PEDIDOS, INSTALACIONES Y PENDIENTES')
row('canc', 'Cancelaciones', 'vehículos', '={canc}*[pini]')
row('recep', 'Kits recibidos', 'kits', '=[compra-2]')
row('iini', 'Inventario comercial al inicio', 'kits', '=[ifin-1]')
row('inst', 'Instalaciones', 'vehículos', '=MAX(0,MIN([cap],[pini]-[canc]+[ped],[iini]+[recep]))')
row('pfin', 'Pendientes al cierre', 'veh', '=[pini]-[canc]+[ped]-[inst]')
row('espera', 'Espera al cierre, en semanas de capacidad', 'semanas', '=IF([cap]>0,[pfin]/[cap]*4.33,0)')
row('parque', 'Parque instalado acumulado', 'veh', '=[parque-1]+[inst]')
# --- abastecimiento
row('nec', 'Necesidad neta al pedir', 'kits', '=IF([c]<16,0,MAX(0,[ped]+[ped+1]+[ped+2]+{ss}*[ped+3]+[pini]-[iini]-[recep]-[compra-1]))', 'ABASTECIMIENTO (pedido al proveedor: llega dos meses después)')
row('compra', 'Pedido al proveedor', 'kits', '=IF([nec]<=0,0,MAX({lmin},CEILING([nec],{lmul})))')
row('ifin', 'Inventario comercial al cierre', 'kits', '=[iini]+[recep]-[inst]')
row('trans', 'Kits en tránsito al cierre', 'kits', '=[compra]+[compra-1]')
row('compr', 'Kits en bodega comprometidos con pedidos', 'kits', '=MIN([ifin],[pfin])')
row('fext', 'Recargo de flete por pedido pequeño', '$', '=IF(AND([compra]>0,[compra]<{lumb}),[compra]*{rfl},0)')
row('pprov', 'Pagos al proveedor (anticipo y saldo)', '$', '={ant}*[compra]*{kit}+(1-{ant})*[compra-1]*{kit}+[fext]')
row('vinv', 'Inventario en bodega, valorizado', '$ saldo', '=[ifin]*{kit}')
row('vant', 'Kits pagados y en tránsito', '$ saldo', '=({ant}*[compra]+[compra-1])*{kit}')
row('vpp', 'Saldo comprometido con el proveedor por pedidos en curso (se paga el mes siguiente)', '$ saldo', '=(1-{ant})*[compra]*{kit}')
row('vpie', 'Pies recibidos de pedidos pendientes', '$ saldo', '={pie}*{precio}*(1+{iva})*[pfin]')
# --- ingresos
def npil(c):
    m = m_of(c)
    if m < 1: return 0
    if m <= 6: return [2, 2, 2, 2, 2, 1][m - 1]
    y = anio(c); mm = (m - 1) % 12 + 1
    if y == 1: return 0
    if y == 2: return 1 if mm in (1, 2, 4, 5, 7, 8, 10, 11) else 0
    return 1 if mm in (1, 4, 7, 10) else 0
def tall(c):
    m = m_of(c)
    if m < 25: return 0
    y = anio(c); mm = (m - 1) % 12 + 1
    return {3: {2: 1, 6: 1, 10: 1}, 4: {1: 1, 3: 1, 6: 1, 8: 1, 11: 1}, 5: {1: 1, 2: 1, 4: 1, 5: 1, 7: 1, 8: 1, 10: 1, 11: 1}}[y].get(mm, 0)
row('npil', 'Clientes piloto (un modelo nuevo calibrado cada uno)', 'vehículos', npil, 'INGRESOS (netos de IVA)')
row('desc', 'Descuento a clientes piloto', '$', '=[npil]*{dpil}*{precio}')
row('ing', 'Ingresos por instalaciones (devengados al instalar)', '$', '=[inst]*{precio}-[desc]')
row('tnue', 'Talleres incorporados a la Red Lumine', 'n', tall)
row('tacu', 'Talleres de la red, acumulados', 'n', '=[tacu-1]+[tnue]')
row('ired', 'Ingresos de la Red Lumine', '$', '=[tnue]*{ent}+[tacu-1]*({cuo}+{tred}*{hab})')
row('cobros', 'Cobros de instalaciones (pie al pedir, saldo al instalar)', '$', '={pie}*{precio}*([ped]-[canc])+(1-{pie})*{precio}*[inst]-[desc]')
# --- costos variables
row('ckit', 'Costo de los kits instalados', '$', '=[inst]*{kit}', 'COSTOS VARIABLES (devengados)')
row('cgar', 'Garantía', '$', '={gar}*[ckit]')
row('cmed', 'Medios de pago, evaluación de crédito e incobrables', '$', '={medios}*[ing]')
row('ccom', 'Comisión, sello y referidos', '$', '=[inst]*({com}*[fac]+{sello}+{ref}*{refp})+{cred}*[tnue]*{ent}*[fac]')
row('mc', 'Margen de contribución de las instalaciones', '$', '=[ing]-[ckit]-[cgar]-[cmed]-[inst]*({com}*[fac]+{sello}+{ref}*{refp})')
# --- personas
def frac(vals):                      # dict de rangos de meses del calendario -> fracción
    def f(c):
        for (a, b), v in vals.items():
            if a <= c <= b: return v
        return 0
    return f
row('h_rt', 'Responsable Técnico a honorarios (fracción de jornada)', 'jornadas', frac({(1, 3): .5, (4, 5): 1, (6, 10): .25, (11, 12): .5, (13, 15): .1}), 'PERSONAS: dotación (personas o fracción de jornada)')
row('h_ic', 'Ingeniería de Calibración a honorarios (fracción de jornada)', 'jornadas', frac({(1, 5): 1, (6, 12): .25, (13, 15): .1}))
row('h_soc', 'Socios: aporte de trabajo sin remuneración (jornadas equivalentes)', 'jornadas', frac({(1, 12): .75, (13, 15): .3, (16, 18): 3}))
row('n_gg', 'Gerencia General (socio)', 'personas', lambda c: 1 if c > NPRE else 0)
row('n_rt', 'Responsable Técnico y jefe de taller', 'personas', lambda c: 1 if c >= 16 else 0)
row('n_ic', 'Ingeniería de Calibración', 'personas', '=IF([c]<16,0,IF([tacu-1]>=5,2,1))')
row('n_adm', 'Administración y Personas (socio)', 'personas', lambda c: 1 if c > NPRE else 0)
row('n_com', 'Comercial y postventa (un socio; el segundo cargo entra sobre 50 pedidos al mes, unas 600 instalaciones al año)', 'personas', '=IF([m]<1,0,IF([ped]>50,2,1))')
row('n_asi', 'Asistente de postventa (uno por cada 1.000 autos instalados)', 'personas', '=IF([m]<1,0,INT([parque-1]/1000))')
row('n_cer', 'Comercial de empresas y red (desde cinco talleres)', 'personas', '=IF([tacu-1]>=5,1,0)')
row('n_sop', 'Soporte técnico de la red (uno por cada 15 talleres)', 'personas', '=IF([tacu]>=1,ROUNDUP([tacu]/15,0),0)')
row('n_pla', 'Plataforma de la red (media jornada a honorarios)', 'personas', '=IF([tacu]>=1,1,0)')
for k in range(1, 7):
    # cada dúo se contrata dos meses antes de operar; el mes previo cursa la formación externa con precontrato
    row('ten%d' % k, 'Antigüedad de los técnicos del dúo %d' % k, 'meses', '=IF({d%d}=0,0,MAX(0,[m]-({d%d}-2)+1))' % (k, k))
row('n_tec', 'Técnicos instaladores contratados', 'personas', '=2*(' + '+'.join('IF([ten%d]>0,1,0)' % k for k in range(1, 7)) + ')')
row('n_tot', 'Dotación contratada', 'personas', '=[n_gg]+[n_rt]+[n_ic]+[n_adm]+[n_com]+[n_asi]+[n_cer]+[n_sop]+[n_pla]+[n_tec]')
row('s_hon', 'Honorarios del Responsable Técnico y de Ingeniería de Calibración', '$', '=[h_rt]*{r_rt}+[h_ic]*{r_ic}', 'PERSONAS: costo empresa')
row('s_soc', 'Aporte de trabajo de los socios, valorizado (no es caja)', '$ no caja', '=[h_soc]*{r_gg}')
row('s_gg', 'Gerencia General', '$', '=[n_gg]*{r_gg}*[fac]')
row('s_rt', 'Responsable Técnico', '$', '=[n_rt]*{r_rt}*[fac]')
row('s_ic', 'Ingeniería de Calibración', '$', '=[n_ic]*{r_ic}*[fac]')
row('s_adm', 'Administración y Personas', '$', '=[n_adm]*{r_adm}*[fac]')
row('s_com', 'Área Comercial, sin comisiones', '$', '=([n_com]+[n_cer])*{r_com}*[fac]+[n_asi]*{r_asi}*[fac]')
row('s_red', 'Plataforma y soporte de la red', '$', '=[n_sop]*{r_sop}*[fac]+[n_pla]*{r_pla}')
tec = '+'.join('2*[fac]*(IF([ten%d]<1,0,IF([ten%d]<=2,{r_n1},IF([ten%d]<=6,{r_n2},IF([ten%d]<=11,{r_n3},{r_n4}))))+IF([ten%d]=3,{b2},0)+IF([ten%d]=7,{b3},0)+IF([ten%d]=12,{b4},0))' % ((k,) * 7) for k in range(1, 7))
row('s_tec', 'Técnicos, con bonos por nivel', '$', '=' + tec)
row('s_tot', 'Nómina y honorarios', '$', '=[s_hon]+[s_gg]+[s_rt]+[s_ic]+[s_adm]+[s_com]+[s_red]+[s_tec]')
# --- operación del taller
row('o_arr', 'Arriendo', '$', lambda c: '={arr}' if c >= 16 else 0, 'OPERACIÓN DEL TALLER')
row('o_ser', 'Servicios básicos', '$', lambda c: '={serv}' if c >= 16 else 0)
row('o_seg', 'Seguros', '$', lambda c: '={seg}' if c >= 16 else 0)
row('o_man', 'Mantención de equipos', '$', '=IF([m]>=1,{mant}/12*[eacu-1],0)')
row('o_cur', 'Cursos externos y elementos de protección de técnicos nuevos', '$', '=2*{epp}*(' + '+'.join('IF(AND({d%d}>0,[m]={d%d}-3),1,0)' % (k, k) for k in range(1, 7)) + ')')
row('o_pla', 'Plataformas', '$', lambda c: '={plat}' if c > NPRE else 0)
row('o_aud', 'Auditoría anual de la red', '$', '=[tacu-1]*{aud}/12')
row('o_tot', 'Gasto de operación', '$', '=[o_arr]+[o_ser]+[o_seg]+[o_man]+[o_cur]+[o_pla]+[o_aud]')
# --- marketing
def lanz(c): return 1500000 if c in (18, 19) else 0
def casos(c): return 400000 if m_of(c) >= 7 else 0
def mat(c):
    y = anio(c); return 0 if y == 0 else {1: 3.0, 2: 2.0, 3: 3.5, 4: 2.0, 5: 3.5}[y] * 1e6 / 12
def conv_lin(c): return 4e6 / 12 if anio(c) >= 3 else 0
def pred(c):
    y = anio(c); return {3: 10e6, 4: 5e6, 5: 5e6}.get(y, 0) / 12
row('k_lan', 'Lanzamiento y demostraciones', '$', lanz, 'MARKETING (las comisiones, el sello y los referidos van en costos variables)')
row('k_cas', 'Casos con ahorro medido', '$', casos)
row('k_mat', 'Material para mecánicos, terminales y paraderos', '$', mat)
row('k_con', 'Convenios con líneas de colectivos', '$', conv_lin)
row('k_red', 'Promoción de la red entre talleres', '$', pred)
row('k_tot', 'Marketing fijo, con pauta', '$', '=[pauta]+[k_lan]+[k_cas]+[k_mat]+[k_con]+[k_red]')
# --- piloto, transición y preapertura
row('x_kit', 'Piloto: kits de prueba y repuestos', '$', lambda c: '={ant}*({pk_es}*{k_es}+{pk_pl}*{k_pl})*(1+{prec})*(1+{prep})' if c == 2 else '=(1-{ant})*({pk_es}*{k_es}+{pk_pl}*{k_pl})*(1+{prec})*(1+{prep})' if c == 3 else 0, 'PILOTO, TRANSICIÓN Y PREAPERTURA (desembolsos propios de cada etapa)')
row('x_esp', 'Piloto: puesto técnico arrendado por uso', '$', lambda c: '={ppuesto}' if c in (4, 5, 10, 11) else '={pinsp}' if 6 <= c <= 9 else 0)
row('x_ens', 'Piloto: ensayos controlados de consumo, antes y después', '$', lambda c: '=({pk_es}+{pk_pl})*{pens}' if c in (4, 10) else 0)
row('x_ter', 'Piloto: medición independiente', '$', lambda c: '=0.3*{pter}' if c in (3, 11) else '=0.4*{pter}' if c == 7 else 0)
row('x_tel', 'Piloto: telemetría', '$', lambda c: '=({pk_es}+{pk_pl})*({ptel}+{ptelm})' if c == 3 else '=({pk_es}+{pk_pl})*{ptelm}' if 4 <= c <= 10 else 0)
row('x_tec', 'Piloto: técnicos por servicio (instalación, inspección y retiro)', '$', lambda c: '=2*7*{jtec}' if c in (4, 5, 11) else 0)
row('x_seg', 'Piloto: seguro, trámites y compensación a conductores', '$', lambda c: '={ptra}' if c == 2 else '={pseg}+({pk_es}+{pk_pl})*2*{pcomp}' if c == 4 else '=({pk_es}+{pk_pl})*2*{pcomp}' if c == 11 else 0)
row('x_for', 'Piloto: formación en alta tensión y elementos de protección', '$', lambda c: '=4*{epp}' if c == 3 else 0)
row('x_tra', 'Transición: bodegaje', '$', lambda c: '={ptrans}' if 13 <= c <= 15 else 0)
row('x_aut', 'Preapertura: trámites de autorización y selección', '$', lambda c: '={paut}' if c == 16 else 0)
row('x_tot', 'Desembolsos propios de las etapas previas, sin personas', '$', '=[x_kit]+[x_esp]+[x_ens]+[x_ter]+[x_tel]+[x_tec]+[x_seg]+[x_for]+[x_tra]+[x_aut]')
# --- inversión
row('e_pil', 'Equipos comprados para el piloto: escáner y herramientas de alta tensión', '$', lambda c: '={e_esc}+{e_her}' if c == 3 else 0, 'INVERSIÓN')
row('e_loc', 'Habilitación del local, bodega de baterías y mobiliario', '$', lambda c: '={e_hab}+{e_bod}' if c == 16 else '={e_mob}' if c == 17 else 0)
row('e_din', 'Dinamómetro de chasis', '$', lambda c: '={e_din}' if c == 17 else 0)
row('e_pue', 'Puestos de trabajo: elevador y herramientas (el primero usa las herramientas del piloto)', '$', '=IF({d1}-1=[m],{e_ele},0)+' + '+'.join('IF(AND({d%d}>0,{d%d}-1=[m]),{e_ele}+{e_her},0)' % (k, k) for k in range(2, 7)))
row('e_tot', 'Inversión en equipamiento', '$', '=[e_pil]+[e_loc]+[e_din]+[e_pue]')
row('eacu', 'Equipamiento acumulado', '$ saldo', '=[eacu-1]+[e_tot]')
row('e_gar', 'Garantía de arriendo (un mes, recuperable)', '$', lambda c: '={arr}' if c == 16 else 0)
# --- IVA
row('v_deb', 'IVA de las ventas', '$', '={iva}*([cobros]+[ired])', 'IVA (efecto en caja)')
row('v_cre', 'IVA de kits recibidos, equipamiento, pauta y compras del piloto', '$', '={iva}*([recep]*{kit}+[fext]+[e_tot]+[k_tot]+[x_kit]+[x_ens]+[x_tel])')
row('v_rem', 'Remanente de crédito fiscal al cierre', '$ saldo', '=MAX(0,[v_rem-1]+[v_cre]-[v_deb])')
row('v_caj', 'Efecto del IVA en la caja del mes', '$', '=[v_rem-1]-[v_rem]')
# --- resultado y caja
row('fijo', 'Costos fijos y de estructura del mes', '$', '=[s_tot]+[o_tot]+[k_tot]+[x_tot]', 'RESULTADO OPERATIVO (devengado, antes de depreciación, intereses e impuestos)')
row('res', 'Resultado operativo', '$', '=[mc]+[ired]-{cred}*[tnue]*{ent}*[fac]-[fijo]')
row('f_ing', 'Entradas: cobros de instalaciones y de la red', '$', '=[cobros]+[ired]', 'FLUJO DE CAJA ANTES DE FINANCIAMIENTO')
row('f_egr', 'Salidas de operación', '$', '=[pprov]+[cgar]+[cmed]+[ccom]+[fijo]')
row('f_inv', 'Inversión y garantía de arriendo', '$', '=[e_tot]+[e_gar]')
row('flujo', 'Flujo de caja del mes', '$', '=[f_ing]-[f_egr]+[v_caj]-[f_inv]')
row('acum', 'Flujo acumulado (su mínimo es el financiamiento requerido)', '$ saldo', '=[acum-1]+[flujo]')
row('res12', 'Resultado operativo de los últimos doce meses', '$ saldo', lambda c: 0 if c < NPRE + 12 else '=SUM(%s{r}:%s{r})'.replace('{r}', str(ROW['res'])) % (col(c - 11), col(c)))
row('flu12', 'Flujo de caja de los últimos doce meses', '$ saldo', lambda c: 0 if c < NPRE + 12 else '=SUM(%s{r}:%s{r})'.replace('{r}', str(ROW['flujo'])) % (col(c - 11), col(c)))
row('respos', 'Mes de operación desde el que los últimos doce meses dan resultado operativo positivo', 'n', '=IF(AND([m]>=12,[res12]>0),[m],"")')
row('cajpos', 'Mes de operación desde el que los últimos doce meses dan flujo de caja positivo', 'n', '=IF(AND([m]>=12,[flu12]>0),[m],"")')
row('ct', 'Capital de trabajo operativo al cierre: inventario, kits pagados en tránsito y remanente de IVA, menos pies de pendientes', '$ saldo', '=[vinv]+[vant]+[v_rem]-[vpie]/(1+{iva})')
build_rows()
wsM.freeze_panes = 'D7'; wsM.column_dimensions['A'].width = 62; wsM.column_dimensions['B'].width = 12; wsM.column_dimensions['C'].width = 16

# ------------------------------------------------------------------ plan de dúos por escenario (misma regla)
def plan_duos(e):
    cq = {1: 15000, 2: 10000, 3: 7500}[e]; cr = {1: .2, 2: .3, 3: .3}[e]; ci = {1: .1, 2: .15, 3: .2}[e]; mr = {1: 12, 2: 12, 3: 6}[e]
    starts = [1]
    for m in range(1, NOP + 1):
        c = m + NPRE
        ped = (pauta(c) / cq + 30) * cob(c) * min(cr, ci + (cr - ci) / mr * (m - 1))
        if len(starts) < 6 and ped > 0.8 * 15 * len(starts) and m >= 6 and m > starts[-1]:
            starts.append(m)
    return starts + [0] * (6 - len(starts))
for e in (1, 2, 3):
    for k, v in enumerate(plan_duos(e), 1):
        wsS.cell(duo_rows[(e, k)], 3, v)
    print('escenario', e, 'dúos', plan_duos(e))

# ------------------------------------------------------------------ Anual
rng = lambda k: 'Mensual!$%s$%d:$%s$%d' % (col(1), ROW[k], col(N), ROW[k])
wsA.append(['Concepto', 'Piloto', 'Transición', 'Preapertura', 'Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5', 'Total'])
for c in wsA[1]: c.font = HF; c.fill = HEAD
AROW = {}
def arow(k, label, kind='sum', src=None):
    src = src or k; r = wsA.max_row + 1; AROW[k] = r
    cells = [label]
    for et, last in (('Piloto', 12), ('Transición', 15), ('Preapertura', 18)):
        cells.append('=SUMIFS(%s,%s,"%s")' % (rng(src), rng('etapa'), et) if kind == 'sum' else '=INDEX(%s,%d)' % (rng(src), last) if kind == 'fin' else None)
    cells.append('=B%d+C%d+D%d' % (r, r, r) if kind == 'sum' else '=D%d' % r if kind == 'fin' else None)
    for y in range(1, 6):
        if kind == 'sum': cells.append('=SUMIFS(%s,%s,%d)' % (rng(src), rng('anio'), y))
        elif kind == 'fin': cells.append('=INDEX(%s,%d)' % (rng(src), NPRE + 12 * y))
        elif kind in ('max', 'min'): cells.append('=%s(Mensual!%s%d:%s%d)' % (kind.upper(), col(NPRE + 12 * y - 11), ROW[src], col(NPRE + 12 * y), ROW[src]))
    cells.append('=SUM(E%d:J%d)' % (r, r) if kind == 'sum' else None)
    wsA.append(cells)
def asec(t):
    wsA.append([t]); wsA.cell(wsA.max_row, 1).font = BOLD
    for c in wsA[wsA.max_row]: c.fill = SEC
asec('Comercial y capacidad')
for k, lab, kind in (('cot', 'Cotizaciones', 'sum'), ('ped', 'Pedidos nuevos', 'sum'), ('canc', 'Cancelaciones', 'sum'), ('inst', 'Instalaciones', 'sum'), ('pfin', 'Pendientes al cierre', 'fin'),
                     ('duos', 'Dúos en operación al cierre', 'fin'), ('cap', 'Capacidad operativa', 'sum'), ('espera', 'Espera máxima del año (semanas de capacidad)', 'max'),
                     ('npil', 'Clientes piloto', 'sum'), ('parque', 'Parque instalado al cierre', 'fin'), ('tacu', 'Talleres de la red al cierre', 'fin')):
    arow(k, lab, kind)
asec('Abastecimiento')
for k, lab, kind in (('compra', 'Kits pedidos', 'sum'), ('recep', 'Kits recibidos', 'sum'), ('ifin', 'Inventario en bodega al cierre (kits)', 'fin'), ('trans', 'Kits en tránsito al cierre', 'fin'),
                     ('vinv', 'Inventario en bodega al cierre ($)', 'fin'), ('vant', 'Kits pagados y en tránsito al cierre ($)', 'fin'), ('vpp', 'Saldo comprometido con el proveedor al cierre ($)', 'fin'),
                     ('vpie', 'Pies de pedidos pendientes al cierre ($, con IVA)', 'fin'), ('ct', 'Capital de trabajo operativo al cierre ($)', 'fin')):
    arow(k, lab, kind)
asec('Dotación al cierre')
for k, lab in (('n_gg', 'Gerencia General'), ('n_rt', 'Responsable Técnico'), ('n_ic', 'Ingeniería de Calibración'), ('n_adm', 'Administración y Personas'), ('n_com', 'Comercial y postventa'),
               ('n_asi', 'Asistente de postventa'), ('n_cer', 'Comercial de empresas y red'), ('n_sop', 'Soporte técnico de la red'), ('n_pla', 'Plataforma de la red'), ('n_tec', 'Técnicos instaladores'), ('n_tot', 'Dotación contratada')):
    arow(k, lab, 'fin')
asec('Resultado operativo (pesos, netos de IVA)')
for k, lab in (('ing', 'Ingresos por instalaciones'), ('ired', 'Ingresos de la Red Lumine'), ('ckit', 'Costo de los kits instalados'), ('cgar', 'Garantía'), ('cmed', 'Medios de pago e incobrables'),
               ('ccom', 'Comisión, sello y referidos'), ('mc', 'Margen de contribución de las instalaciones'), ('s_hon', 'Honorarios técnicos'), ('s_gg', 'Gerencia General'), ('s_rt', 'Responsable Técnico'),
               ('s_ic', 'Ingeniería de Calibración'), ('s_tec', 'Técnicos, con bonos'), ('s_com', 'Área Comercial'), ('s_red', 'Plataforma y soporte de la red'), ('s_adm', 'Administración y Personas'),
               ('s_tot', 'Nómina y honorarios'), ('o_arr', 'Arriendo'), ('o_ser', 'Servicios básicos'), ('o_seg', 'Seguros'), ('o_man', 'Mantención de equipos'), ('o_cur', 'Cursos y elementos de protección'),
               ('o_pla', 'Plataformas'), ('o_aud', 'Auditoría de la red'), ('o_tot', 'Gasto de operación'), ('pauta', 'Pauta digital'), ('k_lan', 'Lanzamiento'), ('k_cas', 'Casos con ahorro medido'),
               ('k_mat', 'Material'), ('k_con', 'Convenios con líneas'), ('k_red', 'Promoción de la red'), ('k_tot', 'Marketing fijo'), ('x_kit', 'Kits de prueba y repuestos'), ('x_esp', 'Puesto técnico por uso'),
               ('x_ens', 'Ensayos controlados'), ('x_ter', 'Medición independiente'), ('x_tel', 'Telemetría'), ('x_tec', 'Técnicos por servicio'), ('x_seg', 'Seguro, trámites y compensaciones'),
               ('x_for', 'Formación y protección'), ('x_tra', 'Bodegaje'), ('x_aut', 'Autorización y selección'), ('x_tot', 'Desembolsos propios de las etapas previas'), ('fijo', 'Costos fijos y de estructura'),
               ('res', 'Resultado operativo'), ('s_soc', 'Aporte de trabajo de los socios, valorizado (no es caja)')):
    arow(k, lab)
asec('Caja antes de financiamiento')
for k, lab, kind in (('f_ing', 'Entradas', 'sum'), ('pprov', 'Pagos al proveedor de kits', 'sum'), ('f_egr', 'Salidas de operación', 'sum'), ('v_caj', 'Efecto del IVA', 'sum'), ('e_tot', 'Inversión en equipamiento', 'sum'),
                     ('e_gar', 'Garantía de arriendo', 'sum'), ('flujo', 'Flujo de caja', 'sum'), ('acum', 'Flujo acumulado al cierre', 'fin'), ('acum_min', 'Flujo acumulado mínimo del período', 'min')):
    arow(k, lab, kind, 'acum' if k == 'acum_min' else None)
asec('Indicadores')
r = wsA.max_row + 1
def ind(label, f):
    rr = wsA.max_row + 1
    wsA.append([label, None, None, None, None] + [f.format(c=L(5 + y), **{k: v for k, v in AROW.items()}) for y in range(1, 6)]); return rr
AROW['mcu'] = ind('Margen de contribución por instalación', '=IFERROR({c}{mc}/{c}{inst},0)')
AROW['peq'] = ind('Instalaciones que cubren los costos fijos del año, netos de la red (equilibrio operativo)', '=IFERROR(({c}{fijo}-{c}{ired})/{c}{mcu},0)')
AROW['usoa'] = ind('Uso de la capacidad', '=IFERROR({c}{inst}/{c}{cap},0)')
rr = wsA.max_row + 2
wsA.cell(rr, 1, 'Financiamiento requerido: mínimo del flujo acumulado').font = BOLD
wsA.cell(rr, 2, '=MIN(%s)' % rng('acum')); AROW['fin'] = rr
wsA.cell(rr + 1, 1, 'Mes del calendario en que ocurre'); wsA.cell(rr + 1, 2, '=MATCH(B%d,%s,0)' % (rr, rng('acum'))); AROW['finmes'] = rr + 1
wsA.cell(rr + 2, 1, 'Primer mes de operación en que los últimos doce meses dan resultado operativo positivo (0 = no ocurre)'); wsA.cell(rr + 2, 2, '=MIN(%s)' % rng('respos')); AROW['eqmes'] = rr + 2
wsA.cell(rr + 3, 1, 'Primer mes de operación en que los últimos doce meses dan flujo de caja positivo (0 = no ocurre)'); wsA.cell(rr + 3, 2, '=MIN(%s)' % rng('cajpos')); AROW['cajames'] = rr + 3
wsA.column_dimensions['A'].width = 70
for cc in 'BCDEFGHIJK': wsA.column_dimensions[cc].width = 16

# ------------------------------------------------------------------ Sensibilidad
wsX = wb.create_sheet('Sensibilidad', 3)
wsX.append(['Resultado operativo anual según el costo del kit (pesos; el resto de la base no cambia)', None, 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5', 'Primer año positivo'])
for c in wsX[1]: c.font = HF; c.fill = HEAD
for lab, red in (('Costo documentado (Anexo 9)', 0), ('Kit 5% más barato', 0.05), ('Kit 10% más barato', 0.10), ('Mejor caso del libro de costos, sin cotización (13,2% menos)', '=1-(0.4*2649042+0.6*2935293)/%s' % S['kit']), ('Kit 10% más caro', -0.10)):
    r = wsX.max_row + 1
    wsX.append([lab, red] + ['=Anual!%s%d+Anual!%s%d*%s*$B%d*(1+%s)' % (L(5 + y), AROW['res'], L(5 + y), AROW['inst'], S['kit'], r, S['gar']) for y in range(1, 6)] + ['=IFERROR(MATCH(TRUE,INDEX(C%d:G%d>0,0),0),0)' % (r, r)])
wsX.column_dimensions['A'].width = 70
for cc in 'BCDEFGH': wsX.column_dimensions[cc].width = 18

# ------------------------------------------------------------------ Léeme
for t in ('BASE DE CÁLCULO DE LUMINE MOTORS: PILOTO, TRANSICIÓN, PREAPERTURA Y CINCO AÑOS DE OPERACIÓN',
          'Alcance: reúne los cálculos de los planes de marketing, recursos humanos y operaciones (Fase 3). No evalúa rentabilidad: no contiene tasa de descuento, VAN ni TIR, ni fuentes de financiamiento.',
          'Reconstruida desde las fuentes del informe; no se concilió con ningún modelo financiero anterior.',
          'Unidades: pesos de 2026, netos de IVA salvo donde se indica; vehículos y kits en unidades con decimales (promedios mensuales).',
          'Hoja Supuestos: cada valor con su tipo (dato, resultado de la investigación, supuesto o decisión) y su fuente. Las celdas amarillas son entradas.',
          'Hoja Mensual: una columna por mes del calendario base (enero de 2027 a junio de 2033). Todas las cifras son fórmulas, salvo los calendarios de entrada en amarillo.',
          'Hoja Anual: resúmenes por etapa y por año, derivados de la hoja Mensual.',
          'Hoja Escenarios: resultados de los tres escenarios, copiados como valores tras recalcular el libro con el selector de Supuestos.',
          'Calendario base: es un supuesto. La norma y la autorización dependen de la autoridad; cada mes adicional de transición suma el costo mensual de esa etapa y desplaza todo lo que sigue.',
          'Conciliaciones: pendientes al cierre = pendientes al inicio − cancelaciones + pedidos − instalaciones; inventario al cierre = inventario al inicio + recepciones − instalaciones; las instalaciones no superan la capacidad ni los kits en bodega.'):
    wsL.append([t])
# rango de trabajo de los supuestos sin cotización (criterio del equipo para la sensibilidad)
RANGOS = {
 'mix': '50% a 70%', 'gar': '2% a 5%', 'medios': '1,5% a 3%', 'cq2': '$7.500 a $15.000 (escenarios)', 'vis': '15 a 45',
 'cr2': '20% a 30% (escenarios)', 'ci2': '10% a 20% (escenarios)', 'mr2': '6 a 12 meses (escenarios)', 'canc': '2% a 10%',
 'ap1': '50% a 70%', 'ap2': '70% a 90%', 'lmin': '5 a 20 kits', 'ant': '30% a 50%', 'lumb': '10 a 30 kits', 'rfl': '$0 a $125.000',
 'jtec': '$50.000 a $90.000', 'serv': '$500.000 a $1.000.000', 'seg': '$400.000 a $900.000', 'mant': '2% a 5%',
 'plat': '$250.000 a $600.000', 'epp': '$500.000 a $1.000.000', 'e_bod': '3 a 8 millones', 'e_hab': '10 a 25 millones',
 'e_mob': '3 a 6 millones', 'cuo': '$200.000 a $350.000', 'aud': '$200.000 a $500.000', 'prec': '0% a 20%', 'prep': '5% a 10%',
 'ppuesto': '$600.000 a $1.500.000', 'pinsp': '$100.000 a $300.000', 'pens': '$250.000 a $600.000', 'pter': '4 a 9 millones',
 'ptel': '$40.000 a $120.000', 'ptelm': '$10.000 a $25.000', 'pseg': '1 a 3 millones', 'ptra': '$300.000 a $1.000.000',
 'pcomp': '$40.000 a $70.000', 'ptrans': '$50.000 a $200.000', 'paut': '0,5 a 2 millones',
}
wsS.cell(1, 7, 'Rango de trabajo (supuesto)').font = HF; wsS.cell(1, 7).fill = HEAD
_n = 0
for _r in range(2, wsS.max_row + 1):
    _k = wsS.cell(_r, 1).value
    if _k in RANGOS: wsS.cell(_r, 7, RANGOS[_k]); _n += 1
assert _n == len(RANGOS), (_n, len(RANGOS), [k for k in RANGOS if k not in S])
wsS.column_dimensions['G'].width = 30
wsL.append(['Rangos: la columna G de Supuestos da el rango de trabajo de cada supuesto sin cotización. Es criterio del equipo para probar la sensibilidad; no proviene de proveedores y se reemplaza por la cotización cuando exista.'])
wsL.append(['Impuestos: la base llega al resultado operativo y al flujo de caja antes de financiamiento y de impuesto a la renta. El régimen tributario y sus beneficios se evalúan en el Plan Financiero.'])
wsL.column_dimensions['A'].width = 160
wsS.column_dimensions['A'].width = 9; wsS.column_dimensions['B'].width = 62; wsS.column_dimensions['C'].width = 14; wsS.column_dimensions['D'].width = 16; wsS.column_dimensions['E'].width = 24; wsS.column_dimensions['F'].width = 80
wb.save(OUT)
import json
json.dump({'ROW': ROW, 'AROW': AROW, 'S': S, 'NPRE': NPRE, 'N': N, 'C0': C0}, open(OUT + '.map.json', 'w'))
print('filas mensuales', len(ROW), '| filas anuales', len(AROW))
