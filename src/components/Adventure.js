import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { COMBAT_AREAS, CHARACTER_CLASSES } from '../data';
import { combatUtils, equipmentUtils } from '../utils';

export const Adventure = () => {
    const [selectedArea, setSelectedArea] = useState('');
    const [currentMonster, setCurrentMonster] = useState(null);
    const [combatState, setCombatState] = useState('area_selection');
    const [combatLog, setCombatLog] = useState([]);
    const [playerCombatStats, setPlayerCombatStats] = useState(null);
    const [monsterCombatStats, setMonsterCombatStats] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [turn, setTurn] = useState(1);
    const [abilityCooldowns, setAbilityCooldowns] = useState({});
    const [lootGained, setLootGained] = useState([]);
    const [currencyGained, setCurrencyGained] = useState(0);
    const { user, updateUser } = useAuth();

    useEffect(() => {
        if (user?.character && combatState === 'combat') {
            const stats = combatUtils.getCharacterCombatStats(user.character);
            setPlayerCombatStats({
                ...stats,
                currentHealth: user.character.health || stats.maxHealth,
                currentMana: user.character.mana || stats.maxMana,
                name: user.character.name
            });
        }
    }, [combatState, user?.character]);

    const startEncounter = (areaKey) => {
        const regenResult = combatUtils.calculateRegeneration(user.character, user.character.lastRegenTime);
        let characterToUse = regenResult.character;

        if (regenResult.character.health !== user.character.health || regenResult.character.mana !== user.character.mana) {
            updateUser({ character: characterToUse });
        }

        const monster = combatUtils.generateMonster(areaKey, characterToUse.level);
        setCurrentMonster(monster);
        setMonsterCombatStats({
            currentHealth: monster.health,
            maxHealth: monster.health,
            attack: monster.attack,
            defense: monster.defense,
            critChance: monster.critChance,
            critMultiplier: monster.critMultiplier
        });
        setCombatLog([`You encounter a ${monster.displayName}!`]);
        setCombatState('combat');
        setTurn(1);
        setAbilityCooldowns({});
        setLootGained([]);
        setCurrencyGained(0);
    };

    const addToCombatLog = (message) => {
        setCombatLog(prev => [...prev, message]);
    };

    const playerAttack = () => {
        if (isAnimating || !playerCombatStats || !monsterCombatStats) return;

        setIsAnimating(true);

        const isCrit = combatUtils.isCriticalHit(playerCombatStats);
        const damage = combatUtils.calculateDamage(playerCombatStats, monsterCombatStats, isCrit);

        const critText = isCrit ? " (Critical Hit!)" : "";
        addToCombatLog(`You attack for ${damage} damage${critText}`);

        const newMonsterHealth = Math.max(0, monsterCombatStats.currentHealth - damage);
        setMonsterCombatStats(prev => ({ ...prev, currentHealth: newMonsterHealth }));

        if (newMonsterHealth <= 0) {
            addToCombatLog(`${currentMonster.displayName} is defeated!`);
            setTimeout(() => {
                handleVictory();
            }, 1000);
            setIsAnimating(false);
            return;
        }

        setTimeout(() => {
            monsterAttack();
        }, 1000);
    };

    const monsterAttack = () => {
        const isCrit = combatUtils.isCriticalHit(monsterCombatStats);
        const damage = combatUtils.calculateDamage(monsterCombatStats, playerCombatStats, isCrit);

        const critText = isCrit ? " (Critical Hit!)" : "";
        addToCombatLog(`${currentMonster.displayName} attacks for ${damage} damage${critText}`);

        const newPlayerHealth = Math.max(0, playerCombatStats.currentHealth - damage);
        setPlayerCombatStats(prev => ({ ...prev, currentHealth: newPlayerHealth }));

        if (newPlayerHealth <= 0) {
            addToCombatLog("You have been defeated!");
            setTimeout(() => {
                setCombatState('defeat');
            }, 1000);
        } else {
            setTimeout(() => {
                setTurn(prev => prev + 1);
                setIsAnimating(false);
            }, 500);
        }
    };

    // FIXED: Combat XP removal - no XP from combat anymore
    const handleVictory = () => {
        const currency = equipmentUtils.generateCurrency(currentMonster.level, currentMonster.tierData.multiplier);
        const loot = equipmentUtils.generateLoot(
            currentMonster.level,
            currentMonster.tierData.multiplier,
            user.character.luckStat || 0
        );

        // REMOVED: XP gain from combat - only currency and loot now
        addToCombatLog(`You gained ${currency} Ink Drops!`);
        setCurrencyGained(currency);

        const character = { ...user.character };
        character.health = playerCombatStats.currentHealth;
        character.mana = playerCombatStats.currentMana;
        character.inkDrops = (character.inkDrops || 0) + currency;

        if (loot) {
            if (!character.inventory) character.inventory = [];
            character.inventory.push(loot);
            addToCombatLog(`You found: ${loot.name}!`);
            setLootGained([loot]);
        }

        updateUser({ character });
        setCombatState('victory');
    };

    const executeAbility = (ability) => {
        if (isAnimating || !playerCombatStats || !monsterCombatStats) return;

        // Check mana cost
        if (playerCombatStats.currentMana < ability.manaCost) {
            addToCombatLog("Not enough mana!");
            return;
        }

        // Check cooldown
        if (abilityCooldowns[ability.name] && abilityCooldowns[ability.name] > turn) {
            addToCombatLog(`${ability.name} is on cooldown!`);
            return;
        }

        setIsAnimating(true);

        // Deduct mana
        setPlayerCombatStats(prev => ({
            ...prev,
            currentMana: prev.currentMana - ability.manaCost
        }));

        // Set cooldown
        setAbilityCooldowns(prev => ({
            ...prev,
            [ability.name]: turn + ability.cooldown
        }));

        // Apply ability effect
        switch (ability.effect) {
            case 'plot_armor':
                addToCombatLog(`${ability.name}: You gain magical protection!`);
                // Add buff logic here
                break;
            case 'heal':
                const healAmount = Math.floor(playerCombatStats.maxHealth * 0.3);
                setPlayerCombatStats(prev => ({
                    ...prev,
                    currentHealth: Math.min(prev.maxHealth, prev.currentHealth + healAmount)
                }));
                addToCombatLog(`${ability.name}: You heal for ${healAmount} health!`);
                break;
            case 'power_attack':
                const isCrit = combatUtils.isCriticalHit(playerCombatStats);
                const damage = combatUtils.calculateDamage(playerCombatStats, monsterCombatStats, isCrit, 2.0);
                const critText = isCrit ? " (Critical Hit!)" : "";
                addToCombatLog(`${ability.name}: You deal ${damage} damage${critText}!`);

                const newMonsterHealth = Math.max(0, monsterCombatStats.currentHealth - damage);
                setMonsterCombatStats(prev => ({ ...prev, currentHealth: newMonsterHealth }));

                if (newMonsterHealth <= 0) {
                    addToCombatLog(`${currentMonster.displayName} is defeated!`);
                    setTimeout(() => handleVictory(), 1000);
                    setIsAnimating(false);
                    return;
                }
                break;
            case 'mana_restore':
                const manaAmount = 15;
                setPlayerCombatStats(prev => ({
                    ...prev,
                    currentMana: Math.min(prev.maxMana, prev.currentMana + manaAmount)
                }));
                addToCombatLog(`${ability.name}: You restore ${manaAmount} mana!`);
                break;
            // Add more ability effects as needed
        }

        setTimeout(() => {
            monsterAttack();
        }, 1000);
    };

    const fleeCombat = () => {
        if (playerCombatStats.currentMana < 5) {
            addToCombatLog("Not enough mana to flee!");
            return;
        }

        addToCombatLog("You successfully fled from combat!");

        const character = { ...user.character };
        character.health = playerCombatStats.currentHealth;
        character.mana = playerCombatStats.currentMana - 5;
        updateUser({ character });

        setTimeout(() => {
            setCombatState('area_selection');
            setCurrentMonster(null);
            setCombatLog([]);
        }, 1000);
    };

    const returnToAreas = () => {
        if (combatState === 'defeat') {
            const character = { ...user.character };
            character.health = 1;
            character.mana = playerCombatStats.currentMana;
            updateUser({ character });
        }

        setCombatState('area_selection');
        setCurrentMonster(null);
        setCombatLog([]);
    };

    const availableAbilities = user?.character ? combatUtils.getAvailableAbilities(user.character) : [];

    if (combatState === 'area_selection') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4 glow-text">Choose Your Adventure</h2>
                    <p className="text-fantasy-300">Select an area to explore and battle monsters for Ink Drops and equipment!</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(COMBAT_AREAS).map(([key, area]) => {
                        const levelRange = area.levelRange.split('-');
                        const minAreaLevel = parseInt(levelRange[0]);
                        const maxAreaLevel = levelRange[1] === '+' ? 60 : parseInt(levelRange[1]);
                        const playerLevel = user?.character?.level || 1;

                        const isRecommended = playerLevel >= minAreaLevel - 2 && playerLevel <= maxAreaLevel + 2;
                        const isTooHard = playerLevel < minAreaLevel - 5;
                        const isTooEasy = playerLevel > maxAreaLevel + 5;

                        let borderColor = 'border-fantasy-600 hover:border-fantasy-400';
                        let difficulty = 'Moderate';

                        if (isTooHard) {
                            borderColor = 'border-red-600';
                            difficulty = 'Very Hard';
                        } else if (isTooEasy) {
                            borderColor = 'border-green-600';
                            difficulty = 'Easy';
                        } else if (isRecommended) {
                            borderColor = 'border-yellow-500';
                            difficulty = 'Recommended';
                        }

                        return (
                            <div
                                key={key}
                                className={`bg-fantasy-800 p-6 rounded-lg border-2 ${borderColor} transition-colors cursor-pointer`}
                                onClick={() => startEncounter(key)}
                            >
                                <h3 className="text-xl font-bold mb-2">{area.name}</h3>
                                <p className="text-fantasy-300 text-sm mb-3">{area.description}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-fantasy-400 text-sm">Area Levels {area.levelRange}</span>
                                        <span className="text-fantasy-200 text-sm">Your Level: {playerLevel}</span>
                                    </div>
                                    <div className="text-center">
                                        <span className={`text-sm font-medium ${difficulty === 'Very Hard' ? 'text-red-400' :
                                            difficulty === 'Easy' ? 'text-green-400' :
                                                difficulty === 'Recommended' ? 'text-yellow-400' : 'text-orange-400'
                                            }`}>
                                            {difficulty}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {availableAbilities.length > 0 && (
                    <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                        <h3 className="text-xl font-bold mb-4">Your {CHARACTER_CLASSES[user.character.class].name} Abilities</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {availableAbilities.map((ability, index) => (
                                <div key={index} className="bg-fantasy-700 p-4 rounded">
                                    <h4 className="font-bold text-fantasy-200">{ability.name}</h4>
                                    <p className="text-sm text-fantasy-300 mb-2">{ability.description}</p>
                                    <div className="text-xs text-fantasy-400">
                                        Cost: {ability.manaCost === 0 ? 'Free' : `${ability.manaCost} mana`} • Cooldown: {ability.cooldown} turns
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (combatState === 'combat' && currentMonster && playerCombatStats && monsterCombatStats) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold glow-text">Combat - Turn {turn}</h2>
                </div>

                <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600 text-center">
                    <h3 className={`text-xl font-bold mb-2 ${currentMonster.tierData.color}`}>
                        {currentMonster.displayName}
                        {currentMonster.tier !== 'normal' && (
                            <span className="ml-2 text-sm">({currentMonster.tierData.name})</span>
                        )}
                    </h3>
                    <div className="mb-4">
                        <div className="text-sm text-fantasy-300 mb-1">
                            Health: {monsterCombatStats.currentHealth} / {monsterCombatStats.maxHealth}
                        </div>
                        <div className="w-full bg-fantasy-700 rounded-full h-3">
                            <div
                                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(monsterCombatStats.currentHealth / monsterCombatStats.maxHealth) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="text-sm text-fantasy-400">
                        Level {currentMonster.level} • Attack: {currentMonster.attack} • Defense: {currentMonster.defense}
                    </div>
                </div>

                <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                    <h3 className="text-lg font-bold mb-4">{user.character.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-fantasy-300 mb-1">
                                Health: {playerCombatStats.currentHealth} / {playerCombatStats.maxHealth}
                            </div>
                            <div className="w-full bg-fantasy-700 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(playerCombatStats.currentHealth / playerCombatStats.maxHealth) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-fantasy-300 mb-1">
                                Mana: {playerCombatStats.currentMana} / {playerCombatStats.maxMana}
                            </div>
                            <div className="w-full bg-fantasy-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(playerCombatStats.currentMana / playerCombatStats.maxMana) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                    <h4 className="text-lg font-bold mb-4">Actions</h4>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <button
                            onClick={() => playerAttack()}
                            disabled={isAnimating}
                            className="bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-700 text-white font-bold py-3 px-4 rounded transition-colors"
                        >
                            Basic Attack
                        </button>

                        <button
                            onClick={fleeCombat}
                            disabled={isAnimating || playerCombatStats.currentMana < 5}
                            className="bg-red-600 hover:bg-red-500 disabled:bg-fantasy-700 text-white font-bold py-3 px-4 rounded transition-colors"
                        >
                            Flee
                            <div className="text-xs">(5 mana)</div>
                        </button>
                    </div>

                    {/* FIXED: Abilities in combat */}
                    {availableAbilities.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Abilities</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {availableAbilities.map((ability) => {
                                    const onCooldown = abilityCooldowns[ability.name] && abilityCooldowns[ability.name] > turn;
                                    const cannotAfford = playerCombatStats.currentMana < ability.manaCost;

                                    return (
                                        <button
                                            key={ability.name}
                                            onClick={() => executeAbility(ability)}
                                            disabled={isAnimating || onCooldown || cannotAfford}
                                            className="bg-purple-600 hover:bg-purple-500 disabled:bg-fantasy-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
                                        >
                                            {ability.name}
                                            <div className="text-xs">
                                                {ability.manaCost > 0 ? `${ability.manaCost} mana` : 'Free'}
                                                {onCooldown && ` (${abilityCooldowns[ability.name] - turn} turns)`}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                    <h4 className="text-lg font-bold mb-4">Combat Log</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {combatLog.slice(-8).map((message, index) => (
                            <div key={index} className="text-sm text-fantasy-200">
                                {message}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (combatState === 'victory' || combatState === 'defeat') {
        return (
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className={`bg-fantasy-800 p-8 rounded-lg border ${combatState === 'victory' ? 'border-green-500' : 'border-red-500'}`}>
                    <h2 className={`text-3xl font-bold mb-4 ${combatState === 'victory' ? 'text-green-400' : 'text-red-400'}`}>
                        {combatState === 'victory' ? 'Victory!' : 'Defeat!'}
                    </h2>
                    <div className="space-y-2 mb-6">
                        {combatLog.slice(-3).map((message, index) => (
                            <div key={index} className="text-fantasy-200">
                                {message}
                            </div>
                        ))}
                    </div>

                    {combatState === 'victory' && currencyGained > 0 && (
                        <div className="mb-6">
                            <h4 className="font-bold mb-2 text-yellow-400">Rewards</h4>
                            <div className="text-2xl font-bold">{currencyGained} Ink Drops</div>
                            {lootGained.length > 0 && lootGained.map((item, index) => (
                                <div key={index} className="mt-2">
                                    <span className={`font-medium ${equipmentUtils.getRarityColorClass(item.rarity)}`}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={returnToAreas}
                        className="bg-fantasy-600 hover:bg-fantasy-500 text-white font-bold py-3 px-6 rounded"
                    >
                        Return to Areas
                    </button>
                </div>
            </div>
        );
    }
};