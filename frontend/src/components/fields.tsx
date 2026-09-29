import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import Select, { type Props as SelectProps, type StylesConfig } from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

export interface Option {
  value: string;
  label: string;
  color?: string;
}

const selectStyles: StylesConfig<Option, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? '#820ad1' : '#e4cbfb',
    boxShadow: 'none',
    fontSize: 14,
    backgroundColor: '#fff',
    '&:hover': { borderColor: '#820ad1' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #e4cbfb',
    boxShadow: '0 18px 50px -12px rgba(40, 7, 63, 0.45)',
    zIndex: 30,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected ? '#820ad1' : state.isFocused ? '#faf5ff' : '#fff',
    color: state.isSelected ? '#fff' : '#221229',
    '&:active': { backgroundColor: '#f3e6fd' },
  }),
  placeholder: (base) => ({ ...base, color: '#6f5b7e' }),
  singleValue: (base) => ({ ...base, color: '#221229' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#6f5b7e' }),
  clearIndicator: (base) => ({ ...base, color: '#6f5b7e' }),
};

interface SelectFieldProps extends Omit<SelectProps<Option, false>, 'styles' | 'options' | 'value' | 'onChange'> {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectField({ options, value, onChange, ...rest }: SelectFieldProps) {
  return (
    <Select<Option, false>
      options={options}
      value={options.find((o) => o.value === value) ?? null}
      onChange={(o) => onChange(o?.value ?? '')}
      styles={selectStyles}
      noOptionsMessage={() => 'Nada encontrado'}
      loadingMessage={() => 'Carregando…'}
      formatOptionLabel={(o) => (
        <span className="flex items-center gap-2">
          {o.color && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: o.color }} />}
          {o.label}
        </span>
      )}
      {...rest}
    />
  );
}

export const isoToDate = (iso?: string): Date | null => {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const dateToISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface DateFieldProps {
  value: string;
  onChange: (iso: string) => void;
  id?: string;
  ariaLabel?: string;
  maxDate?: Date;
}

export function DateField({ value, onChange, id, ariaLabel, maxDate }: DateFieldProps) {
  return (
    <DatePicker
      id={id}
      selected={isoToDate(value)}
      onChange={(d: Date | null) => onChange(d ? dateToISO(d) : '')}
      locale="pt-BR"
      dateFormat="dd/MM/yyyy"
      calendarClassName="fp-calendar"
      className="field w-full"
      placeholderText="dd/mm/aaaa"
      aria-label={ariaLabel}
      maxDate={maxDate}
      showPopperArrow={false}
      autoComplete="off"
    />
  );
}
