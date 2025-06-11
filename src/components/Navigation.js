import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';

export const Navigation = ({ currentView, setCurrentView }) => {
    const { user, logout } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState(null);
    
    // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONS OR RETURNS
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setActiveDropdown(null);
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []); // Empty dependency array is fine here
    
    // CONDITIONAL LOGIC COMES AFTER ALL HOOKS
    if (!user) {
        return null; // Early return is OK after hooks
    }
    
    const navItems = [
        { 
            key: 'dashboard', 
            label: 'Dashboard', 
            single: true 
        },
        { 
            key: 'writing', 
            label: 'Writing', 
            items: [
                { key: 'goals', label: 'Set Goals' },
                { key: 'session', label: 'Writing Session' }
            ]
        },
        { 
            key: 'adventure', 
            label: 'Adventure', 
            items: [
                { key: 'adventure', label: 'Combat' },
                { key: 'inventory', label: 'Inventory' },
                { key: 'store', label: 'Store' }
            ]
        }
    ];

    const handleNavClick = (item) => {
        if (item.single) {
            setCurrentView(item.key);
            setActiveDropdown(null);
        } else {
            setActiveDropdown(activeDropdown === item.key ? null : item.key);
        }
    };

    const handleDropdownClick = (viewKey) => {
        setCurrentView(viewKey);
        setActiveDropdown(null);
    };

    return (
        <nav className="bg-fantasy-800 border-b border-fantasy-600 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold glow-text">Writing Quest</h1>
                
                <div className="flex gap-2 relative">
                    {navItems.map(item => (
                        <div key={item.key} className="relative dropdown">
                            <button
                                onClick={() => handleNavClick(item)}
                                className={`px-4 py-2 rounded transition-colors relative ${
                                    (item.single && currentView === item.key) || 
                                    (!item.single && item.items?.some(subItem => subItem.key === currentView))
                                        ? 'bg-fantasy-600 text-white' 
                                        : 'text-fantasy-300 hover:text-white hover:bg-fantasy-700'
                                }`}
                            >
                                {item.label}
                                {!item.single && (
                                    <span className="ml-1 text-xs">▼</span>
                                )}
                            </button>
                            
                            {!item.single && activeDropdown === item.key && (
                                <div className="absolute top-full left-0 mt-1 bg-fantasy-700 border border-fantasy-600 rounded shadow-lg z-50 min-w-[150px]">
                                    {item.items.map(subItem => (
                                        <button
                                            key={subItem.key}
                                            onClick={() => handleDropdownClick(subItem.key)}
                                            className={`block w-full text-left px-4 py-2 hover:bg-fantasy-600 transition-colors ${
                                                currentView === subItem.key ? 'bg-fantasy-600 text-white' : 'text-fantasy-300'
                                            }`}
                                        >
                                            {subItem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-fantasy-300">Welcome, {user?.username}</span>
                    <button
                        onClick={logout}
                        className="text-fantasy-300 hover:text-white"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};