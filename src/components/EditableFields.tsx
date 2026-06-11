import { useState } from 'react';
import type { ExtractedData, UserCorrections } from '../types';
import { titleCase } from '../lib/format';

interface Props {
  data: ExtractedData;
  onSave: (corrections: UserCorrections) => void;
  saving: boolean;
}

const SYSTEM_TYPES = [
  'central_heat_pump', 'heat_pump_split', 'mini_split',
  'furnace_ac_split', 'ac_only', 'furnace_only', 'package_unit', 'other',
];

const SEER2_OPTIONS = [13, 14, 14.3, 15, 15.2, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
const TONNAGE_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];

export default function EditableFields({ data, onSave, saving }: Props) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    zipCode: data.zipCode,
    systemType: data.systemType,
    tonnage: data.tonnage ?? '',
    seer2: data.seer2 ?? '',
    qualityTier: data.qualityTier,
    permitsIncluded: data.permitsIncluded,
    ductworkIncluded: data.ductworkIncluded,
    electricalIncluded: data.electricalIncluded,
  });

  const handleSave = () => {
    const corrections: UserCorrections = {};
    if (fields.zipCode !== data.zipCode) corrections.zipCode = fields.zipCode;
    if (fields.systemType !== data.systemType) corrections.systemType = fields.systemType;
    if (fields.tonnage !== '' && fields.tonnage !== data.tonnage) corrections.tonnage = Number(fields.tonnage);
    if (fields.seer2 !== '' && fields.seer2 !== data.seer2) corrections.seer2 = Number(fields.seer2);
    if (fields.qualityTier !== data.qualityTier) corrections.qualityTier = fields.qualityTier;
    if (fields.permitsIncluded !== data.permitsIncluded) corrections.permitsIncluded = fields.permitsIncluded;
    if (fields.ductworkIncluded !== data.ductworkIncluded) corrections.ductworkIncluded = fields.ductworkIncluded;
    if (fields.electricalIncluded !== data.electricalIncluded) corrections.electricalIncluded = fields.electricalIncluded;

    if (Object.keys(corrections).length > 0) {
      onSave(corrections);
    }
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-warm-900">Extracted Details</h3>
          <button onClick={() => setEditing(true)} className="text-sm text-gold-600 hover:text-gold-500 font-medium tracking-wide transition-colors">
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-warm-500 font-light">ZIP:</span> <span className="text-warm-800">{data.zipCode}</span></div>
          <div><span className="text-warm-500 font-light">System:</span> <span className="text-warm-800">{titleCase(data.systemType)}</span></div>
          <div><span className="text-warm-500 font-light">Brand:</span> <span className="text-warm-800">{data.equipmentBrand ?? 'Unknown'}</span></div>
          <div><span className="text-warm-500 font-light">Quality:</span> <span className="text-warm-800">{titleCase(data.qualityTier)}</span></div>
          <div><span className="text-warm-500 font-light">Tonnage:</span> <span className="text-warm-800">{data.tonnage ?? 'Unknown'}</span></div>
          <div><span className="text-warm-500 font-light">SEER2:</span> <span className="text-warm-800">{data.seer2 ?? 'Unknown'}</span></div>
          <div><span className="text-warm-500 font-light">Permits:</span> <span className="text-warm-800">{data.permitsIncluded ? 'Yes' : 'No'}</span></div>
          <div><span className="text-warm-500 font-light">Ductwork:</span> <span className="text-warm-800">{data.ductworkIncluded ? 'Yes' : 'No'}</span></div>
          <div><span className="text-warm-500 font-light">Electrical:</span> <span className="text-warm-800">{data.electricalIncluded ? 'Yes' : 'No'}</span></div>
          {data.contractorName && <div className="col-span-2"><span className="text-warm-500 font-light">Contractor:</span> <span className="text-warm-800">{data.contractorName}</span></div>}
        </div>
      </div>
    );
  }

  const inputClass = "block w-full border border-cream-300 rounded-lg px-3 py-2 bg-cream-50 text-warm-800 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors";

  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg text-warm-900">Correct Details</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label className="space-y-1.5">
          <span className="text-warm-500 font-light text-xs uppercase tracking-wider">ZIP Code</span>
          <input type="text" value={fields.zipCode} onChange={(e) => setFields({ ...fields, zipCode: e.target.value })}
            className={inputClass} maxLength={5} />
        </label>
        <label className="space-y-1.5">
          <span className="text-warm-500 font-light text-xs uppercase tracking-wider">System Type</span>
          <select value={fields.systemType} onChange={(e) => setFields({ ...fields, systemType: e.target.value })}
            className={inputClass}>
            {SYSTEM_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-warm-500 font-light text-xs uppercase tracking-wider">Tonnage</span>
          <select value={fields.tonnage} onChange={(e) => setFields({ ...fields, tonnage: e.target.value ? Number(e.target.value) : '' })}
            className={inputClass}>
            <option value="">Unknown</option>
            {TONNAGE_OPTIONS.map((t) => <option key={t} value={t}>{t} Ton</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-warm-500 font-light text-xs uppercase tracking-wider">SEER2</span>
          <select value={fields.seer2} onChange={(e) => setFields({ ...fields, seer2: e.target.value ? Number(e.target.value) : '' })}
            className={inputClass}>
            <option value="">Unknown</option>
            {SEER2_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-warm-500 font-light text-xs uppercase tracking-wider">Quality Tier</span>
          <select value={fields.qualityTier} onChange={(e) => setFields({ ...fields, qualityTier: e.target.value })}
            className={inputClass}>
            <option value="budget">Budget</option>
            <option value="mid">Mid</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <div className="space-y-3 pt-5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={fields.permitsIncluded} onChange={(e) => setFields({ ...fields, permitsIncluded: e.target.checked })}
              className="rounded border-cream-400 text-gold-600 focus:ring-gold-500/30" />
            <span className="text-warm-600 text-sm">Permits included</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={fields.ductworkIncluded} onChange={(e) => setFields({ ...fields, ductworkIncluded: e.target.checked })}
              className="rounded border-cream-400 text-gold-600 focus:ring-gold-500/30" />
            <span className="text-warm-600 text-sm">Ductwork included</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={fields.electricalIncluded} onChange={(e) => setFields({ ...fields, electricalIncluded: e.target.checked })}
              className="rounded border-cream-400 text-gold-600 focus:ring-gold-500/30" />
            <span className="text-warm-600 text-sm">Electrical included</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-warm-700 text-cream-50 rounded-lg text-sm font-medium hover:bg-warm-800 disabled:opacity-50 transition-colors tracking-wide">
          {saving ? 'Re-analyzing...' : 'Save & Re-analyze'}
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-2.5 text-warm-500 hover:text-warm-700 text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
