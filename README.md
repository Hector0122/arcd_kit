# arcd_kit

> Abre `preview.html` directo en el navegador (sin servidor, sin build) para ver la guía visual: neutros, tipografía, motion y la paleta de cada app.

`preview.html` / `preview.css` / `preview.js` — cada cosa en su archivo,
nada de HTML+CSS+JS mezclado en un solo `.html`. `preview.js` es
deliberadamente chico (~35 líneas): solo el toggle de tema y el botón
"Probar" de motion, lo único que es interactivo de verdad. El resto
(swatches, chips, tarjetas, paleta por marca) es **HTML estático**, no un
render en el navegador — ese contenido casi no cambia, así que no vale la
pena una capa de indirección (dato → array JS → loop que arma DOM) para
generarlo en cada carga de página.

**Si tocas `tokens.ts`** (cambias un valor de `neutrals`, `spacing`,
`radius`, `motion.duration` o `iconSize`), corre esto antes de commitear
para que `preview.html` no se desincronice:

```bash
node scripts/sync-preview-data.mjs
```

`preview.html` no puede leer `tokens.ts` en vivo (tiene que abrirse con
doble-click, sin servidor, y `fetch()` de un archivo vecino está bloqueado
por CORS en `file://` — aunque `<link>`/`<script src>` sí cargan bien ahí,
por eso preview.css/preview.js sí pueden ser archivos aparte). Este script
regenera el HTML estático de las 6 secciones dinámicas leyendo tokens.ts
directo — ya encontró y corrigió un valor de `spacing` (un `48` suelto)
que llevaba tiempo desincronizado. `BRANDS`/`ICONS` viven hardcodeados
*dentro del script* (`scripts/sync-preview-data.mjs`), no en
`preview.html` — mezclan valores reales con contenido editorial (qué app
mostrar, qué icono de ejemplo, badges) que no es 1:1 derivable de
`tokens.ts`, así que se editan ahí a mano si hace falta.

El checklist de "próximos pasos" que antes vivía duplicado dentro de
`preview.html` se quitó — el estado del plan vive solo en
`## Pendientes (para retomar)` de este README, para no tener que
sincronizar dos listas cada vez que algo se termina.

Sistema de diseño compartido para todas las apps de producto (Varo,
VaultGaming, Vaulta, Vellum, Veya, Velody). No es un paquete npm instalable
todavía — es un **starter kit para copiar**: `tokens.ts` y `fonts/` se
copian dentro de cada repo (`src/theme/` o donde ya viva el theme actual) y
se adaptan mínimamente.

## Filosofía: familia, no clonación

Estas 6 apps resuelven problemas distintos (finanzas, gaming, fotos,
lectura, streaming, música). Ponerles el mismo color primario a todas las
mataría la identidad de cada una. Lo que sí debe ser idéntico es la
**estructura**: la misma rampa de grises, el mismo spacing, los mismos
radios, la misma tipografía y — sobre todo — el mismo motion. Eso es lo
que hoy falta en las 6 y lo que más se nota cuando no está.

Lo único que varía por app es `primary`/`accent` (ver tabla abajo).

## Qué se comparte vs. qué no

| | Compartido en las 6 apps | Propio de cada app |
|---|---|---|
| Grises / superficies | ✅ `neutrals` | |
| Spacing / radios / sombras | ✅ `spacing`, `radius`, `elevation` | |
| Motion (duración, easing, spring) | ✅ `motion` | |
| Tipografía (familias y escala) | ✅ `type`, `fontFamily` | |
| Color primario / acento | | ✅ `brands.<app>` |
| Semánticos (success/danger/warning) | ✅ `semantic` | |
| Iconos (librería + set) | ✅ `react-native-vector-icons/MaterialCommunityIcons` | |
| Botones (forma, radio, curva) | ✅ componente `Button` compartido | color de relleno (`primary`/`danger`) |

## Tipografía

- **Archivo Black** (`display`) — solo para titulares grandes, empty
  states, números "hero". Úsalo con moderación, igual que en el
  portfolio: 1-2 veces por pantalla, nunca en párrafos.
