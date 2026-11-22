import { PageHero } from "@/components/site";

/** 404 inside the public chrome (unknown or unpublished slugs call notFound()). */
export default function PublicNotFound() {
  return (
    <PageHero
      variant="compact"
      eyebrow="Page not found"
      title="We could not find that page"
      description="It may have moved, or it is no longer published."
      actions={[
        { label: "Go to the home page", href: "/", testId: "link-not-found-home" },
        { label: "Contact us", href: "/contact", variant: "secondary", testId: "link-not-found-contact" },
      ]}
    />
  );
}
