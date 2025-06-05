"use client";
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(2); // Mobile
      } else {
        setVisibleCount(4); // Desktop
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const handleClick = (id: string) => {
    router.push(`/product/${id}`);
  };

  const getVisibleProducts = () => {
    if (products.length === 0) return [];
    let visible: Product[] = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(products[(productIndex + i) % products.length]);
    }
    return visible;
  };

  const visibleProducts = getVisibleProducts();

  /**
   * Framer Motion variants
   */
  const heroVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const buttonContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.8 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const carouselVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5, ease: "easeIn" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: { scale: 1.03 },
    tap: { scale: 0.97 },
  };

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

      <section className="relative z-10 text-center mt-40 w-full max-w-7xl">
        {/* === Hero Title & Subtitle === */}
        <motion.h1
          className="text-5xl font-bold mb-4 tracking-widest"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          LafdaClub
        </motion.h1>
        <motion.p
          className="text-lg text-gray-100 mb-8 drop-shadow-2xl"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          Merch. Mayhem. Madness. Mayank.
        </motion.p>

        {/* === Buttons === */}
        <motion.div
          className="flex gap-4 justify-center mb-10"
          variants={buttonContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.a
            href="/merch"
            className="bg-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Explore Merch
          </motion.a>
          <motion.a
            href="/play"
            className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Enter Arena
          </motion.a>
        </motion.div>

{/* <div className="absolute font-semibold scale-150 left-12">Top Picks</div> */}
        {/* === Product Carousel === */}
        <div className="w-full relative mt-30">
          
          {/* Left Arrow */}
          <motion.button
            onClick={() =>
              setProductIndex((prev) =>
                (prev - 1 + products.length) % products.length
              )
            }
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdArrowBackIos size={20} />
          </motion.button>

          {/* Right Arrow */}
          <motion.button
            onClick={() =>
              setProductIndex((prev) => (prev + 1) % products.length)
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdArrowForwardIos size={20} />
          </motion.button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-8 -mt-10">
            <AnimatePresence initial={false} mode="wait">
              {visibleProducts.map((product) => (
                <motion.div
                  key={product._id + "-" + productIndex} // combine index so AnimatePresence sees a new key each slide
                  className="relative overflow-hidden group cursor-pointer hover:scale-110"
                  variants={carouselVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  onClick={() => handleClick(product._id)}
                >
                  {/* Product Image */}
                  <motion.img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  />

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />

                  {/* Name & Price */}
                  <motion.div
                    className="absolute bottom-2 left-3 text-white text-sm font-semibold max-w-[50%] truncate"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {product.name}
                  </motion.div>
                  <motion.div
                    className="absolute bottom-2 right-3 text-pink-400 text-sm font-bold"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    >
                    ₹{product.price}
                  </motion.div>

                  
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

    </main>
  );
}
