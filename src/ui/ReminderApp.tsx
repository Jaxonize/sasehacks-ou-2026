import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import './reminders.css';

export type SlotId = 1 | 2 | 3 | 4;
export interface ReminderSlot {
  slotId: SlotId;
  reminder: { id: string; title: string; completed: boolean; urgent?: boolean } | null;
}
export interface ReminderAppProps {
  slots: readonly ReminderSlot[];
  persistenceStatus?: 'saved' | 'saving' | 'unavailable';
  error?: string | null;
  onAdd: (slotId: SlotId, title: string, urgent: boolean) => boolean | void;
  onEdit: (slotId: SlotId, title: string, urgent: boolean) => boolean | void;
  onComplete: (slotId: SlotId) => void;
  onUndo: (slotId: SlotId) => void;
  onActivateControl: (slotId: SlotId) => void;
}
const SLOT_IDS: readonly SlotId[] = [1, 2, 3, 4];
const CAT_SIZE = 128;
const MAX_REMINDER_LENGTH = 60;
const CONFETTI_COLORS = {
  normal: ['#3082b0', '#111820', '#f6f9fc'],
  urgent: ['#e34c5b', '#111820', '#f6f9fc'],
} as const;
const BRAILLE_LETTERS: Record<string, string> = {
  a:'⠁', b:'⠃', c:'⠉', d:'⠙', e:'⠑', f:'⠋', g:'⠛', h:'⠓', i:'⠊', j:'⠚',
  k:'⠅', l:'⠇', m:'⠍', n:'⠝', o:'⠕', p:'⠏', q:'⠟', r:'⠗', s:'⠎', t:'⠞',
  u:'⠥', v:'⠧', w:'⠺', x:'⠭', y:'⠽', z:'⠵',
};
const BRAILLE_DIGITS: Record<string, string> = { '1':'⠁', '2':'⠃', '3':'⠉', '4':'⠙', '5':'⠑', '6':'⠋', '7':'⠛', '8':'⠓', '9':'⠊', '0':'⠚' };
const BRAILLE_PUNCTUATION: Record<string, string> = {
  ',':'⠂', ';':'⠆', ':':'⠒', '.':'⠲', '?':'⠦', '!':'⠖', "'":'⠄', '-':'⠤',
  '(':'⠐⠣', ')':'⠐⠜', '/':'⠌', '&':'⠯',
};
function toBraille(text: string) {
  let inNumber = false;
  return Array.from(text, character => {
    if (BRAILLE_DIGITS[character]) {
      const prefix = inNumber ? '' : '⠼';
      inNumber = true;
      return prefix + BRAILLE_DIGITS[character];
    }
    inNumber = false;
    const lower = character.toLowerCase();
    const letter = BRAILLE_LETTERS[lower];
    if (letter) return (character !== lower ? '⠠' : '') + letter;
    return BRAILLE_PUNCTUATION[character] ?? character;
  }).join('');
}
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

function applyCatRoute(root: HTMLElement, start?: { x: number; y: number }) {
  const maxX = Math.max(0, window.innerWidth - CAT_SIZE - 8);
  const minY = Math.min(Math.round(window.innerHeight * 0.12), Math.max(0, window.innerHeight - CAT_SIZE));
  const maxY = Math.max(minY, window.innerHeight - CAT_SIZE - 8);
  const points = [start, ...Array.from({ length: 4 }, () => ({
    x: Math.round(Math.random() * maxX),
    y: Math.round(minY + Math.random() * (maxY - minY)),
  }))].map(point => ({
    x: Math.round(Math.min(maxX, Math.max(0, point?.x ?? Math.random() * maxX))),
    y: Math.round(Math.min(maxY, Math.max(minY, point?.y ?? minY + Math.random() * (maxY - minY)))),
  }));
  const facings = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return next.x >= point.x ? 0 : 180;
  });
  points.forEach((point, index) => {
    root.style.setProperty(`--sb-cat-x${index}`, `${point.x}px`);
    root.style.setProperty(`--sb-cat-y${index}`, `${point.y}px`);
    root.style.setProperty(`--sb-cat-face${index}`, `${facings[index]}deg`);
  });
  root.style.setProperty('--sb-cat-initial-facing', `${facings[0] === 0 ? 180 : 0}deg`);
  root.style.setProperty('--sb-cat-walk-duration', `${34 + Math.random() * 10}s`);
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

