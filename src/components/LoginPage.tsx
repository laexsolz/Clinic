// src/pages/LoginPage.tsx
import { useEffect, useRef, useState } from 'react';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Stethoscope,
  Shield,
  Users,
  Copy,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

type Role = 'patient' | 'doctor' | 'admin';

const DEMO_USERS: Array<{ email: string; password: string; role: Role; fullName: string }> = [
  { email: 'admin@demo.test', password: 'admin123', role: 'admin', fullName: 'Admin Demo' },
  { email: 'doctor@demo.test', password: 'doctor123', role: 'doctor', fullName: 'Doctor Demo' },
  { email: 'patient@demo.test', password: 'patient123', role: 'patient', fullName: 'Patient Demo' },
];

function readLocalSignups() {
  try {
    const raw = localStorage.getItem('demo_users');
    if (!raw) return [];
    return JSON.parse(raw) as Array<{ email: string; password: string; role: Role; fullName: string }>;
  } catch {
    return [];
  }
}

function saveLocalSignup(user: { email: string; password: string; role: Role; fullName: string }) {
  const arr = readLocalSignups();
  arr.push(user);
  localStorage.setItem('demo_users', JSON.stringify(arr));
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const cardVariants: Variants = {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      scale: 0.98,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  useEffect(() => {
    // optional prefill during development
    // setEmail('patient@demo.test');
    // setPassword('patient123');
  }, []);

  const findUser = (emailToFind: string, pass: string) => {
    const lower = emailToFind.trim().toLowerCase();
    const fromHardcoded = DEMO_USERS.find((u) => u.email.toLowerCase() === lower && u.password === pass);
    if (fromHardcoded) return fromHardcoded;
    const local = readLocalSignups().find((u) => u.email.toLowerCase() === lower && u.password === pass);
    return local ?? null;
  };

  const onSuccessfulLogin = (user: { email: string; role: Role; fullName: string }) => {
    // store demo logged-in user so the rest of the app can read it
    localStorage.setItem('demo_user', JSON.stringify(user));

    toast.success(`Signed in as ${user.role}`, { duration: 2000, position: 'top-center' });

    // reload so top-level AuthProvider picks it up (or change to useNavigate if desired)
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const user = findUser(email, password);
        if (!user) throw new Error('Invalid credentials — try one of the demo accounts.');

        onSuccessfulLogin({ email: user.email, role: user.role, fullName: user.fullName });
      } else {
        // Sign up (demo-only). We keep this local and simple.
        if (!fullName.trim()) throw new Error('Please enter your full name');
        const normalized = email.trim().toLowerCase();

        // check conflicts with hardcoded or local signups
        const conflictInHardcoded = DEMO_USERS.some((u) => u.email.toLowerCase() === normalized);
        const conflictInLocal = readLocalSignups().some((u) => u.email.toLowerCase() === normalized);
        if (conflictInHardcoded || conflictInLocal) {
          throw new Error('An account with this email already exists (demo).');
        }

        // save a demo user locally so it persists between refreshes for this demo
        saveLocalSignup({ email: normalized, password, role, fullName: fullName.trim() });

        toast.success('Demo account created — please sign in', {
          duration: 2500,
          position: 'top-center',
        });

        setTimeout(() => {
          setIsLogin(true);
          setPassword('');
        }, 350);
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'An error occurred', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  // New: copy & autofill utility
  const copyAndFill = async (acct: { email: string; password: string }) => {
    try {
      const text = `Email: ${acct.email}\nPassword: ${acct.password}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }

      // autofill inputs
      setEmail(acct.email);
      setPassword(acct.password);

      // focus password for quick submit
      setTimeout(() => passwordInputRef.current?.focus(), 50);

      toast.success('Credentials copied & filled', { duration: 1600, position: 'top-center' });
    } catch (err) {
      toast.error('Failed to copy to clipboard', { position: 'top-center' });
    }
  };

  // Render a single demo row
  const DemoRow = ({ acct }: { acct: { email: string; password: string; role: Role; fullName: string } }) => {
    const bg =
      acct.role === 'admin'
        ? ''
        : acct.role === 'doctor'
        ? ''
        : '';

    const leftIcon =
      acct.role === 'admin' ? (
        <Shield className="w-5 h-5 text-indigo-600" />
      ) : acct.role === 'doctor' ? (
        <Stethoscope className="w-5 h-5 text-emerald-600" />
      ) : (
        <Users className="w-5 h-5 text-yellow-600" />
      );

    return (
      <div
        onClick={() => copyAndFill({ email: acct.email, password: acct.password })}
        className={`cursor-pointer ${bg} border border-slate-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-all`}
        title="Click to copy & autofill"
      >
        <div className="p-2 rounded-md bg-white/80">{leftIcon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700 truncate">{acct.fullName} </div>
            
          </div>

          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <div className="text-xs text-slate-600 truncate">
              <span className="font-medium">Email:</span> {acct.email}
            </div>
            <div className="text-xs text-slate-600 truncate">
              <span className="font-medium">Pass:</span> {acct.password}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* copy button - clicking it also copies/fills but stops propagation so we don't trigger parent onClick twice */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyAndFill({ email: acct.email, password: acct.password });
            }}
            type="button"
            className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-2 text-sm border rounded-md flex items-center "
          >
            <Copy className="w-4 h-4 mr-1" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                <Stethoscope className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">HealthCare Portal Demo</h1>
            <p className="text-blue-100 text-center text-sm">Minimalist clinic app, customizable to fit your needs.</p>
          </div>

          <div className="p-8">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  isLogin ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  !isLogin ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Sign Up
              </button>
            </div>
          
            <AnimatePresence mode="wait" initial={false}>
              {isLogin ? (
                <motion.form
                  key="login"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  variants={cardVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        ref={passwordInputRef}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>

                    {isLogin && (
              <div className="mb-4 space-y-3">
                {DEMO_USERS.map((d) => (
                  <DemoRow key={d.email} acct={d} />
                ))}
              </div>
            )}

                  <div className="text-xs text-center text-slate-500 mt-3">
                    Tip: click any demo row or the "Copy" button to autofill the form.
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  variants={cardVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Register As</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={`p-3 rounded-lg border-2 transition-all ${role === 'patient' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Users className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Patient</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('doctor')}
                        className={`p-3 rounded-lg border-2 transition-all ${role === 'doctor' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Stethoscope className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Doctor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`p-3 rounded-lg border-2 transition-all ${role === 'admin' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Shield className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium">Admin</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center text-sm text-slate-600">
              {isLogin ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setIsLogin(false)} className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign up here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setIsLogin(true)} className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">Developer - Abdul Ghani</p>
        </div>
      </div>
    </div>
  );
}
