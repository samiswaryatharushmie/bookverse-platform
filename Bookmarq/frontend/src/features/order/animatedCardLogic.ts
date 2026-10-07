// @ts-nocheck
/* ============================================================================
   SABLE — the checkout where the card is the form
   ----------------------------------------------------------------------------
   This file owns five things and nothing else:

     1. the scheme   — derived from the digits you have typed. It decides the
                       grouping, the digit count, the CVC length and the mark.
     2. the card     — the face is painted from the fields, one character at a
                       time, so only what changed animates.
     3. the tilt     — a lerped -1…1 pair written to two custom properties.
                       Runs a rAF only while it is actually moving.
     4. the form     — caret-safe formatting, Luhn, a real expiry check.
     5. the phase    — idle → authorising → approved | declined, written to one
                       attribute. app.css owns everything that looks different.

   No dependencies. Nothing here writes a transform string; it writes the
   variables the stylesheet's single transform declaration is built from.
   ========================================================================= */

/* ------------------------------------------------------------- 0 · the DOM */
export function initAnimatedCard(wrapper: HTMLElement, onPayCallback: (data: any) => Promise<void>, amountStr: string) {
if (wrapper.dataset.initialized) return () => {};
wrapper.dataset.initialized = 'true';
const checkout   = wrapper.querySelector('[data-checkout]') as HTMLElement;
const panes      = wrapper.querySelector('.panes') as HTMLElement;
const stagePane  = wrapper.querySelector('.pane--stage') as HTMLElement;
const formPane   = wrapper.querySelector('[data-formpane]') as HTMLElement;
const tiltZone   = wrapper.querySelector('[data-tiltzone]') as HTMLElement;
const slot       = wrapper.querySelector('[data-slot]') as HTMLElement;
const card       = wrapper.querySelector('[data-card]') as HTMLElement;
const tilt       = wrapper.querySelector('.card__tilt') as HTMLElement;
const panEl      = wrapper.querySelector('[data-pan]') as HTMLElement;

const faceName   = wrapper.querySelector('[data-face-name]') as HTMLElement;
const faceExp    = wrapper.querySelector('[data-face-exp]') as HTMLElement;
const faceCvc    = wrapper.querySelector('[data-face-cvc]') as HTMLElement;
const marks      = wrapper.querySelectorAll('[data-face-scheme], [data-back-scheme], [data-field-scheme]') as NodeListOf<HTMLElement>;
const cvcHint    = wrapper.querySelector('[data-cvc-hint]') as HTMLElement;

const form       = wrapper.querySelector('[data-form]') as HTMLFormElement;
const nameIn     = wrapper.querySelector('#cc-name') as HTMLInputElement;
const numIn      = wrapper.querySelector('#cc-number') as HTMLInputElement;
const expIn      = wrapper.querySelector('#cc-exp') as HTMLInputElement;
const cvcIn      = wrapper.querySelector('#cc-cvc') as HTMLInputElement;
const payBtn     = wrapper.querySelector('[data-pay]') as HTMLButtonElement;

const result     = wrapper.querySelector('[data-result]') as HTMLElement;
const resultSay  = wrapper.querySelector('[data-result-say]') as HTMLElement;
const resultSub  = wrapper.querySelector('[data-result-sub]') as HTMLElement;
const againBtn   = wrapper.querySelector('[data-again]') as HTMLElement;
const live       = wrapper.querySelector('[data-live]') as HTMLElement;

const lessMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stacked    = matchMedia('(max-width: 860px)');

const say = (msg) => { live.textContent = msg; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const digitsOf = (v) => v.replace(/\D/g, '');
const getAmount = () => (payBtn.querySelector('.pay__label') as HTMLElement)?.textContent?.replace('Pay ', '') || '';

/* ---------------------------------------------------------- 1 · the scheme */
/*
  Prefix bands, not a full BIN table — enough to pick the grouping, the length
  and the mark, which is all a front end is entitled to decide on its own.
*/
const SCHEMES = [
  { key: 'visa',       mark: 'VISA',     label: 'Visa',             test: /^4/,                      groups: [4, 4, 4, 4], cvc: 3, where: 'back of card' },
  { key: 'mastercard', mark: '',         label: 'Mastercard',       test: /^(5[1-5]|2[2-7])/,        groups: [4, 4, 4, 4], cvc: 3, where: 'back of card' },
  { key: 'amex',       mark: 'AMEX',     label: 'American Express', test: /^3[47]/,                  groups: [4, 6, 5],    cvc: 4, where: 'front of card' },
  { key: 'discover',   mark: 'DISCOVER', label: 'Discover',         test: /^(6011|65|64[4-9])/,      groups: [4, 4, 4, 4], cvc: 3, where: 'back of card' },
];
const GENERIC = { key: '', mark: '', label: 'card', groups: [4, 4, 4, 4], cvc: 3, where: 'back of card' };

const schemeFor = (digits) => SCHEMES.find((s) => s.test.test(digits)) ?? GENERIC;

let scheme = GENERIC;
const panLength = (s) => s.groups.reduce((a, b) => a + b, 0);

/* ------------------------------------------------------- 2 · the card face */

let panChars = [];
let panShape = '';

function buildPan(groups) {
  const shape = groups.join('-');
  if (shape === panShape) return;
  panShape = shape;
  panChars = [];
  const frag = document.createDocumentFragment();
  for (const n of groups) {
    const group = document.createElement('span');
    group.className = 'pan__group';
    for (let i = 0; i < n; i++) {
      const ch = document.createElement('span');
      ch.className = 'pan__ch pan__ch--dim';
      ch.textContent = '•';
      group.append(ch);
      panChars.push(ch);
    }
    frag.append(group);
  }
  panEl.replaceChildren(frag);
}

/* a character that has just changed rolls over in place — and only that one,
   which is why the face is a pool of spans rather than one text node */
function roll(el) {
  if (lessMotion.matches) return;
  el.animate(
    [
      { transform: 'translateY(-52%) scaleY(.55)', opacity: 0 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' }
  );
}

function paintPan(digits) {
  buildPan(scheme.groups);
  for (let i = 0; i < panChars.length; i++) {
    const want = digits[i] ?? '•';
    const el = panChars[i];
    if (el.textContent === want) continue;
    el.textContent = want;
    el.classList.toggle('pan__ch--dim', want === '•');
    roll(el);
  }
}

function paintScheme() {
  // the marks are drawn by ::before / ::after off this one attribute
  for (const mark of marks) mark.dataset.scheme = scheme.key;
  cvcIn.maxLength = scheme.cvc;
  cvcHint.textContent = ` · ${scheme.where}`;
}

const nameFace = (v) => (v.trim() ? v.trim().toUpperCase() : 'YOUR NAME');

function expFace(v) {
  const d = digitsOf(v).slice(0, 4).padEnd(4, '•');
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

const cvcFace = (v) => digitsOf(v).padEnd(scheme.cvc, '•').slice(0, scheme.cvc);

function paintCard() {
  const digits = digitsOf(numIn.value).slice(0, panLength(scheme));
  paintPan(digits);
  faceName.textContent = nameFace(nameIn.value);
  faceExp.textContent = expFace(expIn.value);
  faceCvc.textContent = cvcFace(cvcIn.value);
}

/* ---------------------------------------------------------- 3 · the tilt */
/*
  The pointer moves two numbers. Everything the card does with them — the
  rotation and the travel of the sheen — is one declaration in the stylesheet.
*/
const aim = { x: 0, y: 0, tx: 0, ty: 0 };
let frame = null;
let zone = null;

const measureZone = () => { zone = tiltZone.getBoundingClientRect(); };

function pump() {
  aim.x += (aim.tx - aim.x) * 0.08;
  aim.y += (aim.ty - aim.y) * 0.08;
  const rest = Math.abs(aim.tx - aim.x) + Math.abs(aim.ty - aim.y) < 0.002;
  if (rest) { aim.x = aim.tx; aim.y = aim.ty; }

  card.style.setProperty('--px', aim.x.toFixed(3));
  card.style.setProperty('--py', aim.y.toFixed(3));
  tilt.style.setProperty('--tx', `${(-aim.y * 6).toFixed(2)}deg`);
  tilt.style.setProperty('--ty', `${(aim.x * 9).toFixed(2)}deg`);

  if (rest) {
    frame = null;
    tilt.style.willChange = '';
  } else {
    frame = requestAnimationFrame(pump);
  }
}

function aimAt(x, y) {
  if (lessMotion.matches) return;
  // Disable tilt when card is in-flight — cursor is over flown card
  // but the tilt zone is still the left pane, giving extreme out-of-range values
  if (phase !== 'idle') return;
  if (!zone || !zone.width) measureZone();
  aim.tx = clamp((x - (zone.left + zone.width / 2)) / (zone.width / 2), -1, 1);
  aim.ty = clamp((y - (zone.top + zone.height / 2)) / (zone.height / 2), -1, 1);
  if (!frame) { tilt.style.willChange = 'transform'; frame = requestAnimationFrame(pump); }
}

function relax() {
  if (phase !== 'idle') return;
  aim.tx = 0; aim.ty = 0;
  if (!frame && !lessMotion.matches) { tilt.style.willChange = 'transform'; frame = requestAnimationFrame(pump); }
}

if (!lessMotion.matches) {
  tiltZone.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') aimAt(e.clientX, e.clientY); }, { passive: true });
  tiltZone.addEventListener('pointerleave', relax, { passive: true });
  addEventListener('resize', measureZone, { passive: true });
  addEventListener('scroll', measureZone, { passive: true });
  addEventListener('load', measureZone);
  measureZone();
}

/* ---------------------------------------------------------- 4 · the flip */
/* The CVC is on the back of the card, so when it is asked for, the back of the
   card is what you get. Amex prints it on the front — so Amex doesn't turn. */
function setFlip(on) {
  const turn = on && scheme.key !== 'amex';
  card.style.setProperty('--flip', turn ? '180deg' : '0deg');
}

/* ---------------------------------------------- 5 · caret-safe formatting */
/*
  Reformatting an input on every keystroke throws the caret to the end unless
  you put it back. The only stable measure is "how many digits were to the left
  of it" — separators come and go, digits don't.
*/
const digitsBefore = (value, pos) => digitsOf(value.slice(0, pos)).length;

function caretAfterDigits(text, n) {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i])) { seen++; if (seen === n) return i + 1; }
  }
  return text.length;
}

function apply(input, digits, caretDigits, formatter) {
  const text = formatter(digits);
  input.value = text;
  const at = caretAfterDigits(text, caretDigits);
  try { input.setSelectionRange(at, at); } catch { /* not all types allow it */ }
}

function groupPan(digits) {
  const out = [];
  let i = 0;
  for (const n of scheme.groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + n));
    i += n;
  }
  return out.join(' ');
}

