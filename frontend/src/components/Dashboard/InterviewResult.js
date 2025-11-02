// src/components/MockInterview/InterviewResult.js
import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Divider,
    Chip,
    Box,
    Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function InterviewResult() {
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("interview_result");
        if (stored) setResult(JSON.parse(stored));
        else navigate("/interview/start");
    }, [navigate]);

    if (!result)
        return (
            <Typography sx={{ mt: 4, textAlign: "center" }}>
                No results available. Please take an interview first.
            </Typography>
        );

    const { score, feedback } = result;

    return (
        <Card sx={{ mt: 4, p: 4 }}>
            <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    🧩 Interview Evaluation
                </Typography>

                <Typography variant="h6" color="primary" gutterBottom>
                    Final Score: {score}/100
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold">
                    Strengths
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {feedback?.strengths?.map((s, i) => (
                        <Chip key={i} label={s} color="success" />
                    ))}
                </Box>

                <Typography variant="subtitle1" fontWeight="bold">
                    Weaknesses
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {feedback?.weaknesses?.map((w, i) => (
                        <Chip key={i} label={w} color="error" />
                    ))}
                </Box>

                <Typography variant="body1" sx={{ mt: 2 }}>
                    💡 <strong>Suggestions:</strong> {feedback?.suggestions}
                </Typography>

                <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                    <Button variant="outlined" onClick={() => navigate("/interview/start")}>
                        Retake Interview
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
