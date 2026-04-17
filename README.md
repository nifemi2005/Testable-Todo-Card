# TaskFlow — Todo Card App

A clean, accessible, and testable todo/task card component built with vanilla HTML, CSS, and JavaScript.

---

## Stage 0 — What Was Built

The initial version established the core todo card structure:

- **Task form** — inputs for task title, priority (low / medium / high), due date, status (pending / in progress / done), and tags (added by pressing Enter)
- **Task cards** — dynamically rendered `<li>` elements with title, priority badge, static status badge, formatted due date, tag chips, and Edit / Delete buttons
- **Completion toggle** — a checkbox that strikes through the title and changes the status badge to "done" when checked
- **Edit behaviour** — clicking Edit pulled the task's values back into the main form at the top and removed the card from the list
- **Delete behaviour** — fades the card out and removes it from the DOM and the tasks array
- **Time hint** — a basic relative time label (e.g. "Due today", "Due tomorrow", "Overdue by 2 days") refreshed every 30 seconds
- **Task count** — a live counter in the header showing the number of active tasks
- **Responsive layout** — mobile-first CSS with breakpoints at 480px and 768px
- **Semantic HTML** — `<article>` root, `<time>` for dates, `<ul>` for task list and tags, `<button>` for actions

---

## What Changed from Stage 0

### Inline Edit Form
- Clicking **Edit** no longer pulls task data back into the main form. Instead, an inline edit form replaces the card content in place, with dedicated inputs for title, description, priority, and due date. On save or cancel, the card is rebuilt without losing scroll position.

### Interactive Status Dropdown
- The static status badge was replaced with a `<select>` element (`data-testid="test-todo-status-control"`). Allowed values: `pending`, `in progress`, `done`.
- The dropdown and the completion checkbox are kept in sync bidirectionally — checking the checkbox sets status to "done", and selecting "done" from the dropdown checks the checkbox.

### Priority Indicator Strip
- A colored left-border strip (`data-testid="test-todo-priority-indicator"`) is rendered on each card. Red for high, amber for medium, green for low. Updates automatically when priority is changed via the edit form.

### Description Expand/Collapse
- Descriptions over 100 characters are collapsed by default, showing only the first 100 characters with a **Show more** toggle button (`data-testid="test-todo-expand-toggle"`). The full text lives in a collapsible section (`data-testid="test-todo-collapsible-section"`).

### Enhanced Time Hint Logic
- Time remaining is now granular: `"Due in 45 minutes"`, `"Due in 3 hours"`, `"Due in 2 days"`, `"Due tomorrow"`, `"Overdue by 1 hour"`, etc.
- If a task is marked **done**, the time hint freezes and shows `"Completed"` instead of continuing to update.
- A small red dot overdue indicator (`data-testid="test-todo-overdue-indicator"`) appears next to the due date when the task is past its deadline.
- Time hints refresh every 30 seconds via `setInterval`.

---

## Design Decisions

- **No framework or build tool** — plain HTML, CSS, and JavaScript only. No Tailwind, no bundler.
- **CSS custom properties** drive the entire color system (`--red`, `--amber`, `--green`, `--blue`, etc.), making the palette easy to adjust from one place.
- **`rebuildCard(card, task)`** is used after inline edits instead of re-rendering the whole list. This avoids losing scroll position and keeps DOM mutations minimal.
- **Delegated event listeners** on `#task-list` handle all card interactions (delete, checkbox, status change, expand toggle, edit). No per-card listeners are attached at render time, except for the inline edit form's submit and cancel which are scoped to the active edit.
- **`[hidden] { display: none !important }`** is declared globally at the top of the stylesheet to prevent CSS `display` properties (like `inline-flex`) from overriding the HTML `hidden` attribute — a known browser specificity issue.
- **`Date.now()`** is used as the task ID to guarantee uniqueness without an external library.

---

## Known Limitations

- **No persistence** — tasks are held in a JavaScript array and are lost on page refresh. There is no `localStorage` or backend integration.
- **Tags cannot be edited** — the inline edit form does not include a tag field. Tags set at creation time are permanent unless the task is deleted and re-created.
- **Single checkbox label** — in `renderTask`, the checkbox label is empty and relies on `aria-label` on the input. The `rebuildCard` version wraps the checkbox in a `<label>` with a `for` attribute, so the two renders are slightly inconsistent.
- **Status not editable in the edit form** — the inline edit form exposes title, description, priority, and due date. Status is only changeable via the dropdown on the card face.
- **No input validation beyond empty title** — the form submits with any priority, status, or date value without further checks (e.g., no guard against past due dates at creation time).
- **Tags rendered as spans inside a single `<li>`** — tag chips are `<span>` elements wrapped in one `<li>` inside the `<ul>`, rather than each tag being its own `<li>`. This is technically incorrect list semantics.

---

## Accessibility Notes

- **Semantic HTML** — the app shell is an `<article>`, task titles use `<span>` within a list item (`<li>`), due dates use `<time>`, and action buttons use `<button>`.
- **Checkbox** — has `aria-label="Mark task complete"` and `aria-checked` kept in sync with the checked state programmatically.
- **Status dropdown** — has `aria-label="Task status"` for screen readers since it has no visible label on the card.
- **Time hint** — wrapped in `aria-live="polite"` so screen readers announce updates without interrupting the user.
- **Expand toggle** — uses `aria-expanded` and `aria-controls` to associate the button with the collapsible section. Keyboard accessible via Tab and Enter/Space.
- **Edit and Delete buttons** — have `aria-label` attributes for screen reader identification.
- **Focus management** — after saving or cancelling an inline edit, focus is returned to the Edit button on the rebuilt card. After clicking Edit, focus moves to the title input automatically.
- **Keyboard navigation order** — Tab moves through: checkbox → status dropdown → Show more (if present) → Edit → Delete.
- **Color contrast** — badge colors use dark text on light tinted backgrounds (e.g., dark red on light red) to meet WCAG AA contrast requirements.
- **Focus styles** — `:focus-visible` outlines are applied on the expand toggle and status dropdown to support keyboard-only users without affecting mouse users.
