import { useState } from 'react';
import { login } from './services/authService';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Apelăm funcția din authService
      const data = await login(email, password);
      setMessage(`Succes! Te-ai logat ca: ${data.user.name} (${data.user.role})`);
      console.log('Token primit:', data.token);
    } catch (err: any) {
      setMessage(`Eroare: ${err.message || err}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Conexiune Backend</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="admin@test.com"
          />
        </div>
        <br />
        <div>
          <label>Parolă: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="123"
          />
        </div>
        <br />
        <button type="submit">Logare</button>
      </form>

      {message && <p><strong>{message}</strong></p>}
    </div>
  );
}

export default App;