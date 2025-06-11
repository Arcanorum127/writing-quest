import React from 'react';
import { ProductivityInsights } from './ProductivityInsights';

export const Analytics = () => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 glow-text">📊 Writing Analytics</h2>
                <p className="text-fantasy-300 text-lg">
                    Discover your writing patterns and optimize your productivity
                </p>
            </div>
            
            <ProductivityInsights />
        </div>
    );
};
