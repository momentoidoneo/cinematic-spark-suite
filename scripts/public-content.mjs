// Explicit public-only queries. Never use service-role credentials or select=*.
export const publicQueries = {
  seo_metadata: "select=page_path,title,description,og_image",
  blog_posts: "select=id,slug,title,excerpt,content,cover_image,published_at,created_at,updated_at&status=eq.published&order=published_at.desc",
  portfolio_categories: "select=id,slug,name,description,cover_image,grid_row,grid_col&is_visible=eq.true&order=order",
  portfolio_subcategories: "select=id,slug,name,description,cover_image,cover_position,gallery_style,category_id,grid_row,grid_col&is_visible=eq.true&order=order",
  portfolio_images: "select=id,image_url,title,alt_text,subcategory_id,media_type,video_url,thumbnail_url,grid_row,grid_col&order=order",
  featured_images: ["portfolio_images", "select=id,title,alt_text,image_url,thumbnail_url,portfolio_subcategories(name,slug,portfolio_categories(name,slug))&is_featured=eq.true&media_type=eq.image&order=order&limit=6"],
  case_studies: "select=id,slug,title,client,summary,content,cover_image,before_image,after_image,metrics,services,location,is_featured&is_published=eq.true&order=order",
  seo_cities: "select=slug,name,region,intro&is_visible=eq.true",
  pricing_plans: "select=id,name,description,price,price_suffix,features,is_highlighted,is_visible,show_from,order&is_visible=eq.true&order=order",
  pricing_services: "select=id,name,description,price,price_suffix,category,show_from,order&is_visible=eq.true&order=order",
  client_logos: "select=id,name,logo_url,link_url&is_visible=eq.true&order=order",
  testimonials: "select=id,author_name,author_role,author_company,content,rating,avatar_url,service_tag&is_visible=eq.true&order=order",
  social_links: "select=id,platform,url,label,is_active&is_active=eq.true&order=order",
  site_settings: "select=key,value&key=in.(hero_bg,landing_pricing_plan_ids)",
  lead_magnets: "select=id,title,description,pdf_url,cover_image,pages&is_active=eq.true&order=order&limit=1",
  quote_calculator_options: "select=id,category,label,description,option_type,base_price,unit,min_qty,max_qty,multiplier&is_visible=eq.true&order=category,order",
  legal_texts: "select=slug,title,content&is_published=eq.true",
};

export function contentForRoute(all, route) {
  const tables = { social_links: all.social_links, seo_metadata: all.seo_metadata.filter(x => x.page_path === route) };
  const add = (...keys) => keys.forEach(key => { tables[key] = all[key]; });
  if (route === "/") add("site_settings", "portfolio_categories", "featured_images", "pricing_plans", "client_logos", "testimonials", "case_studies", "lead_magnets");
  if (route === "/precios") add("pricing_plans", "pricing_services", "quote_calculator_options");
  if (route.startsWith("/blog")) {
    tables.blog_posts = route === "/blog" ? all.blog_posts.map(({ content, ...post }) => post) : all.blog_posts.filter(x => `/blog/${x.slug}` === route);
  }
  if (route.startsWith("/casos-estudio")) add("case_studies");
  if (route.startsWith("/legal/")) tables.legal_texts = all.legal_texts.filter(x => `/legal/${x.slug}` === route);
  if (route.startsWith("/fotografia-")) add("seo_cities");
  if (route.startsWith("/portafolio")) {
    add("portfolio_categories");
    const [, , categorySlug, subcategorySlug] = route.split("/");
    const category = all.portfolio_categories.find(x => x.slug === categorySlug);
    tables.portfolio_subcategories = all.portfolio_subcategories.filter(x => x.category_id === category?.id);
    const sub = tables.portfolio_subcategories.find(x => x.slug === subcategorySlug);
    tables.portfolio_images = all.portfolio_images.filter(x => x.subcategory_id === sub?.id);
  }
  return tables;
}
export const serializePublicContent = data => JSON.stringify(data).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
