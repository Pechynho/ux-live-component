# Fork: symfony/ux-live-component

Fork repozitáře `symfony/ux-live-component` (read-only subtree split z `symfony/ux` monorepa).

**Upstream:** `symfony/ux-live-component` branch `3.x`
**Origin:** `Pechynho/ux-live-component` branch `3.x`
**Upstream sync:** `.github/workflows/sync-upstream.yml` — GitHub Actions workflow, denně v 06:00 UTC merguje commity z upstreamu. Při konfliktu vytvoří PR.
**Composer:** `"symfony/ux-live-component": "dev-3.x"` — vždy poslední stav forku.
**Changelog forku:** `CHANGELOG-FORK.md` (upstream změny zůstávají v `CHANGELOG.md`). Při release bumpni patch verzi v `assets/package.json` (`x.y.z-pechynho`) a doplň entry.

**Symfony UX 3.x:** vyžaduje PHP 8.4 a Symfony 7.4.

## Účel forku

Rozšíření TypeScript části live components o funkce, které upstream neposkytuje:

- Možnost odeslat standalone request na live action a dostat zpět raw `Response` (bez re-renderu)
- Rozšíření hooků o `controls` objekty pro řízení chování (abort requestu, reset loading stavu při chybě)
- Exportované TypeScript typy pro jednotlivé hook callbacky
- Standalone build setup (upstream buildí v monorepu, tady máme vlastní `tsup.config.mjs`)

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

### 6. Fix `data-live-preserve` při změně ID rodičovského elementu

**Soubor:** `assets/src/morphdom.ts`

Oprava bugu, kdy elementy s `data-live-preserve` ztratily svůj DOM stav (event listenery, JS stav apod.), pokud se u libovolného nadřazeného elementu změnilo `id` mezi re-rendery. Příčina: `innerHTML` swap v `beforeNodeMorphed` callbacku obcházel Idiomorph callbacky, takže preserved elementy byly tiše nahrazeny čerstvě naparsovanými nody.

Po `innerHTML` swapu se nyní obnoví preserved elementy, které byly uvnitř postiženého rodičovského elementu — nový placeholder se najde podle ID, synchronizují se atributy a nahradí se originálním elementem. Na obnovený element se po dokončení morphu dispatchne event `live:preserve-restored`. ID v selektorech se escapují přes `CSS.escape()`.

Upstream (od 3.5) obaluje celé tělo `executeMorphdom()` do `try/finally` (dočasné vracení serverových ID u externě změněných elementů) — custom kód je uvnitř toho bloku. Bug s `innerHTML` swapem upstream k 3.5.1 stále má.

### 6b. `data-skip-morph` — potomci se nefingerprintují

**Soubor:** `assets/src/Component/plugins/ChildComponentPlugin.ts`

Child komponenty uvnitř elementu s `data-skip-morph` (relativně k rodičovské komponentě) se neposílají v `children` fingerprintech. Jejich obsah se stejně zahodí `innerHTML` swapem, takže server je musí vyrenderovat celé místo toho, aby vrátil prázdný `data-live-preserve` placeholder.

### 6c. Drobné typové opravy (kvůli `strict` tsconfigu)

- `assets/src/Component/plugins/PageUnloadingPlugin.ts` — callback `render:started` má 2. argument `BackendResponse` (upstream tam má chybně `Response`; projeví se až díky custom typování hooku v `ComponentHooks`)
- `assets/src/dom_utils.ts` — cast `element.dataset.value as string`

### 7. Fix LiveUrl `history.replaceState` po navigaci (race)

**Soubory:** `assets/src/Component/index.ts` (metoda `performRequest()` + module-level `navigationEpoch`), test `assets/test/unit/controller/live-url-navigation.test.ts`

Oprava race condition: pokud live response (hlavička `X-Live-Url`) doletěla během navigace nebo po ní (Turbo visit, history back/forward), bezpodmínečný `history.replaceState` přepsal URL history entry **cílové** stránky na URL stránky původní.

Invariant: LiveUrl update je platný jen tehdy, když history entry v momentě response je tatáž jako v momentě odeslání requestu. Implementace:
- Module-level čítač `navigationEpoch` inkrementovaný na eventy `popstate` a `turbo:visit` (listenery na `window`; Turbo se neimportuje — v aplikaci bez Turba event nikdy nevystřelí a chování se nemění).
- `performRequest()` si při odeslání zapamatuje aktuální epochu; pokud se při response liší, `history.replaceState` se přeskočí.
- Navíc se přeskočí i při `this.element.isConnected === false` (stale response po výměně DOM, kterou eventy nepokryjí).

