"""Arma la presentación de la defensa final (Ruta 213) a partir de un solo archivo de contenido.

Uso: python3 lumine-presentaciones/defensa/generador/armar.py
Escribe defensa/laminas.html, defensa/deck-data.js y, si existe la carpeta privada, defensa/privado/expertos.js.
Toda cifra sale del informe final (Lumine_Fase5_Informe_final.docx, 28-11-2026). Cambiar contenido aquí, no en el HTML.
"""
import json, math, os, re, html as H

AQUI = os.path.dirname(os.path.abspath(__file__))
DEF = os.path.dirname(AQUI)
N_MAIN = 41
PARADAS = [('Problema', 2), ('Entorno', 7), ('Evidencia', 13), ('Plan', 22), ('Números', 29), ('Decisión', 39)]

# ---------------------------------------------------------------- piezas comunes
def ruta(n):
    X0, X1 = 96, 1824
    x = lambda k: X0 + (X1 - X0) * (k - 1) / (N_MAIN - 1)
    pos = x(n); km = round(213 * (n - 1) / (N_MAIN - 1))
    sec = max([k for _, k in PARADAS if k <= n] or [0])
    par = ''.join(f'<g class="pa{" ok" if k <= n else ""}{" aqui" if k == sec else ""}"><circle cx="{x(k):.0f}" cy="40" r="7"/>'
                  f'<text x="{x(k):.0f}" y="84" text-anchor="middle">{t}</text></g>' for t, k in PARADAS)
    return (f'<svg class="ruta" viewBox="0 0 1920 100" width="1920" height="100" aria-hidden="true">'
            f'<line x1="{X0}" y1="40" x2="{X1}" y2="40" class="r-base"/><line x1="{X0}" y1="40" x2="{pos:.0f}" y2="40" class="r-hecho"/>{par}'
            f'<g class="r-auto"><svg x="{pos - 58:.0f}" y="6" width="116" height="34" viewBox="80 90 1040 290" class="mini"><g data-auto="mini"></g></svg></g></svg>'
            f'<div class="odo"><b>{km}</b> km de 213</div>')

def pc(t):  # el «%» nunca va en Michroma
    return t.replace('%', '<span class="pc">%</span>')

def cab(ceja, sub, main, em):
    return f'<p class="ceja">{ceja} <b>{sub}</b></p><h2 class="tit">{pc(main)} <em>{em}</em></h2>'

def fuente(t):
    return f'<p class="fuente">{t}</p>'

def kpis(items, f=None):
    out = []
    for i, it in enumerate(items):
        dt, dd = it[0], it[1]
        fa = f' data-f="{it[2]}"' if len(it) > 2 and it[2] else (f' data-f="{f}"' if f else '')
        out.append(f'<div{fa}><dt>{dt}</dt><dd>{dd}</dd></div>')
    return '<dl class="kpis">' + ''.join(out) + '</dl>'

def cuenta(v, dec=0, esp=.3, dur=1.2):
    txt = f'{v:,.{dec}f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return f'<span data-cuenta="{v}" data-dec="{dec}" data-espera="{esp}" data-dur="{dur}">{txt}</span>'

def auto(modo='kit', w=1000, clase='dib traza enc', extra=''):
    h = w * 430 / 1200
    return (f'<svg class="svg {clase}" viewBox="0 0 1200 430" width="{w:.0f}" height="{h:.0f}">'
            f'<line x1="40" y1="372" x2="1160" y2="372" class="suelo"/><g data-auto="{modo}"></g>{extra}</svg>')

RAYADO_DEF = ('<defs><pattern id="rayado" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
          '<rect width="12" height="12" fill="rgba(34,184,240,.25)"/><line x1="0" y1="0" x2="0" y2="12" stroke="#22b8f0" stroke-width="4"/></pattern></defs>')
RAYADO = ''  # la trama vive en un <svg> global, visible, para que las láminas ocultas no la anulen

def columnas(vals, etiq, w=1100, h=470, vmin=None, vmax=None, dec=1, clases=None, f=None, sufijo=''):
    vmin = min(0, min(vals)) if vmin is None else vmin
    vmax = max(0, max(vals)) if vmax is None else vmax
    top, bot = 50, h - 60
    y = lambda v: top + (vmax - v) / (vmax - vmin) * (bot - top)
    n = len(vals); paso = w / n; bw = paso * .56
    out = [f'<svg class="svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{RAYADO}<line x1="0" y1="{y(0):.1f}" x2="{w}" y2="{y(0):.1f}" class="eje0"/>']
    for i, (v, e) in enumerate(zip(vals, etiq)):
        x = i * paso + (paso - bw) / 2
        cl = (clases[i] if clases else ('bar' if v >= 0 else 'bar g'))
        y0, y1 = (y(v), y(0)) if v >= 0 else (y(0), y(v))
        anim = 'by' if v >= 0 else 'byn'
        txt = f'{v:,.{dec}f}'.replace(',', 'X').replace('.', ',').replace('X', '.') + sufijo
        if v < 0: txt = '−' + txt[1:]
        ty = y(v) - 14 if v >= 0 else y(v) + 40
        out.append(f'<rect x="{x:.1f}" y="{y0:.1f}" width="{bw:.1f}" height="{max(y1 - y0, 2):.1f}" class="{cl} {anim}" style="--d:{.2 + i * .12:.2f}s"/>'
                   f'<text x="{x + bw / 2:.1f}" y="{ty:.1f}" text-anchor="middle" class="vl">{txt}</text>'
                   f'<text x="{x + bw / 2:.1f}" y="{h - 14}" text-anchor="middle" class="et">{e}</text>')
    out.append('</svg>')
    return ''.join(out)

