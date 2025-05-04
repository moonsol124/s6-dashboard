// src/pages/EditPropertyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import PropertyForm from '../components/PropertyForm';
import { getPropertyById, updateProperty } from '../services/api';

function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // Get navigate function
  const [propertyData, setPropertyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch property data on mount
  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPropertyById(id);
        setPropertyData(data);
      } catch (err) {
        setError('Failed to load property data. It might not exist.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleUpdateSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    try {
      await updateProperty(id, formData);
      // Navigate back to dashboard AND pass a state flag to trigger refetch
      navigate('/', { state: { updated: true }, replace: true }); // Added replace: true optionally
    } catch (err) {
      setError('Failed to update property. Please check the details and try again.');
      console.error(err);
      // Only set saving to false on error, otherwise navigation handles it
      setIsSaving(false);
    }
    // No finally block needed here for setIsSaving if navigation occurs on success
  };

  if (isLoading) {
    return <p className="text-center p-4">Loading property details...</p>;
  }

  if (error && !propertyData) {
     return <p className="text-center text-red-600 bg-red-100 p-4 rounded-brand">{error}</p>;
  }
   if (!propertyData) {
        return <p className="text-center text-textSecondary">Property not found.</p>;
   }

  return (
    <div>
      <h1 className="text-3xl font-secondary font-bold text-textSecondary mb-6">
        Edit Property: {propertyData?.name || ''}
      </h1>
       {/* Show save error if it occurs */}
       {error && !isLoading && <p className="mb-4 text-center text-red-600 bg-red-100 p-4 rounded-brand">{error}</p>}
      <PropertyForm
        onSubmit={handleUpdateSubmit}
        initialData={propertyData}
        isEditing={true}
        isLoading={isSaving} // Disable form while saving
      />
    </div>
  );
}

export default EditPropertyPage;