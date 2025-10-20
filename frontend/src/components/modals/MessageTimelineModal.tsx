import React from 'react';
import { X, Clock, CheckCircle, XCircle, AlertCircle, RotateCcw, User, MessageSquare } from 'lucide-react';
import { useMessageTimeline } from '../../hooks/useQueue';
import { MessageTimelineEntry } from '../../services/queueApi';

interface MessageTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: number;
  contactPhone?: string;
}

const MessageTimelineModal: React.FC<MessageTimelineModalProps> = ({
  isOpen,
  onClose,
  messageId,
  contactPhone
}) => {
  const { data: timeline, isLoading, error } = useMessageTimeline(messageId, {
    enabled: isOpen && messageId > 0
  });

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <X className="h-5 w-5 text-gray-500" />;
      case 'retry':
        return <RotateCcw className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'sent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'retry':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end.getTime() - start.getTime();
    const diffInSeconds = diffInMs / 1000;
    
    if (diffInSeconds < 1) return `${diffInMs}ms`;
    if (diffInSeconds < 60) return `${diffInSeconds.toFixed(1)}s`;
    return `${(diffInSeconds / 60).toFixed(1)}m`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Message Timeline
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message ID: {messageId}
                {contactPhone && (
                  <>
                    <span className="mx-2">•</span>
                    <User className="h-4 w-4 mr-1" />
                    {contactPhone}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading timeline...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-red-600 dark:text-red-400">
                <XCircle className="h-8 w-8 mr-2" />
                Failed to load timeline
              </div>
            ) : !timeline || timeline.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="h-8 w-8 mr-2" />
                No timeline data available
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((entry: MessageTimelineEntry, index) => {
                  const timestamp = formatTimestamp(entry.timestamp);
                  const isLast = index === timeline.length - 1;
                  const nextEntry = index < timeline.length - 1 ? timeline[index + 1] : null;
                  
                  return (
                    <div key={entry.id} className="relative">
                      {/* Timeline line */}
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-600" />
                      )}
                      
                      <div className="flex items-start space-x-4">
                        {/* Status icon */}
                        <div className={`flex-shrink-0 p-2 rounded-full border-2 ${getStatusColor(entry.status)} dark:bg-gray-700 dark:border-gray-600`}>
                          {getStatusIcon(entry.status)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {entry.status.replace('_', ' ')}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {timestamp.relative} • {timestamp.date} {timestamp.time}
                              </p>
                            </div>
                            
                            {/* Duration */}
                            {nextEntry && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Duration: {formatDuration(entry.timestamp, nextEntry.timestamp)}
                              </div>
                            )}
                          </div>
                          
                          {/* Message/Details */}
                          {entry.message && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {entry.message}
                              </p>
                            </div>
                          )}
                          
                          {/* Error details */}
                          {entry.error_details && (
                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                              <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                Error Details:
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-400">
                                {entry.error_details}
                              </p>
                            </div>
                          )}
                          
                          {/* Provider response */}
                          {entry.provider_response && (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                Provider Response:
                              </p>
                              <pre className="text-xs text-blue-700 dark:text-blue-400 whitespace-pre-wrap">
                                {JSON.stringify(entry.provider_response, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {/* Metadata */}
                          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
                                Additional Info:
                              </p>
                              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {/* Attempt info */}
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Attempt: {entry.attempt_number}</span>
                            {entry.processing_time && (
                              <span>Processing: {entry.processing_time}ms</span>
                            )}
                            {entry.provider_name && (
                              <span>Provider: {entry.provider_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageTimelineModal;
