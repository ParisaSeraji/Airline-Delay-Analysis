import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import mysql.connector

# Connect to the MySQL server
mydb = mysql.connector.connect(
  host="localhost",
  user="user",
  password="yourpassword",
  database="airline_delay_analysis"
)

# Read the data from each table and combine into a single dataset
data_list = []
tables = ['Flights', 'Airport', 'Carrier', 'Delay']
for table in tables:
    table_data = pd.read_sql(f"SELECT * FROM {table}", con=mydb)
    data_list.append(table_data)
data = pd.merge(data_list[0], data_list[1], on='Airport_id')
data = pd.merge(data, data_list[2], on='Carrier_id')
data = pd.merge(data, data_list[3], on='flight_id')

# Extract the month from the date
data['Month'] = pd.to_datetime(data['FL_DATE']).dt.month

# Group data by month and calculate the average number of ARR_DELAY and DEP_DELAY
delayed_months = data.groupby(['Month']).agg({'ARR_DELAY': np.mean, 'DEP_DELAY': np.mean}).reset_index()

# (c) Feature Selection:
# We used the ARR_DELAY, DEP_DELAY, and Month attributes as they are relevant to our problem.

# Prepare the data for training by selecting relevant features (Month, ARR_DELAY, and DEP_DELAY)
X = delayed_months[['Month', 'ARR_DELAY', 'DEP_DELAY']].values
y = delayed_months['ARR_DELAY'].values

# Train a Random Forest model
model = RandomForestRegressor(n_estimators=100, random_state=0).fit(X, y)



# Predict the number of ARR_DELAY in each month of 2021
X_test = pd.DataFrame({'Month': range(1, 13), 'arrDelay': np.zeros(12), 'depDelay': np.zeros(12)})
y_pred = model.predict(X_test[['Month', 'arrDelay', 'depDelay']].values)

max_month = X_test.iloc[y_pred.argmax(), 0]

print(f"The month with the highest predicted number of delays in 2021 is {max_month}.")
