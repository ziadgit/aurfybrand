const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, message: "Use POST.", code: "invalid_request_error" }, 405);

  const AI_API_TOKEN = Deno.env.get("AI_API_TOKEN_d14079b4625f");
  if (!AI_API_TOKEN) {
    console.error("aurfy-image-status: AI token secret is missing");
    return json({ success: false, message: "Image generation is not configured on this backend.", code: "configuration_error" }, 503);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { task_id?: string };
    const taskId = typeof body.task_id === "string" ? body.task_id.trim() : "";
    if (!taskId || taskId.length > 200 || !/^[a-zA-Z0-9_-]+$/.test(taskId)) {
      return json({ success: false, message: "A valid task_id is required.", code: "invalid_request_error" }, 400);
    }

    const response = await fetch(`https://api.enter.pro/code/api/v1/ai/tasks/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${AI_API_TOKEN}` },
      signal: AbortSignal.timeout(20000),
    });
    const data = (await response.json().catch(() => ({}))) as {
      task_id?: string;
      status?: string;
      images?: { url?: string; meta_data?: unknown }[];
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      console.error("aurfy-image-status upstream error", response.status);
      return json(
        { success: false, message: data.message || "The image task status could not be read.", code: "api_error" },
        response.status,
      );
    }

    return json({
      success: true,
      task_id: data.task_id ?? taskId,
      status: data.status ?? "processing",
      images: (data.images ?? []).filter((image) => typeof image.url === "string" && image.url.length > 0),
      error: data.error,
    });
  } catch (error) {
    console.error("aurfy-image-status failed", error instanceof Error ? error.message : String(error));
    return json({ success: false, message: "The image task status could not be read.", code: "internal_error" }, 500);
  }
});
