import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to read/write data
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return { users: {} };
        }
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        if (!content.trim()) return { users: {} };
        return JSON.parse(content);
    } catch (e) {
        console.error("Error reading data file", e);
        return { users: {} };
    }
};

const writeData = (data: any) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // API Routes
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok' });
    });

    app.post('/api/register', (req, res) => {
        const { name, email, referralCodeInput, password } = req.body;
        const data = readData();
        const emailLower = email.toLowerCase();

        if (data.users[emailLower]) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const generateReferralCode = (email: string) => {
            const prefix = "EX";
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const emailPart = email.substring(0, 2).toUpperCase();
            return `${prefix}-${emailPart}${randomPart}-${Math.floor(1000 + Math.random() * 9000)}`;
        };

        const initialTransaction = {
            id: `trx-${Date.now()}`,
            type: 'credit',
            amount: 10000.00,
            description: 'Welcome Bonus',
            date: new Date().toISOString(),
            status: 'success'
        };

        let referredBy: string | undefined = undefined;
        if (referralCodeInput) {
            const referrerEmail = Object.keys(data.users).find(
                key => data.users[key].referralCode === referralCodeInput.trim().toUpperCase()
            );

            if (referrerEmail) {
                const referrer = data.users[referrerEmail];
                referrer.freeWithdrawals = (referrer.freeWithdrawals || 0) + 1;
                
                const referralBonusTrx = {
                    id: `trx-ref-${Date.now()}`,
                    type: 'credit',
                    amount: 0,
                    description: `Referral Bonus: ${name} joined`,
                    date: new Date().toISOString(),
                    status: 'success'
                };
                referrer.transactions = [referralBonusTrx, ...(referrer.transactions || [])];
                data.users[referrerEmail] = referrer;
                referredBy = referrerEmail;
            }
        }

        const newUser = {
            name,
            email,
            password, // In a real app, hash this!
            balance: 10000.00,
            isSubscribed: false,
            transactions: [initialTransaction],
            rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
            notificationPreferences: { withdrawals: true, transfers: true, airtime: true, rewards: true },
            referralCode: generateReferralCode(email),
            freeWithdrawals: 0,
            referredBy
        };

        data.users[emailLower] = newUser;
        writeData(data);

        res.json(newUser);
    });

    app.post('/api/login', (req, res) => {
        const { email, password, referralCodeInput } = req.body;
        const data = readData();
        const emailLower = email.toLowerCase();
        const user = data.users[emailLower];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Simple password check (PIN)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        // Handle referral linking on login if not already referred
        if (referralCodeInput && !user.referredBy) {
            const referrerEmail = Object.keys(data.users).find(
                key => data.users[key].referralCode === referralCodeInput.trim().toUpperCase()
            );

            if (referrerEmail && referrerEmail !== emailLower) {
                const referrer = data.users[referrerEmail];
                referrer.freeWithdrawals = (referrer.freeWithdrawals || 0) + 1;
                
                const referralBonusTrx = {
                    id: `trx-ref-login-${Date.now()}`,
                    type: 'credit',
                    amount: 0,
                    description: `Referral Bonus: ${user.name} linked account`,
                    date: new Date().toISOString(),
                    status: 'success'
                };
                referrer.transactions = [referralBonusTrx, ...(referrer.transactions || [])];
                
                data.users[referrerEmail] = referrer;
                user.referredBy = referrerEmail;
                writeData(data);
            }
        }

        res.json(user);
    });

    // Get all users (Admin only)
    app.get('/api/admin/users', (req, res) => {
        const password = req.headers['x-admin-password'];
        if (password !== 'MAVELL999') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = readData();
        res.json(Object.values(data.users));
    });

    app.post('/api/update-user', (req, res) => {
        const { email, updates } = req.body;
        const data = readData();
        const emailLower = email.toLowerCase();
        
        if (!data.users[emailLower]) {
            return res.status(404).json({ error: 'User not found' });
        }

        data.users[emailLower] = { ...data.users[emailLower], ...updates };
        writeData(data);
        res.json(data.users[emailLower]);
    });

    app.get('/api/user/:email', (req, res) => {
        const email = req.params.email.toLowerCase();
        const data = readData();
        const user = data.users[email];
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
