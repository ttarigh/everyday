import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// API endpoint to generate image using Gemini 2.5 Flash Image Preview

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imagePrompt, originalImagePath = '/temp.jpg' } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  if (!imagePrompt) {
    return res.status(400).json({ error: 'Image prompt is required' });
  }

  try {
    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Read the original image and convert to base64
    const imagePath = path.join(process.cwd(), 'public', originalImagePath);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Determine mime type
    const mimeType = originalImagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = [
      { 
        text: `This is my current selfie as a 24 year old. Create a new image based on this prompt: ${imagePrompt}. Keep my general appearance but modify it according to the prompt.`
      },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ];

    console.log('Generating image with Gemini 2.5 Flash Image Preview...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    let generatedImagePath = originalImagePath; // Default fallback
    let hasGeneratedImage = false;

    // Process the response
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log('Generated text:', part.text);
      } else if (part.inlineData) {
        // Save the generated image
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        
        // Generate unique filename based on timestamp
        const timestamp = Date.now();
        const filename = `generated-${timestamp}.png`;
        const outputPath = path.join(process.cwd(), 'public', filename);
        
        fs.writeFileSync(outputPath, buffer);
        generatedImagePath = `/${filename}`;
        hasGeneratedImage = true;
        
        console.log(`Generated image saved as ${filename}`);
        break;
      }
    }
    
    res.status(200).json({ 
      imagePath: generatedImagePath,
      hasGeneratedImage,
      message: hasGeneratedImage ? 'Image generated successfully' : 'Using original image as fallback'
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
    // Fallback to original image if generation fails
    res.status(200).json({ 
      imagePath: originalImagePath,
      hasGeneratedImage: false,
      error: 'Image generation failed, using original',
      details: error.message 
    });
  }
}
