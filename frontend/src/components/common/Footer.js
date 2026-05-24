import { Link } from 'react-router-dom';
import { FiCreditCard, FiRotateCcw, FiShield, FiTruck } from 'react-icons/fi';
import { BRAND } from '../../constants/labels';
import { ROUTES } from '../../constants/routes';

const footerSections = [
  { title: 'About', links: ['Contact Us', `About ${BRAND.name}`, 'Careers', 'Press'] },
  { title: 'Help', links: ['Payments', 'Shipping', 'Cancellation', 'FAQ'] },
  { title: 'Policy', links: ['Return Policy', 'Terms Of Use', 'Security', 'Privacy'] },
  { title: 'Social', links: ['Instagram', 'Twitter', 'Facebook', 'LinkedIn'] },
];

const footerBadges = [
  { label: 'Secure shopping', icon: FiShield },
  { label: 'Fast delivery', icon: FiTruck },
  { label: 'Easy returns', icon: FiRotateCcw },
  { label: 'Multiple payments', icon: FiCreditCard },
];

const Footer = () => (
  <footer className="site-footer mt-auto">
    <div className="footer-grid">
      <div>
        <Link to={ROUTES.HOME} className="footer-brand">
          <span style={{ color: 'var(--primary)' }}>{BRAND.nameEco}</span>
          <span style={{ color: 'var(--footer-heading)' }}>{BRAND.nameMart}</span>
        </Link>
        <p style={{ color: 'var(--footer-text)', maxWidth: 320 }}>{BRAND.tagline}</p>
      </div>
      {footerSections.slice(1).map(section => (
        <div key={section.title}>
          <h3 className="footer-col-heading">{section.title}</h3>
          {section.links.map(link => <Link key={link} to={ROUTES.HOME} className="footer-link">{link}</Link>)}
        </div>
      ))}
    </div>
    <div className="footer-bottom">
      <div className="flex flex-wrap justify-center gap-4">
        {footerBadges.map(badge => {
          const Icon = badge.icon;
          return <span key={badge.label} className="flex items-center gap-1"><Icon /> {badge.label}</span>;
        })}
      </div>
      <span>Copyright 2026 {BRAND.name}</span>
    </div>
  </footer>
);

export default Footer;
