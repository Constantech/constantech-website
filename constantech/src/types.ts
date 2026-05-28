export interface ButtonConfig {
  text: string;
  link: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  color?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatarUrl: string;
}

export interface HomePageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBtn1: ButtonConfig;
  heroBtn2: ButtonConfig;
  service1Title: string;
  service1Desc: string;
  service1Checkpoints: string[];
  service1Img: string;
  service2Title: string;
  service2Desc: string;
  service2LinkText: string;
  service3Title: string;
  service3Desc: string;
  service3Stats: StatItem[];
  service3Img: string;
  gridTitle: string;
  gridSubtitle: string;
  gridCards: CardItem[];
  testimonials: TestimonialItem[];
}

export interface WebDevPageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBtn1: ButtonConfig;
  heroBtn2: ButtonConfig;
  section1Title: string;
  section1Subtitle: string;
  section1ClientTitle: string;
  section1ClientDesc: string;
  section1ClientCheckpoints: string[];
  section1ClientTags: string[];
  section1ServerTitle: string;
  section1ServerDesc: string;
  section1ServerStats: string;
  section2Title: string;
  section2Subtitle: string;
  section2Desc: string;
  section2Features: CardItem[];
  section2Img: string;
  section2FloatingStatus: string;
  section2FloatingLatency: string;
  section3Title: string;
  section3Subtitle: string;
  section3Cards: CardItem[];
  section4Title: string;
  section4Subtitle: string;
  section4Desc: string;
  section4Features: string[];
}

export interface AboutPageContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStats: StatItem[];
  heroImg: string;
  heroQuote: string;
  pivotYearTitle: string;
  pivotYearDesc: string;
  pivotYearIconText: string;
  pivotRightBadge: string;
  pivotRightTitle: string;
  pivotRightDesc: string;
  bentoTitle: string;
  bentoCards: CardItem[];
  bentoImg: string;
  bentoImgCaption: string;
  currentTitle: string;
  currentSubtitle: string;
  currentDesc: string;
  currentHighlights: string[];
  currentImg: string;
  philosophyBigQuote: string;
  philosophyDesc: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBtn1: ButtonConfig;
  ctaBtn2: ButtonConfig;
}

export interface SiteContent {
  home: HomePageContent;
  webdev: WebDevPageContent;
  about: AboutPageContent;
  footerTagline: string;
  logoText: string;
}

export interface MediaAsset {
  filename: string;
  url: string;
  uploadedAt: string;
  size?: string;
}

export interface ContentResponse {
  success: boolean;
  content: SiteContent;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  username?: string;
}
