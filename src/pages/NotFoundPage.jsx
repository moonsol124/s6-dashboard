// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-secondary font-bold mb-4">404 - Not Found</h1>
      <p className="mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="bg-primary text-background px-6 py-2 rounded-brand hover:opacity-80 transition-opacity">
        Go to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;