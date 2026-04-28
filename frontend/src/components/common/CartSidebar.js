import React from 'react';
import { useCart } from '../../context/CartContext';
import { FaTimes, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, totalItems, totalPrice, dispatch } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold">My Cart ({totalItems})</h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-500">No items in cart</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.imageUrl || '/placeholder.png'} alt={item.name} className="w-16 h-16 object-cover" />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-blue-600">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={item.quantity}
                      onChange={(e) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: parseInt(e.target.value) } })}
                      className="border rounded p-1 text-sm"
                    >
                      {[...Array(5)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })} className="text-red-500"><FaTrashAlt /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t p-4">
          <div className="flex justify-between font-semibold mb-3">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
          <Link to="/cart" onClick={onClose} className="block w-full bg-blue-600 text-white text-center py-2 rounded">
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;