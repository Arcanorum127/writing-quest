// src/components/Store.js - REPLACE COMPLETELY
import React, { useState } from 'react';
import { useAuth } from '../App';
import { STORE_DATABASE } from '../data';
import { equipmentUtils } from '../utils';
import { useAchievementChecker } from './Achievements';

export const Store = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('equipment');
    const [purchaseMessage, setPurchaseMessage] = useState('');
    const { checkAndAwardAchievements } = useAchievementChecker();

    const buyItem = (itemId, category) => {
        const item = STORE_DATABASE[category]?.find(i => i.id === itemId);
        if (!item) return;
        
        const inkDrops = user.character?.inkDrops || 0;
        if (inkDrops < item.cost) {
            setPurchaseMessage('Not enough Ink Drops!');
            setTimeout(() => setPurchaseMessage(''), 3000);
            return;
        }
        
        const character = { ...user.character };
        character.inkDrops = inkDrops - item.cost;
        character.inkDropsSpent = (character.inkDropsSpent || 0) + item.cost;
        
        if (category === 'equipment') {
            if (!character.inventory) character.inventory = [];
            character.inventory.push({ ...item, instanceId: Date.now() });
            character.equipmentFound = (character.equipmentFound || 0) + 1;
        }
        
        updateUser({ character });
        checkAndAwardAchievements({ character });
        
        setPurchaseMessage('Purchase successful!');
        setTimeout(() => setPurchaseMessage(''), 3000);
    };

    const renderItems = (items, category) => (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
                <div key={item.id} className="bg-fantasy-700 p-4 rounded-lg border border-fantasy-600 hover:border-fantasy-400 transition-all hover:transform hover:scale-105">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-bold ${item.rarity ? equipmentUtils.getRarityColorClass(item.rarity) : 'text-fantasy-200'}`}>
                            {item.name}
                        </h4>
                        <div className="text-yellow-400 font-bold text-lg">
                            {item.cost}
                        </div>
                    </div>
                    
                    <p className="text-fantasy-300 text-sm mb-4">{item.description}</p>
                    
                    {(item.attack || item.defense || item.health || item.mana || item.critChance) && (
                        <div className="text-xs mb-4 space-y-1 bg-fantasy-600 p-3 rounded">
                            {item.attack && <div className="text-green-400 font-bold">+{item.attack} Attack</div>}
                            {item.defense && <div className="text-blue-400 font-bold">+{item.defense} Defense</div>}
                            {item.health && <div className="text-red-400 font-bold">+{item.health} Health</div>}
                            {item.mana && <div className="text-purple-400 font-bold">+{item.mana} Mana</div>}
                            {item.critChance && <div className="text-yellow-400 font-bold">+{item.critChance}% Crit Chance</div>}
                        </div>
                    )}
                    
                    {item.effect && (
                        <div className="text-xs mb-4 bg-fantasy-600 p-3 rounded">
                            <div className="text-green-400 font-bold">Effect: {item.effect.replace('_', ' ')}</div>
                            {item.value && <div className="text-fantasy-300">Value: {item.value}</div>}
                        </div>
                    )}
                    
                    <button
                        onClick={() => buyItem(item.id, category)}
                        disabled={(user.character?.inkDrops || 0) < item.cost}
                        className="w-full bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-800 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {(user.character?.inkDrops || 0) >= item.cost ? 'Buy' : 'Not Enough Ink'}
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 glow-text">The Inkwell Store</h2>
                <div className="flex justify-center items-center gap-4 text-fantasy-300">
                    <span className="flex items-center gap-2">
                        <span>Your Ink Drops: <span className="text-fantasy-200 font-bold text-2xl">{user.character?.inkDrops || 0}</span></span>
                    </span>
                    <span className="text-fantasy-400">
                        Spent: <span className="text-purple-400 font-bold">{user.character?.inkDropsSpent || 0}</span>
                    </span>
                </div>
                {purchaseMessage && (
                    <div className="mt-4 text-lg font-bold">
                        {purchaseMessage}
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                <div className="bg-fantasy-800 rounded-lg p-1 border border-fantasy-600">
                    {['equipment', 'consumables', 'cosmetics'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-6 rounded-md text-sm font-medium transition-colors capitalize ${
                                activeTab === tab
                                    ? 'bg-fantasy-600 text-white'
                                    : 'text-fantasy-300 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                {activeTab === 'equipment' && (
                    <div>
                        <h3 className="text-xl font-bold mb-6">Equipment</h3>
                        {renderItems(STORE_DATABASE.equipment, 'equipment')}
                    </div>
                )}

                {activeTab === 'consumables' && (
                    <div>
                        <h3 className="text-xl font-bold mb-6">Consumables</h3>
                        {renderItems(STORE_DATABASE.consumables, 'consumables')}
                    </div>
                )}

                {activeTab === 'cosmetics' && (
                    <div>
                        <h3 className="text-xl font-bold mb-6">Cosmetics</h3>
                        {renderItems(STORE_DATABASE.cosmetics, 'cosmetics')}
                    </div>
                )}
            </div>
        </div>
    );
};