import { Mail, Phone, MapPin, Send } from "lucide-react";

export function Contact() {
  return (
    <div className="bg-gray-50 min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0A192F] mb-4">Entre em Contato</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tem alguma dúvida sobre nossos livros ou precisa de suporte? Estamos aqui para ajudar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-[#00C2FF] transition-colors group">
              <div className="p-4 bg-blue-50 text-[#00C2FF] rounded-lg group-hover:bg-[#00C2FF] group-hover:text-white transition-colors flex-shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A192F] mb-2">Telefone</h3>
                <p className="text-gray-600 mb-1">Nosso atendimento funciona de seg. a sex. das 9h às 18h.</p>
                <p className="font-bold text-[#00C2FF] text-lg">+55 (11) 99999-9999</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-[#00C2FF] transition-colors group">
              <div className="p-4 bg-blue-50 text-[#00C2FF] rounded-lg group-hover:bg-[#00C2FF] group-hover:text-white transition-colors flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A192F] mb-2">E-mail</h3>
                <p className="text-gray-600 mb-1">Envie sua mensagem e responderemos em até 24h.</p>
                <p className="font-bold text-[#00C2FF] text-lg">contato@compia.com.br</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-[#00C2FF] transition-colors group">
              <div className="p-4 bg-blue-50 text-[#00C2FF] rounded-lg group-hover:bg-[#00C2FF] group-hover:text-white transition-colors flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A192F] mb-2">Escritório</h3>
                <p className="text-gray-600 mb-1">Venha nos visitar (agendamento prévio).</p>
                <p className="font-bold text-[#00C2FF] text-lg">Av. Paulista, 1000 - SP</p>
              </div>
            </div>
          </div>

          <form
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            onSubmit={(e) => e.preventDefault()}
          >
            <h3 className="text-2xl font-bold text-[#0A192F] mb-6">Envie uma mensagem</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sobrenome</label>
                  <input type="text" className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="Sobrenome" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <input type="email" className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none bg-gray-50 focus:bg-white transition-colors" placeholder="seu@email.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assunto</label>
                <select className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none bg-gray-50 focus:bg-white transition-colors">
                  <option>Dúvida sobre produto</option>
                  <option>Problema com pedido</option>
                  <option>Parceria</option>
                  <option>Outros</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mensagem</label>
                <textarea rows={5} className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none bg-gray-50 focus:bg-white transition-colors resize-none" placeholder="Como podemos ajudar?" />
              </div>

              <button type="submit" className="w-full py-4 bg-[#0A192F] text-white font-bold rounded-lg hover:bg-[#0A192F]/90 transition-all flex items-center justify-center gap-2">
                <Send size={20} /> Enviar Mensagem
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
