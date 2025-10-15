
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";


async function dynamicImport(file) {
  try {
    const ext = path.extname(file).toLowerCase();
    const fileUrl = pathToFileURL(file).href;

    
    if (ext === ".json") {
      try {
     
        const jsonModule = await import(fileUrl, { assert: { type: "json" } });
        return jsonModule.default;
      } catch (err) {
       
        if (err.code === "ERR_IMPORT_ASSERTION_TYPE_MISSING" || err.code === "ERR_IMPORT_ATTRIBUTE_MISSING") {
          const fs = await import("node:fs/promises");
          const text = await fs.readFile(file, "utf8");
          return JSON.parse(text);
        }
        throw err;
      }
    }

   
    const mod = await import(fileUrl);

    
    if (mod && Object.prototype.hasOwnProperty.call(mod, "default")) {
      return mod.default;
    }

    return mod;
  } catch (error) {
    console.error(" dynamicImport error for file:", file);
    console.error(error);
    throw error;
  }
}



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const esmResult = await dynamicImport(path.join(__dirname, "sample.mjs"));
    console.log(" ESM import result:", esmResult);

    if (typeof esmResult === "function") {
      console.log(" Calling default export:", esmResult());
    } else {
      console.log("🔹 Named exports:", Object.keys(esmResult));
    }

    const jsonResult = await dynamicImport(path.join(__dirname, "data.json"));
    console.log(" JSON import result:", jsonResult);
  } catch (e) {
    console.error(" Error during run:", e);
  }
}

run();
