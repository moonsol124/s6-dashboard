// src/pages/AddPropertyPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { createProperty } from '../services/api';

function AddPropertyPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      await createProperty(formData);
      navigate('/'); // Navigate back to dashboard on success
    } catch (err) {
      setError('Failed to add property. Please check the details and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-secondary font-bold text-textSecondary mb-6">
        Add New Property
      </h1>
      {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-4 rounded-brand">{error}</p>}
      <PropertyForm
        onSubmit={handleAddSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

export default AddPropertyPage;