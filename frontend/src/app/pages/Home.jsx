import { ArrowRight, Star, Truck, Shield, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { useProducts } from "../context/ProductContext";
import { ProductCard } from "../components/ProductCard";

export function Home() {
  const { products, categories } = useProducts();
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newReleases = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0A192F] text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1761652661873-a08d8cb25b66?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/90 to-transparent" />
        
        <div className="container relative mx-auto px-4 z-10 flex flex-col items-start max-w-4xl">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-[#00C2FF]/10 text-[#00C2FF] font-semibold text-sm mb-6 border border-[#00C2FF]/20 backdrop-blur-sm">
              Novidade: Kits de Robótica Avançada
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Conhecimento em <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2FF] to-cyan-200">
                Inteligência Artificial
              </span>{" "}
              <br />
              para o Futuro
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              Explore nossa curadoria de livros, e-books e kits práticos para dominar as tecnologias que estão moldando o mundo.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-[#00C2FF] text-[#0A192F] font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all shadow-[0_0_20px_rgba(0,194,255,0.4)] flex items-center gap-2 group"
              >
                Explorar Catálogo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-transparent border border-gray-600 text-white font-medium rounded-lg hover:border-[#00C2FF] hover:text-[#00C2FF] transition-all"
              >
                Saiba Mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <div className="bg-[#081426] py-8 border-b border-gray-800">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00C2FF]/10 rounded-full text-[#00C2FF]">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold">Frete Grátis</h3>
              <p className="text-sm text-gray-400">Para compras acima de R$ 200</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00C2FF]/10 rounded-full text-[#00C2FF]">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold">Conteúdo Exclusivo</h3>
              <p className="text-sm text-gray-400">Materiais selecionados por experts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00C2FF]/10 rounded-full text-[#00C2FF]">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold">Compra Segura</h3>
              <p className="text-sm text-gray-400">Proteção total dos seus dados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A192F] mb-4">Categorias em Destaque</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Navegue pelas áreas mais quentes da tecnologia e encontre o material ideal para sua jornada.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-[#00C2FF] flex flex-col items-center justify-center text-center h-48"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#00C2FF] transition-colors">
                  <span className="text-2xl font-bold text-[#00C2FF] group-hover:text-white transition-colors">
                    {cat.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 group-hover:text-[#00C2FF] transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-[#0A192F]">Mais Vendidos</h2>
            <Link to="/shop?sort=best_selling" className="text-[#00C2FF] font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 bg-[#0A192F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00C2FF]/5 transform skew-x-12 translate-x-20" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Fique por dentro das novidades
          </h2>
          <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
            Receba descontos exclusivos, lançamentos de livros e artigos sobre o mundo da tecnologia diretamente no seu e-mail.
          </p>
          
          <form
            className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-0 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              aria-label="E-mail para newsletter"
              className="flex-1 min-w-0 px-5 sm:px-6 py-4 bg-white/5 text-white placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-[#00C2FF] focus:ring-inset transition-all"
            />
            <button
              type="submit"
              className="px-6 sm:px-8 py-4 bg-[#00C2FF] text-[#0A192F] font-bold rounded-none sm:rounded-r-xl hover:bg-[#00C2FF]/90 active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(0,194,255,0.35)] whitespace-nowrap"
            >
              Inscrever-se
            </button>
          </form>
        </div>
      </section>

      {/* New Releases */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-[#0A192F]">Lançamentos</h2>
            <Link to="/shop?sort=newest" className="text-[#00C2FF] font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newReleases.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
