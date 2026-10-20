// Небольшой круговой индикатор загрузки
interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 18, label = 'Загрузка' }: SpinnerProps) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    />
  );
}
