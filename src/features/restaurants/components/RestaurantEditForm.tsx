import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateRestaurantMutation } from "@/features/restaurants/queries";
import { createRestaurantEditSchema, type RestaurantEditFormValues } from "@/features/restaurants/schemas";
import { resolveErrorMessage } from "@/lib/apiError";
import type { ApiError, RestaurantPrivate } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  restaurant: RestaurantPrivate;
}

/**
 * Owner-facing form to edit their restaurant's name, description (EN + EL), address, phone, capacity.
 *
 * Logic:
 * - Pre-fills from the passed `restaurant` (EL falls back to "" when null).
 * - Validates via the localized Zod schema, then submits ALL fields (see spec §0) via the mutation.
 * - Shows a toast on success/failure; the cache invalidation lives in the mutation hook.
 */
export function RestaurantEditForm({ restaurant }: Props) {
  const { t } = useTranslation();
  const updateMutation = useUpdateRestaurantMutation();

  const form = useForm<RestaurantEditFormValues>({
    resolver: zodResolver(createRestaurantEditSchema(t)),
    defaultValues: {
      name: restaurant.name,
      descriptionEn: restaurant.description.en,
      descriptionEl: restaurant.description.el ?? "",
      address: restaurant.address,
      phone: restaurant.phone,
      capacity: restaurant.capacity,
    },
  });

  const onSubmit = async (values: RestaurantEditFormValues) => {
    try {
      const res = await updateMutation.mutateAsync({
        name: values.name,
        description: { en: values.descriptionEn, el: values.descriptionEl },
        address: values.address,
        phone: values.phone,
        capacity: values.capacity,
      });
      if (res.success) {
        toast.success(res.message || t("restaurantEditSuccess"));
        // Re-sync defaults to the saved values so the dirty state resets.
        // TODO: reset from res.data (server's canonical RestaurantPrivate, re-mapped to the flat
        // form shape) instead of local `values` — currently safe only because the client `.trim()`
        // and the backend trim agree, so optimistic local state happens to match the server.
        form.reset(values);
      } else {
        toast.error(res.message || t("restaurantEditError"));
      }
    } catch (err) {
      toast.error(resolveErrorMessage(t, err as ApiError));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("restaurantEditNameLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("restaurantEditDescriptionEnLabel")}</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descriptionEl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("restaurantEditDescriptionElLabel")}</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("restaurantEditAddressLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("restaurantEditPhoneLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("restaurantEditCapacityLabel")}</FormLabel>
              <FormControl>
                {/* number input: RHF stores strings by default — coerce so the Zod number() passes */}
                <Input
                  type="number"
                  min={1}
                  // valueAsNumber yields NaN on an empty field — guard the controlled value
                  // so React never receives NaN (the schema still rejects the empty value on submit)
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("restaurantEditSaveButton")}
        </Button>
      </form>
    </Form>
  );
}
