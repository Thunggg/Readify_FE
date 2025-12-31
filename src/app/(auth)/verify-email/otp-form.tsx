"use client"

import { authApiRequest } from "@/api-request/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { handleErrorApi } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const canVerify = otp.length === 6 && !isLoading; // nếu OTP đủ 6 chữ số và không đang loading thì mới có thể verify
  const canResend = !isResending && resendCooldown === 0 && !isLoading

  useEffect(() => {
    if (resendCooldown <= 0) return
    const intervalId = window.setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [resendCooldown])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (otp.length !== 6) {
      handleErrorApi({ error: new Error("Please enter a valid OTP"), duration: 5000 })
      return
    }

    const code = otp.split("").join("")

    try {
      setIsLoading(true)
      const response = await authApiRequest.verifyRegisterOtp({
        otp: code.toString()
      })

      if (response.payload.success) {
        toast.success("OTP verified successfully", {
        style: {
          "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border": "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      })

      router.push("/login")
      
      } else{
        handleErrorApi({ error: new Error(response.payload.message), duration: 5000 })
      }
    } catch (error) {
      handleErrorApi({ error, duration: 5000 })
    } finally {
      setIsLoading(false)
    }

  }

  const resendOtp = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!canResend) return

    try {
      setIsResending(true)
      await authApiRequest.resendRegisterOtp()

      toast.success("OTP resent successfully", {
        style: {
          "--normal-bg": "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border": "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      })

      setResendCooldown(60)
    } catch (error) {
      handleErrorApi({ error, duration: 5000 })
    } finally {
      setIsResending(false)
    }
  }
  
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Enter verification code</CardTitle>
        <CardDescription>We sent a 6-digit code to your email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp">Verification code</FieldLabel>
              <InputOTP maxLength={6} id="otp" required onChange={setOtp}>
                <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>
                Enter the 6-digit code sent to your email.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit" disabled={!canVerify}>Verify</Button>
              <FieldDescription className="text-center">
                Didn&apos;t receive the code?{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={resendOtp}
                  disabled={!canResend}
                  className="h-auto p-0 align-baseline"
                >
                  {isResending
                    ? "Resending..."
                    : resendCooldown > 0
                      ? `Resend (${resendCooldown}s)`
                      : "Resend"}
                </Button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
