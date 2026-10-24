import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import './reminders.css';

export type SlotId = 1 | 2 | 3 | 4;
export interface ReminderSlot {
  slotId: SlotId;
  reminder: { id: string; title: string; completed: boolean } | null;
}
export interface ReminderAppProps {
  slots: readonly ReminderSlot[];
  persistenceStatus?: 'saved' | 'saving' | 'unavailable';
  error?: string | null;
  onAdd: (slotId: SlotId, title: string) => boolean | void;
  onEdit: (slotId: SlotId, title: string) => boolean | void;
  onComplete: (slotId: SlotId) => void;
  onUndo: (slotId: SlotId) => void;
  onActivateControl: (slotId: SlotId) => void;
}
const SLOT_IDS: readonly SlotId[] = [1, 2, 3, 4];
const CAT_SIZE = 170;
const CONFETTI_COLORS = ['#3082b0', '#111820', '#f6f9fc'] as const;
// Keep the numeric mapping aligned with the enclosure's physical controls.
const controlName = (id: SlotId) => id < 3 ? 'Dial ' + id : 'Switch ' + (id - 2);

interface ConfettiParticle {
  key: string;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  spin: number;
  delay: number;
  color: string;
}
interface ConfettiBurst { id: number; particles: ConfettiParticle[]; }
type ConfettiParticleStyle = CSSProperties & {
  '--sb-confetti-size': string;
  '--sb-confetti-x': string;
  '--sb-confetti-y': string;
  '--sb-confetti-spin': string;
  '--sb-confetti-delay': string;
  '--sb-confetti-color': string;
};

function ConfettiLayer({ bursts }: { bursts: readonly ConfettiBurst[] }) {
  return <div className="sb-confetti-layer" aria-hidden="true">
    {bursts.flatMap(burst => burst.particles.map(particle => <span key={particle.key} className="sb-confetti-piece" style={{
      left: particle.x,
      top: particle.y,
      '--sb-confetti-size': `${particle.size}px`,
      '--sb-confetti-x': `${particle.dx}px`,
      '--sb-confetti-y': `${particle.dy}px`,
      '--sb-confetti-spin': `${particle.spin}deg`,
      '--sb-confetti-delay': `${particle.delay}ms`,
      '--sb-confetti-color': particle.color,
    } as ConfettiParticleStyle} />))}
  </div>;
}

function Checkmark() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EditIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function UndoIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 8 5 12l4 4M5 12h8a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

let completionAudioContext: AudioContext | null = null;
function playCompletionClick() {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const context = completionAudioContext ?? new window.AudioContext();
    completionAudioContext = context;
    const play = () => {
      const start = context.currentTime;
      const tones = [
        { frequency: 1960, end: 1380, volume: 0.052, duration: 0.032, type: 'triangle' as OscillatorType, delay: 0 },
        { frequency: 1240, end: 820, volume: 0.015, duration: 0.042, type: 'sine' as OscillatorType, delay: 0.006 },
      ];
      const sampleCount = Math.max(1, Math.floor(context.sampleRate * 0.009));
      const clickBuffer = context.createBuffer(1, sampleCount, context.sampleRate);
      const clickSamples = clickBuffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) clickSamples[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
      const click = context.createBufferSource();
      const clickFilter = context.createBiquadFilter();
      const clickGain = context.createGain();
      click.buffer = clickBuffer;
      clickFilter.type = 'highpass';
      clickFilter.frequency.setValueAtTime(2400, start);
      clickGain.gain.setValueAtTime(0.0001, start);
      clickGain.gain.linearRampToValueAtTime(0.018, start + 0.001);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.009);
      click.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(context.destination);
      click.start(start);
      click.stop(start + 0.01);
      for (const tone of tones) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const at = start + tone.delay;
        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(tone.frequency, at);
        oscillator.frequency.exponentialRampToValueAtTime(tone.end, at + tone.duration);
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.linearRampToValueAtTime(tone.volume, at + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + tone.duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(at);
        oscillator.stop(at + tone.duration + 0.005);
      }
    };
    if (context.state === 'suspended') void context.resume().then(play).catch(() => {});
    else play();
  } catch {
    // Completion still works when audio is unavailable or blocked by the browser.
  }
}

