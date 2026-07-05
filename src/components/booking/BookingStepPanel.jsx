export default function BookingStepPanel({ stepKey, children }) {
  return (
    <div key={stepKey} className="intake-panel fade-in">
      {children}
    </div>
  );
}
