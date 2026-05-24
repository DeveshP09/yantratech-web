export const emailRules = [
  { required: true, message: 'Email is required' },
  { type: 'email', message: 'Enter a valid email' },
]

export const passwordRules = [
  { required: true, message: 'Password is required' },
  { min: 8, message: 'Password must be at least 8 characters' },
]
