import { Card } from '@tremor/react'; // Ensure you import Card and its props
import clsx from 'clsx';
import { motion, Variants } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

type SlidingStuffProps = {
    children: React.ReactNode;
    containerClassName?: string;
    Component?: React.ElementType;
    slideDirection?: 'top-to-bottom' | 'bottom-to-top' | 'right-to-left' | 'left-to-right' | 'custom';
    customVariants?: {
        hidden?: Record<string, any>; // Allow for any additional hidden variants
        visible?: Record<string, any>; // Allow for any additional visible variants
    };
};

export const SlidingStuff: React.FC<SlidingStuffProps> = ({
    children,
    containerClassName = '',
    Component = Card,
    slideDirection = 'top-to-bottom',
    customVariants = {}, // Accept custom variants
}) => { 
    const MotionPart = motion(Component);

    // Default animation variants based on slideDirection
    let defaultVariants= {
        hidden: {},
        visible: {
            opacity: 1,
            transition: { type: 'spring', stiffness: 60 },
        },
    };

    // Adjust the default hidden state based on the slideDirection
    switch (slideDirection) {
        case 'top-to-bottom':
            defaultVariants.hidden = { y: '-100%', opacity: 0 };
            defaultVariants.visible['y'] = '0';
            break;
        case 'bottom-to-top':
            defaultVariants.hidden = { y: '100%', opacity: 0 };
            defaultVariants.visible['y'] = '0'; // Set y to 0 for visible
            break;
        case 'right-to-left':
            defaultVariants.hidden = { x: '100%', opacity: 0 };
            defaultVariants.visible['x'] = '0'; // Set x to 0 for visible
            break;
        case 'left-to-right':
            defaultVariants.hidden = { x: '-100%', opacity: 0 };
            defaultVariants.visible['x'] = '0'; // Set x to 0 for visible
            break;
        case 'custom':
        default:
            defaultVariants.hidden = {};
            break;
    }

    // Merge default variants with custom variants
    const variants = {
        hidden: { ...defaultVariants.hidden, ...customVariants.hidden },
        visible: { ...defaultVariants.visible, ...customVariants.visible },
    };

    return (
        <MotionPart
            initial="hidden"
            animate="visible"
            variants={variants}
            className={clsx('card w-full', containerClassName)}
        >
            {children}
        </MotionPart>
    );
};
