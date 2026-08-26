import React, { useState } from 'react';
import { Camera, Loader2, User as UserIcon } from 'lucide-react';
import { getEffectiveAvatarUrl } from '../../services/avatarStorageService';

export interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  googlePhotoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'chat';
  className?: string;
  isEditable?: boolean;
  isUploading?: boolean;
  onFileSelect?: (file: File) => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Learner',
  avatarUrl,
  googlePhotoUrl,
  size = 'md',
  className = '',
  isEditable = false,
  isUploading = false,
  onFileSelect,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const effectiveUrl = getEffectiveAvatarUrl(avatarUrl, googlePhotoUrl);
  const initial = (name?.trim()?.charAt(0) || 'L').toUpperCase();

  // Reset error if url changes
  React.useEffect(() => {
    setImageError(false);
  }, [effectiveUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset file input value so selecting the same file again triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  // Size styling configurations matching existing design
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs font-bold',
    md: 'w-8 h-8 rounded-full text-xs font-bold border border-indigo-300/30',
    chat: 'w-8 h-8 rounded-xl text-xs font-bold border border-slate-600',
    lg: 'w-16 h-16 rounded-2xl text-2xl font-extrabold shadow-xl shadow-indigo-500/25 border border-indigo-400/40',
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-full',
    chat: 'rounded-xl',
    lg: 'rounded-2xl',
  };

  const isLg = size === 'lg';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${
          effectiveUrl && !imageError
            ? 'bg-slate-800'
            : isLg
            ? 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600'
            : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
        } flex items-center justify-center text-white overflow-hidden relative select-none`}
      >
        {effectiveUrl && !imageError ? (
          <img
            src={effectiveUrl}
            alt={`${name}'s profile avatar`}
            className={`w-full h-full object-cover ${roundedClasses[size]}`}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <span>{initial}</span>
        )}

        {/* Uploading Spinner Overlay */}
        {isUploading && (
          <div className={`absolute inset-0 bg-black/70 flex items-center justify-center ${roundedClasses[size]} z-10`}>
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Large Avatar Hover Change Overlay for Desktop/Touch on Profile Page */}
        {isEditable && !isUploading && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Change profile picture"
            className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer ${roundedClasses[size]}`}
            aria-label="Upload new profile picture"
          >
            <Camera className="w-5 h-5 text-indigo-300" />
            <span className="text-[9px] font-semibold mt-0.5 tracking-tight">Edit</span>
          </button>
        )}
      </div>

      {/* Profile Page Corner Edit Badge Button for high visibility */}
      {isEditable && !isUploading && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Change photo"
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center border-2 border-[#070b14] shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Camera className="w-3 h-3 text-white" />
          </button>
        </>
      )}
    </div>
  );
};
