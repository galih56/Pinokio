import { motion } from "framer-motion";

const Success = () => {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <motion.svg
          width="150px"
          height="150px"
          viewBox="0 0 117 117"
          xmlns="https://www.w3.org/2000/svg"
        >
          {/* Circle Animation */}
          <motion.circle
            cx="58.5"
            cy="58.5"
            r="56"
            fill="none"
            stroke="#4A4A4A"
            strokeWidth="5"
            initial={{ strokeDasharray: 2 * Math.PI * 56, strokeDashoffset: 2 * Math.PI * 56 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.2 }}
          />
  
          {/* Checkmark Path Animation */}
          <motion.path
            d="M34.5,55.1 C32.9,53.5 30.3,53.5 28.7,55.1 C27.1,56.7 27.1,59.3 28.7,60.9 L47.6,79.8 C48.4,80.6 49.4,81 50.5,81 C50.6,81 50.6,81 50.7,81 C51.8,80.9 52.9,80.4 53.7,79.5 L101,22.8 C102.4,21.1 102.2,18.5 100.5,17 C98.8,15.6 96.2,15.8 94.7,17.5 L50.2,70.8 L34.5,55.1 Z"
            fill="#17AB13"  
            stroke="none"   
            initial={{ opacity: 0 }}  
            animate={{ opacity: 1 }}   
            transition={{ duration: 0.2, ease: "easeInOut", delay: 0.5 }}  
          />
        </motion.svg>
      </div>
    );
};
export default Success;  