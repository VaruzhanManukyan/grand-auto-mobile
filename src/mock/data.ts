export const MOCK_USERS = [
    {
        id: 'u1',
        email: 'test@grandauto.am',
        password: '123456',
        firstName: 'Арман',
        lastName: 'Петросян',
        phone: '+37498123456',
        avatar: null,
        createdAt: '2024-01-15',
    },
];

export const MOCK_LOYALTY: Record<string, {
    points: number;
    totalSpent: number;
    tier: 'bronze' | 'silver' | 'gold';
    history: { id: string; date: string; desc: string; points: number; amount: number }[];
}> = {
    u1: {
        points: 1250,
        totalSpent: 85000,
        tier: 'silver',
        history: [
            { id: 'h1', date: '2024-06-01', desc: 'Замена масла',       points: 150,  amount: 8000  },
            { id: 'h2', date: '2024-06-10', desc: 'Шиномонтаж',         points: 200,  amount: 12000 },
            { id: 'h3', date: '2024-06-18', desc: 'Списание бонусов',   points: -300, amount: 0     },
        ],
    },
};

export const MOCK_SERVICES = [
    { id: 's1', name: 'Замена масла',            price: 8000,  duration: 30,  category: 'maintenance' },
    { id: 's2', name: 'Шиномонтаж',              price: 12000, duration: 45,  category: 'tires'       },
    { id: 's3', name: 'Диагностика',             price: 5000,  duration: 60,  category: 'diagnostic'  },
    { id: 's4', name: 'Замена тормозных колодок', price: 15000, duration: 90,  category: 'brakes'      },
    { id: 's5', name: 'Мойка автомобиля',        price: 3500,  duration: 20,  category: 'wash'        },
    { id: 's6', name: 'Полировка кузова',        price: 25000, duration: 180, category: 'body'        },
];

export const TIERS = {
    bronze: { min: 0,      max: 50000,   cashback: 0.03, label: 'Бронза'   },
    silver: { min: 50000,  max: 150000,  cashback: 0.05, label: 'Серебро'  },
    gold:   { min: 150000, max: Infinity, cashback: 0.08, label: 'Золото'  },
} as const;