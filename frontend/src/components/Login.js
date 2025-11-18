import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:5003';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isRegistering ? 'register' : 'login';
        
        try {
            const response = await fetch(`${AUTH_URL}/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email);

            // Notify parent component
            onLoginSuccess(data.user);

        } catch (error) {
            setError('Connection error. Please try again.');
            console.error('Auth error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '2px solid #522D80', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h2 style={{ color: '#522D80', textAlign: 'center' }}>
                {isRegistering ? 'Create Account' : 'Login to TigerTix'}
            </h2>
            
            {error && (
                <div role="alert" style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Email:
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-required="true"
                        style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Password:
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                        aria-required="true"
                        aria-describedby="password-hint"
                        style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    {isRegistering && (
                        <small id="password-hint" style={{ color: '#666', fontSize: '12px' }}>
                            Password must be at least 6 characters
                        </small>
                    )}
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '12px', 
                        backgroundColor: loading ? '#ccc' : '#522D80', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
                </button>
            </form>
            
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                    }}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#522D80', 
                        cursor: 'pointer', 
                        textDecoration: 'underline',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    {isRegistering ? 'Login here' : 'Register here'}
                </button>
            </p>
        </div>
    );
}

export default Login;