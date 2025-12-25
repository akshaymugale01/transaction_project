import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { saveChartData, getChartData } from './lib/supabase';
import EmailModal from './components/EmailModal';
import EditModal from './components/EditModal';
import ConfigWarning from './components/ConfigWarning';

// Check if Supabase is configured
const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initial dummy data for Call Duration chart
const initialCallDurationData = [
  { hour: '00:00', avgDuration: 180, totalCalls: 12 },
  { hour: '04:00', avgDuration: 150, totalCalls: 8 },
  { hour: '08:00', avgDuration: 240, totalCalls: 35 },
  { hour: '12:00', avgDuration: 220, totalCalls: 48 },
  { hour: '16:00', avgDuration: 200, totalCalls: 42 },
  { hour: '20:00', avgDuration: 190, totalCalls: 28 },
];

// Dummy data for Call Outcomes
const initialCallOutcomeData = [
  { name: 'Successful', value: 450, color: '#10b981' },
  { name: 'Voicemail', value: 120, color: '#3b82f6' },
  { name: 'No Answer', value: 80, color: '#f59e0b' },
  { name: 'Busy', value: 50, color: '#ef4444' },
  { name: 'Failed', value: 30, color: '#6b7280' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];

function App() {
  const [callDurationData, setCallDurationData] = useState(initialCallDurationData);
  const [callOutcomeData, setCallOutcomeData] = useState(initialCallOutcomeData);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChart, setEditingChart] = useState<'duration' | 'outcome' | null>(null);
  const [existingData, setExistingData] = useState<any>(null);

  // Handle edit button click - show email modal first
  const handleEditClick = (chartType: 'duration' | 'outcome') => {
    setEditingChart(chartType);
    if (!userEmail) {
      setShowEmailModal(true);
    } else {
      openEditModal(chartType);
    }
  };

  // Open edit modal after email is captured
  const openEditModal = async (chartType: 'duration' | 'outcome') => {
    if (!userEmail) return;

    // Check if user has existing data
    const existing = await getChartData(userEmail, chartType);
    
    if (existing) {
      setExistingData(existing);
    } else {
      setExistingData(null);
    }
    
    setShowEditModal(true);
  };

  // Handle email submission from modal
  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email);
    setShowEmailModal(false);
    
    if (editingChart) {
      openEditModal(editingChart);
    }
  };

  // Handle chart data update
  const handleChartUpdate = async (newData: any) => {
    if (!userEmail || !editingChart) return;

    try {
      // Save to Supabase (if configured)
      if (isSupabaseConfigured) {
        await saveChartData(userEmail, editingChart, newData);
      } else {
        console.warn('⚠️ Data not saved - Supabase not configured');
      }

      // Update local state
      if (editingChart === 'duration') {
        setCallDurationData(newData);
      } else if (editingChart === 'outcome') {
        setCallOutcomeData(newData);
      }

      setShowEditModal(false);
      setExistingData(null);
      setEditingChart(null);
    } catch (error) {
      console.error('Failed to save chart data:', error);
      const errorMessage = isSupabaseConfigured 
        ? 'Failed to save data. Please try again.'
        : 'Data updated locally but not saved (Supabase not configured).';
      alert(errorMessage);
    }
  };

  // Handle overwrite confirmation
  const handleOverwriteConfirm = () => {
    setExistingData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Configuration Warning */}
      <ConfigWarning show={!isSupabaseConfigured} />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Voice Analytics</h1>
              <p className="text-slate-400 mt-1">AI Voice Agent Performance Dashboard</p>
            </div>
            {userEmail && (
              <div className="text-right">
                <p className="text-sm text-slate-400">Logged in as</p>
                <p className="text-white font-medium">{userEmail}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Calls" 
            value="730" 
            change="+12.5%" 
            positive 
          />
          <StatCard 
            title="Avg Duration" 
            value="3:42" 
            change="+8.2%" 
            positive 
          />
          <StatCard 
            title="Success Rate" 
            value="61.6%" 
            change="+3.1%" 
            positive 
          />
          <StatCard 
            title="Voicemail Rate" 
            value="16.4%" 
            change="-2.4%" 
            positive={false} 
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Call Duration Chart */}
          <ChartCard 
            title="Call Duration Analysis" 
            description="Average call duration by time of day"
            onEdit={() => handleEditClick('duration')}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={callDurationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Duration (seconds)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgDuration" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Avg Duration (s)"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalCalls" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Total Calls"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Call Outcome Chart */}
          <ChartCard 
            title="Call Outcome Distribution" 
            description="Breakdown of call results"
            onEdit={() => handleEditClick('outcome')}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={callOutcomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {callOutcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-950/30 border border-blue-900/50 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-400">Interactive Dashboard</h3>
              <p className="mt-2 text-slate-300">
                Click the "Edit Data" button on any chart to customize the values. 
                Your changes will be saved to your email and can be retrieved later.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />

      {editingChart && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingChart(null);
            setExistingData(null);
          }}
          chartType={editingChart}
          currentData={editingChart === 'duration' ? callDurationData : callOutcomeData}
          existingData={existingData}
          onSave={handleChartUpdate}
          onOverwriteConfirm={handleOverwriteConfirm}
        />
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatCard({ title, value, change, positive }: StatCardProps) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
      <p className="text-3xl font-bold text-white mb-2">{value}</p>
      <p className={`text-sm font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change} from last period
      </p>
    </div>
  );
}

// Chart Card Component
interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onEdit: () => void;
}

function ChartCard({ title, description, children, onEdit }: ChartCardProps) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-slate-400 text-sm mt-1">{description}</p>
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Data
        </button>
      </div>
      {children}
    </div>
  );
}

export default App;
