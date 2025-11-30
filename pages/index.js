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
  <span className={`${className} font-bold text-xl leading-none`} style={{ transform: 'translateX(-1px)' }}>‹</span>
);

const ChevronRight = ({ className }) => (
  <span className={`${className} font-bold text-xl leading-none`} style={{ transform: 'translateX(1px)' }}>›</span>
);

// X icon for close button
const XIcon = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Story Viewer Component
const StoryViewer = ({ isOpen, onClose, onStoryComplete }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const stories = [
    { id: 1, image: '/story/1.JPG' },
    { id: 2, image: '/story/2.JPG' },
    { id: 3, image: '/story/3.JPG' },
    { id: 4, image: '/story/4.JPG' },
    { id: 5, image: '/story/5.JPG' }
  ];

  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    if (!isOpen) {
      setCurrentStoryIndex(0);
      setProgress(0);
      return;
    }

    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            return 0;
          } else {
            // End of stories, mark as viewed and close viewer
            onStoryComplete();
            onClose();
            return 0;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentStoryIndex, isPaused, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevStory();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextStory();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStoryIndex]);

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      // Mark as viewed when manually advancing past last story
      onStoryComplete();
      onClose();
    }
  };

  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    
    if (touchX < screenWidth / 2) {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    if (clickX < width / 2) {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };

  if (!isOpen) return null;

  const calculateDaysAgo = () => {
    const startDate = new Date('2025-09-25');
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center">
      {/* Desktop Navigation Arrows - positioned on either side of story container */}
      <button 
        onClick={goToPrevStory}
        className="hidden md:block absolute top-1/2 -translate-y-1/2 left-4 z-20 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center text-black transition-all"
      >
        <ChevronLeft />
      </button>
      
      <button 
        onClick={goToNextStory}
        className="hidden md:block absolute top-1/2 -translate-y-1/2 right-4 z-20 w-10 h-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center text-black transition-all"
      >
        <ChevronRight />
      </button>

      {/* Story Container */}
      <div className="relative w-full h-full max-w-md mx-auto bg-black md:rounded-2xl md:max-h-[90vh] overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-gray-500 bg-opacity-50 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ease-linear ${
                  index < currentStoryIndex ? 'bg-white w-full' :
                  index === currentStoryIndex ? 'bg-white' : 'bg-transparent'
                }`}
                style={{ 
                  width: index === currentStoryIndex ? `${progress}%` : 
                         index < currentStoryIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 z-10 flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
              <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-sm font-medium">everyday.tina.zone</span>
            <span className="text-white text-sm opacity-60">{calculateDaysAgo()}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white p-1"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Story Image */}
        <div 
          className="w-full h-full flex items-center justify-center cursor-pointer select-none"
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <img 
            src={stories[currentStoryIndex].image} 
            alt={`Story ${currentStoryIndex + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Mobile Navigation areas (invisible) */}
        <div className="absolute inset-0 flex md:hidden">
          <div className="w-1/2 h-full" onClick={goToPrevStory} />
          <div className="w-1/2 h-full" onClick={goToNextStory} />
        </div>
      </div>
    </div>
  );
};

// Status Square Component for Grid
const StatusSquare = ({ status }) => {
  if (!status || status === 'success') return null;
  
  const bgColor = status === 'creating' ? 'bg-blue-500' : 
                  status === 'polling' ? 'bg-yellow-500' : 
                  'bg-gray-500';
  
  const getMessage = () => {
    switch (status) {
      case 'creating':
        return 'creating tagged post';
      case 'polling':
        return 'waiting for deployment\n(1-2 minutes)';
      case 'timeout':
        return 'taking longer than expected\ncheck back in a few minutes';
      default:
        return '';
    }
  };
  
  return (
    <div className={`aspect-square ${bgColor} flex items-center justify-center p-4`}>
      <div className="text-center">
        {status === 'creating' && (
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-3"></div>
        )}
        {status === 'polling' && (
          <div className="text-2xl mb-3 animate-pulse">⏳</div>
        )}
        {status === 'timeout' && (
          <div className="text-2xl mb-3">⏱️</div>
        )}
        <p className="text-white text-xs font-medium whitespace-pre-line">
          {getMessage()}
        </p>
      </div>
    </div>
  );
};

