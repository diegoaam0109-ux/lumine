# Prompts para regenerar las imágenes del kit (dos motores en las ruedas traseras)

El informe final describe el kit así: **dos motores eléctricos en las ruedas traseras** (4.000 W en Esencial y 6.000 W en
Plus), **una batería de litio-titanato de 2,14 kWh** y **una unidad de control**. El motor original, la transmisión y la
alimentación quedan intactos. Los renders actuales (`integrador-2/identidad/imagenes/` y `defensa/material/claros/`)
muestran un solo motor central sobre el eje, así que no sirven para explicar el kit.

Reglas para todos:

- 16:9, 3840 × 2160 o lo más alto que permita la herramienta. Si sale menor, se reescala aparte; no lo pidan en el prompt.
- Sin texto, sin logos y sin marcas de autos reconocibles (sedán genérico de tracción delantera).
- Paleta: negro o gris muy oscuro (o blanco, en la versión clara), un solo acento celeste #22B8F0 y los cables de alta
  tensión en naranja #FF8A1F. Nada de verde, rojo o morado, ni neones de colores.
- Pidan siempre la versión oscura y la clara del mismo encuadre: las láminas negras usan la oscura y las blancas, la clara.

Pegar las imágenes en Drive, en «Defensa final › Material › 5. Opcional», con el nombre indicado.

---

## 1. Auto en rayos X, vista lateral · `kit-lateral-oscuro` y `kit-lateral-claro`

> Render fotorrealista de producto, vista lateral pura (perfil) de un sedán compacto genérico de tracción delantera,
> carrocería semitransparente tipo rayos X en gris humo. Adelante, el motor a combustión original visible en gris neutro,
> sin modificar. En el eje trasero, dentro de cada rueda trasera, un motor eléctrico en el cubo (hub motor) iluminado en
> celeste #22B8F0; se ve el de este lado y se intuye el del otro lado por transparencia. Bajo el piso trasero, un banco de
> baterías plano y delgado en celeste; cerca del centro del auto, una caja pequeña de unidad de control en celeste.
> Cables de alta tensión naranjos #FF8A1F unen la batería con la unidad de control y con cada motor de rueda. Fondo negro
> profundo con un piso reflectante sutil, luz de estudio suave, mucho espacio negativo arriba para un titular. Sin texto,
> sin logos, sin marca de auto. 16:9, ultra nítido.

Versión clara: igual, con «fondo blanco de estudio, piso gris perla muy claro con reflejo suave, carrocería en vidrio
gris claro».

## 2. Detalle de la rueda trasera · `motor-rueda-oscuro` y `motor-rueda-claro`

> Primer plano fotorrealista, tres cuartos trasero, de la rueda trasera de un sedán genérico levantado en un elevador de
> taller. Dentro del aro se ve un motor eléctrico en el cubo de la rueda (hub motor), compacto, de aluminio cepillado con
> un anillo celeste #22B8F0 encendido, conectado por un cable de alta tensión naranjo #FF8A1F que entra por la suspensión.
> El disco y la pinza de freno originales se mantienen visibles. Taller limpio y oscuro desenfocado al fondo, luz lateral
> fría. Sin texto, sin logos. 16:9.

## 3. Despiece del kit · `kit-despiece-oscuro` y `kit-despiece-claro`

> Render técnico fotorrealista en vista isométrica de un kit de hibridación desarmado y flotando ordenado sobre fondo
> negro: dos motores eléctricos de cubo de rueda idénticos (uno por rueda trasera), un banco de baterías plano y delgado
> con celdas visibles y un acento celeste #22B8F0, una caja de unidad de control con disipador de aletas y cables de alta
> tensión naranjos #FF8A1F que unen las cuatro piezas. Composición equilibrada de izquierda a derecha: unidad de control,
> batería, los dos motores. Reflejo suave en el piso. Sin texto ni etiquetas. 16:9, ultra nítido.

## 4. El colectivo de referencia · `colectivo-dia` y `colectivo-noche`

> Fotografía realista de un sedán compacto genérico negro usado como taxi colectivo en Santiago de Chile, con el letrero de
> techo genérico sin texto, circulando por una avenida con la cordillera de los Andes nevada al fondo. Toma trasera tres
> cuartos a la altura de la rueda: un brillo celeste #22B8F0 muy sutil en las ruedas traseras sugiere los motores. Luz de
> mañana limpia (versión día) o noche con pavimento mojado y reflejos (versión noche). Sin patentes legibles, sin logos,
> sin personas reconocibles. 16:9.

## 5. Dúo de técnicos en la rueda trasera · `duo-rueda-claro`

> Fotografía realista en un taller blanco y luminoso: dos técnicos con overol gris oscuro, casco blanco con visor y guantes
> dieléctricos naranjos trabajan a ambos lados del eje trasero de un sedán en un elevador; en cada rueda trasera se ve un
> motor eléctrico en el cubo con un anillo celeste #22B8F0 y cables naranjos #FF8A1F. Una tablet sobre un carro muestra un
> diagrama del auto. Rostros de perfil o de espaldas, no identificables. Sin texto ni logos. 16:9.

---

## Lo que ya se corrigió sin generar imágenes

El plano vectorial (`defensa/conceptos/comun/marca.js`) ahora dibuja el motor dentro de la rueda trasera, con la llamada
«Motores en rueda ×2». Ese plano es el que usaría la lámina de la solución.
