import type { UseFormReturn } from "react-hook-form";
import type { SignupFormValues } from "@/features/auth/schemas";
import type { Restaurant, ApiError } from "@/types/api";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SignupRestaurantDetailsProps {
  form: UseFormReturn<SignupFormValues>;
  unownedRestaurants: Restaurant[];
  isLoadingRestaurants: boolean;
  restaurantsError: ApiError | null;
}

/**
 * Conditional restaurant-claim section for the owner signup flow.
 *
 * Logic:
 * - Renders an "Are you a restaurant owner?" checkbox.
 * - When checked, reveals a restaurant selector populated with unowned restaurants.
 * - Handles three secondary states: loading, API error, and no available restaurants.
 *
 * @param {UseFormReturn<SignupFormValues>} props.form - React Hook Form instance from the parent `SignupForm`.
 * @param {Restaurant[]} props.unownedRestaurants - List of restaurants without an owner.
 * @param {boolean} props.isLoadingRestaurants - Whether the restaurant list is still loading.
 * @param {ApiError|null} props.restaurantsError - Error from the unowned restaurants query, if any.
 */
export default function SignupRestaurantDetails({
  form,
  unownedRestaurants,
  isLoadingRestaurants,
  restaurantsError,
}: SignupRestaurantDetailsProps) {
  const { t } = useTranslation();
  const isOwner = form.watch("isOwner");
  const restaurantsData = unownedRestaurants || [];
  const hasNoRestaurants = !isLoadingRestaurants && !restaurantsError && restaurantsData.length < 1;

  return (
    <>
      <FormField
        control={form.control}
        name="isOwner"
        render={({ field }) => (
          <FormItem className="p-2 flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t("signupIsOwnerLabel")}</FormLabel>
              <FormDescription>{t("signupIsOwnerDescription")}</FormDescription>
            </div>
          </FormItem>
        )}
      />

      {isOwner && (
        <FormField
          control={form.control}
          name="restaurantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={hasNoRestaurants ? "opacity-50" : ""}>
                {t("signupRestaurantPickerLabel")}
              </FormLabel>

              {isLoadingRestaurants ? (
                <div className="p-2 text-sm text-muted-foreground text-center animate-pulse">
                  {t("signupLoadingRestaurants")}
                </div>
              ) : restaurantsError ? (
                <div className="p-2 text-sm text-red-500 text-center">
                  {t("signupRestaurantsError")}
                </div>
              ) : hasNoRestaurants ? (
                <p className="p-2 mx-2 text-center text-sm italic text-muted-foreground">
                  {t("signupAllRestaurantsClaimed")}
                </p>
              ) : (
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("signupRestaurantSelectPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurantsData.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
