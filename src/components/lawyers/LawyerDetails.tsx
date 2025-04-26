import React, { useState, useEffect } from 'react';
import { LawyerService } from '../../services/lawyer';
import { RatingService } from '../../services/rating';
import { Lawyer, Rating } from '../../types';
import { MapPin, Phone, Globe, Star, Mail } from 'lucide-react';
import RatingForm from './RatingForm';

interface LawyerDetailsProps {
  lawyerId: number;
  onClose: () => void;
}

const LawyerDetails: React.FC<LawyerDetailsProps> = ({ lawyerId, onClose }) => {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  const lawyerService = new LawyerService();
  const ratingService = new RatingService();

  useEffect(() => {
    loadLawyerDetails();
  }, [lawyerId]);

  const loadLawyerDetails = async () => {
    try {
      setIsLoading(true);
      const [lawyerData, ratingsData] = await Promise.all([
        lawyerService.getLawyer(lawyerId),
        ratingService.getLawyerRatings(lawyerId)
      ]);
      setLawyer(lawyerData);
      setRatings(ratingsData);
      setError('');
    } catch (error) {
      console.error('Error loading lawyer details:', error);
      setError('Failed to load lawyer details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    await loadLawyerDetails();
    setShowRatingForm(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lawyer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="text-red text-center py-4">
            {error || 'Lawyer not found'}
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl m-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={lawyer.profileImage || 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg'}
              alt={`${lawyer.name}'s profile`}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{lawyer.name}</h2>
              <p className="text-primary font-medium">{lawyer.specialization}</p>
              <div className="flex items-center mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-600 dark:text-gray-300">
                  {lawyer.averageRating?.toFixed(1) || 'N/A'} ({lawyer.totalRatings || 0} reviews)
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">About</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{lawyer.bio}</p>
            
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Education</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{lawyer.education}</p>
            
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Experience</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{lawyer.experienceYears} years</p>
            
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Practice Areas</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {lawyer.practiceAreas.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
            
            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Languages</h4>
            <div className="flex flex-wrap gap-2">
              {lawyer.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">{lawyer.officeAddress}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">{lawyer.phone}</span>
              </div>
              {lawyer.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <a
                    href={lawyer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setShowRatingForm(true)}
                className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Reviews</h3>
          {ratings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {ratings.map(rating => (
                <div key={rating.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">
                        {rating.userName}
                      </span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-gray-600 dark:text-gray-300">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showRatingForm && (
          <RatingForm
            lawyerId={lawyerId}
            onSubmit={handleRatingSubmit}
            onCancel={() => setShowRatingForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LawyerDetails;