- **IBM Plex Mono** (`mono`) — labels, cifras, timestamps, badges, nav.
  Es la "firma" que va a hacer que las apps se sientan de la misma casa
  sin tocar el color.
- **Texto de lectura (`body`)** — se queda en la fuente del sistema
  (San Francisco / Roboto) a propósito. Ni Archivo Black ni un mono son
  legibles en párrafos largos, y Vellum en particular depende de la
  comodidad de lectura.

Esto extiende el mismo patrón que ya usas en el portfolio web
(Archivo Black + IBM Plex Mono + sans del sistema para el body), así que
portfolio y apps de producto van a sentirse de la misma marca.

**Estado (aplicado 2026-08-11, las 6 apps):** antes las fuentes estaban
enlazadas nativamente en Varo pero no se usaban en ningún componente
real — quedaban linkeadas y ya. Ahora sí están aplicadas, con moderación:

| App | Dónde | Mecanismo |
|---|---|---|
| Varo | wordmark "Varo" (Login), labels/cifras de `SummaryCard`, headers de navegación | RN nativo (`react-native.config.js` + assets) |
| VaultGaming | wordmark "GameVault" (Login), headers de navegación | RN nativo |
| Vaulta | 5 cifras de estadísticas en Profile (no hay wordmark de texto — el logo es un SVG, `VaultaLogo`, no aplica) | RN nativo |
| Veya | wordmark "VEYA" (Login), labels de la tab bar | RN nativo |
| Vellum | wordmark "Vellum" (SignIn y SignUp) — se dejó ahí nomás por ahora; es la app más sensible a cambios tipográficos por su estética de "papel" | RN nativo |
| Velody | wordmark "Velody" (título con gradiente), 5 usos de `font-mono` genérico → `font-mono-brand` (BPM, timestamps, tiempo de grabación) | CSS `@font-face` + Tailwind v4 `@theme` (Electron, no aplica linking nativo) |

**iOS pendiente:** en las 5 apps React Native, Android quedó resuelto
directo (los `.ttf` se copiaron a `android/app/src/main/assets/fonts/`,
donde Android los resuelve solo). iOS necesita un paso más — el
`Info.plist` ya tiene la entrada `UIAppFonts`, pero eso solo no alcanza:
hace falta correr `npx react-native-asset` (agrega los archivos al
proyecto de Xcode) o arrastrarlos a mano en Xcode → target → *Copy Bundle
Resources*. Sin eso, en iOS specifically el texto va a caer al fallback
del sistema aunque el resto del código ya esté listo.

## Iconos

Estado actual (auditado 2026-08-11): **3 fuentes distintas de icono en 5
apps**, ninguna decidida a propósito.

| App | Cómo renderizaba iconos (antes de migrar) | Estado |
|---|---|---|
| Varo | emoji sueltos (`💰` `📈` `📉`) | ✅ migrado a MaterialCommunityIcons |
| VaultGaming | emoji sueltos (`🔍` `🎮` `🏷️` `📥` `👤`) | ✅ migrado a MaterialCommunityIcons |
| Veya | emoji sueltos (`🏠` `🔍` `📚` `👤`) | ✅ migrado a MaterialCommunityIcons |
| Vaulta | `react-native-vector-icons/MaterialIcons` | ✅ migrado a MaterialCommunityIcons |
| Vellum | `react-native-vector-icons/MaterialCommunityIcons` | ya correcto |

Dos problemas reales, no solo estético:

1. **El emoji no se tiñe.** Varo/Veya/VaultGaming le pasan `color` al
   `<Text>` que envuelve el emoji esperando que el tab activo se pinte del
   color de marca — pero un emoji es un glifo a color fijo del sistema
   operativo, `color` no lo afecta. El highlight de "tab activo" hoy
   probablemente no se ve como se pretende en esas 3 apps.
2. Vaulta y Vellum ya usan una librería de iconos vectorial — pero **dos
   sets distintos** (`MaterialIcons` vs `MaterialCommunityIcons`), con
   nombres de icono y cobertura diferentes entre sí.

