import { AlertTriangle } from "lucide-react";

const AdminMigration = () => (
  <section className="max-w-3xl space-y-6">
    <h1 className="font-display text-2xl font-bold">Estado de migración</h1>
    <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
      <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      <h2 className="font-semibold">Guía antigua retirada</h2>
      <p>Las instrucciones anteriores correspondían a una etapa ya superada y no deben utilizarse para cambiar DNS, alojamiento o correo.</p>
      <p>No vuelvas a conectar el proyecto a plataformas antiguas. Este panel no ejecuta despliegues ni certifica por sí solo la migración del backend.</p>
    </div>
    <div className="rounded-xl border p-5 space-y-3">
      <h2 className="font-semibold">Entorno documentado de silviocosta.net</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Dominio transferido a IONOS según la confirmación del titular.</li>
        <li>Web publicada en Cloudflare, servicio silviocosta-net.</li>
        <li>Acceso al panel de negocio: silvio@silviocosta.net.</li>
        <li>Verificar el entorno técnico vigente antes de publicar cambios en funciones, datos o credenciales.</li>
      </ul>
      <p className="text-sm text-muted-foreground">Los registros del checklist anterior se conservan sin modificaciones. Esta pantalla es informativa: no cambia dominios, correo, claves ni campañas.</p>
    </div>
  </section>
);
export default AdminMigration;
