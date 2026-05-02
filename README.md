# v2

Runtime público de la nueva app en Lit.

## Stack

- Lit
- Vite
- TypeScript
- TailwindCSS v4
- HeroUI styles (`@heroui/styles`)
- Supabase (`@supabase/supabase-js`)

## Qué hace ahora

La app `v2` consume directamente una RPC pública de Supabase usando este flujo:

- `get_public_slide_runtime()`
- obtiene `versionId`
- obtiene `document`
- transforma `document.subjects` a índices, subsecciones, decks y slides

No existe contenido local de respaldo ni JSON demo en el frontend.

## Variables de entorno

Crea `/Users/pedrojose/Trabajo/diapositivas-clases-v2/v2/.env` a partir de `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
VITE_SUPABASE_RUNTIME_RPC=get_public_slide_runtime
```

## Contrato esperado de la RPC

La app espera que `get_public_slide_runtime()` devuelva algo con esta forma:

```ts
{
  versionId: string;
  document: {
    subjects: Subject[];
  };
}
```

Donde `document.subjects` mantiene tu estructura editorial real con:

- `subjects`
- `sections`
- `subsections`
- `decks`
- `slides`

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
```

## Convenciones de CSS

Las clases siguen una variante de BEM con prefijos por dominio. Evita clases
globales sin prefijo y no mezcles prefijos en un mismo componente.

| Prefijo | Qué agrupa |
| --- | --- |
| `app-*` | Chrome global (botones, estados de carga y error en `app-root`). |
| `footer`, `footer__*` | Pie de página de la shell. |
| `index-*`, `index-link-row`, `index-list` | Superficies del índice de contenido (`content-index`, `index-frame`). |
| `slide-*` | Bloque/elemento/modificador de las plantillas de slide y sus bloques (`slide-card`, `slide-card__avatar`, `slide-card--presentation`). |
| `slide-motion-shell`, `slide-motion-shell--<phase>`, `slide-motion-shell--<direction>` | Capa que pinta fase y dirección de las animaciones de entrada/salida selectivas. |
| `magicbox`, `magicbox__*` | Subárbol del panel "magic box". |
| `media-lightbox*` | Dialog de lightbox de imágenes. |
| `motion-auto-size*` | Contenedor que anima el cambio de altura entre snapshots. |
| `theme-accent*` | Hooks para inyectar color de acento del tema. |
| `v2-richtext` | Scope del HTML generado al renderizar markdown sanitizado. |
| `sr-only` | Utilidad estándar "screen reader only". |

Guías rápidas:

- Un componente Lit usa su propio prefijo BEM para todo lo suyo (`slide-card`,
  `slide-card__content`, `slide-card--presentation`). No reutilices clases de
  otro dominio desde dentro de un template.
- Los modificadores se escriben con `--` (`slide-motion-shell--enter`).
  Los elementos con `__` (`slide-card__avatar`).
- Tailwind v4 se usa para utilidades de layout puntuales (`flex`, `gap-*`) pero
  el sistema principal sigue siendo el CSS autorial por bloque, no utility-first.
- Las animaciones inyectan su estado por clase (`slide-motion-shell--<phase>`),
  no por estilo inline, para que las transiciones CSS se puedan inspeccionar
  desde devtools.

## Logs en desarrollo

Las trazas de depuración van siempre a través de
[`src/lib/dev-log.ts`](src/lib/dev-log.ts):

```ts
import {devDebug, devWarn} from './lib/dev-log';

devDebug('slide-transition', {from, to, mode});
devWarn('assets', `slug vacío para name="${name}"`);
```

Los wrappers cortocircuitan en `import.meta.env.DEV === false`, así que el
build de producción no emite logs. No uses `console.debug` / `console.warn`
directamente fuera de estos helpers.

