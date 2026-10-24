import { useEffect, useRef, useState } from 'react';
import type { GoogleTaskSource, ReminderSlot, SlotId } from '../../core/types.ts';
import { sameGoogleTask } from '../../core/provenance.ts';
import { validateTitle } from '../../core/state.ts';
import { connectionUnavailable, hasTasksScope, loadGoogleIdentity } from './identity.ts';
import type { GoogleIdentity } from './identity.ts';
import { fetchTodaysGoogleTasks, GoogleTasksError, localDateKey, TASKS_READONLY } from './tasks.ts';
import type { GoogleTaskCandidate } from './tasks.ts';
import './google-tasks.css';

interface Props {
  slots: ReminderSlot[];
  persistenceStatus?: string;
  onImport: (slotId: SlotId, title: string, source: GoogleTaskSource) => boolean;
}
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

export function GoogleTasksImport({ slots, persistenceStatus, onImport }: Props) {
  const [open, setOpen] = useState(false);
  const [sdk, setSdk] = useState<GoogleIdentity>();
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [today, setToday] = useState(localDateKey);
  const [loadedDay, setLoadedDay] = useState('');
  const [tasks, setTasks] = useState<GoogleTaskCandidate[]>([]);
  const [taskIndex, setTaskIndex] = useState('');
  const [slotId, setSlotId] = useState('');
  const [title, setTitle] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const token = useRef<{ value: string; expiresAt: number } | null>(null);
  const operation = useRef(0);
  const request = useRef<AbortController | null>(null);
  const expiry = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const unavailable = connectionUnavailable(clientId, window.location.origin);
  const selected = tasks[Number(taskIndex)];
  const chosen = taskIndex !== '' ? selected : undefined;
  const alreadyImported = (task: GoogleTaskCandidate) => slots.some(slot => sameGoogleTask(slot.reminder?.source, task.source));
  const empty = slots.filter(slot => !slot.reminder);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const timer = setInterval(() => setToday(localDateKey()), 30000);
    let active = true;
    if (!unavailable) loadGoogleIdentity().then(api => { if (active) setSdk(api); }).catch(() => { if (active) setError('Google sign-in could not load. Check your connection and reopen this panel.'); });
    return () => { active = false; clearInterval(timer); };
  }, [open, unavailable]);
  useEffect(() => () => { operation.current++; request.current?.abort(); clearTimeout(expiry.current); token.current = null; }, []);

  function close() {
    operation.current++; request.current?.abort(); setBusy(false); setMessage(''); setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }
  function clearConnection() {
    operation.current++; request.current?.abort(); clearTimeout(expiry.current);
    token.current = null; setConnected(false); setBusy(false); setTasks([]); setTaskIndex(''); setSlotId(''); setError(''); setMessage('Connection cleared from this tab.'); setLoadedDay('');
  }
  async function loadTasks() {
    const access = token.current;
    if (!access || access.expiresAt <= Date.now()) { clearConnection(); setError('Google access expired. Connect again.'); return; }
    const id = ++operation.current;
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 45000);
    setBusy(true); setError(''); setMessage('Loading today’s Google Tasks…'); setTaskIndex(''); setTasks([]);
    const day = localDateKey(); setToday(day);
    try {
      const next = await fetchTodaysGoogleTasks(access.value, day, controller.signal);
      if (id !== operation.current) return;
      setTasks(next); setLoadedDay(day); setMessage(next.length ? `${next.length} incomplete task${next.length === 1 ? '' : 's'} due today.` : 'No incomplete Google Tasks are due today.');
    } catch (cause) {
      if (id !== operation.current) return;
      setMessage('');
      setError(cause instanceof GoogleTasksError ? cause.message : controller.signal.aborted ? 'Loading timed out. Try again.' : 'Google Tasks could not be loaded. Check your connection and try again.');
      if (cause instanceof GoogleTasksError && cause.status === 401) { token.current = null; setConnected(false); clearTimeout(expiry.current); }
    } finally { clearTimeout(timeout); if (id === operation.current) setBusy(false); }
  }
  function connect() {
    if (!sdk || !clientId || unavailable) return;
    const id = ++operation.current; setBusy(true); setError(''); setMessage('Complete the Google sign-in window.');
    try {
      const client = sdk.initTokenClient({ client_id: clientId, scope: TASKS_READONLY, include_granted_scopes: false,
        callback: response => {
          if (id !== operation.current) return;
          const lifetime = Number(response.expires_in);
          if (response.error || !response.access_token || !hasTasksScope(response.scope) || !Number.isFinite(lifetime) || lifetime <= 0) {
            token.current = null; setConnected(false); setBusy(false); setMessage(''); setError('Google Tasks read access was not granted. You can connect again.'); return;
          }
          token.current = { value: response.access_token, expiresAt: Date.now() + lifetime * 1000 }; setConnected(true);
          clearTimeout(expiry.current);
          expiry.current = setTimeout(() => { operation.current++; request.current?.abort(); token.current = null; setConnected(false); setBusy(false); setTasks([]); setMessage('Google access expired. Connect again to refresh tasks.'); }, Math.min(lifetime * 1000, 2147483647));
          void loadTasks();
        },
        error_callback: failure => { if (id === operation.current) { setBusy(false); setMessage(''); setError(failure.type === 'popup_closed' ? 'Google sign-in was closed. Your reminders are unchanged.' : 'Google sign-in could not open. Allow its popup and try again.'); } },
      });
      // Keep this synchronous inside the button gesture so browsers can open the popup.
      client.requestAccessToken({ prompt: 'select_account' });
    } catch { setBusy(false); setMessage(''); setError('Google sign-in could not start. Reopen this panel and try again.'); }
  }
  function importTask() {
    if (!chosen || !slotId) return;
    if (chosen.source.dueDate !== localDateKey()) { setError('The date changed. Refresh today’s tasks before importing.'); return; }
    const validation = validateTitle(title);
    if (validation) { setError(validation); return; }
    if (!onImport(Number(slotId) as SlotId, title, chosen.source)) { setError('Import was rejected: the slot may have filled or this task is already assigned. Choose an empty slot and a different task.'); return; }
    const label = slots.find(slot => slot.slotId === Number(slotId))?.controlLabel;
    setMessage(`Added to ${label}. Google Tasks was not changed.`); setError(''); setTaskIndex(''); setSlotId(''); setTitle('');
  }

  return <section className="gt-entry" aria-label="Google Tasks import">
    <button ref={launcher} type="button" className="gt-launcher" aria-haspopup="dialog" onClick={() => { setError(''); setOpen(true); }}>Import Google Tasks</button>
    <dialog ref={dialog} className="gt-dialog" aria-labelledby="gt-heading" onClose={close}>
      <div className="gt-header"><h2 id="gt-heading">Today’s Google Tasks</h2><button autoFocus type="button" aria-label="Close Google Tasks" onClick={() => dialog.current?.close()}>×</button></div>
      <p>Choose an incomplete task due today and an empty reminder slot. Completing it here never changes Google.</p>
      {unavailable ? <p role="status" className="gt-notice">{unavailable}</p> : <>
        <div className="gt-actions">
          {!connected && <button type="button" onClick={connect} disabled={!sdk || busy}>{sdk ? 'Connect Google Tasks' : 'Preparing Google sign-in…'}</button>}
          {connected && <><button type="button" disabled={busy} onClick={() => { void loadTasks(); }}>Refresh today’s tasks</button><button type="button" onClick={clearConnection}>Clear connection</button></>}
        </div>
        {loadedDay && loadedDay !== today && <p role="alert">The date changed. Refresh today’s tasks.</p>}
        {tasks.length > 0 && <div className="gt-selection">
          <label htmlFor="gt-task">Task due {loadedDay}</label>
          <select id="gt-task" value={taskIndex} disabled={busy} onChange={event => { setTaskIndex(event.target.value); setTitle(event.target.value === '' ? '' : tasks[Number(event.target.value)].title); setError(''); }}>
            <option value="">Choose a task</option>{tasks.map((task, index) => <option key={JSON.stringify([task.source.taskListId, task.source.taskId])} value={index} disabled={alreadyImported(task)}>{task.title} — {task.listTitle}{alreadyImported(task) ? ' (already assigned)' : ''}</option>)}
          </select>
          {chosen && <><label htmlFor="gt-title">Reminder title</label><input id="gt-title" value={title} maxLength={200} onChange={event => setTitle(event.target.value)} />{title.length > 200 && <p>Shorten this Google title to 200 characters before importing.</p>}</>}
          <label htmlFor="gt-slot">Empty slot</label><select id="gt-slot" value={slotId} onChange={event => setSlotId(event.target.value)}><option value="">Choose an empty slot</option>{slots.map(slot => <option key={slot.slotId} value={slot.slotId} disabled={!!slot.reminder}>{slot.controlLabel}{slot.reminder ? ' — occupied' : ''}</option>)}</select>
          {!empty.length && <p>All four slots are occupied. Import never replaces your reminders.</p>}
          <button type="button" onClick={importTask} disabled={busy || !chosen || !slotId || alreadyImported(chosen) || !!validateTitle(title) || loadedDay !== today || !empty.some(slot => slot.slotId === Number(slotId))}>Import into selected slot</button>
        </div>}
      </>}
      {error && <p role="alert" className="gt-error">{error}</p>}
      <p role="status" aria-live="polite">{message}</p>
      {persistenceStatus === 'unavailable' && <p className="gt-error">Saving is unavailable. Imported reminders stay in this tab and may be lost on reload.</p>}
      <p className="gt-detail">Read-only access stays in this tab’s memory. Reloading or clearing the connection removes it.</p>
    </dialog>
  </section>;
}
