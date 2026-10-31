import { useState } from "react";
import Register from "../../Pages/Register/Register";
import Login from "../../Pages/Login/Login";

const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div className="min-h-screen bg-[#f2f6ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: ثابت في الحالتين */}
        <section className="order-2 w-full max-w-xl text-center lg:order-1 lg:text-left">
          <h1 className="hidden text-5xl font-extrabold tracking-tight text-[#00298d] sm:text-6xl lg:block">
            Route Posts
          </h1>
          <p className="mt-4 hidden text-2xl font-medium leading-snug text-slate-800 lg:block">
            Connect with friends and the world around you on Route Posts.
          </p>
          <div className="mt-6 rounded-2xl border border-[#c9d5ff] bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#00298d]">
              About Route Academy
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              Egypt's Leading IT Training Center Since 2012
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Route Academy is the premier IT training center in Egypt,
              established in 2012. We specialize in delivering high-quality
              training courses in programming, web development, and application
              development. We've identified the unique challenges people may
              face when learning new technology and made efforts to provide
              strategies to overcome them.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-[#c9d5ff] bg-[#f2f6ff] px-3 py-2">
                <p className="text-base font-extrabold text-[#00298d]">2012</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Founded
                </p>
              </div>
              <div className="rounded-xl border border-[#c9d5ff] bg-[#f2f6ff] px-3 py-2">
                <p className="text-base font-extrabold text-[#00298d]">40K+</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Graduates
                </p>
              </div>
              <div className="rounded-xl border border-[#c9d5ff] bg-[#f2f6ff] px-3 py-2">
                <p className="text-base font-extrabold text-[#00298d]">50+</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Partner Companies
                </p>
              </div>
              <div className="rounded-xl border border-[#c9d5ff] bg-[#f2f6ff] px-3 py-2">
                <p className="text-base font-extrabold text-[#00298d]">5</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Branches
                </p>
              </div>
              <div className="rounded-xl border border-[#c9d5ff] bg-[#f2f6ff] px-3 py-2">
                <p className="text-base font-extrabold text-[#00298d]">20</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Diplomas Available
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Right side: Login أو Register */}
        <section className="order-1 w-full max-w-[430px] lg:order-2">
          <div className="rounded-2xl bg-white p-4 sm:p-6">
            <div className="mb-4 text-center lg:hidden">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#00298d]">
                Route Posts
              </h1>
              <p className="mt-1 text-base font-medium leading-snug text-slate-700">
                Connect with friends and the world around you on Route Posts.
              </p>
            </div>
            <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`rounded-lg py-2 text-sm font-extrabold transition ${
                  isLogin
                    ? "bg-white text-[#00298d] shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`rounded-lg py-2 text-sm font-extrabold transition ${
                  !isLogin
                    ? "bg-white text-[#00298d] shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Register
              </button>
            </div>
            {isLogin ? <Login /> : <Register />}
          </div>
        </section>
      </div>
    </div>
  );
};
export default AuthLayout;
