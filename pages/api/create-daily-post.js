// Main endpoint for daily post creation - called by GitHub Actions

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is coming from GitHub Actions (optional security)
  const authToken = req.headers.authorization;
  if (authToken !== `Bearer ${process.env.GITHUB_ACTIONS_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting daily post creation...');
    
    // Step 1: Generate the image prompt using Gemini 2.5 Flash Lite
    console.log('Generating image prompt...');
    const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!promptResponse.ok) {
      throw new Error('Failed to generate prompt');
    }

    const { imagePrompt, caption, daysSinceBaseline } = await promptResponse.json();
    console.log('Generated prompt:', imagePrompt);
    console.log('Generated caption:', caption);

    // Step 2: Generate the image using Gemini 2.5 Flash Image Preview
    console.log('Generating image...');
    const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagePrompt,
        originalImagePath: '/temp.jpg'
      })
    });

    if (!imageResponse.ok) {
      throw new Error('Failed to generate image');
    }

    const { imagePath, hasGeneratedImage } = await imageResponse.json();
    console.log('Image generation result:', { imagePath, hasGeneratedImage });

    // Step 3: Create hashtags from the prompt
    const hashtags = imagePrompt
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => 
        '#' + sentence.trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '')
      )
      .filter(tag => tag.length > 1);

    // Step 4: Create the new post
    const today = new Date();
    const postDate = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const newPost = {
      date: postDate,
      caption: caption,
      image: imagePath,
      comments: hashtags.map(tag => ({
        id: Math.random().toString(36).substr(2, 9),
        text: tag,
        isHashtag: true,
        createdAt: new Date().toISOString()
      })),
      daysSinceBaseline,
      generatedPrompt: imagePrompt
    };

    // Step 5: Save the post
    console.log('Saving new post...');
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: newPost })
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save post');
    }

    const { post: savedPost } = await saveResponse.json();

    console.log('Daily post created successfully!');
    res.status(200).json({ 
      success: true, 
      post: savedPost,
      message: 'Daily post created successfully'
    });

  } catch (error) {
    console.error('Error creating daily post:', error);
    
    // Send email notification about the error (you can implement this later)
    // await sendErrorNotification(error);
    
    res.status(500).json({ 
      error: 'Failed to create daily post', 
      details: error.message 
    });
  }
}
