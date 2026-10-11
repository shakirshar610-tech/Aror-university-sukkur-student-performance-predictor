# Model Documentation

## Algorithm

**Linear Regression (Ordinary Least Squares)**

The model learns a linear relationship between three input features and the target variable (final_score):

```
final_score = w0 + w1 * study_hours + w2 * attendance + w3 * previous_score
```

Where `w0` is the intercept (bias) and `w1, w2, w3` are the feature coefficients learned during training.

## Training Pipeline

1. **Load** `data/student_data.csv` with Pandas
2. **Validate** required columns: `study_hours`, `attendance`, `previous_score`, `final_score`
3. **Convert** to numeric (coerce errors to NaN)
4. **Handle missing values** — drop rows with any NaN in required columns
5. **Validate ranges** — warn about values outside valid ranges
6. **Split** 80/20 into training and test sets (`random_state=42` for reproducibility)
7. **Train** `sklearn.linear_model.LinearRegression` on the training set
8. **Evaluate** on the held-out test set (never train on test data)
9. **Save** model + metadata to `ml/model.joblib` with Joblib

## Evaluation Metrics

| Metric | Description |
|--------|-------------|
| **MAE** | Mean Absolute Error — average absolute difference between predicted and actual scores |
| **RMSE** | Root Mean Squared Error — penalizes larger errors more heavily |
| **R²** | Coefficient of Determination — proportion of variance explained (0–1, can be negative) |

Metrics are calculated on the **raw** model output (no rounding). User-facing display rounds to 1 decimal place.

## Output Policy

The raw model output is preserved for metric calculation. For user-facing display:
- Scores are clamped to 0–100
- The raw value is shown alongside the clamped value when clamping occurs
- This policy is documented in the prediction result panel

## Feature Coefficients

Coefficients represent the change in predicted final score per unit increase in each feature, holding others constant:

- **study_hours**: points per additional hour studied per day
- **attendance**: points per additional percentage of attendance
- **previous_score**: points per additional point of previous score

**Important:** These are correlations, not causal effects. Increasing study hours in the model does not prove it will improve a specific student's score.

## Frontend ML Implementation

The frontend includes a TypeScript implementation of OLS linear regression that:
- Uses the same Normal Equation: `W = (X^T X)^-1 X^T y`
- Implements Gauss-Jordan elimination for matrix inversion
- Uses the same 80/20 split with a seeded shuffle (random_state=42 equivalent)
- Produces identical predictions to the Python scikit-learn model

This ensures the app works without the Python backend while maintaining ML validity.

## Limitations

1. **Synthetic data** — 100 synthetic records, not real student data
2. **Linear assumption** — Real relationships may be non-linear
3. **Three features only** — Many other factors affect performance
4. **No algorithm comparison** — Linear Regression may not be optimal
5. **R² interpretation** — High R² measures average fit, not individual accuracy
6. **Correlation ≠ causation** — The model estimates patterns, not causal relationships

## Future Improvements

- Train on real, representative data
- Compare with Ridge, Lasso, Random Forest, XGBoost
- Add feature engineering and interaction terms
- Implement cross-validation for more robust evaluation
- Add feature importance via SHAP values
