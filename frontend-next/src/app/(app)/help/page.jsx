'use client';

import './help.css';

const faqs = [
  {
    question: 'How do I create a new survey?',
    answer: 'Navigate to Surveys > Add Survey from the sidebar menu. Fill in the required fields and click Submit.',
  },
  {
    question: 'How do I view survey results?',
    answer: 'Go to Surveys > View Survey to see all published surveys and their results.',
  },
  {
    question: 'How do I schedule a meeting?',
    answer: 'Click on Meetings in the sidebar, then select "Schedule New Meeting" to create a meeting.',
  },
  {
    question: 'How do I access the Discussion Board?',
    answer: 'Click on "Discussion Board/Chat" in the sidebar to participate in community discussions.',
  },
];

const contactInfo = {
  email: 'support@vizor.com',
  phone: '1-800-VIZOR-HELP',
};

export default function HelpPage() {
  return (
    <main className="help-container" aria-labelledby="help-heading">
      <div className="help-header">
        <h1 id="help-heading">Help &amp; Support</h1>
        <p>Find answers to common questions and get support</p>
      </div>

      <div className="help-content">
        {/* FAQs Section */}
        <section className="faq-section" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Frequently Asked Questions</h2>
          <div className="faq-list" role="list" aria-label="Frequently asked questions">
            {faqs.map((faq, i) => (
              <div className="faq-item" key={i} role="listitem" aria-labelledby={`faq-question-${i}`}>
                <h3 id={`faq-question-${i}`}>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section" aria-labelledby="contact-heading">
          <h2 id="contact-heading">Need More Help?</h2>
          <p>Our support team is here to assist you.</p>
          <div className="contact-info" role="list" aria-label="Contact information">
            <div className="contact-item" role="listitem">
              <i className="pi pi-envelope" aria-hidden="true"></i>
              <span className="sr-only">Email:</span>
              <span aria-label={`Email support at ${contactInfo.email}`}>{contactInfo.email}</span>
            </div>
            <div className="contact-item" role="listitem">
              <i className="pi pi-phone" aria-hidden="true"></i>
              <span className="sr-only">Phone:</span>
              <span aria-label={`Phone support at ${contactInfo.phone}`}>{contactInfo.phone}</span>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <nav className="quick-links-section" aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading">Quick Links</h2>
          <ul className="quick-links">
            <li><a href="#" aria-label="Open user guide">User Guide</a></li>
            <li><a href="#" aria-label="Open video tutorials">Video Tutorials</a></li>
            <li><a href="#" aria-label="Open system requirements">System Requirements</a></li>
            <li><a href="#" aria-label="Open privacy policy">Privacy Policy</a></li>
            <li><a href="#" aria-label="Open terms of service">Terms of Service</a></li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
