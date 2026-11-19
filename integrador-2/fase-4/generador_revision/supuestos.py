#!/usr/bin/env python3
"""Respaldo de cada supuesto de la hoja Datos (15-11-2026): de dónde sale, por qué y cómo se calculó.

Pedido del equipo: ningún supuesto sin origen ni cálculo, y cada referencia al Capítulo III con el título de su tabla
(Fase 3 v10). Solo cambia texto de la columna F (y el tipo en la E cuando corresponde); ninguna fórmula ni valor.

Uso: supuestos.py ENTRADA SALIDA
"""
import re
import sys
import openpyxl

ENT, SAL = sys.argv[1:3]
w = openpyxl.load_workbook(ENT)
d = w['Datos']

# Títulos de las tablas del Capítulo III (informe de la Fase 3, versión 10)
TABLAS = {
    1: 'Base de supuestos del capítulo', 2: 'Hitos de los años 2 a 5, escenario central', 3: 'Hipótesis de la investigación',
    4: 'Etapas de la investigación y ejecución real', 5: 'Expertos entrevistados', 6: 'Conclusiones comunes de las entrevistas a expertos',
    7: 'Caso económico de los entrevistados en profundidad, versión Plus', 8: 'Respuestas de los entrevistados en profundidad',
    9: 'Contraste de las hipótesis con la encuesta', 10: 'Alternativas para gastar menos en combustible',
    11: 'Dudas del cliente y respaldo de la respuesta', 12: 'Qué compra el cliente', 13: 'Qué cambia en el vehículo',
    14: 'Versiones del kit', 15: 'Precios de referencia, piso y recuperación de la inversión',
    16: 'Recuperación de la inversión según el kilometraje', 17: 'Resumen de la mezcla de marketing',
    18: 'De las cuentas de aplicación a los vehículos del segmento', 19: 'Del mercado potencial al techo de adopción',
    20: 'Adopción y demanda atendible', 21: 'Capacidad comercial por canal', 22: 'Pronóstico de ventas, escenario central',
    23: 'Primer año, mes a mes', 24: 'Alternativas de dotación para la apertura', 25: 'Escenarios de ventas',
    26: 'Negocio de un taller de la Red Lumine', 27: 'Presupuesto de marketing', 28: 'Dotación al cierre de cada año',
    29: 'Perfiles de cargo y regla de entrada', 30: 'Renta bruta mensual por cargo y referencias de mercado',
    31: 'Nómina anual, costo empresa', 32: 'Ruta del proyecto experimental a la venta',
    33: 'Criterios de decisión del proyecto experimental', 34: 'Equipamiento de un taller',
    35: 'Gasto de operación de los talleres propios, sin kits', 36: 'Reparto del ingreso de una instalación',
    37: 'Decisiones, condiciones y umbrales del plan',
}
SECCIONES = {
    'compensaciones': 'sección 3.3.3.4 «Compensaciones, beneficios e incentivos»',
    'promoción': 'sección 3.2.6.4 «Promoción»',
    'regla de capacidad': 'sección 3.2.7.4 «Capacidad operativa y pronóstico de ventas»',
    'existencias': 'sección 3.4.3 «Presupuesto de operaciones», existencias',
    'precio de la red': 'sección 3.2.7.5 «Demanda de la Red Lumine»',
}

