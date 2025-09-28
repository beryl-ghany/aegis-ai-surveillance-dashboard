
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
  const { q } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  // If GEMINI_API_KEY present, try hitting Gemini; else return a smart mock.
  if(!apiKey){
    const canned = `Summary: 3 detections today with high confidence. Chain-of-custody intact. Tip: mark predictive outputs as probabilistic to avoid evidence contamination.`;
    return Response.json({ answer: canned });
  }
  try{
    // Minimal Gemini REST call (text-only) — developers should expand to multimodal.
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are Aegis Bot. The user asked: ${q}. Respond concisely with a compliance-aware summary.` }] }]
      })
    });
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer from Gemini.";
    return Response.json({ answer: text });
  } catch(e:any){
    return Response.json({ answer: "Gemini error. Falling back: detections summarized. Confidence high; post anonymized alert if needed." });
  }
}
