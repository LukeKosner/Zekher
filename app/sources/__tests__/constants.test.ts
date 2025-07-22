import { sourcesPageConstants, sourcesErrorMessages } from "@/app/sources/constants";

describe("sourcesPageConstants", () => {
  it("has correct lexicon overlay configuration", () => {
    expect(sourcesPageConstants.lexiconOverlay).toEqual({
      title: "Holocaust Lexicon",
      actionText: "View Full PDF",
      actionIcon: "FileText"
    });
  });

  it("has correct testimony overlay configuration", () => {
    expect(sourcesPageConstants.testimonyOverlay).toEqual({
      title: "Interview with David Boder",
      actionText: "Read Full Testimony",
      actionIcon: "BookOpen"
    });
  });

  it("has comprehensive loading states", () => {
    expect(sourcesPageConstants.loadingStates).toMatchObject({
      sources: expect.any(String),
      sourceLibrary: expect.any(String),
      loadingMore: expect.any(String),
      searching: expect.any(String),
      findingTestimonies: expect.any(String)
    });
  });

  it("has complete page content configuration", () => {
    expect(sourcesPageConstants.pageContent).toMatchObject({
      title: expect.any(String),
      description: expect.any(String),
      searchPlaceholder: expect.any(String),
      noFeaturedSources: expect.any(String),
      noLexiconEntries: expect.any(String),
      noTestimonies: expect.any(String),
      noSearchResults: {
        lexicon: expect.any(String),
        testimony: expect.any(String)
      }
    });
  });

  it("has correct tab labels", () => {
    expect(sourcesPageConstants.tabs).toEqual({
      featured: "Featured",
      lexicon: "Lexicon",
      testimony: "Testimony"
    });
  });

  it("has section titles", () => {
    expect(sourcesPageConstants.sections).toMatchObject({
      featuredLexicon: expect.any(String),
      featuredTestimonies: expect.any(String)
    });
  });

  it("has pagination configuration with sensible defaults", () => {
    expect(sourcesPageConstants.pagination).toEqual({
      loadMore: "Load More",
      defaultLimit: 10,
      maxLimit: 50
    });
  });

  it("has default limit less than max limit", () => {
    expect(sourcesPageConstants.pagination.defaultLimit).toBeLessThan(
      sourcesPageConstants.pagination.maxLimit
    );
  });
});

describe("sourcesErrorMessages", () => {
  it("has comprehensive error messages for sources", () => {
    expect(sourcesErrorMessages.sources).toEqual({
      notFound: "Source not found",
      invalidType: "Invalid source type",
      missingParams: "Missing required parameters",
      systemError: "An error occurred while fetching sources."
    });
  });

  it("has all required error types", () => {
    const errorTypes = Object.keys(sourcesErrorMessages.sources);
    expect(errorTypes).toContain("notFound");
    expect(errorTypes).toContain("invalidType");
    expect(errorTypes).toContain("missingParams");
    expect(errorTypes).toContain("systemError");
  });

  it("has non-empty error messages", () => {
    Object.values(sourcesErrorMessages.sources).forEach(message => {
      expect(message).toBeTruthy();
      expect(typeof message).toBe("string");
      expect(message.length).toBeGreaterThan(0);
    });
  });
});