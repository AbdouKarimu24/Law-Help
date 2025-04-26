import React, { useState, useEffect } from 'react';
import { HistoryService } from '../../services/history';
import { HistoryItem } from '../../types';

type HistoryScreenProps = {
  onSelectChat: (query: string, response: string) => void;
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onSelectChat }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const historyService = new HistoryService();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const historyItems = await historyService.getHistory();
      setHistory(historyItems);
      setError('');
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectItem = async (id: number) => {
    try {
      const historyItem = await historyService.getHistoryItem(id);
      onSelectChat(historyItem.query, historyItem.response);
    } catch (error) {
      console.error('Error retrieving history item:', error);
      alert('Failed to load conversation');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div id="history-screen" className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Search History</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
            </div>
          </div>
        ) : (
          <div id="history-list" className="space-y-4">
            {error ? (
              <p className="text-red text-center py-4">{error}</p>
            ) : history.length === 0 ? (
              <p id="no-history" className="text-gray-500 dark:text-gray-400 text-center py-4">No search history yet</p>
            ) : (
              history.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-white">{truncateText(item.query, 100)}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.timestamp)}</span>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleSelectItem(item.id)}
                      className="text-primary text-sm hover:underline focus:outline-none"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;