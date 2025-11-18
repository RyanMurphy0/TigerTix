import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders events header', () => {
  render(<App />);
  expect(screen.getByText(/Clemson Campus Events/i)).toBeInTheDocument();
});

test('chat input sends message', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Type a message/i);
  fireEvent.change(input, { target: { value: 'Book 1 ticket for Football' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  expect(screen.getByText(/Please confirm/i)).toBeInTheDocument();
});
