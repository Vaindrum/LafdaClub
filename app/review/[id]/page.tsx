"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import Loading from "@/components/Loading";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiTrash2,
  FiFlag,
  FiSend,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

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

export default function ReviewPage() {
  const router = useRouter();
  const { id } = useParams(); // expecting URL like /review/[reviewId]
  const { authUser } = useAuthStore(); // { _id, username } or null
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportReviewPrompt, setShowReportReviewPrompt] = useState<boolean>(false);
  const [showReportCommentPrompt, setShowReportCommentPrompt] = useState<{commentId: string;} | null>(null);
  const [showDeleteReviewPrompt, setShowDeleteReviewPrompt] = useState<boolean>(false);
  const [showDeleteCommentPrompt, setShowDeleteCommentPrompt] = useState<{commentId: string, authorId: string;} | null>(null);
  const [reportReviewReason, setReportReviewReason] = useState("");
  const [reportCommentReason, setReportCommentReason] = useState("");
  const [commentText, setCommentText] = useState("");
  const {openLogin} = useModalStore();

  // For liking/disliking comments, re-fetch review after change
  const fetchReview = async () => {
    try {
      const { data } = await axiosInstance.get(`review/${id}`);
      setReview(data);
    } catch (err) {
      console.error("Error fetching review:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [id]);

  // Delete review
  const handleDeleteReview = async () => {
    if (!authUser) {
      openLogin();
      return;
    }
    if (authUser._id !== review?.user._id) {
      alert("You can only delete your own review.");
      return;
    }
    try {
      await axiosInstance.delete(`review/delete/${id}`);
      setShowDeleteReviewPrompt(false);
      alert("Review deleted.");
      router.push("/"); // navigate away after deletion
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // Report review
  const handleReportReview = async () => {
    if (!authUser) {
      openLogin();
      return;
    }
    if (!reportReviewReason.trim()) return;
    try {
      await axiosInstance.post("review/report", {
        reviewId: id,
        reason: reportReviewReason,
      });
      setShowReportReviewPrompt(false);
      setReportReviewReason("");
      alert("Review reported.");
    } catch (err) {
      console.error("Error reporting review:", err);
    }
  };

  // Like / Dislike review
  const handleToggleLikeReview = async () => {
    if (!authUser) {
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`review/like/${id}`);
      fetchReview();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleToggleDislikeReview = async () => {
    if (!authUser) {
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`review/dislike/${id}`);
      fetchReview();
    } catch (err) {
      console.error("Error toggling dislike:", err);
    }
  };

  // Add a comment
  const handleSubmitComment = async () => {
    if (!authUser) {
      openLogin();
      return;
    }
    if (!commentText.trim()) return;
    try {
      await axiosInstance.post("comment/create", {
        reviewId: id,
        text: commentText,
      });
      setCommentText("");
      fetchReview();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Delete a comment
   const handleDeleteComment = async (commentId: string, authorId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    if (authUser._id !== authorId) {
      alert("You can only delete your own comment.");
      return;
    }
    try {
      await axiosInstance.delete(`comment/delete/${commentId}`);
      setShowDeleteCommentPrompt(null);
      alert("Comment deleted.");
      fetchReview();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Report a comment
   const handleReportComment = async (commentId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    if (!reportCommentReason.trim()) return;
    try {
      await axiosInstance.post("comment/report", {
        commentId: commentId,
        reason: reportCommentReason,
      });
      setShowReportCommentPrompt(null);
      setReportCommentReason("");
      alert("Comment reported.");
    } catch (err) {
      console.error("Error reporting comment:", err);
    }
  };
  

  // Like / Dislike comment
  const handleToggleLikeComment = async (commentId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`comment/like/${commentId}`);
      fetchReview();
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleToggleDislikeComment = async (commentId: string) => {
    if (!authUser) {
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`comment/dislike/${commentId}`);
      fetchReview();
    } catch (err) {
      console.error("Error disliking comment:", err);
    }
  };

  if (loading || !review) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loading />
      </div>
    );
  }

  const userLiked = authUser ? review.likes.includes(authUser._id) : false;
  const userDisliked = authUser
    ? review.dislikes.includes(authUser._id)
    : false;

  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <motion.div
        className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-md p-6 space-y-6 mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Review Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-lg cursor-pointer" onClick={() => router.push(`/profile/${review.user.username}`)}>{review.user.username}</p>
            <p className="flex items-center text-yellow-400">
              {Array.from({ length: 5 }, (_, i) => (
                      <FaStar
                        key={i}
                        className={i < review.rating ? "text-yellow-500" : "hidden"}
                      />
                    ))}
              {/* <span className="ml-2 text-gray-400">({review.rating}/5)</span> */}
            </p>
          </div>
          <div className="flex gap-4 text-gray-400">
            {/* Like Review */}
            <button
              onClick={handleToggleLikeReview}
              className="flex items-center gap-1 cursor-pointer"
            >
              <FiThumbsUp className={userLiked ? "text-pink-500 fill-pink-500" : ""} />
              <span>{review.likes.length}</span>
            </button>
            {/* Dislike Review */}
            <button
              onClick={handleToggleDislikeReview}
              className="flex items-center gap-1 cursor-pointer"
            >
              <FiThumbsDown
                className={userDisliked ? "text-pink-500 fill-pink-500" : ""}
              />
              <span>{review.dislikes.length}</span>
            </button>
            {/* Report Review */}
            <button className="cursor-pointer hover:text-red-500" onClick={() => setShowReportReviewPrompt(true)}>
              <FiFlag />
            </button>
            {/* Delete Review */}
            {authUser?._id === review.user._id && (
              <button onClick={() => setShowDeleteReviewPrompt(true)} className="ml-2 cursor-pointer hover:text-red-500">
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>

        {/* Review Text */}
        <p className="text-gray-200">{review.text}</p>

        {/* Comments List */}
        <div className="space-y-4">
          {review.comments.map((c) => {
            const isCommentAuthor = authUser?._id === c.user._id;
            const commentLiked = authUser ? c.likes.includes(authUser._id) : false;
            const commentDisliked = authUser
              ? c.dislikes.includes(authUser._id)
              : false;

            return (
              <motion.div
                key={c._id}
                className="bg-gray-700 p-4 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm cursor-pointer" onClick={() => router.push(`/profile/${c.user.username}`) }>
                      {c.user.username}
                    </p>
                    <p className="mt-1 text-gray-300 text-sm">
                      {c.text}
                    </p>
                  </div>
                  <div className="flex gap-3 text-gray-400">
                    {/* Like Comment */}
                    <button
                      onClick={() => handleToggleLikeComment(c._id)}
                      className="flex items-center gap-1 text-sm cursor-pointer"
                    >
                      <FiThumbsUp
                        className={commentLiked ? "text-pink-500 fill-pink-500" : ""}
                      />
                      <span>{c.likes.length}</span>
                    </button>
                    {/* Dislike Comment */}
                    <button
                      onClick={() => handleToggleDislikeComment(c._id)}
                      className="flex items-center gap-1 text-sm cursor-pointer"
                    >
                      <FiThumbsDown
                        className={commentDisliked ? "text-pink-500 fill-pink-500" : ""}
                      />
                      <span>{c.dislikes.length}</span>
                    </button>
                    {/* Report Comment */}
                    <button
                      onClick={() => setShowReportCommentPrompt({commentId: c._id})}
                      className="text-sm cursor-pointer hover:text-red-500"
                    >
                      <FiFlag />
                    </button>
                    {/* Delete Comment */}
                    {isCommentAuthor && (
                      <button
                        onClick={() =>
                          setShowDeleteCommentPrompt({commentId: c._id, authorId:c.user._id})
                        }
                        className="ml-1 text-sm cursor-pointer hover:text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Comment Input */}
        {authUser ? (
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 bg-gray-800 px-3 py-2 rounded-lg"
            />
            <button
              onClick={handleSubmitComment}
              className="text-pink-500 hover:text-pink-400 transition cursor-pointer"
            >
              <FiSend size={20} />
            </button>
          </div>
        ) : (
          <p className="mt-4 text-gray-400 text-sm">
            <a className="text-pink-500 cursor-pointer" onClick={openLogin}>
              Log in
            </a>{" "}
            to comment.
          </p>
        )}

        {/* Report Prompt Modal */}
        {showReportReviewPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <motion.div
              className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-3">
                Report Review
              </h4>
              <textarea
                value={reportReviewReason}
                onChange={(e) => setReportReviewReason(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 px-3 py-2 rounded-lg mb-4"
                placeholder="Reason for reporting"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReportReviewPrompt(false);
                    setReportReviewReason("");
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportReview}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showReportCommentPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <motion.div
              className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-3">
                Report Comment
              </h4>
              <textarea
                value={reportCommentReason}
                onChange={(e) => setReportCommentReason(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 px-3 py-2 rounded-lg mb-4"
                placeholder="Reason for reporting"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowReportCommentPrompt(null);
                    setReportCommentReason("");
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReportComment(showReportCommentPrompt.commentId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteReviewPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <motion.div
              className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-3">
                Confirm Delete Review
              </h4>
              <div className="pb-10">
                Are you sure you want to delete your review?
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteReviewPrompt(false);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteCommentPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <motion.div
              className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-3">
                Confirm Delete Comment
              </h4>
              <div className="pb-10">
                Are you sure you want to delete your comment?
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteCommentPrompt(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteComment(showDeleteCommentPrompt.commentId, showDeleteCommentPrompt.authorId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
