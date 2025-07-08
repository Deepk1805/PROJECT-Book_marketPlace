import { render, screen } from '@testing-library/react';
import App from './App';

test('renders book marketplace', () => {
  render(<App />);
  const linkElement = screen.getByText(/book marketplace/i);
  expect(linkElement).toBeInTheDocument();
});
