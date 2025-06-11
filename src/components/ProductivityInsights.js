import React, { useState, useMemo } from 'react';
import { useAuth } from '../App';
import { analyticsUtils } from '../utils';

export const ProductivityInsights = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('insights');

  const insights = useMemo(() => {
    if (!user?.writingSessions || user.writingSessions.length === 0) return null;
    return analyticsUtils.calculateProductivityInsights(user.writingSessions);
  }, [user?.writingSessions]);

  const patterns = useMemo(() => {
    if (!user?.writingSessions) return null;
    return analyticsUtils.getWritingPatterns(user.writingSessions);
  }, [user?.writingSessions]);

  if (!insights) {
    return (
      <div className="bg-fantasy-800 p-8 rounded-lg border border-fantasy-600 text-center">
        <div className="text-fantasy-400 mb-4">📊</div>
        <h3 className="text-lg font-bold mb-2">No Analytics Yet</h3>
        <p className="text-fantasy-300">Complete a few writing sessions to unlock productivity insights!</p>
      </div>
    );
  }

  const HourlyChart = () => {
    const maxWords = Math.max(...patterns.hourlyDistribution);
    return (
      <div className="bg-fantasy-700 p-4 rounded-lg">
        <h4 className="font-bold mb-4">Writing Activity by Hour</h4>
        <div className="flex items-end justify-between h-32 gap-1">
          {patterns.hourlyDistribution.map((words, hour) => (
            <div key={hour} className="flex flex-col items-center flex-1">
              <div 
                className="bg-fantasy-400 w-full rounded-t transition-all duration-500"
                style={{ 
                  height: maxWords > 0 ? `${(words / maxWords) * 100}%` : '0%',
                  minHeight: words > 0 ? '4px' : '0px'
                }}
              />
              <div className="text-xs text-fantasy-400 mt-1">
                {hour % 6 === 0 ? `${hour}h` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DailyChart = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxWords = Math.max(...patterns.dailyDistribution);
    
    return (
      <div className="bg-fantasy-700 p-4 rounded-lg">
        <h4 className="font-bold mb-4">Writing Activity by Day</h4>
        <div className="space-y-2">
          {patterns.dailyDistribution.map((words, day) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-12 text-sm text-fantasy-300">{dayNames[day]}</div>
              <div className="flex-1 bg-fantasy-600 rounded-full h-4 relative">
                <div 
                  className="bg-fantasy-400 h-4 rounded-full transition-all duration-500"
                  style={{ width: maxWords > 0 ? `${(words / maxWords) * 100}%` : '0%' }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {words > 0 ? words.toLocaleString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="bg-fantasy-800 rounded-lg p-1 border border-fantasy-600">
          {['insights', 'patterns', 'genres'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-fantasy-600 text-white'
                  : 'text-fantasy-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'insights' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
            <h3 className="text-xl font-bold mb-6 glow-text">📈 Productivity Stats</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-fantasy-700 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-fantasy-200">
                    {insights.averageWordsPerMinute.toFixed(1)}
                  </div>
                  <div className="text-sm text-fantasy-400">Words/Minute</div>
                </div>
                <div className="bg-fantasy-700 p-4 rounded text-center">
                  <div className="text-2xl font-bold text-fantasy-200">
                    {Math.round(insights.averageSessionLength)}m
                  </div>
                  <div className="text-sm text-fantasy-400">Avg Session</div>
                </div>
              </div>
              
              <div className="bg-fantasy-700 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-fantasy-300">Consistency Score</span>
                  <span className="font-bold">{Math.round(insights.consistencyScore)}%</span>
                </div>
                <div className="w-full bg-fantasy-600 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${insights.consistencyScore}%` }}
                  />
                </div>
              </div>
              
              {insights.bestTimeOfDay && (
                <div className="bg-fantasy-700 p-4 rounded">
                  <div className="text-fantasy-300 text-sm">Best Writing Time</div>
                  <div className="font-bold text-fantasy-100">{insights.bestTimeOfDay}</div>
                </div>
              )}
              
              {insights.mostProductiveDay && (
                <div className="bg-fantasy-700 p-4 rounded">
                  <div className="text-fantasy-300 text-sm">Most Productive Day</div>
                  <div className="font-bold text-fantasy-100">{insights.mostProductiveDay}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
            <h3 className="text-xl font-bold mb-6 glow-text">💡 Recommendations</h3>
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="bg-fantasy-700 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <div className="text-sm text-fantasy-200">{rec.text}</div>
                      <div className="text-xs text-fantasy-400 mt-1 capitalize">{rec.type}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {insights.recommendations.length === 0 && (
                <div className="text-center text-fantasy-400 py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>Keep writing to unlock personalized recommendations!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <HourlyChart />
          <DailyChart />
        </div>
      )}

      {activeTab === 'genres' && (
        <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
          <h3 className="text-xl font-bold mb-6 glow-text">📚 Writing Preferences</h3>
          <div className="space-y-4">
            {insights.preferredGenres.map((genre, index) => (
              <div key={genre.genre} className="bg-fantasy-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{genre.genre}</h4>
                  <div className="text-sm text-fantasy-400">#{index + 1}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-fantasy-400">Words:</span>
                    <span className="ml-2 font-bold">{genre.words.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-fantasy-400">Sessions:</span>
                    <span className="ml-2 font-bold">{genre.sessions}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {insights.preferredGenres.length === 0 && (
              <div className="text-center text-fantasy-400 py-8">
                <div className="text-4xl mb-2">📝</div>
                <p>Start categorizing your writing sessions to see genre preferences!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};