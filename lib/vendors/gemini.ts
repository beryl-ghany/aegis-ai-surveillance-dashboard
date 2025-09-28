
export async function askGemini(prompt: string){
  const apiKey = process.env.GEMINI_API_KEY;
  if(!apiKey){
    return "Gemini mock: 3 detections with high confidence. Label predictive outputs as probabilistic.";
  }
  try{
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="+apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }]}]
      })
    });
    const data = await resp.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer from Gemini.";
  } catch(e:any){
    return "Gemini error; using fallback summary.";
  }
}
