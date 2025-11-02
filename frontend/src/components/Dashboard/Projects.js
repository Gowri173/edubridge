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
    Stack,
    Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../../api";

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(localStorage.getItem("role"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get("/user_data", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data) {
                    let p = res.data.projects;

                    // 🧠 Normalize all possible formats
                    if (!p) p = [];
                    else if (typeof p === "string") {
                        p = p.split("\n").filter(Boolean).map(line => ({ title: line }));
                    } else if (Array.isArray(p)) {
                        p = p.map(item =>
                            typeof item === "string" ? { title: item } : item
                        );
                    } else if (typeof p === "object") {
                        p = [p];
                    }

                    setProjects(p);
                    setRole(res.data.selected_role);
                }
            } catch (err) {
                console.error("Error fetching projects:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
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
                        🚀 AI-Generated Project Recommendations
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : projects.length > 0 ? (
                        <>
                            <Typography
                                variant="subtitle1"
                                sx={{ mb: 2, color: "text.secondary" }}
                            >
                                <strong>Target Role:</strong>{" "}
                                <Chip
                                    label={role || "Not selected"}
                                    color={role ? "primary" : "default"}
                                    size="small"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                />
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                            {/* Grid for projects */}
                            <Grid container spacing={3}>
                                {projects.map((p, i) => (
                                    <Grid item xs={12} sm={6} md={4} key={i}>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Paper
                                                elevation={4}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: 3,
                                                    height: "100%",
                                                    background:
                                                        "linear-gradient(145deg, #f9fafb, #ffffff)",
                                                    transition: "0.3s",
                                                    "&:hover": {
                                                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                                                        background: "linear-gradient(145deg, #f3f6ff, #fff)",
                                                    },
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "text.primary",
                                                        mb: 1,
                                                    }}
                                                >
                                                    {p.title || `Project ${i + 1}`}
                                                </Typography>

                                                {p.description && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ mb: 2 }}
                                                    >
                                                        {p.description}
                                                    </Typography>
                                                )}

                                                {p.tech_stack && Array.isArray(p.tech_stack) && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                mb: 1,
                                                                color: "primary.main",
                                                            }}
                                                        >
                                                            🧰 Tech Stack
                                                        </Typography>
                                                        <Stack direction="row" flexWrap="wrap" spacing={1}>
                                                            {p.tech_stack.map((tech, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={tech}
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    size="small"
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Box>
                                                )}

                                                {p.difficulty && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ fontWeight: 500 }}
                                                        color={
                                                            p.difficulty === "Advanced"
                                                                ? "error.main"
                                                                : p.difficulty === "Intermediate"
                                                                    ? "warning.main"
                                                                    : "success.main"
                                                        }
                                                    >
                                                        ⚙️ Difficulty: {p.difficulty}
                                                    </Typography>
                                                )}
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    ) : (
                        <Typography sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                            Upload your resume and select a role to generate personalized project ideas.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
