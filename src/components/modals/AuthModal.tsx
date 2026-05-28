'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useUIStore } from '@/lib/store';

const socialProviders = [
  { id: 'google', name: 'Google', icon: '🔴', color: 'bg-white border-gray-300' },
  { id: 'microsoft', name: 'Microsoft', icon: '🔵', color: 'bg-white border-gray-300' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: 'bg-white border-gray-300' },
  { id: 'github', name: 'GitHub', icon: '🐙', color: 'bg-gray-900 text-white border-gray-700' },
  { id: 'apple', name: 'Apple', icon: '🍎', color: 'bg-black text-white border-gray-800' },
  { id: 'email', name: 'Email', icon: '📧', color: 'bg-white border-gray-300' },
];

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen } = useUIStore();

  return (
    <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Sign in / Sign up</h2>
            <p className="text-sm text-gray-600">
              Hesabınıza erişin veya yeni hesap oluşturun
            </p>
          </div>

          <div className="space-y-3">
            {socialProviders.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className={`w-full justify-start gap-3 h-12 ${provider.color}`}
              >
                <span className="text-lg">{provider.icon}</span>
                <span>{provider.name} ile devam et</span>
              </Button>
            ))}
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Devam ederek kullanım şartlarımızı kabul etmiş olursunuz</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}