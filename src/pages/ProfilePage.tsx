import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Moon, Info, LogIn, LogOut, Heart } from "lucide-react";
import { TopBar } from "@/components/navigation/TopBar";
import { Page, PageSection } from "@/components/layouts/Page";
import { ListGroup, ListItem } from "@/components/ui/List";
import { Avatar } from "@/components/ui/Avatar";
import { Switch } from "@/components/ui/Switch";
import { AuthSheet } from "@/features/auth/components/AuthSheet";
import { AUTH_COPY } from "@/features/auth/constants";
import { useAuthStore } from "@/store/authStore";
import { useWishlistCount } from "@/store/wishlistStore";
import { useThemeStore } from "@/store/themeStore";
import { THEME_MODES } from "@/constants/theme.constants";
import { APP } from "@/constants/app.constants";
import { TOAST } from "@/constants/toast.constants";
import { ROUTES } from "@/routes/paths";
import { toast } from "@/store/toastStore";

export function ProfilePage() {
  const navigate = useNavigate();
  const customer = useAuthStore((s) => s.customer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const { mode, setMode } = useThemeStore();
  const wishlistCount = useWishlistCount();
  const dark = mode === THEME_MODES.DARK;
  const [authOpen, setAuthOpen] = useState(false);

  const onSignOut = () => {
    signOut();
    toast.show(TOAST.SIGNED_OUT);
  };

  return (
    <>
      <TopBar large title="Profile" />
      <Page>
        <PageSection className="space-y-5 pb-8 pt-1">
          <div className="flex items-center gap-4 px-1">
            <Avatar size="lg" name={customer?.name ?? null} />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold">{customer?.name ?? "Guest"}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {customer?.email ?? "Sign in to sync your orders"}
              </p>
            </div>
          </div>

          <ListGroup header="Account">
            {!isAuthenticated ? (
              <ListItem
                icon={<LogIn className="h-4.5 w-4.5" />}
                title={AUTH_COPY.PROFILE_TITLE}
                subtitle={AUTH_COPY.PROFILE_SUBTITLE}
                onClick={() => setAuthOpen(true)}
              />
            ) : (
              <ListItem
                icon={<MapPin className="h-4.5 w-4.5" />}
                title="Saved addresses"
                onClick={() => navigate(ROUTES.ADDRESSES)}
              />
            )}
          </ListGroup>

          <ListGroup header="Shopping">
            <ListItem
              icon={<Heart className="h-4.5 w-4.5" />}
              title="Wishlist"
              subtitle={
                wishlistCount > 0 ? `${wishlistCount} saved` : "Cakes you've saved for later"
              }
              onClick={() => navigate(ROUTES.WISHLIST)}
            />
          </ListGroup>

          <ListGroup header="Preferences">
            <ListItem
              icon={<Moon className="h-4.5 w-4.5" />}
              title="Dark mode"
              trailing={
                <Switch
                  checked={dark}
                  label="Dark mode"
                  onCheckedChange={(on) => setMode(on ? THEME_MODES.DARK : THEME_MODES.LIGHT)}
                />
              }
            />
            <ListItem
              icon={<Info className="h-4.5 w-4.5" />}
              title={`About ${APP.NAME}`}
              subtitle={APP.TAGLINE}
            />
          </ListGroup>

          {isAuthenticated && (
            <ListGroup>
              <ListItem
                danger
                icon={<LogOut className="h-4.5 w-4.5" />}
                title={AUTH_COPY.SIGN_OUT}
                onClick={onSignOut}
              />
            </ListGroup>
          )}
        </PageSection>
      </Page>

      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title={AUTH_COPY.PROFILE_TITLE}
        subtitle={AUTH_COPY.PROFILE_SUBTITLE}
      />
    </>
  );
}
