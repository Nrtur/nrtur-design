// ─── app.jsx ── Router + Root App ─────────────────────────────────────────────

function App() {
  const [page, setPage] = React.useState('landing');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [cmdOpen,    setCmdOpen]    = React.useState(false);

  const goTo = React.useCallback((p) => {
    setPage(p);
    window.scrollTo && window.scrollTo(0, 0);
  }, []);

  // Expose openers so AppTopbar + search bar can trigger them
  React.useEffect(() => {
    window.__nrturOpenSearch = () => setSearchOpen(true);
    window.__nrturOpenCmd    = () => setCmdOpen(true);
    return () => {
      delete window.__nrturOpenSearch;
      delete window.__nrturOpenCmd;
    };
  }, []);

  // Global keyboard shortcuts
  React.useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(false);
        setCmdOpen(true);
      }
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const props = { goTo };

  return (
    <React.Fragment>
      {/* ── Auth ── */}
      {page === 'landing'          && <LandingPage {...props}/>}
      {page === 'signup'           && <SignUpPage {...props}/>}
      {page === 'signin'           && <SignInPage {...props}/>}
      {page === 'forgot-password'  && <ForgotPasswordPage {...props}/>}
      {page === 'onboarding-1'     && <OnboardingPage step={1} {...props}/>}
      {page === 'onboarding-2'     && <OnboardingPage step={2} {...props}/>}
      {page === 'onboarding-3'     && <OnboardingPage step={3} {...props}/>}
      {page === 'onboarding-4'     && <OnboardingPage step={4} {...props}/>}

      {/* ── App ── */}
      {page === 'dashboard'        && <DashboardPage {...props}/>}
      {page === 'contacts'         && <ContactsPage {...props}/>}
      {page === 'contact-detail'   && <ContactDetailPage {...props}/>}
      {page === 'add-contact'      && <AddContactPage {...props}/>}
      {page === 'edit-contact'     && <EditContactPage {...props}/>}
      {page === 'pipeline'         && <PipelinePage {...props}/>}
      {page === 'deal-detail'      && <DealDetailPage {...props}/>}
      {page === 'add-deal'         && <AddDealPage {...props}/>}
      {page === 'email-inbox'      && <EmailInboxPage {...props}/>}
      {page === 'automations'      && <AutomationsPage {...props}/>}
      {page === 'automation-builder' && <AutomationBuilderPage {...props}/>}
      {page === 'sms-sequences'    && <SMSSequencesPage {...props}/>}
      {page === 'reports'          && <ReportsPage {...props}/>}

      {/* ── Settings ── */}
      {page === 'settings-billing'      && <SettingsBillingPage {...props}/>}
      {page === 'settings-team'         && <SettingsTeamPage {...props}/>}
      {page === 'settings-general'      && <SettingsGeneralPage {...props}/>}
      {page === 'settings-integrations' && <SettingsIntegrationsPage {...props}/>}
      {page === 'settings-pipeline'     && <SettingsPipelinePage {...props}/>}
      {page === 'settings-unsubscribes' && <SettingsUnsubscribesPage {...props}/>}
      {page === 'profile'          && <ProfilePage {...props}/>}

      {/* ── Global overlays (rendered above everything) ── */}
      {searchOpen && (
        <GlobalSearchOverlay
          close={() => setSearchOpen(false)}
          goTo={(p) => { goTo(p); setSearchOpen(false); }}
        />
      )}
      {cmdOpen && (
        <CommandPalette
          close={() => setCmdOpen(false)}
          goTo={(p) => { goTo(p); setCmdOpen(false); }}
        />
      )}

      {/* ── Dev nav always visible ── */}
      <DevNav goTo={goTo}/>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
