export function validateUser(user) {
  const errors = {};

  if (!user?.email) {
    errors.email = "Email is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
