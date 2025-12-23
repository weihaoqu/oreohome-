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

    const { image, prompt, model = 'gemini-2.0-flash-exp', maxItems = 5 } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const base64Image = image.split(',')[1] || image;
    
    const generativeModel = genAI.getGenerativeModel({ model });

    const fullPrompt = prompt || `你是一个极度细致的家庭仓储管理员。请识别图片中所有的物品。
要求：
1. 识别出具体的【品牌】和【完整产品名】（例如：不要只说"面霜"，要说"雅诗兰黛小棕瓶面霜"）。
2. 准确识别每种物品的【数量】。
3. 为每种物品选择合适的【单位】（如：瓶、盒、支、袋、个）。
4. 即使图片中有几十种不同的物品，也要逐一列出，不要合并。
5. 如果看到包装上的详细规格（如 50ml, 100g），请一并写在产品名中。

请以 JSON 数组格式返回。每个对象包含：
"item" (string: 品牌+产品全名+规格), 
"quantity" (number: 数量), 
"unit" (string: 单位)，
"tags" (array: 标签，可选)。`;

    const result = await generativeModel.generateContent([
      { text: fullPrompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
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
    console.error('Image recognition error:', error);
    return NextResponse.json({ 
      error: 'Failed to process image',
      details: error.message 
    }, { status: 500 });
  }
}
