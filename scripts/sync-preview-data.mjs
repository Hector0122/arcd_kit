#!/usr/bin/env node
/**
 * Genera el HTML estático de preview.html a partir de tokens.ts.
 *
 * Por qué HTML estático y no JS que arma DOM en el navegador (como era
 * antes): los valores de tokens.ts casi no cambian — no hay razón para
 * pagar una capa de indirección (dato → array JS → loop que arma DOM) en
 * cada carga de página para contenido que es, en la práctica, fijo. Eso
 * es boilerplate: código que solo existe para evitar escribir el HTML a
 * mano, pero termina siendo más código (y más frágil) que el HTML mismo.
 * Aquí el "escribir a mano" lo hace este script, una vez, no el navegador
 * en cada carga — preview.js queda solo con lo que sí es interactivo de
 * verdad (el toggle de tema, el botón "Probar" de motion).
 *
 * preview.html tiene que poder abrirse con doble-click, sin servidor ni
 * build (ver README.md) — por eso no puede hacer `fetch('./tokens.ts')`
 * en el navegador (bloqueado por CORS en file://). Este script es la
 * alternativa: correrlo a mano después de tocar tokens.ts, antes de
 * commitear, para que preview.html quede al día.
 *
 * Uso:
 *   node scripts/sync-preview-data.mjs
 *
 * Deriva de tokens.ts: neutrals, spacing, radius, motion.duration,
 * iconSize, hues. `BRANDS` e `ICONS` abajo son contenido editorial (qué
 * app mostrar, qué icono de ejemplo, badges) — no vienen de tokens.ts,
 * se editan a mano en este archivo.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TOKENS_PATH = path.join(ROOT, 'tokens.ts');
const PREVIEW_HTML_PATH = path.join(ROOT, 'preview.html');

const tokensSrc = readFileSync(TOKENS_PATH, 'utf8');

/** Extrae el texto entre `export const NAME = {` y su `}` de cierre (balanceando llaves). */
function extractBlock(src, name) {
  const start = src.indexOf(`export const ${name} =`);
  if (start === -1) throw new Error(`No se encontró "export const ${name}" en tokens.ts`);
  const braceStart = src.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(braceStart, i + 1);
    }
  }
  throw new Error(`Llave sin cerrar para "${name}"`);
}

/** Evalúa un literal de objeto TS (ya sin `as const`) como JS, con variables extra en scope. */
function evalLiteral(literalText, scope = {}) {
  const names = Object.keys(scope);
  const values = Object.values(scope);
  // eslint-disable-next-line no-new-func
  return new Function(...names, `return (${literalText});`)(...values);
}

const semantic = evalLiteral(extractBlock(tokensSrc, 'semantic'));
const neutrals = evalLiteral(extractBlock(tokensSrc, 'neutrals'));
const spacing = evalLiteral(extractBlock(tokensSrc, 'spacing'));
const radius = evalLiteral(extractBlock(tokensSrc, 'radius'));
const iconSize = evalLiteral(extractBlock(tokensSrc, 'iconSize'));
const hues = evalLiteral(extractBlock(tokensSrc, 'hues'), { semantic });

const motionBlock = extractBlock(tokensSrc, 'motion');
const durationLiteral = motionBlock.match(/duration:\s*(\{[\s\S]*?\n\s*\})/)[1].replace(/\/\/.*$/gm, '');
const duration = evalLiteral(durationLiteral);

// Caption corto por duración (cabe en la tarjeta) — editorial, no viene de
// tokens.ts. Si agregas una duración nueva, agrégale su caption aquí.
const DURATION_CAPTIONS = {
  instant: 'checkbox, toggle',
  fast: 'hover, tabs',
  base: 'modal, card',
  slow: 'pantalla completa',
  deliberate: 'onboarding, hero',
};

