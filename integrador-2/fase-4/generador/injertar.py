"""Injerta las hojas azules nuevas en el paquete de la v3 sin tocar las hojas grises (semestre anterior).

Uso: python injertar.py V3.xlsx AZULES.xlsx SALIDA.xlsx [VALORES.json]

- Las 12 hojas grises (pestaña gris oscuro) se copian byte a byte con sus tablas, gráfico, cuadro de texto y comentarios.
- Las 15 hojas azules de la v3 se reemplazan por las de AZULES.xlsx (generadas con construir.py); si AZULES trae más hojas
  (la v5 trae 19), las que sobran van en partes nuevas, antes de las grises. Las hojas ocultas de AZULES quedan ocultas.
  Sus estilos se agregan al final de styles.xml de la v3, así los índices de las hojas grises no cambian.
- VALORES.json (opcional, de lo_calcular.py valores) deja en caché el resultado de cada fórmula de las hojas azules,
  para que el libro muestre números aunque se abra en vista protegida. Excel igual recalcula al abrir.
"""
import json
import re
import sys
import zipfile
from xml.sax.saxutils import escape

GRIS_TAB = "FF4A4A4A"
NS_REL_DRAW = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"
CT_DRAWING = "application/vnd.openxmlformats-officedocument.drawing+xml"
CT_CHART = "application/vnd.openxmlformats-officedocument.drawingml.chart+xml"
CT_SHEET = "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"
REL_SHEET = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"


def leer_zip(ruta):
    with zipfile.ZipFile(ruta) as z:
        return {n: z.read(n) for n in z.namelist()}, [i for i in z.infolist()]


def hojas_libro(files):
    wb = files["xl/workbook.xml"].decode("utf-8")
    rels = files["xl/_rels/workbook.xml.rels"].decode("utf-8")
    rmap = {}
    for m in re.finditer(r"<Relationship ([^>]*?)/?>", rels):
        a = m.group(1)
        rid = re.search(r'Id="([^"]+)"', a).group(1)
        tgt = re.search(r'Target="([^"]+)"', a).group(1)
        rmap[rid] = tgt.lstrip("/").replace("xl/", "", 1) if tgt.startswith("/xl/") else tgt
    out = []
    for m in re.finditer(r"<sheet ([^>]*?)/>", wb):
        a = m.group(1)
        nombre = re.search(r'name="([^"]+)"', a).group(1)
        rid = re.search(r'r:id="([^"]+)"', a).group(1)
        out.append(dict(xml=m.group(0), nombre=nombre, rid=rid, target="xl/" + rmap[rid], attrs=a))
    return out


def rels_de(files, parte):
    d, b = parte.rsplit("/", 1)
    ruta = f"{d}/_rels/{b}.rels"
    return ruta, files.get(ruta, b"").decode("utf-8")


def resolver(base_parte, target):
    if target.startswith("/"):
        return target.lstrip("/")
    partes = base_parte.rsplit("/", 1)[0].split("/")
    for seg in target.split("/"):
        if seg == "..":
            partes.pop()
        elif seg != ".":
            partes.append(seg)
    return "/".join(partes)


def bloque(xml, tag):
    """Devuelve (inicio, fin, atributos, interior) del contenedor <tag ...>...</tag>."""
    m = re.search(rf"<{tag}\b([^>]*)>(.*?)</{tag}>", xml, re.S)
    if not m:
        m2 = re.search(rf"<{tag}\b([^>]*)/>", xml)
        if not m2:
            return None
        return m2.start(), m2.end(), m2.group(1), ""
    return m.start(), m.end(), m.group(1), m.group(2)


def items(interior, tag):
    return re.findall(rf"<{tag}\b[^>]*/>|<{tag}\b[^>]*>.*?</{tag}>", interior, re.S)


