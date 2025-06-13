import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes, faPlus, faSave, faSpinner, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { battleService } from '../services/battleService';
import { useAuth } from '../App';

function AdminPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    image: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBattles = async () => {
      try {
        const data = await battleService.getBattles();
        setBattles(data);
      } finally {
        setLoading(false);
      }
    };

    loadBattles();

    // Subscribe to updates
    const unsubscribe = battleService.subscribe(updatedBattles => {
      setBattles(updatedBattles);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await battleService.updateBattle(editingId, formData);
      } else {
        await battleService.addBattle(formData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        code: '',
        image: ''
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving battle:', error);
      alert('Failed to save battle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (battle) => {
    setFormData(battle);
    setEditingId(battle.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this battle?')) {
      try {
        await battleService.deleteBattle(id);
      } catch (error) {
        console.error('Error deleting battle:', error);
        alert('Failed to delete battle. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Loading battles...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <div 
          className="icon-button"
          onClick={handleLogout}
          title="Logout"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
        </div>
      </div>

      <div className="admin-form">
        <h2>{editingId ? 'Edit Battle' : 'Add New Battle'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder="Enter battle title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              disabled={submitting}
              placeholder="Enter battle description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">CSS Code</label>
            <textarea
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              rows="5"
              disabled={submitting}
              placeholder="Enter CSS code"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={submitting}
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
              />
            )}
          </div>

          <div className="form-actions">
            <div 
              className={`icon-button primary ${submitting ? 'disabled' : ''}`}
              onClick={!submitting ? handleSubmit : undefined}
              title={editingId ? 'Update Battle' : 'Add Battle'}
            >
              <FontAwesomeIcon 
                icon={submitting ? faSpinner : (editingId ? faSave : faPlus)} 
                className={submitting ? 'fa-spin' : ''}
              />
            </div>

            {editingId && !submitting && (
              <div 
                className="icon-button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: '',
                    description: '',
                    code: '',
                    image: ''
                  });
                }}
                title="Cancel Edit"
              >
                <FontAwesomeIcon icon={faTimes} />
              </div>
            )}
          </div>
        </form>
      </div>

      <h2 style={{ margin: '2rem 0 1rem', color: 'var(--text-color)' }}>Existing Battles</h2>
      <div className="battle-grid">
        {battles.map(battle => (
          <div key={battle.id} className="battle-card">
            <img src={battle.image} alt={battle.title} />
            <div className="battle-card-content">
              <h3>{battle.title}</h3>
              {battle.description && <p>{battle.description}</p>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div 
                  className="icon-button"
                  onClick={() => handleEdit(battle)}
                  title="Edit Battle"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </div>
                <div 
                  className="icon-button"
                  onClick={() => handleDelete(battle.id)}
                  title="Delete Battle"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel; 