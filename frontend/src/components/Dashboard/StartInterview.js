// src/components/MockInterview/StartInterview.js
import React, { useState } from "react";
import {
    Button,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Box,
    TextField,
    Paper,
} from "@mui/material";
import api from "../../api";

export default function StartInterview() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const token = localStorage.getItem("token");

    // 🎯 Start the interview by fetching questions
    const handleStart = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post(
                "/start_interview",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Interview start response:", res.data);

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
            } else {
                setError("No questions received. Try again.");
            }
        } catch (err) {
            console.error("Error starting interview:", err);
            setError("Failed to start interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 🧠 Handle user answers
    const handleAnswerChange = (e) => {
        setAnswers({
            ...answers,
            [questions[currentIndex].id]: e.target.value,
        });
    };

    // 👉 Move to next question or finish
    const handleNext = () => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleFinishInterview();
        }
    };

    // ✅ Send all Q&A for evaluation
    const handleFinishInterview = async () => {
        setLoading(true);
        setError("");

        try {
            const qaPairs = questions.map((q) => ({
                question: q.question,
                answer: answers[q.id] || "",
            }));

            const res = await api.post(
                "/evaluate_interview",
                { qa_pairs: qaPairs }, // ✅ send as JSON
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Evaluation result:", res.data);

            setScore(res.data.score);
            setFeedback(res.data.feedback);
            setCompleted(true);
        } catch (err) {
            console.error("Error evaluating interview:", err);
            setError("Failed to evaluate interview. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 🧾 Render UI
    return (
        <Card sx={{ mt: 4, p: 3 }}>
            <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🧠 AI Mock Interview
                </Typography>

                {/* ⏳ Before starting */}
                {!interviewStarted && !completed && (
                    <Box textAlign="center" mt={3}>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            Click below to start your personalized mock interview. You'll be
                            asked 5–10 AI-generated questions tailored to your selected role.
                        </Typography>

                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <Button variant="contained" color="primary" onClick={handleStart}>
                                Start Interview
                            </Button>
                        )}

                        {error && (
                            <Typography color="error" mt={2}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                )}

                {/* 🎤 During interview */}
                {interviewStarted && !completed && questions.length > 0 && (
                    <Box mt={3}>
                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Q{currentIndex + 1}. {questions[currentIndex].question}
                            </Typography>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Type your answer here..."
                                value={answers[questions[currentIndex].id] || ""}
                                onChange={handleAnswerChange}
                            />

                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                                disabled={loading}
                            >
                                {currentIndex + 1 < questions.length
                                    ? "Next Question"
                                    : "Finish Interview"}
                            </Button>
                        </Paper>
                    </Box>
                )}

                {/* 🏁 After completion */}
                {completed && (
                    <Box textAlign="center" mt={3}>
                        <Typography variant="h6" gutterBottom>
                            ✅ Interview Completed
                        </Typography>
                        <Typography variant="h5" color="primary">
                            Score: {score}/100
                        </Typography>

                        {feedback && (
                            <Box mt={2}>
                                <Typography variant="body1" fontWeight="bold">
                                    Strengths:
                                </Typography>
                                <ul>
                                    {feedback.strengths?.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                                <Typography variant="body1" fontWeight="bold">
                                    Weaknesses:
                                </Typography>
                                <ul>
                                    {feedback.weaknesses?.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                                <Typography variant="body1" fontWeight="bold">
                                    Suggestions:
                                </Typography>
                                <Typography variant="body2">
                                    {feedback.suggestions || "Keep improving!"}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="outlined"
                            sx={{ mt: 3 }}
                            onClick={() => window.location.reload()}
                        >
                            Start New Interview
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