**Estándar elegido:** `react-native-vector-icons` (v10.3.0, la misma
versión que ya usan Vaulta/Vellum — no la migración al modelo nuevo de
paquetes por familia, eso es una decisión aparte) con el set
**`MaterialCommunityIcons`** en las 6 apps: es el más grande (~7,000
iconos) y el que mejor cubre dominios tan distintos como finanzas,
gaming, fotos, lectura, streaming y música con un solo set. Los iconos
vectoriales sí se tiñen con `primary`/`text`/`textMuted` del theme, así
que el highlight de estado activo por fin funciona de verdad.

Migración por app:
- **Vellum** — ya usa el set correcto, no requiere cambio.
- **Varo** ✅, **VaultGaming** ✅, **Vaulta** ✅ y **Veya** ✅ — migrados.
  Las 6 apps ya usan `MaterialCommunityIcons`.

**Sobre Vaulta:** cambiar el *set* no es un find-replace del import —
`MaterialIcons` y `MaterialCommunityIcons` son librerías de iconos
distintas con nombres distintos (`search`→`magnify`, `favorite`→`heart`,
`photo-album`→`image-multiple-outline`, etc.). Se remapearon los ~60
nombres usados en los 25 archivos que importaban `MaterialIcons`,
verificando cada uno contra el glyphmap real instalado de
`MaterialCommunityIcons` antes de aplicarlo — así no se cuela un nombre
que no existe y renderiza en blanco. El color de marca de Vaulta
(`#2BD4CE` teal / `#7B6BF5` morado) ya coincidía con los `hues`
canónicos, así que ahí no hubo que tocar nada.

**Sobre los ~18 archivos de Varo con emoji suelto (2026-08-12):** la
migración anterior cubrió tabs/headers/botones de acción; quedó pendiente
el emoji sembrado en labels y textos de 17 archivos más (23 apariciones:
`💰`/`💸` en selectores de tipo, `📅`/`📋`/`🔗` en historiales y avisos,
`🔒`/`🔓` en el lock screen, etc.). La hipótesis original era que parte de
eso era "contenido elegido por el usuario" (un selector de emoji de
categorías) — **resultó ser falsa**: Varo no tiene ningún picker de emoji
por categoría (`systemCategories.ts` no tiene campo `icon`), así que las
23 apariciones eran icono real y se migraron todas a
`MaterialCommunityIcons`, verificadas contra el glyphmap igual que Vaulta.
Única excepción deliberada: el `🎯` del widget de Android
(`widget/GoalWidget.tsx`, `react-native-android-widget` + Skia) — un
widget nativo usa un mecanismo de fuente distinto al de la app (ver
`iOS pendiente` arriba sobre por qué el linking de fuente no es un simple
`import`), y no hay forma de probarlo sin instalar el widget en un
launcher real, así que se dejó el emoji del sistema en vez de arriesgar un
glyph en blanco sin poder verificarlo.

### Tamaño de icono

Mismo problema que el redondeado: sin una escala, cada pantalla mete un
número de `size` a ojo (13, 16, 18, 20, 22...) y el resultado es iconos
que se ven bien en una pantalla y "chiquitos" en la de al lado — es lo
que se notó en VaultGaming (el icono 🔥 de ofertas quedó en `13`, casi
un punto). Ahora `tokens.ts` exporta `iconSize`:

```ts
export const iconSize = {
  sm: 18, // secundario / inline junto a texto pequeño (badges, chips)
  md: 22, // default — tabs, headers, botones de acción, la mayoría de los casos
  lg: 28, // avatares chicos, iconos destacados de una card
  xl: 48, // empty states / hero
} as const;
```

`md` es el default para casi todo. Ya aplicado en Varo (tabs, header,
toggle de contraseña) y VaultGaming (header, delete, 🔥 ofertas). Vaulta
no consume `tokens.ts` todavía (solo migró el set de iconos, no adoptó
el resto de los tokens compartidos), así que sus tamaños quedaron como
estaban — pendiente si se decide adoptar `iconSize` ahí también.

### Enlazar la fuente nativa (una vez por app)

```bash
pnpm add react-native-vector-icons
pnpm add -D @types/react-native-vector-icons
```

- **Android** — agregar al final de `android/app/build.gradle`:
  ```gradle
  apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
  ```
