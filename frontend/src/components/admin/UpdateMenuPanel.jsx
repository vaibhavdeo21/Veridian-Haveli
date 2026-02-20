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
    if (window.confirm('Are you sure you want to delete this item?')) {
      // SYNC FIX: Ensure we use the correct ID from MongoDB
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
      // Edit existing item - SYNC FIX: Use _id or id correctly
      editFoodItem(categoryKey, editingItem.item._id || editingItem.item.id, itemDetails);
    } else {
      // Add new item
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
    <div id="update-menu-panel">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Website Content</h2>

      {/* --- Section: Manage Food Menu --- */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">Manage Food Menu</h3>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or delete items from the customer-facing order page.</p>
        </div>
        
        <div className="p-6 space-y-6">
          {Object.entries(foodMenu).map(([categoryKey, category]) => (
            <div key={categoryKey} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 p-4 flex justify-between items-center rounded-t-lg">
                <h4 className="text-lg font-semibold text-gray-700">{category.name} <span className="text-sm text-gray-500">({category.time})</span></h4>
                <button 
                  onClick={() => handleAddNewClick(categoryKey)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-medium text-sm"
                >
                  <i className="fas fa-plus mr-1"></i> Add Item
                </button>
              </div>
              <ul className="divide-y divide-gray-200">
                {category.items.map(item => (
                  <li key={item._id || item.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image && item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded-lg bg-gray-100" 
                        onError={(e) => e.target.src = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=Img'}
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        {/* SYNC FIX: Match backend 'description' field */}
                        <p className="text-sm text-gray-500">{item.description || item.desc}</p>
                        <p className="text-sm font-medium text-amber-700">₹{item.price}</p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleEditClick(categoryKey, item)} className="text-amber-600 hover:text-amber-800"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDeleteClick(categoryKey, item._id || item.id)} className="text-red-600 hover:text-red-800"><i className="fas fa-trash"></i></button>
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
      showNotification('Please fill out name, description and price.', 'error');
      return;
    }
    if (!item && !details.imageFile) {
        showNotification('Please upload an image.', 'error');
        return;
    }
    onSave(categoryKey, details);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <form onSubmit={handleSubmit}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">{item ? 'Edit' : 'Add'} Food Item</h3>
          <div className="space-y-4">
            <FormInput label="Item Name" id="name" value={details.name} onChange={handleChange} required />
            <FormInput label="Description" id="desc" value={details.desc} onChange={handleChange} required />
            <FormInput label="Price (₹)" id="price" value={details.price} onChange={handleChange} type="number" required />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Image</label>
              <input 
                type="file" 
                accept="image/png, image/jpeg"
                onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </div>
            {imagePreview && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Image Preview:</p>
                <img src={imagePreview} alt="Food preview" className="w-48 h-32 object-cover rounded-lg border" />
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper component
const FormInput = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  </div>
);

export default UpdateMenuPanel;