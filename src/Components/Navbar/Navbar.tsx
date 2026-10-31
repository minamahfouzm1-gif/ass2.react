import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setisMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
          <div className="flex items-center gap-3">
            <img
              alt="Route Posts"
              className="h-9 w-9 rounded-xl object-cover"
              src="../../../src/assets/route (1).png"
            />
            <p className="hidden text-xl font-extrabold text-slate-900 sm:block">
              Route Posts
            </p>
          </div>

          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/90 px-1 py-1 sm:px-1.5">
            <NavLink
              className="relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 bg-white text-[#1f6fe5]"
              to="/home"
            >
              <span className="hidden sm:inline">Feed</span>
            </NavLink>

            <NavLink
              className="relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 text-slate-600 hover:bg-white/90 hover:text-slate-900"
              to="/profile"
            >
              <span className="hidden sm:inline">Profile</span>
            </NavLink>

            <NavLink
              className="relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 text-slate-600 hover:bg-white/90 hover:text-slate-900"
              to="/notification"
            >
              <span className="hidden sm:inline">Notifications</span>
            </NavLink>
          </nav>

          <div className="relative">
            <button
              onClick={() => setisMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
            >
              <img
                alt={user.name || "user"}
                className="h-8 w-8 rounded-full object-cover"
                src={
                  user.photo ||
                  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                }
              />

              <span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-800 md:block">
                {user.name || "User"}
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <NavLink
                  to="/profile"
                  onClick={() => setisMenuOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Profile
                </NavLink>

                <NavLink
                  to="/setting"
                  onClick={() => setisMenuOpen(false)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  Settings
                </NavLink>

                <div className="my-1 border-t border-slate-200"></div>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
