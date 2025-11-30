import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { GitHubCommitter } from '../../utils/github.js';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get most recent selfie from posts
async function getMostRecentSelfie() {
  try {
    // In serverless, we read from the repo via GitHub API or just use a default
    return '/temp.jpg'; // For now, always use the original
  } catch (error) {
    console.error('Error getting recent selfie:', error);
    return '/temp.jpg';
  }
}

// Generate expanded prompt using Gemini
async function generateCollaborativePrompt(userPrompt) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const promptText = userPrompt && userPrompt.trim()
    ? `Create a fun collaborative selfie scene. User idea: "${userPrompt}". 
       Make it Instagram-worthy with both people together.
       
       Return EXACTLY in this format:
       IMAGE PROMPT: Put these two people in [detailed scene]
       CAPTION: [short Instagram caption]`
    : `Create a fun collaborative selfie scene where two friends are together.
       Think of something creative and Instagram-worthy.
       
       Return EXACTLY in this format:
       IMAGE PROMPT: Put these two people in [detailed scene]
       CAPTION: [short Instagram caption]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      }
    );

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No text generated');
    }

    // Parse response
    const imagePromptMatch = generatedText.match(/IMAGE PROMPT:\s*(.*?)(?=\nCAPTION:|$)/s);
    const captionMatch = generatedText.match(/CAPTION:\s*(.*?)$/s);
    
    let imagePrompt = imagePromptMatch?.[1]?.trim() || 'Put these two people in a fun collaborative selfie';
    let caption = captionMatch?.[1]?.trim() || 'Collab selfie! 📸';

    return { imagePrompt, caption };
  } catch (error) {
    console.error('Error generating prompt:', error);
    return {
      imagePrompt: 'Put these two people in a fun collaborative selfie scene',
      caption: 'Collaborative post! 📸'
    };
  }
}

// Generate collaborative image
async function generateCollaborativeImage(imagePrompt, userSelfieBuffer, mySelfieBuffer) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const userBase64 = userSelfieBuffer.toString('base64');
    const myBase64 = mySelfieBuffer.toString('base64');

    const prompt = [
      { 
        text: `${imagePrompt}

The first image shows one person's appearance, the second shows another person. 
Create a scene where both people are together, looking natural and Instagram-ready.`
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: userBase64,
        },
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: myBase64,
        },
      },
    ];

    console.log('⏳ Generating collaborative image...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    // Extract generated image
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, 'base64');
        console.log('✓ Image generated');
        return buffer;
      }
    }
    
    throw new Error('No image generated in response');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);
    
    const instagramHandle = Array.isArray(fields.instagramHandle) 
      ? fields.instagramHandle[0] 
      : fields.instagramHandle;
    const userPrompt = Array.isArray(fields.userPrompt) 
      ? fields.userPrompt[0] 
      : fields.userPrompt;
    const selfieFile = Array.isArray(files.selfie) 
      ? files.selfie[0] 
      : files.selfie;

    if (!instagramHandle || !selfieFile) {
      return res.status(400).json({ error: 'Instagram handle and selfie are required' });
    }

    console.log('Creating tagged post for:', instagramHandle);

    // Read uploaded selfie
    const userSelfieBuffer = fs.readFileSync(selfieFile.filepath);
    
    // Read my recent selfie from public directory
    const mySelfiePath = path.join(process.cwd(), 'public', 'temp.jpg');
    const mySelfieBuffer = fs.readFileSync(mySelfiePath);

    // Generate collaborative prompt
    console.log('🤖 Generating collaborative prompt...');
    const { imagePrompt, caption } = await generateCollaborativePrompt(userPrompt);
    console.log(`📝 Prompt: ${imagePrompt}`);

    // Generate collaborative image
    const generatedImageBuffer = await generateCollaborativeImage(
      imagePrompt,
      userSelfieBuffer,
      mySelfieBuffer
    );

    // Prepare file names
    const timestamp = Date.now();
    const userSelfieFilename = `${instagramHandle}-${timestamp}.jpg`;
    const generatedImageFilename = `tagged-${timestamp}.png`;

    // Prepare post data
    const today = new Date();
    const postDate = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const hashtag = '#' + imagePrompt
      .toLowerCase()
      .replace(/^put these two people in\s*/gi, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '') + ' #collab';

    const newTaggedPost = {
      id: `tagged-${timestamp}`,
      userInstagram: instagramHandle,
      userSelfie: `/tagged/user-selfies/${userSelfieFilename}`,
      generatedImage: `/tagged/generated/${generatedImageFilename}`,
      userPrompt: userPrompt || '',
      expandedPrompt: imagePrompt,
      caption: caption,
      date: postDate,
      comments: [{
        id: Math.random().toString(36).substr(2, 9),
        text: hashtag,
        isHashtag: true,
        createdAt: new Date().toISOString()
      }],
      tags: [{
        username: 'everyday.tina.zone',
        x: Math.floor(Math.random() * 60) + 20,
        y: Math.floor(Math.random() * 60) + 20
      }],
      createdAt: new Date().toISOString()
    };

    // Read current tagged posts data from GitHub
    console.log('📖 Reading tagged posts data...');
    const githubCommitter = new GitHubCommitter();
    
    let taggedPostsData = { taggedPosts: [] };
    try {
      const { data } = await githubCommitter.octokit.repos.getContent({
        owner: githubCommitter.owner,
        repo: githubCommitter.repo,
        path: 'data/tagged-posts.json',
        ref: githubCommitter.branch,
      });
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      taggedPostsData = JSON.parse(content);
    } catch (error) {
      console.log('No existing tagged-posts.json, will create new');
    }

    // Add new post
    taggedPostsData.taggedPosts.unshift(newTaggedPost);

    // Commit all files to GitHub in a single commit
    console.log('💾 Committing to GitHub...');
    await githubCommitter.commitMultipleFiles([
      {
        path: `public/tagged/user-selfies/${userSelfieFilename}`,
        content: userSelfieBuffer,
        isBinary: true
      },
      {
        path: `public/tagged/generated/${generatedImageFilename}`,
        content: generatedImageBuffer,
        isBinary: true
      },
      {
        path: 'data/tagged-posts.json',
        content: JSON.stringify(taggedPostsData, null, 2),
        isBinary: false
      }
    ], `Add tagged post from @${instagramHandle}`);

    console.log('✅ Tagged post created successfully!');
    
    res.status(200).json({ 
      success: true, 
      taggedPost: newTaggedPost,
      message: 'Tagged post created! The page will refresh shortly to show your post.',
      needsRefresh: true
    });

  } catch (error) {
    console.error('Error creating tagged post:', error);
    res.status(500).json({ 
      error: 'Failed to create tagged post', 
      details: error.message 
    });
  }
}
