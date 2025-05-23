"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { loadScript } from "@/lib/loadRazorpay";
import { axiosInstance } from "@/lib/axios";

type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
};

// const dummyProducts: Product[] = [
//   { id: "1", name: "Lafda Tee", image: "/merch/tee.png", price: 5 },
//   { id: "2", name: "Pixel Cap", image: "/merch/cap.png", price: 4 },
//   { id: "3", name: "Glitch Hoodie", image: "/merch/hoodie.png", price: 6 },
// ];

export default function MerchPage() {
const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/product/"); // change to your backend route
        setProducts(data); // assuming your backend returns { products: Product[] }
        setLoading(false);
      } catch (err) {
        setError("Failed to load products.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const handleBuyNow = async (product: Product) => {
    const isScriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const { data } = await axiosInstance.post("order/create-order", {
        amount: product.price * 100,
        productId: product.id,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: "INR",
        name: "LafdaClub Merch",
        description: product.name,
        image: "/lafda-icon.png",
        order_id: data.order_id,
        handler: function (response: any) {
          axios.post("http://localhost:5000/api/order/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert("Payment Successful!");
        },
        prefill: {
          name: "Lafda Fan",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#f472b6" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed to start. Please try again.");
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-bold mb-10 text-center tracking-widest">Merch Store</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:scale-105 transition"
          >
            <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-pink-400 text-lg font-bold">₹{product.price}</p>
              <button
                onClick={() => handleBuyNow(product)}
                className="mt-4 w-full bg-pink-600 hover:bg-pink-500 py-2 rounded-xl font-semibold transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
