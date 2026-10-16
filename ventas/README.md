# Lumine Motors · página comercial

Página que vende el kit de hibridación a **particulares y flotas**.
React + TypeScript + Tailwind 4 + estructura shadcn (`src/components/ui`) + framer-motion + lucide-react + Radix.

## Correr

```bash
npm install
npm run dev               # desarrollo en http://localhost:5173
npm run typecheck         # TypeScript
npm run build             # sitio para Vercel  -> dist/
npm run build:artefacto   # un solo HTML para publicar como artefacto -> dist-artefacto/index.html
npm run e2e               # pruebas en navegador (requiere playwright)
```

## Completar los datos comerciales

Todo dato que todavía no existe se muestra como **«Por confirmar»** y nunca se inventa.
Cuando estén validados, se llenan en `src/lib/datos.ts` (precio, % de ahorro, garantía, tiempo de instalación, WhatsApp, correo) y la página se actualiza sola.
La calculadora muestra el gasto actual y cuánto vale cada 10 % de ahorro; el rango del kit aparece cuando `ahorroPct` tiene valor.

## Publicar en Vercel

1. Sube el repositorio a GitHub e impórtalo en vercel.com.
2. *Root directory*: `ventas` · *Build command*: `npm run build` · *Output*: `dist` (Vercel detecta Vite solo).
3. Variable de entorno `VITE_FORMULARIO_URL`: dirección que recibe el formulario en JSON (por ejemplo Formspree, Make o un endpoint propio). Sin ella, el formulario avisa que es una demostración y no envía datos.
4. Conecta el dominio (por ejemplo lumine.cl) en *Settings › Domains*.

## Estructura

- `src/components/ui/` componentes base estilo shadcn (button, accordion) y **ai-prompt-box.tsx**, el componente entregado por el equipo. Se mantiene en esta carpeta porque es la ruta que usan shadcn y su import (`@/components/ui/...`).
- `src/components/comunes.tsx` logo, marcador «Por confirmar», apariciones con framer-motion y el auto 3D.
- `src/lib/lab3d.js` motor 3D propio de Lumine (canvas, sin librerías), traído de Lumine Habilita.
- `src/lib/datos.ts` datos comerciales y hechos documentados en la Fase 3.
- `src/sections/` portada, para quién, cómo funciona, calculadora, verificador, proceso, confianza, preguntas y agenda.

## Verificador de compatibilidad

Guiado y sin IA: aplica las reglas reales de elegibilidad (tracción delantera; el modelo en la biblioteca de calibraciones se confirma en el diagnóstico) y no guarda datos.
Usa las piezas base de `ai-prompt-box.tsx` (`PromptInput`, `PromptInputTextarea`, `PromptInputAction`).
Para pasarlo a IA real hace falta un servidor (por ejemplo una función de Vercel con una clave de Claude de Lumine), porque la clave nunca puede ir en la página.

## shadcn CLI

`components.json` está listo. En este entorno `ui.shadcn.com` estaba bloqueado, así que la estructura se armó a mano con el mismo resultado que `shadcn init`. En tu computador puedes agregar componentes con `npx shadcn@latest add <componente>`.

## Diseño

Patrón y checklist del skill **UI/UX Pro Max** (`.claude/skills/ui-ux-pro-max` en la raíz del repositorio): hero dominante, una sola acción principal, botón fijo en la navegación, movimiento con propósito y respeto por `prefers-reduced-motion`. Los colores son los de la marca Lumine.
