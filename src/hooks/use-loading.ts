import {useState, useCallback} from 'react';

interface UseLoadingReturn {
    isLoading: boolean;
    message: string;
    startLoading: (message?: string) => void;
    stopLoading: () => void;
    withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
}

export function useLoading(): UseLoadingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const startLoading = useCallback((msg: string = '') => {
        setMessage(msg);
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
        setMessage('');
    }, []);

    const withLoading = useCallback(
        async <T>(fn: () => Promise<T>, msg: string = ''): Promise<T> => {
            startLoading(msg);
            try {
                const result = await fn();
                return result;
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading]
    );

    return {isLoading, message, startLoading, stopLoading, withLoading};
}