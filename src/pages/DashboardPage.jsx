import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropertyList from '../components/PropertyList'; // Assuming this component displays a list of properties
import { getAllProperties, deleteProperty } from '../services/api';
import { FaPlus, FaChevronLeft, FaChevronRight, FaTimesCircle } from 'react-icons/fa';

function DashboardPage() {
  const [properties, setProperties] = useState([]); // Holds ALL fetched properties
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  // --- Filtering State ---
  const [filterName, setFilterName] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterBedrooms, setFilterBedrooms] = useState('');

  // --- Fetch ALL properties ---
  const fetchProperties = useCallback(async () => {
    console.log("[DashboardPage] Fetching all properties...");
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProperties();
      console.log("[DashboardPage] Raw fetched properties data:", data);
      setProperties(data || []); // Ensure properties is always an array
      console.log(`[DashboardPage] Successfully fetched ${data?.length || 0} properties.`);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError('Failed to load properties... Please try again later.');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Effect to fetch properties on component mount ---
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // --- Delete Handler ---
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        console.log(`[DashboardPage] Property ${id} deleted successfully.`);
        // Update the local state by filtering out the deleted property
        setProperties(prevProperties => prevProperties.filter(prop => prop.id !== id));
      } catch (err) {
        setError('Failed to delete property.');
        console.error(err);
      }
    }
  }, []);

  // --- Filter Change Handlers (useCallback and reset page) ---
  const handleFilterNameChange = useCallback((e) => { setFilterName(e.target.value); setCurrentPage(1); }, []);
  const handleFilterMinPriceChange = useCallback((e) => { setFilterMinPrice(e.target.value); setCurrentPage(1); }, []);
  const handleFilterMaxPriceChange = useCallback((e) => { setFilterMaxPrice(e.target.value); setCurrentPage(1); }, []);
  const handleFilterAddressChange = useCallback((e) => { setFilterAddress(e.target.value); setCurrentPage(1); }, []);
  const handleFilterBedroomsChange = useCallback((e) => { setFilterBedrooms(e.target.value); setCurrentPage(1); }, []);

  // --- Clear All Filters Handler ---
  const handleClearFilters = useCallback(() => {
      setFilterName('');
      setFilterMinPrice('');
      setFilterMaxPrice('');
      setFilterAddress('');
      setFilterBedrooms('');
      setCurrentPage(1); // Reset pagination
      console.log("[DashboardPage] Filters cleared.");
  }, []);

  // --- Filtering and Pagination Logic (Recalculates when dependencies change) ---
  const { currentItems, totalPages, filteredPropertiesCount } = useMemo(() => {
    console.log("[DashboardPage] Recalculating filtered and paginated data.");

    let filteredProperties = properties;

    // Apply Filtering
    if (filterName) {
      const lowerCaseFilterName = filterName.toLowerCase().trim();
      filteredProperties = filteredProperties.filter(property =>
         property.name && typeof property.name === 'string' &&
         property.name.toLowerCase().trim().includes(lowerCaseFilterName)
      );
    }
    const minPrice = Number(filterMinPrice);
    const maxPrice = Number(filterMaxPrice);
    if (!isNaN(minPrice) && filterMinPrice !== '') {
       filteredProperties = filteredProperties.filter(property => property.price !== undefined && property.price !== null && typeof property.price === 'number' && property.price >= minPrice);
    }
     if (!isNaN(maxPrice) && filterMaxPrice !== '') {
       filteredProperties = filteredProperties.filter(property => property.price !== undefined && property.price !== null && typeof property.price === 'number' && property.price <= maxPrice);
    }
     if (filterAddress) {
        const lowerCaseFilterAddress = filterAddress.toLowerCase().trim();
        filteredProperties = filteredProperties.filter(property => property.address && typeof property.address === 'string' && property.address.toLowerCase().trim().includes(lowerCaseFilterAddress));
     }
    const bedrooms = Number(filterBedrooms);
     if (!isNaN(bedrooms) && filterBedrooms !== '') {
        filteredProperties = filteredProperties.filter(property => property.bedrooms !== undefined && property.bedrooms !== null && typeof property.bedrooms === 'number' && property.bedrooms === bedrooms);
     }

    const totalFilteredItems = filteredProperties.length;
    const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage);

    // Apply Pagination to the FILTERED list
    let adjustedCurrentPage = currentPage;
     // If the current page is now past the end of the available pages (e.g., due to filtering/deletion)
     // Or if there are no filtered results, reset to page 1 (or max page if > 0 pages exist)
     if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        adjustedCurrentPage = calculatedTotalPages;
     } else if (calculatedTotalPages === 0) {
         // If there are no *filtered* properties, number of pages is 0. Stay on page 1 or adjust if needed.
         // If currentPage is already 1, keep it there. If it's > 1, adjust to 1.
         if (currentPage > 1) adjustedCurrentPage = 1;
     } else {
        // Otherwise, the current page is valid or there's only one page, keep it.
        adjustedCurrentPage = currentPage;
     }


    const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = filteredProperties.slice(startIndex, endIndex);

    // Important: If currentPage needed adjustment, update the state.
    // This state update happens *during* render from useMemo, which is safe.
    // Only update if it's actually different to avoid unnecessary re-renders.
    if (adjustedCurrentPage !== currentPage) {
       console.log(`[DashboardPage] Adjusting currentPage from ${currentPage} to ${adjustedCurrentPage}`);
       setCurrentPage(adjustedCurrentPage);
    }


    // Return the calculated data
    return {
        currentItems: itemsToDisplay,
        totalPages: calculatedTotalPages,
        filteredPropertiesCount: totalFilteredItems
    };
  }, [properties, currentPage, itemsPerPage, filterName, filterMinPrice, filterMaxPrice, filterAddress, filterBedrooms]);

  // --- Pagination Handlers (useCallback) ---
  const handleItemsPerPageChange = useCallback((event) => {
    const newItemsPerPage = Number(event.target.value);
    console.log(`[DashboardPage] Changing items per page to: ${newItemsPerPage}`);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handleNextPage = useCallback(() => {
    const nextPage = Math.min(currentPage + 1, totalPages);
    console.log(`[DashboardPage] Going to next page: ${nextPage}`);
    setCurrentPage(nextPage);
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    const prevPage = Math.max(currentPage - 1, 1);
     console.log(`[DashboardPage] Going to previous page: ${prevPage}`);
    setCurrentPage(prevPage);
  }, [currentPage]);

   // Check if any filters are active to enable clear button
   const isAnyFilterActive = useMemo(() => {
       return (
           filterName !== '' ||
           filterMinPrice !== '' ||
           filterMaxPrice !== '' ||
           filterAddress !== '' ||
           filterBedrooms !== ''
       );
   }, [filterName, filterMinPrice, filterMaxPrice, filterAddress, filterBedrooms]);


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

      {/* Render content only when not loading and no error */}
      {!loading && !error && (
          <>
              {/* Case 1: No properties found in the system at all */}
              {/* This condition handles the scenario where the initial fetch was successful but returned an empty array */}
              {properties.length === 0 && (
                  <p className="text-center py-4 text-sm text-gray-500">No properties found in the system.</p>
              )}

              {/* Case 2: Properties were found, now handle filtering and display */}
              {/* This block runs only if properties.length > 0 */}
              {properties.length > 0 && (
                  <>
                      {/* Filtering Controls */}
                      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
                          <h2 className="text-xl font-secondary font-bold text-textSecondary mb-4">Filter Properties</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {/* Filter Inputs */}
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filterName">Name</label>
                                  <input type="text" id="filterName" name="filterName" value={filterName} onChange={handleFilterNameChange} placeholder="e.g., Cozy Cottage" className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filterMinPrice">Min Price</label>
                                  <input type="number" id="filterMinPrice" name="filterMinPrice" value={filterMinPrice} onChange={handleFilterMinPriceChange} placeholder="e.g., 100000" className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filterMaxPrice">Max Price</label>
                                  <input type="number" id="filterMaxPrice" name="filterMaxPrice" value={filterMaxPrice} onChange={handleFilterMaxPriceChange} placeholder="e.g., 500000" className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                              <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filterAddress">Address</label>
                                   <input type="text" id="filterAddress" name="filterAddress" value={filterAddress} onChange={handleFilterAddressChange} placeholder="e.g., Main St" className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                              <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filterBedrooms">Bedrooms</label>
                                   <input type="number" id="filterBedrooms" name="filterBedrooms" value={filterBedrooms} onChange={handleFilterBedroomsChange} placeholder="e.g., 3" className="w-full px-3 py-2 border border-grayLight rounded-brand focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"/>
                              </div>
                          </div>
                          {/* Clear Filters Button - Only show if at least one filter is active */}
                          {isAnyFilterActive && (
                             <div className="mt-4 text-right">
                                 <button
                                     onClick={handleClearFilters}
                                     className="flex items-center justify-center px-3 py-1.5 text-sm text-textSecondary hover:text-red-600 transition-colors"
                                 >
                                     <FaTimesCircle className="mr-1 h-4 w-4" /> Clear Filters
                                 </button>
                             </div>
                          )}
                      </div>

                      {/* Display filtered/paginated results or no match message */}
                      {filteredPropertiesCount > 0 ? (
                          <>
                              {/* Property List */}
                              <PropertyList properties={currentItems} onDelete={handleDelete} />

                              {/* Pagination Controls - Only show if more than one page of filtered results */}
                              {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm text-textSecondary">
                                  {/* Items per page dropdown */}
                                  <div className="flex items-center gap-2">
                                    <span>Show:</span>
                                    <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange} className="px-2 py-1 border border-grayLight rounded-brand bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm">
                                      <option value="10">10</option>
                                      <option value="15">15</option>
                                      <option value="20">20</option>
                                      <option value="50">50</option>
                                    </select>
                                    <span>entries</span>
                                  </div>

                                  {/* Page Info and Navigation Buttons */}
                                    <div className="flex items-center gap-3">
                                       {/* Display total *filtered* properties and current page info */}
                                       <span>
                                         Page {currentPage} of {totalPages} ({filteredPropertiesCount} {filteredPropertiesCount === 1 ? 'property' : 'properties'} filtered)
                                       </span>
                                      <div className="flex items-center gap-1">
                                        <button onClick={handlePrevPage} disabled={currentPage === 1} className={`p-1.5 rounded-brand border border-grayLight transition-colors ${ currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30' }`} aria-label="Previous Page">
                                          <FaChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`p-1.5 rounded-brand border border-grayLight transition-colors ${ currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30' }`} aria-label="Next Page">
                                          <FaChevronRight className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                </div>
                              )}
                          </>
                      ) : (
                          // Message when no *filtered* properties are found matching current criteria
                          <p className="text-center py-4 text-sm text-gray-500">No properties found matching the selected criteria.</p>
                      )}
                  </>
              )}
          </>
      )}
    </div>
  );
}

export default DashboardPage;