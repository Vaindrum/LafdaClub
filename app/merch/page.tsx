"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { loadScript } from "@/lib/loadRazorpay";
import { axiosInstance } from "@/lib/axios";
import { useRouter } from "next/navigation";
import BuyButton from "@/components/BuyButton";

type Product = {
  _id: string;
  name: string;
  images: string[];
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
  const router = useRouter();

const handleClick = (id: string) => {
    router.push(`/product/${id}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get("product/"); // change to your backend route
        setProducts(data); // assuming your backend returns { products: Product[] }
        setLoading(false);
      } catch (err) {
        setError("Failed to load products.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
 

  return (
    <main className="min-h-screen text-white px-6 py-10"
    style={{
        backgroundImage: `url(/market.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
      <h1 className="text-4xl font-bold mb-10 text-center tracking-widest mt-20">Merch Store</h1>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:scale-105 transition cursor-pointer"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 object-cover"
              onClick={() => handleClick(product._id)}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-pink-400 text-lg font-bold">₹{product.price}</p>
              <BuyButton product={product} />
            </div>
          </div>
        ))}
      </section>

    </main>
  );
}
