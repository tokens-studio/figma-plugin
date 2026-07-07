#!/usr/bin/env node
// Bash-callable wrapper around the Figma CDP bridge. All output is JSON on stdout;
// errors print {"error": "..."} on stderr and exit 1.
//
//   node cli.mjs status              # is a debug Figma up? what doc is open?
//   node cli.mjs start               # clone/patch/sign (once) + launch debug Figma
//   node cli.mjs stop                # quit the debug Figma
//   node cli.mjs eval "<js>"         # run Plugin-API JS, print the returned value
//   node cli.mjs export <id> [f.png] # export ONE node's pixels (tight crop) — verify a frame
//   node cli.mjs shot [file.png]     # screenshot the WHOLE Figma window (UI chrome)
//   node cli.mjs prepare             # clone/patch/sign without launching
//   node cli.mjs clean               # remove the cloned debug app

import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { connect, isPortReady, listTargets, DEFAULT_PORT } from "./cdp.mjs";
import {
  BRIDGE_DIR,
  DEBUG_APP,
  DEBUG_ASAR,
  asarState,
  clean,
  prepare,
  start,
  stop,
} from "./launch.mjs";

const PORT = Number(process.env.FIGMA_BRIDGE_PORT || DEFAULT_PORT);

function out(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
}

function fail(err) {
  process.stderr.write(JSON.stringify({ error: err?.message ?? String(err) }, null, 2) + "\n");
  process.exit(1);
}

async function withClient(fn, opts = {}) {
  const client = await connect({ port: PORT, ...opts });
  try {
    return await fn(client);
  } finally {
    client.close();
  }
}

async function cmdStatus() {
  const appExists = existsSync(DEBUG_APP);
  const patched = appExists && existsSync(DEBUG_ASAR) ? asarState() : "absent";
  if (!(await isPortReady(PORT))) {
    return out({ running: false, port: PORT, debugApp: appExists ? DEBUG_APP : null, patched });
  }
  const targets = (await listTargets(PORT)).filter((t) => t.type === "page");
  const info = await withClient(
    (c) =>
      c.eval(
        "return { page: figma.currentPage.name, file: figma.root.name, editorType: figma.editorType };",
      ),
    { timeoutMs: 8000 },
  );
  out({ running: true, port: PORT, patched, openTabs: targets.length, ...info });
}

async function cmdStart() {
  const res = await start({ port: PORT });
  const info = await withClient((c) =>
    c.eval("return { page: figma.currentPage.name, file: figma.root.name };"),
  );
  out({ started: true, ...res, ...info });
}

async function cmdStop() {
  const stopped = await stop();
  out({ stopped });
}

async function cmdEval(code) {
  if (!code) throw new Error('eval needs a JS string, e.g. eval "return figma.currentPage.name"');
  const value = await withClient((c) => c.eval(code));
  out({ value });
}

async function cmdShot(file) {
  const target = file || join(BRIDGE_DIR, "shot.png");
  const buf = await withClient((c) => c.screenshot());
  writeFileSync(target, buf);
  out({ file: target, bytes: buf.length });
}

async function cmdExport(nodeId, file, scale) {
  if (!nodeId) {
    throw new Error('export needs a node id, e.g. export "12:34" frame.png [scale]');
  }
  const target = file || join(BRIDGE_DIR, "export.png");
  const buf = await withClient((c) =>
    c.exportNode(nodeId, { scale: scale ? Number(scale) : 2 }),
  );
  writeFileSync(target, buf);
  out({ file: target, bytes: buf.length, nodeId });
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  switch (cmd) {
    case "status":
      return cmdStatus();
    case "start":
      return cmdStart();
    case "stop":
      return cmdStop();
    case "eval":
      return cmdEval(args[1]);
    case "export":
      return cmdExport(args[1], args[2], args[3]);
    case "shot":
      return cmdShot(args[1]);
    case "prepare":
      return out(prepare());
    case "clean":
      clean();
      return out({ cleaned: true });
    default:
      process.stderr.write(
        'usage: cli.mjs <status|start|stop|eval "<js>"|export <id> [file] [scale]|shot [file]|prepare|clean>\n',
      );
      process.exit(2);
  }
}

main().catch(fail);
