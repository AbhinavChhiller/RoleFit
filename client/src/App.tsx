import { useEffect } from 'react';
import { Analyze } from '@/pages/Analyze';
import { ThemeToggle } from '@/components/ThemeToggle';

function App() {
  // Set dark mode by default
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (!saved) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
            className="h-8 w-8 flex items-center justify-center">
              <img src="/roleFit.svg" alt="RoleFit Logo" className="h-6 w-6" />
            </div>
            <span className="font-semibold text-lg">RoleFit</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Analyze />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            RoleFit uses AI to analyze resume-job fit. Results are for guidance only.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
