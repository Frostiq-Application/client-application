import { useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, Check, ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { LoadingScreen } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import {
  CUSTOM_CAKE_PIPELINE,
  CUSTOM_CAKE_STATUS_LABEL,
  CUSTOM_CAKE_STATUS_TONE,
} from "@/features/custom-cake/constants";
import {
  useCustomCakeEvents,
  useCustomCakeRequest,
  useRespondToQuote,
} from "@/features/custom-cake/hooks";
import { useSelectedBranch } from "@/hooks/useStorefront";
import { cn } from "@/lib/cn";
import { buildWaLink } from "@/lib/whatsapp";
import { toast } from "@/store/toastStore";
import type { CustomCakeEvent } from "@/types/domain.types";
import { formatCurrency, formatDate } from "@/utils/format";

/** "2026-07-19T14:04:00Z" -> "Sun, 19 Jul · 2:04 PM". */
function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${formatDate(iso)} · ${time}`;
}

/** Events with no admin author are the customer's own actions. */
const isCustomerEvent = (e: CustomCakeEvent) => e.changedBy === null;

export function CustomCakeRequestDetailPage() {
  const { requestId = "" } = useParams<{ requestId: string }>();
  const { branch } = useSelectedBranch();
  const shopId = branch?.id ?? null;
  const { data: req, isLoading, isError, refetch } = useCustomCakeRequest(
    shopId,
    requestId,
  );
  const { data: events } = useCustomCakeEvents(shopId, requestId);
  const respond = useRespondToQuote(shopId, requestId);

  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineNote, setDeclineNote] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (isError || !req) {
    return (
      <Page>
        <TopBar title="Request" back />
        <ErrorState error={null} onRetry={() => refetch()} />
      </Page>
    );
  }

  const isTerminal = req.status === "rejected" || req.status === "cancelled";
  const quotePending = req.status === "quotation_sent" && !!req.quotedPrice;
  const activeIdx = CUSTOM_CAKE_PIPELINE.indexOf(req.status);
  const progress =
    activeIdx < 0
      ? 0
      : ((activeIdx + 1) / CUSTOM_CAKE_PIPELINE.length) * 100;

  const details: [string, string | null][] = [
    ["Cake type", req.cakeType],
    ["Weight", req.weight],
    ["Shape", req.shape],
    ["Occasion", req.occasion],
    ["Theme", req.theme],
    ["Sponge", req.sponge],
    ["Cream", req.cream],
    ["Filling", req.filling],
    ["Flavour", req.flavour],
    ["Colour", req.colour],
    ["Topper", req.topper],
    ["Decorations", req.decorations.length ? req.decorations.join(", ") : null],
    ["Message", req.cakeMessage],
    ["Needed", req.neededDate ? formatDate(req.neededDate) : null],
    ["Delivery", req.deliveryType],
    ["Address", req.deliveryAddress],
  ];

  const waNumber = branch?.whatsappNumber;

  const accept = () =>
    respond.mutate(
      { accept: true },
      {
        onSuccess: () => toast.success("Quote accepted — the bakery is on it!"),
        onError: () => toast.error("Couldn't accept the quote. Try again."),
      },
    );

  const decline = () =>
    respond.mutate(
      { accept: false, note: declineNote.trim() || undefined },
      {
        onSuccess: () => {
          setDeclineOpen(false);
          toast.show("Quote declined");
        },
        onError: () => toast.error("Couldn't decline the quote. Try again."),
      },
    );

  return (
    <Page>
      <TopBar title={req.requestNumber} back />
      <PageSection className="mx-auto w-full space-y-4 pb-10 md:max-w-2xl">
        {/* Status header */}
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${CUSTOM_CAKE_STATUS_TONE[req.status]}`}
            >
              {CUSTOM_CAKE_STATUS_LABEL[req.status]}
            </span>
            {req.quotedPrice && !quotePending && (
              <span className="text-base font-bold text-primary">
                {formatCurrency(req.quotedPrice)}
              </span>
            )}
          </div>
          {!isTerminal && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>Submitted</span>
                <span>Delivered</span>
              </div>
            </div>
          )}
          {isTerminal && req.resolutionReason && (
            <p className="mt-2 text-sm text-muted-foreground">
              {req.resolutionReason}
            </p>
          )}
        </div>

        {/* Quotation — awaiting the customer's answer */}
        {quotePending && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Your quote is ready
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {formatCurrency(req.quotedPrice as string)}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Accept to confirm your custom cake, or decline if it doesn't work
              for you.
            </p>
            <div className="mt-4 space-y-2">
              <Button block loading={respond.isPending} onClick={accept}>
                <Check className="h-4 w-4" />
                Accept quote
              </Button>
              <Button
                block
                variant="ghost"
                disabled={respond.isPending}
                onClick={() => setDeclineOpen(true)}
              >
                Decline
              </Button>
            </div>
          </div>
        )}

        {/* Accepted confirmation */}
        {req.status === "accepted" && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Quote accepted
              </p>
              <p className="mt-0.5 text-sm text-emerald-700">
                The bakery will confirm your order and start preparing soon.
              </p>
            </div>
          </div>
        )}

        {/* Conversation timeline */}
        {events && events.length > 0 && (
          <div className="rounded-2xl border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Activity</p>
            <ol className="space-y-3">
              {events.map((e) => {
                const mine = isCustomerEvent(e);
                return (
                  <li
                    key={e.id}
                    className={cn("flex", mine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                        mine
                          ? "rounded-br-md bg-primary/10"
                          : "rounded-bl-md bg-surface-2",
                      )}
                    >
                      <p className="text-xs font-semibold">
                        {mine ? "You" : branch?.branchName ?? "Bakery"}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          {CUSTOM_CAKE_STATUS_LABEL[e.status]}
                        </span>
                      </p>
                      {e.note && <p className="mt-0.5 text-sm">{e.note}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatEventTime(e.changedAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Reference images */}
        {req.referenceImageUrls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {req.referenceImageUrls.map((u) => (
              <img
                key={u}
                src={u}
                alt="Reference"
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        {/* Request details (collapsible) */}
        <div className="rounded-2xl border bg-card">
          <button
            className="flex w-full items-center justify-between p-4"
            onClick={() => setDetailsOpen((o) => !o)}
          >
            <span className="text-sm font-semibold">Your request</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                detailsOpen && "rotate-180",
              )}
            />
          </button>
          {detailsOpen && (
            <dl className="space-y-2.5 px-4 pb-4">
              {details
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 text-sm">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
            </dl>
          )}
        </div>

        {/* Contact the bakery */}
        {waNumber && (
          <Button
            variant="secondary"
            block
            onClick={() =>
              window.open(
                buildWaLink(
                  waNumber,
                  `Hi, about my custom cake request ${req.requestNumber}`,
                ),
                "_blank",
              )
            }
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Message the bakery
          </Button>
        )}
      </PageSection>

      {/* Decline confirmation */}
      <Sheet
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        title="Decline this quote?"
      >
        <div className="space-y-4 p-4 pt-1">
          <p className="text-sm text-muted-foreground">
            This will cancel your request. You can always start a new one, or
            message the bakery to negotiate first.
          </p>
          <textarea
            value={declineNote}
            onChange={(e) => setDeclineNote(e.target.value)}
            placeholder="Tell the bakery why (optional)"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-2xl border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="space-y-2">
            <Button
              block
              variant="danger"
              loading={respond.isPending}
              onClick={decline}
            >
              Decline quote
            </Button>
            <Button
              block
              variant="ghost"
              disabled={respond.isPending}
              onClick={() => setDeclineOpen(false)}
            >
              Keep thinking
            </Button>
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
