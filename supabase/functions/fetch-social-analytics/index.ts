import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchInstagramAnalytics(conn: any) {
  const { access_token, account_id } = conn;
  if (!access_token || !account_id) return null;
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${account_id}?fields=followers_count,follows_count,media_count,username&access_token=${access_token}`);
    const data = await res.json();
    if (data.error) return { error: data.error.message };
    return { followers: data.followers_count || 0, following: data.follows_count || 0, posts_count: data.media_count || 0, account_name: data.username };
  } catch (e: any) { return { error: e.message }; }
}

async function fetchTikTokAnalytics(conn: any) {
  if (!conn.access_token) return null;
  try {
    const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,following_count,likes_count,video_count", { headers: { Authorization: `Bearer ${conn.access_token}` } });
    const data = await res.json();
    if (data.error?.code) return { error: data.error.message };
    const u = data.data?.user || {};
    return { followers: u.follower_count || 0, following: u.following_count || 0, likes: u.likes_count || 0, posts_count: u.video_count || 0, account_name: u.display_name };
  } catch (e: any) { return { error: e.message }; }
}

async function fetchYouTubeAnalytics(conn: any) {
  if (!conn.access_token) return null;
  try {
    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true", { headers: { Authorization: `Bearer ${conn.access_token}` } });
    const data = await res.json();
    if (!data.items?.length) return { error: "No channel found" };
    const stats = data.items[0].statistics;
    return { followers: parseInt(stats.subscriberCount) || 0, posts_count: parseInt(stats.videoCount) || 0, reach: parseInt(stats.viewCount) || 0, account_name: data.items[0].snippet.title };
  } catch (e: any) { return { error: e.message }; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const targetPlatform = body.platform;
    const query = supabase.from("social_platform_connections").select("*").eq("is_active", true).eq("connection_status", "connected");
    if (targetPlatform) query.eq("platform", targetPlatform);
    const { data: connections } = await query;
    if (!connections?.length) return new Response(JSON.stringify({ message: "No connected platforms", results: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const results = [];
    const today = new Date().toISOString().split("T")[0];
    for (const conn of connections) {
      let analytics: any = null;
      switch (conn.platform) { case "instagram": analytics = await fetchInstagramAnalytics(conn); break; case "tiktok": analytics = await fetchTikTokAnalytics(conn); break; case "youtube": analytics = await fetchYouTubeAnalytics(conn); break; }
      if (analytics && !analytics.error) {
        await supabase.from("social_analytics").upsert({ platform: conn.platform, metric_date: today, followers: analytics.followers || 0, likes: analytics.likes || 0, reach: analytics.reach || 0, impressions: analytics.impressions || 0, profile_views: analytics.profile_views || 0, website_clicks: analytics.website_clicks || 0 }, { onConflict: "platform,metric_date" });
        results.push({ platform: conn.platform, status: "success", data: analytics });
      } else {
        results.push({ platform: conn.platform, status: "error", error: analytics?.error });
      }
    }
    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
