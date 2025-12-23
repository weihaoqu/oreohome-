import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json({ 
        error: 'API key not configured',
        details: 'Please set GEMINI_API_KEY in .env.local file'
      }, { status: 500 });
    }

    const { audio, audioMimeType, prompt, model = 'gemini-2.0-flash-exp', maxItems = 5 } = await request.json();

    if (!audio) {
      return NextResponse.json({ error: 'Audio is required' }, { status: 400 });
    }

    const base64Audio = audio.split(',')[1] || audio;
    
    const generativeModel = genAI.getGenerativeModel({ model });

    const fullPrompt = prompt || `You are a home inventory assistant. Identify up to ${maxItems} items from this audio recording. 
The user might mention items in Chinese or English. 
Return a JSON array with each item having: "item" (name), "quantity" (number), "unit" (string), and optional "tags" (array of strings).`;

    const result = await generativeModel.generateContent([
      { text: fullPrompt },
      {
        inlineData: {
          mimeType: audioMimeType || 'audio/webm',
          data: base64Audio,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const items = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
  } catch (error: any) {
    console.error('Audio recognition error:', error);
    return NextResponse.json({ 
      error: 'Failed to process audio',
      details: error.message 
    }, { status: 500 });
  }
}