function ReminderCard({ slot, onAdd, onEdit, onComplete, onUndo, onActivateControl, onConfetti, brailleMode }: {
  slot: ReminderSlot;
  onConfetti: (x: number, y: number, bounds: DOMRect, urgent: boolean) => void;
  brailleMode: boolean;
} & Pick<ReminderAppProps, 'onAdd' | 'onEdit' | 'onComplete' | 'onUndo' | 'onActivateControl'>) {
  const { slotId, reminder } = slot;
  const [editing, setEditing] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [draft, setDraft] = useState('');
  const [urgentDraft, setUrgentDraft] = useState(false);
  const [validation, setValidation] = useState('');
  const fieldId = useId();
  const returnFocus = useRef<HTMLButtonElement>(null);
  const completeFocus = useRef<HTMLButtonElement>(null);
  const undoFocus = useRef<HTMLButtonElement>(null);
  const controlPointer = useRef<{ pointerId: number; startX: number; startY: number; moved: boolean } | null>(null);
  const [controlDragOffset, setControlDragOffset] = useState(0);
  const completed = reminder?.completed ?? false;
  const urgent = reminder?.urgent ?? false;
  function beginEdit() {
    setEditorMode(reminder ? 'edit' : 'add');
    setDraft(reminder?.title ?? '');
    setUrgentDraft(urgent);
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
      const card = event.currentTarget.closest('.sb-card')?.getBoundingClientRect() ?? rect;
      onConfetti(event.clientX || rect.left + rect.width / 2, event.clientY || rect.top + rect.height / 2, card, urgent);
      requestAnimationFrame(() => undoFocus.current?.focus());
    }
  }
  function activateControlAt(x: number, y: number, bounds: DOMRect) {
    if (!reminder || editing) return;
    if (completed) {
      onUndo(slotId);
      return;
    }
    playCompletionClick();
    onActivateControl(slotId);
    onConfetti(x, y, bounds, urgent);
  }
  function controlPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!reminder || editing || (event.pointerType === 'mouse' && event.button !== 0)) return;
    controlPointer.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function controlPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointer = controlPointer.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) pointer.moved = true;
    setControlDragOffset(completed ? Math.max(-14, Math.min(0, deltaX)) : Math.max(0, Math.min(14, deltaX)));
  }
  function controlPointerEnd(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointer = controlPointer.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - pointer.startX;
    const moved = pointer.moved;
    controlPointer.current = null;
    setControlDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const deltaY = event.clientY - pointer.startY;
    if (!moved || Math.abs(deltaX) < 12 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (!completed && deltaX >= 12) {
      const bounds = event.currentTarget.closest('.sb-card')?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
      activateControlAt(event.clientX, event.clientY, bounds);
    }
    else if (completed && deltaX <= -12) onUndo(slotId);
  }
  function controlPointerCancel(event: ReactPointerEvent<HTMLButtonElement>) {
    const pointer = controlPointer.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    controlPointer.current = null;
    setControlDragOffset(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) {
      setValidation('Enter a reminder before saving.');
      return;
    }
    if (title.length > MAX_REMINDER_LENGTH) {
      setValidation(`This title has ${title.length} characters. Shorten it to ${MAX_REMINDER_LENGTH} or fewer to save; Cancel keeps the original.`);
      return;
    }
    const accepted = editorMode === 'edit' ? onEdit(slotId, title, urgentDraft) : onAdd(slotId, title, urgentDraft);
    if (accepted === false) return;
    closeEditor();
  }
  return <li className={'sb-card' + (completed ? ' sb-card--done' : '') + (!reminder ? ' sb-card--empty' : '') + (!completed && (editing ? urgentDraft : urgent) ? ' sb-card--urgent' : '')} aria-label={'Reminder ' + slotId + ', ' + controlName(slotId)}>
    <div className="sb-task-row">
      {editing ? <span className="sb-editing-label">{editorMode === 'edit' ? 'Editing this reminder' : 'Adding a reminder'}</span> : reminder ?
        <div className="sb-reminder-row"><span className="sb-slot-number" aria-hidden="true">{slotId.toString().padStart(2, '0')}</span><button type="button" ref={completeFocus} className="sb-complete" onClick={toggleReminderCompletion} aria-label={completed ? 'Undo completion of ' + reminder.title : 'Complete ' + reminder.title}>{completed && <Checkmark />}</button><h2 className={'sb-reminder-title' + (brailleMode ? ' sb-reminder-title--braille' : '')} aria-label={reminder.title} tabIndex={0}>{brailleMode ? toBraille(reminder.title) : reminder.title}</h2></div> :
        <button type="button" className="sb-add" ref={returnFocus} onClick={beginEdit}><span className="sb-add-icon" aria-hidden="true" /> Add<span className="sb-sr-only"> a reminder to {controlName(slotId)}</span></button>}
      <button type="button" role="switch" aria-checked={completed} className={'sb-control' + (completed ? ' sb-control--done' : '') + (controlPointer.current?.moved ? ' sb-control--dragging' : '')} style={{ '--sb-switch-drag-offset': `${controlDragOffset}px` } as CSSProperties} disabled={!reminder || editing} onPointerDown={controlPointerDown} onPointerMove={controlPointerMove} onPointerUp={controlPointerEnd} onPointerCancel={controlPointerCancel} aria-label={!reminder ? 'No reminder assigned to ' + controlName(slotId) : controlName(slotId) + ' completion switch for ' + reminder.title}>
        <span className="sb-switch-track" aria-hidden="true"><span className="sb-switch-thumb">{completed && <Checkmark />}</span></span>
      </button>
    </div>
    {editing && <form className="sb-form" onSubmit={save} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); closeEditor(); } }}>
      <label htmlFor={fieldId}>{editorMode === 'edit' ? 'Edit reminder' : 'New reminder'}</label>
      <input id={fieldId} autoFocus value={draft} maxLength={MAX_REMINDER_LENGTH} onChange={event => setDraft(event.target.value)} aria-invalid={!!validation} aria-describedby={validation ? fieldId + '-error' : undefined} placeholder="What would you like to remember?" />
      {validation && <p className="sb-field-error" id={fieldId + '-error'} role="alert">{validation}</p>}
      <div className="sb-form-actions"><button type="button" className={'sb-urgency-toggle' + (urgentDraft ? ' sb-urgency-toggle--active' : '')} aria-pressed={urgentDraft} onClick={() => setUrgentDraft(value => !value)}><span className="sb-urgency-mark" aria-hidden="true">!</span>Urgent</button><span className="sb-form-actions-spacer" /><button type="button" className="sb-text-button" onClick={closeEditor}>Cancel</button><button type="submit" className="sb-primary">Save reminder</button></div>
    </form>}
    {reminder && !editing && <div className="sb-card-actions"><button type="button" ref={returnFocus} className="sb-text-button sb-icon-action" aria-label={'Edit ' + reminder.title} onClick={beginEdit}><EditIcon /></button>{completed && <button type="button" ref={undoFocus} className="sb-text-button sb-icon-action" aria-label={'Undo completion of ' + reminder.title} onClick={undoReminder}><UndoIcon /></button>}</div>}
  </li>;
}

