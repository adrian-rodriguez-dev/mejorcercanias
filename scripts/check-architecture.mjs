import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { parsers } from "prettier/plugins/typescript";
const root = resolve("src");
const layers = { app: 0, components: 1, platform: 2, data: 3 };
const files = readdirSync(root, { recursive: true }).filter(
  (name) => /\.tsx?$/.test(name) && !/\.test\./.test(name),
);
const errors = [];
for (const name of files) {
  const file = resolve(root, name);
  const layer = name.split(/[\\/]/)[0];
  const source = await parsers.typescript.parse(readFileSync(file, "utf8"), {
    filepath: file,
  });
  function visit(node) {
    if (
      [
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
      ].includes(node.type)
    ) {
      const specifier = node.source;
      if (specifier && typeof specifier.value === "string") {
        const target = specifier.value;
        const targetLayer = relative(
          root,
          resolve(dirname(file), target),
        ).split(/[\\/]/)[0];
        if (target.startsWith(".") && layers[targetLayer] < layers[layer])
          errors.push(`${name}: dependency on upper layer ${target}`);
        if (layer === "data" && /^(react|react-dom)(\/|$)/.test(target))
          errors.push(`${name}: data cannot depend on React`);
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value))
        value.forEach((child) => {
          if (child && typeof child.type === "string") visit(child);
        });
      else if (value && typeof value.type === "string") visit(value);
    }
  }
  visit(source);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Architecture: static imports respect app -> components -> platform -> data.",
  );
