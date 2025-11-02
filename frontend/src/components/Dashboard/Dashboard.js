import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Button,
    Divider,
} from "@mui/material";
import {
    AccountCircle,
    Description,
    Psychology,
    Timeline,
    Work,
} from "@mui/icons-material";

import Profile from "./Profile";
import ResumeSection from "./ResumeSection";
import Roadmap from "./Roadmap";
import Projects from "./Projects";
import MockInterview from "./MockInterview";

export default function Dashboard() {
    const [selectedSection, setSelectedSection] = useState("Profile");
    const userEmail = localStorage.getItem("email");

    const sections = [
        { label: "Profile", icon: <AccountCircle />, component: <Profile /> },
        { label: "Resume", icon: <Description />, component: <ResumeSection /> },
        { label: "Mock Interview", icon: <Psychology />, component: <MockInterview /> },
        { label: "Roadmap", icon: <Timeline />, component: <Roadmap /> },
        { label: "Projects", icon: <Work />, component: <Projects /> },
    ];

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/login";
    };

    const drawerWidth = 240;

    return (
        <Box sx={{ display: "flex" }}>
            {/* ====== APP BAR ====== */}
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        EduBridge Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 3 }}>
                        {userEmail || "Guest"}
                    </Typography>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            borderColor: "white",
                            color: "white",
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* ====== SIDEBAR ====== */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        backgroundColor: "#f5f7fa",
                        borderRight: "1px solid #ddd",
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: "auto", mt: 2 }}>
                    <List>
                        {sections.map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton
                                    selected={selectedSection === item.label}
                                    onClick={() => setSelectedSection(item.label)}
                                    sx={{
                                        borderRadius: 1,
                                        mx: 1,
                                        my: 0.5,
                                        "&.Mui-selected": {
                                            backgroundColor: "#1976d2",
                                            color: "white",
                                            "&:hover": { backgroundColor: "#1565c0" },
                                        },
                                    }}
                                >
                                    {item.icon}
                                    <ListItemText primary={item.label} sx={{ ml: 2 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>

                    <Divider sx={{ mt: 2 }} />
                    <Box sx={{ textAlign: "center", mt: 2, px: 2 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                        >
                            © 2025 EduBridge AI
                        </Typography>
                    </Box>
                </Box>
            </Drawer>

            {/* ====== MAIN CONTENT ====== */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    ml: `${drawerWidth}px`,
                    mt: 8,
                    backgroundColor: "#fafafa",
                    minHeight: "100vh",
                    transition: "all 0.3s ease-in-out",
                }}
            >
                {sections.find((s) => s.label === selectedSection)?.component}
            </Box>
        </Box>
    );
}