// Contenido editorial — no deriva de tokens.ts.
const BRANDS = [
  { name: 'Varo', domain: 'Metas de ahorro', primary: '#2FBF71', accent: '#4C8DFF', dark: true, badge: 'NUEVO' },
  { name: 'VaultGaming', domain: 'Backlog / ofertas de juegos', primary: '#E5484D', accent: '#F5A623', dark: true, badge: 'NUEVO' },
  { name: 'Vaulta', domain: 'Fotos privadas', primary: '#2BD4CE', accent: '#7B6BF5', dark: true, badge: '' },
  { name: 'Vellum', domain: 'Lector con streaks', primary: '#4A7DB8', accent: '#F5A623', dark: false, badge: 'AJUSTADO' },
  { name: 'Veya', domain: 'Pelis, series, anime', primary: '#7B6BF5', accent: '#2BD4CE', dark: true, badge: 'AJUSTADO' },
  { name: 'Velody', domain: 'Separación de stems (Electron)', primary: '#3B82F6', accent: '#7B6BF5', dark: true, badge: 'CORREGIDO' },
];
const ICONS = [
  { before: '🏠', name: 'home-variant', where: 'Varo · tab Inicio', path: 'M12,3L20,9V21H15V14H9V21H4V9L12,3Z' },
  { before: '💳', name: 'credit-card-outline', where: 'Varo · tab Movimientos', path: 'M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z' },
  { before: '📈', name: 'trending-up', where: 'Varo · ingresos', path: 'M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z' },
  { before: '📉', name: 'trending-down', where: 'Varo · gastos', path: 'M16,18L18.29,15.71L13.41,10.83L9.41,14.83L2,7.41L3.41,6L9.41,12L13.41,8L19.71,14.29L22,12V18H16Z' },
  { before: '💰', name: 'piggy-bank', where: 'Varo · ahorro neto', path: 'M19.83 7.5L17.56 5.23C17.63 4.81 17.74 4.42 17.88 4.08C17.96 3.9 18 3.71 18 3.5C18 2.67 17.33 2 16.5 2C14.86 2 13.41 2.79 12.5 4H7.5C4.46 4 2 6.46 2 9.5S4.5 21 4.5 21H10V19H12V21H17.5L19.18 15.41L22 14.47V7.5H19.83M13 9H8V7H13V9M16 11C15.45 11 15 10.55 15 10S15.45 9 16 9C16.55 9 17 9.45 17 10S16.55 11 16 11Z' },
  { before: '🎯', name: 'target', where: 'Varo · header Metas', path: 'M11,2V4.07C7.38,4.53 4.53,7.38 4.07,11H2V13H4.07C4.53,16.62 7.38,19.47 11,19.93V22H13V19.93C16.62,19.47 19.47,16.62 19.93,13H22V11H19.93C19.47,7.38 16.62,4.53 13,4.07V2M11,6.08V8H13V6.09C15.5,6.5 17.5,8.5 17.92,11H16V13H17.91C17.5,15.5 15.5,17.5 13,17.92V16H11V17.91C8.5,17.5 6.5,15.5 6.08,13H8V11H6.09C6.5,8.5 8.5,6.5 11,6.08M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z' },
  { before: '👤', name: 'account-circle-outline', where: 'Varo · header Perfil', path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z' },
];
const STAR_PATH = 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27Z';

// ---- generadores de HTML estático (mismas clases que preview.css espera) ----

function neutralsHtml() {
  const light = new Set(['0', '50', '100', '200', '300']);
  return Object.entries(neutrals)
    .map(([key, hex]) => {
      const tagColor = light.has(key) ? '#00000088' : '#ffffff99';
      return `<div class="swatch" style="background:${hex}"><span class="tag" style="color:${tagColor}">${key}</span></div>`;
    })
    .join('\n    ');
}

function rulerHtml() {
  const values = Object.values(spacing);
  const max = Math.max(...values);
  return values
    .map((s) => {
      const h = 10 + (s / max) * 46;
      return `<div class="tick"><div class="bar" style="height:${h}px"></div><div class="num">${s}</div></div>`;
    })
    .join('\n    ');
}

function radiusRowHtml() {
  return Object.entries(radius)
    .map(([key, px]) => `<div class="radius-chip" style="border-radius:${Math.min(px, 24)}px"><span>${key}</span></div>`)
    .join('\n    ');
}

function motionGridHtml() {
  return Object.entries(duration)
    .map(([key, ms]) => {
      const why = DURATION_CAPTIONS[key] || '';
      return `<div class="motion-card">
      <h3>${key}</h3><p class="ms">${ms}ms · ${why}</p>
      <div class="track"><div class="fill"></div></div>
      <button type="button" data-ms="${ms}">Probar</button>
    </div>`;
    })
    .join('\n    ');
}

function iconCompareHtml() {
  return ICONS.map(
    (ic) => `<div class="icon-unit">
      <div class="swap-label">${ic.where}</div>
      <div class="icon-row">
        <span class="icon-before" title="antes: emoji, no se tiñe">${ic.before}</span>
        <span class="icon-arrow">&#8594;</span>
        <span class="icon-after" style="color:var(--mark)" title="ahora: vector, sí se tiñe">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="${ic.path}"/></svg>
        </span>
      </div>
      <div class="icon-name">${ic.name}</div>
    </div>`,
  ).join('\n    ');
}

function iconSizeRowHtml() {
  return Object.entries(iconSize)
    .map(
      ([key, px]) =>
        `<div class="icon-size-unit"><svg width="${px}" height="${px}" viewBox="0 0 24 24" fill="currentColor"><path d="${STAR_PATH}"/></svg><span class="label">${key} · ${px}</span></div>`,
    )
    .join('\n    ');
}

function hueStripHtml() {
  return Object.entries(hues)
    .map(([key, hex]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase(); // slateBlue -> slate blue
      return `<div class="hue-chip"><i class="dot" style="background:${hex};border-radius:50%;display:inline-block"></i><span class="label">${label} <span class="hex">${hex}</span></span></div>`;
    })
    .join('\n    ');
}

function brandGridHtml() {
  return BRANDS.map((b) => {
    const bg = b.dark ? '#101214' : '#FFFFFF';
    const surface = b.dark ? '#181B1F' : '#F7F8F9';
    const text = b.dark ? '#F7F8F9' : '#101214';
    const muted = b.dark ? '#9AA3AD' : '#4E555F';
    void bg;
    return `<div class="brand-unit">
      <div class="mock" style="background:${surface};color:${text}">
        <div class="row"><span class="app-label" style="color:${muted}">${b.name}${b.badge ? ' · ' + b.badge : ''}</span>
        <span class="pill" style="background:${b.primary}"></span></div>
        <div class="title">${b.domain}</div>
        <div class="sub" style="color:${muted}">Vista previa de tema</div>
        <span class="cta" style="background:${b.accent}">Continuar</span>
      </div>
      <div class="brand-meta">
        <div class="name">${b.name}</div>
        <div class="domain">${b.domain}</div>
        <div class="hexes">
          <span><i class="dot" style="background:${b.primary}"></i>${b.primary}</span>
          <span><i class="dot" style="background:${b.accent}"></i>${b.accent}</span>
        </div>
      </div>
    </div>`;
  }).join('\n    ');
}

// ---- inyecta cada bloque en su contenedor por id, dentro de preview.html ----

let html = readFileSync(PREVIEW_HTML_PATH, 'utf8');

/**
 * Reemplaza el contenido de `<div ... id="ID">...</div>`, balanceando los
 * `<div>` anidados de adentro para encontrar el `</div>` que de verdad
 * cierra el contenedor (no el primero que aparece — el contenido generado
 * tiene sus propios divs anidados, así que un regex no-greedy simple corta
 * en el lugar equivocado en la segunda corrida, cuando el contenedor ya no
 * está vacío).
 */
function fillContainer(html, id, innerHtml) {
  const openMatch = new RegExp(`<div class="[^"]*" id="${id}">`).exec(html);
  if (!openMatch) throw new Error(`No se encontró el contenedor id="${id}" en preview.html`);
  const contentStart = openMatch.index + openMatch[0].length;

  const tagRe = /<div\b|<\/div>/g;
  tagRe.lastIndex = contentStart;
  let depth = 1;
  let m;
  while ((m = tagRe.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) {
      return html.slice(0, contentStart) + `\n    ${innerHtml}\n  ` + html.slice(m.index);
    }
  }
  throw new Error(`Contenedor id="${id}" sin cerrar`);
}

html = fillContainer(html, 'neutralStrip', neutralsHtml());
html = fillContainer(html, 'ruler', rulerHtml());
html = fillContainer(html, 'radiusRow', radiusRowHtml());
html = fillContainer(html, 'motionGrid', motionGridHtml());
html = fillContainer(html, 'iconCompare', iconCompareHtml());
html = fillContainer(html, 'iconSizeRow', iconSizeRowHtml());
html = fillContainer(html, 'hueStrip', hueStripHtml());
html = fillContainer(html, 'brandGrid', brandGridHtml());

writeFileSync(PREVIEW_HTML_PATH, html);
console.log('preview.html regenerado desde tokens.ts (HTML estático, sin JS de render).');
