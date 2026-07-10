import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  getStoredCookieConsent,
  openCookieSettings,
} from "@/lib/cookieConsent";

const installLocalStorage = () => {
  let values: Record<string, string> = {};
  const storage: Storage = {
    get length() {
      return Object.keys(values).length;
    },
    clear: () => {
      values = {};
    },
    getItem: (key) => values[key] ?? null,
    key: (index) => Object.keys(values)[index] ?? null,
    removeItem: (key) => {
      delete values[key];
    },
    setItem: (key, value) => {
      values[key] = value;
    },
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
};

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    installLocalStorage();
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    window.dataLayer = [];
    window.gtag = vi.fn();
  });

  it("allows granular consent and reopening the settings", () => {
    render(
      <MemoryRouter
        initialEntries={["/"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Tu privacidad, bajo tu control" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Configurar" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Analítica" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar selección" }));

    expect(getStoredCookieConsent()).toEqual({
      analytics: true,
      marketing: false,
    });
    expect(
      screen.queryByRole("heading", {
        name: "Tu privacidad, bajo tu control",
      }),
    ).not.toBeInTheDocument();

    act(() => openCookieSettings());

    expect(
      screen.getByRole("heading", { name: "Tu privacidad, bajo tu control" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Analítica" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Marketing" }),
    ).not.toBeChecked();
  });
});
