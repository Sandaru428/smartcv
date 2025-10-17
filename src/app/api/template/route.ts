import { promises as fs } from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing template id", { status: 400 });
    }

    // read templates.json to resolve the latexFile path
    const templatesPath = path.join(process.cwd(), "src", "data", "templates.json");
    const templatesRaw = await fs.readFile(templatesPath, "utf8");
    const templates = JSON.parse(templatesRaw) as { id: string; latexFile: string }[];

    const tpl = templates.find((t) => t.id === id);
    if (!tpl) {
      return new Response(`Template with id "${id}" not found`, { status: 404 });
    }

    // latexFile is like "/data/latex/modern.tex" in templates.json; map to src/ path
    const latexRel = tpl.latexFile.replace(/^\/+/, ""); // remove leading slash
    const latexPath = path.join(process.cwd(), "src", latexRel);

    try {
      const content = await fs.readFile(latexPath, "utf8");
      return new Response(content, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(`Failed to read latex file: ${msg}`, { status: 404 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Server error: ${msg}`, { status: 500 });
  }
}
