import { access, cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

// Packages Sites metadata and migrations after Vite finishes compiling.
export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const distRoot = resolve(root, "dist");
      const outputDirectory = resolve(distRoot, ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");
      const publicSource = resolve(root, "public");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }

      // Sites deploys the dist artifact. Copy every committed public asset into
      // the artifact root so /brand, /founder, /experience, project images,
      // videos and the favicon resolve on the published site.
      if (await exists(publicSource)) {
        for (const entry of await readdir(publicSource)) {
          await cp(resolve(publicSource, entry), resolve(distRoot, entry), {
            recursive: true,
            force: true,
          });
        }
      }
    },
  };
}
