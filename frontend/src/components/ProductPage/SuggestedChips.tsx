import React from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface SuggestedChipsProps {
  product: Product;
  onSelectChip: (question: string) => void;
}

export const SuggestedChips: React.FC<SuggestedChipsProps> = ({
  product,
  onSelectChip
}) => {
  const getSuggestions = () => {
    switch (product.category) {
      case 'clothing':
        return [
          "I'm bust 36, waist 30. Will the M fit?",
          "Will Size L fit bust 38, waist 31?",
          "Is the silk fabric pre-shrunk or dry-clean only?"
        ];

      case 'electronics_accessory':
        if (product.id.includes('cartridge')) {
          return [
            "Does this cartridge work with my HP DeskJet 2331?",
            "Will it work with HP DeskJet 2722?",
            "What is the estimated page yield for the 67XL?"
          ];
        }
        if (product.id.includes('mount')) {
          return [
            "I have a 75 inch TV with 600x400 VESA weighing 35kg. Will this mount fit?",
            "I have a 55 inch TV with 200x200 VESA weighing 20kg. Will this mount fit?",
            "What is the maximum wall clearance?"
          ];
        }
        if (product.id.includes('filter')) {
          return [
            "Does this filter fit my vacuum?",
            "Does this filter work with Dyson V11 Absolute?",
            "Will this filter fit my Dyson V8 Animal vacuum?"
          ];
        }
        return [
          "Is it compatible with my device?",
          "What is the maximum load rating?"
        ];

      case 'furniture':
        return [
          "Will this sofa fit through an 80 cm door?",
          "Can the legs be detached for moving?",
          "What is the minimum diagonal doorway clearance?"
        ];

      case 'grocery_pharmacy':
        return [
          "I need a gluten-free pain reliever. Is Crocin Advance gluten-free?",
          "Does it contain lactose or animal gelatin?",
          "What are the active ingredients and dosage form?"
        ];

      default:
        return [
          "Will this fit my requirements?",
          "Is this in stock near me today?",
          "What documents verify this specification?"
        ];
    }
  };

  const suggestions = getSuggestions();

  return (
    <div className="space-y-2 mb-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-dark-inkMuted font-mono">
        <Sparkles size={13} className="text-teal-700 dark:text-teal-400" />
        <span>Suggested Verification Questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectChip(q)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border text-ink-800 dark:text-dark-ink hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-all shadow-2xs hover:shadow-soft text-left active:scale-95"
          >
            "{q}"
          </button>
        ))}
      </div>
    </div>
  );
};
