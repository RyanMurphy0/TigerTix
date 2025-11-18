import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventList from '../components/EventList';

describe('EventList Component', () => {
  test('renders message when no events exist', () => {
    render(<EventList events={[]} onSelect={() => {}} />);
    expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
  });

  test('renders events and allows booking', () => {
    const mockEvents = [
      { id: 1, name: 'Clemson Football', date: 'Nov 10, 2025' },
      { id: 2, name: 'Clemson Basketball', date: 'Dec 1, 2025' },
    ];

    const mockSelect = jest.fn();
    render(<EventList events={mockEvents} onSelect={mockSelect} />);

    // Verify both events render
    expect(screen.getByText(/Clemson Football/i)).toBeInTheDocument();
    expect(screen.getByText(/Clemson Basketball/i)).toBeInTheDocument();

    // Click the first Book Ticket button
    const bookButtons = screen.getAllByText(/book ticket/i);
    fireEvent.click(bookButtons[0]);

    // Verify the callback was triggered
    expect(mockSelect).toHaveBeenCalledWith(mockEvents[0]);
  });
});