/** Presentation only: the parent owns reminder state, persistence and hardware commands. */
export function ReminderApp({ slots, persistenceStatus, error, onAdd, onEdit, onComplete, onUndo, onActivateControl }: ReminderAppProps) {
  // Always render in physical control order, even if the caller supplies a different array order.
  const ordered = SLOT_IDS.map(slotId => slots.find(slot => slot.slotId === slotId) ?? { slotId, reminder: null });
  const [announcement, setAnnouncement] = useState('');
  const [brailleMode, setBrailleMode] = useState(false);
  const [confettiBursts, setConfettiBursts] = useState<ConfettiBurst[]>([]);
  const previous = useRef<Record<number, boolean> | null>(null);
  const nextConfettiId = useRef(0);
  const confettiTimers = useRef(new Set<number>());
  function launchConfetti(x: number, y: number, bounds: DOMRect, urgent: boolean) {
    const addBurst = (particles: ConfettiParticle[]) => {
      const id = nextConfettiId.current++;
      setConfettiBursts(current => [...current, { id, particles }]);
      const timer = window.setTimeout(() => {
        setConfettiBursts(current => current.filter(burst => burst.id !== id));
        confettiTimers.current.delete(timer);
      }, 1250);
      confettiTimers.current.add(timer);
    };
    const makeParticle = (key: string, originX: number, originY: number): ConfettiParticle => ({
      key,
      x: originX,
      y: originY,
      size: 5 + Math.random() * 5,
      dx: (Math.random() - 0.5) * 150,
      dy: 55 + Math.random() * 95,
      spin: (Math.random() - 0.5) * 620,
      delay: Math.random() * 110,
      color: (urgent ? CONFETTI_COLORS.urgent : CONFETTI_COLORS.normal)[Math.floor(Math.random() * 3)],
    });
    const clickBurstId = nextConfettiId.current;
    addBurst(Array.from({ length: 26 }, (_, index) => makeParticle(`${clickBurstId}-click-${index}`, x, y)));
    const cardBurstId = nextConfettiId.current;
    addBurst(Array.from({ length: 34 }, (_, index) => makeParticle(
      `${cardBurstId}-card-${index}`,
      bounds.left + Math.random() * bounds.width,
      bounds.top + Math.random() * bounds.height,
    )));
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
    applyCatRoute(root);
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
    const sprite = document.querySelector<HTMLImageElement>('#root > .app-footer > .cat-companion .cat-companion__sprite');
    if (!sprite) return;
    const root = document.documentElement;
    const previous = {
      role: sprite.getAttribute('role'),
      label: sprite.getAttribute('aria-label'),
      tabIndex: sprite.getAttribute('tabindex'),
      touchAction: sprite.style.touchAction,
      pointerEvents: sprite.style.pointerEvents,
      cursor: sprite.style.cursor,
      animation: sprite.style.animation,
      left: sprite.style.left,
      top: sprite.style.top,
    };
    sprite.setAttribute('role', 'img');
    sprite.setAttribute('aria-label', 'Cat companion. Drag to move or use the arrow keys.');
    sprite.tabIndex = 0;
    sprite.style.touchAction = 'none';
    sprite.style.pointerEvents = 'auto';
    sprite.style.cursor = 'grab';
    let drag: { pointerId: number; dx: number; dy: number } | null = null;
    let restartFrame = 0;
    const clampPosition = (x: number, y: number) => {
      const maxX = Math.max(0, window.innerWidth - CAT_SIZE);
      const minY = Math.min(Math.round(window.innerHeight * 0.12), Math.max(0, window.innerHeight - CAT_SIZE));
      return {
        x: Math.round(Math.min(maxX, Math.max(0, x))),
        y: Math.round(Math.min(Math.max(minY, window.innerHeight - CAT_SIZE), Math.max(minY, y))),
      };
    };
    const stopAt = (x: number, y: number) => {
      const point = clampPosition(x, y);
      sprite.style.animation = 'none';
      sprite.style.left = `${point.x}px`;
      sprite.style.top = `${point.y}px`;
      void sprite.offsetWidth;
      applyCatRoute(root, point);
      cancelAnimationFrame(restartFrame);
      restartFrame = requestAnimationFrame(() => {
        sprite.style.left = '';
        sprite.style.top = '';
        sprite.style.animation = '';
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const rect = sprite.getBoundingClientRect();
      drag = { pointerId: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
      sprite.style.animation = 'none';
      sprite.style.left = `${rect.left}px`;
      sprite.style.top = `${rect.top}px`;
      void sprite.offsetWidth;
      sprite.style.cursor = 'grabbing';
      sprite.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const point = clampPosition(event.clientX - drag.dx, event.clientY - drag.dy);
      sprite.style.left = `${point.x}px`;
      sprite.style.top = `${point.y}px`;
      event.preventDefault();
    };
    const endDrag = (event: PointerEvent) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const rect = sprite.getBoundingClientRect();
      drag = null;
      sprite.style.cursor = 'grab';
      if (sprite.hasPointerCapture(event.pointerId)) sprite.releasePointerCapture(event.pointerId);
      stopAt(rect.left, rect.top);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const moveBy = event.shiftKey ? 40 : 18;
      const offsets: Record<string, [number, number]> = {
        ArrowLeft: [-moveBy, 0], ArrowRight: [moveBy, 0], ArrowUp: [0, -moveBy], ArrowDown: [0, moveBy],
      };
      const offset = offsets[event.key];
      if (!offset) return;
      const rect = sprite.getBoundingClientRect();
      stopAt(rect.left + offset[0], rect.top + offset[1]);
      event.preventDefault();
    };
    sprite.addEventListener('pointerdown', onPointerDown);
    sprite.addEventListener('pointermove', onPointerMove);
    sprite.addEventListener('pointerup', endDrag);
    sprite.addEventListener('pointercancel', endDrag);
    sprite.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(restartFrame);
      sprite.removeEventListener('pointerdown', onPointerDown);
      sprite.removeEventListener('pointermove', onPointerMove);
      sprite.removeEventListener('pointerup', endDrag);
      sprite.removeEventListener('pointercancel', endDrag);
      sprite.removeEventListener('keydown', onKeyDown);
      if (previous.role === null) sprite.removeAttribute('role'); else sprite.setAttribute('role', previous.role);
      if (previous.label === null) sprite.removeAttribute('aria-label'); else sprite.setAttribute('aria-label', previous.label);
      if (previous.tabIndex === null) sprite.removeAttribute('tabindex'); else sprite.setAttribute('tabindex', previous.tabIndex);
      sprite.style.touchAction = previous.touchAction;
      sprite.style.pointerEvents = previous.pointerEvents;
      sprite.style.cursor = previous.cursor;
      sprite.style.animation = previous.animation;
      sprite.style.left = previous.left;
      sprite.style.top = previous.top;
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
  return <>
    <div className="sb-app" data-theme="dark">
      <a className="sb-skip" href="#sb-reminders">Skip to reminders</a>
      <main className="sb-phone" aria-label="Reminders">
        {error && <p className="sb-error" role="alert">{error}</p>}
        <section id="sb-reminders" className="sb-reminders" aria-label="Your four reminders" tabIndex={-1}><ol className="sb-list">{ordered.map(slot => <ReminderCard key={slot.slotId} slot={slot} brailleMode={brailleMode} onAdd={onAdd} onEdit={onEdit} onComplete={onComplete} onUndo={onUndo} onActivateControl={onActivateControl} onConfetti={launchConfetti} />)}</ol></section>
        <span className="sb-sr-only" role="status" aria-live="polite">{persistenceStatus === 'unavailable' ? 'Saving unavailable' : persistenceStatus === 'saving' ? 'Saving' : persistenceStatus === 'saved' ? 'Saved on this device' : 'Your reminders stay in the same order'}</span>
        <p className="sb-feedback sb-sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </main>
      <ConfettiLayer bursts={confettiBursts} />
    </div>
    <button type="button" className="sb-braille-toggle" aria-pressed={brailleMode} aria-label={brailleMode ? 'Show reminder text in English' : 'Show reminder text in Braille'} onClick={() => setBrailleMode(value => !value)}>{brailleMode ? 'English' : 'Braille'}</button>
  </>;
}
