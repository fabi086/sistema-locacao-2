import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Mail, Lock, Loader2, Building, User, LayoutDashboard } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
    onLoginSuccess: () => void;
}

// Fallback para gerar UUID válido
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const cleanEmail = email.trim();

        try {
            if (!supabase) throw new Error("Cliente Supabase não configurado.");

            if (password.length < 6) {
                throw new Error("A senha deve ter pelo menos 6 caracteres.");
            }
            
            if (isSignUp) {
                // --- SIGN UP ---
                if (!fullName || !companyName) {
                    throw new Error("Nome completo e nome da empresa são obrigatórios para o cadastro.");
                }

                const { data, error: signUpError } = await supabase.auth.signUp({ email: cleanEmail, password });

                if (signUpError) {
                    if (signUpError.message?.includes("User already registered")) {
                         throw new Error("Este email já está cadastrado. Tente fazer login.");
                    }
                    throw signUpError;
                }
                
                if (data.user) {
                     // Create Tenant and User Profile
                    const newTenantId = generateUUID();
                    // Fix: Generate unique User ID to avoid Primary Key collisions
                    const newUserId = generateUUID(); 
                    
                    const { error: profileError } = await supabase.from('users').insert({
                        id: newUserId,
                        tenant_id: newTenantId,
                        auth_id: data.user.id,
                        name: fullName,
                        email: cleanEmail,
                        role: 'Admin',
                        status: 'Ativo',
                        lastLogin: new Date().toISOString()
                    });

                    if (profileError) {
                        console.error("Erro ao criar perfil do usuário:", profileError);
                        // Optional: don't block flow if profile creation fails, but it's risky.
                    }
                }
                
                // If email confirmation is required, this message will be shown.
                if (data.user && !data.session) {
                    setMessage('Cadastro realizado! Verifique seu email para confirmar a conta e poder fazer login.');
                    setLoading(false);
                    return;
                }
                // If no confirmation needed, log them in directly
                if(data.session) {
                    onLoginSuccess();
                }

            } else {
                // --- SIGN IN ---
                const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

                if (signInError) {
                    console.error("Supabase Sign In Error:", signInError);
                    const msg = signInError.message.toLowerCase();
                    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
                        throw new Error('Email ou senha incorretos. Verifique suas credenciais.');
                    }
                     if (msg.includes('email not confirmed')) {
                        throw new Error('Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada.');
                    }
                    throw signInError;
                }
                onLoginSuccess();
            }

        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || 'Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        localStorage.setItem('obrafacil_demo', 'true');
        onLoginSuccess();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-bg font-sans">
            <motion.div
                className="w-full max-w-md p-8 space-y-8 bg-neutral-card rounded-xl shadow-2xl"
                {...({
                    initial: { opacity: 0, y: -50 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.5, ease: 'easeOut' }
                } as any)}
            >
                <div className="text-center">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <HardHat size={40} className="text-secondary" />
                        <h1 className="text-3xl font-bold text-primary">ObraFácil</h1>
                    </div>
                    <p className="text-neutral-text-secondary">
                        {isSignUp ? 'Crie sua conta e gerencie sua locadora.' : 'Acesse sua conta para gerenciar.'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {isSignUp && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input
                                            type="text"
                                            required={isSignUp}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900"
                                            placeholder="Minha Locadora Ltda"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input
                                            type="text"
                                            required={isSignUp}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900"
                                            placeholder="João Silva"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900"
                                    placeholder="email@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.trim())}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-gray-900"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-center text-sm font-semibold text-accent-danger bg-accent-danger/10 p-3 rounded-lg border border-accent-danger/20">
                            {error}
                        </div>
                    )}
                     {message && (
                        <div className="text-center text-sm font-semibold text-accent-success bg-accent-success/10 p-3 rounded-lg border border-accent-success/20">
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors disabled:opacity-70 shadow-sm items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? "Criar Conta" : "Entrar")}
                        </button>

                         <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm items-center gap-2"
                        >
                           <LayoutDashboard size={18} className="text-secondary" />
                           Acessar Demonstração (Sem Login)
                        </button>
                        
                        <div className="text-center mt-2">
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
                                className="text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                            >
                                {isSignUp ? "Já tem uma conta? Fazer login" : "Não tem uma conta? Cadastre-se"}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;