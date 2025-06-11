// src/data/achievements.js
export const ACHIEVEMENTS = {
  writing: [
    {
      id: 'first_words',
      name: 'First Words',
      description: 'Complete your first writing session',
      requirement: { type: 'sessions_completed', value: 1 },
      rewards: { xp: 50, inkDrops: 25 },
      difficulty: 'easy',
      icon: '✍️'
    },
    {
      id: 'thousand_words',
      name: 'Thousand Words',
      description: 'Write 1000 words in a single session',
      requirement: { type: 'words_in_session', value: 1000 },
      rewards: { xp: 100, inkDrops: 50 },
      difficulty: 'moderate',
      icon: '📝'
    },
    {
      id: 'week_streak',
      name: 'Seven Days Strong',
      description: 'Maintain a 7-day writing streak',
      requirement: { type: 'writing_streak', value: 7 },
      rewards: { xp: 200, inkDrops: 100 },
      difficulty: 'hard',
      icon: '🔥'
    },
    {
      id: 'goal_crusher',
      name: 'Goal Crusher',
      description: 'Complete your first writing goal',
      requirement: { type: 'goals_completed', value: 1 },
      rewards: { xp: 150, inkDrops: 75 },
      difficulty: 'moderate',
      icon: '🎯'
    },
    {
      id: 'marathon_writer',
      name: 'Marathon Writer',
      description: 'Write for 3 hours in a single session',
      requirement: { type: 'minutes_in_session', value: 180 },
      rewards: { xp: 300, inkDrops: 150 },
      difficulty: 'epic',
      icon: '⏰'
    },
    {
      id: 'daily_habit',
      name: 'Daily Habit',
      description: 'Complete daily writing goals 30 times',
      requirement: { type: 'daily_goals_completed', value: 30 },
      rewards: { xp: 500, inkDrops: 250 },
      difficulty: 'epic',
      icon: '📅'
    }
  ],
  rpg: [
    {
      id: 'first_victory',
      name: 'First Victory',
      description: 'Win your first combat encounter',
      requirement: { type: 'monsters_defeated', value: 1 },
      rewards: { xp: 25, inkDrops: 15 },
      difficulty: 'easy',
      icon: '⚔️'
    },
    {
      id: 'monster_hunter',
      name: 'Monster Hunter',
      description: 'Defeat 100 monsters',
      requirement: { type: 'monsters_defeated', value: 100 },
      rewards: { xp: 300, inkDrops: 200 },
      difficulty: 'hard',
      icon: '🗡️'
    },
    {
      id: 'level_up',
      name: 'Level Up!',
      description: 'Reach character level 10',
      requirement: { type: 'character_level', value: 10 },
      rewards: { xp: 0, inkDrops: 100 },
      difficulty: 'moderate',
      icon: '⭐'
    },
    {
      id: 'elite_slayer',
      name: 'Elite Slayer',
      description: 'Defeat 10 Elite monsters or higher',
      requirement: { type: 'elite_monsters_defeated', value: 10 },
      rewards: { xp: 200, inkDrops: 150 },
      difficulty: 'hard',
      icon: '👑'
    },
    {
      id: 'treasure_hunter',
      name: 'Treasure Hunter',
      description: 'Find 25 pieces of equipment',
      requirement: { type: 'equipment_found', value: 25 },
      rewards: { xp: 150, inkDrops: 100 },
      difficulty: 'moderate',
      icon: '💎'
    },
    {
      id: 'spender',
      name: 'Big Spender',
      description: 'Spend 1000 Ink Drops at the store',
      requirement: { type: 'ink_drops_spent', value: 1000 },
      rewards: { xp: 100, inkDrops: 50 },
      difficulty: 'moderate',
      icon: '💰'
    }
  ],
  milestone: [
    {
      id: 'ten_thousand',
      name: 'Ten Thousand Words',
      description: 'Write 10,000 total words',
      requirement: { type: 'total_words', value: 10000 },
      rewards: { xp: 500, inkDrops: 300 },
      difficulty: 'epic',
      icon: '📚'
    },
    {
      id: 'hundred_sessions',
      name: 'Centurion',
      description: 'Complete 100 writing sessions',
      requirement: { type: 'sessions_completed', value: 100 },
      rewards: { xp: 1000, inkDrops: 500 },
      difficulty: 'legendary',
      icon: '🏆'
    },
    {
      id: 'month_streak',
      name: 'Monthly Master',
      description: 'Maintain a 30-day writing streak',
      requirement: { type: 'writing_streak', value: 30 },
      rewards: { xp: 1500, inkDrops: 750 },
      difficulty: 'legendary',
      icon: '🌟'
    }
  ]
};