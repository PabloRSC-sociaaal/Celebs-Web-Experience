import { useState, useEffect } from "react";
import { createCheckout, isPremium } from "../firebase/subscriptionService";
import { useAppStore } from "../../store/appStore";
import { LS_VARIANT_MONTHLY, LS_VARIANT_ANNUAL } from "../../config";

const PLANS = [
  { id: "monthly", variantId: LS_VARIANT_MONTHLY, label: "Monthly",  price: "$4.99", period: "/mo",  badge: null },
  { id: "annual",  variantId: LS_VARIANT_ANNUAL,  label: "Annual",   price: "$29.99", period: "/yr", badge: "SAVE 50%" },
];

export function PaywallModal({ isOpen, onClose }) {
  const subscription = useAppStore((s) => s.subscription);
  const [selected, setSelected] = useState("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);

  // Auto-close when subscription becomes active (webhook processed)
  useEffect(() => {
    if (isOpen && isPremium(subscription)) {
      setWaitingConfirmation(false);
      onClose?.();
    }
  }, [isOpen, subscription, onClose]);

  if (!isOpen) return null;

  async function handleCheckout() {
    const plan = PLANS.find((p) => p.id === selected);
    if (!plan?.variantId) {
      setError("Plan not configured. Contact support.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const url = await createCheckout(plan.variantId);
      window.open(url, "_blank");
      setWaitingConfirmation(true);
    } catch (e) {
      console.error("Checkout error:", e);
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: "linear-gradient(145deg, #0d0d1a, #111128)",
        border: "1px solid rgba(255,229,0,0.15)",
        borderRadius: 28,
        padding: "40px 32px 32px",
        width: "100%", maxWidth: 420,
        position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(255,229,0,0.06)",
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            color: "rgba(255,255,255,0.5)", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >✕</button>

        {/* Crown icon */}
        <div style={{ textAlign: "center", fontSize: 44, marginBottom: 8 }}>👑</div>

        {/* Title */}
        <div style={{
          fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 24,
          color: "#FFE500", textAlign: "center", lineHeight: 1.2, marginBottom: 4,
        }}>
          Unlock Your Doppelganger
        </div>
        <div style={{
          fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 400,
          color: "rgba(255,255,255,0.5)", textAlign: "center",
          marginBottom: 28, lineHeight: 1.5,
        }}>
          Go Premium to reveal matches above 90%
        </div>

        {/* Plan cards */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                style={{
                  flex: 1, padding: "16px 8px",
                  background: active ? "rgba(255,229,0,0.1)" : "rgba(255,255,255,0.04)",
                  border: active ? "2px solid #FFE500" : "2px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  position: "relative", overflow: "visible",
                  transition: "all 0.2s",
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -10,
                    background: "#FFE500", color: "#000",
                    fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 9,
                    padding: "3px 10px", borderRadius: 8, letterSpacing: 0.6,
                  }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{
                  fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 12,
                  color: active ? "#FFE500" : "rgba(255,255,255,0.5)",
                  textTransform: "uppercase", letterSpacing: 0.8,
                }}>
                  {plan.label}
                </div>
                <div style={{
                  fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 26,
                  color: "#fff", lineHeight: 1,
                }}>
                  {plan.price}
                </div>
                <div style={{
                  fontFamily: "'Oxanium', sans-serif", fontWeight: 500, fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                }}>
                  {plan.period}
                </div>
              </button>
            );
          })}
        </div>

        {/* Features list */}
        <div style={{ marginBottom: 24 }}>
          {[
            "Unlock all Doppelganger matches (90%+)",
            "Full face morphing comparison",
            "Priority analysis queue",
            "Cancel anytime",
          ].map((feat) => (
            <div key={feat} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
              fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 500,
              color: "rgba(255,255,255,0.65)",
            }}>
              <span style={{ color: "#22c55e", fontSize: 14, flexShrink: 0 }}>✓</span>
              {feat}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontFamily: "'Oxanium', sans-serif", fontSize: 12,
            color: "#F87171", lineHeight: 1.4,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 8, padding: "8px 12px", marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        {/* CTA or waiting state */}
        {waitingConfirmation ? (
          <div style={{
            textAlign: "center", padding: "16px 0",
            fontFamily: "'Oxanium', sans-serif",
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#FFE500", marginBottom: 6,
            }}>
              Waiting for confirmation...
            </div>
            <div style={{
              fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5,
            }}>
              Complete payment in the opened tab.<br/>
              This page will update automatically.
            </div>
            <div style={{
              marginTop: 12, width: 24, height: 24, margin: "12px auto 0",
              border: "3px solid rgba(255,229,0,0.2)",
              borderTop: "3px solid #FFE500",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: "100%", padding: "15px 0",
              background: "#FFE500", color: "#000",
              border: "none", borderRadius: 14,
              fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              letterSpacing: 0.6,
              transition: "all 0.2s",
              boxShadow: "0 8px 32px rgba(255,229,0,0.2)",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
          >
            {loading ? "Opening checkout..." : "Subscribe Now"}
          </button>
        )}

        {/* Terms */}
        <div style={{
          fontFamily: "'Oxanium', sans-serif", fontSize: 10,
          color: "rgba(255,255,255,0.2)", textAlign: "center",
          marginTop: 16, lineHeight: 1.6,
        }}>
          Secure payment via Lemon Squeezy. Cancel anytime from your account.
        </div>
      </div>
    </div>
  );
}
