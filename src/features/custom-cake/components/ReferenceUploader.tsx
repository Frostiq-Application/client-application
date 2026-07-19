import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { customCakeService } from "@/services/api/customCake.service";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";
import { MAX_REFERENCE_IMAGES } from "../constants";

/**
 * Uploads inspiration / reference photos for a custom cake request. Each file
 * uploads immediately to the public storefront upload route and the returned
 * URL is added to `urls`.
 */
export function ReferenceUploader({
  shopId,
  urls,
  onChange,
}: {
  shopId: string;
  urls: string[];
  onChange: (urls: string[]) => void;
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

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">
        Reference photos <span className="text-muted-foreground">(optional)</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative h-20 w-20">
            <img src={url} alt="Reference" className="h-full w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((u) => u !== url))}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"
            >
              <X className="h-3.5 w-3.5" />
            </button>
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
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => onPick(e.target.files)}
      />
    </div>
  );
}
