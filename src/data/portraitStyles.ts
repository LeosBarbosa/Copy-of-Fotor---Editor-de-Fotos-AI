
export const portraitStyles = [
    { id: 'custom', name: 'Personalizado', category: 'Criativo', imageUrl: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?w=200&h=200&fit=crop&q=80', isFree: true },
    { id: 'crosshatch', name: 'Nanquim Cross-hatch', category: 'Criativo', imageUrl: 'https://storage.googleapis.com/aistudio-project-files/89c17245-0925-4632-a550-985c7d2429a3/c101e4a3-7640-41ff-801e-0a563a651fbb', isNew: true },
    { id: 'stitch', name: 'Stitch & Você', category: 'Criativo', imageUrl: 'https://images.unsplash.com/photo-1535581652167-4d66e2b613eb?w=200&h=200&fit=crop&q=80', isNew: true },
    { id: 'ironmanbattle', name: 'Homem de Ferro', category: 'Criativo', imageUrl: 'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=200&h=200&fit=crop&q=80' },
    { id: 'walkingdead', name: 'Sobrevivente TWD', category: 'Criativo', imageUrl: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=200&h=200&fit=crop&q=80' },
    { id: 'prof1', name: 'Executivo', category: 'Estúdio', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&q=80' },
    { id: 'cyberpunk', name: 'Cyberpunk', category: 'Criativo', imageUrl: 'https://images.unsplash.com/photo-1614726365723-498aa67c5f7b?w=200&h=200&fit=crop&q=80' },
];

export const portraitPrompts: { [key: string]: string } = {
    'crosshatch': `Use the uploaded photo as the mandatory identity reference. Keep 100% of the original characteristics and gender of the person: same face, bone structure, proportions, apparent age, gender, ethnicity, skin tone structure (converted to black and white), eye shape, nose, lips, eyebrows, hair (volume and hairline) and overall head shape. 

Positive prompt: high-contrast cross-hatching ink portrait. Black-and-white pen and ink portrait on white paper. The entire image is drawn with tight, dense cross-hatching lines, creating all shading, texture and form purely from intersecting black lines. No gray fills. Lighter areas use fewer, thinner lines; darker shadows build up multiple layers of cross-hatching. The face, hair and clothing are fully modeled following the contours of the forms. Crisp edges, high detail, handcrafted look. Traditional technical pen style.

Negative prompt: No grayscale airbrush, no soft digital shading, no pencils, no watercolor, no color ink, no thick cartoon outlines, no anime style, no blur, no noise filters, no cluttered backgrounds.`,
    
    'stitch': 'PERFORM A FACE SWAP. Replace the human subject in the Stitch scene with the face from the reference image. Maintain lighting and Stitch exactly as is.',
    'ironmanbattle': 'Iron Man MK 49 armor, battle damaged, highly realistic cinematic photography, 8k.',
    'prof1': 'Corporate professional headshot, dark suit, modern office background, high-end studio lighting.'
};

export const twdCharacters = ["Rick Grimes", "Michonne", "Daryl Dixon", "Negan"];
export const twdScenarios = ["Cidade destruída", "Floresta escura", "Prisão abandonada"];
export const stitchTemplates = [
    'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=500&h=700&fit=crop',
    'https://images.unsplash.com/photo-1535581652167-4d66e2b613eb?w=500&h=700&fit=crop'
];
