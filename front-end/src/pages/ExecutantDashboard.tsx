import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/AdminDashboard.css';

interface Project { id: string; name: string; }
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'COMPLETED';
  project?: Project;
}

const ExecutantDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my');
      setTasks(response.data);
    } catch (error) {
      console.error("Eroare la încărcarea task-urilor", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyTasks(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFinalize = async (taskId: string) => {
    try {
      // Asigură-te că endpoint-ul este corect (PUT sau PATCH)
      await api.put(`/tasks/${taskId}/complete`);
      fetchMyTasks(); // Refresh listă
    } catch (error: any) {
      alert(error.response?.data?.message || "Eroare la finalizare");
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const projectName = task.project?.name || 'Sarcini fără proiect';
    if (!acc[projectName]) acc[projectName] = [];
    acc[projectName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard-ul Meu</h1>
        <button className="btn-logout" onClick={handleLogout}>Log Out</button>
      </header>

      <main className="section-card">
        <h3 className="section-title">Task-uri pe Proiecte</h3>

        {loading ? (
          <p className="status-text">Se încarcă task-urile tale...</p>
        ) : Object.keys(groupedTasks).length > 0 ? (
          Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
            <div key={projectName} className="project-group">
              <h4 className="project-header">{projectName}</h4>
              <div className="table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Titlu</th>
                      <th>Descriere</th>
                      <th>Status</th>
                      <th className="actions-header">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectTasks.map(task => (
                      <tr key={task.id}>
                        <td><strong>{task.title}</strong></td>
                        <td>{task.description}</td>
                        <td>
                          <span className={`status-badge ${task.status === 'PENDING' ? 'status-pending' : 'status-closed'}`}>
                            {task.status === 'PENDING' ? 'În lucru' : 'Finalizat'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {task.status === 'PENDING' ? (
                            <button className="btn-finalize" onClick={() => handleFinalize(task.id)}>
                              Finalizează
                            </button>
                          ) : (
                            <span className="task-done-check">✓ Finalizat</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="status-text">Nu ai task-uri asignate momentan.</p>
        )}
      </main>

      {/* Butonul de Istoric mutat în dreapta-jos prin CSS */}
      <button className="btn-history-floating" onClick={() => navigate('/history')}>
         <span>📋</span> Istoric Task-uri
      </button>
    </div>
  );
};

export default ExecutantDashboard;