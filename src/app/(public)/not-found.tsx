import { ButtonLink, PageHero } from "@/components/site";

/** 404 inside the public chrome (unknown or unpublished slugs call notFound()). */
export default function PublicNotFound() {
  return (
    <PageHero eyebrow="Page not found" title="We could not find that page" description="It may have moved, or it is no longer published.">
      <ButtonLink href="/" testId="link-not-found-home">
        Go to the home page
      </ButtonLink>
      <ButtonLink href="/contact" variant="secondary" testId="link-not-found-contact">
        Contact us
      </ButtonLink>
    </PageHero>
  );
}
