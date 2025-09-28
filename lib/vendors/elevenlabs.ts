
export async function narrate(text: string, voice: "male"|"female"="female"){
  const key = process.env.ELEVENLABS_API_KEY;
  if(!key){
    return { audioUrl: null, note: "ElevenLabs mock: no key provided." };
  }
  const voiceId = voice === "female" ? (process.env.ELEVENLABS_VOICE_FEMALE || "Rachel") : (process.env.ELEVENLABS_VOICE_MALE || "Adam");
  try{
    const resp = await fetch("https://api.elevenlabs.io/v1/text-to-speech/"+voiceId, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" })
    });
    const arrayBuffer = await resp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return { audioUrl: "data:audio/mpeg;base64,"+base64, note: "ElevenLabs audio data URL" };
  } catch(e:any){
    return { audioUrl: null, note: "ElevenLabs error; no audio." };
  }
}
