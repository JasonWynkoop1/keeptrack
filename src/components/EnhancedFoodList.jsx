import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

/**
 * EnhancedFoodList component for displaying the list of tracked foods in a more visually appealing way
 * @param {Array} foods - Array of food items
 * @param {Function} onRemoveFood - Callback function to remove a food from the list
 */
const EnhancedFoodList = ({ foods, onRemoveFood }) => {
  if (foods.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Food List</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          No foods added yet. Add some foods to see them here.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Food List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {foods.map((food, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium">{food.name}</h3>
                <div className="text-sm text-muted-foreground">
                  <span className="inline-block mr-3">{food.calories} kcal</span>
                  <span className="inline-block mr-3 text-secondary">P: {food.protein}g</span>
                  <span className="inline-block mr-3">C: {food.carbs}g</span>
                  <span className="inline-block">F: {food.fat}g</span>
                </div>
                {food.servingSize && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Serving: {food.servingSize}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveFood(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFoodList;