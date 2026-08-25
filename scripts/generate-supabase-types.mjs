import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const executable = process.platform === "win32" ? "supabase.cmd" : "supabase";
const result = spawnSync(
  executable,
  ["gen", "types", "typescript", "--linked", "--schema", "public"],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === "win32",
  },
);

if (result.status !== 0 || !result.stdout.trim()) {
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  process.stderr.write(
    "Supabase type generation failed. Run `pnpm exec supabase link` first; the existing type file was left unchanged.\n",
  );
  process.exitCode = result.status ?? 1;
} else {
  const outputPath = resolve(
    process.cwd(),
    "src/lib/supabase/database.types.ts",
  );
  writeFileSync(outputPath, result.stdout, "utf8");
  process.stdout.write(`Generated ${outputPath}\n`);
}
