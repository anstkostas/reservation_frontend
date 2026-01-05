import { useForm } from "react-hook-form";
import { useAuth } from "@/features/auth/useAuth"
import { useState, useEffect } from "react";
import { useUnownedRestaurantsQuery } from "@/features/restaurants/queries";

export default function SignupForm({ onSwitchToLogin }) {
  const { signup } = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  const {
    register,
    getValues,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  const {
    data: restaurants = [],
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
  } = useUnownedRestaurantsQuery({ enabled: isOwner });

  useEffect(() => {
    if (!isOwner) {
      resetField("restaurantId");
    }
  }, [isOwner, resetField]);

  const onSubmit = async (data) => {
    try {
      await signup({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        restaurantId: isOwner ? data.restaurantId || null : null,
      });
      // ⛔ no redirect here
      // LoginPage will react to currentUser change
    } catch (err) {
      if (err.details?.length) {
        err.details.forEach(({ field, message }) => {
          setError(field, { message });
        });
      } else {
        // Fallback: root-level error
        setError("root", { message: err.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>Create account</h1>
      {errors.root && <div className="text-red-600">{errors.root.message}</div>}

      <div>
        <label>First name</label>
        <input
          aria-invalid={errors.firstname ? "true" : "false"}
          {...register("firstname", {
            required: "First name is required",
          })}
        />
        {errors.firstname && (
          <span className="text-red-600">{errors.firstname.message}</span>
        )}
      </div>

      <div>
        <label>Last name</label>
        <input
          aria-invalid={errors.lastname ? "true" : "false"}
          {...register("lastname", {
            required: "Last name is required",
          })}
        />
        {errors.lastname && (
          <span className="text-red-600">{errors.lastname.message}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email", {
            required: "Email is required",
          })}
        />
        {errors.email && (
          <span className="text-red-600">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          aria-invalid={errors.password ? "true" : "false"}
          {...register("password", {
            required: "Password is required",
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
              message:
                "Password must be at least 8 characters, with uppercase, lowercase, number, and special character",
            },
          })}
        />
        {errors.password && (
          <span className="text-red-600">{errors.password.message}</span>
        )}
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          aria-invalid={errors.confirmPassword ? "true" : "false"}
          {...register("confirmPassword", {
            required: "Confirm your password",
            validate: (value) =>
              value === getValues("password") || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <span className="text-red-600">{errors.confirmPassword.message}</span>
        )}
      </div>

      <label>
        <input
          type="checkbox"
          checked={isOwner}
          onChange={(e) => setIsOwner(e.target.checked)}
        />
        Are you an owner?
      </label>

      {isOwner && (
        <div>
          <label>Restaurant</label>

          {isLoadingRestaurants && <p>Loading restaurants…</p>}
          {restaurantsError && (
            <p className="text-red-600">Failed to load restaurants</p>
          )}

          {!isLoadingRestaurants && !restaurantsError && (
            <select {...register("restaurantId")}>
              <option value="">Select a restaurant…</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Sign up"}
      </button>

      <p>
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </form>
  );
}
