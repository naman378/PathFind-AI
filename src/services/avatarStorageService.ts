import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface OptimizedImageResult {
  blob: Blob;
  dataUrl: string;
}

/**
 * Validates and optimizes a user-selected avatar image file client-side.
 * Crops to a center square and scales to 256x256 px with smooth interpolation,
 * returning both a Blob (for Firebase Storage) and a compact base64 data URL.
 */
export async function optimizeImageFile(
  file: File,
  targetSize: number = 256,
  quality: number = 0.85
): Promise<OptimizedImageResult> {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Please select a valid JPG, JPEG, PNG, or WebP image file.');
  }

  // Max 10MB input file limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image file is too large. Please choose an image smaller than 10MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to create canvas context for image optimization.'));
            return;
          }

          // Center crop calculation
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw cropped & scaled square
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                // Fallback to dataUrl-based blob
                resolve({
                  blob: new Blob([dataUrl], { type: 'image/jpeg' }),
                  dataUrl,
                });
              }
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Could not read image file. The file may be corrupted.'));
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Failed to load image data.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from your device.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a profile picture for the authenticated user.
 * Tries Firebase Storage first if available and falls back safely to
 * the compact, high-efficiency data URL in Firestore.
 */
export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  if (!userId) {
    throw new Error('User must be authenticated to upload a profile picture.');
  }

  const { blob, dataUrl } = await optimizeImageFile(file, 256, 0.85);

  // Attempt Firebase Storage if configured
  if (storage) {
    try {
      const fileExt = 'jpg';
      const storageRef = ref(storage, `users/${userId}/avatar_${Date.now()}.${fileExt}`);
      await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedBy: userId,
          updatedAt: new Date().toISOString(),
        },
      });
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (storageError: any) {
      console.warn(
        'Firebase Storage upload unavailable or unpermissioned, falling back to optimized inline avatar data:',
        storageError?.message || storageError
      );
      // Fallback safely to data URL
      return dataUrl;
    }
  }

  // Safe fallback if Firebase Storage is not provisioned
  return dataUrl;
}

/**
 * Resolves the effective avatar URL based on the strict fallback priority:
 * 1. Manual uploaded profile picture (profile.avatarUrl)
 * 2. Google account profile picture (firebaseUser.photoURL)
 * 3. Fallback (undefined -> display initial-based avatar)
 */
export function getEffectiveAvatarUrl(
  profileAvatarUrl?: string | null,
  firebaseUserPhotoUrl?: string | null
): string | undefined {
  if (profileAvatarUrl && profileAvatarUrl.trim() !== '') {
    return profileAvatarUrl.trim();
  }
  if (firebaseUserPhotoUrl && firebaseUserPhotoUrl.trim() !== '') {
    return firebaseUserPhotoUrl.trim();
  }
  return undefined;
}
