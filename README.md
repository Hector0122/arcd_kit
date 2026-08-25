# arcd_kit

Base común para Varo, VaultGaming, Vaulta, Vellum, Veya y Velody — mismos neutros, tipografía y motion; color de marca propio por app. Hoy es un **starter kit para copiar** (`tokens.ts` + `fonts/` se copian dentro de cada repo y se adaptan mínimamente), con el plan de convertirse en una librería instalable vía `package.json` (`@hector/arcd_kit`) una vez que valga la pena el salto. **En proceso.**

> Abre `preview.html` directo en el navegador (sin servidor, sin build) para ver la guía visual: neutros, tipografía, motion y la paleta de cada app.

## Filosofía: familia, no clonación

Estas 6 apps resuelven problemas distintos (finanzas, gaming, fotos, lectura, streaming, música). Ponerles el mismo color primario a todas mataría la identidad de cada una. Lo que sí es idéntico es la **estructura**: la misma rampa de grises, el mismo spacing, los mismos radios, la misma tipografía y — sobre todo — el mismo motion. Lo único que varía por app es `primary`/`accent`.

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

- **Archivo Black** (`display`) — titulares grandes, empty states, números "hero". 1-2 veces por pantalla, nunca en párrafos.
- **IBM Plex Mono** (`mono`) — labels, cifras, timestamps, badges, nav.
- **Body** — se queda en la fuente del sistema (San Francisco / Roboto) a propósito; ni Archivo Black ni un mono son legibles en párrafos largos (crítico en Vellum).

Mismo patrón que el portfolio web, para que ambos se sientan de la misma marca.

| App | Dónde |
|---|---|
| Varo | wordmark "Varo" (Login), labels/cifras de `SummaryCard`, headers |
| VaultGaming | wordmark "GameVault" (Login), headers |
| Vaulta | 5 cifras de estadísticas en Profile (logo es SVG aparte) |
| Veya | wordmark "VEYA" (Login), labels de la tab bar |
| Vellum | wordmark "Vellum" (SignIn/SignUp) |
| Velody | wordmark con gradiente, `font-mono-brand` (BPM, timestamps) — CSS/Tailwind v4, no linking nativo |

## Spacing & radios

Grid de 4pt: `12 · 16 · 20 · 24 · 32 · 40 · 64`. Radios: `xs · sm · md · lg · xl · pill`. Sin esta escala cada pantalla improvisaba el padding/redondeado a ojo — es lo que más empareja el conjunto visualmente incluso antes de tocar color de marca.

## Botones

Componente `Button` propio (`Button.tsx`, copiar a cada app) — el `Button` nativo de RN no acepta `borderRadius`/`padding` y se ve distinto por plataforma. Fija:

- **Radio:** `radius.sm` (10), mismo valor en las 6 apps.
- **Curva:** `borderCurve: 'continuous'` (superelipse de iOS; no-op en Android).
- **Variantes:** `primary` (relleno de marca, default), `danger` (destructivo), `ghost` (sin relleno).

Migración: copia `Button.tsx` a `src/components/` y reemplaza `<Button title=... onPress=... />` de RN por la versión con `variant=...`. Lee `colors.primary`/`colors.danger`/`colors.textSecondary` de `tokens.ts` — ajusta esas líneas si tu `colors.ts` no expone esos nombres todavía.

## Motion

| Token | Duración | Uso |
|---|---|---|
| `instant` | 100ms | checkbox, toggle |
| `fast` | 150ms | hover, tabs |
| `base` | 220ms | modal, card |
| `slow` | 350ms | pantalla completa |
| `deliberate` | 500ms | onboarding, hero |

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

Para feedback de tap usa `motion.spring.press` con `withSpring` (así lo hace `Button.tsx`). Requiere `react-native-reanimated` + `react-native-reanimated/plugin` en `babel.config.js` (último de la lista) y New Architecture activada.

## Iconos

**Estándar:** `react-native-vector-icons` (v10.3.0) con el set **`MaterialCommunityIcons`** (~7,000 iconos) en las 6 apps. Un emoji es un glifo a color fijo del sistema — no obedece `color`, así que un tab activo pintado con emoji no se tiñe del color de marca; un icono vectorial sí.

