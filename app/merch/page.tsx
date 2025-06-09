"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { axiosInstance } from "@/lib/axios";
import Loading from "@/components/Loading";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "react-toastify";

type Product = {
  _id: string;
  name: string;
  images: string[];
  price: number;
};

export default function MerchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {authUser} = useAuthStore();
  const {openLogin} = useModalStore();
  const [cartSubmit, setCartSubmit] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get("product/");
        setProducts(data);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    if(!authUser){
      toast.info("Login to Add to Cart");
      openLogin();
      return;
    }
    try {
      setCartSubmit(true);
      await axiosInstance.post("cart/add", { productId, quantity: 1, size: "M" });
      setCartSubmit(false); 
      toast.success("Added to Cart")
      console.log("Added to Cart:", productId);
    } catch (err) {
      setCartSubmit(false); 
      toast.error("Failed to Add to Cart")
      console.error("Could not add to cart:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 px-6">
        {error}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(/market.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(10px)",
        }}
      />
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Foreground */}
      <main className="relative z-10 text-white px-4 md:px-6 py-8 md:py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 mt-16">
          Merch Store
        </h1>

        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product._id}
              className="group overflow-hidden shadow-lg hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              {/* Image + Overlay */}
              <div className="relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={() => router.push(`/product/${product._id}`)}
                />
                {/* Overlay shows on hover (desktop only) */}
                <div className="hidden md:flex absolute bottom-0 left-0 right-0 bg-black/50 p-2 justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      if(!authUser){
                        toast.info("Login to Purchase Item")
                        openLogin();
                      }
                      else{
                        router.push(`/billing/${product._id}`)}
                      }}
                      className="bg-pink-600 hover:bg-pink-500 cursor-pointer text-white px-3 py-1 rounded-lg font-semibold transition"
                  >
                    Buy Now
                  </button>
                  <button
                  disabled={cartSubmit}
                    onClick={() => handleAddToCart(product._id)}
                    className={`bg-green-600 hover:bg-green-500 cursor-pointer text-white px-3 py-1 rounded-lg font-semibold transition ${cartSubmit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {cartSubmit ? "Adding..." : "Add To Cart"}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="py-2 flex flex-col items-start md:items-start">
                <h2 className="text-xl   text-center md:text-left">
                  {product.name}
                </h2>
                <p className="text-pink-400 text-lg font-bold mb-4">
                  ₹{product.price}
                </p>
                {/* Mobile buttons */}
                
              </div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
