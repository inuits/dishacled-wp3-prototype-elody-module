export const dishacledTypePillLabelMapping: { [test: string]: string[] } = {
  jsRunner: ["JS"],
  jvmRunner: ["JVM"],
  pyRunner: ["PY"],
  // Not every component comes from GitHub any more — catalog components
  // (datasets, sw services, the Elody dashboard) share this entity type, so
  // the pill says what the row IS rather than where one source lives.
  githubProcessor: ["component"],
};
