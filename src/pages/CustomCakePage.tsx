import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CakeSlice, Check, ChevronLeft, ScrollText } from "lucide-react";
import { TopBar, TopBarAction } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { OptionPills, MultiOptionPills } from "@/features/custom-cake/components/OptionPills";
import { ReferenceUploader } from "@/features/custom-cake/components/ReferenceUploader";
import {
  CUSTOM_CAKE_COPY,
  CUSTOM_CAKE_STEPS,
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

export function CustomCakePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branch, isLoading } = useSelectedBranch();
  const { customCake } = useBrandFeatures();
  const profile = useAuthStore((s) => s.customer);
  const shopId = branch?.id ?? null;

  const { data: options } = useCustomCakeOptions(shopId);
  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>(() =>
    emptyDraft(profile?.name ?? undefined, profile?.phone ?? undefined),
  );

  const step = CUSTOM_CAKE_STEPS[stepIdx]?.key ?? "cake";
  const isLast = stepIdx === CUSTOM_CAKE_STEPS.length - 1;

  const submit = useMutation({
    mutationFn: () =>
      customCakeService.submit(shopId as string, {
        ...draft,
        contactName: draft.contactName ?? "",
        contactPhone: draft.contactPhone ?? "",
        deliveryType: draft.deliveryType,
      } as CustomCakeRequestInput),
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

  const canContinue = useMemo(() => {
    if (step === "delivery") {
      return (draft.contactName ?? "").trim().length >= 2 &&
        (draft.contactPhone ?? "").replace(/\D/g, "").length >= 7;
    }
    return true;
  }, [step, draft.contactName, draft.contactPhone]);

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
          <TopBarAction
            label="My requests"
            onClick={() => navigate(ROUTES.CUSTOM_CAKE_REQUESTS)}
          >
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
        {step === "cake" && (
          <StepBlock title="About the cake" subtitle="Pick what fits — leave the rest blank.">
            {SELECT_FIELDS.filter((f) => f.step === "cake").map((f) => (
              <OptionPills
                key={f.field}
                label={f.label}
                options={optionsFor(f.field)}
                value={draft[f.prop] as string | undefined}
                onChange={(v) => set({ [f.prop]: v } as Partial<Draft>)}
              />
            ))}
          </StepBlock>
        )}

        {step === "flavour" && (
          <StepBlock title="Flavour" subtitle="How should it taste?">
            {SELECT_FIELDS.filter((f) => f.step === "flavour").map((f) => (
              <OptionPills
                key={f.field}
                label={f.label}
                options={optionsFor(f.field)}
                value={draft[f.prop] as string | undefined}
                onChange={(v) => set({ [f.prop]: v } as Partial<Draft>)}
              />
            ))}
          </StepBlock>
        )}

        {step === "appearance" && (
          <StepBlock title="Design" subtitle="Colours, decorations & a message.">
            {SELECT_FIELDS.filter((f) => f.step === "appearance").map((f) => (
              <OptionPills
                key={f.field}
                label={f.label}
                options={optionsFor(f.field)}
                value={draft[f.prop] as string | undefined}
                onChange={(v) => set({ [f.prop]: v } as Partial<Draft>)}
              />
            ))}
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
            <ReferenceUploader
              shopId={shopId as string}
              urls={draft.referenceImageUrls}
              onChange={(urls) => set({ referenceImageUrls: urls })}
            />
          </StepBlock>
        )}

        {step === "delivery" && (
          <StepBlock title="Delivery" subtitle="When & where do you need it?">
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
        )}

        {step === "review" && <ReviewStep draft={draft} />}
      </PageSection>

      {/* Sticky footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t bg-background/95 p-4 backdrop-blur md:max-w-2xl md:rounded-t-3xl md:border-x md:px-6">
        <div className="flex gap-3">
          {stepIdx > 0 && (
            <Button
              variant="ghost"
              onClick={() => setStepIdx((i) => i - 1)}
              className="px-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {isLast ? (
            <Button
              block
              loading={submit.isPending}
              onClick={() => submit.mutate()}
            >
              Send request
            </Button>
          ) : (
            <Button
              block
              disabled={!canContinue}
              onClick={() => setStepIdx((i) => i + 1)}
            >
              Continue
            </Button>
          )}
        </div>
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

function ReviewStep({ draft }: { draft: Draft }) {
  const rows: [string, string | undefined][] = [
    ["Cake type", draft.cakeType],
    ["Weight", draft.weight],
    ["Shape", draft.shape],
    ["Occasion", draft.occasion],
    ["Theme", draft.theme],
    ["Sponge", draft.sponge],
    ["Cream", draft.cream],
    ["Filling", draft.filling],
    ["Flavour", draft.flavour],
    ["Colour", draft.colour],
    ["Topper", draft.topper],
    ["Decorations", draft.decorations.length ? draft.decorations.join(", ") : undefined],
    ["Message", draft.cakeMessage],
    ["Delivery", draft.deliveryType],
    ["Date", draft.neededDate],
    ["Time", draft.neededTime],
    ["Address", draft.deliveryAddress],
    ["Allergy", draft.allergyInfo],
    ["Instructions", draft.specialInstructions],
  ];
  const filled = rows.filter(([, v]) => v);
  return (
    <StepBlock title="Review" subtitle="Check everything before you send.">
      {draft.referenceImageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {draft.referenceImageUrls.map((u) => (
            <img
              key={u}
              src={u}
              alt="Reference"
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
          ))}
        </div>
      )}
      <div className="rounded-2xl border bg-card p-4">
        <dl className="space-y-2.5">
          {filled.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t pt-2.5 text-sm">
            <dt className="text-muted-foreground">Contact</dt>
            <dd className="text-right font-medium">
              {draft.contactName} · {draft.contactPhone}
            </dd>
          </div>
        </dl>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        We'll review your request and send a quote — no payment now.
      </p>
    </StepBlock>
  );
}