def fusionar_estilos(sty3, stya):
    """Agrega fuentes, rellenos, bordes, formatos, xf y dxf de AZULES al final de los de la v3. Devuelve (xml, mapa_xf, off_dxf)."""
    # formatos numéricos
    nf3 = bloque(sty3, "numFmts")
    ids3 = [int(x) for x in re.findall(r'numFmtId="(\d+)"', nf3[3])] if nf3 else []
    sig = max(ids3 + [163]) + 1
    nfa = bloque(stya, "numFmts")
    mapa_nf = {}
    nuevos_nf = []
    if nfa:
        for it in items(nfa[3], "numFmt"):
            i = int(re.search(r'numFmtId="(\d+)"', it).group(1))
            mapa_nf[i] = sig
            nuevos_nf.append(re.sub(r'numFmtId="\d+"', f'numFmtId="{sig}"', it))
            sig += 1

    def anexar(xml, tag, nuevos):
        b = bloque(xml, tag + "s")
        ini, fin, attrs, interior = b
        n0 = len(items(interior, tag))
        attrs2 = re.sub(r'count="\d+"', f'count="{n0 + len(nuevos)}"', attrs) if "count=" in attrs else attrs + f' count="{n0 + len(nuevos)}"'
        nuevo = f"<{tag}s{attrs2}>{interior}{''.join(nuevos)}</{tag}s>"
        return xml[:ini] + nuevo + xml[fin:], n0

    if nf3:
        sty3, _ = anexar(sty3, "numFmt", nuevos_nf)
    elif nuevos_nf:
        sty3 = sty3.replace("<fonts", f'<numFmts count="{len(nuevos_nf)}">{"".join(nuevos_nf)}</numFmts><fonts', 1)
    off = {}
    for tag in ("font", "fill", "border"):
        nuevos = items(bloque(stya, tag + "s")[3], tag)
        sty3, off[tag] = anexar(sty3, tag, nuevos)
    # xf de celdas
    xfa = items(bloque(stya, "cellXfs")[3], "xf")

    def remap_xf(x):
        def r(attr, f):
            nonlocal x
            m = re.search(rf'{attr}="(\d+)"', x)
            if m:
                x = x[:m.start()] + f'{attr}="{f(int(m.group(1)))}"' + x[m.end():]
        r("numFmtId", lambda v: mapa_nf.get(v, v))
        r("fontId", lambda v: v + off["font"])
        r("fillId", lambda v: v + off["fill"])
        r("borderId", lambda v: v + off["border"])
        r("xfId", lambda v: 0)
        return x

    b = bloque(sty3, "cellXfs")
    n0 = len(items(b[3], "xf"))
    nuevos = [remap_xf(x) for x in xfa]
    attrs2 = re.sub(r'count="\d+"', f'count="{n0 + len(nuevos)}"', b[2])
    sty3 = sty3[:b[0]] + f"<cellXfs{attrs2}>{b[3]}{''.join(nuevos)}</cellXfs>" + sty3[b[1]:]
    mapa_xf = {i: n0 + i for i in range(len(xfa))}
    # dxf (formato condicional)
    dxa = bloque(stya, "dxfs")
    off_dxf = 0
    if dxa and items(dxa[3], "dxf"):
        bd = bloque(sty3, "dxfs")
        if bd:
            n0d = len(items(bd[3], "dxf"))
            nuevos_d = items(dxa[3], "dxf")
            attrs2 = re.sub(r'count="\d+"', f'count="{n0d + len(nuevos_d)}"', bd[2])
            sty3 = sty3[:bd[0]] + f"<dxfs{attrs2}>{bd[3]}{''.join(nuevos_d)}</dxfs>" + sty3[bd[1]:]
            off_dxf = n0d
        else:
            sty3 = sty3.replace("</cellStyles>", "</cellStyles>" + f"<dxfs count=\"{len(items(dxa[3], 'dxf'))}\">{dxa[3]}</dxfs>", 1)
    return sty3, mapa_xf, off_dxf


def etiquetas_propias(xml_graf):
    """openpyxl escribe el formato de las etiquetas sin sourceLinked="0"; LibreOffice entonces usa el de la celda."""
    x = xml_graf.decode("utf-8")
    x = re.sub(r'<numFmt formatCode="([^"]*)"\s*/>', r'<numFmt formatCode="\1" sourceLinked="0" />', x)
    return x.encode("utf-8")


def _num(v):
    r = repr(float(v))
    return r[:-2] if r.endswith(".0") else r


