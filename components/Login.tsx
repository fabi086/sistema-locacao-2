
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Mail, Lock, Loader2, Building, User } from 'lucide-react';
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

        try {
            if (!supabase) throw new Error("Cliente Supabase não configurado.");

            if (password.length < 6) {
                throw new Error("A senha deve ter pelo menos 6 caracteres.");
            }

            let authUser = null;

            if (isSignUp) {
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
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                        if (signInError) throw new Error("Este email já está cadastrado. Por favor, faça login.");
                        authUser = signInData.user;
                        setMessage("Usuário já existia. Entrando...");
                    } else {
                        throw signUpError;
                    }
                } else {
                    authUser = data.user;
                    // Se precisar de confirmação de email
                    if (authUser && !authUser.email_confirmed_at && !data.session) {
                         setMessage('Cadastro realizado! Verifique seu email para confirmar a conta.');
                         setLoading(false);
                         return;
                    }
                }
            } else {
                // --- SIGN IN ---
                const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    if (signInError.message === 'Invalid login credentials') throw new Error('Email ou senha incorretos.');
                    throw signInError;
                }
                authUser = data.user;
            }

            if (authUser) {
                // --- GARANTIA DE PERFIL (UPSERT) ---
                // Verifica se o perfil existe
                const { data: existingProfile, error: fetchError } = await supabase
                    .from('users')
                    .select('id, tenant_id')
                    .eq('auth_id', authUser.id)
                    .maybeSingle();

                if (!existingProfile) {
                    console.log("Perfil não encontrado no banco. Criando novo perfil (Auto-Healing)...");
                    
                    const newTenantId = generateUUID();
                    const newUserId = 'USR-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    const nameToUse = fullName || authUser.user_metadata?.full_name || email.split('@')[0];

                    // Tenta criar o perfil. Se auth_id já existir (race condition), o SQL unique index vai impedir duplicidade
                    // O 'upsert' deve funcionar se configuramos o índice único no SQL
                    const { error: upsertError } = await supabase.from('users').upsert({
                        id: newUserId, // Nota: Se houver conflito no auth_id, este ID será ignorado em favor do existente no DB se usarmos ignoreDuplicates, mas aqui queremos forçar a criação se não existir
                        tenant_id: newTenantId,
                        auth_id: authUser.id,
                        name: nameToUse,
                        email: email,
                        role: 'Admin',
                        status: 'Ativo',
                        lastLogin: new Date().toISOString()
                    }, { onConflict: 'auth_id' });

                    if (upsertError) {
                        console.error("Erro detalhado ao criar perfil:", JSON.stringify(upsertError, null, 2));
                        // Se o erro for RLS, não há muito o que fazer além de checar o SQL
                        if (upsertError.code === '42501') {
                            throw new Error("Erro de permissão no banco de dados. Execute o script SQL de correção.");
                        }
                        throw new Error(`Erro ao criar perfil: ${upsertError.message}`);
                    }
                } else {
                    // Atualiza apenas o último login
                    await supabase.from('users').update({ lastLogin: new Date().toISOString() }).eq('auth_id', authUser.id);
                }
                
                // Aguarda um momento para propagação e chama o sucesso
                setTimeout(() => {
                    onLoginSuccess();
                }, 500);
            }

        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message || 'Erro inesperado.');
            // Opcional: Deslogar se falhar para não deixar estado inconsistente
            // await supabase.auth.signOut(); 
        } finally {
            setLoading(false);
        }
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
                                    onChange={(e) => setEmail(e.target.value)}
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

                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors disabled:opacity-70 shadow-sm items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? "Criar Conta" : "Entrar")}
                        </button>
                        
                        <div className="text-center">
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
