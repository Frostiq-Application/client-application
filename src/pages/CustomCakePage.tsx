import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CakeSlice, Check, ChevronLeft, ScrollText } from "lucide-react";
import { TopBar, TopBarAction } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { OptionPills, MultiOptionPills } from "@/features/custom-cake/components/OptionPills";
import { CustomCakeOptionsSkeleton } from "@/features/custom-cake/components/CustomCakeOptionsSkeleton";
import { InspirationStep } from "@/features/custom-cake/components/InspirationStep";
import { tabFade } from "@/animations/variants";
import {
  CUSTOM_CAKE_COPY,
  CUSTOM_CAKE_STEPS,
  DETAIL_GROUPS,
  SELECT_FIELDS,
} from "@/features/custom-cake/constants";
import { useCustomCakeOptions } from "@/features/custom-cake/hooks";
import { useSelectedBranch, useBrandFeatures } from "@/hooks/useStorefront";
import { customCakeService } from "@/services/api/customCake.service";
import { QK } from "@/constants/query-keys.constants";
import { DELIVERY_TYPE, type DeliveryType } from "@/constants/status.constants";
import { ROUTES } from "@/routes/paths";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";
import { useAuthStore } from "@/store/authStore";
import type { CustomCakeRequestInput } from "@/types/domain.types";

type Draft = Partial<CustomCakeRequestInput> & {
  decorations: string[];
  referenceImageUrls: string[];
  deliveryType: DeliveryType;
};

const emptyDraft = (name?: string, phone?: string): Draft => ({
  contactName: name ?? "",
  contactPhone: phone ?? "",
  decorations: [],
  referenceImageUrls: [],
  deliveryType: DELIVERY_TYPE.DELIVERY,
});

const LAST_STEP = CUSTOM_CAKE_STEPS.length - 1;

