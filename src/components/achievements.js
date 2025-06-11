// src/components/Achievements.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { ACHIEVEMENTS } from '../data/achievements';
import { achievementUtils } from '../utils/achievementUtils';

export const AchievementPopup = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-fantasy-800 border-2 border-yellow-400 rounded-lg p-8 max-w-md w-full text-center animate-pulse">
        <div className="text-6xl mb-4">{achievement.icon}</div>
        <h3 className="text-2xl font-bold text-yellow-400 mb-2">Achievement Unlocked!</h3>
        <h4 className="text-xl font-semibold mb-3">{achievement.name}</h4>
        <p className="text-fantasy-300 mb-4">{achievement.description}</p>
        <div className="bg-fantasy-700 p-3 rounded mb-4">
          <h5 className="font-medium mb-2">Rewards:</h5>
          <div className="flex justify-center gap-4">
            {achievement.rewards.xp > 0 && (
              <span className="text-blue-400">+{achievement.rewards.xp} XP</span>
            )}
            {achievement.rewards.inkDrops > 0 && (
              <span className="text-yellow-400">+{achievement.rewards.inkDrops} Ink Drops</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-fantasy-600 hover:bg-fantasy-500 text-white font-bold py-2 px-6 rounded"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export const AchievementSection = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('writing');

  const stats = user ? achievementUtils.calculateUserStats(user) : {};
  const unlockedCount = user?.character?.achievements?.length || 0;
  const totalCount = Object.values(ACHIEVEMENTS).flat().length;

  const getAchievementsByCategory = (category) => {
    return ACHIEVEMENTS[category].map(achievement => ({
      ...achievement,
      isUnlocked: achievementUtils.isUnlocked(achievement.id, user),
      progress: achievementUtils.getProgressPercentage(achievement, stats),
      currentValue: stats[achievement.requirement.type] || 0
    }));
  };

  const categories = [
    { key: 'writing', label: 'Writing', icon: '✍️' },
    { key: 'rpg', label: 'Adventure', icon: '⚔️' },
    { key: 'milestone', label: 'Milestones', icon: '🏆' }
  ];

  return (
    <div className="bg-fantasy-800 rounded-lg border border-fantasy-600">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-fantasy-700 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="text-lg font-bold text-left">Achievements</h3>
            <p className="text-sm text-fantasy-400 text-left">
              {unlockedCount}/{totalCount} unlocked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 bg-fantasy-700 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-fantasy-400 text-lg">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-fantasy-600 p-4">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-fantasy-600 text-white'
                    : 'bg-fantasy-700 text-fantasy-300 hover:text-white'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {getAchievementsByCategory(selectedCategory).map(achievement => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.isUnlocked
                    ? 'border-yellow-400 bg-fantasy-700'
                    : 'border-fantasy-600 bg-fantasy-700/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span 
                    className={`text-2xl ${achievement.isUnlocked ? '' : 'grayscale opacity-50'}`}
                  >
                    {achievement.icon}
                  </span>
                  <div className="flex-1">
                    <h4 className={`font-bold mb-1 ${
                      achievement.isUnlocked ? 'text-yellow-400' : 'text-fantasy-300'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-sm ${
                      achievement.isUnlocked ? 'text-fantasy-200' : 'text-fantasy-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    achievementUtils.getDifficultyColor(achievement.difficulty)
                  } bg-opacity-20`}>
                    {achievement.difficulty}
                  </span>
                </div>

                {!achievement.isUnlocked && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-fantasy-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.currentValue}/{achievement.requirement.value}</span>
                    </div>
                    <div className="w-full bg-fantasy-600 rounded-full h-2">
                      <div
                        className="bg-fantasy-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <div className="flex gap-3">
                    {achievement.rewards.xp > 0 && (
                      <span className="text-blue-400">+{achievement.rewards.xp} XP</span>
                    )}
                    {achievement.rewards.inkDrops > 0 && (
                      <span className="text-yellow-400">+{achievement.rewards.inkDrops} Ink</span>
                    )}
                  </div>
                  {achievement.isUnlocked && (
                    <span className="text-green-400 font-medium">✓ Unlocked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for checking achievements after actions
export const useAchievementChecker = () => {
  const { user, updateUser } = useAuth();
  const [pendingAchievement, setPendingAchievement] = useState(null);

  const checkAndAwardAchievements = (newData = {}) => {
    if (!user) return;

    const newlyUnlocked = achievementUtils.checkAchievements(user, newData);
    
    if (newlyUnlocked.length > 0) {
      // Award the first achievement and show popup
      const achievement = newlyUnlocked[0];
      const updatedCharacter = achievementUtils.awardAchievement(user, achievement);
      
      updateUser({ character: updatedCharacter });
      setPendingAchievement(achievement);
      
      // If there are more achievements, check them after a delay
      if (newlyUnlocked.length > 1) {
        setTimeout(() => {
          checkAndAwardAchievements(newData);
        }, 3000);
      }
    }
  };

  const closePendingAchievement = () => {
    setPendingAchievement(null);
  };

  return {
    checkAndAwardAchievements,
    pendingAchievement,
    closePendingAchievement
  };
};