-- Target sffgaplkqmmnikqhhftx ONLY. Run after final data delta. Storage hashes must match first.
-- Preserve source timestamps and prevent side effects during migration.
begin;
set local session_replication_role=replica;
update public.blog_posts set cover_image=replace(cover_image,'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/') where cover_image like 'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/%';
update public.portfolio_categories set cover_image=replace(cover_image,'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/') where cover_image like 'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/%';
update public.portfolio_images set image_url=replace(image_url,'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/') where image_url like 'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/%';
update public.portfolio_subcategories set cover_image=replace(cover_image,'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/') where cover_image like 'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/%';
update public.seo_metadata set og_image=replace(og_image,'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/','https://sffgaplkqmmnikqhhftx.supabase.co/storage/v1/object/public/portfolio/') where og_image like 'https://edpqywwtgoiktotxrqrz.supabase.co/storage/v1/object/public/portfolio/%';
commit;
