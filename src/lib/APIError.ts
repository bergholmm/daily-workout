export class APIError extends Error {
  public code: number
  public info: string

  constructor(message: string, code: number, info: string) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.info = info
    Object.setPrototypeOf(this, APIError.prototype)
  }
}
