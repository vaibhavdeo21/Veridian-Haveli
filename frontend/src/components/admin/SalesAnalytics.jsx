import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '../../context/DataContext';

const SalesAnalytics = () => {
  const { analytics, customers } = useData();

  // Calculate high-level stats from current customers
  const totalRevenue = customers.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalBookings = customers.length;
  const pendingPayments = customers.filter(c => c.paymentStatus === 'Pending').length;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-black text-gray-800">Sales Performance</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon="fa-wallet" color="text-green-600" />
        <StatCard title="Active Bookings" value={totalBookings} icon="fa-concierge-bell" color="text-amber-600" />
        <StatCard title="Pending Payments" value={pendingPayments} icon="fa-clock" color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-tighter">7-Day Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#d97706" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Count Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-tighter">Daily Booking Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip cursor={{fill: '#fef3c7'}} />
                <Bar dataKey="bookings" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

export default SalesAnalytics;