import React, { useState, Suspense, lazy, ComponentType } from "react";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";

// Lazy load Spline for client-side only
const SplineLazy = lazy(() =>
    import("@splinetool/react-spline").then((module) => ({ default: module.default }))
) as unknown as ComponentType<{ scene: string; style?: React.CSSProperties }>;

export default function Hero3D() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Card
            sx={{
                width: '100%',
                height: { xs: '400px', md: '550px' },
                bgcolor: 'black',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
        >
            {/* Spotlight Effect - CSS gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-160px',
                    left: { xs: 0, md: '240px' },
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ display: 'flex', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>

                {/* LEFT SIDE - Content */}
                <Box
                    sx={{
                        flex: 1,
                        p: { xs: 3, md: 6 },
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.2,
                            fontSize: { xs: '2rem', md: '3.5rem' }
                        }}
                    >
                        <Box component="span" sx={{
                            background: 'linear-gradient(to bottom, white, gray)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            display: 'block'
                        }}>
                            Smart Car Wash
                        </Box>
                        <Box component="span" sx={{ color: '#3b82f6', display: 'block' }}>
                            Management System
                        </Box>
                    </Typography>

                    <Typography sx={{ mt: 3, color: 'grey.400', maxWidth: 400, fontSize: '1.1rem' }}>
                        Automate bookings, manage queues, track revenue, and run your car wash
                        like a modern tech-powered business.
                    </Typography>

                    {/* CTA Buttons */}
                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: '#2563eb',
                                '&:hover': { bgcolor: '#1d4ed8' },
                                borderRadius: '12px',
                                px: 4,
                                py: 1.5,
                                fontWeight: 500,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                borderRadius: '12px',
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    borderColor: 'rgba(255,255,255,0.3)'
                                }
                            }}
                        >
                            Live Demo
                        </Button>
                    </Box>

                </Box>

                {/* RIGHT SIDE - 3D Spline */}
                <Box sx={{ flex: 1, position: 'relative' }}>
                    <Suspense fallback={
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'white'
                        }}>
                            <CircularProgress color="primary" />
                        </Box>
                    }>
                        <SplineLazy
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            style={{ width: '100%', height: '100%' }}
                        />
                    </Suspense>

                    {/* Gradient overlay for smooth blend */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to right, transparent, black)'
                        }}
                    />
                </Box>

            </Box>
        </Card>
    );
}
