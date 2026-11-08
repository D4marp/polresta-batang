export function parseVideoUrl(input: string): { url: string; provider: string; embed?: string } | null {
  try {
    if (input.length > 2048) return null;
    const u = new URL(input);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
      id = host === "youtu.be" ? u.pathname.split("/")[1] : u.pathname === "/watch" ? u.searchParams.get("v") : u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null;
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      return {url: "https://www.youtube.com/watch?v=" + id, provider: "YouTube", embed: "https://www.youtube-nocookie.com/embed/" + id};
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const match = u.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?\/?$/);
      if (!match) return null;
      const hash = match[2] || u.searchParams.get("h");
      if (hash && !/^[a-f0-9]+$/.test(hash)) return null;
      const suffix = hash ? "?h=" + hash : "";
      return {url: "https://vimeo.com/" + match[1] + (hash ? "/" + hash : ""), provider: "Vimeo", embed: "https://player.vimeo.com/video/" + match[1] + suffix};
    }
    const platforms: Record<string, string> = {"instagram.com":"Instagram", "facebook.com":"Facebook", "m.facebook.com":"Facebook", "fb.watch":"Facebook", "tiktok.com":"TikTok", "vm.tiktok.com":"TikTok", "vt.tiktok.com":"TikTok"};
    if (!platforms[host] || u.pathname === "/") return null;
    u.hash = "";
    return {url: u.toString(), provider: platforms[host]};
  } catch { return null; }
}
