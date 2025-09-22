import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'
import Loader from '../Loader/Loader'
const API_URL = process.env.REACT_APP_API_URL;


const Popular = () => {

  const[popularProducts,setPopularProducts] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    fetch(`${API_URL}/popularinwomen`)
    .then((response)=>response.json())
    .then((data)=>{
      setPopularProducts(data);
      setLoading(false);
    });
  },[]);

  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        {loading ? (
        <Loader />
        ) : (
          <div className="popular-item">
            {popularProducts.map((item, i) => (
              <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            ))}
         </div>
       )}
    </div>
  )
}

export default Popular