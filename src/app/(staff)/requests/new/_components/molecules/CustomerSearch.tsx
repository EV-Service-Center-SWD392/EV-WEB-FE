/**
 * Customer Search Molecule
 * Combines input with autosuggest dropdown for customer search
 */

'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { Customer } from '@/features/service-request/types/domain';

export interface CustomerSearchProps {
  customers: Customer[];
  isLoading: boolean;
  error?: string | null;
  selectedCustomer?: Customer | null;
  onSearch: (_query: string) => void;
  onSelectCustomer: (_customer: Customer) => void;
  onCreateNew?: () => void;
  label?: string;
  required?: boolean;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  customers,
  isLoading,
  error,
  selectedCustomer,
  onSearch,
  onSelectCustomer,
  onCreateNew,
  label = 'Customer',
  required,
}) => {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    onSearch(value);
  };

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSelectCustomer(null as any);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <Label className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {selectedCustomer ? (
        <Card className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">{selectedCustomer.name}</p>
              <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
              {selectedCustomer.email && (
                <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="ml-2"
            >
              Change
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              placeholder="Search by phone, email, or name..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className={cn(error && 'border-destructive')}
            />
            {onCreateNew && (
              <Button type="button" variant="outline" onClick={onCreateNew}>
                + New
              </Button>
            )}
          </div>

          {isOpen && (query.length >= 2 || customers.length > 0) && (
            <Card className="absolute z-10 w-full max-h-60 overflow-auto">
              {isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              )}

              {!isLoading && customers.length === 0 && query.length >= 2 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">No customers found</p>
                  {onCreateNew && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        onCreateNew();
                      }}
                    >
                      Create new customer
                    </Button>
                  )}
                </div>
              )}

              {!isLoading && customers.length > 0 && (
                <ul className="py-1">
                  {customers.map((customer) => (
                    <li key={customer.id}>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                        onClick={() => handleSelect(customer)}
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        {customer.email && (
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

CustomerSearch.displayName = 'CustomerSearch';
