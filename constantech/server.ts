import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { defaultSiteContent } from "./src/defaultData.js";

const app = express();
const PORT = 3000;

// Increase payload limits for base64 media uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup Directories
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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

    fs.writeFileSync(CONTENT_FILE, JSON.stringify(newContent, null, 2), "utf8");
    res.json({ success: true, message: "CMS Content updated successfully!" });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to write content: " + e.message });
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
