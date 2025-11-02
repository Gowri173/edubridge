import React, { useState } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Tabs,
    Tab,
    Box,
    MenuItem,
} from "@mui/material";

export default function Auth({ onAuth }) {
    const [tab, setTab] = useState(0); // 0 = Signup, 1 = Login
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [suggestedRoles, setSuggestedRoles] = useState([]); // roles from AI
    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(false);

    // =============================
    //  HANDLE SIGNUP / LOGIN
    // =============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            const endpoint = tab === 0 ? "register_with_resume" : "login";

            const formData = new FormData();
            formData.append("email", form.email);
            formData.append("password", form.password);
            if (tab === 0) formData.append("name", form.name);
            if (tab === 0 && form.resumeFile) formData.append("file", form.resumeFile);

            const res = await axios.post(`https://edubridge-lczi.onrender.com/${endpoint}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // ✅ LOGIN SUCCESS
            if (tab === 1 && res.data.token) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("email", form.email);
                onAuth(form.email);
            }

            // ✅ SIGNUP SUCCESS
            if (tab === 0 && res.data.suggested_roles) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("email", form.email);
                setSuggestedRoles(res.data.suggested_roles); // show role picker
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // =============================
    //  HANDLE ROLE CONFIRMATION
    // =============================
    const handleRoleConfirm = async () => {
        if (!selectedRole) return alert("Please select a role first!");

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("role", selectedRole);

            await axios.post("https://edubridge-lczi.onrender.com/select_role", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onAuth(localStorage.getItem("email"));
        } catch (err) {
            console.error(err);
            alert("Error saving selected role. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // =============================
    //  RENDER
    // =============================
    return (
        <Card elevation={4} sx={{ maxWidth: 450, mx: "auto", mt: 8, p: 2 }}>
            <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                    EduBridge Authentication
                </Typography>

                {/* Tabs for Signup / Login */}
                {suggestedRoles.length === 0 && (
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
                        <Tab label="Signup" />
                        <Tab label="Login" />
                    </Tabs>
                )}

                {/* STEP 1 — Signup/Login Form */}
                {suggestedRoles.length === 0 && (
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        {tab === 0 && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    sx={{ mb: 2 }}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    Upload Resume
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) =>
                                            setForm({ ...form, resumeFile: e.target.files[0] })
                                        }
                                    />
                                </Button>
                            </>
                        )}

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            sx={{ mb: 2 }}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            sx={{ mb: 2 }}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />

                        {error && (
                            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : tab === 0
                                    ? "Create Account"
                                    : "Login"}
                        </Button>
                    </Box>
                )}

                {/* STEP 2 — Role Selection UI */}
                {suggestedRoles.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom align="center">
                            🎯 AI-Suggested Roles
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mb: 2, textAlign: "center", color: "gray" }}
                        >
                            Based on your resume, choose your preferred tech role:
                        </Typography>

                        <TextField
                            select
                            fullWidth
                            label="Select Role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            sx={{ mb: 3 }}
                        >
                            {suggestedRoles.map((role, i) => (
                                <MenuItem key={i} value={role}>
                                    {role}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleRoleConfirm}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Confirm Role & Continue"}
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
