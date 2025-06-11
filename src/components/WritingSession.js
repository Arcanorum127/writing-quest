import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { WRITING_SKILLS } from '../data';
import { skillUtils } from '../utils';

export const WritingSession = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [wordCount, setWordCount] = useState('');
    const [sessionMinutes, setSessionMinutes] = useState('');
    const [skillPoints, setSkillPoints] = useState({});
    const [showSkillAssessment, setShowSkillAssessment] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [currentTimer, setCurrentTimer] = useState(0);
    const { user, updateUser } = useAuth();

    const calculateSkillPoints = (words, minutes) => {
        const basePoints = Math.floor(words / 500);
        const timeBonus = Math.floor(Math.min(minutes, 120) / 60);
        return basePoints + timeBonus;
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

    const handleSkillAssessment = () => {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            wordCount: parseInt(wordCount),
            sessionMinutes: parseInt(sessionMinutes),
            skillPoints: { ...skillPoints }
        };

        let xpGained = Math.floor(parseInt(wordCount) / 10) + Math.floor(parseInt(sessionMinutes) / 2);
        
        const character = { ...user.character };
        character.xp += xpGained;
        
        while (character.xp >= character.xpToNext) {
            character.xp -= character.xpToNext;
            character.level += 1;
            character.availableStatPoints += 3;
            character.xpToNext = Math.floor(100 * Math.pow(character.level, 1.5));
        }

        if (!character.skillXp) character.skillXp = {};
        Object.entries(skillPoints).forEach(([skill, points]) => {
            if (points > 0) {
                character.skillXp[skill] = (character.skillXp[skill] || 0) + points;
            }
        });

        const goals = user.writingGoals ? {
            ...user.writingGoals,
            currentProgress: user.writingGoals.currentProgress + parseInt(wordCount)
        } : null;

        const sessions = [...(user.writingSessions || []), session];
        updateUser({ 
            character, 
            writingSessions: sessions,
            writingGoals: goals
        });

        setWordCount('');
        setSessionMinutes('');
        setSkillPoints({});
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

    if (showSkillAssessment) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
                    <h3 className="text-3xl font-bold mb-6 glow-text text-center">Skill Assessment</h3>
                    
                    <div className="writing-session-card p-6 rounded-lg mb-8 text-center">
                        <h4 className="text-xl font-semibold mb-4">Session Complete!</h4>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100">{wordCount}</div>
                                <div className="text-fantasy-200">Words Written</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100">{sessionMinutes}</div>
                                <div className="text-fantasy-200">Minutes Spent</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-fantasy-100">
                                    {Math.round(parseInt(wordCount) / Math.max(1, parseInt(sessionMinutes)))}
                                </div>
                                <div className="text-fantasy-200">Words/Minute</div>
                            </div>
                        </div>
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 glow-text">Writing Session</h2>
                <p className="text-fantasy-300 text-lg">Track your writing progress and build your skills</p>
            </div>

            {isSessionActive && (
                <div className="writing-session-card p-6 rounded-lg timer-glow">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">Session in Progress</h3>
                        <div className="text-6xl font-bold text-fantasy-100 mb-4 font-mono">
                            {formatTimer(currentTimer)}
                        </div>
                        <div className="flex justify-center gap-4">
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

            <div className="bg-fantasy-800 p-8 rounded-lg border border-fantasy-600">
                <h3 className="text-2xl font-bold mb-6">Log Your Writing Session</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
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

                {wordCount && sessionMinutes && !isSessionActive && (
                    <div className="mt-6 bg-fantasy-700 p-4 rounded-lg">
                        <p className="text-fantasy-200">
                            This session will give you <span className="font-bold text-fantasy-100">{maxSkillPoints}</span> skill XP to allocate across your writing skills.
                        </p>
                        <p className="text-fantasy-400 text-sm mt-2">
                            Skill XP is earned based on words written ({Math.floor(parseInt(wordCount) / 500)} XP) plus time bonus ({Math.floor(Math.min(parseInt(sessionMinutes), 120) / 60)} XP).
                        </p>
                    </div>
                )}

                <div className="flex gap-4 mt-8">
                    {!isSessionActive ? (
                        <>
                            <button
                                onClick={startSession}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                            >
                                Start Timer
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
        </div>
    );
};