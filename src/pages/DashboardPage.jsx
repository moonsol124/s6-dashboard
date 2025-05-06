// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Link } from 'react-router-dom';
import PropertyList from '../components/PropertyList';
import { getAllProperties, deleteProperty } from '../services/api';
import { FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Added Chevron icons

function DashboardPage() {
  const [properties, setProperties] = useState([]); // Holds ALL fetched properties
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  // --- Fetch ALL properties ---
  const fetchProperties = async () => {                  
    setLoading(true);
    setError(null);  
    try {
      const data = await getAllProperties();
      setProperties(data || []); // Ensure properties is always an array
    } catch (err) {
      setError('Failed to load properties... Please try again later.');
      setProperties([]); // Clear properties on error
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // --- Delete Handler ---
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        // Remove from state to update UI immediately
        const updatedProperties = properties.filter(prop => prop.id !== id);
        setProperties(updatedProperties);
        // Adjust current page if the last item on the last page was deleted
        const newTotalPages = Math.ceil(updatedProperties.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (updatedProperties.length === 0) {
             setCurrentPage(1); // Reset to 1 if list becomes empty
        }

      } catch (err) {
        setError('Failed to delete property.');
        console.error(err);
      }
    }
  };

  // --- Pagination Logic (Recalculates when dependencies change) ---
  const { currentItems, totalPages } = useMemo(() => {
    const totalItems = properties.length;
    const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = properties.slice(startIndex, endIndex);

    // Adjust current page if it becomes invalid after itemsPerPage changes
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(calculatedTotalPages); // Go to the new last page
    }

    return { currentItems: itemsToDisplay, totalPages: calculatedTotalPages };
  }, [properties, currentPage, itemsPerPage]); // Recalculate when these change


  // --- Pagination Handlers ---
  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = Number(event.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // --- Render ---
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-secondary font-bold text-textSecondary">
          Properties Overview
        </h1>
        <Link
          to="/add"
          className="flex items-center bg-primary text-background px-4 py-2 rounded-brand hover:opacity-80 transition-opacity text-sm font-medium whitespace-nowrap"
        >
          <FaPlus className="mr-2 h-4 w-4" /> Add New Property
        </Link>
      </div>

      {/* Display Loading/Error */}
      {loading && <p className="text-center p-4">Loading properties...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-brand">{error}</p>}

      {/* Only render list and controls if not loading and no error */}
      {!loading && !error && (
        <>
          {/* Pass the PAGINATED items to the list */}
          <PropertyList properties={currentItems} onDelete={handleDelete} />

          {/* Pagination Controls - Only show if needed */}
          {properties.length > 0 && totalPages > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm text-textSecondary">
              {/* Items per page dropdown */}
              <div className="flex items-center gap-2">
                <span>Show:</span>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-2 py-1 border border-grayLight rounded-brand bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                >
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span>entries</span>
              </div>

              {/* Page Info and Navigation Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                   <span>
                     Page {currentPage} of {totalPages} (Total: {properties.length} properties)
                   </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`p-1.5 rounded-brand border border-grayLight transition-colors ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                      }`}
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                       className={`p-1.5 rounded-brand border border-grayLight transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                      }`}
                      aria-label="Next Page"
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;