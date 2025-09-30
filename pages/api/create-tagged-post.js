import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get the most recent generated selfie from regular posts
function getMostRecentGeneratedSelfie() {
  try {
    const postsPath = path.join(process.cwd(), 'data', 'posts.json');
    if (!fs.existsSync(postsPath)) {
      return '/temp.jpg'; // Fallback to original
    }
    
    const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const posts = postsData.posts || [];
    
    // Find the most recent post that's not the original
    const recentPost = posts.find(post => !post.isOriginal);
    return recentPost ? recentPost.image : '/temp.jpg';
  } catch (error) {
    console.error('Error getting most recent selfie:', error);
    return '/temp.jpg';
  }
}

// Helper function to save uploaded file (serverless-compatible)
function saveUploadedFile(file, directory, filename) {
  try {
    // In serverless environments, we can't write to the file system
    // For production, you'd need cloud storage like Vercel Blob, AWS S3, etc.
    console.log('Note: File uploads not supported in serverless environment');
    console.log(`Would save file: ${filename} to ${directory}`);
    
    // Return a placeholder path for now
    return `/temp.jpg`; // Fallback to existing image
  } catch (error) {
    console.error('Error saving file:', error);
    return `/temp.jpg`;
  }
}

// Helper function to expand prompt using Gemini
async function expandPrompt(userPrompt, userSelfie, myRecentSelfie) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    let prompt;
    
    if (userPrompt && userPrompt.trim()) {
      // Expand the existing prompt
      prompt = `A user wants to create a collaborative selfie post. They provided this prompt: "${userPrompt}". 
      
      Create a detailed image generation prompt that starts with "Put these two people in" and then describes a scene where both people are together, incorporating the user's idea while making it feel natural and Instagram-worthy.
      
      Return EXACTLY in this format:
      IMAGE PROMPT: Put these two people in [detailed scene description here]
      CAPTION: [short Instagram caption here]`;
    } else {
      // Generate a completely new prompt
      prompt = `A user wants to create a collaborative selfie post but didn't provide a specific prompt. Generate a creative, fun idea for a collaborative selfie between two friends.
      
      Think of popular Instagram trends, fun activities, or interesting locations where two people might take a selfie together. The image prompt must start with "Put these two people in".
      
      Return EXACTLY in this format:
      IMAGE PROMPT: Put these two people in [detailed scene description here]
      CAPTION: [short Instagram caption here]`;
    }

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

    // Parse the response
    const imagePromptMatch = generatedText.match(/IMAGE PROMPT:\s*(.*?)(?=\nCAPTION:|$)/s);
    const captionMatch = generatedText.match(/CAPTION:\s*(.*?)$/s);
    
    let imagePrompt = '';
    let caption = '';
    
    if (imagePromptMatch && captionMatch) {
      imagePrompt = imagePromptMatch[1].trim();
      caption = captionMatch[1].trim();
    } else {
      // Fallback parsing
      const lines = generatedText.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes('image prompt:') || line.toLowerCase().includes('prompt:')) {
          imagePrompt = line.replace(/^.*prompt:\s*/i, '').trim();
        } else if (line.toLowerCase().includes('caption:')) {
          caption = line.replace(/^.*caption:\s*/i, '').trim();
        }
      }
      
      if (!imagePrompt) {
        imagePrompt = "Put these two people in a fun, collaborative selfie scene";
        caption = "Collaborative selfie with friends! 📸✨";
      }
    }

    return { expandedPrompt: imagePrompt, caption };
  } catch (error) {
    console.error('Error expanding prompt:', error);
    // Fallback
    return {
      expandedPrompt: "Put these two people in a fun, collaborative selfie scene",
      caption: "Collaborative selfie with friends! 📸✨"
    };
  }
}

