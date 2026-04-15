# Lemon Squeezy — Pasos pendientes para completar la integracion

> **Estado actual**: todo el codigo esta escrito y compila limpio.
> Falta la configuracion externa (dashboard de LS + deploy de functions) para que funcione end-to-end.

---

## Que ya esta hecho (no tocar)

| Componente | Archivo | Que hace |
|---|---|---|
| Firebase Functions | `functions/index.js` | `createCheckoutUrl` (crea checkout autenticado) + `lemonSqueezyWebhook` (recibe eventos de LS, escribe en Firestore) |
| Firestore rules | `firestore.rules` | Users solo leen su propio doc; solo Admin SDK escribe suscripciones |
| Subscription service | `web/src/features/firebase/subscriptionService.js` | Listener en tiempo real de Firestore + helper `createCheckout` + helper `isPremium` |
| Store global | `web/src/store/appStore.js` | Nuevo estado `subscription` + `setSubscription` |
| Auth listener | `web/src/main.jsx` | Conecta listener de Firestore al cambio de usuario |
| PaywallModal | `web/src/features/auth/PaywallModal.jsx` | Modal premium con planes mensual/anual, checkout, estado de espera |
| ResultsPage paywall | `web/src/ResultsPage.jsx` | Blur + overlay para resultados 90%+; cadena auth -> paywall |
| Env templates | `web/.env` + `functions/.env` | Placeholders para rellenar con IDs reales |

---

## PASO 1 — Crear producto en Lemon Squeezy (~5 min)