// Tagged Post Modal Component
const TaggedPostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    instagramHandle: '',
    userPrompt: '',
    selfie: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, selfie: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.instagramHandle || !formData.selfie) {
      alert('Instagram handle and selfie are required!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append('instagramHandle', formData.instagramHandle);
      submitFormData.append('userPrompt', formData.userPrompt);
      submitFormData.append('selfie', formData.selfie);

      const response = await fetch('/api/create-tagged-post', {
        method: 'POST',
        body: submitFormData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Tagged post created:', result);
        
        // Reset form
        setFormData({ instagramHandle: '', userPrompt: '', selfie: null });
        setPreviewUrl(null);
        
        // Close modal
        onClose();
        
        // Notify parent to start polling
        if (onPostCreated) {
          onPostCreated(result.taggedPost.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating tagged post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}>
      <div className="bg-white rounded-xl w-[400px] max-w-[90vw] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Post with @everyday.tina.zone</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Selfie Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your selfie *</label>
            <div className="flex justify-center">
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="text-xs">your selfie</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                  disabled={isSubmitting}
                />
              </label>
            </div>
          </div>

          {/* Instagram Handle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram handle *</label>
            <input
              type="text"
              value={formData.instagramHandle}
              onChange={(e) => setFormData(prev => ({ ...prev, instagramHandle: e.target.value }))}
              placeholder="instagram handle"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt (optional)</label>
            <textarea
              value={formData.userPrompt}
              onChange={(e) => setFormData(prev => ({ ...prev, userPrompt: e.target.value }))}
              placeholder="prompt (optional)"
              rows={3}
              maxLength={50}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {formData.userPrompt.length}/50
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Share'}
          </button>

          {/* Warning Text */}
          <p className="text-center text-red-500 text-xs mt-4">
            a post between friends can never be deleted
          </p>
        </form>
      </div>
    </div>
  );
};

// Following Modal Component
const FollowingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleProfileClick = () => {
    window.open('https://www.instagram.com/wwwtinazone', '_blank');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}>
      <div className="bg-white rounded-xl w-[400px] max-w-[90vw] max-h-[400px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div></div>
          <h2 className="text-base font-semibold">Following</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search bar */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Profile list */}
        <div className="px-4 py-2">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
              <img src="/ig.png" alt="wwwtinazone" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm">wwwtinazone</div>
              <div className="text-gray-500 text-sm">Tina</div>
            </div>
            <button className="px-4 py-1.5 text-sm font-semibold bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-colors">
              Following
            </button>
          </button>
        </div>
      </div>
    </div>
  );
};

