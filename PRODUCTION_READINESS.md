# PRODUCTION READINESS — Checklist de módulos @STUB

> **Para el equipo:** Este documento cataloga TODOS los módulos que actualmente son dummy, stub, o placeholder.
> Son las piezas que faltan para que la app sea un producto real, más allá de "verse bonita".
>
> Busca `@STUB` en el código para encontrar cada uno directamente en su fichero.
>
> **Última actualización:** 2026-04-15 — v0.7.0

---

## Cómo leer este documento

Cada módulo tiene:
- **Fichero** — ruta al módulo
- **Estado** — qué hace actualmente (DUMMY, PARTIAL, o CODE READY)
- **Qué falta** — qué hay que implementar
- **Prioridad** — P0 (bloquea lanzamiento), P1 (necesario pronto), P2 (mejora), P3 (nice to have)
- **Esfuerzo** — estimación aproximada
- **Depende de** — decisiones o recursos externos necesarios

---

## 🔴 P0 — Bloquean el lanzamiento (deben estar resueltos antes de usuarios reales)

### 1. Firebase Config — Credenciales hardcodeadas
| | |
|---|---|
| **Fichero** | `web/src/features/firebase/app.js` |
| **Estado** | FUNCIONAL pero INSEGURO — API keys en el código fuente |
| **Qué falta** | Mover config a env vars (`VITE_FIREBASE_*`) leyendo de `config/env.js` |
| **Esfuerzo** | 30 min |
| **Depende de** | Nada — es refactoring puro |

### 2. Cloud Functions — Secrets no configurados
| | |
|---|---|
| **Fichero** | `functions/index.js` |
| **Estado** | CÓDIGO COMPLETO pero NO DESPLEGADO |
| **Qué falta** | Configurar 3 secrets de Lemon Squeezy + deploy + webhook URL en dashboard LS |
| **Esfuerzo** | 1h — seguir `LEMON_SQUEEZY_SETUP.md` |
| **Depende de** | Cuenta Lemon Squeezy con producto/plan creado |

### 3. Persistencia de generaciones — Solo localStorage
| | |
|---|---|
| **Fichero** | `web/src/services/adapters/local.js` (ACTIVO) |
| **Stubs** | `web/src/services/adapters/firebase.js`, `web/src/services/adapters/supabase.js` |
| **Estado** | FUNCIONAL TEMPORAL — datos en localStorage (~5MB, sin backup, sin multi-dispositivo) |
| **Qué falta** | Implementar adapter Firebase (o Supabase) con CRUD real + cambiar 1 línea en `services/index.js` |
| **Esfuerzo** | 4h |
| **Depende de** | Decisión: ¿Firebase Firestore o Supabase? (Firebase ya está configurado para auth) |

### 4. Viral Share Loop — Solo mismo navegador
| | |
|---|---|
| **Fichero** | `web/src/services/sharedGenerations.js` |
| **Estado** | FUNCIONAL TEMPORAL — localStorage, imposible compartir entre dispositivos |
| **Qué falta** | Migrar a Firestore + Firebase Storage para fotos. Collection: `sharedGenerations/{shareId}` |
| **Esfuerzo** | 6h |
| **Depende de** | Firebase Storage configurado + Firestore rules actualizadas |

### 5. Revenue Tracking — Sin monitoreo de pagos
| | |
|---|---|
| **Fichero** | `web/src/analytics/providers/revenue.js` |
| **Estado** | DUMMY — console.debug, ningún dato de pagos se registra |
| **Qué falta** | Integrar SDK real (RevenueCat, Adapty, o solo Lemon Squeezy dashboard) |
| **Esfuerzo** | 3h |
| **Depende de** | Plataforma de revenue seleccionada + pagos operativos |

### 6. User Analytics — Sin visibilidad de comportamiento
| | |
|---|---|
| **Fichero** | `web/src/analytics/providers/userAnalytics.js` |
| **Estado** | DUMMY — console.debug, ningún dato sale del navegador |
| **Qué falta** | Instalar SDK (PostHog, Mixpanel, o Amplitude) + reemplazar init/track/identify |
| **Esfuerzo** | 2h |
| **Depende de** | Plataforma de analytics seleccionada + account/API key |

