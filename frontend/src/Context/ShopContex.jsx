import React, { createContext, useEffect, useState } from 'react'
const API_URL = process.env.REACT_APP_API_URL;

export const ShopContext = createContext(null);

  const getDefaultCart = ()=>{
        let cart = {};
        return cart;
    }

const ShopContextProvider = (props)=>{
    const [all_product,setAll_Product] = useState([]);
    const[cartItems,setCartItems] = useState(getDefaultCart());
    
    useEffect(()=>{
        fetch(`${API_URL}/allproducts`)
        .then((response)=>response.json())
        .then((data)=>setAll_Product(data));

        if(localStorage.getItem('auth-token')){
            fetch(`${API_URL}/getcart`,{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json'
                },
                body:'',
            }).then((response)=>response.json()).then((data)=>{
                setCartItems(data||{});
            });
        }
    },[])

    const addToCart = (itemId, size='M')=>{
      const key =`${itemId}_${size}`;
      setCartItems((prev)=>{
            const prevEntry = prev[key];
            if (prevEntry) {
                return {...prev, [key]: { ...prevEntry, quantity: prevEntry.quantity + 1 }};
            } else {
                return {...prev, [key]: { quantity: 1, size, itemId }};
            }
        });
    if(localStorage.getItem('auth-token')){
      fetch(`${API_URL}/addtocart`,{
        method:'POST',
        headers:{
          Accept:'application/form-data',
          'auth-token':`${localStorage.getItem('auth-token')}`,
          'Content-Type':'application/json',
        },
        body:JSON.stringify({'itemId':itemId, size}),
      })
      .then((response)=>response.json())
      .then((data)=>console.log(data));
    }
    }
    
    
    const removeFromCart = (itemId, size='M')=>{
    const key = `${itemId}_${size}`;
    setCartItems((prev)=>{
            const prevEntry = prev[key];
            if (prevEntry && prevEntry.quantity > 1) {
                return {...prev, [key]: { ...prevEntry, quantity: prevEntry.quantity - 1 }};
            } else {
                const newCart = {...prev};
                delete newCart[key];
                return newCart;
            }
        });
    if(localStorage.getItem('auth-token')){
      fetch(`${API_URL}/removefromcart`,{
        method:'POST',
        headers:{
          Accept:'application/form-data',
          'auth-token':`${localStorage.getItem('auth-token')}`,
          'Content-Type':'application/json',
        },
        body:JSON.stringify({'itemId':itemId, size}),
      })
      .then((response)=>response.json())
      .then((data)=>console.log(data));
    }
  }

    const getTotalCartAmount = ()=>{
    let totalAmount=0;
    for(const key in cartItems){
            const entry = cartItems[key];
            if(entry && entry.quantity > 0){
                let itemInfo = all_product.find((product)=>product.id===Number(entry.itemId));
                if(itemInfo)
                    totalAmount += itemInfo.new_price * entry.quantity;
            }
        }
    return totalAmount;
  }

    const getTotalCartItems = ()=>{
    let totalItem = 0;
    for(const key in cartItems){
            const entry = cartItems[key];
            if(entry && entry.quantity > 0){
                totalItem+=entry.quantity;
            }
        }
    return totalItem;
  }

    const contextValue = {getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart};

    return(
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider