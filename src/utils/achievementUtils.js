// src/utils/achievementUtils.js
import { ACHIEVEMENTS } from '../data/achievements';
import { streakUtils } from './index';

export const achievementUtils = {
  checkAchievements: (user, newData = {}) => {
    if (!user.character) return [];
    
    const unlockedAchievements = user.character.achievements || [];
    const newlyUnlocked = [];
    
    // Combine current user data with any new data from this session
    const userData = {
      writingSessions: user.writingSessions || [],
      character: { ...user.character, ...newData.character },
      ...newData
    };
    
    // Calculate current stats
    const stats = achievementUtils.calculateUserStats(userData);
    
    // Check all achievements
    Object.values(ACHIEVEMENTS).flat().forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      if (achievementUtils.checkRequirement(achievement.requirement, stats)) {
        newlyUnlocked.push(achievement);
      }
    });
    
    return newlyUnlocked;
  },
  
  calculateUserStats: (userData) => {
    const sessions = userData.writingSessions || [];
    const character = userData.character || {};
    
    return {
      sessions_completed: sessions.length,
      total_words: sessions.reduce((sum, s) => sum + s.wordCount, 0),
      writing_streak: streakUtils.calculateStreak(sessions),
      character_level: character.level || 1,
      monsters_defeated: character.monstersDefeated || 0,
      elite_monsters_defeated: character.eliteMonstersDefeated || 0,
      equipment_found: character.equipmentFound || 0,
      ink_drops_spent: character.inkDropsSpent || 0,
      goals_completed: character.goalsCompleted || 0,
      daily_goals_completed: character.dailyGoalsCompleted || 0,
      words_in_session: Math.max(...sessions.map(s => s.wordCount), 0),
      minutes_in_session: Math.max(...sessions.map(s => s.sessionMinutes), 0)
    };
  },
  
  checkRequirement: (requirement, stats) => {
    return stats[requirement.type] >= requirement.value;
  },
  
  awardAchievement: (user, achievement) => {
    const character = { ...user.character };
    
    // Add to unlocked achievements
    if (!character.achievements) character.achievements = [];
    character.achievements.push(achievement.id);
    
    // Award rewards
    if (achievement.rewards.xp) {
      character.xp += achievement.rewards.xp;
      
      // Handle level ups
      while (character.xp >= character.xpToNext) {
        character.xp -= character.xpToNext;
        character.level += 1;
        character.availableStatPoints += 3;
        character.xpToNext = Math.floor(100 * Math.pow(character.level, 1.5));
      }
    }
    
    if (achievement.rewards.inkDrops) {
      character.inkDrops = (character.inkDrops || 0) + achievement.rewards.inkDrops;
    }
    
    return character;
  },
  
  getDifficultyColor: (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-red-400';
      default: return 'text-fantasy-300';
    }
  },
  
  getProgressPercentage: (achievement, stats) => {
    const current = stats[achievement.requirement.type] || 0;
    const target = achievement.requirement.value;
    return Math.min((current / target) * 100, 100);
  },
  
  isUnlocked: (achievementId, user) => {
    return user?.character?.achievements?.includes(achievementId) || false;
  }
};