# main.py

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance
app = FastAPI()

# Configure CORS to allow requests from your Next.js frontend
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading ---
# Load datasets into pandas DataFrames using the correct file paths
try:
    fin_data = pd.read_csv('data/wayne_financial_data.csv')
    hr_data = pd.read_csv('data/wayne_hr_analytics.csv')
    sec_data = pd.read_csv('data/wayne_security_data.csv')
except FileNotFoundError as e:
    print(
        f"Error loading data: {e}. Ensure the CSV files are in the 'backend/data/' directory.")
    exit()

# --- API Endpoints ---


@app.get("/")
def read_root():
    """A root endpoint to confirm the server is running."""
    return {"message": "Wayne Enterprises Dashboard API is running"}


@app.get("/api/kpis")
def get_kpis():
    """Provides top-level metrics for the executive summary cards."""
    # KPI 1: Total Revenue
    # Using 'Revenue_M' which is already in millions.
    total_revenue_m = fin_data['Revenue_M'].sum()

    # KPI 2: Total Employees
    # The 'wayne_financial_data.csv' has the most reliable total employee count.
    # We'll take the sum from the most recent quarter's data.
    latest_year = fin_data['Year'].max()
    latest_quarter_in_year = fin_data[fin_data['Year']
                                      == latest_year]['Quarter'].max()
    latest_employee_data = fin_data[(fin_data['Year'] == latest_year) & (
        fin_data['Quarter'] == latest_quarter_in_year)]
    total_employees = latest_employee_data['Employee_Count'].sum()

    # KPI 3: Average Public Safety Score
    # Using 'Public_Safety_Score' from the security dataset.
    avg_safety_score = sec_data['Public_Safety_Score'].mean()

    return {
        # Formatting total revenue to show in billions for a cleaner look.
        "total_revenue": f"${total_revenue_m / 1000:.2f}B",
        "total_employees": int(total_employees),
        "avg_safety_score": f"{avg_safety_score:.1f}/10"
    }


@app.get("/api/revenue-trends")
def get_revenue_trends():
    """Provides time-series data for total revenue for a line chart."""
    # Using 'Revenue_M' for revenue and creating a 'Period' column for sorting.
    revenue_by_quarter = fin_data.groupby(['Year', 'Quarter'])[
        'Revenue_M'].sum().reset_index()
    # Combine Year and Quarter for a chronological label
    revenue_by_quarter['Period'] = revenue_by_quarter['Year'].astype(
        str) + '-' + revenue_by_quarter['Quarter']
    # Renaming for consistency with the frontend chart component
    revenue_by_quarter.rename(columns={'Revenue_M': 'Revenue'}, inplace=True)
    return revenue_by_quarter[['Period', 'Revenue']].to_dict(orient='records')


@app.get("/api/division-performance")
def get_division_performance():
    """Provides profit data for each division for a bar chart."""
    # Using 'Net_Profit_M' directly for profit.
    # Renaming for consistency with the frontend chart component.
    performance = fin_data.groupby(
        'Division')['Net_Profit_M'].sum().reset_index()
    performance.rename(columns={'Net_Profit_M': 'Profit'}, inplace=True)
    return performance.to_dict(orient='records')


@app.get("/api/employee-distribution")
def get_employee_distribution():
    """Provides data on employee distribution across departments for a pie chart."""
    # Using 'Department' from the HR analytics file.
    distribution = hr_data['Department'].value_counts().reset_index()
    distribution.columns = ['name', 'value']  # Format for Recharts PieChart
    return distribution.to_dict(orient='records')


@app.get("/api/security-narrative")
def get_security_narrative():
    """Provides data for the Gotham security data story."""
    # Ensure the 'Date' column is in datetime format to extract the month.
    sec_data['Date'] = pd.to_datetime(sec_data['Date'])
    sec_data['Month'] = sec_data['Date'].dt.strftime(
        '%Y-%m')  # Format as Year-Month for sorting

    # [cite_start]Focus on districts with notable improvements as per the documentation[cite: 22].
    focus_districts = ['Bristol', 'Park Row']
    narrative_data = sec_data[sec_data['District'].isin(focus_districts)]

    # Group by month and district to show the trend of decreasing 'Security_Incidents'.
    incident_trends = narrative_data.groupby(['Month', 'District'])[
        'Security_Incidents'].sum().unstack().fillna(0).reset_index()

    return {
        "headline": "Wayne Tech Deployments Slash Crime Rates in Key Gotham Districts",
        "story": "A targeted deployment of Wayne Tech security solutions in the Bristol and Park Row districts has led to a remarkable decrease in security incidents. This initiative is a successful model for expansion into more challenging areas like The Narrows. [cite: 22]",
        "chart_data": incident_trends.to_dict(orient='records')
    }
