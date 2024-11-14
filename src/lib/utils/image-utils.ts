const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export async function checkImageExists(imageId: string | number, timeoutMs: number = 5000): Promise<boolean> {
  try {
    // Create an abort controller to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[Image Check] Checking image existence for ID: ${imageId}`);

      const response = await fetch(`/api/check-image-exists/${imageId}`, {
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);

      // Check if the response is OK and has the correct content type
      if (!response.ok) {
        console.warn(`[Image Check] HTTP error for image ${imageId}! status: ${response.status}`);
        return false;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`[Image Check] Invalid content type for image ${imageId}`);
        return false;
      }

      const result = await response.json();
      
      // Validate the response structure
      if (typeof result.exists !== 'boolean') {
        console.warn(`[Image Check] Invalid response structure for image ${imageId}`, result);
        return false;
      }

      console.log(`[Image Check] Image ${imageId} exists: ${result.exists}, Format: ${result.format || 'unknown'}`);
      return result.exists === true;
    } catch (fetchError) {
      // Clear the timeout if fetch fails
      clearTimeout(timeoutId);

      // Check for specific error types
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        console.warn(`[Image Check] Image existence check for ${imageId} timed out`);
      } else {
        console.warn(`[Image Check] Fetch error for image ${imageId}:`, fetchError);
      }
      return false;
    }
  } catch (error) {
    console.error(`[Image Check] Unexpected error checking image ${imageId} existence:`, error);
    return false;
  }
}

export function getPlayerImageSrc(playerId: number | string, defaultImage: string = '/images/default-player.jpg'): string {
  // Prioritize formats based on performance and quality
  const prioritizedFormats = ['jpg', 'webp', 'png', 'jpeg', 'gif'];
  
  for (const format of prioritizedFormats) {
    const imagePath = `/images/${playerId}.${format}`;
    return imagePath;
  }

  return defaultImage;
}
