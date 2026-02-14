import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads a resume (PDF/DOC/DOCX) to Cloudinary authenticated raw folder.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'resumes'
): Promise<{ url: string; publicId: string }> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Extract file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'

  // Safe public_id: timestamp + sanitized file name
  const timestamp = Date.now()
  const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
  const publicId = `${timestamp}_${baseName}.${fileExtension}`

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `hirezium/${folder}`,
          resource_type: 'raw',    // Raw type for PDF/DOC/DOCX
          public_id: publicId,
          type: 'authenticated',   // Required for signed URLs
        },
        (error, result) => {
          if (error) reject(error)
          else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            })
          } else reject(new Error('Upload failed'))
        }
      )
      .end(buffer)
  })
}

/**
 * Generates a temporary signed URL for a Cloudinary authenticated raw resource.
 * TypeScript-safe: uses the file extension from publicId.
 */
export function generateSignedUrl(publicId: string): string {
  // Extract file extension from publicId for the format argument
  const extension = publicId.split('.').pop() || 'pdf'

  return cloudinary.utils.private_download_url(publicId, extension, {
    resource_type: 'raw',       // Must match upload
    type: 'authenticated',      // Must match upload
    expires_at: Math.floor(Date.now() / 1000) + 300, // 5 min expiration
    attachment: false,          // Inline preview in iframe
  })
}

/**
 * Deletes a file from Cloudinary using its publicId.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'raw',
    type: 'authenticated',
  })
}

// Export Cloudinary instance if needed elsewhere
export { cloudinary }
