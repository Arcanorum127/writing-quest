import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { CHARACTER_CLASSES } from '../data';
import { combatUtils, streakUtils } from '../utils';

const StatAllocation = () => {
    const { user, updateUser } = useAuth();
    const [pendingStats, setPendingStats] = useState({ focus: 0, creativity: 0, persistence: 0, technique: 0 });
    
    if (!user?.character || user.character.availableStatPoints === 0) return null;

    const totalPending = Object.values(pendingStats).reduce((sum, val) => sum + val, 0);
    const remainingPoints = user.character.availableStatPoints - totalPending;

    const adjustStat = (stat, change) => {
        const newValue = pendingStats[stat] + change;
        if (newValue >= 0 && (change < 0 || remainingPoints > 0)) {
            setPendingStats(prev => ({ ...prev, [stat]: newValue }));
        }
    };

    const applyStats = () => {
        const character = { ...user.character };
        Object.entries(pendingStats).forEach(([stat, points]) => {
            character.stats[stat] += points;
        });
        character.availableStatPoints -= totalPending;
        
        updateUser({ character });
        setPendingStats({ focus: 0, creativity: 0, persistence: 0, technique: 0 });
    };

    const resetStats = () => {
        setPendingStats({ focus: 0, creativity: 0, persistence: 0, technique: 0 });
    };

    const getStatDescription = (stat) => {
        switch(stat) {
            case 'focus': return 'Increases mana pool and regeneration';
            case 'creativity': return 'Increases critical hit chance and damage';
            case 'persistence': return 'Increases health and defense';
            case 'technique': return 'Increases base attack damage';
            default: return '';
        }
    };

    return (
        <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
            <h3 className="text-xl font-bold mb-4 glow-text">Allocate Stat Points</h3>
            <p className="text-fantasy-300 mb-6">Available Points: <span className="text-fantasy-200 font-bold">{remainingPoints}</span></p>
            
            <div className="space-y-4 mb-6">
                {Object.entries(user.character.stats).map(([stat, currentValue]) => (
                    <div key={stat} className="bg-fantasy-700 p-4 rounded">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <span className="capitalize font-medium text-fantasy-200">{stat}</span>
                                <div className="text-xs text-fantasy-400">{getStatDescription(stat)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => adjustStat(stat, -1)}
                                    disabled={pendingStats[stat] === 0}
                                    className="w-8 h-8 bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-800 disabled:opacity-50 rounded flex items-center justify-center"
                                >
                                    -
                                </button>
                                <div className="text-center min-w-[80px]">
                                    <div className="font-bold">{currentValue} + {pendingStats[stat]}</div>
                                    <div className="text-xs text-fantasy-400">= {currentValue + pendingStats[stat]}</div>
                                </div>
                                <button
                                    onClick={() => adjustStat(stat, 1)}
                                    disabled={remainingPoints === 0}
                                    className="w-8 h-8 bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-800 disabled:opacity-50 rounded flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {totalPending > 0 && (
                <div className="flex gap-4">
                    <button
                        onClick={applyStats}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded"
                    >
                        Apply Changes
                    </button>
                    <button
                        onClick={resetStats}
                        className="px-6 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded"
                    >
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
};

export const Dashboard = () => {
    const { user, updateUser } = useAuth();

    const progressPercentage = user?.writingGoals 
        ? Math.min((user.writingGoals.currentProgress / user.writingGoals.totalWords) * 100, 100)
        : 0;

    const totalWords = user?.writingSessions?.reduce((sum, session) => sum + session.wordCount, 0) || 0;
    const totalSessions = user?.writingSessions?.length || 0;
    const currentStreak = streakUtils.calculateStreak(user?.writingSessions);

    useEffect(() => {
        if (user?.character?.lastRegenTime) {
            const regenResult = combatUtils.calculateRegeneration(user.character, user.character.lastRegenTime);
            if (regenResult.character.health !== user.character.health || regenResult.character.mana !== user.character.mana) {
                updateUser({ character: regenResult.character });
            }
        }
    }, [user?.character?.lastRegenTime, user?.character?.health, user?.character?.mana, updateUser]);
    
    const getCurrentStats = () => {
        if (!user?.character) return null;
        return combatUtils.getCharacterCombatStats(user.character);
    };
    
    const currentStats = getCurrentStats();
    const availableAbilities = user?.character ? combatUtils.getAvailableAbilities(user.character) : [];

    const getRegenTimeToFull = () => {
        if (!user?.character || !currentStats) return null;
        
        const stats = user.character.stats;
        const healthRegenRate = (1 + (stats.persistence * 0.1)) / 100;
        const manaRegenRate = (2 + (stats.focus * 0.2)) / 100;
        
        const healthMissing = currentStats.maxHealth - user.character.health;
        const manaMissing = currentStats.maxMana - user.character.mana;
        
        const healthMinutes = healthMissing > 0 ? Math.ceil(healthMissing / (currentStats.maxHealth * healthRegenRate)) : 0;
        const manaMinutes = manaMissing > 0 ? Math.ceil(manaMissing / (currentStats.maxMana * manaRegenRate)) : 0;
        
        return { health: healthMinutes, mana: manaMinutes };
    };

    const regenTimes = getRegenTimeToFull();

    return (
        <div className="space-y-6">
            <StatAllocation />
            
            <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                <h3 className="text-xl font-bold mb-4 glow-text">Character Status</h3>
                {user?.character && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{user.character.name}</h4>
                                <div className="text-yellow-400 font-bold">{user.character.inkDrops || 0} Ink Drops</div>
                            </div>
                            <p className="text-fantasy-300 mb-4">{CHARACTER_CLASSES[user.character.class].name}</p>
                            <div className="space-y-2">
                                <div><span className="text-fantasy-300">Level:</span> <span className="font-bold">{user.character.level}</span></div>
                                <div><span className="text-fantasy-300">XP:</span> <span>{user.character.xp} / {user.character.xpToNext}</span></div>
                                <div className="w-full bg-fantasy-700 rounded-full h-2">
                                    <div className="bg-fantasy-400 h-2 rounded-full" style={{ width: `${(user.character.xp / user.character.xpToNext) * 100}%` }}></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-fantasy-300">Health:</span> {currentStats ? `${user.character.health}/${currentStats.maxHealth}` : 'Loading...'}
                                        {regenTimes?.health > 0 && (
                                            <div className="text-xs text-fantasy-500">Full in {regenTimes.health}min</div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-fantasy-300">Mana:</span> {currentStats ? `${user.character.mana}/${currentStats.maxMana}` : 'Loading...'}
                                        {regenTimes?.mana > 0 && (
                                            <div className="text-xs text-fantasy-500">Full in {regenTimes.mana}min</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h5 className="font-medium mb-2">Combat Stats</h5>
                            {currentStats && (
                                <div className="grid grid-cols-2 gap-2 text-sm bg-fantasy-700 p-3 rounded">
                                    <div>Attack: {currentStats.attack}</div>
                                    <div>Defense: {currentStats.defense}</div>
                                    <div>Crit: {currentStats.critChance.toFixed(1)}%</div>
                                    <div>Crit Dmg: {Math.round(currentStats.critMultiplier * 100)}%</div>
                                </div>
                            )}
                            
                            {availableAbilities.length > 0 && (
                                <div className="mt-4">
                                    <h6 className="text-sm font-medium text-fantasy-300 mb-1">
                                        Abilities: {availableAbilities.length}
                                    </h6>
                                    <div className="text-xs text-fantasy-400">
                                        {availableAbilities.slice(0, 2).map(a => a.name).join(', ')}
                                        {availableAbilities.length > 2 && ` +${availableAbilities.length - 2} more`}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {user?.writingGoals && (
                <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                    <h3 className="text-xl font-bold mb-4 glow-text">Quest Progress</h3>
                    <div className="w-full bg-fantasy-700 rounded-full h-4">
                        <div className="bg-gradient-to-r from-fantasy-500 to-fantasy-300 h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="text-center mt-2">{progressPercentage.toFixed(1)}% Complete</div>
                </div>
            )}
            
            <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                <h3 className="text-xl font-bold mb-4 glow-text">Writing Statistics</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-fantasy-300">{totalWords.toLocaleString()}</div>
                        <div className="text-sm text-fantasy-400">Total Words</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-fantasy-300">{totalSessions}</div>
                        <div className="text-sm text-fantasy-400">Sessions</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-fantasy-300">{totalSessions > 0 ? Math.round(totalWords / totalSessions) : 0}</div>
                        <div className="text-sm text-fantasy-400">Avg Words/Session</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${currentStreak >= 3 ? 'streak-fire' : 'text-fantasy-300'}`}>
                            {currentStreak}
                        </div>
                        <div className="text-sm text-fantasy-400">Day Streak</div>
                    </div>
                </div>
            </div>
        </div>
    );
};