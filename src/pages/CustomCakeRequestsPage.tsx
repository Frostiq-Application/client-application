import { useNavigate } from "react-router-dom";
import { CakeSlice, ChevronRight, Plus } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import {
  CUSTOM_CAKE_STATUS_LABEL,
  CUSTOM_CAKE_STATUS_TONE,
} from "@/features/custom-cake/constants";
import {
  useCustomCakeRealtime,
  useMyCustomCakeRequests,
} from "@/features/custom-cake/hooks";
import { useSelectedBranch } from "@/hooks/useStorefront";
import { buildPath, ROUTES } from "@/routes/paths";
import { formatDate } from "@/utils/format";

export function CustomCakeRequestsPage() {
  const navigate = useNavigate();
  const { branch, isLoading: brandLoading } = useSelectedBranch();
  const shopId = branch?.id ?? null;
  const { data: requests, isLoading } = useMyCustomCakeRequests(shopId);
  useCustomCakeRealtime(shopId);

  if (brandLoading || isLoading) return <LoadingScreen />;

  return (
    <Page>
      <TopBar title="My custom cakes" back />
      <PageSection className="mx-auto w-full space-y-3 pb-8 md:max-w-2xl">
        {!requests || requests.length === 0 ? (
          <EmptyState
            icon={<CakeSlice className="h-8 w-8" />}
            title="No requests yet"
            description="Start a custom cake request and it'll show up here."
            action={
              <Button onClick={() => navigate(ROUTES.CUSTOM_CAKE)}>
                <Plus className="mr-1.5 h-4 w-4" />
                New request
              </Button>
            }
          />
        ) : (
          <>
            {requests.map((r) => {
              const summary = [r.weight, r.shape, r.cakeType, r.flavour]
                .filter(Boolean)
                .join(" · ");
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(buildPath.customCakeRequest(r.id))}
                  className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CakeSlice className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {r.requestNumber}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CUSTOM_CAKE_STATUS_TONE[r.status]}`}
                      >
                        {CUSTOM_CAKE_STATUS_LABEL[r.status]}
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium">
                      {summary || "Custom cake"}
                    </p>
                    {r.quotedPrice && (
                      <p className="text-sm font-semibold text-primary">
                        Quote: ₹{r.quotedPrice}
                        {r.status === "quotation_sent" && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                            Respond now
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
            <Button
              variant="secondary"
              block
              onClick={() => navigate(ROUTES.CUSTOM_CAKE)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New request
            </Button>
          </>
        )}
      </PageSection>
    </Page>
  );
}