// Countdown timer component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState("23:56:13");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      // Calculate next noon (12:00 PM)
      const nextNoon = new Date(now);
      nextNoon.setHours(12, 0, 0, 0);
      
      // If it's already past noon today, set to noon tomorrow
      if (now >= nextNoon) {
        nextNoon.setDate(nextNoon.getDate() + 1);
      }
      
      const diff = nextNoon - now;
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
  const [showTags, setShowTags] = useState(false);
  
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
      <div className="flex max-w-7xl max-h-[90vh] bg-white overflow-hidden">
        {/* Image area - square, matches sidebar height */}
        <div className="aspect-square max-h-[90vh] bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
          <img src={post.generatedImage || post.image} alt="Post" className="w-full h-full object-cover" />
          
          {/* Tagged indicator for tagged posts */}
          {post.tags && post.tags.length > 0 && (
            <>
              {/* Clickable person icon */}
              <div className="absolute bottom-4 left-4">
                <button 
                  onClick={() => setShowTags(!showTags)}
                  className="w-8 h-8 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-opacity"
                  title={showTags ? "Hide tags" : "Show tags"}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Tag overlay */}
              {showTags && (
                <div className="absolute bottom-16 left-8">
                  <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium relative">
                    {post.tags[0].username}
                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 max-h-[90vh] p-6 border-l border-gray-200 flex flex-col overflow-y-auto">
          {/* Profile header */}
          <div className="flex items-center gap-3 mb-4">
            {post.userInstagram ? (
              /* Tagged post - no gradient for user */
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={post.userSelfie} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              /* Regular post - gradient for everyday.tina.zone */
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src="/temp.jpg" 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>
            )}
            <span className="font-semibold text-sm">
              {post.userInstagram || "everyday.tina.zone"}
            </span>
          </div>

          {/* Post info */}
          <div className="flex items-start gap-3 mb-4">
            {post.userInstagram ? (
              /* Tagged post - no gradient for user */
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={post.userSelfie} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              /* Regular post - gradient for everyday.tina.zone */
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src="/temp.jpg" 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold">{post.userInstagram || "everyday.tina.zone"}</span> {post.caption}
              </p>
              <p className="text-xs text-gray-500 mt-1">{post.date}</p>
            </div>
          </div>

          {/* Comments/Hashtags */}
          {post.comments && post.comments.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-start gap-3">
                {post.userInstagram ? (
                  /* Tagged post - show user's profile for hashtags */
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img src={post.userSelfie} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  /* Regular post - show everyday.tina.zone profile */
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-white p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm break-all hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    <span className="font-semibold">{post.userInstagram || "everyday.tina.zone"}</span>{' '}
                    <span className="text-blue-500">
                      {post.comments.filter(c => c.isHashtag).map(c => c.text).join(' ')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobile Post Detail Component
const MobilePostDetail = ({ post, isOpen, onClose }) => {
  const [showTags, setShowTags] = useState(false);
  
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
          {post.userInstagram ? (
            /* Tagged post - no gradient for user */
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src={post.userSelfie} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            /* Regular post - gradient for everyday.tina.zone */
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src="/temp.jpg" 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>
          )}
          <span className="font-semibold text-sm">
            {post.userInstagram || "everyday.tina.zone"}
          </span>
        </div>
        <button className="px-3 py-1 text-sm font-semibold border border-gray-300 rounded-md">
          Following
        </button>
      </div>

      {/* Image */}
      <div className="aspect-square bg-gray-300 flex items-center justify-center overflow-hidden relative">
        <img src={post.generatedImage || post.image} alt="Post" className="w-full h-full object-cover" />
        
        {/* Tagged indicator for tagged posts */}
        {post.tags && post.tags.length > 0 && (
          <>
            {/* Clickable person icon */}
            <div className="absolute bottom-2 left-2">
              <button 
                onClick={() => setShowTags(!showTags)}
                className="w-6 h-6 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-90 transition-opacity"
                title={showTags ? "Hide tags" : "Show tags"}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Tag overlay */}
            {showTags && (
              <div className="absolute bottom-10 left-4">
                <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium relative">
                  {post.tags[0].username}
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="p-4">
        <div className="mb-3">
          <HeartIcon className="w-6 h-6" filled={true} />
        </div>
        <p className="text-sm mb-1">
          <span className="font-semibold">{post.userInstagram || "everyday.tina.zone"}</span> {post.caption}
        </p>
        <p className="text-xs text-gray-500 mb-3">{post.date}</p>
        
        {/* Comments/Hashtags */}
        {post.comments && post.comments.length > 0 && (
          <div>
            <p className="text-sm break-all hyphens-auto" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <span className="font-semibold">{post.userInstagram || "everyday.tina.zone"}</span>{' '}
              <span className="text-blue-500">
                {post.comments.filter(c => c.isHashtag).map(c => c.text).join(' ')}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [hasViewedStory, setHasViewedStory] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isTaggedModalOpen, setIsTaggedModalOpen] = useState(false);
  const [showGridTags, setShowGridTags] = useState({});
  const [postCreationStatus, setPostCreationStatus] = useState(null);
  const [pollingPostId, setPollingPostId] = useState(null);

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

  // Load tagged posts from API
  useEffect(() => {
    const loadTaggedPosts = async () => {
      try {
        const response = await fetch('/api/tagged-posts');
        if (response.ok) {
          const data = await response.json();
          setTaggedPosts(data.taggedPosts || []);
        }
      } catch (error) {
        console.error('Error loading tagged posts:', error);
        setTaggedPosts([]);
      }
    };

    loadTaggedPosts();
  }, []);

  // Poll for new tagged post after creation
  useEffect(() => {
    if (!pollingPostId) return;

    let pollCount = 0;
    const maxPolls = 40; // 40 polls * 3 seconds = 2 minutes max
    
    setPostCreationStatus('polling');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/tagged-posts');
        if (response.ok) {
          const data = await response.json();
          const foundPost = data.taggedPosts.find(post => post.id === pollingPostId);
          
          if (foundPost) {
            // Post found! Refresh the page to show it
            setTaggedPosts(data.taggedPosts);
            setPollingPostId(null);
            setPostCreationStatus(null);
            clearInterval(pollInterval);
            
            // Switch to tagged tab if not already there
            setActiveTab('tagged');
            
            return;
          }
        }
        
        pollCount++;
        if (pollCount >= maxPolls) {
          // Timeout - post is still deploying
          setPostCreationStatus('timeout');
          setPollingPostId(null);
          clearInterval(pollInterval);
          
          // Keep timeout message visible - user can manually close/refresh
        }
      } catch (error) {
        console.error('Error polling for post:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [pollingPostId]);

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

  const handlePostCreated = (postId) => {
    // Switch to tagged tab to show the status square
    setActiveTab('tagged');
    
    // Start showing the creation status
    setPostCreationStatus('creating');
    
    // After a brief moment, start polling
    setTimeout(() => {
      setPollingPostId(postId);
    }, 2000);
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
              <button 
                onClick={() => setIsStoryViewerOpen(true)}
                className={`w-40 h-40 rounded-full p-1 hover:scale-105 transition-transform cursor-pointer ${
                  hasViewedStory 
                    ? 'bg-gray-400' 
                    : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </button>
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
                <button 
                  onClick={() => setIsFollowingModalOpen(true)}
                  className="text-sm hover:text-gray-600 transition-colors"
                >
                  <strong>1</strong> following
                </button>
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
              <button 
                onClick={() => setIsStoryViewerOpen(true)}
                className={`w-20 h-20 rounded-full p-0.5 flex-shrink-0 hover:scale-105 transition-transform cursor-pointer ${
                  hasViewedStory 
                    ? 'bg-gray-400' 
                    : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src="/temp.jpg" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </button>
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
              <button 
                onClick={() => setIsFollowingModalOpen(true)}
                className="text-center hover:bg-gray-50 rounded-md p-2 transition-colors"
              >
                <div className="font-semibold text-sm">1</div>
                <div className="text-xs text-gray-600">following</div>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-4">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'posts' 
                  ? 'text-gray-900 border-black' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <GridIcon className="w-4 h-4" />
              <span className="hidden sm:inline">POSTS</span>
            </button>
            <button 
              onClick={() => setActiveTab('tagged')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'tagged' 
                  ? 'text-gray-900 border-black' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <TaggedIcon className="w-4 h-4" />
              <span className="hidden sm:inline">TAGGED</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {activeTab === 'posts' ? (
          /* Posts Grid */
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
        ) : (
          /* Tagged Photos Grid */
          <div className="grid grid-cols-3 gap-1 md:gap-1">
            {/* Status Square - shows when post is being created */}
            {postCreationStatus && (
              <StatusSquare status={postCreationStatus} />
            )}
            
            {taggedPosts.length === 0 && !postCreationStatus ? (
              /* Post with Me Button - only show if no status */
              <button
                onClick={() => setIsTaggedModalOpen(true)}
                className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-gray-600 hover:text-gray-700"
              >
                <div className="text-2xl mb-2">+</div>
                <div className="text-xs font-medium">Post with Me</div>
              </button>
            ) : (
              <>
                {/* Post with Me Button as first item (after status if present) */}
                {!postCreationStatus && (
                  <button
                    onClick={() => setIsTaggedModalOpen(true)}
                    className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-gray-600 hover:text-gray-700"
                  >
                    <div className="text-2xl mb-2">+</div>
                    <div className="text-xs font-medium">Post with Me</div>
                  </button>
                )}
                {/* Tagged posts */}
                {taggedPosts.map((taggedPost, i) => (
                  <div
                    key={taggedPost.id}
                    className="aspect-square bg-gray-300 hover:opacity-90 transition-opacity overflow-hidden relative cursor-pointer"
                    onClick={() => openPost(taggedPost)}
                  >
                    <img 
                      src={taggedPost.generatedImage} 
                      alt={`Tagged Post ${i + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
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
      
      {/* Following Modal */}
      <FollowingModal 
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
      />
      
      {/* Tagged Post Modal */}
      <TaggedPostModal 
        isOpen={isTaggedModalOpen}
        onClose={() => setIsTaggedModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
      
      {/* Story Viewer */}
      <StoryViewer 
        isOpen={isStoryViewerOpen}
        onClose={() => setIsStoryViewerOpen(false)}
        onStoryComplete={() => setHasViewedStory(true)}
      />
    </div>
  );
}
