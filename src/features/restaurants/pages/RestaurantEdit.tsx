import { useTranslation } from "react-i18next";
import { useOwnRestaurantQuery } from "@/features/restaurants/queries";
import { RestaurantEditForm } from "@/features/restaurants/components/RestaurantEditForm";
import { resolveErrorMessage } from "@/lib/apiError";
import type { ApiError } from "@/types/api";

/**
 * Owner page to edit their own restaurant.
 *
 * Logic:
 * - Fetches the owner's restaurant (private shape) and gates on loading/error.
 * - Renders RestaurantEditForm only once data is available (form pre-fills from real values).
 * - Route is owner-only (ProtectedRoute role=OWNER), so no extra role check is needed here.
 */
export default function RestaurantEdit() {
  const { t } = useTranslation();
  const { data: restaurant, isLoading, error } = useOwnRestaurantQuery();

  if (isLoading)
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">{t("restaurantEditLoading")}</div>
      </div>
    );

  if (error || !restaurant)
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[50vh]">
        <div className="text-destructive">
          {t("restaurantEditLoadError", {
            message: error ? resolveErrorMessage(t, error as ApiError) : t("genericError"),
          })}
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("restaurantEditTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("restaurantEditSubtitle")}</p>
      </div>
      <RestaurantEditForm restaurant={restaurant} />
    </div>
  );
}
