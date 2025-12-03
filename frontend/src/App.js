import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Login from './components/Login';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [listening, setListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  // authentication refs
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const confirmationRef = useRef(null);
  const recognitionRef = useRef(null);

const CLIENT_URL = process.env.REACT_APP_API_URL || 'http://localhost:6001';
const LLM_URL = process.env.REACT_APP_LLM_URL
  ? process.env.REACT_APP_LLM_URL + '/api/llm/parse'
  : 'http://localhost:5002/api/llm/parse';

// check for user login status on mount
useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (token && email) {
      setCurrentUser({ email });
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

// fetch events on mount
useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetch(`${CLIENT_URL}/api/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
      })
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Unable to load events. Please try again later.');
        setLoading(false);
      });
  }, [CLIENT_URL, isAuthenticated]);


  useEffect(() => {
    if (purchaseMessage && confirmationRef.current) {
      confirmationRef.current.focus();
    }
  }, [purchaseMessage]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserMessage(transcript);
      setInputValue('');
      setListening(false);
    };

    recognitionRef.current.onend = () => setListening(false);
  }, []);

  // login user
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setLoading(true);
  }

  // user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setEvents([]);
    setChatMessages([]);
    setPendingBooking(null);
  };

  const buyTicket = async (eventId, eventName) => {
    try {
      const response = await fetch(`${CLIENT_URL}/api/events/${eventId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Purchase failed');
      }

      const data = await response.json();

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, tickets_available: data.remainingTickets } : event
        )
      );

      setPurchaseMessage(
        `Success! Ticket purchased for ${eventName}. ${data.remainingTickets} tickets remaining.`
      );
      setTimeout(() => setPurchaseMessage(''), 5000);
    } catch (err) {
      console.error('Purchase error:', err);
      setPurchaseMessage(`Error: ${err.message}`);
      setTimeout(() => setPurchaseMessage(''), 5000);
    }
  };

  const sendMessageToLLM = async (message) => {
    if (!message.trim()) return;

    try {
      const response = await fetch(LLM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Could not get response from LLM');

      const data = await response.json();
      const botMessageText = data.message || 'No response from LLM';

      if (data.parsed?.intent === 'booking' && data.parsed?.eventName) {
        const eventObj = events.find(e => e.name === data.parsed.eventName);
        if (eventObj) {
          setPendingBooking({ eventId: eventObj.id, eventName: eventObj.name });
        }
      }

      setChatMessages((prev) => [
        ...prev,
        { role: 'bot', text: botMessageText }
      ]);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(botMessageText);
        speechSynthesis.speak(utterance);
      }

    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Error: Could not get response from LLM.' }
      ]);
    }
  };

  const handleUserMessage = async (message) => {
    if (!message.trim()) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);

    const lower = message.toLowerCase();
    if (pendingBooking && (lower.includes('yes') || lower.includes('confirm'))) {
      await buyTicket(pendingBooking.eventId, pendingBooking.eventName);
      setChatMessages((prev) => [
        ...prev,
        { role: 'bot', text: `Ticket successfully purchased for "${pendingBooking.eventName}"!` }
      ]);
      setPendingBooking(null);
    } else {
      await sendMessageToLLM(message);
    }

    setInputValue('');
  };

  const handleSendClick = () => handleUserMessage(inputValue);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleUserMessage(inputValue);
  };

  const handleMicClick = () => {
    // Play beep asynchronously
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);

    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const toggleChat = () => setChatOpen((prev) => !prev);

// Show loading while checking authentication
  if (authChecking) {
    return (
      <div className="App">
        <p>Loading...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

    return (
    <div className="App">
      {/* User Info Bar */}
      <div style={{ 
        textAlign: 'right', 
        padding: '10px 20px', 
        backgroundColor: '#522D80', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '14px' }}>TigerTix</span>
        <div>
          <span style={{ marginRight: '15px' }}>
            Logged in as: <strong>{currentUser.email}</strong>
          </span>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '5px 15px', 
              backgroundColor: '#F56600',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            aria-label="Logout from TigerTix"
          >
            Logout
          </button>
        </div>
      </div>

      <header>
        <h1 id="page-title" tabIndex="0">Clemson Campus Events</h1>
        <p id="page-description">
          Browse and purchase tickets for upcoming campus events
        </p>
      </header>

      <main aria-labelledby="page-title" aria-describedby="page-description">
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {purchaseMessage}
        </div>

        {purchaseMessage && (
          <div ref={confirmationRef} role="alert" tabIndex="-1" className="confirmation-message">
            {purchaseMessage}
          </div>
        )}

        {loading && (
          <section role="status" aria-live="polite">
            <p>Loading events...</p>
          </section>
        )}

        {error && (
          <section role="alert" className="error-message">
            <p>{error}</p>
          </section>
        )}

        {!loading && !error && (
          <section aria-label="Available Events">
            <h2 tabIndex="0">Available Events</h2>
            {events.length === 0 ? (
              <p>No events available at this time.</p>
            ) : (
              <ul className="events-list">
                {events.map((event) => (
                  <li key={event.id} className="event-item">
                    <article aria-labelledby={`event-${event.id}-name`}>
                      <h3 id={`event-${event.id}-name`}>{event.name}</h3>
                      <p>
                        <span className="label">Date:</span>{' '}
                        <time dateTime={event.date}>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      </p>
                      <p>
                        <span className="label">Tickets Available:</span>{' '}
                        <span aria-label={`${event.tickets_available} tickets available`}>
                          {event.tickets_available}
                        </span>
                      </p>
                      <button
                        onClick={() => buyTicket(event.id, event.name)}
                        disabled={event.tickets_available === 0}
                        aria-label={
                          event.tickets_available > 0
                            ? `Buy ticket for ${event.name}`
                            : `Sold out: ${event.name}`
                        }
                        className="buy-button"
                      >
                        {event.tickets_available > 0 ? 'Buy Ticket' : 'Sold Out'}
                      </button>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      <div className="chat-button" onClick={toggleChat} aria-label="Open chat">
        💬
      </div>

      {chatOpen && (
        <div className="chat-bubble">
          <div className="chat-messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'user' ? 'user-message' : 'bot-message'}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
            />
            <button onClick={handleSendClick}>Send</button>
            <button onClick={handleMicClick}>{listening ? '🎤...' : '🎤'}</button>
          </div>
        </div>
      )}

      <footer>
        <p>
          <small>Clemson Campus Event Ticketing System</small>
        </p>
      </footer>
    </div>
  );
}

export default App;