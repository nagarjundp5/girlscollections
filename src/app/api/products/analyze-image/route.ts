import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { dbService } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { imageUrl } = await request.json();

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Valid imageUrl string is required' }, { status: 400 });
    }

    // SSRF & protocol validation: Ensure URL is HTTP/HTTPS
    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json({ error: 'Invalid image URL protocol' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Malformed image URL' }, { status: 400 });
    }

    // Fetch existing store categories from Neon DB
    let validCategories: string[] = ['Ethnic Wear', 'Western Wear', 'Sarees', 'Dresses', 'Tops & Tees', 'Co-ord Sets', 'Bottomwear'];
    try {
      const categories = await dbService.getAllCategories();
      if (Array.isArray(categories) && categories.length > 0) {
        validCategories = categories.map((c: any) => c.name);
      }
    } catch (catErr) {
      console.warn('[Analyze Image] Failed to fetch DB categories, using defaults:', catErr);
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.warn('[Analyze Image] GEMINI_API_KEY not configured on server.');
      return NextResponse.json({
        error: true,
        message: 'Gemini API key is not configured on server. Please fill fields manually.',
      }, { status: 200 });
    }

    // Fetch the image to pass as inline base64 to Gemini Vision
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      return NextResponse.json({ error: true, message: 'Could not fetch image for analysis' }, { status: 400 });
    }

    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';

    const systemPrompt = `You are a fashion product metadata generator for "The Girls Collections".
Given an image of a garment, extract basic details into raw JSON (no markdown fences):
{
  "productName": "Concise 2-4 word garment title (e.g., 'Embroidered Floral Cotton Kurti')",
  "slug": "url-safe-kebab-case-string",
  "description": "Short 1-2 sentence description highlighting the style and fabric feel.",
  "seoTags": ["5-8 relevant lowercase keywords"],
  "suggestedCategory": "Pick closest from: ${JSON.stringify(validCategories)}",
  "genderTargeting": "women"
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    
    // Fallback to gemini-3.5-flash-lite if gemini-3.5-flash is unavailable
    const makeGeminiRequest = async (targetUrl: string) => {
      return await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      });
    };

    let geminiRes = await makeGeminiRequest(geminiUrl);
    if (!geminiRes.ok) {
      console.warn(`[Analyze Image] gemini-3.5-flash endpoint returned ${geminiRes.status}, retrying with gemini-3.5-flash-lite...`);
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
      geminiRes = await makeGeminiRequest(fallbackUrl);
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Analyze Image] Gemini API error:', errText);
      return NextResponse.json({
        error: true,
        message: 'Gemini Vision AI analysis failed. Please enter product details manually.',
      }, { status: 200 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON object safely using regex matcher
    let parsed: any = {};
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (parseErr) {
        console.error('[Analyze Image] Failed to parse matched JSON from Gemini response:', match[0]);
      }
    } else {
      console.error('[Analyze Image] No JSON object found in Gemini response:', rawText);
    }

    // Format slug cleanly
    const fallbackSlug = (parsed.productName || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    return NextResponse.json({
      success: true,
      data: {
        productName: parsed.productName || '',
        slug: parsed.slug || fallbackSlug,
        description: parsed.description || '',
        seoTags: Array.isArray(parsed.seoTags) ? parsed.seoTags : [],
        suggestedCategory: parsed.suggestedCategory || validCategories[0],
        genderTargeting: (parsed.genderTargeting || 'WOMEN').toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error('[Analyze Image] Unexpected exception:', error);
    return NextResponse.json({
      error: true,
      message: 'Failed to analyze product image.',
    }, { status: 200 });
  }
}
