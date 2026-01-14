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
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await api.put(`/users/${editingUserId}`, formData);
        alert("Utilizator actualizat cu succes!");
      } else {
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
        await api.delete(`/users/${id}`);
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
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Gestiune Echipă (ADMIN)</h1>
        <button className="admin-btn-logout" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="admin-section-card">
        <h3 className="admin-section-title">
          {editingUserId ? `Editează: ${formData.name}` : "Adaugă Utilizator Nou"}
        </h3>
        <form onSubmit={handleSubmit} className="admin-form-grid">
          <input 
            className="admin-input-field" 
            placeholder="Nume" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <input 
            className="admin-input-field" 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            required 
          />
          <input 
            className="admin-input-field" 
            type="password" 
            placeholder={editingUserId ? "Parolă nouă (opțional)" : "Parolă"} 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required={!editingUserId} 
          />
          
          <select 
            className="admin-input-field" 
            value={formData.role} 
            onChange={e => setFormData({...formData, role: e.target.value})}
          >
            <option value="MANAGER">MANAGER</option>
            <option value="EXECUTANT">EXECUTANT</option>
          </select>

          {formData.role === 'EXECUTANT' && (
            <select 
              className="admin-input-field" 
              value={formData.managerId} 
              onChange={e => setFormData({...formData, managerId: e.target.value})}
            >
              <option value="">Alege Managerul...</option>
              {users.filter(u => u.role === 'MANAGER').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          <div className="admin-form-actions">
            <button type="submit" className="admin-submit-button">
              {editingUserId ? 'SALVEAZĂ' : 'CREAZĂ CONT'}
            </button>
            {editingUserId && (
              <button type="button" className="admin-btn-cancel-link" onClick={resetForm}>Anulează</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-section-card">
        <div className="admin-list-header">
          <h3 className="admin-section-title">Lista Utilizatorilor</h3>
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Caută..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-user-table">
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
                <tr key={user.id} className={editingUserId === user.id ? 'admin-editing-row' : ''}>
                  <td data-label="Nume">{user.name}</td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Rol">
                    <span className={`admin-status-badge ${user.role === 'MANAGER' ? 'admin-status-manager' : user.role === 'ADMIN' ? 'admin-status-admin' : 'admin-status-executant'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Acțiuni" className="admin-actions-cell">
                    <button className="admin-btn-modify" onClick={() => handleEditClick(user)}>Modifică</button>
                    <button className="admin-btn-delete" onClick={() => handleDelete(user.id)}>Șterge</button>
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