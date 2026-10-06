import React, { useContext, useEffect, useState } from 'react'
import { Shopcontext } from '../context/Shopcontext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import Productitem from '../components/Productitem'

export default function Collection() {
  const { products,search,showsearch} = useContext(Shopcontext)
  const [showfilter, setshowfilter] = useState(false)
  const [filterproducts, setfilterproducts] = useState([])
  const [category, setcategory] = useState([])
  const [subCategory, setsubcategory] = useState([])
  const [sortType, setsorttype] = useState("relavent")

  const togglecategory = (e) => {
    if (category.includes(e.target.value)) {
      setcategory(prev => prev.filter(items => items !== e.target.value)) //  "women" !== "men" kept
    } else {
      setcategory(prev => [...prev, e.target.value])
    }
  }

  const togglesubcategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setsubcategory(prev => prev.filter(items => items !== e.target.value))
    } else {
      setsubcategory(prev => [...prev, e.target.value])
    }
  }

  //  useEffect(()=>{
  //   setfilterproducts(products)
  //  },[])

  useEffect(() => {
    applyfilter()
  }, [category, subCategory, products,search,showsearch])

  useEffect(() => {
    sortproducts()
  }, [sortType])

  const applyfilter = () => {

    let productscopy = products.slice()
    // console.log("Selected Subcategory:", subCategory)
    if(showsearch && search){
      productscopy = productscopy.filter(items => items.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (category.length > 0) {
      productscopy = productscopy.filter(items => category.includes(items.category))
    }
    if (subCategory.length > 0) {
      productscopy = productscopy.filter(items => subCategory.includes(items.subCategory))
    }
    setfilterproducts(productscopy)
  }

  const sortproducts = () => {
    let fpcopy = filterproducts.slice()
    switch (sortType) {
      case "low-high":
        setfilterproducts(fpcopy.sort((a, b) => (a.price - b.price)))
        break;
      case "high-low":
        setfilterproducts(fpcopy.sort((a, b) => (b.price - a.price)))
        break;
      default:
        applyfilter()
        break;
    }
  }

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* {filter options} */}
      <div className='min-w-60'>
        <p onClick={() => setshowfilter(!showfilter)} className='my-2 text-xl flex item-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden ${showfilter ? "rotate-90" : ""}`} src={assets.dropdown_icon} alt="" />
        </p>

        {/* {category filter} */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showfilter ? "" : "hidden"}`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={"Men"} onChange={togglecategory} />Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={"Women"} onChange={togglecategory} />Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={"Kids"} onChange={togglecategory} />Kids
            </p>
          </div>
        </div>
        {/* {subcategory} */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showfilter ? "" : "hidden"}`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={"Topwear"} onChange={togglesubcategory} />Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={"Bottomwear"} onChange={togglesubcategory} />Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={"Winterwear"} onChange={togglesubcategory} />Winterwear
            </p>
          </div>
        </div>
      </div>

      {/* {Right Side} */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={"All"} text2={"Collections"} />
          {/* {product sort} */}
          <select onChange={(e) => setsorttype(e.target.value)} className='border-2 text-sm border-gray-300 px-2' name="" id="">
            <option value="relavent">Sort by: Relavent</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by:High to Low</option>
          </select>
        </div>
        {/* {Map products} */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterproducts.map((items, index) => (
              <Productitem key={index} name={items.name} id={items._id} image={items.image} price={items.price} />
            ))

          }
        </div>
      </div>
    </div>
  )
}