def gauge(cx, cy, R, vmax, marca, valor, lbl):
    def pt(v, r):
        a = math.radians(180 - v / vmax * 180); return cx + r * math.cos(a), cy - r * math.sin(a)
    def arco(v0, v1, r):
        x0, y0 = pt(v0, r); x1, y1 = pt(v1, r); return f'M{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f}'
    tk = []
    for v in range(0, vmax + 1):
        M = v % 5 == 0; a = pt(v, R - 2); b = pt(v, R - (40 if M else 20))
        tk.append(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" class="{"tkM" if M else "tk"}"/>')
        if M:
            t = pt(v, R - 78); tk.append(f'<text x="{t[0]:.1f}" y="{t[1] + 9:.1f}" class="tkt">{v}%</text>')
    k1, k2, kl = pt(marca, R + 8), pt(marca, R - 56), pt(marca, R + 60)
    rot = -90 + valor / vmax * 180
    return (f'<path d="{arco(0, vmax, R)}" class="g-fondo"/><path d="{arco(0, marca, R)}" class="g-bajo"/>'
            f'<path d="{arco(marca, valor, R)}" class="g-sobre" pathLength="1"/>{"".join(tk)}'
            f'<line x1="{k1[0]:.1f}" y1="{k1[1]:.1f}" x2="{k2[0]:.1f}" y2="{k2[1]:.1f}" class="g-ku"/>'
            f'<text x="{kl[0]:.1f}" y="{kl[1] - 26:.1f}" class="g-kut" text-anchor="middle">{lbl}</text>'
            f'<g class="aguja" style="--rot:{rot:.2f}deg;transform-origin:{cx}px {cy}px"><path d="M{cx - 10} {cy - R + 150} L{cx} {cy - R + 44} L{cx + 10} {cy - R + 150} Z"/></g>')

# ---------------------------------------------------------------- fuentes que se repiten
F_INF = 'Fuente: elaboración propia con el libro de cálculo del Plan Financiero, escenario central (millones de pesos de 2026).'
F_ENC = 'Fuente: encuesta del equipo, n = 196, corte del 12 de noviembre de 2026. Muestra no probabilística: resultados indicativos.'
F_COL = 'Fuente: supuesto del equipo (213 km diarios, seis días a la semana, 10 km por litro); bencina 93 en la RM a $1.538,9 por litro (Garretón, Emol, 2026b).'

L = []   # láminas principales
def lam(fondo, cuerpo, who, sec, notas, titulo, turnos=None, ruta_n=True, clase=''):
    L.append(dict(fondo=fondo, cuerpo=cuerpo, who=who, sec=sec, notas=notas, titulo=titulo, turnos=turnos, ruta=ruta_n, clase=clase))

# =========================================================================== 1 · Apertura
lam('negro', f'''<img class="foto" src="img/colectivo-oscuro.jpg" alt="">
<div class="velo"></div>
<p class="provisional" style="right:96px;top:160px">Imagen provisional</p>
<div class="txt"><span data-logo="64"></span>
<h1 class="tit">Tu mismo auto, <em>ahora híbrido.</em></h1>
<p class="frase">Un taller que hibridaría autos a combustión en uso para que gasten menos bencina sin cambiarlos.</p></div>
<p class="equipo">Diego Alarcón · Benjamín Torres · Lukas Verdugo<span>Profesor guía Roberto Brito · Taller Integrador II · UNAB · diciembre de 2026</span></p>
<p class="cred">Imagen ilustrativa</p>''',
    'Diego · Lukas · Torres', 20,
    ['<b>Diego:</b> Buenos días, profesor y comisión. Somos Diego Alarcón, Benjamín Torres y Lukas Verdugo, y presentamos Lumine Motors.',
     '<b>Lukas:</b> Un colectivero recorre 213 kilómetros al día y, desde marzo, paga $370 más por cada litro. Proponemos que pueda gastar menos sin cambiar su auto.',
     '<b>Torres:</b> Partimos por lo que ocurrió en marzo.'],
    'Portada: Tu mismo auto, ahora híbrido', turnos={'Diego': 7, 'Lukas': 8, 'Torres': 5}, clase='portada')

# =========================================================================== 2 a 15 · Torres
lam('blanco', cab('01 · El problema', 'Contexto', 'La bencina subió $370 por litro', 'en un solo día') + f'''
<div class="zona"><div class="g2 a">
 <div><p class="rot">Bencina 93 · 26 de marzo de 2026</p><p class="prota">+${cuenta(370, esp=.4)}</p>
  <p class="leyenda">por litro, de una sola vez: la mayor alza de combustibles desde que existen registros.</p></div>
 {kpis([('$1.168,9 → $1.538,9', 'por litro en la Región Metropolitana', 1),
        ('Más de 99%', 'del transporte depende de derivados del petróleo', 2),
        ('2035', 'desde ese año solo se venderían livianos cero emisiones: la meta mira al auto nuevo', 3)])}
</div></div>''' + fuente('Fuente: Garretón, Emol (2026a; 2026b); Ministerio de Energía (2021), Estrategia Nacional de Electromovilidad.'),
    'Torres', 25,
    ['El 26 de marzo la bencina de 93 subió $370 por litro de una sola vez, la mayor alza de combustibles desde que existen registros. En la Región Metropolitana pasó de $1.168,9 a $1.538,9.',
     '[Clic] Chile importa casi todo el petróleo que consume, y el transporte depende en más de 99% de sus derivados. [Clic] El Estado fijó 2035 para vender solo vehículos livianos cero emisiones, pero esa meta mira al auto que se va a vender, no al que ya circula.'],
    'La bencina subió $370 por litro en un solo día')

lam('blanco', cab('01 · El problema', 'A quién afecta', 'Quien trabaja con su auto', 'paga cada alza sin alternativa') + f'''
<div class="zona"><div class="g2 a">
 <div><p class="rot">Vehículos de uso laboral · Región Metropolitana</p><p class="prota">{cuenta(162780, esp=.3, dur=1.4)}</p>
  <p class="leyenda">taxis, colectivos y autos de aplicación.</p></div>
 {kpis([('$7.400', 'más por jornada con 200 km diarios <span class="marca">supuesto</span>', 1),
        ('$13.990.000', 'el eléctrico más barato: unos 20 meses del ingreso mediano', 2)])}
</div></div>''' + fuente('Fuente: INE (2025), Parque de vehículos en circulación 2024; autos de aplicación: estimación del equipo; Autofact (2026); INE (2026), ingreso mediano de $680.000.'),
    'Torres', 30,
    ['El alza pesa más sobre quien usa el auto para trabajar, porque para esa persona la bencina es un costo diario que no puede postergar. En la Región Metropolitana son unos 162.780 vehículos: taxis, colectivos y autos de aplicación.',
     '[Clic] Con 200 kilómetros al día, el alza de marzo significó unos $7.400 más por jornada. [Clic] Y cambiar de auto no está a su alcance: el eléctrico más barato cuesta $13.990.000, unos 20 meses del ingreso mediano.'],
    'Quien trabaja con su auto paga cada alza sin alternativa')

lam('blanco', cab('01 · El problema', 'Cliente de referencia', 'Un colectivo de 213 km diarios', 'gasta $851.587 al mes') + f'''
<div class="zona">
 <div style="position:absolute;left:-30px;top:40px">{auto('colectivo', 780, 'dib traza')}</div>
 <div style="position:absolute;left:820px;right:0;top:40px;display:flex;align-items:flex-end;gap:18px">
  <div><b style="font:700 56px/1 ArchivoC">213 km</b><p class="et" style="font:500 24px ArchivoSC;color:var(--mu)">por día</p></div><span style="font:400 40px ArchivoC;color:var(--mu)">×</span>
  <div><b style="font:700 56px/1 ArchivoC">6 días</b><p style="font:500 24px ArchivoSC;color:var(--mu)">a la semana</p></div><span style="font:400 40px ArchivoC;color:var(--mu)">÷</span>
  <div><b style="font:700 56px/1 ArchivoC">10 km/L</b><p style="font:500 24px ArchivoSC;color:var(--mu)">rendimiento</p></div><span style="font:400 40px ArchivoC;color:var(--mu)">×</span>
  <div><b style="font:700 56px/1 ArchivoC">$1.538,9</b><p style="font:500 24px ArchivoSC;color:var(--mu)">por litro</p></div></div>
 <div style="position:absolute;left:820px;right:0;top:190px;border-top:3px solid var(--fg);padding-top:16px">
  <p class="rot">Gasto en bencina al mes</p><p class="prota" style="font-size:170px">${cuenta(851587, esp=.6, dur=1.3)}</p></div>
 <ul class="chips" style="position:absolute;left:0;bottom:0" data-f="1"><li>Conduce</li><li>Es dueño</li><li>Decide</li><li>Paga</li><li class="ac">Prioridad: colectiveros y conductores de aplicación</li></ul>
</div>''' + fuente(F_COL),
    'Torres', 25,
    ['Este es nuestro cliente de referencia: un colectivo que recorre 213 kilómetros diarios, seis días a la semana. Con 10 kilómetros por litro y la bencina a $1.538,9, gasta $851.587 al mes.',
     '[Clic] Él conduce, es dueño, decide y paga. Por eso priorizamos a colectiveros y conductores de aplicación dueños de su auto; cuando el auto es arrendado, decide quien lo arrienda.'],
    'Un colectivo de 213 km diarios gasta $851.587 al mes')

lam('blanco', cab('01 · El problema', 'Cómo se resuelve hoy', 'Las salidas actuales excluyen', 'al auto con años o exigen cambiarlo') + '''
<div class="zona"><div class="tarjetas grande" style="grid-template-columns:repeat(4,1fr);margin-top:30px">
 <div class="tarjeta"><h3>Eléctrico con subsidio</h3><p>Exige cambiar de auto; cupos cerrados en la RM.</p></div>
 <div class="tarjeta"><h3>Conversión a gas</h3><p>Gasco y Abastible: solo autos con hasta siete años.</p></div>
 <div class="tarjeta"><h3>Modificación informal</h3><p>Sin certificación ante revisión técnica y seguro.</p></div>
 <div class="tarjeta"><h3>No hacer nada</h3><p>Pagar cada alza.</p></div></div>
 <p class="nota" style="position:absolute;left:0;right:0;bottom:0" data-f="1">Se transfieren 3,4 usados por cada auto nuevo, y el auto con años no tiene salida formal.</p>
</div>''' + fuente('Fuente: Ministerio de Energía (2026b), Mi Taxi Eléctrico; Gasco (s.f.); Subsecretaría de Transportes (2026a); CAVEM (2026).'),
    'Torres', 25,
    ['Ese conductor tiene hoy cuatro salidas. El eléctrico con subsidio exige entregar su auto y aportar $8.092.400, y en la Región Metropolitana los cupos están cerrados. La conversión a gas de Gasco y Abastible solo admite autos con hasta siete años desde su primera inscripción. La modificación informal no se puede certificar. Y la mayoría elige no hacer nada.',
     '[Clic] En un país que transfiere 3,4 usados por cada auto nuevo, el auto con años queda sin una salida formal.'],
    'Las salidas actuales excluyen al auto con años o exigen cambiarlo')

lam('negro', cab('01 · La solución', 'Propuesta de valor', 'Dos motores eléctricos atrás', 'y el motor original, intacto') + f'''
<div class="zona"><div style="position:absolute;left:-20px;top:70px">{auto('kit', 1040, 'dib traza enc', """<g class="ll">
 <g><path d="M378 236 V196 H230" class="gr"/><text x="222" y="186" text-anchor="end" class="n gr">01</text><text x="222" y="216" text-anchor="end" class="t">MOTOR ORIGINAL</text></g>
 <g><path d="M552 254 V-40 H600"/><text x="608" y="-48" class="n">02</text><text x="608" y="-18" class="t">UNIDAD DE CONTROL</text></g>
 <g><path d="M742 282 V20 H790"/><text x="798" y="12" class="n">03</text><text x="798" y="42" class="t">BATERÍA 2,14 kWh</text></g>
 <g><path d="M930 293 V80 H978"/><text x="986" y="72" class="n">04</text><text x="986" y="102" class="t">MOTORES EN RUEDA ×2</text></g></g>""")}</div>
 <div style="position:absolute;left:1180px;right:0;top:0">{kpis([('4.000 W <small>o</small> 6.000 W', 'motores de Esencial y Plus; batería de litio-titanato, sin enchufe', 1),
   ('$153.286 <small>al mes</small>', 'ahorro del colectivo con Plus (18,0%); Esencial: $123.480 (14,5%) <span class="marca">simulación</span>', 2)])}</div>
 <p class="nota" style="position:absolute;left:0;bottom:0" data-f="2">Freno, ABS y control de estabilidad originales se conservan.</p>
</div>''' + fuente('Fuente: informe final, propuesta de solución. Ahorro: simulación del equipo, una estimación de ingeniería sin medición en autos chilenos.'),
    'Torres', 30,
    ['Lumine sería un taller que hibrida el auto que el cliente ya tiene. El kit suma dos motores eléctricos en las ruedas traseras, una batería de litio-titanato de 2,14 kWh que se carga al frenar y una unidad de control calibrada para cada modelo. No toca el motor, la transmisión ni la alimentación.',
     '[Clic] Hay dos versiones: Esencial, con motores de 4.000 watts, y Plus, con 6.000. [Clic] En nuestra simulación, el colectivo de referencia ahorraría $153.286 al mes con Plus, un 18,0%. Es una estimación que el proyecto experimental tiene que medir. Y el freno, el ABS y el control de estabilidad originales se conservan.'],
    'Dos motores eléctricos atrás y el motor original, intacto')

# PESTEL
fac = [('Político', 10, 1), ('Económico', 15, -1), ('Social', 15, 3), ('Tecnológico', 25, 4), ('Ambiental', 10, 2), ('Legal', 25, 1)]
sv = ['<svg class="svg" viewBox="0 0 1000 480" width="1000" height="480"><line x1="560" y1="10" x2="560" y2="450" class="eje0"/>']
for i, (f_, w_, p_) in enumerate(fac):
    yy = 20 + i * 72; x0 = 560; ww = p_ * 70
    sv.append(f'<text x="330" y="{yy + 40}" text-anchor="end" class="et fg" style="font-size:28px">{f_}</text><text x="350" y="{yy + 40}" class="et">{w_}%</text>'
              f'<rect x="{min(x0, x0 + ww)}" y="{yy + 10}" width="{abs(ww)}" height="44" class="{"bar" if p_ > 0 else "bar g"} bx" style="--d:{.2 + i * .1:.1f}s;transform-origin:{"left" if p_ > 0 else "right"}"/>'
              f'<text x="{x0 + ww + (14 if p_ > 0 else -14)}" y="{yy + 44}" text-anchor="{"start" if p_ > 0 else "end"}" class="vl">{"+" if p_ > 0 else "−"}{abs(p_)}</text>')
sv.append('<text x="350" y="475" class="et">peso</text><text x="560" y="475" text-anchor="middle" class="et">0 · escala de −5 a +5</text></svg>')
lam('blanco', cab('02 · El entorno', 'PESTEL', 'Entorno favorable moderado:', '+1,85, con la norma pendiente') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1000px 1fr;gap:60px">
 <div>{''.join(sv)}</div>
 <div><p class="rot">Balance ponderado</p><p class="prota" style="font-size:150px">+{cuenta(1.85, 2, esp=.8)}</p>
  <div data-f="1" style="margin-top:18px"><p class="rot" style="color:var(--fg)">Oportunidades</p><p class="leyenda" style="font-size:28px;margin-top:6px">Tecnología madura · el conductor conserva su auto</p></div>
  <div data-f="2" style="margin-top:18px"><p class="rot" style="color:var(--fg)">Amenazas</p><p class="leyenda" style="font-size:28px;margin-top:6px">Sin norma no se vende · dólar y litio al alza</p></div></div>
</div></div>''' + fuente('Fuente: elaboración propia, análisis PESTEL ponderado (escala de −5 a +5) con las fuentes del capítulo de entorno del informe final.'),
    'Torres', 25,
    ['El análisis PESTEL da +1,85 en una escala de −5 a +5: un entorno favorable moderado. Lo que más pesa es la tecnología, con +4, y lo legal, con apenas +1.',
     '[Clic] Las dos oportunidades más fuertes: la tecnología ya se fabrica a escala y se vende como kit en otros mercados, y el conductor chileno conserva su auto. [Clic] Las dos amenazas deciden cuándo y a qué costo entrar: sin una norma que incluya los sistemas aditivos no se vende, y el dólar y el litio encarecen el kit justo cuando el cliente puede pagar menos.'],
    'Entorno favorable moderado: +1,85, con la norma pendiente')

# Porter
fz = [('Rivalidad', 10, 1.63), ('Nuevos entrantes', 20, 3.75), ('Sustitutos', 30, 3.67), ('Proveedores', 15, 2.67), ('Clientes', 25, 2.83)]
sv = ['<svg class="svg" viewBox="0 0 1060 470" width="1060" height="470">']
for i, (f_, w_, v_) in enumerate(fz):
    yy = 10 + i * 84; ww = v_ * 130
    sv.append(f'<text x="320" y="{yy + 44}" text-anchor="end" class="et fg" style="font-size:28px">{f_}</text><text x="320" y="{yy + 74}" text-anchor="end" class="et">peso {w_}%</text>'
              f'<rect x="350" y="{yy + 12}" width="650" height="50" fill="none" stroke="var(--ln)"/>'
              f'<rect x="350" y="{yy + 12}" width="{ww:.0f}" height="50" class="{"bar" if f_ == "Sustitutos" else "bar g"} bx" style="--d:{.2 + i * .1:.1f}s"/>'
              f'<text x="{350 + ww + 14:.0f}" y="{yy + 48}" class="vl">{str(v_).replace(".", ",")}</text>')
sv.append('<text x="1000" y="465" text-anchor="end" class="et">intensidad de 0 a 5</text></svg>')
lam('blanco', cab('02 · El entorno', 'Cinco fuerzas de Porter', 'Industria de atractivo medio:', 'los sustitutos son la fuerza principal') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1060px 1fr;gap:56px">
 <div>{''.join(sv)}</div>
 <div><p class="rot">Intensidad ponderada</p><p class="prota" style="font-size:150px">{cuenta(3.12, 2, esp=.7)}</p><p class="leyenda" style="font-size:28px">sobre 5. Industria: las alternativas para gastar menos combustible.</p>
  <p class="nota" data-f="1" style="margin-top:24px">Los sustitutos aportan 1,10: el conductor tiene opciones sin riesgo regulatorio.</p></div>
</div></div>''' + fuente('Fuente: elaboración propia con base en Porter (2008); factores calificados de 0 a 5 y ponderados según su peso en el negocio.'),
    'Torres', 20,
    ['Definimos la industria como las alternativas que tiene un conductor para gastar menos combustible. La intensidad ponderada es 3,12 sobre 5: atractivo medio. La amenaza de nuevos entrantes es la más intensa, 3,75, porque la misma vía legal que usaríamos queda abierta a otros.',
     '[Clic] Pero la fuerza principal son los sustitutos, que aportan 1,10 de los 3,12: el conductor tiene opciones sin riesgo regulatorio, o puede no hacer nada.'],
    'Industria de atractivo medio: los sustitutos son la fuerza principal')

si, no = '<span class="si">✓</span>', '<span class="no">✗</span>'
filas = [('Baja el gasto por kilómetro', si, si, si, si), ('Conserva el auto del cliente', si, no, no, si), ('Sirve al auto con más de siete años', no, no, no, si),
         ('Cuesta menos que un auto nuevo', si, no, no, si), ('Funciona sin red de carga', si, si, no, si), ('Certificación reconocida hoy', si, si, si, '<span class="no">Con la norma</span>')]
tb = ''.join(f'<tr><td>{a}</td><td class="c">{b}</td><td class="c">{c}</td><td class="c">{d}</td><td class="c col-ac">{e}</td></tr>' for a, b, c, d, e in filas)
lam('blanco', cab('02 · El entorno', 'Competidores y posicionamiento', 'Nadie más conserva', 'el auto con más de siete años') + f'''
<div class="zona"><table class="tabla"><tr><th>Atributo</th><th class="c">Gasco y Abastible<br>(gas)</th><th class="c">MG 3 Hybrid<br>(híbrido nuevo)</th><th class="c">Changan Lumin 3P<br>(eléctrico nuevo)</th><th class="c col-ac" style="color:var(--ac)">Lumine<br>(hibridación)</th></tr>{tb}</table>
 <p class="nota" data-f="1" style="margin-top:22px">Competimos en conservar cualquier auto, no en precio: primero probar y certificar.</p></div>''' +
    fuente('Fuente: elaboración propia con base en Gasco (s.f.), Subsecretaría de Transportes (2026a), Autocosmos (2026), Autofact (2026) y OLADE (2026).'),
    'Torres', 25,
    ['Comparamos a Lumine con las alternativas que existen hoy en seis atributos que el conductor valora. Gasco y Abastible convierten a gas y son los más baratos, pero excluyen al auto con más de siete años. El MG 3 Hybrid y el Changan Lumin 3P exigen cambiar de auto.',
     'Lumine sería la única que cumple los cinco primeros atributos. Le falta el sexto: la certificación, que llega con la norma. [Clic] Por eso no competimos por precio, sino por conservar cualquier auto, y el proyecto experimental va antes que cualquier venta.'],
    'Nadie más conserva el auto con más de siete años')

lam('blanco', cab('02 · El entorno', 'FODA', 'Las amenazas son la norma', 'y el costo del kit') + '''
<div class="zona"><div class="g2" style="grid-template-columns:1.5fr 1fr;gap:56px">
 <div class="foda">
  <div><h4>Fortalezas</h4><p>Biblioteca de calibraciones propia · formación propia de técnicos</p></div>
  <div><h4>Debilidades</h4><p>Ahorro que varía con el uso · precio alto para pagar al contado</p></div>
  <div><h4>Oportunidades</h4><p>Segmento sin competidores directos · vía legal para probar en la calle</p></div>
  <div class="am"><h4>Amenazas</h4><p>Sin norma no hay venta · kit importado, con dólar y litio al alza</p></div></div>
 <div data-f="1"><p class="rot">Qué hacemos con esto</p>
  <div class="tarjetas" style="margin-top:14px"><div class="tarjeta ac"><p style="color:var(--fg)">Probar antes de vender</p></div><div class="tarjeta ac"><p style="color:var(--fg)">Fijar el precio del kit</p></div><div class="tarjeta ac"><p style="color:var(--fg)">Formar técnicos propios</p></div></div></div>
</div></div>''' + fuente('Fuente: elaboración propia con base en el análisis del entorno, las cinco fuerzas, el benchmarking y la cadena de valor; cruce de Weihrich (1982).'),
    'Torres', 20,
    ['El FODA resume lo anterior. Las fortalezas son internas: la biblioteca de calibraciones y la formación propia de técnicos. Las debilidades: un ahorro que varía con el uso y un precio alto para pagar al contado. Las oportunidades: un segmento sin competidores directos y una vía legal para probar. Y las amenazas: la norma y el costo del kit.',
     '[Clic] De ahí salen tres prioridades: probar antes de vender, fijar el precio del kit y formar a nuestros técnicos.'],
    'Las amenazas son la norma y el costo del kit')

emb = [('Mercado total (TAM)', 4409729, 'autos y taxis a combustión del país', 1100), ('Mercado disponible (SAM)', 1685930, 'los mismos, en la Región Metropolitana', 900),
       ('Segmento de entrada', 73908, 'taxis, colectivos y autos de aplicación de alto kilometraje', 680), ('Techo de adopción', 22561, 'con la intención medida en la encuesta', 460),
       ('Meta en cinco años (SOM)', 2850, 'instalaciones: 12,6% del techo', 260)]
eb = ''.join(f'<div data-f="{i}" style="display:flex;align-items:center;gap:24px;margin-bottom:12px"><div style="width:{w}px;height:72px;flex:none;background:{"var(--ac)" if i == 4 else ("var(--tinta-p)" if i == 2 else "#c8cace")};display:flex;align-items:center;padding-left:20px">'
             f'<b style="font:700 46px ArchivoC;color:{"#fff" if i in (2, 4) else "var(--tinta-p)"}">{f"{v:,}".replace(",", ".")}</b></div><div style="flex:1;min-width:0"><p style="font:500 24px ArchivoSC;letter-spacing:.08em;text-transform:uppercase;color:var(--fg)">{t}</p><p style="font:400 24px Archivo;color:var(--mu)">{d}</p></div></div>'
             for i, (t, v, d, w) in enumerate(emb))
lam('blanco', cab('02 · El mercado', 'TAM, SAM y SOM', 'Entrada: 73.908 autos laborales', 'y meta de 2.850 en cinco años') + f'<div class="zona" style="top:392px">{eb}</div>' +
    fuente('Fuente: INE (2025), Parque de vehículos 2024; encuesta del equipo (n = 196, 2026). Supuesto del equipo: 30% de los autos de aplicación son de alto kilometraje.'),
    'Torres', 25,
    ['El mercado total son 4.409.729 autos y taxis a combustión; el disponible, 1.685.930 en la Región Metropolitana.',
     '[Clic] Nuestro segmento de entrada son 73.908 vehículos de uso laboral de alto kilometraje. [Clic] Con la intención medida en la encuesta, el techo de adopción sería 22.561 autos. [Clic] Y nuestra meta son 2.850 instalaciones en cinco años, el 12,6% de ese techo. El techo no es una tasa de compra: la muestra no es probabilística.'],
    'Entrada: 73.908 autos laborales y meta de 2.850 en cinco años')

lam('negro', cab('02 · El modelo', 'Canvas', 'La biblioteca de calibraciones', 'une los nueve bloques del modelo') + '''
<div class="zona" style="top:396px"><div class="canvas">
 <div style="grid-column:1;grid-row:1/3"><h4>Socios clave</h4><p>Proveedores de componentes, 3CV, plantas de revisión técnica, aseguradoras y procesador de pagos</p></div>
 <div style="grid-column:2;grid-row:1"><h4>Actividades clave</h4><p>Calibrar por modelo, instalar, gestión regulatoria y formar técnicos</p></div>
 <div style="grid-column:3;grid-row:1/3"><h4>Propuesta de valor</h4><p>Tu mismo auto, ahora híbrido: menos bencina por kilómetro, con el ahorro estimado antes de pagar</p></div>
 <div style="grid-column:4;grid-row:1"><h4>Relación</h4><p>Diagnóstico con datos, garantía e informe a tres meses</p></div>
 <div style="grid-column:5;grid-row:1/3"><h4>Segmentos</h4><p>Uso laboral de alto kilometraje en la RM; desde el año 3, talleres de la red</p></div>
 <div class="ac" style="grid-column:2;grid-row:2"><h4>Recurso clave</h4><p>Biblioteca de calibraciones, dinamómetro y técnicos habilitados</p></div>
 <div style="grid-column:4;grid-row:2"><h4>Canales</h4><p>Plataforma comercial y taller propio; luego la Red Lumine</p></div>
 <div style="grid-column:1/3;grid-row:3"><h4>Costos</h4><p>Kit importado (variable); personas y taller (fijo)</p></div>
 <div style="grid-column:3/6;grid-row:3"><h4>Ingresos</h4><p>Pago único por instalación, con cuotas a través de terceros; desde el año 3, licencias a la red</p></div>
</div></div>''' + fuente('Fuente: elaboración propia con base en Osterwalder y Pigneur (2012).'),
    'Torres', 20,
    ['El modelo de negocio se ordena en los nueve bloques del lienzo. Paga el dueño del auto, en un pago único por instalación, con cuotas a través de terceros: Lumine no da crédito directo. Llegamos por la plataforma comercial y el taller propio, y desde el tercer año por la Red Lumine.',
     'La pieza que une todo es la biblioteca de calibraciones: permite prometer un ahorro por modelo antes de instalar, no se compra en el mercado y se licencia a la red sin entregarla.'],
    'La biblioteca de calibraciones une los nueve bloques del modelo')

lam('blanco', cab('03 · La evidencia', 'Supuestos abiertos', 'Cinco preguntas abiertas', 'antes de invertir') + '''
<div class="zona"><div class="g2" style="grid-template-columns:1.4fr 1fr">
 <ol style="list-style:none">
  <li style="font:400 40px/1.25 Archivo;border-top:1px solid var(--ln);padding:16px 0"><b style="font:700 40px ArchivoC;color:var(--ac);margin-right:18px">1</b>¿Quién hibridaría primero?</li>
  <li style="font:400 40px/1.25 Archivo;border-top:1px solid var(--ln);padding:16px 0"><b style="font:700 40px ArchivoC;color:var(--ac);margin-right:18px">2</b>¿Qué pesa más: precio o confianza?</li>
  <li style="font:400 40px/1.25 Archivo;border-top:1px solid var(--ln);padding:16px 0"><b style="font:700 40px ArchivoC;color:var(--ac);margin-right:18px">3</b>¿Qué respaldos necesita para confiar?</li>
  <li style="font:400 40px/1.25 Archivo;border-top:1px solid var(--ln);padding:16px 0"><b style="font:700 40px ArchivoC;color:var(--ac);margin-right:18px">4</b>¿Cuánto pagaría?</li>
  <li style="font:400 40px/1.25 Archivo;border-top:1px solid var(--ln);border-bottom:1px solid var(--ln);padding:16px 0"><b style="font:700 40px ArchivoC;color:var(--ac);margin-right:18px">5</b>¿Cómo lo financiaría?</li></ol>
 <div><p class="rot">Ya respaldado</p><p class="leyenda">La necesidad y el entorno, con fuentes secundarias.</p>
  <p class="rot" style="margin-top:36px">Todavía supuesto</p><p class="leyenda">Que el segmento pagaría, cuánto y cómo.</p></div>
</div></div>''' + fuente('Fuente: elaboración propia; preguntas de la investigación de mercado del informe final.'),
    'Torres', 20,
    ['Al cerrar el modelo teníamos respaldo secundario para la necesidad y el entorno, pero que el segmento pagaría, cuánto y cómo eran supuestos nuestros. Por eso, antes de definir el plan comercial, nos planteamos cinco preguntas: quién hibridaría primero, qué pesa más entre precio y confianza, qué respaldos necesita el cliente, cuánto pagaría y cómo lo financiaría.'],
    'Cinco preguntas abiertas antes de invertir')

et = [('Exploratoria', '4 entrevistas', 'Lenguaje y barreras del cliente'), ('Expertos', '5 especialistas', 'Condiciones técnicas y legales'),
      ('Encuesta', '201 → 196 válidas', 'Intención, precio y forma de pago'), ('En profundidad', '4 entrevistas', 'Interpretar los resultados')]
eh = ''.join(f'<div class="tarjeta{" ac" if i == 2 else ""}" data-f="{i}"><h3>{i + 1} · {a}</h3><span class="n" style="margin-top:14px">{b}</span><p>{c}</p></div>' for i, (a, b, c) in enumerate(et)).replace(' data-f="0"', '')
lam('blanco', cab('03 · La evidencia', 'Diseño de la investigación', 'Investigamos en cuatro etapas,', 'de escuchar a medir') + f'''
<div class="zona"><p class="leyenda" style="margin:0 0 30px;max-width:none"><span class="rot" style="margin-right:16px">Objetivo</span>medir la disposición a adoptar la hibridación y qué la explica.</p>
 <div class="tarjetas" style="grid-template-columns:repeat(4,1fr)">{eh}</div></div>''' +
    fuente('Fuente: investigación de mercado del equipo, 15 de octubre al 12 de noviembre de 2026; diseño mixto, exploratorio y descriptivo.'),
    'Torres', 25,
    ['El objetivo fue medir la disposición a adoptar la hibridación aditiva y qué la explica. Lo hicimos en cuatro etapas. Cuatro entrevistas exploratorias nos dieron el lenguaje y las barreras del cliente.',
     '[Clic] Cinco expertos fijaron las condiciones técnicas y legales. [Clic] Una encuesta de 201 respuestas, 196 válidas, midió intención, precio y forma de pago. [Clic] Y cuatro entrevistas en profundidad nos ayudaron a interpretar los resultados.'],
    'Investigamos en cuatro etapas, de escuchar a medir')

EXP = [('estado', 'Estado'), ('transporte', 'Transporte'), ('industria', 'Industria'), ('mecanica', 'Mecánica'), ('innovacion', 'Innovación')]
VALIDO = {'estado': 'La vía del proyecto experimental y la autorización por taller y modelo',
          'transporte': 'El seguimiento del ahorro a tres meses',
          'industria': 'Probar entre 30.000 y 50.000 km antes de vender',
          'mecanica': 'La seguridad, el ABS y la garantía de la batería',
          'innovacion': 'Sin comprensión no hay adopción'}
fi = ''.join(f'<div class="ficha" data-experto="{k}"><div class="sil"><svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="32" r="18" fill="#c8cace"/><path d="M12 86 C14 60 76 60 78 86 Z" fill="#c8cace"/></svg></div>'
             f'<p class="area">{a}</p><p class="nom">Especialista en {a.lower()}</p><p class="cargo"></p><p class="valido">{VALIDO[k]}</p></div>' for k, a in EXP)
lam('blanco', cab('03 · La evidencia', 'Expertos consultados', 'Cinco expertos, cinco miradas:', 'Estado, academia, industria y técnica') +
    f'<div class="zona" style="top:392px;bottom:120px"><div class="fichas">{fi}</div></div>' +
    fuente('Fuente: entrevistas a expertos, 28 de octubre al 9 de noviembre de 2026. Todos autorizaron su identificación con nombre y cargo.'),
    'Torres', 35,
    ['Escuchamos a cinco especialistas, uno por área. Desde el Estado, {{estado.nombre}}, {{estado.cargo}}, validó la vía del proyecto experimental. Desde el transporte, {{transporte.nombre}}, el seguimiento del ahorro a tres meses. Desde la industria, {{industria.nombre}}, que ya hibrida camiones, la necesidad de probar antes de vender. Desde la mecánica, {{mecanica.nombre}}, la seguridad y la garantía de la batería. Y desde la innovación, {{innovacion.nombre}}, que sin comprensión no hay adopción.'],
    'Cinco expertos, cinco miradas: Estado, academia, industria y técnica')

# =========================================================================== 16 a 27 · Diego
lam('blanco', cab('03 · La evidencia', 'Conclusiones comunes', 'Los cinco coincidieron:', 'probar en autos reales antes de vender') + '''
<div class="zona"><div class="g2 b">
 <div><p class="prota" style="font-size:160px">5 <small>de 5</small></p><p class="leyenda">especialidades: probar en autos reales, con la medición de un tercero.</p></div>
 <div>''' + kpis([('Autorización por taller y modelo', 'Estado, mecánica y transporte', 1), ('La barrera: confianza en el ahorro', 'industria, innovación, transporte y mecánica', 1),
                   ('Garantía de la batería', 'mecánica, transporte e industria', 1)]).replace('<dt>', '<dt style="font:700 40px/1.1 ArchivoC">') + '''
  <p class="nota" data-f="2" style="margin-top:18px">Nos cuestionaron: los motores en rueda suelen ser de baja potencia y quedan expuestos.</p></div>
</div></div>''' + fuente('Fuente: entrevistas a expertos, 2026; matriz de análisis del equipo con diez conclusiones comunes.'),
    'Diego', 35,
    ['Los cinco expertos coincidieron en una conclusión: probar en autos reales antes de vender, con la medición de un tercero. La industria recomendó recorrer entre 30.000 y 50.000 kilómetros por auto.',
     '[Clic] También coincidieron en que la autorización se da por taller y por combinación de kit y modelo, en que la barrera es la confianza en el ahorro y en que la batería necesita garantía. [Clic] Y nos cuestionaron algo: los motores en rueda suelen ser de baja potencia y quedan expuestos. Lo respondemos con la garantía y con la prueba del proyecto experimental.'],
    'Los cinco coincidieron: probar en autos reales antes de vender')

hip = [('H1', 'La intención es mayor en el uso laboral', 'intención por tipo de uso'), ('H2', 'La intención no varía con edad ni género', 'intención por edad y género'),
       ('H3', 'El ahorro predomina, junto a otro motivo', 'valoración de motivos'), ('H4', 'La barrera es la confianza, no el precio', 'primera duda'),
       ('H5', 'El respaldo externo da más confianza', 'valoración de respaldos'), ('H6', 'Prefieren hibridar a las alternativas', 'elección frente a auto nuevo')]
hb = ''.join(f'<tr><td class="num" style="color:var(--ac)">{a}</td><td>{b}</td><td style="color:var(--mu)">{c}</td></tr>' for a, b, c in hip)
lam('blanco', cab('03 · La evidencia', 'Hipótesis', 'De lo que escuchamos salieron', 'seis hipótesis medibles') +
    f'<div class="zona"><table class="tabla"><tr><th></th><th>Hipótesis</th><th>Se mide con</th></tr>{hb}</table></div>' +
    fuente('Fuente: elaboración propia con la segmentación y la etapa exploratoria; formuladas antes de la encuesta.'),
    'Diego', 20,
    ['De la segmentación y de lo que escuchamos salieron seis hipótesis, formuladas antes de ver los datos. Cada una se mide con una variable de la encuesta: la intención por tipo de uso, por edad y por género; la valoración de las motivaciones; la primera duda; la confianza que da cada respaldo, y la preferencia frente a un auto nuevo.'],
    'De lo que escuchamos salieron seis hipótesis medibles')

lam('blanco', cab('03 · La evidencia', 'Etapa cuantitativa', '196 conductores encuestados,', 'con cuotas por tipo de uso') + '''
<div class="zona"><div class="tarjetas" style="grid-template-columns:repeat(4,1fr)">
 <div class="tarjeta"><span class="n">201 → 196</span><p>respuestas y casos válidos</p></div>
 <div class="tarjeta"><span class="n">33</span><p>preguntas en línea</p></div>
 <div class="tarjeta"><span class="n">40 + 40</span><p>casos mínimos de uso laboral y particular</p></div>
 <div class="tarjeta"><span class="n">15-10 al 12-11</span><p>de 2026</p></div></div>
 <p class="nota" data-f="1" style="position:absolute;left:0;right:0;bottom:0">No probabilística: una muestra aleatoria habría exigido 385 casos. Leemos resultados indicativos.</p>
</div>''' + fuente('Fuente: encuesta del equipo, n = 196, 2026; muestreo no probabilístico por cuotas.'),
    'Diego', 20,
    ['La encuesta tuvo 33 preguntas en línea, entre el 15 de octubre y el 12 de noviembre. Usamos cuotas, con al menos 40 casos de uso laboral y 40 particulares. De 201 respuestas quedaron 196 válidas.',
     '[Clic] La muestra no es probabilística: una aleatoria habría exigido 385 casos y no existe un listado de conductores. Por eso leemos los resultados como indicativos.'],
    '196 conductores encuestados, con cuotas por tipo de uso')

ver = [('H1', 'Respaldada', '69,4% frente a 41,2% (p < 0,001)', 1), ('H2', 'Sin diferencia', 'edad y género no la explican', 1), ('H3', 'Respaldada', 'ahorro: 4,40 de 5', 1),
       ('H4', 'No se cumplió', 'precio y daño empatan: 60 y 60', 2), ('H5', 'No se cumplió', 'garantía escrita 4,13 frente a 3,96', 2), ('H6', 'Respaldada', '89,3% de los interesados', 2)]
vb = ''.join(f'<tr data-f="{f}"><td class="num" style="color:var(--ac)">{a}</td><td style="font-weight:700;color:{"var(--ac)" if b == "Respaldada" else "var(--fg)"}">{b}</td><td style="color:var(--mu)">{c}</td></tr>' for a, b, c, f in ver)
barras = columnas([69.4, 41.2], ['Uso laboral', 'Particular'], w=560, h=470, vmin=0, vmax=80, sufijo='%', clases=['bar', 'bar g'])
lam('blanco', cab('03 · La evidencia', 'Medimos y encontramos', 'El uso laboral quiere más:', '69,4% frente a 41,2%') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:560px 1fr;gap:70px">
 <div><p class="rot">Instalaría el kit</p>{barras}</div>
 <table class="tabla"><tr><th></th><th>Resultado</th><th>Dato</th></tr>{vb}</table>
</div></div>''' + fuente(F_ENC + ' Significancia de 5%.'),
    'Diego', 40,
    ['Medimos y encontramos que el uso laboral tiene más intención de instalar: 69,4% frente a 41,2% en los particulares, una diferencia significativa. La intención no varió con la edad ni con el género, y el ahorro fue la motivación mejor valorada, con 4,40 de 5.',
     '[Clic] Dos hipótesis no se cumplieron: el precio empató con el temor a dañar el auto como primera duda, y la garantía escrita dio más confianza que el respaldo externo. Entre los interesados, el 89,3% prefiere hibridar a cambiar de auto.'],
    'El uso laboral quiere más: 69,4% frente a 41,2%')

inte = [('Probar antes de vender', 'Precio y daño empatan como primera duda', 'Vender con el ahorro medido'),
        ('Garantía de la batería', 'Garantía escrita: 4,13 de 5', 'Garantía al centro de la oferta'),
        ('El cliente necesita financiamiento', 'Plus: aceptación entre 27% y 52%', 'Pago en cuotas con terceros')]
ib = ''.join(f'<tr data-f="{i if i else ""}"><td>{a}</td><td>{b}</td><td style="font-weight:700;color:var(--ac)">{c}</td></tr>'.replace(' data-f=""', '') for i, (a, b, c) in enumerate(inte))
lam('blanco', cab('03 · La evidencia', 'Conclusión integrada', 'Pagarían si pueden financiarlo', 'y si ven el ahorro medido') +
    f'<div class="zona"><table class="tabla"><tr><th>Expertos</th><th>Encuesta</th><th>Conclusión</th></tr>{ib}</table></div>' +
    fuente('Fuente: entrevistas a expertos y encuesta del equipo (n = 196; 194 respondieron la escalera de precios), 2026.'),
    'Diego', 25,
    ['Al cruzar ambas etapas, la conclusión es una: el segmento pagaría si puede financiarlo y si ve el ahorro medido. Expertos y encuesta coinciden en probar antes de vender. [Clic] Coinciden en la garantía. [Clic] Y en el financiamiento: la aceptación de Plus queda entre 27% y 52%.',
     'Difieren en algo: los expertos ponían la confianza como barrera principal y la encuesta mostró que el precio pesa igual. Por eso comunicamos precio y evidencia juntos.'],
    'Pagarían si pueden financiarlo y si ven el ahorro medido')

lam('negro', cab('03 · La evidencia', 'Qué cambió en el proyecto', 'La evidencia cambió', 'cinco decisiones del plan') + '''
<div class="zona"><div class="tarjetas" style="grid-template-columns:1fr 2fr 1fr;gap:48px">
 <div class="tarjeta"><h3>Se mantuvo</h3><p>La prioridad del uso laboral</p></div>
 <div class="tarjeta ac" data-f="1"><h3>Se modificó</h3><p style="color:var(--tinta)">La venta parte después de medir · ahorro informado con un intervalo · foco en la intensidad de uso · garantía de batería al centro · mensaje según el perfil</p></div>
 <div class="tarjeta" data-f="2"><h3>Se descartó</h3><p>Segmentar por edad o género · leer la preferencia como participación de mercado</p></div>
</div></div>''' + fuente('Fuente: elaboración propia con la investigación de mercado, 2026.'),
    'Diego', 25,
    ['La evidencia cambió el plan. Mantuvimos la prioridad del uso laboral.',
     '[Clic] Modificamos cinco decisiones: la venta parte después de medir en el proyecto experimental; el ahorro se informa con un intervalo, según el kilometraje; el foco está en la intensidad de uso; la garantía de la batería pasa al centro de la oferta, y el mensaje cambia según el perfil. [Clic] Y descartamos segmentar por edad o género.'],
    'La evidencia cambió cinco decisiones del plan')

lam('negro', cab('04 · El plan', 'Objetivos de marketing', 'Meta del primer año: 270 autos', 'y la promesa cumplida en 80%') + '''
<div class="zona"><p class="leyenda" style="margin:0 0 28px;max-width:none"><span class="rot" style="margin-right:16px">Segmento</span>el dueño de un auto de alto kilometraje urbano en la RM.</p>
 <div class="tarjetas" style="grid-template-columns:repeat(4,1fr)">
 <div class="tarjeta ac"><span class="n">270</span><p>instalaciones; conversión de 15% a 30% al mes 12</p></div>
 <div class="tarjeta" data-f="1"><span class="n">60%</span><p>de las ventas en Plus</p></div>
 <div class="tarjeta" data-f="1"><span class="n">80%</span><p>de clientes con el ahorro mínimo informado, a tres meses</p></div>
 <div class="tarjeta" data-f="1"><span class="n">80%</span><p>de notas 4 o 5 en confianza</p></div></div></div>''' +
    fuente('Fuente: elaboración propia; objetivos de marketing y metas del Cuadro de Mando Integral del informe final.'),
    'Diego', 25,
    ['Con segmentación concentrada en el dueño de un auto de alto kilometraje urbano, el objetivo general es instalar y certificar 2.850 kits en cinco años con un ahorro medido en cada uno. Para el primer año: 270 instalaciones, con una conversión que sube de 15% a 30% al mes 12.',
     '[Clic] Que Plus llegue al 60% de las ventas; que al menos el 80% de los clientes cumpla el ahorro mínimo informado a los tres meses, y al menos 80% de notas 4 o 5 en confianza.'],
    'Meta del primer año: 270 autos y la promesa cumplida en 80%')

ans = '''<svg class="svg" viewBox="0 0 760 500" width="760" height="500"><defs><marker id="fa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#22b8f0"/></marker></defs>
<text x="290" y="24" text-anchor="middle" class="et">Producto existente</text><text x="600" y="24" text-anchor="middle" class="et">Producto nuevo</text>
<text x="16" y="160" class="et" transform="rotate(-90 16 160)" text-anchor="middle">Mercado existente</text><text x="16" y="380" class="et" transform="rotate(-90 16 380)" text-anchor="middle">Mercado nuevo</text>
<rect x="140" y="44" width="300" height="220" fill="none" stroke="var(--ln)"/><rect x="450" y="44" width="300" height="220" fill="rgba(34,184,240,.16)" stroke="#22b8f0" stroke-width="2"/>
<rect x="140" y="274" width="300" height="220" fill="none" stroke="var(--ln)"/><rect x="450" y="274" width="300" height="220" fill="none" stroke="var(--ln)"/>
<text x="290" y="150" text-anchor="middle" class="et fg" style="font-size:28px">Penetración</text><text x="290" y="186" text-anchor="middle" class="et">año 2</text>
<text x="600" y="150" text-anchor="middle" class="et fg" style="font-size:28px">Desarrollo de producto</text><text x="600" y="186" text-anchor="middle" class="et" style="fill:#22b8f0">entrada</text>
<text x="290" y="380" text-anchor="middle" class="et">Desarrollo de mercado</text>
<text x="600" y="370" text-anchor="middle" class="et fg" style="font-size:28px">Diversificación</text><text x="600" y="406" text-anchor="middle" class="et">relacionada: Red Lumine, año 3</text>
<path d="M520 210 C440 236 380 236 330 210" fill="none" stroke="#22b8f0" stroke-width="3" marker-end="url(#fa)"/><path d="M330 214 C420 300 520 300 560 334" fill="none" stroke="#22b8f0" stroke-width="3" marker-end="url(#fa)"/></svg>'''
mapa = '''<svg class="svg" viewBox="0 0 800 500" width="800" height="500"><line x1="90" y1="440" x2="780" y2="440" class="eje0"/><line x1="90" y1="20" x2="90" y2="440" class="eje0"/>
<text x="435" y="490" text-anchor="middle" class="et">antigüedad del auto que admite</text><text x="30" y="230" class="et" transform="rotate(-90 30 230)" text-anchor="middle">inversión inicial</text>
<text x="200" y="468" text-anchor="middle" class="et">auto nuevo</text><text x="440" y="468" text-anchor="middle" class="et">hasta 7 años</text><text x="680" y="468" text-anchor="middle" class="et">sin límite</text>
<circle cx="200" cy="70" r="14" fill="var(--mu)"/><text x="222" y="62" class="et fg">MG 3 Hybrid · $16.990.000</text>
<circle cx="200" cy="140" r="14" fill="var(--mu)"/><text x="222" y="132" class="et fg">Eléctrico · $13.990.000</text>
<circle cx="440" cy="395" r="14" fill="var(--mu)"/><text x="440" y="366" text-anchor="middle" class="et fg">Gas: menor costo</text>
<circle cx="680" cy="320" r="20" fill="#22b8f0"/><text x="680" y="282" text-anchor="middle" class="vl ac">Lumine</text><text x="680" y="372" text-anchor="middle" class="et fg">$4,6 a $5,3 M</text></svg>'''
lam('negro', cab('04 · El plan', 'Ansoff y posicionamiento', 'Entrada con producto nuevo,', 'crecimiento por profundidad') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:760px 1fr;gap:60px"><div>{ans}</div><div data-f="1">{mapa}</div></div></div>''' +
    fuente('Fuente: elaboración propia con base en Ansoff (1957), BioBioChile (2026), Gasco (s.f.), Autofact (2026) y Autocosmos (2026); precios con IVA.'),
    'Diego', 25,
    ['Entramos con desarrollo de producto: el mercado ya busca gastar menos, pero no existe hibridación aditiva para autos livianos en Chile. Desde el segundo año crecemos por penetración, con más instalaciones sobre cada modelo ya calibrado: crecemos por profundidad. Desde el tercero sumamos la Red Lumine, una diversificación relacionada.',
     '[Clic] En el mapa de posicionamiento quedamos solos en la franja de los autos que se conservan sin límite de antigüedad, con una inversión de $4,6 a $5,3 millones, entre un cuarto y un tercio del híbrido nuevo.'],
    'Entrada con producto nuevo, crecimiento por profundidad')

mix = [('Producto', 'tres niveles', 'Esencial o Plus; garantía de 3 años la batería y 2 el resto', 0),
       ('Precio', 'basado en el valor', '$4.590.000 y $5.290.000 con IVA; Plus se recupera en 34,5 meses', 0),
       ('Plaza', 'directa, luego red', 'Taller propio y plataforma comercial; Red Lumine desde el año 3', 1),
       ('Promoción', 'educativa', 'Casos con ahorro medido y demostraciones en dinamómetro', 1),
       ('Personas', 'desarrollo propio', 'Dúos formados y validados con Lumine Habilita', 2),
       ('Procesos', 'estandarización', 'Un procedimiento por modelo, con puntos de control', 2),
       ('Evidencia física', 'medición', 'Estimador de ahorro e informe a tres meses', 2)]
mb = ''.join(f'<tr{" data-f=" + chr(34) + str(f) + chr(34) if f else ""}><td style="font:500 26px ArchivoSC;letter-spacing:.08em;text-transform:uppercase">{a}</td><td style="color:var(--ac);font-style:italic">{b}</td><td>{c}</td></tr>' for a, b, c, f in mix)
lam('negro', cab('04 · El plan', 'Mix de marketing · 7P', 'Cada variable del mix', 'responde a una duda que medimos') +
    f'<div class="zona" style="top:392px"><table class="tabla" style="font-size:26px"><tr><th>Variable</th><th>Estrategia</th><th>Decisión</th></tr>{mb}</table></div>' +
    fuente('Fuente: elaboración propia; precios con IVA; recuperación según la simulación del equipo para el colectivo de referencia.'),
    'Diego', 40,
    ['Cada variable del mix responde a lo que medimos. Producto: Esencial o Plus, con garantía de tres años para la batería y dos para el resto. Precio, basado en el valor para el cliente: $4.590.000 y $5.290.000 con IVA; el colectivo de referencia recupera Plus en 34,5 meses y su ahorro cubre la cuota de un crédito a 48 meses.',
     '[Clic] Plaza: el taller propio y la plataforma comercial; desde el tercer año, la red. Promoción educativa, con casos medidos. [Clic] Personas formadas por nosotros, procesos estandarizados y, como evidencia física, el informe a tres meses. La plataforma comercial une plaza, promoción, procesos y evidencia física.'],
    'Cada variable del mix responde a una duda que medimos')

col_inst = columnas([270, 505, 640, 650, 785], ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], w=1000, h=480, vmin=0, vmax=900, dec=0)
lam('negro', cab('04 · El plan', 'Demanda y presupuesto', 'La captación limita las ventas,', 'no el tamaño del mercado') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1000px 1fr;gap:64px">
 <div><p class="rot">Instalaciones por año</p>{col_inst}</div>
 <div>{kpis([('$1.113,6 → $3.393,5 <small>M</small>', 'ingresos del año 1 al año 5', 1), ('$10.000', 'por cotización; conversión de 15% a 30%', 1),
            ('$273,1 <small>M</small>', 'presupuesto de marketing en cinco años: 2,3% de los ingresos', 2)])}</div>
</div></div>''' + fuente('Fuente: elaboración propia; pronóstico del escenario central, pesos de 2026 netos de IVA.'),
    'Diego', 30,
    ['Las ventas se estiman de abajo hacia arriba. Así llegamos a 270 instalaciones el primer año y 785 el quinto. El mercado no es el límite: instalaríamos entre 44% y 57% de la demanda atendible.',
     '[Clic] En pesos, los ingresos pasan de $1.113,6 a $3.393,5 millones. La pauta digital genera cotizaciones a unos $10.000 cada una, solo de modelos calibrados, y la conversión sube de 15% a 30%. [Clic] El presupuesto de marketing suma $273,1 millones, 2,3% de los ingresos.'],
    'La captación limita las ventas, no el tamaño del mercado')

flujo = [('Cotización y asesoría', 'verificador y estimador de ahorro'), ('Instalación', '4 controles: apto · masa y reparto · aislación · frenado'),
         ('Certificación y entrega', 'firma el Responsable Técnico'), ('Posventa', 'informe de ahorro a tres meses')]
fb = ''.join(f'<div class="tarjeta{" ac" if i == 1 else ""}"><h3>{i + 1} · {a}</h3><p>{b}</p></div>' for i, (a, b) in enumerate(flujo))
lam('blanco', cab('04 · El plan', 'Operaciones', 'Un auto por jornada de dúo,', 'con cuatro controles') + f'''
<img src="img/duo-taller-claro.jpg" alt="" style="position:absolute;right:96px;top:600px;width:620px;height:340px;object-fit:cover"><p class="provisional" style="right:110px;top:612px">Imagen provisional</p>
<div class="zona"><div class="tarjetas" style="grid-template-columns:repeat(4,1fr)">{fb}</div>
 <div style="position:absolute;left:0;bottom:0;width:1000px">{kpis([('8,4 h', 'por auto: una jornada de dúo', 1), ('15 autos', 'al mes por dúo; uso de 70% a 73%', 1), ('Kits', 'su llegada es el cuello de botella', 2)]).replace('<dl class="kpis">', '<dl class="kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:36px">')}</div>
</div>''' +
    fuente('Fuente: elaboración propia; tiempos estimados por el equipo. Imagen ilustrativa.'),
    'Diego', 25,
    ['Seguimos un auto desde la cotización hasta la posventa. El verificador confirma que el modelo está calibrado y el estimador entrega su ahorro. En el taller, un dúo interviene el auto en una jornada, con cuatro controles que detienen el avance: que el auto sea apto, la masa y el reparto entre ejes, la aislación de alta tensión y el frenado en el dinamómetro. El Responsable Técnico firma el certificado.',
     '[Clic] Son 8,4 horas por auto; un dúo instala 15 autos al mes y usaríamos entre 70% y 73% de la capacidad. El cuello de botella es la llegada de los kits.'],
    'Un auto por jornada de dúo, con cuatro controles')

niv = [('1', 'Aprendiz asistido', 'encargado de seguridad del dúo'), ('2', 'Habilitado con supervisión', 'instala con un nivel 3 o 4 al lado'),
       ('3', 'Autónomo', 'instala en dúo y firma su trabajo'), ('4', 'Formador', 'enseña y valida a otros')]
nb = ''.join(f'<div style="display:flex;gap:18px;align-items:baseline;border-top:1px solid var(--ln);padding:12px 0"><b style="font:700 44px ArchivoC;color:var(--ac)">{a}</b><div><p style="font:700 28px Archivo">{b}</p><p style="font:400 24px Archivo;color:var(--mu)">{c}</p></div></div>' for a, b, c in niv)
lam('blanco', cab('04 · El plan', 'Recursos humanos · Lumine Habilita', 'Técnicos formados en casa:', 'los que el mercado no entrega') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1fr 1fr 1fr;gap:56px">
 <div><p class="prota" style="font-size:150px">24 <small>de 39</small></p><p class="leyenda" style="font-size:28px">competencias que ninguna formación en Chile entrega hoy <span class="marca">estimación</span></p></div>
 <div data-f="1"><p class="rot">Cuatro niveles</p>{nb}</div>
 <div data-f="2"><p class="rot">Dotación</p>{columnas([13, 15, 19, 24, 25], ['A1', 'A2', 'A3', 'A4', 'A5'], w=500, h=380, vmin=0, vmax=30, dec=0)}
  <p class="leyenda" style="font-size:26px">Gestión contratada en el mercado; técnicos formados en casa.</p></div>
</div></div>''' + fuente('Fuente: elaboración propia; Observatorio Laboral Metropolitano et al. (2020); estimación del equipo sobre las 39 competencias del cargo.'),
    'Diego', 30,
    ['El kit trabaja a 71,3 volts, sobre el umbral de alta tensión, y el técnico que combina mecánica y alta tensión casi no existe formado. Según nuestra estimación, ninguna formación en Chile entrega hoy 24 de las 39 competencias del cargo.',
     '[Clic] Por eso formamos a nuestros técnicos con Lumine Habilita, en cuatro niveles, de aprendiz a formador, y siempre en dúo. [Clic] La gestión se contrata en el mercado. La dotación crecería de 13 personas el primer año a 25 el quinto.'],
    'Técnicos formados en casa: los que el mercado no entrega')

