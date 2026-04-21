import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function handler(req, res) {
  try {
    // Serve static assets from dist/client
    const url = req.url?.split("?")[0] || "/";
    
    if (url !== "/" && url !== "") {
      const filePath = path.join(__dirname, "..", "dist", "client", url);
      const ext = path.extname(filePath).toLowerCase();
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath);
        
        const mimeTypes = {
          ".js": "application/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".json": "application/json",
          ".mp4": "video/mp4",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".svg": "image/svg+xml",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
          ".eot": "application/vnd.ms-fontobject",
          ".html": "text/html; charset=utf-8",
        };
        
        res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
        if (ext === ".js" || ext === ".css" || ext === ".woff" || ext === ".woff2") {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        res.statusCode = 200;
        res.end(content);
        return;
      }
    }

    // For all other routes, return the SPA index.html
    const indexPath = path.join(__dirname, "..", "dist", "client", "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.statusCode = 200;
      res.end(content);
      return;
    }

    // Fallback: Generate a basic HTML shell
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.statusCode = 200;
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
          <meta name="description" content="Real-time vertical video feed of the vibiest clubs, restaurants, rooftops and events near you. Rated in 🔥.">
          <meta property="og:title" content="VibeCheck — see the vibe before you go">
          <meta property="og:description" content="Tap in to see what's actually popping right now.">
          <title>VibeCheck — see the vibe before you go</title>
          <style>
            * { margin: 0; padding: 0; }
            html, body, #root { height: 100%; width: 100%; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #000; color: #fff; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/assets/index-g5UZgjBH.js"></script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Handler error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Internal Server Error");
  }
}

export default handler;
