// API endpoint to generate image prompt using Gemini 2.5 Flash Lite

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { daysAgo } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  try {
    const today = new Date();
    const baselineDate = new Date('2025-09-25'); // September 25th, 2025
    const daysSinceBaseline = Math.floor((today - baselineDate) / (1000 * 60 * 60 * 24));
    
    const prompt = `I take a selfie every single day. This image is the original selfie. It was taken ${Math.abs(daysSinceBaseline)} days ago, on September 25th, 2025 in New York, New York. Create an image prompt for my selfie that would take place today ${Math.abs(daysSinceBaseline)} days into the ${daysSinceBaseline < 0 ? 'past' : 'future'}. Think: What would I be doing, where am I, what would I look like, what will the time difference have done to my hair, body, clothes, activities etc.

Return in this format:
[image prompt, caption for the selfie]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No text generated from Gemini');
    }

    // Parse the response to extract prompt and caption
    const match = generatedText.match(/\[(.*?),\s*(.*?)\]/);
    if (match) {
      const imagePrompt = match[1].trim();
      const caption = match[2].trim();
      
      res.status(200).json({ 
        imagePrompt, 
        caption,
        rawResponse: generatedText,
        daysSinceBaseline
      });
    } else {
      // Fallback parsing if format doesn't match exactly
      res.status(200).json({ 
        imagePrompt: generatedText,
        caption: "Another day, another selfie! 📸",
        rawResponse: generatedText,
        daysSinceBaseline
      });
    }

  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Failed to generate prompt', details: error.message });
  }
}
