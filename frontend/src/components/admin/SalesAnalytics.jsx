import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { useData } from '../../context/DataContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.jsx';

const SalesAnalytics = () => {
  usePageTitle("Sales Analytics | VERIDIAN HAVELI");
  const { analyticsData, customers } = useData();

  // 1. Calculate high-level stats from current customers
  const stats = useMemo(() => {
    if (!customers) return { totalRevenue: 0, totalBookings: 0, pendingPayments: 0 };
    
    const totalRevenue = customers.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalBookings = customers.length;
    const pendingPayments = customers.filter(c => c.paymentStatus === 'Pending').length;

    return { totalRevenue, totalBookings, pendingPayments };
  }, [customers]);

  return (
    <div id="sales-analytics-panel" className="p-2 space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-haveli-border pb-6">
        <div>
          <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Financial Intelligence</p>
          <h2 className="text-3xl font-bold text-haveli-heading font-display tracking-tight uppercase">Sales Performance</h2>
        </div>
        <div className="mt-4 md:mt-0">
           <span className="text-[10px] font-bold text-haveli-primary bg-haveli-section border border-haveli-border px-4 py-1.5 rounded-full uppercase tracking-tighter">
            <i className="fas fa-chart-pie mr-2 opacity-50"></i>Fiscal Year 2026
          </span>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Total Net Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon="fa-wallet" 
          color="text-haveli-primary" 
        />
        <StatCard 
          title="Active Residency" 
          value={stats.totalBookings} 
          icon="fa-concierge-bell" 
          color="text-haveli-accent" 
        />
        <StatCard 
          title="Outstanding Folios" 
          value={stats.pendingPayments} 
          icon="fa-clock" 
          color="text-red-700" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Revenue Trend Line Chart */}
        <div className="lux-card bg-white p-8 rounded-2xl shadow-sm border-haveli-border">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Revenue Trajectory (7D)</h3>
            <i className="fas fa-project-diagram text-haveli-accent/30"></i>
          </div>
          <div className="h-72">
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
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Count Bar Chart */}
        <div className="lux-card bg-white p-8 rounded-2xl shadow-sm border-haveli-border">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Daily Arrival Volume</h3>
            <i className="fas fa-users text-haveli-accent/30"></i>
          </div>
          <div className="h-72">
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
                <Tooltip 
                  cursor={{fill: '#FBF8F2'}} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E7E1D6' }} 
                />
                <Bar dataKey="bookingCount" fill="#C2A14D" radius={[6, 6, 0, 0]} barSize={24}>
                  {analyticsData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === analyticsData.length - 1 ? '#1E5F4E' : '#C2A14D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-8 bg-haveli-dark rounded-2xl border border-haveli-accent/20 flex flex-col md:row justify-between items-center text-white gap-6">
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-haveli-accent/10 rounded-full flex items-center justify-center border border-haveli-accent/20">
                <i className="fas fa-shield-alt text-haveli-accent text-xl"></i>
              </div>
              <div>
                  <h4 className="text-lg font-bold font-display tracking-wide">Secure Financial Audit</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">All transactions are encrypted and verified</p>
              </div>
          </div>
          <div className="flex items-center space-x-8">
              <div className="text-right">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Fiscal Health</p>
                  <p className="text-xl font-bold text-haveli-accent font-display">Optimal</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <button onClick={() => window.print()} className="btn btn-outline border-white/20 text-white hover:bg-white hover:text-haveli-dark py-2 px-6 text-xs uppercase tracking-widest font-black">
                  Print Report
              </button>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="lux-card bg-white p-8 rounded-2xl transition-all duration-500 hover:-translate-y-1 flex items-center justify-between group">
    <div>
      <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">{title}</p>
      <h3 className={`text-3xl font-bold font-display ${color} tracking-tight`}>{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl bg-haveli-section border border-haveli-border flex items-center justify-center text-2xl transition-colors group-hover:border-haveli-accent ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

export default SalesAnalytics;