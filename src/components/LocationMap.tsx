import React from 'react';
import { useEffect, useState } from 'react';
import { AlertCircle, MapPin, Copy, Check } from 'lucide-react';

interface LocationMapProps {
  mapUrl: string;
  title?: string;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  mapUrl,
  title = 'Our Location',
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mapUrl) {
      setHasError(true);
      return;
    }
    setIsLoaded(true);
    setHasError(false);
  }, [mapUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mapUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mapUrl) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>Map URL required</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <button
          onClick={handleCopyLink}
          className="rounded px-2 py-1 text-sm hover:bg-gray-100"
          title="Copy map link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {isLoaded && !hasError && (
        <div className="overflow-hidden rounded-lg shadow-md">
          <iframe
            src={mapUrl}
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
            Unable to load map. Please verify the URL is a valid Google Maps embed link.
          </p>
        </div>
      )}
    </div>
  );
};