function ReminderCard({ slot, onAdd, onEdit, onComplete, onUndo, onActivateControl, onConfetti }: {
  slot: ReminderSlot;
  onConfetti: (x: number, y: number) => void;
} & Pick<ReminderAppProps, 'onAdd' | 'onEdit' | 'onComplete' | 'onUndo' | 'onActivateControl'>) {
  const { slotId, reminder } = slot;
  const [editing, setEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [draft, setDraft] = useState('');
  const [validation, setValidation] = useState('');
  const fieldId = useId();
  const returnFocus = useRef<HTMLButtonElement>(null);
  const completeFocus = useRef<HTMLButtonElement>(null);
  const undoFocus = useRef<HTMLButtonElement>(null);
  const completed = reminder?.completed ?? false;
  function beginEdit() {
    setEditorMode(reminder ? 'edit' : 'add');
    setDraft(reminder?.title ?? '');
    setValidation('');
    setEditing(true);
  }
  function closeEditor() {
    setEditing(false);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }
  function undoReminder() {
    onUndo(slotId);
    requestAnimationFrame(() => completeFocus.current?.focus());
  }
  function toggleReminderCompletion(event: ReactMouseEvent<HTMLButtonElement>) {
    if (completed) {
      onUndo(slotId);
      requestAnimationFrame(() => completeFocus.current?.focus());
    } else {
      playCompletionClick();
      onComplete(slotId);
      const rect = event.currentTarget.getBoundingClientRect();
      onConfetti(event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + rect.height / 2);
      requestAnimationFrame(() => undoFocus.current?.focus());
    }
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) {
      setValidation('Enter a reminder before saving.');
      return;
    }
    const accepted = editorMode === 'edit' ? onEdit(slotId, title) : onAdd(slotId, title);
    if (accepted === false) return;
    closeEditor();
  }
  return <li className={'sb-card' + (completed ? ' sb-card--done' : '') + (!reminder ? ' sb-card--empty' : '')} aria-label={'Reminder ' + slotId + ', ' + controlName(slotId)}>
    <div className="sb-task-row">
      {editing ? <span className="sb-editing-label">{editorMode === 'edit' ? 'Editing this reminder' : 'Adding a reminder'}</span> : reminder ?
        <div className="sb-reminder-row"><span className="sb-slot-number" aria-hidden="true">{slotId.toString().padStart(2, '0')}</span><button type="button" ref={completeFocus} className="sb-complete" onClick={toggleReminderCompletion} aria-label={completed ? 'Undo completion of ' + reminder.title : 'Complete ' + reminder.title}>{completed && <Checkmark />}</button><h2 className="sb-reminder-title" tabIndex={0}>{reminder.title}</h2></div> :
        <button type="button" className="sb-add" ref={returnFocus} onClick={beginEdit}><span className="sb-add-icon" aria-hidden="true" /> Add<span className="sb-sr-only"> a reminder to {controlName(slotId)}</span></button>}
      <button type="button" className={'sb-control' + (completed ? ' sb-control--done' : '')} disabled={!reminder || editing} onClick={event => { if (completed) onUndo(slotId); else { playCompletionClick(); onActivateControl(slotId); const rect = event.currentTarget.getBoundingClientRect(); onConfetti(event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + rect.height / 2); } }} aria-label={!reminder ? 'No reminder assigned to ' + controlName(slotId) : completed ? 'Simulate ' + controlName(slotId) + ': undo completion of ' + reminder.title : 'Simulate ' + controlName(slotId) + ': complete ' + reminder.title}>
        <span className="sb-control-check" aria-hidden="true">{completed && <Checkmark />}</span>
      </button>
    </div>
    {editing && <form className="sb-form" onSubmit={save} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); closeEditor(); } }}>
      <label htmlFor={fieldId}>{editorMode === 'edit' ? 'Edit reminder' : 'New reminder'}</label>
      <input id={fieldId} autoFocus value={draft} maxLength={200} onChange={event => setDraft(event.target.value)} aria-invalid={!!validation} aria-describedby={validation ? fieldId + '-error' : undefined} placeholder="What would you like to remember?" />
      {validation && <p className="sb-field-error" id={fieldId + '-error'} role="alert">{validation}</p>}
      <div className="sb-form-actions"><button type="button" className="sb-text-button" onClick={closeEditor}>Cancel</button><button type="submit" className="sb-primary">Save reminder</button></div>
    </form>}
    {reminder && !editing && <div className="sb-card-actions"><button type="button" ref={returnFocus} className="sb-text-button sb-icon-action" aria-label={'Edit ' + reminder.title} onClick={beginEdit}><EditIcon /></button>{completed && <button type="button" ref={undoFocus} className="sb-text-button sb-icon-action" aria-label={'Undo completion of ' + reminder.title} onClick={undoReminder}><UndoIcon /></button>}</div>}
  </li>;
}

