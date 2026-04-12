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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Extracted Details</h3>
          <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:text-blue-800">
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">ZIP:</span> {data.zipCode}</div>
          <div><span className="text-gray-500">System:</span> {titleCase(data.systemType)}</div>
          <div><span className="text-gray-500">Brand:</span> {data.equipmentBrand ?? 'Unknown'}</div>
          <div><span className="text-gray-500">Quality:</span> {titleCase(data.qualityTier)}</div>
          <div><span className="text-gray-500">Tonnage:</span> {data.tonnage ?? 'Unknown'}</div>
          <div><span className="text-gray-500">SEER2:</span> {data.seer2 ?? 'Unknown'}</div>
          <div><span className="text-gray-500">Permits:</span> {data.permitsIncluded ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Ductwork:</span> {data.ductworkIncluded ? 'Yes' : 'No'}</div>
          <div><span className="text-gray-500">Electrical:</span> {data.electricalIncluded ? 'Yes' : 'No'}</div>
          {data.contractorName && <div className="col-span-2"><span className="text-gray-500">Contractor:</span> {data.contractorName}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Correct Details</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-gray-500">ZIP Code</span>
          <input type="text" value={fields.zipCode} onChange={(e) => setFields({ ...fields, zipCode: e.target.value })}
            className="block w-full border rounded px-2 py-1" maxLength={5} />
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">System Type</span>
          <select value={fields.systemType} onChange={(e) => setFields({ ...fields, systemType: e.target.value })}
            className="block w-full border rounded px-2 py-1">
            {SYSTEM_TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">Tonnage</span>
          <select value={fields.tonnage} onChange={(e) => setFields({ ...fields, tonnage: e.target.value ? Number(e.target.value) : '' })}
            className="block w-full border rounded px-2 py-1">
            <option value="">Unknown</option>
            {TONNAGE_OPTIONS.map((t) => <option key={t} value={t}>{t} Ton</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">SEER2</span>
          <select value={fields.seer2} onChange={(e) => setFields({ ...fields, seer2: e.target.value ? Number(e.target.value) : '' })}
            className="block w-full border rounded px-2 py-1">
            <option value="">Unknown</option>
            {SEER2_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-gray-500">Quality Tier</span>
          <select value={fields.qualityTier} onChange={(e) => setFields({ ...fields, qualityTier: e.target.value })}
            className="block w-full border rounded px-2 py-1">
            <option value="budget">Budget</option>
            <option value="mid">Mid</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <div className="space-y-2 pt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fields.permitsIncluded} onChange={(e) => setFields({ ...fields, permitsIncluded: e.target.checked })} />
            <span className="text-gray-600">Permits included</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fields.ductworkIncluded} onChange={(e) => setFields({ ...fields, ductworkIncluded: e.target.checked })} />
            <span className="text-gray-600">Ductwork included</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={fields.electricalIncluded} onChange={(e) => setFields({ ...fields, electricalIncluded: e.target.checked })} />
            <span className="text-gray-600">Electrical included</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Re-analyzing...' : 'Save & Re-analyze'}
        </button>
        <button onClick={() => setEditing(false)} className="px-4 py-2 text-gray-600 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
