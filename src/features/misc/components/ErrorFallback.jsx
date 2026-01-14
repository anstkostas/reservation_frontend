import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-6 rounded-full">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          We're sorry, but the application encountered an unexpected error.
        </p>
      </div>

      <div className="flex gap-4">
        <Button size="lg" onClick={resetErrorBoundary} className="">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload Application
        </Button>
      </div>
    </div>
  );
}
