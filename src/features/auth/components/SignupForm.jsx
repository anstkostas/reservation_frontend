import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/features/auth/useAuth";
import { useUnownedRestaurantsQuery } from "@/features/restaurants/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const signupSchema = z
  .object({
    firstname: z.string().min(2, { message: "First name must be at least 2 characters" }),
    lastname: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
      "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char"
    ),
    confirmPassword: z.string(),
    isOwner: z.boolean().default(false),
    restaurantId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => {
    if (data.isOwner && !data.restaurantId) {
      return false;
    }
    return true;
  }, {
    message: "Please select a restaurant to manage",
    path: ["restaurantId"],
  });

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
    data: response = {},
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
      // LoginPage (parent) might handle redirect via user state change, 
      // but usually Signup stays or redirects manually. 
      // Existing logic relied on currentUser change in LoginPage.
    } catch (err) {
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
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
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
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOwner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Are you a restaurant owner?
                    </FormLabel>
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
                    <FormLabel>Select Restaurant</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a restaurant to manage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingRestaurants ? (
                            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                          ) : restaurantsError ? (
                            <div className="p-2 text-sm text-red-500">Error loading restaurants</div>
                          ) : (
                            response.data?.map((restaurant) => (
                              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                                {restaurant.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full cursor-pointer" disabled={form.formState.isSubmitting}>
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
