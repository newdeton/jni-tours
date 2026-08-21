import jwt from "jsonwebtoken";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| JNI TOURS — AUTHENTICATION & AUTHORIZATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Authentication:
|
|   Bearer JWT
|       ↓
|   Verify JWT
|       ↓
|   Find current User in MongoDB
|       ↓
|   Check account status
|       ↓
|   req.user
|
| Authorization:
|
|   requireAuth
|       ↓
|   requireAdmin
|       ↓
|   Current MongoDB role === "admin"
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| JWT SECRET
|--------------------------------------------------------------------------
*/

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured in the environment."
    );
  }

  return secret;
}

/*
|--------------------------------------------------------------------------
| EXTRACT BEARER TOKEN
|--------------------------------------------------------------------------
|
| Accepts:
|
| Authorization: Bearer <token>
|
|--------------------------------------------------------------------------
*/

function extractToken(req) {
  const authorization =
    req.headers.authorization;

  if (
    !authorization ||
    typeof authorization !== "string"
  ) {
    return null;
  }

  const parts =
    authorization.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== "bearer"
  ) {
    return null;
  }

  const token = parts[1]?.trim();

  return token || null;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE ROLE
|--------------------------------------------------------------------------
*/

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

/*
|--------------------------------------------------------------------------
| FIND USER FROM TOKEN
|--------------------------------------------------------------------------
|
| The JWT identifies the user.
|
| The database remains the source of truth for:
|
| - role
| - account status
| - email
| - current account information
|
|--------------------------------------------------------------------------
*/