- **iOS** — agregar a `Info.plist` dentro de `UIAppFonts`:
  ```xml
  <key>UIAppFonts</key>
  <array>
    <string>MaterialCommunityIcons.ttf</string>
  </array>
  ```
  y correr `bundle exec pod install` en `ios/`.
- Recompilar (`npm run android` / `npm run ios`) — Metro/Fast Refresh no
  recoge fuentes nativas nuevas.

### Integrar las fuentes en cada app RN

Con Expo (Varo, VaultGaming, Vaulta, Veya usan bare RN — revisa cuál es tu caso):

```bash
npx expo install expo-font
```
```tsx
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'ArchivoBlack-Regular': require('./assets/fonts/ArchivoBlack-Regular.ttf'),
  'IBMPlexMono-Medium': require('./assets/fonts/IBMPlexMono-Medium.ttf'),
});
```

Con bare React Native (sin Expo):
1. Copia los `.ttf` de `fonts/` a `<app>/assets/fonts/`.
2. Crea/edita `react-native.config.js`:
   ```js
   module.exports = { assets: ['./assets/fonts'] };
   ```
3. `npx react-native-asset` y recompila (pod install en iOS).

## Motion

**Estado (2026-08-12, las 6 apps):** antes de esto, cada pantalla animaba
"a su manera" con el `Animated` nativo de RN (o no animaba) — nada usaba
`motion.*`. Ahora todas comparten el mismo mecanismo:

| App | Qué se migró |
|---|---|
| Varo | `Button` compartido, `useToast` (antes tenía `Animated.View` sin animar nada — ahora entra/sale de verdad), FAB de `TransactionsScreen` (spring + rotación) |
| VaultGaming | `Button` compartido |
| Vaulta | 7 componentes con `Animated` real: `FadeInView`, `Toast`, `Skeleton` (loop, dura 800ms deliberado — no es un token, es un pulso ambiental), `FABMenu`, `UploadQueueBanner`, `ZoomableImage` (gestos de pinch/pan reescritos sobre shared values, sin los `.setValue()`/`__getValue()` de la API vieja), swipe-to-dismiss de `PhotoPreview` |
| Veya | No tenía ninguna animación — se sumó feedback de tap en `ContentCard` (las tarjetas de catálogo) y un "pop" de selección en `StarRating` |
| Vellum | Sus propios `SPRING_CONFIG`/`TIMING_CONFIG`/etc. (`shared/animations/`) ahora derivan de `motion.*` en vez de valores duplicados a mano; su `Button` propio (diseño distinto, no tocado) ahora también anima el tap |
| Velody | CSS — `motion.duration`/`easing` viven como variables de tema de Tailwind v4 (`duration-fast`, `ease-standard`, etc.) en `main.css`; `--default-transition-duration`/`--default-transition-timing-function` alinean los 27+ `transition-*` sin duration explícita que ya había en la app |

Reanimated + `react-native-worklets` se instalaron donde faltaban (Varo,
VaultGaming, Vaulta, Veya — Vellum ya lo tenía) y se agregó
`react-native-reanimated/plugin` a cada `babel.config.js`. Todas las apps
ya tenían New Architecture activada (`newArchEnabled=true`), que Reanimated
4 requiere.

Usa `motion.duration` y `motion.easing` con Reanimated:

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { motion } from '../theme/tokens';

const style = useAnimatedStyle(() => ({
  opacity: withTiming(visible.value, {
    duration: motion.duration.base,
    easing: Easing.bezier(...motion.easing.standard),
  }),
}));
```

Para feedback de tap (botones, cards), usa `motion.spring.press` con
`withSpring` — así es como lo hace ahora `Button.tsx` (ver `## Botones`).

Requiere `react-native-reanimated` instalado + el babel plugin
configurado (`babel.config.js` → `plugins: ['react-native-reanimated/plugin']`,
tiene que ir último en la lista). Vellum ya lo tenía; el resto de apps RN
lo están sumando como parte de este trabajo — no existía ahí antes.

## Botones

