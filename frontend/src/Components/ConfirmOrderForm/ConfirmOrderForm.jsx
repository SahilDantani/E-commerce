import React, { useState } from 'react';
import './ConfirmOrderForm.css';

const ConfirmOrderForm = ({ onClose, onConfirm, loading }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    onConfirm(form);
  };

  return (
    <div className="confirm-order-overlay">
      <form className="confirm-order-form" onSubmit={handleSubmit}>
        <h2>Confirm Order</h2>
        <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Name" required />
        <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Email" required />
        <input name="mobile" value={form.mobile} onChange={handleChange} type="tel" placeholder="Mobile" required />
        <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <div className="confirm-order-actions">
          <button type="submit" className="confirm-btn" disabled={loading}>{loading ? 'Confirming...' : 'Confirm'}</button>
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmOrderForm;