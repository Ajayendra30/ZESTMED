import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      sessionStorage.removeItem('zestmed_patient_active_tab');
      sessionStorage.removeItem('zestmed_is_reloading');
    } catch (_) {}
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin';
    } else {
      window.location.href = '/patient-dashboard?tab=dashboard';
    }
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      return (
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 select-none">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center space-y-5">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="ZESTMED"
                className="h-10 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007A64] flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isAdmin ? 'Admin Dashboard Recovery' : 'Patient Dashboard Recovered'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                We detected an issue while rendering your dashboard. You can reload or reset your view below.
              </p>
              {this.state.error && (
                <div className="text-left mt-3 p-3 bg-red-50 border border-red-200 rounded-xl max-h-56 overflow-auto text-xs font-mono text-red-700">
                  <div className="font-bold mb-1">{this.state.error.toString()}</div>
                  {this.state.error.stack && (
                    <pre className="text-[10px] text-red-600 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-[#008F83] hover:bg-[#007A64] text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                {isAdmin ? 'Reset & Open Admin Dashboard' : 'Reset & Open Dashboard'}
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-600 text-xs transition cursor-pointer"
              >
                Return to Public Store
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
