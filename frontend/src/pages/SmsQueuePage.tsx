import React from 'react';
import { useSmsQueue } from '../hooks/useSmsQueue';
import SmsQueueTable from '../components/sms-queue/SmsQueueTable';

const SmsQueuePage: React.FC = () => {
  const { data: smsQueue, isLoading, isError } = useSmsQueue();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SMS Queue</h1>
      {isLoading && <p>Loading SMS queue...</p>}
      {isError && <p className="text-red-500">Error loading SMS queue.</p>}
      {!isLoading && !isError && <SmsQueueTable smsQueue={smsQueue || []} />}
    </div>
  );
};

export default SmsQueuePage;