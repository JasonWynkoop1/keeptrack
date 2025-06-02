import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Array of nutrition tips
const tips = [
  {
    title: "Stay Hydrated",
    content: "Drink at least 8 glasses of water daily. Water helps with digestion, nutrient absorption, and can help control hunger."
  },
  {
    title: "Eat Colorful Foods",
    content: "Include a variety of colorful fruits and vegetables in your diet to ensure you're getting a wide range of nutrients."
  },
  {
    title: "Portion Control",
    content: "Use smaller plates to help control portion sizes. This simple trick can help prevent overeating."
  },
  {
    title: "Protein Timing",
    content: "Consume protein within 30 minutes after a workout to help with muscle recovery and growth."
  },
  {
    title: "Healthy Fats",
    content: "Include sources of healthy fats like avocados, nuts, and olive oil in your diet for heart health and satiety."
  },
  {
    title: "Fiber Intake",
    content: "Aim for 25-30g of fiber daily for digestive health and to help maintain steady blood sugar levels."
  },
  {
    title: "Meal Planning",
    content: "Plan your meals ahead of time to avoid unhealthy food choices when you're hungry or busy."
  },
  {
    title: "Mindful Eating",
    content: "Eat slowly and without distractions to help recognize your body's hunger and fullness signals."
  },
  {
    title: "Balanced Meals",
    content: "Include protein, complex carbs, and healthy fats in each meal for balanced nutrition and sustained energy."
  },
  {
    title: "Limit Added Sugars",
    content: "Reduce consumption of foods with added sugars, which can contribute to weight gain and health issues."
  }
];

/**
 * NutritionTips component for displaying helpful nutrition tips
 */
const NutritionTips = () => {
  const [currentTip, setCurrentTip] = useState(0);

  // Change tip every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Get next tip
  const nextTip = () => {
    setCurrentTip(prev => (prev + 1) % tips.length);
  };

  // Get previous tip
  const prevTip = () => {
    setCurrentTip(prev => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Nutrition Tip</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 relative min-h-[150px]">
          <h3 className="text-lg font-medium text-primary mb-2">{tips[currentTip].title}</h3>
          <p className="text-muted-foreground">{tips[currentTip].content}</p>
          
          <div className="flex justify-between mt-4">
            <button 
              onClick={prevTip}
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="Previous tip"
            >
              ← Previous
            </button>
            <span className="text-sm text-muted-foreground">
              {currentTip + 1} / {tips.length}
            </span>
            <button 
              onClick={nextTip}
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="Next tip"
            >
              Next →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionTips;