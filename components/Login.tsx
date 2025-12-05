
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Mail, Lock, Loader2, Building, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
    onLoginSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgotPassword';

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
    const [authMode, setAuthMode] = useState<AuthMode>('login');
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

        try {
            if (!supabase) throw new Error("Cliente Supabase não configurado.");

            if (authMode !== 'login' && password.length < 6) {
                throw new Error("A senha deve ter pelo menos 6 caracteres.");
            }

            let authUser = null;

            if (authMode === 'signup') {
                // --- SIGN UP ---
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            company_name: companyName
                        }
                    }
                });

                if (signUpError) {
                    if (signUpError.message?.includes("already registered") || signUpError.status === 400) {
                        throw new Error("Este email já está cadastrado. Por favor, faça login.");
                    } else {
                        throw signUpError;
                    }
                }
                
                authUser = data.user;
                // Se precisar de confirmação de email
                if (authUser && !authUser.email_confirmed_at && !data.session) {
                     setMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
                     setLoading(false);
                     return;
                }
            } else {
                // --- SIGN IN ---
                const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    if (signInError.message === 'Invalid login credentials') throw new Error('Email ou senha incorretos.');
                    if (signInError.message === 'Email not confirmed') throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
                    throw signInError;
                }
                authUser = data.user;
            }

            if (authUser) {
                // --- GARANTIA DE PERFIL (UPSERT) ---
                const { data: existingProfile } = await supabase
                    .from('users')
                    .select('id, tenant_id')
                    .eq('auth_id', authUser.id)
                    .maybeSingle();

                if (!existingProfile) {
                    console.log("Perfil não encontrado no banco. Criando novo perfil (Auto-Healing)...");
                    
                    const newTenantId = generateUUID();
                    const newUserId = 'USR-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    const nameToUse = fullName || authUser.user_metadata?.full_name || email.split('@')[0];

                    const { error: upsertError } = await supabase.from('users').upsert({
                        id: newUserId,
                        tenant_id: newTenantId,
                        auth_id: authUser.id,
                        name: nameToUse,
                        email: email,
                        role: 'Admin',
                        status: 'Ativo',
                        lastLogin: new Date().toISOString()
                    }, { onConflict: 'auth_id' });

                    if (upsertError) {
                        throw new Error(`Erro ao criar perfil: ${upsertError.message}`);
                    }
                } else {
                    await supabase.from('users').update({ lastLogin: new Date().toISOString() }).eq('auth_id', authUser.id);
                }
                
                setTimeout(() => {
                    onLoginSuccess();
                }, 500);
            }

        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || 'Erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (!supabase) throw new Error("Cliente Supabase não configurado.");
            
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });

            if (resetError) throw resetError;

            setMessage("Verifique seu email para as instruções de recuperação de senha.");
            
        } catch (err: any) {
            setError(err.message || 'Erro ao tentar recuperar a senha.');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (mode: AuthMode) => {
        setAuthMode(mode);
        setError('');
        setMessage('');
        setPassword('');
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
                        {authMode === 'signup' && 'Crie sua conta e gerencie sua locadora.'}
                        {authMode === 'login' && 'Acesse sua conta para gerenciar.'}
                        {authMode === 'forgotPassword' && 'Digite seu email para recuperar sua senha.'}
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={authMode === 'forgotPassword' ? handlePasswordReset : handleAuth}>
                    <div className="rounded-md shadow-sm space-y-4">
                         {authMode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                        <input
                                            type="text"
                                            required={authMode === 'signup'}
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
                                            required={authMode === 'signup'}
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
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {authMode !== 'forgotPassword' && (
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
                                </div>
                                {authMode === 'login' && (
                                    <div className="text-right text-sm mt-1">
                                        <button type="button" onClick={() => switchMode('forgotPassword')} className="font-semibold text-primary hover:text-primary-dark hover:underline">
                                            Esqueceu a senha?
                                        </button>
                                    </div>
                                )}
                                {authMode === 'signup' && (
                                     <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                                )}
                            </div>
                        )}
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

                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors disabled:opacity-70 shadow-sm items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 
                                authMode === 'signup' ? 'Criar Conta' :
                                authMode === 'login' ? 'Entrar' : 'Recuperar Senha'
                            }
                        </button>
                        
                        <div className="text-center">
                            {authMode !== 'forgotPassword' && (
                                <button
                                    type="button"
                                    onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')}
                                    className="text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                                >
                                    {authMode === 'signup' ? "Já tem uma conta? Fazer login" : "Não tem uma conta? Cadastre-se"}
                                </button>
                            )}
                             {authMode === 'forgotPassword' && (
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                                >
                                    Voltar para o login
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;