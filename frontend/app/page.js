// app/page.js
import DashboardClient from './components/DashboardClient';

export default function Dashboard() {
  return (
    <main className="bg-gray-900 text-white min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-red-600">Wayne Enterprises</h1>
          <p className="text-gray-400">Business Intelligence Dashboard</p>
        </header>
        
        <DashboardClient />
        
      </div>
    </main>
  );
}