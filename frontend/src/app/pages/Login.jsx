import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus } from "lucide-react";

export function Login() {
    const { login, register, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (isLoggedIn) {
        navigate("/profile");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            navigate("/profile");
        } catch {
            // error toast is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#0A192F]">
                        {isRegister ? "Criar Conta" : "Entrar"}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {isRegister
                            ? "Crie sua conta na COMPIA Store"
                            : "Acesse sua conta na COMPIA Store"}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-4"
                >
                    {isRegister && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nome</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua senha"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#00C2FF] focus:ring-2 focus:ring-[#00C2FF]/20 outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {loading ? (
                            "Processando..."
                        ) : isRegister ? (
                            <>
                                <UserPlus size={20} /> Criar Conta
                            </>
                        ) : (
                            <>
                                <LogIn size={20} /> Entrar
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-sm text-[#00C2FF] hover:underline"
                        >
                            {isRegister
                                ? "Já tem uma conta? Entrar"
                                : "Não tem conta? Criar agora"}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>Contas de teste disponíveis:</p>
                    <p className="mt-1">
                        <strong>Admin:</strong> admin@compia.com / admin123
                    </p>
                    <p>
                        <strong>Usuário:</strong> usuario@compia.com / user123
                    </p>
                </div>
            </div>
        </div>
    );
}
