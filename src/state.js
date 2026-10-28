import { INITIAL, SCENES, ATLAS, SOURCES, BODY_CHOICES, READING_CHOICES, ASSENT_CHOICES, JUDGMENTS } from './data';

// Keep v1 records intact: the earlier fixture and assent proposition were different.
export const STORAGE_KEY = 'lbb-notebook-v2';
const text = value => typeof value === 'string' ? value.slice(0, 2000) : '';
const choice = (value, choices, fallback = '') => choices.includes(value) ? value : fallback;
export function readSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || raw.version !== 2 || !raw.state) return INITIAL;
    const s = raw.state;
    return {
      ...INITIAL,
      scene: Number.isInteger(s.scene) && s.scene >= 0 && s.scene < SCENES.length ? s.scene : 0,
      path: s.path === 'extended' ? 'extended' : 'core',
      tab: ATLAS.some(t => t.id === s.tab) ? s.tab : 'said',
      bodyResponse: choice(s.bodyResponse, BODY_CHOICES),
      bodyNote: text(s.bodyNote),
      readingChoices: Array.isArray(s.readingChoices) ? s.readingChoices.filter(c => READING_CHOICES.includes(c)) : [],
      assentResponse: choice(s.assentResponse, ASSENT_CHOICES),
      disposition: choice(s.disposition, ['Unresolved', 'Held as provisional', 'Stopped', 'Prepared for human review', 'Source check recorded'], 'Unresolved'),
      holdReason: text(s.holdReason), judgment: choice(s.judgment, JUDGMENTS), judgmentReason: text(s.judgmentReason), revisedClaim: text(s.revisedClaim),
      outsideChange: choice(s.outsideChange, ['Nothing yet', 'My understanding changed', 'I report an outside action'], 'Nothing yet'),
      generated: Array.isArray(s.generated) ? s.generated.filter(g => typeof g === 'string').slice(0, 3) : [],
      stopped: s.stopped === true,
      checks: Array.isArray(s.checks) ? s.checks.filter(c => c && SOURCES.some(x => x.id === c.id) && ['Context only', 'No support found', 'Unresolved'].includes(c.outcome)).map(c => ({ id: c.id, outcome: c.outcome, note: text(c.note) })) : [],
      reviewQuestion: text(s.reviewQuestion) || INITIAL.reviewQuestion,
      routed: s.routed === true,
      mode: s.mode === 'replay' ? 'replay' : 'interactive',
    };
  } catch { return INITIAL; }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'set': return { ...state, ...action.value };
    case 'reading': return { ...state, readingChoices: state.readingChoices.includes(action.label) ? state.readingChoices.filter(x => x !== action.label) : [...state.readingChoices, action.label] };
    case 'generate': return state.stopped ? state : { ...state, generated: [...state.generated, action.text].slice(-3) };
    case 'check': return { ...state, checks: [...state.checks.filter(c => c.id !== action.check.id), action.check], disposition: 'Source check recorded' };
    case 'stop': return { ...state, stopped: true, generated: [], disposition: 'Stopped' };
    case 'reset': return { ...INITIAL };
    case 'replay': return { ...INITIAL, mode: 'replay', bodyResponse: 'I need context', readingChoices: ['Useful possibility', 'Source needed'], checks: [], disposition: 'Held as provisional', holdReason: 'The description opens a useful question, but the speaker’s context and the primary sources have not been checked.', judgment: 'Withhold judgment', judgmentReason: 'A useful possibility is not yet an established method.' };
    default: return state;
  }
}
