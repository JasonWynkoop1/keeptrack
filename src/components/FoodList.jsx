import React from 'react';

const FoodList = ({ foods, onRemoveFood }) => {
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

  if (foods.length === 0) {
    return <div className="food-list empty">No foods added yet</div>;
  }

  return (
    <div className="food-list">
      <h2>Food Tracker</h2>
      
      <div className="totals">
        <h3>Daily Totals</h3>
        <div className="totals-grid">
          <div className="total-item">
            <span className="label">Calories:</span>
            <span className="value">{totals.calories.toFixed(0)} kcal</span>
          </div>
          <div className="total-item">
            <span className="label">Protein:</span>
            <span className="value">{totals.protein.toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span className="label">Carbs:</span>
            <span className="value">{totals.carbs.toFixed(1)}g</span>
          </div>
          <div className="total-item">
            <span className="label">Fat:</span>
            <span className="value">{totals.fat.toFixed(1)}g</span>
          </div>
        </div>
      </div>
      
      <h3>Foods</h3>
      <ul className="food-items">
        {foods.map((food, index) => (
          <li key={index} className="food-item">
            <div className="food-info">
              <div className="food-name">{food.name}</div>
              <div className="food-macros">
                {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
              </div>
            </div>
            <button 
              className="remove-btn" 
              onClick={() => onRemoveFood(index)}
              aria-label="Remove food"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodList;