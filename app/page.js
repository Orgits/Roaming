'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Home, Users, Building2, Crown, Search, Bell, MessageSquare,
  Plus, ThumbsUp, MapPin, Calendar, LogOut, ArrowRight, Sparkles,
  Globe, Shield, TrendingUp, UserPlus, Check, X, Briefcase, GraduationCap,
  Rocket, Laptop, Send, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Edit, Zap, Target, BarChart3, Menu, ChevronDown, Heart, Award, Eye, Moon, Sun
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_next-portal-hub/artifacts/5al7e509_logo.png';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce',
  'Real Estate', 'Manufacturing', 'Consulting', 'Media', 'Legal',
  'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'AgriTech',
  'CleanTech', 'Logistics', 'Food & Beverage', 'Fashion', 'Other'
];
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Goa', 'Kochi', 'Indore', 'Other'
];
const STAGES = ['Idea', 'MVP', 'Early Revenue', 'Growth', 'Scale', 'Enterprise'];
const ROLES = [
  { id: 'student', label: 'Student', tier: 'professional', icon: GraduationCap, desc: 'Currently studying or recent graduate' },
  { id: 'professional', label: 'Working Professional', tier: 'professional', icon: Briefcase, desc: 'Employed or seeking new opportunities' },
  { id: 'founder', label: 'Founder / CEO', tier: 'executive', icon: Rocket, desc: 'Building or leading a company' },
  { id: 'freelancer', label: 'Freelancer / Agency', tier: 'business', icon: Laptop, desc: 'Independent professional or agency owner' },
  { id: 'investor', label: 'Investor', tier: 'investor', icon: TrendingUp, desc: 'Angel investor, VC, or fund manager' },
];
const TIER_COLORS = {
  professional: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  business: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  executive: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  investor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};
const TIER_LABELS = { professional: 'Professional', business: 'Business', executive: 'Executive', investor: 'Investor' };
const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
  { type: 'support', emoji: '💪', label: 'Support' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'curious', emoji: '🤔', label: 'Curious' },
  { type: 'love', emoji: '❤️', label: 'Love' },
];

