import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import os from "os";
import { createServer as createViteServer } from "vite";
import { defaultSiteContent } from "./src/defaultData.js";

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Dynamic Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${elapsed}ms)`);
  });
  next();
});

// Increase payload limits for base64 media uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup Directories
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

// Database JSON File Paths
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Seeding Default Content
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultSiteContent, null, 2), "utf8");
}

// Hashing Helper
function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

// Seeding Standard Admin User (Default admin / admin)
if (!fs.existsSync(USERS_FILE)) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = hashPassword("admin", salt);
  const initialUsers = [
    {
      username: "admin",
      salt,
      password: hashedPassword,
    },
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), "utf8");
  console.log("---- DATABASE INITIALIZED ----");
  console.log("Default CMS Credentials set: admin / admin");
  console.log("------------------------------");
}

// Token Security
const SERVER_SECRET = process.env.JWT_SECRET || "constantech-blueprint-secret-key-1337-v1";

function generateToken(username: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24-hour validity
  const payload = JSON.stringify({ username, expiresAt });
  const hmac = crypto.createHmac("sha256", SERVER_SECRET).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, signature: hmac })).toString("base64");
}

function verifyToken(token: string): string | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf8");
    const { payload, signature } = JSON.parse(raw);
    const expectedHmac = crypto.createHmac("sha256", SERVER_SECRET).update(payload).digest("hex");
    if (signature !== expectedHmac) return null;
    const decoded = JSON.parse(payload);
    if (Date.now() > decoded.expiresAt) return null;
    return decoded.username;
  } catch (e) {
    return null;
  }
}

// Auth Middleware
function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication token is required" });
  }
  const token = authHeader.split(" ")[1];
  const username = verifyToken(token);
  if (!username) {
    return res.status(401).json({ error: "Invalid or expired authentication token" });
  }
  (req as any).currentUser = username;
  next();
}

// ---------------- SERVER ENDPOINTS -----------------

// Static asset delivery for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Serve metadata safely if needed
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Admin Log in Flow
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    const user = users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const hashed = hashPassword(password, user.salt);
    if (hashed !== user.password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user.username);
    res.json({ token, username: user.username });
  } catch (e: any) {
    res.status(500).json({ error: "Internal Auth Error: " + e.message });
  }
});

// Validate session check
app.get("/api/auth/check", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ authenticated: false });
  }
  const token = authHeader.split(" ")[1];
  const username = verifyToken(token);
  if (!username) {
    return res.json({ authenticated: false });
  }
  res.json({ authenticated: true, username });
});

// Update password
app.post("/api/auth/change-password", authRequired, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Old password and new password are required" });
  }

  const username = (req as any).currentUser;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    const userIndex = users.findIndex((u: any) => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[userIndex];
    if (hashPassword(oldPassword, user.salt) !== user.password) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    const newSalt = crypto.randomBytes(16).toString("hex");
    user.salt = newSalt;
    user.password = hashPassword(newPassword, newSalt);

    users[userIndex] = user;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");

    res.json({ success: true, message: "Password updated successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// CMS Content endpoints
app.get("/api/content", (req, res) => {
  try {
    const content = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8"));
    res.json({ success: true, content });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to read content: " + e.message });
  }
});

app.put("/api/content", authRequired, (req, res) => {
  try {
    const newContent = req.body;
    if (!newContent || typeof newContent !== "object") {
      return res.status(400).json({ error: "Invalid content body" });
    }

    // Auto backup current content
    if (fs.existsSync(CONTENT_FILE)) {
      try {
        const currentData = fs.readFileSync(CONTENT_FILE, "utf8");
        const backupName = `content-${Date.now()}.json`;
        fs.writeFileSync(path.join(BACKUPS_DIR, backupName), currentData, "utf8");

        // Retain only last 15 backups
        const existingBackups = fs.readdirSync(BACKUPS_DIR)
          .filter(f => f.startsWith("content-") && f.endsWith(".json"))
          .map(f => {
            const bPath = path.join(BACKUPS_DIR, f);
            return { name: f, path: bPath, time: fs.statSync(bPath).mtimeMs };
          })
          .sort((a, b) => b.time - a.time);

        if (existingBackups.length > 15) {
          existingBackups.slice(15).forEach(b => {
            try { fs.unlinkSync(b.path); } catch (e) {}
          });
        }
      } catch (backupErr: any) {
        console.error("Backup non-blocking warning:", backupErr.message);
      }
    }

    fs.writeFileSync(CONTENT_FILE, JSON.stringify(newContent, null, 2), "utf8");
    res.json({ success: true, message: "CMS Content updated successfully!" });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to write content: " + e.message });
  }
});

// ---------------- BACKUP & ROLLBACK ENDPOINTS -----------------

// List backups
app.get("/api/backups", authRequired, (req, res) => {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return res.json({ success: true, backups: [] });
    }
    const files = fs.readdirSync(BACKUPS_DIR);
    const list = files
      .filter(f => f.startsWith("content-") && f.endsWith(".json"))
      .map(f => {
        const bPath = path.join(BACKUPS_DIR, f);
        const stat = fs.statSync(bPath);
        return {
          filename: f,
          createdAt: stat.mtime.toISOString(),
          size: `${(stat.size / 1024).toFixed(2)} KB`
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, backups: list });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list content backups: " + err.message });
  }
});

// Restore backup
app.post("/api/backups/restore", authRequired, (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename || filename.includes("/") || filename.includes("..") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid backup filename payload" });
    }
    const targetPath = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: "Backup file not found in database backups repository" });
    }
    
    // Save current as pre-restore fallback to avoid any user lockouts
    if (fs.existsSync(CONTENT_FILE)) {
      try {
        const currentData = fs.readFileSync(CONTENT_FILE, "utf8");
        const fallbackName = `content-pre-restore-${Date.now()}.json`;
        fs.writeFileSync(path.join(BACKUPS_DIR, fallbackName), currentData, "utf8");
      } catch (fallbackErr) {}
    }

    const backupData = fs.readFileSync(targetPath, "utf8");
    // Validate JSON parsing
    JSON.parse(backupData);
    
    fs.writeFileSync(CONTENT_FILE, backupData, "utf8");
    res.json({ success: true, message: `System content restored to checkpoint: ${filename.replace(/^\d+-/, "")}` });
  } catch (err: any) {
    res.status(500).json({ error: "Rollback operation failed: " + err.message });
  }
});

// Delete specific backup
app.delete("/api/backups/:filename", authRequired, (req, res) => {
  try {
    const { filename } = req.params;
    if (filename.includes("/") || filename.includes("..") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid filename" });
    }
    const targetPath = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: "Backup snapshot file not found" });
    }
    fs.unlinkSync(targetPath);
    res.json({ success: true, message: "Backup snapshot successfully deleted" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to purge backup file: " + err.message });
  }
});

// ---------------- SYSTEM HEALTH MONITOR ENDPOINT -----------------

app.get("/api/system/status", authRequired, (req, res) => {
  try {
    const uptimeSec = Math.floor(process.uptime());
    const days = Math.floor(uptimeSec / (3600 * 24));
    const hrs = Math.floor((uptimeSec % (3600 * 24)) / 3600);
    const mins = Math.floor((uptimeSec % 3600) / 60);
    const secs = Math.floor(uptimeSec % 60);
    const uptimeStr = `${days > 0 ? days + "d " : ""}${hrs > 0 ? hrs + "h " : ""}${mins}m ${secs}s`;

    let dbSize = 0;
    if (fs.existsSync(CONTENT_FILE)) {
      dbSize += fs.statSync(CONTENT_FILE).size;
    }
    if (fs.existsSync(USERS_FILE)) {
      dbSize += fs.statSync(USERS_FILE).size;
    }

    let uploadSize = 0;
    let uploadCount = 0;
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith("."));
      uploadCount = files.length;
      for (const f of files) {
        try {
          const fsStat = fs.statSync(path.join(UPLOADS_DIR, f));
          uploadSize += fsStat.size;
        } catch (e) {}
      }
    }

    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memUsagePercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(1);

    res.json({
      success: true,
      metrics: {
        uptime: uptimeStr,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        cpuModel: os.cpus()[0]?.model || "Common Cloud Instance",
        memoryTotal: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        memoryFree: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        memoryPercent: `${memUsagePercent}%`,
        processMemory: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        dbSizeBytes: dbSize,
        dbSizeFormatted: `${(dbSize / 1024).toFixed(2)} KB`,
        uploadSizeFormatted: `${(uploadSize / 1024 / 1024).toFixed(2)} MB`,
        uploadCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to gather sovereign system metrics: " + err.message });
  }
});

// Direct safe system file download broker (for backups & audit capability)
app.get("/api/system/download-file", authRequired, (req, res) => {
  try {
    const { file } = req.query;
    if (!file || typeof file !== "string") {
      return res.status(400).json({ error: "Missing file parameter query" });
    }

    let targetFilePath = "";
    let downloadFilename = "";

    if (file === "content.json") {
      const pathsToTry = [
        CONTENT_FILE,
        path.join(process.cwd(), "data", "content.json"),
        path.resolve(__dirname, "../data/content.json"),
        path.resolve(__dirname, "../../data/content.json"),
        "/data/content.json"
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          targetFilePath = p;
          break;
        }
      }
      if (!targetFilePath) targetFilePath = CONTENT_FILE;
      downloadFilename = "content.json";
    } else if (file === "users.json") {
      const pathsToTry = [
        USERS_FILE,
        path.join(process.cwd(), "data", "users.json"),
        path.resolve(__dirname, "../data/users.json"),
        path.resolve(__dirname, "../../data/users.json"),
        "/data/users.json"
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          targetFilePath = p;
          break;
        }
      }
      if (!targetFilePath) targetFilePath = USERS_FILE;
      downloadFilename = "users.json";
    } else if (file === "package-lock.json") {
      const pathsToTry = [
        path.join(process.cwd(), "package-lock.json"),
        path.resolve(__dirname, "package-lock.json"),
        path.resolve(__dirname, "../package-lock.json"),
        path.resolve(__dirname, "../../package-lock.json"),
        "/package-lock.json"
      ];
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          targetFilePath = p;
          break;
        }
      }
      if (!targetFilePath) {
        targetFilePath = path.join(process.cwd(), "package-lock.json");
      }
      downloadFilename = "package-lock.json";
    } else {
      return res.status(400).json({ error: "Target file access is restricted or unsupported" });
    }

    if (!fs.existsSync(targetFilePath)) {
      return res.status(404).json({ error: `File ${downloadFilename} is not present on host disk.` });
    }

    // Use built-in Express download broker which sets perfect attachment headers and stream flow
    res.download(targetFilePath, downloadFilename, (err) => {
      if (err) {
        console.error("Downloader pipe failure:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Attachment streaming failed: " + err.message });
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to pipe document stream: " + err.message });
  }
});

// Media Management Endpoints
app.get("/api/media", authRequired, (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const mediaList = files
      .filter((file) => !file.startsWith("."))
      .map((file) => {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          uploadedAt: stats.mtime.toISOString(),
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    res.json({ success: true, media: mediaList });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to list media: " + e.message });
  }
});

// Media deletion
app.delete("/api/media/:filename", authRequired, (req, res) => {
  try {
    const { filename } = req.params;
    // Simple path traversal inspection
    if (filename.includes("/") || filename.includes("..") || filename.includes("\\")) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: "Asset successfully deleted!" });
    } else {
      return res.status(404).json({ error: "File not found" });
    }
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete file: " + e.message });
  }
});

// Base64 upload endpoint (avoids complex multipart dependency handling)
app.post("/api/upload", authRequired, (req, res) => {
  const { filename, fileData } = req.body;
  if (!filename || !fileData) {
    return res.status(400).json({ error: "Filename and fileData payload are required" });
  }

  try {
    // Sanitize filename
    const ext = path.extname(filename).toLowerCase();
    const cleanBasename = path
      .basename(filename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .toLowerCase();

    // Ensure unique name
    const timestampName = `${Date.now()}-${cleanBasename}${ext || ".png"}`;
    const targetPath = path.join(UPLOADS_DIR, timestampName);

    // Parse base64
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let base64Body = fileData;
    if (matches && matches.length === 3) {
      base64Body = matches[2];
    }

    const buffer = Buffer.from(base64Body, "base64");
    fs.writeFileSync(targetPath, buffer);

    res.json({
      success: true,
      url: `/uploads/${timestampName}`,
      filename: timestampName,
    });
  } catch (e: any) {
    res.status(500).json({ error: "Upload failed: " + e.message });
  }
});

// ----------------- VITE ENDPOINT OR STATIC INTEGRATION -----------------

async function serve() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting backend server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting backend server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Constantech server running at http://localhost:${PORT}`);
  });
}

serve().catch((err) => {
  console.error("Failed to start server: ", err);
});
