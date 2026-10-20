"use client";
import { useRef, useState } from "react";

const EMAIL = "rizalmaulanaairlangga456@gmail.com";

const TOPICS = [
  "Project Collaboration",
  "Internship",
  "PKL Opportunity",
  "Technical Discussion",
  "Feedback",
  "Other",
];

const FIELD_ORDER = ["name", "email", "topic", "message"];

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";

  const email = values.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email address doesn't look right.";

  if (!values.topic) errors.topic = "Pick what you'd like to discuss.";

  const message = values.message.trim();
  if (!message) errors.message = "Please write a message.";
  else if (message.length < 12) errors.message = "Add a little more detail (at least 12 characters).";

  return errors;
}

const labelClass = "block text-[13px] lg:text-[14px] font-semibold tracking-[0.01em] text-[#F0F3FF]";
const errorClass = "mt-1.5 block text-[13px] font-medium leading-[1.4] text-[#FF9C8A]";

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", topic: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const topicRef = useRef(null);
  const messageRef = useRef(null);
  const refs = { name: nameRef, email: emailRef, topic: topicRef, message: messageRef };

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const onChange = (field) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    clearError(field);
    setStatus("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      setStatus("");
      refs[firstInvalid].current?.focus();
      return;
    }

    const subject = `[Portfolio] ${values.topic} — ${values.name.trim()}`;
    const body = [
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      `Topic: ${values.topic}`,
      "",
      values.message.trim(),
    ].join("\n");

    setStatus("Your mail app should open with this message ready to send — press send there and I'll reply as soon as I can.");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      action={`mailto:${EMAIL}`}
      method="post"
      encType="text/plain"
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title" className="text-[24px] lg:text-[30px] font-semibold tracking-[-0.02em] text-white">
        Send a message
      </h2>
      <p className="mt-2 text-[14px] lg:text-[15px] leading-[1.55] text-white/70">
        All four fields are required. Sending opens your mail app with the message ready to go.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Full Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            ref={nameRef}
            className="field-input mt-2"
            placeholder="Your name"
            value={values.name}
            onChange={onChange("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name && (
            <span id="contact-name-error" className={errorClass} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email Address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            ref={emailRef}
            className="field-input mt-2"
            placeholder="you@example.com"
            value={values.email}
            onChange={onChange("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email && (
            <span id="contact-email-error" className={errorClass} role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-topic" className={labelClass}>
            What would you like to discuss?
          </label>
          <select
            id="contact-topic"
            name="topic"
            required
            ref={topicRef}
            className="field-select mt-2"
            value={values.topic}
            onChange={onChange("topic")}
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={errors.topic ? "contact-topic-error" : undefined}
          >
            <option value="">Choose a topic</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic && (
            <span id="contact-topic-error" className={errorClass} role="alert">
              {errors.topic}
            </span>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className={labelClass}>
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            ref={messageRef}
            className="field-textarea mt-2"
            placeholder="Tell me a little about the project, timeline, or role…"
            value={values.message}
            onChange={onChange("message")}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          {errors.message && (
            <span id="contact-message-error" className={errorClass} role="alert">
              {errors.message}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="detail-cta btn-motion mt-6 inline-flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white text-[#0A0404] text-[16px] lg:text-[17px] font-semibold hover:bg-white/90 transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-h-[52px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7AB8E8]"
      >
        <span className="cta-label">Send Message</span>
        <span className="w-10 h-10 rounded-full bg-[#7AB8E8] text-white flex items-center justify-center shrink-0">
          <span aria-hidden="true" className="cta-arrow-viewport">
            <span className="cta-arrow-icon cta-arrow-icon-back">→</span>
            <span className="cta-arrow-icon cta-arrow-icon-front">→</span>
          </span>
        </span>
      </button>

      {status && (
        <p role="status" className="mt-4 rounded-[10px] border border-[#7AB8E8] bg-[#7AB8E8]/15 px-4 py-3 text-[14px] leading-[1.5] text-[#EAF4FC]">
          {status}
        </p>
      )}

      <p className="mt-5 text-[13.5px] leading-[1.5] text-white/70">
        Prefer your own mail app? Write to{" "}
        <a
          href={`mailto:${EMAIL}`}
          className="font-semibold text-white underline decoration-[#7AB8E8] decoration-2 underline-offset-2 hover:decoration-white transition-colors"
        >
          {EMAIL}
        </a>
      </p>
    </form>
  );
}
