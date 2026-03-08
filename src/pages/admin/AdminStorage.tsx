import { HardDrive } from "lucide-react";

const AdminStorage = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Almacenamiento</h1>
    <p className="text-muted-foreground mb-8">Gestiona los archivos y medios almacenados</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <HardDrive className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: explorador de archivos con uso de espacio y gestión de medios.</p>
    </div>
  </div>
);

export default AdminStorage;
