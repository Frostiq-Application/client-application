import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TabLayout } from "@/components/layouts/TabLayout";
import { StackLayout } from "@/components/layouts/StackLayout";
import { LoadingScreen } from "@/components/ui/Spinner";
import { ROUTES } from "@/routes/paths";

// Route-based code splitting: each page loads on demand.
const HomePage = lazy(() => import("@/pages/HomePage").then((m) => ({ default: m.HomePage })));
const SearchPage = lazy(() =>
  import("@/pages/SearchPage").then((m) => ({ default: m.SearchPage })),
);
const OrdersPage = lazy(() =>
  import("@/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const CategoryPage = lazy(() =>
  import("@/pages/CategoryPage").then((m) => ({ default: m.CategoryPage })),
);
const ProductDetailPage = lazy(() =>
  import("@/pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })),
);
const CartPage = lazy(() => import("@/pages/CartPage").then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() =>
  import("@/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })),
);
const OrderDetailPage = lazy(() =>
  import("@/pages/OrderDetailPage").then((m) => ({ default: m.OrderDetailPage })),
);
const AddressesPage = lazy(() =>
  import("@/pages/AddressesPage").then((m) => ({ default: m.AddressesPage })),
);
const WishlistPage = lazy(() =>
  import("@/pages/WishlistPage").then((m) => ({ default: m.WishlistPage })),
);
const CustomCakePage = lazy(() =>
  import("@/pages/CustomCakePage").then((m) => ({ default: m.CustomCakePage })),
);
const CustomCakeRequestsPage = lazy(() =>
  import("@/pages/CustomCakeRequestsPage").then((m) => ({
    default: m.CustomCakeRequestsPage,
  })),
);
const CustomCakeRequestDetailPage = lazy(() =>
  import("@/pages/CustomCakeRequestDetailPage").then((m) => ({
    default: m.CustomCakeRequestDetailPage,
  })),
);

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<LoadingScreen />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <TabLayout />,
    children: [
      { path: ROUTES.HOME, element: withSuspense(<HomePage />) },
      { path: ROUTES.SEARCH, element: withSuspense(<SearchPage />) },
      { path: ROUTES.ORDERS, element: withSuspense(<OrdersPage />) },
      { path: ROUTES.PROFILE, element: withSuspense(<ProfilePage />) },
    ],
  },
  {
    // Pushed detail screens (product, cart, checkout…) mount here with the
    // iOS push transition and no bottom tab bar.
    element: <StackLayout />,
    children: [
      { path: ROUTES.CATEGORY, element: withSuspense(<CategoryPage />) },
      { path: ROUTES.PRODUCT, element: withSuspense(<ProductDetailPage />) },
      { path: ROUTES.CART, element: withSuspense(<CartPage />) },
      { path: ROUTES.CHECKOUT, element: withSuspense(<CheckoutPage />) },
      { path: ROUTES.ORDER_DETAIL, element: withSuspense(<OrderDetailPage />) },
      { path: ROUTES.ADDRESSES, element: withSuspense(<AddressesPage />) },
      { path: ROUTES.WISHLIST, element: withSuspense(<WishlistPage />) },
      { path: ROUTES.CUSTOM_CAKE, element: withSuspense(<CustomCakePage />) },
      {
        path: ROUTES.CUSTOM_CAKE_REQUESTS,
        element: withSuspense(<CustomCakeRequestsPage />),
      },
      {
        path: ROUTES.CUSTOM_CAKE_REQUEST_DETAIL,
        element: withSuspense(<CustomCakeRequestDetailPage />),
      },
      { path: ROUTES.NOT_FOUND, element: withSuspense(<NotFoundPage />) },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