### 7. Test Panel — Riesgo de seguridad si se despliega
| | |
|---|---|
| **Fichero** | `web/src/features/firebase/testPanel.jsx` |
| **Estado** | DEV TOOL — botón flotante que expone la API a cualquiera |
| **Qué falta** | Eliminar fichero + quitar import/uso de `DashboardPage.jsx` |
| **Esfuerzo** | 5 min |
| **Depende de** | Nada |

### 8. DEMO_MODE — Desactivar antes de producción
| | |
|---|---|
| **Fichero** | `web/src/config/featureFlags.js` |
| **Estado** | DEMO_MODE = true → auth mock, API mock, sin paywall real |
| **Qué falta** | Cambiar `enabled: false` o setear `VITE_FF_DEMO_MODE=false` en `.env` |
| **Esfuerzo** | 1 min |
| **Depende de** | Todos los P0 anteriores completados |

---

## 🟡 P1 — Necesarios a corto plazo

### 9. MMP / Attribution — Sin tracking de campañas
| | |
|---|---|
| **Fichero** | `web/src/analytics/providers/attribution.js` |
| **Estado** | DUMMY — no hay SDK de atribución |
| **Qué falta** | Integrar AppsFlyer, Adjust, o Branch para install attribution + deferred deep links |
| **Esfuerzo** | 2h |
| **Depende de** | Plataforma MMP seleccionada + campañas de adquisición planificadas |

### 10. Deep Linking — Solo UTM básico
| | |
|---|---|
| **Fichero** | `web/src/analytics/deeplink.js` |
| **Estado** | PARCIAL — UTM parsing funciona; deferred deep links son no-op |
| **Qué falta** | Callback desde el SDK MMP para inyectar datos resueltos |
| **Esfuerzo** | 1h (una vez el MMP está integrado) |
| **Depende de** | #9 completado |

### 11. Email Waitlist — Leads se pierden
| | |
|---|---|
| **Fichero** | `web/src/pages/Landing/sections/FinalCTA.jsx` |
| **Estado** | DUMMY — muestra "You're on the list!" pero el email NO se guarda en ningún sitio |
| **Qué falta** | POST a Firestore collection, Mailchimp API, Resend, o cualquier servicio |
| **Esfuerzo** | 1h |
| **Depende de** | Decisión de email marketing platform |

### 12. Imágenes placeholder — App se ve fake
| | |
|---|---|
| **Fichero** | `web/src/assets/manifest.js` |
| **Estado** | DUMMY — 28 imágenes placeholder, 0 finales |
| **Qué falta** | Fotos reales de celebrities (con licencia), fotos de ejemplo de usuarios, imágenes de brackets |
| **Esfuerzo** | 4h+ (sourcing, resize, optimización, actualizar manifest) |
| **Depende de** | Equipo de diseño/contenido; licencias de imágenes |

---

## 🟢 P2 — Mejoras para calidad de producto

### 13. A/B Testing — Sin capacidad de experimentación
| | |
|---|---|
| **Fichero** | `web/src/analytics/providers/experiments.js` |
| **Estado** | DUMMY — `getVariant()` siempre devuelve fallback |
| **Qué falta** | Integrar GrowthBook, LaunchDarkly, o Firebase A/B |
| **Esfuerzo** | 4h |
| **Depende de** | Plataforma seleccionada + estrategia de experimentos definida |

### 14. Stats Bar — Métricas falsas
| | |
|---|---|
| **Fichero** | `web/src/pages/Landing/sections/StatsBar.jsx` |
| **Estado** | DUMMY — "12M+ Users", "500M+ Photos" son inventados |
| **Qué falta** | Métricas reales desde backend o analytics |
| **Esfuerzo** | 1h |
| **Depende de** | Backend con datos reales o analytics operativo |

