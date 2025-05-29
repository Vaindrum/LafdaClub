"use client";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productIndex, setProductIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axiosInstance.get<Product[]>("product/");
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setProductIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [products]);

  const visibleCount = 4;
  const getVisibleProducts = () => {
    if (products.length === 0) return [];
    let visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(products[(productIndex + i) % products.length]);
    }
    return visible;
  };

  const handleClick = (id: string) => {
    router.push(`/product/${id}`);
  };

  const visibleProducts = getVisibleProducts();

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-between text-white px-6 py-10 overflow-hidden"
      style={{
        backgroundImage: `url(/garden.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Blur overlay */}
        <div className="absolute inset-0 bg-black/0.5 backdrop-blur-sm z-0" />

      {/* <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0" /> */}

      <section className="relative z-10 text-center mt-40 w-full max-w-7xl ">
        <h1 className="text-5xl font-bold mb-4 tracking-widest ">LafdaClub</h1>
        <p className="text-lg text-gray-100 mb-8 drop-shadow-2xl drop-shadow-black">Merch. Mayhem. Madness. Mayank.</p>

        <div className="flex gap-4 justify-center mb-10">
          <a
            href="/merch"
            className="bg-pink-600 hover:bg-pink-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Explore Merch
          </a>
          <a
            href="/game"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-xl transition"
          >
            Enter Arena
          </a>
        </div>

        {/* Product Carousel */}
        <div className="w-full relative mt-30">
          <button
            onClick={() =>
              setProductIndex((prev) =>
                (prev - 1 + products.length) % products.length
              )
            }
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20"
          >
            <MdArrowBackIos />
          </button>

          <button
            onClick={() =>
              setProductIndex((prev) => (prev + 1) % products.length)
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20"
          >
            <MdArrowForwardIos />
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8">
            {visibleProducts.map((product) => (
              <div
                key={product._id}
                className="relative rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {handleClick(product._id)}}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-3 text-white text-sm font-semibold">
                  {product.name}
                </div>
                <div className="absolute bottom-2 right-3 text-pink-400 text-sm font-bold">
                  ₹{product.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mt-32 text-sm text-gray-400 text-center">
        &copy; {new Date().getFullYear()} LafdaClub. All rights reserved.
      </footer>
    </main>
  );
}
