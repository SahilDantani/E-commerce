import React, { useEffect, useState, forwardRef } from 'react'
import './NewCollections.css'
import Item from '../Item/Item'
import Loader from '../Loader/Loader'
const API_URL = process.env.REACT_APP_API_URL;


const NewCollections = forwardRef((props, ref) => {

  const [new_collection,setNew_collection] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    fetch(`${API_URL}/newcollection`)
    .then((response)=>response.json())
    .then((data)=>{
      setNew_collection(data);
      setLoading(false);
    });
  },[])

  return (
    <div className='new-collections' ref={ref}>
        <h1>NEW COLLECTIONS</h1>
        <hr />
        {loading ? (
          <Loader />
        ) : (
         <div className="collections">
           {new_collection.map((item, i) => (
              <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
           ))}
          </div>
        )}
    </div>
  )
})

export default NewCollections