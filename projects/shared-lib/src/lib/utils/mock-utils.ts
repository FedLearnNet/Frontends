export function generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomId(): string {
    const timestamp = new Date().getTime().toString(16);
    const randomString = Math.random().toString(16).substring(2);

    return timestamp + randomString;
}

export function generateRandomUUID(): string {
    return self.crypto.randomUUID();
}
