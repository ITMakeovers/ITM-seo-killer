"use client";
import React, { useEffect } from "react";
import { getSiteConfig } from "@/lib/config";

export default function BrandingColorsProvider() {
  useEffect(() => {
    const config = getSiteConfig();
    const root = document.documentElement;
    if (config.branding.primaryColor) root.style.setProperty('--primary-color', config.branding.primaryColor);
    if (config.branding.secondaryColor) root.style.setProperty('--secondary-color', config.branding.secondaryColor);
    if (config.branding.accentColor) root.style.setProperty('--accent-color', config.branding.accentColor);
  }, []);
  return null;
}
