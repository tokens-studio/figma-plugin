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

# only for Figma's own UI (plugin iframes, panels): whole-window shot
node cli.mjs shot /tmp/figma-window.png
```

Then view the PNG. See the [verification hierarchy](./BEST-PRACTICES.md#the-verification-hierarchy)
for when to use which — the short version is: **read values with `eval`, validate
frames with `export`, and only `shot` the whole window for Figma's chrome.**

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

## Big jobs: use a script, not a giant inline string

For anything past a few lines, write a `.mjs` file that imports `connect` from
`cdp.mjs`, do all the work in one `eval` (so it's one round-trip and one
transaction of intent), return a small JSON summary, and `export` the result to
verify. Delete the temp script and PNGs when done.
