import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      <div className={`w-full max-w-lg mx-4 rounded-xl shadow-lg p-8 text-center backdrop-blur-sm border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full animate-pulse ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`} />
            <AlertCircle className="relative h-16 w-16 text-red-500" />
          </div>
        </div>

        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>404</h1>

        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          P\u00e1gina n\u00e3o encontrada
        </h2>

        <p className={`mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          A p\u00e1gina que voc\u00ea procura n\u00e3o existe ou foi removida.
        </p>

        <Button
          onClick={handleGoHome}
          className="bg-[#00FFFF] hover:bg-[#00E5E5] text-gray-900 px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-semibold min-h-[44px]"
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar ao In\u00edcio
        </Button>
      </div>
    </div>
  );
}
