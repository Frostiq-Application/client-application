import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CakeSlice, Check, ScrollText, Sparkles } from "lucide-react";
import { TopBar, TopBarAction } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingScreen } from "@/components/ui/Spinner";
import { TieredCakeArt, WhiskBowlArt } from "@/components/common/illustrations";
import { listContainer, listItem, tapScale } from "@/animations/variants";
import { CUSTOM_CAKE_MODES, CUSTOM_CAKE_START_COPY } from "@/features/custom-cake/constants";
import { useSelectedBranch, useBrandFeatures } from "@/hooks/useStorefront";
import { ROUTES } from "@/routes/paths";

/**
 * Entry screen for custom cakes: the customer chooses HOW they want to start —
 * a guided walk through the live menu, or the open-ended "describe it" request.
 * Both paths converge on the same request submission.
 */
export function CustomCakeStartPage() {
  const navigate = useNavigate();
  const { isLoading } = useSelectedBranch();
  const { customCake } = useBrandFeatures();

  if (isLoading) return <LoadingScreen />;

  if (!customCake) {
    return (
      <Page>
        <TopBar title={CUSTOM_CAKE_START_COPY.title} back />
        <EmptyState
          icon={<CakeSlice className="h-8 w-8" />}
          title="Not available"
          description="Custom cake ordering isn't offered by this store."
        />
      </Page>
    );
  }

  return (
    <Page className="bg-surface-2/40">
      <TopBar
        title={CUSTOM_CAKE_START_COPY.title}
        back
        actions={
          <TopBarAction
            label={CUSTOM_CAKE_START_COPY.myRequests}
            onClick={() => navigate(ROUTES.CUSTOM_CAKE_REQUESTS)}
          >
            <ScrollText className="h-5 w-5" />
          </TopBarAction>
        }
      />

      <PageSection className="mx-auto w-full max-w-2xl pb-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="relative mt-1 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5"
        >
          <div className="relative z-10 max-w-[70%]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Made to order
            </span>
            <h2 className="mt-3 text-[22px] font-extrabold leading-tight tracking-tight">
              {CUSTOM_CAKE_START_COPY.heading}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {CUSTOM_CAKE_START_COPY.subheading}
            </p>
          </div>
          <TieredCakeArt className="absolute -bottom-3 -right-3 h-32 w-32 opacity-90" />
        </motion.div>

        {/* Mode cards */}
        <motion.div
          variants={listContainer}
          initial="initial"
          animate="animate"
          className="mt-5 space-y-4"
        >
          <ModeCard
            variant="guided"
            onClick={() => navigate(ROUTES.CUSTOM_CAKE_GUIDED)}
          />
          <ModeCard
            variant="describe"
            onClick={() => navigate(ROUTES.CUSTOM_CAKE_DESCRIBE)}
          />
        </motion.div>
      </PageSection>
    </Page>
  );
}

function ModeCard({
  variant,
  onClick,
}: {
  variant: "guided" | "describe";
  onClick: () => void;
}) {
  const mode = CUSTOM_CAKE_MODES[variant];
  const guided = variant === "guided";
  const Art = guided ? TieredCakeArt : WhiskBowlArt;

  return (
    <motion.button
      type="button"
      variants={listItem}
      whileTap={tapScale}
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-3xl border p-5 text-left shadow-card transition-colors",
        guided
          ? "border-primary/30 bg-primary/[0.07]"
          : "border-border bg-surface",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
            guided ? "bg-primary/15" : "bg-surface-2",
          ].join(" ")}
        >
          <Art className="h-11 w-11" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-bold leading-tight">{mode.title}</h3>
            {guided && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                Popular
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{mode.subtitle}</p>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{mode.blurb}</p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {mode.bullets.map((b) => (
          <span key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80">
            <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
            {b}
          </span>
        ))}
      </div>

      <div
        className={[
          "mt-4 flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-semibold",
          guided
            ? "bg-primary text-primary-foreground"
            : "bg-surface-2 text-foreground",
        ].join(" ")}
      >
        {guided ? "Start building" : "Describe it"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  );
}
