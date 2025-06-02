import { useState, useEffect, useCallback } from 'react';
import { searchProducts, calculateNutrition } from '../services/nutritionService';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';

/**
 * FoodSearch component for searching foods by name and selecting portion sizes
 * @param {Function} onAddFood - Callback function to add food to the list
 * @param {boolean} isMobile - Whether the component is being rendered on a mobile device
 */
const FoodSearch = ({ onAddFood, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchStatus, setSearchStatus] = useState(''); // To provide more detailed status updates

  // Clear results when search query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setError('Please enter a food name to search');
      return;
    }

    setLoading(true);
    setError('');
    setSearchStatus('Searching for foods...');

    try {
      // Set a timeout to provide feedback if the search is taking too long
      // Reduced to 3 seconds since API timeout is now 5 seconds
      const timeoutId = setTimeout(() => {
        setSearchStatus('Search is taking longer than expected. Still trying...');
      }, 3000);

      // Track if the result is from cache
      let isCached = false;
      // Add a listener for console logs to detect cached results
      const originalConsoleLog = console.log;
      console.log = function(message, ...args) {
        originalConsoleLog.apply(console, [message, ...args]);
        if (typeof message === 'string' && 
            (message.includes('Returning cached search results') || 
             message.includes('Returning cached USDA results'))) {
          isCached = true;
        }
      };

      const response = await searchProducts(query);

      // Restore original console.log
      console.log = originalConsoleLog;

      // Clear the timeout
      clearTimeout(timeoutId);

      // Handle the standardized response format
      if (response.error) {
        setError(`${response.error.message}: ${response.error.details}`);
        setSearchResults([]);
      } else {
        // Set search results from the foods array
        const foods = response.foods || [];
        setSearchResults(foods);

        // Show a different status message if results came from cache
        if (isCached) {
          setSearchStatus('Results loaded from cache');
          // Clear the cache message after 2 seconds
          setTimeout(() => {
            if (setSearchStatus) {
              setSearchStatus('');
            }
          }, 2000);
        } else {
          setSearchStatus('');
        }

        if (foods.length === 0) {
          setError('No foods found matching your search');
        }
      }
    } catch (err) {
      if (err.message === 'timeout of 5000ms exceeded') {
        setError('Search timed out. Please try again or try a different search term.');
      } else if (err.response && err.response.status) {
        setError(`Server error (${err.response.status}): Please try again later.`);
      } else if (err.request) {
        setError('Network error: Please check your internet connection.');
      } else {
        setError('Error searching for foods: ' + (err.message || 'Please try again.'));
      }
      console.error('Search error:', err);
      setSearchStatus('');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search as you type with debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounceTimeout = setTimeout(() => {
        performSearch(searchQuery);
      }, 800); // Increased from 500ms to 800ms to reduce API calls

      return () => clearTimeout(debounceTimeout);
    }
  }, [searchQuery, performSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setQuantity('100');
    setUnit(food.unit || 'g');
  };

  const handleAddFood = () => {
    if (selectedFood) {
      // Calculate nutrition based on selected quantity
      const adjustedFood = calculateNutrition(
        selectedFood, 
        parseFloat(quantity), 
        unit
      );

      onAddFood(adjustedFood);

      // Only reset the selected food and portion settings, keep search query and results
      setSelectedFood(null);
      setQuantity('100');
      setUnit('g');
    }
  };

  // Mobile UI
  if (isMobile) {
    return (
      <div className="food-search">
        <h2>Search Foods</h2>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter food name (e.g., apple, chicken)"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          {loading && searchStatus && <p className="text-sm text-primary mt-2">{searchStatus}</p>}
        </form>

        {loading && !searchResults.length && !selectedFood && (
          <div className="p-4 bg-muted/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Searching for "{searchQuery}"...</p>
            <div className="flex justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-medium mb-2">Results</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((food, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                  onClick={() => handleSelectFood(food)}
                >
                  <h4 className="font-medium">{food.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-block mr-3">{food.calories} kcal</span>
                    <span className="inline-block mr-3 text-secondary">P: {food.protein}g</span>
                    <span className="inline-block mr-3">C: {food.carbs}g</span>
                    <span className="inline-block">F: {food.fat}g</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Source: {food.source || 'Database'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFood && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Selected: {selectedFood.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-quantity">Quantity</Label>
                  <Input
                    id="mobile-quantity"
                    type="number"
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-unit">Unit</Label>
                  <select 
                    id="mobile-unit"
                    value={unit} 
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="g">grams (g)</option>
                    <option value="ml">milliliters (ml)</option>
                    <option value="oz">ounces (oz)</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tablespoon</option>
                    <option value="tsp">teaspoon</option>
                    <option value="serving">serving</option>
                  </select>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Nutrition for {quantity}{unit}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Calories: </span>
                    <span className="font-medium">
                      {calculateNutrition(selectedFood, parseFloat(quantity), unit).calories} kcal
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Protein: </span>
                    <span className="font-medium">
                      {calculateNutrition(selectedFood, parseFloat(quantity), unit).protein}g
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Carbs: </span>
                    <span className="font-medium">
                      {calculateNutrition(selectedFood, parseFloat(quantity), unit).carbs}g
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Fat: </span>
                    <span className="font-medium">
                      {calculateNutrition(selectedFood, parseFloat(quantity), unit).fat}g
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFood(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddFood}
              >
                Add to Tracker
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  }

  // Desktop UI
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food-search">Search for a food</Label>
            <div className="flex space-x-2">
              <Input
                id="food-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter food name (e.g., apple, chicken)"
                className="flex-1"
              />
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {loading && searchStatus && <p className="text-sm text-primary mt-2">{searchStatus}</p>}
          </div>
        </form>

        {loading && !searchResults.length && !selectedFood && (
          <div className="mt-6 p-4 bg-muted/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Searching for "{searchQuery}"...</p>
            <div className="flex justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-medium">Results</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((food, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-muted/40 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer"
                  onClick={() => handleSelectFood(food)}
                >
                  <h4 className="font-medium">{food.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    <span className="inline-block mr-3">{food.calories} kcal</span>
                    <span className="inline-block mr-3 text-secondary">P: {food.protein}g</span>
                    <span className="inline-block mr-3">C: {food.carbs}g</span>
                    <span className="inline-block">F: {food.fat}g</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Source: {food.source || 'Database'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFood && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Selected: {selectedFood.name}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <select 
                  id="unit"
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="g">grams (g)</option>
                  <option value="ml">milliliters (ml)</option>
                  <option value="oz">ounces (oz)</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tablespoon</option>
                  <option value="tsp">teaspoon</option>
                  <option value="serving">serving</option>
                </select>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Nutrition for {quantity}{unit}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Calories: </span>
                  <span className="font-medium">
                    {calculateNutrition(selectedFood, parseFloat(quantity), unit).calories} kcal
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Protein: </span>
                  <span className="font-medium">
                    {calculateNutrition(selectedFood, parseFloat(quantity), unit).protein}g
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Carbs: </span>
                  <span className="font-medium">
                    {calculateNutrition(selectedFood, parseFloat(quantity), unit).carbs}g
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Fat: </span>
                  <span className="font-medium">
                    {calculateNutrition(selectedFood, parseFloat(quantity), unit).fat}g
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFood(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddFood}
              >
                Add to Tracker
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FoodSearch;
