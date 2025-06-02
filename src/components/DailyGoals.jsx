import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * DailyGoals component for setting and displaying daily nutrition goals
 * @param {Object} totals - The current nutrition totals
 */
const DailyGoals = ({ totals }) => {
  // Default goals based on a 2000 calorie diet
  const defaultGoals = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 70
  };

  // Load saved goals from localStorage or use defaults
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('nutritionGoals');
    return savedGoals ? JSON.parse(savedGoals) : defaultGoals;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(goals);

  // Calculate percentages of goals achieved
  const percentages = {
    calories: goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0,
    protein: goals.protein > 0 ? (totals.protein / goals.protein) * 100 : 0,
    carbs: goals.carbs > 0 ? (totals.carbs / goals.carbs) * 100 : 0,
    fat: goals.fat > 0 ? (totals.fat / goals.fat) * 100 : 0
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGoals(formData);
    localStorage.setItem('nutritionGoals', JSON.stringify(formData));
    setIsEditing(false);
  };

  // Get color based on percentage
  const getColorClass = (percentage) => {
    if (percentage <= 25) return 'bg-blue-500';
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 75) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-center flex-1">Daily Goals</CardTitle>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-primary hover:text-primary/80"
          >
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calories">Calories (kcal)</Label>
                <Input 
                  id="calories"
                  name="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protein">Protein (g)</Label>
                <Input 
                  id="protein"
                  name="protein"
                  type="number"
                  min="0"
                  value={formData.protein}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input 
                  id="carbs"
                  name="carbs"
                  type="number"
                  min="0"
                  value={formData.carbs}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat">Fat (g)</Label>
                <Input 
                  id="fat"
                  name="fat"
                  type="number"
                  min="0"
                  value={formData.fat}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Goals</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">
                  {totals.calories.toFixed(0)} / {goals.calories} kcal ({percentages.calories.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getColorClass(percentages.calories)}`} 
                  style={{ width: `${Math.min(percentages.calories, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">
                  {totals.protein.toFixed(1)} / {goals.protein} g ({percentages.protein.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getColorClass(percentages.protein)}`} 
                  style={{ width: `${Math.min(percentages.protein, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm text-muted-foreground">
                  {totals.carbs.toFixed(1)} / {goals.carbs} g ({percentages.carbs.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getColorClass(percentages.carbs)}`} 
                  style={{ width: `${Math.min(percentages.carbs, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fat</span>
                <span className="text-sm text-muted-foreground">
                  {totals.fat.toFixed(1)} / {goals.fat} g ({percentages.fat.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getColorClass(percentages.fat)}`} 
                  style={{ width: `${Math.min(percentages.fat, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyGoals;