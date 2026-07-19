import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastViewport } from "@/components/common/ToastViewport";
import { AppShell } from "@/components/layouts/AppShell";
import { AuthSessionProvider } from "./providers/AuthSessionProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AppRouter } from "./router";

export function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthSessionProvider>
          <AppShell>
            <ErrorBoundary>
              <AppRouter />
            </ErrorBoundary>
            <ToastViewport />
          </AppShell>
        </AuthSessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
