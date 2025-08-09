
'use client'

import HandshakeImage from "./HandshakeImage";
import MoonlitGreatswordImage from "./MoonlitGreatswordImage";
import { useState } from "react";
import { translations } from "./i18n";

export default function Home() {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jollyCoop, setJollyCoop] = useState(false);

  const t = translations[lang];

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
    <div className="min-h-screen flex flex-row items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d2a2e] to-[#bfa76a] p-4">
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
                  <div className="font-semibold text-[#bfa76a]">{t.language === 'Español' ? 'Pregunta' : 'Question'}: <span className="font-normal text-white">{entry.question}</span></div>
                  <div className="text-[#e5c97b] mt-1">{entry.answer}</div>
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
