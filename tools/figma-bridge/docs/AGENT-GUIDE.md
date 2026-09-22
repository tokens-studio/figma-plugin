# Figma bridge — agent guide

Copy-paste recipes for driving Figma from bash over the CDP bridge. This is the
practical companion to the [best practices](./BEST-PRACTICES.md); for how the
bridge works internally see the [README](../README.md).

All commands run from `tools/figma-bridge/`:

```bash
cd tools/figma-bridge
```

---

## The loop: build → run → verify

The whole point of this bridge is that an agent can close this loop **by itself**,
with no human clicks:

1. **Build** — write Plugin-API JS (inline, or a `.mjs` script for anything big).
2. **Run** — execute it in the live renderer with `eval`.
3. **Verify** — read the result back (`eval`) and, if it's visual, `export` the
   node and view the PNG. Fix and re-run until it's right.

```bash
node cli.mjs status                              # 1. is a debug Figma up?
node cli.mjs start                               #    (if not) launch one — quits any running Figma
node cli.mjs eval 'return figma.currentPage.name'  # 2. run something
node cli.mjs export "286:3" /tmp/frame.png       # 3. verify what you drew
```

> `eval` auto-wraps snippets that use top-level `return`/`await` in an async IIFE,
> so you can `return` and `await` directly. Always return **JSON-serializable**
> values.

---

## Reading (do this before you look at pixels)

### List variable collections and variables

```bash
node cli.mjs eval '
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  return {
    collections: cols.map(c => ({ name: c.name, modes: c.modes.map(m => m.name) })),
    variables: vars.map(v => ({ name: v.name, type: v.resolvedType, collection: v.variableCollectionId })),
  };
'
```

### Resolve a variable's value in a mode

```bash
node cli.mjs eval '
  const vars = await figma.variables.getLocalVariablesAsync();
  const v = vars.find(x => x.name === "primary");
  return { name: v.name, valuesByMode: v.valuesByMode };
'
```

### Inspect the selection (name, type, size, fills, bindings)

```bash
node cli.mjs eval '
  return figma.currentPage.selection.map(n => ({
    id: n.id, name: n.name, type: n.type, w: n.width, h: n.height,
    fills: "fills" in n ? n.fills : null,
    bound: "boundVariables" in n ? n.boundVariables : null,
  }));
'
```

### List local styles

```bash
node cli.mjs eval '
  const paints = await figma.getLocalPaintStylesAsync();
  const texts = await figma.getLocalTextStylesAsync();
  return { paints: paints.map(s => s.name), texts: texts.map(s => s.name) };
'
```

---

## Creating

### Load a font before any text work

Text ops throw if the font isn't loaded. Always load first:

```bash
node cli.mjs eval '
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const t = figma.createText();
  t.characters = "Hello from the terminal";
  figma.currentPage.appendChild(t);
  return { id: t.id, chars: t.characters };
'
```

### Create a frame and get its id back (then verify)

```bash
# create → capture the id from the JSON output
node cli.mjs eval '
  const f = figma.createFrame();
  f.name = "Scratch";
  f.resize(400, 200);
  f.fills = [{ type: "SOLID", color: { r: 0.96, g: 0.96, b: 0.97 } }];
  figma.currentPage.appendChild(f);
  return { id: f.id };
'
# then export that id and look at it
node cli.mjs export "<id-from-above>" /tmp/scratch.png
```

### Bind a variable to a paint (swatch pattern)

```bash
node cli.mjs eval '
  const vars = await figma.variables.getLocalVariablesAsync();
  const v = vars.find(x => x.name === "primary");
  const rect = figma.createRectangle();
  rect.resize(120, 80);
  let paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  paint = figma.variables.setBoundVariableForPaint(paint, "color", v);
  rect.fills = [paint];
  figma.currentPage.appendChild(rect);
  return { id: rect.id, boundTo: v.name };
'
```

---

## Auto-layout: the collapse/​wrap gotcha

This bit us for real while building the demo page. Auto-layout frames don't size
the way you'd guess:

- A **VERTICAL** stack that should grow with its children needs
  `primaryAxisSizingMode = "AUTO"` (hug contents). Leave it `FIXED` and the frame
  keeps its initial height and **clips everything** — the classic "my content is
  invisible / squished to 10px" symptom.
