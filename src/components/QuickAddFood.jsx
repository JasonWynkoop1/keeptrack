import React from 'react';
import { Button } from './ui/button';

// Common foods with their nutrition information
const commonFoods = [
  {
    name: 'Apple',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    barcode: 'quick-apple',
  },
  {
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    barcode: 'quick-banana',
  },
  {
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    barcode: 'quick-chicken',
  },
  {
    name: 'Egg',
    calories: 155,
    protein: 12.6,
    carbs: 1.1,
    fat: 10.6,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    barcode: 'quick-egg',
  },
  {
    name: 'Rice',
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    barcode: 'quick-rice',
  },
  {
    name: 'Bread',
    calories: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
    servingSize: '100g',
    quantity: 100,
    unit: 'g',
    barcode: 'quick-bread',
  },
];

/**
 * QuickAddFood component for quickly adding common foods
 * @param {Function} onAddFood - Callback function to add food to the list
 * @param {boolean} isMobile - Whether the component is being rendered on a mobile device
 */
const QuickAddFood = ({ onAddFood, isMobile }) => {
  const handleQuickAdd = (food) => {
    onAddFood(food);
  };

  // Mobile UI
  if (isMobile) {
    return (
      <div className="quick-add-section">
        <h3 className="text-center text-primary font-medium mb-3">Quick Add Common Foods</h3>
        <div className="grid grid-cols-2 gap-2">
          {commonFoods.map((food) => (
            <button
              key={food.barcode}
              className="quick-add-btn"
              onClick={() => handleQuickAdd(food)}
            >
              <span className="food-name">{food.name}</span>
              <span className="food-calories">{food.calories} kcal</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop UI
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3 text-center">Quick Add Common Foods</h3>
      <div className="grid grid-cols-3 gap-3">
        {commonFoods.map((food) => (
          <Button
            key={food.barcode}
            variant="outline"
            className="flex flex-col items-center justify-center h-20 hover:bg-primary/5 hover:border-primary/30 transition-all"
            onClick={() => handleQuickAdd(food)}
          >
            <span className="font-medium">{food.name}</span>
            <span className="text-sm text-muted-foreground">{food.calories} kcal</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickAddFood;