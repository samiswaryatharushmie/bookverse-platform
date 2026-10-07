import { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const INQUIRY_TYPES = [
  'General Inquiry',
  'Order Issue',
  'Payment Problem',
  'Book Availability',
  'Return & Refund',
  'Complaint',
  'Other'
];

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const type = (form.elements.namedItem('support-type') as HTMLSelectElement).value;
      const subject = (form.elements.namedItem('support-subject') as HTMLInputElement).value;
      const message = (form.elements.namedItem('support-message') as HTMLTextAreaElement).value;
      const orderNumber = (form.elements.namedItem('support-order') as HTMLInputElement).value;

      await apiClient.post('/support/tickets', {
        type,
        subject,
        message,
        orderNumber
      });
      setSubmitted(true);
    } catch (error) {
      const errMsg = (error as any)?.response?.data?.message || 'Failed to submit inquiry. Please try again.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-1.5">
          <MessageCircle className="h-4 w-4 text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-muted)]">We're here to help</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Customer Support</h1>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          Have a question, complaint, or need help with your order? Fill out the form below and our team will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: 'Email Us',
              desc: 'support@bookmarq.lk',
              sub: 'Response within 24 hours',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10'
            },
            {
              icon: Phone,
              title: 'Call Us',
              desc: '+94 11 234 5678',
              sub: 'Mon–Sat, 9am – 6pm',
              color: 'text-green-400',
              bg: 'bg-green-500/10'
            },
            {
              icon: MapPin,
              title: 'Visit Us',
              desc: '45 Galle Road, Colombo 3',
              sub: 'Sri Lanka',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10'
            }
          ].map(({ icon: Icon, title, desc, sub, color, bg }) => (
            <div key={title} className="card p-5 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${bg} ${color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{title}</h3>
                <p className={`font-medium ${color} mt-0.5`}>{desc}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}

          {/* FAQ teaser */}
          <div className="card p-5 bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20">
            <h3 className="font-semibold text-[var(--color-accent)] mb-2">Common Questions</h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {[
                'How do I track my order?',
                'What is the return policy?',
                'How long does shipping take?',
                'Can I cancel an order?'
              ].map(q => (
                <li key={q} className="flex items-start gap-2">
                  <span className="text-[var(--color-accent)] mt-0.5">›</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Inquiry Submitted!</h2>
                <p className="text-[var(--color-text-muted)] mb-6">
                  Thank you for reaching out. Our support team will contact you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-secondary px-6"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Send className="h-5 w-5 text-[var(--color-accent)]" />
                  Submit an Inquiry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                      <input
                        type="text" required
                        className="input w-full"
                        placeholder="John Silva"
                        id="support-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                      <input
                        type="email" required
                        className="input w-full"
                        placeholder="john@example.com"
                        id="support-email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone (Optional)</label>
                      <input
                        type="tel"
                        className="input w-full"
                        placeholder="+94 77 123 4567"
                        id="support-phone"
                        name="support-phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Order Number (if applicable)</label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="ORD-1234567890"
                        id="support-order"
                        name="support-order"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Inquiry Type *</label>
                    <select required className="input w-full" id="support-type" name="support-type">
                      <option value="">— Select type —</option>
                      {INQUIRY_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Subject *</label>
                    <input
                      type="text" required
                      className="input w-full"
                      placeholder="Brief summary of your issue"
                      id="support-subject"
                      name="support-subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      className="input w-full resize-none"
                      placeholder="Please describe your issue or inquiry in detail. Include any relevant order numbers, book titles, or dates..."
                      id="support-message"
                      name="support-message"
                    />
                  </div>

                    {isAuthenticated ? (
                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="btn btn-primary w-full py-4 text-lg mt-6 flex items-center justify-center gap-2"
                      >
                        {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-5 w-5" /> Submit Inquiry</>}
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => navigate('/login')}
                        className="btn btn-primary w-full py-4 text-lg mt-6 flex items-center justify-center gap-2"
                      >
                        Login to Submit Inquiry
                      </button>
                    )}
                    
                    <p className="text-xs text-center text-[var(--color-text-muted)] mt-4">
                      By submitting this form, you agree to our privacy policy. We'll only use your information to respond to your inquiry.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
