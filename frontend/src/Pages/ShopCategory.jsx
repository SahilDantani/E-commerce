import React, { useContext, useState } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContex'
import Item from '../Components/Item/Item'

const PRODUCTS_PER_PAGE = 12;

const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  const [visibleCounts,setVisibleCounts] = useState({});

  // handle visiblity of products on each category
  const visibleCount = visibleCounts[props.category] || PRODUCTS_PER_PAGE;
  const filteredProducts = all_product.filter(item => props.category === item.category);
  const productsToShow = filteredProducts.slice(0, visibleCount);
  
  const handleExploreMore = () => {
    setVisibleCounts(prev => ({
      ...prev,
      [props.category]: (prev[props.category] || PRODUCTS_PER_PAGE) + PRODUCTS_PER_PAGE
    }));
  };

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
     
      <div className="shopcategory-products">
        {productsToShow.map((item) => (
          <Item key={item.id} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
        ))}
      </div>
      {visibleCount < filteredProducts.length && (
        <div className="shopcategory-loadmore" onClick={handleExploreMore} style={{ cursor: 'pointer' }}>
          Explore More
        </div>
      )}
    </div>
  )
}

export default ShopCategory