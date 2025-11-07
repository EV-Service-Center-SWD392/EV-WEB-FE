/**
 * Atomic Email Input Component
 */

'use client';

import * as React from 'react';

import { AInput, AInputProps } from './AInput';

export type AEmailInputProps = Omit<AInputProps, 'type'>;

export const AEmailInput = React.forwardRef<HTMLInputElement, AEmailInputProps>(
  (props, ref) => {
    return (
      <AInput
        type="email"
        autoComplete="email"
        placeholder="example@email.com"
        {...props}
        ref={ref}
      />
    );
  }
);

AEmailInput.displayName = 'AEmailInput';