const groupExp = (d) => (d.length <= 2 ? d : `${d.slice(0, 2)} / ${d.slice(2, 4)}`);

/* Backspace next to a separator should eat the digit behind it, not the
   separator the formatter is about to put straight back. */
function eatBackwards(input, formatter, cap) {
  return (e) => {
    if (e.key !== 'Backspace') return;
    if (input.selectionStart !== input.selectionEnd) return;
    const pos = input.selectionStart;
    if (pos === 0 || /\d/.test(input.value[pos - 1])) return;
    e.preventDefault();
    const before = digitsOf(input.value.slice(0, pos));
    const after = digitsOf(input.value.slice(pos));
    apply(input, (before.slice(0, -1) + after).slice(0, cap()), Math.max(0, before.length - 1), formatter);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
}

/* ------------------------------------------------------------ 6 · the form */

const errBox = (name) => document.querySelector(`[data-err="${name}"]`);
const fieldOf = (input) => input.closest('.field');

function setError(input, message) {
  const box = errBox(input.name);
  const field = fieldOf(input);
  if (message) {
    box.querySelector('[data-err-text]').textContent = message;
    box.setAttribute('data-shown', '');
    field.setAttribute('data-invalid', '');
    input.setAttribute('aria-invalid', 'true');
  } else {
    box.removeAttribute('data-shown');
    field.removeAttribute('data-invalid');
    input.removeAttribute('aria-invalid');
    // the text stays put while it fades, so the row never collapses mid-exit
  }
}
const clearErrors = () => { for (const el of [nameIn, numIn, expIn, cvcIn]) setError(el, ''); };
const shown = (input) => errBox(input.name).hasAttribute('data-shown');

/* Luhn. Every real card number satisfies it, so a typo is caught here rather
   than by the bank ten seconds later. */
function luhn(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (double) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/* A real expiry check: a card is good through the last day of its month. */
function expiryProblem(digits) {
  if (digits.length < 4) return 'Enter the month and year from the front of the card.';
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return 'There is no month ' + digits.slice(0, 2) + '.';
  const now = new Date();
  const lastMonth = new Date(year, month, 1);       // first day of the month after
  if (lastMonth <= new Date(now.getFullYear(), now.getMonth(), 1)) return 'That date has passed.';
  if (year > now.getFullYear() + 20) return 'That date is too far away.';
  return '';
}

function firstProblem() {
  const digits = digitsOf(numIn.value);
  const want = panLength(scheme);

  if (nameIn.value.trim().length < 2) return [nameIn, 'Enter the name printed on the card.'];
  if (!digits) return [numIn, 'Enter your card number.'];
  if (digits.length < want) return [numIn, `A ${scheme.label} number is ${want} digits — you have ${digits.length}.`];
  if (!luhn(digits)) return [numIn, "That card number isn't valid — check it for a typo."];

  const expProblem = expiryProblem(digitsOf(expIn.value));
  if (expProblem) return [expIn, expProblem];

  const cvc = digitsOf(cvcIn.value);
  if (cvc.length !== scheme.cvc) return [cvcIn, `The CVC is ${scheme.cvc} digits, on the ${scheme.where}.`];

  return null;
}

/* ------------------------------------------------- 7 · wiring the fields */

nameIn.addEventListener('input', () => {
  if (shown(nameIn)) setError(nameIn, '');
  paintCard();
});

numIn.addEventListener('keydown', eatBackwards(numIn, groupPan, () => panLength(scheme)));
numIn.addEventListener('input', () => {
  if (shown(numIn)) setError(numIn, '');
  const pos = numIn.selectionStart ?? numIn.value.length;
  const caretDigits = digitsBefore(numIn.value, pos);

  // the scheme is re-derived first, because it decides both the grouping the
  // formatter uses and how many digits are allowed through
  const raw = digitsOf(numIn.value);
  const next = schemeFor(raw);
  const changed = next.key !== scheme.key;
  scheme = next;
  if (changed) {
    paintScheme();
    setFlip(document.activeElement === cvcIn);
    if (next.key) say(`${next.label} card detected.`);
  }

  apply(numIn, raw.slice(0, panLength(scheme)), caretDigits, groupPan);
  paintCard();
});

expIn.addEventListener('keydown', eatBackwards(expIn, groupExp, () => 4));
expIn.addEventListener('input', () => {
  if (shown(expIn)) setError(expIn, '');
  const pos = expIn.selectionStart ?? expIn.value.length;
  apply(expIn, digitsOf(expIn.value).slice(0, 4), digitsBefore(expIn.value, pos), groupExp);
  paintCard();
});

cvcIn.addEventListener('input', () => {
  if (shown(cvcIn)) setError(cvcIn, '');
  cvcIn.value = digitsOf(cvcIn.value).slice(0, scheme.cvc);
  paintCard();
});

/* The turn is the moment the piece is about, so it is driven by focus rather
   than by clicking — tabbing into the CVC turns the card exactly the same way. */
cvcIn.addEventListener('focus', () => setFlip(true));
cvcIn.addEventListener('blur', () => setFlip(false));

/* ------------------------------------------------------ 8 · the flight */
/*
  Measured off .card-slot, which is the one box in here that is never
  transformed — so the numbers mean the same thing however the card is
  currently tilted, turned or scaled.
*/
function layFlight() {
  const from = slot.getBoundingClientRect();
  // Always fly to the full panes area (left+right) so card centers over the whole widget
  const target = panes.getBoundingClientRect();
  const stage = stagePane.getBoundingClientRect();
  if (!from.width || !target.width) return;

  // Grow the card to ~55% of the full panes width for a large, cinematic feel
  const grow = clamp((target.width * 0.55) / from.width, 1, 1.6);
  const flownH = from.height * grow;

  // Target center: horizontally centered in panes, vertically upper-third
  const cx = target.left + target.width / 2;
  const cy = target.top + target.height * 0.36;

  card.style.setProperty('--fly-x', `${(cx - (from.left + from.width / 2)).toFixed(1)}px`);
  card.style.setProperty('--fly-y', `${(cy - (from.top + from.height / 2)).toFixed(1)}px`);
  card.style.setProperty('--fly-s', grow.toFixed(3));

  // Result appears below the flown card.
  // result is position:absolute left:50% top:0 in pane--stage, translateY(--verdict-y).
  // Note: top:0 on an absolute element starts at the padding edge, not the border edge!
  const stageCx = stage.left + stage.width / 2;
  const stagePaddingTop = parseFloat(getComputedStyle(stagePane).paddingTop) || 0;
  const stagePaddingEdgeTop = stage.top + stagePaddingTop;
  let verdictY = cy + flownH / 2 + 20 - stagePaddingEdgeTop;
  
  // Cap verdictY to prevent the Try Again button from being pushed out of the container
  const resultMaxH = 140; // Approx height of the result block
  const containerMaxY = target.height - resultMaxH;
  if (verdictY > containerMaxY) {
    verdictY = containerMaxY;
  }
  
  // Horizontal: shift result from stage center to full-widget center
  result.style.setProperty('--result-x', `${(cx - stageCx).toFixed(1)}px`);
  // Vertical: absolute offset from stage padding edge so result icon is 20px below card bottom
  result.style.setProperty('--verdict-y', `${verdictY.toFixed(1)}px`);
}

function land() {
  card.style.removeProperty('--fly-x');
  card.style.removeProperty('--fly-y');
  card.style.removeProperty('--fly-s');
}

addEventListener('resize', () => { measureZone(); if (phase !== 'idle') layFlight(); }, { passive: true });

/* ------------------------------------------------------- 9 · the phase */

let phase = 'idle';

function setPhase(next) {
  phase = next;
  checkout.dataset.phase = next;
  const busy = next !== 'idle';
  formPane.toggleAttribute('inert', busy);
  result.toggleAttribute('inert', !busy);
}

function shake(el) {
  if (lessMotion.matches) return;
  el.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
    { duration: 320, easing: 'ease-out' }
  );
}

function refuse(input, message) {
  setError(input, message);
  say(message);
  shake(fieldOf(input));
  input.focus({ preventScroll: true });
  if (input === numIn || input === cvcIn) input.select();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (phase !== 'idle') return;

  clearErrors();
  const problem = firstProblem();
  if (problem) return refuse(problem[0], problem[1]);

  const digits = digitsOf(numIn.value);
  const last4 = digits.slice(-4);
  const label = scheme.label === 'card' ? 'Card' : scheme.label;

  document.activeElement?.blur?.();
  setFlip(false);
  relax();
  setPhase('authorising');
  // Stacked, the phase drops the form out of flow — so the flight is measured
  // on the next frame, against the geometry it is actually going to land in.
  requestAnimationFrame(layFlight);

  const currentAmount = getAmount();
  resultSay.textContent = 'Authorising with your bank';
  resultSub.textContent = `${label} •••• ${last4} · ${currentAmount}`;
  say(`Authorising ${currentAmount} on your ${label} ending ${last4}.`);

  try {
    await onPayCallback({ name: nameIn.value, number: numIn.value, expiry: expIn.value, cvc: cvcIn.value });
    if (phase !== 'authorising') return;
    setPhase('approved');
    resultSay.textContent = `Paid ${currentAmount}`;
    resultSub.textContent = `${label} •••• ${last4} · receipt on its way to you`;
    say(`Approved. ${currentAmount} paid with your ${label} ending ${last4}.`);
  } catch (error) {
    if (phase !== 'authorising') return;
    setPhase('declined');
    resultSay.textContent = 'Your bank declined this card';
    resultSub.textContent = 'No money has moved. Try another card, or call the number on the back.';
    say('Declined. Your bank refused this card. No money has moved.');
  }

  // the button fades in behind the tick; focus lands once it is on screen
  const settled = phase;
  setTimeout(() => { if (phase === settled) againBtn.focus({ preventScroll: true }); },
             lessMotion.matches ? 0 : 560);
});

