import React,{ useContext } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { ShopContext } from '../../Context/ShopContex';

const RelatedProducts = (prop) => {


    const { all_product } = useContext(ShopContext);

    if (!prop.product) return null;
    const {product} = prop;
    const category = product.category;

    let relatedProducts = all_product.filter((Product) => Product.category === category && Product.id !== product.id);
    relatedProducts = relatedProducts.slice(0, 4);


  return (
    <div className='relatedproducts'>
        <h1>Related Products</h1>
        <hr />
        <div className="relatedproducts-item">
            {relatedProducts.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}

export default RelatedProducts