/** Presentation only: the parent owns reminder state, persistence and hardware commands. */
export function ReminderApp({ slots, persistenceStatus, error, onAdd, onEdit, onComplete, onUndo, onActivateControl }: ReminderAppProps) {
  // Always render in physical control order, even if the caller supplies a different array order.
  const ordered = SLOT_IDS.map(slotId => slots.find(slot => slot.slotId === slotId) ?? { slotId, reminder: null });
  const [announcement, setAnnouncement] = useState('');
  const [confettiBursts, setConfettiBursts] = useState<ConfettiBurst[]>([]);
  const previous = useRef<Record<number, boolean> | null>(null);
  const nextConfettiId = useRef(0);
  const confettiTimers = useRef(new Set<number>());
  function launchConfetti(x: number, y: number) {
    const id = nextConfettiId.current++;
    const particles = Array.from({ length: 26 }, (_, index) => ({
      key: `${id}-${index}`,
      x,
      y,
      size: 5 + Math.random() * 5,
      dx: (Math.random() - 0.5) * 150,
      dy: 55 + Math.random() * 95,
      spin: (Math.random() - 0.5) * 620,
      delay: Math.random() * 110,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }));
    setConfettiBursts(current => [...current, { id, particles }]);
    const timer = window.setTimeout(() => {
      setConfettiBursts(current => current.filter(burst => burst.id !== id));
      confettiTimers.current.delete(timer);
    }, 1250);
    confettiTimers.current.add(timer);
  }
  useEffect(() => () => {
    for (const timer of confettiTimers.current) window.clearTimeout(timer);
  }, []);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootBackground = root.style.backgroundColor;
    const rootScheme = root.style.colorScheme;
    const bodyBackground = body.style.backgroundColor;
    const bodyMargin = body.style.margin;
    const viewport = document.head.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const previousViewport = viewport?.content;
    const viewportMeta = viewport ?? document.createElement('meta');
    if (!viewport) {
      viewportMeta.name = 'viewport';
      document.head.append(viewportMeta);
    }
    const viewportParts = new Map((viewportMeta.content || 'width=device-width, initial-scale=1').split(',').map(part => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')] as const;
    }));
    viewportParts.set('viewport-fit', 'cover');
    viewportMeta.content = Array.from(viewportParts, ([key, value]) => value ? `${key}=${value}` : key).join(', ');
    const existingThemeColor = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousThemeColor = existingThemeColor?.content;
    const themeColor = existingThemeColor ?? document.createElement('meta');
    if (!existingThemeColor) {
      themeColor.name = 'theme-color';
      document.head.append(themeColor);
    }
    themeColor.content = '#081522';
    root.style.backgroundColor = '#081522';
    root.style.colorScheme = 'dark';
    body.style.backgroundColor = '#081522';
    body.style.margin = '0';
    const catMotionKeys = [
      '--sb-cat-walk-duration', '--sb-cat-initial-facing',
      ...Array.from({ length: 5 }, (_, index) => [`--sb-cat-x${index}`, `--sb-cat-y${index}`, `--sb-cat-face${index}`]).flat(),
    ];
    const previousCatMotion = new Map<string, string>(catMotionKeys.map(key => [key, root.style.getPropertyValue(key)] as const));
    const catMaxX = Math.max(0, window.innerWidth - CAT_SIZE - 8);
    const catMinY = Math.min(Math.round(window.innerHeight * 0.12), Math.max(0, window.innerHeight - CAT_SIZE));
    const catMaxY = Math.max(catMinY, window.innerHeight - CAT_SIZE - 8);
    const catWaypoints = Array.from({ length: 5 }, () => ({
      x: Math.round(Math.random() * catMaxX),
      y: Math.round(catMinY + Math.random() * (catMaxY - catMinY)),
    }));
    const catFacings = catWaypoints.map((point, index) => {
      const next = catWaypoints[(index + 1) % catWaypoints.length];
      return next.x === point.x ? (Math.random() < 0.5 ? -1 : 1) : next.x > point.x ? 1 : -1;
    });
    for (let index = 0; index < catWaypoints.length; index++) {
      root.style.setProperty(`--sb-cat-x${index}`, `${catWaypoints[index].x}px`);
      root.style.setProperty(`--sb-cat-y${index}`, `${catWaypoints[index].y}px`);
      root.style.setProperty(`--sb-cat-face${index}`, String(catFacings[index]));
    }
    root.style.setProperty('--sb-cat-initial-facing', String(-catFacings[0]));
    const walkDuration = 58 + Math.random() * 18;
    root.style.setProperty('--sb-cat-walk-duration', `${walkDuration}s`);
    return () => {
      for (const [key, value] of previousCatMotion) {
        if (value) root.style.setProperty(key, value);
        else root.style.removeProperty(key);
      }
      root.style.backgroundColor = rootBackground;
      root.style.colorScheme = rootScheme;
      body.style.backgroundColor = bodyBackground;
      body.style.margin = bodyMargin;
      if (viewport) viewportMeta.content = previousViewport ?? '';
      else viewportMeta.remove();
      if (existingThemeColor) themeColor.content = previousThemeColor ?? '';
      else themeColor.remove();
    };
  }, []);
  useEffect(() => {
    const next = Object.fromEntries(slots.map(slot => [slot.slotId, !!slot.reminder?.completed]));
    if (previous.current) {
      const changed = slots.find(slot => slot.reminder && next[slot.slotId] !== previous.current?.[slot.slotId]);
      if (changed?.reminder) setAnnouncement(changed.reminder.title + (changed.reminder.completed ? ' completed. Nicely done.' : ' returned to your to-do list.'));
    }
    previous.current = next;
  }, [slots]);
  return <div className="sb-app" data-theme="dark">
    <a className="sb-skip" href="#sb-reminders">Skip to reminders</a>
    <main className="sb-phone" aria-label="Reminders">
      {error && <p className="sb-error" role="alert">{error}</p>}
      <section id="sb-reminders" className="sb-reminders" aria-label="Your four reminders" tabIndex={-1}><ol className="sb-list">{ordered.map(slot => <ReminderCard key={slot.slotId} slot={slot} onAdd={onAdd} onEdit={onEdit} onComplete={onComplete} onUndo={onUndo} onActivateControl={onActivateControl} onConfetti={launchConfetti} />)}</ol></section>
      <span className="sb-sr-only" role="status" aria-live="polite">{persistenceStatus === 'unavailable' ? 'Saving unavailable' : persistenceStatus === 'saving' ? 'Saving' : persistenceStatus === 'saved' ? 'Saved on this device' : 'Your reminders stay in the same order'}</span>
      <p className="sb-feedback sb-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </main>
    <ConfettiLayer bursts={confettiBursts} />
  </div>;
}