async function findUserFromToken(token) {
  let decoded;

  /*
  |--------------------------------------------------------------------------
  | VERIFY JWT
  |--------------------------------------------------------------------------
  */

  try {
    decoded = jwt.verify(
      token,
      getJwtSecret()
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | EXPIRED TOKEN
    |--------------------------------------------------------------------------
    */

    if (
      error?.name ===
      "TokenExpiredError"
    ) {
      const authError =
        new Error(
          "Your session has expired. Please login again."
        );

      authError.code =
        "TOKEN_EXPIRED";

      authError.status = 401;

      throw authError;
    }

    /*
    |--------------------------------------------------------------------------
    | INVALID TOKEN
    |--------------------------------------------------------------------------
    */

    if (
      error?.name ===
      "JsonWebTokenError"
    ) {
      const authError =
        new Error(
          "Invalid authentication token. Please login again."
        );

      authError.code =
        "INVALID_TOKEN";

      authError.status = 401;

      throw authError;
    }

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE JWT PAYLOAD
  |--------------------------------------------------------------------------
  |
  | Support the common identifier names used by
  | different login implementations.
  |
  |--------------------------------------------------------------------------
  */

  if (
    !decoded ||
    typeof decoded !== "object"
  ) {
    const authError =
      new Error(
        "Invalid authentication token."
      );

    authError.code =
      "INVALID_TOKEN";

    authError.status = 401;

    throw authError;
  }

  const userId =
    decoded.userId ||
    decoded.id ||
    decoded._id;

  if (!userId) {
    const authError =
      new Error(
        "Invalid authentication token."
      );

    authError.code =
      "INVALID_TOKEN";

    authError.status = 401;

    throw authError;
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD CURRENT USER
  |--------------------------------------------------------------------------
  */

  let user;

  try {
    user =
      await User.findById(userId);
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | INVALID MONGODB OBJECT ID
    |--------------------------------------------------------------------------
    */

    if (
      error?.name ===
      "CastError"
    ) {
      const authError =
        new Error(
          "Invalid authentication token."
        );

      authError.code =
        "INVALID_TOKEN";

      authError.status = 401;

      throw authError;
    }

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | USER DOES NOT EXIST
  |--------------------------------------------------------------------------
  */

  if (!user) {
    const authError =
      new Error(
        "User account no longer exists."
      );

    authError.code =
      "USER_NOT_FOUND";

    authError.status = 401;

    throw authError;
  }

  /*
  |--------------------------------------------------------------------------
  | ACCOUNT STATUS
  |--------------------------------------------------------------------------
  |
  | Only explicitly inactive accounts are blocked.
  |
  | This also prevents older user records that do not have
  | an isActive field from accidentally becoming unusable.
  |
  |--------------------------------------------------------------------------
  */

  if (user.isActive === false) {
    const authError =
      new Error(
        "Your account has been deactivated."
      );

    authError.code =
      "ACCOUNT_DEACTIVATED";

    authError.status = 403;

    throw authError;
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| REQUIRE AUTHENTICATION
|--------------------------------------------------------------------------
|
| Protects:
|
| - Customer dashboard
| - My bookings
| - Creating bookings
| - Viewing bookings
| - Updating bookings
| - Customer profile
| - Payments
| - Admin routes
|
|--------------------------------------------------------------------------
*/

export async function requireAuth(
  req,
  res,
  next
) {
  try {
    const token =
      extractToken(req);

    /*
    |--------------------------------------------------------------------------
    | NO TOKEN
    |--------------------------------------------------------------------------
    */

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication is required. Please login.",
        code: "AUTH_REQUIRED",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATE USER
    |--------------------------------------------------------------------------
    */

    const user =
      await findUserFromToken(
        token
      );

    /*
    |--------------------------------------------------------------------------
    | ATTACH USER TO REQUEST
    |--------------------------------------------------------------------------
    */

    req.user = user;

    /*
    |--------------------------------------------------------------------------
    | ADMIN FLAG
    |--------------------------------------------------------------------------
    |
    | This is only a convenience flag.
    |
    | Actual admin authorization is still performed
    | by requireAdmin().
    |
    |--------------------------------------------------------------------------
    */

    req.isAdmin =
      normalizeRole(
        user.role
      ) === "admin";

    /*
    |--------------------------------------------------------------------------
    | CONTINUE
    |--------------------------------------------------------------------------
    */

    return next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error
    );

    const status =
      Number.isInteger(
        error?.status
      )
        ? error.status
        : 500;

    return res.status(status).json({
      success: false,

      message:
        error?.message ||
        "Unable to authenticate your request.",

      code:
        error?.code ||
        "AUTH_ERROR",
    });
  }
}

/*
|--------------------------------------------------------------------------
| PROTECT ALIAS
|--------------------------------------------------------------------------
|
| Some routes may use:
|
| protect
|
| Keep it as an alias of requireAuth().
|
|--------------------------------------------------------------------------
*/

export const protect =
  requireAuth;

/*
|--------------------------------------------------------------------------
| REQUIRE ADMIN
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This middleware MUST run AFTER requireAuth().
|
| Correct:
|
| router.use(
|   requireAuth,
|   requireAdmin
| );
|
|--------------------------------------------------------------------------
*/

export function requireAdmin(
  req,
  res,
  next
) {
  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATION CHECK
  |--------------------------------------------------------------------------
  */

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication is required.",
      code: "AUTH_REQUIRED",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | READ CURRENT DATABASE ROLE
  |--------------------------------------------------------------------------
  */

  const rawRole =
    req.user.role;

  const role =
    normalizeRole(rawRole);

  /*
  |--------------------------------------------------------------------------
  | ADMIN DIAGNOSTIC
  |--------------------------------------------------------------------------
  |
  | This is intentionally logged on the server only.
  |
  | It will immediately tell us whether the MongoDB account
  | actually has the admin role.
  |
  |--------------------------------------------------------------------------
  */

  console.log(
    "[JNI TOURS ADMIN AUTH]",
    {
      userId:
        req.user._id?.toString(),

      email:
        req.user.email || "unknown",

      rawRole:
        rawRole ?? null,

      normalizedRole:
        role || "none",
    }
  );

  /*
  |--------------------------------------------------------------------------
  | ADMIN ROLE CHECK
  |--------------------------------------------------------------------------
  */

  if (role !== "admin") {
    console.warn(
      `[JNI TOURS ADMIN AUTH] ACCESS DENIED | user=${
        req.user.email ||
        req.user._id ||
        "unknown"
      } | role=${
        role || "none"
      }`
    );

    return res.status(403).json({
      success: false,
      message:
        "Administrator access is required.",
      code: "ADMIN_REQUIRED",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | ADMIN AUTHORIZED
  |--------------------------------------------------------------------------
  */

  req.isAdmin = true;

  return next();
}

/*
|--------------------------------------------------------------------------
| OPTIONAL AUTHENTICATION
|--------------------------------------------------------------------------
|
| Used by public routes where authentication is optional.
|
| Examples:
|
| - Public tour pages
| - Public destinations
| - Public homepage
|
| No token:
|   req.user = null
|
| Valid token:
|   req.user = User
|
| Invalid/expired token:
|   req.user = null
|
|--------------------------------------------------------------------------
*/

export async function optionalAuth(
  req,
  res,
  next
) {
  try {
    const token =
      extractToken(req);

    /*
    |--------------------------------------------------------------------------
    | PUBLIC VISITOR
    |--------------------------------------------------------------------------
    */

    if (!token) {
      req.user = null;
      req.isAdmin = false;

      return next();
    }

    /*
    |--------------------------------------------------------------------------
    | TRY AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    try {
      const user =
        await findUserFromToken(
          token
        );

      req.user = user;

      req.isAdmin =
        normalizeRole(
          user.role
        ) === "admin";
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | OPTIONAL AUTH
      |--------------------------------------------------------------------------
      |
      | Invalid authentication must not block
      | public routes.
      |
      |--------------------------------------------------------------------------
      */

      req.user = null;
      req.isAdmin = false;
    }

    return next();
  } catch (error) {
    console.error(
      "Optional authentication error:",
      error
    );

    req.user = null;
    req.isAdmin = false;

    return next();
  }
}

/*
|--------------------------------------------------------------------------
| ADMIN HELPER
|--------------------------------------------------------------------------
|
| Can be used inside controllers/services:
|
| isAdminUser(req.user)
|
|--------------------------------------------------------------------------
*/

export function isAdminUser(
  user
) {
  if (!user) {
    return false;
  }

  return (
    normalizeRole(
      user.role
    ) === "admin"
  );
}

/*
|--------------------------------------------------------------------------
| EXPORT ROLE NORMALIZER
|--------------------------------------------------------------------------
|
| Useful if another middleware/controller needs to
| normalize a role consistently.
|
|--------------------------------------------------------------------------
*/

export {
  normalizeRole,
};