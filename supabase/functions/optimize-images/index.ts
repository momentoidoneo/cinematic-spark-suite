import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_WIDTH = 1920;
const QUALITY = 80;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp|bmp|tiff)$/i;

async function listAllFiles(
  supabase: ReturnType<typeof createClient>,
  bucket: string,
  folder = ""
): Promise<{ path: string; size: number }[]> {
  const results: { path: string; size: number }[] = [];
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 1000 });

  if (error || !data) return results;

  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue;
    const fullPath = folder ? `${folder}/${item.name}` : item.name;

    if (item.metadata && item.id) {
      if (IMAGE_EXTENSIONS.test(item.name)) {
        results.push({ path: fullPath, size: (item.metadata as any)?.size || 0 });
      }
    } else if (!item.id) {
      const nested = await listAllFiles(supabase, bucket, fullPath);
      results.push(...nested);
    }
  }

  return results;
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

    // Action: list
    if (action === "list") {
      const buckets = bucket ? [bucket] : ["portfolio", "social-media-assets"];
      const allFiles: { bucket: string; path: string; size: number }[] = [];

      for (const b of buckets) {
        const found = await listAllFiles(supabase, b);
        for (const f of found) {
          allFiles.push({ bucket: b, path: f.path, size: f.size });
        }
      }

      return new Response(JSON.stringify({ files: allFiles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: optimize – use Supabase Storage transform endpoint
    if (action === "optimize") {
      const results: {
        path: string;
        bucket: string;
        status: string;
        original_size?: number;
        optimized_size?: number;
        error?: string;
      }[] = [];

      // Process ONE file at a time to avoid memory issues
      for (const file of files) {
        try {
          // Download original to get its size
          const { data: origData, error: dlError } = await supabase.storage
            .from(file.bucket)
            .download(file.path);

          if (dlError || !origData) {
            results.push({ path: file.path, bucket: file.bucket, status: "error", error: dlError?.message || "Download failed" });
            continue;
          }

          const originalBytes = await origData.arrayBuffer();
          const originalSize = originalBytes.byteLength;

          // Use Supabase Storage render/transform endpoint for resizing
          const transformUrl = `${supabaseUrl}/storage/v1/render/image/public/${file.bucket}/${file.path}?width=${MAX_WIDTH}&quality=${QUALITY}&resize=contain`;

          const transformRes = await fetch(transformUrl, {
            headers: { Authorization: `Bearer ${serviceKey}` },
          });

          if (!transformRes.ok) {
            // Transform API not available – try serving original with just quality reduction
            // Fall back: re-upload original (no optimization possible without transform API)
            const altUrl = `${supabaseUrl}/storage/v1/object/public/${file.bucket}/${file.path}`;
            results.push({
              path: file.path,
              bucket: file.bucket,
              status: "skipped",
              original_size: originalSize,
              optimized_size: originalSize,
              error: "Transform API unavailable",
            });
            continue;
          }

          const optimizedBuffer = await transformRes.arrayBuffer();
          const optimizedSize = optimizedBuffer.byteLength;

          // Only replace if actually smaller
          if (optimizedSize < originalSize) {
            const contentType = transformRes.headers.get("content-type") || "image/jpeg";
            const { error: upError } = await supabase.storage
              .from(file.bucket)
              .update(file.path, new Uint8Array(optimizedBuffer), {
                contentType,
                upsert: true,
              });

            if (upError) {
              // Try upload with upsert
              await supabase.storage
                .from(file.bucket)
                .upload(file.path, new Uint8Array(optimizedBuffer), {
                  contentType,
                  upsert: true,
                });
            }

            results.push({
              path: file.path,
              bucket: file.bucket,
              status: "optimized",
              original_size: originalSize,
              optimized_size: optimizedSize,
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
          results.push({ path: file.path, bucket: file.bucket, status: "error", error: e.message });
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
