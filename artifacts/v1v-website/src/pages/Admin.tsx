import { useState, useEffect } from "react";
import { useAdminLogin, useAdminVerify, useGetProjects, useGetSettings, useCreateProject, useUpdateProject, useDeleteProject, useUpdateSettings, getGetProjectsQueryKey, getGetSettingsQueryKey } from "@workspace/api-client-react";
import type { Project, SiteSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("v1v_admin_token"));
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "settings">("projects");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const reqOpts = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const loginMutation = useAdminLogin();
  const verifyMutation = useAdminVerify();
  const { data: projects } = useGetProjects();
  const { data: settings } = useGetSettings();
  const createProjectMutation = useCreateProject({ request: reqOpts });
  const updateProjectMutation = useUpdateProject({ request: reqOpts });
  const deleteProjectMutation = useDeleteProject({ request: reqOpts });
  const updateSettingsMutation = useUpdateSettings({ request: reqOpts });

  const [projectForm, setProjectForm] = useState({
    title: "", shortDesc: "", longDesc: "", images: "", links: "", tags: "", year: "", category: "WEBSITES", featured: false,
  });
  const [settingsForm, setSettingsForm] = useState({
    heroTagline: "", heroSubtitle: "", aboutTitle: "", aboutText: "", aboutFoundedYear: "", contactEmail: "", contactPhone: "", contactAddress: "",
    socialTwitter: "", socialInstagram: "", socialLinkedin: "", socialGithub: "",
    themePrimary: "", themeSecondary: "", themeAccent: "",
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ data: { token } }, {
        onSuccess: (resp) => { if (resp.valid) setAuthenticated(true); else { setToken(null); localStorage.removeItem("v1v_admin_token"); } },
        onError: () => { setToken(null); localStorage.removeItem("v1v_admin_token"); },
      });
    }
  }, []);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        heroTagline: settings.heroTagline || "",
        heroSubtitle: settings.heroSubtitle || "",
        aboutTitle: settings.aboutTitle || "",
        aboutText: settings.aboutText || "",
        aboutFoundedYear: settings.aboutFoundedYear || "",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        contactAddress: settings.contactAddress || "",
        socialTwitter: settings.socialLinks?.twitter || "",
        socialInstagram: settings.socialLinks?.instagram || "",
        socialLinkedin: settings.socialLinks?.linkedin || "",
        socialGithub: settings.socialLinks?.github || "",
        themePrimary: settings.themeColors?.primary || "",
        themeSecondary: settings.themeColors?.secondary || "",
        themeAccent: settings.themeColors?.accent || "",
      });
    }
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { password } }, {
      onSuccess: (resp) => {
        if (resp.success) { setToken(resp.token); localStorage.setItem("v1v_admin_token", resp.token); setAuthenticated(true); }
      },
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate({
      data: {
        title: projectForm.title,
        shortDesc: projectForm.shortDesc,
        longDesc: projectForm.longDesc,
        images: projectForm.images ? projectForm.images.split(",").map((s) => s.trim()) : [],
        links: projectForm.links ? projectForm.links.split(",").map((s) => s.trim()) : [],
        tags: projectForm.tags.split(",").map((s) => s.trim()),
        year: projectForm.year,
        category: projectForm.category,
        featured: projectForm.featured,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
        setProjectForm({ title: "", shortDesc: "", longDesc: "", images: "", links: "", tags: "", year: "", category: "WEBSITES", featured: false });
      },
    });
  };

  const handleUpdateProject = (id: string) => {
    updateProjectMutation.mutate({
      id,
      data: {
        title: projectForm.title,
        shortDesc: projectForm.shortDesc,
        longDesc: projectForm.longDesc,
        images: projectForm.images ? projectForm.images.split(",").map((s) => s.trim()) : [],
        links: projectForm.links ? projectForm.links.split(",").map((s) => s.trim()) : [],
        tags: projectForm.tags.split(",").map((s) => s.trim()),
        year: projectForm.year,
        category: projectForm.category,
        featured: projectForm.featured,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
        setEditingProject(null);
        setProjectForm({ title: "", shortDesc: "", longDesc: "", images: "", links: "", tags: "", year: "", category: "WEBSITES", featured: false });
      },
    });
  };

  const handleDeleteProject = (id: string) => {
    deleteProjectMutation.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() }); },
    });
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const settingsPayload: SiteSettings = {
      heroTagline: settingsForm.heroTagline,
      heroSubtitle: settingsForm.heroSubtitle,
      aboutTitle: settingsForm.aboutTitle,
      aboutText: settingsForm.aboutText,
      aboutFoundedYear: settingsForm.aboutFoundedYear || undefined,
      contactEmail: settingsForm.contactEmail,
      contactPhone: settingsForm.contactPhone || undefined,
      contactAddress: settingsForm.contactAddress || undefined,
      socialLinks: {
        twitter: settingsForm.socialTwitter || undefined,
        instagram: settingsForm.socialInstagram || undefined,
        linkedin: settingsForm.socialLinkedin || undefined,
        github: settingsForm.socialGithub || undefined,
      },
      themeColors: {
        primary: settingsForm.themePrimary || undefined,
        secondary: settingsForm.themeSecondary || undefined,
        accent: settingsForm.themeAccent || undefined,
      },
    };
    updateSettingsMutation.mutate({ data: settingsPayload }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() }); },
    });
  };

  const startEdit = (project: Project) => {
    setEditingProject(project.id);
    setProjectForm({
      title: project.title,
      shortDesc: project.shortDesc,
      longDesc: project.longDesc,
      images: (project.images || []).join(", "),
      links: (project.links || []).join(", "),
      tags: (project.tags || []).join(", "),
      year: project.year,
      category: project.category,
      featured: project.featured,
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" data-testid="admin-login">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h1 className="text-3xl font-black tracking-[-0.03em] mb-2 glow-text">V1V ADMIN</h1>
          <p className="text-foreground/40 text-xs font-mono tracking-[0.15em] mb-8">ENTER PASSWORD TO CONTINUE</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-card border border-foreground/10 focus:border-primary/50 px-4 py-3 text-sm outline-none transition-colors mb-4"
            data-testid="input-admin-password"
          />
          <button type="submit" className="w-full px-4 py-3 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-opacity interactive" data-testid="button-admin-login">
            {loginMutation.isPending ? "AUTHENTICATING..." : "LOGIN"}
          </button>
          {loginMutation.isError && <p className="text-destructive text-xs mt-3 font-mono">Invalid password</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12" data-testid="admin-dashboard">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.02em] glow-text">V1V ADMIN</h1>
            <p className="text-foreground/40 text-xs font-mono tracking-[0.15em]">DASHBOARD</p>
          </div>
          <div className="flex gap-3">
            <a href={import.meta.env.BASE_URL || "/"} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-foreground/10 text-xs tracking-[0.15em] text-foreground/50 hover:text-primary hover:border-primary/30 transition-all font-mono interactive" data-testid="button-live-preview">
              LIVE PREVIEW
            </a>
            <button onClick={() => { setAuthenticated(false); setToken(null); localStorage.removeItem("v1v_admin_token"); }} className="px-4 py-2 border border-destructive/30 text-destructive text-xs tracking-[0.15em] hover:bg-destructive/10 transition-colors font-mono interactive" data-testid="button-logout">
              LOGOUT
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {(["projects", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs tracking-[0.15em] uppercase font-mono transition-all interactive ${activeTab === tab ? "bg-primary/10 text-primary border border-primary/30" : "text-foreground/40 border border-foreground/10 hover:text-foreground/60"}`}
              data-testid={`button-tab-${tab}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "projects" && (
          <div>
            <div className="mb-8 bg-card/50 border border-foreground/5 p-6">
              <h3 className="text-sm font-bold tracking-[0.1em] uppercase mb-4">{editingProject ? "EDIT PROJECT" : "ADD PROJECT"}</h3>
              <form onSubmit={editingProject ? (e) => { e.preventDefault(); handleUpdateProject(editingProject); } : handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={projectForm.title} onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-project-title" />
                <input value={projectForm.year} onChange={(e) => setProjectForm((p) => ({ ...p, year: e.target.value }))} placeholder="Year" className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-project-year" />
                <input value={projectForm.shortDesc} onChange={(e) => setProjectForm((p) => ({ ...p, shortDesc: e.target.value }))} placeholder="Short Description" className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30 md:col-span-2" data-testid="input-project-shortdesc" />
                <textarea value={projectForm.longDesc} onChange={(e) => setProjectForm((p) => ({ ...p, longDesc: e.target.value }))} placeholder="Long Description" rows={3} className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30 md:col-span-2 resize-none" data-testid="input-project-longdesc" />
                <input value={projectForm.tags} onChange={(e) => setProjectForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-project-tags" />
                <select value={projectForm.category} onChange={(e) => setProjectForm((p) => ({ ...p, category: e.target.value }))} className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="select-project-category">
                  {["WEBSITES", "INSTALLATIONS", "XR / VR / AI", "MULTIPLAYER", "GAMES"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={projectForm.images} onChange={(e) => setProjectForm((p) => ({ ...p, images: e.target.value }))} placeholder="Image URLs (comma separated)" className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-project-images" />
                <input value={projectForm.links} onChange={(e) => setProjectForm((p) => ({ ...p, links: e.target.value }))} placeholder="Links (comma separated)" className="bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-project-links" />
                <div className="flex items-center gap-2 md:col-span-2">
                  <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm((p) => ({ ...p, featured: e.target.checked }))} className="accent-primary" data-testid="input-project-featured" />
                  <span className="text-xs text-foreground/60 font-mono">FEATURED</span>
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground text-xs tracking-[0.15em] uppercase font-medium interactive" data-testid="button-save-project">
                    {editingProject ? "UPDATE" : "CREATE"}
                  </button>
                  {editingProject && (
                    <button type="button" onClick={() => { setEditingProject(null); setProjectForm({ title: "", shortDesc: "", longDesc: "", images: "", links: "", tags: "", year: "", category: "WEBSITES", featured: false }); }} className="px-6 py-2 border border-foreground/10 text-foreground/50 text-xs tracking-[0.15em] uppercase font-mono interactive" data-testid="button-cancel-edit">
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-3">
              {(projects || []).map((p) => (
                <div key={p.id} className="bg-card/50 border border-foreground/5 p-4 flex items-center justify-between" data-testid={`admin-project-${p.id}`}>
                  <div>
                    <h4 className="text-sm font-bold">{p.title}</h4>
                    <p className="text-xs text-foreground/40 font-mono">{p.year} / {p.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="px-3 py-1 text-xs border border-foreground/10 text-foreground/50 hover:text-primary hover:border-primary/30 transition-all font-mono interactive" data-testid={`button-edit-${p.id}`}>EDIT</button>
                    <button onClick={() => handleDeleteProject(p.id)} className="px-3 py-1 text-xs border border-destructive/20 text-destructive/60 hover:text-destructive hover:border-destructive/40 transition-all font-mono interactive" data-testid={`button-delete-${p.id}`}>DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <form onSubmit={handleUpdateSettings} className="bg-card/50 border border-foreground/5 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold tracking-[0.1em] uppercase mb-4">CONTENT SETTINGS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">HERO TAGLINE</label>
                  <input value={settingsForm.heroTagline} onChange={(e) => setSettingsForm((s) => ({ ...s, heroTagline: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-hero-tagline" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">HERO SUBTITLE</label>
                  <input value={settingsForm.heroSubtitle} onChange={(e) => setSettingsForm((s) => ({ ...s, heroSubtitle: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-hero-subtitle" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">ABOUT TITLE</label>
                  <input value={settingsForm.aboutTitle} onChange={(e) => setSettingsForm((s) => ({ ...s, aboutTitle: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-about-title" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">ABOUT TEXT</label>
                  <textarea value={settingsForm.aboutText} onChange={(e) => setSettingsForm((s) => ({ ...s, aboutText: e.target.value }))} rows={4} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30 resize-none" data-testid="input-about-text" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">FOUNDED YEAR</label>
                  <input value={settingsForm.aboutFoundedYear} onChange={(e) => setSettingsForm((s) => ({ ...s, aboutFoundedYear: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-founded-year" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">CONTACT EMAIL</label>
                  <input value={settingsForm.contactEmail} onChange={(e) => setSettingsForm((s) => ({ ...s, contactEmail: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-contact-email-setting" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">CONTACT PHONE</label>
                  <input value={settingsForm.contactPhone} onChange={(e) => setSettingsForm((s) => ({ ...s, contactPhone: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-contact-phone" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">CONTACT ADDRESS</label>
                  <input value={settingsForm.contactAddress} onChange={(e) => setSettingsForm((s) => ({ ...s, contactAddress: e.target.value }))} className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-contact-address" />
                </div>
              </div>
            </div>

            <div className="border-t border-foreground/5 pt-6">
              <h3 className="text-sm font-bold tracking-[0.1em] uppercase mb-4">SOCIAL LINKS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">TWITTER / X</label>
                  <input value={settingsForm.socialTwitter} onChange={(e) => setSettingsForm((s) => ({ ...s, socialTwitter: e.target.value }))} placeholder="https://twitter.com/..." className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-social-twitter" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">INSTAGRAM</label>
                  <input value={settingsForm.socialInstagram} onChange={(e) => setSettingsForm((s) => ({ ...s, socialInstagram: e.target.value }))} placeholder="https://instagram.com/..." className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-social-instagram" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">LINKEDIN</label>
                  <input value={settingsForm.socialLinkedin} onChange={(e) => setSettingsForm((s) => ({ ...s, socialLinkedin: e.target.value }))} placeholder="https://linkedin.com/..." className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-social-linkedin" />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">GITHUB</label>
                  <input value={settingsForm.socialGithub} onChange={(e) => setSettingsForm((s) => ({ ...s, socialGithub: e.target.value }))} placeholder="https://github.com/..." className="w-full bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30" data-testid="input-social-github" />
                </div>
              </div>
            </div>

            <div className="border-t border-foreground/5 pt-6">
              <h3 className="text-sm font-bold tracking-[0.1em] uppercase mb-4">THEME COLORS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">PRIMARY</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settingsForm.themePrimary || "#00f0ff"} onChange={(e) => setSettingsForm((s) => ({ ...s, themePrimary: e.target.value }))} className="w-8 h-8 border border-foreground/10 bg-transparent cursor-pointer" data-testid="input-theme-primary-color" />
                    <input value={settingsForm.themePrimary} onChange={(e) => setSettingsForm((s) => ({ ...s, themePrimary: e.target.value }))} placeholder="#00f0ff" className="flex-1 bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30 font-mono" data-testid="input-theme-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">SECONDARY</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settingsForm.themeSecondary || "#8b5cf6"} onChange={(e) => setSettingsForm((s) => ({ ...s, themeSecondary: e.target.value }))} className="w-8 h-8 border border-foreground/10 bg-transparent cursor-pointer" data-testid="input-theme-secondary-color" />
                    <input value={settingsForm.themeSecondary} onChange={(e) => setSettingsForm((s) => ({ ...s, themeSecondary: e.target.value }))} placeholder="#8b5cf6" className="flex-1 bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30 font-mono" data-testid="input-theme-secondary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-foreground/40 font-mono mb-1 block">ACCENT</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settingsForm.themeAccent || "#00e5a0"} onChange={(e) => setSettingsForm((s) => ({ ...s, themeAccent: e.target.value }))} className="w-8 h-8 border border-foreground/10 bg-transparent cursor-pointer" data-testid="input-theme-accent-color" />
                    <input value={settingsForm.themeAccent} onChange={(e) => setSettingsForm((s) => ({ ...s, themeAccent: e.target.value }))} placeholder="#00e5a0" className="flex-1 bg-background border border-foreground/10 px-3 py-2 text-sm outline-none focus:border-primary/30 font-mono" data-testid="input-theme-accent" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground text-xs tracking-[0.15em] uppercase font-medium interactive mt-4" data-testid="button-save-settings">
              {updateSettingsMutation.isPending ? "SAVING..." : "SAVE SETTINGS"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
