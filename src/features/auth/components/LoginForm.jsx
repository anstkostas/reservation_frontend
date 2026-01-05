import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/features/auth/useAuth"

export default function LoginForm({ onSwitchToSignup }) {
  const { login, isLoggingIn, loginError, currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (loginError?.message) {
      setError("root", { type: "server", message: loginError.message });
    }
  }, [loginError, setError]);

  const onSubmit = (data) => {
    reset({ password: "" }); // clear password after submission for security
    login(data);
  };

  if (currentUser) {
    return <p>Logged in as {currentUser.email}</p>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm mx-auto p-4 border rounded space-y-4"
    >
      {errors.root && <div className="text-red-600">{errors.root.message}</div>}

      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          className="w-full border p-2 rounded"
        />
        {errors.email && (
          <span className="text-red-600 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block mb-1 font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
              message:
                "Password must be at least 8 characters, with uppercase, lowercase, number, and special character",
            },
          })}
          className="w-full border p-2 rounded"
        />
        {errors.password && (
          <span className="text-red-600 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoggingIn}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {isLoggingIn ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm text-center">
        Don’t have an account?{" "}
        <button type="button" onClick={onSwitchToSignup} className="underline">
          Sign up
        </button>
      </p>
    </form>
  );
}
