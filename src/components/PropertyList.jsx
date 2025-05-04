// src/components/PropertyList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Optional icons

function PropertyList({ properties, onDelete }) {

  if (!properties || properties.length === 0) {
    return <p className="text-center text-textSecondary">No properties found.</p>;
  }

  return (
    <div className="overflow-x-auto bg-background rounded-brand shadow-md">
      <table className="min-w-full divide-y divide-grayLight">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-textSecondary uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-textSecondary uppercase tracking-wider">Address</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-textSecondary uppercase tracking-wider">Price</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium font-secondary text-textSecondary uppercase tracking-wider">Bedrooms</th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium font-secondary text-textSecondary uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-grayLight">
          {properties.map((prop) => (
            <tr key={prop.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textSecondary">{prop.name || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{prop.address || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{prop.price || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">{prop.bedrooms ?? '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                <Link
                  to={`/edit/${prop.id}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="Edit"
                >
                  <FaEdit className="inline h-4 w-4" />
                  {/* <span className="sr-only">Edit</span> */}
                </Link>
                <button
                  onClick={() => onDelete(prop.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete"
                >
                  <FaTrashAlt className="inline h-4 w-4" />
                  {/* <span className="sr-only">Delete</span> */}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PropertyList;