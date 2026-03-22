"use client";

import { useStackApp } from "@stackframe/stack";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const app = useStackApp();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [nonce, setNonce] = useState("");
  const [otp, setOtp] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSendMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsEmailLoading(true);

    try {
      const result = await app.sendMagicLinkEmail(email);
      if (result.status === "error") {
        toast.error("Could not send verification code. Please try again.");
      } else {
        setNonce(result.data.nonce);
        setOtp("");
        setStep("otp");
        toast.success("Verification code sent! Check your email.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length !== 6 || isVerifying) return;

    const verify = async () => {
      setIsVerifying(true);
      try {
        const result = await app.signInWithMagicLink(otp + nonce);
        if (result.status === "error") {
          toast.error("Invalid code. Please try again.");
          setOtp("");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
        setOtp("");
      } finally {
        setIsVerifying(false);
      }
    };

    void verify();
  }, [otp, nonce, isVerifying, app]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img src="/Black.svg" alt="OneGPT" className="size-8 logo-dark" />
          <img
            src="/white.svg"
            alt="OneGPT"
            className="size-8 hidden logo-light"
          />
        </div>
        <h1 className="text-2xl font-bold">Welcome</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "email"
            ? "Enter your email to continue"
            : `We sent a code to ${email}`}
        </p>
      </div>

      {step === "email" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSendMagicLink();
          }}
        >
          <div className="relative">
            <Icon
              icon="solar:letter-linear"
              width={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80"
            />
            <Input
              type="email"
              placeholder="you@example.com"
              className="h-11 pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full text-md h-11"
            disabled={isEmailLoading}
          >
            {isEmailLoading ? <Spinner /> : null}
            {isEmailLoading ? "Sending..." : "Continue with Email"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
          <Icon
            icon="solar:lock-keyhole-linear"
            width={48}
            className="text-primary"
          />
          <p className="text-center text-sm text-muted-foreground">
            Enter the 6-character code from your email
          </p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value.toUpperCase())}
            disabled={isVerifying}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {isVerifying && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Verifying...
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={isEmailLoading}
            onClick={() => void handleSendMagicLink()}
          >
            {isEmailLoading ? <Spinner /> : null}
            Resend code
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStep("email");
              setOtp("");
              setNonce("");
            }}
          >
            Use a different email
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground/80">OR</span>
        <Separator className="flex-1" />
      </div>

      <Button
        variant="secondary"
        className="w-full text-md h-11"
        disabled={isGoogleLoading}
        onClick={async () => {
          setIsGoogleLoading(true);
          await app.signInWithOAuth("google");
          setIsGoogleLoading(false);
        }}
      >
        {isGoogleLoading ? (
          <Spinner />
        ) : (
          <Icon icon="logos:google-icon" width={18} />
        )}
        {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
      </Button>

      <p className="text-center text-xs text-muted-foreground/80">
        &copy; {new Date().getFullYear()} OneGPT. All rights reserved.
      </p>
    </div>
  );
}
