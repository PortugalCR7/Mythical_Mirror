import React from 'react';
import { AppState } from '../services/types';
import {
  Surface,
  Display,
  Eyebrow,
  InscriptionRail,
} from './primitives';
import './LoadingOracle.css';

interface Props {
  state: AppState;
}

/* Three loading sub-states under one descent metaphor. The temple
   eyebrow names the chapter; the body sentence states (quietly) what
   the system is doing. A hairline rule beneath grows in width as
   phases complete — the only progress indicator. */
const PHASES: Record<string, { eyebrow: string; phrase: string; progress: string }> = {
  [AppState.ANALYZING]: {
    eyebrow: 'The Reading',
    phrase: 'Calculating your cosmic fingerprint.',
    progress: '33%',
  },
  [AppState.COMMUNING]: {
    eyebrow: 'The Communion',
    phrase: 'Consulting the three hundred archetypes.',
    progress: '66%',
  },
  [AppState.MANIFESTING]: {
    eyebrow: 'The Transfiguration',
    phrase: 'Drawing your face into the archetype.',
    progress: '100%',
  },
};

const LoadingOracle: React.FC<Props> = ({ state }) => {
  const phase = PHASES[state] ?? PHASES[AppState.ANALYZING];

  return (
    <Surface>
      <div className="load-frame">
        <aside className="load-rail">
          <InscriptionRail>The Mythic Mirror · The Descent · ◇</InscriptionRail>
        </aside>

        <main className="load-column">
          <div className="load-eyebrow">
            <Eyebrow tone="meta">{phase.eyebrow}</Eyebrow>
          </div>
          <Display level="display" as="h1">The Descent</Display>
          {/* key forces React to remount on phase change so the inscribe animation re-fires */}
          <p key={state} className="load-phrase load-phrase-fade">{phase.phrase}</p>
          <div
            className="load-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={parseInt(phase.progress, 10)}
            aria-label={phase.eyebrow}
          >
            <div className="load-progress-fill" style={{ width: phase.progress }} />
          </div>
        </main>
      </div>
    </Surface>
  );
};

export default LoadingOracle;
