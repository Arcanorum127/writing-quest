import { EQUIPMENT_DATABASE, STORE_DATABASE, CHARACTER_CLASSES, CLASS_ABILITIES, COMBAT_AREAS, MONSTER_TIERS } from '../data';

// Utility functions for local storage
export const storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('localStorage not available, using memory storage');
        }
    },
    load: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('localStorage not available');
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('localStorage not available');
        }
    }
};

// Skill utility functions
export const skillUtils = {
    getXpToNextLevel: (currentLevel) => {
        return currentLevel; // Simple linear progression
    },

    getSkillLevel: (totalXp) => {
        if (!totalXp || totalXp <= 0) {
            return { level: 1, currentXp: 0, xpToNext: 1 };
        }
        
        let level = 1;
        let xpUsed = 0;
        
        while (true) {
            const xpForNextLevel = skillUtils.getXpToNextLevel(level);
            if (xpUsed + xpForNextLevel > totalXp) {
                break;
            }
            xpUsed += xpForNextLevel;
            level++;
        }
        
        return { level, currentXp: totalXp - xpUsed, xpToNext: skillUtils.getXpToNextLevel(level) };
    }
};

// Equipment utility functions
export const equipmentUtils = {
    getEquipmentById: (id) => {
        for (const category of Object.values(EQUIPMENT_DATABASE)) {
            const item = category.find(item => item.id === id);
            if (item) return item;
        }
        return null;
    },

    generateRandomEquipment: (level, tierMultiplier = 1.0) => {
        const categories = Object.keys(EQUIPMENT_DATABASE);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const items = EQUIPMENT_DATABASE[category];
        
        const appropriateItems = items.filter(item => {
            const rarityLevelReq = { common: 1, uncommon: 5, rare: 15, 'very-rare': 25, legendary: 40 };
            return level >= (rarityLevelReq[item.rarity] || 1);
        });
        
        if (appropriateItems.length === 0) return null;
        
        const baseItem = appropriateItems[Math.floor(Math.random() * appropriateItems.length)];
        const item = {
            ...baseItem,
            instanceId: Date.now() + Math.random(),
            category: category.slice(0, -1)
        };
        
        return item;
    },

    calculateEquipmentBonuses: (equipment) => {
        const bonuses = { attack: 0, defense: 0, health: 0, mana: 0, critChance: 0 };
        
        if (!equipment) return bonuses;
        
        Object.values(equipment).forEach(itemId => {
            if (itemId) {
                const item = equipmentUtils.getEquipmentById(itemId);
                if (item) {
                    ['attack', 'defense', 'health', 'mana', 'critChance'].forEach(stat => {
                        if (item[stat]) bonuses[stat] += item[stat];
                    });
                }
            }
        });
        
        return bonuses;
    },

    getRarityColorClass: (rarity) => {
        return `rarity-${rarity}`;
    },

    generateLoot: (monsterLevel, tierMultiplier, luckStat = 0) => {
        const baseDropChances = {
            common: 0.075,
            uncommon: 0.025,
            rare: 0.01,
            'very-rare': 0.0025,
            legendary: 0.00001
        };
        
        const finalDropChances = {};
        Object.entries(baseDropChances).forEach(([rarity, chance]) => {
            finalDropChances[rarity] = chance * (1 + luckStat * 0.05) * tierMultiplier;
        });
        
        const rarities = ['legendary', 'very-rare', 'rare', 'uncommon', 'common'];
        for (const rarity of rarities) {
            if (Math.random() < finalDropChances[rarity]) {
                return equipmentUtils.generateRandomEquipment(monsterLevel);
            }
        }
        
        return null;
    },

    generateCurrency: (monsterLevel, tierMultiplier) => {
        const baseCurrency = Math.floor(monsterLevel * 3) + Math.floor(Math.random() * 10);
        return Math.floor(baseCurrency * tierMultiplier);
    },

    compareItems: (newItem, currentItem) => {
        if (!currentItem) return { attack: newItem.attack || 0, defense: newItem.defense || 0, health: newItem.health || 0, mana: newItem.mana || 0, critChance: newItem.critChance || 0 };
        
        return {
            attack: (newItem.attack || 0) - (currentItem.attack || 0),
            defense: (newItem.defense || 0) - (currentItem.defense || 0),
            health: (newItem.health || 0) - (currentItem.health || 0),
            mana: (newItem.mana || 0) - (currentItem.mana || 0),
            critChance: (newItem.critChance || 0) - (currentItem.critChance || 0)
        };
    }
};

