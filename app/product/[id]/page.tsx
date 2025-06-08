"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import StarRating from "@/components/StarRating";
import ReviewSection from "@/components/ReviewSection";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import Loading from "@/components/Loading"; 
import { useModalStore } from "@/stores/useModalStore";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
};

type Comment = {
  _id: string;
  user: { _id: string; username: string };
  text: string;
  likes: string[];
  dislikes: string[];
};

type Review = {
  _id: string;
  user: { _id: string; username: string };
  text: string;
  rating: number;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams(); // productId
  const { authUser } = useAuthStore(); // { _id, username } or null
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | "M">("M");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const {openLogin} = useModalStore();

  // New state for comment inputs, keyed by reviewId
  const [commentTextByReview, setCommentTextByReview] = useState<{
    [reviewId: string]: string;
  }>({});

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReportPrompt, setShowReportPrompt] = useState<{ reviewId: string } | null>(null);
  const [reportReason, setReportReason] = useState("");

  // 1) Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`product/${id}`);
        setProduct(data.product);
        setRecommended(data.recommended || []);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  // 2) Fetch reviews (with comments) for this product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get(`review/reviews/${id}`);
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [id]);


  // 3) Submit a new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      openLogin();
      return;
    }
    if (!reviewText.trim()) return;

    try {
      await axiosInstance.post("review/create", {
        productId: id,
        text: reviewText,
        rating: reviewRating,
      });
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      console.error("Error creating review:", err);
    }
  };

  // 4) Delete a review
  const handleDeleteReview = async (reviewId: string, authorId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    if (authUser._id !== authorId) {
      alert("You can only delete your own reviews.");
      return;
    }
    try {
      await axiosInstance.delete(`review/delete/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // 5) Like / dislike toggles for review
  const handleToggleLike = async (reviewId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`review/like/${reviewId}`);
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== reviewId) return r;
          const liked = r.likes.includes(authUser._id);
          const disliked = r.dislikes.includes(authUser._id);
          return {
            ...r,
            likes: liked
              ? r.likes.filter((uid) => uid !== authUser._id)
              : [...r.likes, authUser._id],
            dislikes: disliked
              ? r.dislikes.filter((uid) => uid !== authUser._id)
              : r.dislikes,
          };
        })
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleToggleDislike = async (reviewId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`review/dislike/${reviewId}`);
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== reviewId) return r;
          const liked = r.likes.includes(authUser._id);
          const disliked = r.dislikes.includes(authUser._id);
          return {
            ...r,
            dislikes: disliked
              ? r.dislikes.filter((uid) => uid !== authUser._id)
              : [...r.dislikes, authUser._id],
            likes: liked ? r.likes.filter((uid) => uid !== authUser._id) : r.likes,
          };
        })
      );
    } catch (err) {
      console.error("Error toggling dislike:", err);
    }
  };

  // 6) Report a review
  const handleSubmitReport = async (reviewId: string) => {
    if (!authUser) {
      openLogin();
      
    }
    if (!reportReason.trim()) return;
    try {
      await axiosInstance.post("review/report", { reviewId, reason: reportReason });
      setShowReportPrompt(null);
      setReportReason("");
      alert("Review reported.");
    } catch (err) {
      console.error("Error reporting review:", err);
    }
  };

  // 7) Submit a comment under a review
  const handleSubmitComment = async (reviewId: string) => {
    if (!authUser) {
      alert("Please log in to comment.");
      return;
    }
    const text = commentTextByReview[reviewId]?.trim();
    if (!text) return;

    try {
      await axiosInstance.post("comment/create", { reviewId, text });
      // Refresh reviews (which include comments)
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
      // Clear the input for this review
      setCommentTextByReview((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  // 8) Delete a comment
  const handleDeleteComment = async (
    commentId: string,
    commentAuthorId: string
  ) => {
    if (!authUser) {
      alert("Please log in to delete comments.");
      return;
    }
    if (authUser._id !== commentAuthorId) {
      alert("You can only delete your own comments.");
      return;
    }
    try {
      await axiosInstance.delete(`comment/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
    } catch (err) {
      console.error("ERROR DELETING COMMENT:", err);
    }
  };

  // 9) Report a comment
  const handleReportComment = async (commentId: string) => {
    if (!authUser) {
      alert("Please log in to report comments.");
      return;
    }
    const reason = prompt("Reason for reporting:");
    if (!reason?.trim()) return;
    try {
      await axiosInstance.post("comment/report", { commentId, reason });
      alert("Comment reported.");
    } catch (err) {
      console.error("Error reporting comment:", err);
    }
  };

  // 10) Like/dislike a comment
  const handleToggleLikeComment = async (commentId: string) => {
    if (!authUser) {
      alert("Please log in to like comments.");
      return;
    }
    try {
      await axiosInstance.post(`comment/like/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleToggleDislikeComment = async (commentId: string) => {
    if (!authUser) {
      alert("Please log in to dislike comments.");
      return;
    }
    try {
      await axiosInstance.post(`comment/dislike/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
    } catch (err) {
      console.error("Error disliking comment:", err);
    }
  };

  if (!product)
    return (
      <div className="text-white p-6 flex items-center justify-center h-screen bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loading />
        </motion.div>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-gray-900">
    <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${product.images[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(10px)",
        }}
      />
      <div className="absolute inset-0 bg-black/80 z-0" />
    <main className="relative z-10  text-white px-4 sm:px-6 lg:px-10 py-8 md:mx-70 mb-12 md:mb-0">
      {/* Product Info */}
      <motion.section
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 md:mt-20 "
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {/* Image */}
        <motion.div
          className="w-full"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-auto max-h-[400px] object-contain bg-white rounded-xl border border-gray-700"
          />
          <div className="flex gap-2 mt-4 overflow-hidden">
            {product.images.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                alt={`thumb-${i}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Replace main image on click
                  setProduct((prev) =>
                    prev
                      ? { ...prev, images: [img, ...prev.images.filter((_, idx) => idx !== i)] }
                      : prev
                  );
                }}
                className={`h-16 w-16 flex-shrink-0 rounded border cursor-pointer ${img === product.images[0]
                    ? "border-pink-500"
                    : "border-gray-600"
                  }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          className="space-y-6"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
          <p className="text-pink-400 text-2xl lg:text-3xl font-semibold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="text-gray-300">{product.description}</p>
          <p className="text-sm text-gray-500">Category: {product.category}</p>

{/* Size Selection */}
            <div>
              <h4 className="font-medium mb-2">Select Size:</h4>
              <div className="flex gap-2 flex-wrap">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 rounded-lg font-semibold transition cursor-pointer
                      ${selectedSize === size ? "bg-pink-600 text-white" : "bg-gray-800 text-gray-300"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSizeChart(true)}
                className="mt-2 text-sm text-pink-500 cursor-pointer hover:text-pink-400"
              >
                View Size Chart
              </button>
            </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              onClick={() => {
                if(!authUser){
                  openLogin();
                }
                else{
                  router.push(`/billing/${product._id}`)}
                }}
              className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Buy Now
            </motion.button>
            <motion.button
              onClick={() =>{
              if(!authUser){
                openLogin();
              }
              else{
                axiosInstance.post("cart/add", {
                  productId: product._id,
                  quantity: 1,
                  size: selectedSize
                })
              }}}
              className="border border-pink-600 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Add to Cart
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Reviews Section */}
      <ReviewSection productId={product._id} authUser={authUser} />

      {/* You May Also Like */}
        {recommended.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommended.map((rec) => (
                <Link
                  key={rec._id}
                  href={`/product/${rec._id}`}
                  className=" hover:shadow-lg transition"
                >
                  <img
                    src={rec.images[0]}
                    alt={rec.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  <h3 className="mt-2 font-semibold text-sm truncate">
                    {rec.name}
                  </h3>
                  <p className="text-pink-400 font-semibold">
                    ₹{rec.price.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      {/* Report Prompt Modal */}
      {showReportPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">
              Report Review
            </h4>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              placeholder="Reason for reporting"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <motion.button
                onClick={() => {
                  handleSubmitReport(showReportPrompt.reviewId);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Submit Report
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

       {/* Size Chart Modal */}
        {showSizeChart && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-lg w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between">

              <h3 className="text-xl font-semibold mb-4">Size Chart</h3>
              <div className="text-right">
                <button
                  onClick={() => setShowSizeChart(false)}
                  className="px-2 py-2 bg-gray-600 text-white rounded-full hover:bg-pink-500 cursor-pointer"
                  >
                  <FiX size={20}/>
                </button>
                  </div>
              </div>
              <table className="w-full text-left table-auto mb-4">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Chest (inches)</th>
                    <th className="px-4 py-2">Waist (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="px-4 py-1">XS</td><td className="px-4 py-1">32-34</td><td className="px-4 py-1">26-28</td></tr>
                  <tr><td className="px-4 py-1">S</td><td className="px-4 py-1">34-36</td><td className="px-4 py-1">28-30</td></tr>
                  <tr><td className="px-4 py-1">M</td><td className="px-4 py-1">38-40</td><td className="px-4 py-1">32-34</td></tr>
                  <tr><td className="px-4 py-1">L</td><td className="px-4 py-1">42-44</td><td className="px-4 py-1">36-38</td></tr>
                  <tr><td className="px-4 py-1">XL</td><td className="px-4 py-1">46-48</td><td className="px-4 py-1">40-42</td></tr>
                  <tr><td className="px-4 py-1">XXL</td><td className="px-4 py-1">50-52</td><td className="px-4 py-1">44-46</td></tr>
                </tbody>
              </table>
            </motion.div>
          </div>
        )}
    </main>
    </div>
  );
}
