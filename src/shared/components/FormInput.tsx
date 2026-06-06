import { c } from '../../styles/tokens';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const inputBase: React.CSSProperties = {
  padding: '0.55rem 0.75rem',
  borderRadius: 6,
  border: `2px solid ${c.stroke}`,
  fontSize: '0.95rem',
  color: c.heading,
  background: c.surface,
  width: '100%',
  boxSizing: 'border-box',
};

const labelBase: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: c.heading,
};

export function FormInput({ label, error, helper, style, ...props }: FormInputProps) {
  return (
    <label style={labelBase}>
      {label}
      <input style={{ ...inputBase, ...(error ? { borderColor: c.danger } : {}), ...style }} {...props} />
      {error  && <span style={{ fontSize: '0.78rem', color: c.danger }}>{error}</span>}
      {helper && <span style={{ fontSize: '0.78rem', color: c.body }}>{helper}</span>}
    </label>
  );
}

export function FormSelect({ label, children, style, ...props }: FormSelectProps) {
  return (
    <label style={labelBase}>
      {label}
      <select style={{ ...inputBase, ...style }} {...props}>
        {children}
      </select>
    </label>
  );
}

export function FormTextarea({ label, error, style, ...props }: FormTextareaProps) {
  return (
    <label style={labelBase}>
      {label}
      <textarea style={{ ...inputBase, minHeight: 80, resize: 'vertical', ...(error ? { borderColor: c.danger } : {}), ...style }} {...props} />
      {error && <span style={{ fontSize: '0.78rem', color: c.danger }}>{error}</span>}
    </label>
  );
}
