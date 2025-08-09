import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { question, lang, jollyCoop } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not set.' }, { status: 500 });
  }

  if (!question) {
    return NextResponse.json({ error: 'No question provided.' }, { status: 400 });
  }

  try {
    let systemPrompt = '';
    if (jollyCoop) {
      systemPrompt = lang === 'es'
        ? 'Responde en español y responde como Solaire de Astora de Dark Souls. Habla con entusiasmo sobre el sol, la luz y la aventura, y usa frases características de Solaire.'
        : 'Respond in English and answer as Solaire of Astora from Dark Souls. Speak with enthusiasm about the sun, light, and adventure, and use Solaire’s characteristic phrases.';
    } else {
      systemPrompt = lang === 'es' ? 'Responde en español.' : 'Respond in English.';
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
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
