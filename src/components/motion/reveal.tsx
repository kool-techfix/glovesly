"use client";

import { m, type HTMLMotionProps } from "motion/react";
import { createContext, useContext, useId } from "react";

import { pickReveal, REVEALS, staggerContainer, VIEWPORT, type RevealChoice, type RevealName } from "@/components/motion/variants";

/*
 * Reusable scroll animations (Motion `whileInView`).
 *
 *   <ScrollReveal>…</ScrollReveal>                 one block, auto-picked style
 *   <ScrollReveal variant="slide-left" as="aside">  a specific style and element
 *   <StaggerContainer as="ul" className="card-grid">
 *     <StaggerItem as="li">…</StaggerItem>          children reveal in turn
 *   </StaggerContainer>
 *
 * "auto" picks a style from a balanced pool, seeded by useId(): the same on
 * the server and the client, and stable for the life of the component.
 * Everything plays once, when a meaningful part of it is on screen.
 * Wrappers render the element given in `as`, so no extra layout is added.
 */

const TAGS = {
  div: m.div,
  section: m.section,
  article: m.article,
  aside: m.aside,
  header: m.header,
  figure: m.figure,
  ul: m.ul,
  ol: m.ol,
  li: m.li,
  dl: m.dl,
  p: m.p,
  h2: m.h2,
  h3: m.h3,
} as const;
export type RevealTag = keyof typeof TAGS;

type BaseProps = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "whileInView" | "viewport" | "animate"> & {
  as?: RevealTag;
  children?: React.ReactNode;
};

function useReveal(choice: RevealChoice = "auto"): RevealName {
  const id = useId();
  return choice === "auto" ? pickReveal(id) : choice;
}

/** One block that animates into view. */
export function ScrollReveal({
  as = "div",
  variant = "auto",
  delay = 0,
  amount,
  ...props
}: BaseProps & { variant?: RevealChoice; delay?: number; amount?: number | "some" | "all" }) {
  const name = useReveal(variant);
  const Tag = TAGS[as] as typeof m.div;
  const variants = delay
    ? { ...REVEALS[name], show: { ...REVEALS[name].show, transition: { ...(REVEALS[name].show as { transition?: object }).transition, delay } } }
    : REVEALS[name];
  return (
    <Tag
      {...props}
      data-reveal=""
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ ...VIEWPORT, ...(amount !== undefined ? { amount } : {}) }}
    />
  );
}

/** Same thing with a gentle fade only (no movement). */
export function FadeIn(props: BaseProps & { delay?: number }) {
  return <ScrollReveal {...props} variant="fade-in" />;
}

const StaggerReveal = createContext<RevealName>("fade-up");

/**
 * A group whose children (StaggerItem) reveal one after another. The group
 * picks one style for all its items, so a grid moves as one composition.
 */
export function StaggerContainer({
  as = "div",
  variant = "auto",
  stagger = 0.12,
  delay = 0.05,
  amount,
  ...props
}: BaseProps & { variant?: RevealChoice; stagger?: number; delay?: number; amount?: number | "some" | "all" }) {
  const name = useReveal(variant);
  const Tag = TAGS[as] as typeof m.div;
  return (
    <StaggerReveal.Provider value={name}>
      <Tag
        {...props}
        variants={staggerContainer(stagger, delay)}
        initial="hidden"
        whileInView="show"
        viewport={{ ...VIEWPORT, ...(amount !== undefined ? { amount } : {}) }}
      />
    </StaggerReveal.Provider>
  );
}

/** A child of StaggerContainer; uses the group's style unless given its own. */
export function StaggerItem({ as = "div", variant, ...props }: BaseProps & { variant?: RevealName }) {
  const groupStyle = useContext(StaggerReveal);
  const Tag = TAGS[as] as typeof m.div;
  return <Tag {...props} data-reveal="" variants={REVEALS[variant ?? groupStyle]} />;
}
