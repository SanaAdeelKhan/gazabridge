export type JobBoard = {
  name: string
  description: string
  url: string
}

export type Subcategory = {
  name: string
  jobs: JobBoard[]
}

export type Category = {
  id: string
  title: string
  subcategories?: Subcategory[]
  jobs?: JobBoard[]
}

export const jobBoardsData: Category[] = [
  {
    id: 'remote-job-boards',
    title: '🌍 Remote Job Boards',
    subcategories: [
      {
        name: 'Core Platforms',
        jobs: [
          { name: 'We Work Remotely', description: 'High-volume remote jobs', url: 'https://weworkremotely.com' },
          { name: 'RemoteOK', description: 'Real-time tech jobs', url: 'https://remoteok.com' },
          { name: 'Remote.co', description: 'Vetted remote roles', url: 'https://remote.co' },
          { name: 'Remotive', description: 'Curated tech jobs', url: 'https://remotive.com' },
          { name: 'JustRemote', description: 'Fast minimal listings', url: 'https://justremote.co' },
          { name: 'Working Nomads', description: 'Daily curated jobs', url: 'https://workingnomads.com' },
          { name: 'DailyRemote', description: 'Timezone-based filtering', url: 'https://dailyremote.com' },
          { name: 'Jobspresso', description: 'Curated remote listings', url: 'https://jobspresso.co' },
          { name: 'FlexJobs', description: 'Premium vetted jobs', url: 'https://flexjobs.com' },
        ]
      },
      {
        name: 'Aggregators',
        jobs: [
          { name: 'Remote4Me', description: 'Multi-source aggregator', url: 'https://remote4me.com' },
          { name: 'Remote Rocketship', description: 'Startup job aggregator', url: 'https://remoterocketship.com' },
          { name: 'NoDesk', description: 'Minimal nomad jobs', url: 'https://nodesk.co' },
          { name: 'Himalayas', description: 'Tech + visa filters', url: 'https://himalayas.app' },
          { name: 'RemoteTechJobs', description: 'Developer-focused roles', url: 'https://remotetechjobs.com' },
          { name: 'TrueUp', description: 'Data-driven tech jobs', url: 'https://trueup.io' },
        ]
      },
      {
        name: 'High-Pay Remote',
        jobs: [
          { name: 'Crossover', description: 'High-paying remote roles', url: 'https://crossover.com' },
          { name: 'Remote100K', description: 'Six-figure jobs', url: 'https://remote100k.com' },
        ]
      },
      {
        name: 'Region-Based',
        jobs: [
          { name: 'EuropeRemotely', description: 'EU timezone jobs', url: 'https://europeremotely.com' },
          { name: 'Remote OK Europe', description: 'EU remote filter', url: 'https://remoteok.com/remote-europe-jobs' },
          { name: 'Remote of Asia', description: 'Asia remote jobs', url: 'https://remoteok.com/remote-asia-jobs' },
        ]
      }
    ]
  },
  {
    id: 'startup-jobs',
    title: '🚀 Startup Job Boards',
    jobs: [
      { name: 'Wellfound', description: 'Startup hiring platform', url: 'https://wellfound.com' },
      { name: 'Y Combinator Jobs', description: 'YC startup roles', url: 'https://workatastartup.com' },
      { name: 'Startup.JOBS', description: 'Startup job listings', url: 'https://startup.jobs' },
      { name: 'startups.gallery', description: 'Startup directory jobs', url: 'https://startups.gallery' },
    ]
  },
  {
    id: 'general-job-sites',
    title: '🌐 General Job Sites',
    jobs: [
      { name: 'Indeed', description: 'Global job aggregator', url: 'https://indeed.com' },
      { name: 'LinkedIn Jobs', description: 'Professional network hiring', url: 'https://linkedin.com/jobs' },
      { name: 'SimplyHired', description: 'Fast job search', url: 'https://simplyhired.com' },
      { name: 'Talent.com', description: 'Global job index', url: 'https://talent.com' },
      { name: 'ZipRecruiter', description: 'AI job matching', url: 'https://ziprecruiter.com' },
      { name: 'Glassdoor', description: 'Jobs + salary insights', url: 'https://glassdoor.com' },
    ]
  },
  {
    id: 'ai-job-platforms',
    title: '🤖 AI Job Platforms',
    jobs: [
      { name: 'Jobright', description: 'AI job copilot', url: 'https://jobright.ai' },
      { name: 'Simplify Jobs', description: 'Application automation', url: 'https://simplify.jobs' },
      { name: 'Jobgether', description: 'AI job matching', url: 'https://jobgether.com' },
    ]
  },
  {
    id: 'design-creative',
    title: '🎨 Design & Creative',
    jobs: [
      { name: 'Dribbble Jobs', description: 'UI/UX design roles', url: 'https://dribbble.com/jobs' },
      { name: 'Behance Jobs', description: 'Creative portfolio jobs', url: 'https://behance.net' },
      { name: 'Framer Marketplace', description: 'Web design gigs', url: 'https://framer.com/marketplace' },
    ]
  },
  {
    id: 'freelance-platforms',
    title: '💻 Freelance Platforms',
    subcategories: [
      {
        name: 'General',
        jobs: [
          { name: 'Upwork', description: 'Global freelance marketplace', url: 'https://upwork.com' },
          { name: 'Freelancer', description: 'Bidding freelance jobs', url: 'https://freelancer.com' },
          { name: 'Contra', description: 'Commission-free freelancing', url: 'https://contra.com' },
          { name: 'PeoplePerHour', description: 'Service-based freelancing', url: 'https://peopleperhour.com' },
          { name: 'Guru', description: 'Milestone freelance work', url: 'https://guru.com' },
        ]
      },
      {
        name: 'Developer / Elite',
        jobs: [
          { name: 'Toptal', description: 'Elite developer network', url: 'https://toptal.com' },
          { name: 'Arc.dev', description: 'Developer job matching', url: 'https://arc.dev' },
          { name: 'Gun.io', description: 'Vetted dev marketplace', url: 'https://gun.io' },
          { name: 'Lemon.io', description: 'Startup dev hiring', url: 'https://lemon.io' },
          { name: 'freelancermap', description: 'IT contract jobs', url: 'https://freelancermap.com' },
        ]
      },
      {
        name: 'Creative',
        jobs: [
          { name: 'Designhill', description: 'Design contests platform', url: 'https://designhill.com' },
          { name: '99designs', description: 'Design marketplace', url: 'https://99designs.com' },
        ]
      }
    ]
  },
  {
    id: 'ai-training-contract',
    title: '🧠 AI Training / Contract',
    jobs: [
      { name: 'Mercor', description: 'AI training jobs', url: 'https://mercor.com' },
      { name: 'Outlier AI', description: 'AI task platform', url: 'https://outlier.ai' },
      { name: 'Alignerr', description: 'AI evaluation work', url: 'https://alignerr.com' },
    ]
  },
  {
    id: 'agencies-outsourcing',
    title: '🏢 Agencies / Outsourcing',
    jobs: [
      { name: 'Uplers', description: 'Talent matching agency', url: 'https://uplers.com' },
      { name: 'Remote Workmate', description: 'Offshore hiring platform', url: 'https://remoteworkmate.com' },
      { name: 'INSIDEA', description: 'Remote staffing agency', url: 'https://insidea.com' },
      { name: 'Outsourcely', description: 'Remote hiring platform', url: 'https://outsourcely.com' },
    ]
  },
  {
    id: 'niche-platforms',
    title: '🔍 Niche Platforms',
    jobs: [
      { name: 'PowerToFly', description: 'Diversity hiring jobs', url: 'https://powertofly.com' },
      { name: '4 Day Week', description: 'Flexible schedule jobs', url: 'https://4dayweek.io' },
      { name: 'Pangian', description: 'Remote community jobs', url: 'https://pangian.com' },
      { name: 'Bandana', description: 'Map-based job search', url: 'https://bandana.com' },
      { name: 'HiringCafe', description: 'Modern job search', url: 'https://hiring.cafe' },
      { name: 'SkipTheDrive', description: 'Simple remote jobs', url: 'https://skipthedrive.com' },
      { name: 'Handshake', description: 'Student job platform', url: 'https://joinhandshake.com' },
    ]
  },
  {
    id: 'developer-resources',
    title: '🧑‍💻 Developer Resources',
    jobs: [
      { name: 'Stack Overflow Jobs', description: 'Legacy dev jobs', url: 'https://stackoverflow.com/jobs' },
      { name: 'Awesome Remote Jobs', description: 'Curated GitHub list', url: 'https://github.com/lukasz-madon/awesome-remote-job' },
      { name: 'RemoteInTech', description: 'Remote companies list', url: 'https://github.com/remoteintech/remote-jobs' },
    ]
  }
]
