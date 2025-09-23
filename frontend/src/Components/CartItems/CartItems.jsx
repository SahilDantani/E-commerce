import React, { useContext, useState, useEffect } from 'react'
import ConfirmOrderForm from '../ConfirmOrderForm/ConfirmOrderForm'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContex'
import remove_icon from '../Assets/cart_cross_icon.png'

function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user?.id || null;
  } catch {
    return null;
  }
}

const API_URL = process.env.REACT_APP_API_URL;

const CartItems = () => {
    const {getTotalCartAmount,all_product,cartItems,removeFromCart,setCartItems} = useContext(ShopContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('auth-token'));
    const [userId, setUserId] = useState(getUserIdFromToken(localStorage.getItem('auth-token')));

    const getOrderSummaryKey = (id) => id ? `order-summary-${id}` : null;

    useEffect(() => {
      const checkAuth = () => {
        const token = localStorage.getItem('auth-token');
        const id = getUserIdFromToken(token);
        setIsLoggedIn(!!token);
        setUserId(id);
        if (!token) {
          setCartItems({});
          setOrderResult(null);
        } else if(id){
          // Restore order summary if present
          const savedOrder = localStorage.getItem(getOrderSummaryKey(id));
          if (savedOrder) {
            setOrderResult(JSON.parse(savedOrder));
          }else{
            setOrderResult(null);
          }
        }
      };
      window.addEventListener('storage', checkAuth);
      return () => window.removeEventListener('storage', checkAuth);
    }, [setCartItems]);

    // Also check auth on mount (in case of reload)
     useEffect(() => {
      const token = localStorage.getItem('auth-token');
      const id = getUserIdFromToken(token);
      setIsLoggedIn(!!token);
      setUserId(id);
      if (token && id) {
        const savedOrder = localStorage.getItem(getOrderSummaryKey(id));
        if (savedOrder) {
          setOrderResult(JSON.parse(savedOrder));
        } else {
          setOrderResult(null);
        }
      } else {
        setCartItems({});
        setOrderResult(null);
      }
    }, [setCartItems]);

    // Save order summary for this user
    useEffect(() => {
      if (orderResult && userId) {
        localStorage.setItem(getOrderSummaryKey(userId), JSON.stringify(orderResult));
      }
    }, [orderResult, userId]);

    const handleOrderConfirm = async (userDetails) => {
      setOrderLoading(true);
      try {
        // Prepare order items
        const items = Object.values(cartItems)
          .filter(entry => entry && entry.quantity > 0)
          .map(entry => {
            const product = all_product.find(p => p.id === Number(entry.itemId));
            return {
              product_id: entry.itemId,
              quantity: entry.quantity,
              size: entry.size,
              product_price: product ? product.new_price : 0
            };
          });
        const total_price = getTotalCartAmount();

        const res = await fetch(`${API_URL}/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({
            user: userDetails,
            items,
            total_price
          })
        });
        const data = await res.json();
        if (data.success) {
          setOrderResult(data.order); // Save order for display
          setCartItems({}); // Empty cart
          setShowConfirm(false);
          if (userId) {
            localStorage.setItem(getOrderSummaryKey(userId), JSON.stringify(data.order));
          }
        } else {
          alert(data.error || 'Order failed');
        }
      } catch (err) {
        alert('Order failed');
      } finally {
        setOrderLoading(false);
      }
    };
    
    if (!isLoggedIn) {
      return (
        <div className="cartitems">
          <h2>Please log in to view your cart and orders.</h2>
        </div>
      );
    }
    
  return (
    <div className='cartitems'>
        <div className="cartitems-format-main">
            <p>Products</p>
            <p>Title</p>
            <p>Size</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
        </div>
        <hr />
        {Object.values(cartItems).map((entry, idx) => {
                if(entry && entry.quantity > 0){
                    const e = all_product.find(p => p.id === Number(entry.itemId));
                    if(!e) return null;
                    return (
                        <div key={entry.itemId + '_' + entry.size}>
                            <div className="cartitems-format cartitems-format-main">
                                <img src={e.image} alt="" className="carticon-product-icon" />
                                <p>{e.name}</p>
                                <p>{entry.size || 'M'}</p>
                                <p>${e.new_price}</p>
                                <button className="cartitems-quantity">{entry.quantity}</button>
                                <p>${e.new_price * entry.quantity}</p>
                                <img className='cartitems-remove-icon' src={remove_icon} onClick={()=>{removeFromCart(entry.itemId, entry.size)}} alt="" />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
        <div className="cartitems-down">
            <div className="cartitems-total">
                <h1>cart Totals</h1>
                <div>
                    <div className="cartitems-total-item">
                        <p>Subtotal</p>
                        <p>${getTotalCartAmount()}</p>
                    </div>
                    <hr />
                    <div className='cartitems-total-item'>
                        <p>Shipping Fee</p>
                        <p>Free</p>
                    </div>
                    <hr />
                    <div className='cartitems-total-item'>
                        <h3>Total</h3>
                        <h3>${getTotalCartAmount()}</h3>
                    </div>
                </div>
                <button onClick={()=>setShowConfirm(true)}>PROCEED TO CHECKOUT</button>
            </div>
            <div className="cartitems-promocode">
                <p>If you have a promo code, Enter it here</p>
                <div className="cartitems-promobox">
                    <input type="text" placeholder='promo code' />
                    <button>Submit</button>
                </div>
            </div>
        </div>
         {showConfirm && (
          <ConfirmOrderForm
            onClose={() => setShowConfirm(false)}
            onConfirm={handleOrderConfirm}
            loading={orderLoading}
          />
        )}
        {orderResult && (
          <div className="order-item-summary">
            <h2>Order Placed!</h2>
            <div className="orderitems-format-main">
            <p>Products</p>
            <p>Title</p>
            <p>Size</p>
            <p>Quantity</p>
            </div>
            <hr />
            {orderResult.items.map((item, idx) => {
              const product = all_product.find(p => p.id === Number(item.product_id));
              return (
                <div className="orderitems-format orderitems-format-main" key={item.product_id + '_' + item.size}>
                  <img src={product?.image} alt="" className="carticon-product-icon" />
                  <p>{product?.name}</p>
                  <p>{item.size}</p>
                  <p>{item.quantity}</p>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

export default CartItems