import { useReminders } from './core/useReminders';
import { ReminderApp } from './ui/ReminderApp';
import { GoogleTasksImport } from './integrations/google/GoogleTasksImport';
import { CatCompanion } from './companion/CatCompanion';
import './app.css';

export default function App() {
  const { onImportGoogle, ...reminders } = useReminders();
  return <>
    <ReminderApp {...reminders} />
    <footer className="app-footer" aria-label="Import and companion">
      <GoogleTasksImport slots={reminders.slots} persistenceStatus={reminders.persistenceStatus} onImport={onImportGoogle} />
      <CatCompanion slots={reminders.slots} />
    </footer>
  </>;
}
