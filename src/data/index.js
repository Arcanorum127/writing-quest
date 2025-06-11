
// Export achievements
export { ACHIEVEMENTS } from './achievements';

export { WRITING_PROMPTS, WRITING_PROJECTS } from './writingPrompts';

// Character classes data
export const CHARACTER_CLASSES = {
    chronicler: {
        name: "The Chronicler",
        description: "Tank/Support - Masters of endurance and protection",
        primaryStats: ["Focus", "Persistence"],
        baseStats: { focus: 10, creativity: 8, persistence: 13, technique: 8 }
    },
    wordsmith: {
        name: "The Wordsmith", 
        description: "Physical DPS - Precise and powerful strikes",
        primaryStats: ["Technique", "Creativity"],
        baseStats: { focus: 8, creativity: 10, persistence: 8, technique: 13 }
    },
    plotweaver: {
        name: "The Plotweaver",
        description: "Control Mage - Strategic magical combat",
        primaryStats: ["Focus", "Technique"], 
        baseStats: { focus: 13, creativity: 8, persistence: 8, technique: 10 }
    },
    dialogist: {
        name: "The Dialogist",
        description: "Hybrid Support - Versatile and adaptive",
        primaryStats: ["Persistence", "Creativity"],
        baseStats: { focus: 8, creativity: 13, persistence: 10, technique: 8 }
    }
};

// Class abilities data
export const CLASS_ABILITIES = {
    chronicler: [
        {
            name: "Plot Armor",
            level: 3,
            manaCost: 15,
            cooldown: 4,
            description: "Writer's intuition protects you - reduces incoming damage by 35% for 2 turns",
            effect: "plot_armor"
        },
        {
            name: "Restorative Editing",
            level: 7,
            manaCost: 20,
            cooldown: 3,
            description: "Rewrite your story to restore 30% of max health",
            effect: "heal"
        }
    ],
    wordsmith: [
        {
            name: "Precise Strike",
            level: 3,
            manaCost: 15,
            cooldown: 3,
            description: "A carefully crafted attack dealing 200% weapon damage",
            effect: "power_attack"
        },
        {
            name: "Flurry of Blows",
            level: 7,
            manaCost: 20,
            cooldown: 4,
            description: "Strike like rapid keystrokes - attack 3 times with reduced damage",
            effect: "multi_attack"
        }
    ],
    plotweaver: [
        {
            name: "Arcane Manuscripts",
            level: 3,
            manaCost: 15,
            cooldown: 3,
            description: "Summon floating tomes that launch 3 magical projectiles",
            effect: "magic_multi"
        },
        {
            name: "Binding Narrative",
            level: 7,
            manaCost: 20,
            cooldown: 5,
            description: "Trap enemy in a subplot - reduce their damage by 30% for 3 turns",
            effect: "enemy_debuff"
        }
    ],
    dialogist: [
        {
            name: "Inspiring Words",
            level: 3,
            manaCost: 0,
            cooldown: 3,
            description: "Motivational speech restores 15 mana through pure charisma",
            effect: "mana_restore"
        },
        {
            name: "Sharp Wit",
            level: 7,
            manaCost: 20,
            cooldown: 4,
            description: "Sharp wit increases critical hit chance by 25% for 3 turns",
            effect: "crit_boost"
        }
    ]
};

// Writing skills data
export const WRITING_SKILLS = {
    craft: ["Worldbuilding", "Character Development", "Dialogue", "Plot Structure", "Pacing", "Descriptive Writing", "Voice & Tone", "Point of View"],
    technical: ["Grammar & Syntax", "Editing & Revision", "Research", "Genre Conventions"],
    creative: ["Imagery & Metaphor", "Conflict Creation", "Theme Development", "Foreshadowing"],
    professional: ["Consistency", "Productivity", "Story Planning", "Reader Engagement"]
};

