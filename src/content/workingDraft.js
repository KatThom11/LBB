import draftText from '../../docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt?raw';

export const DRAFT = {
  title: 'The Living Notebook',
  date: '28 October 2026',
  origin: 'User-supplied integrated working abstract, installation design, and submission plan',
  treatment: 'Original text preserved verbatim; paragraphs, headings, and tabular rows formatted for reading.',
  sha256: 'b2dfcdf3233408e4dc9a7e2361715e6906aefada8efb796f22dfb2ad5722ab0d',
};

// The exact text remains in docs/. No HTML from the supplied text is executed.
const headingPattern = /^(Revised working abstract|[1-9]\. (Artifact identity:|The question|Interaction design|Scholarly framing:|One artifact,|Evidence,|Evaluation:|Extended abstract|Official submission).*|References for development)$/;
export const DRAFT_SECTIONS = [];
let current = { title: 'Identity & editorial status', lines: [] };
for (const line of draftText.split('\n')) {
  if (headingPattern.test(line) && !line.includes('\t') && line.length < 110) {
    DRAFT_SECTIONS.push(current);
    current = { title: line, lines: [] };
  } else current.lines.push(line);
}
DRAFT_SECTIONS.push(current);
export { draftText };
