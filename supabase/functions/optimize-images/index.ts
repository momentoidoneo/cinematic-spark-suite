import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|bmp|tiff)$/i;

async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  folder = ""
): Promise<string[]> {
  const paths: string[] = [];
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 1000 });

  if (error || !data) return paths;

  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue;
    const fullPath = folder ? `${folder}/${item.name}` : item.name;

    if (item.id) {
      // It's a file
      if (IMAGE_EXTENSIONS.test(item.name)) {
        paths.push(fullPath);
      }
    } else {
      // It's a folder – recurse
      const nested = await listAllFiles(supabase, bucket, fullPath);
      paths.push(...nested);
    }
  }

  return paths;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, bucket, files } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Action: list – return all image files in the bucket
    if (action === "list") {
      const buckets = bucket
        ? [bucket]
        : ["portfolio", "social-media-assets"];
      const allFiles: { bucket: string; path: string; size: number }[] = [];

      for (const b of buckets) {
        const paths = await listAllFiles(supabase, b);
        for (const p of paths) {
          // Get file metadata for size
          const { data } = await supabase.storage.from(b).download(p);
          const size = data ? (await data.arrayBuffer()).byteLength : 0;
          allFiles.push({ bucket: b, path: p, size });
        }
      }

      return new Response(JSON.stringify({ files: allFiles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: optimize – process a batch of files
    if (action === "optimize") {
      const results: {
        path: string;
        bucket: string;
        status: string;
        original_size?: number;
        optimized_size?: number;
        error?: string;
      }[] = [];

      for (const file of files) {
        try {
          const { data, error } = await supabase.storage
            .from(file.bucket)
            .download(file.path);

          if (error || !data) {
            results.push({
              path: file.path,
              bucket: file.bucket,
              status: "error",
              error: error?.message || "No data",
            });
            continue;
          }

          const buffer = new Uint8Array(await data.arrayBuffer());
          const originalSize = buffer.length;

          // Decode
          const img = await Image.decode(buffer);

          // Resize if wider than MAX_WIDTH
          let resized = false;
          if (img.width > MAX_WIDTH) {
            const ratio = MAX_WIDTH / img.width;
            img.resize(MAX_WIDTH, Math.round(img.height * ratio));
            resized = true;
          }

          // Encode as JPEG
          const optimized = await img.encodeJPEG(JPEG_QUALITY);

          // Only replace if smaller or was resized
          if (optimized.length < originalSize || resized) {
            const { error: uploadError } = await supabase.storage
              .from(file.bucket)
              .update(file.path, optimized, {
                contentType: "image/jpeg",
                upsert: true,
              });

            if (uploadError) {
              // Try upload with upsert if update fails
              await supabase.storage
                .from(file.bucket)
                .upload(file.path, optimized, {
                  contentType: "image/jpeg",
                  upsert: true,
                });
            }

            results.push({
              path: file.path,
              bucket: file.bucket,
              status: "optimized",
              original_size: originalSize,
              optimized_size: optimized.length,
            });
          } else {
            results.push({
              path: file.path,
              bucket: file.bucket,
              status: "skipped",
              original_size: originalSize,
              optimized_size: originalSize,
            });
          }
        } catch (e) {
          results.push({
            path: file.path,
            bucket: file.bucket,
            status: "error",
            error: e.message,
          });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
