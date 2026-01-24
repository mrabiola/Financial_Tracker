import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Home, WifiOff, Bug } from 'lucide-react';

// Shared variant styles for ErrorBoundary and ErrorMessage
const VARIANT_STYLES = {
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900/50',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-900 dark:text-red-100',
    subtextColor: 'text-red-700 dark:text-red-300'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-900 dark:text-amber-100',
    subtextColor: 'text-amber-700 dark:text-amber-300'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900/50',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-900 dark:text-blue-100',
    subtextColor: 'text-blue-700 dark:text-blue-300'
  }
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOffline: !navigator.onLine,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    this.setState({ error, errorInfo, errorId });

    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatusChange);
    window.removeEventListener('offline', this.handleOnlineStatusChange);
  }

  handleOnlineStatusChange = () => {
    this.setState({ isOffline: !navigator.onLine });
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }

    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorMessage = () => {
    const { error, isOffline } = this.state;

    if (isOffline) {
      return {
        title: 'You\'re offline',
        message: 'Please check your internet connection and try again.',
        icon: WifiOff,
        variant: 'warning'
      };
    }

    if (error?.message) {
      const msg = error.message.toLowerCase();

      if (msg.includes('network') || msg.includes('fetch')) {
        return {
          title: 'Network error',
          message: 'Unable to connect to our servers. Please check your connection and try again.',
          icon: WifiOff,
          variant: 'warning'
        };
      }

      if (msg.includes('authentication') || msg.includes('unauthorized')) {
        return {
          title: 'Authentication error',
          message: 'Please sign in again to continue.',
          icon: AlertCircle,
          variant: 'warning'
        };
      }

      if (msg.includes('permission') || msg.includes('forbidden')) {
        return {
          title: 'Permission denied',
          message: 'You don\'t have access to this resource.',
          icon: AlertCircle,
          variant: 'danger'
        };
      }
    }

    return {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
      icon: AlertCircle,
      variant: 'danger'
    };
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback({ error, errorInfo, retry: this.handleRetry });
    }

    const { title, message, icon: Icon, variant } = this.getErrorMessage();
    const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`${styles.bg} ${styles.border} border rounded-2xl shadow-lg max-w-md w-full p-8`}
          >
            <div className={`${styles.iconBg} ${styles.iconColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-8 h-8" />
            </div>

            <h1 className={`${styles.textColor} text-2xl font-bold text-center mb-2`}>
              {title}
            </h1>

            <p className={`${styles.subtextColor} text-center mb-6`}>
              {message}
            </p>

            {errorId && (
              <div className="text-center mb-6">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  Error ID: {errorId}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors border border-gray-300 dark:border-gray-600"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {(showDetails || process.env.NODE_ENV === 'development') && error && (
              <details className="mt-6">
                <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  <Bug className="w-4 h-4" />
                  Technical Details
                </summary>
                <div className="mt-3 p-3 bg-gray-900/5 dark:bg-gray-900/50 rounded-lg text-xs font-mono overflow-auto max-h-40">
                  <div className="text-red-600 dark:text-red-400 mb-2">
                    {error.toString()}
                  </div>
                  {errorInfo && (
                    <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
}

export default ErrorBoundary;

export const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'Please try again later.',
  variant = 'danger',
  onRetry,
  showIcon = true
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;

  const buttonBgByVariant = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };
  const buttonBg = buttonBgByVariant[variant] || buttonBgByVariant.danger;
  const Icon = AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.bg} ${styles.border} border rounded-lg p-4`}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`${styles.iconColor} flex-shrink-0 mt-0.5`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className={`${styles.textColor} font-medium mb-1`}>{title}</h3>
          <p className={`${styles.subtextColor} text-sm mb-0`}>{message}</p>
        </div>
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className={`${buttonBg} text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 flex-shrink-0`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export const RetryButton = ({ onRetry, isRetrying = false, children = 'Retry' }) => (
  <motion.button
    whileHover={{ scale: isRetrying ? 1 : 1.05 }}
    whileTap={{ scale: isRetrying ? 1 : 0.95 }}
    onClick={onRetry}
    disabled={isRetrying}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
    {isRetrying ? 'Retrying...' : children}
  </motion.button>
);
