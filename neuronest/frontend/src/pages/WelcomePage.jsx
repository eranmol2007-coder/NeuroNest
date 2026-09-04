import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';

export default function WelcomePage() {
  const { patient } = usePatient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  useEffect(() => { if (patient) navigate('/home'); }, [patient, navigate]);

  return (
      <div className="brendon-page">
        {/* Hero Section - Exact replica */}
        <section className="brendon-hero">
          <div className="brendon-hero-overlay"></div>
          <div className="brendon-hero-content">
            <h1 className="brendon-hero-title">
              Navigating Memory Care with<br />
              Evidence-Based<br />
              AI Support
            </h1>
            <p className="brendon-hero-subtitle">
              Empowering cognitive wellness through therapeutic games and personalized support<br />
              for individuals with dementia, right here for you and your family.
            </p>
            <p className="brendon-hero-location">
              Accessible from anywhere with our digital cognitive care platform.
            </p>
            <button onClick={() => navigate('/signup')} className="brendon-hero-button">
              Get Started Today
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="brendon-section brendon-about">
          <div className="brendon-container">
            <div className="brendon-about-grid">
              {/* Left: Text Content */}
              <div className="brendon-about-text">
                <p className="brendon-about-label">About Us</p>
                <h2 className="brendon-section-title">Hey there,<br/>Welcome to NeuroNest</h2>
                <p className="brendon-text">
                  We're an AI-powered cognitive care platform deeply committed to supporting individuals with dementia and their families.
                </p>
                <p className="brendon-text">
                  Driven by a passion for enhancing quality of life, our platform provides therapeutic cognitive games,
                  personalized reminders, and compassionate support to help individuals maintain their cognitive function
                  and independence.
                </p>
                <p className="brendon-text">
                  Through evidence-based approaches and adaptive technology, we empower families and caregivers with
                  the tools they need to provide better care, track progress, and stay connected with their loved ones.
                </p>
                <p className="brendon-text">
                  From memory exercises and daily routine support to real-time monitoring and multilingual assistance,
                  we're dedicated to guiding you on your path to better cognitive wellness and quality of life.
                </p>
                <div className="brendon-about-stats">
                  <div className="brendon-stat">
                    <span className="brendon-stat-number">9+</span>
                    <span className="brendon-stat-label">Languages Supported</span>
                  </div>
                  <div className="brendon-stat">
                    <span className="brendon-stat-number">6</span>
                    <span className="brendon-stat-label">Cognitive Games</span>
                  </div>
                  <div className="brendon-stat">
                    <span className="brendon-stat-number">24/7</span>
                    <span className="brendon-stat-label">AI Support</span>
                  </div>
                </div>
              </div>

              {/* Right: Image */}
              <div className="brendon-about-image-wrap">
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900"
                  alt="Mental wellness and mindfulness"
                  className="brendon-about-img"
                />
                <div className="brendon-about-img-badge">
                  <span>🧠</span>
                  <span>Cognitive Wellness</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="brendon-quote-section">
          <div className="brendon-container-narrow">
            <p className="brendon-quote">
              "In the heart of every memory challenge lies an opportunity for connection and growth. 
              Our mission is to guide you through these moments towards a life of dignity and fulfillment."
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="brendon-section brendon-services">
          <div className="brendon-container">
            <h2 className="brendon-heading-center">
              Comprehensive support through every stage of the journey
            </h2>
            <p className="brendon-subheading-center">
              Our platform adapts to individual needs, providing personalized assistance and engaging activities.
            </p>

            <div className="brendon-services-grid">
              <div className="brendon-service-card">
                <h3 className="brendon-service-title">Cognitive Training Games</h3>
                <p className="brendon-service-text">
                  Evidence-based therapeutic games designed to maintain and enhance cognitive function through 
                  engaging, adaptive challenges that adjust to each individual's ability level.
                </p>
              </div>

              <div className="brendon-service-card">
                <h3 className="brendon-service-title">Smart Reminders</h3>
                <p className="brendon-service-text">
                  Personalized reminder system with voice assistance for medication schedules, daily routines, 
                  and important tasks, ensuring consistency and independence.
                </p>
              </div>

              <div className="brendon-service-card">
                <h3 className="brendon-service-title">Caregiver Dashboard</h3>
                <p className="brendon-service-text">
                  Real-time insights and progress tracking to keep family members and caregivers informed, 
                  connected, and able to provide better support.
                </p>
              </div>

              <div className="brendon-service-card">
                <h3 className="brendon-service-title">Voice Assistant</h3>
                <p className="brendon-service-text">
                  Natural language interaction with multi-lingual support including regional languages, 
                  making the platform accessible and easy to use for diverse communities.
                </p>
              </div>

              <div className="brendon-service-card">
                <h3 className="brendon-service-title">Adaptive Difficulty</h3>
                <p className="brendon-service-text">
                  AI-driven difficulty adjustment ensures appropriate challenge levels, promoting cognitive 
                  engagement and growth without causing frustration or overwhelm.
                </p>
              </div>

              <div className="brendon-service-card">
                <h3 className="brendon-service-title">Offline Support</h3>
                <p className="brendon-service-text">
                  Access core features even without internet connectivity, with automatic synchronization 
                  when back online, ensuring continuous care without interruption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="brendon-section brendon-why">
          <div className="brendon-container">
            <div className="brendon-why-grid">
              <div className="brendon-why-card">
                <h3 className="brendon-why-title">Evidence-Based</h3>
                <p className="brendon-why-text">
                  Our cognitive games and therapeutic approaches are grounded in neuroscience research and 
                  clinical best practices for dementia care.
                </p>
              </div>

              <div className="brendon-why-card">
                <h3 className="brendon-why-title">Compassionate</h3>
                <p className="brendon-why-text">
                  We value dignity, respect, and understanding. Our platform is designed with empathy at 
                  its core to support both patients and their families.
                </p>
              </div>

              <div className="brendon-why-card">
                <h3 className="brendon-why-title">Culturally Sensitive</h3>
                <p className="brendon-why-text">
                  Supporting multiple languages and cultural contexts, we ensure accessibility for families 
                  across India's diverse communities.
                </p>
              </div>

              <div className="brendon-why-card">
                <h3 className="brendon-why-title">AI-Powered</h3>
                <p className="brendon-why-text">
                  Advanced artificial intelligence adapts to each individual's needs, providing personalized 
                  experiences that evolve with their cognitive journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Quote */}
        <section className="brendon-quote-section brendon-quote-alt">
          <div className="brendon-container-narrow">
            <p className="brendon-quote">
              "In the heart of every memory challenge lies an opportunity for connection and growth. 
              Our mission is to guide you through these moments towards a life of dignity and fulfillment."
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="brendon-cta-section">
          <div className="brendon-container-narrow">
            <h2 className="brendon-cta-title">Begin Your Journey of Care and Support</h2>
            <p className="brendon-cta-text">
              Start using NeuroNest today with personalized cognitive training and compassionate assistance.
            </p>
            <button onClick={() => navigate('/signup')} className="brendon-cta-button">
              Get Started Today
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="brendon-footer">
          <div className="brendon-container">
            <p className="brendon-footer-text">
              © 2024 NeuroNest. Supporting cognitive wellness with compassion and technology.
            </p>
          </div>
        </footer>
      </div>
    );
}


