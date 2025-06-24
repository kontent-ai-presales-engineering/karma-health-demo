/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param url - YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID, etc.)
 * @returns YouTube video ID or null if not a valid YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Remove any leading/trailing whitespace
  const trimmedUrl = url.trim();

  // YouTube URL patterns
  const patterns = [
    // Standard YouTube watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // YouTube Shorts: https://youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts a YouTube URL to the proper embed URL format
 * @param url - YouTube URL
 * @param autoplay - Whether to enable autoplay
 * @param mute - Whether to mute the video (required for autoplay)
 * @returns YouTube embed URL or null if not a valid YouTube URL
 */
export function getYouTubeEmbedUrl(
  url: string, 
  autoplay: boolean = false, 
  mute: boolean = false
): string | null {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) return null;

  const params = new URLSearchParams();
  
  if (autoplay) {
    params.append('autoplay', '1');
    // YouTube requires mute=1 for autoplay to work
    params.append('mute', '1');
  } else if (mute) {
    params.append('mute', '1');
  }

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Checks if a URL is a valid YouTube URL
 * @param url - URL to check
 * @returns true if it's a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
} 