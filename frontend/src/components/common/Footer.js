import { Link } from 'react-router-dom';
import { BRAND } from '../../constants/labels';
import { ROUTES } from '../../constants/routes';

const footerSections = [
  {
    title: 'Help',
    links: [
      { label: 'Payments',     to: '/help/payments' },
      { label: 'Shipping',     to: '/help/shipping' },
      { label: 'Cancellation', to: '/help/cancellation' },
      { label: 'FAQ',          to: '/help/faq' },
    ],
  },
  {
    title: 'Policy',
    links: [
      { label: 'Return Policy', to: '/policy/returns' },
      { label: 'Terms Of Use',  to: '/policy/terms' },
      { label: 'Security',      to: '/policy/security' },
      { label: 'Privacy',       to: '/policy/privacy' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'Twitter',   href: 'https://twitter.com' },
      { label: 'Facebook',  href: 'https://facebook.com' },
      { label: 'LinkedIn',  href: 'https://linkedin.com' },
    ],
  },
];

const Footer = () => (
  <footer className="site-footer mt-auto">
    <div className="footer-grid">

      {/* Brand column */}
      <div>
        <Link to={ROUTES.HOME} className="footer-brand">
          <span style={{ color: 'var(--primary)' }}>{BRAND.nameEco}</span>
          <span style={{ color: 'var(--footer-heading)' }}>{BRAND.nameMart}</span>
        </Link>
        <p style={{ color: 'var(--footer-text)', maxWidth: 320 }}>{BRAND.tagline}</p>
      </div>

      {footerSections.map(section => (
        <div key={section.title}>
          <h3 className="footer-col-heading">{section.title}</h3>
          {section.links.map(link => {
            if (link.href) {
              // External links open in a new tab.
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {link.label}
                </a>
              );
            }
            // Internal support links use client-side navigation.
            return (
              <Link key={link.label} to={link.to} className="footer-link">
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>

    <div className="footer-bottom">
      <span>Copyright 2026 {BRAND.name}</span>
    </div>
  </footer>
);

export default Footer;