Když guard nepustí, přeskočí se POUZE `history.replaceState` — zbytek zpracování response (re-render, resolve promise) běží beze změny.

Pozor: guard záměrně **neporovnává pathname/URL** — legitimní LiveUrl může měnit i pathname (`UrlMapping(mapPath: true)`) a sibling komponenta může změnit pathname přes vlastní LiveUrl update, zatímco jiná komponenta má request in-flight.

### 8. Upstream sync (GitHub Actions)

**Soubor:** `.github/workflows/sync-upstream.yml`

GitHub Actions workflow, který běží denně v 06:00 UTC (a lze spustit ručně):
- Stáhne commity z `symfony/ux-live-component:3.x` a provede merge
- Konflikty v `assets/dist/` a `.github/` se řeší automaticky (dist se přebuildí, upstream .github soubory se smažou)
- Po merge automaticky spustí `yarn install && yarn build` a commitne nový dist
- Pokud merge selže kvůli konfliktu ve **zdrojových souborech** (`.ts`, `.php`, …), force-pushne větev `upstream-sync` (s konfliktními markery) a vytvoří PR k manuálnímu řešení. Když PR vytvořit nejde, run **selže** (dřív zůstal zelený a sync měsíce stál bez povšimnutí). Vyžaduje v repu zapnuté *Settings → Actions → General → Allow GitHub Actions to create and approve pull requests*.
- Pokud víc než 10 souborů konfliktuje jako add/add, run selže s chybou — viz níže

#### Přepsaná historie upstreamu

Upstream subtree split občas přegeneruje historii větve `3.x` (nové SHA, stejný obsah — stalo se mezi 3.1.0 a 3.5.1). Merge-base pak spadne na prastarý commit a skoro každý soubor konfliktuje jako add/add. Ruční postup:

```bash
git fetch upstream
# poslední upstream commit, který už máme mergnutý (2. rodič posledního upstream merge)
OLD=<sha>
# jeho přepsaný protějšek v upstream/3.x — stejná zpráva, strom musí být identický
NEW=$(git log upstream/3.x --format=%H --grep="$(git log -1 --format=%s $OLD)" -F | head -1)
git diff --stat $OLD $NEW          # musí být prázdné
git merge -s ours $NEW -m "Merge upstream <verze> (rewritten history, identical tree)"
git merge upstream/3.x             # teď už s normálním merge-base
```

Pak vyřešit konflikty, přebuildit `dist`, bumpnout verzi a doplnit `CHANGELOG-FORK.md`.
- Nesynkuje upstream tagy (obsahují workflow soubory, které `GITHUB_TOKEN` nemůže pushovat)
- Fork nepoužívá vlastní tagy — v composeru se odkazuje přes `dev-3.x`

## Build

Upstream buildí assets v monorepu `symfony/ux` přes `bin/build_package.ts`. Tady máme standalone build:

**Soubory:**
- `assets/tsup.config.mjs` — konfigurace tsup bundleru
- `assets/tsconfig.json` — standalone tsconfig (upstream odkazoval na monorepo `tsconfig.package.json`; nastavení `strict`, `strictPropertyInitialization: false`, `noUnusedLocals`, target ES2022 odpovídají upstreamu). Typecheck: `npx tsc --noEmit -p .` (z `assets/`) musí projít bez chyb.
- `assets/vitest.config.mjs` — standalone vitest config (upstream mergoval base config z monorepa)
- `assets/test/setup.js` — kopie monorepo `test/setup.js` (jest-dom matchery)
- `Makefile` — make targety

**Příkazy:** `yarn` (v1) nemusí být v PATH — Makefile pak použije `npx -y yarn@1` (ručně stejně).

```bash
# Přes Makefile (z rootu)
make assets-install   # yarn install
make assets-build     # yarn install + yarn build
make assets-test      # yarn install + unit testy (vitest)
make assets-clean     # smaže node_modules a dist

# Přímo (z assets/)
cd assets
yarn install
yarn build
yarn test:unit        # unit testy (vitest --run)
```

Browser testy (`test:browser`, Playwright) standalone nefungují — vyžadují setup z monorepa.

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
| `assets/tsup.config.mjs` | Build konfigurace |
| `.github/workflows/sync-upstream.yml` | GitHub Actions sync z upstreamu |
