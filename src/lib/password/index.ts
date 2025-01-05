import bcrypt from 'bcrypt';

export const hashedPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}	

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}	