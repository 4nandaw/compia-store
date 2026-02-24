import React, { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister } from "../services/api";
import { toast } from "sonner";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Carregar user do localStorage ao montar
    useEffect(() => {
        try {
            const saved = localStorage.getItem("compia_user");
            if (saved) {
                setUser(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Erro ao carregar usuário:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const userData = await apiLogin(email, password);
            setUser(userData);
            localStorage.setItem("compia_user", JSON.stringify(userData));
            toast.success(`Bem-vindo, ${userData.name}!`);
            return userData;
        } catch (error) {
            toast.error(error.message || "Erro ao fazer login.");
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const userData = await apiRegister(name, email, password);
            setUser(userData);
            localStorage.setItem("compia_user", JSON.stringify(userData));
            toast.success(`Conta criada com sucesso! Bem-vindo, ${userData.name}!`);
            return userData;
        } catch (error) {
            toast.error(error.message || "Erro ao criar conta.");
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("compia_user");
        toast.info("Você saiu da sua conta.");
    };

    const isLoggedIn = !!user;
    const isAdmin = user?.role === "admin";

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn,
                isAdmin,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
