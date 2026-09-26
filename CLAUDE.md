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

Všechny custom úpravy jsou označené komentářem `[CUSTOM]` v kódu. **Každou novou odchylku od upstreamu zapiš do tabulky „Inventář odchylek“ níže (soubor, řádek, co, proč, upstream PR/issue).**

### Inventář odchylek od upstreamu

Řádky platí k verzi `3.5.2-pechynho`; po upstream syncu se můžou posunout. Autoritativní seznam vždy dá:

```bash
grep -rn "\[CUSTOM\]" assets/src assets/test          # všechny označené úpravy
git fetch upstream && git diff upstream/3.x --stat -- . ':!assets/dist' ':!assets/yarn.lock'   # všechny změněné soubory
git diff -U0 upstream/3.x -- assets/src                # přesné hunky
```

| # | Soubor:řádek | Co | Upstream PR / issue | Odstranit, až… |
|---|---|---|---|---|
| 1 | `assets/src/Component/index.ts:241-261` | `Component.request()` (raw `Response`, bez re-renderu) | — (upstream alternativa: [PR #3931](https://github.com/symfony/ux/pull/3931) `LiveResponse::data()`, [#2967](https://github.com/symfony/ux/pull/2967)) | #3931 se mergne a aplikace přejdou na `LiveResponse::data()` |
| 2 | `assets/src/Component/index.ts:26-30` (typ), `:394-404` (`performRequest()`) | `request:started` → `controls.shouldSend` / `abortRequest` (BC) | [PR #3929](https://github.com/symfony/ux/pull/3929) (`shouldSend`) | #3929 se mergne a aplikace přejdou z `abortRequest` na `shouldSend = false` |
| 3 | `assets/src/Component/index.ts:34-35` (typ), `:441-453` (`performRequest()`) | `response:error` → `controls.resetLoadingState` | [PR #3926](https://github.com/symfony/ux/pull/3926) (oprava bez volby, loading stav se ukončí vždy) | #3926 se mergne |
| 4 | `assets/src/Component/index.ts:31-32` | `render:started` v typu `ComponentHooks` | [PR #3922](https://github.com/symfony/ux/pull/3922) | #3922 se mergne |
| 5 | `assets/src/Component/index.ts:47-59`, `assets/src/live_controller.ts:26-40` | exportované typy hooků (`RequestStartedHook` …) | [PR #3930](https://github.com/symfony/ux/pull/3930) (exportuje jen `ComponentHooks`) | aliasy si můžeme nechat; po #3930 jsou jen zkratky |
| 6 | `assets/src/morphdom.ts:71-77, 94, 112, 138, 257-273, 315, 324-328`, `assets/src/live_controller.ts:98-102` | obnova `data-live-preserve` po `innerHTML` swapu + event `live:preserve-restored` + re-render; `CSS.escape` | [#3423](https://github.com/symfony/ux/issues/3423) — případ se změnou `id` rodiče upstream vyřešil upgradem na Idiomorph 0.7.4 ([PR #3868](https://github.com/symfony/ux/pull/3868)) | nejspíš už teď zbytečné (ověřit a odstranit) |
| 6b | `assets/src/Component/plugins/ChildComponentPlugin.ts:46-51, 62-74` | potomci uvnitř `data-skip-morph` se nefingerprintují | [PR #3924](https://github.com/symfony/ux/pull/3924) (Fix #3423, přesnější varianta) | #3924 se mergne |
| 6c | `assets/src/Component/plugins/PageUnloadingPlugin.ts:9-10`, `assets/src/dom_utils.ts:55` | typové opravy kvůli `strict` tsconfigu | PageUnloadingPlugin: [PR #3922](https://github.com/symfony/ux/pull/3922) | #3922 se mergne (dom_utils cast zůstává, dokud upstream nezapne strict) |
| 6d | `assets/src/live_controller.ts:116-124` (`connect()`) | stale `ValueStore` po reconnectu | [#3424](https://github.com/symfony/ux/issues/3424), [PR #3537](https://github.com/symfony/ux/pull/3537) (jiný autor) | #3537 se mergne |
| 7 | `assets/src/Component/index.ts:406-408, 477-482, 706-713` | LiveUrl nepřepíše URL po navigaci (klíč z Navigation API + `isConnected`) | [PR #3928](https://github.com/symfony/ux/pull/3928) | #3928 se mergne |
| 8 | `.github/workflows/sync-upstream.yml` | denní sync z upstreamu | — | nikdy |
| 9 | `assets/tsup.config.mjs`, `assets/tsconfig.json`, `assets/vitest.config.mjs`, `assets/test/setup.js`, `Makefile`, `assets/package.json` (verze, build skripty) | standalone build a testy | — | nikdy |
| 10 | `assets/test/unit/controller/live-url-navigation.test.ts`, `assets/test/unit/Component/request-started.test.ts` | testy custom změn 2 a 7 | — | s příslušnou změnou |

Další otevřené upstream PR z našich oprav, které ve forku nemáme (fork je zatím nepotřebuje): [#3923](https://github.com/symfony/ux/pull/3923) (request z fronty po chybě), [#3925](https://github.com/symfony/ux/pull/3925) (výpadek sítě, Fix [#1986](https://github.com/symfony/ux/issues/1986); souvisí s [PR #3535](https://github.com/symfony/ux/pull/3535)), [#3927](https://github.com/symfony/ux/pull/3927) (`getAttribute('id')` místo `.id`), [#3931](https://github.com/symfony/ux/pull/3931) (`LiveResponse::data()`). Pracovní kopie monorepa s větvemi: `~/projects/symfony-ux` (fork `Pechynho/ux`).

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

Známé omezení: `request()` posílá jen dirty props, ne hodnoty, které jsou zrovna pending v jiném requestu.

### 2. `request:started` hook — `controls.shouldSend` (a starší `abortRequest`)

**Soubor:** `assets/src/Component/index.ts`, metoda `performRequest()`, test `assets/test/unit/Component/request-started.test.ts`

Hook `request:started` dostává druhý argument `controls: { shouldSend: boolean; abortRequest: boolean }`. Nastavením `shouldSend = false` (nebo starším `abortRequest = true`, deprecated) se request nepošle a loading stav nezačne. Dirty props a pending actions zůstanou a odejdou s dalším requestem; promise zrušeného requestu se vyřeší odpovědí toho dalšího (do 3.5.1-pechynho se nevyřešila nikdy).

`shouldSend` je název z upstream PR [#3929](https://github.com/symfony/ux/pull/3929). `abortRequest` zůstává kvůli aplikacím (onlytraining.io), odstranit až po přechodu na `shouldSend`.

```typescript
component.on('request:started', (requestConfig, controls) => {
    if (!navigator.onLine) {
        controls.shouldSend = false;
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

Po `innerHTML` swapu se nyní obnoví preserved elementy, které byly uvnitř postiženého rodičovského elementu — nový placeholder se najde podle ID, synchronizují se atributy a nahradí se originálním elementem. Na obnovený element se po dokončení morphu dispatchne event `live:preserve-restored`; `live_controller.ts` na něj poslouchá a komponentu (v `setTimeout`, až po reconnect cyklu Stimulu) znovu vyrenderuje, aby měla čerstvý stav ze serveru. ID v selektorech se escapují přes `CSS.escape()`.

Upstream issue: [symfony/ux#3423](https://github.com/symfony/ux/issues/3423) (open, bez upstream fixu).

Upstream (od 3.5) obaluje celé tělo `executeMorphdom()` do `try/finally` (dočasné vracení serverových ID u externě změněných elementů) — custom kód je uvnitř toho bloku. Bug s `innerHTML` swapem upstream k 3.5.1 stále má.

### 6b. `data-skip-morph` — potomci se nefingerprintují

**Soubor:** `assets/src/Component/plugins/ChildComponentPlugin.ts`

Child komponenty uvnitř elementu s `data-skip-morph` (relativně k rodičovské komponentě) se neposílají v `children` fingerprintech. Jejich obsah se stejně zahodí `innerHTML` swapem, takže server je musí vyrenderovat celé místo toho, aby vrátil prázdný `data-live-preserve` placeholder. (Case 1 v komentáři k [#3423](https://github.com/symfony/ux/issues/3423).)

### 6d. Stale `ValueStore` po reconnectu controlleru

**Soubor:** `assets/src/live_controller.ts`, metoda `connect()`

Stimulus při disconnect → connect na stejném elementu nevolá znovu `initialize()`, takže přežije starý `Component` i jeho `ValueStore` se zastaralými props → chyby `Invalid model name`. `connect()` teď porovná aktuální `propsValue` s původními props ve `ValueStore` a při rozdílu zavolá `createComponent()`.

Upstream issue: [symfony/ux#3424](https://github.com/symfony/ux/issues/3424) (open), upstream PR [#3537](https://github.com/symfony/ux/pull/3537) (open, jiný autor). Až se PR mergne, custom kód odstranit.

### 6c. Drobné typové opravy (kvůli `strict` tsconfigu)

- `assets/src/Component/plugins/PageUnloadingPlugin.ts` — callback `render:started` má 2. argument `BackendResponse` (upstream tam má chybně `Response`; projeví se až díky custom typování hooku v `ComponentHooks`)
- `assets/src/dom_utils.ts` — cast `element.dataset.value as string`

### 7. Fix LiveUrl `history.replaceState` po navigaci (race)

**Soubory:** `assets/src/Component/index.ts` (metoda `performRequest()` + privátní `getCurrentHistoryEntryKey()`), test `assets/test/unit/controller/live-url-navigation.test.ts`. Upstream PR [#3928](https://github.com/symfony/ux/pull/3928).

Oprava race condition: pokud live response (hlavička `X-Live-Url`) doletěla během navigace nebo po ní (Turbo visit, history back/forward), bezpodmínečný `history.replaceState` přepsal URL history entry **cílové** stránky na URL stránky původní.

Invariant: LiveUrl update je platný jen tehdy, když history entry v momentě response je tatáž jako v momentě odeslání requestu. Implementace:
- `performRequest()` si při odeslání zapamatuje klíč aktuální history entry z Navigation API (`navigation.currentEntry.key`). `replaceState` klíč nemění, nový entry (Turbo visit, `pushState`) a back/forward ano. Pokud se klíč při response liší, `history.replaceState` se přeskočí.
- Navíc se přeskočí i při `this.element.isConnected === false` (jediná kontrola v prohlížečích bez Navigation API; pokryje Turbo visit, který už vyměnil stránku).
- Do 3.5.1-pechynho to byl globální čítač na `popstate`/`turbo:visit`. Byl chybný: `turbo:visit` vystřelí už při startu fetch nové stránky, takže zahodil i update URL, který ještě patřil ke staré stránce.

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
