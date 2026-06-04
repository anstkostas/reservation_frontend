import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldPath } from "react-hook-form";
import { signupSchema } from "@/features/auth/schemas";
import type { SignupFormValues } from "@/features/auth/schemas";
import { useAuth } from "@/features/auth/useAuth";
import { useTranslation } from "react-i18next";
import type { ApiError } from "@/types/api";
import { resolveErrorMessage, resolveDetailMessage } from "@/lib/apiError";
// Cross-feature import: unowned restaurants are only used in the signup flow, so the query lives in restaurants but is consumed here
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
import {
  EmailFormField,
  NameFormField,
  PasswordFormField,
  ConfirmPasswordFormField,
} from "@/components/FormFields";
import SignupRestaurantDetails from "./signup/SignupRestaurantDetails";
import { Role } from "@/constants";

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

/**
 * Complex Form Component for User Registration.
 *
 * Logic:
 * - Dynamic Role Selection: Toggles between 'customer' and 'owner'.
 * - Conditional Validation: If 'owner' is selected, fetches and displays a list of unowned restaurants.
 * - Restaurant Claiming: Allows new owners to claim a restaurant during signup.
 * - Integration: Uses `useAuth` for the actual signup mutation and `useUnownedRestaurantsQuery` for the data.
 *
 * @param {function} props.onSwitchToLogin - Callback to toggle the view to login.
 */
export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signupAsync } = useAuth();
  const { t } = useTranslation();

  const form = useForm<SignupFormValues>({
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

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signupAsync({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        role: data.isOwner ? Role.OWNER : Role.CUSTOMER,
        restaurantId: data.isOwner ? data.restaurantId : null,
      });
    } catch (err) {
      const error = err as ApiError;
      console.error("[LOG] SignupForm.onSubmit:", error.message);
      if (error.details?.length) {
        error.details.forEach((detail) => {
          form.setError(detail.field as FieldPath<SignupFormValues>, { message: resolveDetailMessage(t, detail) });
        });
      } else {
        form.setError("root", { message: resolveErrorMessage(t, error) });
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg animate-in fade-in zoom-in duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t("signupTitle")}</CardTitle>
        <CardDescription className="text-center">
          {t("signupSubtitle")}
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
              {t("signupSubmitButton")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          {t("signupHaveAccount")}{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal underline cursor-pointer"
            onClick={onSwitchToLogin}
            disabled={form.formState.isSubmitting}
          >
            {t("signupSignInLink")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
