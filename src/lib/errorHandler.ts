export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  createError(
    type: ErrorType,
    message: string,
    originalError?: any,
    context?: Record<string, any>
  ): AppError {
    const error: AppError = {
      type,
      message,
      originalError,
      context,
      timestamp: new Date(),
    };

    this.errorQueue.push(error);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    return error;
  }

  handleError(error: AppError): void {
    console.error('Error handled:', {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      context: error.context,
      originalError: error.originalError
    });

    // In a real application, you might want to send this to an error reporting service
    // this.reportError(error);
  }

  getRecentErrors(count: number = 10): AppError[] {
    return this.errorQueue.slice(-count);
  }

  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Utility functions for common error scenarios
export const handleNetworkError = (error: any, context?: Record<string, any>) => {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.createError(
    ErrorType.NETWORK_ERROR,
    'Network request failed',
    error,
    context
  );
  errorHandler.handleError(appError);
  return appError;
};

export const handleWalletError = (error: any, context?: Record<string, any>) => {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.createError(
    ErrorType.WALLET_ERROR,
    'Wallet operation failed',
    error,
    context
  );
  errorHandler.handleError(appError);
  return appError;
};

export const handleValidationError = (message: string, context?: Record<string, any>) => {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.createError(
    ErrorType.VALIDATION_ERROR,
    message,
    null,
    context
  );
  errorHandler.handleError(appError);
  return appError;
};

export const handleServerError = (error: any, context?: Record<string, any>) => {
  const errorHandler = ErrorHandler.getInstance();
  const appError = errorHandler.createError(
    ErrorType.SERVER_ERROR,
    'Server error occurred',
    error,
    context
  );
  errorHandler.handleError(appError);
  return appError;
};

// React hook for error handling
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  const { toast } = useToast();
  const errorHandler = ErrorHandler.getInstance();

  const handleError = useCallback((error: AppError) => {
    errorHandler.handleError(error);

    // Show user-friendly message
    const userMessage = getUserFriendlyMessage(error.type);
    toast({
      title: "Error",
      description: userMessage,
      variant: "destructive",
    });
  }, [toast]);

  const handleNetworkErrorWithToast = useCallback((error: any, context?: Record<string, any>) => {
    const appError = handleNetworkError(error, context);
    handleError(appError);
  }, [handleError]);

  const handleWalletErrorWithToast = useCallback((error: any, context?: Record<string, any>) => {
    const appError = handleWalletError(error, context);
    handleError(appError);
  }, [handleError]);

  return {
    handleError,
    handleNetworkError: handleNetworkErrorWithToast,
    handleWalletError: handleWalletErrorWithToast,
    createError: errorHandler.createError.bind(errorHandler),
  };
};

const getUserFriendlyMessage = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      return 'Connection failed. Please check your internet connection and try again.';
    case ErrorType.WALLET_ERROR:
      return 'Wallet operation failed. Please check your wallet connection and try again.';
    case ErrorType.VALIDATION_ERROR:
      return 'Please check your input and try again.';
    case ErrorType.AUTHENTICATION_ERROR:
      return 'Authentication failed. Please log in again.';
    case ErrorType.AUTHORIZATION_ERROR:
      return 'You do not have permission to perform this action.';
    case ErrorType.NOT_FOUND_ERROR:
      return 'The requested resource was not found.';
    case ErrorType.SERVER_ERROR:
      return 'A server error occurred. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