// Store utility functions
export const storeUtils = {
    buyItem: (userId, itemId, category) => {
        const users = storage.load('users') || [];
        const user = users.find(u => u.id === userId);
        
        if (!user || !user.character) return false;
        
        const item = STORE_DATABASE[category]?.find(i => i.id === itemId);
        if (!item) return false;
        
        const inkDrops = user.character.inkDrops || 0;
        if (inkDrops < item.cost) return false;
        
        user.character.inkDrops = inkDrops - item.cost;
        
        if (category === 'equipment') {
            if (!user.character.inventory) user.character.inventory = [];
            user.character.inventory.push({ ...item, instanceId: Date.now() });
        }
        
        storage.save('users', users);
        return true;
    }
};

// Writing streak utility functions
export const streakUtils = {
    calculateStreak: (writingSessions) => {
        if (!writingSessions || writingSessions.length === 0) return 0;
        
        const sessions = writingSessions
            .filter(s => s.wordCount > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sessions.length === 0) return 0;
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sessions.length; i++) {
            const sessionDate = new Date(sessions[i].date);
            sessionDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
                if (daysDiff === streak) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else if (streak === 0 && daysDiff === 0) {
                    streak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                } else if (streak === 0 && daysDiff === 1) {
                    streak++;
                    currentDate = new Date(sessionDate);
                    currentDate.setDate(currentDate.getDate() - 1);
                }
            } else {
                break;
            }
        }
        
        return streak;
    }
};

