// frontend/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SocialHub AI - Instagram & Facebook Automation',
  description: 'Automate your Instagram DMs and Facebook Messenger with AI-powered replies',
  keywords: ['instagram', 'facebook', 'automation', 'ai', 'saas'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://socialhubai.com',
    siteName: 'SocialHub AI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// ============================================================================

// frontend/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, BarChart3, Users, MessageCircle, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">SocialHub AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-slate-700">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Automate Your Social Media
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              with AI Intelligence
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Manage Instagram DMs, Facebook Messages, and comments from one unified inbox. 
            AI-powered replies that match your brand voice. Scale without losing authenticity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg h-12">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-slate-600 hover:bg-slate-700 text-lg h-12"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Powerful Features for Growing Businesses
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: 'Unified Inbox',
                description: 'Manage all Instagram DMs and Facebook messages in one place'
              },
              {
                icon: Sparkles,
                title: 'AI Replies',
                description: 'Generate intelligent replies that match your brand voice'
              },
              {
                icon: Zap,
                title: 'Automation Flows',
                description: 'Build complex automation without coding with our visual builder'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Track engagement, conversation metrics, and campaign performance'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Assign conversations and manage team permissions'
              },
              {
                icon: Zap,
                title: 'Lead Generation',
                description: 'Capture and qualify leads automatically from conversations'
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="p-8 rounded-xl bg-slate-700/30 border border-slate-600/50 hover:border-blue-500/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Simple, Transparent Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$0',
                features: ['1 account', '100 messages/month', 'Basic automation']
              },
              {
                name: 'Pro',
                price: '$99',
                featured: true,
                features: ['5 accounts', '10k messages/month', 'Advanced automation', 'AI replies', 'Analytics']
              },
              {
                name: 'Agency',
                price: '$499',
                features: ['25 accounts', 'Unlimited messages', 'Team management', 'Custom integrations']
              },
            ].map((plan, i) => (
              <div 
                key={i}
                className={`p-8 rounded-xl border transition-all ${
                  plan.featured 
                    ? 'bg-blue-600/20 border-blue-500 scale-105' 
                    : 'bg-slate-700/30 border-slate-600/50'
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold text-white mb-6">{plan.price}<span className="text-lg text-slate-400">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your social media?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of businesses automating their Instagram and Facebook with AI
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg h-12">
              Start Your Free Trial Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">SocialHub AI</h3>
              <p className="text-slate-400">Automate social media with AI</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition">GDPR</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 pt-8 text-center text-slate-400">
            <p>&copy; 2024 SocialHub AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================

// frontend/app/dashboard/layout.tsx
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================================================

// frontend/app/dashboard/page.tsx
'use client';

import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { AnalyticsChart } from '@/components/dashboard/analytics-chart';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import { ConnectedAccountsWidget } from '@/components/dashboard/connected-accounts-widget';
import { MessageCircle, MessageSquare, Send, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      label: 'Total Messages',
      value: '2,458',
      icon: MessageCircle,
      trend: '+12%',
      color: 'blue'
    },
    {
      label: 'Total Comments',
      value: '892',
      icon: MessageSquare,
      trend: '+8%',
      color: 'purple'
    },
    {
      label: 'Auto Replies Sent',
      value: '1,247',
      icon: Send,
      trend: '+23%',
      color: 'green'
    },
    {
      label: 'Engagement Rate',
      value: '24.5%',
      icon: TrendingUp,
      trend: '+3.2%',
      color: 'orange'
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
        <p className="text-slate-400">Here's what's happening with your accounts today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <DashboardCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>

        {/* Connected Accounts */}
        <ConnectedAccountsWidget />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed />
    </div>
  );
}
