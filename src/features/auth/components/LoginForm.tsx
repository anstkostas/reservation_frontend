import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldPath } from "react-hook-form";
import { useAuth } from "@/features/auth/useAuth";
import { loginSchema } from "@/features/auth/schemas";
import type { LoginFormValues } from "@/features/auth/schemas";
import type { ApiError } from "@/types/api";
import { Button } from "@/components/ui/button";
import { EmailFormField, PasswordFormField } from "@/components/FormFields";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

/**
 * Login Form Component.
 *
 * Logic:
 * - Uses `useAuth` hook to perform the login mutation.
 * - Handles server-side validation errors (e.g., 401 Unauthorized) and maps them to form fields.
 * - Auto-redirects/conditionally renders content if `currentUser` is already present.
 *
 * @param {function} props.onSwitchToSignup - Callback to toggle to the signup view.
 */
export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { loginAsync, isLoggingIn, currentUser } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { setError, reset } = form;

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginAsync(data);
      reset({ password: "" });
    } catch (err) {
      const error = err as ApiError;
      console.error("[LOG] LoginForm.onSubmit:", error.message);
      if (error.details?.length) {
        (error.details as { field: string; message: string }[]).forEach(({ field, message }) => {
          setError(field as FieldPath<LoginFormValues>, { message });
        });
      } else {
        setError("root", { type: "server", message: error.message });
      }
    }
  };

  if (currentUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p>Logged in as {currentUser.email}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-in fade-in zoom-in duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to log in to your account
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

            <EmailFormField control={form.control} />
            <PasswordFormField control={form.control} />

            <Button type="submit" className="w-full cursor-pointer" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal underline cursor-pointer"
            onClick={onSwitchToSignup}
            disabled={isLoggingIn}
          >
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
