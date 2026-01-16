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

export default function SignupRestaurantDetails({
  form,
  unownedRestaurants,
  isLoadingRestaurants,
  restaurantsError,
}) {
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
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Are you a restaurant owner?</FormLabel>
              <FormDescription>
                Check this to claim an existing restaurant.
              </FormDescription>
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
              <FormLabel className={hasNoRestaurants ? "opacity-50" : ""}>Select Restaurant</FormLabel>

              {isLoadingRestaurants ? (
                <div className="p-2 text-sm text-muted-foreground text-center animate-pulse">Loading available restaurants...</div>
              ) : restaurantsError ? (
                <div className="p-2 text-sm text-red-500 text-center">Error loading restaurants. Please try again.</div>
              ) : hasNoRestaurants ? (
                <p className="p-2 mx-2 text-center text-sm italic text-muted-foreground">All restaurants currently have an owner.</p>
              ) : (
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a restaurant to manage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {restaurantsData.map((restaurant) => (
                        <SelectItem
                          key={restaurant.id}
                          value={restaurant.id.toString()}
                        >
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
