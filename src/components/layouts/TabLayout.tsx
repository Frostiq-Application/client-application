import { BottomNav } from "@/components/navigation/BottomNav";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { CartBar } from "@/features/cart/components/CartBar";
import { ActiveOrdersBar } from "@/features/orders/components/ActiveOrdersBar";
import { AnimatedOutlet } from "./AnimatedOutlet";
import { tabFade } from "@/animations/variants";

/**
 * Layout for the four primary tabs: content region + bottom tab bar on
 * mobile/tablet, top DesktopNav on lg+ screens. The floating CartBar hovers
 * above the tab bar whenever the cart has items.
 */
export function TabLayout() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <DesktopNav />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <AnimatedOutlet variants={tabFade} />
      </div>
      <ActiveOrdersBar />
      <CartBar />
      <BottomNav />
    </div>
  );
}
