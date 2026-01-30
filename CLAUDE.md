# Fork: symfony/ux-live-component

Fork repozitáře `symfony/ux-live-component` (read-only subtree split z `symfony/ux` monorepa).

**Upstream:** `symfony/ux-live-component` branch `2.x`
**Origin:** `Pechynho/ux-live-component` branch `2.x`
**Pull app:** `.github/pull.yml` — automaticky synchronizuje `2.x` z upstreamu přes merge.

## Účel forku

Rozšíření TypeScript části live components o funkce, které upstream neposkytuje:

- Možnost odeslat standalone request na live action a dostat zpět raw `Response` (bez re-renderu)
- Rozšíření hooků o `controls` objekty pro řízení chování (abort requestu, reset loading stavu při chybě)
- Exportované TypeScript typy pro jednotlivé hook callbacky
- Standalone build setup (upstream buildí v monorepu, tady máme vlastní `tsup.config.ts`)

## Přehled custom změn

Všechny custom úpravy jsou označené komentářem `[CUSTOM]` v kódu.

### 1. `Component.request()` — standalone request bez re-renderu

**Soubor:** `assets/src/Component/index.ts`

Nová veřejná metoda `request(action, args?)` na třídě `Component`. Na rozdíl od `action()`:
- Nepřidává akci do fronty a nespouští re-render
- Vrací `Promise<Response>` (raw fetch Response), ne `Promise<BackendResponse>`
- Volá se přímo a okamžitě

```typescript
const component = await getComponent(element);
const response = await component.request('myAction', { foo: 'bar' });
const data = await response.json();
```

### 2. `request:started` hook — `controls.abortRequest`

**Soubor:** `assets/src/Component/index.ts`, metoda `performRequest()`

Hook `request:started` nyní dostává druhý argument `controls: { abortRequest: boolean }`. Nastavením `abortRequest = true` v hook callbacku se request nepošle. Dirty props a pending actions zůstanou zachovány.

```typescript
component.on('request:started', (requestConfig, controls) => {
    if (shouldPreventRequest()) {
        controls.abortRequest = true;
    }
});
```

### 3. `response:error` hook — `controls.resetLoadingState`

**Soubor:** `assets/src/Component/index.ts`, metoda `performRequest()`

Hook `response:error` má v `controls` nový flag `resetLoadingState` (default `false`). Při chybovém response zůstávaly loading indikátory (spinnery, disabled buttony) aktivní, protože se nevolal `loading.state:finished`. Nastavením `resetLoadingState = true` se loading stav vyčistí.

```typescript
component.on('response:error', (backendResponse, controls) => {
    controls.displayError = false;
    controls.resetLoadingState = true;
});
```

### 4. `render:started` hook — přidán do `ComponentHooks` typu

**Soubor:** `assets/src/Component/index.ts`

Hook `render:started` se v upstreamu používal, ale nebyl v typu `ComponentHooks`. Nyní je typovaný:

```typescript
'render:started': (html: string, backendResponse: BackendResponse, controls: { shouldRender: boolean }) => MaybePromise;
```

### 5. Exportované hook typy

**Soubory:** `assets/src/Component/index.ts`, `assets/src/live_controller.ts`

Convenience typy pro každý hook callback, exportované z package entry pointu:

- `ConnectHook`, `DisconnectHook`
- `RequestStartedHook`, `RenderStartedHook`, `RenderFinishedHook`
- `ResponseErrorHook`
- `LoadingStateStartedHook`, `LoadingStateFinishedHook`
- `ModelSetHook`

```typescript
import type { RequestStartedHook } from '@symfony/ux-live-component';

const myHook: RequestStartedHook = (requestConfig, controls) => {
    // ...
};
component.on('request:started', myHook);
```

### 6. Pull app

**Soubor:** `.github/pull.yml`

Konfigurace pro [Pull app](https://github.com/apps/pull) — automaticky vytváří merge PR z `symfony/ux-live-component:2.x` do `2.x` tohoto forku.

## Build

Upstream buildí assets v monorepu `symfony/ux` přes `bin/build_package.ts`. Tady máme standalone build:

**Soubory:**
- `assets/tsup.config.ts` — konfigurace tsup bundleru
- `assets/tsconfig.json` — standalone tsconfig (upstream odkazoval na monorepo)
- `Makefile` — make targety

**Příkazy:**

```bash
# Přes Makefile (z rootu)
make assets-install   # yarn install
make assets-build     # yarn install + yarn build
make assets-clean     # smaže node_modules a dist

# Přímo (z assets/)
cd assets
yarn install
yarn build
```

**Výstup** (`assets/dist/`):
- `live_controller.js` — bundlovaný ESM, external `@hotwired/stimulus`
- `live_controller.d.ts` — TypeScript deklarace
- `live.min.css` — CSS

**Dist soubory jsou trackované v gitu.** Po každé změně v `assets/src/` je nutné přebuildovat a commitnout `assets/dist/`.

## Klíčové soubory

| Soubor | Popis |
|--------|-------|
| `assets/src/Component/index.ts` | Třída `Component` — hlavní custom změny |
| `assets/src/live_controller.ts` | Stimulus controller + re-exporty typů |
| `assets/src/Backend/Backend.ts` | `BackendInterface` + `Backend` třída |
| `assets/src/Backend/RequestBuilder.ts` | Sestavení URL + fetch options |
| `assets/src/Component/ValueStore.ts` | Správa props (original, dirty, pending) |
| `assets/src/Component/plugins/LoadingPlugin.ts` | Loading state (spinnery, disabled) |
| `assets/tsup.config.ts` | Build konfigurace |
| `.github/pull.yml` | Pull app sync z upstreamu |
