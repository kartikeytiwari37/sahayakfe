import React from 'react';
import './HomePage.css';
import Hero from './Hero';
import AgentsSection from './AgentsSection';
import FeaturesSection from './FeaturesSection';

function HomePage({ onSelectAgent }) {

  return (
    <div className="homepage">
      <Hero />

      <AgentsSection onSelectAgent={onSelectAgent} />

      <FeaturesSection />

      <footer className="homepage-footer">
        <p>© 2025 Sahayak AI Education Platform. Transforming learning through intelligent assistance.</p>
      </footer>
    </div>
  );
}

export default HomePage;
