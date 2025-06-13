import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCopy } from '@fortawesome/free-solid-svg-icons';
import { battleService } from '../services/battleService';

function BattleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const loadBattle = async () => {
      try {
        const data = await battleService.getBattleById(id);
        setBattle(data);
      } finally {
        setLoading(false);
      }
    };

    loadBattle();

    // Subscribe to updates
    const unsubscribe = battleService.subscribe(battles => {
      const updatedBattle = battles.find(b => b.id === id);
      if (!updatedBattle) {
        // Battle was deleted
        navigate('/');
      } else {
        setBattle(updatedBattle);
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(battle.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Loading battle...</h2>
      </div>
    );
  }

  if (!battle) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Battle not found</h2>
        <div className="icon-button" onClick={() => navigate('/')} title="Back to Home">
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
      </div>
    );
  }

  return (
    <div className="battle-detail">
      <div className="detail-header">
        <div className="header-left">
          <div className="icon-button" onClick={() => navigate('/')} title="Back to Home">
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <h1>{battle.title}</h1>
        </div>
      </div>
      
      {battle.description && (
        <p className="battle-description">{battle.description}</p>
      )}
      
      <img src={battle.image} alt={battle.title} />
      
      <div className="code-section">
        <div className="code-header">
          <h2>CSS Code</h2>
          {battle.code && (
            <div 
              className={`icon-button ${copySuccess ? 'success' : ''}`}
              onClick={handleCopyCode}
              title={copySuccess ? 'Copied!' : 'Copy Code'}
            >
              <FontAwesomeIcon icon={faCopy} />
            </div>
          )}
        </div>
        {battle.code ? (
          <pre className="code-block">
            <code>{battle.code}</code>
          </pre>
        ) : (
          <p className="no-code">Code not added yet.</p>
        )}
      </div>
    </div>
  );
}

export default BattleDetail; 