def transformar_hoja(xml, mapa_xf, off_dxf, valores=None):
    # estilos de celdas, filas y columnas
    def tag_c(m):
        t = m.group(0)
        return re.sub(r'\bs="(\d+)"', lambda k: f's="{mapa_xf[int(k.group(1))]}"', t)
    xml = re.sub(r"<c [^>]*?>|<c [^>]*?/>", tag_c, xml)
    xml = re.sub(r"<row [^>]*?>", lambda m: re.sub(r'\bs="(\d+)"', lambda k: f's="{mapa_xf[int(k.group(1))]}"', m.group(0)), xml)
    xml = re.sub(r"<col [^>]*?/>", lambda m: re.sub(r'\bstyle="(\d+)"', lambda k: f'style="{mapa_xf[int(k.group(1))]}"', m.group(0)), xml)
    xml = re.sub(r'dxfId="(\d+)"', lambda k: f'dxfId="{int(k.group(1)) + off_dxf}"', xml)
    if valores is None:
        return xml

    def celda(m):
        cab, cuerpo = m.group(1), m.group(2)
        if "<f>" not in cuerpo and "<f " not in cuerpo:
            return m.group(0)
        ref = re.search(r'\br="([A-Z]+\d+)"', cab).group(1)
        f = re.search(r"<f\b[^>]*>.*?</f>|<f\b[^>]*/>", cuerpo, re.S).group(0)
        cab = re.sub(r'\st="[^"]*"', "", cab)
        v = valores.get(ref)
        if v is None:
            return f"<c {cab}>{f}</c>"
        tipo, val = v
        if tipo == "n":
            return f"<c {cab}>{f}<v>{_num(val)}</v></c>"
        if tipo == "s":
            return f'<c {cab} t="str">{f}<v>{escape(val)}</v></c>'
        return f'<c {cab} t="e">{f}<v>#N/A</v></c>'
    return re.sub(r"<c ([^>]*?)(?<!/)>(.*?)</c>", celda, xml, flags=re.S)


def injertar(ruta_v3, ruta_az, salida, valores=None):
    f3, info3 = leer_zip(ruta_v3)
    fa, _ = leer_zip(ruta_az)
    hojas3 = hojas_libro(f3)
    hojasa = hojas_libro(fa)
    def pestaña(h):
        m = re.search(r"<tabColor\b[^>]*>", f3[h["target"]].decode("utf-8").split("<sheetData", 1)[0])
        return m.group(0) if m else ""
    grises = [h for h in hojas3 if f'rgb="{GRIS_TAB}"' in pestaña(h)]
    azules3 = [h for h in hojas3 if h not in grises]
    assert len(grises) == 12, [h["nombre"] for h in grises]
    assert len(azules3) == 15 and len(hojasa) >= len(azules3), (len(azules3), len(hojasa))
    salida_files = dict(f3)
    ct = f3["[Content_Types].xml"].decode("utf-8")
    # 1) borra las hojas azules de la v3 y lo que solo ellas usan (dibujos y gráficos del Dashboard viejo)
    borrar = set()
    for h in azules3:
        borrar.add(h["target"])
        rp, rx = rels_de(f3, h["target"])
        if rx:
            borrar.add(rp)
            for t in re.findall(r'Target="([^"]+)"', rx):
                parte = resolver(h["target"], t)
                if "drawings/" in parte:
                    borrar.add(parte)
                    drp, drx = rels_de(f3, parte)
                    if drx:
                        borrar.add(drp)
                        for t2 in re.findall(r'Target="([^"]+)"', drx):
                            ch = resolver(parte, t2)
                            borrar.add(ch)
                            crp, crx = rels_de(f3, ch)
                            if crx:
                                borrar.add(crp)
                                for t3 in re.findall(r'Target="([^"]+)"', crx):
                                    borrar.add(resolver(ch, t3))
    # las grises no pueden perder nada de lo suyo
    usados_grises = set()
    for h in grises:
        usados_grises.add(h["target"])
        rp, rx = rels_de(f3, h["target"])
        for t in re.findall(r'Target="([^"]+)"', rx):
            usados_grises.add(resolver(h["target"], t))
    assert not (borrar & usados_grises), borrar & usados_grises
    borrar.add("xl/calcChain.xml")
    for p in borrar:
        salida_files.pop(p, None)
        ct = re.sub(rf'<Override PartName="/{re.escape(p)}"[^>]*/>', "", ct)
    rels_wb = f3["xl/_rels/workbook.xml.rels"].decode("utf-8")
    rels_wb = re.sub(r'<Relationship [^>]*Target="calcChain.xml"[^>]*/>', "", rels_wb)
    # 2) estilos
    sty, mapa_xf, off_dxf = fusionar_estilos(f3["xl/styles.xml"].decode("utf-8"), fa["xl/styles.xml"].decode("utf-8"))
    salida_files["xl/styles.xml"] = sty.encode("utf-8")
    # 3) hojas azules nuevas: primero en las partes que ocupaban las azules de la v3; las que sobran, en partes nuevas
    n_dib, n_graf = 100, 100
    wb3 = f3["xl/workbook.xml"].decode("utf-8")
    destinos = [dict(target=h["target"], xml=h["xml"], nombre=h["nombre"]) for h in azules3]
    sig_rid = max(int(x) for x in re.findall(r'Id="rId(\d+)"', rels_wb)) + 1
    sig_sid = max(int(x) for x in re.findall(r'<sheet [^>]*sheetId="(\d+)"', wb3)) + 1
    sig_parte = max(int(m.group(1)) for n in f3 for m in [re.match(r"xl/worksheets/sheet(\d+)\.xml$", n)] if m) + 1
    for _ in hojasa[len(azules3):]:
        target = f"xl/worksheets/sheet{sig_parte}.xml"
        rid = f"rId{sig_rid}"
        rels_wb = rels_wb.replace("</Relationships>", f'<Relationship Id="{rid}" Type="{REL_SHEET}" Target="worksheets/sheet{sig_parte}.xml"/></Relationships>')
        ct = ct.replace("</Types>", f'<Override PartName="/{target}" ContentType="{CT_SHEET}"/></Types>')
        destinos.append(dict(target=target, xml=None, nombre=None, nuevo=f'<sheet name="X" sheetId="{sig_sid}" r:id="{rid}"/>'))
        sig_parte, sig_rid, sig_sid = sig_parte + 1, sig_rid + 1, sig_sid + 1
    salida_files["xl/_rels/workbook.xml.rels"] = rels_wb.encode("utf-8")
    ultima_azul = azules3[-1]["xml"]
    insertar = []
    for h3, ha in zip(destinos, hojasa):
        xml = fa[ha["target"]].decode("utf-8")
        vals = valores.get(ha["nombre"]) if valores else None
        xml = transformar_hoja(xml, mapa_xf, off_dxf, vals if valores else None)
        salida_files[h3["target"]] = xml.encode("utf-8")
        if f'PartName="/{h3["target"]}"' not in ct:   # el paso 1 borró el tipo de contenido de la parte de la v3
            ct = ct.replace("</Types>", f'<Override PartName="/{h3["target"]}" ContentType="{CT_SHEET}"/></Types>')
        rp_a, rx_a = rels_de(fa, ha["target"])
        rp_3, _ = rels_de(f3, h3["target"])
        if rx_a:
            nuevos_rels = rx_a
            for t in re.findall(r'Target="([^"]+)"', rx_a):
                parte = resolver(ha["target"], t)
                if "drawings/" not in parte:
                    continue
                n_dib += 1
                nueva = f"xl/drawings/drawing{n_dib}.xml"
                salida_files[nueva] = fa[parte]
                ct = ct.replace("</Types>", f'<Override PartName="/{nueva}" ContentType="{CT_DRAWING}"/></Types>')
                nuevos_rels = nuevos_rels.replace(f'Target="{t}"', f'Target="../drawings/drawing{n_dib}.xml"')
                drp, drx = rels_de(fa, parte)
                if drx:
                    for t2 in re.findall(r'Target="([^"]+)"', drx):
                        ch = resolver(parte, t2)
                        n_graf += 1
                        nuevo_ch = f"xl/charts/chart{n_graf}.xml"
                        salida_files[nuevo_ch] = etiquetas_propias(fa[ch])
                        ct = ct.replace("</Types>", f'<Override PartName="/{nuevo_ch}" ContentType="{CT_CHART}"/></Types>')
                        drx = drx.replace(f'Target="{t2}"', f'Target="../charts/chart{n_graf}.xml"')
                    salida_files[f"xl/drawings/_rels/drawing{n_dib}.xml.rels"] = drx.encode("utf-8")
            salida_files[rp_3] = nuevos_rels.encode("utf-8")
        else:
            salida_files.pop(rp_3, None)
        # nombre y visibilidad de la hoja (se conservan sheetId y r:id de la v3; las nuevas van después de la última azul)
        nom = escape(ha["nombre"], {chr(34): "&quot;"})
        oculta = re.search(r'state="(hidden|veryHidden)"', ha["attrs"])
        if h3["xml"]:
            nuevo = h3["xml"].replace(f'name="{h3["nombre"]}"', f'name="{nom}"')
        else:
            nuevo = h3["nuevo"].replace('name="X"', f'name="{nom}"')
        nuevo = re.sub(r'\sstate="[^"]*"', "", nuevo)
        if oculta:
            nuevo = nuevo.replace(" r:id=", f' state="{oculta.group(1)}" r:id=')
        if h3["xml"]:
            wb3 = wb3.replace(h3["xml"], nuevo)
            if h3["xml"] == ultima_azul:
                ultima_azul = nuevo
        else:
            insertar.append(nuevo)
    wb3 = wb3.replace(ultima_azul, ultima_azul + "".join(insertar))
    # 4) nombres definidos: los del libro nuevo + los locales de las hojas grises de la v3 (corridos si hay más hojas azules)
    wba = fa["xl/workbook.xml"].decode("utf-8")
    dn_a = re.findall(r"<definedName\b[^>]*>.*?</definedName>", wba, re.S)
    dn_3 = re.findall(r"<definedName\b[^>]*>.*?</definedName>", wb3, re.S)
    idx_gris = {hojas3.index(h) for h in grises}
    extra = len(hojasa) - len(azules3)
    locales_grises = [re.sub(r'localSheetId="(\d+)"', lambda k: f'localSheetId="{int(k.group(1)) + extra}"', d) for d in dn_3
                      if re.search(r'localSheetId="(\d+)"', d) and int(re.search(r'localSheetId="(\d+)"', d).group(1)) in idx_gris]
    nuevos_dn = "<definedNames>" + "".join(dn_a + locales_grises) + "</definedNames>"
    if "<definedNames>" in wb3:
        wb3 = re.sub(r"<definedNames>.*?</definedNames>", lambda m: nuevos_dn, wb3, flags=re.S)
    else:
        wb3 = wb3.replace("</sheets>", "</sheets>" + nuevos_dn)
    wb3 = re.sub(r"<calcPr[^>]*/>", '<calcPr calcId="191029" fullCalcOnLoad="1"/>', wb3)
    wb3 = re.sub(r'firstSheet="\d+"', 'firstSheet="0"', wb3)
    wb3 = re.sub(r'activeTab="\d+"', 'activeTab="0"', wb3)
    salida_files["xl/workbook.xml"] = wb3.encode("utf-8")
    salida_files["[Content_Types].xml"] = ct.encode("utf-8")
    # 5) docProps/app.xml con los nombres de hoja actuales
    nombres = re.findall(r'<sheet name="([^"]+)"', wb3)
    app = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
           'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Excel</Application>'
           '<DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant">'
           f'<vt:variant><vt:lpstr>Hojas de cálculo</vt:lpstr></vt:variant><vt:variant><vt:i4>{len(nombres)}</vt:i4></vt:variant></vt:vector></HeadingPairs>'
           f'<TitlesOfParts><vt:vector size="{len(nombres)}" baseType="lpstr">' + "".join(f"<vt:lpstr>{n}</vt:lpstr>" for n in nombres) +
           '</vt:vector></TitlesOfParts><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged>'
           '<AppVersion>16.0300</AppVersion></Properties>')
    salida_files["docProps/app.xml"] = app.encode("utf-8")
    # 6) escribe en el mismo orden que la v3 (primero [Content_Types].xml)
    orden = [i.filename for i in info3 if i.filename in salida_files]
    orden += sorted(n for n in salida_files if n not in orden)
    with zipfile.ZipFile(salida, "w", zipfile.ZIP_DEFLATED) as z:
        for n in orden:
            z.writestr(n, salida_files[n])
    # verificación: las partes de las hojas grises quedaron idénticas
    with zipfile.ZipFile(salida) as z:
        for p in usados_grises:
            if p in f3:
                assert z.read(p) == f3[p], p
    return dict(grises=[h["nombre"] for h in grises], partes_grises=sorted(usados_grises), borradas=sorted(borrar))


if __name__ == "__main__":
    v3, az, sal = sys.argv[1:4]
    vals = json.load(open(sys.argv[4], encoding="utf-8")) if len(sys.argv) > 4 else None
    r = injertar(v3, az, sal, vals)
    print("ok", sal, "· grises intactas:", len(r["grises"]), "· partes grises verificadas:", len(r["partes_grises"]))
