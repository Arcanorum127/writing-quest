import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { WRITING_SKILLS, WRITING_PROJECTS } from '../data';
import { skillUtils } from '../utils';
import { useAchievementChecker } from './Achievements';
import { WritingPrompts } from './WritingPrompts';
import { DistractionFreeMode } from './DistractionFreeMode';

export const WritingSession = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [wordCount, setWordCount] = useState('');
    const [sessionMinutes, setSessionMinutes] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('general');
    const [selectedProject, setSelectedProject] = useState('other');
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [usePrompt, setUsePrompt] = useState(false);
    const [skillPoints, setSkillPoints] = useState({});
    const [showSkillAssessment, setShowSkillAssessment] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [currentTimer, setCurrentTimer] = useState(0);
    const [showDistractionFree, setShowDistractionFree] = useState(false);
    const [writingText, setWritingText] = useState('');
    const [sessionNotes, setSessionNotes] = useState('');
    const { user, updateUser } = useAuth();
    const { checkAndAwardAchievements } = useAchievementChecker();

    const calculateSkillPoints = (words, minutes) => {
        const basePoints = Math.floor(words / 500);
        const timeBonus = Math.floor(Math.min(minutes, 120) / 60);
        const genreBonus = selectedGenre !== 'general' ? 1 : 0;
        return basePoints + timeBonus + genreBonus;
    };

    const maxSkillPoints = calculateSkillPoints(parseInt(wordCount || 0), parseInt(sessionMinutes || 0));
    const usedSkillPoints = Object.values(skillPoints).reduce((sum, points) => sum + points, 0);

    useEffect(() => {
        let interval = null;
        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                setCurrentTimer(Math.floor((Date.now() - sessionStartTime) / 1000));
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isSessionActive, sessionStartTime]);

    const startSession = () => {
        setIsSessionActive(true);
        setSessionStartTime(Date.now());
        setCurrentTimer(0);
        
        // If using prompts, generate one
        if (usePrompt && !currentPrompt) {
            // This will be handled by the WritingPrompts component
        }
    };

    const endSession = () => {
        if (sessionStartTime) {
            const actualMinutes = Math.floor((Date.now() - sessionStartTime) / 60000);
            setSessionMinutes(actualMinutes.toString());
        }
        setIsSessionActive(false);
        setSessionStartTime(null);
    };

    const handleCompleteSession = () => {
        if (!wordCount || !sessionMinutes) return;
        setShowSkillAssessment(true);
    };

    const checkDailyGoalCompletion = (character, sessions, goals) => {
        if (!goals) return false;
        
        const today = new Date().toISOString().split('T')[0];
        const todaysSessions = sessions.filter(session => 
            session.date.split('T')[0] === today
        );
        
        const todaysWords = todaysSessions.reduce((sum, session) => sum + session.wordCount, 0);
        const previousTodaysWords = todaysWords - parseInt(wordCount);
        
        return previousTodaysWords < goals.dailyTarget && todaysWords >= goals.dailyTarget;
    };

    const handleSkillAssessment = () => {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            wordCount: parseInt(wordCount),
            sessionMinutes: parseInt(sessionMinutes),
            skillPoints: { ...skillPoints },
            genre: selectedGenre,
            project: selectedProject,
            prompt: usePrompt ? currentPrompt : null,
            notes: sessionNotes.trim() || null,
            writingText: writingText.trim() || null
        };

        let xpGained = Math.floor(parseInt(wordCount) / 10) + Math.floor(parseInt(sessionMinutes) / 2);
        
        // Genre bonus XP
        if (selectedGenre !== 'general') {
            xpGained += Math.floor(xpGained * 0.1); // 10% bonus for specific genres
        }
        
        const character = { ...user.character };
        character.xp += xpGained;
        
        // Level up logic
        while (character.xp >= character.xpToNext) {
            character.xp -= character.xpToNext;
            character.level += 1;
            character.availableStatPoints += 3;
            character.xpToNext = Math.floor(100 * Math.pow(character.level, 1.5));
        }

        // Update skill XP
        if (!character.skillXp) character.skillXp = {};
        Object.entries(skillPoints).forEach(([skill, points]) => {
            if (points > 0) {
                character.skillXp[skill] = (character.skillXp[skill] || 0) + points;
            }
        });

        // Update writing goals progress
        const goals = user.writingGoals ? {
            ...user.writingGoals,
            currentProgress: user.writingGoals.currentProgress + parseInt(wordCount)
        } : null;

        const sessions = [...(user.writingSessions || []), session];
        
        // Check for daily goal completion before updating
        const completedDailyGoal = checkDailyGoalCompletion(character, sessions, goals);
        
        // Update achievement tracking stats
        character.sessionsCompleted = (character.sessionsCompleted || 0) + 1;
        character.totalWordsWritten = (character.totalWordsWritten || 0) + parseInt(wordCount);
        
        if (completedDailyGoal) {
            character.dailyGoalsCompleted = (character.dailyGoalsCompleted || 0) + 1;
            // Bonus rewards for daily goal completion
            character.xp += 25;
            character.inkDrops = (character.inkDrops || 0) + 15;
        }

        // Check if goal is completed
        if (goals && goals.currentProgress >= goals.totalWords && !character.goalsCompleted) {
            character.goalsCompleted = (character.goalsCompleted || 0) + 1;
        }

        updateUser({ 
            character, 
            writingSessions: sessions,
            writingGoals: goals
        });

        // Check for newly unlocked achievements
        checkAndAwardAchievements({
            character,
            writingSessions: sessions,
            writingGoals: goals
        });

        // Reset form
        resetForm();
    };

    const resetForm = () => {
        setWordCount('');
        setSessionMinutes('');
        setSkillPoints({});
        setSessionNotes('');
        setWritingText('');
        setCurrentPrompt('');
        setShowSkillAssessment(false);
        setIsSessionActive(false);
        setSessionStartTime(null);
    };

    const updateSkillPoints = (skill, change) => {
        const newPoints = (skillPoints[skill] || 0) + change;
        if (newPoints >= 0 && (usedSkillPoints - (skillPoints[skill] || 0) + newPoints) <= maxSkillPoints) {
            setSkillPoints(prev => ({
                ...prev,
                [skill]: newPoints
            }));
        }
    };

    const formatTimer = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getSkillLevelDisplay = (skill) => {
        if (!user?.character?.skillXp?.[skill]) return { level: 1, currentXp: 0, xpToNext: 1, progress: 0 };
        const skillData = skillUtils.getSkillLevel(user.character.skillXp[skill]);
        const progress = skillData ? (skillData.currentXp / skillData.xpToNext) * 100 : 0;
        return { ...skillData, progress };
    };

    const getPotentialAchievements = () => {
        if (!wordCount || !sessionMinutes) return [];
        
        const achievements = [];
        const words = parseInt(wordCount);
        const minutes = parseInt(sessionMinutes);
        
        if (words >= 1000) achievements.push("Thousand Words");
        if (minutes >= 180) achievements.push("Marathon Writer");
        if (!user.writingSessions || user.writingSessions.length === 0) achievements.push("First Words");
        
        return achievements;
    };

    const handleDistractionFreeSave = (text, words) => {
        setWritingText(text);
        if (!wordCount) {
            setWordCount(words.toString());
        }
    };

    const handleDistractionFreeExit = () => {
        setShowDistractionFree(false);
        if (isSessionActive) {
            endSession();
        }
    };

    // Show distraction-free mode
    if (showDistractionFree) {
        return (
            <DistractionFreeMode
                onSave={handleDistractionFreeSave}
                onExit={handleDistractionFreeExit}
                initialText={writingText}
                prompt={usePrompt ? currentPrompt : ''}
            />
        );
    }

    // Show skill assessment
    if (showSkillAssessment) {
        const potentialAchievements = getPotentialAchievements();
        
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
                    <h3 className="text-3xl font-bold mb-6 glow-text text-center">Session Assessment</h3>
                    
                    <div className="writing-session-card p-6 rounded-lg mb-8 text-center">
                        <h4 className="text-xl font-semibold mb-4">Session Complete!</h4>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100">{wordCount}</div>
                                <div className="text-fantasy-200">Words Written</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100">{sessionMinutes}m</div>
                                <div className="text-fantasy-200">Time Spent</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100 capitalize">{selectedGenre}</div>
                                <div className="text-fantasy-200">Genre</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100">
                                    {Math.round(parseInt(wordCount) / Math.max(1, parseInt(sessionMinutes)))}
                                </div>
                                <div className="text-fantasy-200">Words/Min</div>
                            </div>
                        </div>
                        
                        {potentialAchievements.length > 0 && (
                            <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-400 rounded-lg">
                                <h5 className="text-yellow-400 font-bold mb-2">🏆 Potential Achievements</h5>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {potentialAchievements.map(achievement => (
                                        <span key={achievement} className="text-yellow-300 text-sm bg-yellow-900/50 px-2 py-1 rounded">
                                            {achievement}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedGenre !== 'general' && (
                            <div className="mt-4 text-sm text-green-400">
                                +10% XP bonus for genre-specific writing!
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold">Allocate Skill XP</h5>
                            <span className="text-fantasy-300">
                                {usedSkillPoints}/{maxSkillPoints} used
                            </span>
                        </div>
                        <div className="w-full bg-fantasy-700 rounded-full h-3 mb-4">
                            <div 
                                className="skill-xp-bar h-3 rounded-full transition-all duration-500"
                                style={{ width: `${(usedSkillPoints / maxSkillPoints) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(WRITING_SKILLS).map(([category, skills]) => (
                            <div key={category}>
                                <h4 className="text-lg font-medium mb-4 capitalize text-fantasy-300 border-b border-fantasy-600 pb-2">
                                    {category} Skills
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {skills.map(skill => {
                                        const skillData = getSkillLevelDisplay(skill);
                                        return (
                                            <div key={skill} className="bg-fantasy-700 p-4 rounded-lg hover:bg-fantasy-600 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{skill}</div>
                                                        <div className="text-xs text-fantasy-400">
                                                            Level {skillData.level} ({skillData.currentXp}/{skillData.xpToNext} XP)
                                                        </div>
                                                        <div className="w-full bg-fantasy-600 rounded-full h-1 mt-1">
                                                            <div 
                                                                className="skill-xp-bar h-1 rounded-full transition-all duration-300"
                                                                style={{ width: `${skillData.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 ml-4">
                                                        <button
                                                            onClick={() => updateSkillPoints(skill, -1)}
                                                            className="w-8 h-8 bg-fantasy-600 hover:bg-fantasy-500 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                                                            disabled={!skillPoints[skill]}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-lg">
                                                            {skillPoints[skill] || 0}
                                                        </span>
                                                        <button
                                                            onClick={() => updateSkillPoints(skill, 1)}
                                                            className="w-8 h-8 bg-fantasy-600 hover:bg-fantasy-500 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                                                            disabled={usedSkillPoints >= maxSkillPoints}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={handleSkillAssessment}
                            className="flex-1 bg-fantasy-600 hover:bg-fantasy-500 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
                        >
                            Complete Session
                        </button>
                        <button
                            onClick={() => setShowSkillAssessment(false)}
                            className="px-8 bg-fantasy-700 hover:bg-fantasy-600 text-white font-bold py-4 rounded-lg transition-colors"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 glow-text"> Writing Session</h2>
                <p className="text-fantasy-300 text-lg">Track your writing with prompts, genres, and productivity insights</p>
            </div>

            {/* Active Session Timer */}
            {isSessionActive && (
                <div className="writing-session-card p-6 rounded-lg timer-glow">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">Session in Progress</h3>
                        <div className="text-6xl font-bold text-fantasy-100 mb-4 font-mono">
                            {formatTimer(currentTimer)}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDistractionFree(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Distraction-Free Mode
                            </button>
                            <button
                                onClick={endSession}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Session Form */}
                <div className="lg:col-span-2 bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
                    <h3 className="text-2xl font-bold mb-6">Writing Session Details</h3>
                    
                    {/* Project and Genre Selection */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-3">Project Type</label>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none"
                                disabled={isSessionActive}
                            >
                                {Object.entries(WRITING_PROJECTS).map(([key, project]) => (
                                    <option key={key} value={key}>{project.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-3">Genre</label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none"
                                disabled={isSessionActive}
                            >
                                <option value="general">General</option>
                                <option value="fantasy">Fantasy</option>
                                <option value="scifi">Science Fiction</option>
                                <option value="contemporary">Contemporary</option>
                                <option value="mystery">Mystery</option>
                                <option value="romance">Romance</option>
                                <option value="horror">Horror</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Word Count and Time */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-3">Words Written</label>
                            <input
                                type="number"
                                value={wordCount}
                                onChange={(e) => setWordCount(e.target.value)}
                                className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none text-lg"
                                placeholder="Enter word count"
                                disabled={isSessionActive}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-3">Session Duration (minutes)</label>
                            <input
                                type="number"
                                value={sessionMinutes}
                                onChange={(e) => setSessionMinutes(e.target.value)}
                                className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none text-lg"
                                placeholder="Enter session length"
                                disabled={isSessionActive}
                            />
                        </div>
                    </div>

                    {/* Session Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">Session Notes (Optional)</label>
                        <textarea
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none"
                            rows="3"
                            placeholder="What did you work on? How did it go? Any insights?"
                            disabled={isSessionActive}
                        />
                    </div>

                    {/* Prompt Toggle */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={usePrompt}
                                onChange={(e) => setUsePrompt(e.target.checked)}
                                className="w-5 h-5"
                                disabled={isSessionActive}
                            />
                            <span>Use writing prompt for inspiration</span>
                        </label>
                    </div>

                    {/* Session Insights */}
                    {wordCount && sessionMinutes && !isSessionActive && (
                        <div className="mt-6 space-y-4">
                            <div className="bg-fantasy-700 p-4 rounded-lg">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-fantasy-100">{maxSkillPoints}</div>
                                        <div className="text-sm text-fantasy-400">Skill XP</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-fantasy-100">
                                            {Math.round(parseInt(wordCount) / parseInt(sessionMinutes))}
                                        </div>
                                        <div className="text-sm text-fantasy-400">Words/Min</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-fantasy-100">
                                            {Math.floor(parseInt(wordCount) / 10) + Math.floor(parseInt(sessionMinutes) / 2)}
                                            {selectedGenre !== 'general' && <span className="text-green-400">+</span>}
                                        </div>
                                        <div className="text-sm text-fantasy-400">Base XP</div>
                                    </div>
                                </div>
                            </div>
                            
                            {getPotentialAchievements().length > 0 && (
                                <div className="bg-yellow-900/20 border border-yellow-400/50 p-4 rounded-lg">
                                    <h4 className="text-yellow-400 font-bold mb-2">🏆 Potential Achievement Unlocks</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getPotentialAchievements().map(achievement => (
                                            <span key={achievement} className="text-yellow-300 text-sm bg-yellow-900/50 px-2 py-1 rounded">
                                                {achievement}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        {!isSessionActive ? (
                            <>
                                <button
                                    onClick={startSession}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                                >
                                    Start Session
                                </button>
                                <button
                                    onClick={() => setShowDistractionFree(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                                >
                                    Distraction-Free Mode
                                </button>
                                <button
                                    onClick={handleCompleteSession}
                                    disabled={!wordCount || !sessionMinutes}
                                    className="flex-1 bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
                                >
                                    Complete Session
                                </button>
                            </>
                        ) : (
                            <div className="w-full text-center text-fantasy-300 p-4 bg-fantasy-700 rounded-lg">
                                Session is active. Fill in details after ending the session.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Writing Prompts */}
                    {usePrompt && (
                        <WritingPrompts
                            selectedGenre={selectedGenre}
                            onPromptSelect={setCurrentPrompt}
                        />
                    )}

                    {/* Project Info */}
                    <div className="bg-fantasy-700 p-4 rounded-lg border border-fantasy-600">
                        <h4 className="font-bold text-fantasy-200 mb-3">Project Info</h4>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-fantasy-400">Type:</span>
                                <span className="ml-2 font-medium">{WRITING_PROJECTS[selectedProject]?.name}</span>
                            </div>
                            <div>
                                <span className="text-fantasy-400">Target:</span>
                                <span className="ml-2 font-medium">{WRITING_PROJECTS[selectedProject]?.minWords.toLocaleString()} words</span>
                            </div>
                            <p className="text-fantasy-300 text-xs mt-2">
                                {WRITING_PROJECTS[selectedProject]?.description}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-fantasy-700 p-4 rounded-lg border border-fantasy-600">
                        <h4 className="font-bold text-fantasy-200 mb-3">Today's Progress</h4>
                        {(() => {
                            const today = new Date().toISOString().split('T')[0];
                            const todaysSessions = user?.writingSessions?.filter(session => 
                                session.date.split('T')[0] === today
                            ) || [];
                            const todaysWords = todaysSessions.reduce((sum, session) => sum + session.wordCount, 0);
                            const dailyTarget = user?.writingGoals?.dailyTarget || 0;
                            
                            return (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-fantasy-400">Words:</span>
                                        <span className="font-bold">{todaysWords.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-fantasy-400">Sessions:</span>
                                        <span className="font-bold">{todaysSessions.length}</span>
                                    </div>
                                    {dailyTarget > 0 && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Daily Goal</span>
                                                <span>{todaysWords}/{dailyTarget}</span>
                                            </div>
                                            <div className="w-full bg-fantasy-600 rounded-full h-2">
                                                <div
                                                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min((todaysWords / dailyTarget) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};