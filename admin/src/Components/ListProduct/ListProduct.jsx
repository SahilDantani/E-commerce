import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'
const API_URL = import.meta.env.VITE_API_URL;

const ListProduct = () => {

  const [allproducts,setAllProducts] = useState([]);

  const fetchInfo = async()=>{
    await fetch(`${API_URL}/allproducts`)
    .then((res)=>res.json())
    .then((data)=>{setAllProducts(data)})
  }

  useEffect(()=>{
    fetchInfo();
  },[])

  const removeProduct=async(id)=>{
    await fetch(`${API_URL}/removeproduct/${id}`,{
      method:'DELETE',
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json'
      }
    })
    await fetchInfo();
  }

  return (
    <div className='list-product'>
      <h1>All Products LIst</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product)=>{
          return<React.Fragment key={product.id}> 
          <div  className="listproduct-format-main listproduct-format">
            <img src={product.image} alt="" className="listproduct-product-icon" />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            <img onClick={()=>{removeProduct(product.id)}} className='listproduct-remove-icon' src={cross_icon} alt="" />
          </div>
          <hr />
          </React.Fragment>
        })}
      </div>
    </div>
  )
}

export default ListProduct