# =========================================================================== 28 a 39 · Lukas
def gantt():
    X0, X1 = 380, 1720; meses = 84  # enero de 2027 a diciembre de 2033
    X = lambda m: X0 + (X1 - X0) * m / meses
    out = ['<svg class="svg" viewBox="0 0 1728 520" width="1728" height="520">']
    for a in range(8):
        out.append(f'<line x1="{X(a * 12):.0f}" y1="0" x2="{X(a * 12):.0f}" y2="470" class="eje"/>' + (f'<text x="{X(a * 12) + 8:.0f}" y="28" class="et fg">{2027 + a}</text>' if a < 7 else ''))
    filas = [('Proyecto experimental', '3 autos, sin cobro', [(0, 12, 'D.S. 67')], None, 0),
             ('Norma (supuesto)', 'que incluya los sistemas aditivos', [], (12, 'ene. 2028'), 0),
             ('Preapertura', 'local, equipos y primer dúo', [(12, 18, '$218,6 M')], None, 1),
             ('Operación del taller', 'apertura en julio de 2028', [(18, 30, '1 a 4 dúos'), (30, 42, ''), (42, 54, '5 dúos'), (54, 66, ''), (66, 78, '6 dúos')], None, 1),
             ('Red Lumine', 'desde el año 3', [(42, 54, '3'), (54, 66, '8'), (66, 78, '16 talleres')], None, 2)]
    for i, (t, s, barras, hito, f) in enumerate(filas):
        y = 52 + i * 84
        g = f'<g data-f="{f}">' if f else '<g>'
        g += f'<text x="0" y="{y + 30}" class="et fg" style="font-size:28px">{t}</text><text x="0" y="{y + 60}" class="et">{s}</text>'
        for j, (a, b, lab) in enumerate(barras):
            cl = 'bar' if i >= 3 else 'bar g'
            g += f'<rect x="{X(a) + 2:.0f}" y="{y + 12}" width="{X(b) - X(a) - 4:.0f}" height="44" class="{cl} bx" style="--d:{.2 + j * .12:.2f}s;opacity:{1 - (j % 2) * .25}"/>'
            if lab: g += f'<text x="{X(a) + 12:.0f}" y="{y + 44}" class="vl" style="fill:{"#031015" if i >= 3 else "#fff"};font-size:28px">{lab}</text>'
        if hito:
            m, lab = hito; x = X(m)
            g += f'<path d="M{x:.0f} {y + 10} l24 24 l-24 24 l-24 -24 Z" fill="var(--fd)" stroke="var(--fg)" stroke-width="3"/>' + (f'<text x="{x + 34:.0f}" y="{y + 44}" class="et fg">{lab}</text>' if lab else '')
        out.append(g + '</g>')
    out.append(f'<g data-f="1"><line x1="{X(18):.0f}" y1="40" x2="{X(18):.0f}" y2="480" stroke="var(--ac)" stroke-width="3" stroke-dasharray="10 8"/>'
               f'<text x="{X(18) + 12:.0f}" y="506" class="et" style="fill:var(--ac)">Se abre solo con la norma publicada</text></g></svg>')
    return ''.join(out)
