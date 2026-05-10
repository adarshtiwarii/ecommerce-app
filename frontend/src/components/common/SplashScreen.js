import { useEffect, useMemo, useState } from 'react';
import { FiPackage, FiSearch, FiShoppingCart, FiTruck } from 'react-icons/fi';

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const messages = useMemo(() => ['Syncing products', 'Preparing cart', 'Loading deals', 'Opening EcoMart'], []);
  const message = messages[Math.min(messages.length - 1, Math.floor(progress / 26))];

  useEffect(() => {
    const progressTimer = setInterval(() => setProgress(p => Math.min(100, p + 4)), 70);
    const finishTimer = setTimeout(() => onFinish?.(), 2200);
    return () => {
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-25">
        <div className="absolute left-[10%] top-[18%] h-24 w-24 rounded-full bg-white animate-ping" />
        <div className="absolute right-[14%] top-[26%] h-16 w-16 rounded-full bg-yellow-200 animate-pulse" />
        <div className="absolute bottom-[18%] left-[22%] h-20 w-20 rounded-full bg-white animate-bounce" />
      </div>
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/60 p-7 text-center">
        <div className="relative mx-auto mb-5 h-24 w-24">
          <div className="absolute inset-0 rounded-2xl bg-orange-100 animate-pulse" />
          <div className="absolute inset-3 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg animate-bounce">
            <FiShoppingCart size={34} />
          </div>
          <FiPackage className="absolute -left-4 top-8 text-white drop-shadow-lg animate-pulse" size={24} />
          <FiTruck className="absolute -right-5 bottom-4 text-white drop-shadow-lg animate-pulse" size={28} />
          <FiSearch className="absolute right-1 -top-4 text-white drop-shadow-lg animate-bounce" size={22} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">EcoMart</h1>
        <p className="text-sm text-gray-500 mt-1">Fast shopping experience is starting</p>
        <div className="mt-6 text-left">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>{message}</span><span>{progress}%</span></div>
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden"><div className="h-full bg-orange-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="bg-orange-50 rounded-lg py-2 font-bold">Deals</div>
          <div className="bg-orange-50 rounded-lg py-2 font-bold">Cart</div>
          <div className="bg-orange-50 rounded-lg py-2 font-bold">Orders</div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

