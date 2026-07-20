import { useRef, useState } from "react";
import { ImagePlus, Camera, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { customCakeService } from "@/services/api/customCake.service";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";
import { MAX_REFERENCE_IMAGES } from "../constants";

/**
 * Uploads inspiration / reference photos for a custom cake request. Each file
 * uploads immediately to the public storefront upload route and the returned
 * URL is added to `urls`.
 *
 * `hero` renders a large, inviting drop zone (used as the first thing the
 * customer sees); otherwise a compact labelled thumbnail row.
 */
export function ReferenceUploader({
  shopId,
  urls,
  onChange,
  hero = false,
}: {
  shopId: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  hero?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const atLimit = urls.length >= MAX_REFERENCE_IMAGES;

  const onPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_REFERENCE_IMAGES - urls.length;
    const picked = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of picked) {
        uploaded.push(await customCakeService.uploadReference(shopId, file));
      }
      onChange([...urls, ...uploaded]);
    } catch (err) {
      toast.error(normalizeError(err).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      hidden
      onChange={(e) => onPick(e.target.files)}
    />
  );

  const removeButton = (url: string) => (
    <button
      type="button"
      onClick={() => onChange(urls.filter((u) => u !== url))}
      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );

  // Hero: big empty drop zone first, then a larger thumbnail grid once photos exist.
  if (hero) {
    if (urls.length === 0) {
      return (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-border bg-surface-2/40 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-surface-2"
          >
            {uploading ? (
              <Spinner className="h-7 w-7" />
            ) : (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera className="h-7 w-7" />
                </span>
                <span className="text-sm font-semibold text-foreground">Add photos</span>
                <span className="text-xs">Tap to upload up to {MAX_REFERENCE_IMAGES}</span>
              </>
            )}
          </button>
          {fileInput}
        </div>
      );
    }
    return (
      <div>
        <div className="grid grid-cols-3 gap-3">
          {urls.map((url) => (
            <div key={url} className="relative aspect-square">
              <img src={url} alt="Reference" className="h-full w-full rounded-2xl object-cover" />
              {removeButton(url)}
            </div>
          ))}
          {!atLimit && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50"
            >
              {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
            </button>
          )}
        </div>
        {fileInput}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">
        Reference photos <span className="text-muted-foreground">(optional)</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative h-20 w-20">
            <img src={url} alt="Reference" className="h-full w-full rounded-xl object-cover" />
            {removeButton(url)}
          </div>
        ))}
        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50"
          >
            {uploading ? <Spinner /> : <ImagePlus className="h-6 w-6" />}
          </button>
        )}
      </div>
      {fileInput}
    </div>
  );
}
