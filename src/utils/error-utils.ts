export const AUTHENTICATION_ERROR_MESSAGE = 'You must be logged in to view this content'

export const AuthenticationError = class AuthenticationError extends Error {
  constructor() {
    super(AUTHENTICATION_ERROR_MESSAGE)
    this.name = 'AuthenticationError'
  }
}

export const UNAUTHORIZED_PROJECT_ACCESS_MESSAGE =
  'You do not have permission to access this project'

export const UnauthorizedProjectAccessError = class UnauthorizedProjectAccessError extends Error {
  constructor() {
    super(UNAUTHORIZED_PROJECT_ACCESS_MESSAGE)
    this.name = 'UnauthorizedProjectAccessError'
  }
}

export const NotFoundError = class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}
