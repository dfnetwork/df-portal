import React from 'react';
import { useActivity } from '../api/activity';

const Activity: React.FC = () => {
  const { data } = useActivity();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Activity</h1>
      <div className="bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700">
        {data?.map((log: any) => (
          <div key={log.id} className="p-3 text-sm flex justify-between">
            <span>{log.action}</span>
            <span className="text-slate-500">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activity;
