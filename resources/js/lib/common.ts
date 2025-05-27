  
export function capitalizeFirstChar(str : string) {
    if (!str) return str; 
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function abbreviateIfThreeWords(text : string) {
    const words = text.trim().split(/\s+/);
    if (words.length >= 3)  return words.map(word => word[0].toUpperCase()).join('');
    return text; 
}

export const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

export function extractGoogleFormCode(url: string): string | null {
  const match = url.match(/\/forms\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}