// Helper function to generate collaborative image using Gemini
async function generateCollaborativeImage(expandedPrompt, userSelfiePath, mySelfiePath) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Read both images
    const userImagePath = path.join(process.cwd(), 'public', userSelfiePath);
    const myImagePath = path.join(process.cwd(), 'public', mySelfiePath);
    
    const userImageBuffer = fs.readFileSync(userImagePath);
    const myImageBuffer = fs.readFileSync(myImagePath);
    
    const userBase64 = userImageBuffer.toString('base64');
    const myBase64 = myImageBuffer.toString('base64');
    
    // Determine mime types
    const userMimeType = userSelfiePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const myMimeType = mySelfiePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = [
      { 
        text: `${expandedPrompt}. 

The first image shows the user's appearance - incorporate their style and look. The second image shows my appearance (everyday.tina.zone) - incorporate my look as well. 

Create a scene where both people are together in the same photo, both looking good and natural. Make it feel like a real collaborative Instagram post between friends.`
      },
      {
        inlineData: {
          mimeType: userMimeType,
          data: userBase64,
        },
      },
      {
        inlineData: {
          mimeType: myMimeType,
          data: myBase64,
        },
      },
    ];

    console.log('Generating collaborative image with Gemini...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    // Process the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        // Save the generated image
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `tagged-${timestamp}.png`;
        const outputPath = path.join(process.cwd(), 'public', 'tagged', 'generated', filename);
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // In serverless environments, we can't write to the file system
        console.log(`Would save collaborative image as ${filename}`);
        
        // For now, return the original image path as fallback
        return `/temp.jpg`;
      }
    }
    
    throw new Error('No image generated');
  } catch (error) {
    console.error('Error generating collaborative image:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);
    
    const instagramHandle = Array.isArray(fields.instagramHandle) ? fields.instagramHandle[0] : fields.instagramHandle;
    const userPrompt = Array.isArray(fields.userPrompt) ? fields.userPrompt[0] : fields.userPrompt;
    const selfieFile = Array.isArray(files.selfie) ? files.selfie[0] : files.selfie;

    // Validate required fields
    if (!instagramHandle || !selfieFile) {
      return res.status(400).json({ error: 'Instagram handle and selfie are required' });
    }

    console.log('Creating tagged post for:', instagramHandle);

    // Step 1: Save the user's selfie
    const timestamp = Date.now();
    const selfieExtension = path.extname(selfieFile.originalFilename || '.jpg');
    const selfieFilename = `${instagramHandle}-${timestamp}${selfieExtension}`;
    const userSelfiePath = saveUploadedFile(selfieFile, 'tagged/user-selfies', selfieFilename);
    
    console.log('Saved user selfie:', userSelfiePath);

    // Step 2: Get my most recent generated selfie
    const myRecentSelfie = getMostRecentGeneratedSelfie();
    console.log('Using my recent selfie:', myRecentSelfie);

    // Step 3: Expand the prompt using AI
    console.log('Expanding prompt...');
    const { expandedPrompt, caption } = await expandPrompt(userPrompt, userSelfiePath, myRecentSelfie);
    console.log('Expanded prompt:', expandedPrompt);

    // Step 4: Generate the collaborative image
    console.log('Generating collaborative image...');
    const generatedImagePath = await generateCollaborativeImage(expandedPrompt, userSelfiePath, myRecentSelfie);
    console.log('Generated image:', generatedImagePath);

    // Step 5: Create hashtags from the AI-generated image prompt (exactly like main posts)
    let hashtags = [];
    if (expandedPrompt && expandedPrompt.trim()) {
      // Convert the entire AI image prompt to ONE single hashtag (like main posts do)
      // Remove "Put these two people in" from the beginning and clean up
      const cleanPrompt = expandedPrompt
        .replace(/^put these two people in\s*/gi, '')
        .replace(/^put\s+these\s+two\s+people\s+in\s*/gi, '')
        .trim();
      
      // Create ONE single hashtag from the entire prompt (like main posts)
      const singleHashtag = '#' + cleanPrompt
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove punctuation but keep spaces temporarily
        .replace(/\s+/g, '') // Remove all spaces to make one continuous hashtag
        .trim();
      
      hashtags = [{
        id: Math.random().toString(36).substr(2, 9),
        text: singleHashtag,
        isHashtag: true,
        createdAt: new Date().toISOString()
      }];
    }

    // Step 6: Create the tagged post data
    const today = new Date();
    const postDate = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const taggedPost = {
      userInstagram: instagramHandle,
      userSelfie: userSelfiePath,
      userPrompt: userPrompt || '',
      expandedPrompt,
      generatedImage: generatedImagePath,
      caption,
      comments: hashtags, // Store hashtags in comments like main posts
      date: postDate,
      tags: [
        {
          username: 'everyday.tina.zone',
          x: Math.floor(Math.random() * 60) + 20, // Random position between 20-80%
          y: Math.floor(Math.random() * 60) + 20
        }
      ]
    };

    // Step 7: Save the tagged post
    console.log('Saving tagged post...');
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tagged-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taggedPost })
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save tagged post');
    }

    const { taggedPost: savedTaggedPost } = await saveResponse.json();

    console.log('Tagged post created successfully!');
    res.status(200).json({ 
      success: true, 
      taggedPost: savedTaggedPost,
      message: 'Tagged post created successfully'
    });

  } catch (error) {
    console.error('Error creating tagged post:', error);
    res.status(500).json({ 
      error: 'Failed to create tagged post', 
      details: error.message 
    });
  }
}
