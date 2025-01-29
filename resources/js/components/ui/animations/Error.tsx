import { motion } from 'framer-motion';

const Error = () => {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="https://www.w3.org/2000/svg"
      initial={{ opacity: 0 }} // Initial state (invisible)
      animate={{ opacity: 1 }} // Animate to visible state
      transition={{ duration: 1 }} // Duration of the animation
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        {/* Exclamation Mark */}
        <motion.path
          d="M12.75 7C12.75 6.58579 12.4142 6.25 12 6.25C11.5858 6.25 11.25 6.58579 11.25 7H12.75ZM11.25 14C11.25 14.4142 11.5858 14.75 12 14.75C12.4142 14.75 12.75 14.4142 12.75 14H11.25ZM12.75 16.99C12.75 16.5758 12.4142 16.24 12 16.24C11.5858 16.24 11.25 16.5758 11.25 16.99H12.75ZM11.25 17C11.25 17.4142 11.5858 17.75 12 17.75C12.4142 17.75 12.75 17.4142 12.75 17H11.25ZM11.25 7V14H12.75V7H11.25ZM11.25 16.99V17H12.75V16.99H11.25ZM20.25 12C20.25 16.5563 16.5563 20.25 12 20.25V21.75C17.3848 21.75 21.75 17.3848 21.75 12H20.25ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM3.75 12C3.75 7.44365 7.44365 3.75 12 3.75V2.25C6.61522 2.25 2.25 6.61522 2.25 12H3.75ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75Z"
          fill="#f00000"
        />

        {/* Circle around the exclamation mark */}
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          stroke="#0252f2"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }} // Initial state (no circle)
          animate={{ pathLength: 1 }} // Animate to full circle
          transition={{ 
            repeat: Infinity,  // Make it repeat
            duration: 4,        // Duration of one full loop
            ease: "linear"      // Smooth, continuous animation
          }}
        />
      </g>
    </motion.svg>
  );
};

export default Error;