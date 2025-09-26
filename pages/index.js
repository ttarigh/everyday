import { useState, useEffect } from "react";

// Grid icon component
const GridIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

// Tagged photos icon component
const TaggedIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// Heart icon component
const HeartIcon = ({ className, filled = false }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill={filled ? "red" : "none"} stroke={filled ? "red" : "currentColor"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// Arrow icons for navigation
const ChevronLeft = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6"></polyline>
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"></polyline>
  </svg>
);

// X icon for close button
const XIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Countdown timer component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState("23:56:13");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
};

// Posts will be loaded from API

// Post Modal Component for Desktop
const PostModal = ({ post, isOpen, onClose, onNext, onPrev }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <XIcon className="w-8 h-8" />
      </button>

      {/* Previous button */}
      <button 
        onClick={onPrev}
        className="absolute left-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-100 shadow-md"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Next button */}
      <button 
        onClick={onNext}
        className="absolute right-4 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-100 shadow-md"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Modal content */}
      <div className="flex max-w-5xl max-h-[90vh] bg-white">
        {/* Image area - square */}
        <div className="w-[600px] h-[600px] bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
        </div>

        {/* Sidebar */}
        <div className="w-80 p-6 border-l border-gray-200">
          {/* Profile header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <span className="font-semibold text-sm">everyday.tina.zone</span>
          </div>

          {/* Post info */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold">everyday.tina.zone</span> {post.caption}
              </p>
              <p className="text-xs text-gray-500 mt-1">{post.date}</p>
            </div>
          </div>

          {/* Comments/Hashtags */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">everyday.tina.zone</span>{' '}
                      <span className={comment.isHashtag ? "text-blue-500" : ""}>
                        {comment.text}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Post Detail Component
const MobilePostDetail = ({ post, isOpen, onClose }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onClose}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold">Post</h1>
        <div className="w-6"></div>
      </div>

      {/* Profile section */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <span className="font-semibold text-sm">everyday.tina.zone</span>
        </div>
        <button className="px-3 py-1 text-sm font-semibold border border-gray-300 rounded-md">
          Following
        </button>
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-300 flex items-center justify-center overflow-hidden">
        <img src={post.image} alt="Post" className="w-full h-full object-cover" />
      </div>

      {/* Bottom section */}
      <div className="p-4">
        <div className="mb-3">
          <HeartIcon className="w-6 h-6" filled={true} />
        </div>
        <p className="text-sm mb-1">
          <span className="font-semibold">everyday.tina.zone</span> {post.caption}
        </p>
        <p className="text-xs text-gray-500 mb-3">{post.date}</p>
        
        {/* Comments/Hashtags */}
        {post.comments && post.comments.length > 0 && (
          <div className="space-y-2">
            {post.comments.map((comment) => (
              <p key={comment.id} className="text-sm">
                <span className="font-semibold">everyday.tina.zone</span>{' '}
                <span className={comment.isHashtag ? "text-blue-500" : ""}>
                  {comment.text}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [posts, setPosts] = useState([]);

  // Track site visits
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Check if this session has already been counted
        const hasVisited = localStorage.getItem('hasVisitedToday');
        const today = new Date().toDateString();
        
        if (!hasVisited || hasVisited !== today) {
          // Record new visit
          const response = await fetch('/api/visits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.visits);
            // Mark this session as visited for today
            localStorage.setItem('hasVisitedToday', today);
          }
        } else {
          // Just get the current count without incrementing
          const response = await fetch('/api/visits');
          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.visits);
          }
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
        // Fallback to just getting the count
        try {
          const response = await fetch('/api/visits');
          if (response.ok) {
            const data = await response.json();
            setVisitCount(data.visits);
          }
        } catch (fallbackError) {
          console.error('Error getting visit count:', fallbackError);
        }
      }
    };

    trackVisit();
  }, []);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
        // Fallback to original post if API fails
        setPosts([
          { id: 1, date: "Sep 26", caption: "original picture of me:) can't wait to share my selfies everyday with you!", image: "/temp.jpg" }
        ]);
      }
    };

    loadPosts();
  }, []);

  const openPost = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePost = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const nextPost = () => {
    if (selectedPost) {
      const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
      const nextIndex = (currentIndex + 1) % posts.length;
      setSelectedPost(posts[nextIndex]);
    }
  };

  const prevPost = () => {
    if (selectedPost) {
      const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
      const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
      setSelectedPost(posts[prevIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main container */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        
        {/* Profile Header */}
        <div className="mb-8">
          {/* Desktop layout */}
          <div className="hidden md:grid grid-cols-3 gap-1 mb-6">
            {/* Profile Avatar - aligned with left grid post */}
            <div className="flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile Info - spans middle and right columns, aligned with middle grid post */}
            <div className="col-span-2">
              {/* Username and Following button */}
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-xl font-light">everyday.tina.zone</h1>
                <button className="px-4 py-1.5 text-sm font-semibold bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Following
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <span className="text-sm"><strong>{posts.length}</strong> posts</span>
                <span className="text-sm"><strong>{visitCount}</strong> visitors</span>
                <span className="text-sm"><strong>1</strong> following</span>
              </div>
              
              {/* Bio */}
              <div>
                <p className="font-semibold text-sm mb-1">Tina Tarighian</p>
                <p className="text-sm mb-1">I post a picture of myself everyday &lt;3</p>
                <p className="text-sm text-gray-600">next upload: <CountdownTimer /></p>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            {/* Top row: Avatar, username, following button */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-light">everyday.tina.zone</h1>
                  <button className="px-3 py-1 text-sm font-semibold bg-gray-100 rounded-md flex items-center gap-1">
                    Following
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Bio */}
            <div className="mb-4">
              <p className="font-semibold text-sm mb-1">Tina Tarighian</p>
              <p className="text-sm mb-1">I post a picture of myself everyday &lt;3</p>
              <p className="text-sm text-gray-600">next upload: <CountdownTimer /></p>
            </div>
            
            {/* Stats */}
            <div className="flex justify-around py-4 border-t border-gray-200 mb-4">
              <div className="text-center">
                <div className="font-semibold text-sm">{posts.length}</div>
                <div className="text-xs text-gray-600">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">{visitCount}</div>
                <div className="text-xs text-gray-600">visitors</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">1</div>
                <div className="text-xs text-gray-600">following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-4">
          <div className="flex">
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-900 border-b-2 border-black">
              <GridIcon className="w-4 h-4" />
              <span className="hidden sm:inline">POSTS</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent">
              <TaggedIcon className="w-4 h-4" />
              <span className="hidden sm:inline">TAGGED</span>
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1 md:gap-1">
          {posts.map((post, i) => (
            <button
              key={post.id}
              onClick={() => openPost(post)}
              className="aspect-square bg-gray-300 hover:opacity-90 transition-opacity overflow-hidden"
            >
              <img src={post.image} alt={`Post ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Post Modals */}
      <PostModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={closePost}
        onNext={nextPost}
        onPrev={prevPost}
      />
      <MobilePostDetail 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={closePost}
      />
    </div>
  );
}
