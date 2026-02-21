import jwt from "jsonwebtoken";

// Page 1: Secure access and identity verification [cite: 11]
export const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No authentication token provided." });
  }

  try {
    // Verify the JWT and attach the payload (id, role) to the request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid or expired session token." });
  }
};

// Page 1: Role-Based Access Control (RBAC)
// Restricts access to specific pages like Analytics (Page 8) or Safety (Page 7)
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure the user exists and their role matches the PRD requirements [cite: 4, 12]
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user?.role || "Guest"}) does not have permission to access this module.`,
      });
    }
    next();
  };
};
