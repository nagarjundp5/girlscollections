export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// ⚠️  SECURITY: GEMINI_API_KEY is a server-only env var.
// It is read exclusively inside this Route Handler and never serialised
// into any client bundle or API response.

const TGC_SYSTEM_PROMPT = `Analyse the uploaded garment photo and return strictly raw JSON:
{
  "title": "Concise 2–4 word garment name (e.g. 'Boxy Washed Cotton Tee')",
  "description": "Short 1–2 sentence description of style and fit.",
  "tags": ["5–8 lowercase search tags"]
}
No markdown. No extra text.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Hard-fail if key is not configured — do not silently return placeholder data
    if (!apiKey || apiKey.trim() === '') {
      console.error('[Gemini] GEMINI_API_KEY is not set in .env.local');
      return NextResponse.json(
        { error: 'AI generation is not configured. Add GEMINI_API_KEY to .env.local.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { imageBase64, imageUrl, mimeType: bodyMimeType } = body;

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    let finalBase64: string;
    let finalMimeType: string = bodyMimeType || 'image/jpeg';

    if (imageUrl && typeof imageUrl === 'string') {
      // Path A: server-side URL fetch — no CORS issues, works with any Cloudinary URL
      try {
        const imgRes = await fetch(imageUrl, { headers: { Accept: 'image/*' } });
        if (!imgRes.ok) {
          return NextResponse.json(
            { error: `Failed to fetch image from URL (HTTP ${imgRes.status}).` },
            { status: 400 }
          );
        }
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        finalMimeType = allowedMimeTypes.find(t => contentType.includes(t)) ?? 'image/jpeg';
        const arrayBuffer = await imgRes.arrayBuffer();
        finalBase64 = Buffer.from(arrayBuffer).toString('base64');
      } catch (fetchErr: any) {
        console.error('[generate-description] Failed to fetch imageUrl:', fetchErr?.message);
        return NextResponse.json(
          { error: 'Could not fetch image from the provided URL.' },
          { status: 400 }
        );
      }
    } else if (imageBase64 && typeof imageBase64 === 'string') {
      // Path B: base64 inline data (existing file-upload flow — unchanged)
      finalBase64 = imageBase64;
      if (!allowedMimeTypes.includes(finalMimeType)) {
        return NextResponse.json({ error: 'Unsupported image mimeType.' }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required.' },
        { status: 400 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: TGC_SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType: finalMimeType,
                  data: finalBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 1024,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error(`[Gemini] HTTP ${geminiRes.status}:`, errBody);
      return NextResponse.json(
        { error: `Gemini API error (${geminiRes.status}). Check server logs.` },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();

    // Correct response path: candidates[0].content.parts[0].text
    const rawText: string | undefined =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('[Gemini] Unexpected response shape:', JSON.stringify(geminiData).slice(0, 500));
      return NextResponse.json({ error: 'Gemini returned an empty response.' }, { status: 502 });
    }

    let parsed: { title?: string; description?: string; tags?: string[] } = {};
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (err: any) {
        console.error('[Gemini] Failed to parse JSON from matched text:', match[0]);
      }
    }

    return NextResponse.json({
      title: (parsed.title ?? '').trim(),
      description: (parsed.description ?? '').trim(),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((t) => String(t).toLowerCase().trim()) : [],
    });

  } catch (error: any) {
    console.error('[generate-description] Unhandled error:', error?.message ?? error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
