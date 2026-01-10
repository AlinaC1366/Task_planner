import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'EXECUTANT', managerId: ''
  });

  // Încărcăm lista de utilizatori
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Eroare la încărcarea utilizatorilor", error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Curățăm token-ul
    navigate('/login'); // Trimitem la login
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(formData.email)) {
      alert("Formatul adresei de email este invalid!");
      return;
    }
    
    try {
      if (editingUserId) {
        // Update utilizator existent
        await api.put(`/users/${editingUserId}`, formData);
        alert("Utilizator actualizat cu succes!");
      } else {
        // Creare utilizator nou
        await api.post('/users', formData);
        alert("Utilizator creat cu succes!");
      }
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Eroare la procesare");
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', 
      role: user.role,
      managerId: user.managerId || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', password: '', role: 'EXECUTANT', managerId: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sigur vrei să ștergi acest utilizator?")) {
      try {
        await api.delete(`/users/${id}`); // Ștergere utilizator
        fetchUsers();
      } catch (error) {
        alert("Eroare la ștergere");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Gestiune Echipă (ADMIN)</h1>
        <button className="btn-logout" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="section-card">
        <h3 className="section-title">
          {editingUserId ? `Editează: ${formData.name}` : "Adaugă Utilizator Nou"}
        </h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <input 
            className="login-input" 
            placeholder="Nume" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            className="login-input" 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            className="login-input" 
            type="password" 
            placeholder={editingUserId ? "Parolă nouă (opțional)" : "Parolă"} 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required={!editingUserId} 
          />
          
          <select 
            className="login-input" 
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})}
          >
            <option value="MANAGER">MANAGER</option>
            <option value="EXECUTANT">EXECUTANT</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          {formData.role === 'EXECUTANT' && (
            <select 
              className="login-input" 
              value={formData.managerId} 
              onChange={e => setFormData({...formData, managerId: e.target.value})}
            >
              <option value="">Alege Managerul...</option>
              {users.filter(u => u.role === 'MANAGER').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          <div className="form-actions">
            <button type="submit" className="login-button">
              {editingUserId ? 'SALVEAZĂ' : 'CREAZĂ CONT'}
            </button>
            {editingUserId && (
              <button type="button" className="btn-cancel-link" onClick={resetForm}>Anulează</button>
            )}
          </div>
        </form>
      </div>

      <div className="section-card">
        <div className="list-header">
          <h3 className="section-title">Lista Utilizatorilor</h3>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Caută..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={editingUserId === user.id ? 'editing-row' : ''}>
                  <td data-label="Nume">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Rol">
                    <span className={`status-badge ${user.role === 'MANAGER' ? 'status-pending' : user.role === 'ADMIN' ? 'status-closed' : 'status-open'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Acțiuni" className="actions-cell">
                    <button className="btn-modify" onClick={() => handleEditClick(user)}>Modifică</button>
                    <button className="btn-delete" onClick={() => handleDelete(user.id)}>Șterge</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;