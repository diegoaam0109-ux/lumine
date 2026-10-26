---
name: lumine-ventas
description: Cómo trabajar en la página comercial de Lumine (ventas/, Vite + React 19 + TypeScript + Tailwind 4 + framer-motion + Radix), sus datos, su build como artefacto de un solo HTML y sus pruebas. Úsala antes de tocar cualquier archivo dentro de ventas/.
---

# Página comercial (`ventas/`)

Vende el kit a **particulares y flotas, nunca a talleres**. Oscuro por defecto con interruptor claro/oscuro visible,
estilo cinematográfico (Lamborghini, Ferrari, AWE, Apple) con la marca Lumine (skill `lumine-marca`).

## Comandos (desde `ventas/`)

```bash
npm install
npm run typecheck          # obligatorio antes de commit
npm run lint               # oxlint
npm run build:artefacto    # un solo HTML -> dist-artefacto/index.html (es lo que se publica)
npm run e2e                # Playwright sobre dist-artefacto; requiere el build anterior
```

## Datos

- Todo dato comercial vive en `src/lib/datos.ts`. Lo que es `null` aparece como «Por confirmar» automáticamente.
  **No escribas precios, garantías ni contactos en las secciones.**
- `COMBUSTIBLES` lleva fecha y fuente; si actualizas precios, actualiza ambas.
- La calculadora usa 20% de ahorro (estimación). El verificador de compatibilidad y la ayuda comercial son **guiados y
  sin IA**: no les conectes una API (la clave no puede ir en la página).
- Las fotos son conceptuales (`src/assets/fotos/`, `src/lib/fotos.ts` con texto alternativo) y la página lo dice.

## Trampas conocidas

- **CSS del visor de artefactos**: inyecta estilos sin capa en `body` (fondo claro, fuente del sistema). Los estilos base
  van **fuera de `@layer` y con `!important`** en `src/index.css`. Si los mueves a una capa, la página sale en «blanco nativo».
  La prueba e2e lo simula inyectando `body{background:#faf9f5}`.
- **Recorrido 3D** (`#como-funciona`, motor propio en `src/lib/lab3d.js`): el texto debe ser **legible en todo momento**
  en PC y teléfono. Cualquier cambio de scroll o de capas se verifica con capturas a lo largo del recorrido.
- Sin desborde horizontal en ninguna sección (la e2e lo revisa en 1440 px y 390 px).
- En teléfono, la ayuda va dentro de la barra inferior; en PC se esconde en el verificador y en la agenda.
- Las fuentes vienen de `@fontsource` (npm); Google Fonts está bloqueado en las sesiones en la nube.
- `ui.shadcn.com` está bloqueado en la nube: los componentes de `src/components/ui/` se arman a mano con el patrón shadcn.

## Antes de entregar

1. `npm run typecheck && npm run build:artefacto && npm run e2e` sin fallas.
2. Capturas en PC (1440×900) y teléfono (390×844), oscuro y claro (skill `lumine-verificacion-visual`).
3. Si cambió lo publicado: anota en `codex/BITACORA.md` que hay que republicar `ventas/dist-artefacto/index.html`.
