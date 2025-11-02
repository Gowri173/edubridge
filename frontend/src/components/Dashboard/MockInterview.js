import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    CircularProgress,
    Box,
    Paper,
    LinearProgress,
    Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../../api";

export default function MockInterview() {
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState("");
    const token = localStorage.getItem("token");

    // 🔹 Start interview
    const handleStartInterview = async () => {
        setLoading(true);
        try {
            const res = await api.post(
                "/start_interview",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let fetchedQuestions = [];
            if (res.data.questions && Array.isArray(res.data.questions)) {
                fetchedQuestions = res.data.questions;
            } else if (Array.isArray(res.data)) {
                fetchedQuestions = res.data;
            } else if (typeof res.data === "string") {
                try {
                    fetchedQuestions = JSON.parse(res.data);
                } catch {
                    fetchedQuestions = [{ id: 1, question: res.data }];
                }
            }

            if (fetchedQuestions.length > 0) {
                setQuestions(fetchedQuestions);
                setInterviewStarted(true);
            } else alert("No questions found. Please try again.");
        } catch (err) {
            console.error("Error starting interview:", err);
            alert("Failed to start interview. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (e) => {
        setAnswers({
            ...answers,
            [questions[currentQuestion].id]: e.target.value,
        });
    };

    const handleNext = () => {
        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            handleFinishInterview();
        }
    };

    const handleFinishInterview = async () => {
        setLoading(true);
        try {
            const payload = {
                qa: questions.map((q) => ({
                    question: q.question,
                    answer: answers[q.id] || "",
                })),
            };
            const res = await api.post("/evaluate_interview", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setScore(res.data.score);
            setFeedback(res.data.feedback);
            setCompleted(true);
        } catch (err) {
            console.error("Error evaluating interview:", err);
            alert("Failed to evaluate interview.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            sx={{
                mt: 4,
                borderRadius: 3,
                boxShadow: 5,
                background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
            }}
        >
            <CardContent>
                <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", mb: 2, display: "flex", alignItems: "center" }}
                >
                    🧠 AI Mock Interview
                </Typography>

                {/* ================= BEFORE START ================= */}
                {!interviewStarted && !completed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Box textAlign="center" sx={{ mt: 4, mb: 2 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                Ready to test your skills? Click below to begin your interactive AI-powered mock interview.
                            </Typography>
                            {loading ? (
                                <CircularProgress />
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        textTransform: "none",
                                    }}
                                    onClick={handleStartInterview}
                                >
                                    Start Interview
                                </Button>
                            )}
                        </Box>
                    </motion.div>
                )}

                {/* ================= QUESTION PHASE ================= */}
                {interviewStarted && !completed && questions.length > 0 && (
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box sx={{ mt: 3 }}>
                            {/* Progress Bar */}
                            <LinearProgress
                                variant="determinate"
                                value={((currentQuestion + 1) / questions.length) * 100}
                                sx={{
                                    mb: 3,
                                    height: 8,
                                    borderRadius: 5,
                                    backgroundColor: "#e0e0e0",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 5,
                                    },
                                }}
                            />

                            <Paper
                                elevation={3}
                                sx={{
                                    p: 4,
                                    borderRadius: 3,
                                    backgroundColor: "#ffffff",
                                    transition: "0.3s",
                                    "&:hover": { boxShadow: 6 },
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                                    Question {currentQuestion + 1} of {questions.length}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {questions[currentQuestion].question}
                                </Typography>

                                <TextField
                                    multiline
                                    rows={5}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Type your answer here..."
                                    value={answers[questions[currentQuestion].id] || ""}
                                    onChange={handleAnswerChange}
                                />

                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        mt: 3,
                                        float: "right",
                                        px: 3,
                                        py: 1,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 600,
                                    }}
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    {currentQuestion + 1 < questions.length
                                        ? "Next Question"
                                        : "Finish Interview"}
                                </Button>
                            </Paper>
                        </Box>
                    </motion.div>
                )}

                {/* ================= RESULTS ================= */}
                {completed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Box textAlign="center" sx={{ mt: 4 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                ✅ Interview Completed
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: "primary.main",
                                    fontWeight: "bold",
                                    mb: 2,
                                }}
                            >
                                Score: {score}/100
                            </Typography>

                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
                                {typeof feedback === "object"
                                    ? feedback.suggestions ||
                                    feedback.strengths?.join(", ") ||
                                    "Good performance!"
                                    : feedback}
                            </Typography>

                            <Button
                                variant="outlined"
                                sx={{
                                    mt: 2,
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: "none",
                                }}
                                onClick={() => window.location.reload()}
                            >
                                Start New Interview
                            </Button>
                        </Box>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
