import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Clemson Campus Events heading', () => {
  render(<App />);
  const header = screen.getByText(/Clemson Campus Events/i);
  expect(header).toBeInTheDocument();
});

test('renders loading events message initially', () => {
  render(<App />);
  const loading = screen.getByText(/Loading events.../i);
  expect(loading).toBeInTheDocument();
});
