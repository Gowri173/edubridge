import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Box,
    LinearProgress,
    Paper,
    CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../../api";
import { useNavigate } from "react-router-dom";

export default function InterviewSession() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("interview_questions"));
        if (!stored || stored.length === 0) {
            navigate("/interview/start");
        } else {
            setQuestions(stored);
        }
    }, [navigate]);

    const handleNext = () => {
        const updated = [...answers];
        updated[current] = { question: questions[current].question, answer: input };
        setAnswers(updated);
        setInput("");

        if (current < questions.length - 1) {
            setCurrent(current + 1);
        } else {
            handleSubmit(updated);
        }
    };

    const handleSubmit = async (finalAnswers) => {
        setSubmitting(true);
        try {
            const res = await api.post(
                "/evaluate_interview",
                { answers: JSON.stringify(finalAnswers) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            localStorage.setItem("interview_result", JSON.stringify(res.data));
            navigate("/interview/result");
        } catch (err) {
            console.error("Error submitting interview:", err);
            alert("Error evaluating your interview. Try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LinearProgress sx={{ mt: 4 }} />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card
                sx={{
                    mt: 5,
                    borderRadius: 3,
                    boxShadow: 5,
                    background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
                    p: 3,
                }}
            >
                <CardContent>
                    {questions.length > 0 && (
                        <>
                            {/* Progress Bar */}
                            <Box sx={{ mb: 3 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={((current + 1) / questions.length) * 100}
                                    sx={{
                                        height: 8,
                                        borderRadius: 5,
                                        backgroundColor: "#e0e0e0",
                                        "& .MuiLinearProgress-bar": {
                                            borderRadius: 5,
                                        },
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1, textAlign: "right" }}
                                >
                                    {current + 1}/{questions.length} completed
                                </Typography>
                            </Box>

                            {/* Question Card */}
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 4,
                                    borderRadius: 3,
                                    backgroundColor: "#fff",
                                    transition: "0.3s",
                                    "&:hover": { boxShadow: 6 },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ mb: 1.5, fontWeight: "bold", color: "primary.main" }}
                                >
                                    Question {current + 1}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                                    {questions[current]?.question}
                                </Typography>

                                <TextField
                                    multiline
                                    rows={5}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Type your answer here..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    sx={{
                                        backgroundColor: "#f9f9f9",
                                        borderRadius: 2,
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                <Box mt={3} display="flex" justifyContent="flex-end" alignItems="center">
                                    {submitting ? (
                                        <CircularProgress size={28} sx={{ mr: 2 }} />
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                            disabled={!input}
                                            sx={{
                                                textTransform: "none",
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: 2,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {current === questions.length - 1
                                                ? "Submit Interview"
                                                : "Next Question"}
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
