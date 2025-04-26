import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ChatService } from '../../services/chat';
import { HistoryService } from '../../services/history';
import { ChatMessage } from '../../types';
import { marked } from 'marked';

const ChatScreen: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatService = new ChatService();
  const historyService = new HistoryService();

  useEffect(() => {
    // Add welcome message when component mounts if no messages
    if (messages.length === 0 && currentUser) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `Welcome back, ${currentUser.name}! How can I help you with Cameroon legal information today?`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [currentUser, messages.length]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // In a real app, this would communicate with a backend service
      // For demo, we'll simulate a response based on the input
      await chatService.sendMessage(inputMessage);
      
      // Simulate bot response after a delay
      setTimeout(() => {
        const botResponse = getBotResponse(inputMessage);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
        
        // Add to history
        historyService.addToHistory(inputMessage, botResponse);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error connecting to the legal database. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Simple AI responses for demo purposes
  const getBotResponse = (message: string): string => {
    const normalizedMessage = message.toLowerCase();
    
    if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi')) {
      return "Hello! I'm your Cameroon legal assistant. How can I help you with legal information today?";
    } else if (normalizedMessage.includes('theft') || normalizedMessage.includes('stealing')) {
      return "**Theft in Cameroon Law**\n\nTheft is addressed in Section 318 of the Cameroon Penal Code.\n\n**Definition:** Theft is defined as fraudulently taking property belonging to another person.\n\n**Penalties:**\n- Simple theft: Imprisonment from 5 to 10 years and a fine\n- Aggravated theft (with weapons or at night): Imprisonment from 10 to 20 years\n\nIf you're dealing with a theft case, it's advisable to consult with a licensed attorney in Cameroon for specific advice.";
    } else if (normalizedMessage.includes('marriage') || normalizedMessage.includes('divorce')) {
      return "**Marriage and Divorce in Cameroon**\n\nCameroon recognizes both civil marriages and traditional marriages.\n\n**Marriage Requirements:**\n- Minimum age: 18 for males, 15 for females (with parental consent)\n- No existing marriages (prohibition of polygamy in civil marriages)\n- Consent of both parties\n\n**Divorce:**\n- Grounds include adultery, abandonment, and cruelty\n- Both judicial and traditional divorce procedures exist\n- Child custody typically favors the mother for young children\n\nThe Civil Status Registration Ordinance (No. 81-02) governs civil marriages and divorces in Cameroon.";
    } else if (normalizedMessage.includes('assault') || normalizedMessage.includes('battery') || normalizedMessage.includes('fight')) {
      return "**Assault in Cameroon Law**\n\nAssault is covered under Section 337 of the Cameroon Penal Code.\n\n**Definition:** Assault refers to any force intentionally applied to another person without their consent.\n\n**Penalties:**\n- Simple assault: Imprisonment from 6 days to 3 years and a fine\n- Aggravated assault (causing serious harm): Imprisonment from 5 to 10 years\n- Assault resulting in death unintentionally: Imprisonment from 6 to 20 years\n\nSelf-defense is recognized as a legal justification under certain circumstances, outlined in Section 84 of the Penal Code.";
    } else {
      return "Thank you for your question about Cameroon's legal system. To provide you with accurate information, I would need to research specific Cameroon laws and regulations related to this topic. In a full implementation, I would connect to comprehensive legal databases and resources specific to Cameroon's legal code.\n\nIf you have questions about a specific area of law, such as criminal law, family law, property rights, or business regulations, please let me know and I can provide more targeted information.";
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.sender === 'bot') {
      return <div dangerouslySetInnerHTML={{ __html: marked(message.text) }} />;
    }
    return <p>{message.text}</p>;
  };

  return (
    <div id="chat-screen" className="max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-4rem)]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Legal Assistant</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Ask questions about Cameroon's legal system, laws, and offences. I'll provide information and references to relevant legal provisions.</p>
      </div>

      <div id="chat-messages" className="flex-grow overflow-y-auto mb-4 space-y-4 p-2">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div 
              className={`py-2 px-4 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
              }`}
            >
              {renderMessageContent(message)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg py-2 px-4">
              <div className="flex items-center">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <form id="chat-form" className="flex" onSubmit={handleSubmit}>
          <input 
            type="text" 
            id="chat-input" 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
            placeholder="Ask a legal question..." 
            disabled={isLoading}
            required 
          />
          <button 
            type="submit"
            disabled={isLoading} 
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-r-lg transition duration-200 focus:outline-none disabled:opacity-70"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;