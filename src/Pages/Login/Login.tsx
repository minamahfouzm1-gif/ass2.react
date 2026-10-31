import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as zod from "zod";

interface userData {
  email: string; // أو username حسب الـ API
  password: string;
}

const Loginschema = zod.object({
  email: zod
    .string()
    .nonempty("Email or username is required")
    .min(3, "Min length is 3 characters"),

  password: zod
    .string()
    .nonempty("Password is required")
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character",
    ),
});

export default function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<userData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(Loginschema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  function handleLogin(values: userData) {
    setIsLoading(true);
    setApiError(null);

    axios
      .post(`https://route-posts.routemisr.com/users/signin`, values)
      .then((res) => {
        console.log("res.data =", res.data);
        console.log("token =", res.data.data.token);

        if (res.data.success) {
          localStorage.setItem("token", res.data.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
          navigate("/home");
        }
      })
      .catch((err) => {
        setApiError(err.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <section className="order-1 w-full max-w-[430px] lg:order-2">
      <div className="rounded-2xl bg-white p-4 sm:p-6">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Log in to Route Posts
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Log in and continue your social journey.
        </p>

        {/* رسالة خطأ الـ API */}
        {apiError && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(handleLogin)}
          noValidate
          className="mt-5 space-y-3.5"
        >
          {/* Email or Username */}
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                {...register("email")}
                placeholder="Email or username"
                className="w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:bg-white border-slate-200 focus:border-[#00298d]"
                type="text"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
                  <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              </span>
              <input
                {...register("password")}
                placeholder="Password"
                className="w-full rounded-xl border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:bg-white border-slate-200 focus:border-[#00298d]"
                type="password"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl py-3 text-base font-extrabold text-white transition disabled:opacity-60 bg-[#00298d] hover:bg-[#001f6b]"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>

          <button
            type="button"
            className="mx-auto block text-sm font-semibold text-[#00298d] transition hover:underline"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </section>
  );
}
