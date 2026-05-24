jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  Link: ({ children }) => <span>{children}</span>,
  NavLink: ({ children }) => <span>{children}</span>,
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}), { virtual: true });

import { render, screen } from '@testing-library/react';
import App from './App';
import { BRAND } from './constants/labels';

test('renders the branded splash screen first', () => {
  render(<App />);
  expect(screen.getByText(BRAND.tagline)).toBeInTheDocument();
});
