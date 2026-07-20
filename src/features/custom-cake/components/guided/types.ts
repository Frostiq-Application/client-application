import type { DeliveryType } from "@/constants/status.constants";
import type { Product } from "@/types/domain.types";

/** Working state for the guided (menu-based) custom cake builder. */
export interface GuidedDraft {
  categoryId: string | null;
  product: Product | null;
  variantId: string | null;
  flavour: string | null;

  // Personalize (all optional)
  cakeMessage: string;
  occasion?: string;
  colour?: string;
  theme?: string;
  topper?: string;
  decorations: string[];
  referenceImageUrls: string[];
  notes: string;

  // Delivery
  deliveryType: DeliveryType;
  neededDate?: string;
  neededTime?: string;
  deliveryAddress?: string;
  allergyInfo?: string;
  specialInstructions?: string;

  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}
