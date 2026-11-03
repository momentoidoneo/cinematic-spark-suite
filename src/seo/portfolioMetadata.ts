type Gallery = { name: string; description?: string | null };
export function portfolioMetadata(category?: Gallery | null, subcategory?: Gallery | null) {
  const subject = subcategory ? `${category?.name}: ${subcategory.name}` : category?.name;
  const heading = subject ? `Portafolio de ${subject}` : "Portafolio audiovisual";
  const detail = (subcategory?.description || category?.description || "Selección del portafolio de Silvio Costa").replace(/[.!?]+$/, "");
  return {
    title: `${heading} | Silvio Costa`,
    heading,
    description: subject
      ? `Trabajos de ${subject.toLocaleLowerCase("es")}. ${detail}. Producción desde Madrid.`.slice(0, 160)
      : "Portafolio de fotografía, vídeo, dron y tours virtuales de Silvio Costa. Explora trabajos y especialidades de nuestro equipo con base en Madrid.",
  };
}
export function portfolioImageAlt(item: { alt_text?: string | null; title?: string | null }, category?: Gallery | null, subcategory?: Gallery | null) {
  const useful = (value?: string | null) => value?.trim() && !/\.(jpe?g|png|webp|avif|gif|mp4)$/i.test(value.trim()) && !/^(IMG|DSC|DSCF|DCIM|\dR\dA)[-_\d]/i.test(value.trim());
  if (useful(item.alt_text)) return item.alt_text!.trim();
  if (useful(item.title)) return item.title!.trim();
  // Factual category context, not an invented visual description.
  return [category?.name, subcategory?.name, "portafolio de Silvio Costa"].filter(Boolean).join(" — ");
}
