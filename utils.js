function jsonParse(input) {
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (error) {
      // If invalid JSON, return the original string
      return input;
    }
  }
  // If it's already an object, return it as is
  return input;
}

module.exports = {
  jsonParse,
};
