import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function handleDragEnd<T extends { id: string; order: number }>(
  event: DragEndEvent,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  persistOrder: (reordered: T[]) => Promise<void>
) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = items.findIndex((i) => i.id === active.id);
  const newIndex = items.findIndex((i) => i.id === over.id);
  if (oldIndex === -1 || newIndex === -1) return;

  const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
    ...item,
    order: idx,
  }));

  setItems(reordered);
  persistOrder(reordered);
}
