'use client';

import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/lib/store';

const features = [
  'AI Note Taker ile toplantılarınızı otomatik olarak not alın',
  'Scheduled Tasks ile periyodik görevleri planlayın',
  'IM entegrasyonu ile favori mesajlaşma uygulamalarınızı bağlayın',
];

export default function AnnouncementModal() {
  const { announcementModalOpen, setAnnouncementModalOpen } = useUIStore();

  return (
    <Dialog open={announcementModalOpen} onOpenChange={setAnnouncementModalOpen}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex h-[500px]">
          <div className="w-1/2 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Yeni Özellikler!</h3>
              <p className="text-purple-100">Daha verimli çalışmanızı sağlayan güçlü AI araçları</p>
            </div>
          </div>

          <div className="w-1/2 p-8 flex flex-col relative">
            <button
              onClick={() => setAnnouncementModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 mb-3">
                  New · AI Note Taker
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                  İş Akışınızı Otomatize Edin
                </h2>
              </div>

              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-3 mt-auto">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setAnnouncementModalOpen(false)}
                >
                  Kapat
                </Button>
                <Button
                  className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {
                    setAnnouncementModalOpen(false);
                  }}
                >
                  Ücretsiz Dene
                </Button>
              </div>
              
              <div className="text-center">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  Limited Time Offer
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}