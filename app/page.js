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
  Edit, Zap, Target, BarChart3, Menu, ChevronDown, Heart, Award, Eye
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

// ======================= LANDING PAGE =======================
function LandingPage() {
  const { handleSignIn } = useApp();
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
    <div className="min-h-screen bg-[hsl(222,47%,5%)]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(222,47%,5%)]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-8 md:h-10" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-300 hover:text-white hidden md:inline-flex" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</Button>
            <Button variant="ghost" className="text-slate-300 hover:text-white hidden md:inline-flex" onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}>Plans</Button>
            <Button onClick={handleSignIn} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">Join Free</Button>
          </div>
        </div>
      </nav>

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
            <span className="text-white">LinkedIn is where you </span>
            <span className="text-slate-400">exist.</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              RoamingCEO is where you
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">do business.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            From graduates to CEOs, from freelancers to investors. One platform for networking, business discovery, hiring, investment, and growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button onClick={handleSignIn} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/25">
              Join Free with Google <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-white/5 rounded-full px-10 py-6 text-lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            {[{ n: '10,000+', l: 'Professionals' }, { n: '2,500+', l: 'Companies' }, { n: '500+', l: 'Investors' }, { n: '15+', l: 'Cities' }].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{s.n}</div>
                <div className="text-sm text-slate-500">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Built for the Indian Business Ecosystem</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Every feature is a deliberate decision to serve professionals better than anyone has before.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-16">Why Not LinkedIn?</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 px-4 pb-4">
              <div className="text-sm font-medium text-slate-500">Feature</div>
              <div className="text-sm font-medium text-slate-500 text-center">LinkedIn</div>
              <div className="text-sm font-medium text-emerald-400 text-center">RoamingCEO</div>
            </div>
            {comparisons.map(c => (
              <div key={c.feature} className="grid grid-cols-3 gap-4 px-4 py-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="text-white font-medium text-sm">{c.feature}</div>
                <div className="text-slate-500 text-sm text-center">{c.linkedin}</div>
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
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">One Platform, Four Identities</h2>
            <p className="text-slate-400 text-lg">All tiers are free at launch. Premium features unlock deeper capabilities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map(t => (
              <Card key={t.name} className={`bg-gradient-to-b ${t.bg} border-t-2 ${t.color} border-x-white/5 border-b-white/5 hover:-translate-y-1 transition-all duration-300`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center`}>
                      <t.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{t.name}</h3>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                  </div>
                  <Separator className="my-4 bg-white/10" />
                  <ul className="space-y-2">
                    {t.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
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
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Do Business?</h2>
              <p className="text-slate-400 text-lg mb-8">Join thousands of professionals building real business connections.</p>
              <Button onClick={handleSignIn} size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-12 py-6 text-lg font-semibold shadow-lg shadow-emerald-500/25">
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
    <div className="min-h-screen bg-[hsl(222,47%,5%)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-400 mt-1">Let&apos;s set up your profile</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, ...(needsBiz ? [3] : [])].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-10 bg-emerald-500' : s < step ? 'w-10 bg-emerald-500/50' : 'w-10 bg-slate-800'}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-white text-center mb-6">What describes you best?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map(role => (
                <button key={role.id} onClick={() => setSelectedRole(role)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${selectedRole?.id === role.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedRole?.id === role.id ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                    <role.icon className={`w-5 h-5 ${selectedRole?.id === role.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <div className="font-medium text-white">{role.label}</div>
                    <div className="text-sm text-slate-400">{role.desc}</div>
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
            <h2 className="text-xl font-semibold text-white text-center mb-6">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Professional Headline</label>
                <Input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                  placeholder="e.g. CEO at TechCorp | Building the future of fintech"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">City</label>
                  <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                    <option value="" className="bg-slate-900">Select city</option>
                    {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Industry</label>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                    <option value="" className="bg-slate-900">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-full py-6">Back</Button>
              <Button onClick={() => needsBiz ? setStep(3) : handleComplete()} disabled={!form.headline || loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-full py-6">
                {loading ? 'Setting up...' : needsBiz ? 'Continue' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && needsBiz && (
          <div className="space-y-4 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-white text-center mb-6">Your Business</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Company / Business Name</label>
                <Input value={bizForm.name} onChange={e => setBizForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. TechCorp India" className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Industry</label>
                  <select value={bizForm.industry} onChange={e => setBizForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                    <option value="" className="bg-slate-900">Select</option>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Stage</label>
                  <select value={bizForm.stage} onChange={e => setBizForm(f => ({ ...f, stage: e.target.value }))}
                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                    <option value="" className="bg-slate-900">Select</option>
                    {STAGES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">City</label>
                  <select value={bizForm.city} onChange={e => setBizForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                    <option value="" className="bg-slate-900">Select</option>
                    {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Website</label>
                  <Input value={bizForm.website} onChange={e => setBizForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-white/10 text-white hover:bg-white/5 rounded-full py-6">Back</Button>
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
  const { user, view, setView, handleLogout } = useApp();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'network', label: 'Network', icon: Users },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'ceo', label: 'CEO Index', icon: Crown },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[hsl(222,47%,5%)]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="RoamingCEO" className="h-7 cursor-pointer" onClick={() => setView('feed')} />
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input className="pl-9 w-56 lg:w-72 h-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-sm rounded-full" placeholder="Search..." />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex flex-col items-center px-4 py-1.5 rounded-lg transition-colors ${view === item.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white h-9 w-9">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white h-9 w-9">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-1 px-2 py-1 rounded-full hover:bg-white/5 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3 text-slate-500 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-white/10 text-white min-w-[200px]" align="end">
              <div className="px-3 py-2">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.headline || user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => setView('profile')} className="cursor-pointer hover:bg-white/5 text-slate-300">
                <Edit className="w-4 h-4 mr-2" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-white/5 text-red-400">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="md:hidden text-slate-500 h-9 w-9" onClick={() => setMobileMenu(!mobileMenu)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {mobileMenu && (
        <div className="md:hidden border-t border-white/5 bg-[hsl(222,47%,5%)] px-4 py-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setMobileMenu(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${view === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
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
    <Card className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-colors overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={() => { setSelectedUserId(post.author?.user_id); setView('user-profile'); }}>
            <AvatarImage src={post.author?.picture} />
            <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{post.author?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm cursor-pointer hover:underline"
                onClick={() => { setSelectedUserId(post.author?.user_id); setView('user-profile'); }}>
                {post.author?.name}
              </span>
              {post.author?.tier && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${TIER_COLORS[post.author.tier]}`}>
                  {TIER_LABELS[post.author.tier]}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{post.author?.headline}</p>
            <p className="text-[11px] text-slate-600">{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ''}</p>
          </div>
          {post.user_id === user?.user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-white/10">
                <DropdownMenuItem className="text-red-400 cursor-pointer">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="mt-3 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map(h => <span key={h} className="text-xs text-blue-400 hover:underline cursor-pointer">#{h}</span>)}
          </div>
        )}
        {totalReactions > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
            <span className="flex -space-x-1">{REACTIONS.filter(r => post.reactions?.[r.type] > 0).slice(0, 3).map(r => <span key={r.type}>{r.emoji}</span>)}</span>
            <span>{totalReactions}</span>
          </div>
        )}
        <Separator className="my-3 bg-white/5" />
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button variant="ghost" size="sm"
                className={`text-xs gap-1.5 h-8 ${post.user_reaction ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                onClick={() => onReact(post.post_id, post.user_reaction || 'like')}
                onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                <ThumbsUp className="w-3.5 h-3.5" />
                {post.user_reaction ? REACTIONS.find(r => r.type === post.user_reaction)?.label : 'Like'}
              </Button>
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-1 flex gap-1 bg-slate-800 border border-white/10 rounded-full px-2 py-1 shadow-xl z-10"
                  onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {REACTIONS.map(r => (
                    <button key={r.type} onClick={() => { onReact(post.post_id, r.type); setShowReactions(false); }}
                      className="hover:scale-125 transition-transform text-lg" title={r.label}>{r.emoji}</button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-slate-500 hover:text-white" onClick={loadComments}>
              <MessageCircle className="w-3.5 h-3.5" /> {post.comments_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8 text-slate-500 hover:text-white">
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8 text-slate-500 hover:text-white">
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
                  placeholder="Write a comment..." className="flex-1 h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-full" />
                <Button size="icon" onClick={addComment} disabled={!commentText.trim()} className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 rounded-full">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {loadingComments ? <p className="text-xs text-slate-500 text-center">Loading...</p> :
              comments.map(c => (
                <div key={c.comment_id} className="flex gap-2 ml-9">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={c.author?.picture} />
                    <AvatarFallback className="bg-white/10 text-xs">{c.author?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-white/5 rounded-xl px-3 py-2 flex-1">
                    <span className="text-xs font-medium text-white">{c.author?.name}</span>
                    <p className="text-xs text-slate-300">{c.content}</p>
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
          <Card className="bg-white/[0.03] border-white/5 overflow-hidden sticky top-20">
            <div className="h-16 bg-gradient-to-r from-emerald-600/30 to-blue-600/30" />
            <CardContent className="pt-0 -mt-8 text-center">
              <Avatar className="h-16 w-16 mx-auto border-2 border-[hsl(222,47%,5%)]">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <h3 className="text-sm font-semibold text-white mt-2">{user?.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user?.headline || 'Add your headline'}</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border mt-2 ${TIER_COLORS[user?.tier || 'professional']}`}>
                {TIER_LABELS[user?.tier || 'professional']}
              </span>
              <Separator className="my-3 bg-white/5" />
              <div className="flex justify-between text-xs">
                <div><span className="text-white font-medium">{user?.connections_count || 0}</span><br /><span className="text-slate-500">Connections</span></div>
                <div><span className="text-white font-medium">{user?.followers_count || 0}</span><br /><span className="text-slate-500">Followers</span></div>
                <div><span className="text-white font-medium">{user?.influence_score || 0}</span><br /><span className="text-slate-500">Influence</span></div>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-xs text-slate-400 hover:text-white" onClick={() => setView('profile')}>
                View Profile <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center - Feed */}
        <div className="lg:col-span-6 space-y-4">
          {/* Create Post */}
          <Card className="bg-white/[0.03] border-white/5">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea value={postContent} onChange={e => setPostContent(e.target.value)}
                    placeholder="Share an insight, ask a question, or post an update..."
                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 resize-none min-h-[60px]"
                    rows={2} />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-600">{postContent.length}/3000</span>
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
            <Card className="bg-white/[0.03] border-white/5">
              <CardContent className="py-16 text-center">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Welcome to RoamingCEO!</h3>
                <p className="text-sm text-slate-400">Be the first to share something. Your network is waiting.</p>
              </CardContent>
            </Card>
          ) : (
            posts.map(post => <PostCard key={post.post_id} post={post} onReact={handleReact} />)
          )}
        </div>

        {/* Right Sidebar - Suggestions */}
        <div className="hidden lg:block lg:col-span-3">
          {suggestions.length > 0 && (
            <Card className="bg-white/[0.03] border-white/5 sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-400 font-medium">People you may know</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map(s => (
                  <div key={s.user_id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 cursor-pointer" onClick={() => { setSelectedUserId(s.user_id); setView('user-profile'); }}>
                      <AvatarImage src={s.picture} />
                      <AvatarFallback className="bg-white/10 text-xs">{s.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate cursor-pointer hover:underline"
                        onClick={() => { setSelectedUserId(s.user_id); setView('user-profile'); }}>{s.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{s.headline || s.city}</p>
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

  const startEdit = () => {
    setEditForm({
      name: user?.name || '', headline: user?.headline || '', summary: user?.summary || '',
      city: user?.city || '', industry: user?.industry || '',
    });
    setEditing(true);
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

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
        <div className="h-32 md:h-48 bg-gradient-to-r from-emerald-600/30 via-blue-600/20 to-purple-600/30 relative">
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-white/50 hover:text-white bg-black/20 h-8 w-8" onClick={startEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        <CardContent className="relative pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-[hsl(222,47%,5%)]">
              <AvatarImage src={user.picture} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-3xl">{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${TIER_COLORS[user.tier]}`}>
                  {TIER_LABELS[user.tier]}
                </span>
              </div>
              <p className="text-slate-300 mt-1">{user.headline || 'Add your professional headline'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                {user.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.city}</span>}
                {user.industry && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{user.industry}</span>}
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{user.connections_count || 0} connections</span>
              </div>
            </div>
            <Button onClick={startEdit} className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-6">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>

          {/* Profile Completion */}
          {user.profile_completion < 80 && (
            <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">Profile Strength</span>
                <span className="text-sm text-emerald-400">{user.profile_completion}%</span>
              </div>
              <Progress value={user.profile_completion} className="h-2 bg-white/10" />
              <p className="text-xs text-slate-500 mt-2">Complete your profile to rank higher in search and recommendations.</p>
            </div>
          )}

          {/* About */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-2">About</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{user.summary || 'Tell your story. Share what drives you professionally.'}</p>
          </div>

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(s => (
                  <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Business Profile */}
          {user.business_profile?.name && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{user.business_profile.name}</h3>
                  <p className="text-xs text-slate-400">{user.business_profile.industry} {user.business_profile.stage ? `• ${user.business_profile.stage}` : ''}</p>
                </div>
              </div>
              {user.business_profile.about && <p className="text-sm text-slate-300">{user.business_profile.about}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
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
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <Input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1 bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="text-sm text-slate-400">Headline</label>
              <Input value={editForm.headline || ''} onChange={e => setEditForm(f => ({ ...f, headline: e.target.value }))}
                className="mt-1 bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <label className="text-sm text-slate-400">Summary</label>
              <textarea value={editForm.summary || ''} onChange={e => setEditForm(f => ({ ...f, summary: e.target.value }))}
                className="mt-1 w-full min-h-[100px] bg-white/5 border border-white/10 rounded-md p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tell your professional story..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">City</label>
                <select value={editForm.city || ''} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  <option value="" className="bg-slate-900">Select</option>
                  {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Industry</label>
                <select value={editForm.industry || ''} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))}
                  className="mt-1 w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 text-sm">
                  <option value="" className="bg-slate-900">Select</option>
                  {INDUSTRIES.map(i => <option key={i} value={i} className="bg-slate-900">{i}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">Cancel</Button>
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

  const connect = async () => {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_id: selectedUserId }), credentials: 'include'
      });
      if (res.ok) setConnStatus('pending');
      else { const data = await res.json(); if (data.error?.includes('already exists')) setConnStatus('exists'); }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="pt-20 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mt-12" /></div>;
  if (!profile) return <div className="pt-20 text-center text-slate-400">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
      <Button variant="ghost" className="text-slate-400 hover:text-white mb-4" onClick={() => setView('feed')}>&larr; Back</Button>
      <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600/30 via-purple-600/20 to-emerald-600/30" />
        <CardContent className="relative pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-[hsl(222,47%,5%)]">
              <AvatarImage src={profile.picture} />
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-3xl">{profile.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${TIER_COLORS[profile.tier]}`}>{TIER_LABELS[profile.tier]}</span>
              </div>
              <p className="text-slate-300 mt-1">{profile.headline}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                {profile.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.city}</span>}
                {profile.industry && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{profile.industry}</span>}
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{profile.connections_count || 0} connections</span>
              </div>
            </div>
            {profile.user_id !== user?.user_id && (
              <Button onClick={connect} disabled={connStatus === 'pending' || connStatus === 'exists'}
                className={`rounded-full px-6 ${connStatus ? 'bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                {connStatus === 'pending' ? 'Request Sent' : connStatus === 'exists' ? 'Connected' : <><UserPlus className="w-4 h-4 mr-2" /> Connect</>}
              </Button>
            )}
          </div>
          {profile.summary && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-2">About</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{profile.summary}</p>
            </div>
          )}
          {profile.skills?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => <span key={s} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-300 border border-white/10">{s}</span>)}
              </div>
            </div>
          )}
          {profile.business_profile?.name && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-blue-500/5 border border-white/5">
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
export default function App() {
  const [view, setView] = useState('loading');
  const [user, setUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const hasProcessed = useRef(false);

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

  const contextValue = { user, setUser, view, setView, selectedUserId, setSelectedUserId, handleSignIn, handleLogout };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,5%)] flex items-center justify-center">
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
      {['feed', 'profile', 'network', 'business', 'ceo', 'user-profile'].includes(view) && (
        <div className="min-h-screen bg-[hsl(222,47%,5%)]">
          <TopBar />
          {view === 'feed' && <FeedView />}
          {view === 'profile' && <ProfileView />}
          {view === 'network' && <NetworkView />}
          {view === 'business' && <BusinessIndexView />}
          {view === 'ceo' && <CEOIndexView />}
          {view === 'user-profile' && <UserProfileView />}
        </div>
      )}
    </AppContext.Provider>
  );
}
