// Script to generate daily selfie post - runs in GitHub Actions
// This has full filesystem access unlike serverless functions

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASELINE_DATE = new Date('2025-09-25');
const ORIGINAL_SELFIE_PATH = path.join(__dirname, '..', 'public', 'temp.jpg');
const POSTS_DATA_PATH = path.join(__dirname, '..', 'data', 'posts.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Calculate days since baseline
function getDaysSinceBaseline() {
  const today = new Date();
  const diffTime = today - BASELINE_DATE;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Generate simple prompt using Gemini
async function generatePrompt(daysSince) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  // Simple, direct prompt
  const promptText = `Create an image of this person exactly ${daysSince} days older than in the original photo. 

Keep it realistic and subtle - this is day ${daysSince} of daily aging progression. Consider:
- Natural subtle aging (very gradual)
- Season appropriate (we started September 25, 2025)
- Daily life variety (work, home, weekend activities)
- Keep personal style consistent

Return EXACTLY in this format:
IMAGE PROMPT: [detailed description for image generation]
CAPTION: [short Instagram caption about this day]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No text generated from Gemini');
    }

    console.log('✓ Generated prompt:', generatedText.substring(0, 100) + '...');

    // Parse response
    const imagePromptMatch = generatedText.match(/IMAGE PROMPT:\s*(.*?)(?=\nCAPTION:|$)/s);
    const captionMatch = generatedText.match(/CAPTION:\s*(.*?)$/s);
    
    let imagePrompt = imagePromptMatch?.[1]?.trim() || generatedText.trim();
    let caption = captionMatch?.[1]?.trim() || `Day ${daysSince} 📸`;

    // Clean up
    imagePrompt = imagePrompt.replace(/^["'\[\]]/g, '').replace(/["'\[\]]$/g, '');
    caption = caption.replace(/^["'\[\]]/g, '').replace(/["'\[\]]$/g, '');
    
    return { imagePrompt, caption };
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}

// Generate image using Gemini
async function generateImage(imagePrompt, daysSince) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Read original selfie
    const imageBuffer = fs.readFileSync(ORIGINAL_SELFIE_PATH);
    const base64Image = imageBuffer.toString('base64');

    const prompt = [
      { 
        text: `This is my original selfie. Create a new image based on this prompt: ${imagePrompt}

Keep my general appearance and style, but show realistic progression for day ${daysSince}.`
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ];

    console.log('⏳ Generating image with Gemini (this may take 30-60 seconds)...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    // Extract generated image
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        
        // Save with timestamp
        const timestamp = Date.now();
        const filename = `generated-${timestamp}.png`;
        const outputPath = path.join(PUBLIC_DIR, filename);
        
        fs.writeFileSync(outputPath, buffer);
        console.log(`✓ Image saved: ${filename}`);
        
        return `/${filename}`;
      }
    }
    
    throw new Error('No image generated in response');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Create hashtag from prompt
function createHashtag(imagePrompt) {
  const cleanPrompt = imagePrompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
  
  return '#' + cleanPrompt + ' #ai';
}

// Update posts.json
function savePost(imagePath, caption, imagePrompt, daysSince) {
  try {
    // Read existing posts
    let postsData = { posts: [] };
    if (fs.existsSync(POSTS_DATA_PATH)) {
      const fileContents = fs.readFileSync(POSTS_DATA_PATH, 'utf8');
      postsData = JSON.parse(fileContents);
    }

    // Create new post
    const today = new Date();
    const postDate = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const hashtag = createHashtag(imagePrompt);

    const newPost = {
      date: postDate,
      caption: caption,
      image: imagePath,
      comments: [{
        id: Math.random().toString(36).substr(2, 9),
        text: hashtag,
        isHashtag: true,
        createdAt: new Date().toISOString()
      }],
      daysSinceBaseline: daysSince,
      generatedPrompt: imagePrompt,
      id: Math.max(...postsData.posts.map(p => p.id || 0), 0) + 1,
      createdAt: new Date().toISOString()
    };

    // Add to beginning of posts array
    postsData.posts.unshift(newPost);

    // Write back to file
    fs.writeFileSync(POSTS_DATA_PATH, JSON.stringify(postsData, null, 2));
    console.log(`✓ Post saved to ${POSTS_DATA_PATH}`);
    
    return newPost;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting daily post generation...\n');

  try {
    // Step 1: Calculate days
    const daysSince = getDaysSinceBaseline();
    console.log(`📅 Days since baseline (Sep 25, 2025): ${daysSince}\n`);

    // Step 2: Generate prompt
    console.log('🤖 Generating prompt with Gemini...');
    const { imagePrompt, caption } = await generatePrompt(daysSince);
    console.log(`📝 Caption: "${caption}"\n`);

    // Step 3: Generate image
    console.log('🎨 Generating image with Gemini...');
    const imagePath = await generateImage(imagePrompt, daysSince);
    console.log('');

    // Step 4: Save post
    console.log('💾 Saving post data...');
    const savedPost = savePost(imagePath, caption, imagePrompt, daysSince);
    console.log('');

    // Success!
    console.log('✅ Daily post created successfully!');
    console.log(`   Image: ${imagePath}`);
    console.log(`   Caption: "${caption}"`);
    console.log(`   Post ID: ${savedPost.id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to create daily post:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();

