/**
 * Atomic Phone Input Component
 */

'use client';

import * as React from 'react';

import { AInput, AInputProps } from './AInput';

export type APhoneInputProps = Omit<AInputProps, 'type'>;

export const APhoneInput = React.forwardRef<HTMLInputElement, APhoneInputProps>(
  (props, ref) => {
    return (
      <AInput
        type="tel"
        autoComplete="tel"
        placeholder="+1234567890"
        {...props}
        ref={ref}
      />
    );
  }
);

APhoneInput.displayName = 'APhoneInput';
