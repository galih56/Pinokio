import { motion } from 'framer-motion';

const Info = () => {
  return (
    <motion.svg
      version="1.1"
      id="Layer_1"
      xmlns="https://www.w3.org/2000/svg"
      xmlnsXlink="https://www.w3.org/1999/xlink"
      width="800px"
      height="800px"
      viewBox="0 0 128 128"
      enableBackground="new 0 0 128 128"
      xmlSpace="preserve"
      fill="#000000"
      initial={{ opacity: 0 }} // Make the SVG invisible initially
      animate={{ opacity: 1 }} // Fade in the SVG
      transition={{ duration: 1 }}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
      <g id="SVGRepo_iconCarrier">
        <g>
          <motion.path
            fill="#89949a"
            d="M64,0C28.656,0,0,28.656,0,64s28.656,64,64,64s64-28.656,64-64S99.344,0,64,0z M64,120 C33.125,120,8,94.875,8,64S33.125,8,64,8s56,25.125,56,56S94.875,120,64,120z"
            initial={{ strokeDasharray: 400 }} // Set the path's dasharray (stroke length)
            animate={{ strokeDashoffset: 0 }} // Animate the path to "draw" it
            transition={{ duration: 2, ease: 'easeInOut' }} // Draw the stroke over 2 seconds
          />
        </g>
        <g>
          <motion.path
            fill="#0252f2"
            d="M64,48c-4.414,0-8,3.586-8,8v40c0,4.414,3.586,8,8,8s8-3.586,8-8V56C72,51.586,68.414,48,64,48z M64,40 c4.414,0,8-3.586,8-8s-3.586-8-8-8s-8,3.586-8,8S59.586,40,64,40z"
            initial={{ strokeDasharray: 400 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </g>
      </g>
    </motion.svg>
  );
};

export default Info;
