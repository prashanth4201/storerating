import React, { useState } from 'react';
import './App.css';
import { jwtDecode } from 'jwt-decode';

// --- Login Form Component ---
function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message);
        return;
      }
      localStorage.setItem('token', data.token);
      onLoginSuccess(data.token);
    } catch (error) {
      setMessage('An error occurred during login.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log In</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Log In</button>
      {message && <p>{message}</p>}
    </form>
  );
}

// --- Sign Up Form Component ---
function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Normal User');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('An error occurred during sign up.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      {/* THIS IS THE CORRECTED LINE */}
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Normal User">Normal User</option>
        <option value="Store Owner">Store Owner</option>
        <option value="System Administrator">System Administrator</option>
      </select>
      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  );
}

// --- Main App Component ---
function App() {
  const [user, setUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);

  const handleLogin = (token) => {
    const decodedToken = jwtDecode(token);
    setUser(decodedToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const renderDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'System Administrator':
        return <div><h2>Admin Dashboard</h2><p>Here you can add users and stores.</p></div>;
      case 'Store Owner':
        return <div><h2>Store Owner Dashboard</h2><p>Here you can see your store's ratings.</p></div>;
      case 'Normal User':
        return <div><h2>User Dashboard</h2><p>Here you can see and rate stores.</p></div>;
      default:
        return <p>Unknown role.</p>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Store Rating App</h1>
        {user ? (
          <div>
            <h3>Welcome!</h3>
            {renderDashboard()}
            <button onClick={handleLogout}>Log Out</button>
          </div>
        ) : (
          <div>
            <div className="toggle-buttons">
              <button onClick={() => setIsLoginView(false)}>Sign Up</button>
              <button onClick={() => setIsLoginView(true)}>Log In</button>
            </div>
            {isLoginView ? <LoginForm onLoginSuccess={handleLogin} /> : <SignUpForm />}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;