"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';


// Main Component to fetch data and pass to children
export default function DashboardClient() {
    const [kpis, setKpis] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [divisionPerf, setDivisionPerf] = useState([]);
    const [employeeDist, setEmployeeDist] = useState([]);
    const [security, setSecurity] = useState(null);

    useEffect(() => {
        const API_BASE_URL = 'http://127.0.0.1:8000/api';
        axios.get(`${API_BASE_URL}/kpis`).then(res => setKpis(res.data));
        axios.get(`${API_BASE_URL}/revenue-trends`).then(res => setRevenue(res.data));
        axios.get(`${API_BASE_URL}/division-performance`).then(res => setDivisionPerf(res.data));
        axios.get(`${API_BASE_URL}/employee-distribution`).then(res => setEmployeeDist(res.data));
        axios.get(`${API_BASE_URL}/security-narrative`).then(res => setSecurity(res.data));
    }, []);

    if (!kpis || !security) return <div className="text-center p-8">Loading Dashboard Data...</div>;

    return (
        <div>
            <KpiSection kpis={kpis} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
                <RevenueChart data={revenue} />
                <DivisionPerformanceChart data={divisionPerf} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-8">
                 <div className="lg:col-span-2">
                     <SecurityNarrative data={security} />
                 </div>
                 <EmployeeDistributionChart data={employeeDist} />
            </div>
        </div>
    );
}

// Sub-components for each section (can be in the same file for speed)

const KpiCard = ({ title, value }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
);

const KpiSection = ({ kpis }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard title="Total Revenue (YTD)" value={kpis.total_revenue} />
        <KpiCard title="Total Employees" value={kpis.total_employees} />
        <KpiCard title="Avg. Public Safety Score" value={kpis.avg_safety_score} />
    </div>
);

const ChartContainer = ({ title, children }) => (
     <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-96">
        <h3 className="font-bold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            {children}
        </ResponsiveContainer>
    </div>
);

const RevenueChart = ({ data }) => (
    <ChartContainer title="Quarterly Revenue Trends">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis dataKey="Period" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value/1000}B`} />
            <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }} formatter={(value) => `$${value}M`}/>
            <Legend />
            <Line type="monotone" dataKey="Revenue" stroke="#dc2626" strokeWidth={2} />
        </LineChart>
    </ChartContainer>
);

const DivisionPerformanceChart = ({ data }) => (
    <ChartContainer title="Profit by Division">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
            <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `$${value}M`} />
            <YAxis type="category" dataKey="Division" stroke="#9ca3af" width={100} />
            <Tooltip 
                contentStyle={{ backgroundColor: '#374151', border: 'none' }} 
                formatter={(value) => `$${value.toFixed(2)}M`} 
            />
            <Legend />
            <Bar dataKey="Profit" fill="#dc2626" />
        </BarChart>
    </ChartContainer>
);

const EmployeeDistributionChart = ({ data }) => {
    const COLORS = ['#b91c1c', '#f87171', '#991b1b', '#ef4444', '#7f1d1d'];
    return(
        <ChartContainer title="Employee Distribution">
            <PieChart>
                 <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#374151', border: 'none' }}
                    formatter={(value, name) => [`${value} Employees`, name]}
                 />
                 <Legend />
            </PieChart>
        </ChartContainer>
    );
};

const SecurityNarrative = ({ data }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full newspaper-style">
        <h2 className="text-2xl font-bold border-b-2 border-red-600 pb-2 mb-4">{data.headline}</h2>
        <p className="text-gray-300 mb-4">{data.story}</p>
        <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chart_data}>
                    <XAxis dataKey="Month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none' }}/>
                    <Legend />
                    <Line type="monotone" dataKey="Bristol" stroke="#ef4444" name="Bristol Incidents"/>
                    <Line type="monotone" dataKey="Park Row" stroke="#a3e635" name="Park Row Incidents"/>
                </LineChart>
             </ResponsiveContainer>
        </div>
    </div>
);
