export function resolveScreenshotLayout(layout) {
  return layout === "mobile_only" ? "mobile_only" : "responsive";
}

export function orderedMobileScreenshots(rows) {
  return rows
    .filter((row) => row.view_type === "mobile")
    .sort((left, right) => left.sort_order - right.sort_order);
}
