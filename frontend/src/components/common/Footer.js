import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-cinematic-card border-t border-cinematic-border mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
        {[
          { title: 'About', links: ['Contact Us', 'About EcoMart', 'Sustainability', 'Press'] },
          { title: 'Help', links: ['Payments', 'Shipping', 'Returns', 'FAQ'] },
          { title: 'Policy', links: ['Return Policy', 'Terms Of Use', 'Security', 'Privacy'] },
          { title: 'Social', links: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn'] },
        ].map(section => (
          <div key={section.title}>
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map(link => (
                <li key={link}><Link to="#" className="text-sm text-gray-400 hover:text-cinematic-accent transition font-medium">{link}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-cinematic-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-cinematic-accent font-bold text-xl">EcoMart</Link>
          <span className="text-gray-500 text-xs">© 2025 EcoMart – Sustainable Shopping</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>🌿 Eco-Friendly</span>
          <span>🚚 Free Delivery</span>
          <span>🔄 Easy Returns</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;