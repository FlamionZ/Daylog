'use client';

import * as React from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  Edit,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '@/lib/date';
import type { ReportRecord } from '../actions/report-actions';

interface ReportDetailProps {
  report: ReportRecord;
  onBack: () => void;
  onEdit?: (report: ReportRecord) => void;
}

const typeLabels: Record<string, string> = {
  weekly: 'Laporan Mingguan',
  monthly: 'Laporan Bulanan',
  final: 'Laporan Akhir Magang',
  custom: 'Laporan Kustom',
};

export function ReportDetail({ report, onBack, onEdit }: ReportDetailProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.content_markdown);
      setCopied(true);
      toast.success('Konten laporan disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin konten');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([report.content_markdown], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const filename = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Mengunduh ${filename}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const isFinal = report.status === 'final';

  return (
    <div className="space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-xs print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
            <ArrowLeft className="mr-1.5 size-4" />
            Kembali
          </Button>
          <Badge variant={isFinal ? 'success' : 'secondary'}>
            {isFinal ? 'Final' : 'Draft'}
          </Badge>
          <span className="text-xs font-semibold text-[hsl(var(--primary))]">
            {typeLabels[report.report_type] || report.report_type}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isFinal && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(report)}
              className="text-xs"
            >
              <Edit className="mr-1.5 size-3.5" />
              Edit Draf
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? (
              <Check className="mr-1.5 size-3.5 text-[hsl(var(--success))]" />
            ) : (
              <Copy className="mr-1.5 size-3.5" />
            )}
            Salin Markdown
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="mr-1.5 size-3.5" />
            Unduh (.md)
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs"
          >
            <Printer className="mr-1.5 size-3.5" />
            Cetak / Ekspor PDF
          </Button>
        </div>
      </div>

      {/* Report Document Sheet */}
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-sm sm:p-10 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[hsl(var(--border))] pb-6">
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted))]">
            <Calendar className="size-3.5" />
            <span>
              Periode: {formatDate(report.period_start, 'd MMMM yyyy')} —{' '}
              {formatDate(report.period_end, 'd MMMM yyyy')}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
            {report.title}
          </h1>

          {report.finalized_at && (
            <p className="mt-1 text-xs text-[hsl(var(--muted))]">
              Difinalisasi pada: {formatDate(report.finalized_at, 'd MMMM yyyy, HH:mm')} WIB
            </p>
          )}
        </div>

        {/* Document Content */}
        <div className="pt-6 font-sans text-sm leading-relaxed text-[hsl(var(--foreground))] whitespace-pre-wrap">
          {report.content_markdown}
        </div>
      </div>
    </div>
  );
}
