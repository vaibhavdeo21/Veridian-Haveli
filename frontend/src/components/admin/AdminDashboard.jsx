import usePageTitle from "../../hooks/usePageTitle";
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { useData } from '../../context/DataContext.jsx';

const AdminDashboard = () => {
  usePageTitle("Dashboard | VERIDIAN HAVELI");
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
      activeBookings: customers.filter(c => (c.status || '').replace(/\s/g, "").toLowerCase() === 'checkedin').length,
      availableRooms: rooms.filter(r => (r.availability || '').toLowerCase() !== 'booked').length
    };
  }, [customers, rooms]);

  return (
    <div id="admin-dashboard-home" className="p-8 space-y-10 bg-haveli-bg min-h-screen">
      <div className="flex justify-between items-end border-b border-haveli-border pb-6">
        <div>
          <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Heritage Management</p>
          <h1 className="text-4xl font-bold text-haveli-heading font-display tracking-tight uppercase">Dashboard</h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-haveli-primary bg-haveli-section border border-haveli-border px-4 py-1.5 rounded-full uppercase tracking-tighter">
            <i className="fas fa-sync-alt fa-spin mr-2 opacity-50"></i>Live Inventory Sync
          </span>
        </div>
      </div>

      {/* --- KPI Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Total Net Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          icon="fa-wallet" 
          color="text-haveli-primary" 
        />
        <StatCard 
          title="In-Residence" 
          value={stats.activeBookings} 
          trend="Active" 
          icon="fa-user-check" 
          color="text-blue-600" 
        />
        <StatCard 
          title="Suite Inventory" 
          value={stats.availableRooms} 
          trend="Available" 
          icon="fa-door-open" 
          color="text-haveli-accent" 
        />
        <StatCard 
          title="Estimated GST" 
          value={`₹${stats.gstAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          trend="18% Rate" 
          icon="fa-file-invoice-dollar" 
          color="text-red-700" 
        />
      </div>

      {/* --- Charts Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Revenue Growth Area Chart */}
        <div className="lux-card bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Revenue Growth (7D)</h3>
            <div className="w-8 h-8 bg-haveli-section rounded-full flex items-center justify-center border border-haveli-border">
              <i className="fas fa-chart-line text-haveli-accent text-xs"></i>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E5F4E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1E5F4E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1D6" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#7A7A7A'}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E7E1D6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', backgroundColor: '#FBF8F2' }}
                  itemStyle={{ fontWeight: 'bold', color: '#1E5F4E', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="dailyRevenue" 
                  stroke="#1E5F4E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Volume Bar Chart */}
        <div className="lux-card bg-white p-8 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Daily Guest Volume</h3>
            <div className="w-8 h-8 bg-haveli-section rounded-full flex items-center justify-center border border-haveli-border">
              <i className="fas fa-bed text-haveli-accent text-xs"></i>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E1D6" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#7A7A7A'}} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#7A7A7A'}} />
                <Tooltip cursor={{fill: '#FBF8F2'}} contentStyle={{ borderRadius: '12px', border: '1px solid #E7E1D6' }} />
                <Bar dataKey="bookingCount" fill="#C2A14D" radius={[6, 6, 0, 0]} barSize={24}>
                  {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === analyticsData.length - 1 ? '#1E5F4E' : '#C2A14D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* --- Recent Activity Summary --- */}
      <div className="bg-haveli-dark p-10 rounded-2xl shadow-2xl text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-haveli-accent"></div>
        <div className="mb-6 md:mb-0 relative z-10">
          <h3 className="text-2xl font-bold font-display tracking-wide mb-1">System Pulse: Optimal</h3>
          <p className="text-haveli-accent/60 text-[10px] font-bold uppercase tracking-[0.2em]">All heritage database nodes are currently healthy</p>
        </div>
        <div className="flex gap-10 relative z-10">
          <div className="text-center px-10 border-r border-white/10">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Gross Collection</p>
            <p className="text-3xl font-display font-bold text-haveli-accent">₹{stats.grossTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </div>
          <div className="text-center px-6">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Pending Folios</p>
            <p className="text-3xl font-display font-bold text-red-400">{customers.filter(c => c.paymentStatus === 'Pending').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Sub-component for KPI Cards using Design System
const StatCard = ({ title, value, trend, icon, color }) => (
  <div className="lux-card bg-white p-8 rounded-2xl transition-all duration-500 hover:-translate-y-1 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-xl bg-haveli-section border border-haveli-border flex items-center justify-center transition-colors group-hover:border-haveli-accent`}>
        <i className={`fas ${icon} text-xl ${color}`}></i>
      </div>
      <span className="text-[9px] font-bold text-haveli-primary bg-[#ecfdf5] border border-haveli-primary/20 px-3 py-1 rounded-full uppercase tracking-tighter">{trend}</span>
    </div>
    <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">{title}</p>
    <h3 className="text-3xl font-bold text-haveli-heading font-display">{value}</h3>
  </div>
);

export default AdminDashboard;