import React, { useState } from 'react';
import { useAuth } from '../App';
import { REBALANCED_CHARACTER_CLASSES } from '../data/rebalanced';
import { rebalancedCombatUtils } from '../data/rebalanced';

export const CharacterCreation = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [characterName, setCharacterName] = useState('');
    const { user, updateUser } = useAuth();

    const handleCreateCharacter = () => {
        if (!selectedClass || !characterName) return;

        const classData = REBALANCED_CHARACTER_CLASSES[selectedClass];
        
        const tempCharacter = {
            class: selectedClass,
            level: 1,
            stats: { ...classData.baseStats },
            version: 'rebalanced' // Mark as using rebalanced system
        };
        
        const combatStats = rebalancedCombatUtils.getCharacterCombatStats(tempCharacter);
        
        const character = {
            name: characterName,
            class: selectedClass,
            level: 1,
            xp: 0,
            xpToNext: 100,
            stats: { ...classData.baseStats },
            availableStatPoints: 0,
            health: combatStats.maxHealth,
            maxHealth: combatStats.maxHealth,
            mana: combatStats.maxMana,
            maxMana: combatStats.maxMana,
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            inventory: [],
            inkDrops: 50,
            luckStat: 0,
            achievementLevel: 0,
            lastRegenTime: Date.now(),
            skillXp: {},
            version: 'rebalanced',
            createdAt: new Date().toISOString(),
            // Achievement tracking
            achievements: [],
            monstersDefeated: 0,
            eliteMonstersDefeated: 0,
            equipmentFound: 0,
            inkDropsSpent: 0,
            goalsCompleted: 0,
            dailyGoalsCompleted: 0,
            sessionsCompleted: 0,
            totalWordsWritten: 0
        };

        updateUser({ character });
    };

    const getAbilityPreview = (classKey) => {
        const abilities = rebalancedCombatUtils.getAvailableAbilities({ class: classKey, level: 10 });
        return abilities.slice(0, 2);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-4xl font-bold text-center mb-8 glow-text">Choose Your Path</h2>
            
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4 mb-8">
                <h3 className="font-bold text-blue-200 mb-2">✨ Rebalanced Character System</h3>
                <p className="text-blue-100 text-sm">
                    Characters now use an improved balanced stat system (8/10/13 distribution) with enhanced combat mechanics for better gameplay experience.
                </p>
            </div>
            
            <div className="mb-8">
                <label className="block text-xl font-medium mb-4">Character Name</label>
                <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full max-w-md p-3 bg-fantasy-700 border border-fantasy-500 rounded focus:border-fantasy-300 focus:outline-none"
                    placeholder="Enter your character's name"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {Object.entries(REBALANCED_CHARACTER_CLASSES).map(([key, classData]) => {
                    const abilities = getAbilityPreview(key);
                    return (
                        <div
                            key={key}
                            onClick={() => setSelectedClass(key)}
                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:transform hover:scale-105 ${
                                selectedClass === key
                                    ? 'border-fantasy-300 bg-fantasy-700 shadow-lg shadow-fantasy-500/20'
                                    : 'border-fantasy-600 bg-fantasy-800 hover:border-fantasy-400'
                            }`}
                        >
                            <h3 className="text-xl font-bold mb-2">{classData.name}</h3>
                            <p className="text-fantasy-200 mb-4">{classData.description}</p>
                            
                            <div className="text-sm mb-4">
                                <p className="font-medium text-fantasy-300 mb-2">Base Stats (Rebalanced):</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {Object.entries(classData.baseStats).map(([stat, value]) => (
                                        <div key={stat} className="flex justify-between">
                                            <span className={`capitalize ${classData.primaryStats.includes(stat.charAt(0).toUpperCase() + stat.slice(1)) ? 'text-fantasy-200 font-medium' : 'text-fantasy-400'}`}>
                                                {stat}:
                                            </span>
                                            <span className={classData.primaryStats.includes(stat.charAt(0).toUpperCase() + stat.slice(1)) ? 'font-bold' : ''}>
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-fantasy-500 mt-2">
                                    Total: {Object.values(classData.baseStats).reduce((a, b) => a + b, 0)} points
                                </div>
                            </div>

                            <div className="text-sm">
                                <p className="font-medium text-fantasy-300 mb-2">Class Abilities:</p>
                                <div className="space-y-1">
                                    {abilities.map((ability, index) => (
                                        <div key={index} className="text-fantasy-400 text-xs">
                                            <span className="text-fantasy-200">Lv{ability.level}:</span> {ability.name}
                                            <div className="text-fantasy-500 ml-2">{ability.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center">
                <button
                    onClick={handleCreateCharacter}
                    disabled={!selectedClass || !characterName}
                    className="bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded text-lg transition-colors"
                >
                    Begin Your Journey
                </button>
            </div>
        </div>
    );
};
