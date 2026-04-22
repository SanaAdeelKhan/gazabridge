# GazaBridge — Where Skills Meet Those Who Need Them

**A bridge connecting volunteers worldwide with people in Gaza, offering free teaching, mentorship, tech skills, and more.**

&nbsp;

## The Reality We Cannot Ignore

Somewhere in Gaza right now, a student who dreamed of becoming a software engineer has no one to teach them. A mother who wants to learn English so she can communicate with aid workers has no one to guide her. A young man with a brilliant mind and zero resources sits with potential that the world may never see, not because he is not capable, but because the bridge between him and the people who could help simply does not exist.

The world is full of people who want to help. Volunteers, teachers, mentors, developers, coaches; people who have skills, time, and genuine willingness to make a difference. The problem has never been a lack of compassion. The problem has always been connection.

**GazaBridge exists to close that gap.**

&nbsp;

## What GazaBridge Is

GazaBridge is a free humanitarian platform that directly connects people in Gaza with skilled volunteers around the world. No fees. No barriers. No bureaucracy standing between a person who needs help and a person who can give it.

Volunteers offer what they know; English teaching, coding lessons, career mentorship, mental health support, academic tutoring, creative skills. People in Gaza post what they need. The platform matches them, connects them, and gets out of the way.

It is as simple and as profound as that.

&nbsp;

## How It Works

Someone who wants to volunteer signs up, completes a short profile describing what they can offer, and gets matched with people in Gaza whose needs align with their skills. Someone in Gaza who needs support posts a request, describes what kind of help they are looking for, and connects directly with a matched volunteer. From there, everything happens through the built-in messaging system; real conversations, real help, real impact.

There are no middlemen. No waiting lists. No forms to fill out in triplicate. Just two human beings, brought together by a platform that believes connection is the most powerful form of aid.

&nbsp;

## Features That Matter

**Volunteer Profiles** — Volunteers build a detailed profile listing exactly what skills they are offering, how many hours they can commit per week, and what languages they speak.

**Help Requests** — People in Gaza post specific requests describing what they need, making it easy for the right volunteer to find them and reach out.

**Smart Matching** — The platform surfaces the most relevant volunteer profiles for each help request so that meaningful connections happen faster.

**Real-Time Messaging** — Once matched, both parties communicate through a built-in real-time chat system. No third-party apps, no sharing personal contact details, just direct and safe communication on the platform.

**English Proficiency Quiz** — A built-in quiz helps match language learners with volunteers at the right teaching level so that no session is wasted.

**Bilingual Experience** — The entire platform supports Arabic throughout so that language is never a barrier on either side of the bridge.

**Admin and Vetting** — An admin layer allows the GazaBridge team to verify profiles and maintain the integrity and safety of the community.

&nbsp;

## The Tech Behind the Bridge

GazaBridge is built with a modern, production-grade stack designed to be fast, reliable, and accessible regardless of internet conditions.

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 with App Router, TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth with Google OAuth |
| Database | PostgreSQL via Supabase |
| Real-Time | Supabase Realtime Subscriptions |
| Deployment | Vercel with GitHub CI/CD |

The design language is warm and intentional, rooted in cream, olive, and amber tones that feel human rather than clinical, because the people using this platform deserve an experience that respects their dignity.

&nbsp;

## Getting Started Locally

You will need **Node.js 18 or above** and a **Supabase project** with Google OAuth configured.

**1. Clone the repository and install dependencies**

```bash
git clone https://github.com/SanaAdeelKhan/gazabridge.git
cd gazabridge
npm install
```

**2. Create a `.env.local` file in the root of the project**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**3. Start the development server**

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

For Google OAuth to work locally, add `http://localhost:3000/auth/callback` as an authorized redirect URI in your Google Cloud Console OAuth client, and add `http://localhost:3000` as a redirect URL in your Supabase authentication settings.

&nbsp;

## Deploying to Production

GazaBridge deploys automatically to Vercel on every push to the main branch. To deploy your own instance, connect the repository to a Vercel project, add the environment variables in the Vercel dashboard, and push. Vercel handles the rest.

Before going live, make sure the **Supabase Site URL** is set to your production domain and that the production callback URL is registered in both Supabase and Google Cloud Console.

&nbsp;

## The People Behind GazaBridge

GazaBridge was co-founded by **Sana Adeel Khan** and **Muhammad Sadat Rakib**, two people who looked at the gap between those who want to help and those who need it, and decided to build the bridge themselves.

This is not a hackathon submission or a portfolio piece. It is a living platform with real users, real conversations, and real impact happening every day. Every line of code written here is written with the understanding that on the other side of a screen, somewhere in Gaza, someone is waiting for the connection it enables.

&nbsp;

## Contributing

GazaBridge is open to contributions from developers, designers, and anyone who wants to help make the platform better. If you find a bug, have an idea for a feature, or want to improve the codebase, open an issue or submit a pull request. The only requirement is that whatever you build is done with the same care and intentionality that the people using this platform deserve.

&nbsp;

## Live Platform

**(https://gazabridge.netlify.app/)**

&nbsp;

> Gaza needs more than prayers. It needs people with skills, willing to show up. If that is you — welcome to GazaBridge.
