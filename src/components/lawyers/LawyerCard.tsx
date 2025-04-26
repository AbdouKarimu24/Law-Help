import React from 'react';
import { Star, MapPin, Phone, Globe } from 'lucide-react';
import { Lawyer } from '../../types';

interface LawyerCardProps {
  lawyer: Lawyer;
  onClick: () => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={lawyer.profileImage || 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg'}
            alt={`${lawyer.name}'s profile`}
            className="w-24 h-24 rounded-lg object-cover"
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{lawyer.name}</h3>
          <p className="text-primary font-medium">{lawyer.specialization}</p>
          
          <div className="flex items-center mt-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-1 text-gray-600 dark:text-gray-300">
              {lawyer.averageRating?.toFixed(1) || 'N/A'} ({lawyer.totalRatings || 0} reviews)
            </span>
          </div>
          
          <div className="mt-3 space-y-1">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{lawyer.officeAddress}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{lawyer.phone}</span>
            </div>
            {lawyer.website && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Globe className="w-4 h-4 mr-2" />
                <a 
                  href={lawyer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerCard;