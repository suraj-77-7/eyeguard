import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 34,
        scale: 0.985,
        rotateX: -8,
        filter: 'blur(8px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
    },
    exit: {
        opacity: 0,
        y: -24,
        scale: 0.99,
        rotateX: 6,
        filter: 'blur(6px)',
    },
};

const AnimatedPage = ({ children, className = '', ...props }) => {
    const reduceMotion = useReducedMotion();

    const pageTransition = reduceMotion
        ? { duration: 0.01 }
        : {
            type: 'spring',
            damping: 22,
            stiffness: 165,
            mass: 0.7,
        };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;