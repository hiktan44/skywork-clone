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
