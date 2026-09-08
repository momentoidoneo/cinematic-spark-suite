import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/trackingEvents";
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
    screen.getByPlaceholderText("Ej: Madrid, Getafe, Alcalá de Henares…"),
    { target: { value: "Madrid" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Este mes" }));
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
    expect(screen.getByLabelText("País fiscal")).toHaveValue("ES");
    expect(screen.getByText(/Paso 4 de 4/)).toBeInTheDocument();
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

  it("submits several services with a separate scope for each one", async () => {
    render(<SmartQuoter initialOpen />);

    const photography = screen.getByRole("button", {
      name: "Fotografía corporativa y de empresa",
    });
    const video = screen.getByRole("button", { name: "Vídeo corporativo" });
    fireEvent.click(photography);
    fireEvent.click(video);
    expect(photography).toHaveAttribute("aria-pressed", "true");
    expect(video).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2 servicios seleccionados")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    fireEvent.change(
      screen.getByLabelText(
        "Alcance para Fotografía corporativa y de empresa",
      ),
      { target: { value: "Retratos de 12 personas e instalaciones" } },
    );
    fireEvent.change(
      screen.getByLabelText("Alcance para Vídeo corporativo"),
      { target: { value: "Vídeo de presentación de 90 segundos" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    fireEvent.change(
      screen.getByPlaceholderText("Ej: Madrid, Getafe, Alcalá de Henares…"),
      { target: { value: "Madrid" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Este mes" }));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));

    fireEvent.change(screen.getByLabelText("Nombre y apellidos"), {
      target: { value: "Ana Costa" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cliente@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Calcular y ver presupuesto" }),
    );

    await waitFor(() => expect(invokeMock).toHaveBeenCalledTimes(1));
    expect(invokeMock).toHaveBeenCalledWith("generate-quote", {
      body: expect.objectContaining({
        service:
          "Fotografía corporativa y de empresa + Vídeo corporativo",
        services: [
          "Fotografía corporativa y de empresa",
          "Vídeo corporativo",
        ],
        serviceScopes: {
          "Fotografía corporativa y de empresa":
            "Retratos de 12 personas e instalaciones",
          "Vídeo corporativo": "Vídeo de presentación de 90 segundos",
        },
        scope: expect.stringContaining(
          "Vídeo corporativo: Vídeo de presentación de 90 segundos",
        ),
      }),
    });
  });
  it("keeps fiscal country editable and reports generation failures without personal data", async () => {
    vi.mocked(trackEvent).mockClear();
    invokeMock.mockRejectedValueOnce(new Error("offline"));
    render(<SmartQuoter initialOpen />);
    advanceToIdentityStep();
    fireEvent.change(screen.getByLabelText("País fiscal"), { target: { value: "PT" } });
    fireEvent.change(screen.getByLabelText("Nombre y apellidos"), { target: { value: "Ana Costa" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@empresa.es" } });
    const submit = screen.getByRole("button", { name: "Calcular y ver presupuesto" });
    fireEvent.click(submit);
    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith("quoter_error", {event_category: "funnel", event_label: "network"}));
    expect(screen.getByRole("button", { name: "Calcular y ver presupuesto" })).toBeEnabled();
    expect(invokeMock).toHaveBeenCalledWith("generate-quote", {body: expect.objectContaining({countryCode:"PT", countryName:"Portugal"})});
    const events = JSON.stringify(vi.mocked(trackEvent).mock.calls);
    expect(events).not.toContain("ana@empresa.es");
    expect(events).not.toContain("Ana Costa");
    fireEvent.click(screen.getByRole("button", {name:"Cerrar"}));
    expect(trackEvent).toHaveBeenCalledWith("quoter_abandon", {event_category:"funnel", event_label:"step_4"});
  });

});