- A **HORIZONTAL wrap** row (a grid of cards) needs all three:
  - `layoutWrap = "WRAP"`
  - `primaryAxisSizingMode = "FIXED"` — a fixed width is what forces wrapping
  - `counterAxisSizingMode = "AUTO"` — height hugs however many rows result
  - `itemSpacing` = gap between columns, `counterAxisSpacing` = gap between rows

```bash
node cli.mjs eval '
  const wrap = figma.createFrame();
  wrap.layoutMode = "HORIZONTAL";
  wrap.layoutWrap = "WRAP";
  wrap.primaryAxisSizingMode = "FIXED";     // fixed width → wrapping kicks in
  wrap.counterAxisSizingMode = "AUTO";      // height hugs the rows
  wrap.itemSpacing = 16;                    // column gap
  wrap.counterAxisSpacing = 16;             // row gap
  wrap.resize(768, 10);                     // width matters; height will hug
  figma.currentPage.appendChild(wrap);
  return { id: wrap.id };
'
```

When a built layout looks collapsed, **read the sizing modes with `eval`**
(don't just stare at a screenshot) and flip the offending mode to `AUTO`.

---

## Verifying

```bash
# preferred: export just the node you care about (tight crop, full fidelity)
node cli.mjs export "<nodeId>" /tmp/out.png 2     # 2 = @2x scale (default)

# only for Figma's own chrome (panels, menus, native dialogs): whole-window shot
node cli.mjs shot /tmp/figma-window.png
```

Then view the PNG. See the [verification hierarchy](./BEST-PRACTICES.md#the-verification-hierarchy)
for when to use which — the short version is: **read values with `eval`, validate
frames with `export`, and only `shot` the whole window for Figma's chrome.**

A plugin's own UI is **not** a reason to reach for `shot`: you can read its DOM
and its app state directly. See [Driving a plugin's UI](#driving-a-plugins-ui).

---

## Targeting a specific file

The CLI connects to whichever live design context it finds first. When several
files are open and you need a specific one, filter by its **file key** (the
`…/design/<KEY>/…` segment of the URL) via `connect({ targetUrl })`:

```bash
node -e '
  import("./cdp.mjs").then(async ({ connect }) => {
    const c = await connect({ targetUrl: "xKlAp4LLn5JAUAS0NFyg0M", timeoutMs: 8000 });
    const name = await c.eval("return figma.root.name");
    console.log(name);
    c.close();
  });
'
```

The same `connect({ targetUrl })` handle exposes `eval()`, `screenshot()` and
`exportNode(id, { scale })` if you need to script a full targeted flow.

---

## Driving a plugin's UI

A Figma plugin's own UI is **not out of reach**. It's an iframe whose JavaScript
runs in a *different execution context* inside the *same* CDP target as the
document. Once you have that context id you can read its DOM, call into its app
state, click its buttons and type into its fields — fully automated, no human
clicks. (This is not theory: the Tokens Studio plugin's entire React UI — tabs,
modals, forms, the push/commit dialogs — was driven end-to-end this way.)

This is one level below `cli.mjs`: you write a `.mjs` script that imports
`connect` from `cdp.mjs` and uses three internal-but-usable escape hatches on the
client it returns:

- **`client._contexts`** — every execution context CDP has announced for the
  target. Populated because `connect()` already calls `Runtime.enable`.
- **`client._rawEval(expr, { contextId })`** — `Runtime.evaluate` in **one
  specific context**. Returns the raw CDP result, so the value is at
  `.result.value`. Unlike `client.eval()` it does **not** auto-wrap `return`/`await`.
- **`client._send(method, params)`** — any raw CDP command:
  `Input.dispatchMouseEvent`, `Input.insertText`, …

`client.eval()` and every `cli.mjs` command always target `client.contextId` —
the **document** context, where `figma` lives. Plugin-UI work means talking to a
*different* contextId in the same client.

### The two facts that make or break this

1. **The plugin UI is a separate execution context**, not a separate target. The
   document context has `typeof figma !== "undefined"` and a
   `figma.com/(design|file)/` URL; the plugin UI context's `location.href` starts
   with `data:text/html;base64,…` and its `document` is the plugin's own DOM.
2. **Coordinates live in two different spaces.** `Input.dispatchMouseEvent`
   coordinates are relative to the **top-level page**. Element rects you measure
   *inside* the plugin iframe are **iframe-relative**. You must add the iframe's
   offset. Getting this wrong makes clicks land on the canvas and *silently do
   nothing* — this is the number one gotcha, and it looks exactly like "the click
   didn't work".

### Helper: eval in a specific context

```js
async function evalIn(client, contextId, code, timeoutMs = 5000) {
  const expr = /\breturn\b|\bawait\b/.test(code) ? `(async () => { ${code} })()` : code;
  const res = await client._rawEval(expr, { contextId, timeoutMs });
  if (res?.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
  }
  return res?.result?.value;
}
```

Pass a short `timeoutMs` when probing contexts: `_send` defaults to **15 s**, and
a dead context will burn all of it before rejecting — painful when you're
iterating over a dozen of them.

### Find the plugin's execution context

Match on distinctive plugin text **and** a second signal that the app is actually
alive. Text alone is not enough: `_contexts` accumulates as contexts are created
and is not pruned when they're destroyed, so a plugin reload leaves a **stale,
blank context** behind that can still match on a name. For a Redux app,
`window.store.getState` is the ideal liveness probe.

```js
async function findPluginContext(client) {
  // newest first — after a reload the live context is the most recently created
  for (const ctx of [...client._contexts].reverse()) {
    try {
      const ok = await evalIn(client, ctx.id, `
        return location.href.startsWith("data:text/html")
          && typeof window.store !== "undefined"
          && typeof window.store.getState === "function";
      `);
      if (ok) return ctx.id;
    } catch {
      // suspended / destroyed context — skip it
    }
  }
  return null;
}
```

If the plugin has no store to probe, fall back to a distinctive string in
`document.body.innerText` — but expect the stale-context failure mode and
re-check that the context still responds before trusting it.

### Get the iframe offset

Measure it in the **document** context (`client.contextId`), not the plugin one:

```js
const offset = await evalIn(client, client.contextId, `
  const f = Array.from(document.querySelectorAll("iframe"))
    .find(f => (f.title || "").includes("Plugin:") && f.getBoundingClientRect().width > 0);
  if (!f) throw new Error("no visible plugin iframe — is the plugin running?");
  const r = f.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
`);
```

Re-measure it after anything that could move or resize the plugin window; don't
cache it across a relaunch.

### Helper: a real click

Synthetic `el.click()` works for plain buttons inside the plugin's own UI, but
**not** for Figma's native menus (hover-driven flyouts that only respond to real
input) and **not** reliably for focusing React inputs. When in doubt, dispatch
real mouse events:

```js
async function realClick(client, x, y) {
  const at = { x, y };
  await client._send("Input.dispatchMouseEvent", { ...at, type: "mouseMoved", button: "none", clickCount: 0 });
  await client._send("Input.dispatchMouseEvent", { ...at, type: "mousePressed", button: "left", clickCount: 1 });
  await client._send("Input.dispatchMouseEvent", { ...at, type: "mouseReleased", button: "left", clickCount: 1 });
}
```

### Click an element in the plugin UI by its visible text

Measure inside the plugin context, then **add the offset** before clicking.
Match on **leaf nodes** so you don't also match every ancestor container:

```js
const rect = await evalIn(client, pluginCtx, `
  const el = Array.from(document.querySelectorAll("*"))
    .find(e => e.children.length === 0 && (e.textContent || "").trim() === "Settings");
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
`);
if (!rect) throw new Error("Settings not found");
await realClick(client, offset.x + rect.x + rect.w / 2, offset.y + rect.y + rect.h / 2);
```

For **Figma's own menus** (not the plugin's), items carry `role=menuitem`, so
`document.querySelectorAll("[role=menuitem]")` in the *document* context is the
better selector — and those must be clicked with `realClick`, never `el.click()`.

### Type into a field

Real click to focus, then `Input.insertText`. This is the reliable path:

```js
await realClick(client, offset.x + rect.x + rect.w / 2, offset.y + rect.y + rect.h / 2);
await client._send("Input.insertText", { text: "my commit message" });
```

Two traps when the field is React-controlled:

- **Setting `el.value` directly is ignored by React.** The native-setter trick
  does register with plain React state:
  ```js
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(el, "text");
  el.dispatchEvent(new Event("input", { bubbles: true }));
  ```
- **…but even that did not work for a `react-hook-form` form.** The value showed
  up in the DOM while the library's internal state never updated, and Save
  persisted the *old* value — a silent, very convincing false positive. For
  those forms, focus with a real click and type with `Input.insertText`.

> **Avoid `Input.dispatchKeyEvent` with modifiers** (Cmd+A to select-all, etc.).
> In this environment it repeatedly **hard-crashed Figma**. To replace a field's
> contents, prefer the native-setter approach or clear the field some other way.

### Launch a plugin without touching a native file dialog

Do **not** try to drive *Plugins → Development → Import plugin from manifest…*.
That opens a macOS `NSOpenPanel`, which CDP cannot see or touch. **A human must
do the one-time import.** Same for re-pointing an existing registration at a
different path.

Once the plugin is registered, launching it *is* fully automatable via the
quick-actions palette — far more reliable than the Plugins → Development flyout,
which auto-collapses out from under you:

```js
// Cmd+P → type the plugin name → Enter
await client._send("Input.dispatchKeyEvent", {
  type: "rawKeyDown", key: "p", code: "KeyP", modifiers: 4,   // 4 = Meta/Cmd
  windowsVirtualKeyCode: 80, nativeVirtualKeyCode: 80,
});
await client._send("Input.dispatchKeyEvent", {
  type: "keyUp", key: "p", code: "KeyP", modifiers: 4,
  windowsVirtualKeyCode: 80, nativeVirtualKeyCode: 80,
});
await client._send("Input.insertText", { text: "Tokens Studio" });
// …poll until the palette shows a result, then:
await client._send("Input.dispatchKeyEvent", {
  type: "keyDown", key: "Enter", code: "Enter", text: "\r",
  windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13,
});
await client._send("Input.dispatchKeyEvent", {
  type: "keyUp", key: "Enter", code: "Enter",
  windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13,
});
```

This one modifier combo is the exception worth taking — but it *is* a modifier
combo, so treat a crash as a normal outcome: check `node cli.mjs status`, and if
it reports `running: false`, `node cli.mjs start` and re-run.

### Read the plugin's state instead of screenshotting it

The [verification hierarchy](./BEST-PRACTICES.md#the-verification-hierarchy)
applies *inside* plugin UIs too — "read the value" means the plugin's state, not
just `figma.*`. If the plugin exposes a Redux store, assert on real state:

```js
const dirty = await evalIn(client, pluginCtx, `
  const s = window.store.getState();
  return { tab: s.uiState.activeTab, dirty: s.tokenState.changedState };
`);
```

That is how you compare what the plugin *thinks* is true against what actually
got written somewhere else — evidence a screenshot can never give you.

And for a fast, cheap "what is the plugin showing right now?" (which tab, which
modal, any error banner), read text rather than pixels:

```js
await evalIn(client, pluginCtx, `return document.body.innerText`);
```

### Instrument with a global array, not console capture

When you need to see inside the plugin's own code, **don't** rely on capturing
`Runtime.consoleAPICalled`: the listener is bound to a context that gets replaced
on every plugin iframe reload, and logs go silently missing. Push into a global
from the instrumented source instead:

```js
((globalThis).__debug = (globalThis).__debug || []).push({ where: "push", ok, at: Date.now() });
```

Then read it back with an eval in the plugin context afterwards. It survives
reloads and gives decisive evidence instead of an empty log.

### Do the whole interaction in ONE script

Figma's menus and flyouts close, and plugin modal state resets, **between
separate `node script.mjs` invocations**. Open the menu, navigate, click, and
assert in a *single* continuous run; put retries and polling *inside* that run
rather than re-running the script. Splitting an interaction across invocations is
the single biggest time sink here.

```js
import { connect } from "./cdp.mjs";

const client = await connect({ timeoutMs: 20000 });
try {
  const pluginCtx = await findPluginContext(client);            // 1. locate
  const offset = await evalIn(client, client.contextId, `…`);   // 2. measure
  await realClick(client, /* offset + rect */);                 // 3. act
  const state = await evalIn(client, pluginCtx, `…`);           // 4. assert on state
  console.log(JSON.stringify(state, null, 2));
} finally {
  client.close();
}
```

---

## Big jobs: use a script, not a giant inline string

For anything past a few lines, write a `.mjs` file that imports `connect` from
`cdp.mjs`, do all the work in one `eval` (so it's one round-trip and one
transaction of intent), return a small JSON summary, and `export` the result to
verify. Delete the temp script and PNGs when done.
