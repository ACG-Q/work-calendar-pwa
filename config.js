tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#6366f1',
                'primary-dark': '#4f46e5',
                secondary: '#8b5cf6',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'pulse-glow': 'pulse 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'dot-pulse': 'dotPulse 2s ease-in-out infinite',
                'drift': 'drift 20s ease-in-out infinite',
            },
            backdropBlur: {
                'glass': '20px',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.15)',
            }
        }
    }
}