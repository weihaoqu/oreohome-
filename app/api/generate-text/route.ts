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

    const { prompt, model = 'gemini-2.0-flash-exp' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    const generativeModel = genAI.getGenerativeModel({ model });

    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Text generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate text',
      details: error.message 
    }, { status: 500 });
  }
}
