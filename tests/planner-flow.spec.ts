import { expect, test } from "@playwright/test";
import { validateItineraryResponse } from "../features/planner/domain/validate-itinerary-response";
import { UNVERIFIED_DATA_NOTICE } from "../features/itinerary/domain/presentation";
import { baseEnLaQuebradaItinerary } from "./fixtures/base-en-la-quebrada-itinerary";

// QTR-028: covers the critical path landing -> preferences -> strategy ->
// itinerary. The itinerary endpoint is stubbed with a fixture derived from a
// real response, so the run is deterministic and needs no seeded database.
test("the planner flow reaches a presented itinerary", async ({ page }) => {
  let requestBody: unknown = null;

  await page.route("**/api/itineraries", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ itinerary: baseEnLaQuebradaItinerary }),
    });
  });

  // Landing: the "Planificar mi viaje" call to action appears twice, so the
  // first match is the hero button.
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Planifique la Quebrada a su ritmo",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Planificar mi viaje" }).first().click();
  await expect(page).toHaveURL(/\/planner/);

  // Preferences: the defaults already hold three days and no car, so marking
  // a single interest is enough to submit a valid form.
  await expect(
    page.getByRole("heading", { level: 1, name: "Planificador de viaje" }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "Paisaje" }).check();
  await page.getByRole("button", { name: "Comparar estrategias" }).click();

  // Strategy: the radio is visually hidden under its label overlay, hence the
  // forced check. The accessible name comes from the strategy heading.
  await expect(
    page.getByRole("group", { name: "Estrategias comparadas" }),
  ).toBeVisible();
  const strategy = page.getByRole("radio", { name: "Base en la Quebrada" });
  await strategy.check({ force: true });
  await expect(strategy).toBeChecked();
  await page.getByRole("button", { name: "Generar itinerario" }).click();

  // Itinerary: the selected strategy is echoed and the whole summary renders.
  await expect(
    page.getByRole("heading", { level: 2, name: "Su itinerario" }),
  ).toBeVisible();
  await expect(
    page.getByText("Estrategia elegida: Base en la Quebrada."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Plan por día" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 3, name: /^Día 1/ }),
  ).toBeVisible();
  await expect(page.getByText(UNVERIFIED_DATA_NOTICE)).toBeVisible();

  // Block titles can also appear in the rationale, so the assertion is scoped
  // to the day region. Ten blocks lack a duration, hence `.first()`.
  const firstDay = page.getByRole("region", { name: /^Día 1/ });
  await expect(
    firstDay.getByText("Cerro de los Siete Colores"),
  ).toBeVisible();
  await expect(page.getByText("Duración por confirmar").first()).toBeVisible();

  // The third day has no blocks, and the empty day is stated in text.
  await expect(
    page.getByText("Sin actividades asignadas este día."),
  ).toBeVisible();

  // Warnings: the fixture has no optional activities, so that section stays
  // hidden while the relevant warning is shown.
  await expect(
    page.getByRole("heading", { level: 2, name: "Advertencias" }),
  ).toBeVisible();
  await expect(
    page.getByText("Quedaron días del viaje sin actividades asignadas."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Actividades opcionales" }),
  ).toHaveCount(0);

  // The stubbed payload still satisfies the domain contract, and the browser
  // posted the selected strategy.
  expect(validateItineraryResponse({ itinerary: baseEnLaQuebradaItinerary })).not.toBeNull();
  expect(requestBody).toMatchObject({ strategyId: "base-en-la-quebrada" });
});
