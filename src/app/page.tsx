
'use client'

import HandshakeImage from "./HandshakeImage";
import MoonlitGreatswordImage from "./MoonlitGreatswordImage";
import { useState, useEffect, useRef } from "react";
import { translations } from "./i18n";
import { invaderNPCs, invaderLoreQuestions } from "./invaderData";

export default function Home() {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ question: string; answer: string; invader?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jollyCoop, setJollyCoop] = useState(false);
  const [invaderMsg, setInvaderMsg] = useState<string | null>(null);
  const invaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const invaderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[lang];

  // Helper to pick a random element
  function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Helper to pick a random invader and question
  function getRandomInvader() {
    const npc = randomFrom(invaderNPCs);
    let game: keyof typeof invaderLoreQuestions = "Dark Souls";
    if (npc.includes("Elden Ring")) game = "Elden Ring";
    else if (npc.includes("Bloodborne")) game = "Bloodborne";
    else {
      // Guess by name
      if (["Nerijus", "Okina", "Henricus", "Anastasia", "Magnus", "Eleonora", "Juno Hoslow"].some(n => npc.includes(n))) game = "Elden Ring";
      if (["Yurie", "Henryk", "Bell-ringing Woman", "Bloody Crow", "Shade of Father Gascoigne", "Madman Waller"].some(n => npc.includes(n))) game = "Bloodborne";
    }
    const loreQ = randomFrom(invaderLoreQuestions[game]);
    return { npc, game, loreQ };
  }

  // Timed invader event logic
  useEffect(() => {
    function triggerInvader() {
      const { npc, game, loreQ } = getRandomInvader();
      setInvaderMsg(`Invaded by ${npc}`);
      setChat(prev => [
        {
          question: `Invader ${npc} (${game}): ${loreQ}`,
          answer: "",
          invader: true
        },
        ...prev
      ]);
      setTimeout(() => setInvaderMsg(null), 6000); // Hide message after 6s
    }
    // First after 5 min, then every 20 min
    invaderTimeoutRef.current = setTimeout(() => {
      triggerInvader();
      invaderIntervalRef.current = setInterval(triggerInvader, 20 * 60 * 1000);
    }, 5 * 60 * 1000);
    return () => {
      if (invaderTimeoutRef.current) clearTimeout(invaderTimeoutRef.current);
      if (invaderIntervalRef.current) clearInterval(invaderIntervalRef.current);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang, jollyCoop }),
      });
      const data = await res.json();
      if (data.answer) {
        setChat(prev => [{ question, answer: data.answer }, ...prev]); // latest at top
        setQuestion("");
      } else {
        setError(t.error);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-row items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d2a2e] to-[#bfa76a] p-4 relative">
      {/* Invader message overlay */}
      {invaderMsg && (
        <div
          className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 text-5xl text-red-700 font-serif animate-pulse pointer-events-none select-none"
          style={{ fontFamily: 'Garamond, serif', textShadow: '2px 2px 8px #000' }}
        >
          {invaderMsg}
        </div>
      )}
      <div className="flex flex-col items-center mr-8">
        <MoonlitGreatswordImage />
      </div>
      <div className="w-full max-w-xl bg-[#23201b] rounded-2xl shadow-lg p-8 flex flex-col gap-8 items-center border-4 border-[#bfa76a]">
        <HandshakeImage />
        <h1 className="text-2xl font-bold text-center mb-2 text-[#bfa76a] drop-shadow">AI Q&A</h1>
        <div className="flex items-center gap-4 mb-2">
          <label className="flex gap-2 items-center text-[#bfa76a]">
            <span>{t.language}:</span>
            <select
              value={lang}
              onChange={e => setLang(e.target.value as 'en' | 'es')}
              className="border rounded px-2 py-1 bg-[#23201b] text-[#bfa76a] border-[#bfa76a]"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <label className="flex gap-2 items-center text-[#bfa76a]">
            <input
              type="checkbox"
              checked={jollyCoop}
              onChange={e => setJollyCoop(e.target.checked)}
              className="accent-[#bfa76a] w-5 h-5"
            />
            <span>Jolly CoOp</span>
          </label>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">
          <input
            className="border rounded px-3 py-2 w-full bg-[#2d2a2e] text-[#bfa76a] border-[#bfa76a] placeholder-[#bfa76a]/60"
            type="text"
            placeholder={t.placeholder}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-[#bfa76a] text-[#23201b] px-6 py-2 rounded hover:bg-[#e5c97b] disabled:opacity-50 font-bold"
            disabled={loading || !question.trim()}
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>
        {chat.length > 0 && (
          <div className="w-full bg-[#2d2a2e] border border-[#bfa76a] rounded p-4 mt-2 max-h-96 overflow-y-auto flex flex-col-reverse">
            <strong className="text-[#bfa76a]">{t.answer}:</strong>
            <div className="mt-2 flex flex-col gap-4">
              {chat.map((entry, idx) => (
                <div key={idx} className="">
                  <div className={`font-semibold ${entry.invader ? 'text-red-700 font-serif' : 'text-[#bfa76a]'}`} style={entry.invader ? { fontFamily: 'Garamond, serif' } : {}}>
                    {entry.invader ? entry.question : `${t.language === 'Español' ? 'Pregunta' : 'Question'}: `}
                    {!entry.invader && <span className="font-normal text-white">{entry.question}</span>}
                  </div>
                  {entry.answer && (
                    <div className={entry.invader ? "text-red-400 mt-1" : "text-[#e5c97b] mt-1"}>{entry.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded p-4 mt-2 text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
