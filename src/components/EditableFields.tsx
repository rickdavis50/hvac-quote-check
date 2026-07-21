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
      <div>
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl text-ink">What the engine read</h3>
          <button
            onClick={() => setEditing(true)}
            className="text-[12px] font-medium text-copper-deep transition-colors hover:text-copper"
          >
            Correct it
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] sm:grid-cols-3">
          {(
            [
              ['ZIP', data.zipCode],
              ['System', titleCase(data.systemType)],
              ['Brand', data.equipmentBrand ?? 'Unknown'],
              ['Tier', titleCase(data.qualityTier)],
              ['Tonnage', data.tonnage ?? 'Unknown'],
              ['SEER2', data.seer2 ?? 'Unknown'],
              ['Permits', data.permitsIncluded ? 'Yes' : 'No'],
              ['Ductwork', data.ductworkIncluded ? 'Yes' : 'No'],
              ['Electrical', data.electricalIncluded ? 'Yes' : 'No'],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex items-baseline border-b border-ink/10 py-1">
              <dt className="text-ink-mute">{label}</dt>
              <span className="leader" />
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
          {data.contractorName && (
            <div className="col-span-2 flex items-baseline border-b border-ink/10 py-1 sm:col-span-3">
              <dt className="text-ink-mute">Contractor</dt>
              <span className="leader" />
              <dd className="text-ink">{data.contractorName}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  const inputClass =
    'block w-full border border-ink/30 bg-paper px-3 py-2 text-[13px] text-ink focus:border-copper';

  return (
    <div>
      <h3 className="font-display text-xl text-ink">Correct the record</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 text-[13px]">
        <label className="space-y-1.5">
          <span className="block text-[11px] uppercase tracking-micro text-ink-mute">ZIP code</span>
          <input
            type="text"
            value={fields.zipCode}
            onChange={(e) => setFields({ ...fields, zipCode: e.target.value })}
            className={inputClass}
            maxLength={5}
          />
        </label>
        <label className="space-y-1.5">
          <span className="block text-[11px] uppercase tracking-micro text-ink-mute">System type</span>
          <select
            value={fields.systemType}
            onChange={(e) => setFields({ ...fields, systemType: e.target.value })}
            className={inputClass}
          >
            {SYSTEM_TYPES.map((t) => (
              <option key={t} value={t}>{titleCase(t)}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="block text-[11px] uppercase tracking-micro text-ink-mute">Tonnage</span>
          <select
            value={fields.tonnage}
            onChange={(e) => setFields({ ...fields, tonnage: e.target.value ? Number(e.target.value) : '' })}
            className={inputClass}
          >
            <option value="">Unknown</option>
            {TONNAGE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t} ton</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="block text-[11px] uppercase tracking-micro text-ink-mute">SEER2</span>
          <select
            value={fields.seer2}
            onChange={(e) => setFields({ ...fields, seer2: e.target.value ? Number(e.target.value) : '' })}
            className={inputClass}
          >
            <option value="">Unknown</option>
            {SEER2_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="block text-[11px] uppercase tracking-micro text-ink-mute">Equipment tier</span>
          <select
            value={fields.qualityTier}
            onChange={(e) => setFields({ ...fields, qualityTier: e.target.value })}
            className={inputClass}
          >
            <option value="budget">Budget</option>
            <option value="mid">Mid</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <div className="space-y-2.5 pt-5">
          {(
            [
              ['Permits included', 'permitsIncluded'],
              ['Ductwork included', 'ductworkIncluded'],
              ['Electrical included', 'electricalIncluded'],
            ] as const
          ).map(([label, key]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={fields[key]}
                onChange={(e) => setFields({ ...fields, [key]: e.target.checked })}
                className="h-3.5 w-3.5 accent-copper"
              />
              <span className="text-ink-soft">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={handleSave} disabled={saving} className="btn-ink disabled:opacity-40">
          {saving ? 'Re-pricing…' : 'Save and re-price'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-2.5 text-[13px] text-ink-mute transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