lam('blanco', cab('04 · El plan', 'Implementación · Carta Gantt', 'Primero probar, luego normar', 'y recién después abrir') +
    f'<div class="zona" style="top:384px;bottom:120px">{gantt()}</div>' +
    fuente('Fuente: elaboración propia con los plazos del D.S. N° 67 de 2020; fecha de la norma: supuesto del equipo. Primer año: personas $160,6 M y local $66,1 M.'),
    'Lukas', 35,
    ['La implementación sigue una secuencia: probar, normar y recién después abrir. En 2027, el proyecto experimental bajo el Decreto 67 prueba el kit en tres autos, sin cobrar, y postularía a un fondo público de investigación y desarrollo, el Startup CTCI de la ANID. Suponemos la norma en enero de 2028.',
     '[Clic] Con ella parte una preapertura de seis meses que desembolsa $218,6 millones, y el taller abriría en julio de 2028 con un dúo, hasta llegar a cuatro en el décimo mes. El primer año, las personas cuestan $160,6 millones y el local, $66,1. [Clic] Desde el tercer año, la Red Lumine suma 3, 8 y 16 talleres.'],
    'Primero probar, luego normar y recién después abrir')

seg = [(88.4, 'Equipos', 'dinamómetro, local y bodega'), (77.0, 'Puesta en marcha y software', ''), (230.4, 'Capital de trabajo', 'kits pagados y déficit de la caja'), (6.3, '', '')]
tot = 402.1; W = 1728; xs = 0; sb = ['<svg class="svg" viewBox="0 0 1728 260" width="1728" height="260">']
for i, (v, t, d) in enumerate(seg):
    w = W * v / tot
    sb.append(f'<rect x="{xs:.0f}" y="20" width="{w - 4:.0f}" height="110" class="{"bar" if i == 2 else "bar g"} bx" style="--d:{.3 + i * .15:.2f}s"/>')
    if t:
        sb.append(f'<text x="{xs + 4:.0f}" y="176" class="vl">${str(v).replace(".", ",")} M</text><text x="{xs + 4:.0f}" y="212" class="et fg">{t}</text><text x="{xs + 4:.0f}" y="244" class="et">{d}</text>')
    xs += w
