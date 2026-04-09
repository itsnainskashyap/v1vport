import fs from "fs";
import path from "path";
import { logger } from "./logger";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "v1v-data.json");

interface StoreData {
  projects: Project[];
  settings: SiteSettings;
  adminPassword: string;
}

export interface Project {
  id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  images: string[];
  links: string[];
  tags: string[];
  year: string;
  category: string;
  featured: boolean;
}

export interface SiteSettings {
  heroTagline: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  aboutFoundedYear?: string;
  contactEmail: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    whatsapp?: string;
  };
  themeColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

const DEFAULT_DATA: StoreData = {
  adminPassword: "v1vadmin123",
  settings: {
    heroTagline: "CREATIVE DIGITAL EXPERIENCES",
    heroSubtitle: "We blend story, art & technology as an in-house team of passionate makers",
    aboutTitle: "CREATIVE DIGITAL EXPERIENCES",
    aboutText: "We blend story, art & technology as an in-house team of passionate makers. Our industry-leading web toolset consistently delivers award-winning work through quality & performance.",
    aboutFoundedYear: "2024",
    contactEmail: "hello@v1v.in",
    contactPhone: "",
    contactAddress: "",
    socialLinks: {
      twitter: "https://twitter.com/v1vstudio",
      instagram: "https://instagram.com/v1vstudio",
      linkedin: "https://linkedin.com/company/v1v",
      github: "https://github.com/v1v",
      whatsapp: "+917282074603",
    },
    themeColors: {
      primary: "#00f0ff",
      secondary: "#8b5cf6",
      accent: "#f0c040",
    },
  },
  projects: [
    {
      id: "proj-001",
      title: "PROMETHEUS",
      shortDesc: "Fuel from the air — immersive WebGL experience",
      longDesc: "An award-winning interactive WebGL experience exploring renewable energy through immersive 3D storytelling. Built with custom shaders, particle systems, and real-time physics simulations.",
      images: [],
      links: ["https://prometheus.v1v.in"],
      tags: ["WebGL", "Three.js", "Interactive", "Award-winning"],
      year: "2024",
      category: "WEBSITES",
      featured: true,
    },
    {
      id: "proj-002",
      title: "E.C.H.O.",
      shortDesc: "AI-powered spatial audio installation",
      longDesc: "A groundbreaking spatial computing installation that uses AI to create responsive soundscapes based on visitor movement and gestures. Deployed across 12 museums worldwide.",
      images: [],
      links: ["https://echo.v1v.in"],
      tags: ["Installation", "AI", "Spatial Audio", "Museum"],
      year: "2024",
      category: "INSTALLATIONS",
      featured: true,
    },
    {
      id: "proj-003",
      title: "PATRONUS",
      shortDesc: "Discover your Patronus — XR experience",
      longDesc: "An extended reality experience that brings the wizarding world to life through hand tracking, volumetric rendering, and procedural creature generation.",
      images: [],
      links: ["https://patronus.v1v.in"],
      tags: ["XR", "VR", "Hand Tracking", "Volumetric"],
      year: "2023",
      category: "XR / VR / AI",
      featured: true,
    },
    {
      id: "proj-004",
      title: "NEURAL DRIFT",
      shortDesc: "Multiplayer neural network visualization",
      longDesc: "A real-time multiplayer experience where participants collectively train a neural network, visualized as an evolving organic structure in 3D space.",
      images: [],
      links: ["https://neuraldrift.v1v.in"],
      tags: ["Multiplayer", "WebSocket", "Neural Network", "Real-time"],
      year: "2023",
      category: "MULTIPLAYER",
      featured: false,
    },
    {
      id: "proj-005",
      title: "VOID RUNNER",
      shortDesc: "Procedural infinite runner in the void",
      longDesc: "A procedurally generated infinite runner game set in a minimalist void, featuring custom physics, adaptive difficulty, and a leaderboard system.",
      images: [],
      links: ["https://voidrunner.v1v.in"],
      tags: ["Game", "Procedural", "WebGL", "Physics"],
      year: "2023",
      category: "GAMES",
      featured: false,
    },
  ],
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readData(): StoreData {
  ensureDir();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return DEFAULT_DATA;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as StoreData;
  } catch {
    logger.warn("Corrupted data file, resetting to defaults");
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    return DEFAULT_DATA;
  }
}

function writeData(data: StoreData) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getProjects(): Project[] {
  return readData().projects;
}

export function getProject(id: string): Project | undefined {
  return readData().projects.find((p) => p.id === id);
}

export function createProject(input: Omit<Project, "id">): Project {
  const data = readData();
  const project: Project = {
    ...input,
    id: `proj-${Date.now().toString(36)}`,
    images: input.images || [],
    links: input.links || [],
    featured: input.featured ?? false,
  };
  data.projects.push(project);
  writeData(data);
  return project;
}

export function updateProject(id: string, input: Partial<Project>): Project | null {
  const data = readData();
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  data.projects[idx] = { ...data.projects[idx], ...input, id };
  writeData(data);
  return data.projects[idx];
}

export function deleteProject(id: string): boolean {
  const data = readData();
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  data.projects.splice(idx, 1);
  writeData(data);
  return true;
}

export function getSettings(): SiteSettings {
  return readData().settings;
}

export function updateSettings(settings: SiteSettings): SiteSettings {
  const data = readData();
  data.settings = { ...data.settings, ...settings };
  writeData(data);
  return data.settings;
}

export function verifyPassword(password: string): boolean {
  const envPassword = process.env.V1V_ADMIN_PASSWORD;
  if (envPassword) {
    return password === envPassword;
  }
  return readData().adminPassword === password;
}

export function generateToken(): string {
  const { randomBytes } = require("crypto") as typeof import("crypto");
  return randomBytes(32).toString("base64url");
}

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const activeTokens = new Map<string, number>();

export function storeToken(token: string) {
  activeTokens.set(token, Date.now());
}

export function isValidToken(token: string): boolean {
  const created = activeTokens.get(token);
  if (created === undefined) return false;
  if (Date.now() - created > TOKEN_TTL_MS) {
    activeTokens.delete(token);
    return false;
  }
  return true;
}
