// src/components/GoalSetting.js - REPLACE COMPLETELY
import React, { useState } from 'react';
import { useAuth } from '../App';
import { GOAL_TEMPLATES } from '../data';
import { EnhancedGoalDisplay } from './EnhancedGoalTracking';

export const GoalSetting = () => {
    const [wordGoal, setWordGoal] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [availableDays, setAvailableDays] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
    });
    const { user, updateUser } = useAuth();

    // If user has writing goals, show enhanced display instead
    if (user?.writingGoals) {
        return <EnhancedGoalDisplay />;
    }

    const handleTemplateSelect = (templateKey) => {
        const template = GOAL_TEMPLATES[templateKey];
        setSelectedTemplate(templateKey);
        setWordGoal(template.words.toString());
        
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + template.days);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleSetGoal = () => {
        if (!wordGoal || !startDate || !endDate) return;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let availableWritingDays = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayName = dayNames[d.getDay()];
            if (availableDays[dayName]) {
                availableWritingDays++;
            }
        }
        const dailyTarget = Math.ceil(parseInt(wordGoal) / availableWritingDays);

        const goals = {
            totalWords: parseInt(wordGoal),
            startDate,
            endDate,
            availableDays,
            dailyTarget,
            availableWritingDays,
            currentProgress: 0,
            template: selectedTemplate,
            name: selectedTemplate ? GOAL_TEMPLATES[selectedTemplate].name : 'Custom Writing Goal'
        };

        updateUser({ writingGoals: goals });
    };

    const toggleDay = (day) => {
        setAvailableDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 glow-text">Set Your Writing Quest</h2>
                <p className="text-fantasy-300 text-lg">Choose a goal that will challenge and motivate you to write consistently</p>
            </div>

            <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                <h3 className="text-xl font-bold mb-6 text-center">Quest Templates</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(GOAL_TEMPLATES).map(([key, template]) => (
                        <div
                            key={key}
                            onClick={() => handleTemplateSelect(key)}
                            className={`goal-template-card p-6 rounded-lg border-2 cursor-pointer ${
                                selectedTemplate === key
                                    ? 'border-fantasy-300 shadow-lg shadow-fantasy-500/20'
                                    : 'border-fantasy-600 hover:border-fantasy-400'
                            }`}
                        >
                            <div className="text-center">
                                <h4 className="font-bold text-fantasy-200 mb-2">{template.name}</h4>
                                <div className="text-sm text-fantasy-300 mb-3">
                                    <div className="font-semibold">{template.words.toLocaleString()} words</div>
                                    <div>{template.days} days</div>
                                </div>
                                <div className={`text-xs px-3 py-1 rounded-full inline-block ${
                                    template.difficulty === 'Easy' ? 'bg-green-600' :
                                    template.difficulty === 'Moderate' ? 'bg-yellow-600' :
                                    template.difficulty === 'Hard' ? 'bg-orange-600' : 'bg-red-600'
                                }`}>
                                    {template.difficulty}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-fantasy-800 p-6 rounded-lg border border-fantasy-600">
                <h3 className="text-xl font-bold mb-6">Customize Your Quest</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-3">Total Word Goal</label>
                        <input
                            type="number"
                            value={wordGoal}
                            onChange={(e) => setWordGoal(e.target.value)}
                            className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none text-lg"
                            placeholder="e.g., 50000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-3">Estimated Daily Target</label>
                        <div className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg text-lg text-fantasy-300">
                            {wordGoal && startDate && endDate ? (
                                (() => {
                                    const start = new Date(startDate);
                                    const end = new Date(endDate);
                                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                    let availableWritingDays = 0;
                                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                                        const dayName = dayNames[d.getDay()];
                                        if (availableDays[dayName]) {
                                            availableWritingDays++;
                                        }
                                    }
                                    return availableWritingDays > 0 ? Math.ceil(parseInt(wordGoal) / availableWritingDays).toLocaleString() : '0';
                                })()
                            ) : '0'} words/day
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block text-sm font-medium mb-3">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-3">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-4 bg-fantasy-700 border border-fantasy-500 rounded-lg focus:border-fantasy-300 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium mb-4">Available Writing Days</label>
                    <div className="grid grid-cols-7 gap-3">
                        {Object.entries(availableDays).map(([day, isAvailable]) => (
                            <button
                                key={day}
                                onClick={() => toggleDay(day)}
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                    isAvailable
                                        ? 'bg-fantasy-600 text-white border-2 border-fantasy-300'
                                        : 'bg-fantasy-700 text-fantasy-300 border-2 border-fantasy-600'
                                }`}
                            >
                                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleSetGoal}
                        disabled={!wordGoal || !startDate || !endDate}
                        className="bg-fantasy-600 hover:bg-fantasy-500 disabled:bg-fantasy-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
                    >
                        Launch Quest
                    </button>
                </div>
            </div>
        </div>
    );
};