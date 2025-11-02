import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Divider,
    Box,
    CircularProgress,
    Chip,
    Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../../api";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await api.get("/user_data", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data) {
                    const userData = res.data;
                    localStorage.setItem("name", userData.name);
                    localStorage.setItem("email", userData.email);
                    if (userData.selected_role)
                        localStorage.setItem("role", userData.selected_role);

                    setProfile({
                        name: userData.name || "User",
                        email: userData.email || "Not available",
                        role: userData.selected_role || "Not selected yet",
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card
                sx={{
                    mt: 5,
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                            sx={{
                                bgcolor: "primary.main",
                                width: 70,
                                height: 70,
                                fontSize: "1.8rem",
                                boxShadow: 3,
                            }}
                        >
                            {profile?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{ color: "primary.main" }}
                            >
                                Profile Overview
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your personalized AI mentor profile
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Details */}
                    <Box sx={{ mt: 2 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                Name
                            </Typography>
                            <Typography variant="h6">{profile?.name}</Typography>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                Email
                            </Typography>
                            <Typography variant="h6">{profile?.email}</Typography>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                Selected Role
                            </Typography>
                            <Chip
                                label={profile?.role}
                                color={profile?.role === "Not selected yet" ? "default" : "primary"}
                                variant="outlined"
                                sx={{
                                    mt: 1,
                                    fontWeight: "bold",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: "8px",
                                }}
                            />
                        </Paper>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
}
