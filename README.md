# Celebs — Celebrity Doppelganger Platform

Aplicación web que detecta la cara del usuario y la compara con una base de celebridades.

---

## Arquitectura del proyecto

```
celebs-preview/
  ├── web/          # Frontend — React 19 + Vite 8
  └── api/          # Backend — Express 5 (actualmente stub)
```

### Frontend (`web/`)

```
web/src/
  ├── design/           ← Única fuente de verdad visual
  │   ├── tokens.js         Colores, fuentes, radios, sombras
  │   └── globalStyles.js   CSS global (animaciones, media queries)
  │
  ├── components/       ← Componentes UI reutilizables (sin lógica de negocio)
  │   ├── Logo/
  │   ├── Button/
  │   ├── PolaroidCard/
  │   ├── Stars/
  │   ├── Counter/
  │   ├── Marquee/
  │   ├── HeroUpload/
  │   ├── ScanningVisual/
  │   └── ResultPreview/
  │
  ├── pages/            ← Una carpeta por página / ruta
  │   ├── Landing/
  │   │   └── sections/ ← Cada sección de la landing en su propio archivo
  │   ├── Analyzing/
  │   ├── Results/
  │   └── Dashboard/
  │
  ├── features/         ← Lógica de negocio independiente de UI
  │   └── face/
  │       └── detect.js     Detección y recorte facial (face-api.js)
  │
  ├── services/         ← CAPA DE BACKEND (swappable)
  │   ├── index.js          ← CAMBIAR AQUÍ para cambiar de backend
  │   └── adapters/
  │       ├── local.js      localStorage (activo ahora)
  │       ├── supabase.js   stub listo para implementar
  │       └── firebase.js   stub listo para implementar
  │
  ├── store/
  │   └── appStore.js   Estado global (Zustand)
  │
  ├── hooks/
  │   └── useInView.js  Intersection Observer hook
  │
  └── router/
      └── index.jsx     Rutas (React Router v7)
```

### Backend (`api/`)

```
api/src/
  ├── index.js          Servidor Express + middlewares
  └── routes/
      ├── health.js     GET /api/health
      └── generations.js CRUD /api/generations (stub)
```

---

## Comandos

```bash
# Desarrollo (solo frontend, con backend local/localStorage)
npm run dev

# Desarrollo con API Express también activa
npm run dev:all

# Compilar para producción
npm run build

# Solo API
npm run dev:api
```

Todo se ejecuta desde la raíz del proyecto.

---

## Cómo cambiar el backend

### Opción A — Supabase

1. En `web/src/services/index.js`, cambiar:
   ```js
   // de:
   export { ... } from "./adapters/local.js";
   // a:
   export { ... } from "./adapters/supabase.js";
   ```
2. Implementar las funciones en `adapters/supabase.js` (están como stubs).
3. Añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` a `web/.env`.

### Opción B — API REST propia (Express)

1. Crear `web/src/services/adapters/api.js` que llame a `http://localhost:3001/api/...`
2. Cambiar la exportación en `services/index.js`.
3. Implementar las rutas reales en `api/src/routes/`.

### Opción C — Firebase

Igual que Supabase pero usando `adapters/firebase.js`.

---

## Cómo añadir una nueva sección a la Landing

1. Crear `web/src/pages/Landing/sections/MiSeccion.jsx`
2. Importarla y añadirla en `web/src/pages/Landing/index.jsx`

## Cómo cambiar colores / fuentes

Editar únicamente `web/src/design/tokens.js`.

## Cómo añadir una nueva página

1. Crear `web/src/pages/MiPagina/index.jsx`
2. Añadir la ruta en `web/src/router/index.jsx`

---

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend framework | React 19 | Estándar de industria, ecosistema amplio |
| Build tool | Vite 8 | Más rápido en dev, fácil de cambiar a Rollup/esbuild |
| Routing | React Router v7 | Estándar, soporta SSR cuando sea necesario |
| Estado global | Zustand | Mínimo boilerplate, fácil de entender para devs |
| Backend stub | Express 5 | Sin magia, fácil de reemplazar o extender |
| Estilos | Inline styles + design tokens | Sin dependencias extra, tokens centralizados |

---

## Variables de entorno

### Frontend (`web/.env`)
```
# No hay variables requeridas para desarrollo local
# VITE_SUPABASE_URL=...       (cuando se migre a Supabase)
# VITE_API_URL=http://localhost:3001  (cuando se use la API Express)
```

### Backend (`api/.env`)
```
PORT=3001
CORS_ORIGIN=http://localhost:5173
# Ver api/.env.example para todas las opciones
```
