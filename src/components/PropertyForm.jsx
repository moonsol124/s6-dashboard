// src/components/PropertyForm.jsx
import React, { useState, useEffect } from 'react';

// Helper function to safely handle array fields (convert comma-separated string to array)
const parseArrayInput = (value) => {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(Boolean); // Trim whitespace and remove empty strings
};

// Helper function to format array for display in input
const formatArrayInput = (arr) => {
     if (!arr || arr.length === 0) return '';
    return arr.join(', ');
};


function PropertyForm({ onSubmit, initialData = {}, isEditing = false, isLoading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    image: '',
    images: '', // Store as comma-separated string in form
    tags: '',   // Store as comma-separated string in form
    description: '',
    features: '', // Store as comma-separated string in form
  });

  // Populate form if editing
  useEffect(() => {
    if (isEditing && initialData.id) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        price: initialData.price || '',
        bedrooms: initialData.bedrooms ?? '', // Handle null/undefined
        bathrooms: initialData.bathrooms ?? '',
        area: initialData.area ?? '',
        image: initialData.image || '',
        images: formatArrayInput(initialData.images), // Format array for input
        tags: formatArrayInput(initialData.tags),
        description: initialData.description || '',
        features: formatArrayInput(initialData.features),
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      // Convert number fields if needed, otherwise keep as string
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission

     // Prepare data for submission (convert string arrays back to arrays)
     const submissionData = {
        ...formData,
        bedrooms: formData.bedrooms === '' ? null : Number(formData.bedrooms), // Handle empty string for numbers -> null
        bathrooms: formData.bathrooms === '' ? null : Number(formData.bathrooms),
        area: formData.area === '' ? null : Number(formData.area),
        images: parseArrayInput(formData.images),
        tags: parseArrayInput(formData.tags),
        features: parseArrayInput(formData.features),
    };

    // Remove empty values before submitting (optional, depends on backend)
    Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === '' || submissionData[key] === null || (Array.isArray(submissionData[key]) && submissionData[key].length === 0)) {
           // Decide whether to delete the key or send null/empty array
           // Sending null for optional fields is often preferred
           if (['bedrooms', 'bathrooms', 'area'].includes(key)) {
             submissionData[key] = null;
           } else if (Array.isArray(submissionData[key])) {
              submissionData[key] = []; // Send empty array
           }
           else if (key !== 'name') { // Keep name even if empty? Or add validation
               delete submissionData[key]; // Or set to null if preferred
           }
        }
    });


    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background p-6 rounded-brand shadow-md space-y-4">
      {/* Input fields */}
      {/* Use grid for better layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textSecondary mb-1">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-textSecondary mb-1">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
         {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-textSecondary mb-1">Price (e.g., € 1,200,000)</label>
          <input
            type="text" // Keep as text to allow currency symbols/commas
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
         {/* Bedrooms */}
         <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-textSecondary mb-1">Bedrooms</label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        {/* Bathrooms */}
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-textSecondary mb-1">Bathrooms</label>
          <input
            type="number"
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        {/* Area */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-textSecondary mb-1">Area (m²)</label>
          <input
            type="number"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
             min="0"
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
         {/* Image URL */}
         <div className="md:col-span-2">
           <label htmlFor="image" className="block text-sm font-medium text-textSecondary mb-1">Main Image URL</label>
           <input
             type="url"
             id="image"
             name="image"
             value={formData.image}
             onChange={handleChange}
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
             placeholder="https://..."
           />
         </div>
         {/* Gallery Image URLs */}
         <div className="md:col-span-2">
           <label htmlFor="images" className="block text-sm font-medium text-textSecondary mb-1">Gallery Image URLs (comma-separated)</label>
           <input
             type="text"
             id="images"
             name="images"
             value={formData.images}
             onChange={handleChange}
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
             placeholder="https://url1, https://url2, ..."
           />
         </div>
         {/* Tags */}
         <div className="md:col-span-2">
           <label htmlFor="tags" className="block text-sm font-medium text-textSecondary mb-1">Tags (comma-separated)</label>
           <input
             type="text"
             id="tags"
             name="tags"
             value={formData.tags}
             onChange={handleChange}
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
             placeholder="Luxury, Ski-in, View, ..."
           />
         </div>
          {/* Features */}
         <div className="md:col-span-2">
           <label htmlFor="features" className="block text-sm font-medium text-textSecondary mb-1">Features (comma-separated)</label>
           <input
             type="text"
             id="features"
             name="features"
             value={formData.features}
             onChange={handleChange}
             className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
             placeholder="Pool, Sauna, Fireplace, ..."
           />
         </div>
          {/* Description */}
         <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-textSecondary mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          ></textarea>
        </div>
      </div>


      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full md:w-auto px-6 py-2 rounded-brand text-background font-medium transition-colors duration-150 ease-in-out ${
            isLoading
              ? 'bg-primary/50 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/80'
          }`}
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Update Property' : 'Add Property')}
        </button>
      </div>
    </form>
  );
}

export default PropertyForm;