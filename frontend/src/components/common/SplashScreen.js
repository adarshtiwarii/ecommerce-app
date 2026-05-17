import { motion } from 'framer-motion';

const SplashScreen = () => (
  <motion.div
    exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5 } }}
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#0D0D0D]"
  >
    <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />
    <motion.div
      className="absolute h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,107,0,0.16)_0%,transparent_70%)]"
      animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    />

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF6B00] font-display text-3xl font-extrabold text-white shadow-[0_0_42px_rgba(255,107,0,0.35)]"
    >
      E
    </motion.div>

    <motion.h1
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="relative m-0 font-display text-5xl font-extrabold text-white"
    >
      EcoMart
    </motion.h1>

    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="relative mt-1 text-xs font-bold uppercase tracking-[4px] text-[#FF6B00]"
    >
      PLUS
    </motion.span>

    <motion.div
      className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[#FF6B00]"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.8, duration: 2, ease: 'easeInOut' }}
    />
  </motion.div>
);

export default SplashScreen;
