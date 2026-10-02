import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ContentPack } from "@wonderpath/schema";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(path: string) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadWorld(worldId: string) {
  const dir = join(root, "worlds", worldId);
  return ContentPack.parse({
    world: readJson(join(dir, "world.json")),
    skills: readJson(join(dir, "skills.json")),
    lessons: readJson(join(dir, "lessons.json")),
    cards: readJson(join(dir, "cards.json")),
    items: readJson(join(dir, "items.json")),
  });
}

export function loadAnimals() {
  return loadWorld("animals");
}
