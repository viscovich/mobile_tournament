import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export async function GET({ params }: { params: { imageId: string } }) {
  try {
    const { imageId } = params;
    console.log(`[Image Existence Check] Checking for imageId: ${imageId}`);

    // Validate imageId to prevent potential path traversal
    if (!imageId || typeof imageId !== 'string' || imageId.includes('..')) {
      console.warn(`[Image Existence Check] Invalid imageId: ${imageId}`);
      return new Response(JSON.stringify({ 
        exists: false,
        imageId: imageId,
        error: 'Invalid image ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Construct the absolute path to the static directory
    const staticDir = path.resolve('static/images');
    
    // Check for image existence in multiple formats
    let imageExists = false;
    let existingImageFormat = '';

    for (const format of SUPPORTED_IMAGE_FORMATS) {
      const imagePath = path.join(staticDir, `${imageId}.${format}`);
      
      // Check if the path is within the static images directory
      const normalizedStaticDir = path.normalize(staticDir);
      const normalizedImagePath = path.normalize(imagePath);
      
      if (!normalizedImagePath.startsWith(normalizedStaticDir)) {
        console.warn(`[Image Existence Check] Path traversal attempt detected: ${imagePath}`);
        continue;
      }

      try {
        if (fs.existsSync(imagePath)) {
          imageExists = true;
          existingImageFormat = format;
          break;
        }
      } catch (fsError) {
        console.error(`[Image Existence Check] File system error for ${imageId}.${format}:`, fsError);
      }
    }

    console.log(`[Image Existence Check] Image exists: ${imageExists}, Format: ${existingImageFormat}`);

    return new Response(JSON.stringify({ 
      exists: imageExists,
      imageId: imageId,
      format: existingImageFormat
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err) {
    console.error('[Image Existence Check] Unexpected error:', err);
    throw error(500, 'Internal server error');
  }
}
