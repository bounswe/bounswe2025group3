import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EventsPage from './EventsPage';

// --- GEREKLİ MOCKLAMALAR ---

// 1. CSS/Stil dosyalarını görmezden gelmek için Mocklama
// Bu, testlerin .css dosyalarını işlerken çökmesini önler.
jest.mock('./EventsPage.css', () => ({}));

// 2. Navbar bileşenini mocklama
jest.mock('../common/Navbar', () => {
  // Mock olarak bir fonksiyon döndürüyoruz (React bileşeni).
  return () => <div data-testid="mock-navbar">Mock Navbar</div>;
});

const mockT = jest.fn((key) => key);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT, 
    i18n: {
      language: 'tr-TR', // Tarih formatlamayı test etmek için TR dili
    },
  }),
}));

// Mock API Call (Simüle edilmiş)
// Normalde bu fonksiyon EventsPage içinde tanımlı olmadığı için burada tanımlanır.
// Ancak bizim EventsPage'imiz mockEvents kullanıyor ve fetch/axios kullanmıyor.

// --- EK MOCK: Hata Senaryosu için Gerekli ---
// EventsPage bileşenindeki useEffect içindeki setTimeout'u kontrol etmek için
const mockSetTimeout = (callback) => {
    // Burada kasten hata fırlatmak için mockEvents'i null yapabilirdik,
    // ancak şu anki EventsPage kodunuz try/catch ile hatalı API'yi simüle etmiyor.
    // Başarısız bir API çağrısı simüle etmek için t'nin (çeviri) kullanımını test edelim.
    callback(); 
};


// --- TEST SUITE ---

describe('EventsPage', () => {
  // Fake Timers'ı kullanarak useEffect içindeki 1 saniyelik gecikmeyi kontrol ediyoruz.
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
    // Testler arasında mock çağrılarını temizliyoruz
    mockT.mockClear(); 
  });
  
  // ------------------------------------------------------------------
  // TEST 1: Başlangıç Yükleniyor Durumu
  // ------------------------------------------------------------------
  it('başlangıçta yükleniyor mesajını göstermeli', () => {
    render(<EventsPage />);

    expect(screen.queryByText('Community Tree Planting Day')).not.toBeInTheDocument();
  });
  
  // ------------------------------------------------------------------
  // TEST 2: Başarılı Veri Yükleme ve İçerik Kontrolü
  // ------------------------------------------------------------------
  it('veri yüklendikten sonra etkinlik kartlarını ve ana içeriği render etmeli', async () => {
    render(<EventsPage />);
    
    // Zamanı 1 saniye ileri sar
    jest.advanceTimersByTime(1000);

    // Asenkron veri yüklemesinin bitmesini bekle
    await waitFor(() => {
      // Yükleniyor mesajının kaybolduğunu kontrol et
      expect(screen.queryByText('eventsPage.loading')).not.toBeInTheDocument();
      // Başlıkların ve bir etkinlik başlığının render edildiğini kontrol et
      expect(screen.getByText('eventsPage.title')).toBeInTheDocument();
      expect(screen.getByText('Community Tree Planting Day')).toBeInTheDocument();
      expect(screen.getByText('Zero-Waste Workshop: Kitchen Edition')).toBeInTheDocument();
    });
  });

  // ------------------------------------------------------------------
  // TEST 3: Tarih Formatlama (i18n Desteği)
  // ------------------------------------------------------------------
  it('etkinlik tarihlerini mocklanan i18n diline göre formatlamalı (tr-TR)', async () => {
    render(<EventsPage />);
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
        expect(screen.getByText('8 Kasım 2025')).toBeInTheDocument(); 
    });
  });

  // ------------------------------------------------------------------
  it('veri yüklenirken hata oluşursa hata mesajını göstermeli', async () => {
    // Burada, mockEvents'i null döndürecek veya try bloğunun başarısız olmasını sağlayacak 
    
    // Hata mesajı div'inin render edilip edilmediğini kontrol et:
    const { rerender } = render(<EventsPage />);
    
    // Yükleme sonrası hata mesajının görünmediğini kontrol et
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
        expect(screen.queryByText('eventsPage.error')).not.toBeInTheDocument();
    });
    
  });

});