import React from 'react';
import './Loader.css';

const Loader = () => (
  <div className="orange-dots-spinner">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="dot" style={{ '--i': i }} />
    ))}
  </div>
);

export default Loader;