export function CustomCakePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branch, isLoading } = useSelectedBranch();
  const { customCake } = useBrandFeatures();
  const profile = useAuthStore((s) => s.customer);
  const shopId = branch?.id ?? null;

  const { data: options, isLoading: optionsLoading } = useCustomCakeOptions(shopId);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>(() =>
    emptyDraft(profile?.name ?? undefined, profile?.phone ?? undefined),
  );

  const step = CUSTOM_CAKE_STEPS[stepIdx]?.key ?? "inspiration";

  const submit = useMutation({
    mutationFn: () =>
      customCakeService.submit(
        shopId as string,
        {
          ...draft,
          contactName: draft.contactName ?? "",
          contactPhone: draft.contactPhone ?? "",
          deliveryType: draft.deliveryType,
        } as CustomCakeRequestInput,
      ),
    onSuccess: () => {
      if (shopId) {
        void queryClient.invalidateQueries({
          queryKey: QK.customCakeRequests(shopId),
        });
      }
      setSubmitted(true);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const optionsFor = (field: string) => options?.[field] ?? [];

  const canSend = useMemo(
    () =>
      (draft.contactName ?? "").trim().length >= 2 &&
      (draft.contactPhone ?? "").replace(/\D/g, "").length >= 7,
    [draft.contactName, draft.contactPhone],
  );

  if (isLoading) return <LoadingScreen />;

  if (!customCake) {
    return (
      <Page>
        <TopBar title={CUSTOM_CAKE_COPY.entryTitle} back />
        <EmptyState
          icon={<CakeSlice className="h-8 w-8" />}
          title="Not available"
          description="Custom cake ordering isn't offered by this store."
        />
      </Page>
    );
  }

  if (submitted) {
    return (
      <Page>
        <TopBar title={CUSTOM_CAKE_COPY.entryTitle} />
        <PageSection>
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">{CUSTOM_CAKE_COPY.submitted}</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              {CUSTOM_CAKE_COPY.submittedBody}
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              <Button block onClick={() => navigate(ROUTES.CUSTOM_CAKE_REQUESTS)}>
                View my requests
              </Button>
              <Button variant="ghost" block onClick={() => navigate(ROUTES.HOME)}>
                Back to home
              </Button>
            </div>
          </div>
        </PageSection>
      </Page>
    );
  }

  return (
    <Page>
      <TopBar
        title={CUSTOM_CAKE_COPY.entryTitle}
        back
        actions={
          <TopBarAction label="My requests" onClick={() => navigate(ROUTES.CUSTOM_CAKE_REQUESTS)}>
            <ScrollText className="h-5 w-5" />
          </TopBarAction>
        }
      />

      {/* Step progress */}
      <div className="flex items-center gap-1.5 px-4 pb-3">
        {CUSTOM_CAKE_STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= stepIdx ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <PageSection className="mx-auto w-full space-y-6 pb-40 md:max-w-2xl">
        <AnimatePresence mode="wait" initial={false}>
          {step === "inspiration" && (
            <motion.div
              key="inspiration"
              variants={tabFade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepBlock
                title={CUSTOM_CAKE_COPY.inspirationTitle}
                subtitle={CUSTOM_CAKE_COPY.inspirationSubtitle}
              >
                <InspirationStep
                  shopId={shopId as string}
                  urls={draft.referenceImageUrls}
                  onUrlsChange={(urls) => set({ referenceImageUrls: urls })}
                  notes={draft.notes ?? ""}
                  onNotesChange={(notes) => set({ notes })}
                />
              </StepBlock>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              variants={tabFade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepBlock
                title="Add details"
                subtitle="All optional — tap what fits, skip the rest."
              >
                {optionsLoading ? (
                  <CustomCakeOptionsSkeleton rows={6} />
                ) : (
                  <div className="space-y-7">
                    {DETAIL_GROUPS.map((group) => {
                      const fields = SELECT_FIELDS.filter((f) => f.group === group.key);
                      const hasPills = fields.some((f) => optionsFor(f.field).length > 0);
                      const isLook = group.key === "look";
                      const hasDecor = isLook && optionsFor("decoration").length > 0;
                      if (!hasPills && !isLook) return null;
                      return (
                        <div key={group.key} className="space-y-4">
                          {(hasPills || hasDecor) && (
                            <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                          )}
                          {fields.map((f) => (
                            <OptionPills
                              key={f.field}
                              label={f.label}
                              options={optionsFor(f.field)}
                              value={draft[f.prop] as string | undefined}
                              onChange={(v) => set({ [f.prop]: v } as Partial<Draft>)}
                            />
                          ))}
                          {isLook && (
                            <>
                              <MultiOptionPills
                                label="Decorations"
                                options={optionsFor("decoration")}
                                values={draft.decorations}
                                onToggle={(label) =>
                                  set({
                                    decorations: draft.decorations.includes(label)
                                      ? draft.decorations.filter((d) => d !== label)
                                      : [...draft.decorations, label],
                                  })
                                }
                              />
                              <Input
                                label="Message on the cake"
                                placeholder="e.g. Happy Birthday Aisha"
                                value={draft.cakeMessage ?? ""}
                                onChange={(e) => set({ cakeMessage: e.target.value })}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </StepBlock>
            </motion.div>
          )}

          {step === "delivery" && (
            <motion.div
              key="delivery"
              variants={tabFade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StepBlock title="When & where" subtitle="And how we reach you with the quote.">
                <SegmentedControl
                  name="cc-delivery"
                  options={[
                    { value: DELIVERY_TYPE.DELIVERY, label: "Delivery" },
                    { value: DELIVERY_TYPE.PICKUP, label: "Pickup" },
                  ]}
                  value={draft.deliveryType}
                  onChange={(v) => set({ deliveryType: v })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date"
                    type="date"
                    value={draft.neededDate ?? ""}
                    onChange={(e) => set({ neededDate: e.target.value })}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={draft.neededTime ?? ""}
                    onChange={(e) => set({ neededTime: e.target.value })}
                  />
                </div>
                {draft.deliveryType === DELIVERY_TYPE.DELIVERY && (
                  <Input
                    label="Delivery address"
                    placeholder="Where should we deliver?"
                    value={draft.deliveryAddress ?? ""}
                    onChange={(e) => set({ deliveryAddress: e.target.value })}
                  />
                )}
                <Input
                  label="Allergy info"
                  placeholder="e.g. nut allergy"
                  value={draft.allergyInfo ?? ""}
                  onChange={(e) => set({ allergyInfo: e.target.value })}
                />
                <Input
                  label="Special instructions"
                  placeholder="Anything else we should know?"
                  value={draft.specialInstructions ?? ""}
                  onChange={(e) => set({ specialInstructions: e.target.value })}
                />

                <div className="border-t pt-4">
                  <p className="mb-3 text-sm font-semibold">Your contact details</p>
                  <div className="space-y-3">
                    <Input
                      label="Name"
                      placeholder="Your name"
                      value={draft.contactName ?? ""}
                      onChange={(e) => set({ contactName: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="Phone number"
                      value={draft.contactPhone ?? ""}
                      onChange={(e) => set({ contactPhone: e.target.value })}
                    />
                    <Input
                      label="Email (optional)"
                      type="email"
                      placeholder="you@example.com"
                      value={draft.contactEmail ?? ""}
                      onChange={(e) => set({ contactEmail: e.target.value })}
                    />
                  </div>
                </div>
              </StepBlock>
            </motion.div>
          )}
        </AnimatePresence>
      </PageSection>

      {/* Sticky footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t bg-background/95 p-4 backdrop-blur md:max-w-2xl md:rounded-t-3xl md:border-x md:px-6">
        {step === "inspiration" ? (
          <div className="flex flex-col gap-2">
            <Button block onClick={() => setStepIdx(1)}>
              {CUSTOM_CAKE_COPY.addDetails}
            </Button>
            <Button variant="outline" block onClick={() => setStepIdx(LAST_STEP)}>
              {CUSTOM_CAKE_COPY.skipToSend}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStepIdx((i) => i - 1)} className="px-4">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {step === "delivery" ? (
              <Button
                block
                disabled={!canSend}
                loading={submit.isPending}
                onClick={() => submit.mutate()}
              >
                Send request
              </Button>
            ) : (
              <Button block onClick={() => setStepIdx(LAST_STEP)}>
                Continue
              </Button>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}

function StepBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
