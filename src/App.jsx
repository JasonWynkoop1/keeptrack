import { useState, useEffect } from '../node_modules/react/index.js'
import './App.css'
import BarcodeScanner from './components/BarcodeScanner'
import NutritionDisplay from './components/NutritionDisplay'
import FoodList from './components/FoodList'
import ManualEntryForm from './components/ManualEntryForm'
import MacrosDashboard from './components/MacrosDashboard'
import FoodSearch from './components/FoodSearch'
import QuickAddFood from './components/QuickAddFood'
import DarkModeToggle from './components/DarkModeToggle'
import Toast from './components/Toast'
import NutritionGoalsForm from './components/NutritionGoalsForm'
import { getProductByBarcode, searchProducts } from './services/nutritionService'
import useDeviceDetect from './hooks/useDeviceDetect'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { ScanLine, Search, Home, Droplets } from '../node_modules/lucide-react/dist/esm/index.js'

function App() {
  const [foods, setFoods] = useState([])
  const [currentFood, setCurrentFood] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [activeView, setActiveView] = useState('dashboard') // Shared state for both mobile and desktop
  const [waterIntake, setWaterIntake] = useState(0) // Track water intake in ml
  const [waterGoal, setWaterGoal] = useState(2000) // Default water goal in ml (2 liters)
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000, // Default calorie goal
    protein: 25,    // Default protein percentage
    carbs: 50,      // Default carbs percentage
    fat: 25         // Default fat percentage
  })
  const [showGoalsForm, setShowGoalsForm] = useState(false) // Toggle for showing/hiding goals form
  const isMobile = useDeviceDetect()

  // Load saved foods and water data from localStorage on initial load
  useEffect(() => {
    const savedFoods = localStorage.getItem('trackedFoods')
    if (savedFoods) {
      try {
        setFoods(JSON.parse(savedFoods))
      } catch (e) {
        console.error('Error loading saved foods:', e)
      }
    }

    const savedWaterIntake = localStorage.getItem('waterIntake')
    if (savedWaterIntake) {
      try {
        setWaterIntake(JSON.parse(savedWaterIntake))
      } catch (e) {
        console.error('Error loading saved water intake:', e)
      }
    }

    const savedWaterGoal = localStorage.getItem('waterGoal')
    if (savedWaterGoal) {
      try {
        setWaterGoal(JSON.parse(savedWaterGoal))
      } catch (e) {
        console.error('Error loading saved water goal:', e)
      }
    }

    const savedNutritionGoals = localStorage.getItem('nutritionGoals')
    if (savedNutritionGoals) {
      try {
        setNutritionGoals(JSON.parse(savedNutritionGoals))
      } catch (e) {
        console.error('Error loading saved nutrition goals:', e)
      }
    }
  }, [])

  // Save foods to localStorage whenever the foods array changes
  useEffect(() => {
    localStorage.setItem('trackedFoods', JSON.stringify(foods))
  }, [foods])

  // Save water intake to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('waterIntake', JSON.stringify(waterIntake))
  }, [waterIntake])

  // Save water goal to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('waterGoal', JSON.stringify(waterGoal))
  }, [waterGoal])

  // Save nutrition goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nutritionGoals', JSON.stringify(nutritionGoals))
  }, [nutritionGoals])

  // Function to handle saving nutrition goals
  const handleSaveNutritionGoals = (goals) => {
    setNutritionGoals(goals)
    setShowGoalsForm(false)

    // Show success toast
    setToast({
      visible: true,
      message: 'Nutrition goals saved successfully',
      type: 'success'
    })
  }

  // Function to update water intake
  const updateWaterIntake = (amount) => {
    setWaterIntake(prev => {
      const newAmount = Math.max(0, prev + amount);
      return newAmount;
    });

    // Show toast notification
    setToast({
      visible: true,
      message: amount > 0 ? `Added ${amount}ml of water` : `Removed ${Math.abs(amount)}ml of water`,
      type: 'success'
    });
  }

  const handleBarcodeDetected = async (barcode) => {
    setLoading(true)
    setError('')

    try {
      const foodData = await getProductByBarcode(barcode)
      setCurrentFood(foodData)
      setIsScanning(false)
    } catch (err) {
      setError(`Could not find product with barcode: ${barcode}`)
      setCurrentFood(null)
    } finally {
      setLoading(false)
    }
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const addFoodToList = (food = currentFood) => {
    if (food) {
      setFoods([...foods, food])
      setCurrentFood(null)
      // Show success toast with food name
      setToast({
        visible: true,
        message: `Added ${food.name} to your food tracker`,
        type: 'success'
      });
    }
  }

  const removeFoodFromList = (index) => {
    const newFoods = [...foods]
    newFoods.splice(index, 1)
    setFoods(newFoods)
  }

  const clearAllFoods = () => {
    if (window.confirm('Are you sure you want to clear all foods?')) {
      setFoods([])
    }
  }

  // Mobile UI
  const renderMobileUI = () => {
    // Map desktop view values to mobile tab values
    const mobileTab = activeView === 'add' ? 'scan' : 'home';

    // Function to update the shared state from mobile UI
    const handleTabChange = (tab) => {
      // Map mobile tab values to desktop view values
      setActiveView(tab === 'scan' ? 'add' : 'dashboard');
    };

    return (
      <div className="app-container">
        {/* Toast notification */}
        <Toast 
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={hideToast}
        />

        <header className="app-header">
          <div className="flex justify-between items-center w-full px-4">
            <div className="flex-1">
              <h1>Calorie Tracker</h1>
            </div>
            <DarkModeToggle />
          </div>
        </header>

        <main className="app-content">
          <Tabs 
            defaultValue={mobileTab} 
            onValueChange={(value) => handleTabChange(value)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <Home size={18} />
                <span>Foods</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <ScanLine size={18} />
                <span>Add Food</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="mt-0">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Nutrition</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowGoalsForm(!showGoalsForm)}
                    >
                      {showGoalsForm ? 'Hide Goals' : 'Set Goals'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showGoalsForm ? (
                    <NutritionGoalsForm 
                      nutritionGoals={nutritionGoals}
                      onSaveGoals={handleSaveNutritionGoals}
                    />
                  ) : (
                    <MacrosDashboard 
                      foods={foods} 
                      waterIntake={waterIntake}
                      waterGoal={waterGoal}
                      updateWaterIntake={updateWaterIntake}
                      nutritionGoals={nutritionGoals}
                    />
                  )}
                </CardContent>
              </Card>

              <QuickAddFood onAddFood={addFoodToList} isMobile={true} />
              <FoodSearch onAddFood={addFoodToList} isMobile={true} />

              <div className="food-list-section">
                <FoodList 
                  foods={foods} 
                  onRemoveFood={removeFoodFromList} 
                />
                {foods.length > 0 && (
                  <Button 
                    variant="destructive"
                    className="w-full mt-4"
                    onClick={clearAllFoods}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="scan" className="mt-0">
              <div className="scanner-section">
                {isScanning ? (
                  <div className="scanner-wrapper">
                    <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
                    <Button 
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setIsScanning(false)}
                    >
                      Cancel Scanning
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => setIsScanning(true)}
                  >
                    Scan Barcode
                  </Button>
                )}

                {loading && <div className="p-4 text-center">Loading product information...</div>}
                {error && <div className="p-4 text-destructive text-center">{error}</div>}

                {/* Current Food Display (only shown in scan tab) */}
                {currentFood && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Scanned Food</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NutritionDisplay foodItem={currentFood} />
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentFood(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => addFoodToList()}
                      >
                        Add to Tracker
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

        </main>

        <footer className="app-footer">
          <p>Calorie Tracker</p>
        </footer>
      </div>
    );
  }

  // Desktop UI
  const renderDesktopUI = () => {
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        {/* Toast notification */}
        <Toast 
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onClose={hideToast}
        />

        <header className="bg-card border-b border-border p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Calorie Tracker</h1>
            <div className="flex items-center gap-4">
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
                onClick={() => setActiveView('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'add' ? 'bg-primary/10 text-primary' : 'text-foreground'
                }`}
                onClick={() => setActiveView('add')}
              >
                Add Food
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Nutrition Dashboard</h2>
                <Button 
                  variant="outline"
                  onClick={() => setShowGoalsForm(!showGoalsForm)}
                >
                  {showGoalsForm ? 'Hide Goals' : 'Set Goals'}
                </Button>
              </div>

              {showGoalsForm ? (
                <NutritionGoalsForm 
                  nutritionGoals={nutritionGoals}
                  onSaveGoals={handleSaveNutritionGoals}
                />
              ) : (
                <MacrosDashboard 
                  foods={foods}
                  waterIntake={waterIntake}
                  waterGoal={waterGoal}
                  updateWaterIntake={updateWaterIntake}
                  nutritionGoals={nutritionGoals}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="food-list-section">
                    <FoodList 
                      foods={foods} 
                      onRemoveFood={removeFoodFromList} 
                    />
                    {foods.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <Button 
                          variant="destructive"
                          onClick={clearAllFoods}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-xl font-bold text-primary mb-4">Search Foods</h2>
                        <FoodSearch onAddFood={addFoodToList} isMobile={false} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-xl font-bold text-primary mb-4">Quick Add</h2>
                        <QuickAddFood onAddFood={addFoodToList} isMobile={false} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'add' && (
            <div className="space-y-6">
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-xl font-bold text-primary mb-4">Manual Entry</h2>
                      <ManualEntryForm onAddFood={addFoodToList} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary mb-4">Scan Barcode</h2>
                      {isScanning ? (
                        <div className="scanner-wrapper">
                          <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
                          <Button 
                            className="w-full mt-4"
                            variant="outline"
                            onClick={() => setIsScanning(false)}
                          >
                            Cancel Scanning
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => setIsScanning(true)}
                        >
                          Start Scanning
                        </Button>
                      )}

                      {loading && <div className="text-center mt-4">Loading product information...</div>}
                      {error && <div className="text-destructive mt-4">{error}</div>}
                    </div>
                  </div>

                  {currentFood && (
                    <div className="mt-6 p-4 border border-border rounded-lg">
                      <h2 className="text-xl font-bold text-primary mb-4">Scanned Food</h2>
                      <NutritionDisplay foodItem={currentFood} />
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setCurrentFood(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => addFoodToList()}
                        >
                          Add to Tracker
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <footer className="text-center py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Calorie Tracker
          </p>
        </footer>
      </div>
    );
  }

  return isMobile ? renderMobileUI() : renderDesktopUI()
}

export default App
