import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { customerService } from "@/services/api/customer.service";
import { QK } from "@/constants/query-keys.constants";
import { VALIDATION, VALIDATION_MESSAGES } from "@/constants/validation.constants";
import { TOAST } from "@/constants/toast.constants";
import { toast } from "@/store/toastStore";
import { normalizeError } from "@/lib/apiError";
import { cn } from "@/lib/cn";
import type { Address } from "@/types/domain.types";
import { ADDRESS_LABELS, CHECKOUT_COPY } from "../constants";

type LabelChoice = (typeof ADDRESS_LABELS)[number];

const addressSchema = z.object({
  label: z.string().max(40).optional(),
  fullAddress: z
    .string()
    .min(VALIDATION.ADDRESS_MIN, VALIDATION_MESSAGES.ADDRESS_TOO_SHORT),
  landmark: z.string().max(80).optional(),
  city: z.string().max(60).optional(),
  pincode: z
    .string()
    .regex(VALIDATION.PINCODE_REGEX, VALIDATION_MESSAGES.PINCODE_INVALID)
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean(),
});

type AddressForm = z.infer<typeof addressSchema>;

export interface AddressSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (address: Address) => void;
}

/** Add-address bottom sheet (react-hook-form + zod). */
export function AddressSheet({ open, onClose, onSaved }: AddressSheetProps) {
  const queryClient = useQueryClient();
  const [labelChoice, setLabelChoice] = useState<LabelChoice>("Home");
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  const mutation = useMutation({
    mutationFn: (form: AddressForm) =>
      customerService.addAddress({
        label: labelChoice === "Other" ? form.label || undefined : labelChoice,
        fullAddress: form.fullAddress,
        landmark: form.landmark || undefined,
        city: form.city || undefined,
        pincode: form.pincode || undefined,
        isDefault: form.isDefault,
      }),
    onSuccess: (address) => {
      void queryClient.invalidateQueries({ queryKey: QK.addresses });
      toast.success(TOAST.ADDRESS_SAVED);
      reset();
      setLabelChoice("Home");
      onClose();
      onSaved?.(address);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <Sheet open={open} onClose={onClose} title={CHECKOUT_COPY.ADDRESS_TITLE}>
      <form
        className="space-y-3.5 pt-1"
        onSubmit={handleSubmit((form) => mutation.mutate(form))}
      >
        <div>
          <p className="pb-2 text-[13px] font-semibold text-muted-foreground">
            {CHECKOUT_COPY.SAVE_AS}
          </p>
          <div className="flex gap-2">
            {ADDRESS_LABELS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={labelChoice === option}
                onClick={() => setLabelChoice(option)}
                className={cn(
                  "flex-1 rounded-full border px-3 py-2 text-[13px] font-bold transition-colors",
                  labelChoice === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-2/50 text-muted-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {labelChoice === "Other" && (
          <Input label={CHECKOUT_COPY.LABEL} {...register("label")} error={errors.label?.message} />
        )}
        <Input
          label={CHECKOUT_COPY.FULL_ADDRESS}
          {...register("fullAddress")}
          error={errors.fullAddress?.message}
        />
        <Input
          label={CHECKOUT_COPY.LANDMARK}
          {...register("landmark")}
          error={errors.landmark?.message}
        />
        <div className="flex gap-3">
          <Input label={CHECKOUT_COPY.CITY} {...register("city")} error={errors.city?.message} />
          <Input
            label={CHECKOUT_COPY.PINCODE}
            inputMode="numeric"
            {...register("pincode")}
            error={errors.pincode?.message}
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-semibold">{CHECKOUT_COPY.MAKE_DEFAULT}</span>
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                label={CHECKOUT_COPY.MAKE_DEFAULT}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <Button type="submit" block size="lg" loading={mutation.isPending}>
          {CHECKOUT_COPY.SAVE_ADDRESS}
        </Button>
      </form>
    </Sheet>
  );
}
