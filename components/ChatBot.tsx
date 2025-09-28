
'use client';
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
type Msg = { role: 'user'|'assistant', content: string };

export default function ChatBot(){
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi, I'm the Aegis Bot (Gemini-ready). Ask me to summarize detections or check compliance." }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function onSend(e?: React.FormEvent){
    e?.preventDefault();
    const q = input.trim();
    if(!q) return;
    
    setMessages(m=>[...m, { role:'user', content: q }]);
    setInput("");
    
    try {
      const res = await fetch("/api/chat", { 
        method: "POST", 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q }) 
      });
      
      if (!res.ok) {
        throw new Error(`Chat API error: ${res.statusText}`);
      }
      
      const data = await res.json();
      setMessages(m=>[...m, { role:'assistant', content: data.answer || "No response from the bot." }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(m=>[...m, { role:'assistant', content: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
  }
  return (
    <section 
      id="chat" 
      className="border border-slate-800 rounded-lg bg-aegis-card flex flex-col h-[420px]" 
      aria-label="Aegis chat bot"
      role="region"
    >
      <div className="px-3 py-2 border-b border-slate-800 text-sm font-medium">
        Aegis Bot
        <span className="sr-only"> - AI assistant for surveillance analysis</span>
      </div>
      
      <div 
        className="flex-1 overflow-auto space-y-3 p-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((m,i)=> (
          <div 
            key={i} 
            className={m.role==='user'?'text-right':'text-left'}
            role={m.role === 'user' ? 'user-message' : 'assistant-message'}
          >
            <span 
              className={`inline-block max-w-[85%] px-3 py-2 rounded-md ${
                m.role==='user'
                  ?'bg-[#0e1520] border border-slate-700 text-slate-200'
                  :'bg-black/30 border border-slate-800 text-slate-300'
              }`}
              aria-label={`${m.role === 'user' ? 'You said' : 'Bot responded'}: ${m.content}`}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={endRef} aria-hidden="true"/>
      </div>
      
      <form 
        onSubmit={onSend} 
        className="p-2 border-t border-slate-800 flex gap-2"
        role="form"
        aria-label="Send message to bot"
      >
        <label htmlFor="bot-input" className="sr-only">
          Type your message to the Aegis bot
        </label>
        <input 
          id="bot-input" 
          className="flex-1 bg-[#0e1520] border border-slate-700 rounded-md px-3 py-2 focus-ring text-slate-200 placeholder-slate-400" 
          value={input} 
          onChange={(e)=>setInput(e.target.value)} 
          placeholder="Ask about detections, compliance, or security analysis…"
          aria-describedby="bot-help"
          autoComplete="off"
          maxLength={500}
        />
        <button 
          className="px-3 py-2 rounded-md bg-aegis-mint text-slate-900 hover:bg-aegis-mint/80 focus-ring font-medium transition-colors" 
          aria-label="Send message to bot"
          type="submit"
          disabled={!input.trim()}
        >
          <Send size={16} aria-hidden="true"/>
          <span className="sr-only">Send</span>
        </button>
      </form>
      
      <div id="bot-help" className="sr-only">
        Type your question about surveillance data, detections, or security analysis. Press Enter to send or click the send button.
      </div>
    </section>
  )
}
