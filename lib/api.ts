// API utility functions for calling backend endpoints

export async function recognizeImage(image: string, model: string, maxItems = 5, prompt?: string) {
  const response = await fetch('/api/recognize-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image, model, maxItems, prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.details ? `${error.error}: ${error.details}` : error.error || 'Failed to recognize image';
    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function recognizeAudio(audio: string, audioMimeType: string, model: string, maxItems = 5, prompt?: string) {
  const response = await fetch('/api/recognize-audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audio, audioMimeType, model, maxItems, prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.details ? `${error.error}: ${error.details}` : error.error || 'Failed to recognize audio';
    throw new Error(errorMessage);
  }

  return await response.json();
}
export async function generateText(prompt: string, model: string) {
  const response = await fetch('/api/generate-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMessage = error.details ? `${error.error}: ${error.details}` : error.error || 'Failed to generate text';
    throw new Error(errorMessage);
  }

  return await response.json();
}