### 15. Reviews — Testimonios fabricados
| | |
|---|---|
| **Fichero** | `web/src/pages/Landing/sections/Reviews.jsx` |
| **Estado** | DUMMY — reviews inventados (Sarah K., James R., etc.) |
| **Qué falta** | Testimonios reales o integración con Trustpilot/App Store reviews |
| **Esfuerzo** | 2h |
| **Depende de** | Usuarios reales que den feedback |

### 16. Marketing Copy — Claims no verificados
| | |
|---|---|
| **Fichero** | `web/src/pages/Landing/sections/HowItWorks.jsx` |
| **Estado** | DUMMY — "4,000 facial points" es marketing copy sin verificar |
| **Qué falta** | Validar claims contra capacidades reales del modelo AI |
| **Esfuerzo** | 1h |
| **Depende de** | Review legal/marketing |

---

## 🔵 P3 — Nice to have / Solo relevante en dev

### 17. API Express Server — Scaffolding no conectado
| | |
|---|---|
| **Fichero** | `api/src/index.js` + `api/src/routes/generations.js` |
| **Estado** | DUMMY COMPLETO — servidor arranca pero no hace nada real |
| **Qué falta** | Decisión arquitectónica: ¿mantener Express API o ir full Firebase? Si se mantiene: DB schema, auth middleware, todas las rutas |
| **Esfuerzo** | 8h+ |
| **Depende de** | Decisión de stack backend |

### 18. Mock Data — Solo para desarrollo
| | |
|---|---|
| **Fichero** | `web/src/demo/mockData.js` |
| **Estado** | DUMMY INTENCIONAL — datos mock para DEMO_MODE |
| **Qué falta** | Nada — se desactiva cuando DEMO_MODE=false |
| **Esfuerzo** | 0h |
| **Depende de** | Nada — mantener para desarrollo |

---

## Resumen ejecutivo

```
┌──────────┬───────┬────────────────────────────────────────────┐
│ Prioridad│ Count │ Qué bloquean                               │
├──────────┼───────┼────────────────────────────────────────────┤
│ 🔴 P0    │   8   │ Pagos, datos, seguridad, analytics mínimo  │
│ 🟡 P1    │   4   │ Campañas, leads, apariencia real            │
│ 🟢 P2    │   4   │ Experimentación, credibilidad, legal        │
│ 🔵 P3    │   2   │ Arquitectura backend, tooling dev           │
└──────────┴───────┴────────────────────────────────────────────┘

Esfuerzo estimado P0:  ~17h
Esfuerzo estimado P1:  ~8h
Esfuerzo estimado P2:  ~8h
Total hasta launch:    ~25h (P0 + P1)
```

---

## Cómo encontrar los @STUB en el código

```bash
# Desde la raíz del proyecto:
grep -rn "@STUB" web/src/ api/src/ functions/ --include="*.js" --include="*.jsx"
```

Cada tag `@STUB` incluye:
- **Status** — qué hace ahora
- **Missing** — qué falta específicamente
- **Priority** — P0/P1/P2/P3
- **Effort** — tiempo estimado
- **Depends** — qué decisiones o recursos externos se necesitan

---

## Decisiones pendientes del equipo

Estas decisiones bloquean múltiples items. Resolverlas primero desbloquea el trabajo:

| # | Decisión | Afecta a | Opciones |
|---|---|---|---|
| D1 | **Backend de persistencia** | #3, #4 | Firebase Firestore (ya en uso para auth) vs Supabase vs PostgreSQL |
| D2 | **Plataforma de analytics** | #6, #14 | PostHog (open source) vs Mixpanel vs Amplitude |
| D3 | **MMP para campañas** | #9, #10 | AppsFlyer vs Adjust vs Branch |
| D4 | **Revenue monitoring** | #5 | RevenueCat vs Adapty vs solo dashboard Lemon Squeezy |
| D5 | **A/B testing** | #13 | GrowthBook (open source) vs LaunchDarkly vs Firebase A/B |
| D6 | **Email marketing** | #11 | Mailchimp vs Resend vs simple Firestore collection |
| D7 | **Backend API** | #17 | ¿Mantener Express API o ir full Firebase Functions? |
