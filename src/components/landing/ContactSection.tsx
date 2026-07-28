'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 max-w-7xl mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Info */}
        <div className="space-y-6">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            GET IN TOUCH
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Contact Symposium Organizers</h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Have queries regarding event registration, institutional delegation, or technical support? Our helpdesk team is online 24/7 during symposium hours.
          </p>

          <div className="space-y-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-mono">HELPDESK EMAIL</span>
                <strong className="text-white">support@symphosium2026.edu</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-mono">EMERGENCY HELPLINE</span>
                <strong className="text-white">+1 (800) 555-SYMPOSIUM</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-mono">EVENT VENUE</span>
                <strong className="text-white">National Science & Tech Auditorium, Main Campus</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800">
          {submitted ? (
            <div className="bg-slate-950 p-8 rounded-xl border border-emerald-500/30 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Message Delivered</h3>
              <p className="text-xs text-slate-400">
                Thank you for contacting us. An organizer representative will get back to your email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Send a Direct Message</h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Chen"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex.chen@mit.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Message Details</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ask a question about rounds, institutional registration, or schedule..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Send Inquiry
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
