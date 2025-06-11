import React, { useState } from 'react';
import { useAuth } from '../App';
import { equipmentUtils } from '../utils';

export const Inventory = () => {
    const { user, updateUser } = useAuth();
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterRarity, setFilterRarity] = useState('all');
    const [hoveredItem, setHoveredItem] = useState(null);

    const equipItem = (item) => {
        if (!item || !user.character) return;
        
        const character = { ...user.character };
        const currentlyEquipped = character.equipment[item.category];
        
        if (currentlyEquipped) {
            const currentItem = equipmentUtils.getEquipmentById(currentlyEquipped);
            if (currentItem) {
                character.inventory.push({ ...currentItem, instanceId: Date.now() });
            }
        }
        
        character.equipment[item.category] = item.id;
        character.inventory = character.inventory.filter(invItem => invItem.instanceId !== item.instanceId);
        
        updateUser({ character });
        setSelectedItem(null);
    };

    const unequipItem = (category) => {
        if (!user.character) return;
        
        const character = { ...user.character };
        const equippedItemId = character.equipment[category];
        
        if (equippedItemId) {
            const item = equipmentUtils.getEquipmentById(equippedItemId);
            if (item) {
                character.inventory.push({ ...item, instanceId: Date.now() });
            }
            character.equipment[category] = null;
            updateUser({ character });
        }
    };

    const getEquippedItem = (category) => {
        if (!user.character?.equipment?.[category]) return null;
        return equipmentUtils.getEquipmentById(user.character.equipment[category]);
    };

    const equipmentItems = user.character?.inventory?.filter(item => item.category) || [];
    const filteredItems = filterRarity === 'all' ? equipmentItems : equipmentItems.filter(item => item.rarity === filterRarity);

    const ComparisonTooltip = ({ item, position }) => {
        if (!item || !position) return null;
        
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const currentEquipped = getEquippedItem(item.category);
        const comparison = equipmentUtils.compareItems(item, currentEquipped);
        
        return (
            <div 
                className="absolute z-20 bg-fantasy-700 border border-fantasy-500 p-4 rounded max-w-xs"
                style={{ 
                    left: position?.x > windowWidth / 2 ? position.x - 320 : position.x + 20,
                    top: position?.y || 0
                }}
            >
                <h4 className={`font-bold mb-2 ${equipmentUtils.getRarityColorClass(item.rarity)}`}>
                    {item.name}
                </h4>
                <p className="text-xs text-fantasy-400 mb-3">{item.description}</p>
                
                <div className="space-y-1 text-sm">
                    {['attack', 'defense', 'health', 'mana', 'critChance'].map(stat => {
                        const itemValue = item[stat] || 0;
                        const change = comparison[stat];
                        
                        if (itemValue === 0 && change === 0) return null;
                        
                        return (
                            <div key={stat} className="flex justify-between">
                                <span className="capitalize">{stat}:</span>
                                <span className="flex items-center gap-2">
                                    <span>{itemValue}</span>
                                    {change !== 0 && (
                                        <span className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ({change > 0 ? '+' : ''}{change})
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                {!currentEquipped && (
                    <div className="text-xs text-green-400 mt-2">No item equipped in this slot</div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-4 glow-text">Equipment & Inventory</h2>
                <div className="flex justify-center items-center gap-6 text-fantasy-300">
                    <span className="flex items-center gap-2">
                        <span>Ink Drops: <span className="text-fantasy-200 font-bold text-xl">{user.character?.inkDrops || 0}</span></span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span>Items: <span className="text-fantasy-200 font-bold">{equipmentItems.length}</span></span>
                    </span>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                    <h3 className="text-xl font-bold mb-6 text-center">Currently Equipped</h3>
                    <div className="space-y-4">
                        {['weapon', 'armor', 'accessory'].map(category => {
                            const equippedItem = getEquippedItem(category);
                            
                            return (
                                <div key={category} className="bg-fantasy-700 p-4 rounded-lg hover:bg-fantasy-600 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium capitalize flex items-center gap-2">
                                            {category}
                                        </h4>
                                        {equippedItem && (
                                            <button
                                                onClick={() => unequipItem(category)}
                                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                                            >
                                                Unequip
                                            </button>
                                        )}
                                    </div>
                                    
                                    {equippedItem ? (
                                        <div className="bg-fantasy-600 p-3 rounded border-2 border-fantasy-400">
                                            <span className={`font-medium block ${equipmentUtils.getRarityColorClass(equippedItem.rarity)}`}>
                                                {equippedItem.name}
                                            </span>
                                            <div className="text-xs text-fantasy-300 mt-2 grid grid-cols-2 gap-1">
                                                {equippedItem.attack && <div>+{equippedItem.attack} ATK</div>}
                                                {equippedItem.defense && <div>+{equippedItem.defense} DEF</div>}
                                                {equippedItem.health && <div>+{equippedItem.health} HP</div>}
                                                {equippedItem.mana && <div>+{equippedItem.mana} MP</div>}
                                                {equippedItem.critChance && <div>+{equippedItem.critChance}% CRIT</div>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-fantasy-600 p-3 rounded border-2 border-dashed border-fantasy-500 text-center">
                                            <span className="text-fantasy-400">No {category} equipped</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Inventory</h3>
                            <div className="flex gap-4 items-center">
                                <select
                                    value={filterRarity}
                                    onChange={(e) => setFilterRarity(e.target.value)}
                                    className="bg-fantasy-700 border border-fantasy-500 rounded px-3 py-1 text-sm"
                                >
                                    <option value="all">All Rarities</option>
                                    <option value="common">Common</option>
                                    <option value="uncommon">Uncommon</option>
                                    <option value="rare">Rare</option>
                                    <option value="very-rare">Very Rare</option>
                                    <option value="legendary">Legendary</option>
                                </select>
                            </div>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="text-center text-fantasy-400 py-12">
                                <div className="text-6xl mb-4">🎒</div>
                                <p className="text-lg mb-2">
                                    {filterRarity === 'all' ? 'Your inventory is empty' : `No ${filterRarity} items found`}
                                </p>
                                <p className="text-sm">Defeat monsters or visit the store to find equipment!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={item.instanceId || index}
                                        className={`inventory-item bg-fantasy-700 p-3 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-fantasy-400 ${equipmentUtils.getRarityColorClass(item.rarity)}`}
                                        onClick={() => equipItem(item)}
                                        onMouseEnter={(e) => setHoveredItem({ item, position: { x: e.clientX, y: e.clientY } })}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <div className="text-center">
                                            <div className={`font-medium text-sm mb-2 ${equipmentUtils.getRarityColorClass(item.rarity)}`}>
                                                {item.name}
                                            </div>
                                            <div className="text-xs text-fantasy-400 capitalize mb-2">
                                                {item.category}
                                            </div>
                                            <div className="text-xs space-y-1">
                                                {item.attack && <div className="text-green-400 font-bold">+{item.attack} ATK</div>}
                                                {item.defense && <div className="text-blue-400 font-bold">+{item.defense} DEF</div>}
                                                {item.health && <div className="text-red-400 font-bold">+{item.health} HP</div>}
                                                {item.mana && <div className="text-purple-400 font-bold">+{item.mana} MP</div>}
                                                {item.critChance && <div className="text-yellow-400 font-bold">+{item.critChance}%</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {hoveredItem && (
                            <ComparisonTooltip 
                                item={hoveredItem.item} 
                                position={hoveredItem.position}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};