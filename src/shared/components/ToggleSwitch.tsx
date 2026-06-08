import { c } from '../../styles/tokens';

interface Props {
  label: string;
  helper?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function ToggleSwitch({ label, helper, value, onChange }: Props) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', cursor: 'pointer', padding: '0.4rem 0' }}
      onClick={() => onChange(!value)}
    >
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: c.heading, display: 'block' }}>{label}</span>
        {helper && <span style={{ fontSize: '0.75rem', color: c.caption, display: 'block', marginTop: 1 }}>{helper}</span>}
      </div>
      <div style={{ width: 40, height: 22, borderRadius: 11, background: value ? c.success : c.captionLight, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: c.surface, boxShadow: c.shadowSm, transition: 'left 0.2s' }} />
      </div>
    </div>
  );
}
