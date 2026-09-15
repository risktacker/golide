import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const source = "https://assets.mixkit.co/music/download/mixkit-easy-monday-1025.mp3";
const target = path.resolve("public/audio/marketplace/easy-monday.mp3");
const temp = `${target}.tmp`;

async function existsWithData(file) {
  try {
    const info = await stat(file);
    return info.size > 100_000;
  } catch {
    return false;
  }
}

if (!(await existsWithData(target))) {
  await mkdir(path.dirname(target), { recursive: true });
  const response = await fetch(source, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
      accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.1",
      "accept-language": "en-US,en;q=0.9",
      referer: "https://mixkit.co/free-stock-music/blues-rock/",
      origin: "https://mixkit.co",
    },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Easy Monday download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength < 100_000) throw new Error("Easy Monday download was unexpectedly small.");
  await writeFile(temp, bytes);
  await rename(temp, target);
  console.log(`Prepared Easy Monday marketplace audio (${bytes.byteLength} bytes).`);
} else {
  console.log("Easy Monday marketplace audio already prepared.");
}
