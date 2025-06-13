import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { battleService } from '../services/battleService';

function Home() {
  const navigate = useNavigate();
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const loadBattles = async () => {
      try {
        const data = await battleService.getBattles();
        setBattles(data);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadBattles();

    // Subscribe to updates
    const unsubscribe = battleService.subscribe(updatedBattles => {
      setBattles(updatedBattles);
    });

    return () => unsubscribe();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/battle/${id}`);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  // Filter and sort battles
  const filteredAndSortedBattles = battles
    .filter(battle => 
      battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (battle.description && battle.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const comparison = a.title.localeCompare(b.title);
      return sortAscending ? comparison : -comparison;
    });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>Loading battles...</h2>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>CSS Battle Challenges</h1>
      
      {/* Search and Sort Controls */}
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search battles by title..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button 
          className={`sort-button ${sortAscending ? 'ascending' : ''}`}
          onClick={toggleSort}
          title={`Sort ${sortAscending ? 'Z-A' : 'A-Z'}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
          Sort
        </button>
      </div>

      <div className="battle-grid">
        {battles.length === 0 ? (
          <div className="no-results">
            <h2>No CSS Battles Added Yet</h2>
            <p>Login as admin to add some challenges!</p>
          </div>
        ) : filteredAndSortedBattles.length === 0 ? (
          <div className="no-results">
            <h2>No matches found</h2>
            <p>Try adjusting your search term</p>
          </div>
        ) : (
          filteredAndSortedBattles.map((battle) => (
            <div
              key={battle.id}
              className="battle-card"
              onClick={() => handleCardClick(battle.id)}
            >
              <img src={battle.image} alt={battle.title} />
              <div className="battle-card-content">
                <h3>{battle.title}</h3>
                {battle.description && (
                  <p style={{ marginTop: '0.5rem', color: '#666' }}>
                    {battle.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home; 