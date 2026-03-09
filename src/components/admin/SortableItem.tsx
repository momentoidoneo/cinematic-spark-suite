import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
}

const SortableItem = ({ id, children, className = "", showHandle = true }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${className}`}>
      {showHandle && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-background/80 backdrop-blur border border-border text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing transition-colors"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {!showHandle && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          {children}
        </div>
      )}
      {showHandle && children}
    </div>
  );
};

export default SortableItem;
