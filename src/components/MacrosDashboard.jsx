import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Droplets } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * MacrosDashboard component for displaying nutrition information in a visually appealing way
 * @param {Array} foods - Array of food items
 * @param {number} waterIntake - Current water intake in ml
 * @param {number} waterGoal - Water intake goal in ml
 * @param {Function} updateWaterIntake - Function to update water intake
 * @param {Object} nutritionGoals - Nutrition goals (calories, protein, carbs, fat)
 */
const MacrosDashboard = ({ 
  foods, 
  waterIntake = 0, 
  waterGoal = 2000, 
  updateWaterIntake,
  nutritionGoals = { calories: 2000, protein: 25, carbs: 50, fat: 25 }
}) => {
  // Calculate totals
  const totals = foods.reduce(
    (acc, food) => {
      return {
        calories: acc.calories + (food.calories || 0),
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Calculate macronutrient percentages
  const totalMacros = totals.protein + totals.carbs + totals.fat;
  const macroPercentages = {
    protein: totalMacros > 0 ? (totals.protein / totalMacros) * 100 : 0,
    carbs: totalMacros > 0 ? (totals.carbs / totalMacros) * 100 : 0,
    fat: totalMacros > 0 ? (totals.fat / totalMacros) * 100 : 0,
  };

  // Calculate calorie breakdown
  const calorieBreakdown = {
    protein: totals.protein * 4, // 4 calories per gram of protein
    carbs: totals.carbs * 4,     // 4 calories per gram of carbs
    fat: totals.fat * 9,         // 9 calories per gram of fat
  };

  // Calculate water intake percentage
  const waterPercentage = Math.min(100, (waterIntake / waterGoal) * 100);

  // Prepare data for the pie chart
  const preparePieChartData = () => {
    return {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [
        {
          data: [totals.protein, totals.carbs, totals.fat],
          backgroundColor: [
            'rgba(147, 51, 234, 0.7)',  // Purple for protein
            'rgba(59, 130, 246, 0.7)',  // Blue for carbs
            'rgba(239, 68, 68, 0.7)',   // Red for fat
          ],
          borderColor: [
            'rgba(147, 51, 234, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value.toFixed(1)}g (${percentage}%)`;
          }
        }
      }
    },
  };

  // Water intake display component
  const WaterIntakeCard = () => (
    <Card className="w-full mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          <span>Water Intake</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{waterIntake}ml / {waterGoal}ml</span>
            <span className="text-sm text-muted-foreground">{waterPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${waterPercentage}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-4 justify-between">
            <div className="space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => updateWaterIntake(250)}
                className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
              >
                +250ml
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => updateWaterIntake(500)}
                className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
              >
                +500ml
              </Button>
            </div>
            <div className="space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => updateWaterIntake(-250)}
                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
              >
                -250ml
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => waterIntake > 0 ? updateWaterIntake(-waterIntake) : null}
                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (foods.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            No foods added yet.
          </CardContent>
        </Card>
        <WaterIntakeCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Today's Nutrition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium text-primary">Calories</h3>
              <p className="text-3xl font-bold">{totals.calories.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">kcal</p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium text-secondary">Protein</h3>
              <p className="text-3xl font-bold">{totals.protein.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">g</p>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium">Carbs</h3>
              <p className="text-3xl font-bold">{totals.carbs.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">g</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium">Fat</h3>
              <p className="text-3xl font-bold">{totals.fat.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WaterIntakeCard />

      <Tabs defaultValue="macroRatio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="macroRatio">Macros %</TabsTrigger>
          <TabsTrigger value="calorieBreakdown">Calories</TabsTrigger>
          <TabsTrigger value="pieChart">Pie Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="macroRatio">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm text-muted-foreground">{macroPercentages.protein.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary" 
                    style={{ width: `${macroPercentages.protein}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm text-muted-foreground">{macroPercentages.carbs.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${macroPercentages.carbs}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fat</span>
                  <span className="text-sm text-muted-foreground">{macroPercentages.fat.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${macroPercentages.fat}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calorieBreakdown">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Protein ({calorieBreakdown.protein.toFixed(0)} kcal)</span>
                  <span className="text-sm text-muted-foreground">
                    {totals.calories > 0 ? ((calorieBreakdown.protein / totals.calories) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary" 
                    style={{ width: `${totals.calories > 0 ? (calorieBreakdown.protein / totals.calories) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Carbs ({calorieBreakdown.carbs.toFixed(0)} kcal)</span>
                  <span className="text-sm text-muted-foreground">
                    {totals.calories > 0 ? ((calorieBreakdown.carbs / totals.calories) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${totals.calories > 0 ? (calorieBreakdown.carbs / totals.calories) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fat ({calorieBreakdown.fat.toFixed(0)} kcal)</span>
                  <span className="text-sm text-muted-foreground">
                    {totals.calories > 0 ? ((calorieBreakdown.fat / totals.calories) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${totals.calories > 0 ? (calorieBreakdown.fat / totals.calories) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pieChart">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">Macronutrient Distribution</h3>
                <p className="text-sm text-muted-foreground">
                  {totalMacros > 0 
                    ? `Protein: ${totals.protein.toFixed(1)}g | Carbs: ${totals.carbs.toFixed(1)}g | Fat: ${totals.fat.toFixed(1)}g` 
                    : 'Add food to see your macro distribution'}
                </p>
              </div>

              <div className="h-64 w-full">
                {totalMacros > 0 ? (
                  <Pie data={preparePieChartData()} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data to display</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Calorie Goal</span>
                  <span className="text-sm font-medium">{nutritionGoals.calories} kcal</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Current Calories</span>
                  <span className="text-sm font-medium">{totals.calories.toFixed(0)} kcal</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${Math.min(100, (totals.calories / nutritionGoals.calories) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {Math.max(0, (nutritionGoals.calories - totals.calories).toFixed(0))} kcal remaining
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MacrosDashboard;