sb.append('</svg>')
lam('blanco', cab('05 · Los números', 'Inversión inicial', 'Abrir el taller exige', '$402,1 millones en el año 0') + f'''
<div class="zona"><p class="prota" style="font-size:150px">${cuenta(402.1, 1, esp=.3)} <small>millones</small></p><div style="margin-top:24px">{''.join(sb)}</div>
 <p class="leyenda" style="font-size:26px;max-width:none">Más garantía de arriendo ($3,6 M) y costo financiero del calendario ($2,7 M).</p></div>''' +
    fuente('Fuente: elaboración propia con el libro de cálculo del Plan Financiero; activo fijo valorizado al precio publicado (millones de pesos de 2026, netos de IVA).'),
    'Lukas', 25,
    ['Primero, lo que necesita el proyecto. Abrir el taller exige $402,1 millones en el año cero. $88,4 millones son equipos, y la partida mayor es el dinamómetro de chasis, que alimenta la biblioteca de calibraciones. $77,0 millones son la puesta en marcha y el software. Y $230,4 millones son capital de trabajo.'],
    'Abrir el taller exige $402,1 millones en el año 0')

caja = [-218.6, -244.6, -269.1, -298.0, -311.0, -346.0, -379.9, -370.9, -390.1, -387.7, -412.0, -405.6, -402.4]
def linea_caja():
    w, h = 1200, 470; X = lambda m: 70 + m * (w - 110) / 12; Y = lambda v: 30 + (-v - 200) / 230 * (h - 90)
    pts = ' '.join(f'{X(m):.0f},{Y(v):.0f}' for m, v in enumerate(caja))
    s = [f'<svg class="svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">']
    for v in (-200, -300, -400):
        s.append(f'<line x1="60" y1="{Y(v):.0f}" x2="{w - 30}" y2="{Y(v):.0f}" class="eje"/><text x="50" y="{Y(v) + 8:.0f}" text-anchor="end" class="et">{str(v).replace("-", "−")}</text>')
    for m in range(13):
        s.append(f'<text x="{X(m):.0f}" y="{h - 12}" text-anchor="middle" class="et">{m}</text>')
    s.append(f'<polygon points="{X(0):.0f},{Y(-200):.0f} {pts} {X(12):.0f},{Y(-200):.0f}" class="area"/><polyline points="{pts}" class="linea" pathLength="1"/>')
    s.append(f'<g data-f="1"><circle cx="{X(10):.0f}" cy="{Y(-412.0):.0f}" r="12" class="punto"/><text x="{X(10):.0f}" y="{Y(-412.0) + 50:.0f}" text-anchor="middle" class="vl ac">mes 10</text></g></svg>')
    return ''.join(s)
lam('blanco', cab('05 · Los números', 'Capital de trabajo', 'La caja toca fondo', 'en el décimo mes de operación') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1200px 1fr;gap:56px">
 <div><p class="rot">Caja acumulada del primer año, millones</p>{linea_caja()}</div>
 <div>{kpis([('$180,8 <small>M</small>', 'el mayor déficit de la caja operativa', 1), ('2 meses', 'viaja el kit: se paga al pedir y al embarcar; el cliente paga al instalar', 2)])}</div>
</div></div>''' + fuente('Fuente: elaboración propia con el libro de cálculo, primer año mes a mes; método del déficit acumulado máximo (Sapag Chain et al., 2014).'),
    'Lukas', 30,
    ['El capital de trabajo se calculó con el déficit acumulado máximo, mes a mes. La caja parte con los desembolsos de la preapertura y toca fondo en el décimo mes de operación.',
     '[Clic] El mayor déficit operativo llega a $180,8 millones. [Clic] La causa es el ciclo del kit: lo pagamos al pedirlo y al embarcarlo, viaja cerca de dos meses, y el cliente paga el saldo recién al instalar.'],
    'La caja toca fondo en el décimo mes de operación')

wf = '''<svg class="svg" viewBox="0 0 1100 470" width="1100" height="470">''' + RAYADO + '''<line x1="0" y1="420" x2="1100" y2="420" class="eje0"/>
<rect x="40" y="40" width="230" height="380" class="bar g by"/><text x="155" y="26" text-anchor="middle" class="vl">$4.210.084</text><text x="155" y="458" text-anchor="middle" class="et fg">Ingreso neto</text>
<rect x="320" y="40" width="230" height="292" class="bar byn" style="--d:.5s"/><text x="435" y="200" text-anchor="middle" class="vl" style="fill:#031015;font-size:48px">76,8%</text><text x="435" y="458" text-anchor="middle" class="et fg">Kit · $3,23 M</text>
<g data-f="1"><rect x="600" y="332" width="230" height="18" class="bar n"/><text x="715" y="458" text-anchor="middle" class="et">Otros variables</text>
<rect x="880" y="350" width="200" height="70" class="bar h"/><text x="980" y="336" text-anchor="middle" class="vl ac">$0,78 M</text><text x="980" y="458" text-anchor="middle" class="et fg">Margen</text></g></svg>'''
lam('blanco', cab('05 · Los números', 'Ingresos y costos', 'De cada $100 de ingreso,', 'el kit se lleva $76,8') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1100px 1fr;gap:60px"><div><p class="rot">Por instalación, mezcla 40% Esencial y 60% Plus</p>{wf}</div>
 <div><p class="leyenda" style="font-size:30px">Kit costeado pieza por pieza, al precio publicado más bajo y sin descuentos por volumen.</p>
  <p class="nota" data-f="1" style="margin-top:28px">Margen de contribución desde el año 3, después de garantía, medios de pago y comisiones.</p></div></div></div>''' +
    fuente('Fuente: elaboración propia; ingreso neto = (40% × $4.590.000 + 60% × $5.290.000) ÷ 1,19; dólar de $984,49 (SII, 12-11-2026).'),
    'Lukas', 30,
    ['Por instalación entran $4.210.084 netos, ponderando 40% Esencial y 60% Plus. El kit cuesta $3,23 millones en esa mezcla: de cada $100 de ingreso, se lleva $76,8. Lo costeamos pieza por pieza, al precio publicado más bajo entre las opciones que cumplen la ficha técnica, sin descuentos por volumen.',
     '[Clic] Después de la garantía, los medios de pago y las comisiones, quedan $0,78 millones de margen de contribución por instalación desde el tercer año.'],
    'De cada $100 de ingreso, el kit se lleva $76,8')

fp = columnas([-402.1, -80.6, 160.3, 151.0, 104.7, 419.4], ['Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], w=1150, h=480, vmin=-450, vmax=450)
lam('blanco', cab('05 · Los números', 'Flujo de caja puro', 'Consume caja el primer año', 'y la genera desde el segundo') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1150px 1fr;gap:56px"><div>{fp}</div>
 <div data-f="1">{kpis([('$228,5 <small>M</small>', 'del año 5 son recuperaciones: capital de trabajo, valor de desecho y garantía')])}</div></div></div>''' +
    fuente(F_INF),
    'Lukas', 20,
    ['El flujo puro mide el proyecto como si los socios pusieran todo el dinero. Consume $80,6 millones el primer año y genera caja desde el segundo. El cuarto baja porque entra un dúo nuevo.',
     '[Clic] Y el quinto incluye $228,5 millones de recuperaciones: el capital de trabajo, el valor de desecho y la garantía de arriendo.'],
    'Consume caja el primer año y la genera desde el segundo')

lam('blanco', cab('05 · Los números', 'Tasa de descuento', 'Ku de 8,13%:', 'dos industrias, según su peso') + '''
<div class="zona"><div class="tarjetas" style="grid-template-columns:1fr 1fr 1.2fr;gap:48px">
 <div class="tarjeta"><span class="n">76,8%</span><h3>Autopartes</h3><p>porque el kit es una autoparte</p></div>
 <div class="tarjeta"><span class="n">23,2%</span><h3>Servicio automotriz</h3><p>porque lo instalamos y calibramos</p></div>
 <div class="tarjeta ac" data-f="1"><span class="n">β 1,03</span><h3>CAPM</h3><p>Ku = 2,63% + 1,03 × (4,23% + 1,10%)</p></div></div>
 <p class="nota" data-f="2" style="position:absolute;left:0;right:0;bottom:0">Si vendemos una pieza y un servicio, nuestro riesgo es la mezcla de ambos.</p></div>''' +
    fuente('Fuente: elaboración propia con base en Damodaran (2026a), betas por industria; Banco Central de Chile (2026), bonos en UF a 10 años; CAPM de Sharpe.'),
    'Lukas', 30,
    ['La tasa sale del CAPM. Como no existe una industria igual a la nuestra, combinamos dos de la base de Damodaran según su peso en el negocio: autopartes, porque el kit es una autoparte, y servicio automotriz, porque lo instalamos y calibramos.',
     '[Clic] Con una tasa libre de riesgo de 2,63%, un premio de mercado de 4,23% y 1,10% de riesgo país, Ku llega a 8,13%. [Clic] Dicho simple: si vendemos una pieza y un servicio, nuestro riesgo es la mezcla de ambos.'],
    'Ku de 8,13%: dos industrias, según su peso')

lam('negro', cab('05 · Los números', 'Cómo se financia', 'Como sus comparables:', '70% socios y 30% crédito') + '''
<div class="zona"><p class="leyenda" style="margin:0 0 26px;max-width:none"><span class="rot" style="margin-right:16px">Industrias comparables</span>deuda equivalente a 42,37% del patrimonio.</p>
 <div data-f="1" style="display:flex;height:220px;gap:6px"><div style="flex:70.24;background:var(--celeste);padding:24px 28px;color:#031015"><b style="font:700 72px/1 ArchivoC">$279,5 M</b><p style="font:500 26px ArchivoSC;letter-spacing:.1em;text-transform:uppercase;margin-top:10px">Socios · 70,24%</p></div>
 <div style="flex:29.76;background:var(--linea2);padding:24px 28px"><b style="font:700 72px/1 ArchivoC">$122,6 M</b><p style="font:500 26px ArchivoSC;letter-spacing:.1em;text-transform:uppercase;margin-top:10px;color:var(--suave)">Crédito · 29,76%</p></div></div>
 <p class="leyenda" data-f="2" style="margin-top:28px;max-width:none">Crédito a cinco años: cinco cuotas de $30,6 M y un costo real de 7,86%. <span class="marca">supuesto</span></p></div>''' +
    fuente('Fuente: elaboración propia con base en Damodaran (2026a); plazo del crédito: supuesto del equipo, sin oferta bancaria; Kd = tasa comercial (Banco Central, 2026) + 3 puntos.'),
    'Lukas', 25,
    ['¿Cómo se financian los proyectos de esta industria? Las empresas comparables tienen una deuda equivalente al 42,37% de su patrimonio: cerca de 30% deuda y 70% patrimonio.',
     '[Clic] Seguimos esa proporción: los socios aportan $279,5 millones y un crédito bancario pone $122,6 millones. [Clic] Es a cinco años, con cinco cuotas de $30,6 millones y un costo real de 7,86%. Una empresa sin historia accedería al crédito con garantías estatales como Fogape.'],
    'Como sus comparables: 70% socios y 30% crédito')

fi_ = columnas([-279.5, -111.2, 129.7, 121.9, 78.5, 389.8], ['Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'], w=1150, h=480, vmin=-450, vmax=450)
lam('negro', cab('05 · Los números', 'Flujo del inversionista', 'Con el crédito, el socio', 'aporta menos y gana más') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1150px 1fr;gap:56px"><div>{fi_}</div>
 <div data-f="1">{kpis([('8,22%', 'Ke: lo que exige el socio, con el riesgo del crédito'), ('7,86%', 'Kd: lo que cuesta la deuda, menos de lo que rinde el proyecto')])}</div></div></div>''' +
    fuente(F_INF.replace('escenario central', 'flujo del inversionista, escenario central')),
    'Lukas', 20,
    ['Con el crédito, el socio aporta $279,5 millones en vez de $402,1. Su flujo es negativo el primer año, porque además paga la primera cuota, y positivo desde el segundo.',
     '[Clic] Lo que exige el socio, Ke, sube apenas a 8,22%, porque el banco cobra como si asumiera casi todo el riesgo del crédito. Y como la deuda cuesta 7,86%, menos de lo que rinde el proyecto, la rentabilidad del socio sube.'],
    'Con el crédito, el socio aporta menos y gana más')

lam('negro', cab('05 · Los números', 'Indicadores', 'Crea valor: TIR de 16,13%', 'contra un Ku de 8,13%') + f'''
<div class="zona" style="top:400px"><svg class="svg" viewBox="0 0 1000 560" width="900" height="504" style="position:absolute;left:0;top:0">{gauge(500, 520, 440, 20, 8.13, 16.13, "KU 8,13%")}</svg>
 <div class="lect" style="position:absolute;left:0;width:900px;top:300px"><b>{cuenta(16.13, 2, esp=.5, dur=1.5)}</b><em>%</em><i>TIR del proyecto puro</i></div>
 <div style="position:absolute;right:0;width:600px;top:0">{kpis([('$140,2 <small>M</small>', 'VAN del proyecto puro', 1), ('18,41%', 'TIR de los socios; VAN de $144,6 M', 2), ('Año 2', 'sobre el equilibrio: 505 frente a 435', 2)])}</div></div>''' +
    fuente('Fuente: elaboración propia con el libro de cálculo del Plan Financiero, escenario central; Ku por CAPM con el beta ponderado de dos industrias (Damodaran, 2026a).'),
    'Lukas', 35,
    ['Los dos flujos cumplen los criterios. El proyecto puro tiene una TIR de 16,13%, frente a un Ku de 8,13%. [Clic] Su VAN es de $140,2 millones.',
     '[Clic] Para el socio, la TIR es 18,41% y el VAN, $144,6 millones. Y desde el segundo año operamos sobre el equilibrio: 505 instalaciones frente a las 435 necesarias.'],
    'Crea valor: TIR de 16,13% contra un Ku de 8,13%')

esc = [('Pesimista', '1.345', '−$522,7 M', '−19,84%', 'No recupera', 'g', 1), ('Central', '2.850', '$144,6 M', '18,41%', '4,45 años', 'c', 0), ('Optimista', '3.745', '$470,5 M', '32,70%', '3,55 años', 'g', 2)]
eb = ''.join(f'<div class="tarjeta{" ac" if k == "c" else ""}"{f" data-f={chr(34)}{f}{chr(34)}" if f else ""}><h3>{a}</h3><span class="n" style="font-size:80px;margin-top:14px">{c}</span><p>VAN del socio · TIR {d}</p><p>{b} instalaciones · recupera: {e}</p></div>' for a, b, c, d, e, k, f in esc)
lam('negro', cab('05 · Los números', 'Escenarios', 'Según la demanda, el VAN', 'va de −$522,7 a +$470,5 millones') +
    f'<div class="zona"><div class="tarjetas" style="grid-template-columns:repeat(3,1fr);gap:48px">{eb}</div><p class="leyenda" style="position:absolute;left:0;bottom:0;max-width:none">Proyecto puro, central: recuperación descontada en 4,51 años.</p></div>' +
    fuente('Fuente: elaboración propia; escenarios del flujo del inversionista según el costo por cotización ($15.000, $10.000 y $7.500) y la conversión.'),
    'Lukas', 25,
    ['Los escenarios mueven lo que la investigación no pudo medir: el costo por cotización y la conversión. En el central, el socio recupera su aporte descontado en 4,45 años y el proyecto puro, en 4,51.',
     '[Clic] En el pesimista instalaríamos 1.345 autos y el VAN del socio caería a −$522,7 millones. [Clic] En el optimista, 3.745 autos y $470,5 millones.'],
    'Según la demanda, el VAN va de −$522,7 a +$470,5 millones')

sens = [('−5,0%', [418.2, 423.6, 437.7, 448.8, 455.5]), ('−2,5%', [270.9, 275.9, 289.0, 302.0, 308.4]), ('Sin cambio', [123.1, 128.1, 140.2, 151.8, 160.7]),
        ('+2,5%', [-26.2, -20.9, -9.9, 0.6, 9.1]), ('+5,0%', [-182.1, -175.7, -165.1, -154.1, -147.2])]
def celda(v):
    a = min(1, abs(v) / 460) * .8 + .12
    t = f'{abs(v):,.1f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    cero = ' cero' if abs(v) < 1 else ''
    return f'<td class="{"p" if v >= 0 else "m"}{cero}" style="--a:{a:.2f}"{" data-f=" + chr(34) + "1" + chr(34) if cero else ""}>{"−" if v < 0 else ""}{t}</td>'
sb_ = ''.join(f'<tr{" class=fila-k" if k == "+2,5%" else ""}><th style="text-align:right">{k}</th>{"".join(celda(v) for v in vs)}</tr>' for k, vs in sens)
lam('negro', cab('05 · Los números', 'Sensibilidad de dos variables', 'El costo del kit pesa más', 'que la conversión del primer año') + f'''
<div class="zona"><div class="g2" style="grid-template-columns:1080px 1fr;gap:56px">
 <div><table class="sens" style="width:100%;border-collapse:collapse"><tr><th style="text-align:right">Kit ↓ · conversión →</th><th>10%</th><th>12,5%</th><th>15%</th><th>17,5%</th><th>20%</th></tr>{sb_}</table>
  <p class="et" style="font:400 24px Archivo;color:var(--gris);margin-top:12px">VAN puro en millones de pesos, a Ku = 8,13%</p></div>
 <div>{kpis([('+2,3%', 'en el kit, o −1,96% en el precio, deja el VAN puro en cero', 1), ('$25.229', 'más por kit con cada $10 de alza del dólar', 2)])}</div>
</div></div>''' + fuente('Fuente: elaboración propia con el libro de cálculo; conversión de régimen de 30% al mes 12; dólar observado de $984,49 (SII, 12-11-2026).'),
    'Lukas', 30,
    ['Cruzamos las dos variables que más pesan, como se pidió. La conversión del primer mes mueve el VAN en unos $38 millones; el costo del kit, en más de $600 millones entre −5% y +5%.',
     '[Clic] Un alza de 2,3% en el kit, o una baja de 1,96% en el precio, deja el VAN puro en cero. [Clic] Y como cada $10 de alza del dólar suma $25.229 al kit, bastaría un alza de unos $30 sobre los $984,49 que usamos para llegar a ese umbral.'],
    'El costo del kit pesa más que la conversión del primer año')

lam('negro', cab('06 · La decisión', 'Mitigación del riesgo del kit', 'Si el kit cotiza sobre $3,31 M,', 'no se invierte') + '''
<div class="zona"><div class="tarjetas" style="grid-template-columns:repeat(3,1fr);gap:48px">
 <div class="tarjeta ac" data-f="1"><h3>Contrato marco</h3><p style="color:var(--tinta)">Licitación entre proveedores y precio fijo por doce meses</p></div>
 <div class="tarjeta ac" data-f="1"><h3>Cobertura cambiaria</h3><p style="color:var(--tinta)">Forward de dólares por embarque, con respaldo de COBEX</p></div>
 <div class="tarjeta ac" data-f="1"><h3>Precio</h3><p style="color:var(--tinta)">Palanca adicional, dentro de la disposición a pagar medida</p></div></div>
 <p class="nota" data-f="2" style="position:absolute;left:0;right:0;bottom:0">Y otro riesgo, a la vista: sin las recuperaciones del año 5, el VAN puro es −$14,4 millones.</p></div>''' +
    fuente('Fuente: elaboración propia; $3,31 M = costo ponderado del kit que deja el VAN puro en cero; COBEX de Corfo.'),
    'Lukas', 25,
    ['Por eso fijamos una regla: la inversión comercial se compromete solo con una cotización formal del kit ponderado bajo $3,31 millones.',
     '[Clic] El suministro se licita entre proveedores, con un contrato a precio fijo por doce meses; cada embarque se cubre con un forward de dólares, y el precio queda como palanca adicional. [Clic] Y somos transparentes con otro riesgo: el valor depende de operar hasta el quinto año; sin sus recuperaciones, el VAN puro sería −$14,4 millones.'],
    'Si el kit cotiza sobre $3,31 M, no se invierte')

# =========================================================================== 40 y 41 · Conclusión y cierre
lam('negro', cab('06 · La decisión', 'Conclusión integrada', 'Invertir por etapas:', 'probar, normar y recién vender') + '''
<div class="zona"><div class="conc">
 <div class="col" data-f="1"><h3>Entorno · Lukas</h3><p><b>Necesidad real</b> y sin oferta que la cubra. Entorno <b>favorable moderado, +1,85</b>: el obstáculo es el plazo de la norma. Diferenciación enfocada.</p></div>
 <div class="col" data-f="2"><h3>Mercado y plan · Torres</h3><p>El cliente existe: <b>uso laboral, 69,4%</b>. <b>2.850 instalaciones</b> en un taller, con Lumine Habilita.</p></div>
 <div class="col" data-f="3"><h3>Números y riesgo · Diego</h3><p><b>VAN $140,2 M</b> con financiamiento mixto. El mayor riesgo es el kit: <b>regla de $3,31 M</b>, precio fijo y forward.</p></div></div>
 <p class="leyenda" data-f="3" style="position:absolute;left:0;right:0;bottom:0;max-width:none;font-size:30px"><span class="rot" style="margin-right:14px">Etapas</span>2027 proyecto experimental, 3 autos · enero 2028 norma (supuesto) · julio 2028 apertura</p>
</div>''' + fuente('Fuente: informe final, conclusiones; cifras del escenario central.'),
    'Lukas · Torres · Diego', 90,
    ['<b>[Clic] Lukas:</b> En conclusión. La necesidad es real y ninguna oferta actual la cubre. El entorno es favorable moderado, +1,85, y el obstáculo legal es el plazo de la norma, no la legalidad del servicio. Competimos por diferenciación enfocada, con la biblioteca de calibraciones y el método Lumine como ventajas sostenibles.',
     '<b>[Clic] Torres:</b> El cliente existe y se mide por su kilometraje: el uso laboral mostró 69,4% de intención. La operación cabe en un taller, con 2.850 instalaciones en cinco años, y Lumine Habilita resuelve la falta de técnicos.',
     '<b>[Clic] Diego:</b> Los números cierran, con poco margen: un VAN de $140,2 millones, con financiamiento mixto. El mayor riesgo es el kit, que pesa 76,8% del ingreso; lo mitigamos con un contrato a precio fijo, cobertura cambiaria y la regla de $3,31 millones. Por eso recomendamos avanzar por etapas: el proyecto experimental en 2027 con tres autos, la norma que suponemos para enero de 2028 y la apertura en julio, solo con la norma publicada, el ahorro medido y el kit bajo el umbral.'],
    'Invertir por etapas: probar, normar y recién vender', turnos={'Lukas': 25, 'Torres': 25, 'Diego': 40})

lam('negro', '''<div class="lineas"><div>Lumine Motors</div><div data-f="1">Tu mismo auto,</div><em data-f="2">ahora híbrido.</em></div>
<p class="quien">Diego Alarcón · Benjamín Torres · Lukas Verdugo · Taller Integrador II · UNAB</p>''',
    'Diego · Torres · Lukas', 10,
    ['<b>Diego:</b> Lumine Motors.', '<b>[Clic] Torres:</b> Tu mismo auto,', '<b>[Clic] Lukas:</b> ahora híbrido. Muchas gracias.'],
    'Cierre: Lumine Motors, tu mismo auto, ahora híbrido', turnos={'Diego': 3, 'Torres': 3, 'Lukas': 4}, clase='cierre')

# =========================================================================== Anexos
A = []
def anexo(code, titulo, pregunta, claves, cuerpo, fuente_):
    A.append(dict(code=code, titulo=titulo, pregunta=pregunta, claves=claves, cuerpo=cuerpo, fuente=fuente_))

kit = [('Dos motores en las ruedas traseras', '1.013.119', '1.149.431'), ('Dos controladores Fardriver', '606.446', '606.446'), ('31 celdas de litio-titanato', '327.308', '327.308'),
       ('Gestión de la batería, 200 A', '146.965', '146.965'), ('Contactor principal', '138.496', '138.496'), ('Pinzas y discos traseros', '134.269', '134.269'),
       ('Fusible y portafusible', '128.337', '128.337'), ('Unidad de control Macchina M2', '103.312', '103.312'), ('Flete, seguro y derechos', '100.455', '100.755'),
       ('Dos bridas de aluminio <span class="marca">est.</span>', '83.898', '83.898'), ('Barras y consumibles', '82.413', '82.413'), ('Caja de la batería <span class="marca">est.</span>', '80.728', '80.728'),
       ('Cortacorriente de emergencia', '69.270', '69.270'), ('Sensor de presión de freno', '64.217', '64.217'), ('Cable de potencia', '37.395', '37.395')]
def tabla_kit(r):
    return '<table class="tabla" style="font-size:24px"><tr><th>Pieza</th><th class="r">Esencial</th><th class="r">Plus</th></tr>' + ''.join(
        f'<tr><td style="font-size:24px;padding:8px 10px">{a}</td><td class="r" style="font-size:24px;padding:8px 10px">${b}</td><td class="r" style="font-size:24px;padding:8px 10px">${c}</td></tr>' for a, b, c in r) + '</table>'
anexo('A1', 'Costo del kit pieza por pieza', '¿Cuánto cuesta el kit y cómo se costeó?', ['kit', 'costo', 'proveedor', 'piezas', 'precio'],
      f'<div class="g2" style="gap:48px">{tabla_kit(kit[:8])}{tabla_kit(kit[8:])}</div>',
      'Fuente: informe final, Anexo 12 (pesos netos de IVA, dólar de $984,49). Total: Esencial $3,15 M, Plus $3,29 M, mezcla $3,23 M. «est.»: estimación de costo de fabricación.')
anexo('A2', 'Criterios del proyecto experimental', '¿Qué pasa si la norma no llega o el ahorro no se cumple?', ['norma', 'proyecto experimental', 'D.S. 67', 'ahorro', 'criterios'],
      '<table class="tabla"><tr><th>Qué se mide</th><th>Avanzar</th><th>Ajustar</th><th>Detener o postergar</th></tr>'
      '<tr><td>Ahorro urbano</td><td>Plus se recupera en 36 meses o menos (cerca de 17%)</td><td>Entre 12% y 17%</td><td>Bajo 12%: rediseñar</td></tr>'
      '<tr><td>Frenado</td><td>Igual o mayor que el original</td><td>Fallas corregibles</td><td>Pérdida no corregible</td></tr>'
      '<tr><td>Batería</td><td>Dentro de lo declarado</td><td>Degradación mayor</td><td>Riesgo térmico</td></tr>'
      '<tr><td>Costo del kit</td><td>Cotización con margen</td><td>Margen estrecho</td><td>Sin margen: postergar</td></tr></table>'
      '<p class="leyenda" style="margin-top:24px;max-width:none">Ruta: preparación (meses 1 a 3 de 2027) · resolución en 30 días hábiles · circulación con kit (meses 5 a 10) · memoria en 45 días hábiles · decisión en el mes 12.</p>',
      'Fuente: informe final, tablas de la ruta y de los criterios de decisión del proyecto experimental; D.S. N° 67 de 2020.')
anexo('A3', 'Ahorro simulado y referencias', '¿El ahorro está medido o es simulado?', ['ahorro', 'simulado', 'medido', 'ICCT', 'SEG'],
      '<div class="tarjetas" style="grid-template-columns:1.2fr 1fr 1fr;gap:40px">'
      '<div class="tarjeta ac"><h3>Simulación del equipo</h3><p>Colectivo: 14,5% con Esencial y 18,0% con Plus. Aplicación: 12,2% y 14,9%. Estimación de ingeniería, sin medición en autos chilenos.</p></div>'
      '<div class="tarjeta"><h3>ICCT (2022)</h3><p>Híbridos ligeros de 48 V: de cerca de 7% a casi 16% menos CO2, en homologación y con motores de 15 a 16 kW.</p></div>'
      '<div class="tarjeta"><h3>SEG Automotive</h3><p>Declara hasta 25% para sus máquinas de 48 V en el eje trasero; cifra del fabricante, sin medición independiente.</p></div></div>'
      '<p class="nota" style="margin-top:30px">Las tres cifras no se mezclan: el proyecto experimental mide el ahorro real.</p>',
      'Fuentes: Dornoff et al. (2022), ICCT. SEG Automotive (s.f.). Simulación del equipo (informe final, Anexo 7).')
anexo('A4', 'Precio, cuota y recuperación', '¿En cuánto tiempo se paga el kit?', ['recuperación', 'payback', 'cuota', 'crédito', 'kilometraje', 'precio'],
      '<div class="g2" style="gap:56px"><table class="tabla"><tr><th>Concepto</th><th class="r">Esencial</th><th class="r">Plus</th></tr>'
      '<tr><td>Precio con IVA</td><td class="r">$4.590.000</td><td class="r">$5.290.000</td></tr><tr><td>Pie de 30%</td><td class="r">$1.377.000</td><td class="r">$1.587.000</td></tr>'
      '<tr><td>Cuota a 48 meses</td><td class="r">$101.600</td><td class="r">$117.100</td></tr><tr><td>Ahorro del colectivo</td><td class="r">$123.480</td><td class="r">$153.286</td></tr>'
      '<tr><td>Meses para recuperar</td><td class="r">37,2</td><td class="r">34,5</td></tr></table>'
      + kpis([('3 años', 'Plus se recupera en tres años desde unos 204 km diarios'), ('4 años', 'desde unos 153 km diarios'), ('Más de 5', 'con 120 km diarios o menos')]) + '</div>',
      'Fuente: elaboración propia; crédito de consumo a 24,6% anual (octubre de 2026); ahorro simulado; bencina a $1.538,9 y 10 km por litro (supuesto del equipo).')
anexo('A5', 'Embudo y conversión', '¿De dónde sale la conversión y cuánto cuesta captar?', ['conversión', 'embudo', 'cotización', 'pauta', 'demanda'],
      kpis([('$10.000', 'por cotización: US$0,70 por clic ÷ 7,52% de conversión × $984,49 = $9.164, redondeado al alza'),
            ('15% → 30%', 'conversión de cotización a pedido, del primer mes al mes 12'), ('$700.000 → $1.500.000', 'pauta mensual, desde el décimo mes'),
            ('15 autos', 'al mes por dúo; un dúo nuevo cuando los pedidos superan el 80% de la capacidad')]),
      'Fuente: elaboración propia con base en el costo por clic publicado para Chile y el libro de cálculo del pronóstico.')
anexo('A6', 'Escenarios completos', '¿Qué variable es la más sensible?', ['escenarios', 'sensibilidad', 'VAN', 'TIR', 'pesimista', 'optimista'],
      '<table class="tabla"><tr><th>Concepto</th><th class="r">Pesimista</th><th class="r">Central</th><th class="r">Optimista</th></tr>'
      '<tr><td>Costo por cotización</td><td class="r">$15.000</td><td class="r">$10.000</td><td class="r">$7.500</td></tr>'
      '<tr><td>Conversión del primer mes / de régimen</td><td class="r">10% / 20%</td><td class="r">15% / 30%</td><td class="r">20% / 30%</td></tr>'
      '<tr><td>Instalaciones en cinco años</td><td class="r">1.345</td><td class="r">2.850</td><td class="r">3.745</td></tr>'
      '<tr><td>VAN a Ke (millones)</td><td class="r">−522,7</td><td class="r">144,6</td><td class="r">470,5</td></tr>'
      '<tr><td>TIR</td><td class="r">−19,84%</td><td class="r">18,41%</td><td class="r">32,70%</td></tr>'
      '<tr><td>Recuperación descontada</td><td class="r">No recupera</td><td class="r">4,45 años</td><td class="r">3,55 años</td></tr></table>'
      '<p class="leyenda" style="margin-top:20px;max-width:none">El crédito se mantiene en $122,6 M en los tres escenarios; la diferencia de caja la absorben los socios.</p>',
      'Fuente: elaboración propia con el libro de cálculo, hoja de escenarios.')
anexo('A7', 'Tasas de descuento', '¿Por qué ese beta y esa tasa?', ['beta', 'tasa', 'Ku', 'Ke', 'CAPM', 'Damodaran', 'WACC'],
      '<table class="tabla"><tr><th>Parámetro</th><th class="r">Valor</th><th>Origen</th></tr>'
      '<tr><td>Tasa libre de riesgo real</td><td class="r">2,63%</td><td>Bonos de la Tesorería en UF a 10 años, 28-10-2026</td></tr>'
      '<tr><td>Premio de mercado + riesgo país</td><td class="r">4,23% + 1,10%</td><td>Damodaran</td></tr>'
      '<tr><td>Deuda / patrimonio</td><td class="r">42,37%</td><td>76,8% × 41,46% + 23,2% × 45,36%</td></tr>'
      '<tr><td>Beta apalancado</td><td class="r">1,05</td><td>Con el beta de la deuda (0,98)</td></tr>'
      '<tr><td>Ku · Ke · Kd</td><td class="r">8,13% · 8,22% · 7,86%</td><td>Kd: tasa comercial 8,1% + 3 puntos, real</td></tr>'
      '<tr><td>WACC (referencia)</td><td class="r">7,58%</td><td>70,24% × Ke + 29,76% × Kd × (1 − t)</td></tr></table>',
      'Fuente: elaboración propia con base en Damodaran (2026a) y Banco Central de Chile (2026); recargo de 3 puntos: supuesto del equipo.')
anexo('A8', 'El crédito', '¿Cuánto cuesta el crédito y qué aporta?', ['crédito', 'deuda', 'cuota', 'intereses', 'banco', 'Fogape'],
      kpis([('$122,6 M', 'a cinco años, cuota francesa de $30,6 M, sin año de gracia'), ('$30,4 M', 'de intereses en cinco años'),
            ('$5,2 M', 'VAN de la deuda: el ahorro tributario llega tarde por las pérdidas de arrastre'), ('$145,4 M', 'VAN ajustado (VAN puro + VAN de la deuda)')]),
      'Fuente: elaboración propia con el libro de cálculo; plazo del crédito: supuesto del equipo; garantías estatales (Fogape) para empresas sin historia.')
anexo('A9', 'La operación, años 1 a 5', '¿Cómo crece la capacidad?', ['capacidad', 'dúos', 'modelos', 'biblioteca', 'operación', 'Gantt'],
      '<table class="tabla"><tr><th></th><th class="r">Año 1</th><th class="r">Año 2</th><th class="r">Año 3</th><th class="r">Año 4</th><th class="r">Año 5</th></tr>'
      '<tr><td>Instalaciones</td><td class="r">270</td><td class="r">505</td><td class="r">640</td><td class="r">650</td><td class="r">785</td></tr>'
      '<tr><td>Capacidad de los dúos</td><td class="r">384</td><td class="r">720</td><td class="r">891</td><td class="r">900</td><td class="r">1.071</td></tr>'
      '<tr><td>Dúos al cierre</td><td class="r">4</td><td class="r">4</td><td class="r">5</td><td class="r">5</td><td class="r">6</td></tr>'
      '<tr><td>Personas al cierre</td><td class="r">13</td><td class="r">15</td><td class="r">19</td><td class="r">24</td><td class="r">25</td></tr></table>'
      '<p class="leyenda" style="margin-top:22px;max-width:none">Biblioteca: 11 modelos el primer año, 19 al cierre del segundo y 31 al quinto.</p>',
      'Fuente: elaboración propia con el libro de cálculo, escenario central.')
anexo('A10', 'La Red Lumine', '¿Cómo gana dinero la red y cuándo parte?', ['red', 'talleres', 'licencia', 'regiones'],
      kpis([('$6.000.000', 'paquete de entrada por taller, con la formación de dos técnicos <span class="marca">supuesto</span>'),
            ('$250.000 + $45.000', 'cuota mensual del taller y por cada técnico inscrito <span class="marca">supuesto</span>'),
            ('3, 8 y 16', 'talleres en los años 3, 4 y 5'), ('$24,1 → $97,0 M', 'ingresos de la red del año 3 al año 5')]),
      'Fuente: elaboración propia; precios: supuestos del equipo con referencia en redes de talleres de marca. Lumine no vende kits a la red.')
habtab = ''.join(f'<tr><td class="num" style="color:var(--ac)">{a}</td><td>{b}</td><td>{c}</td><td class="r">{d}</td><td class="r">{e}</td></tr>' for a, b, c, d, e in
                 [('1', 'Aprendiz asistido', 'Encargado de seguridad del dúo', '7', '64'), ('2', 'Habilitado con supervisión', 'Instala con un nivel 3 o 4 al lado', '23', '136'),
                  ('3', 'Autónomo', 'Instala en dúo y firma su trabajo', '8', '40'), ('4', 'Formador', 'Enseña y valida a otros', '1', '24')])
anexo('A11', 'Lumine Habilita: niveles', '¿Cómo se forma y valida un técnico?', ['Habilita', 'técnicos', 'competencias', 'niveles', 'formación', 'INACAP'],
      f'<table class="tabla"><tr><th></th><th>Nivel</th><th>Qué habilita</th><th class="r">Competencias</th><th class="r">Horas</th></tr>{habtab}</table>'
      '<p class="leyenda" style="margin-top:22px;max-width:none">39 competencias en 13 módulos. Seguridad con evaluador externo y 100% de aprobación; nivel 3 tras 90 días de trabajo observado.</p>',
      'Fuente: informe final, plan de recursos humanos.')
anexo('A12', 'Encuesta: precio y forma de pago', '¿Cuánto pagarían y cómo?', ['encuesta', 'precio', 'disposición a pagar', 'pago', 'crédito', 'cuotas'],
      kpis([('53 de 194', 'aceptaron $5.990.000'), ('47 de 194', 'aceptaron $4.990.000 tras rechazar el primero'), ('94 de 194', 'rechazaron ambos'),
            ('50 · 39 · 22', 'de 111 de uso laboral: crédito bancario, cuotas con tarjeta, contado')]),
      F_ENC + ' Escalera de precios descendente, que puede anclar al alza.')
anexo('A13', 'Nombre de cada estrategia', '¿Cómo se llama la estrategia de…?', ['estrategia', 'precio', 'procesos', 'personas', 'segmentación', 'posicionamiento'],
      '<table class="tabla"><tr><th>Decisión</th><th>Estrategia</th></tr>'
      '<tr><td>Genérica</td><td>Diferenciación enfocada (Porter)</td></tr><tr><td>Segmentación</td><td>Concentrada (Lambin)</td></tr>'
      '<tr><td>Posicionamiento</td><td>Por beneficio y ocasión de uso (Kotler y Armstrong)</td></tr><tr><td>Crecimiento</td><td>Desarrollo de producto → penetración → diversificación relacionada (Ansoff)</td></tr>'
      '<tr><td>Precio</td><td>Basado en el valor para el cliente (Nagle y Müller)</td></tr><tr><td>Promoción</td><td>Atracción e impulso (Kotler y Keller)</td></tr>'
      '<tr><td>Procesos</td><td>Estandarización (Shostack)</td></tr><tr><td>Personas</td><td>Formar técnicos dentro; contratar la gestión en el mercado</td></tr></table>',
      'Fuente: informe final, capítulos II y III.')
anexo('A14', 'Mensaje a taxis y colectivos', '¿Por qué no decir «ahora híbrido» a un colectivero?', ['mensaje', 'D.S. 212', 'taxis', 'colectivos', 'híbrido'],
      kpis([('70 kW', 'exige el D.S. N° 212 de 1992 para inscribir un taxi o colectivo como híbrido o eléctrico: el kit no lo alcanza'),
            ('Dos mensajes', 'particulares: «Tu mismo auto, ahora híbrido»; uso laboral: primero «gasta menos bencina en ciudad» y el ahorro en pesos al mes')]),
      'Fuente: informe final, investigación de mercado y estrategia de posicionamiento; D.S. N° 212 de 1992.')
mes = [(1, 3, 1, '8,4', '−20,8', '−244,6'), (2, 7, 1, '25,3', '−15,8', '−269,1'), (3, 10, 1, '37,9', '−14,9', '−298,0'), (4, 15, 1, '58,9', '−12,7', '−311,0'),
       (5, 15, 1, '58,9', '−13,3', '−346,0'), (6, 20, 2, '82,1', '−7,3', '−379,9'), (7, 30, 3, '126,3', '0,5', '−370,9'), (8, 25, 3, '105,3', '−3,3', '−390,1'),
       (9, 35, 3, '147,4', '4,8', '−387,7'), (10, 30, 4, '126,3', '−0,8', '−412,0'), (11, 40, 4, '168,4', '7,7', '−405,6'), (12, 40, 4, '168,4', '8,0', '−402,4')]
mt = ''.join(f'<tr><td style="padding:5px 12px;font-size:24px">{a}</td><td class="r" style="padding:5px 12px;font-size:24px">{b}</td><td class="r" style="padding:5px 12px;font-size:24px">{c}</td><td class="r" style="padding:5px 12px;font-size:24px">{d}</td><td class="r" style="padding:5px 12px;font-size:24px">{e}</td><td class="r" style="padding:5px 12px;font-size:24px">{f}</td></tr>' for a, b, c, d, e, f in mes)
anexo('A15', 'El primer año, mes a mes', '¿Qué pasa en los primeros meses?', ['primer año', 'mes a mes', 'caja', 'EBITDA', 'arranque'],
      f'<table class="tabla"><tr><th>Mes</th><th class="r">Instalaciones</th><th class="r">Dúos</th><th class="r">Ingresos</th><th class="r">EBITDA</th><th class="r">Caja acumulada</th></tr>{mt}</table>',
      'Fuente: elaboración propia con el libro de cálculo, primer año (julio de 2028 a junio de 2029), millones de pesos.')

# ---------------------------------------------------------------- índice de anexos (lámina 42)
idx = ''.join(f'<div style="border-top:1px solid var(--ln);padding:10px 0;height:110px"><b style="font:700 30px ArchivoC;color:var(--ac);margin-right:12px">{a["code"]}</b><span style="font:400 26px Archivo">{a["titulo"]}</span></div>' for a in A)
INDICE = (cab('Anexos', 'Para las preguntas de la comisión', 'Anexos', 'tecla P para buscar') +
          f'<div class="zona" style="top:390px;bottom:90px"><div style="display:grid;grid-template-columns:repeat(3,1fr);grid-auto-flow:column;grid-template-rows:repeat(5,1fr);gap:0 48px;height:100%">{idx}</div></div>')

# ---------------------------------------------------------------- escribir laminas.html
partes = []
for i, s in enumerate(L, 1):
    r = ruta(i) if s['ruta'] else ''
    partes.append(f'<section class="lam {s["fondo"]} {s["clase"]}" data-n="{i}">\n{r}\n{s["cuerpo"]}\n</section>')
partes.append(f'<section class="lam blanco" data-n="{len(L) + 1}">{INDICE}</section>')
for k, a in enumerate(A):
    partes.append(f'<section class="lam blanco" data-n="{len(L) + 2 + k}">' + cab(f'Anexo {a["code"]}', a['pregunta'], a['titulo'], '') +
                  f'<div class="zona" style="top:{330 if len(a["titulo"]) <= 30 else 384}px">{a["cuerpo"]}</div>' + fuente(a['fuente']) + '<p class="cred" style="top:146px;bottom:auto">← Esc vuelve a la lámina</p></section>')
pagina = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lumine Motors · Defensa final · láminas</title>
<link rel="stylesheet" href="recursos/defensa.css"></head>
<body><svg width="0" height="0" style="position:absolute" aria-hidden="true">{RAYADO_DEF}</svg><div id="escenario">
{chr(10).join(partes)}
</div>
<script src="privado/expertos.js"></script>
<script src="recursos/marca.js"></script>
<script>
/* Logo, autos dibujados y fichas de expertos (los datos personales están en privado/, fuera del repositorio). */
document.querySelectorAll('[data-logo]').forEach(e => e.innerHTML = LUMINE.logo(+e.dataset.logo || 40));
const A_ = LUMINE.auto();
document.querySelectorAll('[data-auto]').forEach(g => {{
  const m = g.dataset.auto;
  if (m === 'mini') {{ g.innerHTML = A_.carroceria + A_.ruedas + '<rect class="letrero" x="700" y="104" width="76" height="22" rx="3"/>'; return; }}
  g.innerHTML = A_.carroceria + A_.ventanas + A_.lineas + A_.ruedas + A_.motor + A_.cables + A_.control + A_.baterias + A_.electrico +
    (m === 'colectivo' ? '<rect class="letrero" x="690" y="100" width="90" height="26" rx="3"/>' : '');
  g.querySelectorAll('path,circle,rect,line').forEach(e => e.setAttribute('pathLength', '1'));
}});
if (window.EXPERTOS) document.querySelectorAll('[data-experto]').forEach(f => {{
  const x = EXPERTOS[f.dataset.experto]; if (!x) return;
  f.querySelector('.sil').outerHTML = `<img class="foto" src="${{x.foto}}" alt="">`;
  f.querySelector('.nom').textContent = x.nombre; f.querySelector('.cargo').textContent = x.cargo;
  f.querySelector('.foto').insertAdjacentHTML('afterend', `<img class="logo-inst" src="${{x.logo}}" alt="${{x.institucion}}">`);
}});
</script>
<script src="recursos/laminas.js"></script>
</body></html>'''
open(os.path.join(DEF, 'laminas.html'), 'w').write(pagina)

# ---------------------------------------------------------------- deck-data.js
def pasos(html_):
    fs = sorted({int(x) for x in re.findall(r'data-f="(\d+)"', html_)} - {0})
    assert fs == list(range(1, len(fs) + 1)), f'pasos con huecos: {fs}'
    return len(fs)
slides = []
for i, s in enumerate(L, 1):
    notas = ''.join(f'<p>{p}</p>' for p in s['notas'])
    e = dict(title=s['titulo'], frame=f'laminas.html?embed#lamina-{i}', preview=f'laminas.html?embed&todo#lamina-{i}', who=s['who'], sec=s['sec'],
             notes=notas, steps=pasos(s['cuerpo']))
    if s['turnos']: e['turnos'] = s['turnos']
    slides.append(e)
n_idx = len(L) + 1
cols = 3; filas_ = 5
links = []
for k, a in enumerate(A):
    c, r = k // filas_, k % filas_
    links.append({'to': len(L) + 2 + k, 'box': {'x': round((96 + c * (1728 + 48) / 3) / 19.2, 2), 'y': round((390 + r * 120) / 10.8, 2), 'w': round(((1728 - 96) / 3) / 19.2, 2), 'h': round(110 / 10.8, 2)}})
slides.append(dict(title='Índice de anexos', frame=f'laminas.html?embed#lamina-{n_idx}', preview=f'laminas.html?embed&todo#lamina-{n_idx}', notes='<p>Índice de anexos: clic en uno para abrirlo, o tecla P para buscar.</p>', links=links))
annex = []
for k, a in enumerate(A):
    n = len(L) + 2 + k
    slides.append(dict(title=f'{a["code"]} {a["titulo"]}', frame=f'laminas.html?embed#lamina-{n}', preview=f'laminas.html?embed&todo#lamina-{n}',
                       notes=f'<p>Anexo {a["code"]}: {a["pregunta"]}</p>'))
    annex.append(dict(code=a['code'], title=f'{a["code"]} {a["titulo"]}', question=a['pregunta'], keywords=a['claves'], slide=n))
deck = dict(title='Lumine Motors · Defensa final', mainSlides=len(L), transition=250, oradores=['Diego', 'Torres', 'Lukas'], slides=slides, annex=annex)
js = 'window.DECK = ' + json.dumps(deck, ensure_ascii=False, indent=1) + ''';
/* Nombres de los expertos en el guion: solo si existe la carpeta privada (fuera del repositorio). */
if (window.EXPERTOS) window.DECK.slides.forEach(s => { if (s.notes) s.notes = s.notes.replace(/\\{\\{(\\w+)\\.(\\w+)\\}\\}/g, (m, k, c) => (window.EXPERTOS[k] || {})[c] || m); });
else window.DECK.slides.forEach(s => { if (s.notes) s.notes = s.notes.replace(/\\{\\{(\\w+)\\.nombre\\}\\}/g, 'el especialista').replace(/,? ?\\{\\{\\w+\\.cargo\\}\\},?/g, ''); });
'''
open(os.path.join(DEF, 'deck-data.js'), 'w').write(js)

# ---------------------------------------------------------------- privado/expertos.js (si existe la carpeta)
pj = os.path.join(DEF, 'privado', 'expertos', 'expertos.json')
if os.path.exists(pj):
    ex = {e['eje']: dict(nombre=e['nombre'], cargo=e['cargo'], institucion=e['institucion'], foto=f'privado/expertos/{e["eje"]}-foto.png', logo=f'privado/expertos/{e["eje"]}-logo.png') for e in json.load(open(pj))}
    open(os.path.join(DEF, 'privado', 'expertos.js'), 'w').write('window.EXPERTOS = ' + json.dumps(ex, ensure_ascii=False, indent=1) + ';\n')

# ---------------------------------------------------------------- control: titulares y palabras
def palabras(h):
    t = re.sub(r'<svg.*?</svg>', ' ', h, flags=re.S); t = re.sub(r'<p class="(fuente|ceja|cred|provisional)".*?</p>', ' ', t, flags=re.S)
    t = re.sub(r'<h2 class="tit">.*?</h2>', ' ', t, flags=re.S); t = re.sub(r'<[^>]+>', ' ', t)
    return len([w for w in H.unescape(t).split() if re.search(r'\w', w)])
tot = 0
for i, s in enumerate(L, 1):
    tw = len(s['titulo'].replace('Portada: ', '').replace('Cierre: ', '').split()); pw = palabras(s['cuerpo']); tot += s['sec']
    aviso = ('  TITULAR LARGO' if tw > 12 else '') + ('  CUERPO > 30' if pw > 30 else '')
    print(f'{i:2d} {s["who"]:<22} {s["sec"]:>3}s  {tw:2d} pal. tít.  {pw:3d} pal. cuerpo  {s["titulo"]}{aviso}')
print(f'Total: {tot} s = {tot // 60} min {tot % 60} s; {len(L)} láminas + índice + {len(A)} anexos')