```ts
export const iconSize = {
  sm: 18, // secundario / inline junto a texto pequeño
  md: 22, // default — tabs, headers, botones de acción
  lg: 28, // avatares chicos, iconos destacados
  xl: 48, // empty states / hero
} as const;
```

**Enlazar la fuente nativa (una vez por app):**

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
- Recompilar (`npm run android` / `npm run ios`) — Metro/Fast Refresh no recoge fuentes nativas nuevas.

**Integrar las fuentes de marca (Archivo Black / IBM Plex Mono) en cada app RN:**

Con Expo:
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

Con bare React Native: copia los `.ttf` de `fonts/` a `<app>/assets/fonts/`, agrega `react-native.config.js` (`assets: ['./assets/fonts']`), corre `npx react-native-asset` y recompila (`pod install` en iOS).

## Colores por app

Regla: un solo hex por nombre de color en todo el sistema, sin excepciones — cada app referencia `hues.<nombre>` en `tokens.ts`, nunca inventa un casi-duplicado nuevo.

| App | Dominio | Primary | Accent |
|---|---|---|---|
| Varo | metas de ahorro | `#2FBF71` verde | `#4C8DFF` azul |
| VaultGaming | backlog/deals de juegos | `#E5484D` rojo | `#F5A623` ámbar |
| Vaulta | fotos privadas | `#2BD4CE` teal | `#7B6BF5` morado |
| Veya | pelis/series/anime | `#7B6BF5` morado | `#2BD4CE` teal |
| Vellum | lector con streaks | `#4A7DB8` azul apagado | `#F5A623` ámbar |
| Velody | separación de stems / música | `#3B82F6` azul | `#7B6BF5` morado |

## Cómo migrar una app

1. Copia `tokens.ts` a `<app>/src/theme/tokens.ts`.
2. En `theme/colors.ts`, reemplaza los colores estáticos por:
   ```ts
   import { createAppTheme, brands } from './tokens';
   export const { light: lightColors, dark: darkColors } = createAppTheme(brands.<app>);
   ```
3. Revisa los usos de color en pantallas: los de **estado** (progreso ok/riesgo) van a `success/danger/warning`; los de **marca** (botón principal, header, tab activo) van a `primary`/`accent`.
4. Vincula las fuentes (ver `## Tipografía` / `## Iconos`) y aplica `type.display`/`fontFamily.mono` donde antes había texto plano en headers/labels.
5. Migra iconos a `MaterialCommunityIcons` y botones al `Button` compartido (ver secciones arriba).

**Estado:** las 6 apps ya migradas. VaultGaming es dark-only sin `ThemeContext` — ahí `theme/colors.ts` exporta `colors` estático en vez de un hook, no hace falta el patrón `useTheme()` de Varo si tu app tampoco tiene modo claro/oscuro.

## Pendientes

- **iOS:** terminar el linking de fuentes (`npx react-native-asset` o Xcode → *Copy Bundle Resources*) en las 5 apps React Native. Android ya está resuelto; sin forma de probar en iOS por ahora.

## Siguiente paso opcional

Si esto prueba valer la pena después de migrar 2-3 apps, se puede convertir en un workspace real (pnpm) con `@hector/arcd_kit` como dependencia instalable en vez de copiar archivos — evita que los tokens se desincronicen entre repos.

## Mantenimiento de `preview.html`

`preview.html` / `preview.css` / `preview.js` están separados a propósito — el contenido (swatches, chips, paleta) es HTML estático, no un render en el navegador, porque casi no cambia. Si tocas `tokens.ts` (`neutrals`, `spacing`, `radius`, `motion.duration`, `iconSize`), corre esto antes de commitear para que `preview.html` no se desincronice:

```bash
node scripts/sync-preview-data.mjs
```

`BRANDS`/`ICONS` viven hardcodeados dentro del script, no en `preview.html` — mezclan valores reales con contenido editorial (qué app mostrar, qué icono de ejemplo) que no es 1:1 derivable de `tokens.ts`.
