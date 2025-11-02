import axios from "axios";

const api = axios.create({
    baseURL: "https://edubridge-lczi.onrender.com",  // ✅ Replace with your actual Render backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
