import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"investor" | "ops">("investor");
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (phone.length === 10) setOtpSent(true);
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      navigate(`/${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold tracking-tight">LiquiBonds</span>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900">
                Home
              </a>
              <a href="#" className="hover:text-slate-900">
                How this works
              </a>
            </nav>
          </div>
          <div>
            <Button className="text-xs rounded-sm h-8 px-4" variant="outline">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Login</h1>
            <p className="text-sm text-slate-500">Enter your mobile number to access your account</p>
          </div>

          <div className="card-elevated p-6 space-y-5">
            {/* Role selector for demo */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Login as (Demo)</Label>
              <div className="flex gap-2">
                {(["investor", "ops"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 text-xs py-2 rounded border transition-colors ${
                      role === r
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm rounded-sm border border-input">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Mobile Number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="rounded-sm"
                />
              </div>
            </div>

            {!otpSent ? (
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm"
                disabled={phone.length !== 10}
                onClick={handleSendOtp}
              >
                Send OTP
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="rounded-sm text-center text-lg tracking-[0.5em]"
                  />
                  <p className="text-xs text-slate-500">
                    OTP sent to +91 {phone}{" "}
                    <button className="text-accent hover:underline">Resend</button>
                  </p>
                </div>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm"
                  disabled={otp.length !== 6}
                  onClick={handleVerify}
                >
                  Verify & Login
                </Button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-slate-500">
            By continuing, you agree to LiquiBonds Terms & Privacy Policy
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-200">
        <div className="container mx-auto px-4 py-10 md:grid md:grid-cols-3 md:gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">LiquiBonds</span>
            </div>
            <p className="text-xs text-slate-400">
              Your trusted partner for fixed income investments. Access curated bonds with
              transparency and security.
            </p>
          </div>

          <div className="mt-8 md:mt-0">
            <h3 className="text-sm font-semibold text-slate-100">Terms & Compliance</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <a href="#" className="hover:text-white">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Investor Charter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  KYC Details
                </a>
              </li>
            </ul>
          </div>

          <div className="mt-8 md:mt-0">
            <h3 className="text-sm font-semibold text-slate-100">Contact Us</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-400">
              <li>
                <span className="block">Customer Support</span>
                <a href="mailto:support@liquibonds.in" className="hover:text-white">
                  support@liquibonds.in
                </a>
              </li>
              <li>
                <span className="block">Get in Touch</span>
                <span className="text-slate-400">support@liquibonds.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6">
          <div className="container mx-auto px-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-200">Important Disclaimer</p>
            <p className="mt-2">
              Investing in bonds and fixed income securities carries certain risks including credit,
              market, and liquidity risks. Please read all related documents carefully before
              investing. Past performance does not guarantee future returns. All investments are
              subject to market risks and investors should consult their financial advisors before
              making investment decisions.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6">
          <div className="container mx-auto px-4 text-xs text-slate-500">
            © 2026 LiquiBonds. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
