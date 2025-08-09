
'use client'

import HandshakeImage from "./HandshakeImage";
import { useState } from "react";
import { translations } from "./i18n";

export default function Home() {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = translations[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, lang }),
      });
      const data = await res.json();
      if (data.answer) {
        setChat(prev => [...prev, { question, answer: data.answer }]);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 items-center">
        <HandshakeImage />
        <h1 className="text-2xl font-bold text-center mb-2">AI Q&A</h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">
          <label className="flex gap-2 items-center">
            <span>{t.language}:</span>
            <select
              value={lang}
              onChange={e => setLang(e.target.value as 'en' | 'es')}
              className="border rounded px-2 py-1"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <input
            className="border rounded px-3 py-2 w-full"
            type="text"
            placeholder={t.placeholder}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !question.trim()}
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>
        {chat.length > 0 && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded p-4 mt-2 max-h-96 overflow-y-auto">
            <strong>{t.answer}:</strong>
            <div className="mt-2 flex flex-col gap-4">
              {chat.map((entry, idx) => (
                <div key={idx} className="">
                  <div className="font-semibold text-gray-700">{t.language === 'Español' ? 'Pregunta' : 'Question'}: <span className="font-normal">{entry.question}</span></div>
                  <div className="text-blue-900 mt-1">{entry.answer}</div>
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
