// src/components/EnhancedGoalTracking.js
import React, { useState, useMemo } from 'react';
import { useAuth } from '../App';
import { useAchievementChecker } from './Achievements';

const BurndownChart = ({ writingGoals, writingSessions }) => {
  const chartData = useMemo(() => {
    if (!writingGoals || !writingSessions) return null;

    const startDate = new Date(writingGoals.startDate);
    const endDate = new Date(writingGoals.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const dailyTarget = writingGoals.totalWords / totalDays;

    const data = [];
    
    // Create ideal burndown line
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const idealWordsRemaining = writingGoals.totalWords - (dailyTarget * i);
      
      // Calculate actual words written by this date
      const sessionsUpToDate = writingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate <= currentDate;
      });
      
      const actualWordsWritten = sessionsUpToDate.reduce((sum, session) => sum + session.wordCount, 0);
      const actualWordsRemaining = Math.max(0, writingGoals.totalWords - actualWordsWritten);
      
      data.push({
        day: i,
        date: currentDate.toLocaleDateString(),
        idealRemaining: Math.max(0, idealWordsRemaining),
        actualRemaining: actualWordsRemaining,
        actualWritten: actualWordsWritten
      });
    }

    return data;
  }, [writingGoals, writingSessions]);

  if (!chartData) return null;

  const maxWords = writingGoals.totalWords;
  const chartHeight = 200;
  const chartWidth = 400;

  return (
    <div className="bg-fantasy-700 p-4 rounded-lg">
      <h4 className="font-bold mb-4 text-center">Goal Burndown Chart</h4>
      <div className="flex justify-center">
        <svg width={chartWidth} height={chartHeight} className="border border-fantasy-600 rounded">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Ideal burndown line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,5"
            points={chartData.map((point, index) => 
              `${(index / (chartData.length - 1)) * chartWidth},${chartHeight - (point.idealRemaining / maxWords) * chartHeight}`
            ).join(' ')}
          />
          
          {/* Actual progress line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={chartData.map((point, index) => 
              `${(index / (chartData.length - 1)) * chartWidth},${chartHeight - (point.actualRemaining / maxWords) * chartHeight}`
            ).join(' ')}
          />
          
          {/* Current day indicator */}
          {(() => {
            const today = new Date();
            const todayIndex = chartData.findIndex(point => {
              const pointDate = new Date(point.date);
              return pointDate.toDateString() === today.toDateString();
            });
            
            if (todayIndex >= 0) {
              const x = (todayIndex / (chartData.length - 1)) * chartWidth;
              return (
                <line
                  x1={x}
                  y1="0"
                  x2={x}
                  y2={chartHeight}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
              );
            }
            return null;
          })()}
        </svg>
      </div>
      
      <div className="mt-4 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500 border-dashed border border-green-500"></div>
          <span>Ideal Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span>Actual Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-yellow-500 border-dashed border border-yellow-500"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

const DailyProgressCalendar = ({ writingGoals, writingSessions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    if (!writingGoals || !writingSessions) return null;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay()); // Start from Sunday

    const weeks = [];
    let currentWeek = [];

    for (let i = 0; i < 42; i++) { // 6 weeks max
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      if (date > lastDay && currentWeek.length > 0) break;

      const dayData = {
        date: date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === new Date().toDateString()
      };

      // Calculate words written on this day
      const daysSessions = writingSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.toDateString() === date.toDateString();
      });

      dayData.wordsWritten = daysSessions.reduce((sum, session) => sum + session.wordCount, 0);
      dayData.metDailyGoal = dayData.wordsWritten >= (writingGoals.dailyTarget || 0);
      dayData.hasWriting = dayData.wordsWritten > 0;

      currentWeek.push(dayData);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentMonth, writingGoals, writingSessions]);

  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  if (!calendarData) return null;

  return (
    <div className="bg-fantasy-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="bg-fantasy-600 hover:bg-fantasy-500 text-white px-3 py-1 rounded"
        >
          ←
        </button>
        <h4 className="font-bold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button
          onClick={() => changeMonth(1)}
          className="bg-fantasy-600 hover:bg-fantasy-500 text-white px-3 py-1 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-fantasy-400 py-2">
            {day}
          </div>
        ))}

        {calendarData.flat().map((day, index) => (
          <div
            key={index}
            className={`
              h-12 flex flex-col items-center justify-center text-xs rounded relative
              ${day.isCurrentMonth ? 'text-fantasy-200' : 'text-fantasy-500'}
              ${day.isToday ? 'ring-2 ring-yellow-400' : ''}
              ${day.metDailyGoal ? 'bg-green-600' : day.hasWriting ? 'bg-blue-600/50' : 'bg-fantasy-600/20'}
              ${day.isCurrentMonth ? 'hover:bg-fantasy-600' : ''}
            `}
          >
            <span className={day.isToday ? 'font-bold' : ''}>{day.day}</span>
            {day.wordsWritten > 0 && (
              <span className="text-xs font-bold">
                {day.wordsWritten > 999 ? `${(day.wordsWritten / 1000).toFixed(1)}k` : day.wordsWritten}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span>Goal Met</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600/50 rounded"></div>
          <span>Some Writing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-fantasy-600/20 rounded"></div>
          <span>No Writing</span>
        </div>
      </div>
    </div>
  );
};

export const EnhancedGoalDisplay = () => {
  const { user, updateUser } = useAuth();
  const { checkAndAwardAchievements } = useAchievementChecker();
  const [showHistorical, setShowHistorical] = useState(false);

  if (!user?.writingGoals) return null;

  const progressPercentage = Math.min((user.writingGoals.currentProgress / user.writingGoals.totalWords) * 100, 100);
  const daysRemaining = Math.max(0, Math.ceil((new Date(user.writingGoals.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const wordsRemaining = Math.max(0, user.writingGoals.totalWords - user.writingGoals.currentProgress);
  
  // Calculate if we're on track
  const totalDays = Math.ceil((new Date(user.writingGoals.endDate) - new Date(user.writingGoals.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = totalDays - daysRemaining;
  const expectedProgress = (daysPassed / totalDays) * user.writingGoals.totalWords;
  const isOnTrack = user.writingGoals.currentProgress >= expectedProgress;
  
  // Calculate daily pace needed to finish on time
  const dailyPaceNeeded = daysRemaining > 0 ? Math.ceil(wordsRemaining / daysRemaining) : 0;

  const handleCompleteGoal = () => {
    const character = { ...user.character };
    character.goalsCompleted = (character.goalsCompleted || 0) + 1;
    
    // Completion rewards
    const completionBonus = Math.floor(user.writingGoals.totalWords / 10); // 10% of goal as XP
    character.xp += completionBonus;
    character.inkDrops = (character.inkDrops || 0) + Math.floor(user.writingGoals.totalWords / 50); // Ink drops bonus
    
    // Handle level ups
    while (character.xp >= character.xpToNext) {
      character.xp -= character.xpToNext;
      character.level += 1;
      character.availableStatPoints += 3;
      character.xpToNext = Math.floor(100 * Math.pow(character.level, 1.5));
    }

    // Archive the completed goal
    const completedGoals = user.completedGoals || [];
    completedGoals.push({
      ...user.writingGoals,
      completedDate: new Date().toISOString(),
      finalProgress: user.writingGoals.currentProgress
    });

    updateUser({ 
      character,
      writingGoals: null,
      completedGoals
    });

    // Check for achievements
    checkAndAwardAchievements({ character });
  };

  return (
    <div className="space-y-6">
      <div className="bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold glow-text">Your Writing Quest</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistorical(!showHistorical)}
              className="bg-fantasy-600 hover:bg-fantasy-500 text-white px-4 py-2 rounded text-sm"
            >
              {showHistorical ? 'Current Goal' : 'Historical'}
            </button>
            {progressPercentage >= 100 && (
              <button
                onClick={handleCompleteGoal}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold"
              >
                Complete Goal! 🎉
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 goal-progress-ring" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                className="text-fantasy-700"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercentage / 100)}`}
                className={`transition-all duration-1000 ${isOnTrack ? 'text-green-400' : 'text-orange-400'}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="text-3xl font-bold text-fantasy-200">{progressPercentage.toFixed(1)}%</div>
                <div className={`text-sm ${isOnTrack ? 'text-green-400' : 'text-orange-400'}`}>
                  {isOnTrack ? 'On Track' : 'Behind'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-fantasy-700 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-fantasy-300 mb-2">
              {user.writingGoals.currentProgress.toLocaleString()}
            </div>
            <div className="text-fantasy-400 text-sm">Words Written</div>
          </div>
          <div className="bg-fantasy-700 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-fantasy-300 mb-2">
              {wordsRemaining.toLocaleString()}
            </div>
            <div className="text-fantasy-400 text-sm">Words Remaining</div>
          </div>
          <div className="bg-fantasy-700 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-fantasy-300 mb-2">
              {dailyPaceNeeded.toLocaleString()}
            </div>
            <div className="text-fantasy-400 text-sm">Daily Pace Needed</div>
          </div>
          <div className="bg-fantasy-700 p-6 rounded-lg text-center">
            <div className="text-2xl font-bold text-fantasy-300 mb-2">
              {daysRemaining}
            </div>
            <div className="text-fantasy-400 text-sm">Days Remaining</div>
          </div>
        </div>

        {!showHistorical ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <BurndownChart writingGoals={user.writingGoals} writingSessions={user.writingSessions} />
            <DailyProgressCalendar writingGoals={user.writingGoals} writingSessions={user.writingSessions} />
          </div>
        ) : (
          <div className="bg-fantasy-700 p-6 rounded-lg">
            <h4 className="font-bold mb-4">Completed Goals</h4>
            {user.completedGoals && user.completedGoals.length > 0 ? (
              <div className="space-y-4">
                {user.completedGoals.map((goal, index) => (
                  <div key={index} className="bg-fantasy-600 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">{goal.name || 'Writing Goal'}</h5>
                        <p className="text-sm text-fantasy-400">
                          {goal.finalProgress.toLocaleString()} / {goal.totalWords.toLocaleString()} words
                        </p>
                        <p className="text-xs text-fantasy-500">
                          Completed: {new Date(goal.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-green-400 font-bold">
                        {Math.round((goal.finalProgress / goal.totalWords) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-fantasy-400 text-center py-8">No completed goals yet. Finish your current goal to see it here!</p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => updateUser({ writingGoals: null })}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Reset Current Goal
          </button>
        </div>
      </div>
    </div>
  );
};