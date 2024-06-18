function hasError(ctx, code) {
  const errorsString = JSON.stringify(ctx)
  return errorsString.includes(code)
}

export function isUserBlocked(ctx) {
  const code = 'Auth.form.error.blocked'
  return hasError(ctx, code)
}

export function isEmailTaken(ctx) {
  const code = 'Auth.form.error.email.taken'
  return hasError(ctx, code)
}

export function isForbidden(ctx) {
  const code = 'Forbidden'
  return hasError(ctx, code)
}

export function isUserNotExist(ctx) {
  const code = 'Auth.form.error.user.not-exist'
  return hasError(ctx, code)
}
