import { loadAnimals } from "./index";

const pack = loadAnimals();
const cardIds = new Set(pack.cards.map((c) => c.id));
const itemIds = new Set(pack.items.map((i) => i.id));

for (const item of pack.items) {
  if (!cardIds.has(item.cardId)) {
    throw new Error(`Item ${item.id} points at missing card ${item.cardId}`);
  }
  if (!item.choices.includes(item.correct)) {
    throw new Error(`Item ${item.id} correct answer is not in choices`);
  }
}

for (const lesson of pack.lessons) {
  for (const itemId of lesson.itemIds) {
    if (!itemIds.has(itemId)) {
      throw new Error(`Lesson ${lesson.id} missing item ${itemId}`);
    }
  }
}

console.log(`ok  world=${pack.world.id} cards=${pack.cards.length} lessons=${pack.lessons.length}`);
