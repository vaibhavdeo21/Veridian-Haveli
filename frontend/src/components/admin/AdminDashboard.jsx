import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { useData } from '../../context/DataContext.jsx';

const AdminDashboard = () => {
  const { analyticsData, customers, rooms } = useData();

  // 1. Calculate High-Level Stats using database values
  const stats = useMemo(() => {
    const totalRevenue = customers
      .filter(c => c.paymentStatus === 'Paid' || c.paymentStatus === 'Complete')
      .reduce((sum, c) => sum + (c.totalAmount || 0), 0);

    return {
      totalRevenue,
      gstAmount: totalRevenue * 0.18,
      grossTotal: totalRevenue * 1.18,
      activeBookings: customers.filter(c => c.status === 'CheckedIn').length,
      availableRooms: rooms.filter(r => r.availability !== 'Booked').length
    };
  }, [customers, rooms]);

  return (
    <div id="admin-dashboard-home" className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Dashboard</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jhankar Hotel Real-time Analytics</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">Live Sync Active</span>
        </div>
      </div>

      {/* --- KPI Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Net Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          icon="fa-wallet" 
          color="text-amber-600" 
        />
        <StatCard 
          title="In-House Guests" 
          value={stats.activeBookings} 
          trend="Current" 
          icon="fa-user-check" 
          color="text-blue-600" 
        />
        <StatCard 
          title="Available Rooms" 
          value={stats.availableRooms} 
          trend="Inventory" 
          icon="fa-door-open" 
          color="text-green-600" 
        />
        <StatCard 
          title="Estimated GST" 
          value={`₹${stats.gstAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          trend="18% Rate" 
          icon="fa-file-invoice-dollar" 
          color="text-red-600" 
        />
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Growth Area Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tighter">Revenue Trend (Last 7 Days)</h3>
            <i className="fas fa-chart-line text-gray-300"></i>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#d97706' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="dailyRevenue" 
                  stroke="#d97706" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Volume Bar Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tighter">Daily Booking Volume</h3>
            <i className="fas fa-bed text-gray-300"></i>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#fff7ed'}} />
                <Bar dataKey="bookingCount" fill="#d97706" radius={[6, 6, 0, 0]} barSize={30}>
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === analyticsData.length - 1 ? '#d97706' : '#fbbf24'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* --- Recent Activity Summary --- */}
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-black tracking-tight">System Status: Optimal</h3>
          <p className="text-gray-400 text-xs font-bold uppercase">All database connections are active and syncing</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 border-r border-gray-700">
            <p className="text-[10px] font-black text-gray-500 uppercase">Gross Collection</p>
            <p className="text-xl font-black">₹{stats.grossTotal.toLocaleString()}</p>
          </div>
          <div className="text-center px-6">
            <p className="text-[10px] font-black text-gray-500 uppercase">Pending Bills</p>
            <p className="text-xl font-black text-amber-500">{customers.filter(c => c.paymentStatus === 'Pending').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Sub-component for KPI Cards
const StatCard = ({ title, value, trend, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center ${color}`}>
        <i className={`fas ${icon} text-lg`}></i>
      </div>
      <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-lg">{trend}</span>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-gray-800">{value}</h3>
  </div>
);

export default AdminDashboard;