/* =====================================================================
   Datos comerciales de Lumine Motors
   Todo lo que está en null se muestra como "Por confirmar" en la página.
   Cuando el equipo tenga los datos reales, se completan aquí y la página
   se actualiza sola: no hay que tocar las secciones.
   ===================================================================== */

export const DATOS = {
  /** Precio del kit instalado, en CLP. Ej.: { desde: 0, hasta: 0 } */
  precio: null as null | { desde: number; hasta?: number },
  /** Ahorro de combustible con el kit, en %. Definido por Lumine Motors: 20% */
  ahorroPct: 20 as null | number,
  /** Garantía del kit, texto corto. Ej.: "X años o Y km" */
  garantia: null as null | string,
  /** Tiempo de instalación, texto corto. Ej.: "X días hábiles" */
  instalacion: null as null | string,
  /** Contacto de ventas */
  whatsapp: null as null | string, // solo dígitos, con código de país: 569XXXXXXXX
  correo: null as null | string,
  /** Dirección del formulario en producción (Formspree, Make, un endpoint propio).
      En Vercel se fija con la variable VITE_FORMULARIO_URL. */
  formularioUrl: (import.meta.env.VITE_FORMULARIO_URL as string | undefined) || null,
}

/** Lo que sí está decidido y documentado en la Fase 3 (informes 1 a 6) */
export const HECHOS = {
  ejeTrasero: 'El kit va en el eje trasero; el motor a combustión y la tracción delantera quedan como están.',
  elegibilidad: 'Autos de tracción delantera cuyo modelo esté en la biblioteca de calibraciones de Lumine.',
  sistemasOriginales: 'El freno, el ABS y el control de estabilidad originales siempre mandan sobre el kit.',
  capaSeguridad: 'La unidad de control corta el torque ante patinaje, falla o sobretemperatura.',
  tecnicos: 'Instalan duos de técnicos validados en el sistema Lumine Habilita, con seguridad en alta tensión según la guía alemana DGUV 209-093.',
  certificacion: 'Antes de entregar se ejecutan las pruebas previas a la certificación; el informe técnico lo firma el Responsable Técnico de Lumine.',
  telemetria: 'La telemetría compara el ahorro real con el estimado.',
  desaconsejar: 'Si el uso de tu auto no da ahorro real, el diagnóstico lo dice con evidencia y no se instala.',
}

/** Precios promedio del litro en la Región Metropolitana.
    Actualizar aquí cuando cambien (fuente: preciocombustible.cl / bencinaenlinea.cl, CNE). */
export const COMBUSTIBLES = {
  fecha: '30 de septiembre de 2026',
  fuente: 'Promedio Región Metropolitana · preciocombustible.cl',
  tipos: [
    { k: 'b93', l: '93', precio: 1459, co2: 2.31 },
    { k: 'b95', l: '95', precio: 1502, co2: 2.31 },
    { k: 'b97', l: '97', precio: 1554, co2: 2.31 },
    { k: 'diesel', l: 'Diésel', precio: 1393, co2: 2.68 },
  ],
} as const
/* co2: kg de CO₂ por litro quemado (factores de emisión de uso común: gasolina 2,31; diésel 2,68) */

export const clp = (n: number) => '$' + Math.round(n).toLocaleString('es-CL')
