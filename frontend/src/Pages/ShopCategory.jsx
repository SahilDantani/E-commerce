import React, { useContext, useState, useEffect } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContex'
import Item from '../Components/Item/Item'
import Loader from '../Components/Loader/Loader'

const PRODUCTS_PER_PAGE = 12;

const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  const [visibleCounts,setVisibleCounts] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [exploreLoading, setExploreLoading] = useState(false);

  useEffect(()=>{
    if(all_product.length>0){
      setInitialLoading(false);
    }
  },[all_product])

  // handle visiblity of products on each category
  const visibleCount = visibleCounts[props.category] || PRODUCTS_PER_PAGE;
  const filteredProducts = all_product.filter(item => props.category === item.category);
  const productsToShow = filteredProducts.slice(0, visibleCount);
  
  const handleExploreMore = () => {
    setExploreLoading(true);
    setTimeout(() => {
      setVisibleCounts(prev => ({
        ...prev,
        [props.category]: (prev[props.category] || PRODUCTS_PER_PAGE) + PRODUCTS_PER_PAGE
      }));
      setExploreLoading(false);
    }, 800); 
  };

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      {initialLoading ? (
        <Loader />
      ) : (
        <>
          <div className="shopcategory-products">
            {productsToShow.map((item) => (
              <Item key={item.id} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            ))}
          </div>
          {visibleCount < filteredProducts.length && (
            exploreLoading ? (
              <Loader />
            ) : (
              <button
                type="button"
                className='shopcategory-loadmore'
                onClick={handleExploreMore}
              >
                Explore More
              </button>
            )
          )}
        </>
      )}
    </div>
  )
}

export default ShopCategory