import { createContext, useState, useEffect } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      if (parsed?.id) {
        const cachedAvatar = localStorage.getItem(`kiran_avatar_${parsed.id}`);
        if (cachedAvatar) {
          parsed.avatar = cachedAvatar;
        }
        const cachedLocation = localStorage.getItem(`kiran_location_${parsed.id}`);
        if (cachedLocation) {
          parsed.location = cachedLocation;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate session on app initialization
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        if (response?.user) {
          const cachedAvatar =
            (response.user.id && localStorage.getItem(`kiran_avatar_${response.user.id}`)) ||
            user?.avatar ||
            null;
          let cachedLocation =
            (response.user.id && localStorage.getItem(`kiran_location_${response.user.id}`)) ||
            user?.location ||
            null;

          let extraProfile = {};
          if (response.user.role === "farmer") {
            try {
              const profileRes = await api.get("/api/farmer/profile");
              if (profileRes?.profile) {
                const p = profileRes.profile;
                extraProfile = {
                  phone: p.phone,
                  village: p.village,
                  district: p.district,
                  state: p.state,
                };
                const formattedLoc = [p.village || p.district, p.state].filter(Boolean).join(" • ");
                if (formattedLoc) {
                  cachedLocation = formattedLoc;
                  localStorage.setItem(`kiran_location_${response.user.id}`, formattedLoc);
                }
              }
            } catch {
              // Ignore if profile fetch is unavailable
            }
          }

          const mergedUser = {
            ...response.user,
            ...extraProfile,
            avatar: cachedAvatar,
            location: cachedLocation,
          };
          setUser(mergedUser);
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } catch (err) {
        console.warn("Session verification failed, logging out:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(() => {
    try {
      return sessionStorage.getItem("kiran_logout") === "true";
    } catch {
      return false;
    }
  });

  const clearLoggingOut = () => {
    try {
      sessionStorage.removeItem("kiran_logout");
    } catch {
      // Ignore storage errors
    }
    setIsLoggingOut(false);
  };

  const login = (userData, jwtToken) => {
    clearLoggingOut();
    const cachedAvatar =
      userData?.avatar ||
      (userData?.id ? localStorage.getItem(`kiran_avatar_${userData.id}`) : null);
    const cachedLocation =
      userData?.location ||
      (userData?.id ? localStorage.getItem(`kiran_location_${userData.id}`) : null);
    const mergedUser = { ...userData, avatar: cachedAvatar || null, location: cachedLocation || null };
    setUser(mergedUser);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(mergedUser));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    try {
      sessionStorage.setItem("kiran_logout", "true");
    } catch {
      // Ignore storage errors
    }
    setIsLoggingOut(true);
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(next));
      if (next?.id && updatedFields.avatar !== undefined) {
        if (updatedFields.avatar) {
          localStorage.setItem(`kiran_avatar_${next.id}`, updatedFields.avatar);
        } else {
          localStorage.removeItem(`kiran_avatar_${next.id}`);
        }
      }
      if (next?.id && updatedFields.location !== undefined) {
        if (updatedFields.location) {
          localStorage.setItem(`kiran_location_${next.id}`, updatedFields.location);
        } else {
          localStorage.removeItem(`kiran_location_${next.id}`);
        }
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        clearLoggingOut,
        isLoggingOut,
        updateUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
