// src/App.chat.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

global.CLIENT_URL = 'http://localhost:3000';

// Mock fetch BEFORE importing App
const mockEvents = [
  { id: 1, name: 'Event 1', ticketsAvailable: 10, date: '2025-11-02' },
  { id: 2, name: 'Event 2', ticketsAvailable: 5, date: '2025-11-03' },
];

global.fetch = jest.fn((url) => {
  if (url === `${global.CLIENT_URL}/api/events`) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    });
  }
  return Promise.reject(new Error('Unknown endpoint'));
});

// Mock SpeechRecognition to silence warnings
global.SpeechRecognition = class {};
global.webkitSpeechRecognition = class {};

import App from './App'; // Adjust path if necessary

describe('App chat + events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays events after fetching', async () => {
    render(<App />);
    for (const event of mockEvents) {
      const el = await waitFor(() => screen.getByText(event.name));
      expect(el).toBeInTheDocument();
    }
  });

  test('updates ticket count after confirming booking', async () => {
    render(<App />);

    const ticketsEl = await waitFor(() =>
      screen.getByText(/10 tickets available/i)
    );
    expect(ticketsEl).toBeInTheDocument();

    const bookButton = screen.getByRole('button', { name: /Book Event 1/i });
    fireEvent.click(bookButton);

    const updatedTickets = await waitFor(() =>
      screen.getByText(/9 tickets available/i)
    );
    expect(updatedTickets).toBeInTheDocument();
  });
});
