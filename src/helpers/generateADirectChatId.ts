// Write a helpyer functions to generate a random 11 random characters 9

export const generateDirectChatId = async() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `DC${result}`;

}