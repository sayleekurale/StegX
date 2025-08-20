import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home"), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center app-surface">
      <Helmet>
        <title>StegX – Secure Your Secrets</title>
        <meta name="description" content="StegX: Cyberpunk image steganography with AES encryption and QR keys." />
      </Helmet>
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] blur-sm opacity-70" aria-hidden="true" />
          <div className="absolute inset-0 h-24 w-24 rounded-2xl border border-primary/40 neon-border" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-cyber">StegX</h1>
        <p className="text-sm text-muted-foreground">Secure your secrets</p>
      </div>
    </div>
  );
};

export default Index;
