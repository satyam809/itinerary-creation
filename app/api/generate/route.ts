import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination, days, tripType } = body;

    if (!destination || !days || !tripType) {
      return NextResponse.json(
        { error: "`destination`, `days` and `tripType` are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a highly engaging and well-structured ${days}-day ${tripType} trip itinerary for ${destination}.
For each day, include:

1. Morning, afternoon, evening, and night activities
2. The top must-visit sights
3. Recommended local foods or dishes to try
4. Practical travel tips specific to the location

Format the output clearly by day, keep it concise, and ensure the itinerary feels exciting, helpful, and easy to follow.
`;

    const ollamaUrl = "https://ollama.com/api/generate";
    const ollamaModel = "gpt-oss:120b";


    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.OLLAMA_API_KEY}`;
    }

    let res: Response;
    try {
      res = await fetch(ollamaUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ model: ollamaModel, prompt, stream: false }),
      });
    } catch (fetchErr: any) {
      console.error("Network error contacting Ollama:", fetchErr);
      return NextResponse.json(
        { error: "Network error when contacting Ollama service", detail: String(fetchErr) },
        { status: 502 }
      );
    }

    // Try to read the response body as text for diagnostics, then attempt JSON parse.
    let textBody: string | null = null;
    let data: any = null;
    try {
      textBody = await res.clone().text();
      try {
        data = JSON.parse(textBody);
      } catch (e) {
        // not JSON — leave data null and continue to diagnostic handling
      }
    } catch (e) {
      // Couldn't read body at all
      console.error("Failed reading Ollama response body:", e);
    }

    // If response not OK, return diagnostics including status, headers, and body
    if (!res.ok) {
      const headersObj = Object.fromEntries(res.headers?.entries?.() ?? []);
      const result: any = { error: "Ollama service returned non-OK status", status: res.status, headers: headersObj, body: textBody ?? null };
      if (res.status === 401) {
        result.hint = "401 Unauthorized — check OLLAMA_API_KEY and OLLAMA_URL; cloud endpoints typically require a bearer API key.";
      }
      return NextResponse.json(result, { status: 502 });
    }

    // If we have parsed JSON data, attempt to extract text as before
    let extracted: string | null = null;
    if (data != null) {
      if (typeof data === "string") {
        extracted = data;
      } else if (data.output && typeof data.output === "string") {
        extracted = data.output;
      } else if (data.text && typeof data.text === "string") {
        extracted = data.text;
      } else if (data.response && typeof data.response === "string") {
        extracted = data.response;
      } else if (Array.isArray(data.results) && data.results.length) {
        extracted = data.results.map((r: any) => r.text ?? r.content ?? String(r)).join("\n");
      } else if (Array.isArray(data.responses) && data.responses.length) {
        extracted = data.responses.map((r: any) => r.content ?? r.text ?? String(r)).join("\n");
      }
    }

    // If there's no JSON but we have a text body, return that as the generated text
    if (!extracted && textBody) {
      return NextResponse.json({ text: textBody, raw: textBody });
    }

    // Final fallback: if nothing useful, return diagnostics to help debugging
    if (!extracted) {
      const headersObj = Object.fromEntries(res.headers?.entries?.() ?? []);
      return NextResponse.json(
        { error: "Invalid response from Ollama service", status: res.status, headers: headersObj, body: textBody ?? null, raw: data ?? null },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: extracted, raw: data });
  } catch (err: any) {
    console.error("/api/generate error:", err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
