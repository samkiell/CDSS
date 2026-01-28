/**
 * Cloudinary Configuration
 * Handles image and file uploads for medical attachments
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload options for different file types
 */
const UPLOAD_PRESETS = {
  medical_image: {
    folder: 'cdss/medical_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'dicom', 'dcm'],
    transformation: [{ quality: 'auto:best' }, { fetch_format: 'auto' }],
    resource_type: 'image',
    access_mode: 'public',
    type: 'upload',
  },
  document: {
    folder: 'cdss/documents',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type: 'raw',
    access_mode: 'public',
    type: 'upload',
  },
  medical_report: {
    folder: 'cdss/medical_reports',
    access_mode: 'public',
    type: 'upload',
    // We handle resource_type dynamically in the API route
  },
  avatar: {
    folder: 'cdss/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    resource_type: 'image',
    access_mode: 'public',
    type: 'upload',
  },
};

/**
 * Upload a file to Cloudinary
 * @param {string|Buffer} file - File path, data URI, or Buffer to upload
 * @param {Object} options - Upload options
 */
export async function uploadFile(file, options = {}) {
  const { preset = 'medical_image', publicId, customOptions = {} } = options;
  const presetConfig = UPLOAD_PRESETS[preset] || UPLOAD_PRESETS.medical_image;

  try {
    const uploadOptions = {
      ...presetConfig,
      ...customOptions,
      ...(publicId && { public_id: publicId }),
      timeout: 120000, // Increase timeout to 2 minutes
    };

    // If it's a Buffer, use upload_stream
    if (Buffer.isBuffer(file)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary stream upload error:', error);
              resolve({ success: false, error: error.message });
            } else {
              resolve({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                resourceType: result.resource_type,
              });
            }
          }
        );
        uploadStream.end(file);
      });
    }

    // Otherwise use standard upload (for strings/URIs/paths)
    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Type of resource ('image', 'video', 'raw')
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFile(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate a signed upload URL for direct client uploads
 * @param {Object} options - Upload options
 * @returns {Object} Signed upload parameters
 */
export function generateSignedUploadParams(options = {}) {
  const { preset = 'medical_image', ...customOptions } = options;
  const presetConfig = UPLOAD_PRESETS[preset] || UPLOAD_PRESETS.medical_image;

  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: presetConfig.folder,
    ...customOptions,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: presetConfig.folder,
  };
}

/**
 * Generate optimized URL for displaying images
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Optimized image URL
 */
export function getOptimizedUrl(publicId, transformations = {}) {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
  };

  return cloudinary.url(publicId, {
    ...defaultTransformations,
    ...transformations,
  });
}

/**
 * Generate thumbnail URL
 * @param {string} publicId - Public ID of the image
 * @param {number} size - Thumbnail size (width and height)
 * @returns {string} Thumbnail URL
 */
export function getThumbnailUrl(publicId, size = 150) {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}

export { cloudinary };
export default cloudinary;
