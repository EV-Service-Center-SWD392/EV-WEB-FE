/**
 * Schedules & Queue Management Page
 * Container-based architecture cho phân công lịch và quản lý hàng chờ
 */

'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ListOrdered } from 'lucide-react';

import { Card } from '@/components/ui/card';

import { ScheduleContainer } from './_containers/ScheduleContainer';
import { QueueContainer } from './_containers/QueueContainer';

type Tab = 'schedule' | 'queue';

export default function SchedulesPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>('schedule');

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lập lịch & Quản lý hàng chờ</h1>
        <p className="text-muted-foreground mt-1">
          Phân công kỹ thuật viên và quản lý hàng chờ khách hàng
        </p>
      </div>

      {/* Tabs Navigation */}
      <Card className="p-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${activeTab === 'schedule'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Phân công (Schedule)</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${activeTab === 'queue'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Hàng chờ (Queue)</span>
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      <div className="animate-in fade-in-50 duration-300">
        {activeTab === 'schedule' && <ScheduleContainer />}
        {activeTab === 'queue' && <QueueContainer />}
      </div>
    </div>
  );
}
