import React from 'react';

const NutritionDisplay = ({ foodItem }) => {
  if (!foodItem) {
    return <div className="nutrition-display empty">Scan a barcode to see nutrition information</div>;
  }

  return (
    <div className="nutrition-display">
      <h2>{foodItem.name}</h2>
      <div className="nutrition-info">
        <div className="nutrition-item">
          <span className="label">Calories:</span>
          <span className="value">{foodItem.calories} kcal</span>
        </div>
        <div className="nutrition-item">
          <span className="label">Protein:</span>
          <span className="value">{foodItem.protein}g</span>
        </div>
        <div className="nutrition-item">
          <span className="label">Carbs:</span>
          <span className="value">{foodItem.carbs}g</span>
        </div>
        <div className="nutrition-item">
          <span className="label">Fat:</span>
          <span className="value">{foodItem.fat}g</span>
        </div>
        {foodItem.servingSize && (
          <div className="nutrition-item">
            <span className="label">Serving Size:</span>
            <span className="value">{foodItem.servingSize}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionDisplay;