import { Link } from 'react-router-dom';
import { FiShield, FiTruck, FiRotateCcw, FiCreditCard } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-[#161616] border-t mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'About', links: ['Contact Us', 'About EcoMart', 'Careers', 'Press'] },
          { title: 'Help', links: ['Payments', 'Shipping', 'Cancellation', 'FAQ'] },
          { title: 'Policy', links: ['Return Policy', 'Terms Of Use', 'Security', 'Privacy'] },
          { title: 'Social', links: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn'] },
        ].map(section => (
          <div key={section.title}>
            <h3 className="text-white/50 text-xs font-black uppercase mb-3">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map(link => <li key={link}><Link to="#" className="text-sm text-white/80 hover:text-[#FF6B00]">{link}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t pt-5 flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-white/70">
        <Link to="/" className="text-[#FF6B00] font-black text-xl">EcoMart</Link>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="flex items-center gap-1"><FiShield /> Secure shopping</span>
          <span className="flex items-center gap-1"><FiTruck /> Fast delivery</span>
          <span className="flex items-center gap-1"><FiRotateCcw /> Easy returns</span>
          <span className="flex items-center gap-1"><FiCreditCard /> Multiple payments</span>
        </div>
        <span className="text-xs">Copyright 2026 EcoMart</span>
      </div>
    </div>
  </footer>
);

export default Footer;




