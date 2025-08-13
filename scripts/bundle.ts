import JSZip from "jszip";
import { glob } from "glob";
import * as fs from "fs-extra";

async function bundle() {
  const zip = new JSZip();

  fs.ensureDirSync("dist");
  const files = await glob(
    [
      "packages/tokens-studio-for-figma/dist/*.js",
      "packages/tokens-studio-for-figma/dist/*.html",
    ],
    { nodir: true },
  );

  await Promise.all(
    files.map(async (file) => {
      await zip.file(file, fs.readFileSync(file, "utf8"));
    }),
  );

  await zip.file(
    "packages/tokens-studio-for-figma/manifest.json",
    fs.readFileSync("packages/tokens-studio-for-figma/manifest.json", "utf8"),
  );
  await zip.file(
    "packages/tokens-studio-for-figma/package.json",
    fs.readFileSync("packages/tokens-studio-for-figma/package.json", "utf8"),
  );

  const file = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync("dist/bundle.zip", file);
}

bundle();
