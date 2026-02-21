import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import AddOrderModal from './AddOrderModal.jsx';

const OrderFoodPanel = () => {
  const { orders, deleteOrder } = useData();
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This will remove the charge from the guest folio.')) {
      deleteOrder(orderId);
      showNotification('Order deleted successfully!', 'success');
    }
  };

  return (
    <div id="order-food-panel" className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Dining Administration</p>
          <h2 className="text-3xl font-bold text-haveli-heading font-display tracking-tight uppercase">Room Service Orders</h2>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-secondary px-8 h-12 shadow-sm"
        >
          <i className="fas fa-plus mr-2 text-xs"></i> Add New Order
        </button>
      </div>
      
      <div className="lux-card p-0 overflow-hidden border-haveli-border shadow-sm bg-white">
        <div className="p-8 border-b border-haveli-border bg-haveli-section flex justify-between items-center">
          <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Active Service Ledger</h3>
          <span className="text-[10px] font-bold text-haveli-muted uppercase tracking-tighter bg-white px-4 py-1.5 rounded-full border border-haveli-border shadow-sm">
            Total Orders: <span className="text-haveli-primary ml-1">{orders?.length || 0}</span>
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]"> 
            <thead className="bg-haveli-bg/50 border-b border-haveli-border">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Suite No</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Resident Name</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Culinary Items</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Qty</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Service Date</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-haveli-border bg-white">
              {Array.isArray(orders) && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id || order._id} className="hover:bg-haveli-section/30 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-[10px] font-mono text-haveli-muted">#{(order.id || order._id).slice(-8)}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-xs font-bold text-haveli-heading px-3 py-1 bg-haveli-section border border-haveli-border rounded-lg inline-block shadow-inner">
                        Suite {order.roomNo}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-haveli-heading">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs text-haveli-body font-light italic leading-relaxed max-w-xs">{order.foodItems}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="text-xs font-bold text-haveli-heading">{order.quantity}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-[11px] text-haveli-muted uppercase tracking-tighter">
                        {order.date ? new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-haveli-primary font-display">₹{(order.totalAmount || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDelete(order.id || order._id)} 
                        className="w-10 h-10 rounded-xl bg-[#fef2f2] text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm inline-flex items-center justify-center border border-red-100"
                        title="Discard Order"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-20 text-center text-haveli-muted font-light italic tracking-widest">
                    No culinary orders found in the current registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default OrderFoodPanel;