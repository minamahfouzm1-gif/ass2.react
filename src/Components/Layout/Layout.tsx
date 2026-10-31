import Navbar from "../Navbar/Navbar";

import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Navbar />

      <main>
          <Outlet />
      </main>
    </>
  );
};

export default Layout;






















<div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
  <div className="mb-3">
    <h3 className="text-lg font-extrabold text-slate-900">
      Adjust profile photo
    </h3>
    <p className="text-sm text-slate-500">
      Drag to reposition and use zoom for perfect framing.
    </p>
  </div>
  <div className="mx-auto w-full max-w-[340px] overflow-x-auto pb-1">
    <div className="relative h-[320px] w-[320px] touch-none overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
      <img
        alt="Crop preview"
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 select-none"
        src=""
        style={{
          width: 236,
          height: 354,
          maxWidth: "none",
          maxHeight: "none",
          transform:
            "translate(calc(-50% + 0px), calc(-50% + 0px)) scale(1.35593)",
          transformOrigin: "center center",
        }}
      />
    </div>
  </div>
  <div className="mt-4 space-y-2">
    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
      <span>Zoom</span>
      <span>1.00x</span>
    </div>
    <input
      min="1"
      max="3"
      step="0.01"
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1877f2]"
      type="range"
      value="1"
    />
  </div>
  <div className="mt-4">
    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
      Post privacy
    </p>
    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#1877f2]">
      <option value="public">Public</option>
      <option value="following">Followers</option>
      <option value="only_me">Only me</option>
    </select>
  </div>
  <div className="mt-5 flex items-center justify-end gap-2">
    <button
      type="button"
      className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
    >
      Cancel
    </button>
    <button
      type="button"
      className="inline-flex items-center rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
    >
      Save photo
    </button>
  </div>
</div>