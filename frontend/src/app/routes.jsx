import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderSuccess } from "./pages/OrderSuccess";
import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";
import { Contact } from "./pages/Contact";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Link } from "react-router";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-9xl font-bold text-[#0A192F] opacity-20">404</h1>
      <h2 className="text-3xl font-bold text-[#0A192F] -mt-12 mb-4">Página não encontrada</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Ops! A página que você está procurando parece ter sido movida ou não existe mais.
      </p>
      <Link
        to="/"
        className="px-8 py-3 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all shadow-lg"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-success", Component: OrderSuccess },
      { path: "profile", Component: Profile },
      { path: "admin", Component: Admin },
      { path: "contact", Component: Contact },
      { path: "about", Component: About },
      { path: "login", Component: Login },
      { path: "*", Component: NotFound },
    ],
  },
]);
