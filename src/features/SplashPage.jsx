import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

export default function SplashPage() {
  const { currentUser, isLoadingUser } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    if (currentUser) {
      navigate("/dashboard"); // TODO: add route
    } else {
      navigate("/login", { state: { mode: "signup" } });
    }
  };

  if (isLoadingUser) return null;

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/images/splash-bg.jpg')", // TODO: ADD IMAGE
      }}
    >
      <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Reservation App
        </h1>
        <p className="text-white mb-8">
          Book, manage, and explore your favorite restaurants seamlessly
        </p>

        <button
          onClick={handlePrimaryCTA}
          className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700 transition"
        >
          {currentUser ? "Go to Dashboard" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
