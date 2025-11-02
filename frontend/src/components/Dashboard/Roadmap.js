import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Divider,
    Box,
    Paper,
    Chip,
    LinearProgress,
    Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../../api";

export default function Roadmap() {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(localStorage.getItem("role"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get("/user_data", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data) {
                    setRoadmap(res.data.roadmap_data);
                    setRole(res.data.selected_role);
                }
            } catch (err) {
                console.error("Error fetching roadmap:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <Card
                sx={{
                    mt: 5,
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                    p: 3,
                }}
            >
                <CardContent>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            fontWeight: "bold",
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        📈 Learning Roadmap
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : roadmap ? (
                        <>
                            <Typography
                                variant="subtitle1"
                                sx={{ mb: 1, color: "text.secondary" }}
                            >
                                <strong>Target Role:</strong>{" "}
                                <Chip
                                    label={roadmap.target_role || role || "Not selected"}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                />
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{ mb: 3, color: "text.secondary" }}
                            >
                                Estimated Timeline:{" "}
                                {roadmap.timeline_weeks
                                    ? `${roadmap.timeline_weeks} weeks`
                                    : "8–20 weeks"}
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                            {/* ✅ Phases Section */}
                            {roadmap.roadmap && roadmap.roadmap.length > 0 ? (
                                <Stack spacing={3}>
                                    {roadmap.roadmap.map((phase, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Paper
                                                elevation={4}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background:
                                                        "linear-gradient(145deg, #f9fafb, #ffffff)",
                                                    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "primary.main",
                                                        mb: 1,
                                                    }}
                                                >
                                                    Phase {idx + 1}: {phase.phase}
                                                </Typography>

                                                {phase.objective && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mt: 0.5,
                                                            mb: 1,
                                                            fontStyle: "italic",
                                                            color: "text.secondary",
                                                        }}
                                                    >
                                                        🎯 {phase.objective}
                                                    </Typography>
                                                )}

                                                {phase.focus && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ fontWeight: "bold", color: "text.primary" }}
                                                        >
                                                            Key Focus Areas:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {Array.isArray(phase.focus)
                                                                ? phase.focus.join(", ")
                                                                : phase.focus}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {phase.projects && phase.projects.length > 0 && (
                                                    <Box sx={{ mb: 1 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                color: "text.primary",
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            🧩 Mini Projects:
                                                        </Typography>
                                                        <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                                                            {phase.projects.map((proj, i) => (
                                                                <li key={i}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {proj}
                                                                    </Typography>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Box>
                                                )}

                                                {phase.duration_weeks && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ mb: 1 }}
                                                        >
                                                            ⏱ Duration: {phase.duration_weeks} weeks
                                                        </Typography>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={
                                                                (phase.duration_weeks /
                                                                    (roadmap.timeline_weeks || 20)) *
                                                                100
                                                            }
                                                            sx={{
                                                                borderRadius: 2,
                                                                height: 6,
                                                                backgroundColor: "#e0e7ff",
                                                                "& .MuiLinearProgress-bar": {
                                                                    backgroundColor: "#1976d2",
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Paper>
                                        </motion.div>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                                    No roadmap data available.
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Typography sx={{ textAlign: "center", mt: 3 }}>
                            Upload your resume and select a role to view your personalized roadmap.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
