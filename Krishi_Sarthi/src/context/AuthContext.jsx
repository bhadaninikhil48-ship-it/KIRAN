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
                  phone: p.phone || "",
                  village: p.village || "",
                  district: p.district || "",
                  state: p.state || "",
                };
                if (p.district && p.state) {
                  cachedLocation = `${p.district.trim()} • ${p.state.trim()}`;
                  localStorage.setItem(`kiran_location_${response.user.id}`, cachedLocation);
                } else {
                  cachedLocation = null;
                  localStorage.removeItem(`kiran_location_${response.user.id}`);
                }
              }
            } catch {
              // Ignore if profile fetch is unavailable
            }
          } else if (response.user.role === "fpo") {
            try {
              const profileRes = await api.get("/api/fpo/profile");
              if (profileRes?.profile) {
                const p = profileRes.profile;
                extraProfile = {
                  phone: p.phone || "",
                  village: p.village_locality || "",
                  district: p.district || "",
                  state: p.state || "",
                };
                if (p.district && p.state) {
                  cachedLocation = `${p.district.trim()} • ${p.state.trim()}`;
                  localStorage.setItem(`kiran_location_${response.user.id}`, cachedLocation);
                } else {
                  cachedLocation = null;
                  localStorage.removeItem(`kiran_location_${response.user.id}`);
                }
              }
            } catch {
              // Ignore if profile fetch is unavailable
            }
          } else if (response.user.role === "buyer") {
            try {
              const savedBuyerProfile = localStorage.getItem(`kiran_profile_${response.user.id}`);
              if (savedBuyerProfile) {
                const bp = JSON.parse(savedBuyerProfile);
                extraProfile = {
                  phone: bp.phone || "",
                  village: bp.village || "",
                  district: bp.district || "",
                  state: bp.state || "",
                };
                if (bp.district && bp.state) {
                  cachedLocation = `${bp.district.trim()} • ${bp.state.trim()}`;
                  localStorage.setItem(`kiran_location_${response.user.id}`, cachedLocation);
                }
              }
            } catch {}
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

  const login = async (userData, jwtToken) => {
    const cachedAvatar =
      userData?.avatar ||
      (userData?.id ? localStorage.getItem(`kiran_avatar_${userData.id}`) : null);
    let cachedLocation =
      userData?.location ||
      (userData?.id ? localStorage.getItem(`kiran_location_${userData.id}`) : null);
    let extraProfile = {};

    if (userData?.role === "farmer") {
      try {
        const profileRes = await api.get("/api/farmer/profile", {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (profileRes?.profile) {
          const p = profileRes.profile;
          extraProfile = {
            phone: p.phone || "",
            village: p.village || "",
            district: p.district || "",
            state: p.state || "",
          };
          if (p.district && p.state) {
            cachedLocation = `${p.district.trim()} • ${p.state.trim()}`;
            localStorage.setItem(`kiran_location_${userData.id}`, cachedLocation);
          } else {
            cachedLocation = null;
            localStorage.removeItem(`kiran_location_${userData.id}`);
          }
        }
      } catch (err) {
        console.warn("Could not fetch farmer profile on login:", err);
      }
    } else if (userData?.role === "fpo") {
      try {
        const profileRes = await api.get("/api/fpo/profile", {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (profileRes?.profile) {
          const p = profileRes.profile;
          extraProfile = {
            phone: p.phone || "",
            village: p.village_locality || "",
            district: p.district || "",
            state: p.state || "",
          };
          if (p.district && p.state) {
            cachedLocation = `${p.district.trim()} • ${p.state.trim()}`;
            localStorage.setItem(`kiran_location_${userData.id}`, cachedLocation);
          } else {
            cachedLocation = null;
            localStorage.removeItem(`kiran_location_${userData.id}`);
          }
        }
      } catch (err) {
        console.warn("Could not fetch fpo profile on login:", err);
      }
    } else if (userData?.role === "buyer") {
      try {
        const savedBuyerProfile = localStorage.getItem(`kiran_profile_${userData.id}`);
        if (savedBuyerProfile) {
          const bp = JSON.parse(savedBuyerProfile);
          extraProfile = {
            phone: bp.phone || "",
            village: bp.village || "",
            district: bp.district || "",
            state: bp.state || "",
          };
          if (bp.district && bp.state) {
            cachedLocation = `${bp.district.trim()} • ${bp.state.trim()}`;
            localStorage.setItem(`kiran_location_${userData.id}`, cachedLocation);
          }
        }
      } catch {}
    }

    const mergedUser = {
      ...userData,
      ...extraProfile,
      avatar: cachedAvatar || null,
      location: cachedLocation || null,
    };
    setUser(mergedUser);
    setToken(jwtToken);
    localStorage.setItem("user", JSON.stringify(mergedUser));
    localStorage.setItem("token", jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      if (next.district && next.state) {
        next.location = `${next.district.trim()} • ${next.state.trim()}`;
        if (next.id) localStorage.setItem(`kiran_location_${next.id}`, next.location);
      } else {
        next.location = null;
        if (next.id) localStorage.removeItem(`kiran_location_${next.id}`);
      }
      localStorage.setItem("user", JSON.stringify(next));
      if (next?.id && updatedFields.avatar !== undefined) {
        if (updatedFields.avatar) {
          localStorage.setItem(`kiran_avatar_${next.id}`, updatedFields.avatar);
        } else {
          localStorage.removeItem(`kiran_avatar_${next.id}`);
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
        updateUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
