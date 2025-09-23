import React, { useEffect, useState } from 'react';
import './OrderList.css';

const API_URL = import.meta.env.VITE_API_URL;

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div className="list-product">
      <h1>All Orders</h1>
      <div className="listproduct-format-main">
        <p>Order ID</p>
        <p>User</p>
        <p>Product ID</p>
        <p>Quantity</p>
        <p>Size</p>
        <p>Date</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {orders.map(order =>
          order.items.map((item, idx) => (
            <React.Fragment key={order.order_id + '_' + idx}>
              <div className="listproduct-format-main listproduct-format">
                <p>{order.order_id}</p>
                <p>{order.user_details?.name}</p>
                <p>{item.product_id}</p>
                <p>{item.quantity}</p>
                <p>{item.size}</p>
                <p>{new Date(order.order_date).toLocaleString()}</p>
              </div>
              <hr />
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;