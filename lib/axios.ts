import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true
})

// console.log("API base URL:", process.env.NEXT_PUBLIC_API_URL);
