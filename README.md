# brand-kit

> Abre `preview.html` directo en el navegador (sin servidor, sin build) para ver la guía visual: neutros, tipografía, motion y la paleta de cada app.

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

Nada de esto existe hoy en ninguna app — cada pantalla anima "a su
manera" o no anima. Usa `motion.duration` y `motion.easing` con
Reanimated:

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
`withSpring`.

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

Lo que queda del plan original, en el orden en que se iría atacando:

1. **Motion** — `motion.duration`/`easing`/`spring` existen en
   `tokens.ts` pero ninguna app los usa todavía. Falta conectarlos a
   transiciones reales con Reanimated (o el equivalente CSS en Velody).
2. **iOS: terminar el linking de fuentes** en las 5 apps React Native —
   correr `npx react-native-asset` (o agregar los `.ttf` a mano en Xcode,
   *Copy Bundle Resources*) en cada una. Android ya está resuelto.
3. **Los ~18 archivos de Varo con emoji sin revisar** (selector de
   categorías y similares) — separar iconos reales (migrar a
   MaterialCommunityIcons) de contenido elegido por el usuario (dejar
   igual).
4. **Portfolio web** — actualizar las tarjetas de proyecto si algún
   acento cambió desde la última vez que se tocó.
5. **Radios/spacing en Vaulta, Veya, Vellum, Velody** — solo Varo y
   VaultGaming recibieron el barrido completo de `radius`/`iconSize`; el
   resto se quedó con lo que ya tenían (no era el foco de esa sesión).

## Siguiente paso opcional

Si esto prueba valer la pena después de migrar 2-3 apps, se puede
convertir en un workspace real (pnpm) con `@hector/brand-kit` como
dependencia instalable en vez de copiar archivos — evita que los tokens
se desincronicen entre repos.
