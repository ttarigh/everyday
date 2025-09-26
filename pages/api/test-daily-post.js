// Test endpoint for manual daily post creation (for development/testing)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing daily post creation...');
    
    // Create a test post without AI generation for now
    const today = new Date();
    const postDate = today.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });

    const testPost = {
      date: postDate,
      caption: "Test post - AI generation coming soon! 🤖",
      image: "/temp.jpg", // Using original image for now
      comments: [
        {
          id: Math.random().toString(36).substr(2, 9),
          text: "#testpost",
          isHashtag: true,
          createdAt: new Date().toISOString()
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          text: "#aicoming",
          isHashtag: true,
          createdAt: new Date().toISOString()
        }
      ],
      daysSinceBaseline: Math.floor((today - new Date('2025-09-25')) / (1000 * 60 * 60 * 24)),
      generatedPrompt: "Test prompt - AI generation will be implemented soon"
    };

    // Save the post
    console.log('Saving test post...');
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: testPost })
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save test post');
    }

    const { post: savedPost } = await saveResponse.json();

    console.log('Test post created successfully!');
    res.status(200).json({ 
      success: true, 
      post: savedPost,
      message: 'Test post created successfully'
    });

  } catch (error) {
    console.error('Error creating test post:', error);
    res.status(500).json({ 
      error: 'Failed to create test post', 
      details: error.message 
    });
  }
}
