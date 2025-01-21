  
export function capitalizeFirstChar(str : string) {
    if (!str) return str; 
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function abbreviateIfThreeWords(text : string) {
    const words = text.trim().split(/\s+/);
    if (words.length >= 3)  return words.map(word => word[0].toUpperCase()).join('');
    return text; 
}
