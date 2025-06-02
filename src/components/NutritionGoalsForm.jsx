import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Component for setting nutrition goals (calories and macros)
 * @param {Object} nutritionGoals - Current nutrition goals
 * @param {Function} onSaveGoals - Function to save updated goals
 */
const NutritionGoalsForm = ({ nutritionGoals, onSaveGoals }) => {
  const [goals, setGoals] = useState({
    calories: nutritionGoals.calories || 2000,
    protein: nutritionGoals.protein || 25,
    carbs: nutritionGoals.carbs || 50,
    fat: nutritionGoals.fat || 25
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const validateGoals = () => {
    // Ensure macro percentages add up to 100%
    const totalMacroPercentage = goals.protein + goals.carbs + goals.fat;
    
    if (totalMacroPercentage !== 100) {
      setError(`Macro percentages must add up to 100%. Current total: ${totalMacroPercentage}%`);
      return false;
    }
    
    if (goals.calories <= 0) {
      setError('Calorie goal must be greater than 0');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateGoals()) {
      onSaveGoals(goals);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="calories">Daily Calorie Goal</Label>
            <Input
              id="calories"
              name="calories"
              type="number"
              value={goals.calories}
              onChange={handleChange}
              min="0"
              step="50"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Macro Percentages (must add up to 100%)</Label>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="protein">Protein %</Label>
                <Input
                  id="protein"
                  name="protein"
                  type="number"
                  value={goals.protein}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <Label htmlFor="carbs">Carbs %</Label>
                <Input
                  id="carbs"
                  name="carbs"
                  type="number"
                  value={goals.carbs}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <Label htmlFor="fat">Fat %</Label>
                <Input
                  id="fat"
                  name="fat"
                  type="number"
                  value={goals.fat}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          
          <Button type="submit" className="w-full">
            Save Goals
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NutritionGoalsForm;