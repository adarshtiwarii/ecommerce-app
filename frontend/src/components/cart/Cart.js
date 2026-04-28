import React from 'react';
import { useCart } from '../../context/CartContext';
import { FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, totalItems, totalPrice, dispatch } = useCart();
  const delivery = totalPrice > 500 ? 0 : 40;
  const grandTotal = totalPrice + delivery;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold">Your cart is empty</h2>
        <Link to="/" className="text-blue-600 mt-2 inline-block">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded shadow-sm flex gap-4">
                <img src={item.imageUrl || '/placeholder.png'} alt={item.name} className="w-24 h-24 object-contain" />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-blue-600 font-bold">₹{item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <select
                      value={item.quantity}
                      onChange={(e) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: parseInt(e.target.value) } })}
                      className="border rounded p-1"
                    >
                      {[...Array(5)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })} className="text-red-500"><FaTrashAlt /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="font-semibold border-b pb-2">Price Details</h3>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between"><span>Subtotal ({totalItems} items)</span><span>₹{totalPrice}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span></div>
              <div className="border-t pt-2 flex justify-between font-semibold"><span>Total</span><span>₹{grandTotal}</span></div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded mt-4">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;   // ✅ Ensure default export