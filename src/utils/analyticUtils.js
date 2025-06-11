export const analyticsUtils = {
  calculateProductivityInsights: (sessions) => {
    if (!sessions || sessions.length === 0) return {};
    
    const insights = {
      bestTimeOfDay: null,
      mostProductiveDay: null,
      averageSessionLength: 0,
      averageWordsPerMinute: 0,
      consistencyScore: 0,
      peakProductivityHour: null,
      preferredGenres: [],
      streakAnalysis: {},
      recommendations: []
    };
    
    // Time of day analysis
    const hourlyData = {};
    const dailyData = {};
    const genreData = {};
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sunday
      const genre = session.genre || 'general';
      
      // Hourly productivity
      if (!hourlyData[hour]) hourlyData[hour] = { sessions: 0, words: 0, totalMinutes: 0 };
      hourlyData[hour].sessions++;
      hourlyData[hour].words += session.wordCount;
      hourlyData[hour].totalMinutes += session.sessionMinutes;
      
      // Daily productivity
      if (!dailyData[day]) dailyData[day] = { sessions: 0, words: 0, totalMinutes: 0 };
      dailyData[day].sessions++;
      dailyData[day].words += session.wordCount;
      dailyData[day].totalMinutes += session.sessionMinutes;
      
      // Genre tracking
      if (!genreData[genre]) genreData[genre] = { sessions: 0, words: 0 };
      genreData[genre].sessions++;
      genreData[genre].words += session.wordCount;
    });
    
    // Best time of day (highest words per minute)
    let bestHour = null;
    let bestWPM = 0;
    Object.entries(hourlyData).forEach(([hour, data]) => {
      const wpm = data.totalMinutes > 0 ? data.words / data.totalMinutes : 0;
      if (wpm > bestWPM) {
        bestWPM = wpm;
        bestHour = parseInt(hour);
      }
    });
    
    insights.peakProductivityHour = bestHour;
    insights.bestTimeOfDay = analyticsUtils.formatTimeOfDay(bestHour);
    
    // Most productive day of week
    let bestDay = null;
    let bestDayWPM = 0;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    Object.entries(dailyData).forEach(([day, data]) => {
      const wpm = data.totalMinutes > 0 ? data.words / data.totalMinutes : 0;
      if (wpm > bestDayWPM) {
        bestDayWPM = wpm;
        bestDay = dayNames[parseInt(day)];
      }
    });
    insights.mostProductiveDay = bestDay;
    
    // Overall averages
    const totalWords = sessions.reduce((sum, s) => sum + s.wordCount, 0);
    const totalMinutes = sessions.reduce((sum, s) => sum + s.sessionMinutes, 0);
    insights.averageSessionLength = totalMinutes / sessions.length;
    insights.averageWordsPerMinute = totalMinutes > 0 ? totalWords / totalMinutes : 0;
    
    // Preferred genres
    insights.preferredGenres = Object.entries(genreData)
      .sort(([,a], [,b]) => b.words - a.words)
      .slice(0, 3)
      .map(([genre, data]) => ({ genre, words: data.words, sessions: data.sessions }));
    
    // Consistency score (based on regularity of sessions)
    insights.consistencyScore = analyticsUtils.calculateConsistencyScore(sessions);
    
    // Generate recommendations
    insights.recommendations = analyticsUtils.generateRecommendations(insights, sessions);
    
    return insights;
  },
  
  formatTimeOfDay: (hour) => {
    if (hour === null) return null;
    if (hour < 6) return "Late Night";
    if (hour < 12) return "Morning";
    if (hour < 17) return "Afternoon";
    if (hour < 21) return "Evening";
    return "Night";
  },
  
  calculateConsistencyScore: (sessions) => {
    if (sessions.length < 7) return sessions.length * 14.3; // Max 100 for 7+ sessions
    
    const last30Days = sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return sessionDate >= thirtyDaysAgo;
      });
    
    const uniqueDays = new Set(
      last30Days.map(s => new Date(s.date).toDateString())
    ).size;
    
    return Math.min(100, (uniqueDays / 30) * 100);
  },
  
  generateRecommendations: (insights, sessions) => {
    const recommendations = [];
    
    if (insights.peakProductivityHour !== null) {
      recommendations.push({
        type: 'timing',
        text: `You're most productive at ${insights.peakProductivityHour}:00. Try scheduling important writing during this time.`,
        icon: '🕐'
      });
    }
    
    if (insights.mostProductiveDay) {
      recommendations.push({
        type: 'scheduling',
        text: `${insights.mostProductiveDay}s are your strongest writing days. Consider planning longer sessions then.`,
        icon: '📅'
      });
    }
    
    if (insights.averageWordsPerMinute < 10) {
      recommendations.push({
        type: 'improvement',
        text: 'Try writing exercises or prompts to increase your writing velocity.',
        icon: '🚀'
      });
    }
    
    if (insights.consistencyScore < 50) {
      recommendations.push({
        type: 'consistency',
        text: 'Writing more frequently, even for short periods, can improve your consistency score.',
        icon: '🎯'
      });
    }
    
    if (sessions.length >= 10) {
      const recentSessions = sessions.slice(-5);
      const earlierSessions = sessions.slice(-10, -5);
      const recentAvg = recentSessions.reduce((sum, s) => sum + s.wordCount, 0) / recentSessions.length;
      const earlierAvg = earlierSessions.reduce((sum, s) => sum + s.wordCount, 0) / earlierSessions.length;
      
      if (recentAvg > earlierAvg * 1.2) {
        recommendations.push({
          type: 'positive',
          text: "You're on fire! Your recent sessions show significant improvement.",
          icon: '🔥'
        });
      }
    }
    
    return recommendations;
  },
  
  getWritingPatterns: (sessions) => {
    const patterns = {
      hourlyDistribution: Array(24).fill(0),
      dailyDistribution: Array(7).fill(0),
      monthlyTrends: {}
    };
    
    sessions.forEach(session => {
      const date = new Date(session.date);
      patterns.hourlyDistribution[date.getHours()] += session.wordCount;
      patterns.dailyDistribution[date.getDay()] += session.wordCount;
      
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!patterns.monthlyTrends[monthKey]) {
        patterns.monthlyTrends[monthKey] = { words: 0, sessions: 0 };
      }
      patterns.monthlyTrends[monthKey].words += session.wordCount;
      patterns.monthlyTrends[monthKey].sessions++;
    });
    
    return patterns;
  }
};