import React from 'react';
import { useEffect, useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';

interface LocationMapProps {
  embedUrl?: string;
  title?: string;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  embedUrl = import.meta.env.VITE_GOOGLE_MAP_EMBED_URL,
  title = 'Our Location',
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!embedUrl) {
      setHasError(true);
      return;
    }
    setIsLoaded(true);
  }, [embedUrl]);

  if (!embedUrl) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>Map URL not configured. Please set VITE_GOOGLE_MAP_EMBED_URL in .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {isLoaded && (
        <div className="overflow-hidden rounded-lg shadow-md">
          <iframe
            src={embedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onError={() => setHasError(true)}
            title={title}
          />
        </div>
      )}

      {hasError && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">
            Unable to load map. Please verify the map URL is correct.
          </p>
        </div>
      )}
    </div>
  );
};
