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

IMPORTANT: Return EXACTLY in this format with no extra text:

IMAGE PROMPT: [your detailed image prompt here]
CAPTION: [short caption for the selfie here]`;

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

    console.log('Raw Gemini response:', generatedText);
    
    // Parse the response to extract prompt and caption
    let imagePrompt = '';
    let caption = '';
    
    // Try to parse the new format first
    const imagePromptMatch = generatedText.match(/IMAGE PROMPT:\s*(.*?)(?=\nCAPTION:|$)/s);
    const captionMatch = generatedText.match(/CAPTION:\s*(.*?)$/s);
    
    if (imagePromptMatch && captionMatch) {
      imagePrompt = imagePromptMatch[1].trim();
      caption = captionMatch[1].trim();
    } else {
      // Try old bracket format
      const bracketMatch = generatedText.match(/\[(.*?),\s*(.*?)\]/s);
      if (bracketMatch) {
        imagePrompt = bracketMatch[1].trim();
        caption = bracketMatch[2].trim();
      } else {
        // Try parsing lines that start with "Image prompt:" and "Caption:"
        const lines = generatedText.split('\n');
        for (const line of lines) {
          if (line.toLowerCase().includes('image prompt:')) {
            imagePrompt = line.replace(/^.*image prompt:\s*/i, '').trim();
          } else if (line.toLowerCase().includes('caption')) {
            caption = line.replace(/^.*caption.*?:\s*/i, '').trim();
          }
        }
        
        // Final fallback - just use the whole thing as image prompt
        if (!imagePrompt) {
          imagePrompt = generatedText.trim();
          caption = "Another day, another selfie! 📸";
        }
      }
    }
    
    // Clean up the parsed values
    imagePrompt = imagePrompt.replace(/^["'\[\]]/g, '').replace(/["'\[\]]$/g, '');
    caption = caption.replace(/^["'\[\]]/g, '').replace(/["'\[\]]$/g, '');
    
    res.status(200).json({ 
      imagePrompt, 
      caption,
      rawResponse: generatedText,
      daysSinceBaseline
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Failed to generate prompt', details: error.message });
  }
}