# Textos completos por clave de la columna A (o por etiqueta de la columna B cuando no hay clave)
T = {
    'Recargo de DEUDA por empresa nueva': (
        'Supuesto', 'Supuesto del equipo, sin oferta de un banco: una empresa sin historial ni ventas no obtiene la tasa promedio '
        'de los créditos comerciales, por eso se suman tres puntos. Con 0 puntos, Kd real baja de 7,86% a 4,95%; el VAN puro no '
        'cambia y el VAN ajustado sube.'),
    'Software productivo: horas': (
        'Estimación', 'Estimación del equipo, sin cotización ni desglose de tareas: 2.050 horas equivalen a un desarrollador a '
        'jornada completa durante doce meses (173 horas al mes × 12 = 2.076 horas), para llevar a producción la plataforma '
        'comercial, Lumine Habilita y la biblioteca de calibraciones.'),
    'Software productivo: tarifa por hora': (
        'Supuesto', 'Supuesto del equipo, sin tarifa contratada. Referencia: un programador senior gana en promedio $1.412.623 '
        'al mes (Chiletrabajos, julio de 2026), $8.165 por hora en 173 horas. La tarifa de $13.000 es 1,6 veces ese costo, '
        'porque el trabajo se contrataría a honorarios por proyecto, sin contrato indefinido.'),
    'Plazo de la deuda': (
        'Supuesto', 'Plazo propuesto, sin oferta de un banco: cinco años, igual al horizonte de evaluación, para que el crédito '
        'quede pagado al cierre y el valor de desecho no arrastre deuda.'),
    'Gracia de capital': (
        'Supuesto', 'Sin período de gracia (decisión del equipo, 19-11-2026). Las garantías estatales (Fogape, Pro Inversión) '
        'respaldan parte del capital, pero el crédito lo otorga el banco intermediario, que fija plazo y gracia (ChileAtiende, '
        'ficha Garantía Pro-Inversión). Cuota francesa constante desde el año 1, el supuesto más exigente para la caja; la cuota '
        'del año 1 la cubre el aporte de los socios.'),
    'Recuperación del CT al cierre': (
        'Método', 'Método contable del valor de desecho (Sapag, 2014): el capital de trabajo se recupera por su saldo al cierre '
        'del año 5. Los kits en tránsito y el IVA por recuperar conservan su valor. La hoja 4 muestra el VAN sin esta recuperación.'),
    'cq1': ('Supuesto', 'Escenario pesimista: 50% sobre el costo central de $10.000 por cotización, para medir una pauta digital '
            'menos eficiente. Sin dato observado: lo medirá el primer trimestre de campaña.'),
    'cq3': ('Supuesto', 'Escenario optimista: 25% bajo el costo central de $10.000 por cotización. Sin dato observado.'),
    'cr1': ('Supuesto', 'Escenario pesimista: un tercio menos que la conversión de régimen central de 30% (Capítulo III, Tabla N° 1 '
            '«Base de supuestos del capítulo»).'),
    'cr3': ('Supuesto', 'Escenario optimista: la misma conversión de régimen que el central (30%), alcanzada en seis meses en vez '
            'de doce (fila 75).'),
    'ci1': ('Supuesto', 'Mitad de la conversión de régimen del escenario (20%): al abrir solo existe la evidencia del piloto, '
            'igual que en el central (Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»).'),
    'ci2': ('Supuesto', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: la conversión parte en 15%, la mitad de la de '
            'régimen, porque al abrir solo existe la evidencia del piloto.'),
    'ci3': ('Supuesto', 'Escenario optimista: dos tercios de la conversión de régimen (30%), por una mejor recepción del piloto.'),
    'mr1': ('Supuesto', 'Doce meses: el plazo en que se acumulan casos de clientes con ahorro medido que respalden la venta y la '
            'conversión llega a su régimen (Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: 30% desde el segundo año).'),
    'mr2': ('Supuesto', 'Doce meses: el plazo en que se acumulan casos de clientes con ahorro medido que respalden la venta y la '
            'conversión llega a su régimen (Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: 30% desde el segundo año).'),
    'mr3': ('Supuesto', 'Escenario optimista: la mitad del plazo central, si los primeros casos medidos convencen antes.'),
    'canc': ('Supuesto', 'Supuesto del equipo, sin dato observado: cada mes desiste 5% de los clientes que esperan su kit y se les '
             'devuelve el pie. Evita contar como venta un pedido que no llega a instalarse.'),
    'ap1': ('Supuesto', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: un dúo nuevo rinde 60% en su primer mes, por '
            'aprendizaje y supervisión directa del Responsable Técnico.'),
    'ap2': ('Supuesto', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: 80% en el segundo mes; desde el tercero, 100%.'),
    'umb': ('Decisión', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: entra un dúo nuevo cuando el uso supera 80% de '
            'la capacidad; deja holgura para postventa y retrabajos.'),
    'dini': ('Decisión', 'Capítulo III, Tabla N° 24 «Alternativas de dotación para la apertura»: se abre con un dúo para no pagar '
             'capacidad ociosa mientras la conversión aprende.'),
    'dmin': ('Decisión', 'Capítulo III, sección 3.2.7.4 «Capacidad operativa y pronóstico de ventas»: el segundo dúo no entra '
             'antes del sexto mes, cuando el primero ya está formado y puede acompañar al siguiente.'),
    'dmax': ('Decisión', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: seis dúos por taller, uno por puesto del local de 400 m².'),
    'ss': ('Decisión', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: stock de seguridad de dos semanas de pedidos, '
           'para cubrir el error del pronóstico y la mezcla entre Esencial y Plus.'),
    'lmin': ('Supuesto', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo»: pedido mínimo de 10 kits. Sin cotización del '
             'proveedor.'),
    'lmul': ('Supuesto', 'Supuesto del equipo: los pedidos se redondean a múltiplos de 5 kits para ordenar el embarque. Sin dato '
             'del proveedor; su efecto en el resultado es menor.'),
    'ant': ('Supuesto', 'Capítulo III, Tabla N° 1 «Base de supuestos del capítulo» (anticipo de 30%) y práctica habitual al '
            'importar desde China: 30% al confirmar el pedido y el saldo antes del embarque (Statrys, 2026).'),
    'lfij': ('Cálculo', 'Hoja 1.2, pie de la tabla: cargos locales del embarque marítimo (US$750, Cargo Partner) y, por cada '
             'paquete del courier desde EE.UU., la parte fija de la tarifa (US$21) y el manejo (US$20, eShopex), con el 6% de '
             'derecho sobre esa parte del flete. Se carga en cada mes con pedido; reemplaza al recargo de pedidos pequeños.'),
    'lfij_n': ('Supuesto', 'Cada pedido mensual viaja como un embarque consolidado desde China y un envío de courier por '
               'proveedor desde EE.UU. y el Reino Unido.'),
    'b2': ('Decisión', 'Capítulo III, sección 3.3.3.4 «Compensaciones, beneficios e incentivos»: bono único al validar el nivel, '
           'igual a dos meses del alza de renta entre niveles.'),
    'b3': ('Decisión', 'Capítulo III, sección 3.3.3.4 «Compensaciones, beneficios e incentivos»: bono único al validar el nivel, '
           'igual a dos meses del alza de renta entre niveles.'),
    'b4': ('Decisión', 'Capítulo III, sección 3.3.3.4 «Compensaciones, beneficios e incentivos»: bono único al validar el nivel, '
           'igual a dos meses del alza de renta entre niveles.'),
    'aud': ('Supuesto', 'Supuesto del equipo, sin cotización: pasaje y alojamiento del auditor más dos días de su jornada, una '
            'visita al año por taller de la red.'),
    'prep': ('Supuesto', 'Solo se usa si el piloto entra a la evaluación (fila 24). Supuesto del equipo: 5% del lote para repuestos.'),
    'ptel': ('Supuesto', 'Solo se usa si el piloto entra a la evaluación (fila 24). Supuesto del equipo, sin cotización.'),
    'ptelm': ('Supuesto', 'Solo se usa si el piloto entra a la evaluación (fila 24). Supuesto del equipo, sin cotización.'),
    'ptra': ('Supuesto', 'Solo se usa si el piloto entra a la evaluación (fila 24). Supuesto del equipo, sin cotización.'),
    'ptrans': ('Supuesto', 'Solo se usa si el piloto entra a la evaluación (fila 24). Supuesto del equipo, sin cotización.'),
    'lsal_m': ('Supuesto', 'Supuesto del equipo: doce pedidos mensuales pagados a tiempo dan el historial para negociar que el '
               'saldo se pague a 30 días del embarque, que coincide con la llegada del kit. Con historial, los proveedores chinos '
               'suelen bajar el anticipo o dar plazo para el saldo (Statrys, 2026). Sin cotización.'),
}

for r in range(1, d.max_row + 1):
    if d.cell(r, 2).value == 'Vida útil normal · clasificación por confirmar':
        d.cell(r, 2).value = 'Vida útil normal según la tabla del SII (Resolución Exenta N° 43 de 2002)'
n = 0
for r in range(1, d.max_row + 1):
    clave, etq = d.cell(r, 1).value, d.cell(r, 2).value
    k = clave if clave in T else (etq if etq in T else None)
    if k:
        tipo, txt = T[k]
        d.cell(r, 5).value = tipo
        d.cell(r, 6).value = txt
        n += 1

# Referencias al Capítulo III con el título de cada tabla o sección (en todas las hojas, salvo el motor)
pat_tabla = re.compile(r'Capítulo III, Tabla N° (\d+)(?! «)')
pat_secc = re.compile(r'Capítulo III, (' + '|'.join(SECCIONES) + r')\b')
m = 0
for ws in w.worksheets:
    if ws.title.startswith('Motor'):
        continue
    for row in ws.iter_rows():
        for z in row:
            v = z.value
            if not isinstance(v, str) or v.startswith('='):
                continue
            nuevo = pat_tabla.sub(lambda x: f'Capítulo III, Tabla N° {x.group(1)} «{TABLAS[int(x.group(1))]}»', v)
            nuevo = pat_secc.sub(lambda x: f'Capítulo III, {SECCIONES[x.group(1)]}', nuevo)
            nuevo = re.sub(r'^Capítulo III$', 'Capítulo III, Tabla N° 26 «Negocio de un taller de la Red Lumine»', nuevo) \
                if ws.title == 'Datos' and z.column == 6 and d.cell(z.row, 1).value in ('cuo', 'hab', 'tred', 'cred') else nuevo
            if nuevo != v:
                z.value = nuevo
                m += 1

w.save(SAL)
print(f'Supuestos: {n} filas de Datos con respaldo nuevo; {m} referencias al Capítulo III con su título')