// Combat utility functions
export const combatUtils = {
    getCharacterCombatStats: (character) => {
        if (!character || !character.stats) {
            return {
                health: 40,
                maxHealth: 40,
                mana: 40,
                maxMana: 40,
                attack: 8,
                defense: 3,
                critChance: 3, // BALANCED: Middle ground
                critMultiplier: 1.3, // BALANCED: Middle ground
                manaRegen: 1
            };
        }
        
        const stats = character.stats;
        const level = character.level || 1;
        const characterClass = character.class;
        
        // REMOVED STAT LIMITS: No caps on stat growth
        let baseHealth = 40 + (stats.persistence * 8) + (level * 5);
        let baseMana = 40 + (stats.focus * 8) + (level * 3);
        let baseAttack = 8 + (stats.technique * 2) + (level * 1);
        let baseDefense = 3 + (stats.persistence * 1) + Math.floor(level * 0.5);
        
        // FIXED: Reduced class modifiers
        switch (characterClass) {
            case 'chronicler':
                baseHealth *= 1.15;
                baseDefense *= 1.2;
                baseAttack *= 0.9;
                break;
            case 'wordsmith':
                baseAttack *= 1.2;
                baseHealth *= 0.95;
                baseDefense *= 0.95;
                break;
            case 'plotweaver':
                baseAttack *= 1.1;
                baseMana *= 1.15;
                baseHealth *= 0.9;
                baseDefense *= 0.9;
                break;
            case 'dialogist':
                baseHealth *= 1.05;
                baseMana *= 1.1;
                baseAttack *= 0.97;
                baseDefense *= 1.05;
                break;
        }

        const equipmentBonuses = equipmentUtils.calculateEquipmentBonuses(character.equipment);
        
        return {
            health: character.health || Math.floor(baseHealth + equipmentBonuses.health),
            maxHealth: Math.floor(baseHealth + equipmentBonuses.health),
            mana: character.mana || Math.floor(baseMana + equipmentBonuses.mana),
            maxMana: Math.floor(baseMana + equipmentBonuses.mana),
            attack: Math.floor(baseAttack + equipmentBonuses.attack),
            defense: Math.floor(baseDefense + equipmentBonuses.defense),
            critChance: 3 + (stats.creativity * 0.3) + equipmentBonuses.critChance, // BALANCED: Middle ground between original and reduced
            critMultiplier: 1.3 + (stats.creativity * 0.03), // BALANCED: Middle ground between original and reduced
            manaRegen: Math.max(1, Math.floor(stats.focus / 3))
        };
    },

    calculateRegeneration: (character, lastRegenTime) => {
        if (!character || !character.stats) {
            return { character: { ...character, lastRegenTime: Date.now() }, lastRegenTime: Date.now() };
        }
        
        const now = Date.now();
        const lastRegen = lastRegenTime || character.lastRegenTime || now;
        const timePassed = now - lastRegen;
        
        if (timePassed < 30000 || timePassed < 0) {
            return { character, lastRegenTime: lastRegen };
        }
        
        const cappedTime = Math.min(timePassed, 24 * 60 * 60 * 1000);
        const minutesPassed = cappedTime / (1000 * 60);
        
        const stats = character.stats;
        const combatStats = combatUtils.getCharacterCombatStats(character);
        
        const healthRegenRate = (1 + (stats.persistence * 0.1)) / 100;
        const manaRegenRate = (2 + (stats.focus * 0.2)) / 100;
        
        const healthToRegen = Math.floor(combatStats.maxHealth * healthRegenRate * minutesPassed);
        const manaToRegen = Math.floor(combatStats.maxMana * manaRegenRate * minutesPassed);
        
        const currentHealth = Math.max(1, character.health || combatStats.maxHealth);
        const currentMana = character.mana || combatStats.maxMana;
        
        const updatedCharacter = {
            ...character,
            health: Math.min(combatStats.maxHealth, currentHealth + healthToRegen),
            mana: Math.min(combatStats.maxMana, currentMana + manaToRegen),
            lastRegenTime: now
        };
        
        return { character: updatedCharacter, lastRegenTime: now };
    },

    generateMonster: (areaKey, playerLevel = 1) => {
        const area = COMBAT_AREAS[areaKey];
        if (!area) return null;
        
        const levelRange = area.levelRange.split('-');
        const minAreaLevel = parseInt(levelRange[0]);
        const maxAreaLevel = levelRange[1] === '+' ? Math.max(60, playerLevel + 10) : parseInt(levelRange[1]); // REMOVED LEVEL LIMITS
        
        const targetLevel = Math.floor(Math.random() * (maxAreaLevel - minAreaLevel + 1)) + minAreaLevel;
        
        const baseMonster = area.monsters[Math.floor(Math.random() * area.monsters.length)];
        
        const levelDifference = targetLevel - baseMonster.level;
        const scaledMonster = {
            ...baseMonster,
            level: targetLevel,
            health: Math.max(20, baseMonster.health + (levelDifference * 12)),
            attack: Math.max(8, baseMonster.attack + (levelDifference * 3)),
            defense: Math.max(2, baseMonster.defense + Math.floor(levelDifference * 1.2))
        };
        
        let tier = 'normal';
        const roll = Math.random() * 100;
        if (roll < 0.1) tier = 'legendary';
        else if (roll < 1.0) tier = 'champion';
        else if (roll < 5.0) tier = 'elite';
        
        const tierData = MONSTER_TIERS[tier];
        const multiplier = tierData.multiplier;
        
        let tierDisplay = '';
        if (tier === 'elite') tierDisplay = ' Elite';
        else if (tier === 'champion') tierDisplay = ' Champion';
        else if (tier === 'legendary') tierDisplay = ' Legendary';
        
        return {
            ...scaledMonster,
            tier,
            tierData,
            health: Math.floor(scaledMonster.health * multiplier),
            maxHealth: Math.floor(scaledMonster.health * multiplier),
            attack: Math.floor(scaledMonster.attack * multiplier),
            defense: Math.floor(scaledMonster.defense * multiplier),
            displayName: `${scaledMonster.name}${tierDisplay}`,
            tierDisplay,
            critChance: 3, // BALANCED: Same as player base
            critMultiplier: 1.3 // BALANCED: Same as player base
        };
    },

    calculateDamage: (attacker, defender, isCritical = false, multiplier = 1.0) => {
        const baseAttack = attacker.attack || 8;
        const defense = defender.defense || 3;
        
        let damage = Math.max(1, baseAttack - defense);
        damage = Math.floor(damage * multiplier);
        
        const variance = 0.15;
        const minDamage = Math.ceil(damage * (1 - variance));
        const maxDamage = Math.ceil(damage * (1 + variance));
        damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
        
        if (isCritical) {
            damage = Math.floor(damage * (attacker.critMultiplier || 1.3));
        }
        
        return Math.max(1, damage);
    },

    isCriticalHit: (attacker) => {
        const critChance = attacker.critChance || 3; // BALANCED: Middle ground
        return Math.random() * 100 < critChance;
    },

    getAvailableAbilities: (character) => {
        if (!character || !character.class) return [];
        const classAbilities = CLASS_ABILITIES[character.class] || [];
        return classAbilities.filter(ability => character.level >= ability.level);
    }
};