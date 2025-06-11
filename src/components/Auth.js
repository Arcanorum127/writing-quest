import React, { useState } from 'react';
import { useAuth } from '../App';

export const LoginForm = ({ onRegisterClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(email, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
            <h2 className="text-3xl font-bold text-center mb-6 glow-text">Enter the Realm</h2>
            {error && <div className="bg-red-900/50 border border-red-600 text-red-200 p-3 rounded mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-fantasy-700 border border-fantasy-500 rounded focus:border-fantasy-300 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-fantasy-700 border border-fantasy-500 rounded focus:border-fantasy-300 focus:outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-fantasy-600 hover:bg-fantasy-500 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                    Enter Realm
                </button>
            </form>
            <p className="text-center mt-4 text-fantasy-300">
                New to the realm?{' '}
                <button onClick={onRegisterClick} className="text-fantasy-200 hover:text-white underline">
                    Create Character
                </button>
            </p>
            <div className="mt-4 pt-4 border-t border-fantasy-600 text-center">
                <p className="text-xs text-fantasy-400 mb-2">Quick Test:</p>
                <button
                    onClick={() => {
                        setEmail('test@test.com');
                        setPassword('test');
                    }}
                    className="text-xs bg-fantasy-700 hover:bg-fantasy-600 text-white py-1 px-3 rounded"
                >
                    Use Test Account
                </button>
            </div>
        </div>
    );
};

export const RegisterForm = ({ onLoginClick }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = register(email, password, username);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
            <h2 className="text-3xl font-bold text-center mb-6 glow-text">Create Your Legend</h2>
            {error && <div className="bg-red-900/50 border border-red-600 text-red-200 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 bg-fantasy-700 border border-fantasy-500 rounded focus:border-fantasy-300 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-fantasy-700 border border-fantasy-500 rounded focus:border-fantasy-300 focus:outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-fantasy-700 border border-fantasy-500 rounded focus:border-fantasy-300 focus:outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-fantasy-600 hover:bg-fantasy-500 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                    Begin Quest
                </button>
            </form>
            <p className="text-center mt-4 text-fantasy-300">
                Already have a character?{' '}
                <button onClick={onLoginClick} className="text-fantasy-200 hover:text-white underline">
                    Enter Realm
                </button>
            </p>
            <div className="mt-4 pt-4 border-t border-fantasy-600 text-center">
                <p className="text-xs text-fantasy-400 mb-2">Quick Test:</p>
                <button
                    onClick={() => {
                        setUsername('Test User');
                        setEmail('test@test.com');
                        setPassword('test');
                    }}
                    className="text-xs bg-fantasy-700 hover:bg-fantasy-600 text-white py-1 px-3 rounded"
                >
                    Fill Test Data
                </button>
            </div>
        </div>
    );
};