import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Mail, Lock } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Mock authentication
        if (email === 'admin@constructflow.com' && password === 'password123') {
            onLoginSuccess();
        } else {
            setError('Email ou senha inválidos.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-bg font-sans">
            <motion.div
                className="w-full max-w-md p-8 space-y-8 bg-neutral-card rounded-xl shadow-2xl"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <div className="text-center">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <HardHat size={40} className="text-secondary" />
                        <h1 className="text-3xl font-bold text-primary">ConstructFlow</h1>
                    </div>
                    <p className="text-neutral-text-secondary">Acesse sua conta para gerenciar suas locações.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-text-secondary" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white text-neutral-text-primary"
                                    placeholder="Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            className="text-center text-sm font-semibold text-accent-danger bg-accent-danger/10 p-3 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;