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

## Colores por app

Regla: **un solo hex por nombre de color en todo el sistema.** Antes cada
app inventaba su propio "amarillo" o "morado" y terminábamos con 3
amarillos (`#F5A623`, `#D9A441`, `#EAB308`) y 2 morados (`#7B6BF5`,
`#7C5CFF`) casi idénticos entre sí — puro ruido, ninguna diferencia
intencional. Ahora cada app solo referencia `hues.<nombre>` en
`tokens.ts`; no se puede colar un casi-duplicado nuevo.

| App | Dominio | Primary | Accent | Estado |
|---|---|---|---|---|
| Vaulta | fotos privadas | `#2BD4CE` teal | `#7B6BF5` morado | sin cambios |
| Veya | pelis/series/anime | `#7B6BF5` morado | `#2BD4CE` teal | **antes tenía su propio morado/teal ligeramente distintos — ahora es literalmente el mismo dúo que Vaulta, en espejo** |
| Vellum | lector con streaks | `#4A7DB8` azul apagado | `#F5A623` ámbar | accent antes era un dorado propio (`#D9A441`) → ahora el ámbar único del sistema |
| Velody | descarga de música | `#F97316` naranja | `#F5A623` ámbar | accent antes era su propio ámbar (`#EAB308`) → unificado |
| **VaultGaming** | backlog/deals de juegos | `#EF4360` frambuesa | `#F5A623` ámbar | primary **nuevo** (antes gris/verde default de Tailwind, sin decisión de marca) |
| **Varo** | metas de ahorro | `#2FBF71` verde | `#4C8DFF` azul | primary **nuevo** (antes el verde era solo semántico "success", sin marca propia) |

**Sobre el rojo:** `VaultGaming` usa frambuesa (`#EF4360`), no el mismo
rojo que `semantic.danger` (`#E5484D`). Es la única excepción a "un color,
un hex" — a propósito: si el color de marca de una app fuera idéntico al
rojo de "error", cualquier botón de eliminar en cualquier app se leería
como si fuera de la marca de VaultGaming. Si prefieres que sí sean
exactamente el mismo rojo, es un solo valor que cambiar en `hues.raspberry`.

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
   `fontFamily.mono` donde antes había texto plano en headers/labels.
5. Repite para el resto — recomendado en este orden: **Varo →
   VaultGaming** (las que no tienen marca hoy, mayor impacto) → Vaulta →
   Veya → Vellum → Velody (ya tienen buena identidad, solo ganan
   estructura + tipografía + motion).

## Siguiente paso opcional

Si esto prueba valer la pena después de migrar 2-3 apps, se puede
convertir en un workspace real (pnpm) con `@hector/brand-kit` como
dependencia instalable en vez de copiar archivos — evita que los tokens
se desincronicen entre repos.