// Equipment Database
export const EQUIPMENT_DATABASE = {
    weapons: [
        { id: 'quill_basic', name: 'Basic Quill', rarity: 'common', attack: 5, description: 'A simple writing quill' },
        { id: 'pen_fountain', name: 'Fountain Pen', rarity: 'common', attack: 7, description: 'Flows smoothly across the page' },
        { id: 'typewriter_vintage', name: 'Vintage Typewriter', rarity: 'uncommon', attack: 12, description: 'Clacks with purpose and determination' },
        { id: 'laptop_modern', name: 'Modern Laptop', rarity: 'uncommon', attack: 15, description: 'Digital efficiency at your fingertips' },
        { id: 'quill_phoenix', name: 'Phoenix Feather Quill', rarity: 'rare', attack: 20, critChance: 5, description: 'Burns with creative fire' }
    ],
    armor: [
        { id: 'cloak_novice', name: 'Novice Writer\'s Cloak', rarity: 'common', defense: 3, description: 'Basic protection for budding writers' },
        { id: 'hood_focus', name: 'Hood of Focus', rarity: 'common', defense: 5, mana: 10, description: 'Helps maintain concentration' },
        { id: 'robe_scholar', name: 'Scholar\'s Robe', rarity: 'uncommon', defense: 8, mana: 15, description: 'Worn by dedicated students of the craft' },
        { id: 'vest_editor', name: 'Editor\'s Vest', rarity: 'uncommon', defense: 10, health: 20, description: 'Reinforced with countless corrections' }
    ],
    accessories: [
        { id: 'ring_focus', name: 'Ring of Focus', rarity: 'common', mana: 15, description: 'Helps maintain concentration' },
        { id: 'pendant_inspiration', name: 'Pendant of Inspiration', rarity: 'common', critChance: 3, description: 'Sparks creative thoughts' },
        { id: 'bracelet_persistence', name: 'Bracelet of Persistence', rarity: 'uncommon', health: 25, description: 'Never give up on your story' },
        { id: 'amulet_creativity', name: 'Amulet of Creativity', rarity: 'uncommon', critChance: 5, mana: 10, description: 'Enhances imaginative thinking' }
    ]
};

// Store Items Database
export const STORE_DATABASE = {
    equipment: [
        { id: 'store_quill_silver', name: 'Silver Quill', rarity: 'uncommon', attack: 10, cost: 150, description: 'A gleaming silver writing implement' },
        { id: 'store_cloak_writer', name: 'Writer\'s Cloak', rarity: 'uncommon', defense: 8, cost: 200, description: 'Protects against creative blocks' },
        { id: 'store_ring_luck', name: 'Ring of Luck', rarity: 'rare', critChance: 6, cost: 500, description: 'Increases chances of finding rare items' }
    ],
    consumables: [
        { id: 'coffee_strong', name: 'Strong Coffee', cost: 25, description: 'Restores 50 mana instantly', effect: 'restore_mana', value: 50 },
        { id: 'inspiration_potion', name: 'Inspiration Potion', cost: 75, description: 'Increases XP gained from next writing session by 50%', effect: 'xp_boost', value: 1.5 }
    ],
    cosmetics: [
        { id: 'desk_oak', name: 'Oak Writing Desk', cost: 300, description: 'A beautiful oak desk for your profile', type: 'desk' },
        { id: 'lamp_antique', name: 'Antique Lamp', cost: 150, description: 'Vintage lamp that provides warm light', type: 'decoration' }
    ]
};

// Combat areas and monsters data
export const COMBAT_AREAS = {
    whispering_woods: {
        name: "Whispering Woods",
        description: "A mysterious forest where shadows dance between ancient trees",
        levelRange: "1-10",
        monsters: [
            { name: "Shadow Sprite", level: 1, health: 65, attack: 38, defense: 8 },
            { name: "Twisted Root", level: 3, health: 85, attack: 45, defense: 12 },
            { name: "Forest Phantom", level: 5, health: 105, attack: 52, defense: 16 },
            { name: "Ancient Treant", level: 8, health: 135, attack: 62, defense: 22 }
        ]
    },
    forgotten_library: {
        name: "Forgotten Library",
        description: "Dusty halls filled with lost knowledge and wandering spirits",
        levelRange: "8-18",
        monsters: [
            { name: "Paper Wraith", level: 8, health: 130, attack: 60, defense: 20 },
            { name: "Ink Elemental", level: 12, health: 170, attack: 72, defense: 26 },
            { name: "Lost Scholar", level: 15, health: 200, attack: 82, defense: 30 },
            { name: "Tome Guardian", level: 18, health: 240, attack: 95, defense: 36 }
        ]
    }
};

// Monster tier multipliers
export const MONSTER_TIERS = {
    normal: { multiplier: 1.0, chance: 95, name: "Normal", color: "text-gray-300" },
    elite: { multiplier: 1.5, chance: 4, name: "Elite", color: "text-blue-400" },
    champion: { multiplier: 2.0, chance: 0.9, name: "Champion", color: "text-purple-400" },
    legendary: { multiplier: 3.0, chance: 0.1, name: "Legendary", color: "text-yellow-400" }
};

// Goal Templates
export const GOAL_TEMPLATES = {
    nanowrimo: { words: 50000, days: 30, name: "NaNoWriMo Challenge", difficulty: "Epic" },
    short_story: { words: 5000, days: 7, name: "Weekly Short Story", difficulty: "Moderate" },
    daily_habit: { words: 6000, days: 30, name: "Daily Writing Habit", difficulty: "Moderate" },
    novella: { words: 20000, days: 40, name: "Novella Project", difficulty: "Hard" },
    poetry_month: { words: 3000, days: 30, name: "Poetry Collection", difficulty: "Easy" }
};
