import { z } from "zod";

/** The 36 states of Nigeria plus the Federal Capital Territory, alphabetical. */
export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export type NigeriaState = (typeof NIGERIA_STATES)[number];

/** Zod schema accepting only a value from NIGERIA_STATES. */
export const nigeriaStateSchema = z.enum(NIGERIA_STATES, {
  errorMap: () => ({ message: "Choose one of the 36 states or the FCT" }),
});

export function isNigeriaState(value: unknown): value is NigeriaState {
  return nigeriaStateSchema.safeParse(value).success;
}
