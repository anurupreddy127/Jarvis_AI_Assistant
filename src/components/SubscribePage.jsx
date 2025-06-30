import React, { useEffect, useState } from 'react';

export default function SubscribePage() {
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/offerings');
        const data = await res.json();
        setOfferings(data);
      } catch (err) {
        console.error('Error fetching offerings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      background: '#111',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h2 style={{ marginBottom: '1rem' }}>
        {loading ? 'Loading subscription plans...' : 'Available Plans'}
      </h2>

      {!loading && offerings && offerings.current ? (
        <div>
          <h3 style={{ marg
