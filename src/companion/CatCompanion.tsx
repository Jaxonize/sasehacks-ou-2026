import { useEffect, useId, useRef, useState } from 'react';
import catImage from '../../assets/companion/midnight-cat-pixel-v1.png';
import { completionTransitions } from './transitions';
import type { CompletionSlot } from './transitions';
import './cat-companion.css';

const encouragement = ['Nice work. One more thing done.', 'A small step worth celebrating.', 'You did it. Take a moment.'];

/** Presentation only. The parent owns tasks; no pet account, points or saved state. */
export function CatCompanion({ slots }: { slots: readonly CompletionSlot[] }) {
  const [hidden, setHidden] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [message, setMessage] = useState('One small step at a time.');
  const panelId = useId();
  const previous = useRef<ReadonlyMap<string, boolean> | null>(null);
  const phrase = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = completionTransitions(slots, previous.current);
    previous.current = update.current;
    if (!hidden && update.newlyCompleted.length) {
      setMessage(encouragement[phrase.current++ % encouragement.length]);
      setCelebrating(true);
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => { setCelebrating(false); timer.current = null; }, 1200);
    }
  }, [slots, hidden]);

  useEffect(() => () => { if (timer.current !== null) clearTimeout(timer.current); }, []);

  function toggleVisible() {
    if (timer.current !== null) { clearTimeout(timer.current); timer.current = null; }
    setCelebrating(false);
    setMessage('One small step at a time.');
    setHidden(value => !value);
  }

  return <section className={'cat-companion' + (celebrating ? ' cat-companion--celebrating' : '')} aria-label="Cat companion">
    <div id={panelId} className="cat-companion__content" hidden={hidden}>
      <img className="cat-companion__sprite" src={catImage} width={64} height={64} alt="" draggable={false} />
      <p className="cat-companion__message" role="status" aria-live="polite" aria-atomic="true">{message}</p>
    </div>
    <button className="cat-companion__toggle" type="button" aria-controls={panelId} aria-expanded={!hidden} onClick={toggleVisible}>
      {hidden ? 'Show cat' : 'Hide cat'}
    </button>
  </section>;
}
