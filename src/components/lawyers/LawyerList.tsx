import React, { useState, useEffect } from 'react';
import { LawyerService } from '../../services/lawyer';
import LawyerCard from './LawyerCard';
import { Lawyer } from '../../types';
import { Search } from 'lucide-react';

const LawyerList: React.FC = () => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const lawyerService = new LawyerService();

  useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    try {
      setIsLoading(true);
      const lawyerList = await lawyerService.getLawyers();
      setLawyers(lawyerList);
      setError('');
    } catch (error) {
      console.error('Error loading lawyers:', error);
      setError('Failed to load lawyers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => 
    lawyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.practiceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Find a Lawyer</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, specialization, or practice area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse flex space-x-2">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-red text-center py-4">{error}</div>
      ) : filteredLawyers.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-4">
          No lawyers found matching your search criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map(lawyer => (
            <LawyerCard
              key={lawyer.id}
              lawyer={lawyer}
              onClick={() => {/* Handle click */}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LawyerList;