// Presentación final de Lumine Motors (7 minutos). Uso:
//   NODE_PATH=<carpeta con pptxgenjs, react-icons, react, react-dom y sharp> node generar_ppt.js
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const RAIZ = path.resolve(__dirname, "..");
const FIG3 = path.join(RAIZ, "..", "entrega3", "figuras");
const FIG5 = path.join(RAIZ, "figuras");
const CIF = JSON.parse(fs.readFileSync(path.join(RAIZ, "analisis", "cifras_finales.json"), "utf8"));
const SKILL_THEME = process.env.APPLY_THEME;

const THEME = {
  name: "Lumine",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0B1220", lt1: "FFFFFF", dk2: "1F2A44", lt2: "EEF3F8",
    accent1: "14A3E0", accent2: "2B4C9B", accent3: "F59E0B", accent4: "10B981", accent5: "6B7280", accent6: "C0392B",
    hlink: "14A3E0", folHlink: "2B4C9B",
  },
};
const HEX = THEME.colors;
const cm = (x, d = 1) => Number(x).toFixed(d).replace(".", ",");

async function icono(nombre, color, px = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[nombre], { color: "#" + color, size: px }));
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13,33 × 7,5 pulgadas
  pres.title = "Lumine Motors: estimador de ahorro con IA";
  pres.author = "Grupo 1, NRC 4153";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // ---------------------------------------------------------------- layouts
  pres.defineSlideMaster({
    title: "PORTADA_OSCURA", background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.35, w: 11.7, h: 1.4, fontSize: 48, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.75, w: 11.7, h: 0.8, fontSize: 22, color: C.accent1, valign: "top", align: "left", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "CONTENIDO", background: { color: C.background1 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.95, fontSize: 30, bold: true, color: C.text2, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: "Lumine Motors · Grupo 1 · NRC 4153", options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent5, margin: 0 } } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent5, align: "right" },
  });
  pres.defineSlideMaster({
    title: "CIERRE_OSCURO", background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.45, w: 12.1, h: 0.95, fontSize: 32, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent5, align: "right" },
  });

  const card = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill }, objectName: name,
    shadow: { type: "outer", color: "1F2A44", opacity: 0.12, blur: 6, offset: 2, angle: 90 } });
  const txt = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, valign: "top", ...o });
  const circuloIcono = async (s, x, y, d, nombre, fondo, color, objName) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fondo }, line: { color: fondo }, objectName: objName + " fondo" });
    s.addImage({ data: await icono(nombre, color), x: x + d * 0.24, y: y + d * 0.24, w: d * 0.52, h: d * 0.52, altText: objName, objectName: objName });
  };

  // ---------------------------------------------------------------- 1. Portada
  pres.addSection({ title: "Problema" });
  let s = pres.addSlide({ masterName: "PORTADA_OSCURA", sectionTitle: "Problema" });
  s.addImage({ path: path.join(FIG5, "logo_lumine_blanco.png"), x: 0.8, y: 0.6, w: 1.75, h: 1.33, altText: "Logo de Lumine Motors", objectName: "Logo" });
  s.addText("¿Cuánto me voy a ahorrar?", { placeholder: "title" });
  s.addText("Un estimador de ahorro con IA que convierte una promesa genérica en una estimación personal, verificable y gobernada", { placeholder: "body" });
  txt(s, [
    { text: "Diego Alarcón · Benjamín Torres · Lukas Verdugo", options: { bold: true, breakLine: true } },
    { text: "Grupo 1 · NRC 4153 · IA Aplicada al Marketing y los Negocios · Prof. Cristián Cisterna-Aravena · noviembre de 2026" },
  ], { x: 0.8, y: 6.15, w: 11.7, h: 0.75, fontSize: 14, color: C.background1, objectName: "Integrantes" });
  s.addNotes("DIEGO (25 s). Buenos días. Somos Lumine Motors: un taller que instalaría un kit híbrido en el eje trasero de autos con más de siete años, el parque que en Chile quedó fuera del gas y del eléctrico. Todo el proyecto responde la pregunta que nos hizo cada conductor entrevistado: ¿cuánto me voy a ahorrar?");

  // ---------------------------------------------------------------- 2. Problema
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Problema" });
  s.addText("La promesa “hasta 25%” no describe a casi nadie", { placeholder: "title" });
  const stats = [
    ["7,9 pp", "error medio de la cifra genérica de 25% frente al ahorro simulado de cada conductor"],
    ["98%", "de los conductores con un error mayor a 3 puntos con esa cifra"],
    ["3,4", "autos usados transferidos por cada nuevo en 2025: un parque que se conserva"],
  ];
  stats.forEach(([n, l], i) => {
    const y = 1.6 + i * 1.75;
    card(s, 0.6, y, 6.2, 1.5, HEX.lt2, "Dato " + (i + 1));
    txt(s, n, { x: 0.85, y: y + 0.22, w: 2.3, h: 1.05, fontSize: 44, bold: true, color: C.accent2, valign: "middle", objectName: "Cifra " + (i + 1) });
    txt(s, l, { x: 3.2, y: y + 0.22, w: 3.4, h: 1.05, fontSize: 15, color: C.text2, valign: "middle", objectName: "Etiqueta " + (i + 1) });
  });
  card(s, 7.2, 1.6, 5.5, 5.0, HEX.dk1, "Decisión");
  txt(s, "LA DECISIÓN DE LUMINE", { x: 7.55, y: 1.95, w: 4.8, h: 0.4, fontSize: 14, bold: true, color: C.accent1, charSpacing: 2, objectName: "Etiqueta decisión" });
  txt(s, "¿Reemplazar la cifra genérica por una estimación personal, con intervalo y verificable después de instalar?", { x: 7.55, y: 2.45, w: 4.8, h: 1.9, fontSize: 22, bold: true, color: C.background1, objectName: "Pregunta de decisión" });
  txt(s, [
    { text: "La barrera del cliente es la confianza, no el precio", options: { bullet: true, breakLine: true } },
    { text: "El ahorro depende de cuánto frena cada conductor", options: { bullet: true, breakLine: true } },
    { text: "Una cifra que no se cumple es publicidad engañosa (Ley 19.496)", options: { bullet: true } },
  ], { x: 7.55, y: 4.5, w: 4.8, h: 1.9, fontSize: 15, color: C.background2, paraSpaceAfter: 8, objectName: "Contexto" });
  s.addNotes("DIEGO (30 s). El sector promete “hasta 25%”, pero el ahorro depende de cuánto frena cada conductor. Comparada con el ahorro simulado de 300 conductores de Santiago, esa cifra se equivoca en casi 8 puntos, y en 98% de los casos por más de 3. Y la barrera del cliente no fue el precio, sino la confianza. Lumine debe decidir si la reemplaza por una estimación personal y verificable.");

  // ---------------------------------------------------------------- 3. Pregunta y objetivos
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Problema" });
  s.addText("¿Puede la IA estimar el ahorro antes de instalar?", { placeholder: "title" });
  card(s, 0.6, 1.6, 4.6, 5.0, HEX.lt2, "Pregunta");
  await circuloIcono(s, 0.9, 1.9, 0.75, "FaQuestion", HEX.accent2, "FFFFFF", "Ícono pregunta");
  txt(s, "Pregunta de investigación", { x: 0.9, y: 2.85, w: 4.0, h: 0.4, fontSize: 16, bold: true, color: C.accent2, objectName: "Título pregunta" });
  txt(s, "¿Puede un modelo de IA predictiva, alimentado con el patrón de conducción de cada vehículo, estimar el ahorro con precisión suficiente para una promesa verificable, y cómo cambia eso la disposición a contratar?", { x: 0.9, y: 3.3, w: 4.0, h: 3.1, fontSize: 15, color: C.text2, objectName: "Texto pregunta" });
  const oes = [
    ["OE1 Datos reales", "45 jornadas reales secundarias; terreno eliminado", "Sustituido", HEX.accent5],
    ["OE2 Modelo", `Error ${cm(CIF.e4.robustez_10_semillas["R11 Ridge 11 variables GPS"].MAE_mean, 2)} pp, R² ${cm(CIF.e4.robustez_10_semillas["R11 Ridge 11 variables GPS"].R2_mean, 2)} (meta ≤ 3 pp y ≥ 0,80)`, "Cumplido", HEX.accent4],
    ["OE3 Prototipo", "12/12 casos y 10/10 ataques resistidos", "Cumplido", HEX.accent4],
    ["OE4 Cliente", `A/B de ${CIF.ab_n_por_grupo} por grupo en el piloto`, "Rediseñado", HEX.accent3],
    ["OE5 Gobernanza", "Regla de suspensión con 5 gatillos", "Cumplido", HEX.accent4],
  ];
  oes.forEach(([t, d, e, col], i) => {
    const y = 1.6 + i * 1.0;
    card(s, 5.6, y, 7.1, 0.85, HEX.lt1, "Objetivo " + (i + 1));
    txt(s, t, { x: 5.85, y: y + 0.12, w: 2.2, h: 0.6, fontSize: 15, bold: true, color: C.text2, valign: "middle", objectName: "Nombre objetivo " + (i + 1) });
    txt(s, d, { x: 8.05, y: y + 0.12, w: 3.0, h: 0.6, fontSize: 13, color: C.text2, valign: "middle", objectName: "Resultado objetivo " + (i + 1) });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 11.2, y: y + 0.22, w: 1.3, h: 0.42, rectRadius: 0.2, fill: { color: col }, line: { color: col }, objectName: "Estado " + (i + 1) });
    txt(s, e, { x: 11.2, y: y + 0.22, w: 1.3, h: 0.42, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Texto estado " + (i + 1) });
  });
  s.addNotes("DIEGO (30 s). Nuestra pregunta tiene dos mitades: si la IA puede estimar el ahorro de cada cliente con precisión suficiente, y si eso cambia su disposición a contratar. Cumplimos tres de cinco objetivos. Los datos propios en terreno se eliminaron por tiempo y los sustituimos por jornadas reales de una base pública. La medición con clientes la rediseñamos: con 40 encuestas no habríamos detectado nada, así que proponemos un experimento A/B con 173 prospectos por grupo. Benjamín les muestra la herramienta.");

  // ---------------------------------------------------------------- 4. Herramienta
  pres.addSection({ title: "Herramienta" });
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Herramienta" });
  s.addText("La matemática calcula; el lenguaje solo explica", { placeholder: "title" });
  const piezas = [
    ["FaCogs", "Simulador físico", "Calcula segundo a segundo la energía que recupera el kit. Calibrado contra FASTSim (error 3,4%)", HEX.accent2],
    ["FaChartLine", "Modelo predictivo", "Ridge con 11 variables de una semana de conducción e intervalo conforme al 80%", HEX.accent2],
    ["FaCoins", "Motor comercial", "Pesos al mes, plazo conservador y 6 estados: ok, no conviene, no aplica…", HEX.accent2],
    ["FaCommentDots", "Claude + RAFA v3.1", "Redacta la explicación copiando cifras cerradas; nunca calcula", HEX.accent1],
  ];
  for (let i = 0; i < piezas.length; i++) {
    const [ic, t, d, col] = piezas[i];
    const x = 0.6 + i * 3.08;
    card(s, x, 1.6, 2.8, 3.55, HEX.lt2, "Pieza " + (i + 1));
    await circuloIcono(s, x + 0.25, 1.85, 0.8, ic, col, "FFFFFF", "Ícono pieza " + (i + 1));
    txt(s, t, { x: x + 0.25, y: 2.8, w: 2.35, h: 0.45, fontSize: 17, bold: true, color: C.text2, objectName: "Título pieza " + (i + 1) });
    txt(s, d, { x: x + 0.25, y: 3.3, w: 2.35, h: 1.75, fontSize: 14, color: C.text2, objectName: "Texto pieza " + (i + 1) });
    if (i < piezas.length - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.83, y: 3.2, w: 0.22, h: 0.35, fill: { color: HEX.accent5 }, line: { color: HEX.accent5 }, objectName: "Flecha " + (i + 1) });
  }
  card(s, 0.6, 5.45, 12.1, 1.2, HEX.dk1, "Control humano");
  await circuloIcono(s, 0.85, 5.6, 0.9, "FaUserCheck", HEX.accent1, "FFFFFF", "Ícono técnico");
  txt(s, [
    { text: "Validador de 9 criterios + técnico humano. ", options: { bold: true, color: C.accent1 } },
    { text: "Si una cifra del mensaje no existe en los datos, el cliente recibe una plantilla fija. El técnico aprueba, ajusta hasta ±2 pp con motivo o bloquea." },
  ], { x: 2.0, y: 5.6, w: 10.5, h: 0.9, fontSize: 16, color: C.background1, valign: "middle", objectName: "Texto control humano" });
  s.addNotes("BENJAMÍN (35 s). La solución tiene tres piezas. Un simulador físico calcula la energía que recupera el kit en cada segundo; un modelo predictivo aprende de esas simulaciones a estimar el ahorro de cada conductor con un intervalo; y Claude, con instrucciones RAFA, solo redacta. La regla: la IA generativa nunca calcula. Un validador y un técnico humano controlan cada cifra.");

  // ---------------------------------------------------------------- 5. Demostración
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Herramienta" });
  s.addText("El MVP funcionando: un colectivo de 213 km diarios", { placeholder: "title" });
  s.addMedia({ type: "video", path: path.join(FIG5, "demo_mvp.mp4"), cover: "data:image/png;base64," + fs.readFileSync(path.join(FIG5, "demo_mvp_poster.png")).toString("base64"), x: 0.6, y: 1.5, w: 6.2, h: 3.49, objectName: "Video del MVP" });
  s.addImage({ path: path.join(FIG5, "qr_mvp.png"), x: 0.6, y: 5.2, w: 1.45, h: 1.45, altText: "Código QR del MVP publicado", objectName: "QR MVP" });
  txt(s, [
    { text: "Pruébalo en vivo", options: { bold: true, color: C.accent2, breakLine: true } },
    { text: "claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx", options: { fontSize: 13, breakLine: true } },
    { text: "MVP publicado como artefacto de Claude: cotización, diagnóstico y técnico", options: { fontSize: 13, color: C.accent5 } },
  ], { x: 2.25, y: 5.25, w: 4.6, h: 1.4, fontSize: 15, color: C.text2, objectName: "Link MVP" });
  const pasos = [
    ["1", "Registro de una semana", "3,3 detenciones por km; la ruta se borra"],
    ["2", "Modelo Ridge", "19,7% de ahorro, rango de 18,4% a 21,0%"],
    ["3", "Motor comercial", "$159.000 al mes; recupera el kit en 22 meses (conservador)"],
    ["4", "Mensaje", "Claude lo explica; el validador confirma cada cifra"],
  ];
  pasos.forEach(([n, t, d], i) => {
    const y = 1.6 + i * 1.28;
    s.addShape(pres.shapes.OVAL, { x: 7.15, y: y + 0.1, w: 0.7, h: 0.7, fill: { color: i === 3 ? HEX.accent1 : HEX.accent2 }, line: { color: i === 3 ? HEX.accent1 : HEX.accent2 }, objectName: "Paso " + n });
    txt(s, n, { x: 7.15, y: y + 0.1, w: 0.7, h: 0.7, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Número paso " + n });
    txt(s, t, { x: 8.05, y: y, w: 4.65, h: 0.42, fontSize: 17, bold: true, color: C.text2, objectName: "Título paso " + n });
    txt(s, d, { x: 8.05, y: y + 0.43, w: 4.65, h: 0.65, fontSize: 15, color: C.text2, objectName: "Texto paso " + n });
  });
  s.addNotes("BENJAMÍN (45 s). Este es el MVP funcionando, publicado como artefacto de Claude: pueden abrirlo con el código QR. [Reproducir el video o abrir el link.] Un colectivo registra una semana con su celular; el sistema calcula once variables y borra la ruta. El modelo estima 19,7% de ahorro, con un rango de 18,4% a 21%. El motor comercial lo traduce a lo que entiende el cliente: 159 mil pesos al mes y recuperar el kit en 22 meses con el escenario conservador. Si el técnico ajusta la cifra, el cambio queda registrado con su motivo.");

  // ---------------------------------------------------------------- 6. Resultados del modelo
  pres.addSection({ title: "Resultados" });
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Resultados" });
  s.addText("El modelo erra 10 veces menos que la cifra genérica", { placeholder: "title" });
  const rob = CIF.e4.robustez_10_semillas;
  s.addChart(pres.charts.BAR, [{ name: "Error medio (pp)",
    labels: ["Cifra genérica 25%", "Laboratorio ICCT 15,5%", "Promedio por perfil", "GBM (Entrega 3)", "Ridge (final)"],
    values: [7.9, 2.3, +rob["M0c Promedio por perfil"].MAE_mean.toFixed(2), +rob["M3 Nivel 2 diagnóstico (GBM, GPS)"].MAE_mean.toFixed(2), +rob["R11 Ridge 11 variables GPS"].MAE_mean.toFixed(2)] }], {
    x: 0.6, y: 1.5, w: 7.2, h: 5.2, barDir: "bar", objectName: "Gráfico error",
    chartColors: [HEX.accent5, HEX.accent5, HEX.accent5, "8AA0C8", HEX.accent2], invertedColors: [HEX.accent5],
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: HEX.dk2, dataLabelFormatCode: "0.00", dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 13, catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true, catAxisOrientation: "maxMin",
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Error absoluto medio en conductores no vistos (puntos porcentuales; 10 particiones)", titleFontSize: 13, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
  });
  const r = [
    ["19,6% · 16,1% · 15,3%", "ahorro mediano en colectivos, aplicación y particulares"],
    ["1,3 pp y 78%", "error y cobertura en 45 jornadas reales, tras recalibrar con datos reales"],
    ["67%", "de la variación del ahorro la explica el tipo de uso: H1 se reformula"],
  ];
  r.forEach(([n, l], i) => {
    const y = 1.6 + i * 1.72;
    card(s, 8.2, y, 4.5, 1.5, i === 1 ? HEX.dk1 : HEX.lt2, "Resultado " + (i + 1));
    txt(s, n, { x: 8.45, y: y + 0.15, w: 4.0, h: 0.55, fontSize: 24, bold: true, color: i === 1 ? C.accent1 : C.accent2, objectName: "Cifra resultado " + (i + 1) });
    txt(s, l, { x: 8.45, y: y + 0.72, w: 4.0, h: 0.7, fontSize: 14, color: i === 1 ? C.background1 : C.text2, objectName: "Texto resultado " + (i + 1) });
  });
  s.addNotes("BENJAMÍN (40 s). En diez particiones de conductores que el modelo nunca vio, la cifra genérica erra por 7,9 puntos y nuestro modelo por 0,77. La regresión Ridge le ganó al gradient boosting en las diez, así que la adoptamos. El ahorro mediano es 19,6% en colectivos y 15 a 16% en el resto. En datos reales, al recalibrar, el error es 1,3 puntos y el intervalo cubre 78%. Lukas sigue.");

  // ---------------------------------------------------------------- 7. Capa generativa y auditoría
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Resultados" });
  s.addText("Cuatro versiones del prompt y diez ataques después", { placeholder: "title" });
  s.addChart(pres.charts.BAR, [{ name: "Casos aprobados", labels: ["v1", "v2", "v3", "v3.1"], values: [0, 4, 11, 12] }], {
    x: 0.6, y: 1.5, w: 6.0, h: 5.2, barDir: "col", objectName: "Gráfico prompts",
    chartColors: [HEX.accent5, HEX.accent5, "8AA0C8", HEX.accent1], invertedColors: [HEX.accent5], valAxisMaxVal: 12, valAxisMinVal: 0,
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelColor: HEX.dk2, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.dk2, catAxisLabelFontFace: "+mn-lt", valAxisHidden: true,
    valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
    showTitle: true, title: "Casos aprobados de 12 por versión de las instrucciones RAFA", titleFontSize: 13, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
  });
  const auditoria = [
    ["FaShieldAlt", "10 de 10 ataques resistidos", "Grok escribió notas que pedían prometer cifras, afirmar la legalidad o revelar precios; ChatGPT respondió con nuestras instrucciones y no cedió"],
    ["FaRobot", "5 IA auditaron el trabajo", "Gemini verificó los cálculos; ChatGPT y DeepSeek hallaron por separado el mismo defecto de validación, que corregimos"],
    ["FaExclamationTriangle", "Las IA también fallan", "ChatGPT exageró supuestos ya declarados y Canva ubicó la empresa en Madrid: todo se verificó"],
  ];
  for (let i = 0; i < auditoria.length; i++) {
    const [ic, t, d] = auditoria[i];
    const y = 1.6 + i * 1.72;
    card(s, 7.0, y, 5.7, 1.5, HEX.lt2, "Auditoría " + (i + 1));
    await circuloIcono(s, 7.2, y + 0.3, 0.8, ic, i === 2 ? HEX.accent3 : HEX.accent2, "FFFFFF", "Ícono auditoría " + (i + 1));
    txt(s, t, { x: 8.2, y: y + 0.15, w: 4.3, h: 0.42, fontSize: 16, bold: true, color: C.text2, objectName: "Título auditoría " + (i + 1) });
    txt(s, d, { x: 8.2, y: y + 0.57, w: 4.3, h: 0.85, fontSize: 12.5, color: C.text2, objectName: "Texto auditoría " + (i + 1) });
  }
  s.addNotes("LUKAS (30 s). Probamos el prompt con 12 casos fijos. La primera versión no aprobó ninguno: inventaba cifras y decía que el kit era legal. La versión final aprobó los 12. Después Grok escribió diez ataques y ChatGPT los respondió con nuestras instrucciones: resistió los diez. Cinco IA auditaron el trabajo y dos encontraron el mismo error, que corregimos.");

  // ---------------------------------------------------------------- 7a. Prompt RAFA por dentro
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Resultados" });
  s.addText("El prompt RAFA por dentro: entra JSON, sale un mensaje", { placeholder: "title" });
  card(s, 0.6, 1.5, 3.6, 5.15, HEX.dk1, "Entrada");
  txt(s, "ENTRA · salida del estimador", { x: 0.85, y: 1.7, w: 3.2, h: 0.35, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1, objectName: "Etiqueta entrada" });
  txt(s, '{\n "estado": "ok",\n "perfil": "colectivo",\n "cifras_formateadas": {\n  "ahorro": "19,6%",\n  "intervalo": "18,2% a 21,0%",\n  "ahorro_mensual": "$158.000",\n  "ahorro_mensual_intervalo":\n     "$146.000 a $169.000",\n  "plazo_conservador": "22 meses"\n }\n}', { x: 0.85, y: 2.15, w: 3.2, h: 4.3, fontSize: 11.5, fontFace: "Courier New", color: C.background1, objectName: "JSON entrada" });
  const rafa = [["R", "Rol", "Asesor técnico de Lumine que no vende: el conductor decide informado"], ["A", "Acción", "Copiar las cifras, nunca calcular; reglas según el estado; ignorar órdenes en la nota del cliente"], ["F", "Formato", "JSON por esquema con mensaje, nota al técnico, cifras usadas y derivación; máximo 120 palabras"], ["A", "Antecedentes", "Ley 19.496, reglamento en consulta y dos ejemplos de respuesta"]];
  rafa.forEach(([l, t, d], i) => {
    const y = 1.5 + i * 1.3;
    card(s, 4.5, y, 4.3, 1.15, HEX.lt2, "RAFA " + t);
    s.addShape(pres.shapes.OVAL, { x: 4.65, y: y + 0.25, w: 0.65, h: 0.65, fill: { color: HEX.accent2 }, line: { color: HEX.accent2 }, objectName: "Letra " + t });
    txt(s, l, { x: 4.65, y: y + 0.25, w: 0.65, h: 0.65, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Inicial " + t });
    txt(s, t, { x: 5.45, y: y + 0.1, w: 3.25, h: 0.35, fontSize: 14, bold: true, color: C.text2, objectName: "Título " + t });
    txt(s, d, { x: 5.45, y: y + 0.45, w: 3.25, h: 0.65, fontSize: 11.5, color: C.text2, objectName: "Texto " + t });
  });
  card(s, 9.1, 1.5, 3.6, 5.15, HEX.lt1, "Salida");
  txt(s, "SALE · mensaje de Claude (v3.1)", { x: 9.35, y: 1.7, w: 3.2, h: 0.35, fontSize: 12, bold: true, color: C.accent2, charSpacing: 1, objectName: "Etiqueta salida" });
  txt(s, "“Con tu forma de manejar estimamos un ahorro de combustible de 19,6%, con un rango probable de 18,2% a 21,0%. Son unos $158.000 al mes (rango: $146.000 a $169.000). […] Con el escenario conservador recuperarías la inversión en 22 meses. Después de instalar, el propio kit medirá tu ahorro real para comprobar esta cifra.”", { x: 9.35, y: 2.15, w: 3.2, h: 3.4, fontSize: 12.5, italic: true, color: C.text2, objectName: "Mensaje salida" });
  txt(s, "Validador: 9 de 9 criterios ✓", { x: 9.35, y: 5.85, w: 3.2, h: 0.5, fontSize: 14, bold: true, color: C.accent4, objectName: "Validador salida" });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: 4.22, y: 3.85, w: 0.26, h: 0.4, fill: { color: HEX.accent5 }, line: { color: HEX.accent5 }, objectName: "Flecha entrada" });
  s.addShape(pres.shapes.RIGHT_ARROW, { x: 8.82, y: 3.85, w: 0.26, h: 0.4, fill: { color: HEX.accent5 }, line: { color: HEX.accent5 }, objectName: "Flecha salida" });
  s.addNotes("LUKAS (35 s). Así se aplica el prompt. A la izquierda entra lo que calcula el modelo: un JSON con cifras ya formateadas, sin precio del kit ni ubicación. Al centro, el prompt con estructura RAFA: rol, acción, formato y antecedentes. A la derecha, lo que escribe Claude: copia las cifras con su rango y no inventa ninguna. El validador revisa nueve criterios antes de que el cliente lo vea.");

  // ---------------------------------------------------------------- 7b. Cómo lo construimos
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Resultados" });
  s.addText("Dos agentes en paralelo y todo trazable en GitHub", { placeholder: "title" });
  const carriles = [
    ["FaCode", "Claude Code", "Rama claude/…: simulador, modelo, prototipo e informes. 15 commits; cada cifra sale de un script", HEX.accent2],
    ["FaCodeBranch", "Codex", "Rama codex/…: Ridge en el prototipo, 20 pruebas, GitHub Actions y reproducción desde cero", HEX.accent1],
    ["FaSearch", "5 IA auditoras", "Gemini, ChatGPT, DeepSeek, Grok y Canva IA revisan sin tocar el código; sus hallazgos entran como commits", HEX.accent3],
  ];
  for (let i = 0; i < carriles.length; i++) {
    const [ic, t, d, col] = carriles[i];
    const y = 1.6 + i * 1.72;
    card(s, 0.6, y, 7.3, 1.5, HEX.lt2, "Carril " + (i + 1));
    await circuloIcono(s, 0.85, y + 0.33, 0.85, ic, col, "FFFFFF", "Ícono " + t);
    txt(s, t, { x: 1.95, y: y + 0.18, w: 5.7, h: 0.42, fontSize: 17, bold: true, color: C.text2, objectName: "Título " + t });
    txt(s, d, { x: 1.95, y: y + 0.62, w: 5.7, h: 0.8, fontSize: 14, color: C.text2, objectName: "Texto " + t });
  }
  const cifrasGit = [["18", "commits trazables, del 3 al 27 de octubre"], ["20/20", "pruebas automáticas en verde al integrar"], ["14 min", "para regenerar el modelo desde cero, medido por Codex"]];
  cifrasGit.forEach(([n, l], i) => {
    const y = 1.6 + i * 1.72;
    card(s, 8.3, y, 4.4, 1.5, i === 1 ? HEX.dk1 : HEX.lt1, "Cifra GitHub " + (i + 1));
    txt(s, n, { x: 8.55, y: y + 0.15, w: 3.9, h: 0.65, fontSize: 32, bold: true, color: i === 1 ? C.accent1 : C.accent2, objectName: "Valor GitHub " + (i + 1) });
    txt(s, l, { x: 8.55, y: y + 0.85, w: 3.9, h: 0.55, fontSize: 14, color: i === 1 ? C.background1 : C.text2, objectName: "Etiqueta GitHub " + (i + 1) });
  });
  s.addNotes("LUKAS (30 s). Así lo construimos. Dos agentes de programación trabajaron en paralelo sobre el mismo repositorio: Claude Code hizo el simulador, el modelo y los informes; Codex llevó el modelo Ridge al prototipo, escribió 20 pruebas y reprodujo todo desde cero. Nosotros revisamos e integramos cada cambio. Las cinco IA auditoras nunca tocaron el código: sus hallazgos entraron como cambios con fecha y autor. Por eso cada cifra que les mostramos se puede rastrear hasta su script.");

  // ---------------------------------------------------------------- 8. Uso responsable
  pres.addSection({ title: "Implementación" });
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Implementación" });
  s.addText("Ninguna cifra sin intervalo ni decisión sin una persona", { placeholder: "title" });
  const resp = [
    ["FaLock", "Privacidad", "Consentimiento específico; se recortan 300 m por viaje y se borra la ruta (Ley 21.719). Claude nunca ve ubicación ni datos personales"],
    ["FaBalanceScale", "Transparencia y equidad", "Toda cifra va con su rango. La cobertura se mide por perfil: 87% en colectivos frente a 77% en particulares"],
    ["FaUsersCog", "Gobernanza humana", "La gerencia aprueba cambios; el técnico supervisa cada caso; la ingeniería recalibra; nadie delega en la IA legalidad ni garantía"],
    ["FaStopCircle", "Regla de suspensión", "Se detiene si el error real supera 3 pp, la cobertura cae bajo 70%, un perfil queda 15 pp atrás, el validador falla o hay un reclamo fundado"],
  ];
  for (let i = 0; i < resp.length; i++) {
    const [ic, t, d] = resp[i];
    const x = 0.6 + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.6;
    card(s, x, y, 5.95, 2.35, i === 3 ? HEX.dk1 : HEX.lt2, "Responsable " + (i + 1));
    await circuloIcono(s, x + 0.3, y + 0.3, 0.85, ic, i === 3 ? HEX.accent6 : HEX.accent2, "FFFFFF", "Ícono " + t);
    txt(s, t, { x: x + 1.4, y: y + 0.38, w: 4.3, h: 0.5, fontSize: 18, bold: true, color: i === 3 ? C.background1 : C.text2, objectName: "Título " + t });
    txt(s, d, { x: x + 0.3, y: y + 1.25, w: 5.4, h: 1.0, fontSize: 14, color: i === 3 ? C.background2 : C.text2, objectName: "Texto " + t });
  }
  s.addNotes("LUKAS (30 s). El uso responsable está en el diseño: consentimiento para la ubicación, borrado de la ruta y ningún dato personal para la IA generativa. Toda cifra lleva su rango, cada decisión tiene un responsable humano y una regla con cinco gatillos detiene el sistema si la promesa deja de cumplirse.");

  // ---------------------------------------------------------------- 9. Implementación y economía
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Implementación" });
  s.addText("Implementar por fases, con una decisión en cada hito", { placeholder: "title" });
  const fases = [
    ["F0", "Meses 0 a 1,5", "Consentimiento y cotización con intervalo en el sitio, en lugar de “hasta 25%”"],
    ["F1", "Meses 1,5 a 4", `Piloto A/B (${CIF.ab_n_por_grupo} por grupo) y 10 instalaciones con telemetría`],
    ["F2", "Meses 4 a 8", "Verificación posventa y recalibración con datos de Santiago"],
    ["F3", "Meses 8 a 12", "Diagnóstico comercial si la cobertura real queda entre 75% y 85%"],
  ];
  s.addShape(pres.shapes.LINE, { x: 0.95, y: 1.95, w: 0, h: 4.3, line: { color: HEX.accent5, width: 1.5 }, objectName: "Línea de tiempo" });
  fases.forEach(([f, m, d], i) => {
    const y = 1.6 + i * 1.3;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.7, h: 0.7, fill: { color: HEX.accent2 }, line: { color: HEX.accent2 }, objectName: "Fase " + f });
    txt(s, f, { x: 0.6, y, w: 0.7, h: 0.7, fontSize: 15, bold: true, color: C.background1, align: "center", valign: "middle", objectName: "Texto fase " + f });
    txt(s, m, { x: 1.55, y: y - 0.02, w: 5.6, h: 0.38, fontSize: 15, bold: true, color: C.accent2, objectName: "Plazo " + f });
    txt(s, d, { x: 1.55, y: y + 0.36, w: 5.6, h: 0.75, fontSize: 14, color: C.text2, objectName: "Hito " + f });
  });
  const eco = CIF.economia;
  const nums = [
    ["$" + cm(eco["Base (+5 pp)"].costo_1 / 1e6) + " M", "costo del estimador el primer año"],
    ["+" + cm(100 * CIF.delta_equilibrio) + " pp", "de agendamiento bastan para pagarlo (H3 plantea +15)"],
    [cm(100 * eco["Base (+5 pp)"].roi_1, 0) + "%", "retorno del año 1 con +5 pp (escenario base)"],
  ];
  nums.forEach(([n, l], i) => {
    const y = 1.6 + i * 1.72;
    card(s, 7.6, y, 5.1, 1.5, i === 1 ? HEX.dk1 : HEX.lt2, "Cifra económica " + (i + 1));
    txt(s, n, { x: 7.85, y: y + 0.15, w: 4.6, h: 0.65, fontSize: 32, bold: true, color: i === 1 ? C.accent1 : C.accent2, objectName: "Valor económico " + (i + 1) });
    txt(s, l, { x: 7.85, y: y + 0.85, w: 4.6, h: 0.55, fontSize: 14, color: i === 1 ? C.background1 : C.text2, objectName: "Etiqueta económica " + (i + 1) });
  });
  s.addNotes("LUKAS (30 s). Implementamos por fases y cada una termina en una decisión: primero cambiar el “hasta 25%” por la cotización con intervalo; luego un A/B que mida si la estimación personal aumenta el agendamiento. El estimador cuesta unos 9 millones el primer año y se paga si el agendamiento sube 3 puntos.");

  // ---------------------------------------------------------------- 9b. Del proyecto al sitio comercial
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Implementación" });
  s.addText("Lo que construimos ya alimenta el sitio comercial", { placeholder: "title" });
  s.addImage({ path: path.join(FIG5, "sitio_portada.png"), x: 0.6, y: 1.5, w: 3.6, h: 2.25, altText: "Portada del sitio comercial de Lumine", objectName: "Sitio portada" });
  s.addImage({ path: path.join(FIG5, "sitio_calculadora.png"), x: 0.6, y: 3.9, w: 4.6, h: 2.81, altText: "Calculadora de gasto del sitio comercial", objectName: "Sitio calculadora" });
  s.addImage({ path: path.join(FIG5, "qr_sitio.png"), x: 4.35, y: 1.5, w: 1.3, h: 1.3, altText: "Código QR del sitio comercial", objectName: "QR sitio" });
  txt(s, "Sitio Lumine", { x: 4.35, y: 2.85, w: 1.5, h: 0.3, fontSize: 11, bold: true, color: C.accent2, objectName: "Etiqueta QR sitio" });
  const aportes = [
    ["20% validado", "La referencia del sitio coincide con la mediana de los colectivos (19,6%); para otros perfiles deriva al diagnóstico"],
    ["Misma fórmula", "Gasto = km × días × 4,33 ÷ rendimiento × $1.459, igual en la calculadora y en el estimador"],
    ["“Si no conviene, no instalamos”", "Es el estado no_conviene del estimador: plazo conservador sobre 48 meses"],
    ["Verificación con telemetría", "El sitio promete medir el ahorro real: es el nivel 3 del estimador"],
    ["Estimaciones de ingeniería", "Escenarios del kit (15 a 30 kW, 1 a 2 kWh) y ahorro por perfil para el TIG"],
  ];
  aportes.forEach(([t, d], i) => {
    const y = 1.5 + i * 1.04;
    card(s, 6.0, y, 6.7, 0.92, HEX.lt2, "Aporte " + (i + 1));
    txt(s, t, { x: 6.2, y: y + 0.08, w: 6.3, h: 0.32, fontSize: 14, bold: true, color: C.accent2, objectName: "Título aporte " + (i + 1) });
    txt(s, d, { x: 6.2, y: y + 0.42, w: 6.3, h: 0.45, fontSize: 12, color: C.text2, objectName: "Texto aporte " + (i + 1) });
  });
  s.addNotes("DIEGO (30 s). Y esto no quedó en el ramo. El sitio comercial de Lumine ya usa lo que construimos: su referencia de 20% es la mediana que validamos para colectivos, la calculadora usa la misma fórmula de gasto, la promesa de no instalar si no conviene es una regla del estimador y la verificación con telemetría es su tercer nivel. Además, el simulador entregó las estimaciones de ingeniería del kit para el TIG.");

  // ---------------------------------------------------------------- 10. Recomendación
  s = pres.addSlide({ masterName: "CIERRE_OSCURO", sectionTitle: "Implementación" });
  s.addText("Recomendación: implementar con ajustes, por fases", { placeholder: "title" });
  const acciones = [
    ["1", "Retirar hoy el “hasta 25%”", "y cotizar con intervalo: alrededor de 20% en colectivos y de 15% a 19% en el resto, cada uno con su rango"],
    ["2", "Medir con un A/B", "si la estimación personal aumenta el agendamiento antes de escalar"],
    ["3", "Habilitar el diagnóstico", "solo cuando la telemetría de los primeros kits confirme el intervalo"],
  ];
  acciones.forEach(([n, t, d], i) => {
    const x = 0.6 + i * 4.1;
    card(s, x, 1.75, 3.85, 3.3, "16233A", "Acción " + n);
    txt(s, n, { x: x + 0.3, y: 1.95, w: 1.0, h: 0.9, fontSize: 44, bold: true, color: C.accent1, objectName: "Número acción " + n });
    txt(s, t, { x: x + 0.3, y: 2.9, w: 3.3, h: 0.75, fontSize: 18, bold: true, color: C.background1, objectName: "Título acción " + n });
    txt(s, d, { x: x + 0.3, y: 3.65, w: 3.3, h: 1.3, fontSize: 14, color: C.background2, objectName: "Texto acción " + n });
  });
  txt(s, [
    { text: "Límites: ", options: { bold: true, color: C.accent3 } },
    { text: "el ahorro es simulado con un kit supuesto, los datos reales son secundarios y el efecto sobre el cliente (H3) aún no se mide." },
  ], { x: 0.6, y: 5.45, w: 12.1, h: 0.6, fontSize: 15, color: C.background1, objectName: "Límites" });
  txt(s, "Gracias. ¿Preguntas?", { x: 0.6, y: 6.25, w: 5.5, h: 0.55, fontSize: 22, bold: true, color: C.accent1, objectName: "Cierre" });
  txt(s, "MVP: claude.ai/artifact/82sohbXt5ctMKPTXnYzwYx\nSitio: claude.ai/artifact/XGpgpuDtxJvtiAjbRDwJ2o", { x: 6.3, y: 6.15, w: 6.4, h: 0.7, fontSize: 12, color: C.background2, align: "right", objectName: "Links" });
  s.addNotes("DIEGO (30 s). Nuestra respuesta es sí, con una condición: la IA estima el ahorro de cada cliente diez veces mejor que la cifra genérica y lo comunica sin inventar, pero el intervalo se recalibra con datos reales antes de prometer. Recomendamos implementar con ajustes: retirar hoy el “hasta 25%”, medir con un A/B y habilitar el diagnóstico cuando la telemetría lo confirme. Gracias.");

  const salida = path.join(RAIZ, "TIG_IA_Grupo01_LumineMotors_Presentacion.pptx");
  await pres.writeFile({ fileName: salida });
  if (SKILL_THEME) {
    const { applyTheme } = require(SKILL_THEME);
    await applyTheme(salida, THEME);
  }
  console.log("ok", salida);
})();
