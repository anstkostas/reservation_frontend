import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ghost, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-muted p-6 rounded-full">
            <Ghost className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          Whoops! It seems you've stumbled upon a page that doesn't exist. It might have been moved or deleted.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button size="lg" onClick={() => navigate("/")}>
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </div>
    </div>
  );
}
