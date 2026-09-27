import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import numpy as np

# Use the CSV produced by collect_all_india_data.py if available
csv_path = 'ml/all_india_weather.csv'
try:
    df = pd.read_csv(csv_path)
except Exception as e:
    raise SystemExit(f'Could not read {csv_path}: {e}')

# features and target
X = df[['temperature','humidity','wind','pressure']]
y = df['rainfall']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
reg = RandomForestRegressor(random_state=42)
reg.fit(X_train, y_train)
preds = reg.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, preds))
print('RMSE:', rmse)

joblib.dump(reg, 'ml/rain_prediction_model.pkl')
