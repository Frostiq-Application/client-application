import { DesktopNav } from "@/components/navigation/DesktopNav";
import { CartFab } from "@/features/cart/components/CartFab";
import { AnimatedOutlet } from "./AnimatedOutlet";
import { pagePush } from "@/animations/variants";

/**
 * Layout for pushed (detail) screens: full-height, no bottom nav, iOS
 * push/pop slide animation between routes. DesktopNav keeps top navigation
 * available on lg+ screens; CartFab gives a one-tap path to the cart.
 */
export function StackLayout() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <DesktopNav />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatedOutlet variants={pagePush} />
      </div>
      <CartFab />
    </div>
  );
}
