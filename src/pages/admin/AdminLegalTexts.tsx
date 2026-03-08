import { Scale } from "lucide-react";

const AdminLegalTexts = () => (
  <div>
    <h1 className="font-display text-3xl font-bold text-foreground mb-2">Textos Legales</h1>
    <p className="text-muted-foreground mb-8">Gestiona los textos legales de tu sitio web</p>
    <div className="rounded-xl bg-card border border-border p-12 flex flex-col items-center justify-center text-center">
      <Scale className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <p className="text-muted-foreground">Próximamente: editor de política de privacidad, aviso legal, cookies y términos de uso.</p>
    </div>
  </div>
);

export default AdminLegalTexts;
