import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const API_URL = import.meta.env.VITE_API_URL;

const AddProduct = () => {

    const [image,setImage] = useState(false);
    const [loading,setLoading] = useState(false);
    const [productDetails,setProductDetails] = useState({
        name:"",
        image:"",
        category:"women",
        new_price:"",
        old_price:""
    })

    const imageHandler = (e)=>{
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, JPG, PNG, GIF)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('File size should be less than 5MB');
                return;
            }
            setImage(file);
        }
    };

    const changeHandler = (e)=>{
        setProductDetails({...productDetails,[e.target.name]:e.target.value})
    }

    const Add_Product = async () => {
        if (!image) {
            alert('Please select an image');
            return;
        }

        setLoading(true);
        
        try {
            let responseData;
            let product = productDetails;

            let formData = new FormData();
            formData.append('product', image);

            // Upload image
            const uploadResponse = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: formData,
            });

            responseData = await uploadResponse.json();

            if (responseData.success) {
                product.image = responseData.image_url;
                
                // Add product
                const addResponse = await fetch(`${API_URL}/addproduct`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product)
                });

                const addData = await addResponse.json();
                
                if (addData.success) {
                    alert("Product Added Successfully");
                    // Reset form
                    setProductDetails({
                        name: "",
                        image: "",
                        category: "women",
                        new_price: "",
                        old_price: ""
                    });
                    setImage(false);
                } else {
                    alert("Failed to add product");
                }
            } else {
                alert(`Upload failed: ${responseData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className='add-product'>
        <div className="addproduct-itemfield">
            <p>Product title</p>
            <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
        </div>
        <div className="addproduct-price">
            <div className="addproduct-itemfield">
                <p>Price</p>
                <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type here' />
            </div>
            <div className="addproduct-itemfield">
                <p>Offer Price</p>
                <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type here' />
            </div>
        </div>
        <div className="addproduct-itemfield">
            <p>Product category</p>
            <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-selector'>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kid">Kid</option>
            </select>
        </div>
        <div className="addproduct-itemfield">
            <label htmlFor="file-input">
                <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumbnail-img' alt="" />
            </label>
            <input onChange={imageHandler} type="file" name='image' id='file-input' accept='image/*' hidden />
        </div>
        <button onClick={()=>{Add_Product()}} className='addproduct-btn' disabled={loading}>{loading?'Adding...':'ADD'}</button> 
    </div>
    //{Add_Product only?}
  )
}

export default AddProduct