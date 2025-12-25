

interface ConfigWarningProps {
  show: boolean;
}

/**
 * Warning banner shown when Supabase is not configured
 * Helps developers set up environment variables
 */
function ConfigWarning({ show }: ConfigWarningProps) {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
      <div className="bg-amber-950/90 border border-amber-900/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-amber-400 font-semibold mb-1">
              ⚙️ Supabase Not Configured
            </h3>
            <p className="text-amber-200 text-sm mb-2">
              The dashboard will work in demo mode, but data won't be saved.
            </p>
            <div className="bg-slate-950/50 rounded-lg p-3 mb-2">
              <p className="text-amber-300 text-xs font-mono mb-1">
                Create <strong>frontend/.env</strong> file:
              </p>
              <pre className="text-amber-200 text-xs overflow-x-auto">
                VITE_SUPABASE_URL=your_supabase_url{'\n'}
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </pre>
            </div>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 text-sm underline"
            >
              Get free Supabase account →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigWarning;
