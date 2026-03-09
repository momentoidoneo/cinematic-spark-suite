import { useState, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { GripVertical, Plus, Minus, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface GridItem {
  id: string;
  name: string;
  cover_image?: string | null;
  thumbnail_url?: string | null;
  image_url?: string;
  grid_row: number | null;
  grid_col: number | null;
  [key: string]: any;
}

interface GridEditorProps {
  items: GridItem[];
  onUpdatePosition: (itemId: string, row: number | null, col: number | null) => Promise<void>;
  renderBadge?: (item: GridItem) => React.ReactNode;
  columns?: number;
}

const CELL_ID_PREFIX = "cell-";

const GridEditor = ({ items, onUpdatePosition, renderBadge, columns = 3 }: GridEditorProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState<string | null>(null);

  // Calculate number of rows needed
  const placedItems = items.filter(i => i.grid_row != null && i.grid_col != null);
  const unplacedItems = items.filter(i => i.grid_row == null || i.grid_col == null);
  const maxRow = placedItems.reduce((max, i) => Math.max(max, i.grid_row!), 0);
  const [rowCount, setRowCount] = useState(Math.max(maxRow, Math.ceil(items.length / columns), 1));

  // Build grid map: "row-col" -> item
  const gridMap = new Map<string, GridItem>();
  placedItems.forEach(item => {
    gridMap.set(`${item.grid_row}-${item.grid_col}`, item);
  });

  const cellKey = (row: number, col: number) => `${row}-${col}`;
  const cellId = (row: number, col: number) => `${CELL_ID_PREFIX}${row}-${col}`;
  const parseCellId = (id: string): { row: number; col: number } | null => {
    if (!id.startsWith(CELL_ID_PREFIX)) return null;
    const [r, c] = id.replace(CELL_ID_PREFIX, "").split("-").map(Number);
    return { row: r, col: c };
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedItemId = active.id as string;
    const overId = over.id as string;

    // Dropped on a cell
    const cell = parseCellId(overId);
    if (cell) {
      // Check if cell is occupied
      const occupant = gridMap.get(cellKey(cell.row, cell.col));
      if (occupant && occupant.id !== draggedItemId) {
        // Swap positions
        const draggedItem = items.find(i => i.id === draggedItemId);
        if (draggedItem) {
          await Promise.all([
            onUpdatePosition(draggedItemId, cell.row, cell.col),
            onUpdatePosition(occupant.id, draggedItem.grid_row, draggedItem.grid_col),
          ]);
        }
      } else {
        await onUpdatePosition(draggedItemId, cell.row, cell.col);
      }
      return;
    }

    // Dropped on the unplaced area
    if (overId === "unplaced-zone") {
      await onUpdatePosition(draggedItemId, null, null);
    }
  }, [items, gridMap, onUpdatePosition]);

  const addRow = () => setRowCount(r => r + 1);
  const removeRow = () => {
    // Only remove if last row is empty
    const lastRow = rowCount;
    const hasItems = Array.from({ length: columns }, (_, c) => gridMap.has(cellKey(lastRow, c + 1))).some(Boolean);
    if (hasItems) { toast.error("Vacía la última fila antes de eliminarla"); return; }
    if (rowCount > 1) setRowCount(r => r - 1);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        {/* Grid */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Cuadrícula de posiciones</span>
            <div className="flex items-center gap-1">
              <button onClick={removeRow} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Quitar fila">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground px-2">{rowCount} filas</span>
              <button onClick={addRow} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Añadir fila">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: rowCount }, (_, r) =>
              Array.from({ length: columns }, (_, c) => {
                const row = r + 1;
                const col = c + 1;
                const item = gridMap.get(cellKey(row, col));
                const key = cellId(row, col);

                return (
                  <DroppableCell key={key} id={key} isEmpty={!item} isOver={false}>
                    {item ? (
                      <DraggableCard item={item} renderBadge={renderBadge} />
                    ) : (
                      <div className="text-muted-foreground/30 text-xs text-center">
                        {row},{col}
                      </div>
                    )}
                  </DroppableCell>
                );
              })
            )}
          </div>
        </div>

        {/* Unplaced items */}
        {unplacedItems.length > 0 && (
          <DroppableCell id="unplaced-zone" isEmpty={false} isOver={false} className="rounded-xl border border-dashed border-border bg-secondary/30 p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">Sin colocar ({unplacedItems.length})</div>
            <div className="flex flex-wrap gap-2">
              {unplacedItems.map(item => (
                <DraggableCard key={item.id} item={item} renderBadge={renderBadge} compact />
              ))}
            </div>
          </DroppableCell>
        )}
      </div>

      <DragOverlay>
        {activeItem && <DraggableCard item={activeItem} renderBadge={renderBadge} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
};

// --- Sub-components ---

import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

function DroppableCell({ id, isEmpty, children, className, isOver: _ }: { id: string; isEmpty: boolean; children: React.ReactNode; className?: string; isOver: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={className || `aspect-[4/3] rounded-xl border-2 transition-colors flex items-center justify-center overflow-hidden ${
        isOver ? "border-primary bg-primary/10" : isEmpty ? "border-dashed border-border bg-secondary/20" : "border-border bg-card"
      }`}
    >
      {children}
    </div>
  );
}

function DraggableCard({ item, renderBadge, compact, isDragOverlay }: { item: GridItem; renderBadge?: (item: GridItem) => React.ReactNode; compact?: boolean; isDragOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  const img = item.thumbnail_url || item.cover_image || item.image_url;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing select-none ${isDragging ? "opacity-40" : ""}`}
      >
        {img ? (
          <img src={img} alt={item.name} className="w-8 h-8 rounded object-cover" />
        ) : (
          <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground/50" /></div>
        )}
        <span className="text-xs font-medium text-foreground truncate max-w-[100px]">{item.name}</span>
      </div>
    );
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none group ${isDragging ? "opacity-40" : ""} ${isDragOverlay ? "shadow-2xl rounded-xl overflow-hidden" : ""}`}
    >
      {img ? (
        <img src={img} alt={item.name} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full bg-secondary flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
        <span className="text-xs font-semibold text-foreground truncate block">{item.name}</span>
        {renderBadge && renderBadge(item)}
      </div>
      <div className="absolute top-1 left-1 p-1 rounded bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-foreground" />
      </div>
    </div>
  );
}

export default GridEditor;
