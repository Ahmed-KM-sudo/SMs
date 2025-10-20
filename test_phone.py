#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.phone_validator import validate_and_format_phone_number, InvalidPhoneNumberError

def test_phone_validation():
    print("Testing phone validation...")
    
    # Test the problematic French number
    try:
        result = validate_and_format_phone_number('0607347824', 'FR')
        print(f"✅ Success: '0607347824' with 'FR' -> {result}")
    except InvalidPhoneNumberError as e:
        print(f"❌ Error: '0607347824' with 'FR' -> {e}")
    
    # Test without country code (should fail)
    try:
        result = validate_and_format_phone_number('0607347824', None)
        print(f"✅ Success: '0607347824' with None -> {result}")
    except InvalidPhoneNumberError as e:
        print(f"❌ Error: '0607347824' with None -> {e}")
    
    # Test with international format
    try:
        result = validate_and_format_phone_number('+33607347824', None)
        print(f"✅ Success: '+33607347824' with None -> {result}")
    except InvalidPhoneNumberError as e:
        print(f"❌ Error: '+33607347824' with None -> {e}")
    
    # Test with formatted French number
    try:
        result = validate_and_format_phone_number('06 07 34 78 24', 'FR')
        print(f"✅ Success: '06 07 34 78 24' with 'FR' -> {result}")
    except InvalidPhoneNumberError as e:
        print(f"❌ Error: '06 07 34 78 24' with 'FR' -> {e}")
    
    # Test empty number
    try:
        result = validate_and_format_phone_number('', 'FR')
        print(f"✅ Success: '' with 'FR' -> {result}")
    except InvalidPhoneNumberError as e:
        print(f"❌ Error: '' with 'FR' -> {e}")

if __name__ == "__main__":
    test_phone_validation()
