"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { axiosInstance } from "@/lib/axios";
import BuyButton from "@/components/BuyButton";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
};

const sizes = ["S", "M", "L", "XL"];

export default function ProductPage() {
  const { id } = useParams();
  const quantity = 1;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axiosInstance.get(`product/${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    try {
      axiosInstance.post("cart/add", {productId: id ,quantity: quantity, size: selectedSize })
      console.log("Added to Cart: ", product?._id, selectedSize);
    } catch (error) {
      console.log("Could not add to cart:", error);
    }
  };

  if (!product) return <div className="text-white p-6">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Carousel */}
        <div>
          <img
            src={product.images[activeImageIndex]}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-xl border border-gray-700"
          />
          <div className="flex mt-4 gap-3">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumb"
                className={`h-20 w-20 rounded border cursor-pointer ${i === activeImageIndex ? "border-pink-500" : "border-gray-600"}`}
                onClick={() => setActiveImageIndex(i)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-pink-400 text-2xl font-semibold">₹{product.price}</p>
          <p className="text-gray-400">{product.description}</p>
          <p className="text-sm text-gray-500">Category: {product.category}</p>

          {/* Size Selector */}
          <div>
            <label className="block mb-2 font-semibold">Select Size:</label>
            <div className="flex gap-4">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded ${selectedSize === size ? "bg-pink-600 text-white" : "border-gray-600"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Size Chart */}
          <button
            onClick={() => setShowSizeChart(true)}
            className="text-blue-400 underline text-sm"
          >
            View Size Chart
          </button>

          {/* Buy/Add Buttons */}
          <div className="flex gap-4 mt-4">
            <BuyButton product={product} className="bg-pink-500 text-white px-6 py-3 rounded-lg mt-6 cursor-pointer" />
            <button
              onClick={handleAddToCart}
              className="border border-pink-600 hover:bg-pink-600 px-6 py-2 rounded font-semibold"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md relative">
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-4 right-4 text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Size Chart</h2>
            <table className="w-full text-sm border border-gray-700 text-white">
              <thead>
                <tr>
                  <th className="border border-gray-700 px-2 py-1">Size</th>
                  <th className="border border-gray-700 px-2 py-1">Chest (in)</th>
                  <th className="border border-gray-700 px-2 py-1">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-700 px-2 py-1">S</td>
                  <td className="border border-gray-700 px-2 py-1">36</td>
                  <td className="border border-gray-700 px-2 py-1">26</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-2 py-1">M</td>
                  <td className="border border-gray-700 px-2 py-1">38</td>
                  <td className="border border-gray-700 px-2 py-1">27</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-2 py-1">L</td>
                  <td className="border border-gray-700 px-2 py-1">40</td>
                  <td className="border border-gray-700 px-2 py-1">28</td>
                </tr>
                <tr>
                  <td className="border border-gray-700 px-2 py-1">XL</td>
                  <td className="border border-gray-700 px-2 py-1">42</td>
                  <td className="border border-gray-700 px-2 py-1">29</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold mb-6">User Reviews</h2>
        <div className="space-y-6">
          {/* Dummy Reviews */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="font-semibold">John Doe</p>
            <p className="text-sm text-gray-400">“Great quality, super comfy!”</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="font-semibold">Ayesha K</p>
            <p className="text-sm text-gray-400">“Loved the print. Sizes are accurate.”</p>
          </div>
        </div>
      </section>
    </main>
  );
}
