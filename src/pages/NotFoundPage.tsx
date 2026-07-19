import { useNavigate } from "react-router-dom";
import { CakeSlice } from "lucide-react";
import { Page } from "@/components/layouts/Page";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { ERROR_TITLES } from "@/constants/error.constants";
import { ROUTES } from "@/routes/paths";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Page>
      <EmptyState
        icon={<CakeSlice className="h-7 w-7" strokeWidth={1.75} />}
        title={ERROR_TITLES.NOT_FOUND}
        description="This page doesn't exist — but the cakes do."
        action={<Button onClick={() => navigate(ROUTES.HOME)}>Go home</Button>}
      />
    </Page>
  );
}
