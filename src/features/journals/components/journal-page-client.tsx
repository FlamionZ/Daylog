'use client';

import * as React from 'react';
import { JournalEditor } from './journal-editor';
import { JournalList } from './journal-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import type { JournalRecord } from '../actions/journal-actions';

interface AvailableTask {
  id: string;
  title: string;
  status: string;
}

interface JournalPageClientProps {
  initialJournals: JournalRecord[];
  availableTasks: AvailableTask[];
}

export function JournalPageClient({
  initialJournals,
  availableTasks,
}: JournalPageClientProps) {
  const [selectedJournal, setSelectedJournal] = React.useState<JournalRecord | null>(null);
  const [mode, setMode] = React.useState<'list' | 'editor'>(
    initialJournals.length === 0 ? 'editor' : 'list',
  );

  const handleSelectJournal = (journal: JournalRecord) => {
    setSelectedJournal(journal);
    setMode('editor');
  };

  const handleNewJournal = () => {
    setSelectedJournal(null);
    setMode('editor');
  };

  return (
    <div className="space-y-4">
      {mode === 'editor' && initialJournals.length > 0 && (
        <div className="flex items-center justify-between pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('list')}
            className="text-xs"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Kembali ke Daftar Jurnal
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewJournal}
            className="text-xs"
          >
            <Plus className="mr-1.5 size-4" />
            Jurnal Baru
          </Button>
        </div>
      )}

      {mode === 'editor' ? (
        <JournalEditor
          initialJournal={selectedJournal}
          availableTasks={availableTasks}
          onSuccess={() => {
            // Can reload or stay in editor
          }}
        />
      ) : (
        <JournalList
          journals={initialJournals}
          onSelectJournal={handleSelectJournal}
          onNewJournal={handleNewJournal}
        />
      )}
    </div>
  );
}
