import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartProvider } from "../../context/CartContext";
import { Toaster } from "sonner";

export function MainLayout() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
        <Header />
        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          richColors
          expand={false}
        />
      </div>
    </CartProvider>
  );
}
