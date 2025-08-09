import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { question, lang } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  if (!question) {
    return NextResponse.json({ error: 'No question provided.' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: lang === 'es' ? 'Responde en español.' : 'Respond in English.' },
          { role: 'user', content: question },
        ],
        max_tokens: 512,
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return NextResponse.json({ answer: data.choices[0].message.content });
    } else {
      return NextResponse.json({ error: 'No answer from OpenAI.' }, { status: 500 });
    }
  } catch (e) {
    return NextResponse.json({ error: 'OpenAI API error.' }, { status: 500 });
  }
}
