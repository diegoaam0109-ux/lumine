# Rediseño visual premium · láminas piloto (para aprobar)

Tres láminas de prueba antes de intervenir las 35: portada (1), Ansoff (6) y producto y precio (8).
Se arman con el mismo generador (`../generador/deck.js`), así que siguen siendo editables, gráficos incluidos.
El PPTX principal (`../Grupo_01_LumineMotors_Fase3.pptx`) **no se ha regenerado** y queda igual hasta que se apruebe la propuesta.

```bash
bash armar.sh   # Lumine_Fase3_pilotos.pptx, .pdf y piloto-1..3.png
```

## Qué propone cada piloto

| Lámina | Antes | Propuesta |
|---|---|---|
| 1 · Portada | Auto al centro, texto y datos del curso con el mismo peso | Fondo compuesto (`componer.py → portada-premium.jpg`): auto en rayos X en la mitad inferior, halo celeste solo bajo la batería y el eje trasero, luz de borde fría y viñeta. «LUMINE MOTORS» a 58 pt y el concepto «tu mismo auto, ahora híbrido.». Datos del curso en 12 pt abajo a la izquierda. Anotación de ingeniería editable: motor original intacto, batería bajo el piso y tracción eléctrica en el eje trasero. |
| 6 · Ansoff | Cuatro cajas con bordes y flechas entre cajas | Matriz sin cajas: cruz de ejes fina y un cuadrante de entrada con resplandor localizado y esquinas de visor. La ruta numerada por año (1 → 2 → 3, más el 2 punteado de la diversificación adelantada) rodea el cruce de los ejes y no atraviesa texto. La ventaja competitiva sostenible va con la foto de la unidad de control, donde viven los patrones de calibración. |
| 8 · Producto y precio | Precios ajustados a la caja; ahorro máximo y mensual mezclados | Dos fichas: Esencial en grafito y Plus con acento (resplandor, borde superior y visor). Precios a 48 pt con holgura. El ahorro máximo en ciudad y el ahorro mensual de un colectivo van separados y rotulados. Gráfico editable con un decimal (36,6 · 34,3 · 28,9 · 27,5, Tabla N° 6) y marca «ESTIMACIÓN · SIMULADO». |

Cambios de sistema que se aplicarían a toda la presentación:
- Titulares de 32 a 34 pt.
- Las marcas de estado (estimación, supuesto, por confirmar) pasan del ámbar al gris acero, con los mismos tipos de borde; la paleta pedida no admite ámbar, verde ni rojo.
- Nuevo recurso `brillo.png` (resplandor celeste con transparencia) para el dato o cuadrante protagonista.

## Inconsistencias detectadas (no se corrigieron)

1. **Química de la batería.** El informe (Tabla N° 5 y Anexo N° 9) dice litio-titanato de 2,14 kWh. `CLAUDE.md` y el kit de identidad (`lumine-06-baterias-lfp.jpg`) dicen LFP. La presentación no nombra la química; hay que confirmar cuál vale.
2. **Configuración de los motores.** El informe describe dos motores en las ruedas traseras. El render de rayos X muestra un solo motor central en el eje trasero. La anotación de la portada dice «tracción eléctrica · eje trasero» para no afirmar ninguna de las dos.
3. **Frase de marca.** El informe (§3.1.5.3) fija el concepto «el mismo auto, ahora híbrido» y deja «Tu mismo auto, ahora híbrido» como frase *por probar con clientes*. La portada piloto usa esta última porque así la pidió dirección de arte.
4. **Etapa de la investigación.** El informe dice «entrevista exploratoria»; la presentación dice «Profundidad» (cambio pedido el 17-10-2026).
5. **Recuperación de la inversión.** La lámina 8 mostraba 37, 34, 29 y 28 meses (redondeo). El piloto muestra los valores de la Tabla N° 6 con un decimal. El guion dice «34 meses» para el colectivo con Plus (34,3).
