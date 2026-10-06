// utils/validation.js
//
// Pure validation helpers - plain JS in, plain JS out. No React, no DOM.
// Keeping this separate from PlaceOrder.jsx means the exact same rules can
// be reused anywhere else a delivery form appears (e.g. a "My Addresses"
// page later), and can be mirrored 1:1 on a Spring Boot backend later too.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DIGITS_ONLY_REGEX = /^\d+$/

/**
 * Validates the checkout / delivery form.
 * Returns an object where each key is a field name and each value is the
 * error message for that field. A field with no problems is simply absent
 * from the returned object.
 */
export const validateDeliveryForm = (formData) => {
  const errors = {}

  const firstName = formData.firstName?.trim() || ''
  const lastName = formData.lastName?.trim() || ''
  const email = formData.email?.trim() || ''
  const phone = formData.phone?.trim() || ''
  const street = formData.street?.trim() || ''
  const city = formData.city?.trim() || ''
  const state = formData.state?.trim() || ''
  const country = formData.country?.trim() || ''
  const zipcode = formData.zipcode?.trim() || ''

  // First Name - required, min 2 characters
  if (!firstName) {
    errors.firstName = 'First name is required'
  } else if (firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters'
  }

  // Last Name - required, min 2 characters
  if (!lastName) {
    errors.lastName = 'Last name is required'
  } else if (lastName.length < 2) {
    errors.lastName = 'Last name must be at least 2 characters'
  }

  // Email - required, valid format
  if (!email) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address (e.g. user@gmail.com)'
  }

  // Phone - required, digits only, exactly 10 digits
  if (!phone) {
    errors.phone = 'Phone number is required'
  } else if (!DIGITS_ONLY_REGEX.test(phone)) {
    errors.phone = 'Phone number can only contain digits'
  } else if (phone.length !== 10) {
    errors.phone = 'Phone number must be exactly 10 digits'
  }

  // Address - required, min 5 characters
  if (!street) {
    errors.street = 'Address is required'
  } else if (street.length < 5) {
    errors.street = 'Address must be at least 5 characters'
  }

  // City / State / Country - required
  if (!city) errors.city = 'City is required'
  if (!state) errors.state = 'State is required'
  if (!country) errors.country = 'Country is required'

  // Pincode - required, exactly 6 digits
  if (!zipcode) {
    errors.zipcode = 'Pincode is required'
  } else if (!DIGITS_ONLY_REGEX.test(zipcode)) {
    errors.zipcode = 'Pincode can only contain digits'
  } else if (zipcode.length !== 6) {
    errors.zipcode = 'Pincode must be exactly 6 digits'
  }

  return errors
}

export const isFormValid = (errors) => Object.keys(errors).length === 0
