import { BrowserRouter } from "react-router-dom";
import { Providers } from "./app/providers";
import { Router } from "./app/router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <BrowserRouter>
      <Providers>
        <Router />
        <Toaster />
      </Providers>
    </BrowserRouter>
  );
}

export default App;
