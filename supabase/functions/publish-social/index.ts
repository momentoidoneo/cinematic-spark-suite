import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function publishToInstagram(connection: any, content: any) {
  const accessToken = connection.access_token;
  if (!accessToken) return { success: false, error: "No access token configured for Instagram" };
  try {
    const accountId = connection.account_id;
    if (!accountId) return { success: false, error: "No Instagram account ID configured" };
    const mediaParams: any = {
      access_token: accessToken,
      caption: `${content.caption || ""}\n\n${(content.hashtags || []).map((h: string) => `#${h.replace("#", "")}`).join(" ")}`.trim(),
    };
    if (content.media_type === "video" || content.media_type === "reel") {
      mediaParams.media_type = "REELS";
      mediaParams.video_url = content.media_url;
    } else if (content.media_url) {
      mediaParams.image_url = content.media_url;
    } else {
      return { success: false, error: "Instagram requires an image or video URL" };
    }
    const createRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mediaParams) });
    const createData = await createRes.json();
    if (createData.error) return { success: false, error: createData.error.message };
    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${accountId}/media_publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creation_id: createData.id, access_token: accessToken }) });
    const publishData = await publishRes.json();
    if (publishData.error) return { success: false, error: publishData.error.message };
    return { success: true, postId: publishData.id, postUrl: `https://www.instagram.com/p/${publishData.id}/` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function publishToTikTok(connection: any, content: any) {
  const accessToken = connection.access_token;
  if (!accessToken) return { success: false, error: "No access token configured for TikTok" };
  try {
    if (!content.media_url) return { success: false, error: "TikTok requires a video URL" };
    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/inbox/video/init/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        post_info: { title: content.title || "", description: `${content.caption || ""} ${(content.hashtags || []).map((h: string) => `#${h.replace("#", "")}`).join(" ")}`.trim(), privacy_level: "PUBLIC_TO_EVERYONE" },
        source_info: { source: "PULL_FROM_URL", video_url: content.media_url },
      }),
    });
    const initData = await initRes.json();
    if (initData.error?.code) return { success: false, error: initData.error.message || "TikTok API error" };
    return { success: true, postId: initData.data?.publish_id || "pending" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function publishToYouTube(connection: any, content: any) {
  const accessToken = connection.access_token;
  if (!accessToken) return { success: false, error: "No access token configured for YouTube" };
  try {
    if (!content.media_url) return { success: false, error: "YouTube requires a video URL" };
    const metadata = {
      snippet: { title: content.title || "Untitled", description: `${content.caption || ""}\n\n${(content.hashtags || []).map((h: string) => `#${h.replace("#", "")}`).join(" ")}`.trim(), tags: content.hashtags || [], categoryId: "22" },
      status: { privacyStatus: "public", selfDeclaredMadeForKids: false },
    };
    const initRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(metadata),
    });
    if (!initRes.ok) { const errData = await initRes.json().catch(() => ({})); return { success: false, error: errData.error?.message || `YouTube API error: ${initRes.status}` }; }
    const uploadUrl = initRes.headers.get("Location");
    return { success: true, postId: "upload-initiated", postUrl: uploadUrl || undefined };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) throw new Error("Not authenticated");
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) throw new Error("Admin access required");
    }

    const { action, queueId, contentId, platform, publishMode } = await req.json();

    if (action === "enqueue") {
      const { data: content, error: contentErr } = await supabase.from("social_content").select("*").eq("id", contentId).single();
      if (contentErr) throw new Error("Content not found");
      const targetPlatform = platform || content.platform;
      const { data: queueItem, error: queueErr } = await supabase.from("social_publish_queue").insert({
        content_id: contentId, platform: targetPlatform, publish_mode: publishMode || "manual", status: "pending",
        title: content.title, caption: content.caption, hashtags: content.hashtags, media_url: content.image_url || content.video_url, media_type: content.content_type, scheduled_at: content.scheduled_at,
      }).select().single();
      if (queueErr) throw queueErr;
      await supabase.from("social_publish_logs").insert({ queue_id: queueItem.id, platform: targetPlatform, action: "enqueued", status: "success", request_payload: { contentId, publishMode } });
      return new Response(JSON.stringify({ success: true, queueItem }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "publish") {
      const startTime = Date.now();
      const { data: queueItem, error: qErr } = await supabase.from("social_publish_queue").select("*").eq("id", queueId).single();
      if (qErr) throw new Error("Queue item not found");
      await supabase.from("social_publish_queue").update({ status: "processing", attempt_count: (queueItem.attempt_count || 0) + 1 }).eq("id", queueId);
      const { data: connection } = await supabase.from("social_platform_connections").select("*").eq("platform", queueItem.platform).eq("is_active", true).single();
      if (!connection || connection.connection_status !== "connected") {
        await supabase.from("social_publish_queue").update({ status: "failed", last_error: `No active ${queueItem.platform} connection.` }).eq("id", queueId);
        await supabase.from("social_publish_logs").insert({ queue_id: queueId, platform: queueItem.platform, action: "publish_attempt", status: "failed", error_message: "No active platform connection", duration_ms: Date.now() - startTime });
        return new Response(JSON.stringify({ success: false, error: `No active ${queueItem.platform} connection.` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      let result;
      switch (queueItem.platform) {
        case "instagram": result = await publishToInstagram(connection, queueItem); break;
        case "tiktok": result = await publishToTikTok(connection, queueItem); break;
        case "youtube": result = await publishToYouTube(connection, queueItem); break;
        default: result = { success: false, error: `Unsupported platform: ${queueItem.platform}` };
      }
      const duration = Date.now() - startTime;
      if (result.success) {
        await supabase.from("social_publish_queue").update({ status: "published", published_at: new Date().toISOString(), platform_post_id: result.postId, platform_post_url: result.postUrl, platform_response: result }).eq("id", queueId);
        if (queueItem.content_id) { await supabase.from("social_content").update({ status: "published" }).eq("id", queueItem.content_id); }
      } else {
        const shouldRetry = (queueItem.attempt_count || 0) + 1 < (queueItem.max_attempts || 3);
        await supabase.from("social_publish_queue").update({ status: shouldRetry ? "pending" : "failed", last_error: result.error, next_retry_at: shouldRetry ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : null }).eq("id", queueId);
      }
      await supabase.from("social_publish_logs").insert({ queue_id: queueId, platform: queueItem.platform, action: "publish_attempt", status: result.success ? "success" : "failed", response_payload: result, error_message: result.error || null, duration_ms: duration });
      return new Response(JSON.stringify({ success: result.success, result }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "cancel") {
      await supabase.from("social_publish_queue").update({ status: "cancelled" }).eq("id", queueId);
      await supabase.from("social_publish_logs").insert({ queue_id: queueId, platform: platform || "unknown", action: "cancelled", status: "success" });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verify_connection") {
      const { data: connection } = await supabase.from("social_platform_connections").select("*").eq("platform", platform).single();
      if (!connection) return new Response(JSON.stringify({ connected: false, error: "No connection found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      let isValid = false;
      try {
        if (platform === "instagram" && connection.access_token) { const res = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${connection.access_token}`); const data = await res.json(); isValid = !data.error; }
        else if (platform === "tiktok" && connection.access_token) { const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name", { headers: { Authorization: `Bearer ${connection.access_token}` } }); const data = await res.json(); isValid = !data.error?.code; }
        else if (platform === "youtube" && connection.access_token) { const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${connection.access_token}` } }); const data = await res.json(); isValid = !!data.items?.length; }
      } catch { isValid = false; }
      await supabase.from("social_platform_connections").update({ connection_status: isValid ? "connected" : "expired", last_verified_at: new Date().toISOString() }).eq("id", connection.id);
      return new Response(JSON.stringify({ connected: isValid }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
