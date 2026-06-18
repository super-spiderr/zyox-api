import fs from "fs";
import path from "path";

// Helper to convert string to kebab-case (e.g. productCategories -> product-categories)
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/[\s_-]+/g, "-")
    .toLowerCase();
}

// Helper to singularize a word
function singularize(str: string): string {
  const lower = str.toLowerCase();
  if (lower.endsWith("entries")) {
    return str.slice(0, -7) + "entry";
  }
  if (lower.endsWith("categories")) {
    return str.slice(0, -10) + "category";
  }
  if (lower.endsWith("ies")) {
    return str.slice(0, -3) + "y";
  }
  if (lower.endsWith("s") && !lower.endsWith("ss") && !lower.endsWith("us") && !lower.endsWith("is") && !lower.endsWith("as")) {
    return str.slice(0, -1);
  }
  return str;
}

function main() {
  const rawInput = process.argv[2];
  if (!rawInput) {
    console.error("Error: Please provide a module name.");
    console.log("Usage: npm run make:module <module-name>");
    console.log("Example: npm run make:module customers");
    process.exit(1);
  }

  // E.g., if rawInput is "customers"
  // folderName = "customers"
  const folderName = toKebabCase(rawInput);
  
  // singularInput = "customer"
  const singularInput = singularize(rawInput);
  
  // filePrefix = "customer"
  const filePrefix = toKebabCase(singularInput);

  const targetDir = path.resolve(process.cwd(), "src", "modules", folderName);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Module folder already exists at: src/modules/${folderName}`);
    process.exit(1);
  }

  console.log(`Creating module '${folderName}'...`);
  fs.mkdirSync(targetDir, { recursive: true });

  const files = [
    `${filePrefix}.schema.ts`,
    `${filePrefix}.service.ts`,
    `${filePrefix}.controller.ts`,
    `${filePrefix}.route.ts`,
  ];

  for (const fileName of files) {
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, "", "utf8");
    console.log(`  Created: src/modules/${folderName}/${fileName}`);
  }

  console.log("\nModule creation complete! 🎉\n");
}

main();
