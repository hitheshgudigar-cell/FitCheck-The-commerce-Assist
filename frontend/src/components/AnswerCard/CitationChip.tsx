import React from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { Citation } from '../../types';

interface CitationChipProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export const CitationChip: React.FC<CitationChipProps> = ({ citation, onClick }) => {
  // Format doc label nicely (e.g. "Size chart · p.2")
  let docName = citation.doc;
  if (docName.toLowerCase().includes('size')) docName = 'Size chart';
  else if (docName.toLowerCase().includes('compat')) docName = 'Compatibility guide';
  else if (docName.toLowerCase().includes('manual') || docName.toLowerCase().includes('spec')) docName = 'Spec sheet';
  else if (docName.toLowerCase().includes('leaf') || docName.toLowerCase().includes('pack')) docName = 'Label facts';

  return (
    <button
      type="button"
      onClick={() => onClick(citation)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-stone-100 hover:bg-stone-200/80 dark:bg-dark-cardMuted dark:hover:bg-dark-border text-ink-700 dark:text-dark-ink border border-stone-300/80 dark:border-dark-border transition-colors group focus:outline-none focus:ring-2 focus:ring-teal-600"
      title={`Click to view citation excerpt from ${citation.doc} (Page ${citation.page})`}
    >
      <FileText size={13} className="text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform" />
      <span>{docName} · p.{citation.page}</span>
    </button>
  );
};
