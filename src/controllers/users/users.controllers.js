import { getUserByUsername, createUser } from '../../services/user/user.service.js';

export const createUserController = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Function createUser di user.service.js secara otomatis melakukan:
        // bcrypt.hash(data.password, SALT_ROUNDS) sebelum disimpan ke Supabase
        const newUser = await createUser({ username, password });

        return res.status(201).json({
            status: 'success',
            message: 'User berhasil dibuat dengan password ter-hash',
            data: newUser,
        });
    } catch (error) {
        console.error("Error saat membuat user:", error);
        return res.status(500).json({
            status: 'error',
            message: error.code === 'P2002' ? 'Username sudah digunakan' : 'Terjadi kesalahan pada server saat membuat user'
        });
    }
};

export const getUserByUsernameController = async (req, res) => {
    try {
        // 1. Tangkap 'username' dari URL parameter (misal URL-nya: /api/users/budi)
        const username = req.params.username;

        // 2. Lempar username tersebut ke Service kita
        const user = await getUserByUsername(username);

        // 3. Cek apakah usernya ada? Kalau null/kosong, tolak dengan status 404 (Not Found)
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User tidak ditemukan'
            });
        }

        // 4. Jika ketemu, balas Frontend dengan status 200 (OK) dan lampirkan datanya
        return res.status(200).json({
            status: 'success',
            data: user
        });

    } catch (error) {
        // 5. Wajib pakai try-catch! Jaga-jaga kalau database sedang mati atau ada error syntax
        console.error("Error saat mencari user:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Terjadi kesalahan pada server (Internal Server Error)'
        });
    }
};