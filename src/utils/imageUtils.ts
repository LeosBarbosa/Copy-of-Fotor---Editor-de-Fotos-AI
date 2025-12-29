
export const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    });
};

export const imageUrlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};

export const fileToBlobUrl = (file: File): string => {
    return URL.createObjectURL(file);
};
