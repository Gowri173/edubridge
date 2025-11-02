import React from "react";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Box } from "@mui/material";

export default function Sidebar({ current, setCurrent }) {
    const items = ["Profile", "Update Resume", "Roadmap", "Projects", "Mock Interview"];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box", bgcolor: "#0a1929", color: "#fff" },
            }}
        >
            <Toolbar />
            <Box sx={{ mt: 2 }}>
                <List>
                    {items.map((text) => (
                        <ListItemButton
                            key={text}
                            selected={current === text}
                            onClick={() => setCurrent(text)}
                            sx={{
                                "&.Mui-selected": { bgcolor: "#2196f3", color: "#fff" },
                            }}
                        >
                            <ListItemText primary={text} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}