againBtn.addEventListener('click', () => {
  const wasDeclined = phase === 'declined';
  setPhase('idle');
  land();
  say(wasDeclined ? 'Back to the payment form. Try a different card number.' : 'Back to the payment form.');
  const back = wasDeclined ? numIn : nameIn;
  back.focus({ preventScroll: true });
  if (wasDeclined) back.select();
});

/* -------------------------------------------------- 10 · the two test cards */
/* One click fills a card that works and a card that doesn't, because the whole
   point of a checkout demo is being able to reach both endings. */
for (const button of document.querySelectorAll('[data-fill]')) {
  button.addEventListener('click', () => {
    if (phase !== 'idle') { setPhase('idle'); land(); }
    clearErrors();

    const digits = button.dataset.fill;
    scheme = schemeFor(digits);
    paintScheme();
    numIn.value = groupPan(digits);
    if (!nameIn.value.trim()) nameIn.value = 'A. Hasib';
    if (digitsOf(expIn.value).length < 4) expIn.value = '12 / 28';
    if (digitsOf(cvcIn.value).length < scheme.cvc) cvcIn.value = scheme.cvc === 4 ? '1234' : '123';

    paintCard();
    say('Card filled. Press Pay to run it.');
    payBtn.focus({ preventScroll: true });
  });
}

/* ------------------------------------------------------------- 11 · start */
buildPan(scheme.groups);
paintScheme();
paintCard();
setPhase('idle');

return () => {
    // cleanup
};
}