const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ======================= AUTH DIALOG =======================
function AuthDialog({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [method, setMethod] = useState('email'); // 'email' or 'oauth'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body = mode === 'signup' 
        ? { email: form.email, password: form.password, name: form.name }
        : { email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      onSuccess(data.user, data.is_new);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = 'https://demobackend.emergentagent.com/auth/v1/env/oauth/google?redirect_to=' + encodeURIComponent(window.location.origin);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">
            {mode === 'login' ? 'Welcome Back' : 'Join RoamingCEO'}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account to get started'}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Method Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                method === 'email' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setMethod('oauth')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                method === 'oauth' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              OAuth
            </button>
          </div>

          {method === 'email' ? (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="bg-input border-border text-foreground"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-input border-border text-foreground"
                />
                {mode === 'signup' && (
                  <p className="text-xs text-muted-foreground mt-1">At least 6 characters</p>
                )}
              </div>
              {error && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-2">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-full"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleGoogleAuth}
                variant="outline"
                className="w-full border-border hover:bg-muted"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </span>
            {' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-emerald-500 hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ======================= LANDING PAGE =======================
function LandingPage() {
  const { handleSignIn, theme, toggleTheme } = useApp();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleAuthSuccess = async (user, isNew) => {
    setShowAuthDialog(false);
    // Update the user state directly instead of reloading
    window.location.reload();
  };
  const features = [
    { icon: Shield, title: 'Zero Ads, Ever', desc: 'Your feed stays clean. Revenue from premium tools, not your attention.', color: 'text-emerald-400' },
    { icon: Building2, title: 'Business Identity', desc: 'Rich business profiles with influence scores, beyond generic CV-style pages.', color: 'text-blue-400' },
    { icon: Crown, title: 'CEO & Business Index', desc: 'Searchable directories of executives and businesses with rankings.', color: 'text-amber-400' },
    { icon: Target, title: 'Investor Marketplace', desc: 'Full investor-startup matchmaking with deal flow dashboards.', color: 'text-purple-400' },
    { icon: MapPin, title: 'City Circles', desc: 'Geographic micro-communities for local networking and events.', color: 'text-rose-400' },
    { icon: Sparkles, title: 'AI Intelligence', desc: 'Market reports, sector heatmaps, and competitor analysis at your fingertips.', color: 'text-cyan-400' },
  ];
  const tiers = [
    { name: 'Professional', desc: 'Students, Employees, Job Seekers', features: ['Everything LinkedIn offers + more', 'City circles & events', 'Content feed without ads', 'Job board & Easy Apply'], color: 'border-blue-500', icon: Briefcase, bg: 'from-blue-500/5 to-transparent' },
    { name: 'Business', desc: 'Founders, Agencies, Freelancers', features: ['Professional features +', 'Business profile & index', 'Freelancer marketplace', 'Cofounder discovery board'], color: 'border-emerald-500', icon: Building2, bg: 'from-emerald-500/5 to-transparent' },
    { name: 'Executive', desc: 'CEOs, CXOs, Serial Founders', features: ['Business features +', 'CEO index with rankings', 'Private executive circles', 'Executive hiring board'], color: 'border-amber-500', icon: Crown, bg: 'from-amber-500/5 to-transparent' },
    { name: 'Investor', desc: 'Angels, VCs, Fund Managers', features: ['Executive features +', 'Startup deal flow dashboard', 'Portfolio tracker', 'Demo day access'], color: 'border-purple-500', icon: TrendingUp, bg: 'from-purple-500/5 to-transparent' },
  ];
  const comparisons = [
    { feature: 'Professional Profiles', linkedin: 'Generic CV-style', rc: 'Rich identity with influence score' },
    { feature: 'Content Feed', linkedin: 'Ad-heavy, engagement bait', rc: 'Zero ads, quality-focused' },
    { feature: 'Business Data', linkedin: 'None', rc: 'CEO index, business index, rankings' },
    { feature: 'Investor Tools', linkedin: 'None', rc: 'Full matchmaking marketplace' },
    { feature: 'Communities', linkedin: 'Dead groups', rc: 'Active city & industry circles' },
    { feature: 'AI Intelligence', linkedin: 'Basic writing tools', rc: 'Market reports & competitor analysis' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-8 md:h-10" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground/70 hover:text-foreground h-9 w-9">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" className="text-foreground/70 hover:text-foreground hidden md:inline-flex" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</Button>
            <Button variant="ghost" className="text-foreground/70 hover:text-foreground hidden md:inline-flex" onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}>Plans</Button>
            <Button onClick={() => setShowAuthDialog(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">Join Free</Button>
          </div>
        </div>
      </nav>

      <AuthDialog open={showAuthDialog} onClose={() => setShowAuthDialog(false)} onSuccess={handleAuthSuccess} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-emerald-500/15 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-blue-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <img src={LOGO_URL} alt="RoamingCEO" className="h-16 md:h-20 mx-auto mb-6" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400 mb-8">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>The Professional Super-Platform for India</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-foreground">LinkedIn is where you </span>
            <span className="text-muted-foreground">exist.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              RoamingCEO is where you
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">do business.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            From graduates to CEOs, from freelancers to investors. One platform for networking, business discovery, hiring, investment, and growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button onClick={() => setShowAuthDialog(true)} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/25">
              Join Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted rounded-full px-10 py-6 text-lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            {[{ n: '10,000+', l: 'Professionals' }, { n: '2,500+', l: 'Companies' }, { n: '500+', l: 'Investors' }, { n: '15+', l: 'Cities' }].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{s.n}</div>
                <div className="text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Built for the Indian Business Ecosystem</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Every feature is a deliberate decision to serve professionals better than anyone has before.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} className="bg-card border-border hover:border-border/50 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground text-center mb-16">Why Not LinkedIn?</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 px-4 pb-4">
              <div className="text-sm font-medium text-muted-foreground">Feature</div>
              <div className="text-sm font-medium text-muted-foreground text-center">LinkedIn</div>
              <div className="text-sm font-medium text-emerald-400 text-center">RoamingCEO</div>
            </div>
            {comparisons.map(c => (
              <div key={c.feature} className="grid grid-cols-3 gap-4 px-4 py-4 rounded-xl bg-card border border-border hover:border-border/50 transition-colors">
                <div className="text-foreground font-medium text-sm">{c.feature}</div>
                <div className="text-muted-foreground text-sm text-center">{c.linkedin}</div>
                <div className="text-emerald-400 text-sm text-center font-medium">{c.rc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section id="tiers" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">One Platform, Four Identities</h2>
            <p className="text-muted-foreground text-lg">All tiers are free at launch. Premium features unlock deeper capabilities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map(t => (
              <Card key={t.name} className={`bg-gradient-to-b ${t.bg} border-t-2 ${t.color} border-x-border border-b-border hover:-translate-y-1 transition-all duration-300`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                      <t.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                  <Separator className="my-4 bg-border" />
                  <ul className="space-y-2">
                    {t.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-12 md:p-20">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-purple-600/20" />
            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm border border-border rounded-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Ready to Do Business?</h2>
              <p className="text-muted-foreground text-lg mb-8">Join thousands of professionals building real business connections.</p>
              <Button onClick={() => setShowAuthDialog(true)} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-12 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/25">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="RoamingCEO" className="h-6" />
            <span className="text-slate-500 text-sm">New Delhi, India</span>
          </div>
          <p className="text-slate-600 text-sm">&copy; 2026 RoamingCEO. All rights reserved. Strictly Confidential.</p>
        </div>
      </footer>
    </div>
  );
}

// ======================= ONBOARDING =======================
function OnboardingView() {
  const { user, setUser, setView } = useApp();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ headline: '', city: '', industry: '' });
  const [bizForm, setBizForm] = useState({ name: '', industry: '', stage: '', city: '', website: '' });
  const [loading, setLoading] = useState(false);
  const needsBiz = selectedRole && ['business', 'executive', 'investor'].includes(selectedRole.tier);

  const handleComplete = async () => {
    setLoading(true);
    try {
      const body = { tier: selectedRole.tier, ...form };
      if (needsBiz) body.business_profile = bizForm;
      const res = await fetch('/api/users/onboarding', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), credentials: 'include'
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setView('feed');
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Let&apos;s set up your profile</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, ...(needsBiz ? [3] : [])].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-10 bg-emerald-500' : s < step ? 'w-10 bg-emerald-500/50' : 'w-10 bg-muted'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">What describes you best?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map(role => (
                <button key={role.id} onClick={() => setSelectedRole(role)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${selectedRole?.id === role.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-card hover:border-border/50'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedRole?.id === role.id ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                    <role.icon className={`w-5 h-5 ${selectedRole?.id === role.id ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{role.label}</div>
                    <div className="text-sm text-muted-foreground">{role.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(2)} disabled={!selectedRole} className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 rounded-full py-6">
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Professional Headline</label>
                <Input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                  placeholder="e.g. CEO at TechCorp | Building the future of fintech"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">City</label>
                  <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                    <option value="" className="bg-background">Select city</option>
                    {CITIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Industry</label>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                    <option value="" className="bg-background">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-background">{i}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-border text-foreground hover:bg-muted rounded-full py-6">Back</Button>
              <Button onClick={() => needsBiz ? setStep(3) : handleComplete()} disabled={!form.headline || loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-full py-6">
                {loading ? 'Setting up...' : needsBiz ? 'Continue' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && needsBiz && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">Your Business</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Company / Business Name</label>
                <Input value={bizForm.name} onChange={e => setBizForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. TechCorp India" className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Industry</label>
                  <select value={bizForm.industry} onChange={e => setBizForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                    <option value="" className="bg-background">Select</option>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-background">{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Stage</label>
                  <select value={bizForm.stage} onChange={e => setBizForm(f => ({ ...f, stage: e.target.value }))}
                    className="w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                    <option value="" className="bg-background">Select</option>
                    {STAGES.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">City</label>
                  <select value={bizForm.city} onChange={e => setBizForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                    <option value="" className="bg-background">Select</option>
                    {CITIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Website</label>
                  <Input value={bizForm.website} onChange={e => setBizForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://..." className="bg-input border-border text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-border text-foreground hover:bg-muted rounded-full py-6">Back</Button>
              <Button onClick={handleComplete} disabled={!bizForm.name || loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-full py-6">
                {loading ? 'Setting up...' : 'Complete Setup'} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ======================= TOP BAR =======================
function TopBar() {
  const { user, view, setView, handleLogout, theme, toggleTheme } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'communities', label: 'Groups', icon: Globe },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'ceo', label: 'CEO', icon: Crown },
  ];

  // Add admin option for admin users
  const isAdmin = user?.email?.includes('admin');
  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-7 cursor-pointer" onClick={() => setView('feed')} />
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 w-56 lg:w-72 h-9 bg-muted border-border text-foreground placeholder:text-muted-foreground text-sm rounded-full" placeholder="Search..." />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${view === item.id ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground h-9 w-9">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-1 px-2 py-1 rounded-full hover:bg-muted transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border text-foreground min-w-[200px]" align="end">
              <div className="px-3 py-2">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.headline || user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => setView('profile')} className="cursor-pointer hover:bg-muted text-foreground">
                <Edit className="w-4 h-4 mr-2" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-muted text-red-400">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground h-9 w-9" onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {mobileMenu && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setMobileMenu(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${view === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================= POST CARD =======================
function PostCard({ post, onReact }) {
  const { user, setView, setSelectedUserId } = useApp();
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);

  const loadComments = async () => {
    if (!showComments) {
      setShowComments(true);
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${post.post_id}/comments`, { credentials: 'include' });
        if (res.ok) { const data = await res.json(); setComments(data.comments || []); }
      } catch (e) { console.error(e); }
      setLoadingComments(false);
    } else {
      setShowComments(false);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${post.post_id}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }), credentials: 'include'
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
      }
    } catch (e) { console.error(e); }
  };

  return (
    <Card className="bg-card border-border hover:border-border/50 transition-colors overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={() => { setSelectedUserId(post.author?.user_id); setView('user-profile'); }}>
            <AvatarImage src={post.author?.picture} />
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{post.author?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-sm cursor-pointer hover:underline"
                onClick={() => { setSelectedUserId(post.author?.user_id); setView('user-profile'); }}>
                {post.author?.name}
              </span>
              {post.author?.tier && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TIER_COLORS[post.author.tier]}`}>
                  {TIER_LABELS[post.author.tier]}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{post.author?.headline}</p>
            <p className="text-[11px] text-muted-foreground/70">{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ''}</p>
          </div>
          {post.user_id === user?.user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuItem className="text-red-400 cursor-pointer">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="mt-3 text-foreground text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map(h => <span key={h} className="text-xs text-blue-400 hover:underline cursor-pointer">#{h}</span>)}
          </div>
        )}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <span className="flex -space-x-1">{REACTIONS.filter(r => post.reactions?.[r.type] > 0).slice(0, 3).map(r => <span key={r.type}>{r.emoji}</span>)}</span>
            <span>{totalReactions}</span>
          </div>
        )}
        <Separator className="my-3 bg-border" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button variant="ghost" size="sm"
                className={`text-xs gap-1.5 h-8 ${post.user_reaction ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => onReact(post.post_id, post.user_reaction || 'like')}
                onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                <ThumbsUp className="w-3.5 h-3.5" />
                {post.user_reaction ? REACTIONS.find(r => r.type === post.user_reaction)?.label : 'Like'}
              </Button>
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-1 flex gap-1 bg-popover border border-border rounded-full px-2 py-1 shadow-xl z-10"
                  onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {REACTIONS.map(r => (
                    <button key={r.type} onClick={() => { onReact(post.post_id, r.type); setShowReactions(false); }}
                      className="hover:scale-125 transition-transform text-lg" title={r.label}>{r.emoji}</button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground" onClick={loadComments}>
              <MessageCircle className="w-3.5 h-3.5" /> {post.comments_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground">
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8 text-muted-foreground hover:text-foreground">
            <Bookmark className="w-3.5 h-3.5" />
          </Button>
        </div>
        {showComments && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input value={commentText} onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addComment()}
                  placeholder="Write a comment..." className="flex-1 h-8 text-sm bg-input border-border text-foreground placeholder:text-muted-foreground rounded-full" />
                <Button size="icon" onClick={addComment} disabled={!commentText.trim()} className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 rounded-full">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {loadingComments ? <p className="text-xs text-muted-foreground text-center">Loading...</p> :
              comments.map(c => (
                <div key={c.comment_id} className="flex gap-2 ml-9">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={c.author?.picture} />
                    <AvatarFallback className="bg-muted text-xs">{c.author?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-xl px-3 py-2 flex-1">
                    <span className="text-xs font-medium text-foreground">{c.author?.name}</span>
                    <p className="text-xs text-foreground/90">{c.content}</p>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ======================= FEED VIEW =======================
function FeedView() {
  const { user, setView, setSelectedUserId } = useApp();
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    loadSuggestions();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts?limit=30', { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setPosts(data.posts || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadSuggestions = async () => {
    try {
      const res = await fetch('/api/connections/suggestions', { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setSuggestions(data.suggestions?.slice(0, 5) || []); }
    } catch (e) { console.error(e); }
  };

  const createPost = async () => {
    if (!postContent.trim()) return;
    setCreating(true);
    try {
      const tags = postContent.match(/#(\w+)/g)?.map(t => t.slice(1)) || [];
      const res = await fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent, hashtags: tags }), credentials: 'include'
      });
      if (res.ok) { const newPost = await res.json(); setPosts(prev => [newPost, ...prev]); setPostContent(''); }
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  const handleReact = async (postId, type) => {
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }), credentials: 'include'
      });
      if (res.ok) {
        const result = await res.json();
        setPosts(prev => prev.map(p => {
          if (p.post_id !== postId) return p;
          const updated = { ...p, reactions: { ...p.reactions } };
          if (result.action === 'added') {
            updated.reactions[type] = (updated.reactions[type] || 0) + 1;
            updated.user_reaction = type;
          } else if (result.action === 'removed') {
            updated.reactions[type] = Math.max(0, (updated.reactions[type] || 0) - 1);
            updated.user_reaction = null;
          } else if (result.action === 'changed') {
            updated.reactions[result.previous] = Math.max(0, (updated.reactions[result.previous] || 0) - 1);
            updated.reactions[type] = (updated.reactions[type] || 0) + 1;
            updated.user_reaction = type;
          }
          return updated;
        }));
      }
    } catch (e) { console.error(e); }
  };

  const sendConnectionRequest = async (recipientId) => {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: recipientId }), credentials: 'include'
      });
      if (res.ok) {
        setSuggestions(prev => prev.filter(s => s.user_id !== recipientId));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Profile Card */}
        <div className="hidden lg:block lg:col-span-3">
          <Card className="bg-card border-border overflow-hidden sticky top-20">
            <div className="h-16 bg-gradient-to-r from-emerald-600/30 to-blue-600/30" />
            <CardContent className="pt-0 -mt-8 text-center">
              <Avatar className="h-16 w-16 mx-auto border-2 border-background">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <h3 className="text-sm font-semibold text-foreground mt-2">{user?.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.headline || 'Add your headline'}</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border mt-2 ${TIER_COLORS[user?.tier || 'professional']}`}>
                {TIER_LABELS[user?.tier || 'professional']}
              </span>
              <Separator className="my-3 bg-border" />
              <div className="flex justify-between text-xs">
                <div><span className="text-foreground font-medium">{user?.connections_count || 0}</span><br /><span className="text-muted-foreground">Connections</span></div>
                <div><span className="text-foreground font-medium">{user?.followers_count || 0}</span><br /><span className="text-muted-foreground">Followers</span></div>
                <div><span className="text-foreground font-medium">{user?.influence_score || 0}</span><br /><span className="text-muted-foreground">Influence</span></div>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground" onClick={() => setView('profile')}>
                View Profile <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center - Feed */}
        <div className="lg:col-span-6 space-y-4">
          {/* Create Post */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea value={postContent} onChange={e => setPostContent(e.target.value)}
                    placeholder="Share an insight, ask a question, or post an update..."
                    className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none min-h-[60px]"
                    rows={2} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{postContent.length}/3000</span>
                    <Button onClick={createPost} disabled={!postContent.trim() || creating}
                      className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-6 h-8 text-sm">
                      {creating ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : posts.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Welcome to RoamingCEO!</h3>
                <p className="text-sm text-muted-foreground">Be the first to share something. Your network is waiting.</p>
              </CardContent>
            </Card>
          ) : (
            posts.map(post => <PostCard key={post.post_id} post={post} onReact={handleReact} />)
          )}
        </div>

        {/* Right Sidebar - Suggestions */}
        <div className="hidden lg:block lg:col-span-3">
          {suggestions.length > 0 && (
            <Card className="bg-card border-border sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground font-medium">People you may know</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map(s => (
                  <div key={s.user_id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 cursor-pointer" onClick={() => { setSelectedUserId(s.user_id); setView('user-profile'); }}>
                      <AvatarImage src={s.picture} />
                      <AvatarFallback className="bg-muted text-xs">{s.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate cursor-pointer hover:underline"
                        onClick={() => { setSelectedUserId(s.user_id); setView('user-profile'); }}>{s.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{s.headline || s.city}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => sendConnectionRequest(s.user_id)}>
                      <UserPlus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================= PROFILE VIEW =======================
function ProfileView() {
  const { user, setUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const pictureInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const startEdit = () => {
    setEditForm({
      name: user?.name || '', 
      headline: user?.headline || '', 
      summary: user?.summary || '',
      city: user?.city || '', 
      industry: user?.industry || '',
      website: user?.website || '',
      phone: user?.phone || '',
      skills: user?.skills || [],
    });
    setEditing(true);
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const field = type === 'picture' ? 'picture' : 'cover_photo';
      
      if (type === 'picture') setUploadingPicture(true);
      else setUploadingCover(true);
      
      try {
        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: base64 }),
          credentials: 'include'
        });
        if (res.ok) {
          const updated = await res.json();
          setUser(updated);
        }
      } catch (e) {
        console.error(e);
        alert('Failed to upload image');
      } finally {
        if (type === 'picture') setUploadingPicture(false);
        else setUploadingCover(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm), credentials: 'include'
      });
      if (res.ok) { const updated = await res.json(); setUser(updated); setEditing(false); }
    } catch (e) { console.error(e); }
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill && skill.trim()) {
      setEditForm(f => ({ ...f, skills: [...(f.skills || []), skill.trim()] }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm(f => ({ ...f, skills: (f.skills || []).filter(s => s !== skillToRemove) }));
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-32 md:h-48 bg-gradient-to-r from-emerald-600/30 via-blue-600/20 to-purple-600/30 relative group"
          style={user.cover_photo ? { backgroundImage: `url(${user.cover_photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white bg-black/50 hover:bg-black/70"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              {uploadingCover ? 'Uploading...' : 'Change Cover'}
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-foreground/70 hover:text-foreground bg-background/20 h-8 w-8 backdrop-blur-sm" onClick={startEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        <CardContent className="relative pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <div className="relative group">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
                <AvatarImage src={user.picture} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-3xl">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer"
                onClick={() => pictureInputRef.current?.click()}>
                <Edit className="w-6 h-6 text-white" />
              </div>
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0], 'picture')}
              />
              {uploadingPicture && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-full">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${TIER_COLORS[user.tier]}`}>
                  {TIER_LABELS[user.tier]}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{user.headline || 'Add your professional headline'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {user.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.city}</span>}
                {user.industry && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{user.industry}</span>}
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{user.connections_count || 0} connections</span>
                {user.website && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /><a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{user.website.replace(/^https?:\/\//, '').split('/')[0]}</a></span>}
              </div>
            </div>
            <Button onClick={startEdit} className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-6">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>

          {/* Profile Completion */}
          {user.profile_completion < 80 && (
            <div className="mt-6 p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground font-medium">Profile Strength</span>
                <span className="text-sm text-emerald-400">{user.profile_completion}%</span>
              </div>
              <Progress value={user.profile_completion} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">Complete your profile to rank higher in search and recommendations.</p>
            </div>
          )}

          {/* About */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">About</h2>
            <p className="text-sm text-foreground/90 leading-relaxed">{user.summary || 'Tell your story. Share what drives you professionally.'}</p>
          </div>

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(s => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground border border-border">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Business Profile */}
          {user.business_profile?.name && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.business_profile.name}</h3>
                  <p className="text-xs text-muted-foreground">{user.business_profile.industry} {user.business_profile.stage ? `• ${user.business_profile.stage}` : ''}</p>
                </div>
              </div>
              {user.business_profile.about && <p className="text-sm text-foreground/90">{user.business_profile.about}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                {user.business_profile.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.business_profile.city}</span>}
                {user.business_profile.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{user.business_profile.website}</span>}
                {user.business_profile.team_size && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{user.business_profile.team_size}</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 bg-input border-border text-foreground" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Headline</label>
              <Input value={editForm.headline || ''} onChange={e => setEditForm(f => ({ ...f, headline: e.target.value }))}
                placeholder="e.g. CEO at TechCorp | Building the future" 
                className="mt-1 bg-input border-border text-foreground" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Summary</label>
              <textarea value={editForm.summary || ''} onChange={e => setEditForm(f => ({ ...f, summary: e.target.value }))}
                className="mt-1 w-full min-h-[100px] bg-input border border-border rounded-md p-3 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tell your professional story..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">City</label>
                <select value={editForm.city || ''} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                  <option value="" className="bg-background">Select</option>
                  {CITIES.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Industry</label>
                <select value={editForm.industry || ''} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md bg-input border border-border text-foreground px-3 text-sm">
                  <option value="" className="bg-background">Select</option>
                  {INDUSTRIES.map(i => <option key={i} value={i} className="bg-background">{i}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Website</label>
                <Input value={editForm.website || ''} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="mt-1 bg-input border-border text-foreground" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <Input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1 bg-input border-border text-foreground" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(editForm.skills || []).map(s => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground border border-border flex items-center gap-2">
                    {s}
                    <button onClick={() => removeSkill(s)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSkill} className="border-border">
                <Plus className="w-3 h-3 mr-1" /> Add Skill
              </Button>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 border-border text-foreground hover:bg-muted">Cancel</Button>
              <Button onClick={saveProfile} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================= USER PROFILE VIEW =======================
function UserProfileView() {
  const { selectedUserId, user, setView } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connStatus, setConnStatus] = useState(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectNote, setConnectNote] = useState('');

  useEffect(() => {
    if (selectedUserId) loadProfile();
  }, [selectedUserId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUserId}`, { credentials: 'include' });
      if (res.ok) setProfile(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const sendConnectionRequest = async () => {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: selectedUserId, note: connectNote }),
        credentials: 'include'
      });
      if (res.ok) {
        setConnStatus('pending');
        setShowConnectDialog(false);
        setConnectNote('');
      } else {
        const data = await res.json();
        if (data.error?.includes('already exists')) setConnStatus('exists');
      }
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_ids: [user.user_id, selectedUserId] }),
        credentials: 'include'
      });
      if (res.ok) {
        setView('messages');
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="pt-20 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mt-12" /></div>;
  if (!profile) return <div className="pt-20 text-center text-muted-foreground">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-4" onClick={() => setView('feed')}>&larr; Back</Button>
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-emerald-600/30"
          style={profile.cover_photo ? { backgroundImage: `url(${profile.cover_photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
        <CardContent className="relative pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
              <AvatarImage src={profile.picture} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-3xl">{profile.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${TIER_COLORS[profile.tier]}`}>{TIER_LABELS[profile.tier]}</span>
              </div>
              <p className="text-foreground/90 mt-1">{profile.headline}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.city}</span>}
                {profile.industry && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{profile.industry}</span>}
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{profile.connections_count || 0} connections</span>
              </div>
            </div>
            {profile.user_id !== user?.user_id && (
              <div className="flex gap-2">
                <Button onClick={sendMessage} variant="outline" className="rounded-full px-4 border-border">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
                <Button
                  onClick={() => setShowConnectDialog(true)}
                  disabled={connStatus === 'pending' || connStatus === 'exists'}
                  className={`rounded-full px-6 ${connStatus ? 'bg-muted' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                >
                  {connStatus === 'pending' ? 'Request Sent' : connStatus === 'exists' ? 'Connected' : <><UserPlus className="w-4 h-4 mr-2" /> Connect</>}
                </Button>
              </div>
            )}
          </div>
          {profile.summary && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">About</h2>
              <p className="text-sm text-foreground/90 leading-relaxed">{profile.summary}</p>
            </div>
          )}
          {profile.skills?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground border border-border">{s}</span>)}
              </div>
            </div>
          )}
          {profile.business_profile?.name && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-border">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-white">{profile.business_profile.name}</h3>
                  <p className="text-xs text-slate-400">{profile.business_profile.industry} {profile.business_profile.stage ? `• ${profile.business_profile.stage}` : ''}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Connect with {profile.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">Add a personalized note to your connection request</p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Your message (optional)</label>
              <textarea
                value={connectNote}
                onChange={(e) => setConnectNote(e.target.value)}
                placeholder={`Hi ${profile.name?.split(' ')[0]}, I'd like to connect with you...`}
                maxLength={300}
                rows={4}
                className="w-full bg-input border border-border rounded-md p-3 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-muted-foreground mt-1">{connectNote.length}/300 characters</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConnectDialog(false)} className="flex-1 border-border">
                Cancel
              </Button>
              <Button onClick={sendConnectionRequest} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================= NETWORK VIEW =======================
function NetworkView() {
  const { user, setView, setSelectedUserId } = useApp();
  const [tab, setTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [connRes, reqRes, sugRes] = await Promise.all([
        fetch('/api/connections', { credentials: 'include' }),
        fetch('/api/connections/requests', { credentials: 'include' }),
        fetch('/api/connections/suggestions', { credentials: 'include' }),
      ]);
      if (connRes.ok) { const d = await connRes.json(); setConnections(d.users || []); }
      if (reqRes.ok) { const d = await reqRes.json(); setRequests(d.requests || []); }
      if (sugRes.ok) { const d = await sugRes.json(); setSuggestions(d.suggestions || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const acceptRequest = async (connId) => {
    try {
      const res = await fetch(`/api/connections/${connId}/accept`, { method: 'PUT', credentials: 'include' });
      if (res.ok) { setRequests(prev => prev.filter(r => r.connection_id !== connId)); loadData(); }
    } catch (e) { console.error(e); }
  };

  const rejectRequest = async (connId) => {
    try {
      const res = await fetch(`/api/connections/${connId}/reject`, { method: 'PUT', credentials: 'include' });
      if (res.ok) setRequests(prev => prev.filter(r => r.connection_id !== connId));
    } catch (e) { console.error(e); }
  };

  const sendRequest = async (userId) => {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: userId }), credentials: 'include'
      });
      if (res.ok) setSuggestions(prev => prev.filter(s => s.user_id !== userId));
    } catch (e) { console.error(e); }
  };

  const UserCard = ({ u, actions }) => (
    <Card className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 cursor-pointer" onClick={() => { setSelectedUserId(u.user_id); setView('user-profile'); }}>
          <AvatarImage src={u.picture} />
          <AvatarFallback className="bg-white/10">{u.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate cursor-pointer hover:underline"
              onClick={() => { setSelectedUserId(u.user_id); setView('user-profile'); }}>{u.name}</span>
            {u.tier && <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TIER_COLORS[u.tier]}`}>{TIER_LABELS[u.tier]}</span>}
          </div>
          <p className="text-xs text-slate-500 truncate">{u.headline}</p>
          {u.city && <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{u.city}</p>}
        </div>
        {actions}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <h1 className="text-2xl font-bold text-white mb-6">My Network</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="connections" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            Requests {requests.length > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center">{requests.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          {loading ? <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div> :
            connections.length === 0 ? (
              <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-12 text-center">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No connections yet. Start networking!</p>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connections.map(u => <UserCard key={u.user_id} u={u} actions={
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white text-xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                } />)}
              </div>
            )}
        </TabsContent>

        <TabsContent value="requests">
          {requests.length === 0 ? (
            <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-12 text-center">
              <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No pending requests.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <UserCard key={r.connection_id} u={r.requester} actions={
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptRequest(r.connection_id)} className="bg-emerald-500 hover:bg-emerald-600 text-xs rounded-full h-8 px-4">
                      <Check className="w-3 h-3 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => rejectRequest(r.connection_id)} className="text-slate-500 hover:text-white text-xs h-8">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                } />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions">
          {suggestions.length === 0 ? (
            <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-12 text-center">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No suggestions available right now.</p>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map(s => (
                <UserCard key={s.user_id} u={s} actions={
                  <Button size="sm" onClick={() => sendRequest(s.user_id)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded-full h-8 px-4">
                    <UserPlus className="w-3 h-3 mr-1" /> Connect
                  </Button>
                } />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ======================= BUSINESS INDEX =======================
function BusinessIndexView() {
  const { setView, setSelectedUserId } = useApp();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCity, setFilterCity] = useState('');

  useEffect(() => { loadBusinesses(); }, []);

  const loadBusinesses = async (q = '', industry = '', city = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (industry) params.set('industry', industry);
      if (city) params.set('city', city);
      const res = await fetch(`/api/business?${params}`, { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setBusinesses(data.businesses || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSearch = () => loadBusinesses(search, filterIndustry, filterCity);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Business Index</h1>
        <p className="text-slate-400">Discover and connect with businesses across India.</p>
      </div>
      <Card className="bg-white/[0.03] border-white/5 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search businesses..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
            </div>
            <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); loadBusinesses(search, e.target.value, filterCity); }}
              className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
              <option value="" className="bg-slate-900">All Industries</option>
              {INDUSTRIES.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
            </select>
            <select value={filterCity} onChange={e => { setFilterCity(e.target.value); loadBusinesses(search, filterIndustry, e.target.value); }}
              className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
              <option value="" className="bg-slate-900">All Cities</option>
              {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
            </select>
            <Button onClick={handleSearch} className="bg-emerald-500 hover:bg-emerald-600">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : businesses.length === 0 ? (
        <Card className="bg-white/[0.03] border-white/5">
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg text-white mb-2">No businesses found</h3>
            <p className="text-sm text-slate-400">Be the first to add your business during onboarding or profile setup.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map(b => (
            <Card key={b.user_id} className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all hover:-translate-y-0.5 cursor-pointer"
              onClick={() => { setSelectedUserId(b.user_id); setView('user-profile'); }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{b.business_profile?.name}</h3>
                    <p className="text-xs text-slate-400">{b.business_profile?.industry}</p>
                  </div>
                  {b.business_profile?.stage && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{b.business_profile.stage}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  {b.business_profile?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.business_profile.city}</span>}
                  {b.business_profile?.team_size && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.business_profile.team_size}</span>}
                </div>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">{b.name} • {b.headline}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================= JOBS VIEW =======================
function JobsView() {
  const { user, setView, setSelectedUserId } = useApp();
  const [tab, setTab] = useState('browse');
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'full-time', work_mode: 'hybrid', description: '', skills: '', salary_min: '', salary_max: '', experience_level: 'mid' });
  const [applyDialog, setApplyDialog] = useState(null);
  const [coverNote, setCoverNote] = useState('');

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async (q = '', type = '', mode = '') => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      if (type) p.set('type', type);
      if (mode) p.set('work_mode', mode);
      const res = await fetch(`/api/jobs?${p}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setJobs(d.jobs || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadMyApps = async () => {
    try {
      const res = await fetch('/api/jobs/applications', { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setMyApps(d.applications || []); }
    } catch (e) { console.error(e); }
  };

  const createJob = async () => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...jobForm, skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean), salary_min: parseInt(jobForm.salary_min) || 0, salary_max: parseInt(jobForm.salary_max) || 0 }),
        credentials: 'include'
      });
      if (res.ok) { const j = await res.json(); setJobs(prev => [j, ...prev]); setShowCreate(false); setJobForm({ title: '', company: '', location: '', type: 'full-time', work_mode: 'hybrid', description: '', skills: '', salary_min: '', salary_max: '', experience_level: 'mid' }); }
    } catch (e) { console.error(e); }
  };

  const applyJob = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_note: coverNote }), credentials: 'include'
      });
      if (res.ok) { setApplyDialog(null); setCoverNote(''); setJobs(prev => prev.map(j => j.job_id === jobId ? { ...j, has_applied: true } : j)); }
    } catch (e) { console.error(e); }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return '';
    const fmt = n => n >= 100000 ? `${(n/100000).toFixed(1)}L` : `${(n/1000).toFixed(0)}K`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs & Opportunities</h1>
          <p className="text-slate-400 text-sm mt-1">Find your next role or hire top talent</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Post a Job
        </Button>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v); if (v === 'applications') loadMyApps(); }}>
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="browse" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">Browse Jobs</TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">My Applications</TabsTrigger>
          <TabsTrigger value="cofounder" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">Cofounder Board</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Card className="bg-white/[0.03] border-white/5 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadJobs(search, filterType, filterMode)}
                    placeholder="Search jobs..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
                </div>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); loadJobs(search, e.target.value, filterMode); }}
                  className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  <option value="" className="bg-slate-900">All Types</option>
                  {['full-time', 'part-time', 'contract', 'internship'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
                <select value={filterMode} onChange={e => { setFilterMode(e.target.value); loadJobs(search, filterType, e.target.value); }}
                  className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  <option value="" className="bg-slate-900">All Modes</option>
                  {['remote', 'onsite', 'hybrid'].map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
          {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div> :
            jobs.length === 0 ? (
              <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-16 text-center">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg text-white mb-2">No jobs found</h3>
                <p className="text-sm text-slate-400">Try adjusting your search or post a job.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {jobs.map(j => (
                  <Card key={j.job_id} className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white">{j.title}</h3>
                          <p className="text-sm text-slate-400">{j.company}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{j.type}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{j.work_mode}</span>
                            {j.location && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>}
                            {(j.salary_min || j.salary_max) ? <span className="text-xs text-emerald-400 font-medium">{formatSalary(j.salary_min, j.salary_max)}</span> : null}
                          </div>
                          {j.skills?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{j.skills.slice(0, 4).map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{s}</span>)}</div>}
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>{j.applications_count || 0} applicants</span>
                            <span>{j.created_at ? formatDistanceToNow(new Date(j.created_at), { addSuffix: true }) : ''}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {j.has_applied ? (
                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-700 text-slate-300">Applied</span>
                          ) : j.poster_id !== user?.user_id ? (
                            <Button size="sm" onClick={() => setApplyDialog(j)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full text-xs px-4">
                              Easy Apply
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value="applications">
          {myApps.length === 0 ? (
            <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-16 text-center">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No applications yet. Start applying!</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {myApps.map(a => (
                <Card key={a.application_id} className="bg-white/[0.03] border-white/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Briefcase className="w-8 h-8 text-blue-400" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{a.job?.title || 'Unknown Job'}</h3>
                      <p className="text-xs text-slate-400">{a.job?.company}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'applied' ? 'bg-blue-500/10 text-blue-400' : a.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{a.status}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cofounder"><CofounderBoard /></TabsContent>
      </Tabs>

      {/* Create Job Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Post a Job</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-slate-400">Job Title *</label>
              <Input value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Senior Full Stack Developer" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Company</label>
                <Input value={jobForm.company} onChange={e => setJobForm(f => ({ ...f, company: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" /></div>
              <div><label className="text-sm text-slate-400">Location</label>
                <select value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  <option value="" className="bg-slate-900">Select</option>{CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Type</label>
                <select value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  {['full-time', 'part-time', 'contract', 'internship'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div>
              <div><label className="text-sm text-slate-400">Work Mode</label>
                <select value={jobForm.work_mode} onChange={e => setJobForm(f => ({ ...f, work_mode: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  {['remote', 'onsite', 'hybrid'].map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}</select></div>
            </div>
            <div><label className="text-sm text-slate-400">Description</label>
              <textarea value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full min-h-[80px] bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            <div><label className="text-sm text-slate-400">Skills (comma separated)</label>
              <Input value={jobForm.skills} onChange={e => setJobForm(f => ({ ...f, skills: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="React, Node.js, TypeScript" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Min Salary (INR)</label>
                <Input type="number" value={jobForm.salary_min} onChange={e => setJobForm(f => ({ ...f, salary_min: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" /></div>
              <div><label className="text-sm text-slate-400">Max Salary (INR)</label>
                <Input type="number" value={jobForm.salary_max} onChange={e => setJobForm(f => ({ ...f, salary_max: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={createJob} disabled={!jobForm.title} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Post Job</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Apply Dialog */}
      <Dialog open={!!applyDialog} onOpenChange={() => setApplyDialog(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>Apply to {applyDialog?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-400">{applyDialog?.company} • {applyDialog?.location}</p>
            <div><label className="text-sm text-slate-400">Cover Note (optional)</label>
              <textarea value={coverNote} onChange={e => setCoverNote(e.target.value)} className="mt-1 w-full min-h-[80px] bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Why are you a great fit?" /></div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setApplyDialog(null)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={() => applyJob(applyDialog?.job_id)} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Submit Application</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================= COFOUNDER BOARD =======================
function CofounderBoard() {
  const { user, setView, setSelectedUserId } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', looking_for: 'tech', commitment: 'full-time', equity_range: '', location_pref: 'Any', stage: 'Idea' });

  useEffect(() => { loadPosts(); }, []);
  const loadPosts = async () => { setLoading(true); try { const r = await fetch('/api/cofounder', { credentials: 'include' }); if (r.ok) { const d = await r.json(); setPosts(d.posts || []); } } catch (e) {} setLoading(false); };

  const createPost = async () => {
    try { const r = await fetch('/api/cofounder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
      if (r.ok) { const p = await r.json(); setPosts(prev => [p, ...prev]); setShowCreate(false); }
    } catch (e) {}
  };

  const lookingForColors = { tech: 'text-blue-400 bg-blue-500/10', business: 'text-emerald-400 bg-emerald-500/10', design: 'text-purple-400 bg-purple-500/10', marketing: 'text-amber-400 bg-amber-500/10' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">Find your perfect cofounder</p>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-full text-xs"><Plus className="w-3 h-3 mr-1" /> Post</Button>
      </div>
      {loading ? <div className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div> :
        posts.length === 0 ? <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-12 text-center"><Rocket className="w-10 h-10 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No cofounder posts yet.</p></CardContent></Card> :
        <div className="space-y-3">{posts.map(p => (
          <Card key={p.post_id} className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 cursor-pointer" onClick={() => { setSelectedUserId(p.author?.user_id); setView('user-profile'); }}>
                  <AvatarImage src={p.author?.picture} /><AvatarFallback className="bg-emerald-500/20 text-emerald-400">{p.author?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-500">{p.author?.name} • {p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : ''}</p>
                  <p className="text-sm text-slate-300 mt-2">{p.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${lookingForColors[p.looking_for] || 'bg-white/5 text-slate-400'}`}>Looking for: {p.looking_for}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{p.commitment}</span>
                    {p.equity_range && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">Equity: {p.equity_range}</span>}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">Stage: {p.stage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}</div>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Looking for a Cofounder</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-slate-400">Title *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Looking for a CTO" /></div>
            <div><label className="text-sm text-slate-400">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full min-h-[80px] bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Looking For</label><select value={form.looking_for} onChange={e => setForm(f => ({ ...f, looking_for: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">{['tech', 'business', 'design', 'marketing'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div>
              <div><label className="text-sm text-slate-400">Commitment</label><select value={form.commitment} onChange={e => setForm(f => ({ ...f, commitment: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">{['full-time', 'part-time'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Equity Range</label><Input value={form.equity_range} onChange={e => setForm(f => ({ ...f, equity_range: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. 15-25%" /></div>
              <div><label className="text-sm text-slate-400">Stage</label><select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">{STAGES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}</select></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={createPost} disabled={!form.title} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================= MESSAGING VIEW =======================
function MessagingView() {
  const { user, setView, setSelectedUserId } = useApp();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/conversations', { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        setConversations(d.conversations || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setShowNewChat(false);
    try {
      const r = await fetch(`/api/conversations/${conv.conversation_id}/messages`, { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        setMessages(d.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !activeConv) return;
    const tempMsg = {
      message_id: Date.now(),
      sender_id: user.user_id,
      content: msgText,
      created_at: new Date()
    };
    setMessages(prev => [...prev, tempMsg]);
    const textToSend = msgText;
    setMsgText('');

    try {
      const r = await fetch(`/api/conversations/${activeConv.conversation_id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textToSend }),
        credentials: 'include'
      });
      if (r.ok) {
        const msg = await r.json();
        setMessages(prev => prev.map(m => m.message_id === tempMsg.message_id ? msg : m));
        setConversations(prev => prev.map(c => c.conversation_id === activeConv.conversation_id
          ? { ...c, last_message: { content: textToSend, sender_id: user.user_id, created_at: new Date() } } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const searchForUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }
    try {
      const r = await fetch(`/api/users?search=${encodeURIComponent(query)}`, { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        setSearchUsers(d.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewConversation = async (otherUser) => {
    try {
      const r = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_ids: [user.user_id, otherUser.user_id] }),
        credentials: 'include'
      });
      if (r.ok) {
        const conv = await r.json();
        setConversations(prev => [conv, ...prev]);
        openConversation(conv);
        setShowNewChat(false);
        setSearchQuery('');
        setSearchUsers([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <Button onClick={() => setShowNewChat(!showNewChat)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full">
          <Plus className="w-4 h-4 mr-2" /> New Chat
        </Button>
      </div>

      {showNewChat && (
        <Card className="mb-4 bg-card border-border">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Start a new conversation</h3>
            <Input
              placeholder="Search for people..."
              value={searchQuery}
              onChange={(e) => searchForUsers(e.target.value)}
              className="mb-3"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchUsers.map(u => (
                <button
                  key={u.user_id}
                  onClick={() => startNewConversation(u)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.picture} />
                    <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.headline || u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <Card className="md:col-span-4 bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="p-3 border-b border-border">
              <Input placeholder="Search messages..." className="bg-input border-border text-foreground placeholder:text-muted-foreground text-sm h-9" />
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Click "New Chat" to start</p>
                </div>
              ) : (
                conversations.map(c => (
                  <button
                    key={c.conversation_id}
                    onClick={() => openConversation(c)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors border-b border-border ${activeConv?.conversation_id === c.conversation_id ? 'bg-muted' : ''}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.other_user?.picture} />
                      <AvatarFallback className="bg-muted">{c.other_user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">{c.other_user?.name}</span>
                        {c.unread_count > 0 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.last_message?.content || 'Start a conversation'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-8 bg-card border-border overflow-hidden flex flex-col">
          {activeConv ? (
            <>
              <div className="p-3 border-b border-border flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeConv.other_user?.picture} />
                  <AvatarFallback className="bg-muted">{activeConv.other_user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{activeConv.other_user?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{activeConv.other_user?.headline}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  messages.map(m => (
                    <div key={m.message_id} className={`flex ${m.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.sender_id === user?.user_id ? 'bg-emerald-500 text-white rounded-br-md' : 'bg-card border border-border text-foreground rounded-bl-md'}`}>
                        <p>{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.sender_id === user?.user_id ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                          {m.created_at ? formatDistanceToNow(new Date(m.created_at), { addSuffix: true }) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground text-sm rounded-full"
                />
                <Button onClick={sendMessage} disabled={!msgText.trim()} className="bg-emerald-500 hover:bg-emerald-600 rounded-full" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
                <Button onClick={() => setShowNewChat(true)} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" /> Start New Chat
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ======================= COMMUNITIES VIEW =======================
function CommunitiesView() {
  const { user, setView, setSelectedUserId } = useApp();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [activeComm, setActiveComm] = useState(null);
  const [commPosts, setCommPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [form, setForm] = useState({ name: '', type: 'topic', description: '', industry: '', city: '' });

  useEffect(() => { loadCommunities(); }, []);

  const loadCommunities = async (q = '', type = '') => {
    setLoading(true);
    try { const p = new URLSearchParams(); if (q) p.set('q', q); if (type) p.set('type', type);
      const r = await fetch(`/api/communities?${p}`, { credentials: 'include' }); if (r.ok) { const d = await r.json(); setCommunities(d.communities || []); }
    } catch (e) {} setLoading(false);
  };

  const createCommunity = async () => {
    try { const r = await fetch('/api/communities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
      if (r.ok) { const c = await r.json(); setCommunities(prev => [{ ...c, is_member: true }, ...prev]); setShowCreate(false); }
    } catch (e) {}
  };

  const joinCommunity = async (commId) => {
    try { const r = await fetch(`/api/communities/${commId}/join`, { method: 'POST', credentials: 'include' });
      if (r.ok) setCommunities(prev => prev.map(c => c.community_id === commId ? { ...c, is_member: true, members_count: (c.members_count || 0) + 1 } : c));
    } catch (e) {}
  };

  const openCommunity = async (comm) => {
    setActiveComm(comm);
    try { const r = await fetch(`/api/communities/${comm.community_id}/posts`, { credentials: 'include' }); if (r.ok) { const d = await r.json(); setCommPosts(d.posts || []); } } catch (e) {}
  };

  const createCommPost = async () => {
    if (!newPost.trim() || !activeComm) return;
    try { const r = await fetch(`/api/communities/${activeComm.community_id}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newPost }), credentials: 'include' });
      if (r.ok) { const p = await r.json(); setCommPosts(prev => [p, ...prev]); setNewPost(''); }
    } catch (e) {}
  };

  const typeIcons = { industry: BarChart3, city: MapPin, topic: Sparkles, role: Users, alumni: GraduationCap, private: Shield };
  const typeColors = { industry: 'from-blue-500/20 to-blue-600/20', city: 'from-emerald-500/20 to-emerald-600/20', topic: 'from-purple-500/20 to-purple-600/20', role: 'from-amber-500/20 to-amber-600/20', alumni: 'from-rose-500/20 to-rose-600/20', private: 'from-slate-500/20 to-slate-600/20' };

  if (activeComm) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        <Button variant="ghost" className="text-slate-400 hover:text-white mb-4" onClick={() => setActiveComm(null)}>&larr; Back to Communities</Button>
        <Card className="bg-white/[0.03] border-white/5 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeColors[activeComm.type] || typeColors.topic} flex items-center justify-center`}>
                {(() => { const I = typeIcons[activeComm.type] || Sparkles; return <I className="w-7 h-7 text-white" />; })()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{activeComm.name}</h1>
                <p className="text-sm text-slate-400">{activeComm.members_count || 0} members • {activeComm.type}</p>
              </div>
            </div>
            {activeComm.description && <p className="text-sm text-slate-300 mt-3">{activeComm.description}</p>}
          </CardContent>
        </Card>
        {activeComm.is_member && (
          <Card className="bg-white/[0.03] border-white/5 mb-4">
            <CardContent className="p-4 flex gap-3">
              <Avatar className="h-8 w-8"><AvatarImage src={user?.picture} /><AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">{user?.name?.[0]}</AvatarFallback></Avatar>
              <div className="flex-1 flex gap-2">
                <Input value={newPost} onChange={e => setNewPost(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCommPost()} placeholder="Share something with the community..." className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-600 text-sm" />
                <Button onClick={createCommPost} disabled={!newPost.trim()} className="bg-emerald-500 hover:bg-emerald-600" size="sm">Post</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {commPosts.length === 0 ? <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-12 text-center"><p className="text-slate-400">No posts yet. Be the first to contribute!</p></CardContent></Card> :
          <div className="space-y-3">{commPosts.map(p => (
            <Card key={p.post_id} className="bg-white/[0.03] border-white/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8"><AvatarImage src={p.author?.picture} /><AvatarFallback className="bg-white/10 text-xs">{p.author?.name?.[0]}</AvatarFallback></Avatar>
                  <div><span className="text-sm font-medium text-white">{p.author?.name}</span><span className="text-xs text-slate-500 ml-2">{p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : ''}</span><p className="text-sm text-slate-300 mt-1">{p.content}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-white">Communities</h1><p className="text-slate-400 text-sm mt-1">Join circles, connect locally, grow together</p></div>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full"><Plus className="w-4 h-4 mr-2" /> Create</Button>
      </div>
      <Card className="bg-white/[0.03] border-white/5 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadCommunities(search, filterType)} placeholder="Search communities..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600" /></div>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); loadCommunities(search, e.target.value); }} className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
              <option value="" className="bg-slate-900">All Types</option>{['industry', 'city', 'topic', 'role', 'alumni', 'private'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select>
          </div>
        </CardContent>
      </Card>
      {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div> :
        communities.length === 0 ? <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-16 text-center"><Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" /><h3 className="text-lg text-white mb-2">No communities found</h3></CardContent></Card> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{communities.map(c => {
          const TypeIcon = typeIcons[c.type] || Sparkles;
          return (
            <Card key={c.community_id} className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => openCommunity(c)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[c.type] || typeColors.topic} flex items-center justify-center flex-shrink-0`}><TypeIcon className="w-6 h-6 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.type} • {c.members_count || 0} members</p>
                  </div>
                  {!c.is_member ? <Button size="sm" onClick={e => { e.stopPropagation(); joinCommunity(c.community_id); }} className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs rounded-full h-7 px-3">Join</Button>
                    : <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Joined</span>}
                </div>
                {c.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{c.description}</p>}
              </CardContent>
            </Card>
          );
        })}</div>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Create Community</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-slate-400">Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. SaaS India" /></div>
            <div><label className="text-sm text-slate-400">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">{['industry', 'city', 'topic', 'role', 'alumni', 'private'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div>
            <div><label className="text-sm text-slate-400">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full min-h-[60px] bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm resize-none" /></div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={createCommunity} disabled={!form.name} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================= EVENTS VIEW =======================
function EventsView() {
  const { user } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'meetup', format: 'physical', date: '', location: '', venue: '', virtual_link: '', capacity: 100, price: 0 });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async (q = '', type = '') => {
    setLoading(true);
    try { const p = new URLSearchParams(); if (q) p.set('q', q); if (type) p.set('type', type);
      const r = await fetch(`/api/events?${p}`, { credentials: 'include' }); if (r.ok) { const d = await r.json(); setEvents(d.events || []); }
    } catch (e) {} setLoading(false);
  };

  const createEvent = async () => {
    try { const r = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' });
      if (r.ok) { const e = await r.json(); setEvents(prev => [e, ...prev]); setShowCreate(false); }
    } catch (e) {}
  };

  const rsvpEvent = async (eventId) => {
    try { const r = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'going' }), credentials: 'include' });
      if (r.ok) { const d = await r.json(); setEvents(prev => prev.map(e => e.event_id === eventId ? { ...e, user_rsvp: d.action === 'removed' ? null : 'going', attendees_count: d.action === 'removed' ? (e.attendees_count || 1) - 1 : (e.attendees_count || 0) + 1 } : e)); }
    } catch (e) {}
  };

  const eventTypeIcons = { meetup: Users, conference: Crown, workshop: GraduationCap, webinar: Globe, demo_day: Rocket };
  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-white">Events</h1><p className="text-slate-400 text-sm mt-1">Discover meetups, conferences, and workshops</p></div>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full"><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
      </div>
      <Card className="bg-white/[0.03] border-white/5 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadEvents(search, filterType)} placeholder="Search events..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600" /></div>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); loadEvents(search, e.target.value); }} className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
              <option value="" className="bg-slate-900">All Types</option>{['meetup', 'conference', 'workshop', 'webinar', 'demo_day'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select>
          </div>
        </CardContent>
      </Card>
      {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div> :
        events.length === 0 ? <Card className="bg-white/[0.03] border-white/5"><CardContent className="py-16 text-center"><Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" /><h3 className="text-lg text-white mb-2">No events found</h3></CardContent></Card> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{events.map(e => {
          const EIcon = eventTypeIcons[e.type] || Users;
          return (
            <Card key={e.event_id} className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500" />
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex flex-col items-center justify-center flex-shrink-0">
                    {e.date ? <><span className="text-[10px] text-slate-400 uppercase">{new Date(e.date).toLocaleDateString('en', { month: 'short' })}</span><span className="text-lg font-bold text-white leading-none">{new Date(e.date).getDate()}</span></> : <EIcon className="w-6 h-6 text-emerald-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{e.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{e.type?.replace('_', ' ')}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{e.format}</span>
                      {e.price > 0 && <span className="text-xs text-amber-400">&#8377;{e.price}</span>}
                      {e.price === 0 && <span className="text-xs text-emerald-400">Free</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      {e.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(e.date)}</span>}
                      {e.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-500">{e.attendees_count || 0} / {e.capacity} attending</span>
                      <Button size="sm" onClick={() => rsvpEvent(e.event_id)}
                        className={`rounded-full text-xs h-7 px-4 ${e.user_rsvp ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
                        {e.user_rsvp ? <><Check className="w-3 h-3 mr-1" /> Going</> : 'RSVP'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}</div>}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-sm text-slate-400">Title *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" placeholder="e.g. Delhi Founder Night" /></div>
            <div><label className="text-sm text-slate-400">Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full min-h-[60px] bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Type</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">{['meetup', 'conference', 'workshop', 'webinar', 'demo_day'].map(t => <option key={t} value={t} className="bg-slate-900">{t.replace('_', ' ')}</option>)}</select></div>
              <div><label className="text-sm text-slate-400">Format</label><select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">{['physical', 'virtual', 'hybrid'].map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Date</label><Input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1 bg-white/5 border-white/10 text-white" /></div>
              <div><label className="text-sm text-slate-400">Location</label><select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm"><option value="" className="bg-slate-900">Select</option>{['Online', ...CITIES].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-slate-400">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 100 }))} className="mt-1 bg-white/5 border-white/10 text-white" /></div>
              <div><label className="text-sm text-slate-400">Price (INR, 0=free)</label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} className="mt-1 bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
              <Button onClick={createEvent} disabled={!form.title} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Create Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ======================= CEO INDEX =======================
function CEOIndexView() {
  const { setView, setSelectedUserId } = useApp();
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  useEffect(() => { loadExecutives(); }, []);

  const loadExecutives = async (q = '', industry = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (industry) params.set('industry', industry);
      const res = await fetch(`/api/ceo?${params}`, { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setExecutives(data.executives || []); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">CEO Index</h1>
        <p className="text-slate-400">Discover top executives, founders, and business leaders across India.</p>
      </div>
      <Card className="bg-white/[0.03] border-white/5 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadExecutives(search, filterIndustry)}
                placeholder="Search executives..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
            </div>
            <select value={filterIndustry} onChange={e => { setFilterIndustry(e.target.value); loadExecutives(search, e.target.value); }}
              className="h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
              <option value="" className="bg-slate-900">All Industries</option>
              {INDUSTRIES.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
            </select>
            <Button onClick={() => loadExecutives(search, filterIndustry)} className="bg-emerald-500 hover:bg-emerald-600">
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : executives.length === 0 ? (
        <Card className="bg-white/[0.03] border-white/5">
          <CardContent className="py-16 text-center">
            <Crown className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg text-white mb-2">No executives listed yet</h3>
            <p className="text-sm text-slate-400">Executive profiles will appear here as CEOs and CXOs join the platform.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {executives.map(e => (
            <Card key={e.user_id} className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all hover:-translate-y-0.5 cursor-pointer"
              onClick={() => { setSelectedUserId(e.user_id); setView('user-profile'); }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={e.picture} />
                    <AvatarFallback className="bg-amber-500/20 text-amber-400">{e.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{e.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TIER_COLORS[e.tier]}`}>{TIER_LABELS[e.tier]}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{e.headline}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      {e.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.city}</span>}
                      {e.industry && <span>{e.industry}</span>}
                    </div>
                  </div>
                </div>
                {e.business_profile?.name && (
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">{e.business_profile.name}</span>
                    {e.business_profile.stage && <span className="text-[10px] text-slate-500">• {e.business_profile.stage}</span>}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{e.connections_count || 0}</div>
                    <div className="text-[10px] text-slate-500">Connections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-emerald-400">{e.influence_score || 0}</div>
                    <div className="text-[10px] text-slate-500">Influence</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================= MAIN APP =======================
// ======================= ADMIN PANEL =======================
function AdminPanelView() {
  const { user } = useApp();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab === 'stats') loadStats();
    else if (tab === 'users') loadUsers();
    else if (tab === 'posts') loadPosts();
  }, [tab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${search}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/posts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (e) { console.error(e); }
  };

  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) loadPosts();
    } catch (e) { console.error(e); }
  };

  if (!user?.email?.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-card border-border p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Admin Panel</h1>
      
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <Card key={key} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-foreground">{value}</div>
                    <div className="text-sm text-muted-foreground capitalize">{key}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              className="max-w-md"
            />
          </div>
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <Card key={u.user_id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.picture} />
                        <AvatarFallback>{u.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                        <div className="text-xs text-muted-foreground">Tier: {u.tier} | Status: {u.status || 'active'}</div>
                      </div>
                    </div>
                    <Button
                      variant={u.status === 'suspended' ? 'default' : 'destructive'}
                      size="sm"
                      onClick={() => toggleUserStatus(u.user_id, u.status)}
                    >
                      {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts">
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <div className="space-y-2">
              {posts.map(p => (
                <Card key={p.post_id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p.author?.picture} />
                            <AvatarFallback>{p.author?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium text-foreground">{p.author?.name}</div>
                        </div>
                        <p className="text-sm text-foreground/90">{p.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-500"
                        onClick={() => deletePost(p.post_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [theme, setTheme] = useState('dark');
  const hasProcessed = useRef(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (window.location.hash?.includes('session_id=')) {
      if (hasProcessed.current) return;
      hasProcessed.current = true;
      processAuthCallback();
      return;
    }
    checkAuth();
  }, []);

  const processAuthCallback = async () => {
    const hash = window.location.hash;
    const sessionId = hash.split('session_id=')[1]?.split('&')[0];
    if (!sessionId) { setView('landing'); return; }
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }), credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        window.history.replaceState(null, '', window.location.pathname);
        setView(data.is_new || !data.user.onboarding_complete ? 'onboarding' : 'feed');
      } else { setView('landing'); }
    } catch (e) { console.error(e); setView('landing'); }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setView(data.onboarding_complete ? 'feed' : 'onboarding');
      } else { setView('landing'); }
    } catch { setView('landing'); }
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleSignIn = () => {
    const redirectUrl = window.location.origin;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { console.error(e); }
    setUser(null);
    setView('landing');
  };

  const contextValue = { user, setUser, view, setView, selectedUserId, setSelectedUserId, handleSignIn, handleLogout, theme, toggleTheme };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-12 mx-auto mb-4 animate-pulse" />
          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {view === 'landing' && <LandingPage />}
      {view === 'onboarding' && <OnboardingView />}
      {['feed', 'profile', 'network', 'business', 'ceo', 'user-profile', 'jobs', 'messages', 'communities', 'events', 'admin'].includes(view) && (
        <div className="min-h-screen bg-background">
          <TopBar />
          {view === 'feed' && <FeedView />}
          {view === 'profile' && <ProfileView />}
          {view === 'network' && <NetworkView />}
          {view === 'business' && <BusinessIndexView />}
          {view === 'ceo' && <CEOIndexView />}
          {view === 'user-profile' && <UserProfileView />}
          {view === 'jobs' && <JobsView />}
          {view === 'messages' && <MessagingView />}
          {view === 'communities' && <CommunitiesView />}
          {view === 'events' && <EventsView />}
          {view === 'admin' && <AdminPanelView />}
        </div>
      )}
    </AppContext.Provider>
  );
}
