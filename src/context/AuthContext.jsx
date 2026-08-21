import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/auth`
    : "http://localhost:5000/api/auth";

const TOKEN_KEY = "jni_tours_token";
const USER_KEY = "jni_tours_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | SAFE JSON RESPONSE
  |--------------------------------------------------------------------------
  */

  const parseResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();

    return {
      success: false,
      message:
        text ||
        `Server returned HTTP ${response.status}`,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  const saveAuthentication = useCallback(
    (authenticationToken, authenticatedUser) => {
      localStorage.setItem(
        TOKEN_KEY,
        authenticationToken
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(authenticatedUser)
      );

      setToken(authenticationToken);
      setUser(authenticatedUser);
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | CLEAR AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  const clearAuthentication = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | GET CURRENT USER
  |--------------------------------------------------------------------------
  */

  const fetchCurrentUser = useCallback(
    async (authenticationToken) => {
      if (!authenticationToken) {
        return null;
      }

      try {
        const response = await fetch(
          `${API_URL}/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authenticationToken}`,
            },
          }
        );

        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Your session has expired."
          );
        }

        const authenticatedUser =
          data.user ||
          data.data?.user ||
          data.data;

        if (!authenticatedUser) {
          throw new Error(
            "The server returned no user information."
          );
        }

        setUser(authenticatedUser);

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(authenticatedUser)
        );

        return authenticatedUser;
      } catch (error) {
        console.error(
          "Fetch current user error:",
          error
        );

        clearAuthentication();

        return null;
      }
    },
    [clearAuthentication]
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL AUTHENTICATION CHECK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const savedToken =
          localStorage.getItem(TOKEN_KEY);

        if (!savedToken) {
          if (mounted) {
            setLoading(false);
          }

          return;
        }

        await fetchCurrentUser(savedToken);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [fetchCurrentUser]);

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  const register = async (userData) => {
    try {
      setError("");

      if (
        !userData ||
        typeof userData !== "object"
      ) {
        throw new Error(
          "Invalid registration information."
        );
      }

      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create your account."
        );
      }

      const authenticationToken =
        data.token ||
        data.data?.token;

      const authenticatedUser =
        data.user ||
        data.data?.user;

      if (
        !authenticationToken ||
        !authenticatedUser
      ) {
        throw new Error(
          "Account was created but authentication information was not returned."
        );
      }

      saveAuthentication(
        authenticationToken,
        authenticatedUser
      );

      return authenticatedUser;
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to create your account."
      );

      throw error;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (credentials) => {
    try {
      setError("");

      if (
        !credentials ||
        typeof credentials !== "object"
      ) {
        throw new Error(
          "Email and password are required."
        );
      }

      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      const authenticationToken =
        data.token ||
        data.data?.token;

      const authenticatedUser =
        data.user ||
        data.data?.user;

      if (
        !authenticationToken ||
        !authenticatedUser
      ) {
        throw new Error(
          "Login succeeded but authentication information was not returned."
        );
      }

      saveAuthentication(
        authenticationToken,
        authenticatedUser
      );

      return authenticatedUser;
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.message ||
          "Unable to login."
      );

      throw error;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    clearAuthentication();
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR ERROR
  |--------------------------------------------------------------------------
  */

  const clearAuthError = () => {
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATED STATE
  |--------------------------------------------------------------------------
  */

  const isAuthenticated =
    Boolean(token && user);

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,

    register,
    login,
    logout,

    fetchCurrentUser,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| HOOK
|--------------------------------------------------------------------------
*/

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;