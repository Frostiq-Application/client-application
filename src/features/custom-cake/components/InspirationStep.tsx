import { ReferenceUploader } from "./ReferenceUploader";

/**
 * First step of the custom cake flow — image-first. The customer shares
 * reference photos and, optionally, a free-text description of what they want.
 */
export function InspirationStep({
  shopId,
  urls,
  onUrlsChange,
  notes,
  onNotesChange,
}: {
  shopId: string;
  urls: string[];
  onUrlsChange: (urls: string[]) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <div className="space-y-5">
      <ReferenceUploader shopId={shopId} urls={urls} onChange={onUrlsChange} hero />

      <div>
        <label htmlFor="cc-notes" className="mb-1.5 block text-sm font-medium text-foreground">
          Tell us about it <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="cc-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Describe your dream cake — the vibe, colours, occasion, anything you're imagining."
          rows={4}
          className="w-full resize-none rounded-2xl border border-input bg-surface px-3.5 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
        />
      </div>
    </div>
  );
}