Estado actual (auditado 2026-08-11 en Varo): **cada botón usaba el
`Button` nativo de React Native**, que no acepta `borderRadius`, `padding`
ni casi ningún estilo — y encima se renderiza distinto por plataforma
(en Android es un rectángulo relleno Material, en iOS es solo texto azul
sin relleno). Resultado real en el código: media docena de radios sueltos
a mano en el resto de la UI (`3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`,
`20`, `22`, `28`...) sin ningún criterio — "muchos tipos de redondeado"
porque nunca hubo un solo componente de botón que forzara un valor.

**Estándar elegido:** un componente `Button` propio (`src/components/
Button.tsx`, copiar a cada app) que envuelve `Pressable` y fija:

- **Radio:** `radius.sm` (10) del `tokens.ts` compartido — ligero, no
  pill. Mismo valor en las 6 apps.
- **Curva de esquina:** `borderCurve: 'continuous'` — la esquina
  "superelipse" que usan los controles de iOS (no el arco circular por
  defecto de Android/CSS). Es un `no-op` en Android, así que ahí cae de
  vuelta al arco normal sin romper nada. Referencia deliberada al
  lenguaje visual de Apple, que es el que le gustó al ojo del equipo.
- **Variantes** (reemplazan al viejo `color={colors.x}` del `Button`
  nativo): `primary` (relleno `colors.green`/`primary` de la app, texto
  blanco — default), `danger` (relleno `colors.red`, para
  destructivo/cerrar sesión), `ghost` (sin relleno, texto
  `textSecondary`, para "Cancelar").
- **Feedback de tap:** `opacity` reducida en `pressed` (ver `## Motion` —
  candidato a pasar a `motion.spring.press` con Reanimated más adelante,
  hoy es un `opacity` simple para no añadir una dependencia solo por
  esto).

Migración: copia `Button.tsx` (raíz de este repo) a `src/components/` de
cada app y reemplaza cada `<Button title=... onPress=... />` /
`color={...}` de `react-native` por `<Button title=... onPress=...
variant=... loading=... />`. El componente lee `colors.primary` /
`colors.danger` / `colors.textSecondary` — los nombres canónicos de
`AppThemeColors` en `tokens.ts`. Si tu `colors.ts` todavía no expone esos
nombres (como Varo, que por ahora conserva `green`/`red` para no tocar
sus ~24 archivos consumidores — ver `## Cómo migrar una app`), ajusta esas
tres líneas del `Button.tsx` copiado a los nombres que sí tengas.

Ya migrado en Varo (7 usos: Login, Register, Profile ×3, Goals,
Categories, Transactions, TransactionForm) — usando `colors.green` /
`colors.red` / `colors.textSecondary` — y en VaultGaming (4 usos: Login,
Register, Dashboard "Cerrar sesión", GameDetail "Guardar/Agregar") —
usando directo `colors.primary`/`colors.danger`/`colors.textSecondary`,
los nombres canónicos, sin necesitar ajuste.

## Colores por app

Regla: **un solo hex por nombre de color en todo el sistema, sin
excepciones.** Antes cada app inventaba su propio "amarillo" o "morado" y
terminábamos con 3 amarillos (`#F5A623`, `#D9A441`, `#EAB308`) y 2 morados
(`#7B6BF5`, `#7C5CFF`) casi idénticos entre sí — puro ruido, ninguna
diferencia intencional. Ahora cada app solo referencia `hues.<nombre>` en
`tokens.ts`; no se puede colar un casi-duplicado nuevo. Cuando el color de
marca de una app coincide con un semántico (verde de Varo = success, rojo
de VaultGaming = danger), `hues` referencia directamente ese valor de
`semantic` — no lo redefine — para que sea imposible que diverjan.

