import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CakeSlice, Check, ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LoadingScreen } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { OptionPills, MultiOptionPills } from "@/features/custom-cake/components/OptionPills";
import { ReferenceUploader } from "@/features/custom-cake/components/ReferenceUploader";
import { CustomCakeOptionsSkeleton } from "@/features/custom-cake/components/CustomCakeOptionsSkeleton";
import { GuidedProgress } from "@/features/custom-cake/components/guided/GuidedProgress";
import { CategoryGridStep } from "@/features/custom-cake/components/guided/CategoryGridStep";
import { ProductGridStep } from "@/features/custom-cake/components/guided/ProductGridStep";
import { ConfigureStep } from "@/features/custom-cake/components/guided/ConfigureStep";
import { ReviewStep } from "@/features/custom-cake/components/guided/ReviewStep";
import type { GuidedDraft } from "@/features/custom-cake/components/guided/types";
import { tabFade } from "@/animations/variants";
import { GUIDED_COPY, GUIDED_STEPS, type GuidedStep } from "@/features/custom-cake/constants";
import { useCustomCakeOptions } from "@/features/custom-cake/hooks";
import { useCatalog, useSelectedBranch, useBrandFeatures } from "@/hooks/useStorefront";
import { customCakeService } from "@/services/api/customCake.service";
import { defaultVariant } from "@/utils/product";
import { QK } from "@/constants/query-keys.constants";
import { DELIVERY_TYPE } from "@/constants/status.constants";
import { ROUTES } from "@/routes/paths";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";
import { useAuthStore } from "@/store/authStore";
import type { CustomCakeRequestInput, Product } from "@/types/domain.types";

const ALL = "all";

const emptyDraft = (name?: string, phone?: string): GuidedDraft => ({
  categoryId: null,
  product: null,
  variantId: null,
  flavour: null,
  cakeMessage: "",
  decorations: [],
  referenceImageUrls: [],
  notes: "",
  deliveryType: DELIVERY_TYPE.DELIVERY,
  contactName: name ?? "",
  contactPhone: phone ?? "",
});

const STEP_KEYS = GUIDED_STEPS.map((s) => s.key);

