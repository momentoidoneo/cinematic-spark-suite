import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SmartQuoter from "@/components/SmartQuoter";

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        maybeSingle: () =>
          Promise.resolve({ data: { phone_number: null }, error: null }),
      }),
    }),
    functions: {
      invoke: invokeMock,
    },
  },
}));

vi.mock("@/lib/trackingEvents", () => ({
  fireGoogleAdsConversion: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const advanceToIdentityStep = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "Fotografía inmobiliaria" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

  fireEvent.change(screen.getByPlaceholderText("Describe el alcance"), {
    target: { value: "Vivienda de 120 m²" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

  fireEvent.change(
    screen.getByPlaceholderText("Ej: Lisboa, Madrid, Algarve..."),
    { target: { value: "Madrid" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

  fireEvent.click(screen.getByRole("button", { name: "Este mes" }));
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
};

describe("SmartQuoter identity gate", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({
      data: {
        min: 120,
        max: 180,
        summary: "Estimación de prueba",
        includes: ["Sesión fotográfica"],
        notes: "",
        whatsappMessage: "Solicitud",
        requestId: "request-1",
      },
      error: null,
    });
  });

  it("does not reveal or request the quote until name and email are valid", async () => {
    render(<SmartQuoter initialOpen />);
    advanceToIdentityStep();

    const submit = screen.getByRole("button", {
      name: "Calcular y ver presupuesto",
    });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cliente@example.com" },
    });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Nombre y apellidos"), {
      target: { value: "Ana Costa" },
    });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    await waitFor(() => expect(invokeMock).toHaveBeenCalledTimes(1));
    expect(invokeMock).toHaveBeenCalledWith("generate-quote", {
      body: expect.objectContaining({
        name: "Ana Costa",
        email: "cliente@example.com",
      }),
    });
    expect(await screen.findByText("120€ – 180€")).toBeInTheDocument();
  });
});
