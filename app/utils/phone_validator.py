import phonenumbers
from phonenumbers.phonenumberutil import NumberParseException

class InvalidPhoneNumberError(ValueError):
    """Custom exception for invalid phone numbers."""
    pass

def validate_and_format_phone_number(phone_number: str, country_code: str = None) -> str:
    """
    Validates and formats a phone number to the E.164 standard.

    Args:
        phone_number: The phone number to validate.
        country_code: The two-letter country code (e.g., 'US', 'FR') to use
                      if the number is not in international format.

    Returns:
        The phone number in E.164 format (e.g., '+14155552671').

    Raises:
        InvalidPhoneNumberError: If the phone number is invalid.
    """
    if not phone_number or not phone_number.strip():
        raise InvalidPhoneNumberError("Phone number cannot be empty.")
    
    # Clean the phone number - remove spaces, dots, dashes
    cleaned_number = phone_number.strip().replace(' ', '').replace('.', '').replace('-', '')
    
    try:
        parsed_number = phonenumbers.parse(cleaned_number, country_code)
        if not phonenumbers.is_valid_number(parsed_number):
            raise InvalidPhoneNumberError(f"The phone number '{phone_number}' is not valid.")

        return phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
    except NumberParseException as e:
        # Provide more helpful error message
        error_msg = f"Could not parse the phone number '{phone_number}'"
        if country_code:
            error_msg += f" with country code '{country_code}'"
        error_msg += f". Reason: {e}"
        raise InvalidPhoneNumberError(error_msg)
