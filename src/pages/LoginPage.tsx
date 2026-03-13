import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"investor" | "ifa" | "ops">("investor");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-primary tracking-tight">LiquiBonds</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="card-elevated p-6 space-y-5">
          {/* Role selector for demo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Login as (Demo)</Label>
            <div className="flex gap-2">
              {(["investor", "ifa", "ops"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 text-xs py-2 rounded border transition-colors ${
                    role === r
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
                  }`}
                >
                  {r === "ifa" ? "IFA" : r.charAt(0).toUpperCase() + r.slice(1)}
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
                placeholder="Enter 10-digit mobile"
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
                <p className="text-xs text-muted-foreground">
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

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to LiquiBonds Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
