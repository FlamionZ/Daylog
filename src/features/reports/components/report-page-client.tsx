'use client';

import * as React from 'react';
import { ReportList } from './report-list';
import { ReportBuilder } from './report-builder';
import { ReportDetail } from './report-detail';
import { KemnakerCompletionHub } from './kemnaker-completion-hub';
import { FileText, ShieldCheck } from 'lucide-react';
import type { ReportRecord } from '../actions/report-actions';

interface ReportPageClientProps {
  initialReports: ReportRecord[];
  activeInternship?: {
    companyName: string;
    roleTitle: string;
    startDate: string;
    endDate: string;
  } | null;
  statistics?: {
    totalJournals: number;
    completedJournals: number;
    totalAttendance: number;
    syncedAttendance: number;
    completedTasks: number;
    totalHoursFormatted: string;
  };
}

export function ReportPageClient({
  initialReports,
  activeInternship,
  statistics,
}: ReportPageClientProps) {
  const [selectedReport, setSelectedReport] = React.useState<ReportRecord | null>(null);
  const [editingReport, setEditingReport] = React.useState<ReportRecord | null>(null);
  const [viewMode, setViewMode] = React.useState<'list' | 'builder' | 'detail'>('list');
  const [activeTab, setActiveTab] = React.useState<'list' | 'completion'>('list');

  const handleSelectReport = (report: ReportRecord) => {
    setSelectedReport(report);
    setViewMode('detail');
  };

  const handleEditReport = (report: ReportRecord) => {
    setEditingReport(report);
    setViewMode('builder');
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setViewMode('builder');
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setEditingReport(null);
    setViewMode('list');
  };

  if (viewMode === 'detail' && selectedReport) {
    return (
      <ReportDetail
        report={selectedReport}
        onBack={handleBackToList}
        onEdit={(r) => {
          setEditingReport(r);
          setViewMode('builder');
        }}
      />
    );
  }

  if (viewMode === 'builder') {
    return (
      <ReportBuilder
        initialReport={editingReport}
        onSuccess={() => {
          setViewMode('list');
          window.location.reload();
        }}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'list'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
          }`}
        >
          <FileText className="size-3.5" />
          <span>Laporan Berkala</span>
          <span
            className={`rounded-full px-2 py-0.2 font-mono text-[10px] ${
              activeTab === 'list'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {initialReports.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completion')}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
            activeTab === 'completion'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
          }`}
        >
          <ShieldCheck className="size-3.5" />
          <span>Pusat Selesai Magang (Kemnaker)</span>
          <span
            className={`rounded-full px-2 py-0.2 font-mono text-[10px] font-bold ${
              activeTab === 'completion'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary/10 text-primary'
            }`}
          >
            Kemnaker Ready
          </span>
        </button>
      </div>

      {activeTab === 'list' ? (
        <ReportList
          reports={initialReports}
          onSelectReport={handleSelectReport}
          onEditReport={handleEditReport}
          onNewReport={handleNewReport}
          onRefresh={() => window.location.reload()}
        />
      ) : (
        <KemnakerCompletionHub
          reports={initialReports}
          activeInternship={activeInternship}
          statistics={statistics}
          onOpenReportBuilder={() => {
            setEditingReport(null);
            setViewMode('builder');
          }}
        />
      )}
    </div>
  );
}

