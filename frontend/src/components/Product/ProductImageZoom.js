import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiRefreshCw, FiX } from 'react-icons/fi';

const ProductImageZoom = ({ src, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  const close = () => {
    setIsOpen(false);
    setScale(1);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    setScale(value => Math.min(Math.max(value - event.deltaY * 0.01, 1), 4));
  };

  return (
    <>
      <motion.img
        src={src}
        alt={alt}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03 }}
        className="max-h-[390px] max-w-full cursor-zoom-in object-contain p-3"
        draggable={false}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/95 p-4"
          >
            <button onClick={close} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><FiX /></button>
            <p className="absolute bottom-5 text-sm text-white/40">Scroll to zoom - drag when zoomed - click outside to close</p>
            <motion.img
              src={src}
              alt={alt}
              onWheel={handleWheel}
              onClick={event => event.stopPropagation()}
              drag={scale > 1}
              dragConstraints={{ left: -320, right: 320, top: -320, bottom: 320 }}
              animate={{ scale }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="max-h-[90vh] max-w-[90vw] cursor-grab rounded-xl object-contain active:cursor-grabbing"
              draggable={false}
            />
            <div className="absolute bottom-12 flex gap-3">
              <button onClick={event => { event.stopPropagation(); setScale(value => Math.max(1, value - 0.5)); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><FiMinus /></button>
              <button onClick={event => { event.stopPropagation(); setScale(1); }} className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-4 py-2 text-sm font-bold text-white"><FiRefreshCw /> Reset</button>
              <button onClick={event => { event.stopPropagation(); setScale(value => Math.min(4, value + 0.5)); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"><FiPlus /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageZoom;
