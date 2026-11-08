export function parseVideoUrl(input: string): { url: string; provider: string; embed?: string; thumbnail?: string; portrait?: boolean } | null {
  try {
    if (input.length > 2048) return null;
    const u = new URL(input);
    if (u.protocol !== "https:" || u.username || u.password || u.port) return null;
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) {
      id = host === "youtu.be" ? u.pathname.split("/")[1] : u.pathname === "/watch" ? u.searchParams.get("v") : u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null;
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      return {url: "https://www.youtube.com/watch?v=" + id, provider: "YouTube", embed: "https://www.youtube-nocookie.com/embed/" + id, thumbnail: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"};
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
    if (host === "instagram.com") {
      const post = u.pathname.match(/^\/(p|reel|reels)\/([\w-]+)\/?$/);
      if (post) return {url:u.toString(),provider:"Instagram",embed:`https://www.instagram.com/${post[1] === "p" ? "p" : "reel"}/${post[2]}/embed/`,portrait:true};
    }
    if (host === "tiktok.com") {
      const post = u.pathname.match(/^\/@[^/]+\/video\/(\d+)\/?$/);
      if (post) return {url:u.toString(),provider:"TikTok",embed:"https://www.tiktok.com/player/v1/"+post[1],portrait:true};
    }
    if (["facebook.com","m.facebook.com"].includes(host) && (/\/videos\/\d+/.test(u.pathname) || /^\/reel\/\d+/.test(u.pathname) || (u.pathname === "/watch/" && /^\d+$/.test(u.searchParams.get("v") ?? "")))) {
      return {url:u.toString(),provider:"Facebook",embed:"https://www.facebook.com/plugins/video.php?show_text=false&href="+encodeURIComponent(u.toString())};
    }
    return {url: u.toString(), provider: platforms[host]};
  } catch { return null; }
}

export function validThumbnailUrl(input: string): boolean {
  if (!input) return true;
  try {
    const u = new URL(input);
    return input.length <= 2048 && u.protocol === "https:" && !u.username && !u.password && !u.port;
  } catch { return false; }
}
