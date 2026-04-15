# CHANGELOG — CELEBS

Historial de cambios por sesión de trabajo. Formato: fecha estimada · commit · descripción.

---

## [Unreleased]

### Mejoras pendientes de commit
- Mejoras de layout en tarjetas `MatchCard` y `LockedCard` (contenido centrado, bottom strip unificado)

---

## [0.6.0] — 2026-04-15 · `65b1318`

### feat: face morph slider, boomerang, paywall tiers, share loop, responsive polish

#### Face Detection & Morphing
- **`features/face/detect.js` v5:** `renderFaceAligned` usa `clamp()` para garantizar que la imagen siempre cubre el canvas 640×640 sin bordes negros. Constantes heurísticas unificadas para usuarios y celebridades (`faceCY = H*0.33, faceH = H*0.40`).
- **`features/face/morph.js` (nuevo):** Triangulación Delaunay con `delaunator` + transformaciones afines + alpha blend para metamorfosis real entre dos caras.
- **`components/MorphSlider` (nuevo):** Slider interactivo de morfado. Extremo izquierdo = foto original, extremo derecho = celebrity lookalike, estado intermedio = mezcla real.
- **`components/MorphBoomerang` (nuevo):** Animación automática tipo boomerang en las tarjetas del dashboard (usuario ↔ celebrity), con pausas en los extremos. Usa `IntersectionObserver` para pausar cuando está fuera del viewport.

#### Paywall — Sistema de dos capas
- **Usuarios no registrados:** todos los matches ocultos excepto el 5º (último), viewer empieza en él.
- **Registrados sin premium + Doppelganger (≥90%):** porcentaje y badge visibles, identidad y morph borrosos. Genera deseo/intriga.
- **`features/auth/PaywallModal.jsx` (nuevo):** Modal premium con planes mensual/anual vía Lemon Squeezy. Se cierra automáticamente cuando la suscripción se activa.
- **`store/appStore.js`:** añadidos `subscription` y `setSubscription`.
- **`main.jsx`:** `initSubscriptionListener` al login; cleanup al logout.
- **`features/firebase/subscriptionService.js` (nuevo):** `onSnapshot` Firestore + `createCheckout` (callable) + `isPremium`.

#### Integración Lemon Squeezy
- **`functions/index.js` (nuevo):** `createCheckoutUrl` (callable autenticada) + `lemonSqueezyWebhook` (HTTP, verificación HMAC-SHA256, actualiza Firestore).
- **`functions/package.json` (nuevo):** `firebase-admin` + `firebase-functions` v2.
- **`firebase.json` + `firestore.rules` (nuevos):** Config Cloud Functions + reglas de suscripción.
- **`LEMON_SQUEEZY_SETUP.md` (nuevo):** Guía paso a paso para configurar la integración.

#### Viral Share Loop
- **`pages/Share/index.jsx` (nuevo):** Página para el destinatario del enlace compartido. Solo selfie (`capture="user"`), sin galería. Muestra quién solicita y por qué. Tras generar, invita a registrarse.
- **`services/sharedGenerations.js` (nuevo):** CRUD en localStorage para solicitudes de compartir (`celebs_shared_v1`). Incluye `getPendingForStep`, `cancelSharedRequest`, etc.
- **`router/index.jsx`:** Añadida ruta `/share/:shareId` (5 rutas total).
- **`DashboardPage.jsx`:** Integración completa del share loop:
  - `SharedGenCard`: tarjeta pendiente ("⏳ Waiting...") y completada ("🎉 Ready!")
  - `ShareLinkModal`: modal con URL compartible y opciones de compartir
  - Badge de notificación "NEW" en cabecera del dashboard
  - `IntranetUploadModal`: botón "🔗 Ask them to send their own selfie" en contextos Camino/Dice
- **`CaminoPage`:** nodo con share pendiente muestra "🔗 SENT" + borde discontinuo; upload local bloqueado; CTA cambia a "Resend Link / Cancel".

#### Selección de match secundario (ResultsPage)
- `allMatches` siempre mantiene orden fijo (sin reordenación al seleccionar).
- `activeIdx` indica qué match se visualiza; la tarjeta activa muestra badge "VIEWING".
- `MatchCard` rediseñado: strip inferior unificado con nombre + rank + botón acción.
- `LockedCard` rediseñado: contenido perfectamente centrado con badges absolutos.
- Cabecera del viewer muestra `"#3 MATCH"` cuando no es el primero.
- `key={celeb.name}` en MorphSlider fuerza remount al cambiar de celebrity.

#### Responsive & Mobile
- Navbar mobile: "Sign Up" / "My Photos" visibles en barra superior junto al hamburger.
- Hero section: 100% viewport width + `100dvh` en todos los breakpoints.
- HeroUpload spotlight: imagen bien centrada en móvil (sin recortes).
- Media queries para tarjetas: 140px (≥600px), 88px (≤480px), 76px (≤380px).
- `ResultsPage` cabe en viewport sin scroll (mobile-first).
- `MoreMatchesRow`: `maxWidth: 640`, `overflowX: auto`, alineado con header.

#### Misc
- **`web/src/config.js` (nuevo):** Flag `DEMO_MODE` para alternar entre mocks y Firebase real.
- **`web/public/models/`:** Pesos de face-api añadidos al repositorio.
- **`web/src/demo/mockData.js` (nuevo):** Datos mock centralizados.

---

## [0.5.0] · `99dfd0a`

### fix: Exclusivity sticky scroll — proper pinning with getBoundingClientRect

- Corrección de la sección sticky: el contenido queda correctamente fijado mientras el usuario hace scroll por ella.

---

## [0.4.0] · `f696641` · `31fc1d8`

### feat: Exclusivity — scroll-driven sticky animation

- Sección "Only 5% find their Doppelganger" con animación scroll-driven.
- Contenido aparece progresivamente; lo relevante queda fijado en el centro.
- La sección siguiente "se desliza sobre" la anterior (no scroll convencional).
- Indicador lateral para seguir haciendo scroll durante la sección.

---

## [0.3.0] · `357844d`

### feat(dashboard): Camino a la Fama + Gang Reveal + stats

- 13 nodos, 3 eventos especiales (Family Portrait, Party Started, Celebrity Gang).
- Animación de revelación grupal (`GangReveal`).
- Estadísticas discretas en el dashboard.

---

## [0.2.0] · `1287d4a` · `4ff104b`

### feat: spotlight captive CTA + DiceCard

- **Spotlight:** tras detectar cara, sombrea la página excepto el recuadro de foto + CTA "Find My Doppelganger".
- **DiceCard:** animación de dado + banner "Time to Upload a picture of…".

---

## [0.1.1] · `4ff104b`

### docs: CLAUDE.md updated for v0.1.0 refactor

---

## [0.1.0] · `739891e`

### refactor: complete code restructure

- Migración de monolito a monorepo (`web/`, `api/`).
- React Router v7, Zustand, design tokens.
- Separación `pages/` (wrappers delgados) + `*Page.jsx` (lógica pesada).
- Capa de servicios intercambiable (`services/adapters/`).

---

## [0.0.1] · `aa17d32`

### feat: initial commit — CELEBS interactive prototype

- Prototipo inicial: subida de foto, detección de cara básica, resultados mock.
