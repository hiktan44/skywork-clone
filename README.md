# Skywork Clone

Skywork.ai çalışma alanından esinlenen Next.js arayüz demosu. Bu depo resmi
SkyworkAI projelerinin fork'u değildir; mevcut git geçmişinde bir upstream kaynak
kaydı bulunmamaktadır.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

PostgreSQL ile tam yerel kurulum için:

```bash
docker compose up --build
```

Container açılışında `script/migrate.mjs` şemayı ve tekrar-safe demo verisini
hazırlar. `DATABASE_URL` olmadan production container başlamaz.

## Giriş (Better Auth)

Giriş sistemi [Better Auth](https://better-auth.com) ile çalışır ve mevcut `"User"`
tablosunu kullanır; `Session`, `Account`, `Verification` tabloları `script/migrate.mjs`
ile oluşturulur. Ortam değişkenleri:

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `BETTER_AUTH_SECRET` | Evet | En az 32 karakter; `openssl rand -base64 32` ile üretin. Yoksa giriş kapalı kalır (API 503), uygulama çalışmaya devam eder. |
| `BETTER_AUTH_URL` | Önerilir | Ör. `https://skywork.seymata.com` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Hayır | Tanımlıysa "Google ile devam et" görünür. Callback: `<BETTER_AUTH_URL>/api/auth/callback/google` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Hayır | Tanımlıysa "GitHub ile devam et" görünür. Callback: `<BETTER_AUTH_URL>/api/auth/callback/github` |

E-posta + şifre ile giriş/kayıt her zaman açıktır (e-posta doğrulaması yok).

Google ile giriş, aynı e-postayla daha önce **şifreyle** açılmış (doğrulanmamış) bir hesaba
otomatik bağlanmaz (`requireLocalEmailVerified`); bu, önceden hesap açarak ele geçirmeyi engeller.

### Google OAuth istemcisi (Google Cloud Console)

1. <https://console.cloud.google.com/> → üstten bir proje seçin veya **Yeni proje** oluşturun.
2. **APIs & Services → OAuth consent screen** (Google Auth Platform → Branding): uygulama adı
   `Skywork`, destek e-postası, **Audience: External**. Scope olarak `email`, `profile`, `openid`
   yeterlidir. Test aşamasındaysa **Test users** listesine giriş yapacak hesapları ekleyin ya da
   **Publish app** ile yayınlayın.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   **Application type: Web application**.
4. **Authorized JavaScript origins:** `https://skywork.seymata.com`
   (yerel test için ayrıca `http://localhost:3000`).
5. **Authorized redirect URIs:** `https://skywork.seymata.com/api/auth/callback/google`
   (yerel: `http://localhost:3000/api/auth/callback/google`).
6. Oluşan **Client ID** ve **Client secret** değerlerini Coolify'da `GOOGLE_CLIENT_ID` ve
   `GOOGLE_CLIENT_SECRET` olarak girin ve yeniden deploy edin. Değerleri sohbete veya repoya yazmayın.

## Yapay zekâ sohbeti (Gemini)

Ana sayfadaki SkyClaw sohbeti Vercel AI SDK + Google Gemini ile akışlı yanıt üretir
(`/api/chat`). Yalnızca giriş yapmış kullanıcılar kullanabilir; kullanıcı başına 10 dakikada
20 istek sınırı vardır.

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Sohbet için | Google AI Studio API anahtarı. Yoksa sohbet "demo" uyarısı gösterir. |
| `GEMINI_MODEL` | Hayır | Varsayılan `gemini-flash-latest`. |

## Örnek içerik

`script/migrate.mjs` her açılışta tekrar-safe biçimde (`ON CONFLICT ("id") DO NOTHING`) 18 herkese açık
örnek proje (her türden 3) ve 12 beceri ekler; mevcut kayıtlara dokunmaz. Proje kapakları
`public/covers/*.svg` altında bu repo için çizilmiş özgün SVG'lerdir; kapağı olmayan projelere
türüne göre varsayılan kapak atanır. Proje kartına tıklamak, beceride "Şablonu kullan" demek
ilgili istemi ana sayfadaki sohbet kutusuna yazar.

## Zamanlanmış görevler

`/scheduled` sayfasındaki görevler giriş yapmış kullanıcıya ait olarak `ScheduledTask`
tablosuna kaydedilir (`/api/tasks`, `/api/tasks/[id]`). Liste boşken 5 Türkçe görev şablonu
tek tıkla eklenebilir; silmeden önce onay istenir. Otomatik çalıştırıcı henüz yoktur.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
