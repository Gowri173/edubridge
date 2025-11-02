import React, { useState } from "react";
import {
    Button,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Box,
    Paper,
    Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../api";
import { motion } from "framer-motion";

export default function ResumeSection() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [suggestedRoles, setSuggestedRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);

    const handleUpload = async () => {
        if (!file) return alert("Please upload a resume first.");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("target_role", "general");
        formData.append("email", localStorage.getItem("email"));

        setLoading(true);
        try {
            const res = await api.post("/upload_resume", formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAnalysis(res.data.ai_output?.ai_summary || "AI analysis completed!");
            setSuggestedRoles(res.data.suggested_roles || []);
        } catch (err) {
            console.error(err);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        try {
            const form = new FormData();
            form.append("target_role", role);
            await api.post("/roadmap", form, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            const projectForm = new FormData();
            projectForm.append("role", role);
            await api.post("/projects", projectForm, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            alert(
                `✅ Role "${role}" selected!\nYour personalized roadmap and projects are ready.`
            );
        } catch (err) {
            console.error(err);
            alert("Error generating roadmap or projects.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                sx={{
                    mt: 4,
                    p: 4,
                    borderRadius: 4,
                    boxShadow: 6,
                    background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
                }}
            >
                <CardContent>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                        color="primary"
                    >
                        📄 Upload Resume & Get AI Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Upload your resume to receive AI-powered insights, suggested roles,
                        and a personalized learning roadmap.
                    </Typography>

                    {/* Upload Section */}
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            textAlign: "center",
                            borderRadius: 3,
                            border: "2px dashed #ccc",
                            transition: "0.3s",
                            "&:hover": { borderColor: "#1976d2", backgroundColor: "#f5f9ff" },
                        }}
                    >
                        <CloudUploadIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {file ? (
                                <strong>{file.name}</strong>
                            ) : (
                                "Drag & drop or choose a resume file"
                            )}
                        </Typography>

                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.doc,.docx"
                            style={{ display: "none" }}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <label htmlFor="resume-upload">
                            <Button variant="outlined" component="span">
                                Choose File
                            </Button>
                        </label>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpload}
                            disabled={loading}
                            sx={{ ml: 2 }}
                            startIcon={!loading && <CheckCircleIcon />}
                        >
                            {loading ? "Analyzing..." : "Upload & Analyze"}
                        </Button>

                        {loading && <CircularProgress sx={{ mt: 2 }} />}
                    </Paper>

                    {/* AI Summary */}
                    {analysis && (
                        <Paper
                            elevation={2}
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: 3,
                                backgroundColor: "#f8faff",
                                transition: "0.3s",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
                            >
                                🤖 AI Summary
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                {analysis}
                            </Typography>
                        </Paper>
                    )}

                    {/* Suggested Roles */}
                    {suggestedRoles.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", color: "primary.main", mb: 1 }}
                            >
                                🎯 AI Suggested Roles
                            </Typography>

                            <Grid container spacing={2}>
                                {suggestedRoles.map((role, i) => (
                                    <Grid item xs={12} sm={6} md={4} key={i}>
                                        <Chip
                                            label={role}
                                            onClick={() => handleRoleSelect(role)}
                                            color={
                                                selectedRole === role ? "primary" : "default"
                                            }
                                            variant={
                                                selectedRole === role ? "filled" : "outlined"
                                            }
                                            clickable
                                            sx={{
                                                width: "100%",
                                                py: 1.5,
                                                fontWeight:
                                                    selectedRole === role ? "bold" : "medium",
                                                fontSize: "1rem",
                                                borderRadius: 2,
                                                boxShadow:
                                                    selectedRole === role
                                                        ? "0px 3px 10px rgba(25,118,210,0.3)"
                                                        : "none",
                                                transition: "0.2s",
                                                "&:hover": {
                                                    boxShadow:
                                                        "0px 3px 10px rgba(25,118,210,0.2)",
                                                },
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
