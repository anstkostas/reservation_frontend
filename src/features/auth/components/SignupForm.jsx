import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/useAuth";
import { useUnownedRestaurantsQuery } from "@/features/restaurants/queries";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailFormField, NameFormField, PasswordFormField, ConfirmPasswordFormField } from "@/components/FormFields";
import SignupRestaurantDetails from "./signup/SignupRestaurantDetails";

/**
 * Complex Form Component for User Registration.
 * 
 * Logic:
 * - Dynamic Role Selection: Toggles between 'customer' and 'owner'.
 * - Conditional Validation: If 'owner' is selected, fetches and displays a list of unowned restaurants.
 * - Restaurant Claiming: Allows new owners to claim a venue during signup.
 * - Integration: Uses `useAuth` for the actual signup mutation and `useUnownedRestaurantsQuery` for the data.
 * 
 * @param {object} props
 * @param {function} props.onSwitchToLogin - Callback to toggle the view to login.
 */
export default function SignupForm({ onSwitchToLogin }) {
  const { signupAsync } = useAuth();

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      isOwner: false,
      restaurantId: "",
    },
  });

  const isOwner = form.watch("isOwner");

  const {
    data: unownedRestaurants = [],
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useUnownedRestaurantsQuery({ enabled: isOwner });

  const onSubmit = async (data) => {
    try {
      await signupAsync({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        role: data.isOwner ? "owner" : "customer",
        restaurantId: data.isOwner ? data.restaurantId : null,
      });
    } catch (err) {
      console.log(err);
      if (err.details?.length) {
        err.details.forEach(({ field, message }) => {
          form.setError(field, { message });
        });
      } else {
        form.setError("root", { message: err.message });
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg animate-in fade-in zoom-in duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md text-center">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <NameFormField control={form.control} name="firstname" />
              <NameFormField control={form.control} name="lastname" />
            </div>
            <EmailFormField control={form.control} />
            <PasswordFormField control={form.control} />
            <ConfirmPasswordFormField control={form.control} />
            <SignupRestaurantDetails
              form={form}
              unownedRestaurants={unownedRestaurants}
              isLoadingRestaurants={isLoadingRestaurants}
              restaurantsError={restaurantsError}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal underline cursor-pointer"
            onClick={onSwitchToLogin}
            disabled={form.formState.isSubmitting}
          >
            Log in
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