1. Ve a [app.lemonsqueezy.com](https://app.lemonsqueezy.com) e inicia sesion (o crea cuenta)
2. **Crea una Store** si no tienes una (ej. "Celebs App")
3. Apunta tu **Store ID** — esta en la URL: `https://app.lemonsqueezy.com/stores/XXXXX`
4. Ve a **Products > New Product**
   - Nombre: "Celebs Premium" (o el que quieras)
   - Tipo: **Subscription**
5. Crea **dos variantes** (dos planes de precio):
   - **Monthly**: $4.99/mes (o tu precio), recurrente
   - **Annual**: $29.99/ano (o tu precio), recurrente
6. Apunta el **Variant ID** de cada plan — click en la variante, el ID aparece en la URL o en el panel de detalles

> **Resultado**: tendras 3 numeros: `STORE_ID`, `VARIANT_ID_MONTHLY`, `VARIANT_ID_ANNUAL`

---

## PASO 2 — Generar API Key (~1 min)

1. En Lemon Squeezy, ve a **Settings > API**
2. Click **Create API Key**
3. Nombre: "Firebase Functions"
4. **Copia la key** — solo se muestra una vez

> **Resultado**: tendras `LEMON_SQUEEZY_API_KEY`

---

## PASO 3 — Rellenar variables de entorno (~2 min)

### Frontend (`web/.env`)

```bash
VITE_LS_VARIANT_MONTHLY=<tu_variant_id_mensual>
VITE_LS_VARIANT_ANNUAL=<tu_variant_id_anual>
```

> **Importante**: si cambias los precios, actualiza tambien las etiquetas en `web/src/features/auth/PaywallModal.jsx` (lineas 9-10 donde dice `price: "$4.99"` y `price: "$29.99"`).

### Firebase Functions (`functions/.env`)

```bash
LEMON_SQUEEZY_API_KEY=<tu_api_key_del_paso_2>
LEMON_SQUEEZY_WEBHOOK_SECRET=<lo_obtendras_en_el_paso_5>
LEMON_SQUEEZY_STORE_ID=<tu_store_id_del_paso_1>
```

> El `WEBHOOK_SECRET` se rellena despues del paso 5. De momento dejalo vacio.

---

## PASO 4 — Instalar y desplegar Firebase Functions (~5 min)

```bash
# Desde la raiz del proyecto
cd functions
npm install

# Si no tienes firebase-tools instalado globalmente:
npm install -g firebase-tools

# Login (solo la primera vez)
firebase login

# Asegurate de estar en el proyecto correcto
firebase use celebs-dev

# Configura los secrets en Firebase (alternativa al .env para produccion)
firebase functions:secrets:set LEMON_SQUEEZY_API_KEY
firebase functions:secrets:set LEMON_SQUEEZY_STORE_ID

# Deploy
firebase deploy --only functions,firestore:rules
```

Tras el deploy, Firebase te mostrara las URLs de las funciones. Copia la URL de `lemonSqueezyWebhook`, sera algo como:

```
https://us-central1-celebs-dev.cloudfunctions.net/lemonSqueezyWebhook
```

---

## PASO 5 — Configurar Webhook en Lemon Squeezy (~2 min)

1. En Lemon Squeezy, ve a **Settings > Webhooks > Add Endpoint**
2. **URL**: pega la URL del paso anterior (`https://us-central1-celebs-dev.cloudfunctions.net/lemonSqueezyWebhook`)
3. **Eventos** a suscribir (marca estos 4):
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
4. **Signing Secret**: Lemon Squeezy generara uno. **Copialo**.
5. Vuelve a `functions/.env` y rellena `LEMON_SQUEEZY_WEBHOOK_SECRET=<el_signing_secret>`
6. Re-deploy las functions para que tengan el secret:

```bash
firebase functions:secrets:set LEMON_SQUEEZY_WEBHOOK_SECRET
firebase deploy --only functions
```

---

## PASO 6 — Probar el flujo completo (~10 min)

1. Activa **Test Mode** en el dashboard de Lemon Squeezy (toggle en la esquina superior)
2. Arranca la app en local: `npm run dev` (desde la raiz)
3. Sube una foto — obtendras un resultado con 90%+ (los mocks tienen porcentajes altos)
4. Deberia aparecer el **blur con el overlay "Doppelganger Detected!"**
5. Click en **"Sign Up Free"** — crea una cuenta o usa Google
6. Tras el login, deberia abrirse el **PaywallModal** automaticamente
7. Selecciona un plan y click **"Subscribe Now"**
8. Se abrira una nueva pestana con el checkout de Lemon Squeezy
9. Usa la tarjeta de test: `4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC
10. Completa el pago
11. Lemon Squeezy enviara el webhook a tu Firebase Function
12. La Function escribira en Firestore `users/{uid}.subscription.status = "active"`
13. El listener en la app detectara el cambio y el PaywallModal se cerrara solo
14. El resultado se desbloqueara automaticamente (sin recargar)

### Si algo falla:

- **Webhook no llega**: revisa los logs de Firebase Functions (`firebase functions:log`)
- **Signature mismatch**: verifica que el `WEBHOOK_SECRET` coincide exactamente
- **Checkout no se abre**: verifica que los `VARIANT_ID` en `web/.env` son correctos
- **PaywallModal no se cierra**: verifica en la consola de Firebase que el documento `users/{uid}` tiene `subscription.status: "active"`

---

## PASO 7 — Ir a produccion

1. Desactiva Test Mode en Lemon Squeezy
2. Verifica que los precios son los definitivos
3. Actualiza la URL del webhook si cambias de proyecto Firebase
4. Haz un build de produccion: `npm run build` (desde la raiz)

---

## Arquitectura del flujo (referencia rapida)

```
Usuario sube foto
    |
    v
Resultado >= 90%? ──no──> Muestra resultado libre
    |
   si
    |
    v
Esta logueado? ──no──> AuthModal (sign up / login)
    |                       |
   si                    tras login
    |                       |
    v                       v
Es premium? ──no──> PaywallModal
    |                   |
   si               click "Subscribe"
    |                   |
    v                   v
Resultado          Lemon Squeezy Checkout (nueva pestana)
desbloqueado           |
                    Pago completado
                       |
                       v
                    Webhook -> Firebase Function -> Firestore
                       |
                       v
                    Listener actualiza subscription
                       |
                       v
                    PaywallModal se cierra, resultado visible
```

---

## Archivos clave (por si necesitas modificar algo)

| Que | Donde |
|---|---|
| Precios mostrados en el modal | `web/src/features/auth/PaywallModal.jsx` lineas 9-10 |
| Umbral de "Doppelganger" (actualmente 90%) | `web/src/ResultsPage.jsx` — busca `celeb.pct >= 90` (aparece 3 veces) |
| Logica de que es "premium" | `web/src/features/firebase/subscriptionService.js` funcion `isPremium` |
| Webhook handler | `functions/index.js` funcion `lemonSqueezyWebhook` |
| Checkout creation | `functions/index.js` funcion `createCheckoutUrl` |
| Estado global de suscripcion | `web/src/store/appStore.js` campo `subscription` |
| Listener que conecta Firestore con el store | `web/src/main.jsx` |
