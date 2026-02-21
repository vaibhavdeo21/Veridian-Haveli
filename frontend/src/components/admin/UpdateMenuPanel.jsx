import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

// --- Main Component ---
const UpdateMenuPanel = () => {
  const { foodMenu, addFoodItem, editFoodItem, deleteFoodItem } = useData();
  const { showNotification } = useNotification();
  
  const [editingItem, setEditingItem] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (categoryKey, item) => {
    setEditingItem({ categoryKey, item });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (categoryKey, itemId) => {
    if (window.confirm('Are you sure you want to delete this item? It will be removed from the public menu immediately.')) {
      deleteFoodItem(categoryKey, itemId);
      showNotification('Food item deleted!', 'success');
    }
  };

  const handleAddNewClick = (categoryKey) => {
    setEditingItem({ categoryKey, item: null }); 
    setIsModalOpen(true);
  };

  const handleModalSave = (categoryKey, itemDetails) => {
    if (editingItem.item) {
      editFoodItem(categoryKey, editingItem.item._id || editingItem.item.id, itemDetails);
    } else {
      addFoodItem(categoryKey, itemDetails);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div id="update-menu-panel" className="animate-fadeIn">
      <div className="mb-10">
        <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Culinary Curator</p>
        <h2 className="text-3xl font-bold text-haveli-heading font-display">Manage Food Menu</h2>
      </div>

      <div className="lux-card p-0 overflow-hidden border-haveli-border shadow-sm bg-white mb-12">
        <div className="p-8 border-b border-haveli-border bg-haveli-section flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Digital Gastronomy Menu</h3>
            <p className="text-[10px] text-haveli-muted mt-1 uppercase font-bold tracking-widest opacity-70">Customer-Facing Selection Control</p>
          </div>
        </div>
        
        <div className="p-8 space-y-10">
          {Object.entries(foodMenu).map(([categoryKey, category]) => (
            <div key={categoryKey} className="border border-haveli-border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-haveli-bg/50 p-5 flex justify-between items-center border-b border-haveli-border">
                <div>
                    <h4 className="text-sm font-bold text-haveli-heading uppercase tracking-widest">{category.name}</h4>
                    <span className="text-[9px] font-bold text-haveli-muted uppercase tracking-tighter opacity-70">Serving Time: {category.time}</span>
                </div>
                <button 
                  onClick={() => handleAddNewClick(categoryKey)}
                  className="btn btn-primary py-1.5 px-4 text-[10px] shadow-sm"
                >
                  <i className="fas fa-plus mr-2 text-[8px]"></i> Add Culinary Item
                </button>
              </div>
              <ul className="divide-y divide-haveli-border bg-white">
                {category.items.map(item => (
                  <li key={item._id || item.id} className="p-6 flex justify-between items-center transition-colors hover:bg-haveli-section/20">
                    <div className="flex items-center space-x-6">
                      <div className="relative group">
                        <img 
                            src={item.image && item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                            alt={item.name} 
                            className="w-24 h-24 object-cover rounded-xl border border-haveli-border bg-haveli-bg shadow-inner transition-transform group-hover:scale-105 duration-500" 
                            onError={(e) => e.target.src = 'https://placehold.co/100x100/f3f4f6/9ca3af?text=Img'}
                        />
                        <div className="absolute inset-0 rounded-xl bg-haveli-dark/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                            <i className="fas fa-search-plus text-white text-xs"></i>
                        </div>
                      </div>
                      <div className="max-w-md">
                        <p className="text-lg font-bold font-display text-haveli-heading">{item.name}</p>
                        <p className="text-xs text-haveli-body font-light italic mt-1 leading-relaxed">{item.description || item.desc}</p>
                        <p className="text-sm font-bold text-haveli-primary mt-3 font-display">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleEditClick(categoryKey, item)} 
                        className="w-10 h-10 rounded-xl bg-haveli-bg border border-haveli-border text-haveli-accent hover:bg-haveli-section transition-all shadow-sm flex items-center justify-center"
                        title="Edit Item"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(categoryKey, item._id || item.id)} 
                        className="w-10 h-10 rounded-xl bg-[#fef2f2] border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        title="Delete Item"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Adding/Editing Food */}
      {isModalOpen && (
        <FoodItemModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          categoryKey={editingItem.categoryKey}
          item={editingItem.item}
          showNotification={showNotification} 
        />
      )}
    </div>
  );
};

// --- Sub-Component: Food Item Modal ---
const FoodItemModal = ({ isOpen, onClose, onSave, categoryKey, item, showNotification }) => {
  const [details, setDetails] = useState({
    name: item?.name || '',
    desc: item?.description || item?.desc || '',
    price: item?.price || '',
    imageFile: null, 
  });

  const [imagePreview, setImagePreview] = useState(
      item?.image ? (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) : null
  );

  const handleChange = (e) => {
    setDetails(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file)); 
      setDetails(prev => ({ ...prev, imageFile: file })); 
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!details.name || !details.desc || !details.price) {
      showNotification('Required fields missing.', 'error');
      return;
    }
    if (!item && !details.imageFile) {
        showNotification('A culinary image is mandatory.', 'error');
        return;
    }
    onSave(categoryKey, details);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl border border-haveli-border shadow-2xl max-w-lg w-full p-10 relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent opacity-50"></div>
        
        <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold font-display text-haveli-heading">{item ? 'Refine' : 'Add'} Culinary Entry</h3>
            <button onClick={onClose} className="text-haveli-muted hover:text-red-500 transition-colors">
                <i className="fas fa-times text-lg"></i>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <FormInput label="Dish Nomenclature" id="name" value={details.name} onChange={handleChange} required placeholder="e.g. Saffron Infused Biryani" />
            <FormInput label="Culinary Description" id="desc" value={details.desc} onChange={handleChange} required placeholder="Ingredients, preparation, or origin..." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <FormInput label="Folio Price (₹)" id="price" value={details.price} onChange={handleChange} type="number" required />
                <div>
                    <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2">Culinary Imagery</label>
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                        className="w-full text-[9px] text-haveli-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-haveli-deep file:text-haveli-accent hover:file:bg-haveli-primary hover:file:text-white cursor-pointer transition-all"
                    />
                </div>
            </div>
            
            {imagePreview && (
              <div className="pt-4 border-t border-haveli-border border-dashed">
                <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-3">Composition Preview</p>
                <img src={imagePreview} alt="Food preview" className="w-full h-40 object-cover rounded-xl border border-haveli-border shadow-inner" />
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 h-12">
              Dismiss
            </button>
            <button type="submit" className="btn btn-primary flex-1 h-12 shadow-md">
              Archive Dish
            </button>
          </div>
        </form>
        
        <p className="text-center text-[9px] text-haveli-muted mt-6 uppercase tracking-tighter italic">
          Changes will reflect across the digital guest experience immediately upon saving.
        </p>
      </div>
    </div>
  );
};

// Helper component
const FormInput = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2 ml-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full px-5 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-medium text-haveli-heading placeholder:opacity-40"
    />
  </div>
);

export default UpdateMenuPanel;