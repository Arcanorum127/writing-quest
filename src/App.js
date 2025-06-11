// src/App.js - REPLACE COMPLETELY
import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

// Import data and utilities
import { CHARACTER_CLASSES, CLASS_ABILITIES, WRITING_SKILLS, EQUIPMENT_DATABASE, STORE_DATABASE, COMBAT_AREAS, MONSTER_TIERS, GOAL_TEMPLATES } from './data';
import { storage, skillUtils, equipmentUtils, storeUtils, streakUtils, combatUtils } from './utils';

// Import all components from single location
import { 
    Navigation, 
    LoginForm, 
    RegisterForm, 
    CharacterCreation, 
    Dashboard, 
    GoalSetting, 
    WritingSession, 
    Adventure, 
    Inventory, 
    Store,
    AchievementPopup,
    useAchievementChecker
} from './components';

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = storage.load('currentUser');
        if (savedUser?.character) {
            const regenResult = combatUtils.calculateRegeneration(savedUser.character, savedUser.character.lastRegenTime);
            if (regenResult.character.health !== savedUser.character.health || regenResult.character.mana !== savedUser.character.mana) {
                const updatedUser = { ...savedUser, character: regenResult.character };
                storage.save('currentUser', updatedUser);
                
                const users = storage.load('users') || [];
                const userIndex = users.findIndex(u => u.id === savedUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = updatedUser;
                    storage.save('users', users);
                }
                setUser(updatedUser);
            } else {
                setUser(savedUser);
            }
        } else {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        const users = storage.load('users') || [];
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            storage.save('currentUser', foundUser);
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const register = (email, password, username) => {
        const users = storage.load('users') || [];
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already exists' };
        }
        const newUser = {
            id: Date.now(),
            email,
            password,
            username,
            createdAt: new Date().toISOString(),
            character: null,
            writingGoals: null,
            writingSessions: [],
            writingSkills: {},
            completedGoals: []
        };
        users.push(newUser);
        storage.save('users', users);

        setUser(newUser);
        storage.save('currentUser', newUser);
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        storage.remove('currentUser');
    };

    const updateUser = (updates) => {
        let characterToUpdate = user.character;
        
        if (updates.character && user.character) {
            const regenResult = combatUtils.calculateRegeneration(user.character, user.character.lastRegenTime);
            characterToUpdate = regenResult.character;
        }
        
        const updatedUser = { 
            ...user, 
            ...updates, 
            character: updates.character ? { ...characterToUpdate, ...updates.character } : characterToUpdate
        };
        
        setUser(updatedUser);
        storage.save('currentUser', updatedUser);
        
        const users = storage.load('users') || [];
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            storage.save('users', users);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}

// Main App Component
const App = () => {
    const [authView, setAuthView] = useState('login');
    const [currentView, setCurrentView] = useState('dashboard');
    const { user, loading } = useAuth();
    const { pendingAchievement, closePendingAchievement } = useAchievementChecker();

    useEffect(() => {
        setCurrentView('dashboard');
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen fantasy-gradient flex items-center justify-center">
                <div className="text-2xl font-bold glow-text">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen fantasy-gradient flex items-center justify-center p-4">
                {authView === 'login' ? (
                    <LoginForm onRegisterClick={() => setAuthView('register')} />
                ) : (
                    <RegisterForm onLoginClick={() => setAuthView('login')} />
                )}
            </div>
        );
    }

    if (!user.character) {
        return (
            <div className="min-h-screen fantasy-gradient p-4">
                <CharacterCreation />
            </div>
        );
    }

    return (
        <div className="min-h-screen fantasy-gradient">
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            <main className="max-w-6xl mx-auto p-6">
                {currentView === 'dashboard' && <Dashboard />}
                {currentView === 'goals' && <GoalSetting />}
                {currentView === 'session' && <WritingSession />}
                {currentView === 'adventure' && <Adventure />}
                {currentView === 'inventory' && <Inventory />}
                {currentView === 'store' && <Store />}
            </main>
            
            {/* Global Achievement Popup */}
            <AchievementPopup 
                achievement={pendingAchievement} 
                onClose={closePendingAchievement} 
            />
        </div>
    );
};

export default function AppWithProvider() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}