export function CustomCakeGuidedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branch, isLoading } = useSelectedBranch();
  const { customCake } = useBrandFeatures();
  const profile = useAuthStore((s) => s.customer);
  const shopId = branch?.id ?? null;

  const { data: catalog, isLoading: catalogLoading } = useCatalog(shopId);
  const { data: options, isLoading: optionsLoading } = useCustomCakeOptions(shopId);

  const [stepIdx, setStepIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<GuidedDraft>(() =>
    emptyDraft(profile?.name ?? undefined, profile?.phone ?? undefined),
  );

  const step: GuidedStep = STEP_KEYS[stepIdx] ?? "category";
  const set = (patch: Partial<GuidedDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const goto = (s: GuidedStep) => setStepIdx(STEP_KEYS.indexOf(s));

  const categories = useMemo(() => catalog?.categories ?? [], [catalog]);
  const products = useMemo(() => catalog?.products ?? [], [catalog]);

  // categoryId → first product photo, for the category grid tiles.
  const imageByCategory = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const c of categories) {
      map[c.id] = products.find((p) => p.categoryId === c.id && p.images[0])?.images[0];
    }
    return map;
  }, [categories, products]);

  const categoryProducts = useMemo(() => {
    if (!draft.categoryId || draft.categoryId === ALL) return products;
    return products.filter((p) => p.categoryId === draft.categoryId);
  }, [products, draft.categoryId]);

  const selectedVariant = useMemo(
    () => draft.product?.variants.find((v) => v.id === draft.variantId) ?? null,
    [draft.product, draft.variantId],
  );

  const optionsFor = (field: string) => options?.[field] ?? [];

  const canSend =
    draft.contactName.trim().length >= 2 &&
    draft.contactPhone.replace(/\D/g, "").length >= 7;

  const submit = useMutation({
    mutationFn: () => {
      const product = draft.product as Product;
      const base = `${GUIDED_COPY.basedOn} "${product.name}"${
        selectedVariant ? ` · ${selectedVariant.label}` : ""
      }`;
      const notes = draft.notes.trim() ? `${base}\n${draft.notes.trim()}` : base;
      const refImages = [
        ...(product.images[0] ? [product.images[0]] : []),
        ...draft.referenceImageUrls,
      ];
      const input: CustomCakeRequestInput = {
        contactName: draft.contactName.trim(),
        contactPhone: draft.contactPhone.trim(),
        contactEmail: draft.contactEmail?.trim() || undefined,
        cakeType: product.name,
        weight: selectedVariant?.label,
        flavour: draft.flavour ?? undefined,
        occasion: draft.occasion,
        theme: draft.theme,
        colour: draft.colour,
        topper: draft.topper,
        decorations: draft.decorations,
        cakeMessage: draft.cakeMessage.trim() || undefined,
        referenceImageUrls: refImages,
        deliveryType: draft.deliveryType,
        neededDate: draft.neededDate,
        neededTime: draft.neededTime,
        deliveryAddress:
          draft.deliveryType === DELIVERY_TYPE.DELIVERY ? draft.deliveryAddress : undefined,
        allergyInfo: draft.allergyInfo,
        specialInstructions: draft.specialInstructions,
        notes,
      };
      return customCakeService.submit(shopId as string, input);
    },
    onSuccess: () => {
      if (shopId) {
        void queryClient.invalidateQueries({ queryKey: QK.customCakeRequests(shopId) });
      }
      setSubmitted(true);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  if (isLoading) return <LoadingScreen />;

  if (!customCake) {
    return (
      <Page>
        <TopBar title="Custom Cake" back />
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
        <TopBar title="Custom Cake" />
        <PageSection>
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Request sent!</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              We've received your custom cake request. The bakery will review it and send you a
              quote shortly.
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

  // --- Step gating ---------------------------------------------------------
  const goNext = () => setStepIdx((i) => Math.min(i + 1, STEP_KEYS.length - 1));
  const goBack = () => {
    if (stepIdx === 0) navigate(-1);
    else setStepIdx((i) => i - 1);
  };

  // Category & product steps auto-advance on selection.
  const pickCategory = (categoryId: string) => {
    set({ categoryId });
    goto("product");
  };
  const pickProduct = (product: Product) => {
    const def = defaultVariant(product);
    set({ product, variantId: def?.id ?? null, flavour: null });
    goto("configure");
  };

  const title =
    step === "category"
      ? GUIDED_COPY.categoryTitle
      : step === "product"
        ? GUIDED_COPY.productTitle
        : step === "configure"
          ? GUIDED_COPY.configureTitle
          : step === "personalize"
            ? GUIDED_COPY.personalizeTitle
            : step === "delivery"
              ? GUIDED_COPY.deliveryTitle
              : GUIDED_COPY.reviewTitle;

  const subtitle =
    step === "category"
      ? GUIDED_COPY.categorySubtitle
      : step === "product"
        ? GUIDED_COPY.productSubtitle
        : step === "configure"
          ? GUIDED_COPY.configureSubtitle
          : step === "personalize"
            ? GUIDED_COPY.personalizeSubtitle
            : step === "delivery"
              ? GUIDED_COPY.deliverySubtitle
              : GUIDED_COPY.reviewSubtitle;

  return (
    <Page className="bg-surface-2/30">
      <TopBar title="Custom Cake" back backTo={ROUTES.CUSTOM_CAKE} />
      <GuidedProgress current={step} onJump={goto} />

      <PageSection className="mx-auto w-full max-w-2xl space-y-5 pb-40 pt-1">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={tabFade}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {step === "category" &&
              (catalogLoading ? (
                <GridSkeleton />
              ) : (
                <CategoryGridStep
                  categories={categories}
                  imageByCategory={imageByCategory}
                  value={draft.categoryId}
                  onSelect={pickCategory}
                />
              ))}

            {step === "product" &&
              (catalogLoading ? (
                <GridSkeleton />
              ) : (
                <ProductGridStep
                  products={categoryProducts}
                  value={draft.product?.id ?? null}
                  onSelect={pickProduct}
                />
              ))}

            {step === "configure" && draft.product && (
              <ConfigureStep
                product={draft.product}
                variantId={draft.variantId}
                flavour={draft.flavour}
                onVariant={(id) => set({ variantId: id })}
                onFlavour={(name) => set({ flavour: name })}
              />
            )}

            {step === "personalize" &&
              (optionsLoading ? (
                <CustomCakeOptionsSkeleton rows={5} />
              ) : (
                <div className="space-y-6">
                  <Input
                    label="Message on the cake"
                    placeholder="e.g. Happy Birthday Aisha"
                    value={draft.cakeMessage}
                    onChange={(e) => set({ cakeMessage: e.target.value })}
                  />
                  <OptionPills
                    label="Occasion"
                    options={optionsFor("occasion")}
                    value={draft.occasion}
                    onChange={(v) => set({ occasion: v })}
                  />
                  <OptionPills
                    label="Theme"
                    options={optionsFor("theme")}
                    value={draft.theme}
                    onChange={(v) => set({ theme: v })}
                  />
                  <OptionPills
                    label="Colour"
                    options={optionsFor("colour")}
                    value={draft.colour}
                    onChange={(v) => set({ colour: v })}
                  />
                  <OptionPills
                    label="Topper"
                    options={optionsFor("topper")}
                    value={draft.topper}
                    onChange={(v) => set({ topper: v })}
                  />
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
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Reference photos <span className="text-muted-foreground">(optional)</span>
                    </p>
                    <ReferenceUploader
                      shopId={shopId as string}
                      urls={draft.referenceImageUrls}
                      onChange={(urls) => set({ referenceImageUrls: urls })}
                    />
                  </div>
                </div>
              ))}

            {step === "delivery" && (
              <div className="space-y-4">
                <SegmentedControl
                  name="cc-guided-delivery"
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
                      value={draft.contactName}
                      onChange={(e) => set({ contactName: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="Phone number"
                      value={draft.contactPhone}
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
              </div>
            )}

            {step === "review" && <ReviewStep draft={draft} variant={selectedVariant} />}
          </motion.div>
        </AnimatePresence>
      </PageSection>

      {/* Sticky footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t bg-background/95 p-4 backdrop-blur md:max-w-2xl md:rounded-t-3xl md:border-x md:px-6">
        <div className="flex gap-3">
          <Button variant="ghost" onClick={goBack} className="px-4">
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {step === "category" || step === "product" ? (
            <Button block variant="outline" disabled>
              {step === "category" ? "Pick a category to continue" : "Pick a cake to continue"}
            </Button>
          ) : step === "configure" ? (
            <Button block disabled={!draft.variantId && draft.product?.variants.length !== 0} onClick={goNext}>
              {GUIDED_COPY.next}
            </Button>
          ) : step === "delivery" ? (
            <Button block disabled={!canSend} onClick={goNext}>
              Review request
            </Button>
          ) : step === "review" ? (
            <Button block loading={submit.isPending} disabled={!canSend} onClick={() => submit.mutate()}>
              {GUIDED_COPY.send}
            </Button>
          ) : (
            <Button block onClick={goNext}>
              {GUIDED_COPY.next}
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-surface-2" />
      ))}
    </div>
  );
}
