import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

/**
 * ManualEntryForm component for desktop users to manually enter food nutrition data
 * @param {Function} onAddFood - Callback function to add food to the list
 */
const ManualEntryForm = ({ onAddFood }) => {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '100g',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }
    
    if (!formData.calories || isNaN(formData.calories) || Number(formData.calories) < 0) {
      newErrors.calories = 'Valid calories value is required';
    }
    
    if (!formData.protein || isNaN(formData.protein) || Number(formData.protein) < 0) {
      newErrors.protein = 'Valid protein value is required';
    }
    
    if (!formData.carbs || isNaN(formData.carbs) || Number(formData.carbs) < 0) {
      newErrors.carbs = 'Valid carbs value is required';
    }
    
    if (!formData.fat || isNaN(formData.fat) || Number(formData.fat) < 0) {
      newErrors.fat = 'Valid fat value is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert string values to numbers for numeric fields
      const foodItem = {
        ...formData,
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        carbs: parseFloat(formData.carbs),
        fat: parseFloat(formData.fat),
        // Generate a random ID to simulate a barcode
        barcode: `manual-${Date.now()}`,
      };
      
      onAddFood(foodItem);
      
      // Reset form
      setFormData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        servingSize: '100g',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Add Food Manually</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Food Name</Label>
            <Input 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Apple, Chicken Breast"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories (kcal)</Label>
              <Input 
                id="calories"
                name="calories"
                type="number"
                min="0"
                step="any"
                value={formData.calories}
                onChange={handleChange}
                placeholder="0"
              />
              {errors.calories && <p className="text-sm text-destructive">{errors.calories}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servingSize">Serving Size</Label>
              <Input 
                id="servingSize"
                name="servingSize"
                value={formData.servingSize}
                onChange={handleChange}
                placeholder="100g"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input 
                id="protein"
                name="protein"
                type="number"
                min="0"
                step="any"
                value={formData.protein}
                onChange={handleChange}
                placeholder="0"
              />
              {errors.protein && <p className="text-sm text-destructive">{errors.protein}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input 
                id="carbs"
                name="carbs"
                type="number"
                min="0"
                step="any"
                value={formData.carbs}
                onChange={handleChange}
                placeholder="0"
              />
              {errors.carbs && <p className="text-sm text-destructive">{errors.carbs}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input 
                id="fat"
                name="fat"
                type="number"
                min="0"
                step="any"
                value={formData.fat}
                onChange={handleChange}
                placeholder="0"
              />
              {errors.fat && <p className="text-sm text-destructive">{errors.fat}</p>}
            </div>
          </div>
          
          <CardFooter className="px-0 pt-4 flex justify-end">
            <Button type="submit">Add Food</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualEntryForm;