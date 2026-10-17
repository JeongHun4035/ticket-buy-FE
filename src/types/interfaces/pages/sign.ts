import type { SignUpRequest } from '../api/auth'

export interface SignUpForm extends SignUpRequest {
  passwordConfirm: string,
}
