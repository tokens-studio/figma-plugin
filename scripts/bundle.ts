import * as JSZip from "jszip";
import { glob } from "glob";
import * as fs from "fs";

async function bundle() {
    const zip = new JSZip();

    const files = await glob(['dist/*.js','dist/*.html'], {  nodir: true });


    await Promise.all(files.map(async(file)=>{
       await  zip.file(file, fs.readFileSync(file,'utf8'));
    }));

    await zip.file('manifest.json', fs.readFileSync('manifest.json','utf8'));
    await zip.file('package.json', fs.readFileSync('package.json','utf8'));

    const file = await zip.generateAsync({type : "nodebuffer"});
    fs.writeFileSync('dist/bundle.zip', file);
}

bundle();