| App | Dominio | Primary | Accent | Estado |
|---|---|---|---|---|
| Vaulta ✅ | fotos privadas | `#2BD4CE` teal | `#7B6BF5` morado | sin cambios (ya coincidía con los `hues` canónicos) |
| Veya ✅ | pelis/series/anime | `#7B6BF5` morado | `#2BD4CE` teal | **antes tenía su propio morado/teal ligeramente distintos (`#7C5CFF`/`#21D4B4`) — ahora es literalmente el mismo dúo que Vaulta, en espejo. Migrado.** |
| Vellum | lector con streaks | `#4A7DB8` azul apagado | `#F5A623` ámbar | accent antes era un dorado propio (`#D9A441`) → ahora el ámbar único del sistema |
| Velody ✅ | separación de stems / música | `#3B82F6` azul | `#7B6BF5` morado | **corregido 2026-08-11: aquí tenía documentado naranja/ámbar sin haber auditado el código real** — el color de marca real (título, ~15 CTAs) siempre fue un degradado azul→morado (Tailwind sin curar). Se formalizó ese azul/morado como `hues.blue`/`hues.purple` en vez de forzar el naranja documentado. El naranja sigue existiendo en la app como acento secundario propio (loop markers, toggles), no como color de marca |
| **VaultGaming** ✅ | backlog/deals de juegos | `#E5484D` rojo | `#F5A623` ámbar | primary **nuevo** — antes gris/verde default de Tailwind; ahora es literalmente `semantic.danger`, mismo caso que el verde de Varo. Migrado (tokens + iconos + botones + 5 colores de estado unificados entre `StatusBadge`/`StatusSelectorModal`/`LibraryScreen`, que antes no coincidían entre sí) |
| **Varo** ✅ | metas de ahorro | `#2FBF71` verde | `#4C8DFF` azul | primary **nuevo** — literalmente `semantic.success`, antes no había marca propia. Migrado (tokens + iconos + botones) |

**Sobre el rojo de VaultGaming:** al ser el mismo valor que
`semantic.danger`, cualquier estado de error o botón destructivo en
*cualquiera* de las 6 apps se ve del mismo rojo que el color de marca de
VaultGaming. Es la consecuencia esperada de "un color, un hex sin
excepciones" — queda documentado por si en el futuro se vuelve confuso
dentro de VaultGaming mismo (¿este rojo es "marca" o es "error"?) y hay
que revisarlo.

## Cómo migrar una app (ej. Varo, la más simple hoy)

1. Copia `tokens.ts` a `varo_frontend/src/theme/tokens.ts`.
2. En `varo_frontend/src/theme/colors.ts`, reemplaza `lightColors`/`darkColors`
   por:
   ```ts
   import { createAppTheme, brands } from './tokens';
   export const { light: lightColors, dark: darkColors } = createAppTheme(brands.varo);
   ```
3. Revisa los usos de `colors.green/red/yellow` en pantallas — los que
   son de **estado** (progreso ok/riesgo) deben apuntar a
   `success/danger/warning`, no a `primary`. Los que deberían ser
   "color de marca" (botón principal, header, tab activo) pasan a
   `primary`/`accent`.
4. Vincula las fuentes (ver sección arriba) y aplica `type.display` /
   `fontFamily.mono` donde antes había texto plano en headers/labels —
   ✅ hecho en las 6 apps (ver tabla en `## Tipografía`), pendiente el
   paso de iOS (`npx react-native-asset`) en las 5 apps RN.
5. Repite para el resto — orden recomendado, **las 6 apps ya migradas**:
   **Varo ✅ → VaultGaming ✅ → Vaulta ✅ → Veya ✅ → Vellum ✅ → Velody ✅**.
   Vellum y Velody ya tenían buena identidad propia — solo hubo que
   unificar un color casi-duplicado en cada una (el dorado propio de
   Vellum → ámbar único; el naranja/ámbar mal documentado de Velody →
   el azul/morado que en realidad ya usaba). Velody es Electron/React/
   Tailwind, no React Native — el color se formalizó como `@theme` de
   Tailwind v4 en vez de `StyleSheet`, mismo hex, mecanismo distinto.
   VaultGaming no tenía `ThemeContext`
   (era dark-only con hex sueltos en 9 archivos) — ahí `theme/colors.ts`
   exporta `colors` estático en vez de un hook, no hace falta el patrón
   `useTheme()` de Varo si tu app tampoco tiene modo claro/oscuro.

## Pendientes (para retomar)

Lo que queda del plan original, en el orden en que se iría atacando.
El paso de iOS se movió al final: sin forma de probar en iOS por ahora,
solo se está validando en Android.

