import React, { useEffect, useRef, useCallback } from 'react';
import './AnimatedCardPayment.css';
import { initAnimatedCard } from './animatedCardLogic';

interface Props {
  onPay: (data: any) => Promise<void>;
  amountStr: string;
}

export default function AnimatedCardPayment({ onPay, amountStr }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Keep a stable ref to onPay so the initAnimatedCard effect only runs once
  const onPayRef = useRef(onPay);
  useEffect(() => { onPayRef.current = onPay; }, [onPay]);

  // Stable callback that delegates to the latest onPay via ref
  const stableOnPay = useCallback((data: any) => onPayRef.current(data), []);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const cleanup = initAnimatedCard(wrapperRef.current, stableOnPay, amountStr);
    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once only

  // Update the Pay button amount if the promo code changes the grand total
  useEffect(() => {
    if (!wrapperRef.current) return;
    const payLabel = wrapperRef.current.querySelector('.pay__label');
    if (payLabel) payLabel.textContent = `Pay ${amountStr}`;
  }, [amountStr]);

  return (
    <div className="animated-card-payment-wrapper" ref={wrapperRef}>
      <section className="checkout" data-checkout data-phase="idle">

        <div className="panes">

          {/* LEFT — animated card */}
          <div className="pane pane--stage" data-tiltzone>

            <div className="card-slot" data-slot aria-hidden={true}>
              <div className="payment-card" data-card>

                <span className="glow glow--wait"></span>
                <span className="glow glow--ok"></span>
                <span className="glow glow--no"></span>

                <div className="card__tilt">
                  <div className="card__inner">

                    {/* front */}
                    <div className="card__face card__face--front">
                      <span className="card__wash"></span>
                      <span className="card__guilloche"></span>
                      <span className="card__spec"></span>
                      <span className="card__sheen"></span>
                      <span className="card__sweep"></span>

                      <div className="card__top">
                        <svg className="chip" viewBox="0 0 44 34" focusable="false">
                          <defs>
                            <linearGradient id="steel" x1=".05" y1="0" x2=".95" y2="1">
                              <stop offset="0" stopColor="#f7f9fc" />
                              <stop offset=".34" stopColor="#cdd5e1" />
                              <stop offset=".68" stopColor="#a3aebf" />
                              <stop offset="1" stopColor="#7d8899" />
                            </linearGradient>
                          </defs>
                          <rect x=".7" y=".7" width="42.6" height="32.6" rx="5.4" fill="url(#steel)" />
                          <path d="M6 1.2h32.4a4.8 4.8 0 0 1 4.8 4.8" fill="none"
                                stroke="rgba(255,255,255,.72)" strokeWidth="1.3" strokeLinecap="round" />
                          <path d="M1.2 6v22a4.8 4.8 0 0 0 4.8 4.8h32" fill="none"
                                stroke="rgba(22,36,74,.30)" strokeWidth="1.2" strokeLinecap="round" />
                          <rect x=".7" y=".7" width="42.6" height="32.6" rx="5.4" fill="none" stroke="rgba(22,36,74,.48)" strokeWidth="1" />
                          <g stroke="rgba(22,36,74,.55)" strokeWidth="1.25" fill="none" strokeLinecap="round">
                            <path d="M14.2 1.4v31.2M29.8 1.4v31.2" />
                            <path d="M1.4 11.6h12.8M29.8 11.6h12.8M1.4 22.4h12.8M29.8 22.4h12.8" />
                          </g>
                          <rect x="14.2" y="11.6" width="15.6" height="10.8" rx="2"
                                fill="rgba(255,255,255,.28)" stroke="rgba(22,36,74,.55)" strokeWidth="1.25" />
                          <path d="M3.2 3.2h8.2v2H3.2z" fill="rgba(255,255,255,.66)" />
                          <path d="M17.2 13.4h9.4v1.6h-9.4z" fill="rgba(255,255,255,.5)" />
                        </svg>

                        <svg className="wave" viewBox="0 0 20 22" focusable="false">
                          <path d="M4 4.4a10 10 0 0 1 0 13.2M8.6 1.6a15.5 15.5 0 0 1 0 18.8M.4 7.6a5 5 0 0 1 0 6.8" />
                        </svg>
                      </div>

                      <p className="pan" data-pan>
                        <span className="pan__group"><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span></span>
                        <span className="pan__group"><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span></span>
                        <span className="pan__group"><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span></span>
                        <span className="pan__group"><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span><span className="pan__ch pan__ch--dim">•</span></span>
                      </p>

                      <div className="card__bottom">
                        <span className="card__cell">
                          <span className="card__key">Cardholder</span>
                          <span className="card__val" data-face-name>YOUR NAME</span>
                        </span>
                        <span className="card__cell card__cell--exp">
                          <span className="card__key">Expires</span>
                          <span className="card__val" data-face-exp>••/••</span>
                        </span>
                        <span className="scheme scheme--oncard" data-face-scheme data-scheme=""></span>
                      </div>
                    </div>

                    {/* back */}
                    <div className="card__face card__face--back">
                      <span className="card__wash"></span>
                      <span className="card__sheen"></span>
                      <span className="card__stripe"></span>
                      <div className="card__sigrow">
                        <span className="card__sig"></span>
                        <span className="card__cvc" data-face-cvc>•••</span>
                      </div>
                      <span className="scheme scheme--onback" data-back-scheme data-scheme=""></span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* result overlay */}
            <div className="result" data-result>
              <span className="result__spin"></span>
              <svg className="result__tick" viewBox="0 0 44 44" focusable="false">
                <circle cx="22" cy="22" r="19" pathLength="1" />
                <path d="M13.5 22.6 19.4 28.5 30.5 16.4" pathLength="1" />
              </svg>
              <svg className="result__cross" viewBox="0 0 44 44" focusable="false">
                <circle cx="22" cy="22" r="19" pathLength="1" />
                <path d="M15.5 15.5 28.5 28.5M28.5 15.5 15.5 28.5" pathLength="1" />
              </svg>
              <p className="result__say" data-result-say></p>
              <p className="result__sub" data-result-sub></p>
              <button className="result__again" type="button" data-again>Try again</button>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="pane pane--form" data-formpane>
            <form className="form" data-form noValidate>
              <h2 className="form__title">Payment details</h2>
              <p className="form__sub">Enter your card to complete the transaction.</p>

              <div className="field" data-field="name">
                <label className="field__label" htmlFor="cc-name">Cardholder name</label>
                <span className="field__box">
                  <svg className="field__icon" viewBox="0 0 20 20" aria-hidden={true} focusable="false">
                    <circle cx="10" cy="6.6" r="3.1" />
                    <path d="M3.8 16.6c.6-3.2 3.1-4.8 6.2-4.8s5.6 1.6 6.2 4.8" />
                  </svg>
                  <input className="field__input" id="cc-name" name="name" type="text"
                         autoComplete="cc-name" spellCheck={false} enterKeyHint="next"
                         placeholder="Full name" maxLength={26}
                         aria-describedby="err-name" />
                </span>
                <p className="field__err" id="err-name" data-err="name">
                  <svg viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                    <circle cx="8" cy="8" r="6.6" /><path d="M8 4.9v3.6" /><circle cx="8" cy="11.1" r=".95" />
                  </svg>
                  <span data-err-text="name"></span>
                </p>
              </div>

              <div className="field" data-field="number">
                <label className="field__label" htmlFor="cc-number">Card number</label>
                <span className="field__box">
                  <svg className="field__icon" viewBox="0 0 20 20" aria-hidden={true} focusable="false">
                    <rect x="2.2" y="4.4" width="15.6" height="11.2" rx="2.2" />
                    <path d="M2.2 8.4h15.6" />
                  </svg>
                  <input className="field__input field__input--pan" id="cc-number" name="number" type="text"
                         autoComplete="cc-number" inputMode="numeric" spellCheck={false} enterKeyHint="next"
                         placeholder="4242 4242 4242 4242"
                         aria-describedby="err-number" />
                  <span className="scheme scheme--infield" data-field-scheme data-scheme=""></span>
                </span>
                <p className="field__err" id="err-number" data-err="number">
                  <svg viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                    <circle cx="8" cy="8" r="6.6" /><path d="M8 4.9v3.6" /><circle cx="8" cy="11.1" r=".95" />
                  </svg>
                  <span data-err-text="number"></span>
                </p>
              </div>

              <div className="pair">
                <div className="field" data-field="exp">
                  <label className="field__label" htmlFor="cc-exp">Expiry date</label>
                  <span className="field__box">
                    <svg className="field__icon" viewBox="0 0 20 20" aria-hidden={true} focusable="false">
                      <rect x="3" y="4.4" width="14" height="12.2" rx="2.2" />
                      <path d="M3 8.2h14M6.8 2.6v3.2M13.2 2.6v3.2" />
                    </svg>
                    <input className="field__input" id="cc-exp" name="exp" type="text"
                           autoComplete="cc-exp" inputMode="numeric" spellCheck={false} enterKeyHint="next"
                           placeholder="MM / YY" maxLength={7}
                           aria-describedby="err-exp" />
                  </span>
                  <p className="field__err" id="err-exp" data-err="exp">
                    <svg viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                      <circle cx="8" cy="8" r="6.6" /><path d="M8 4.9v3.6" /><circle cx="8" cy="11.1" r=".95" />
                    </svg>
                    <span data-err-text="exp"></span>
                  </p>
                </div>

                <div className="field" data-field="cvc">
                  <label className="field__label" htmlFor="cc-cvc">CVC<span className="field__hint" data-cvc-hint> · back of card</span></label>
                  <span className="field__box">
                    <svg className="field__icon" viewBox="0 0 20 20" aria-hidden={true} focusable="false">
                      <rect x="4" y="8.6" width="12" height="8" rx="2" />
                      <path d="M7.2 8.6V6.4a2.8 2.8 0 0 1 5.6 0v2.2" />
                    </svg>
                    <input className="field__input" id="cc-cvc" name="cvc" type="text"
                           autoComplete="cc-csc" inputMode="numeric" spellCheck={false} enterKeyHint="go"
                           placeholder="•••" maxLength={4}
                           aria-describedby="err-cvc" />
                  </span>
                  <p className="field__err" id="err-cvc" data-err="cvc">
                    <svg viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                      <circle cx="8" cy="8" r="6.6" /><path d="M8 4.9v3.6" /><circle cx="8" cy="11.1" r=".95" />
                    </svg>
                    <span data-err-text="cvc"></span>
                  </p>
                </div>
              </div>

              <button className="pay" type="submit" data-pay>
                <span className="pay__gloss" aria-hidden={true}></span>
                <svg className="pay__lock" viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                  <rect x="3.2" y="7" width="9.6" height="7" rx="1.9" />
                  <path d="M5.7 7V5.2a2.3 2.3 0 0 1 4.6 0V7" />
                </svg>
                <span className="pay__label">Pay {amountStr}</span>
                <svg className="pay__arrow" viewBox="0 0 20 20" aria-hidden={true} focusable="false">
                  <path d="M3.6 10h12.8M11.2 5.2 16.4 10l-5.2 4.8" />
                </svg>
              </button>

              <ul className="assure">
                <li className="assure__item">
                  <svg viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                    <path d="M8 1.6 13.4 3.5v4.2c0 3.2-2.2 5.7-5.4 6.7-3.2-1-5.4-3.5-5.4-6.7V3.5L8 1.6Z" />
                  </svg>
                  PCI-DSS Level 1
                </li>
                <li className="assure__item">
                  <svg viewBox="0 0 16 16" aria-hidden={true} focusable="false">
                    <rect x="3" y="7" width="10" height="7" rx="1.8" />
                    <path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7" />
                  </svg>
                  256-bit TLS
                </li>
                <li className="assure__item assure__item--wide">Your CVC is never stored</li>
              </ul>
            </form>
          </div>
        </div>

      </section>
      <div data-live className="sr-only" aria-live="polite" aria-atomic={true}></div>
    </div>
  );
}
