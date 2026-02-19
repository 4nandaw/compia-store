import { Link, useLocation } from "react-router";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: "Início", path: "/" },
    { name: "Catálogo", path: "/shop" },
    { name: "Sobre", path: "/about" },
    { name: "Contato", path: "/contact" },
  ];

  const isLinkActive = (link) => {
    const [linkPath, linkSearch] = link.path.split("?");
    if (location.pathname !== linkPath) return false;
    if (!linkSearch) return true;
    const params = new URLSearchParams(location.search);
    const linkParams = new URLSearchParams(linkSearch);
    for (const [key, value] of linkParams) {
      if (params.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0A192F]/10 bg-white/95 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#0A192F] rounded-lg flex items-center justify-center text-[#00C2FF] font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0A192F]">
            COMPIA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-[#00C2FF] ${
                isLinkActive(link) ? "text-[#00C2FF]" : "text-gray-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-3 pr-10 py-1.5 text-sm rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/50 transition-all w-48 focus:w-64"
            />
            <Search className="absolute right-3 h-4 w-4 text-gray-400" />
          </div>

          <Link to="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative group">
            <User className="h-5 w-5 text-[#0A192F]" />
             <span className="absolute hidden group-hover:block top-full right-0 bg-[#0A192F] text-white text-xs px-2 py-1 rounded shadow-lg mt-1 w-max">
               Minha Conta
             </span>
          </Link>

          <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <ShoppingCart className="h-5 w-5 text-[#0A192F]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#00C2FF] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
          <div
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
               <div className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-3 pr-10 py-2 text-sm rounded-lg bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]/50"
                />
                <Search className="absolute right-3 h-4 w-4 text-gray-400" />
              </div>
              
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 py-2 font-medium transition-colors hover:text-[#00C2FF] ${
                    isLinkActive(link) ? "text-[#00C2FF]" : "text-gray-700"
                  }`}
                >
                    {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
    </header>
  );
}