1. ~~**Motion**~~ ✅ hecho (2026-08-12) — ver `## Motion` para el detalle
   app por app.
2. ~~**Los ~18 archivos de Varo con emoji sin revisar**~~ ✅ hecho
   (2026-08-12) — eran 17 archivos / 23 apariciones, todas icono real (no
   había picker de emoji por categoría, esa hipótesis era falsa). Migradas
   a `MaterialCommunityIcons`, verificadas contra el glyphmap. Excepción
   deliberada: el `🎯` del widget de Android (`GoalWidget.tsx`, Skia) — ver
   `## Iconos` para el porqué.
3. ~~**Portfolio web**~~ ✅ hecho (2026-08-12) — `logo_varo.svg`,
   `logo_vaulta.svg`, `logo_vellum.svg` y `logo_velody.svg` seguían con el
   naranja de placeholder (`#ff8a3d`, el mismo `--accent` del sitio, nunca
   se habían personalizado — aria-label literal "Placeholder de logo").
   Actualizados al `primary` real de cada app en `brands` (verde `#2FBF71`,
   teal `#2BD4CE`, azul apagado `#4A7DB8`, azul `#3B82F6`). VaultGaming y
   Veya no tienen tarjeta en el portfolio todavía — agregarlas es "nuevo
   proyecto", no "acento cambió", así que quedó fuera de este punto.
4. ~~**Radios/iconSize en Vaulta, Veya, Vellum, Velody**~~ ✅ hecho
   (2026-08-12):
   - `radius` —
     **Veya** ya tenía su propia escala tokenizada (`sm:6/md:10/lg:16`) —
     solo se realinearon los valores a la escala canónica
     (`xs:6/sm:10/md:14/lg:20/xl:28`), un archivo. **Vaulta** (23 archivos,
     ~98 valores sueltos) y **Vellum** (12 archivos, ~44 valores sueltos)
     se mapearon al bucket más cercano de la escala canónica; los patrones
     circulares (`borderRadius = width/2` con `width === height`, ej.
     avatares/FABs) se dejaron intactos a propósito — un círculo no es un
     "radio elegido", es geometría. **Velody** (CSS): se agregaron
     `--radius-xs/sm/md/lg/xl` en `main.css` — mismos valores que las apps
     RN — y se remapearon los 51 usos de `rounded-lg/xl/2xl` de Tailwind
     (que usaban la escala default, 8/12/16px) a `rounded-sm/md` bajo la
     escala nueva; `rounded-full` no se tocó (ya es pill universal).
     `tsc --noEmit` + lint limpios en las 4 apps.
   - `iconSize` — 140 reemplazos en 26 archivos
     de Vaulta + 36 en 9 archivos de Vellum, mapeados al bucket más
     cercano de `sm:18/md:22/lg:28/xl:48`. Los `size={56}`/`64`/`72`
     sueltos (empty states/hero en distintas pantallas, cada una con su
     propio número a ojo) convergieron todos en `xl` — exactamente el rol
     que describe ese token, así que no es una pérdida sino la
     consolidación que el token existe para lograr. Dos excepciones
     dejadas fuera a propósito: `size={11}` en los badges circulares de
     `Duplicates/index.tsx` (estrella/basura sobre una foto) — por debajo
     de `sm`, un micro-icono sin bucket propio en la escala, mismo
     criterio que los `radius` de 2-4px que se dejaron sueltos. Veya y
     Velody ya estaban bien (Veya usa `iconSize` en lo poco que tiene,
     Velody no tiene un equivalente RN). `tsc --noEmit` + lint limpios en
     ambas apps.
5. **iOS: terminar el linking de fuentes** en las 5 apps React Native —
   correr `npx react-native-asset` (o agregar los `.ttf` a mano en Xcode,
   *Copy Bundle Resources*) en cada una. Android ya está resuelto; queda
   pendiente hasta tener forma de probar en iOS.

## Siguiente paso opcional

Si esto prueba valer la pena después de migrar 2-3 apps, se puede
convertir en un workspace real (pnpm) con `@hector/arcd_kit` como
dependencia instalable en vez de copiar archivos — evita que los tokens
se desincronicen entre repos.
