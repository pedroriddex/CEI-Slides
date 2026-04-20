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
