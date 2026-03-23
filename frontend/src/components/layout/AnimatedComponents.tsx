import { Box, BoxProps, keyframes } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// Animation keyframes
export const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(20, 184, 106, 0.3); }
  50% { box-shadow: 0 0 40px rgba(20, 184, 106, 0.6); }
`;

export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

export const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Motion wrapper for consistent animations
interface MotionWrapperProps extends MotionProps {
    children: ReactNode;
    className?: string;
}

export function MotionBox({ children, className, ...props }: MotionWrapperProps) {
    return (
        <motion.div className={className} {...props}>
            {children}
        </motion.div>
    );
}

// Animated card with hover effect
interface AnimatedCardProps extends BoxProps {
    children: ReactNode;
    delay?: number;
}

export function AnimatedCard({ children, delay = 0, sx, ...props }: AnimatedCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay,
                type: 'spring',
                stiffness: 100
            }}
            whileHover={{
                scale: 1.02,
                boxShadow: '0 20px 60px rgba(20, 184, 106, 0.2)'
            }}
        >
            <Box sx={{ ...sx }} {...props}>
                {children}
            </Box>
        </motion.div>
    );
}

// Animated number counter
interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    duration?: number;
}

export function AnimatedCounter({ value, suffix = '', duration = 1.5 }: AnimatedCounterProps) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, type: 'spring' }}
        >
            {value}{suffix}
        </motion.span>
    );
}

// Glowing status indicator
interface GlowingIndicatorProps {
    color?: string;
    size?: number;
    active?: boolean;
}

export function GlowingIndicator({ color = '#14b86a', size = 12, active = true }: GlowingIndicatorProps) {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: active ? color : '#ccc',
                animation: active ? `${pulseGlow} 2s ease-in-out infinite` : 'none',
                transition: 'all 0.3s ease'
            }}
        />
    );
}

// Animated gradient background
interface GradientBackgroundProps {
    children: ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `
          radial-gradient(ellipse at 20% 20%, rgba(20, 184, 106, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(245, 185, 66, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(20, 184, 106, 0.05) 0%, transparent 70%),
          linear-gradient(135deg, #08110d 0%, #0f2920 50%, #103624 100%)
        `,
                backgroundSize: '200% 200%',
                animation: `${gradientShift} 15s ease infinite`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2314b86a\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    pointerEvents: 'none'
                }
            }}
        >
            {children}
        </Box>
    );
}

// Animated entrance for lists
export const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.4,
            type: 'spring'
        }
    })
};

// Page transition variants
export const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

// Stagger children animation
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

// Item animation variants
export const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100 }
    }
};

// Button hover animation
export const buttonHoverProps = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400 }
};

// Card hover animation
export const cardHoverProps = {
    whileHover: {
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(20, 184, 106, 0.25)'
    },
    transition: { type: 'spring', stiffness: 300 }
};

export default {};
